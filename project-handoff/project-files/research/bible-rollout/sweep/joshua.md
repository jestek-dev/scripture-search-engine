# Joshua sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (engine 0.14.0), plus the
  §11.1 Jesse-adopted display-tag vocabulary (reconstructed per the history-books BRIEFING §7:
  the 161 adopted tag-gaps-review §2 ids; engine ids preferred; roster/§2 ids used only with
  exact-spelling match and named list).
- Book: Joshua (24 chapters, 658 WEB verses)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/joshua.md
    (FINAL, critic-approved; tagged against 131 ids @ b3f491d plus the 2026-08-25
    adopted-vocabulary application pass — Decisions #18 there)
  - Scout briefing + concept inventory + declines/contested + corpus-blocked roster:
    /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
    (BRIEFING.md, concept-inventory.md, concept-ids.txt, declines-and-contested.md,
    corpus-blocked-roster.md, conventions-extract.md, plan-extract.md, web-text-access.md)
  - WEB text: repo-pinned VPL snapshot
    /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt (ebible.org engwebp,
    manifest pipeline/manifests/web.json sha b6f55cc7…, contentSha256 944e3883…, re-admitted
    2026-08-25 in PR #53). Every quotation below was verified word-for-word against this file
    (book code JOS; curly apostrophes preserved). This is pinned-text verification for all 24
    chapters — a stronger provenance position than the book doc's (which verified chs 2–24
    against the then-current upstream edition only).
- Rules applied: CONVENTIONS §5 + §11 verbatim (honest-substantial-presence bar first, always;
  soft cap 6 / hard ceiling 8; §11.6 yield order with a Decisions-record entry for every yield;
  honest-and-empty preferred; no later-revelation read-backs; both-tags ruling; exact ids only,
  basename-as-id). tag-gaps-review §1 contested calls applied as ruled by Jesse 2026-08-25 —
  not re-litigated; §3 declines re-considerable only with NEW textual evidence, cited.
  Corpus-blocked roster findings are ROUTED (roster row number named), never duplicated.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification after every
  append, final survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Joshua <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with WEB-quote justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | proposed term(s) | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Corpus-blocked routings ("routed to backlog: <id> (roster row N)", or "None.")
  9. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  10. Decisions record (every §11.6 yield and notable delegated judgment call, or "None.")

## Joshua 1

Existing tags (book doc): `fear-not`, `presence-of-god`, `obedience-to-the-word`, `delight-in-the-word`, `do-not-lose-heart`, `leadership` (6 — soft cap).

Applied-tag deltas:
- KEEP `fear-not` — "Don’t be afraid. Don’t be dismayed, for the LORD your God is with you wherever you go" (1:9; the pack anchors Joshua 1:9).
- KEEP `presence-of-god` — "As I was with Moses, so I will be with you. I will not fail you nor forsake you" (1:5), "the LORD your God is with you wherever you go" (1:9).
- KEEP `obedience-to-the-word` — "Be careful to observe to do according to all the law which Moses my servant commanded you. Don’t turn from it to the right hand or to the left" (1:7).
- KEEP `delight-in-the-word` — "you shall meditate on it day and night" (1:8; the pack anchors Joshua 1:8).
- KEEP `do-not-lose-heart` — "Haven’t I commanded you? Be strong and courageous" (1:9; the pack anchors Joshua 1:9).
- KEEP `leadership` — the succession charge "As I was with Moses, so I will be with you" (1:5) answered by "All that you have commanded us we will do" (1:16).
- No adds: the chapter was re-checked against the full 239-id library (incl. post-b3f491d ids); nothing further clears the presence bar. `stewardship-of-days`, `guidance`, `trust-in-god` considered and not added (topic touches only).

Anchor-extension candidates:
- `presence-of-god` | Joshua 1:5 | "As I was with Moses, so I will be with you. I will not fail you nor forsake you." | w0.7 — the pack already anchors Hebrews 13:5, which quotes this very promise; the OT source text is a natural sibling anchor. (1:9 "the LORD your God is with you wherever you go" could ride the same range as 1:5-9.)

Lexicon candidates:
- `fear-not` | "be strong and courageous" | "be strong and courageous", "be strong and courageous meaning", "God's command to be strong and courageous". NOTE: this flag already exists — recorded as a Joshua lexicon-extension flag (non-row prose) in tag-gaps.md; this row endorses it with the sweep's re-verification (1:6, 7, 9, 18 all carry the phrase), it does not duplicate the log row.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None. (`courage` (roster row 17) deliberately NOT routed: the roster row itself records that Joshua 1:9 is `fear-not`'s divine-comfort register and "precisely NOT this gap".)

Ceiling / refinement flags: at soft cap 6 (every tag independently clears the bar; main themes first). Not subdivided; not a refinement candidate.

Decisions record: None (no yields; no changes).

## Joshua 2

Existing tags (book doc): `faith`, `hospitality`, `oaths-and-vows` (3).

Applied-tag deltas:
- KEEP `faith` — "I know that the LORD has given you the land" (2:9), "for the LORD your God, he is God in heaven above, and on earth beneath" (2:11) — a Canaanite outsider staking her life on Israel's God.
- KEEP `hospitality` — "The woman took the two men and hid them" (2:4), sheltered "under the stalks of flax" (2:6), escape planned at her own risk (2:15-16).
- KEEP `oaths-and-vows` — "this your oath which you’ve made us to swear" (2:17), sworn conditions spelled out at the window (2:12-14, 17-21).
- Considered, not added: `kindness` — "since I have dealt kindly with you, that you also will deal kindly with my father’s house" (2:12) is real kindness vocabulary, but the exchange's substance is the sworn protection (carried by `oaths-and-vows` and `hospitality`); proposed as an anchor extension below instead of a fourth tag. `gods-protection` — the spies are protected by Rahab, not depicted under God's protective act; not added.

Anchor-extension candidates:
- `faith` | Joshua 2:9-11 | "for the LORD your God, he is God in heaven above, and on earth beneath" | w0.55 — the pack is deliberately lean (Hebrews 11:6; Romans 10:17); Rahab's confession is Scripture's classic outsider-faith narrative and the anchor Hebrews 11:31 later cites.
- `kindness` | Joshua 2:12-14 | "since I have dealt kindly with you, that you also will deal kindly with my father’s house" | w0.55 — sibling to the pack's existing narrative anchors (Ruth 1:8; 2 Samuel 9:1-7), same covenant-kindness register.

Lexicon candidates:
- `faith` | "rahab" / "rahab's faith" | "who was Rahab in the Bible", "Rahab and the spies", "Rahab's faith". Name-queries may already land lexically once the full corpus serves them; propose only if the gauntlet shows a measured miss.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None. (`deliverance` (roster row 32) NOT routed: 2:24 "Truly the LORD has delivered all the land into our hands" is the give-into-hand conquest idiom, not the rescue-narrative register that row documents.)

Ceiling / refinement flags: none (3 tags). Not subdivided.

Decisions record: None (no yields). The `kindness` not-added call is recorded in the deltas above (reversible).

