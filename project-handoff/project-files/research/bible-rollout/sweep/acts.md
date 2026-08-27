# Acts sweep ledger — Layer-3 tag sweep (Gospels+Acts thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + 161 §11.1 adopted display ids
- Book: Acts (28 chapters)
- WEB text source: full-Bible fixture web-subset.json @ commit 87fd68c (sourceSha256 b6f55cc7…),
  printed per chapter via scratchpad webchap.py; every quote below is word-for-word from that
  output. Known variance: Acts 20:35 carries a typography-only NBSP difference vs the current
  upstream edition — quotes here follow the pinned fixture as printed.
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/acts.md
    (tags as of its 2026-08-25 adopted-vocabulary update; WEB "assembly" voice kept)
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/declines-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/corpus-blocked.md
  - WEB access note: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/web-text-access.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Acts-specific standing rules applied throughout: gentile-inclusion evidence in Acts 10–11/15
  is ROUTED to corpus-blocked row 40 (the id itself is adopted display vocabulary per ruling
  1(b) and stays applied as a tag where genuinely present); the perseverance-in-mission,
  breaking-bread, and early-church-community items are OPEN lexicon leads (declines digest
  §3.5) — evidence is noted under those leads, no new-concept minting.
- Legend — each chapter entry carries these sections, in order:
  1. "## Acts <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## Acts 1 (subdivided: 1:1–5 / 1:6–11 / 1:12–26)

**Existing tags (book doc):** `sharing-your-faith`; `second-coming`; `resurrection`; `prayer`; `ascension`; `holy-spirit`

**Applied-tag deltas:** No changes — all six existing tags independently clear the presence bar with in-chapter substance, and no untagged concept in the 239-id library or the adopted list shows honest substantial presence beyond them. KEEP `sharing-your-faith` — “You will be witnesses to me in Jerusalem, in all Judea and Samaria, and to the uttermost parts of the earth.” (1:8); KEEP `second-coming` — “This Jesus, who was received up from you into the sky, will come back in the same way as you saw him going into the sky.” (1:11); KEEP `resurrection` — “he also showed himself alive after he suffered, by many proofs” (1:3) and the replacement apostle must “become a witness with us of his resurrection.” (1:22); KEEP `prayer` — “All these with one accord continued steadfastly in prayer and supplication” (1:14) and “They prayed and said, ‘You, Lord, who know the hearts of all men, show which one of these two you have chosen’” (1:24); KEEP `ascension` — “he was taken up, and a cloud received him out of their sight.” (1:9); KEEP `holy-spirit` — “you will be baptized in the Holy Spirit not many days from now.” (1:5), “you will receive power when the Holy Spirit has come upon you.” (1:8).

**Anchor-extension candidates:**
- `prayer` | Acts 1:14 | “All these with one accord continued steadfastly in prayer and supplication” | low-mid weight (the pack has no Acts anchor; the pre-Pentecost prayer meeting is a frequently-sought scene).

**Lexicon candidates:**
- `second-coming` | the 1:11 phrasing | queries: "jesus will come back the same way he left"; "why do you stand looking into the sky"; "will jesus return the way he ascended".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** soft cap 6 hit (exactly 6 tags, each clearing the bar); book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `witness-testimony` considered for 1:8, 22 (“one must become a witness with us of his resurrection.”) and NOT added: the concept's register is testimony borne TO Jesus (John-the-Baptist witness texts); here the witness commission is already the exact anchor text of `sharing-your-faith` (Ac 1:8 is in that pack) — adding both would be broad-duplicating-specific under §11.6.
- `kingdom-of-heaven` considered for 1:3, 6 (“speaking about God’s Kingdom”; “are you now restoring the kingdom to Israel?”) and NOT added: the Kingdom is named as topic, not taught — fails the honest-substantial-presence bar.
- `guidance` considered for the lot falling on Matthias after prayer (1:24–26) and NOT added: thin single-verse mechanism scene; the chapter teaches prayer before decisions (kept under `prayer`), not the guidance register.
## Acts 2 (subdivided: 2:1–13 / 2:14–36 / 2:37–41 / 2:42–47)

**Existing tags (book doc):** `repentance`; `baptism`; `resurrection`; `salvation`; `gathering-together`; `generosity`; `holy-spirit`; `signs-and-wonders`

