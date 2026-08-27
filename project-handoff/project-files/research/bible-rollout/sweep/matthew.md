# Matthew sweep ledger — Layer-3 tag sweep (Gospels+Acts thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + 161 §11.1 adopted
  display ids (CONVENTIONS §11, binding 2026-08-25)
- Book: Matthew (28 chapters)
- WEB text source: full-Bible fixture web-subset.json at commit 87fd68c (schema
  verse-array-subset/1, sourceSha256 b6f55cc7…), extracted read-only to the scratchpad as
  web-full.json; every quote below is word-for-word from
  `python3 …/scratchpad/webchap.py Matthew <ch>` output for the chapter being tagged.
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/matthew.md
    (final, critic-approved 2026-08-23; tag-application + apologetics passes 2026-08-25)
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/declines-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/corpus-blocked.md
  - WEB access memo: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/web-text-access.md
- Standing rulings applied: Jesse 2026-08-25 ruling 1(a) — the Sadducee-dispute parallels
  harmonize to the Matthew reading; Matt 22's tags are the reference side (recorded in the
  Matt 22 entry). Corpus-blocked routes for this book: virgin-birth (Matt 1, roster row 49),
  blasphemy-against-the-spirit (Matt 12, row 11), stewardship (Matt 25, row 16).
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Note on pastoral ids: the engine filenames carry the pastoral- prefix
  (pastoral-sexual-purity, pastoral-prayer-for-healing, pastoral-marriage-divorce-teaching,
  pastoral-betrayal-and-marriage-crisis, …); this ledger uses those exact prefixed ids,
  matching the book doc.
- Legend — each chapter entry carries these sections, in order:
  1. "## Matthew <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## Matthew 1 (subdivided: 1:1–17; 1:18–25)
**Existing tags (book doc):** `incarnation`; `salvation`; `dreams-and-visions`; `obedience-to-the-word`; `angels`
**Applied-tag deltas:**
- KEEP all five — re-verified word-for-word against the WEB chapter: `incarnation` — "that which is conceived in her is of the Holy Spirit" (1:20) with "God with us" (1:23); `salvation` — "You shall name him Jesus, for it is he who shall save his people from their sins." (1:21); `dreams-and-visions` — "an angel of the Lord appeared to him in a dream" (1:20); `obedience-to-the-word` — "Joseph arose from his sleep, and did as the angel of the Lord commanded him" (1:24); `angels` — the same 1:20–24 scene.
- ADD `messianic-prophecy` — the chapter's whole architecture is messianic credential and fulfillment, not a touched topic: the opening "The book of the genealogy of Jesus Christ, the son of David, the son of Abraham." (1:1), the three-fourteens shape ending "to the Christ" (1:17), and Matthew's first fulfillment citation, "Now all this has happened that it might be fulfilled which was spoken by the Lord through the prophet" (1:22). No read-back: the chapter itself cites the prophet. Chapter lands at 6 (soft cap, every tag clears the bar).
**Anchor-extension candidates:**
- messianic-prophecy | Matthew 1:22-23 | "Now all this has happened that it might be fulfilled which was spoken by the Lord through the prophet" (1:22) | 0.6 — the pack currently has no Gospel anchors; Matthew's fulfillment citations are its natural NT side.
**Lexicon candidates:**
- messianic-prophecy | "why is jesus called the son of david"; "jesus son of david meaning" (book-doc motif 5; 1:1 is the title's first use)
**New-concept candidates:** None — the virgin-conception theme is the corpus-blocked virgin-birth row; routed below, not duplicated.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (1:1–17 / 1:18–25) → listed for the per-verse refinement pass; tag count 6 of 8 after delta.
**Decisions record:**
- Corpus-blocked ROUTE (roster row 49, virgin-birth): Matt 1:18–25 is the row's Matthew half — "Behold, the virgin shall be with child, and shall give birth to a son. They shall call his name Immanuel" (1:23); "before they came together, she was found pregnant by the Holy Spirit" (1:18). Recorded as evidence FOR the blocked row; no pack proposal, no duplicate gap row.
- Noted, no action: presence-of-god's lexicon already carries "immanuel god with us", so incarnation and presence-of-god both serve Immanuel queries — an engine-side dedupe question for curation, not a display issue.

## Matthew 2
**Existing tags (book doc):** `worship`; `gods-protection`; `guidance`; `dreams-and-visions`; `angels`
**Applied-tag deltas:**
- KEEP all five — re-verified: `worship` — "they fell down and worshiped him. Opening their treasures, they offered to him gifts: gold, frankincense, and myrrh." (2:11, with 2:2); `gods-protection` — "flee into Egypt, and stay there until I tell you, for Herod will seek the young child to destroy him." (2:13, and the safe returns 2:19–22); `guidance` — "the star, which they saw in the east, went before them until it came and stood over where the young child was" (2:9, plus dream-directed turns 2:12, 22); `dreams-and-visions` — four dreams steer the chapter (2:12, 13, 19, 22); `angels` — "an angel of the Lord appeared to Joseph in a dream" (2:13, 19).
- ADD `messianic-prophecy` — four prophecy citations structure the chapter: the scribes answer where "the Christ would be born" from the prophet — "'You Bethlehem, land of Judah, are in no way least among the princes of Judah; for out of you shall come a governor who shall shepherd my people, Israel.'" (2:5–6); "that it might be fulfilled which was spoken by the Lord through the prophet, saying, 'Out of Egypt I called my son.'" (2:15); Jeremiah's Ramah word (2:17–18); "he will be called a Nazarene" (2:23). Honest substantial presence — fulfillment is the chapter's stated frame. Chapter lands at 6 (soft cap, every tag clears the bar).
**Anchor-extension candidates:**
- messianic-prophecy | Matthew 2:5-6 | "for this is written through the prophet, 'You Bethlehem, land of Judah, are in no way least among the princes of Judah'" (2:5–6) | 0.6 — the Bethlehem-birthplace prophecy is a heavy apologetics query landing; pack has no Gospel anchors.
**Lexicon candidates:**
- messianic-prophecy | "prophecy that jesus would be born in bethlehem"; "out of egypt i called my son meaning"
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** none (not subdivided in book doc; 6 of 8 after delta).
**Decisions record:**
- `pastoral-grief-and-loss` NOT re-added on 2:18 (drafter A item 6 drop stands): Rachel's weeping is a quoted prophecy inside the fulfillment frame, not a grief-teaching unit; no new textual evidence to reverse the recorded call.
- "Star of Bethlehem" queries left to corpus word search ("we saw his star in the east", 2:2) — no lexicon row proposed; a row with no measured gap is not added.

## Matthew 3 (subdivided: 3:1–12; 3:13–17)
**Existing tags (book doc):** `repentance`; `baptism`; `divine-judgment`; `trinity`
**Applied-tag deltas:**
- KEEP all four — re-verified: `repentance` — "Repent, for the Kingdom of Heaven is at hand!" (3:2) and "Therefore produce fruit worthy of repentance!" (3:8); `baptism` — "They were baptized by him in the Jordan, confessing their sins." (3:6) and Jesus baptized "to fulfill all righteousness" (3:15); `divine-judgment` — "who warned you to flee from the wrath to come?" (3:7), "the ax lies at the root of the trees" (3:10), "the chaff he will burn up with unquenchable fire" (3:12); `trinity` — the Son baptized, "He saw the Spirit of God descending as a dove", and "a voice out of the heavens said, 'This is my beloved Son, with whom I am well pleased.'" (3:16–17).
- ADD `witness-testimony` — John's role in 3:1–12 is testimony to the coming one, the pack's own register (its lexicon carries "voice of one crying in the wilderness" and "testimony of john the baptist"; its anchors are the Johannine parallel, Jn 1:19–23): "The voice of one crying in the wilderness, make the way of the Lord ready!" (3:3), pointing past himself — "he who comes after me is mightier than I, whose sandals I am not worthy to carry" (3:11).
- ADD `holy-spirit` — two distinct in-chapter moments carry the pack's substance, not one clause: the Spirit-baptism promise, "He will baptize you in the Holy Spirit." (3:11 — the pack's lexicon phrase "baptized in the holy spirit"), and the descent, "He saw the Spirit of God descending as a dove, and coming on him." (3:16 — the pack already anchors the Johannine parallel Jn 1:32–33). Chapter lands at 6 (soft cap, every tag clears the bar).
**Anchor-extension candidates:**
- baptism | Matthew 3:13-17 | "Then Jesus came from Galilee to the Jordan to John, to be baptized by him." (3:13) | 0.7 — pack anchors only Mt 28:19 and Ac 2:38; Jesus' own baptism is the top "baptism of jesus" landing.
- trinity | Matthew 3:16-17 | "He saw the Spirit of God descending as a dove... 'This is my beloved Son, with whom I am well pleased.'" | 0.65 — the classic three-persons scene; pack anchors Mt 28:19 but not this.
- repentance | Matthew 3:8 | "Therefore produce fruit worthy of repentance!" | 0.6 — "fruits of repentance" queries.
- witness-testimony | Matthew 3:3 | "The voice of one crying in the wilderness, make the way of the Lord ready!" | 0.5 — the lexicon phrase's Matthean landing.
**Lexicon candidates:**
- baptism | "why was jesus baptized"; "baptism of jesus"
- repentance | "fruit in keeping with repentance"; "fruits of repentance"
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (3:1–12 / 3:13–17) → listed for the per-verse refinement pass; 6 of 8 after delta.
**Decisions record:**
- `kingdom-of-heaven` remains skipped on 3:2 (tag-application pass skip stands): one announcement verse; the substance lives on chs. 4, 6, 13.
- `messianic-prophecy` considered for 3:3 (Isaiah citation) and yielded as thin-single-verse — carried instead by the `witness-testimony` add, whose register the verse actually serves in-chapter.