## Joshua 3

Existing tags (book doc): `presence-of-god`, `trust-in-god`, `guidance` (3).

Applied-tag deltas:
- ADD `signs-and-wonders` — the chapter names its own category before the miracle: "Sanctify yourselves; for tomorrow the LORD will do wonders among you" (3:5), and delivers it: "the waters which came down from above stood, and rose up in one heap" (3:16). A first-time reader searching "miracles in the Bible" is honestly served by this chapter; the id entered the vocabulary after the book doc's 131-id vintage.
- KEEP `presence-of-god` — "By this you shall know that the living God is among you" (3:10), the ark leading into the river (3:11).
- KEEP `trust-in-god` — the priests must carry the ark into a flooded river and "stand still in the Jordan" (3:8) before anything happens; they "stood firm on dry ground in the middle of the Jordan" (3:17).
- KEEP `guidance` — follow the ark "that you may know the way by which you must go; for you have not passed this way before" (3:4).

Anchor-extension candidates:
- `signs-and-wonders` | Joshua 3:13-17 | "the waters which came down from above stood, and rose up in one heap" | w0.6 — the pack's anchors are Acts-heavy; the Jordan crossing gives the OT wonder register its narrative anchor alongside 3:5's naming of the category.

Lexicon candidates:
- `signs-and-wonders` | "crossing the jordan" / "god parted the jordan" | "crossing the Jordan river", "God parted the Jordan", "Jordan river miracle".

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none (4 tags after add). Not subdivided.

Decisions record: None (no yields). ADD call rationale recorded in the delta above (reversible delegated default).

## Joshua 4

Existing tags (book doc): `parenting`, `remembrance-and-memorials` (adopted list), `fear-of-the-lord` (3).

Applied-tag deltas:
- KEEP `parenting` — built for the day "your children ask their fathers in time to come, saying, ‘What do these stones mean?’" — "Then you shall let your children know" (4:21-22).
- KEEP `remembrance-and-memorials` — "These stones shall be for a memorial to the children of Israel forever" (4:7), stacked at Gilgal with the built-in question "What do you mean by these stones?" (4:6, 20-24). (Adopted display-tag id, exact roster spelling; engine-side material routed below.)
- KEEP `fear-of-the-lord` — "that all the peoples of the earth may know that the LORD’s hand is mighty, and that you may fear the LORD your God forever" (4:24).
- No adds. `signs-and-wonders` considered and not added: 4:23 retells the wonder ("the LORD your God dried up the waters of the Jordan from before you") — the chapter's substance is the memorial and the retelling, not the miracle event itself (that is chapter 3's tag); adding here would be broad-duplicating-specific.

Anchor-extension candidates:
- `fear-of-the-lord` | Joshua 4:24 | "that you may fear the LORD your God forever" | w0.55 — the pack has no narrative-memorial anchor; 4:24 states the fear of the LORD as the purpose of God's public acts.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `remembrance-and-memorials` (roster row 33 — Joshua 4 is named there as the memorial-practice spine; any anchor/lexicon work on that id rides PR-β, not this ledger).

Ceiling / refinement flags: none (3 tags). Not subdivided.

Decisions record: None (no yields).

## Joshua 5 (subdivided: 5:1–12; 5:13–15)

Existing tags (book doc): `gods-provision`, `worship`, `presence-of-god`, `obedience-to-the-word`, `angels` (5).

Applied-tag deltas:
- ADD `passover` — "They kept the Passover on the fourteenth day of the month at evening in the plains of Jericho" (5:10), with unleavened cakes and the land's produce (5:11): the first Passover in the land, a genuine observance narrative, and the book doc's own section title names it ("The Circumcision and Passover at Gilgal"). The pack anchors Exodus 12 and Deuteronomy 16:1-8; this chapter honestly serves a "passover in the bible" searcher.
- KEEP `gods-provision` — "The manna ceased on the next day, after they had eaten of the produce of the land" (5:12): God's feeding changes form, never lapses.
- KEEP `worship` — "Joshua fell on his face to the earth, and worshiped" (5:14).
- KEEP `presence-of-god` — "I have come now as commander of the LORD’s army" (5:14); "the place on which you stand is holy" (5:15).
- KEEP `obedience-to-the-word` — "Make flint knives, and circumcise again the sons of Israel the second time" (5:2) carried out (5:3), and the Passover kept at its appointed day (5:10).
- KEEP `angels` — the sword-bearing "commander of the LORD’s army" (5:13-14), recorded without settling the identification per the tag-gaps row's own note.

Anchor-extension candidates:
- `passover` | Joshua 5:10-12 | "They kept the Passover on the fourteenth day of the month at evening in the plains of Jericho." | w0.6 — the pack's only observance narratives are Exodus 12 and the Gospels; the first-Passover-in-the-land text extends the observance register.
- `gods-provision` | Joshua 5:11-12 | "The manna ceased on the next day, after they had eaten of the produce of the land." | w0.55 — provision-in-transition; no current anchor covers the manna-to-produce handoff.
- `angels` | Joshua 5:13-15 | "I have come now as commander of the LORD’s army" | w0.55 — CAUTION carried from the tag-gaps append: the text never calls him an angel and Joshua worships on holy ground; any pack use must record the ref without settling the identification (many readers take him as more than an angel).

Lexicon candidates:
- `angels` | "commander of the lord's army" | "who is the commander of the Lord's army", "the man with the drawn sword in Joshua", "commander of the army of the LORD" — carrying the same identification caution as the anchor row.

New-concept candidates: None. (Physical circumcision (5:2-9) has no vocabulary home; it was checked against the roster — `circumcision-of-the-heart` (row 37) is the Deut 30:6 heart-register, `gentile-inclusion` (row 40) the church-inclusion register; neither covers a "circumcision in the bible" lookup. Not promoted as a gap: the search intent at scale is served lexically by the passage text, and minting from a narrative notice risks a concept with no teaching substance. Recorded as a motif only.)

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: at soft cap 6 after the add (every tag independently clears the bar). SUBDIVIDED in the book doc (5:1–12; 5:13–15) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields). The `passover` ADD is a delegated default (reversible); its density cost (5 → 6, hitting the soft cap) was weighed and accepted because the observance is section-titled substance, not an in-scene mention.

## Joshua 6

Existing tags (book doc): `faith`, `obedience-to-the-word`, `divine-judgment` (3).

Applied-tag deltas:
- ADD `signs-and-wonders` — "the wall fell down flat" (6:20) at a shout, after seven days' marching on nothing but "I have given Jericho into your hand" (6:2): the fall of Jericho's wall is one of Scripture's most-searched miracles, and the chapter's substance is the miracle-shaped victory itself. Both-tags ruling: `faith` (the trusting obedience) and `signs-and-wonders` (the wonder) both genuinely apply.
- KEEP `faith` — seven days of silent marching on God's bare word, "Shout, for the LORD has given you the city!" (6:16).
- KEEP `obedience-to-the-word` — the strange instructions carried out exactly, day by day (6:8-15, 20).
- KEEP `divine-judgment` — "The city shall be devoted, even it and all that is in it, to the LORD" (6:17), executed at his command (6:21, 24).