**Applied-tag deltas:** No changes — the chapter stands at the hard ceiling of 8 with every tag independently clearing the bar: KEEP `repentance` — “Repent and be baptized, every one of you” (2:38) to hearers “cut to the heart” (2:37); KEEP `baptism` — “be baptized, every one of you, in the name of Jesus Christ for the forgiveness of sins” (2:38), three thousand baptized (2:41); KEEP `resurrection` — “This Jesus God raised up, to which we all are witnesses.” (2:32), “you will not leave my soul in Hades” (2:27); KEEP `salvation` — “whoever will call on the name of the Lord will be saved.” (2:21), “those who were being saved.” (2:47); KEEP `gathering-together` — “They continued steadfastly in the apostles’ teaching and fellowship, in the breaking of bread, and prayer.” (2:42; the pack's own Ac 2:42 anchor); KEEP `generosity` — “They sold their possessions and goods, and distributed them to all, according as anyone had need.” (2:45); KEEP `holy-spirit` — “They were all filled with the Holy Spirit” (2:4), “I will pour out my Spirit on all flesh.” (2:17); KEEP `signs-and-wonders` — “a man approved by God to you by mighty works and wonders and signs” (2:22), “many wonders and signs were done through the apostles.” (2:43). No ADD survives the ceiling — see the Decisions record.

**Anchor-extension candidates:**
- `generosity` | Acts 2:44-45 | “They sold their possessions and goods, and distributed them to all, according as anyone had need.” | mid weight (pack's Acts anchor is 20:35 only; this is the classic sharing-community text).
- `day-of-the-lord` | Acts 2:20 | “The sun will be turned into darkness, and the moon into blood, before the great and glorious day of the Lord comes.” | low weight, with caveat: a Joel quotation inside Peter's sermon — the pack currently has no NT anchor at all, and this is the NT's most-quoted day-of-the-Lord line.

**Lexicon candidates:**
- `providence` | the 2:23 phrasing | queries: "was jesus death part of gods plan"; "determined counsel and foreknowledge of god"; "did god plan the crucifixion".
- `gathering-together` | early-church-community phrasings (evidence for the OPEN §3.5 lexicon lead) | queries: "what did the early church do"; "the fellowship of the believers"; "devoted to the apostles teaching" — Acts 2:42-47 is that lead's primary text.

**New-concept candidates:** None — the growth-refrain and one-accord motifs are already logged as motif candidates in acts.md's back matter, and no vocabulary gap remains after the adopted list.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT; book-doc subdivision (4 sections) — mark for the per-verse refinement pass (per-verse anchoring can carry what the ceiling excludes: 2:1-13 tongues, 2:14-36 sermon, 2:42-47 common life).

**Decisions record:**
- `spiritual-gifts` considered for 2:1-4 (tongues at Pentecost — the pack's own engine anchor is Ac 2:1-4) and NOT added as a display tag: chapter at hard ceiling, and the chapter depicts the Spirit's outpouring event rather than teaching the distribution-of-gifts doctrine; the outpouring register is `holy-spirit`'s, and the engine anchor already serves "speaking in tongues" searches. Yield class: broad-duplicating-specific (duplicates `holy-spirit`'s 2:1-4 span).
- `trinity` considered for 2:32-33 (raised by God, exalted, “having received from the Father the promise of the Holy Spirit”) and NOT added: thin-single-verse presence at ceiling; the pack's Ac 2:32-33 engine anchor already exists.
- `dreams-and-visions` considered for 2:17 (“Your young men will see visions. Your old men will dream dreams.”) and NOT added: a quoted promise, one verse, no vision depicted in-chapter; pack's Ac 2:17 engine anchor already exists. Yield class: thin-single-verse.
- `ascension` considered for 2:33-34 (“exalted by the right hand of God”) and NOT added: thin at ceiling; pack's Ac 2:33 anchor exists.
- Breaking-bread OPEN lexicon lead (declines §3.5): 2:42 “in the breaking of bread” and 2:46 “breaking bread at home” noted as that lead's evidence — the in-chapter usage reads as shared meals/fellowship, supporting the lead's lexicon-not-new-concept disposition; `lords-supper`'s Ac 2:42 anchor already exists engine-side. No tagging change.
- Early-church-community OPEN lexicon lead: 2:42-47 evidence routed to the `gathering-together` lexicon check (see Lexicon candidates); no new id proposed.
## Acts 3

**Existing tags (book doc):** `faith`; `repentance`; `resurrection`; `praise`; `restoration`; `signs-and-wonders`

**Applied-tag deltas:**
- ADD `messianic-prophecy` — the sermon's argument is prophecy fulfilled: “the things which God announced by the mouth of all his prophets, that Christ should suffer, he thus fulfilled.” (3:18); Moses' prophet-like-me promise applied to Jesus (3:22-23); “all the prophets from Samuel and those who followed after, as many as have spoken, also told of these days.” (3:24). Multi-verse teaching substance, not a passing touch.
- KEEP `faith` — “By faith in his name, his name has made this man strong” (3:16); KEEP `repentance` — “Repent therefore, and turn again, that your sins may be blotted out” (3:19), “in turning away every one of you from your wickedness.” (3:26); KEEP `resurrection` — “killed the Prince of life, whom God raised from the dead, to which we are witnesses.” (3:15); KEEP `praise` — “walking, leaping, and praising God.” (3:8); KEEP `restoration` — “times of refreshing from the presence of the Lord” and “the times of restoration of all things” (3:19-21); KEEP `signs-and-wonders` — “In the name of Jesus Christ of Nazareth, get up and walk!” (3:6), the man lame from his mother's womb made strong (3:2, 7, 16).

**Anchor-extension candidates:**
- `messianic-prophecy` | Acts 3:18 | “the things which God announced by the mouth of all his prophets, that Christ should suffer, he thus fulfilled.” | mid weight (the pack has no Gospels/Acts anchor; this is the NT's compact all-the-prophets-foretold-Christ claim).
- `covenant` | Acts 3:25 | “You are the children of the prophets, and of the covenant which God made with our fathers, saying to Abraham, ‘All the families of the earth will be blessed through your offspring.’” | low weight (pack's only Gospels/Acts anchor is Lk 22:20; this is the Abrahamic covenant cited in apostolic preaching).
- `second-coming` | Acts 3:20-21 | “that he may send Christ Jesus, who was ordained for you before, whom heaven must receive until the times of restoration of all things” | low weight (heaven-must-receive-until is a real return text the pack lacks).

**Lexicon candidates:**
- `restoration` | the 3:21 phrase | queries: "restoration of all things bible"; "times of refreshing meaning"; "will god restore everything".
- `signs-and-wonders` | KJV-remembered phrasing of 3:6 | queries: "silver and gold have i none"; "such as i have give i thee" — the WEB reads “I have no silver or gold, but what I have, that I give you.” (3:6), so the remembered KJV wording needs a lexicon/alias route (Layer-2 famous-phrase class).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags after the add — soft cap 6 exceeded deliberately, under the hard ceiling of 8, each tag clearing the bar independently. Not subdivided in the book doc; no per-verse refinement flag.

**Decisions record:**
- `new-creation` considered for 3:19 (“times of refreshing” — the pack's own Ac 3:19 engine anchor) and NOT added as a display tag: it would duplicate `restoration`'s exact 3:19-21 span in the same renewal register — broad-duplicating-specific under §11.6; the engine anchor already exists.
- `second-coming` considered as a display tag for 3:20-21 and NOT added: the sending-again is stated obliquely inside the repentance appeal, and the span is already carried by `restoration`; kept engine-side as a low-weight anchor-extension candidate instead. Yield class: thin (two clauses) duplicating a tagged span.
- `covenant` considered as a display tag for 3:25 and NOT added: thin-single-verse; routed as an anchor-extension candidate instead.
## Acts 4 (subdivided: 4:1–22 / 4:23–31 / 4:32–37)

**Existing tags (book doc):** `salvation`; `pleasing-god-not-people`; `prayer`; `christ-the-cornerstone`; `generosity`; `boldness-in-witness`; `governing-authorities`; `jesus-the-only-way`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `salvation` — “There is salvation in no one else, for there is no other name under heaven that is given among men, by which we must be saved!” (4:12); KEEP `pleasing-god-not-people` — “Whether it is right in the sight of God to listen to you rather than to God, judge for yourselves” (4:19); KEEP `prayer` — the company “lifted up their voice to God with one accord” (4:24) and “When they had prayed, the place was shaken” (4:31); KEEP `christ-the-cornerstone` — “He is ‘the stone which was regarded as worthless by you, the builders, which has become the head of the corner.’” (4:11; the pack's own Ac 4:11 anchor); KEEP `generosity` — owners “sold them, and brought the proceeds… and distribution was made to each, according as anyone had need.” (4:34-35); KEEP `boldness-in-witness` — “when they saw the boldness of Peter and John” (4:13), “grant to your servants to speak your word with all boldness” (4:29; the pack's own anchors); KEEP `governing-authorities` — the obey-God-limit stated to the rulers (4:19-20); KEEP `jesus-the-only-way` — the no-other-name claim (4:12; the pack's own Ac 4:12 anchor).

**Anchor-extension candidates:**
- `providence` | Acts 4:27-28 | “both Herod and Pontius Pilate, with the Gentiles and the people of Israel, were gathered together against your holy servant Jesus, whom you anointed, to do whatever your hand and your counsel foreordained to happen.” | mid weight (evil rulers accomplishing what God's counsel foreordained — a core providence text the pack lacks).
- `generosity` | Acts 4:34-35 | “as many as were owners of lands or houses sold them, and brought the proceeds of the things that were sold, and laid them at the apostles’ feet; and distribution was made to each, according as anyone had need.” | mid weight (companion to the 2:44-45 candidate; curation picks one or both).

**Lexicon candidates:**
- `providence` | the 4:28 phrasing | queries: "your hand and your counsel foreordained"; "did god ordain the crucifixion"; "why do the nations rage meaning" (4:25 quoting Psalm 2).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT; book-doc subdivision (3 sections) — mark for the per-verse refinement pass (4:23-31 boldness prayer and 4:32-37 sharing are natural per-verse anchor spans).

**Decisions record:**
- `resurrection` considered for 4:2, 10, 33 (“proclaimed in Jesus the resurrection from the dead”; “With great power, the apostles gave their testimony of the resurrection of the Lord Jesus.”) and NOT added: chapter at hard ceiling; here the resurrection is the reported content of the testimony rather than argued/taught as in chs. 2–3 — yields as theme-witness-with-caveat under §11.6, and the pack is already anchor-rich in Acts (2:24, 2:31-32, 1:3).
- `holy-spirit` considered for 4:8, 31 (“filled with the Holy Spirit”) and NOT added: event notations, not the chapter's teaching; at ceiling; the pack's own Ac 4:31 anchor already exists. Yield class: thin.
- `providence` considered as a display tag for 4:27-28 and NOT added at ceiling: the foreordination is confessed inside the prayer, one clause — routed engine-side as the anchor-extension above rather than displacing an incumbent. Yield class: thin-single-verse.
- `creation` considered for 4:24 (“who made the sky, the earth, the sea, and all that is in them”) and NOT added: a single invocation line in the prayer; thin-single-verse.
## Acts 5 (subdivided: 5:1–11 / 5:12–16 / 5:17–23 / 5:24–32 / 5:33–42)

**Existing tags (book doc):** `honesty`; `divine-judgment`; `pleasing-god-not-people`; `suffering-for-christ`; `pastoral-prayer-for-healing`; `governing-authorities`; `signs-and-wonders`

**Applied-tag deltas:** No changes — 7 tags, all clearing the bar: KEEP `honesty` — “why has Satan filled your heart to lie to the Holy Spirit… You haven’t lied to men, but to God.” (5:3-4), Sapphira's “Yes, for so much.” (5:8); KEEP `divine-judgment` — Ananias “fell down and died” (5:5), Sapphira “fell down immediately at his feet and died” (5:10), “Great fear came on the whole assembly” (5:11); KEEP `pleasing-god-not-people` — “We must obey God rather than men.” (5:29); KEEP `suffering-for-christ` — beaten and forbidden the name, “rejoicing that they were counted worthy to suffer dishonor for Jesus’ name.” (5:40-41); KEEP `pastoral-prayer-for-healing` — the sick on cots in the streets, “and they were all healed.” (5:15-16) (id note: the engine index spells this pack `prayer-for-healing` — see Decisions); KEEP `governing-authorities` — the limit-case answer to the council's ban (5:28-29); KEEP `signs-and-wonders` — “By the hands of the apostles many signs and wonders were done among the people.” (5:12).

**Anchor-extension candidates:**
- `honesty` | Acts 5:3-4 | “why has Satan filled your heart to lie to the Holy Spirit… You haven’t lied to men, but to God.” | mid weight (the pack has no Gospels/Acts anchor; Ananias and Sapphira is the NT's canonical lying narrative).
- `divine-judgment` | Acts 5:1-11 | “Ananias, hearing these words, fell down and died. Great fear came on all who heard these things.” (5:5) | low-mid weight (in-assembly judgment scene the pack lacks).
- `angels` | Acts 5:19-20 | “But an angel of the Lord opened the prison doors by night, and brought them out” | low weight (prison-opening angel; complements the pack's Lk/Mt anchors).

**Lexicon candidates:**
- `honesty` | Ananias-and-Sapphira phrasings | queries: "ananias and sapphira meaning"; "lying to the holy spirit"; "is lying to god worse than lying to people".
- `providence` | Gamaliel phrasings (book-doc motif 8) | queries: "gamaliel's advice"; "if it is of god you cannot overthrow it"; "fighting against god bible" — caveat: the counsel is a Pharisee's prudence, not a divine promise; curation should weigh register before adding.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags — soft cap exceeded, under hard ceiling; book-doc subdivision (5 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- Id-spelling discrepancy noted once for the book: acts.md writes `pastoral-prayer-for-healing` (and CONVENTIONS §5's example uses a `pastoral-` prefix), but the engine concept index at e762d1c lists the pack id as `prayer-for-healing`. KEEPs preserve the book doc's spelling as prior art; all engine-side candidates in this ledger use the index id. Flagged for curation; no doc edit made (out of scope).
- `resurrection` considered for 5:30-31 (“The God of our fathers raised up Jesus, whom you killed, hanging him on a tree. God exalted him…”) and NOT added: witness-report register inside the council answer, two verses; yields as theme-witness-with-caveat.
- `angels` considered as a display tag for 5:19-25 and NOT added: one angelic act (two verses) driving the scene, against ch. 12 where the book doc tags three angelic acts; yields as thin-single-scene; routed engine-side as anchor-extension instead.
- `repentance` / `forgiveness-of-sins` considered for 5:31 (“to give repentance to Israel, and remission of sins”) and NOT added: thin-single-verse each.
- `pleasing-god-not-people` anchor-extension for 5:29 deliberately NOT proposed: “obey God rather than men” is already `governing-authorities`' engine anchor and lexicon phrase (Ac 5:29); appending the same ref to a second pack would double-route one phrase (the declines digest's never-same-refs-to-both caution, applied by analogy).
- `deliverance-from-demons` considered for 5:16 (“those who were tormented by unclean spirits; and they were all healed”) and NOT added: one clause, no deliverance scene depicted; thin-single-verse.
## Acts 6 (subdivided: 6:1–7 / 6:8–15)

**Existing tags (book doc):** `wisdom-from-god`; `harmony-with-others`; `prayer`; `leadership`; `servanthood`

**Applied-tag deltas:**
- ADD `slander-and-false-accusation` — Stephen's arrest is built entirely on procured lies: “they secretly induced men to say, ‘We have heard him speak blasphemous words against Moses and God.’” (6:11) and “set up false witnesses who said, ‘This man never stops speaking blasphemous words against this holy place and the law.’” (6:13). Multi-verse narrative substance (6:11-14), the chapter's second half.
- ADD `care-for-widows` — the choosing of the seven exists for the widows: “a complaint arose from the Hellenists against the Hebrews, because their widows were neglected in the daily service.” (6:1), remedied so that no widow is neglected (6:1-6). The scene is the NT's founding text for organized widow care.
- KEEP `wisdom-from-god` — “full of the Holy Spirit and of wisdom” (6:3), “They weren’t able to withstand the wisdom and the Spirit by which he spoke.” (6:10); KEEP `harmony-with-others` — the complaint heard and answered: “These words pleased the whole multitude.” (6:5); KEEP `prayer` — “we will continue steadfastly in prayer and in the ministry of the word.” (6:4), commissioning with prayer (6:6); KEEP `leadership` — “It is not appropriate for us to forsake the word of God and serve tables.” (6:2), seven appointed “over this business” (6:3); KEEP `servanthood` — seven chosen for “the daily service” so tables are served and widows fed (6:1-2).

**Anchor-extension candidates:**
- `slander-and-false-accusation` | Acts 6:11-13 | “set up false witnesses who said, ‘This man never stops speaking blasphemous words against this holy place and the law.’” | mid weight (pack's only anchor is Mt 5:11; this is a full false-witness narrative).
- `care-for-widows` | Acts 6:1-6 | “their widows were neglected in the daily service.” (6:1) | mid weight (pack has no Gospels/Acts anchor).
- `wisdom-from-god` | Acts 6:10 | “They weren’t able to withstand the wisdom and the Spirit by which he spoke.” | low-mid weight (pack has no Gospels/Acts anchor; Spirit-given wisdom depicted).

**Lexicon candidates:**
- `care-for-widows` | Acts-6 phrasings | queries: "widows neglected in the early church"; "how did the church care for widows".
- `leadership` | choosing-of-the-seven phrasings | queries: "deacons in the bible"; "the first deacons"; "choosing of the seven".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags after adds — soft cap exceeded, under hard ceiling, each clearing the bar; book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `signs-and-wonders` considered for 6:8 (“performed great wonders and signs among the people”) and NOT added: single summary verse; thin-single-verse.
- Early-church-community OPEN lexicon lead: 6:1-7 (growth, daily service, the seven) noted as that lead's evidence for the `gathering-together` lexicon check; no new id proposed.
- `care-for-widows` add weighed against `servanthood`/`leadership` overlap on 6:1-6: kept all three because each carries a distinct register (widow care / serving / delegation) per the both-tags ruling, each with its own quote.
## Acts 7 (subdivided: 7:1–53 / 7:54–60)

**Existing tags (book doc):** `suffering-for-christ`; `forgiving-others`; `gods-faithfulness`; `sin`; `presence-of-god`

**Applied-tag deltas:**
- ADD `idolatry` — the speech's center of indictment is sustained idolatry material: “Make us gods that will go before us” (7:40), “They made a calf in those days, and brought a sacrifice to the idol, and rejoiced in the works of their hands.” (7:41), “You took up the tabernacle of Moloch, the star of your god Rephan, the figures which you made to worship” (7:43). Four verses of specific idol worship beside `sin`'s broader rebellion span — both-tags, distinct registers.
- ADD `ascension` — the climactic vision is the exalted Christ: “saw the glory of God, and Jesus standing on the right hand of God” (7:55), “Behold, I see the heavens opened and the Son of Man standing at the right hand of God!” (7:56) — the pack's own Ac 7:55-56 anchor; the right-hand exaltation register.
- ADD `the-house-of-god` — a sustained tabernacle-to-temple argument (7:44-50): “Our fathers had the tabernacle of the testimony in the wilderness” (7:44), “But Solomon built him a house. However, the Most High doesn’t dwell in temples made with hands” (7:47-48), “heaven is my throne… What kind of house will you build me?” (7:49). Both-tags beside `presence-of-god`, which carries the where-God-dwells register on the same span.
- KEEP `suffering-for-christ` — stoned for his testimony (7:58-60); KEEP `forgiving-others` — “Lord, don’t hold this sin against them!” (7:60); KEEP `gods-faithfulness` — “as the time of the promise came close which God had sworn to Abraham, the people grew and multiplied” (7:17), “God was with him” (7:9); KEEP `sin` — “our fathers wouldn’t be obedient, but rejected him and turned back in their hearts to Egypt” (7:39), “you always resist the Holy Spirit! As your fathers did, so you do.” (7:51); KEEP `presence-of-god` — “the place where you stand is holy ground” (7:33), “the Most High doesn’t dwell in temples made with hands” (7:48).

**Anchor-extension candidates:**
- `suffering-for-christ` | Acts 7:54-60 | “They stoned Stephen as he called out, saying, ‘Lord Jesus, receive my spirit!’” (7:59) | mid-high weight (the pack's only anchor is Mt 5:10; Stephen is the church's first martyrdom).
- `forgiving-others` | Acts 7:60 | “Lord, don’t hold this sin against them!” | mid weight (the dying prayer for enemies; pack has no Acts anchor).
- `idolatry` | Acts 7:41-43 | “They made a calf in those days, and brought a sacrifice to the idol, and rejoiced in the works of their hands.” | low-mid weight (pack has no Gospels/Acts anchor).
- `the-house-of-god` | Acts 7:48-50 | “the Most High doesn’t dwell in temples made with hands” | mid weight (pack has no Gospels/Acts anchor; the NT's direct temple-theology statement).

**Lexicon candidates:**
- `suffering-for-christ` | Stephen phrasings | queries: "stephen the first martyr"; "stoning of stephen"; "first christian martyr".
- `the-house-of-god` | 7:48 phrasing | queries: "does god live in the temple"; "god doesn't dwell in temples made with hands".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT after adds (each tag independently clears the bar); book-doc subdivision (2 sections) — mark for the per-verse refinement pass (the speech's spans 7:2-8 / 9-16 / 17-43 / 44-50 vs the martyrdom 7:54-60 are natural per-verse ranges).

**Decisions record:**
- `hardness-of-heart` considered for 7:51 (“You stiff-necked and uncircumcised in heart and ears, you always resist the Holy Spirit!”) and NOT added: the resist-the-Spirit indictment is already carried by `sin`'s 7:39-53 span, and the chapter never uses the harden vocabulary — yields as broad-duplicating-specific at ceiling.
- `messianic-prophecy` considered for 7:37, 52 (“The Lord our God will raise up a prophet for you from among your brothers, like me.”; “They killed those who foretold the coming of the Righteous One”) and NOT added: two verses inside the retelling, chapter at ceiling; yields as thin.
- `envy-and-jealousy` considered for 7:9 (“The patriarchs, moved with jealousy against Joseph, sold him into Egypt.”) and NOT added: single verse retelling Genesis 37; the sibling-rivalry register belongs to the Genesis chapters themselves. Thin-single-verse.
- `angels` considered for 7:30, 35, 38, 53 and NOT added: mentions inside the historical retelling, no angelic act in the chapter's own frame; thin.
- `ascension` add note: presence is 7:55-56 only (two verses), admitted above the thin-single-verse line because it is the chapter's climax and the pack's own anchor — reversible call for Jesse.
## Acts 8 (subdivided: 8:1–3 / 8:4–8 / 8:9–25 / 8:26–40)

**Existing tags (book doc):** `sharing-your-faith`; `guidance`; `baptism`; `studying-the-word`; `joy-in-the-lord`; `repentance`; `holy-spirit`; `money-and-possessions`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `sharing-your-faith` — “those who were scattered abroad went around preaching the word.” (8:4), Philip “preached to him about Jesus.” (8:35); KEEP `guidance` — “an angel of the Lord spoke to Philip, saying, ‘Arise, and go toward the south…’” (8:26), “The Spirit said to Philip, ‘Go near, and join yourself to this chariot.’” (8:29); KEEP `baptism` — “they were baptized, both men and women.” (8:12), “Behold, here is water. What is keeping me from being baptized?” (8:36); KEEP `studying-the-word` — “Do you understand what you are reading?” “How can I, unless someone explains it to me?” (8:30-31); KEEP `joy-in-the-lord` — “There was great joy in that city.” (8:8), “he went on his way rejoicing.” (8:39); KEEP `repentance` — “Repent therefore of this, your wickedness” (8:22); KEEP `holy-spirit` — “they laid their hands on them, and they received the Holy Spirit.” (8:17); KEEP `money-and-possessions` — “May your silver perish with you, because you thought you could obtain the gift of God with money!” (8:20).

**Anchor-extension candidates:**
- `servant-of-the-lord` | Acts 8:32-35 | “He was led as a sheep to the slaughter. As a lamb before his shearer is silent, so he doesn’t open his mouth.” (8:32), with “beginning from this Scripture, preached to him about Jesus.” (8:35) | mid weight (the pack has no NT anchor; this is the NT's explicit servant-song-applied-to-Jesus text).
- `messianic-prophecy` | Acts 8:32-35 | same span — Isaiah read, “Who is the prophet talking about?” answered with Jesus (8:34-35) | low-mid weight (curation should pick ONE of these two packs for the span, or split quote vs application — not both with identical refs).
- `occult-and-divination` | Acts 8:9-11 | “a certain man, Simon by name, who used to practice sorcery in the city and amazed the people of Samaria” | low weight (sorcerer-confronted-by-the-gospel narrative; pack's Acts anchors are chs. 13 and 16 only).

**Lexicon candidates:**
- `studying-the-word` | Ethiopian-eunuch phrasings | queries: "philip and the ethiopian eunuch"; "do you understand what you are reading".
- `money-and-possessions` | simony phrasings | queries: "simony in the bible"; "trying to buy gods power"; "simon the sorcerer meaning".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT; book-doc subdivision (4 sections) — mark for the per-verse refinement pass (8:9-25 Simon and 8:26-40 eunuch are self-contained per-verse spans).

**Decisions record:**
- `servant-of-the-lord` / `messianic-prophecy` considered as display tags for 8:32-35 and NOT added: chapter at hard ceiling; the span is already surfaced by `studying-the-word`'s justification, so the display need is served — routed engine-side as anchor-extensions, which is where the real gap is (neither pack has this text). Yield class: at-ceiling, span already carried by an incumbent.
- `occult-and-divination` considered for 8:9-24 and NOT added: the sorcery is Simon's background; the sin the text condemns is buying God's gift (carried by `money-and-possessions` and `repentance`). Yield class: theme-witness-with-caveat at ceiling; anchor-extension proposed instead.
- `deliverance-from-demons` considered for 8:7 (“unclean spirits came out of many of those who had them”) and NOT added: single summary verse; thin-single-verse.
- Note for the refinement pass: 8:2 “Devout men buried Stephen and lamented greatly over him.” touches the corpus-blocked death-and-burial row (roster 22) — one verse only, recorded here as a minor supplementary citation for that row, not a proposal.
## Acts 9 (subdivided: 9:1–19 / 9:20–30 / 9:31–43)

**Existing tags (book doc):** `sharing-your-faith`; `suffering-for-christ`; `dreams-and-visions`; `pastoral-prayer-for-healing`; `signs-and-wonders`

**Applied-tag deltas:**
- ADD `boldness-in-witness` — the pack's own Ac 9:27-29 anchor, and the chapter says it twice: “how at Damascus he had preached boldly in the name of Jesus.” (9:27) and “preaching boldly in the name of the Lord Jesus.” (9:29) — the converted persecutor's boldness under two murder plots is the scene's substance.
- KEEP `sharing-your-faith` — “Immediately in the synagogues he proclaimed the Christ, that he is the Son of God.” (9:20); KEEP `suffering-for-christ` — “I will show him how many things he must suffer for my name’s sake.” (9:16), plots in Damascus and Jerusalem (9:23-24, 29); KEEP `dreams-and-visions` — “The Lord said to him in a vision, ‘Ananias!’” (9:10) and Saul's paired vision (9:12); KEEP `pastoral-prayer-for-healing` — “Aeneas, Jesus Christ heals you. Get up and make your bed!” (9:34), and Peter “knelt down and prayed” before “Tabitha, get up!” (9:40); KEEP `signs-and-wonders` — Aeneas healed and Tabitha raised, with Lydda, Sharon, and Joppa turning to the Lord (9:34-35, 40-42).

**Anchor-extension candidates:**
- `good-works` | Acts 9:36-39 | “This woman was full of good works and acts of mercy which she did.” (9:36), the widows “showing the tunics and other garments which Dorcas had made” (9:39) | low-mid weight (the pack has no Gospels/Acts anchor and this is the phrase's narrative embodiment).
- `fear-of-the-lord` | Acts 9:31 | “walking in the fear of the Lord and in the comfort of the Holy Spirit” | low weight (pack has no NT anchor).

**Lexicon candidates:**
- `pastoral-prayer-for-healing` (engine id `prayer-for-healing`) | Joppa phrasings | queries: "tabitha raised from the dead"; "dorcas in the bible".
- Alias-class note (Layer-2, not a concept lexicon row): "damascus road experience" / "paul's conversion story" are verse-range queries wanting Acts 9:1-19 itself; no concept owns them — QR-6 alias candidate mapping to the passage, flagged for the alias-mining loop.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 6 tags after the add — soft cap 6 hit exactly; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `good-works` considered as a display tag for 9:36-39 and NOT added: two verses inside the Tabitha scene; yields as thin — routed engine-side as an anchor-extension where the pack's gap actually is.
- `new-creation` considered for the conversion narrative (persecutor to preacher, 9:1-22) and NOT added: the chapter depicts a conversion, not the in-Christ new-creation teaching — tagging it would read the doctrine back into narrative. The search need ("can god change anyone") is noted under the alias-class lexicon item instead.
- 9:31 (“the assemblies throughout all Judea, Galilee, and Samaria had peace and were built up”) routed as evidence to the early-church-community OPEN lexicon lead (`gathering-together` check); `fear-of-the-lord` and `holy-spirit-the-comforter` presence there is one clause each — thin-single-verse, not tagged.
## Acts 10 (subdivided: 10:1–8 / 10:9–16 / 10:17–33 / 10:34–43 / 10:44–48)

**Existing tags (book doc):** `nations-and-peoples`; `dreams-and-visions`; `prayer`; `forgiveness-of-sins`; `angels`; `gentile-inclusion`; `holy-spirit`

**Applied-tag deltas:**
- ADD `favoritism` — the pack's own Ac 10:34-35 anchor and the sermon's opening thesis: “Truly I perceive that God doesn’t show favoritism; but in every nation he who fears him and works righteousness is acceptable to him.” (10:34-35) — the whole Cornelius narrative enacts it. Both-tags beside `nations-and-peoples`/`gentile-inclusion` (impartiality register vs nations vs welcomed-without-the-law).
- KEEP `nations-and-peoples` — “in every nation he who fears him and works righteousness is acceptable to him.” (10:35); KEEP `dreams-and-visions` — Cornelius “clearly saw in a vision an angel of God” (10:3), Peter “fell into a trance” and saw the sheet, three times (10:10-16); KEEP `prayer` — Cornelius “always prayed to God” (10:2), “Your prayers and your gifts to the needy have gone up for a memorial before God.” (10:4); KEEP `forgiveness-of-sins` — “through his name everyone who believes in him will receive remission of sins.” (10:43); KEEP `angels` — the messenger at the ninth hour (10:3-7, 22, 30-32); KEEP `gentile-inclusion` — “What God has cleansed, you must not call unclean.” (10:15), “God has shown me that I shouldn’t call any man unholy or unclean.” (10:28) — adopted display id, applied where genuinely present per ruling 1(b); KEEP `holy-spirit` — “the Holy Spirit fell on all those who heard the word.” (10:44), the gift “also poured out on the Gentiles” (10:45).

**Anchor-extension candidates:**
- `prayer` | Acts 10:4 | “Your prayers and your gifts to the needy have gone up for a memorial before God.” | low weight (prayers-heard-and-remembered text; the pack has no Acts anchor).

**Lexicon candidates:**
- `clean-and-unclean` | Peter's-vision phrasings | queries: "peter's vision of the sheet"; "rise peter kill and eat meaning"; "what god has cleansed do not call unclean".
- `divine-judgment` | the 10:42 title | queries: "judge of the living and the dead".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT after the add; book-doc subdivision (5 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- CORPUS-BLOCKED ROUTE (roster row 40, `gentile-inclusion`): Acts 10 is the row's primary evidence — “What God has cleansed, you must not call unclean.” (10:15); “God has shown me that I shouldn’t call any man unholy or unclean.” (10:28); “the gift of the Holy Spirit was also poured out on the Gentiles.” (10:45); “Can anyone forbid these people from being baptized with water? They have received the Holy Spirit just like us.” (10:47). Recorded FOR the blocked engine row; no pack proposal, no duplicate gap. The display tag stays applied per ruling 1(b).
- `clean-and-unclean` considered as a display tag for 10:9-16, 28 and NOT added: chapter at hard ceiling after the `favoritism` add; the pack's own Ac 10:9-16 engine anchor already serves the vision's searches, and `dreams-and-visions` + `gentile-inclusion` carry the span on display. Yield class: broad-duplicating-specific at ceiling — flagged for the per-verse refinement pass (10:9-16 is its natural per-verse home).
- `resurrection` considered for 10:40-41 and NOT added: witness-report inside the sermon; theme-witness-with-caveat at ceiling.
- `baptism` considered for 10:47-48 and NOT added: two closing verses; thin at ceiling; the household-baptism register is tagged on chs. 2, 8, 16, 19.
- `hospitality` (10:23), `fasting` (10:30), `messianic-prophecy` (10:43) each considered and NOT added: thin-single-verse.
## Acts 11 (subdivided: 11:1–18 / 11:19–30)

**Existing tags (book doc):** `nations-and-peoples`; `dreams-and-visions`; `repentance`; `generosity`; `gentile-inclusion`; `holy-spirit`

**Applied-tag deltas:**
- ADD `clean-and-unclean` — the defense retells the sheet vision at length: “nothing unholy or unclean has ever entered into my mouth.” (11:8) answered by “What God has cleansed, don’t you call unclean.” (11:9), three times (11:10) — six verses of clean/unclean substance (11:5-10) beside `dreams-and-visions`' vision register (both-tags).
- KEEP `nations-and-peoples` — “the Gentiles had also received the word of God.” (11:1); KEEP `dreams-and-visions` — “in a trance I saw a vision: a certain container descending, like it was a great sheet let down from heaven” (11:5); KEEP `repentance` — “Then God has also granted to the Gentiles repentance to life!” (11:18); KEEP `generosity` — “As any of the disciples had plenty, each determined to send relief to the brothers who lived in Judea” (11:29); KEEP `gentile-inclusion` — “You went in to uncircumcised men and ate with them!” (11:3) answered by “who was I, that I could withstand God?” (11:17); KEEP `holy-spirit` — “the Holy Spirit fell on them, even as on us at the beginning.” (11:15), Barnabas “full of the Holy Spirit and of faith” (11:24).

**Anchor-extension candidates:**
- `discipleship` | Acts 11:26 | “The disciples were first called Christians in Antioch.” | low weight (the name-origin verse users search for; pack has no Acts anchor).

**Lexicon candidates:**
- `discipleship` | the 11:26 fact | queries: "where were believers first called christians"; "what does christian mean"; "first called christians in antioch".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags after the add — soft cap exceeded, under hard ceiling; book-doc subdivision (2 sections) — mark for the per-verse refinement pass. Consistency note: `clean-and-unclean` is added here but was yielded at ceiling on ch. 10 — a ceiling artifact for the refinement pass to even out (10:9-16 is the concept's primary Acts span).

**Decisions record:**
- CORPUS-BLOCKED ROUTE (roster row 40, `gentile-inclusion`): Acts 11 evidence — “You went in to uncircumcised men and ate with them!” (11:3); “If then God gave to them the same gift as us when we believed in the Lord Jesus Christ, who was I, that I could withstand God?” (11:17); “Then God has also granted to the Gentiles repentance to life!” (11:18). Recorded FOR the blocked engine row; display tag stays per ruling 1(b).
- Famine material (11:28-30) checked against declines §3.1: famine/scarcity is covered by the `gods-provision` lexicon extension (PR #41) — the chapter depicts church relief, not God's-provision teaching, so no tag and no new gap row; `generosity` carries the relief.
- Barnabas's exhortation (11:23, “with purpose of heart they should remain near to the Lord”) considered for `comforting-others`/`gathering-together` and NOT added: one verse; thin-single-verse. Noted as evidence for the early-church-community lexicon lead (11:19-26 is among that lead's listed spans).
## Acts 12 (subdivided: 12:1–4 / 12:5–19 / 12:20–25)

**Existing tags (book doc):** `gods-protection`; `prayer`; `suffering-for-christ`; `divine-judgment`; `angels`

**Applied-tag deltas:** No changes — all five clear the bar and no further concept shows substantial presence: KEEP `gods-protection` — “Now I truly know that the Lord has sent out his angel and delivered me out of the hand of Herod, and from everything the Jewish people were expecting.” (12:11); KEEP `prayer` — “constant prayer was made by the assembly to God for him.” (12:5), the answer knocking at the prayer meeting (12:12-16); KEEP `suffering-for-christ` — “He killed James, the brother of John, with the sword.” (12:2), Peter seized (12:3); KEEP `divine-judgment` — “Immediately an angel of the Lord struck him, because he didn’t give God the glory. Then he was eaten by worms and died.” (12:23); KEEP `angels` — the rescuing angel (12:7-10), “It is his angel.” (12:15), the striking angel (12:23).

**Anchor-extension candidates:**
- `gods-protection` | Acts 12:6-11 | “the Lord has sent out his angel and delivered me out of the hand of Herod” (12:11) | mid weight (the pack has no Gospels/Acts anchor; the prison rescue is a canonical protection narrative).
- `angels` | Acts 12:7-11 | “an angel of the Lord stood by him, and a light shone in the cell… His chains fell off his hands.” (12:7) | mid weight (the pack's four anchors are all Gospels; Acts' most vivid angelic act).
- `prayer` | Acts 12:5 | “constant prayer was made by the assembly to God for him.” | low-mid weight (interceding-assembly text; pairs with the 1:14 candidate).
- `humble-exaltation` | Acts 12:21-23 | “The people shouted, ‘The voice of a god, and not of a man!’ Immediately an angel of the Lord struck him, because he didn’t give God the glory.” | low weight (the god-resists-the-proud register in narrative; pack's Acts anchor is 20:19 only).

**Lexicon candidates:**
- `divine-judgment` | Herod phrasings | queries: "herod eaten by worms"; "the voice of a god and not of a man".
- `prayer` | intercession phrasings | queries: "peter freed from prison by prayer"; "praying for someone in prison".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 5 tags — under soft cap; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `humble-exaltation` considered as a display tag for 12:21-23 and NOT added: the pride-struck-down scene is three verses whose event is already tagged `divine-judgment` — yields as broad-duplicating-specific; routed engine-side as a low-weight anchor-extension instead.
- `glory-of-god` considered for 12:23 (“because he didn’t give God the glory”) and NOT added: one clause; thin-single-verse; the search need is served by the `divine-judgment` lexicon candidates.
## Acts 13 (subdivided: 13:1–3 / 13:4–12 / 13:13–41 / 13:42–52)

**Existing tags (book doc):** `guidance`; `resurrection`; `justification-by-faith`; `forgiveness-of-sins`; `nations-and-peoples`; `joy-in-the-lord`; `gentile-inclusion`

**Applied-tag deltas:**
- ADD `occult-and-divination` — the pack's own Ac 13:8-11 anchor and a six-verse confrontation scene: “they found a certain sorcerer, a false prophet, a Jew whose name was Bar Jesus” (13:6); “Elymas the sorcerer… withstood them, seeking to turn the proconsul away from the faith.” (13:8); “You son of the devil, full of all deceit and all cunning… you will be blind, not seeing the sun for a season!” (13:10-11).
- KEEP `guidance` — “the Holy Spirit said, ‘Separate Barnabas and Saul for me, for the work to which I have called them.’” (13:2), “being sent out by the Holy Spirit” (13:4); KEEP `resurrection` — “But God raised him from the dead” (13:30), “he whom God raised up saw no decay.” (13:37); KEEP `justification-by-faith` — “by him everyone who believes is justified from all things, from which you could not be justified by the law of Moses.” (13:39); KEEP `forgiveness-of-sins` — “through this man is proclaimed to you remission of sins” (13:38); KEEP `nations-and-peoples` — “I have set you as a light for the Gentiles, that you should bring salvation to the uttermost parts of the earth.” (13:47); KEEP `joy-in-the-lord` — the glad Gentiles (13:48) and “The disciples were filled with joy and with the Holy Spirit.” (13:52); KEEP `gentile-inclusion` — “behold, we turn to the Gentiles.” (13:46), “As many as were appointed to eternal life believed.” (13:48).

**Anchor-extension candidates:**
- `election-and-predestination` | Acts 13:48 | “As many as were appointed to eternal life believed.” | mid weight (the pack has no Gospels/Acts anchor; a first-rank appointed-to-life text — note the roster's caution that Rom 9 potter texts enter only whole applies to Romans, not here).
- `messianic-prophecy` | Acts 13:27-33 | “those who dwell in Jerusalem, and their rulers, because they didn’t know him, nor the voices of the prophets which are read every Sabbath, fulfilled them by condemning him.” (13:27), “God has fulfilled this to us… in that he raised up Jesus.” (13:33) | low-mid weight.

**Lexicon candidates:**
- `election-and-predestination` | the 13:48 phrase | queries: "appointed to eternal life meaning"; "acts 13 48 predestination".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT after the add; book-doc subdivision (4 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `fasting` considered for 13:2-3 (“As they served the Lord and fasted…”, “when they had fasted and prayed”) and NOT added: chapter at hard ceiling after the `occult-and-divination` add; presence is two verses of practice-depiction, and the pack's own Ac 13:2-3 anchor already serves search. Yield class: thin at ceiling — flagged for the per-verse refinement pass (13:1-3 is its natural span).
- `boldness-in-witness` considered for 13:46 (“Paul and Barnabas spoke out boldly”) and NOT added: one verse; the pack's own Ac 13:46 anchor exists. Thin-single-verse at ceiling.
- `false-prophets` considered for 13:6 (Bar Jesus called “a false prophet”) and NOT added: a label in passing; the scene's substance is sorcery-opposing-the-faith, carried by `occult-and-divination` — and the declines digest warns against appending the same refs to both false-prophet-family packs.
- `election-and-predestination` considered as a display tag for 13:48 and NOT added: thin-single-verse at ceiling; routed engine-side as the anchor-extension above, where the pack's gap actually is.
- `messianic-prophecy` considered as a display tag and NOT added: fulfillment claims live inside the sermon retelling; theme-witness-with-caveat at ceiling; anchor-extension proposed instead.
## Acts 14 (subdivided: 14:1–7 / 14:8–20 / 14:21–28)

**Existing tags (book doc):** `sharing-your-faith`; `suffering-for-christ`; `those-who-never-heard`; `worship`; `faith`; `discipleship`; `signs-and-wonders`; `creation-testifies`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `sharing-your-faith` — “so spoke that a great multitude both of Jews and of Greeks believed.” (14:1), “There they preached the Good News.” (14:7); KEEP `suffering-for-christ` — “they stoned Paul and dragged him out of the city, supposing that he was dead.” (14:19), “through many afflictions we must enter into God’s Kingdom.” (14:22); KEEP `those-who-never-heard` — “he didn’t leave himself without witness, in that he did good and gave you rains from the sky and fruitful seasons” (14:17); KEEP `worship` — “turn from these vain things to the living God, who made the sky, the earth, the sea, and all that is in them” (14:15), the refused sacrifice (14:13-18); KEEP `faith` — “seeing that he had faith to be made whole” (14:9), “a door of faith to the nations.” (14:27); KEEP `discipleship` — “had made many disciples” (14:21), “strengthening the souls of the disciples, exhorting them to continue in the faith” (14:22); KEEP `signs-and-wonders` — “granting signs and wonders to be done by their hands.” (14:3), the cripple who “leaped up and walked.” (14:10); KEEP `creation-testifies` — the pack's own Ac 14:16-17 anchor.

**Anchor-extension candidates:**
- `leadership` | Acts 14:23 | “When they had appointed elders for them in every assembly, and had prayed with fasting, they commended them to the Lord” | low weight (elder-appointment text; the pack's lexicon carries "qualifications of an elder" but no Acts anchor).

**Lexicon candidates:**
- `suffering-for-christ` | the 14:22 phrase | queries: "through many tribulations enter the kingdom"; "must we suffer to enter gods kingdom".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT (pre-existing); book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `idolatry` considered for 14:13-15 (the Jupiter sacrifice and “turn from these vain things to the living God”) and NOT added: at ceiling, and the redirect-from-idols span is exactly what `worship` carries here — broad-duplicating-specific.
- `creation` considered for 14:15 and NOT added: one clause duplicating `creation-testifies`' span; thin at ceiling.
- `fasting` noted at 14:23 (“prayed with fasting”) for the refinement pass; single clause, not tagged.
- Early-church-community OPEN lexicon lead: 14:23, 27 (elders in every assembly; the assembly gathered for the report) noted as that lead's evidence; no new id proposed.
## Acts 15 (subdivided: 15:1–21 / 15:22–35 / 15:36–41)

**Existing tags (book doc):** `grace-not-earned`; `salvation`; `justification-by-faith`; `nations-and-peoples`; `harmony-with-others`; `gentile-inclusion`; `holy-spirit`; `unity-of-the-church`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `grace-not-earned` — “why do you tempt God, that you should put a yoke on the neck of the disciples… we believe that we are saved through the grace of the Lord Jesus, just as they are.” (15:10-11); KEEP `salvation` — “Unless you are circumcised after the custom of Moses, you can’t be saved.” (15:1) answered by 15:11; KEEP `justification-by-faith` — “He made no distinction between us and them, cleansing their hearts by faith.” (15:9); KEEP `nations-and-peoples` — “God first visited the nations to take out of them a people for his name.” (15:14), “all the Gentiles who are called by my name” (15:17); KEEP `harmony-with-others` — the dispute settled in open council, “having come to one accord” (15:25), with the sharp contention recorded without varnish (15:39); KEEP `gentile-inclusion` — “that we don’t trouble those from among the Gentiles who turn to God” (15:19), “to lay no greater burden on you than these necessary things” (15:28); KEEP `holy-spirit` — “giving them the Holy Spirit, just like he did to us.” (15:8), “it seemed good to the Holy Spirit, and to us” (15:28); KEEP `unity-of-the-church` — one accord out of a church-splitting question (15:22, 25).

**Anchor-extension candidates:**
- `grace-not-earned` | Acts 15:10-11 | “we believe that we are saved through the grace of the Lord Jesus, just as they are.” | mid weight (the pack has no Gospels/Acts anchor; the council's grace-verdict).
- `unity-of-the-church` | Acts 15:25 | “it seemed good to us, having come to one accord” | low weight (pack's only anchor is Jn 17:21-23).
- `restoration-of-israel` | Acts 15:16-17 | “I will again build the tabernacle of David, which has fallen.” | low weight, with caveat: James quotes Amos to warrant Gentile inclusion, not to teach national restoration — curation should weigh whether the application context helps or hijacks the pack.

**Lexicon candidates:**
- `grace-not-earned` | Jerusalem-council phrasings | queries: "do christians have to follow the law of moses"; "do you have to be circumcised to be saved"; "the jerusalem council".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT (pre-existing); book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- CORPUS-BLOCKED ROUTE (roster row 40, `gentile-inclusion`): Acts 15 is the row's council evidence — “Unless you are circumcised after the custom of Moses, you can’t be saved.” (15:1); “He made no distinction between us and them, cleansing their hearts by faith.” (15:9); “to lay no greater burden on you than these necessary things” (15:28). Recorded FOR the blocked engine row; display tag stays per ruling 1(b).
- CORPUS-BLOCKED ROUTE (roster row 43, `legalism`): Acts 15:1, 5, 10 is live legalism evidence — “It is necessary to circumcise them, and to command them to keep the law of Moses.” (15:5); “why do you tempt God, that you should put a yoke on the neck of the disciples which neither our fathers nor we were able to bear?” (15:10). Noted FOR that row (its grace-not-earned extension route matches the anchor-extension above); no duplicate gap row.
- `sexual-purity` considered for the abstain-list mentions (15:20, 29) and NOT added: list items without teaching substance; thin.
- Paul-and-Barnabas contention (15:36-41) checked against the vocabulary: no honest tag — the separation is narrated, not taught on; honest-and-empty preferred.
## Acts 16 (subdivided: 16:1–5 / 16:6–10 / 16:11–15 / 16:16–24 / 16:25–34 / 16:35–40)

**Existing tags (book doc):** `guidance`; `dreams-and-visions`; `salvation`; `baptism`; `praise`; `suffering-for-christ`; `governing-authorities`; `money-and-possessions`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `guidance` — “forbidden by the Holy Spirit to speak the word in Asia” (16:6), “the Spirit didn’t allow them.” (16:7), “concluding that the Lord had called us” (16:10); KEEP `dreams-and-visions` — “A vision appeared to Paul in the night.” (16:9); KEEP `salvation` — “Sirs, what must I do to be saved?” “Believe in the Lord Jesus Christ, and you will be saved, you and your household.” (16:30-31); KEEP `baptism` — “she and her household were baptized” (16:15), “immediately baptized, he and all his household.” (16:33); KEEP `praise` — “about midnight Paul and Silas were praying and singing hymns to God, and the prisoners were listening to them.” (16:25); KEEP `suffering-for-christ` — “When they had laid many stripes on them, they threw them into prison” (16:23); KEEP `governing-authorities` — “They have beaten us publicly without a trial, men who are Romans” (16:37); KEEP `money-and-possessions` — “her masters saw that the hope of their gain was gone” (16:19).

**Anchor-extension candidates:**
- `hospitality` | Acts 16:15 | “If you have judged me to be faithful to the Lord, come into my house and stay.” | low weight (Lydia's persuasion, echoed by the jailer's table, 16:34; pack's anchors are Gospels-only).
- `hope-in-despair` | Acts 16:27-28 | “drew his sword and was about to kill himself… But Paul cried with a loud voice, saying, ‘Don’t harm yourself, for we are all here!’” | low weight, flagged for pastoral review: an intervention-at-the-brink scene that fits the pack's crisis register — weigh with the same harm care the 2 Samuel suicide material received.

**Lexicon candidates:**
- `salvation` | household phrasings (book-doc motif 18) | queries: "you and your household will be saved meaning"; "household salvation in the bible".
- `praise` | midnight-hymns phrasings (book-doc motif 21) | queries: "paul and silas singing in prison"; "worshiping god in hard times".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT (pre-existing); book-doc subdivision (6 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `occult-and-divination` considered for 16:16-18 (“a certain girl having a spirit of divination… who brought her masters much gain by fortune telling”, “I command you in the name of Jesus Christ to come out of her!”) and NOT added: chapter at hard ceiling and the pack's own Ac 16:16-18 engine anchor already serves the search need. Yield class: at-ceiling — flagged for the per-verse refinement pass (16:16-24 is its natural span).
- `deliverance-from-demons` anchor-extension for 16:16-18 deliberately NOT proposed: the span is already `occult-and-divination`'s engine anchor; appending identical refs to a second pack would double-route (same-refs-to-both caution). The expulsion register is noted for the curator deciding the open spiritual-warfare one-or-two design (declines §1(e)).
- `hospitality` considered as a display tag for 16:15, 34 and NOT added: two verses across two scenes; thin — routed as anchor-extension.
- Timothy's circumcision (16:3) and the decree delivery (16:4) checked: no honest tag; narrative logistics.
## Acts 17 (subdivided: 17:1–9 / 17:10–15 / 17:16–21 / 17:22–34)

**Existing tags (book doc):** `studying-the-word`; `sharing-your-faith`; `those-who-never-heard`; `creation`; `resurrection`; `divine-judgment`; `false-prophets`; `giving-an-answer`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `studying-the-word` — the Beroeans “received the word with all readiness of mind, examining the Scriptures daily to see whether these things were so.” (17:11); KEEP `sharing-your-faith` — “for three Sabbath days reasoned with them from the Scriptures” (17:2), synagogue, marketplace, Areopagus (17:17, 22); KEEP `those-who-never-heard` — “What therefore you worship in ignorance, I announce to you.” (17:23), “that they should seek the Lord… though he is not far from each one of us.” (17:27); KEEP `creation` — “The God who made the world and all things in it” (17:24), “he himself gives to all life and breath and all things.” (17:25); KEEP `resurrection` — “the Christ had to suffer and rise again from the dead” (17:3), “he has given assurance to all men, in that he has raised him from the dead.” (17:31); KEEP `divine-judgment` — “he has appointed a day in which he will judge the world in righteousness by the man whom he has ordained” (17:31); KEEP `false-prophets` — the test-the-claims register on 17:11 (caveat carried in the book doc); KEEP `giving-an-answer` — reasoned persuasion as Paul's custom (17:2-3; the pack's own anchor).

**Anchor-extension candidates:**
- `seeking-god` | Acts 17:26-27 | “that they should seek the Lord, if perhaps they might reach out for him and find him, though he is not far from each one of us.” | mid weight — with a curation flag: 17:26-28 already anchors `creation-testifies`, `providence`, and `nations-and-peoples`; the seek-clause (v. 27) is the distinct register this pack lacks, but four packs on one span needs a deliberate dedupe decision.
- `idolatry` | Acts 17:16, 29 | “his spirit was provoked within him as he saw the city full of idols.” (17:16); “we ought not to think that the Divine Nature is like gold, or silver, or stone, engraved by art and design of man.” (17:29) | low weight.

**Lexicon candidates:**
- `presence-of-god` | the 17:27-28 phrases | queries: "in him we live and move and have our being"; "god is not far from us".
- `those-who-never-heard` | Areopagus phrasings | queries: "to an unknown god meaning"; "paul at the areopagus".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT (pre-existing); book-doc subdivision (4 sections) — mark for the per-verse refinement pass (17:22-34 carries most of the anchor-dense material).

**Decisions record:**
- `repentance` considered for 17:30 (“now he commands that all people everywhere should repent”) and NOT added: single verse at ceiling; the pack's own Ac 17:30 anchor exists. Thin-single-verse.
- `idolatry` considered as a display tag for 17:16, 29 and NOT added: at ceiling; two non-contiguous verses, and the Areopagus idol-critique is carried within `creation`/`those-who-never-heard`'s spans — routed engine-side as anchor-extension.
- `presence-of-god` considered for 17:27-28 and NOT added: two clauses inside the sermon at ceiling; routed as lexicon candidates instead.
- `seeking-god` considered as a display tag for 17:27 and NOT added: one verse; thin-single-verse — routed as the anchor-extension above.
## Acts 18 (subdivided: 18:1–11 / 18:12–17 / 18:18–22 / 18:23–28)

**Existing tags (book doc):** `fear-not`; `presence-of-god`; `gods-protection`; `sharing-your-faith`

**Applied-tag deltas:**
- ADD `giving-an-answer` — the pack's own Ac 18:27-28 anchor and the chapter's reasoning register throughout: Paul “reasoned in the synagogue every Sabbath and persuaded Jews and Greeks.” (18:4), and Apollos “powerfully refuted the Jews, publicly showing by the Scriptures that Jesus was the Christ.” (18:28).
- ADD `receiving-correction` — the Apollos scene's hinge is correction humbly received: mighty in the Scriptures yet knowing “only the baptism of John” (18:25), “Priscilla and Aquila heard him, they took him aside, and explained to him the way of God more accurately.” (18:26) — and he goes on to greater usefulness (18:27-28). The teachable-spirit register in narrative.
- KEEP `fear-not` — “Don’t be afraid, but speak and don’t be silent” (18:9); KEEP `presence-of-god` — “for I am with you… for I have many people in this city.” (18:10); KEEP `gods-protection` — “no one will attack you to harm you” (18:10), borne out before Gallio (18:14-16); KEEP `sharing-your-faith` — “testifying to the Jews that Jesus was the Christ.” (18:5).

**Anchor-extension candidates:**
- `fear-not` | Acts 18:9-10 | “Don’t be afraid, but speak and don’t be silent; for I am with you, and no one will attack you to harm you” | mid weight (the pack has no Gospels/Acts anchor; a direct fear-not word of the Lord).
- `receiving-correction` | Acts 18:26 | “they took him aside, and explained to him the way of God more accurately.” | low-mid weight (pack has no NT anchor).
- `presence-of-god` | Acts 18:10 | “for I am with you” | low weight (pack's only anchor is Jn 14:23; same span as the fear-not candidate — curation should pick one register or split).

**Lexicon candidates:**
- `work-and-diligence` | tentmaking phrasings | queries: "paul the tentmaker"; "working a job while doing ministry".
- `receiving-correction` | Apollos phrasings | queries: "apollos priscilla and aquila"; "being teachable in the bible".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 6 tags after adds — soft cap 6 hit exactly; book-doc subdivision (4 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `dreams-and-visions` considered for 18:9 (“The Lord said to Paul in the night by a vision”) and NOT added: the vision is the delivery mechanism of the fear-not word already tagged twice; thin-single-verse, broad-duplicating.
- `oaths-and-vows` considered for 18:18 (“He shaved his head in Cenchreae, for he had a vow.”) and NOT added: a mention without teaching substance; thin-single-verse.
- `work-and-diligence` considered for 18:3 (tentmaking) and NOT added: single verse; routed as lexicon candidate (the ch. 20 tag carries the book's working-hands teaching).
- `boldness-in-witness` considered for 18:26 (“He began to speak boldly in the synagogue.”) and NOT added: one clause about Apollos; thin-single-verse.
## Acts 19 (subdivided: 19:1–7 / 19:8–12 / 19:13–20 / 19:21–41)

**Existing tags (book doc):** `baptism`; `repentance`; `sharing-your-faith`; `holy-spirit`; `money-and-possessions`

**Applied-tag deltas:**
- ADD `occult-and-divination` — sustained magic-arts material: itinerant exorcists adjuring “by Jesus whom Paul preaches” (19:13), and “Many of those who practiced magical arts brought their books together and burned them in the sight of all. They counted their price, and found it to be fifty thousand pieces of silver.” (19:19).
- ADD `idolatry` — the riot is an idol-economy defending its goddess: silver shrines of Artemis (19:24), “this Paul has persuaded and turned away many people, saying that they are no gods that are made with hands.” (19:26), two hours of “Great is Artemis of the Ephesians!” (19:34).
- ADD `deliverance-from-demons` — the evil-spirit material is its own register: “the diseases departed from them, and the evil spirits went out.” (19:12), and the failed exorcism — “The evil spirit answered, ‘Jesus I know, and Paul I know, but who are you?’” (19:15-16).
- KEEP `baptism` — “they were baptized in the name of the Lord Jesus.” (19:5); KEEP `repentance` — believers “confessing and declaring their deeds” with costly book-burning (19:18-19); KEEP `sharing-your-faith` — three months bold in the synagogue, two years daily in the school of Tyrannus, “so that all those who lived in Asia heard the word of the Lord Jesus” (19:8-10); KEEP `holy-spirit` — “Did you receive the Holy Spirit when you believed?” (19:2), the Spirit coming with tongues and prophecy (19:6); KEEP `money-and-possessions` — “by this business we have our wealth” (19:25), the trade threatened by the gospel (19:26-27).

**Anchor-extension candidates:**
- `occult-and-divination` | Acts 19:18-19 | “Many of those who practiced magical arts brought their books together and burned them in the sight of all.” | mid weight (the pack's Acts anchors are chs. 13 and 16; the book-burning is its costliest renunciation scene).
- `deliverance-from-demons` | Acts 19:13-16 | “Jesus I know, and Paul I know, but who are you?” | mid weight (the pack has no Acts anchor; the seven-sons-of-Sceva scene is heavily searched).
- `idolatry` | Acts 19:26 | “they are no gods that are made with hands.” | low-mid weight.

**Lexicon candidates:**
- `occult-and-divination` | Ephesus phrasings | queries: "burning magic books in acts"; "should christians destroy occult items".
- `deliverance-from-demons` | Sceva phrasings | queries: "seven sons of sceva"; "jesus i know and paul i know".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT after adds (each tag independently clears the bar); book-doc subdivision (4 sections) — mark for the per-verse refinement pass (19:13-20 occult span vs 19:21-41 riot span separate cleanly).

**Decisions record:**
- Three adds on one chapter is the sweep's largest delta; grounds: the book doc tagged ch. 19 from a 131-id vocabulary in which `occult-and-divination`, `idolatry`, and `deliverance-from-demons` registers were absent or unconsidered here — each add carries multi-verse substance quoted above. Reversible for Jesse as a set.
- `signs-and-wonders` considered for 19:11-12 (“God worked special miracles by the hands of Paul”) and NOT added: two verses at ceiling; yields as thin.
- `giving-an-answer` considered for 19:8-10 (reasoning daily; the pack's own Ac 19:8-10 anchor) and NOT added: at ceiling; the span is carried by `sharing-your-faith`'s justification and the engine anchor exists. Yield class: broad-duplicating-specific.
- `hardness-of-heart` considered for 19:9 (“some were hardened and disobedient”) and NOT added: one clause; thin-single-verse.
## Acts 20 (subdivided: 20:1–6 / 20:7–12 / 20:13–16 / 20:17–38)

**Existing tags (book doc):** `generosity`; `work-and-diligence`; `gathering-together`; `sharing-your-faith`; `surrender-to-god`; `servanthood`; `shepherds-and-the-flock`

**Applied-tag deltas:**
- ADD `watchman-and-warning` — the pack's own Ac 20:26-27 anchor and the farewell's clean-from-blood charge: “Therefore I testify to you today that I am clean from the blood of all men, for I didn’t shrink from declaring to you the whole counsel of God.” (20:26-27), with “Therefore watch, remembering that for a period of three years I didn’t cease to admonish everyone night and day with tears.” (20:31).
- KEEP `generosity` — “remember the words of the Lord Jesus, that he himself said, ‘It is more blessed to give than to receive.’” (20:35; the pack's own anchor — quoted from the pinned fixture, whose 20:35 differs from upstream only by a typography-only NBSP); KEEP `work-and-diligence` — “I coveted no one’s silver, gold, or clothing. You yourselves know that these hands served my necessities” (20:33-34); KEEP `gathering-together` — “On the first day of the week, when the disciples were gathered together to break bread” (20:7); KEEP `sharing-your-faith` — “I didn’t shrink from declaring to you anything that was profitable, teaching you publicly and from house to house” (20:20); KEEP `surrender-to-god` — “I go bound by the Spirit to Jerusalem… nor do I hold my life dear to myself” (20:22-24); KEEP `servanthood` — “serving the Lord with all humility, with many tears” (20:19); KEEP `shepherds-and-the-flock` — “shepherd the assembly of the Lord and God which he purchased with his own blood.” (20:28; the pack's own Ac 20:28-31 anchor).

**Anchor-extension candidates:**
- `false-prophets` | Acts 20:29-30 | “vicious wolves will enter in among you, not sparing the flock. Men will arise from among your own selves, speaking perverse things, to draw away the disciples after them.” | mid weight (an insiders-will-distort warning the pack lacks; distinct from Mt 7's fruits test).
- `do-not-lose-heart` | Acts 20:24 | “But these things don’t count; nor do I hold my life dear to myself, so that I may finish my race with joy” | low weight — offered as the perseverance-in-mission lead's suggested route (see Decisions).

**Lexicon candidates:**
- `do-not-lose-heart` | finish-the-race phrasings (perseverance-in-mission OPEN lead, declines §3.5) | queries: "finish the race bible"; "finishing well in ministry" — caveat: `remembered-looking-to-jesus` already carries "run the race" phrases; curation must dedupe before adding.

**New-concept candidates:** None — the perseverance-in-mission gap stays a lexicon lead, per the declines digest.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT after the add; book-doc subdivision (4 sections) — mark for the per-verse refinement pass (the farewell 20:17-38 holds most anchors).

**Decisions record:**
- Perseverance-in-mission OPEN lexicon lead (declines §3.5): 20:22-24 evidence recorded — “I go bound by the Spirit to Jerusalem, not knowing what will happen to me there” (20:22), “so that I may finish my race with joy” (20:24). Both named routes checked per the lead: `do-not-lose-heart` (keep-going register — fits; lexicon candidate above) and `suffering-for-christ` (bonds-and-afflictions register — also fits 20:23). No new id proposed; the lead stays open for curation with both routes viable.
- Breaking-bread OPEN lexicon lead: 20:7 “gathered together to break bread” and 20:11 “had broken bread and eaten” recorded; `lords-supper`'s own Ac 20:7 anchor exists, and the in-chapter usage again reads as the gathered meal — supports lexicon-not-new-concept. No tagging change (`gathering-together` carries the span on display).
- `false-prophets` considered as a display tag for 20:29-30 and NOT added: chapter at hard ceiling after the `watchman-and-warning` add; the wolves warning sits inside `shepherds-and-the-flock`'s tagged span — yields as broad-duplicating-specific; routed engine-side as the anchor-extension.
- `signs-and-wonders` considered for the Eutychus raising (20:9-12) and NOT added: at ceiling; the scene is comfort-narrative (“Don’t be troubled, for his life is in him.” 20:10) more than attestation; thin.
- The weeping farewell (20:36-38) checked: no honest tag in the vocabulary (grief tags are death-register); honest-and-empty preferred — motif 22 in the book doc already logs it.
## Acts 21 (subdivided: 21:1–7 / 21:8–16 / 21:17–26 / 21:27–36 / 21:37–40)

**Existing tags (book doc):** `surrender-to-god`; `suffering-for-christ`

**Applied-tag deltas:**
- ADD `slander-and-false-accusation` — both halves of the chapter turn on false report: “They have been informed about you, that you teach all the Jews who are among the Gentiles to forsake Moses” — answered so that “all will know that there is no truth in the things that they have been informed about you” (21:21, 24); then the riot's false charge, “he also brought Greeks into the temple and has defiled this holy place!” built on supposition — “they supposed that Paul had brought him into the temple.” (21:28-29).
- KEEP `surrender-to-god` — “I am ready not only to be bound, but also to die at Jerusalem for the name of the Lord Jesus.” (21:13), “The Lord’s will be done.” (21:14); KEEP `suffering-for-christ` — Agabus's bonds prophecy (21:11) fulfilled in the mob's beating and the chains (21:30-33).

**Anchor-extension candidates:**
- `surrender-to-god` | Acts 21:13-14 | “I am ready not only to be bound, but also to die at Jerusalem for the name of the Lord Jesus.” … “The Lord’s will be done.” | mid weight (the pack has no Acts anchor; a yielded-life exchange in narrative).
- `slander-and-false-accusation` | Acts 21:27-29 | “he also brought Greeks into the temple and has defiled this holy place!” (21:28) | low-mid weight (companion to the ch. 6 candidate).

**Lexicon candidates:**
- `surrender-to-god` | the 21:13-14 phrasings | queries: "the lord's will be done"; "ready to die for jesus".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 3 tags — well under soft cap (honest-and-lean; the chapter is travel-and-arrest narrative); book-doc subdivision (5 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `holy-spirit` considered for 21:4, 11 (disciples speaking “through the Spirit”; “The Holy Spirit says” via Agabus) and NOT added: two mentions of Spirit-mediated warning without outpouring/teaching substance; thin. The Spirit-directs-the-mission motif is already logged (book-doc motif 17).
- `oaths-and-vows` considered for 21:23-26 (four men with a vow, purification, expenses paid) and NOT added: the vow is the mechanism of rumor management, not taught substance — setting, not teaching; yields as theme-witness-with-caveat.
- `prayer` considered for 21:5 (“Kneeling down on the beach, we prayed.”) and NOT added: thin-single-verse.
- `dreams-and-visions` considered for Agabus's acted prophecy (21:11) and NOT added: prophecy is not the pack's vision register; forcing it would stretch the id.
## Acts 22 (subdivided: 22:1–21 / 22:22–30)

**Existing tags (book doc):** `sharing-your-faith`; `dreams-and-visions`; `governing-authorities`

**Applied-tag deltas:** No changes — all three clear the bar and no further concept shows substantial presence: KEEP `sharing-your-faith` — the defense as testimony: “you will be a witness for him to all men of what you have seen and heard.” (22:15); KEEP `dreams-and-visions` — the noon light and voice (22:6-10) and the temple trance: “while I prayed in the temple, I fell into a trance” (22:17-18); KEEP `governing-authorities` — “Is it lawful for you to scourge a man who is a Roman, and not found guilty?” (22:25), “But I was born a Roman.” (22:28).

**Anchor-extension candidates:**
- `baptism` | Acts 22:16 | “Now why do you wait? Arise, be baptized, and wash away your sins, calling on the name of the Lord.” | mid weight (the pack has only Mt 28:19 and Ac 2:38; a directly-searched baptism text).

**Lexicon candidates:**
- `governing-authorities` | citizenship phrasings (book-doc motif 20) | queries: "paul's roman citizenship"; "did paul use his legal rights".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 3 tags — under soft cap; book-doc subdivision (2 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `baptism` considered as a display tag for 22:16 and NOT added: thin-single-verse inside the retold testimony; routed engine-side as the anchor-extension above.
- Supplementary note for corpus-blocked row 40 (`gentile-inclusion`): 22:21-22 — “Depart, for I will send you out far from here to the Gentiles.” met by “Rid the earth of this fellow, for he isn’t fit to live!” — recorded as minor supporting evidence (the Gentile word as the offense); primary evidence remains chs. 10–11/15.
- `forgiveness-of-sins` considered for 22:16 (“wash away your sins”) and NOT added: same single verse as the baptism candidate; thin.
## Acts 23 (subdivided: 23:1–11 / 23:12–22 / 23:23–35)

**Existing tags (book doc):** `gods-protection`; `providence`; `presence-of-god`; `conscience`; `governing-authorities`; `oaths-and-vows`

**Applied-tag deltas:**
- ADD `resurrection-of-the-dead` — the general-resurrection hope is the scene's stated issue: “Concerning the hope and resurrection of the dead I am being judged!” (23:6), with the doctrinal divide spelled out: “For the Sadducees say that there is no resurrection, nor angel, nor spirit; but the Pharisees confess all of these.” (23:8) — three verses driving the council's split (both-tags logic beside ch. 24's tagging of the same confession).
- KEEP `gods-protection` — the leaked plot and the two-hundred-soldier night escort (23:16-24); KEEP `providence` — “as you have testified about me at Jerusalem, so you must testify also at Rome.” (23:11) with the chapter's plots moving Paul along that road (23:23-33); KEEP `presence-of-god` — “the Lord stood by him” (23:11); KEEP `conscience` — “I have lived before God in all good conscience until today.” (23:1; the pack's own anchor); KEEP `governing-authorities` — “You shall not speak evil of a ruler of your people.” (23:5); KEEP `oaths-and-vows` — “bound themselves under a curse, saying that they would neither eat nor drink until they had killed Paul.” (23:12-14), routed for what Scripture shows about binding oaths, not as endorsement.

**Anchor-extension candidates:**
- `resurrection-of-the-dead` | Acts 23:6-8 | “Concerning the hope and resurrection of the dead I am being judged!” | low-mid weight (pack's only Acts anchor is 24:15; this is its courtroom companion).

**Lexicon candidates:**
- `resurrection-of-the-dead` | Sadducee-dispute phrasings | queries: "sadducees deny the resurrection"; "pharisees vs sadducees resurrection".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags after the add — soft cap exceeded, under hard ceiling; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `angels` considered for 23:8-9 (the Sadducee denial, “nor angel, nor spirit”; “if a spirit or angel has spoken to him”) and NOT added: doctrinal mentions inside the dispute, no angelic act; thin.
- `fear-not` considered for 23:11 (“Cheer up, Paul”) and NOT added: the encouragement is already carried by `presence-of-god` and `providence` on the same verse; broad-duplicating.
- `taming-the-tongue` considered for 23:3-5 (the retracted “whitewashed wall” outburst) and NOT added: the scene's correction is about rulers, carried by `governing-authorities`; forcing the tongue register would moralize beyond the text.
## Acts 24 (subdivided: 24:1–9 / 24:10–21 / 24:22–27)

**Existing tags (book doc):** `hope-in-god`; `conscience`; `resurrection-of-the-dead`

**Applied-tag deltas:**
- ADD `slander-and-false-accusation` — a formal false indictment and its rebuttal structure the chapter: “we have found this man to be a plague, an instigator of insurrections among all the Jews throughout the world” (24:5), “He even tried to profane the temple” (24:6), the accusers affirming it (24:9), answered by “Nor can they prove to you the things of which they now accuse me.” (24:13) and “They ought to have been here before you and to make accusation if they had anything against me.” (24:19).
- KEEP `hope-in-god` — “having hope toward God, which these also themselves look for” (24:15); KEEP `conscience` — “a conscience void of offense toward God and men.” (24:16; the pack's own anchor); KEEP `resurrection-of-the-dead` — “there will be a resurrection of the dead, both of the just and unjust.” (24:15; the pack's own Ac 24:15 anchor), repeated at 24:21.

**Anchor-extension candidates:**
- `slander-and-false-accusation` | Acts 24:5-13 | “we have found this man to be a plague, an instigator of insurrections” (24:5) with “Nor can they prove to you the things of which they now accuse me.” (24:13) | mid weight (third Acts candidate for this thin pack — chs. 6, 21, 24 together give it a real NT spine).
- `self-control` | Acts 24:25 | “As he reasoned about righteousness, self-control, and the judgment to come, Felix was terrified” | low weight (the pack has no Gospels/Acts anchor; the word is the pack's own term).

**Lexicon candidates:**
- `divine-judgment` | the Felix scene | queries: "righteousness self-control and the judgment to come"; "felix trembled at paul's preaching".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 4 tags after the add — under soft cap; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `giving-an-answer` considered for 24:10-21 (“I cheerfully make my defense”) and NOT added: the defense is procedural rebuttal of charges more than the reasoned case for the faith the pack's register carries (chs. 17 and 26 hold that); register call, reversible.
- `money-and-possessions` considered for 24:26 (Felix “hoped that money would be given to him by Paul”) and NOT added: a bribe-hope narrated in one verse; thin-single-verse.
- `governing-authorities` considered (trial-before-governor setting) and NOT added: setting, not the believer-and-state teaching the tag carries on chs. 4-5, 16, 22-23, 25; broad-duplicating restraint.
## Acts 25 (subdivided: 25:1–12 / 25:13–22 / 25:23–27)

**Existing tags (book doc):** `governing-authorities` (added 2026-08-25 from the adopted vocabulary; the doc's original "none" verdict described the pre-adoption vocabulary)

**Applied-tag deltas:**
- ADD `slander-and-false-accusation` — the chapter's engine is unprovable charges: “bringing against him many and grievous charges which they could not prove” (25:7), “When the accusers stood up, they brought no charges against him of such things as I supposed” (25:18), the multitude “crying that he ought not to live any longer. But when I found that he had committed nothing worthy of death” (25:24-25).
- KEEP `governing-authorities` — “I am standing before Caesar’s judgment seat, where I ought to be tried.” (25:10), “I appeal to Caesar!” (25:11), and the Roman-process principle: “it is not the custom of the Romans to give up any man to destruction before the accused has met the accusers face to face” (25:16).

**Anchor-extension candidates:** None — the `slander-and-false-accusation` pack is better served by the chs. 6/21/24 candidates already proposed; a fourth identical-register anchor would add weight without value.

**Lexicon candidates:**
- `governing-authorities` | appeal phrasings (book-doc motif 20) | queries: "paul appeals to caesar"; "i appeal to caesar meaning".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 2 tags — honest-and-lean (procedural chapter); book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- The book doc's "none" verdict for the pre-adoption vocabulary is re-affirmed as it stood; both current tags come from later vocabulary (`governing-authorities` adopted 2026-08-25; `slander-and-false-accusation` added by this sweep from the 239-id library).
- `resurrection` considered for 25:19 (Festus's secondhand “one Jesus, who was dead, whom Paul affirmed to be alive”) and NOT added: the book doc's own reasoning stands — the claim is reported without the chapter carrying its teaching; theme-witness-with-caveat.
- `gods-protection` considered for 25:3-4 (the road ambush foiled by Festus keeping the case at Caesarea) and NOT added: the protection is procedural coincidence the text does not attribute to God; tagging it would over-read providence into the narrator's silence.
## Acts 26

**Existing tags (book doc):** `sharing-your-faith`; `repentance`; `salvation`; `resurrection`; `dreams-and-visions`; `obedience-to-the-word`; `gentile-inclusion`; `giving-an-answer`

**Applied-tag deltas:** No changes — chapter at the hard ceiling of 8, all incumbents clearing the bar: KEEP `sharing-your-faith` — “I stand to this day testifying both to small and great” (26:22), “might become such as I am, except for these bonds.” (26:29); KEEP `repentance` — “that they should repent and turn to God, doing works worthy of repentance.” (26:20); KEEP `salvation` — “to open their eyes, that they may turn from darkness to light and from the power of Satan to God, that they may receive remission of sins” (26:18); KEEP `resurrection` — “Why is it judged incredible with you if God does raise the dead?” (26:8), “by the resurrection of the dead, he would be first to proclaim light” (26:23); KEEP `dreams-and-visions` — the light “brighter than the sun” and the voice (26:13-15), “I was not disobedient to the heavenly vision” (26:19); KEEP `obedience-to-the-word` — the same 26:19-20 hearing-answered-by-doing; KEEP `gentile-inclusion` — “to the Gentiles, to whom I send you” (26:17), light “both to these people and to the Gentiles.” (26:23); KEEP `giving-an-answer` — “boldly declare words of truth and reasonableness.” (26:25; the pack's own anchor), “this has not been done in a corner.” (26:26).

**Anchor-extension candidates:**
- `messianic-prophecy` | Acts 26:22-23 | “saying nothing but what the prophets and Moses said would happen, how the Christ must suffer” | low-mid weight (compact prophets-foretold-the-suffering-Christ claim; companion to the 3:18 candidate).

**Lexicon candidates:**
- `salvation` | the 26:18 commission phrases | queries: "turn from darkness to light"; "from the power of satan to god".
- Alias-class note (Layer-2): "kick against the goads meaning" / "hard to kick against the pricks" (KJV wording) target Acts 26:14 — “It is hard for you to kick against the goads.” No concept owns the phrase; QR-6 alias candidate mapping to the verse, flagged for the alias-mining loop.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 HIT (pre-existing); NOT subdivided in the book doc — still marked for the per-verse refinement pass on the ceiling criterion.

**Decisions record:**
- Supplementary note for corpus-blocked row 40 (`gentile-inclusion`): 26:17-18, 23 quoted above recorded as supporting evidence (the commission's explicit Gentile reach); primary evidence remains chs. 10–11/15.
- `messianic-prophecy` considered as a display tag for 26:22-23 and NOT added: two verses inside the defense at ceiling; routed engine-side as anchor-extension.
- `satan` considered for 26:18 (“from the power of Satan to God”) and NOT added: one clause; thin-single-verse.
- `suffering-for-christ` considered for 26:21 (“the Jews seized me in the temple and tried to kill me”) and NOT added: one retrospective verse at ceiling; the chapter's suffering material is carried narratively in chs. 21–23 where it is tagged.
## Acts 27 (subdivided: 27:1–12 / 27:13–26 / 27:27–44)

**Existing tags (book doc):** `trust-in-god`; `fear-not`; `gods-protection`

**Applied-tag deltas:**
- ADD `thanksgiving` — thanks given publicly at the story's turning point: “he gave thanks to God in the presence of all; then he broke it and began to eat. Then they all cheered up” (27:35-36) — gratitude enacted in front of 276 despairing pagans, in the middle of the storm; a lean add on a lean chapter, register distinct from `trust-in-god`'s believing.
- KEEP `trust-in-god` — “For I believe God, that it will be just as it has been spoken to me.” (27:25); KEEP `fear-not` — “Don’t be afraid, Paul. You must stand before Caesar.” (27:24); KEEP `gods-protection` — “God has granted you all those who sail with you.” (27:24), “not a hair will perish from any of your heads.” (27:34), “So they all escaped safely to the land.” (27:44).

**Anchor-extension candidates:**
- `trust-in-god` | Acts 27:25 | “For I believe God, that it will be just as it has been spoken to me.” | mid weight (the pack has no Gospels/Acts anchor; faith spoken into a hopeless storm).
- `thanksgiving` | Acts 27:35 | “he gave thanks to God in the presence of all” | low weight (pack has no Gospels/Acts anchor).

**Lexicon candidates:**
- `gods-protection` | shipwreck phrasings | queries: "paul's shipwreck"; "god protected paul in the storm".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 4 tags after the add — under soft cap; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- `angels` considered for 27:23-24 (“there stood by me this night an angel, belonging to the God whose I am and whom I serve”) and NOT added: one angelic word inside the speech, already carried verbatim by `fear-not` and `gods-protection`; thin, broad-duplicating.
- `hope-in-despair` considered for 27:20 (“all hope that we would be saved was now taken away”) and NOT added: the despair is situational (a storm), not the pack's personal-crisis register; forcing it would stretch the pastoral id.
- `thanksgiving` add note: presence is one enacted scene (27:35-36); admitted above the thin line because the act is public, pivotal, and the chapter's mood turns on it — reversible call for Jesse.
## Acts 28 (subdivided: 28:1–10 / 28:11–15 / 28:16–31)

**Existing tags (book doc):** `hospitality`; `pastoral-prayer-for-healing`; `gods-protection`; `sharing-your-faith`

**Applied-tag deltas:**
- ADD `hardness-of-heart` — the chapter's verdict on divided unbelief is Isaiah's callous-heart oracle, quoted at length: “For this people’s heart has grown callous. Their ears are dull of hearing. Their eyes they have closed. Lest they should see with their eyes, hear with their ears, understand with their heart, and would turn again, then I would heal them.” (28:26-27).
- ADD `boldness-in-witness` — the pack's own Ac 28:31 anchor and the book's deliberate last word: “preaching God’s Kingdom and teaching the things concerning the Lord Jesus Christ with all boldness, without hindrance.” (28:31), with the all-day persuading behind it (28:23).
- KEEP `hospitality` — “The natives showed us uncommon kindness” (28:2), Publius “received us and courteously entertained us for three days.” (28:7), the Puteoli brothers' seven days (28:14); KEEP `pastoral-prayer-for-healing` — “Paul entered in to him, prayed, and laying his hands on him, healed him.” (28:8), the island's sick “came and were cured.” (28:9); KEEP `gods-protection` — the viper shaken off: “he shook off the creature into the fire, and wasn’t harmed.” (28:5); KEEP `sharing-your-faith` — “testifying about God’s Kingdom, and persuading them concerning Jesus… from morning until evening.” (28:23), two years receiving all comers (28:30-31).

**Anchor-extension candidates:**
- `hardness-of-heart` | Acts 28:26-27 | “For this people’s heart has grown callous.” | mid weight (the pack's only anchor is Mk 6:52; this is the NT's fullest citation of the Isaiah 6 hardening oracle outside the Gospels).
- `hospitality` | Acts 28:2, 7 | “The natives showed us uncommon kindness” | low weight (pagan hospitality commended by the narrator; pack's anchors are Gospels-only).

**Lexicon candidates:**
- `hardness-of-heart` | the Isaiah-oracle phrasings | queries: "hearing you will hear but never understand"; "calloused heart in the bible".

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 6 tags after adds — soft cap 6 hit exactly; book-doc subdivision (3 sections) — mark for the per-verse refinement pass.

**Decisions record:**
- Supplementary note for corpus-blocked row 40 (`gentile-inclusion`): 28:28 — “the salvation of God is sent to the nations, and they will listen.” — recorded as the book's closing statement of the row's theme; single verse here, so noted as supporting (not primary) evidence, and NOT tagged (thin-single-verse; `sharing-your-faith` and `hardness-of-heart` carry the scene).
- `thanksgiving` considered for 28:15 (“he thanked God and took courage.”) and NOT added: one clause; thin-single-verse.
- `kingdom-of-heaven` considered for 28:23, 31 (“testifying about God’s Kingdom”) and NOT added: the Kingdom is named as the preaching's topic, not taught in-chapter — same call as ch. 1.
- `signs-and-wonders` considered for 28:3-9 (viper, healings) and NOT added: the register here is protection-and-healing, already carried by `gods-protection` and `pastoral-prayer-for-healing`; broad-duplicating.
---

# Survival audit (CONVENTIONS §9) — final

- Audited: 2026-08-26, after the Acts 28 append, by full re-read of this ledger.
- Result: **PASS.** All 28 chapter entries present, in order Acts 1 → Acts 28, each carrying all 8 legend sections (28/28 counts verified for Existing tags / Applied-tag deltas / Anchor-extension candidates / Lexicon candidates / New-concept candidates / Decline-overturn proposals / Ceiling-refinement flags / Decisions record). Header block intact and byte-stable across all appends (file size grew monotonically at every verified append; no foreign or interleaved content found; zero non-Acts chapter headings).
- Write discipline: every chapter entry was appended atomically from a worker-unique staging file (`acts-entry.md`) after a shared-scratchpad collision with a sibling worker's `entry.md` was detected and avoided at the Acts 4 step; no clobbered bytes reached this ledger (post-append verification passed at every step).
- Sweep totals (for the coordinator's roll-up):
  - Applied-tag deltas: **23 ADD / 161 KEEP / 0 DROP** across 28 chapters. Adds by id: slander-and-false-accusation ×4 (chs 6, 21, 24, 25); occult-and-divination ×2 (13, 19); idolatry ×2 (7, 19); boldness-in-witness ×2 (9, 28); messianic-prophecy (3); care-for-widows (6); ascension (7); the-house-of-god (7); favoritism (10); clean-and-unclean (11); giving-an-answer (18); receiving-correction (18); deliverance-from-demons (19); watchman-and-warning (20); resurrection-of-the-dead (23); thanksgiving (27); hardness-of-heart (28).
  - Anchor-extension candidates: **58**.
  - Lexicon candidates: **42** rows (including 2 Layer-2 alias-class flags: "damascus road experience" → Acts 9:1-19; "kick against the goads" → Acts 26:14; plus the KJV "silver and gold have i none" famous-phrase note on ch. 3).
  - New-concept candidates: **0**. Decline-overturn proposals: **0** (the three Acts lexicon leads — perseverance-in-mission, breaking-bread, early-church-community — stay OPEN with evidence logged on chs 2, 6, 9, 11, 14, 20).
  - Ceiling-flagged (hard ceiling 8 hit): **13 chapters** — 2, 4, 7, 8, 10, 13, 14, 15, 16, 17, 19, 20, 26. Book-doc-subdivision refinement flags: all chapters except 3 and 26 (26 is flagged on the ceiling criterion; 3 carries no flag).
  - Corpus-blocked routes: row 40 `gentile-inclusion` (primary evidence chs 10, 11, 15; supplementary 22, 26, 28); row 43 `legalism` (ch 15); row 22 death-and-burial minor supplementary citation (Acts 8:2).
  - Standing note for curation: acts.md spells the healing pack `pastoral-prayer-for-healing`; the engine index at e762d1c lists `prayer-for-healing` — flagged once (Acts 5 Decisions record).

---

# PASTORAL-ID ERRATUM (2026-08-26)

Delivery-pass audit of the 14 pastoral-* concept ids. The canonical ledger form is the
`pastoral-` prefixed filename stem; the unprefixed YAML ids are the wrong form.
Occurrences below are recorded append-only (no body edit); the canonical form governs
wherever the wrong form appears. The Acts 5 KEEP and the ch. 9 lexicon row already use
the canonical `pastoral-prayer-for-healing`; their parenthetical "(engine index spells
... / engine id ...)" annotations merely discuss the discrepancy and are not listed.
Line numbers refer to the file state as audited (pre-erratum).

1. Acts 15 entry (line 428, considered/not-added note): `sexual-purity`
   → canonical `pastoral-sexual-purity`.
2. Acts 16 entry (line 438, anchor-extension candidate): `hope-in-despair`
   → canonical `pastoral-hope-in-despair`.
3. Acts 27 entry (line 733, considered/not-added note): `hope-in-despair`
   → canonical `pastoral-hope-in-despair`.

Total: 3 occurrences. Canonical form governs.