## Matthew 4 (subdivided: 4:1–11; 4:12–17; 4:18–22; 4:23–25)
**Existing tags (book doc):** `resisting-the-devil`; `temptation`; `discipleship`; `kingdom-of-heaven`
**Applied-tag deltas:** No changes — all four re-verified and kept: `resisting-the-devil` — three temptations met with "It is written", ending "Get behind me, Satan!" (4:10) and "Then the devil left him" (4:11); `temptation` — "led up by the Spirit into the wilderness to be tempted by the devil" (4:1–11); `discipleship` — "Come after me, and I will make you fishers for men." and "They immediately left their nets and followed him." (4:19–20, 21–22); `kingdom-of-heaven` — "Repent! For the Kingdom of Heaven is at hand." and "preaching the Good News of the Kingdom" (4:17, 23). No further candidate clears the bar without duplicating a sitting register (see Decisions).
**Anchor-extension candidates:**
- resisting-the-devil | Matthew 4:1-11 | "Then Jesus said to him, 'Get behind me, Satan! For it is written, "You shall worship the Lord your God, and you shall serve him only."' Then the devil left him" (4:10–11) | 0.7 — the pack currently has NO Gospel/Acts anchors, yet Jesus' wilderness resistance is the classic resist-the-devil passage.
- discipleship | Matthew 4:18-22 | "Come after me, and I will make you fishers for men." (4:19) | 0.55 — pack anchors the Mark parallel (Mk 1:16-18) and carries "fishers of men" in its lexicon; the Matthean landing is unanchored.
- satan | Matthew 4:1-11 | "The tempter came and said to him, 'If you are the Son of God, command that these stones become bread.'" (4:3) | 0.5 — pack anchors the Mark parallel (Mk 1:13) and Mt 16:23; the full Matthean temptation account shows the devil's methods.
- messianic-prophecy | Matthew 4:14-16 | "the people who sat in darkness saw a great light" (4:16) | 0.45 — Isaiah's Galilee-light citation.
**Lexicon candidates:**
- satan | "get behind me satan meaning"; "the tempter in the bible" (landings: Mt 4:3, 10 and the pack's existing Mt 16:23 anchor)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 4 of 8, no cap pressure.
**Decisions record:**
- `satan` considered as a display tag (the devil is the pericope's active agent) and yielded as broad-duplicating-specific: `resisting-the-devil` + `temptation` already carry 4:1–11 as two distinct registers per the adopted list's register split; a third tag on the same pericope adds no distinct register. Survives above as an anchor-extension candidate.
- `messianic-prophecy` considered for 4:14–16 and yielded as a thin citation unit (one fulfillment citation; the chapter does not dwell on fulfillment the way chs. 1–2 do). Survives as an anchor-extension candidate.
- Prior skips re-confirmed, no new evidence: `fasting` on 4:2 (one narrative clause), `angels` on 4:6, 11 (devil's quotation; closing note), `repentance` on 4:17 (summary line — drafter A item 5).
- "man shall not live by bread alone" left to corpus word search (verbatim in 4:4); no lexicon row proposed.

## Matthew 5
**Existing tags (book doc):** `blessing`; `loving-others`; `harmony-with-others`; `pastoral-sexual-purity`; `pastoral-marriage-divorce-teaching`; `honesty`; `oaths-and-vows`; `power-of-gods-word` — 8 tags, the HARD CEILING (CONVENTIONS §11.6), recorded as such by the book doc's apologetics pass.
**Applied-tag deltas:** No changes — all eight re-verified against the WEB chapter (Beatitudes 5:3–11; "love your enemies, bless those who curse you" 5:44; "Blessed are the peacemakers" 5:9 with "First be reconciled to your brother" 5:24; "everyone who gazes at a woman to lust after her" 5:28; "except for the cause of sexual immorality" 5:32; "let your 'Yes' be 'Yes' and your 'No' be 'No.'" 5:37; "don't swear at all" 5:34; "not even one smallest letter or one tiny pen stroke shall in any way pass away from the law" 5:18). The chapter is at the hard ceiling; every additional honest candidate yields (see Decisions) and is preserved as engine-anchor material instead.
**Anchor-extension candidates:**
- vengeance | Matthew 5:38-42 | "whoever strikes you on your right cheek, turn to him the other also" (5:39) | widen the existing Mt 5:38-39 anchor to 5:38-42 — the coat, the second mile, and giving to the asker are the same teaching unit (weight kept).
- suffering-for-christ | Matthew 5:10-12 | "Blessed are you when people reproach you, persecute you, and say all kinds of evil against you falsely, for my sake." (5:11) | widen the existing Mt 5:10 anchor to 5:10-12 (weight kept).
- honesty | Matthew 5:33-37 | "But let your 'Yes' be 'Yes' and your 'No' be 'No.' Whatever is more than these is of the evil one." (5:37) | 0.55 — the pack has no Gospel/Acts anchors.
**Lexicon candidates:**
- blessing | "the beatitudes"; "blessed are the meek"; "blessed are the peacemakers" — heavy queries with no lexicon home; note the WEB reads "Blessed are the gentle" (5:5), so "blessed are the meek" is exactly the alternate-wording class Layer 2 exists for.
- vengeance | "turn the other cheek"; "an eye for an eye meaning"
- faith-and-works | "let your light shine before men" (5:16 is already the pack's anchor; the phrase is absent from its lexicon)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** HARD CEILING 8 → top-priority chapter for the per-verse refinement pass (the §3.1 vehicle by which yielded tags survive as exact-range anchors). Not subdivided in the book doc (one sermon).
**Decisions record:**
- Ceiling yields — candidates that individually clear the presence bar but cannot be added at 8, each already engine-anchored in this chapter so nothing is lost at the engine layer: `vengeance` (5:38–42; pack anchors 5:38-39), `hell` (Gehenna three times — "in danger of the fire of Gehenna" 5:22, "cast into Gehenna" 5:29, 30; pack anchors 5:22), `suffering-for-christ` (5:10–12; pack anchors 5:10), `family-reconciliation` (5:23–24; pack anchors 5:23-24).
- Thin-single-verse yields (below the substantial-presence bar regardless of the ceiling; each is nonetheless a live engine anchor where noted): `mercy` (5:7, anchored), `hunger-for-god` (5:6, anchored), `slander-and-false-accusation` (5:11, anchored), `generosity` (5:42, anchored), `faith-and-works` (5:16, anchored), `god-of-all-comfort` / `near-to-the-brokenhearted` (5:4, both anchored), `kingdom-of-heaven` (scattered clauses — tag-application pass skip stands).
- "Salt of the earth" / disciples-as-light queries left to corpus word search; `light-and-darkness` NOT proposed here — its register is Jesus as the light (Jn 8:12), not disciples as light; conflating them would mislabel the reason.

## Matthew 6
**Existing tags (book doc):** `prayer`; `pleasing-god-not-people`; `gods-provision`; `forgiving-others`; `trust-in-god`; `heavenly-reward`; `fasting`; `kingdom-of-heaven` — 8 tags, the HARD CEILING, recorded as such by the book doc's tag-application pass.
**Applied-tag deltas:** No changes — all eight re-verified against the WEB chapter ("Pray like this: 'Our Father in heaven, may your name be kept holy.'" 6:9; "don't do your charitable giving before men, to be seen by them" 6:1; "Your heavenly Father feeds them. Aren't you of much more value than they?" 6:26; "if you forgive men their trespasses, your heavenly Father will also forgive you" 6:14; "your Father knows what things you need before you ask him" 6:8; "lay up for yourselves treasures in heaven" 6:20; "when you fast, anoint your head and wash your face" 6:17; "seek first God's Kingdom and his righteousness" 6:33). Chapter at the hard ceiling; honest additional candidates yield (see Decisions) and are preserved as engine-anchor material.
**Anchor-extension candidates:**
- peace-of-god | Matthew 6:25-34 | "don't be anxious for tomorrow, for tomorrow will be anxious for itself" (6:34) | widen the existing Mt 6:25-27 anchor to 6:25-34 — the lilies (6:28–30) and the don't-be-anxious refrain (6:31, 34) are one anxiety teaching unit (weight kept).
- the-name-of-god | Matthew 6:9 | "Our Father in heaven, may your name be kept holy." | 0.55 — the pack has no Gospel/Acts anchors, yet its lexicon carries "hallowed be your name", whose landing is this verse.
**Lexicon candidates:**
- peace-of-god | "do not worry about tomorrow"; "consider the lilies" — the WEB reads "don't be anxious" / "Consider the lilies of the field" (6:28, 34); NIV-flavored "do not worry" is the alternate-wording class Layer 2 targets.
- contentment | "you cannot serve god and money" — WEB reads "You can't serve both God and Mammon." (6:24, already the pack's anchor); "god and money" is the modern-translation wording.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** HARD CEILING 8 → priority chapter for the per-verse refinement pass. Not subdivided in the book doc.
**Decisions record:**
- Ceiling yields — clear the bar individually, cannot be added at 8, both already engine-anchored in this chapter: `contentment` (6:19–24 — treasures, two masters, "You can't serve both God and Mammon."; pack anchors Mt 6:24 and 6:19-21) and `peace-of-god` (6:25–34; pack anchors Mt 6:25-27, widening proposed above).
- Thin-single-verse yield: `putting-god-first` (6:33 — one verse, already the pack's anchor; the display substance is carried by `kingdom-of-heaven`'s justification quoting the same verse).
- Prior skips re-confirmed, no new evidence: `generosity` on 6:1–4 (drafter A item 10 drop — the unit teaches how/before whom to give, carried by `pleasing-god-not-people`), `empty-worship` on 6:2, 5, 16 (same-verse duplication with `pleasing-god-not-people`), `temptation` on 6:13, `remembered-anxious-for-nothing` (verse-memory id keyed to Philippians 4:6 — drafter A item 12).

## Matthew 7
**Existing tags (book doc):** `prayer`; `obedience-to-the-word`; `building-on-the-rock`; `self-deception`; `judging-others`; `false-prophets`; `jesus-the-only-way`
**Applied-tag deltas:** No changes — all seven re-verified ("Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you." 7:7; "he who does the will of my Father" 7:21 with "hears these words of mine and does them" 7:24; "built his house on the rock" 7:24–25; "First remove the beam out of your own eye" 7:5 and "I never knew you" 7:23; "Don't judge, so that you won't be judged." 7:1; "Beware of false prophets, who come to you in sheep's clothing" 7:15; "Enter in by the narrow gate" 7:13–14). No remaining candidate clears the substantial-presence bar (see Decisions).
**Anchor-extension candidates:**
- prayer | Matthew 7:7-11 | "how much more will your Father who is in heaven give good things to those who ask him!" (7:11) | widen the existing Mt 7:7 anchor to 7:7-11 — the good-gifts argument is the same asking unit (weight kept).
- false-prophets | Matthew 7:15-20 | "Therefore by their fruits you will know them." (7:20) | widen the existing Mt 7:15-16 anchor to 7:15-20 — the good-tree/corrupt-tree test runs to v. 20 (weight kept).
**Lexicon candidates:**
- prayer | "ask seek knock" — the common shorthand for 7:7; absent from the pack's lexicon.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** none (7 of 8 — above the soft cap, below the ceiling, every tag clears the bar per the book doc's passes; not subdivided).
**Decisions record:**
- `loving-others` considered for the golden rule (7:12 — the pack's own anchor and lexicon: "the golden rule") and yielded as thin-single-verse; the engine anchor already serves the query class.
- `divine-judgment` considered (7:19 "cut down and thrown into the fire"; 7:22–23 "in that day") and yielded — the judgment material is scattered clauses whose display substance the sitting `self-deception` ("I never knew you") and `jesus-the-only-way` (destruction/life two-ways) already carry.
- "Pearls before swine" queries (7:6): WEB reads "pigs", searchers type "swine" — no lexicon row proposed because the cross-translation token index (KJV vocabulary → WEB verses) is the mechanism that owns this class; noted for Layer-2 verification rather than a concept lexicon.

## Matthew 8 (subdivided: 8:1–17; 8:18–22; 8:23–27; 8:28–34)
**Existing tags (book doc):** `faith`; `pastoral-prayer-for-healing`; `fear-not`; `deity-of-christ`; `deliverance-from-demons`; `discipleship`
**Applied-tag deltas:** No changes — all six re-verified ("Just say the word, and my servant will be healed." 8:8 with "I haven't found so great a faith, not even in Israel." 8:10; "Lord, if you want to, you can make me clean." 8:2–3 and the evening healings 8:16; "Why are you fearful, O you of little faith?" 8:26; "even the wind and the sea obey him" 8:27 and "Jesus, Son of God" 8:29; "He cast out the spirits with a word" 8:16 and the Gergesene deliverance 8:28–32; "the Son of Man has nowhere to lay his head" 8:20 with "leave the dead to bury their own dead" 8:22). Chapter at the soft cap of 6; remaining candidates are thin (see Decisions).
**Anchor-extension candidates:**
- fear-not | Matthew 8:23-27 | "Why are you fearful, O you of little faith?" (8:26) | 0.5 — the pack has NO Gospel/Acts anchors; the stilled storm is a primary fear-comfort landing.
- deity-of-christ | Matthew 8:26-27 | "What kind of man is this, that even the wind and the sea obey him?" (8:27) | 0.5 — the pack's synoptic side is thin (Mt 26:63-64 only).
- hell | Matthew 8:12 | "thrown out into the outer darkness. There will be weeping and gnashing of teeth." | 0.45 — both phrases are already in the pack's lexicon ("outer darkness", "weeping and gnashing of teeth"); this is their first Matthean landing.
- messianic-prophecy | Matthew 8:17 | "He took our infirmities and bore our diseases." | 0.45 — the Isaiah 53 healing citation.
**Lexicon candidates:**
- fear-not | "jesus calms the storm"; "god in the storms of life" (book-doc motif 8)
- faith | "lord i am not worthy"; "the centurion's faith"
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 6 of 8.
**Decisions record:**
- `hell` considered for 8:12 and yielded as thin-single-verse (one warning line inside the centurion pericope); survives above as an anchor-extension candidate.
- `nations-and-peoples` considered for 8:11 ("many will come from the east and the west, and will sit down with Abraham, Isaac, and Jacob in the Kingdom of Heaven") and yielded as thin-single-verse; noted as raw evidence for the pack's east-and-west register, no proposal.
- `kingdom-of-heaven` considered (8:11–12 "children of the Kingdom") and yielded — scattered clauses, not the chapter's teaching substance.

## Matthew 9 (subdivided: 9:1–8; 9:9–17; 9:18–34; 9:35–38)
**Existing tags (book doc):** `forgiveness-of-sins`; `faith`; `pastoral-prayer-for-healing`; `sharing-your-faith`; `mercy`
**Applied-tag deltas:**
- KEEP all five — re-verified: `forgiveness-of-sins` — "Son, cheer up! Your sins are forgiven you." (9:2) and "the Son of Man has authority on earth to forgive sins" (9:6); `faith` — "Jesus, seeing their faith" (9:2), "Your faith has made you well." (9:22), "According to your faith be it done to you." (9:29); `pastoral-prayer-for-healing` — the ruler's plea, the woman's touch, the blind men's cry (9:18–31); `sharing-your-faith` — "The harvest indeed is plentiful, but the laborers are few. Pray therefore that the Lord of the harvest will send out laborers into his harvest." (9:37–38); `mercy` — "I desire mercy, and not sacrifice" (9:13) and "Have mercy on us, son of David!" (9:27).
- ADD `fasting` — 9:14–17 is a direct fasting-teaching unit the tag-application pass skipped ONLY for lack of a verified quote in range; the pinned full-Bible fixture now supplies it: "Why do we and the Pharisees fast often, but your disciples don't fast?" (9:14), answered "the days will come when the bridegroom will be taken away from them, and then they will fast." (9:15). Honest substantial presence: the unit teaches when fasting fits the bridegroom's story. Chapter lands at 6 (soft cap).
**Anchor-extension candidates:**
- mercy | Matthew 9:13 | "But you go and learn what this means: 'I desire mercy, and not sacrifice,'" | 0.6 — the phrase sits in the pack's lexicon but its landing verse is unanchored (pack anchors Lk 18:13, Lk 6:36, Mt 5:7).
- forgiveness-of-sins | Matthew 9:2-6 | "the Son of Man has authority on earth to forgive sins" (9:6) | 0.6 — the pack's only Gospels/Acts anchor today is Ac 13:38-39.
- sharing-your-faith | Matthew 9:37-38 | "The harvest indeed is plentiful, but the laborers are few." (9:37) | 0.55 — a missions staple, unanchored in the pack.
- fasting | Matthew 9:14-15 | "then they will fast" (9:15) | 0.5.
**Lexicon candidates:**
- sharing-your-faith | "the harvest is plentiful but the workers are few"; "pray for laborers for the harvest"
- mercy | "i desire mercy not sacrifice meaning" (book-doc motif 9)
- shepherds-and-the-flock | "sheep without a shepherd" (9:36 — "harassed and scattered, like sheep without a shepherd"; the phrase is absent from the pack's lexicon)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 6 of 8 after delta.
**Decisions record:**
- `fasting` ADD reverses a quote-availability skip, not a presence-bar skip — recorded per the tag-application pass's own "follow-up candidate if a verified quote is staged" pattern (its ch. 10 `the-breath-of-life` note); the verified source is the pinned full-Bible fixture at 87fd68c.
- Prior skips re-confirmed: `deliverance-from-demons` on 9:32–34 (thin, 2 verses — the book's tag sits on ch. 8), `discipleship` on 9:9 (single-verse call of Matthew).
- `shepherds-and-the-flock` considered for 9:36 and yielded as thin-single-verse; survives as the lexicon candidate above.
- `repentance` considered for 9:13 ("I came not to call the righteous, but sinners to repentance") and yielded as thin-single-verse inside the mercy unit; the quote already serves `mercy`'s justification.

## Matthew 10
**Existing tags (book doc):** `sharing-your-faith`; `suffering-for-christ`; `fear-not`; `providence`; `heavenly-reward`
**Applied-tag deltas:**
- KEEP all five — re-verified: `sharing-your-faith` — "As you go, preach, saying, 'The Kingdom of Heaven is at hand!'" (10:7) and "what you hear whispered in the ear, proclaim on the housetops" (10:27); `suffering-for-christ` — "they will deliver you up to councils, and in their synagogues they will scourge you" (10:17), "You will be hated by all men for my name's sake" (10:22), the cross taken up (10:38–39); `fear-not` — "Therefore don't be afraid of them" (10:26), "don't be afraid of those who kill the body" (10:28), "Therefore don't be afraid. You are of more value than many sparrows." (10:31); `providence` — "Not one of them falls to the ground apart from your Father's will" (10:29) and "the very hairs of your head are all numbered" (10:30); `heavenly-reward` — the prophet's and righteous man's reward and the cup of cold water that "will in no way lose his reward" (10:41–42).
- ADD `the-breath-of-life` — 10:28 is the pack's own engine anchor and the apologetics pass recorded it as "a follow-up candidate if a verified quote is staged"; the pinned full-Bible fixture now supplies it: "Don't be afraid of those who kill the body, but are not able to kill the soul. Rather, fear him who is able to destroy both soul and body in Gehenna." (10:28) — the body/soul distinction the pack documents. Chapter lands at 6 (soft cap).
**Anchor-extension candidates:**
- suffering-for-christ | Matthew 10:16-22 | "Behold, I send you out as sheep among wolves." (10:16); "You will be hated by all men for my name's sake" (10:22) | 0.6 — the pack's only Gospel anchor is Mt 5:10; this is Scripture's fullest persecution briefing.
- fear-not | Matthew 10:26-31 | "Therefore don't be afraid. You are of more value than many sparrows." (10:31) | 0.55 — pack has no Gospel/Acts anchors; three don't-be-afraid commands in six verses.
**Lexicon candidates:**
- suffering-for-christ | "sheep among wolves"; "hated for my name's sake"
- do-not-lose-heart | "endure to the end" (10:22 "he who endures to the end will be saved"; the §3.4 endurance disposition routes the keep-going register here — lexicon lead, not a new id)
- discipleship | "i did not come to bring peace but a sword" (10:34 — WEB "I didn't come to send peace, but a sword."; the query lands in the cost-of-discipleship unit 10:34–39 the pack already anchors at 10:37-39)
**New-concept candidates:** None — the 10:34–39 allegiance-division material is covered by `discipleship`'s cost register (pack anchors Mt 10:37-39); no separate id needed.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** none (not subdivided; 6 of 8 after delta).
**Decisions record:**
- `the-breath-of-life` ADD reverses a quote-availability skip only — presence was already affirmed by the apologetics pass ("genuine presence, but no quoted WEB span"); verified source: pinned full-Bible fixture at 87fd68c.
- `discipleship` display tag remains withheld (tag-application pass skip stands on its second ground: the cost verses 10:37–39 are carried by `suffering-for-christ` on the same span; the quote-availability half of that skip is now moot but the duplication half still holds).
- `holy-spirit` considered for 10:19–20 ("it is not you who speak, but the Spirit of your Father who speaks in you") and yielded as thin (2 verses inside the persecution briefing).
- `hell` considered for 10:28 ("destroy both soul and body in Gehenna") and yielded as same-verse duplication — the verse now serves `the-breath-of-life`, whose register (body and soul) is what the verse teaches.

## Matthew 11 (subdivided: 11:1–19; 11:20–24; 11:25–30)
**Existing tags (book doc):** `rest-for-the-weary`; `doubt`; `repentance`; `divine-judgment`; `humble-exaltation`; `gentleness-of-christ`
**Applied-tag deltas:** No changes — all six re-verified ("Come to me, all you who labor and are heavily burdened, and I will give you rest." 11:28 with "you will find rest for your souls" 11:29; "Are you he who comes, or should we look for another?" 11:3; "because they didn't repent" 11:20 and "they would have repented long ago in sackcloth and ashes" 11:21; "it will be more tolerable for Tyre and Sidon on the day of judgment than for you" 11:22 and "You, Capernaum... will go down to Hades" 11:23; "you hid these things from the wise and understanding, and revealed them to infants" 11:25; "I am gentle and humble in heart" 11:29). At the soft cap; further candidates yield (see Decisions).
**Anchor-extension candidates:**
- giving-an-answer | Matthew 11:2-6 | "Go and tell John the things which you hear and see: the blind receive their sight, the lame walk..." (11:4–5) | 0.5 — the pack already anchors the Lukan parallel (Lk 7:19-22); the Matthean landing is unanchored.
- humble-exaltation | Matthew 11:25 | "you hid these things from the wise and understanding, and revealed them to infants" | 0.5 — the pack's NT-narrative side is thin (Ac 20:19).
**Lexicon candidates:**
- rest-for-the-weary | "my yoke is easy and my burden is light" (11:30 — verbatim landing; absent from the pack's lexicon)
- doubt | "are you the one who is to come" (11:3 — WEB "Are you he who comes"; the modern-translation phrasing is the query form)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (3 sections) → listed for the per-verse refinement pass; 6 of 8.
**Decisions record:**
- `giving-an-answer` considered as a display tag for 11:2–6 (evidence offered to a questioner — the pack's register, and its Lk 7:19-22 anchor is this scene's parallel) and yielded as same-scene duplication: the sitting `doubt` tag's justification already carries "met not with rebuke but with evidence"; survives above as an anchor-extension candidate.
- `messianic-prophecy` considered for 11:10 ("Behold, I send my messenger before your face") and yielded as thin-single-verse — a citation about John, not a unit the chapter dwells on.
- 11:12 ("the Kingdom of Heaven suffers violence") noted as a curiosity verse; corpus word search serves it; no proposal.

## Matthew 12 (subdivided: 12:1–14; 12:15–21; 12:22–32; 12:33–37; 12:38–45; 12:46–50)
**Existing tags (book doc):** `sabbath-rest`; `divine-judgment`; `taming-the-tongue`; `obedience-to-the-word`; `blasphemy-against-the-spirit`; `gentleness-of-christ`
**Applied-tag deltas:**
- KEEP all six — re-verified: `sabbath-rest` — "For the Son of Man is Lord of the Sabbath." (12:8) and "Therefore it is lawful to do good on the Sabbath day." (12:12); `divine-judgment` — "every idle word that men speak, they will give account of it in the day of judgment" (12:36), Nineveh and the Queen of the South rising in the judgment (12:41–42); `taming-the-tongue` — "For out of the abundance of the heart, the mouth speaks." (12:34) and "by your words you will be justified, and by your words you will be condemned" (12:37); `obedience-to-the-word` — "whoever does the will of my Father who is in heaven, he is my brother, and sister, and mother" (12:50); `blasphemy-against-the-spirit` — "every sin and blasphemy will be forgiven men, but the blasphemy against the Spirit will not be forgiven men" (12:31); `gentleness-of-christ` — "He won't break a bruised reed. He won't quench a smoking flax" (12:20), kept to the servant-song fulfillment-citation register per the book doc's note.
- ADD `deliverance-from-demons` — the Beelzebul unit is a full teaching block the tag-application pass skipped ONLY for quote availability ("real teaching substance, but no verified quote covers it"); the pinned full-Bible fixture now supplies it: "Then one possessed by a demon, blind and mute, was brought to him; and he healed him" (12:22), "But if I by the Spirit of God cast out demons, then God's Kingdom has come upon you." (12:28), the strong man bound (12:29), and the returning unclean spirit (12:43–45). Chapter lands at 7.
**Anchor-extension candidates:**
- sabbath-rest | Matthew 12:1-13 | "For the Son of Man is Lord of the Sabbath." (12:8) | 0.6 — the pack's only Gospel anchor is Mk 2:27-28; Matthew's double Sabbath dispute is the fuller unit.
- deliverance-from-demons | Matthew 12:22-29 | "But if I by the Spirit of God cast out demons, then God's Kingdom has come upon you." (12:28) | 0.55 — pack anchors the Lukan parallel (Lk 11:14-22); the Matthean landing is unanchored.
- servant-of-the-lord | Matthew 12:18-21 | "Behold, my servant whom I have chosen, my beloved in whom my soul is well pleased." (12:18) | 0.55 — the pack ("suffering servant; servant songs") has NO Gospel/Acts anchors; this is the NT's longest servant-song citation, applied in-text to Jesus.
- taming-the-tongue | Matthew 12:33-37 | "For out of the abundance of the heart, the mouth speaks." (12:34) | widen the existing Mt 12:36 anchor to 12:33-37 (weight kept).
- resurrection | Matthew 12:40 | "so will the Son of Man be three days and three nights in the heart of the earth" | 0.45 — same predictive register as the pack's existing Jn 2:19 anchor ("sign of jonah" / "three days and three nights" queries); the display-tag decline (drafter A item 11) stands — this is engine-anchor material only.
**Lexicon candidates:**
- taming-the-tongue | "out of the abundance of the heart the mouth speaks" (12:34 — verbatim landing, absent from the pack's lexicon)
- resurrection | "sign of jonah meaning"; "three days and three nights" (with the register caution above)
**New-concept candidates:** None — "house divided against itself" queries are served by corpus word search (verbatim in 12:25); no concept home needed.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (6 sections — the book's most subdivided chapter) → listed for the per-verse refinement pass; 7 of 8 after delta.
**Decisions record:**
- Corpus-blocked ROUTE (roster row 11, blasphemy-against-the-spirit): Matt 12:31–32 is the row's Matthean text — "every sin and blasphemy will be forgiven men, but the blasphemy against the Spirit will not be forgiven men. Whoever speaks a word against the Son of Man, it will be forgiven him; but whoever speaks against the Holy Spirit, it will not be forgiven him, either in this age, or in that which is to come." Recorded as evidence FOR the blocked row (the pending `unpardonable-sin` fixture is the measured-gap record); the display tag stays, the engine pack waits on PR-β; no lexicon extension proposed while the row is blocked.
- `deliverance-from-demons` ADD reverses a quote-availability skip only; presence was affirmed in the skip note itself.
- `servant-of-the-lord` considered as a display tag for 12:18–21 and yielded as same-unit duplication — `gentleness-of-christ` already carries that citation on this chapter in the register the book doc's critic settled; survives above as an anchor-extension candidate.
- `mercy` on 12:7 remains skipped (tag-application pass: single verse inside the Sabbath dispute).

## Matthew 13 (subdivided: 13:1–23; 13:24–35; 13:36–43; 13:44–52; 13:53–58)
**Existing tags (book doc):** `obedience-to-the-word`; `divine-judgment`; `surrender-to-god`; `kingdom-of-heaven`; `angels`
**Applied-tag deltas:**
- KEEP all five — re-verified: `obedience-to-the-word` — "this is he who hears the word and understands it, who most certainly bears fruit" (13:23); `divine-judgment` — "and will cast them into the furnace of fire. There will be weeping and gnashing of teeth." (13:42, 49–50); `surrender-to-god` — "In his joy, he goes and sells all that he has and buys that field." (13:44, 45–46); `kingdom-of-heaven` — "To you it is given to know the mysteries of the Kingdom of Heaven" (13:11) and the parable chain; `angels` — "The harvest is the end of the age, and the reapers are angels." (13:39, 41, 49).
- ADD `hardness-of-heart` — the parable-purpose unit (13:10–17) turns on the calloused heart, quoted from Isaiah and applied in-text: "for this people's heart has grown callous, their ears are dull of hearing, and they have closed their eyes" (13:15), framed by "seeing they don't see, and hearing, they don't hear, neither do they understand" (13:13) — and the soils themselves are heart-response types. Honest substantial presence. Chapter lands at 6 (soft cap).
**Anchor-extension candidates:**
- hardness-of-heart | Matthew 13:13-15 | "for this people's heart has grown callous" (13:15) | 0.55 — the pack's only Gospel anchor is Mk 6:52.
- money-and-possessions | Matthew 13:22 | "the cares of this age and the deceitfulness of riches choke the word" | 0.45 — "deceitfulness of riches" is already in the pack's lexicon; the pack anchors the Mark parallel (Mk 4:19), not the Matthean landing.
**Lexicon candidates:**
- kingdom-of-heaven | "parable of the sower"; "parable of the wheat and the tares" — the WEB reads "darnel weeds" (13:25), so "tares"/"weeds" queries are the alternate-wording class Layer 2 targets.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (5 sections) → listed for the per-verse refinement pass; 6 of 8 after delta.
**Decisions record:**
- `hardness-of-heart` ADD is a sweep-new judgment (the id was adopted Theme E vocabulary but never weighed for this chapter in the application pass); recorded as a reversible delegated default.
- Prior decisions re-confirmed: `remembered-faith-like-a-mustard-seed` stays off 13:31–32 (Kingdom-growth parable, not mustard-seed faith — drafter A item 13); `surrender-to-god`'s signposted reading stands (drafter A item 7).
- `suffering-for-christ` considered for 13:21 ("When oppression or persecution arises because of the word") and yielded as thin-single-verse.
- `messianic-prophecy` considered for 13:35 (parables citation) and yielded as thin-single-verse.

## Matthew 14 (subdivided: 14:1–12; 14:13–21; 14:22–33; 14:34–36)
**Existing tags (book doc):** `gods-provision`; `fear-not`; `doubt`; `worship`; `deity-of-christ`; `honor-the-son`
**Applied-tag deltas:** No changes — all six re-verified ("They all ate and were filled. They took up twelve baskets" 14:20; "Cheer up! It is I! Don't be afraid." 14:27; "You of little faith, why did you doubt?" 14:31; "Those who were in the boat came and worshiped him" 14:33; "You are truly the Son of God!" 14:33; the worship-received register of the same verse for `honor-the-son`). At the soft cap; remaining candidates yield (see Decisions).
**Anchor-extension candidates:**
- doubt | Matthew 14:29-31 | "You of little faith, why did you doubt?" (14:31) | 0.6 — the pack's only anchor today is Mk 9:23-24; Peter sinking is a primary doubt passage.
- gods-provision | Matthew 14:17-21 | "They all ate and were filled." (14:20) | 0.5 — the feeding of the five thousand; the pack's Gospel anchors are all Mt 6 sayings, no narrative anchor.
- oaths-and-vows | Matthew 14:6-9 | "he promised with an oath to give her whatever she should ask" (14:7); "for the sake of his oaths... he commanded it to be given" (14:9) | 0.45 — the destructive rash-oath counterexample the Genesis tag-gap row flagged as a key NT counterpoint text.
**Lexicon candidates:**
- doubt | "peter walks on water"; "why did you doubt" (book-doc motif 8)
- fear-not | "take heart it is i" — WEB reads "Cheer up! It is I! Don't be afraid." (14:27); "take heart" is the ESV/NIV wording class.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 6 of 8.
**Decisions record:**
- `oaths-and-vows` considered as a display tag for 14:6–9 (the tag-application skip was quote-availability; the quote is now stageable) and yielded on the presence bar itself: the oath is a three-verse plot device inside a martyrdom narrative — the chapter does not dwell on oath practice. Survives above as an anchor-extension candidate.
- `pastoral-grief-and-loss` remains off 14:12–13 (drafter A item 6 drop stands — brief grief note, chapter doesn't dwell on grieving; no new evidence).
- `prayer` considered for 14:23 ("he went up into the mountain by himself to pray") and yielded as thin-single-verse.

## Matthew 15 (subdivided: 15:1–20; 15:21–28; 15:29–39)
**Existing tags (book doc):** `sin`; `caring-for-aging-parents`; `faith`; `pastoral-prayer-for-healing`; `gods-provision`; `worship`; `empty-worship`
**Applied-tag deltas:**
- KEEP all seven — re-verified: `sin` — "For out of the heart come evil thoughts, murders, adulteries, sexual sins, thefts, false testimony, and blasphemies." (15:19); `caring-for-aging-parents` — "Honor your father and your mother" defended against the gift-devoted-to-God evasion: "You have made the commandment of God void because of your tradition." (15:4–6); `faith` — "Woman, great is your faith! Be it done to you even as you desire." (15:28); `pastoral-prayer-for-healing` — "Have mercy on me, Lord, you son of David! My daughter is severely possessed by a demon!" (15:22) and "Lord, help me." (15:25); `gods-provision` — "I have compassion on the multitude... They all ate and were filled." (15:32, 37); `worship` — "they worship me in vain" applied (15:9) and the woman who "came and worshiped him" (15:25); `empty-worship` — "These people draw near to me with their mouth, and honor me with their lips; but their heart is far from me." (15:8–9).
- ADD `clean-and-unclean` — the chapter's opening unit is the defilement teaching itself, and the pack anchors this very discourse's Mark parallel (Mk 7:14-23): "That which enters into the mouth doesn't defile the man; but that which proceeds out of the mouth, this defiles the man." (15:11), closing "but to eat with unwashed hands doesn't defile the man." (15:20). Honest substantial presence. Chapter lands at 8 — the HARD CEILING; every sitting tag independently clears the bar (each carried through the book doc's critic loop and passes).
**Anchor-extension candidates:**
- caring-for-aging-parents | Matthew 15:3-6 | "You have made the commandment of God void because of your tradition." (15:6) | 0.55 — the pack has NO Gospel/Acts anchors; Jesus' corban rebuke is its strongest NT text.
- clean-and-unclean | Matthew 15:10-20 | "That which enters into the mouth doesn't defile the man" (15:11) | 0.55 — the unanchored Matthean parallel of the pack's Mk 7:14-23 anchor.
- empty-worship | Matthew 15:7-9 | "And they worship me in vain, teaching as doctrine rules made by men." (15:9) | 0.55 — the vain-worship verdict verse itself, unanchored in the pack.
- faith | Matthew 15:21-28 | "Woman, great is your faith! Be it done to you even as you desire." (15:28) | 0.5 — the `faith` pack currently has NO Gospel/Acts anchors at all; the Canaanite woman is a canonical faith narrative.
**Lexicon candidates:**
- empty-worship | "honor me with their lips but their heart is far from me" (15:8 — near-verbatim landing; absent from the pack's lexicon)
- faith | "even the dogs eat the crumbs" (15:27 — the woman's persistence line searchers remember)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** HARD CEILING 8 after delta → listed for the per-verse refinement pass; also subdivided in book doc (3 sections).
**Decisions record:**
- `clean-and-unclean` ADD is a sweep-new judgment (the id was never weighed for this chapter in the application passes — it entered the engine in the 168→239 batches after the book doc's vocabulary snapshot); recorded as a reversible delegated default. It takes the chapter to the ceiling; no sitting tag is displaced and none yields — all eight independently clear the bar.
- "Blind guides of the blind" (15:14) noted; served by corpus word search, no proposal.
- `mercy` considered for 15:22 ("Have mercy on me, Lord") and yielded as same-verse duplication with `pastoral-prayer-for-healing`'s justification.

## Matthew 16 (subdivided: 16:1–12; 16:13–20; 16:21–28)
**Existing tags (book doc):** `deity-of-christ`; `surrender-to-god`; `second-coming`
**Applied-tag deltas:**
- KEEP all three — re-verified: `deity-of-christ` — "You are the Christ, the Son of the living God." (16:16), "flesh and blood has not revealed this to you, but my Father who is in heaven" (16:17); `surrender-to-god` — "let him deny himself, take up his cross, and follow me. For whoever desires to save his life will lose it" (16:24–25); `second-coming` — "For the Son of Man will come in the glory of his Father with his angels" (16:27–28).
- ADD `discipleship` — 16:24–26 is the pack's own engine anchor (Mt 16:25-26) and a distinct register beside `surrender-to-god` per the adopted list's register-split precedent (surrender = the self-denial posture; discipleship = the call to come after him and its cost): "If anyone desires to come after me, let him deny himself, take up his cross, and follow me." (16:24), "For what will it profit a man if he gains the whole world and forfeits his life?" (16:26). Chapter lands at 4.
**Anchor-extension candidates:**
- deity-of-christ | Matthew 16:16-17 | "You are the Christ, the Son of the living God." (16:16) | 0.6 — Peter's confession is unanchored in the pack (its synoptic side is only Mt 26:63-64).
**Lexicon candidates:**
- kingdom-of-heaven | "keys of the kingdom"; "binding and loosing" (16:19; book-doc motif 13)
- gathering-together | "i will build my church"; "gates of hell shall not prevail" — WEB reads "I will build my assembly, and the gates of Hades will not prevail against it." (16:18); Matthean evidence for the standing Acts-thread lexicon lead on this pack (declines digest §3.5, early-church items) — check that lexicon-extension route before any new "church" id.
**New-concept candidates:** None — 16:18's church material routes to the recorded gathering-together lexicon lead above, not a new id.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (3 sections) → listed for the per-verse refinement pass; 4 of 8.
**Decisions record:**
- `satan` considered for 16:23 ("Get behind me, Satan! You are a stumbling block to me") and yielded as thin-single-verse; the verse is already the pack's engine anchor, so nothing is lost.
- `the-cross` remains withheld from 16:21 (drafter B item 4 stands — announcement without atonement language; no new evidence).
- `faith` considered for 16:8 ("you of little faith") and yielded as thin — a rebuke aside, not the chapter's teaching substance.

## Matthew 17 (subdivided: 17:1–13; 17:14–21; 17:22–23; 17:24–27)
**Existing tags (book doc):** `deity-of-christ`; `faith`; `remembered-faith-like-a-mustard-seed`; `pastoral-prayer-for-healing`
**Applied-tag deltas:**
- KEEP all four — re-verified: `deity-of-christ` — "This is my beloved Son, in whom I am well pleased. Listen to him." (17:5) over the transfigured Son (17:2); `faith` — "Because of your unbelief... nothing will be impossible for you." (17:20); `remembered-faith-like-a-mustard-seed` — "if you have faith as a grain of mustard seed, you will tell this mountain, 'Move from here to there,' and it will move" (17:20); `pastoral-prayer-for-healing` — "Lord, have mercy on my son" (17:15) and "the boy was cured from that hour" (17:18).
- ADD `deliverance-from-demons` — the boy's cure is narrated as an exorcism and the failure post-mortem is deliverance teaching, a register distinct from the father's healing plea: "Jesus rebuked the demon, and it went out of him" (17:18), "Why weren't we able to cast it out?" (17:19), "But this kind doesn't go out except by prayer and fasting." (17:21). The pack anchors the Mark parallel (Mk 9:25-29); presence here is the same substance. Chapter lands at 5.
**Anchor-extension candidates:**
- deity-of-christ | Matthew 17:5 | "This is my beloved Son, in whom I am well pleased. Listen to him." | 0.55 — the transfiguration voice is unanchored in the pack.
- deliverance-from-demons | Matthew 17:14-21 | "Jesus rebuked the demon, and it went out of him, and the boy was cured from that hour." (17:18) | 0.5 — the unanchored Matthean parallel of the pack's Mk 9:25-29 anchor.
**Lexicon candidates:**
- remembered-faith-like-a-mustard-seed | "faith that moves mountains"; "nothing will be impossible for you" (17:20; book-doc motif 11)
- [Layer-2 verification lead, not a concept row] "transfiguration of jesus": the WEB never uses the word — 17:2 reads "He was changed before them." KJV/ESV/NIV all read "transfigured", so the cross-translation token index should already map it to this verse; verify, and if it measurably misses, a QR-6 alias ("the transfiguration" → Matthew 17:1-8) is the mechanism — not a lexicon row on an unrelated concept.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 5 of 8 after delta.
**Decisions record:**
- `deliverance-from-demons` ADD recorded as a reversible delegated default; both-tags beside `pastoral-prayer-for-healing` under the §11.2 ruling (the plea register and the exorcism register each clear the bar on their own verses).
- `resurrection` considered for 17:9, 22–23 (the command of silence "until the Son of Man has risen from the dead" and the second passion prediction) and yielded as thin predictive notices, consistent with drafter A item 11's reasoning on 12:40.
- `governing-authorities` considered for the temple-tax scene (17:24–27) and yielded — the didrachma is the temple tax, a religious duty; "toll or tribute" (17:25) is an analogy inside it, not civil-authority teaching.

## Matthew 18
**Existing tags (book doc):** `humble-exaltation`; `forgiving-others`; `harmony-with-others`; `gods-love`; `gathering-together`; `hell`
**Applied-tag deltas:**
- KEEP all six — re-verified: `humble-exaltation` — "Whoever therefore humbles himself as this little child is the greatest in the Kingdom of Heaven." (18:4); `forgiving-others` — "until seventy times seven" (18:22) and "if you don't each forgive your brother from your hearts" (18:35); `harmony-with-others` — "If he listens to you, you have gained back your brother." (18:15); `gods-love` — "it is not the will of your Father who is in heaven that one of these little ones should perish." (18:14); `gathering-together` — "where two or three are gathered together in my name, there I am in the middle of them." (18:20); `hell` — "cast into the eternal fire" (18:8) and "the Gehenna of fire" (18:9).
- ADD `church-discipline` — 18:15–17 is the pack's own engine anchor and its lexicon phrase's landing ("tell it to the church"; WEB "assembly"): "If your brother sins against you, go, show him his fault between you and him alone." (18:15), escalating "take one or two more with you" (18:16) to "tell it to the assembly. If he refuses to hear the assembly also, let him be to you as a Gentile or a tax collector." (18:17). Both-tags beside `harmony-with-others`: the restoration aim and the formal assembly process are distinct registers, each clearing the bar. Chapter lands at 7.
**Anchor-extension candidates:**
- forgiving-others | Matthew 18:23-35 | "Shouldn't you also have had mercy on your fellow servant, even as I had mercy on you?" (18:33) | 0.6 — the pack anchors 18:21-22 but not the unforgiving-servant parable that presses it home.
- humble-exaltation | Matthew 18:1-4 | "unless you turn and become as little children, you will in no way enter into the Kingdom of Heaven" (18:3) | 0.55 — the pack's NT-narrative side is thin (Ac 20:19).
- gods-love | Matthew 18:12-14 | "doesn't he leave the ninety-nine, go to the mountains, and seek that which has gone astray?" (18:12) | 0.5 — the straying-sheep picture of the Father's seeking love, unanchored.
**Lexicon candidates:**
- forgiving-others | "parable of the unforgiving servant"
- humble-exaltation | "become like little children"; "childlike faith"
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** none (left whole by the book doc — one community discourse, drafter B item 3; 7 of 8 after delta, above soft cap with every tag clearing the bar).
**Decisions record:**
- `church-discipline` ADD is a sweep-new judgment (the id existed at drafting but was not weighed for this chapter; its own anchor sits here); recorded as a reversible delegated default under the §11.2 both-tags ruling.
- `angels` remains skipped on 18:10 (tag-application-pass logic: single verse; the pack already anchors Mt 18:10, so the engine layer is served).
- `mercy` considered for 18:33 and yielded as same-unit duplication — the verse serves `forgiving-others`' justification.
- `prayer` considered for 18:19 ("if two of you will agree on earth concerning anything that they will ask") and yielded as thin-single-verse carried inside `gathering-together`'s unit.

## Matthew 19 (subdivided: 19:1–12; 19:13–15; 19:16–30)
**Existing tags (book doc):** `pastoral-marriage-divorce-teaching`; `godly-marriage`; `surrender-to-god`; `salvation`; `heavenly-reward`
**Applied-tag deltas:**
- KEEP all five — re-verified: `pastoral-marriage-divorce-teaching` — "Moses, because of the hardness of your hearts, allowed you to divorce your wives, but from the beginning it has not been so." (19:8) with the exception clause (19:9); `godly-marriage` — "the two shall become one flesh... What therefore God has joined together, don't let man tear apart." (19:5–6); `surrender-to-god` — "go, sell what you have, and give to the poor... and come, follow me." (19:21) and "we have left everything and followed you" (19:27); `salvation` — "Who then can be saved?" answered "With men this is impossible, but with God all things are possible." (19:25–26); `heavenly-reward` — "you will have treasure in heaven" (19:21), twelve thrones and the hundredfold (19:28–29).
- ADD `money-and-possessions` — the rich young man is the pack's defining narrative (its lexicon: "rich young ruler; eye of a needle; can a rich person be saved"; it anchors the Lukan parallel Lk 18:18-27): "he went away sad, for he was one who had great possessions." (19:22), "it is easier for a camel to go through a needle's eye than for a rich man to enter into God's Kingdom." (19:24). Honest substantial presence — 19:16–26 dwells on riches and the Kingdom.
- ADD `singleness` — 19:10–12 is Jesus' direct teaching on unmarried life and the pack's own engine anchor (Mt 19:12): the disciples' "it is not expedient to marry" (19:10) answered "there are eunuchs who made themselves eunuchs for the Kingdom of Heaven's sake. He who is able to receive it, let him receive it." (19:12). Chapter lands at 7.
**Anchor-extension candidates:**
- godly-marriage | Matthew 19:4-6 | "For this cause a man shall leave his father and mother, and shall be joined to his wife; and the two shall become one flesh" (19:5) | 0.6 — the pack has NO Gospel/Acts anchors; Jesus' creation-grounded marriage teaching is its strongest NT text.
- money-and-possessions | Matthew 19:16-26 | "it is easier for a camel to go through a needle's eye than for a rich man to enter into God's Kingdom." (19:24) | 0.6 — the unanchored Matthean parallel of the pack's Lk 18:18-27 anchor.
- hardness-of-heart | Matthew 19:8 | "Moses, because of the hardness of your hearts, allowed you to divorce your wives" | 0.45.
**Lexicon candidates:**
- money-and-possessions | "camel through the eye of a needle" (the pack has "eye of a needle"; the fuller phrase searchers type is absent)
- salvation | "with god all things are possible" (19:26 — heavy standalone query whose home context is this salvation exchange)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (3 sections) → listed for the per-verse refinement pass; 7 of 8 after deltas.
**Decisions record:**
- Both ADDs are sweep-new judgments (`money-and-possessions` and `singleness` entered or were never weighed for this chapter in the earlier passes); recorded as reversible delegated defaults.
- `pastoral-pregnancy-and-child-loss` NOT tagged despite its engine anchor at Mt 19:14 — the anchor is a curated comfort use ("let the little children come to me"); the chapter contains no child-loss substance, and tagging it would misstate presence. Engine layer already served; display honesty wins.
- `kingdom-of-heaven` considered (19:12, 14, 23–24 clauses) and yielded as scattered-clauses, not a teaching unit of its own here.

## Matthew 20 (subdivided: 20:1–16; 20:17–19; 20:20–28; 20:29–34)
**Existing tags (book doc):** `grace-not-earned`; `humble-exaltation`; `the-cross`; `pastoral-prayer-for-healing`; `servanthood`
**Applied-tag deltas:** No changes — all five re-verified ("It is my desire to give to this last just as much as to you... Or is your eye evil, because I am good?" 20:14–15; "So the last will be first, and the first last." 20:16 and "whoever desires to become great among you shall be your servant" 20:26; the third passion prediction 20:18–19 and "to give his life as a ransom for many" 20:28; "Lord, have mercy on us, you son of David!... Jesus, being moved with compassion, touched their eyes" 20:30–34; "even as the Son of Man came not to be served, but to serve" 20:28). Remaining candidates duplicate sitting registers (see Decisions).
**Anchor-extension candidates:**
- the-cross | Matthew 20:28 | "even as the Son of Man came not to be served, but to serve, and to give his life as a ransom for many." | 0.7 — the pack's only Gospel anchor is Jn 1:29; the ransom saying is a primary atonement text.
- grace-not-earned | Matthew 20:1-16 | "It is my desire to give to this last just as much as to you." (20:14) | 0.55 — the pack has NO Gospel/Acts anchors; the vineyard-wages parable is its narrative exemplar.
- servanthood | Matthew 20:25-28 | "whoever desires to become great among you shall be your servant" (20:26) | 0.5 — the unanchored Matthean parallel of the pack's Mk 10:42-45 anchor.
- leadership | Matthew 20:25-28 | "You know that the rulers of the nations lord it over them... It shall not be so among you" (20:25–26) | 0.5 — the pack anchors the Lukan parallel (Lk 22:24-27); "servant leadership" queries land here.
**Lexicon candidates:**
- humble-exaltation | "the last shall be first" (20:16; book-doc motif 12)
- the-cross | "a ransom for many" (20:28)
- grace-not-earned | "parable of the workers in the vineyard"
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (4 sections) → listed for the per-verse refinement pass; 5 of 8.
**Decisions record:**
- `leadership` considered as a display tag for 20:25–28 and yielded as same-unit duplication — `servanthood` already carries those verses in the serving-greatness register the book doc recorded (both-tags beside `humble-exaltation`); a third tag on the unit adds no distinct register. Survives above as an anchor-extension candidate.
- `mercy` considered for 20:30–31 and yielded as same-verse duplication with `pastoral-prayer-for-healing`'s justification.
- `envy-and-jealousy` considered for 20:15 ("is your eye evil, because I am good?") and yielded as thin — one idiom inside the parable, carried by `grace-not-earned`.

## Matthew 21 (subdivided: 21:1–11; 21:12–17; 21:18–22; 21:23–32; 21:33–46)
**Existing tags (book doc):** `praise`; `prayer`; `faith`; `christ-the-cornerstone`; `repentance`; `divine-judgment`
**Applied-tag deltas:**
- KEEP all six — re-verified: `praise` — "Hosanna to the son of David! Blessed is he who comes in the name of the Lord! Hosanna in the highest!" (21:9) and "Out of the mouth of children and nursing babies, you have perfected praise" (21:16); `prayer` — "My house shall be called a house of prayer" (21:13) and "All things, whatever you ask in prayer, believing, you will receive." (21:22); `faith` — "if you have faith and don't doubt... even if you told this mountain, 'Be taken up and cast into the sea,' it would be done." (21:21); `christ-the-cornerstone` — "The stone which the builders rejected was made the head of the corner." (21:42–44); `repentance` — "afterward he changed his mind, and went" (21:29) and "you didn't even repent afterward, that you might believe him" (21:32); `divine-judgment` — "He will miserably destroy those miserable men" (21:41) and "God's Kingdom will be taken away from you" (21:43).
- ADD `obedience-to-the-word` — the two-sons parable is a full doing-versus-saying teaching unit, the pack's hearing-and-doing register (it already anchors Mt 7:21, this parable's twin): "Which of the two did the will of his father?" (21:31), the first who said "'I will not,' but afterward he changed his mind, and went" against the second's "'I'm going, sir,' but he didn't go" (21:29–30). Both-tags beside `repentance`, whose justification claims the change-of-mind register. Chapter lands at 7.
**Anchor-extension candidates:**
- christ-the-cornerstone | Matthew 21:42-44 | "The stone which the builders rejected was made the head of the corner." (21:42) | 0.65 — the pack's only anchor is Ac 4:11 while its lexicon phrase "the stone the builders rejected" lands here, in Jesus' own mouth.
- messianic-prophecy | Matthew 21:4-5 | "Tell the daughter of Zion, behold, your King comes to you, humble, and riding on a donkey" (21:5) | 0.5 — the Zechariah entry prophecy.
- the-house-of-god | Matthew 21:12-13 | "My house shall be called a house of prayer" (21:13) | 0.5 — the pack has NO Gospel/Acts anchors.
- obedience-to-the-word | Matthew 21:28-31 | "Which of the two did the will of his father?" (21:31) | 0.5.
- prayer | Matthew 21:22 | "All things, whatever you ask in prayer, believing, you will receive." | 0.5 — the pack anchors the Mark parallel (Mk 11:24); the Matthean landing is unanchored.
**Lexicon candidates:**
- praise | "hosanna in the highest"; "hosanna meaning"
- [QR-6 alias lead, not a lexicon row] "palm sunday" / "the triumphal entry" → Matthew 21:1-11 — liturgical whole-query phrases with no WEB word overlap ("palm" never occurs in Matthew's account — WEB reads "cut branches from the trees", 21:8); exactly the alias mechanism's class, flagged for the alias-mining loop.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (5 sections) → listed for the per-verse refinement pass; 7 of 8 after delta.
**Decisions record:**
- `messianic-prophecy` considered as a display tag (21:4–5 fulfillment formula plus the 21:16 and 21:42 citations) and yielded as thin — the two citation moments not already carried by sitting tags total three verses; survives as an anchor-extension candidate.
- `the-house-of-god` considered for the cleansing scene and yielded as thin (2 verses; `prayer` already quotes 21:13); survives as an anchor-extension candidate.
- `obedience-to-the-word` ADD recorded as a reversible delegated default (both-tags with `repentance` under §11.2).

## Matthew 22 (subdivided: 22:1–14; 22:15–22; 22:23–33; 22:34–40; 22:41–46)
**Existing tags (book doc):** `loving-others`; `resurrection`; `deity-of-christ`; `divine-judgment`; `governing-authorities`; `loving-god`; `resurrection-of-the-dead`
**Applied-tag deltas:** No changes — all seven re-verified ("You shall love your neighbor as yourself." 22:39 with "The whole law and the prophets depend on these two commandments." 22:40; "God is not the God of the dead, but of the living." 22:32; "If then David calls him Lord, how is he his son?" 22:45; "destroyed those murderers, and burned their city" 22:7 and "throw him into the outer darkness" 22:13; "Give therefore to Caesar the things that are Caesar's, and to God the things that are God's." 22:21; "You shall love the Lord your God with all your heart, with all your soul, and with all your mind." 22:37; "in the resurrection they neither marry nor are given in marriage" 22:30).
- **Ruling 1(a) record (Jesse, 2026-08-25; CONVENTIONS §11.2):** the Sadducee-dispute contested call is resolved by harmonizing to the Matthew reading — THIS chapter's pairing (`resurrection` + `resurrection-of-the-dead`, both-tags) is the reference side; Mark 12 and Luke 20 carry Matt 22's applicable tags, and their sweep entries should point here rather than re-derive.
**Anchor-extension candidates:**
- resurrection-of-the-dead | Matthew 22:29-32 | "You are mistaken, not knowing the Scriptures, nor the power of God... God is not the God of the dead, but of the living." (22:29, 32) | 0.6 — the pack anchors Jn 11:25-26, Jn 5:28-29, Ac 24:15 but not the Sadducee dispute; per ruling 1(a) the Matthew text is the reference side, so engine curation should anchor here rather than (or before) the Mark/Luke parallels.
- deity-of-christ | Matthew 22:41-45 | "If then David calls him Lord, how is he his son?" (22:45) | 0.5 — the David's-son-and-Lord riddle, unanchored.
**Lexicon candidates:**
- resurrection-of-the-dead | "will there be marriage in heaven"; "god of the living not the dead" — the marriage-in-heaven question is a heavy pastoral query whose landing is 22:30.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (5 sections) → listed for the per-verse refinement pass; 7 of 8.
**Decisions record:**
- `kingdom-of-heaven` considered for the wedding-feast parable (22:2) and yielded — the parable's display substance is carried by `divine-judgment` (the spurned invitation's end); a kingdom tag would duplicate without a distinct register.
- `hell` considered for 22:13 ("outer darkness... weeping and grinding of teeth") and yielded as thin-single-verse; the verse is already the pack's engine anchor (Mt 22:13).
- "Many are called, but few chosen" (22:14) noted; verbatim in corpus so word search serves it; deliberately NOT routed to `election-and-predestination`'s lexicon — attaching the verse to that doctrine would adjudicate a reading the text leaves open (covenant #6 caution, and the pack's Rom 9 whole-text note in the backlog).

## Matthew 23 (subdivided: 23:1–36; 23:37–39)
**Existing tags (book doc):** `pleasing-god-not-people`; `humble-exaltation`; `divine-judgment`; `gods-love`; `empty-worship`
**Applied-tag deltas:**
- KEEP all five — re-verified: `pleasing-god-not-people` — "But they do all their works to be seen by men." (23:5–7); `humble-exaltation` — "he who is greatest among you will be your servant. Whoever exalts himself will be humbled, and whoever humbles himself will be exalted." (23:11–12); `divine-judgment` — "how will you escape the judgment of Gehenna?" (23:33), "all these things will come upon this generation" (23:36), "your house is left to you desolate" (23:38); `gods-love` — "How often I would have gathered your children together, even as a hen gathers her chicks under her wings, and you would not!" (23:37); `empty-worship` — the woes' target throughout: "outwardly appear righteous to men, but inwardly you are full of hypocrisy and iniquity" (23:28), tithing herbs while leaving "the weightier matters of the law: justice, mercy, and faith" (23:23).
- ADD `oaths-and-vows` — 23:16–22 is a seven-verse unit on swearing practice, rebuking the temple/gold and altar/gift casuistry: "Whoever swears by the temple, it is nothing; but whoever swears by the gold of the temple, he is obligated." (23:16), resolved "He who swears by heaven, swears by the throne of God and by him who sits on it." (23:22). Honest substantial presence — direct oath teaching, the pack's own subject (its Mt 5:33-37 anchor is this unit's twin). Chapter lands at 6 (soft cap).
**Anchor-extension candidates:**
- empty-worship | Matthew 23:25-28 | "you clean the outside of the cup and of the platter, but within they are full of extortion and unrighteousness" (23:25); "like whitened tombs" (23:27) | 0.55 — the pack anchors the Lukan woes (Lk 11:42-44); the Matthean landing is unanchored.
- oaths-and-vows | Matthew 23:16-22 | "He who swears by heaven, swears by the throne of God" (23:22) | 0.5.
- gods-love | Matthew 23:37 | "even as a hen gathers her chicks under her wings" | 0.45 — the lament's longing picture.
**Lexicon candidates:**
- empty-worship | "whitewashed tombs" — the WEB reads "whitened tombs" (23:27); "whitewashed" is the ESV/NIV wording class searchers actually type.
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (2 sections) → listed for the per-verse refinement pass; 6 of 8 after delta.
**Decisions record:**
- `oaths-and-vows` ADD recorded as a reversible delegated default (unit never weighed for this chapter in the earlier passes).
- `tithing` considered for 23:23 and yielded as thin-single-verse; the verse is already the pack's engine anchor (Mt 23:23), so the engine layer is served.
- `justice-and-oppression` (23:23 "justice, mercy, and faith" left undone) and `care-for-widows` (23:13 "you devour widows' houses") considered and yielded as thin-single-verse each — indictment clauses inside the woes, carried by `empty-worship` and `divine-judgment`.
- `servanthood` remains skipped on 23:11 (tag-application pass: same-verse substance carried by `humble-exaltation`).
- `hell` on 23:15, 33 remains carried by `divine-judgment` (drafter B item 8 stands — Gehenna functions as judgment rhetoric inside the woes).

## Matthew 24 (subdivided: 24:1–35; 24:36–51)
**Existing tags (book doc):** `second-coming`; `suffering-for-christ`; `divine-judgment`; `false-prophets`; `power-of-gods-word`
**Applied-tag deltas:** No changes — all five re-verified ("they will see the Son of Man coming on the clouds of the sky with power and great glory" 24:30 with "be ready, for in an hour that you don't expect, the Son of Man will come" 24:44; "they will deliver you up to oppression and will kill you. You will be hated by all of the nations for my name's sake." 24:9 with "he who endures to the end will be saved" 24:13; the flood that "came and took them all away" 24:39 and the unfaithful servant cut off "with the hypocrites" 24:51; "For false christs and false prophets will arise, and they will show great signs and wonders" 24:24 with 24:5, 11; "Heaven and earth will pass away, but my words will not pass away." 24:35). Remaining candidates are thin or deliberately withheld (see Decisions).
**Anchor-extension candidates:**
- second-coming | Matthew 24:36-41 | "But no one knows of that day and hour, not even the angels of heaven, but my Father only. As the days of Noah were, so will the coming of the Son of Man be." (24:36–37) | widen toward the pack's existing Mt 24:42-44 anchor — the unknown-hour and Noah comparison are the same readiness unit (weight kept).
- divine-judgment | Matthew 24:37-39 | "they didn't know until the flood came and took them all away" (24:39) | 0.45 — the pack anchors the Lukan parallel (Lk 17:26-30); the Matthean landing is unanchored.
**Lexicon candidates:**
- second-coming | "no one knows the day or the hour"; "as in the days of noah"
- false-prophets | "many will come in my name"
**New-concept candidates:** None — the discourse's end-of-age material routes to the corpus-blocked end-times row (see Decisions), not to a new id.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (2 sections) → listed for the per-verse refinement pass; 5 of 8.
**Decisions record:**
- Corpus-blocked ROUTE (roster row 5, end-times): Matt 24 is Gospel-side evidence for the blocked row — the disciples' question "What is the sign of your coming, and of the end of the age?" (24:3), "the abomination of desolation, which was spoken of through Daniel the prophet" (24:15), "this Good News of the Kingdom will be preached in the whole world... and then the end will come" (24:14). Recorded FOR the row; the end-times vs day-of-the-lord merge (and its boundary with `second-coming`, which already carries this chapter) stays a JESSE GATE — no pre-decision here.
- `caught-up-together` remains withheld from 24:31 and 24:40–41 (drafter B item 6 stands): equating the gathering / "one will be taken and one will be left" with the 1 Thessalonians 4 catching-up imports a debated eschatological frame; "one taken one left" queries are served verbatim by word search.
- `do-not-lose-heart` considered for 24:13 and yielded as thin-single-verse (the "endure to the end" lexicon lead is already recorded at ch. 10).
- `sharing-your-faith` considered for 24:14 and yielded as thin-single-verse; `angels` on 24:31 remains skipped (carried inside `second-coming`, per the tag-application pass).

## Matthew 25 (subdivided: 25:1–13; 25:14–30; 25:31–46)
**Existing tags (book doc):** `second-coming`; `work-and-diligence`; `heavenly-reward`; `generosity`; `divine-judgment`; `hell`; `stewardship`
**Applied-tag deltas:** No changes — all seven re-verified ("Behold! The bridegroom is coming!" 25:6 with "Watch therefore, for you don't know the day nor the hour" 25:13 and "when the Son of Man comes in his glory" 25:31; the traders commended and the burier condemned "You wicked and slothful servant" 25:16–17, 21, 26; "Well done, good and faithful servant... Enter into the joy of your lord." 25:21 and "inherit the Kingdom prepared for you from the foundation of the world" 25:34; "because you did it to one of the least of these my brothers, you did it to me." 25:40; "he will separate them one from another, as a shepherd separates the sheep from the goats" 25:32; "Depart from me, you cursed, into the eternal fire which is prepared for the devil and his angels" 25:41 and "eternal punishment" 25:46; the talents "entrusted his goods to them" 25:14 reckoned at the return 25:19). Remaining candidates are thin (see Decisions).
**Anchor-extension candidates:**
- divine-judgment | Matthew 25:31-46 | "Before him all the nations will be gathered, and he will separate them one from another, as a shepherd separates the sheep from the goats." (25:32) | 0.6 — the sheep-and-goats scene is unanchored in the pack (its NT anchors are Ac 17:30-31, Lk 17:26-30).
- generosity | Matthew 25:35-40 | "because you did it to one of the least of these my brothers, you did it to me." (25:40) | 0.55 — the least-of-these charter, unanchored (pack anchors Ac 20:35, Lk 6:38, Mt 5:42).
- hell | Matthew 25:41-46 | "Depart from me, you cursed, into the eternal fire" (25:41) | 0.55 — the pack anchors Mt 5:22, 18:8-9, 22:13 but not the eternal-punishment verses here.
- second-coming | Matthew 25:31 | "when the Son of Man comes in his glory, and all the holy angels with him" | 0.5.
**Lexicon candidates:**
- generosity | "the least of these" (book-doc motif 18)
- divine-judgment | "sheep and the goats"
- second-coming | "parable of the ten virgins" (book-doc motif 17)
**New-concept candidates:** None — the entrusted-resources theme is the corpus-blocked stewardship row; routed below.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (3 sections) → listed for the per-verse refinement pass; 7 of 8.
**Decisions record:**
- Corpus-blocked ROUTE (roster row 16, stewardship): Matt 25:14–30 is the row's lead text — "a man going into another country, who called his own servants and entrusted his goods to them" (25:14), "You have been faithful over a few things, I will set you over many things." (25:21), "You wicked and slothful servant." (25:26). Recorded FOR the blocked row (with Luke 12:41-48 and Luke 16 as the roster notes); the display tag stays, the engine pack waits on PR-β; no lexicon extension proposed while blocked.
- `hospitality` considered for 25:35 ("I was a stranger and you took me in" — already the pack's engine anchor) and yielded as thin — one clause among the six deeds, carried by `generosity`.
- `eternal-life` (adopted display id) considered for 25:46 and yielded as thin-single-verse.
- `kingdom-of-heaven` considered for 25:1 and yielded as a framing clause.

## Matthew 26 (subdivided: 26:1–16; 26:17–30; 26:31–46; 26:47–56; 26:57–68; 26:69–75)
**Existing tags (book doc):** `lords-supper`; `the-cross`; `covenant`; `prayer`; `surrender-to-god`; `pastoral-betrayal-and-marriage-crisis`
**Applied-tag deltas:**
- KEEP all six — re-verified: `lords-supper` — "Take, eat; this is my body." (26:26) and the cup "my blood of the new covenant" drunk anew "in my Father's Kingdom" (26:27–29); `the-cross` — "the Son of Man will be delivered up to be crucified." (26:2), "she did it to prepare me for burial." (26:12), "poured out for many for the remission of sins" (26:28); `covenant` — "for this is my blood of the new covenant" (26:28); `prayer` — the threefold Gethsemane prayer (26:39, 42, 44) and "Watch and pray, that you don't enter into temptation. The spirit indeed is willing, but the flesh is weak." (26:41); `surrender-to-god` — "My Father, if it is possible, let this cup pass away from me; nevertheless, not what I desire, but what you desire." (26:39); `pastoral-betrayal-and-marriage-crisis` — the intimate-companion register: the shared dish (26:23), the kiss (26:49), "Friend, why are you here?" (26:50).
- ADD `betrayal` — the general pack's own anchor is this chapter (Mt 26:47-50) and its lexicon names the scene ("who betrayed jesus; judas betrays jesus"): "What are you willing to give me if I deliver him to you?" So they weighed out for him thirty pieces of silver." (26:15), "one of you will betray me" (26:21), "he who betrays me is at hand" (26:46). Both-tags beside the pastoral id under §11.2 — the event/theme register and the personal-crisis register are distinct, each clearing the bar.
- ADD `passover` — the pack's engine anchor is Mt 26:17-19, and the Passover frames the chapter in-text: "after two days the Passover is coming" (26:2), "Where do you want us to prepare for you to eat the Passover?" (26:17), "I will keep the Passover at your house with my disciples." (26:18–19). Chapter lands at 8 — the HARD CEILING; every sitting tag independently clears the bar.
**Anchor-extension candidates:**
- the-cross | Matthew 26:26-28 | "for this is my blood of the new covenant, which is poured out for many for the remission of sins." (26:28) | 0.65 — the pack's only Gospel anchor is Jn 1:29; the cup-word is a primary atonement text.
- slander-and-false-accusation | Matthew 26:59-63 | "the chief priests, the elders, and the whole council sought false testimony against Jesus... Even though many false witnesses came forward, they found none." (26:59–60), met by silence: "But Jesus stayed silent." (26:63) | 0.5 — the pack ("falsely accused; false witnesses against me") has no Gospel narrative anchor; this is Scripture's archetypal false-witness scene.
- deity-of-christ | Matthew 26:63-64 — already the pack's anchor; no extension needed (noted for the refinement pass).
- vengeance | Matthew 26:52 | "all those who take the sword will die by the sword" | 0.45 — the sword put away; single verse, engine-anchor material only.
**Lexicon candidates:**
- surrender-to-god | "not my will but yours"; "let this cup pass" (book-doc motif 19 — neither phrase is in the pack's lexicon)
- the-cross | "thirty pieces of silver" (book-doc motif 23)
- prayer | "the spirit is willing but the flesh is weak" (26:41 — heavy standalone query)
**New-concept candidates:** None — Peter's denial (26:69–75) is the fall half of the book doc's motif 20; the restoration lies outside Matthew, so `pastoral-relapse-and-restoration` stays a feed note, not a tag.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** HARD CEILING 8 after deltas → listed for the per-verse refinement pass; also the book's most heavily subdivided chapter (6 sections).
**Decisions record:**
- `betrayal` and `passover` ADDs recorded as reversible delegated defaults (both packs anchor this chapter; neither id was weighed in the earlier passes — `betrayal` and `passover` entered the engine after the book doc's 131-id snapshot).
- `slander-and-false-accusation` considered as a display tag for 26:59–63 and yielded to the hard ceiling (§11.6 yield order: it is the thinnest remaining candidate class at the cap); survives above as an anchor-extension candidate for the per-verse refinement pass.
- `shepherds-and-the-flock` considered for 26:31 ("I will strike the shepherd, and the sheep of the flock will be scattered") and yielded as thin-single-verse; the verse is already the pack's engine anchor.
- `angels` on 26:53 remains skipped (tag-application pass: the twelve-legions saying, one verse; already the pack's anchor).
- `asking-in-gods-will` considered for 26:39 (its pack anchors the verse) and yielded as same-verse duplication — `surrender-to-god` and `prayer` carry the Gethsemane scene's display registers.

## Matthew 27 (subdivided: 27:1–10; 27:11–26; 27:27–31; 27:32–44; 27:45–56; 27:57–66)
**Existing tags (book doc):** `the-cross`; `deity-of-christ`; `sin`
**Applied-tag deltas:** No changes — all three re-verified: `the-cross` — Golgotha (27:33), "When they had crucified him, they divided his clothing among them, casting lots" (27:35), the darkness (27:45), "My God, my God, why have you forsaken me?" (27:46), "Jesus cried again with a loud voice, and yielded up his spirit." (27:50); `deity-of-christ` — the taunts "If you are the Son of God, come down from the cross!" (27:40, 43) answered by the centurion's "Truly this was the Son of God!" (27:54); `sin` — "I have sinned in that I betrayed innocent blood." (27:4), the thrown silver, the Field of Blood, the hanging (27:5–8). The chapter's lean tag set is honest — remaining candidates are thin (see Decisions); honest-and-lean preferred over stretch tags.
**Anchor-extension candidates:**
- the-cross | Matthew 27:32-50 | "About the ninth hour Jesus cried with a loud voice... 'My God, my God, why have you forsaken me?'" (27:46) | 0.7 — the crucifixion narrative itself is unanchored in the pack (its only Gospel anchor is Jn 1:29).
- deity-of-christ | Matthew 27:54 | "Truly this was the Son of God!" | 0.5 — the centurion's confession, unanchored.
- messianic-prophecy | Matthew 27:9-10 | "They took the thirty pieces of silver, the price of him upon whom a price had been set" (27:9) | 0.45 — the potter's-field fulfillment citation.
**Lexicon candidates:**
- the-cross | "my god my god why have you forsaken me"; "why did the temple veil tear" (book-doc motifs 21–22; the WEB reads "the veil of the temple was torn in two from the top to the bottom", 27:51)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** subdivided in book doc (6 sections) → listed for the per-verse refinement pass; 3 of 8.
**Decisions record:**
- Corpus-blocked ROUTE (roster row 22, death-and-burial): the roster's Gospels note names Luke 23 / John 19; Matt 27:57–61 is parallel burial evidence for the same row — "Joseph took the body and wrapped it in a clean linen cloth and laid it in his own new tomb, which he had cut out in the rock." (27:59–60). Recorded FOR the row; no duplicate gap row, no display tag (`mortality`'s register doesn't fit a burial narrative, and no burial id exists outside the blocked row).
- `slander-and-false-accusation` considered for 27:12–14 ("When he was accused by the chief priests and elders, he answered nothing.") and yielded as thin — a continuation of the ch. 26 false-witness scene already routed there as an anchor-extension candidate.
- `envy-and-jealousy` considered for 27:18 ("because of envy they had delivered him up") and yielded as thin-single-verse.
- `dreams-and-visions` considered for 27:19 (Pilate's wife's dream) and yielded as thin-single-verse.
- 27:52–53 (opened tombs, raised saints) noted as a curiosity passage served by word search; deliberately NOT attached to `resurrection-of-the-dead` — the passage's interpretation is debated and attaching it would adjudicate (covenant #6 caution).
- Book-doc handling of 27:25 (reported factually, not highlighted) re-confirmed — no change.

## Matthew 28 (subdivided: 28:1–10; 28:11–15; 28:16–20)
**Existing tags (book doc):** `resurrection`; `sharing-your-faith`; `baptism`; `trinity`; `presence-of-god`; `fear-not`; `angels`; `honor-the-son` — 8 tags, the HARD CEILING, recorded as such by the book doc's PR #51 pass.
**Applied-tag deltas:** No changes — all eight re-verified ("He is not here, for he has risen, just like he said." 28:6; "Go and make disciples of all nations" 28:19 with "teaching them to observe all things that I commanded you" 28:20; "baptizing them in the name of the Father and of the Son and of the Holy Spirit" 28:19; the threefold name, same verse; "Behold, I am with you always, even to the end of the age." 28:20; "Don't be afraid" — the angel's word 28:5 and the risen Jesus' own 28:10; the angel who "rolled away the stone from the door and sat on it" 28:2 announcing 28:5–7; "They came and took hold of his feet, and worshiped him." 28:9 and "they bowed down to him; but some doubted" 28:17). Chapter at the hard ceiling; candidates yield (see Decisions) and survive as engine-anchor material.
**Anchor-extension candidates:**
- discipleship | Matthew 28:18-20 | "Go and make disciples of all nations" (28:19) | 0.6 — "make disciples" is the pack's own lexicon phrase, yet the Great Commission is unanchored in it.
- presence-of-god | Matthew 28:20 | "Behold, I am with you always, even to the end of the age." | 0.55 — the pack's only Gospel anchor is Jn 14:23; the commission's closing promise is its Matthean landing.
**Lexicon candidates:**
- sharing-your-faith | "the great commission" — heavy query, absent from every pack's lexicon.
- presence-of-god | "i am with you always" (book-doc motif 24; the pack has "i will never leave you nor forsake you" but not this phrase)
**New-concept candidates:** None.
**Decline-overturn proposals:** None.
**Ceiling / refinement flags:** HARD CEILING 8 → listed for the per-verse refinement pass; subdivided in book doc (3 sections).
**Decisions record:**
- Ceiling yields — clear or arguably clear the bar but cannot be added at 8: `discipleship` (28:18–20 — disciple-making commanded; survives as the anchor-extension candidate above) and `nations-and-peoples` (28:19 "all nations" — thin-single-verse in any case, and already the pack's engine anchor at Mt 28:19, so the engine layer is fully served).
- The guards' bribe (28:11–15) noted; no concept fits and none is proposed — apologetics-register queries about the stolen-body story land via word search ("Say that his disciples came by night and stole him away while we slept.", 28:13).

---

# Survival audit & summary (final append, 2026-08-26)

**Survival audit (CONVENTIONS §9): PASS.** Whole-ledger re-read after the Matthew 28 append: all 28 chapter entries present exactly once, in order 1→28 (headings verified at lines 43–571 of the audited state); every entry carries all 9 legend sections (8 mechanically counted section markers × 28 each, plus the per-entry heading); the file header is intact and byte-count growth was verified after every append. Every append in this ledger's history was an atomic end-of-file append with post-write tail verification; no rewrite of prior bytes occurred at any point.

**Summary counts (whole book):**
- Applied-tag deltas: **18 ADDs, 157 KEEPs, 0 DROPs** across 28 chapters. ADDs: messianic-prophecy (chs 1, 2); witness-testimony + holy-spirit (ch 3); fasting (ch 9); the-breath-of-life (ch 10); deliverance-from-demons (chs 12, 17); hardness-of-heart (ch 13); clean-and-unclean (ch 15); discipleship (ch 16); church-discipline (ch 18); money-and-possessions + singleness (ch 19); obedience-to-the-word (ch 21); oaths-and-vows (ch 23); betrayal + passover (ch 26). Four ADDs reverse quote-availability-only skips now resolved by the pinned full-Bible fixture (chs 9, 10, 12 — plus the ch 10 follow-up the apologetics pass itself requested); the rest are sweep-new presence judgments, each a reversible delegated default.
- Anchor-extension candidates: **80** (notable clusters: packs with NO Gospel/Acts anchors gaining first Gospel anchors — resisting-the-devil, fear-not, faith, honesty, grace-not-earned, godly-marriage, caring-for-aging-parents, servant-of-the-lord, the-name-of-god, the-house-of-god, messianic-prophecy; and the-cross gaining its crucifixion/ransom/cup anchors Mt 20:28, 26:26-28, 27:32-50).
- Lexicon candidates: **52** concept-lexicon rows, plus 2 non-lexicon leads (QR-6 alias lead "palm sunday" / "the triumphal entry" → Matt 21:1-11; Layer-2 translation-token verification lead for "transfiguration", a word the WEB never uses).
- New-concept candidates: **0** (every candidate theme resolved to an existing/adopted id, a recorded lexicon lead, or a corpus-blocked route).
- Decline-overturn proposals: **0** (no new textual evidence against any recorded decline).
- Ceiling flags (hard ceiling 8): **chs 5, 6, 28** (pre-existing) and **chs 15, 26** (reached via sweep ADDs) — top priority for the per-verse refinement pass. Book-doc-subdivided chapters listed for the same pass: all except chs 2, 5, 6, 7, 10, 18 (chs 5 and 6 enter via the ceiling instead; chs 2, 7, 10, 18 carry no refinement flag).
- Corpus-blocked routes (evidence recorded FOR the roster rows, nothing duplicated): **5** — virgin-birth (row 49, Matt 1:18–25); blasphemy-against-the-spirit (row 11, Matt 12:31–32); end-times (row 5, Matt 24:3, 14–15); stewardship (row 16, Matt 25:14–30); death-and-burial (row 22, Matt 27:57–61).
- Ruling 1(a) recorded in the Matt 22 entry: Matt 22 is the harmonization reference side for the Sadducee-dispute parallels (Mark 12 / Luke 20 point here).

All content in this ledger is display/research-layer material. Nothing here creates a concept pack; engine ingestion goes fixtures-first through the gauntlet per plan §3.3 / §5.2, with NO MEASURABLE EFFECT meaning don't merge.

---

# PASTORAL-ID ERRATUM (2026-08-26)

Delivery-pass audit of the 14 pastoral-* concept ids. The canonical ledger form is the
`pastoral-` prefixed filename stem (e.g. `pastoral-near-to-the-brokenhearted`); the
unprefixed YAML ids are the wrong form in this ledger. Occurrences below are recorded
append-only (no body edit); the canonical form governs wherever the wrong form appears.
Line numbers refer to the file state as audited (pre-erratum).

1. Matthew 5 entry (line 131, thin-single-verse yields list): `near-to-the-brokenhearted`
   → canonical `pastoral-near-to-the-brokenhearted`.

Total: 1 occurrence. All other pastoral-register ids in this ledger already use the
canonical prefixed form, per the header's own id note. Canonical form governs.