Anchor-extension candidates:
- `signs-and-wonders` | Joshua 6:20 | "the people shouted with a great shout, and the wall fell down flat" | w0.6.

Lexicon candidates:
- `signs-and-wonders` | "walls of jericho" | "the walls of Jericho fell", "battle of Jericho", "how did Jericho's walls fall".

New-concept candidates: None.

Decline-overturn proposals: None. (The book doc's Decisions #18 skip of `oaths-and-vows` on 6:26's oath-curse — one in-scene verse — was re-checked and stands.)

Corpus-blocked routings: None.

Ceiling / refinement flags: none (4 tags after add). Not subdivided.

Decisions record: None (no yields).

## Joshua 7

Existing tags (book doc): `sin`, `divine-judgment`, `prayer`, `honesty` (4).

Applied-tag deltas:
- ADD `covetousness` — Achan's own confession names the concept: "then I coveted them and took them" (7:21), and the whole chapter is the coveting's cost — "Israel has sinned" (7:11), defeat, exposure, and judgment (7:1-26). The pack's 1 Kings 21:1-16 anchor shows the same coveting-narrative register; the id entered the vocabulary after the book doc's 131-id vintage. Both-tags ruling: `sin` (the corporate charge) and `covetousness` (the specific sin) both genuinely apply.
- KEEP `sin` — "Israel has sinned" (7:11): one man's hidden theft charged to the nation, costing lives beyond his own (7:1, 5, 11-12).
- KEEP `divine-judgment` — "the LORD’s anger burned against the children of Israel" (7:1), the selection man by man, the sentence in the valley of Achor (7:14-18, 25-26).
- KEEP `prayer` — Joshua on his face before the ark until evening, pleading God's reputation: "What will you do for your great name?" (7:6-9).
- KEEP `honesty` — "stolen, and also deceived" (7:11), resolved only by open confession: "Tell me now what you have done! Don’t hide it from me!" (7:19).

Anchor-extension candidates:
- `covetousness` | Joshua 7:20-21 | "then I coveted them and took them" | w0.7 — narrative sibling to 1 Kings 21:1-16 (w0.8); the confession uses the pack's own key verb.

Lexicon candidates:
- `sin` | "hidden sin" | "hidden sin in the Bible", "consequences of hidden sin", "Achan's sin" — the book doc's motif #6; the pack's lexicon carries no hidden-sin phrasing and 7:11's "They have even put it among their own stuff" with 7:21's "they are hidden in the ground in the middle of my tent" is the paradigm text.

New-concept candidates: None.

Decline-overturn proposals: None. (`repentance` stays off, per the book doc's round-2 critic concurrence — Achan's confession leads to judgment, not restoration.)

Corpus-blocked routings: None.

Ceiling / refinement flags: none (5 tags after add). Not subdivided.

Decisions record: None (no yields).

## Joshua 8 (subdivided: 8:1–29; 8:30–35)

Existing tags (book doc): `fear-not`, `obedience-to-the-word`, `covenant`, `worship`, `blessing` (5).

Applied-tag deltas:
- KEEP `fear-not` — after the defeat, "Don’t be afraid, and don’t be dismayed" restarts the mission (8:1).
- KEEP `obedience-to-the-word` — plunder taken only "according to the LORD’s word which he commanded Joshua" (8:27); "There was not a word of all that Moses commanded which Joshua didn’t read" (8:35).
- KEEP `covenant` — the ceremony enacted around "the ark of the LORD’s covenant" (8:33): altar, law on stones, blessing and curse (8:30-35).
- KEEP `worship` — "an altar of uncut stones" on Mount Ebal with burnt offerings and peace offerings (8:30-31).
- KEEP `blessing` — the assembly arranged "that they should bless the people of Israel" (8:33), "the blessing and the curse" read (8:34).
- No adds. `studying-the-word` considered and not added: the public law-reading (8:34-35) is proclamation to an assembly, not the pack's study register — routed to the lexicon row below per the Deuteronomy check-first flag.

Anchor-extension candidates:
- `obedience-to-the-word` | Joshua 8:34-35 | "There was not a word of all that Moses commanded which Joshua didn’t read" | w0.55 — whole-counsel completeness register; no current anchor carries the read-all-of-it emphasis.

Lexicon candidates:
- `studying-the-word` | "public reading of scripture" | "public reading of Scripture", "reading the Bible aloud", "reading the law to the people" — this endorses the existing Deuteronomy §3.5 check-first flag (Deut 31:10-13) and adds Joshua 8:34-35 as a second witness; a lexicon extension there should be measured before any new id.

New-concept candidates: None.

Decline-overturn proposals: None. (The book doc's Decisions #18 skip of `sojourners-and-strangers` on 8:33, 35 — foreigners present in the assembly, an in-scene mention — was re-checked and stands.)

Corpus-blocked routings: None.

Ceiling / refinement flags: none (5 tags). SUBDIVIDED in the book doc (8:1–29; 8:30–35) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 9

Existing tags (book doc): `honesty`, `oaths-and-vows` (2).

Applied-tag deltas:
- KEEP `honesty` — the chapter turns on deception and its cost: "Why have you deceived us" (9:22), the ruse of worn clothes and moldy bread (9:4-13).
- KEEP `oaths-and-vows` — the kept-costly-oath narrative: "We have sworn to them by the LORD, the God of Israel. Now therefore we may not touch them" (9:19), "lest wrath be on us, because of the oath which we swore to them" (9:20).
- No adds. The negative-example withholding of `guidance` and `prayer` on 9:14 ("didn’t ask counsel from the LORD’s mouth") stands — book doc Decisions #6, same reasoning as Genesis 3 / `resisting-the-devil`. `grumbling-and-complaining` considered and not added: 9:18's "All the congregation murmured against the princes" is one in-scene verse, not the chapter's substance. `trusting-in-man` considered and not added: the leaders' self-reliance is depicted as a failure of consulting God, not the pack's trust-in-princes register.

Anchor-extension candidates:
- `oaths-and-vows` | Joshua 9:18-20 | "We have sworn to them by the LORD, the God of Israel. Now therefore we may not touch them" | w0.65 — the pack's Psalms 15:4 anchor names the keeps-his-word-to-his-own-hurt register; this is Scripture's fullest narrative of it (an oath extracted by fraud, still honored).

Lexicon candidates:
- `oaths-and-vows` | "the gibeonite deception" | "the Gibeonite deception", "why did Israel keep the treaty with Gibeon", "Joshua and the Gibeonites" — name-queries may already land lexically at full corpus; propose only on a measured miss.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None. (`counsel-and-advisers` (roster row 15) NOT routed: 9:14 is failure to consult the LORD, not the human-advisers register that row documents.)

Ceiling / refinement flags: none (2 tags). Not subdivided.

Decisions record: None (no yields).

## Joshua 10 (subdivided: 10:1–15; 10:16–28; 10:29–43)

Existing tags (book doc): `prayer`, `gods-protection`, `fear-not`, `divine-judgment` (4).

Applied-tag deltas:
- ADD `signs-and-wonders` — the sun stands still at a man's word: "Sun, stand still on Gibeon!" (10:12), "The sun stood still, and the moon stayed" (10:13), "There was no day like that before it or after it" (10:14) — one of Scripture's most-searched miracles, plus the hailstones from the sky (10:11). The id entered the vocabulary after the book doc's 131-id vintage. Both-tags ruling: `prayer` (the asking) and `signs-and-wonders` (the wonder) both genuinely apply.
- KEEP `prayer` — "the LORD listened to the voice of a man" (10:14), asked publicly "in the sight of Israel" (10:12).
- KEEP `gods-protection` — "The LORD confused them before Israel" (10:10), "the LORD hurled down great stones from the sky" (10:11), fighting for Israel throughout (10:8, 14, 42).
- KEEP `fear-not` — "Don’t fear them, for I have delivered them into your hands" (10:8); "Don’t be afraid, nor be dismayed. Be strong and courageous" (10:25).
- KEEP `divine-judgment` — "he utterly destroyed all that breathed, as the LORD, the God of Israel, commanded" (10:40).

Anchor-extension candidates:
- `signs-and-wonders` | Joshua 10:12-14 | "The sun stood still, and the moon stayed" | w0.7.
- `prayer` | Joshua 10:12-14 | "There was no day like that before it or after it, that the LORD listened to the voice of a man" | w0.6 — the pack has no OT narrative anchor for audacious public petition heard.
- `victory-in-christ` | Joshua 10:42 | "because the LORD, the God of Israel, fought for Israel" | w0.55 — the pack already carries the OT anchor Exodus 14:13-14 for its "god fights for us" / "the battle belongs to the lord" lexicon register; Joshua 10 is that register's densest narrative. Anchor extension ONLY — the Christ-named id is not applied as a display tag on OT narrative (no later-revelation read-back; the book doc's `gods-protection` carries the chapter).

Lexicon candidates:
- `signs-and-wonders` | "the sun stood still" | "Joshua and the sun standing still", "the day the sun stood still", "sun stand still Bible".
- `victory-in-christ` | "the lord fought for israel" | "the LORD fought for Israel", "God fights for his people", "God fought their battles".

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none (5 tags after add). SUBDIVIDED in the book doc (10:1–15; 10:16–28; 10:29–43) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields). The victory-in-christ anchor-only call (no display tag) is recorded in the candidates above (reversible delegated default).

## Joshua 11 (subdivided: 11:1–15; 11:16–23)

Existing tags (book doc): `fear-not`, `obedience-to-the-word`, `divine-judgment`, `gods-faithfulness`, `inheritance` (5).

Applied-tag deltas:
- ADD `hardness-of-heart` — the narrator's own theological key to the whole conquest: "For it was of the LORD to harden their hearts, to come against Israel in battle, that he might utterly destroy them" (11:20, framing 11:18-20's summary of the long war). The pack's Exodus 14:4 anchor is this exact God-hardens-for-judgment register; the id was not tagged anywhere in the book doc and 11:20 is Joshua's one explicit hardening text.
- KEEP `fear-not` — before the largest battle: "Don’t be afraid because of them; for tomorrow at this time, I will deliver them up all slain before Israel" (11:6).
- KEEP `obedience-to-the-word` — "As the LORD commanded Moses his servant, so Moses commanded Joshua. Joshua did so. He left nothing undone of all that the LORD commanded Moses" (11:15).
- KEEP `divine-judgment` — the hardening "that he might utterly destroy them... as the LORD commanded Moses" (11:20).
- KEEP `gods-faithfulness` — "So Joshua took the whole land, according to all that the LORD spoke to Moses" (11:23), and the land rests from war.
- KEEP `inheritance` (adopted list) — "Joshua gave it for an inheritance to Israel according to their divisions by their tribes" (11:23).

Anchor-extension candidates:
- `hardness-of-heart` | Joshua 11:20 | "For it was of the LORD to harden their hearts, to come against Israel in battle" | w0.6 — sibling to Exodus 14:4 (w0.85), extending the divine-hardening register beyond Pharaoh.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — Joshua's dense text chs 13-21 is named there; 11:23 rides the same design; engine-side anchor/lexicon work on that id rides PR-β).

Ceiling / refinement flags: at soft cap 6 after the add (every tag independently clears the bar). SUBDIVIDED in the book doc (11:1–15; 11:16–23) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields). The `hardness-of-heart` ADD rests on a single verse but that verse is the chapter's stated interpretive key (11:20 explains 11:18-19's "There was not a city that made peace"); recorded as a reversible delegated default with the thin-single-verse tension acknowledged — if Jesse prefers leaner tagging it is the first of this chapter's tags to yield (§11.6 class (c)).

## Joshua 12

Existing tags (book doc): none — honest-and-empty.

Applied-tag deltas:
- No changes — re-checked against the full 239-id library and the adopted list: the chapter is a roster of defeated kings ("the king of Jericho, one; the king of Ai, which is beside Bethel, one" (12:9) down to "all the kings thirty-one" (12:24)); no concept's teaching substance is genuinely present. Honest-and-empty preferred over a forced tag.

Anchor-extension candidates: None.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none. Not subdivided.

Decisions record: None.

## Joshua 13 (subdivided: 13:1–7; 13:8–33)

Existing tags (book doc): `gods-faithfulness`, `gods-provision`, `inheritance` (3).

Applied-tag deltas:
- KEEP `gods-faithfulness` — old age and unfinished conquest do not void the promise: "I will drive them out from before the children of Israel. Just allocate it to Israel for an inheritance" (13:6).
- KEEP `gods-provision` — landless Levi is not portionless: "The offerings of the LORD, the God of Israel, made by fire are his inheritance" (13:14); "The LORD, the God of Israel, is their inheritance, as he spoke to them" (13:33).
- KEEP `inheritance` (adopted list) — the allotment commanded and begun (13:6-7), with the Levi statement made twice (13:14, 33).
- No adds. `occult-and-divination` considered and not added: 13:22 records Balaam "the soothsayer" killed — a one-line death notice, no divination substance depicted.

Anchor-extension candidates: None proposed here — the chapter's strongest candidate lines (13:14, 33) are the `inheritance` design's keystone texts and ride the roster routing below rather than being split onto other packs.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — "Joshua's dense text (chs 13-21)" is named in the row; 13:14 and 13:33, "The LORD, the God of Israel, is their inheritance", are keystone anchor material for that design at PR-β).

Ceiling / refinement flags: none (3 tags). SUBDIVIDED in the book doc (13:1–7; 13:8–33 merged range) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 14 (subdivided: 14:1–5; 14:6–15)

Existing tags (book doc): `trust-in-god`, `gods-faithfulness`, `inheritance`, `oaths-and-vows` (4).

Applied-tag deltas:
- ADD `aging-and-old-age` — Caleb's claim is explicitly an old-age-strength text: "Now, behold, I am eighty-five years old, today. As yet I am as strong today as I was in the day that Moses sent me" (14:10-11), still asking for the giants' hill country (14:12). The pack's lexicon carries "strength in old age" and "aging with faith" and its Psalms 92:12-14 keystone ("still bring forth fruit in old age" register) is exactly this narrative's teaching substance; the id entered the vocabulary after the book doc's 131-id vintage.
- KEEP `trust-in-god` — "I wholly followed the LORD my God" (14:8), "It may be that the LORD will be with me, and I shall drive them out, as the LORD said" (14:12).
- KEEP `gods-faithfulness` — "the LORD has kept me alive, as he spoke, these forty-five years" (14:10): a forty-five-year-old promise paid in full.
- KEEP `inheritance` (adopted list) — the division by lot begins "as the LORD commanded by Moses" (14:2); Caleb receives "Hebron... for an inheritance" (14:13).
- KEEP `oaths-and-vows` — "Moses swore on that day, saying, ‘Surely the land where you walked shall be an inheritance to you and to your children forever" (14:9), the sworn word honored forty-five years on (14:10, 13).

Anchor-extension candidates:
- `aging-and-old-age` | Joshua 14:10-12 | "I am eighty-five years old, today. As yet I am as strong today as I was in the day that Moses sent me" | w0.75 — the pack has no narrative anchor; Caleb is the canonical aged-and-still-serving figure.
- `gods-faithfulness` | Joshua 14:10 | "the LORD has kept me alive, as he spoke, these forty-five years" | w0.55 — kept-promise-across-decades register.

Lexicon candidates:
- `aging-and-old-age` | "give me this mountain" / "caleb" | "give me this mountain sermon", "Caleb give me this mountain", "strength in old age like Caleb" — "give me this mountain" is the KJV-remembered phrasing of 14:12's "give me this hill country" (PD wording; consistent with the PD-only famous-phrases default, plan §6 #5).

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `wholehearted-devotion` (roster row 18 — 14:8 "I wholly followed the LORD my God" and 14:14 "because he followed the LORD, the God of Israel wholeheartedly" are that design's Joshua witnesses; the row is DESIGN-RESOLVED toward a loving-god/seeking-god lexicon extension at re-pin — these refs ride that decision, not a new proposal here); routed to backlog: `inheritance` (roster row 26 — 14:9, 13-14 named territory).

Ceiling / refinement flags: none (5 tags after add). SUBDIVIDED in the book doc (14:1–5; 14:6–15) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 15 (subdivided: 15:1–12; 15:13–19; 15:20–63)

Existing tags (book doc): `blessing` (1).

Applied-tag deltas:
- KEEP `blessing` — Achsah asks outright: "Give me a blessing. Because you have set me in the land of the South, give me also springs of water" (15:19), and receives the upper and lower springs. (Only one honest tag from the current vocabulary — re-verified against the full 239-id library and the adopted list; the border and city surveys carry no other concept's teaching substance.)
- No adds. `inheritance` stays off per the book doc's Decisions #18 presence-bar call (border-and-city surveys are not the concept's teaching substance) — re-checked and upheld.

Anchor-extension candidates: None.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none (1 tag). SUBDIVIDED in the book doc (15:1–12; 15:13–19; 15:20–63) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 16

Existing tags (book doc): none — honest-and-empty.

Applied-tag deltas:
- No changes — re-checked against the full 239-id library and the adopted list: border tracing for the children of Joseph, closing on the failure notice "They didn’t drive out the Canaanites who lived in Gezer" (16:10) — an unfinished-obedience motif the book doc already records (motif #12) as having no honest home; no concept's teaching substance is present. Honest-and-empty preferred.

Anchor-extension candidates: None.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none. Not subdivided.

Decisions record: None.

## Joshua 17

Existing tags (book doc): `obedience-to-the-word` (1).

Applied-tag deltas:
- KEEP `obedience-to-the-word` — Zelophehad's daughters appeal to the command: "The LORD commanded Moses to give us an inheritance among our brothers" (17:4), and the leaders carry it out: "according to the commandment of the LORD he gave them an inheritance" (17:4). (Only one honest tag from the current vocabulary.)
- No adds. The Zelophehad's-daughters material was re-checked for a justice/advocacy home: `justice-and-oppression` does not fit (no oppression register); the inheritance substance rides the roster routing below. The 17:14-18 exchange ("the LORD has blessed us so far") remains a complaint premise, not blessing substance — book doc Decisions #8 upheld.

Anchor-extension candidates: None.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — 17:3-6, the daughters' inheritance "among the brothers of their father", is in-scope material for that design at PR-β; the display tag stays off this chapter per the book doc's Decisions #18 presence-bar call, upheld).

Ceiling / refinement flags: none (1 tag). Not subdivided.

Decisions record: None (no yields).

## Joshua 18 (subdivided: 18:1–10; 18:11–28)

Existing tags (book doc): `guidance`, `inheritance` (2).

Applied-tag deltas:
- KEEP `guidance` — the surveyed land is submitted to God's decision: "I will cast lots for you here before the LORD our God" (18:6), "I will cast lots for you here before the LORD in Shiloh" (18:8), done at 18:10.
- KEEP `inheritance` (adopted list) — seven tribes pressed to claim what is theirs: "How long will you neglect to go in to possess the land, which the LORD, the God of your fathers, has given you?" (18:3).
- No adds. `the-house-of-god` considered and not added: 18:1's "set up the Tent of Meeting there" is a placement notice, not the pack's house-of-God teaching register.

Anchor-extension candidates:
- `guidance` | Joshua 18:6-10 | "I will cast lots for you here before the LORD our God" | w0.5 — decision-submitted-to-God narrative; the pack currently has no casting-lots text (Proverbs 16:33 is also absent from the vocabulary), so this is the nearest honest home for "casting lots in the Bible" adjacency.

Lexicon candidates:
- `guidance` | "casting lots" | "casting lots in the Bible", "why did they cast lots", "making decisions God's way" — check-first: the phrase must not hijack Acts 1/Jonah 1 lexical hits; measured-miss gate applies.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — 18:2-3, 10 named territory).

Ceiling / refinement flags: none (2 tags). SUBDIVIDED in the book doc (18:1–10; 18:11–28) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 19

Existing tags (book doc): none — honest-and-empty.

Applied-tag deltas:
- No changes — re-checked against the full 239-id library and the adopted list: six tribal lots plus Joshua's own city, all allotment records. The book doc's Decisions #17 deliberately declined `guidance` here despite the lots-before-the-LORD continuation (ch 18 carries the explicit statements); that reversible call is upheld — 19:51's closing notice ("in Shiloh before the LORD" — reported, not enacted in-chapter as decision-seeking) does not carry the concept's teaching substance. Honest-and-empty preferred.

Anchor-extension candidates: None.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — chs 13-21 named territory; the display tag stays off per the book doc's Decisions #18 presence-bar call, upheld).

Ceiling / refinement flags: none. Not subdivided (book doc Decisions #3: seven Berean headings deliberately not subdivided — navigation, not theme divergence).

Decisions record: None.

## Joshua 20

Existing tags (book doc): `gods-protection`, `cities-of-refuge` (adopted list), `vengeance` (3).

Applied-tag deltas:
- KEEP `gods-protection` — standing sanctuaries ordained so the unintentional killer "may flee there" and "not die by the hand of the avenger of blood, until he stands trial before the congregation" (20:3, 9) — protection written into the land, "for all the children of Israel, and for the alien who lives among them" (20:9).
- KEEP `cities-of-refuge` — the passage itself: "Assign the cities of refuge, of which I spoke to you by Moses, that the man slayer who kills any person accidentally or unintentionally may flee there" (20:2-3), six cities named on both sides of the Jordan (20:7-8).
- KEEP `vengeance` — vengeance restrained by law: "They shall be to you for a refuge from the avenger of blood" (20:3); the elders "shall not deliver up the man slayer into his hand; because he struck his neighbor unintentionally" (20:5).
- No adds. The book doc's Decisions #7 (no `refuge-in-trouble` / `pastoral-refuge-and-justice` — Psalm-register concepts that would misroute pastoral searchers to a legal institution) re-checked and upheld; roster row 25 carries the identical misroute WARNING.

Anchor-extension candidates: None proposed — Joshua 20's anchor material belongs wholly to the `cities-of-refuge` design and rides the routing below (proposing a `vengeance` or `gods-protection` anchor from this chapter now would pre-empt row 25's carried lexicon-extension either/or).

Lexicon candidates: None (same reason — "avenger of blood" / "cities of refuge" terms are row 25's design surface).

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `cities-of-refuge` (roster row 25 — Joshua 20 is the row's named lead text; the standing misroute WARNING against refuge-in-trouble/pastoral-refuge-and-justice and the lexicon-extension either/or are carried there for the re-pin curator).

Ceiling / refinement flags: none (3 tags). Not subdivided.

Decisions record: None (no yields).

## Joshua 21

Existing tags (book doc): `gods-faithfulness`, `gods-provision`, `inheritance` (3).

Applied-tag deltas:
- KEEP `gods-faithfulness` — the book's settled verdict: "Nothing failed of any good thing which the LORD had spoken to the house of Israel. All came to pass" (21:45), with "The LORD gave them rest all around, according to all that he swore to their fathers" (21:44).
- KEEP `gods-provision` — the landless tribe housed and pastured by command: "The LORD commanded through Moses to give us cities to dwell in, with their pasture lands for our livestock" (21:2), forty-eight cities given (21:41).
- KEEP `inheritance` (adopted list) — Levite cities given "out of their inheritance, according to the commandment of the LORD" (21:3), and the land held "which he swore to give to their fathers" (21:43).
- No adds.

Anchor-extension candidates:
- `gods-faithfulness` | Joshua 21:43-45 | "Nothing failed of any good thing which the LORD had spoken to the house of Israel. All came to pass." | w0.85 — the strongest single anchor-extension candidate this book yields: the summary promise-kept verdict over the whole conquest, exactly the pack's "god keeps his promises" register, currently unanchored in any historical book.

Lexicon candidates:
- `gods-faithfulness` | "not one promise failed" | "not one of God's promises failed", "God keeps every promise", "all God's promises came to pass".

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `inheritance` (roster row 26 — 21:43-45 named territory for that design).

Ceiling / refinement flags: none (3 tags). Not subdivided.

Decisions record: None (no yields).

## Joshua 22 (subdivided: 22:1–8; 22:9–34)

Existing tags (book doc): `harmony-with-others`, `worship`, `obedience-to-the-word`, `parenting`, `loving-god` (5).

Applied-tag deltas:
- KEEP `harmony-with-others` — a rush to war stopped by a delegation, a hearing, and an honest answer: Israel "spoke no more of going up against them to war" (22:33).
- KEEP `worship` — the crisis turns on guarding right worship at the one altar "before his tabernacle" (22:29), resolved when the new altar proves "a witness between us and you" (22:27), not a rival.
- KEEP `obedience-to-the-word` — "You have kept all that Moses the servant of the LORD commanded you" (22:2), charged "to keep his commandments, to hold fast to him" (22:5).
- KEEP `parenting` — the altar built for the children's sake: "that your children may not tell our children in time to come, ‘You have no portion in the LORD.’" (22:27).
- KEEP `loving-god` — the parting charge puts love first: "to love the LORD your God, to walk in all his ways, to keep his commandments, to hold fast to him, and to serve him with all your heart and with all your soul" (22:5).
- No adds. `taming-the-tongue`/`judging-others` considered for the confrontation-before-war pattern and not added (the chapter's substance is the resolved dispute, carried by `harmony-with-others`); `individual-responsibility` NOT added — 22:20's "That man didn’t perish alone in his iniquity" teaches the corporate opposite of that pack's Ezekiel 18 register (tagging it would misroute).

Anchor-extension candidates:
- `loving-god` | Joshua 22:5 | "to love the LORD your God, to walk in all his ways, to keep his commandments, to hold fast to him, and to serve him with all your heart and with all your soul" | w0.7 — the pack anchors Deuteronomy 6:5 and 10:12; Joshua 22:5 is the same all-your-heart charge restated at the land's settlement and is currently unanchored.
- `harmony-with-others` | Joshua 22:30-33 | "spoke no more of going up against them to war" | w0.5 — the pack has no narrative anchor; this is Scripture's fullest conflict-averted-by-a-hearing narrative.

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: none (5 tags). SUBDIVIDED in the book doc (22:1–8; 22:9–34) — PER-VERSE REFINEMENT candidate.

Decisions record: None (no yields).

## Joshua 23

Existing tags (book doc): `gods-faithfulness`, `obedience-to-the-word`, `divine-judgment`, `loving-god`, `leadership`, `idolatry` (6 — soft cap).

Applied-tag deltas:
- KEEP `gods-faithfulness` — "not one thing has failed of all the good things which the LORD your God spoke concerning you. All have happened to you" (23:14).
- KEEP `obedience-to-the-word` — "be very courageous to keep and to do all that is written in the book of the law of Moses" (23:6), "hold fast to the LORD your God" (23:8).
- KEEP `divine-judgment` — the same faithfulness cuts both ways: "so the LORD will bring on you all the evil things" (23:15) "when you disobey the covenant" (23:16).
- KEEP `loving-god` — "Take good heed therefore to yourselves, that you love the LORD your God" (23:11).
- KEEP `leadership` — the aged leader's farewell: "Joshua called for all Israel, for their elders and for their heads, and for their judges and for their officers" (23:2) and charged them (23:6).
- KEEP `idolatry` — the charge's central danger: "neither make mention of the name of their gods... neither serve them, nor bow down yourselves to them" (23:7), or the nations become "a snare and a trap to you, a scourge in your sides, and thorns in your eyes" (23:13).
- No adds — at the soft cap and nothing further clears the bar. `victory-in-christ` considered for 23:3, 10 ("it is the LORD your God who fights for you") — anchor material only, not a display tag on OT narrative (see chapter 10); `backsliding` considered and not added (23:12-13 warns against a future turning; the chapter depicts warning, not backsliding).

Anchor-extension candidates:
- `gods-faithfulness` | Joshua 23:14 | "not one thing has failed of all the good things which the LORD your God spoke concerning you" | w0.7 — first-person witness form of the 21:45 verdict ("You know in all your hearts and in all your souls", 23:14).
- `loving-god` | Joshua 23:11 | "Take good heed therefore to yourselves, that you love the LORD your God" | w0.6.
- `victory-in-christ` | Joshua 23:10 | "One man of you shall chase a thousand; for it is the LORD your God who fights for you" | w0.5 — extends the same Exodus 14:13-14 "god fights for us" register (anchor only; no display tag).

Lexicon candidates: None.

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: None.

Ceiling / refinement flags: at soft cap 6 (every tag independently clears the bar). Not subdivided; not a refinement candidate (cap 6 is not the ceiling).

Decisions record: None (no yields).

## Joshua 24 (subdivided: 24:1–13; 24:14–28; 24:29–33)

Existing tags (book doc): `covenant`, `surrender-to-god`, `worship`, `gods-faithfulness`, `obedience-to-the-word`, `idolatry`, `remembrance-and-memorials` (adopted list), `death-and-burial` (adopted list) (8 — hard ceiling).

Applied-tag deltas:
- KEEP `covenant` — "So Joshua made a covenant with the people that day" (24:25), written "in the book of the law of God" with the stone witness (24:26-27).
- KEEP `surrender-to-god` — "choose today whom you will serve... but as for me and my house, we will serve the LORD" (24:15), answered by the people's repeated pledge (24:18, 21, 24).
- KEEP `worship` — exclusive worship pressed: "fear the LORD, and serve him in sincerity and in truth" (24:14), "incline your heart to the LORD, the God of Israel" (24:23).
- KEEP `gods-faithfulness` — the first-person history of promises kept: "I gave you a land on which you had not labored, and cities which you didn’t build" (24:13).
- KEEP `obedience-to-the-word` — the closing vow: "We will serve the LORD our God, and we will listen to his voice" (24:24).
- KEEP `idolatry` — the paradigm put-away text: "Put away the gods which your fathers served" (24:14), the choice pressed again after the vow: "put away the foreign gods which are among you" (24:23).
- KEEP `remembrance-and-memorials` — "this stone shall be a witness against us, for it has heard all the LORD’s words which he spoke to us" (24:27).
- KEEP `death-and-burial` — three burials close the book: Joshua "died, being one hundred ten years old" and buried at Timnathserah (24:29-30); Joseph's bones "brought up out of Egypt" buried in Shechem (24:32); Eleazar buried "in the hill of Phinehas his son" (24:33).
- No adds possible or warranted: the chapter stands at the hard ceiling of 8 with every tag independently clearing the bar. `fear-of-the-lord` (24:14) remains the yielded candidate from the 2026-08-25 pass (§11.6 class (c), thin single-verse on the ceiling chapter) — its survival path is the anchor extension below, exactly the mechanism plan §3.1 designs for dropped-at-chapter-level tags. `leadership` remains yielded (class (b), theme witness carried by chs 1 and 23).

Anchor-extension candidates:
- `fear-of-the-lord` | Joshua 24:14 | "Now therefore fear the LORD, and serve him in sincerity and in truth" | w0.6 — the cap-yielded tag surviving as an exact-range anchor; fear-and-serve covenant register the pack currently lacks.
- `surrender-to-god` | Joshua 24:15 | "choose today whom you will serve... but as for me and my house, we will serve the LORD" | w0.8 — one of the most-quoted surrender texts in Scripture, unanchored in the pack.
- `idolatry` | Joshua 24:14-15 | "Put away the gods which your fathers served" | w0.75 — the paradigm put-away-your-idols narrative alongside the pack's Exodus 32 anchor; 24:23 ("put away the foreign gods which are among you") rides the same design.
- `covenant` | Joshua 24:25-27 | "So Joshua made a covenant with the people that day" | w0.6 — covenant-making enacted with witness stone; sibling to the pack's Exodus 24:3-8 anchor.

Lexicon candidates:
- `surrender-to-god` | "as for me and my house we will serve the lord" / "choose this day whom you will serve" | "as for me and my house meaning", "choose this day whom you will serve", "Joshua 24:15 as for me and my house". NOTE: this endorses the existing Joshua lexicon-extension flag in tag-gaps.md ("as for me and my house we will serve the LORD" → `surrender-to-god`); it does not duplicate the log row. ("choose this day" is the KJV-remembered wording of the WEB's "choose today" — PD phrasing, consistent with plan §6 #5's default.)

New-concept candidates: None.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `remembrance-and-memorials` (roster row 33 — the 24:26-27 witness stone is that design's material); routed to backlog: `death-and-burial` (roster row 22 — "Josh 24" is named in the row; the burial-practice register is unmintable until PR-β).

Ceiling / refinement flags: HARD CEILING 8 HIT. SUBDIVIDED in the book doc (24:1–13; 24:14–28; 24:29–33). PER-VERSE REFINEMENT candidate on both grounds — the strongest in the book.

Decisions record: The two standing §11.6 yields from the 2026-08-25 application pass are re-affirmed, not re-litigated: (1) `fear-of-the-lord` yielded, class (c) thin single-verse (24:14) — survives as the anchor-extension candidate above; (2) `leadership` yielded, class (b) theme-witness-with-caveat — the farewell-charge register is carried by chs 1 and 23. No new yields (nothing added; nothing dropped).

---

# Book-level summary (Joshua, 24/24 chapters swept)

## Vocabulary-reference note (appended per the coordinator's 2026-08-26 update)

The header above cites the BRIEFING §7 reconstruction of the §11.1 adopted vocabulary; the
canonical list now exists at
`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids, each
marked engine-built yes/no) and is this ledger's governing §11.1 reference. Cross-check
performed before the survival audit: every non-engine id used on a tag line or routing in
this ledger — `inheritance`, `cities-of-refuge`, `remembrance-and-memorials`,
`death-and-burial`, `wholehearted-devotion` — appears on the canonical list (each
"engine-built: no"). All other ids used are among the 239 engine ids. No mismatch; no
correction entries required.

## Quote-verification note

Every quotation was verified word-for-word against the pinned VPL
(`pipeline/sources/vpl/engwebp_vpl.txt`, contentSha256 944e3883…), which is one verse per
line; quotations spanning a verse boundary (e.g. Joshua 14:10-11 in the chapter-14 block)
were verified per constituent verse fragment, with the WEB's own wording and punctuation
preserved across the join.

## Totals

- Applied-tag deltas: **7 ADD, 79 KEEP, 0 DROP** across 24 chapters.
  - ADDs: Josh 3 `signs-and-wonders`; Josh 5 `passover`; Josh 6 `signs-and-wonders`;
    Josh 7 `covetousness`; Josh 10 `signs-and-wonders`; Josh 11 `hardness-of-heart`;
    Josh 14 `aging-and-old-age` — all engine ids that postdate the book doc's 131-id
    tagging vintage; each justified in its chapter block.
  - Honest-and-empty chapters re-confirmed: Josh 12, 16, 19 (none forced).
- Anchor-extension candidates: **24** (presence-of-god 1:5; faith 2:9-11; kindness 2:12-14;
  signs-and-wonders 3:13-17, 6:20, 10:12-14; fear-of-the-lord 4:24, 24:14; passover 5:10-12;
  gods-provision 5:11-12; angels 5:13-15; covetousness 7:20-21; obedience-to-the-word
  8:34-35; oaths-and-vows 9:18-20; prayer 10:12-14; victory-in-christ 10:42, 23:10;
  hardness-of-heart 11:20; aging-and-old-age 14:10-12; gods-faithfulness 14:10, 21:43-45,
  23:14; guidance 18:6-10; loving-god 22:5, 23:11; harmony-with-others 22:30-33;
  surrender-to-god 24:15; idolatry 24:14-15; covenant 24:25-27). Count of rows: 27 listed
  in chapter blocks (24 distinct id+range designs; the fear-of-the-lord, victory-in-christ
  and gods-faithfulness ids each carry two ranges).
- Lexicon candidates: **11** rows (fear-not "be strong and courageous" — endorses existing
  tag-gaps flag; faith "rahab"; signs-and-wonders "crossing the jordan", "walls of jericho",
  "the sun stood still"; angels "commander of the lord's army"; sin "hidden sin";
  studying-the-word "public reading of scripture" — endorses existing Deuteronomy flag;
  oaths-and-vows "the gibeonite deception"; victory-in-christ "the lord fought for israel";
  aging-and-old-age "give me this mountain"; gods-faithfulness "not one promise failed";
  guidance "casting lots"; surrender-to-god "as for me and my house" — endorses existing
  tag-gaps flag). All are candidates for the measured-miss alias loop; none is asserted to
  be a gap without measurement.
- New-concept candidates: **0** — every genuine theme found has an honest home among the
  239 engine ids, the adopted list, or the corpus-blocked roster. No tag-gaps.md rows are
  due from this sweep (checked against the existing log, the vocabulary, and the roster).
- Decline-overturn proposals: **0** — no recorded decline was found contradicted by new
  textual evidence; the book doc's own considered-and-dropped calls (Decisions #5-#8, #15,
  #17, #18 skips) were each re-checked and upheld.
- Corpus-blocked routings: **11** routing notes across 5 roster ids — `inheritance`
  (row 26: chs 11, 13, 14, 17, 18, 19, 21), `cities-of-refuge` (row 25: ch 20),
  `remembrance-and-memorials` (row 33: chs 4, 24), `death-and-burial` (row 22: ch 24),
  `wholehearted-devotion` (row 18: ch 14). All ride PR-β; nothing duplicated as a fresh
  proposal.
- Ceiling / soft-cap state after deltas: hard ceiling 8 — ch 24 only; soft cap 6 — chs 1,
  5, 11, 23.
- PER-VERSE REFINEMENT candidates (ceiling-hit or book-doc-subdivided): **chs 5, 8, 10, 11,
  13, 14, 15, 18, 22, 24** (ch 24 flagged on both grounds: hard ceiling + subdivided).

## Final survival audit (CONVENTIONS §9) — 2026-08-26

Re-read of the whole live file after the last content append. Results:

- Chapter blocks: all 24 `## Joshua N` headings present, each exactly once (1–24).
- Header block intact (title, repo SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e, inputs,
  legend); Book-level summary and Vocabulary-reference note present.
- Byte-prefix identity: every pre-append snapshot taken during writing (5 appends) matches
  the live file's corresponding prefix byte-for-byte — no prior bytes were altered by any
  append and no concurrent-thread clobber touched this file.
- Delta counts re-verified mechanically against the live file: 7 ADD / 79 KEEP / 0 DROP;
  11 "routed to backlog" notes; 0 new-concept candidates; 0 decline-overturn proposals.
- Every id used on an ADD/KEEP line resolves against the 239-id engine list
  (concept-ids.txt @ e762d1c) or the canonical §11.1 adopted list
  (tag-apply/adopted-concepts.md); no unresolved or invented ids.
- All WEB quotations verified word-for-word against the pinned VPL (contentSha256
  944e3883…); cross-verse spans verified per constituent verse fragment.
- tag-gaps.md: NOT touched by this thread (no new gap rows due; existing Joshua flags were
  endorsed in-place in this ledger's lexicon rows, not duplicated).

AUDIT RESULT: PASS — all blocks present, prior bytes unchanged, ledger complete.

## Addendum — post-audit quote re-verification (2026-08-26, coordinator directive)

The coordinator flagged that the workers' scratchpad directory is shared across the 12
concurrent book threads and that generic-named temp files there have been clobbered by
siblings. Response, recorded for the audit trail:

- Exposure assessment: every quote verification in this ledger's writing ran `grep -F`
  DIRECTLY against the pinned VPL (`pipeline/sources/vpl/engwebp_vpl.txt`, contentSha256
  944e3883…) — never against a scratchpad temp file — so no verification result depended
  on a clobber-able file. Chunk staging files did use generic names; each append was
  content-checked at append time (Joshua-heading counts, no foreign-book content) and the
  §9 audit's byte-prefix checks passed. All temp files from this point use joshua-prefixed
  names.
- Fresh mechanical re-verification, run after the survival audit with joshua-prefixed temp
  files only: all 243 distinct double-quoted strings were extracted from this live ledger
  and each was checked against the pinned VPL. Result: every string presented as a WEB
  quotation verifies word-for-word. The non-matching remainder classifies exactly as
  expected: legend/meta text, lexicon terms and realistic query phrasings (deliberately
  not WEB text), book-doc/roster citations (e.g. a BSB section title, roster row wording),
  and six spans that cross a verse boundary or use an ellipsis join — each of whose
  constituent fragments was re-verified verbatim against the VPL individually
  (Josh 14:10-11; 20:2-3; 23:7; 24:15; 11:20; 14:13's "Hebron... for an inheritance").
- CORRECTION (one item found by the re-verification): in the Joshua 14 block, the phrase
  "still bring forth fruit in old age", used to describe the `aging-and-old-age` pack's
  Psalms 92:12-14 keystone register, is KJV-remembered wording, not WEB — the WEB reads
  "They will still produce fruit in old age." (Psalms 92:14). The phrase is a register
  descriptor, not a chapter-justification quotation (the chapter's justifying quotes,
  14:10-12, are verbatim WEB and unaffected), but per CONVENTIONS §3 it should not sit in
  quotation marks without this note. Read it as corrected to the WEB wording above; the
  original block text stands unaltered under this file's append-only discipline.

RE-VERIFICATION RESULT: PASS (with the one recorded correction). AUDIT RESULT stands: PASS.
