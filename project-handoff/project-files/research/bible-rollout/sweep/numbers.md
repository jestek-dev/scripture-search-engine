# Numbers sweep ledger — Layer-3 tag sweep (Torah thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: Numbers (36 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/numbers.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/corpus-blocked-roster.md
  - WEB chapter text (verse-numbered, from the pinned-source full-Bible fixture, sourceSha256
    b6f55cc7…, commit 87fd68c): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/web-text/numbers/<chapter>.txt
  - Worker instructions (entry format + verbatim rules): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/sweep-worker-instructions.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Numbers <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")


## Numbers 1
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands. The chapter is a muster roll; the compliance refrain ("As the LORD commanded Moses, so he counted them," 1:19; "According to all that the LORD commanded Moses, so they did," 1:54) is framing formula, not the teaching substance of `obedience-to-the-word`, and the Levites' guard assignment (1:50–53) is duty-roster material, not `priesthood` substance (the priestly-office substance is ch 3's, where the book doc tags it). No concept in the engine library or the roster is genuinely present.
### Anchor-extension candidates
None.
### Lexicon candidates
None.
### New-concept candidates
None. (The book doc's counted-by-name motif, 1:2, 17–19, is captured there as raw feed; "does God know me by name" is not honestly served by a census text and no concept is proposed from it.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 2
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands. The camp-arrangement roster touches God's-dwelling-at-the-center positionally ("the Tent of Meeting shall set out, with the camp of the Levites in the middle of the camps," 2:17) but depicts no concept's teaching substance; `presence-of-god` on a marching-order clause would rest on framing, not on what the chapter depicts (the substantial presence texts are chs 7 and 9, tagged there).
### Anchor-extension candidates
None.
### Lexicon candidates
None.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 3
Existing tags (book doc): `priesthood`
### Applied-tag deltas
- KEEP `priesthood` — the tribe of Levi is given to Aaron's priestly house to serve the sanctuary, with the office guarded on pain of death (3:5–13, 10); the chapter's main subject and an honest match to the pack's priests-in-the-old-testament register.
(No further tag clears the honest-substantial-presence bar: the firstborn-exchange is redemption-substitution material with no vocabulary home — see New-concept candidates — and the census rolls carry no other concept's substance.)
### Anchor-extension candidates
- priesthood | 3:5–10 | "Bring the tribe of Levi near, and set them before Aaron the priest, that they may minister to him" (3:6) | medium — the pack's OT anchors are Exodus 28:1 and Deuteronomy 33:8–11; Numbers 3 is the Levites-given-to-the-priests institution text and strengthens "priests in the old testament" queries.
### Lexicon candidates
None.
### New-concept candidates
- redemption-of-the-firstborn | genuine vocabulary gap: the firstborn-substitution institution ("why did God choose the Levites", "redemption of the firstborn", "pidyon haben in the Bible") has no home — not in the 239-pack index, not in the declines, not on the corpus-blocked roster; Exodus 13:11–15 and Numbers 18:15–16 would join as witnesses | anchor: "I have taken the Levites from among the children of Israel instead of all the firstborn who open the womb among the children of Israel" (3:12), "for all the firstborn are mine. On the day that I struck down all the firstborn in the land of Egypt I made holy to me all the firstborn in Israel" (3:13); the redemption-money provision at 3:44–51.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 4
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands. The duty roster's danger clauses ("they shall not touch the sanctuary, lest they die," 4:15; "they shall not go in to see the sanctuary even for a moment, lest they die," 4:20) touch the handling-of-the-holy topic, but `holiness` is the pursue-holiness register (persons set apart) and `fear-of-the-lord` is the reverence-teaching register — neither's teaching substance is depicted by a packing-and-carrying procedure. Honest-and-empty preferred over stretching.
### Anchor-extension candidates
None.
### Lexicon candidates
None. (The "why couldn't they touch the ark" query family the book doc's motif line captures has no honest lexicon home in the current library — its natural texts, 2 Samuel 6 with Numbers 4:15, would need a concept-level decision first; left as the motif the book doc already records.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 5 (subdivided: 5:1–4, 5:5–10, 5:11–31)
Existing tags (book doc): `repentance`, `clean-and-unclean`
### Applied-tag deltas
- ADD `restitution` — WEB quote: "he shall confess his sin which he has done; and he shall make restitution for his guilt in full, add to it the fifth part of it" (5:7; the no-kinsman provision, 5:8) — a whole restitution statute is this section's teaching substance, not a passing clause; `restitution` is a CONVENTIONS §11.1 adopted id (corpus-blocked roster row 28), legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to corpus-blocked roster row 28 (`restitution`, SKIPPED-blocked) — noted there, not duplicated. This does not touch the Proverbs restitution decline (§3.2 item 3), which was about Prov 6:30–31; Numbers 5:5–10 is restitution teaching proper.
- KEEP `repentance` — confession plus full costly amends (5:6–8) is repentance's practical substance; same call as the book doc's Decision #16 and the Leviticus 6 precedent.
- KEEP `clean-and-unclean` — the defiled put outside the camp "so that they don't defile their camp, in the midst of which I dwell" (5:2–3); the classification-and-exclusion system's substance.
(Considered and not added: `pastoral-betrayal-and-marriage-crisis` stays withheld per the pastoral-register ruling and the book doc's Decision #15 — the jealousy ordeal is a legal procedure about suspicion, not personal-crisis ministry; `oaths-and-vows` — the administered oath of 5:19–22 is a procedural instrument inside the ordeal, not vow teaching; `presence-of-god` — one motive clause (5:3), per Decision #16.)
### Anchor-extension candidates
- repentance | 5:6–7 | "he shall confess his sin which he has done" (5:7) | low — the pack's anchors carry no Torah confession-plus-amends statute; supporting witness only.
### Lexicon candidates
None.
### New-concept candidates
None. (The jealousy-ordeal, 5:11–31, is a curiosity-passage register — "water of bitterness Numbers 5" — already captured as the book doc's motif; not a search-scale concept.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 6 (subdivided: 6:1–21, 6:22–27)
Existing tags (book doc): `blessing`, `benediction`, `holiness`, `surrender-to-god`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `blessing` — the Aaronic blessing itself with God's pledge "and I will bless them" (6:24–27); source text of the theme.
- KEEP `benediction` — the Bible's model benediction given verbatim as the priests' form (6:22–27); the pack anchors Num 6:24–26 itself. (PR #43 id, ratified by Jesse 2026-08-25 per the book doc's Decision #14.)
- KEEP `holiness` — "All the days of his separation he is holy to the LORD" (6:8); consecrated-person substance, the pack's set-apart register.
- KEEP `surrender-to-god` — a freely chosen vow "to separate himself to the LORD" (6:2), yielding food, appearance, and family obligations for a season.
- KEEP `oaths-and-vows` — Scripture's fullest voluntary-vow law (6:1–21); the pack anchors Num 6:1–8 itself.
(Considered and not added: `peace-of-god` for "and give you peace" (6:26) — one clause inside three verses already carrying two tags; agree with the book doc's withhold, Decision #17. `the-name-of-god` for 6:27 — one verse, below the bar as a tag; carried as an anchor-extension candidate below.)
### Anchor-extension candidates
- the-name-of-god | 6:27 | "So they shall put my name on the children of Israel; and I will bless them." | low — the name placed on the people is a distinct witness beside the pack's Exodus/Leviticus anchors; supporting weight only.
### Lexicon candidates
- benediction | make his face shine on you | realistic query phrasings: "what does God's face shine on you mean", "the lord make his face shine upon you", "may his face shine on you"
- oaths-and-vows | nazirite vow | realistic query phrasings: "what is a nazirite vow", "nazirite in the bible", "samson nazirite vow"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 7
Existing tags (book doc): `generosity`, `presence-of-god`
### Applied-tag deltas
- KEEP `generosity` — the princes' freewill gifts for the sanctuary's service ("they brought their offering before the LORD, six covered wagons and twelve oxen," 7:3; twelve days of dedication gifts, 7:10–11); borderline-but-honest per the book doc's Decision #18.
- KEEP `presence-of-god` — the finished tent does what it was built for: "he heard his voice speaking to him from above the mercy seat" (7:89).
(Considered and not added: `worship` — the dedication offerings are a one-time gift narrative, not the ordered-calendar teaching substance the book doc's Decision #29 reserved that id for; `thanksgiving` — no gratitude teaching depicted.)
### Anchor-extension candidates
- presence-of-god | 7:89 | "he heard his voice speaking to him from above the mercy seat that was on the ark of the Testimony, from between the two cherubim" | medium — the pack's anchors are Psalms/NT; the mercy-seat meeting text is the Torah's concrete God-speaks-from-his-dwelling witness.
### Lexicon candidates
None.
### New-concept candidates
None. (The every-gift-recorded-though-identical motif, 7:12–83, stays motif-level raw feed as the book doc captures it.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 8
Existing tags (book doc): `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `sacrifice-and-atonement` — the Levites' installation is atonement-shaped: "you shall offer the one for a sin offering and the other for a burnt offering to the LORD, to make atonement for the Levites" (8:12), their service given "to make atonement for the children of Israel, so that there will be no plague" (8:19). §11.1 adopted id, corpus-blocked roster row 1 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to corpus-blocked roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked); noted there, not duplicated.
(Considered and not added: `surrender-to-god` — "they are wholly given to me" (8:16) is God's claim in the firstborn exchange, an institutional dedication, not a depicted act of personal surrender; `clean-and-unclean` — the cleansing of 8:6–7 is consecration procedure, not the classification system's teaching; `servanthood` — duty assignment, not the serve-one-another register. Honest-and-empty-adjacent restraint preferred over stretching.)
### Anchor-extension candidates
None. (The chapter's atonement material routes to roster row 1, which owns the engine-side design.)
### Lexicon candidates
- aging-and-old-age | retirement | realistic query phrasings: "retirement in the Bible", "what does the Bible say about retirement", "serving God in retirement" — anchor witness in-chapter: "from the age of fifty years they shall retire from doing the work" (8:25), with the assist-their-brothers provision (8:26); no current lexicon carries the term.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 9 (subdivided: 9:1–14, 9:15–23)
Existing tags (book doc): `guidance`, `presence-of-god`, `obedience-to-the-word`, `passover`, `clean-and-unclean`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `guidance` — Israel moves only when God moves: "Whether it was two days, or a month, or a year that the cloud stayed on the tabernacle... the children of Israel remained encamped" (9:17–23).
- KEEP `presence-of-god` — "the cloud covered the tabernacle" with "the appearance of fire by night" (9:15–16), God visibly dwelling with the camp.
- KEEP `obedience-to-the-word` — the refrain "They kept the LORD's command, at the commandment of the LORD by Moses" (9:19, 23); hearing-and-doing as the camp's whole itinerary.
- KEEP `passover` — the wilderness Passover and the instituted second date (9:1–14).
- KEEP `clean-and-unclean` — corpse-defilement shuts men out of the feast and the ruling answers it (9:6–13).
- KEEP `sojourners-and-strangers` — the foreigner welcomed under "one statute, both for the foreigner and for him who is born in the land" (9:14).
(All six independently clear the bar; at the soft cap, no further candidate was close — "Wait, that I may hear what the LORD will command" (9:8) is one verse and its substance is carried by `guidance`.)
### Anchor-extension candidates
- passover | 9:9–14 | "In the second month, on the fourteenth day at evening they shall keep it" (9:11) | medium — the pack's Torah anchors are Exodus 12 / Leviticus 23 / Deuteronomy 16; the second-Passover provision is a distinct institution text.
- guidance | 9:17–23 | "At the commandment of the LORD, the children of Israel traveled, and at the commandment of the LORD they encamped." (9:18) | medium — the pack's anchors are Psalms/Proverbs/Isaiah aphorisms; the cloud narrative is the OT's concrete led-by-God text.
- presence-of-god | 9:15–16 | "The cloud covered it, and the appearance of fire by night." (9:16) | low — supporting Torah witness beside the ch 7 mercy-seat candidate.
### Lexicon candidates
- guidance | when God says wait | realistic query phrasings: "waiting on God's timing", "when God says stay put", "moving when God moves"
- passover | second passover | realistic query phrasings: "second passover in the bible", "missed passover second month", "second chances in the bible feast"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 10 (subdivided: 10:1–10, 10:11–36)
Existing tags (book doc): `guidance`, `gods-protection`
### Applied-tag deltas
- KEEP `guidance` — "The ark of the LORD's covenant went before them three days' journey, to seek out a resting place for them" (10:33), with "The cloud of the LORD was over them by day" (10:34); God concretely leading the way, the pack's direction register.
- KEEP `gods-protection` — the war-alarm's standing promise: "Then you will be remembered before the LORD your God, and you will be saved from your enemies." (10:9); a statute of divine protection, honest though single-verse — it is the trumpet law's own teaching point.
(Considered and not added: `obedience-to-the-word` — "They first went forward according to the commandment of the LORD by Moses" (10:13) is compliance framing formula, the ch 1 precedent; `prayer` — the setting-out and resting invocations (10:35–36) are two liturgical verses, motif-level, not prayer teaching; `appointed-feasts` — 10:10's feast-trumpet clause is one verse inside the signal law; `presence-of-god` — the cloud is one verse here (10:34), substantial in ch 9 where it is tagged.)
### Anchor-extension candidates
- guidance | 10:33–34 | "The ark of the LORD's covenant went before them three days' journey, to seek out a resting place for them." (10:33) | low — supporting witness beside this ledger's ch 9 cloud-narrative candidate.
- gods-protection | 10:9 | "Then you will be remembered before the LORD your God, and you will be saved from your enemies." | low — the pack's anchors are Psalms/Isaiah; a Torah statute witness for saved-from-enemies queries.
### Lexicon candidates
- victory-in-christ | let god arise | realistic query phrasings: "let god arise and his enemies be scattered", "rise up lord and let your enemies be scattered" — in-chapter witness: "Rise up, LORD, and let your enemies be scattered! Let those who hate you flee before you!" (10:35); the pack's lexicon carries "god fights for us" but not this Psalm-68 phrasing family, whose Torah source is this verse.
### New-concept candidates
None. (The Hobab invitation, 10:29–32, stays motif-level raw feed as the book doc captures it — "come with us and we will treat you well" is not a search-scale concept.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 11
Existing tags (book doc): `gods-provision`, `prayer`, `divine-judgment`, `grumbling-and-complaining`, `lament`, `leadership`
### Applied-tag deltas
- ADD `pastoral-hope-in-despair` — WEB quote: "I am not able to bear all this people alone, because it is too heavy for me. If you treat me this way, please kill me right now, if I have found favor in your sight; and don't let me see my wretchedness." (11:14–15) — one man at the end of his rope asks God for death and is answered with real help, not rebuke (11:16–17); genuinely individual, not national-scale, so the pastoral-register ruling permits it (the Num 12 precedent), and it is the same death-wish register as the pack's own 1 Kings 19:4–7 anchor (Elijah under the juniper tree).
- KEEP `gods-provision` — the manna described (11:7–9) and "Has the LORD's hand grown short?" answered with quail (11:23, 31–32); genuine provision substance despite the wrath framing, per the book doc's Decision #20.
- KEEP `prayer` — "Moses prayed to the LORD, and the fire abated" (11:2); prayer that turns judgment, answered directly.
- KEEP `divine-judgment` — the LORD's fire at Taberah (11:1–3) and the plague "While the meat was still between their teeth" (11:33–34).
- KEEP `grumbling-and-complaining` — "The people were complaining in the ears of the LORD" (11:1) and the craving that despises the manna (11:4–6); the murmuring era's onset, the pack's core register.
- KEEP `lament` — Moses' complaint addressed *to* God, "Why have you treated your servant so badly?" (11:11–15); complaint-to-God, distinct from the murmuring-about-God register, per the book doc's own both-tags distinction.
- KEEP `leadership` — the load shared: "they shall bear the burden of the people with you, that you don't bear it yourself alone" (11:17, 24–30).
(Considered and not added: `contentment`, `spiritual-gifts`, `holy-spirit-the-comforter` — all withheld per the book doc's Decision #19 (failure-mode / NT read-back logic), and this sweep agrees; `holy-spirit` — the Spirit-sharing (11:25–29) is a narrated event, not the pack's filled-with-the-Spirit teaching register; `envy-and-jealousy` — "Are you jealous for my sake?" (11:29) is a one-verse rebuke of partisan zeal, not the vice's substance.)
### Anchor-extension candidates
- grumbling-and-complaining | 11:1, 4–6 | "The people were complaining in the ears of the LORD." (11:1) | medium — the murmuring era's onset text beside the pack's Numbers 14:2–4 anchor; direct support for its "murmuring in the wilderness" lexicon register.
- leadership | 11:16–17 | "they shall bear the burden of the people with you, that you don't bear it yourself alone" (11:17) | medium — the pack anchors Exodus 18:13–26, the delegated-load register; this is that register's wilderness twin.
- lament | 11:11–15 | "Why have you treated your servant so badly? Why haven't I found favor in your sight, that you lay the burden of all this people on me?" (11:11) | low — a Torah complaint-addressed-to-God witness beside the pack's Psalms/Lamentations anchors.
- hope-in-despair | 11:14–15 | "please kill me right now, if I have found favor in your sight; and don't let me see my wretchedness" (11:15) | low — same answered-death-wish register as the pack's 1 Kings 19:4–7 anchor; Moses joins Elijah as a servant-of-God witness.
### Lexicon candidates
- gods-provision | has the lords hand grown short | realistic query phrasings: "has the lord's hand grown short", "is god's arm too short", "is anything too hard for god" — in-chapter witness 11:23; no current lexicon carries this sufficiency-of-God phrasing family.
### New-concept candidates
None. (Romanticizing the past, 11:4–6, and "Eldad and Medad", 11:26–29, stay motif-level raw feed as the book doc captures them.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 — 7 tags under the §11.6 allowance (every tag independently clears the bar; hard ceiling 8 not reached)
### Decisions record
None. (The ADD raises the count past the soft cap without any yield — no candidate exceeded the ceiling and nothing was dropped.)

## Numbers 12
Existing tags (book doc): `humble-exaltation`, `pastoral-prayer-for-healing`, `divine-judgment`
### Applied-tag deltas
- ADD `dreams-and-visions` — WEB quote: "If there is a prophet among you, I, the LORD, will make myself known to him in a vision. I will speak with him in a dream." (12:6) — God's own teaching on the modes of revelation (12:6–8), not a topic touch; the pack itself anchors Numbers 12:6, so the concept's source text sits in this chapter untagged.
- KEEP `humble-exaltation` — "Now the man Moses was very humble, more than all the men who were on the surface of the earth" (12:3); the humble man leaves his defense to God and is vindicated while his challengers are humbled (12:6–10), the Genesis-11-precedent call of the book doc's Decision #21.
- KEEP `pastoral-prayer-for-healing` — "Heal her, God, I beg you!" (12:13), one intercessor for one named sufferer, answered with restoration (12:14–15); the genuinely-personal register the pastoral ruling kept (Decision #15).
- KEEP `divine-judgment` — "The LORD's anger burned against them; and he departed... behold, Miriam was leprous, as white as snow" (12:9–10).
(Considered and not added: `slander-and-false-accusation` — Miriam and Aaron "spoke against Moses" (12:1–2), but the pack's register is being lied about; the challenge here is presumption, not false accusation; `taming-the-tongue` — the chapter depicts the offense and its judgment, not guard-my-mouth teaching, the Genesis-3 counter-example logic.)
### Anchor-extension candidates
- humble-exaltation | 12:3 | "Now the man Moses was very humble, more than all the men who were on the surface of the earth." | medium — the pack has no Moses anchor; the Bible's superlative humility text, directly serving its "humility" lexicon register.
### Lexicon candidates
None. (The "God spoke to Moses face to face" query family, 12:8 "mouth to mouth", is real but has no honest single home in the current library — its natural texts span Exodus 33:11 and Deuteronomy 34:10; left as the motif the book doc records.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 13
Existing tags (book doc): `trust-in-god`, `doubt`
### Applied-tag deltas
- KEEP `trust-in-god` — Caleb's lone confidence against the majority report: "Let's go up at once, and possess it; for we are well able to overcome it!" (13:30); one verse but the chapter's hinge, per the book doc's Decision #22.
- KEEP `doubt` — "We aren't able to go up against the people; for they are stronger than we" (13:31), the evil report reading the land through fear rather than promise (13:28–29, 31–33); the chapter depicts unbelief prevailing, the concept's substance (PR #43 id, ratified by Jesse 2026-08-25 per the book doc's Decision #14).
(Considered and not added: `fear-not` — "Be courageous" (13:20) is one clause of the sending instructions; the fear-and-courage material is ch 14's, where it is tagged; `gods-provision` — the fruit of the land (13:23–27) is evidence in the narrative, not provision teaching.)
### Anchor-extension candidates
- doubt | 13:28–33 | "We aren't able to go up against the people; for they are stronger than we." (13:31) | medium — the pack's only anchors are two NT texts (Mark 9:23–24, James 1:5–6); the spies' report is the OT's classic narrative of doubt prevailing over promise.
- trust-in-god | 13:30 | "Let's go up at once, and possess it; for we are well able to overcome it!" | low — single-verse witness; ch 14 carries the fuller Joshua-and-Caleb material.
### Lexicon candidates
- doubt | grasshoppers in our own sight | realistic query phrasings: "we were like grasshoppers", "grasshopper mentality in the bible", "feeling small and inadequate bible" — in-chapter witness: "We were in our own sight as grasshoppers, and so we were in their sight." (13:33); no current lexicon carries the phrase.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 14 (subdivided: 14:1–12, 14:13–19, 14:20–39, 14:40–45)
Existing tags (book doc): `trust-in-god`, `fear-not`, `prayer`, `forgiveness-of-sins`, `divine-judgment`, `grumbling-and-complaining`, `slow-to-anger`
### Applied-tag deltas
- KEEP `trust-in-god` — "If the LORD delights in us, then he will bring us into this land, and give it to us" (14:8); Joshua and Caleb stake everything on God against the congregation.
- KEEP `fear-not` — "neither fear the people of the land... the LORD is with us. Don't fear them" (14:9); the courage plea grounded in God's presence.
- KEEP `prayer` — Moses' intercession on God's name and glory (14:13–19), answered directly: "I have pardoned according to your word" (14:20).
- KEEP `forgiveness-of-sins` — "Please pardon the iniquity of this people according to the greatness of your loving kindness" (14:19) and the pardon granted (14:20).
- KEEP `divine-judgment` — "Your dead bodies shall fall in this wilderness" (14:29), forty years for forty days (14:34), the spies' plague (14:36–37), and the rout at Hormah (14:45).
- KEEP `grumbling-and-complaining` — "All the children of Israel murmured against Moses and against Aaron" (14:2) and God's own summary, "this evil congregation that complain against me" (14:27); the pack anchors 14:2–4 itself.
- KEEP `slow-to-anger` — "The LORD is slow to anger, and abundant in loving kindness" pleaded in prayer and answered with pardon (14:18–20); the pack anchors Numbers 14:18 itself.
(Considered and not added: `mercy` — the loving-kindness plea is carried by `slow-to-anger` and `forgiveness-of-sins` on the same verses; broad-duplicating-specific at cap pressure. `testing` — "tempted me these ten times" (14:22) is Israel testing God; the pack's register is God testing his people. `gods-faithfulness` — the promise kept to the children (14:31) is one thread inside the judgment speech; ch 26 is its Numbers home in the book doc.)
### Anchor-extension candidates
- prayer | 14:13–19 | "Please pardon the iniquity of this people according to the greatness of your loving kindness" (14:19) | medium — the pack's lexicon carries "intercession" but its anchors hold no OT intercession narrative; this is the locus classicus, answered in the text (14:20).
- forgiveness-of-sins | 14:20 | "I have pardoned according to your word" | low — a narrative pardon-granted witness beside the pack's Psalms/prophets anchors.
- fear-not | 14:9 | "the LORD is with us. Don't fear them." | low — supporting OT narrative witness for the presence-grounded courage register.
### Lexicon candidates
None. (Plain "intercession" phrasings already live in `prayer`'s lexicon; no unserved query family surfaced.)
### New-concept candidates
None. (Presumption after disobedience, 14:40–45, stays motif-level raw feed as the book doc captures it.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 — 7 tags under the §11.6 allowance (every tag independently clears the bar; hard ceiling 8 not reached)
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 15 (subdivided: 15:1–21, 15:22–31, 15:32–36, 15:37–41)
Existing tags (book doc): `forgiveness-of-sins`, `obedience-to-the-word`, `sabbath-rest`, `sacrifice-and-atonement`, `sojourners-and-strangers`
### Applied-tag deltas
- ADD `tithing` — WEB quote: "Of the first of your dough, you shall give to the LORD a wave offering throughout your generations." (15:21) — a discrete firstfruits statute (15:17–21), the pack's "firstfruits" lexicon register; the Ezekiel-block precedent (declines §3.5) routes firstfruits material to `tithing`.
- KEEP `forgiveness-of-sins` — the unintentional-sin refrain: "He shall make atonement for him; and he shall be forgiven" (15:28; 15:25–26).
- KEEP `obedience-to-the-word` — the fringes turn sight into doing: "that you may see it, and remember all the LORD's commandments, and do them" (15:39–40).
- KEEP `sabbath-rest` — the Sabbath-breaker held until the LORD himself rules (15:32–36); the honest-presence call of the book doc's Decision #23 stands — a "sabbath" searcher genuinely wants this hard case.
- KEEP `sacrifice-and-atonement` — the ritual means beneath the pardon (15:22–29). §11.1 adopted id, corpus-blocked roster row 1 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked); noted there, not duplicated.
- KEEP `sojourners-and-strangers` — "As you are, so the foreigner shall be before the LORD" (15:15; 15:14–16, 26, 29–30); one law for native and foreigner across offerings, forgiveness, and judgment.
(Considered and not added: `sin` — the high-hand passage (15:30–31) is served via the lexicon candidate below rather than a sixth-plus tag whose broad register the specific tags already cover; `holiness` — "and be holy to your God" (15:40) is one clause carried inside the fringes command, already tagged `obedience-to-the-word`; `hope-in-god` — "When you have come into the land" (15:2) is framing the book doc's summary signposts, not hope teaching.)
### Anchor-extension candidates
- tithing | 15:20–21 | "Of the first of your dough you shall offer up a cake for a wave offering." (15:20) | low — a firstfruits witness beside the pack's Leviticus 27:30 Torah anchor.
- hospitality | 15:14–16 | "As you are, so the foreigner shall be before the LORD." (15:15) | low — the pack already anchors Leviticus 19:33–34's treat-the-stranger-as-native statute; register check (equal-standing statute vs welcome practice) left to the curator, and `sojourners-and-strangers` holds the display tag either way.
### Lexicon candidates
- forgiveness-of-sins | sin with a high hand | realistic query phrasings: "what is sinning with a high hand", "deliberate vs unintentional sin in the bible", "is there a sin god won't forgive in the old testament" — in-chapter witness: "But the soul who does anything with a high hand, whether he is native-born or a foreigner, blasphemes the LORD." (15:30); XOR-target note for the curator: `sin` is the alternative home, but the chapter's own frame is the forgivable/unforgivable boundary.
- obedience-to-the-word | tassels on garments | realistic query phrasings: "why did israelites wear tassels", "tzitzit in the bible", "tassels on garments meaning" — in-chapter witness 15:38–39 (the WEB's "fringes"); no current lexicon carries the tassel/fringe family.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 16 (subdivided: 16:1–35, 16:36–50)
Existing tags (book doc): `humble-exaltation`, `envy-and-jealousy`, `divine-judgment`, `prayer`, `grumbling-and-complaining`, `priesthood`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `humble-exaltation` — self-promotion toward the priesthood answered by God bringing the challengers down: "the man whom the LORD chooses, he shall be holy" (16:7), the earth swallowing the exalters (16:31–33); the Genesis-11-precedent call of the book doc's Decision #21.
- KEEP `envy-and-jealousy` — Korah's company cannot bear Aaron's portion: "Is it a small thing to you that the God of Israel has separated you from the congregation of Israel, to bring you near to himself... Do you seek the priesthood also?" (16:9–10).
- KEEP `divine-judgment` — "The earth opened its mouth and swallowed them up with their households" (16:32), "Fire came out from the LORD, and devoured the two hundred fifty men" (16:35), and the plague's fourteen thousand seven hundred (16:49).
- KEEP `prayer` — two intercessions stand between Israel and destruction: "shall one man sin, and will you be angry with all the congregation?" (16:22), and on their faces again as wrath goes out (16:45–46).
- KEEP `grumbling-and-complaining` — "What is Aaron that you complain against him?" (16:11) and the next-day accusation "You have killed the LORD's people!" (16:41).
- KEEP `priesthood` — the office contested and confirmed: the censer test "the LORD will show who are his, and who is holy" (16:5), and the hammered censers' warning "that no stranger who isn't of the offspring of Aaron, would come near to burn incense before the LORD" (16:40).
- KEEP `sacrifice-and-atonement` — Aaron's incense atonement in the plague's midst: "He stood between the dead and the living; and the plague was stayed" (16:47–48). §11.1 adopted id, corpus-blocked roster row 1 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked); noted there, not duplicated.
(Considered and not added: `leadership` — the chapter depicts rebellion against God-given leaders, the concept's failure mode, the Genesis-3 counter-example logic; `mortality` — the descent "alive into Sheol" (16:33) is narrated event, not mortality teaching, and the Ezekiel-block precedent keeps Sheol texts out of read-back registers; `holiness` — "he shall be holy" (16:7) is the dispute's test formula, carried inside `priesthood`.)
### Anchor-extension candidates
- priesthood | 16:5–10, 40 | "In the morning, the LORD will show who are his, and who is holy" (16:5) | medium — the office contested-and-confirmed narrative beside the pack's Exodus 28:1 / Deuteronomy 33:8–11 anchors; strengthens "priests in the old testament" queries.
- envy-and-jealousy | 16:9–10 | "Do you seek the priesthood also?" (16:10) | low — a discontent-with-assignment witness beside the pack's Genesis 4 / Genesis 37 / 1 Samuel 18 anchors.
- prayer | 16:22 | "God, the God of the spirits of all flesh, shall one man sin, and will you be angry with all the congregation?" | low — a second Numbers intercession-narrative witness, joining this ledger's ch 14 candidate.
### Lexicon candidates
- prayer | stood between the dead and the living | realistic query phrasings: "aaron stood between the dead and the living", "standing in the gap in the bible", "intercession that stops judgment" — in-chapter witness 16:48; converges with the Ezekiel block's recorded "standing in the gap" lexicon-extension flag on `prayer` (declines §3.5, Ezek 22:30) — one curation decision should take both texts together.
### New-concept candidates
None. (The censers-as-warning motif, 16:38–40, stays motif-level raw feed as the book doc captures it.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 — 7 tags under the §11.6 allowance (every tag independently clears the bar; hard ceiling 8 not reached)
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 17
Existing tags (book doc): `priesthood`, `grumbling-and-complaining`
### Applied-tag deltas
- KEEP `priesthood` — God's signature on the priest he chose: "behold, Aaron's rod for the house of Levi had sprouted, budded, produced blossoms, and bore ripe almonds" (17:8).
- KEEP `grumbling-and-complaining` — the sign exists to end the murmuring: "I will make the murmurings of the children of Israel, which they murmur against you, cease from me" (17:5), the rod kept "for a token against the children of rebellion" (17:10).
(Considered and not added: `signs-and-wonders` — the budding rod is a miracle-sign, but its substance here is the confirmation of the office, carried by `priesthood`; a tag would rest on the event's genre rather than the pack's miracles-testify register; `fear-of-the-lord` — the closing terror "Behold, we perish!" (17:12–13) is dread the next chapter answers, not reverence teaching. Only two honest tags from the current vocabulary.)
### Anchor-extension candidates
- priesthood | 17:8, 10 | "behold, Aaron's rod for the house of Levi had sprouted, budded, produced blossoms, and bore ripe almonds" (17:8) | medium — the divine-confirmation-of-the-office text; directly serves "aaron's rod" and how-God-marks-his-priest queries.
### Lexicon candidates
- priesthood | aarons rod | realistic query phrasings: "aaron's rod that budded", "aaron's budding rod meaning", "why did aaron's rod bud" — in-chapter witness 17:8; no current lexicon carries the phrase.
### New-concept candidates
None. (The "how do I know God has called someone" query family the book doc's motif line captures routes to `priesthood`'s confirmation register via the candidates above, not to a new id.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 18
Existing tags (book doc): `tithing`, `gods-provision`, `priesthood`
### Applied-tag deltas
- KEEP `tithing` — "To the children of Levi, behold, I have given all the tithe in Israel for an inheritance, in return for their service" (18:21), and the Levites' own "a tithe of the tithe" from its best (18:26–29).
- KEEP `gods-provision` — the landless priests' living is God himself: "I am your portion and your inheritance among the children of Israel" (18:20), with every named portion "as a portion forever" (18:8, 11, 19); the book doc's Decision #25 call stands.
- KEEP `priesthood` — the office as gift and burden: "you and your sons with you shall bear the iniquity of your priesthood" (18:1), the Levites given "that there be no more wrath on the children of Israel" (18:5–7).
(Considered and not added: `covenant` — "It is a covenant of salt forever before the LORD" (18:19) is one formula clause, served via the lexicon candidate below; `inheritance` (§11.1 adopted id, corpus-blocked roster row 26) — the chapter's teaching is provision-in-place-of-land ("You shall have no inheritance in their land," 18:20), carried by `gods-provision`; the land-allotment register the book doc tags on chs 26, 27, 34, 36 is not depicted here — if pursued anyway, it routes to roster row 26, not to a fresh proposal.)
### Anchor-extension candidates
- tithing | 18:21–29 | "To the children of Levi, behold, I have given all the tithe in Israel for an inheritance, in return for their service which they serve" (18:21); "a tithe of the tithe" (18:26) | medium — the pack's Torah anchor is Leviticus 27:30 alone; the Levites'-tithe institution and the tithe-of-the-tithe are distinct teaching texts.
- gods-provision | 18:20 | "I am your portion and your inheritance among the children of Israel." | medium — the institution source of the "the LORD is my portion" family; the pack holds no portion text.
- supporting-gospel-workers | 18:21, 31 | "for it is your reward in return for your service in the Tent of Meeting" (18:31) | low — the pack's 1 Corinthians 9:11–14 anchor argues from the temple-service principle this chapter institutes; an OT witness for "should ministers be paid" queries (the extension runs OT→NT; no tag is applied, so no read-back).
### Lexicon candidates
- covenant | covenant of salt | realistic query phrasings: "what is a covenant of salt", "covenant of salt meaning" — in-chapter witness 18:19; no current lexicon carries the phrase.
- gods-provision | the lord is my portion | realistic query phrasings: "the lord is my portion", "god is my portion and my inheritance" — in-chapter witness 18:20; XOR-target note for the curator: the family's devotional loci (Psalms 73:26; Lamentations 3:24) sit in other packs' anchor space (`strength-in-weakness` et al.), so the routing wants one deliberate decision.
### New-concept candidates
None new. (The firstborn-redemption provision, "you shall surely redeem the firstborn of man... for five shekels of money" (18:15–16), joins this ledger's ch 3 `redemption-of-the-firstborn` new-concept candidate as a witness — recorded there, not re-proposed.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 19
Existing tags (book doc): `clean-and-unclean`
### Applied-tag deltas
- KEEP `clean-and-unclean` — the chapter is the system's remedy statute: "He who touches the dead body of any man shall be unclean seven days" (19:11), with the ash-water sprinkled on the third and seventh days as the way back to clean (19:12, 17–19) and the cut-off sanction for the man who stays unclean (19:13, 20); the pack's ceremonially-unclean register, whole-chapter substance. (Only one honest tag from the current vocabulary.)
(Considered and not added: `sacrifice-and-atonement` — 19:9's "It is a sin offering." is a single-verse designation and the rite's substance here is purification from death-defilement, carried by `clean-and-unclean`; agree with the book doc's Decision #50 skip. `sojourners-and-strangers` — 19:10 is one statute-application clause, the #50 skip stands. `mortality` — the chapter regulates death's defilement but depicts no mortality teaching (why we die, life's brevity); honest-and-empty on that register. `holiness` and `restoration` stay withheld per Decision #26.)
### Anchor-extension candidates
- clean-and-unclean | 19:11–19 | "He who touches the dead body of any man shall be unclean seven days." (19:11) | medium — the pack's anchors (Deuteronomy 14:3–21; Leviticus 11; Leviticus 10:10; Mark 7; Acts 10) carry the food-and-classification registers but no corpse-defilement text; Numbers 19 is that register's statute and directly serves "why did touching a dead body make you unclean" queries.
### Lexicon candidates
- clean-and-unclean | red heifer | realistic query phrasings: "red heifer in the Bible", "what is the red heifer", "water of purification meaning" — in-chapter witness: "a red heifer without spot, in which is no defect, and which was never yoked" (19:2), the ashes kept "for use in water for cleansing impurity" (19:9); no current lexicon carries the phrase family.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 20 (subdivided: 20:1–13, 20:14–21, 20:22–29)
Existing tags (book doc): `gods-provision`, `divine-judgment`, `grumbling-and-complaining`, `priesthood`
### Applied-tag deltas
- KEEP `gods-provision` — God's word stands amid the quarrel: "You shall bring water to them out of the rock" (20:8), and "water came out abundantly" for congregation and livestock (20:11).
- KEEP `divine-judgment` — the sentence on the leaders in God's own words: "therefore you shall not bring this assembly into the land which I have given them" (20:12), "because you rebelled against my word at the waters of Meribah" (20:24).
- KEEP `grumbling-and-complaining` — the waterless quarrel: "Why have you brought the LORD's assembly into this wilderness, that we should die there, we and our animals?" (20:4; 20:2–5).
- KEEP `priesthood` — the office handed on before death: "strip Aaron of his garments, and put them on Eleazar his son" (20:26), done "in the sight of all the congregation" (20:27–28).
(Considered and not added: `doubt` — "Because you didn't believe in me" (20:12) names unbelief in a single verdict clause; the chapter depicts the failure and its sentence, carried by `divine-judgment`, not doubt's teaching substance — the ch 13 spies' narrative is the book's honest `doubt` chapter. `pastoral-grief-and-loss` stays withheld per the pastoral-register ruling and Decision #15 — the thirty-day weeping (20:29) is national mourning, "even all the house of Israel". `death-and-burial` (§11.1 adopted id, corpus-blocked roster row 22) — Miriam's burial notice (20:1) is one verse and Aaron's death scene is office-transfer narrative, below the burial-practice bar; noted against roster row 22, not proposed. `leadership` — the succession here is the priestly office itself, carried by `priesthood`; ch 27 is the book's leadership-succession chapter.)
### Anchor-extension candidates
- gods-provision | 20:8–11 | "You shall bring water to them out of the rock; so you shall give the congregation and their livestock drink." (20:8) | medium — the pack's anchors carry no water-from-the-rock text; the Meribah provision (with Exodus 17's twin) serves "water from the rock" queries the lexicon row below names.
- grumbling-and-complaining | 20:2–5 | "Why have you made us to come up out of Egypt, to bring us in to this evil place?" (20:5) | low — a supporting Meribah witness beside the pack's Numbers 14:2–4 and Exodus anchors.
### Lexicon candidates
- gods-provision | water from the rock | realistic query phrasings: "water from the rock in the Bible", "God brings water from the rock", "waters of Meribah" — in-chapter witness 20:8, 11; no current lexicon carries the phrase family.
- divine-judgment | moses strikes the rock | realistic query phrasings: "why couldn't Moses enter the promised land", "what was Moses' sin at Meribah", "Moses strikes the rock" — in-chapter witness 20:10–12; XOR-target note for the curator: the query family is narrative-curiosity about the verdict, and `obedience-to-the-word` ("you rebelled against my word," 20:24) is the alternative home — one deliberate routing wanted.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 21 (subdivided: 21:1–3, 21:4–9, 21:10–20, 21:21–35)
Existing tags (book doc): `sin`, `repentance`, `prayer`, `gods-provision`, `fear-not`, `grumbling-and-complaining`
### Applied-tag deltas
- KEEP `sin` — "The people spoke against God and against Moses" (21:5) and the wages follow at once: "The LORD sent venomous snakes among the people... Many people of Israel died" (21:6).
- KEEP `repentance` — the people own it plainly: "We have sinned, because we have spoken against the LORD and against you" (21:7).
- KEEP `prayer` — "Pray to the LORD, that he take away the serpents from us." Moses prayed for the people (21:7), and the remedy follows.
- KEEP `gods-provision` — the well at Beer given by promise: "Gather the people together, and I will give them water" (21:16), received with singing (21:17–18).
- KEEP `fear-not` — before Og's army: "Don't fear him, for I have delivered him into your hand" (21:34).
- KEEP `grumbling-and-complaining` — the discouraged detour's complaint: "there is no bread, there is no water, and our soul loathes this disgusting food!" (21:5; 21:4–5).
(Considered and not added: `oaths-and-vows` — 21:2's in-scene vow is single-verse, the Decision #50 skip stands. `victory-in-christ` — the Sihon and Og victories are God-given ("I have delivered him into your hand," 21:34), but the pack's id and register are Christ-framed and NT-worded; tagging the Amorite wars with it would be a later-revelation read-back, and the courage substance is carried by `fear-not`. No tag on the bronze serpent beyond the chapter's own sin/repentance/prayer frame — the John 3 connection stays signposted-only per the standing ruling (book doc Decision #36); no `salvation` or `the-cross` read-back.)
### Anchor-extension candidates
- repentance | 21:7 | "We have sinned, because we have spoken against the LORD and against you." | low — the pack's anchors carry no OT narrative confession; a supporting confession-and-relief witness.
- gods-provision | 21:16–18 | "Gather the people together, and I will give them water." (21:16) | low — the well at Beer beside this ledger's ch 20 rock candidate; supporting witness.
- fear-not | 21:34 | "Don't fear him, for I have delivered him into your hand, with all his people, and his land." | low — a Torah battle-assurance witness beside the pack's Joshua 1:9 anchor.
### Lexicon candidates
None. (The "bronze serpent in the Bible" / "snake on a pole meaning" query family has no honest home in the current vocabulary — routing it to any existing pack would either stretch a register or adjudicate the John 3 reading; it is carried by the new-concept candidate below and, failing that, stays the book doc's motif.)
### New-concept candidates
- bronze-serpent | genuine vocabulary gap: a heavily searched single-narrative institution ("bronze serpent in the Bible", "snake on a pole meaning", "look and live") with no home in the 239-pack index, the adopted list, or the roster; 2 Kings 18:4 (Nehushtan destroyed) would join as a witness. CAUTION for any future gist: signposted-only per the standing ruling — the oracle of the text is the Numbers remedy itself, and the John 3:14 connection must be offered as a curation note, never adjudicated in the gist (no messianic/NT read-back); alternative disposition if declined: remains motif-level raw feed as the book doc captures it | anchor: "Make a venomous snake, and set it on a pole. It shall happen that everyone who is bitten, when he sees it, shall live." (21:8); "when he looked at the serpent of bronze, he lived" (21:9).
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 22 (subdivided: 22:1–21, 22:22–41)
Existing tags (book doc): `gods-protection`, `sin`, `angels`, `occult-and-divination`
### Applied-tag deltas
- KEEP `gods-protection` — the hired curse is overruled before Israel ever learns of the plot: "You shall not curse the people, for they are blessed" (22:12).
- KEEP `sin` — the angel's charge, "your way is perverse before me" (22:32), and Balaam's own "I have sinned" (22:34).
- KEEP `angels` — "The donkey saw the LORD's angel standing in the way, with his sword drawn in his hand" (22:23), the adversary encounter of 22:22–35 ending with Balaam's eyes opened (22:31).
- KEEP `occult-and-divination` — divination for hire is the premise: the elders come "with the rewards of divination in their hand" (22:7), and not "his house full of silver and gold" (22:18) could buy a curse beyond the LORD's word.
(Considered and not added: `obedience-to-the-word` stays withheld per the book doc's Decision #27 — Balaam's compliance is constrained, not the concept's hearing-and-doing substance; this sweep agrees. `blessing` — "for they are blessed" (22:12) is one clause here; the blessing substance is chs 23–24's, tagged there. `pleasing-god-not-people` — Balaam's refusal formula sits inside a way God calls perverse; the failure-mode logic bars the tag.)
### Anchor-extension candidates
- angels | 22:22–35 | "The donkey saw the LORD's angel standing in the way, with his sword drawn in his hand" (22:23) | medium — the pack's OT anchors (Exodus 3:2; Genesis 16:7–12) carry no adversary-in-the-way narrative; the Balaam road scene directly serves "the angel of the lord" queries.
- occult-and-divination | 22:7, 17–18 | "The elders of Moab and the elders of Midian departed with the rewards of divination in their hand." (22:7) | medium — the pack's anchors are statutes (Leviticus 19; Deuteronomy 18) and the Endor/Acts narratives; the Bible's fullest divination-for-hire narrative is a distinct register (converges with the tag-gaps Balaam appends the book doc's delivery record notes).
### Lexicon candidates
- angels | balaams donkey | realistic query phrasings: "Balaam's donkey", "talking donkey in the Bible", "why did God get angry when he had told Balaam to go" — in-chapter witness 22:22–33; no current lexicon carries the family, and the scene's substance is the angel encounter.
- occult-and-divination | balaam | realistic query phrasings: "who was Balaam in the Bible", "Balaam in the Bible", "fortune tellers in the Bible" — in-chapter witness 22:5–7; the pack's lexicon carries "fortune telling" but no Balaam entry point.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 23
Existing tags (book doc): `blessing`, `gods-faithfulness`, `gods-protection`, `gods-unchanging-nature`
### Applied-tag deltas
- KEEP `blessing` — the contest's whole turn: "How shall I curse whom God has not cursed?" (23:8); "I took you to curse my enemies, and behold, you have blessed them altogether" (23:11); "He has blessed, and I can't reverse it" (23:20).
- KEEP `gods-faithfulness` — "Has he said, and he won't do it? Or has he spoken, and he won't make it good?" (23:19); what God has spoken he performs.
- KEEP `gods-protection` — no hired power can touch them: "Surely there is no enchantment with Jacob; neither is there any divination with Israel" (23:23).
- KEEP `gods-unchanging-nature` — the oracle's bedrock: "God is not a man, that he should lie, nor a son of man, that he should repent" (23:19–20); the pack anchors Numbers 23:19 itself.
(Considered and not added: `occult-and-divination` — 23:23 is one verse whose in-chapter register is protection, per the book doc's Decision #50 skip; agree. `power-of-gods-word` — the word-performed substance of 23:19–20 is carried by `gods-faithfulness` and `gods-unchanging-nature` on the same verses; a third tag there would be broad-duplicating-specific. `messianic-prophecy` — "The shout of a king is among them" (23:21) is one clause; no read-forward.)
### Anchor-extension candidates
- blessing | 23:7–10, 19–24 | "Behold, I have received a command to bless. He has blessed, and I can't reverse it." (23:20) | medium — the pack's anchors carry no irrevocable-blessing contest text; serves "he whom you bless is blessed" and cannot-be-reversed queries.
- gods-faithfulness | 23:19 | "Has he said, and he won't do it? Or has he spoken, and he won't make it good?" | low — CAUTION for the curator: `gods-unchanging-nature` already anchors Numbers 23:19; one text feeding two packs wants a single deliberate routing decision, not a double claim.
- gods-protection | 23:23 | "Surely there is no enchantment with Jacob; neither is there any divination with Israel." | low — a no-curse-can-land witness beside the pack's Psalms anchors.
### Lexicon candidates
- gods-unchanging-nature | god cannot lie | realistic query phrasings: "God cannot lie verse", "God is not a man that he should lie", "can God lie" — in-chapter witness 23:19; the pack's lexicon carries "does god change" but not the cannot-lie family (Titus 1:2 and Hebrews 6:18 would join as witnesses at curation).
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 24
Existing tags (book doc): `blessing`, `dreams-and-visions`
### Applied-tag deltas
- KEEP `blessing` — the third oracle caps the cycle: "it pleased the LORD to bless Israel" (24:1), "How goodly are your tents, Jacob, and your dwellings, Israel!" (24:5), closing on the Abraham formula "Everyone who blesses you is blessed. Everyone who curses you is cursed." (24:9).
- KEEP `dreams-and-visions` — "the Spirit of God came on him" (24:2) and the seer formula, "who sees the vision of the Almighty, falling down, and having his eyes open" (24:4, 16); the pack's visions register, and its own lexicon carries "visions".
(Considered and not added: `messianic-prophecy` — the star oracle (24:17) is signposted-only per the standing ruling and the book doc's Decision #37; the oracle names Moab and Edom, and the messianic reading is offered to curation as a note below, never tagged. `holy-spirit` — 24:2's Spirit-comes-on-him is a one-verse narrated event, not the pack's filled-with-the-Spirit teaching register. `nations-and-peoples` — the closing sayings over Amalek, the Kenites, and Kittim (24:20–24) are brief oracles, below the bar for the pack's origin-of-nations register. Two honest tags from the current vocabulary; honest-and-thin preferred over stretching.)
### Anchor-extension candidates
- dreams-and-visions | 24:2–4, 15–16 | "who hears the words of God, who sees the vision of the Almighty, falling down, and having his eyes open" (24:4) | low — the pack anchors Numbers 12:6 (this book's revelation-modes teaching); Balaam's seer formula is a supporting witness.
(No anchor proposed for 24:17 — "A star will come out of Jacob. A scepter will rise out of Israel" is offered to curation as a NOTE only: routing it into `messianic-prophecy`'s anchors would adjudicate the messianic reading the signpost ruling reserves; the "star out of Jacob meaning" query family is recorded in the book doc's motif line and waits on that curation call.)
### Lexicon candidates
- blessing | how goodly are your tents | realistic query phrasings: "how goodly are your tents O Jacob", "ma tovu in the Bible" — in-chapter witness 24:5; no current lexicon carries the phrase.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 25
Existing tags (book doc): `sin`, `divine-judgment`, `covenant`, `idolatry`, `priesthood`, `zeal-for-god`
### Applied-tag deltas
- KEEP `sin` — the seduction and its wages: "the people began to play the prostitute with the daughters of Moab" (25:1) and "Those who died by the plague were twenty-four thousand" (25:9).
- KEEP `divine-judgment` — "Israel joined himself to Baal Peor, and the LORD's anger burned against Israel" (25:3): public sentence on the ringleaders (25:4–5) and the plague on the congregation (25:8–9).
- KEEP `covenant` — God's grant to Phinehas: "Behold, I give to him my covenant of peace" (25:12), "the covenant of an everlasting priesthood" (25:13).
- KEEP `idolatry` — the apostasy itself: "The people ate and bowed down to their gods" (25:2) until Israel is joined to Baal Peor (25:3).
- KEEP `priesthood` — the crisis answered by the office's perpetual grant to Aaron's grandson and his offspring after him (25:11–13).
- KEEP `zeal-for-god` — what the text itself commends: God's own verdict, "he was jealous with my jealousy" (25:11), "because he was jealous for his God, and made atonement for the children of Israel" (25:13). §11.1 adopted id, corpus-blocked roster row 36 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to roster row 36 (`zeal-for-god`, SKIPPED-blocked — Num 25:7–13 is that row's whole case, its vigilante-violence gist CAUTION already carried there); noted there, not duplicated.
(Considered and not added: `sacrifice-and-atonement` — 25:13's atonement clause is single-verse at cap pressure, carried by `zeal-for-god` and `priesthood` on the same verses; the book doc's Decision #50 skip stands. `pastoral-sexual-purity` stays withheld per the pastoral-register ruling and Decision #15 — national-scale apostasy under corporate judgment, not an individual purity crisis. `envy-and-jealousy` — the declines file's Zechariah note binds: God's own jealousy is not the human vice, and that pack "must NOT receive these refs".)
### Anchor-extension candidates
- covenant | 25:12–13 | "Behold, I give to him my covenant of peace." (25:12) | low — the pack's Torah anchors carry no covenant-of-peace text; supporting witness for the phrase family the lexicon row below names.
(The Phinehas material itself routes to roster row 36 (`zeal-for-god`), which owns the engine-side design.)
### Lexicon candidates
- covenant | covenant of peace | realistic query phrasings: "covenant of peace meaning", "what is the covenant of peace in the Bible" — in-chapter witness 25:12; no current lexicon carries the phrase (Isaiah 54:10 and Ezekiel 34:25 would join as witnesses at curation).
(The "who was Phinehas in the Bible" / "zeal for God" query family belongs to roster row 36's eventual pack and is recorded there by the tag-gaps `zeal-for-god` row — not re-proposed here.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
None.

## Numbers 26
Existing tags (book doc): `gods-faithfulness`, `divine-judgment`, `inheritance`
### Applied-tag deltas
- KEEP `gods-faithfulness` — God's word held exactly in both directions: "For the LORD had said of them, 'They shall surely die in the wilderness.' There was not a man left of them, except Caleb the son of Jephunneh, and Joshua the son of Nun." (26:64–65); the book doc's Decision #28 register call stands.
- KEEP `divine-judgment` — the wilderness sentence fully executed in the census's bottom line (26:64–65), with Korah's company remembered: "the earth opened its mouth, and swallowed them up together with Korah... and they became a sign" (26:10).
- KEEP `inheritance` — the census turns to allotment: "To the more you shall give the more inheritance, and to the fewer you shall give the less inheritance" (26:54), divided by lot and by family (26:52–56). §11.1 adopted id, corpus-blocked roster row 26 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to roster row 26 (`inheritance`, SKIPPED-blocked — its blocked refs already include Num 26–36); noted there, not duplicated.
(Considered and not added: `mercy` — "Notwithstanding, the sons of Korah didn't die." (26:11) is one verse of mercy-inside-judgment, motif-level; the book doc's motif line carries the "did Korah's children die" query family. `waiting-for-a-child` and other name-notice candidates (Serah, Jochebed) — census-roll notices, no concept substance.)
### Anchor-extension candidates
- gods-faithfulness | 26:63–65 | "For the LORD had said of them, 'They shall surely die in the wilderness.'" (26:65) | low — a word-kept-in-threat-and-promise witness beside the pack's promise-keeping anchors; the register question (fidelity in both directions vs promise-keeping only, book doc Decision #28) rides along for the curator.
### Lexicon candidates
None. (The "who were the sons of Korah" query family, 26:11, is narrative-curiosity with no honest concept home; it stays the book doc's motif.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 27 (subdivided: 27:1–11, 27:12–23)
Existing tags (book doc): `pastoral-refuge-and-justice`, `prayer`, `inheritance`, `leadership`
### Applied-tag deltas
- ADD `shepherds-and-the-flock` — WEB quote: "who may go out before them, and who may come in before them, and who may lead them out, and who may bring them in, that the congregation of the LORD may not be as sheep which have no shepherd" (27:17) — Moses' prayer frames the whole leadership need in the pack's shepherd-as-leader register, the OT source of the sheep-without-a-shepherd formula; genuine substance, not a topic touch, alongside `leadership` per the both-tags ruling (the imagery vs the succession act).
- KEEP `pastoral-refuge-and-justice` — five women with no male protector bring their cause to God's court and are vindicated in full: "The daughters of Zelophehad speak right. You shall surely give them a possession of an inheritance among their father's brothers." (27:7); genuinely individual, the register the pastoral ruling and the book doc's Decision #15 kept.
- KEEP `prayer` — Moses' intercession for the people's future: "Let the LORD, the God of the spirits of all flesh, appoint a man over the congregation" (27:16), answered directly (27:18).
- KEEP `inheritance` — the daughters' case becomes a standing order for all Israel — daughter, then brothers, then uncles, then nearest kinsman (27:8–11), "a statute and ordinance for the children of Israel" (27:11). §11.1 adopted id, corpus-blocked roster row 26 — legal as a display tag. ROUTED engine-side: roster row 26 (`inheritance`, SKIPPED-blocked) owns the pack design; noted there, not duplicated.
- KEEP `leadership` — succession done well: "Take Joshua the son of Nun, a man in whom is the Spirit, and lay your hand on him" (27:18), commissioned before Eleazar and all the congregation (27:19, 22–23).
(Considered and not added: `guidance` — the Urim provision (27:21) is one verse of procedure. `obedience-to-the-word` — "Moses did as the LORD commanded him" (27:22) is compliance formula, the ch 1 precedent. `mortality` — "you also shall be gathered to your people" (27:13) is a death notice inside the succession frame, not mortality teaching. `holy-spirit` — "a man in whom is the Spirit" (27:18) is a one-clause description, carried inside `leadership`.)
### Anchor-extension candidates
- shepherds-and-the-flock | 27:16–17 | "that the congregation of the LORD may not be as sheep which have no shepherd" (27:17) | medium — the pack's anchors carry no sheep-without-a-shepherd text though the NT formula (Matthew 9:36; Mark 6:34) descends from this scene and 1 Kings 22:17 / Zechariah 10:2 join as witnesses; directly serves the lexicon family below.
- leadership | 27:15–23 | "Take Joshua the son of Nun, a man in whom is the Spirit, and lay your hand on him." (27:18) | medium — the pack anchors Exodus 18:13–26 (delegation) but no succession-and-commissioning narrative; serves "leadership succession in the Bible" queries.
### Lexicon candidates
- shepherds-and-the-flock | sheep without a shepherd | realistic query phrasings: "sheep without a shepherd meaning", "like sheep without a shepherd", "sheep without a shepherd in the Bible" — in-chapter witness 27:17; no current lexicon carries the phrase.
- leadership | passing the torch | realistic query phrasings: "leadership succession in the Bible", "passing leadership to the next generation", "raising up the next generation of leaders" — in-chapter witness 27:18–23. (The "laying on of hands" query family was checked and NOT proposed here — its search intent spans ordination, healing, and gifts (Acts 6:6; 1 Timothy 4:14) and routing it wholesale to `leadership` would misroute; left for a cross-book curation decision.)
### New-concept candidates
None. (The "daughters of Zelophehad" / "women's inheritance in the Bible" query family is served by roster row 26's eventual `inheritance` pack — the tag-gaps row already carries Num 27:1–11 with the daughters-inheriting note — and by the tags above; not a fresh proposal.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None. (The ADD brings the chapter to 5 tags, under the soft cap; no yield.)

## Numbers 28
Existing tags (book doc): `worship`, `passover`, `appointed-feasts`
### Applied-tag deltas
- KEEP `worship` — the offering calendar is the chapter's entire subject, ordered commanded devotion "in their due season": "See that you present my offering, my food for my offerings made by fire, as a pleasant aroma to me, in their due season" (28:2), daily (28:3–8), Sabbath (28:9–10), monthly (28:11–15), and festival (28:16–31); the book doc's Decision #29 register call stands.
- KEEP `passover` — the feast fixed in the standing calendar: "In the first month, on the fourteenth day of the month, is the LORD's Passover." (28:16), with its seven days — "Unleavened bread shall be eaten for seven days." (28:17) — bracketed by holy convocations (28:18, 25).
- KEEP `appointed-feasts` — the spring appointed times each with their convocation and work ban: Passover and unleavened bread (28:16–25) and "the day of the first fruits... in your feast of weeks" (28:26–31); the pack itself anchors Numbers 28:16–31.
(Considered and not added: `sacrifice-and-atonement` — the book doc's Decision #50 skip stands: "to make atonement for you" (28:22, 30) are formula clauses inside the calendar, carried by `worship`; engine-side the atonement register belongs to roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked — its blocked refs already include Numbers), noted there, not duplicated. `sabbath-rest` — 28:9–10 prescribes the Sabbath's offering quantities, not the rest-and-holiness teaching the pack carries. `tithing` / `gods-provision` — no presence.)
### Anchor-extension candidates
- passover | 28:16–25 | "In the first month, on the fourteenth day of the month, is the LORD's Passover." (28:16) | low — the pack's Torah anchors (Exodus 12; Leviticus 23:4–8; Deuteronomy 16:1–8) carry the institution and calendar; the Numbers restatement with its full offering schedule is a supporting witness (converges with the tag-gaps `passover` row's delivered Num 28:16–25 append).
### Lexicon candidates
- appointed-feasts | feast of weeks | realistic query phrasings: "feast of weeks in the Bible", "what is the feast of weeks", "day of firstfruits meaning" — in-chapter witness 28:26; the pack's lexicon carries "feast of tabernacles" and "feast of booths" but no weeks/firstfruits family.
(The "morning and evening sacrifice" / "daily sacrifice in the Bible" query family, 28:3–8, was checked and NOT proposed: no current pack's register honestly serves it — `worship`'s anchors are praise-and-bowing texts and routing the family there would misroute; it stays the book doc's motif-level raw feed.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 29
Existing tags (book doc): `worship`, `appointed-feasts`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `worship` — a chapter of appointed worship: each seventh-month observance is a holy convocation with commanded offerings (29:1–6, 7–11, 12–38), closing "You shall offer these to the LORD in your set feasts" (29:39); the book doc's Decision #29 register call stands.
- KEEP `appointed-feasts` — the seventh month's appointed times in full: "It is a day of blowing of trumpets to you." (29:1), the tenth day's convocation (29:7–11), "You shall keep a feast to the LORD seven days." (29:12), and the eighth day's "solemn assembly" (29:35).
- KEEP `sacrifice-and-atonement` — the tenth day's atonement rites: "You shall afflict your souls" (29:7) with a goat "in addition to the sin offering of atonement" (29:11). §11.1 adopted id, corpus-blocked roster row 1 — legal as a display tag. ROUTED engine-side: any pack/anchor work on this finding belongs to roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked — its recorded blockers already name the Numbers material and the `atonement` token question); noted there, not duplicated.
(Considered and not added: `fasting` — "You shall afflict your souls. You shall do no kind of work" (29:7) is the affliction idiom without any depicted or taught fasting practice; tagging would import the traditional identification the book doc's Decision #39 deliberately keeps out of the summary. `thanksgiving` / `generosity` — "in addition to your vows and your free will offerings" (29:39) is one closing clause, not either concept's substance.)
### Anchor-extension candidates
- appointed-feasts | 29:1–40 | "You shall offer these to the LORD in your set feasts—in addition to your vows and your free will offerings" (29:39) | medium — the pack anchors Numbers 28:16–31 (the spring feasts) but nothing in the seventh-month calendar, and its lexicon's own "feast of tabernacles" / "feast of booths" terms have no offerings-text anchor this full: trumpets (29:1–6), the tenth day (29:7–11), and the seven-day feast with its eighth-day assembly (29:12–38).
### Lexicon candidates
- appointed-feasts | day of blowing of trumpets | realistic query phrasings: "Feast of Trumpets in the Bible", "day of blowing of trumpets meaning", "Rosh Hashanah in the Bible" — in-chapter witness 29:1; no current lexicon carries the trumpets-feast family.
(The "Day of Atonement offerings" query family, 29:7–11, belongs to roster row 1's eventual `sacrifice-and-atonement` pack — its Lev 16 spine is that row's blocked core — and is noted there, not proposed here.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 30
Existing tags (book doc): `honesty`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `oaths-and-vows` — the whole vow statute, worked out for men, daughters, wives, and widows: "When a man vows a vow to the LORD, or swears an oath to bind his soul with a bond, he shall not break his word. He shall do according to all that proceeds out of his mouth." (30:2); the pack itself anchors Numbers 30:2.
- KEEP `honesty` — the chapter's governing rule is the kept word — "he shall not break his word" (30:2) — the integrity-of-speech substance the book doc's Decision #30 names; the finer-grained institution rides `oaths-and-vows` beside it (the both-tags registers genuinely differ: the kept word vs the vow institution).
(Considered and not added: `care-for-widows` — "But the vow of a widow, or of her who is divorced, everything with which she has bound her soul shall stand against her." (30:9) is one procedural verse, not the care-and-defense register. `godly-marriage` — the husband-and-wife provisions (30:6–15) are household-authority case law, not marriage teaching. `integrity` — the kept-word substance is already carried by `honesty` on the same verse; broad-duplicating-specific.)
### Anchor-extension candidates
- oaths-and-vows | 30:3–15 | "But if her husband made them null and void in the day that he heard them... Her husband has made them void. The LORD will forgive her." (30:12) | low — the pack anchors 30:2 alone; the annulment-and-forgiveness case law ("The LORD will forgive her, because her father has forbidden her," 30:5; "then he shall bear her iniquity," 30:15) serves can-a-vow-be-released queries no anchor currently reaches.
- honesty | 30:2 | "he shall not break his word. He shall do according to all that proceeds out of his mouth." | low — CAUTION for the curator: `oaths-and-vows` already anchors Numbers 30:2; one text feeding two packs wants a single deliberate routing decision, not a double claim.
### Lexicon candidates
- oaths-and-vows | rash vow | realistic query phrasings: "rash vows in the Bible", "what if I made a rash promise to God", "can a vow to God be canceled" — in-chapter witness "the rash utterance of her lips" (30:6, 8); the pack's lexicon carries "keep your vows" but no rash-vow or release family (Judges 11 and Ecclesiastes 5:4–5 would join as witnesses at curation).
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 31
Existing tags (book doc): `divine-judgment`, `gods-protection`, `vengeance`, `clean-and-unclean`
### Applied-tag deltas
- KEEP `divine-judgment` — the campaign is God's own sentence, grounded in Peor: "these caused the children of Israel, through the counsel of Balaam, to commit trespass against the LORD in the matter of Peor" (31:16), executed "as the LORD commanded Moses" (31:7).
- KEEP `vengeance` — the commanded register, belonging to the LORD and executed only at his word: "Avenge the children of Israel on the Midianites." (31:2), "to execute the LORD's vengeance on Midian" (31:3); the register care the tag-gaps row's note requires (commanded, never private revenge) is preserved in the book doc's wording.
- KEEP `gods-protection` — the officers' count after battle: "Your servants have taken the sum of the men of war who are under our command, and there lacks not one man of us." (31:49), answered with a thank offering "to make atonement for our souls before the LORD" (31:50).
- KEEP `clean-and-unclean` — war's defilement handled by statute: "Encamp outside of the camp for seven days." (31:19), with purification of persons, garments, and spoil — "everything that may withstand the fire, you shall make to go through the fire, and it shall be clean; nevertheless it shall be purified with the water for impurity" (31:23).
(Considered and not added: `warfare` — §11.1 adopted id, corpus-blocked roster row 30; the row's register is the Deuteronomy conduct-of-war statutes, and this chapter is a single commanded campaign narrative whose statute material (31:19–24 purification; 31:25–47 division of spoil) is carried by `clean-and-unclean` and the summary — ROUTED: the war-conduct finding is noted to roster row 30 (`warfare`, SKIPPED-blocked, which also carries the bare-"warfare" lexicon-collision warning), not tagged or duplicated. `occult-and-divination` — "They also killed Balaam the son of Beor with the sword." (31:8) and 31:16 are death-and-backstory notices, not divination substance in-chapter (the same logic as the book doc's Decision #50 `idolatry` skip on 31:16). `sacrifice-and-atonement` — 31:50's atonement clause is single-verse, quoted inside the `gods-protection` justification per Decision #50; engine-side it belongs to roster row 1. `mortality` — "Afterward you shall be gathered to your people." (31:2) is one clause. `priesthood` — Phinehas with the vessels (31:6) and Eleazar's statute (31:21) are supporting presence, not the office's teaching substance here.)
### Anchor-extension candidates
- vengeance | 31:2–3 | "Avenge the children of Israel on the Midianites." (31:2) | medium — the pack's anchors (Romans 12:19–21; Deuteronomy 32:35; Leviticus 19:18) are vengeance-is-the-LORD's teaching texts; the commanded-execution narrative is the register the tag-gaps row's both-registers note asks the pack to account for (converges with that row's delivered Num 31:2–3 append).
- gods-protection | 31:49–50 | "there lacks not one man of us" (31:49) | low — a protection-in-battle outcome witness beside the pack's Psalms anchors; serves "God's protection in battle" queries.
- clean-and-unclean | 31:19–24 | "everything that may withstand the fire, you shall make to go through the fire, and it shall be clean" (31:23) | low — the pack's anchors are the food and general purity statutes; the war-defilement purification is a distinct application witness (converges with the tag-gaps row's delivered Num 31:19–24 append).
### Lexicon candidates
None. (The "how did Balaam die" query family, 31:8, 16, converges with this ledger's ch 22 `occult-and-divination` Balaam lexicon candidate — witnessed there, not re-proposed.)
### New-concept candidates
None. (The division-of-spoil rule, 31:25–30, was checked: fighters-and-congregation equity is a real motif but not a plausible search-scale concept; it stays raw feed, and the conduct-of-war register routes to roster row 30 as noted above.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 32
Existing tags (book doc): `sin`, `harmony-with-others`
### Applied-tag deltas
- ADD `inheritance` — WEB quote: "We will not return to our houses until the children of Israel have all received their inheritance." (32:18); "We will pass over armed before the LORD into the land of Canaan, and the possession of our inheritance shall remain with us beyond the Jordan." (32:32) — the chapter is the Bible's first executed land allotment: the conditional grant "then afterward you shall return... Then this land shall be your possession before the LORD" (32:22) and the assignment of "the kingdom of Sihon king of the Amorites, and the kingdom of Og king of Bashan" (32:33); genuine institutional substance, not a topic touch, completing the book doc's chs 26, 27, 34, 36 sequence (ch 32 was not in the 2026-08-25 worklist). §11.1 adopted id, corpus-blocked roster row 26 — legal as a display tag. ROUTED engine-side: roster row 26 (`inheritance`, SKIPPED-blocked — its blocked refs already include Num 26–36) owns the pack design; noted there, not duplicated.
- KEEP `sin` — Moses reads the request against the spies' rebellion ("Behold, you have risen up in your fathers' place, an increase of sinful men," 32:14) and stamps the agreement with "be sure your sin will find you out" (32:23).
- KEEP `harmony-with-others` — the book doc's Decision #31 borderline call stands on evaluation: a looming breach between brothers ("Shall your brothers go to war while you sit here?", 32:6) resolved into sworn mutual obligation (32:16–27) is the concept's practical substance in narrative form, not a mere treaty notice.
(Considered and not added: `covetousness` — the tribes ask for conquered land through the appointed mediator; no wanting-what-belongs-to-others is depicted. `obedience-to-the-word` — "Your servants will do as my lord commands." (32:25) is compliance to Moses within the negotiation, the ch 1 formula precedent. `grumbling-and-complaining` — the murmuring history is retold as warning (32:8–13), not re-enacted; the practice is not depicted in-chapter.)
### Anchor-extension candidates
- sin | 32:23 | "But if you will not do so, behold, you have sinned against the LORD; and be sure your sin will find you out." | medium — the pack's anchors are all NT teaching texts and its lexicon's own "consequences of sin" family has no OT narrative witness; 32:23 is a heavily searched sentence in its own right.
### Lexicon candidates
- sin | your sin will find you out | realistic query phrasings: "your sin will find you out meaning", "be sure your sin will find you out", "hidden sin exposed" — in-chapter witness 32:23; no current lexicon carries the phrase.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None. (The ADD brings the chapter to 3 tags, under the soft cap; no yield.)

## Numbers 33 (subdivided: 33:1–49, 33:50–56)
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands, per the book doc's Decisions #32 and #50. The itinerary (33:1–49) is a bare stage list whose providence resonance rests on framing, not depicted substance; in the occupation charge (33:50–56), "destroy all their stone idols, destroy all their molten images, and demolish all their high places" (33:52) and "You shall inherit the land by lot according to your families" (33:54) are single command clauses (the Decision #50 skips for `idolatry` and `inheritance` stand), and the warning "those you let remain of them will be like pricks in your eyes and thorns in your sides" (33:55) with "as I thought to do to them, so I will do to you" (33:56) is a two-verse consequence clause that depicts no current concept's teaching substance. No concept in the engine library, the adopted list, or the roster is genuinely present at chapter grain.
### Anchor-extension candidates
None.
### Lexicon candidates
None. (The "pricks in your eyes and thorns in your sides meaning" query family, 33:55, has no honest home in the current vocabulary — routing it to `obedience-to-the-word` would anchor a failure-warning to a hearing-and-doing register; it stays the book doc's motif-level raw feed.)
### New-concept candidates
None genuinely new. (ROUTED: the written journey record — "Moses wrote the starting points of their journeys by the commandment of the LORD." (33:2) — matches the memorial-record register of corpus-blocked roster row 33 (`remembrance-and-memorials`, SKIPPED-blocked); Num 33:1–2 is noted to that row as a witness candidate for its eventual pack, not proposed fresh and not tagged — the chapter records the practice in one notice without memorial teaching substance.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 34
Existing tags (book doc): `inheritance`
### Applied-tag deltas
- KEEP `inheritance` — the land drawn on the map before possession: "this is the land that shall fall to you for an inheritance, even the land of Canaan according to its borders" (34:2), assigned "to the nine tribes, and to the half-tribe" (34:13) with named dividers — "These are the names of the men who shall divide the land to you for inheritance: Eleazar the priest, and Joshua the son of Nun." (34:17). §11.1 adopted id, corpus-blocked roster row 26 — legal as a display tag. ROUTED engine-side: roster row 26 (`inheritance`, SKIPPED-blocked — Num 26–36 already among its blocked refs) owns the pack design; noted there, not duplicated. (Only one honest tag from the current vocabulary.)
(Considered and not added: `gods-faithfulness` — the border survey signals the promise nearing fulfillment only by framing; the chapter depicts no keeping-of-word substance (the ch 33 `providence` logic, book doc Decision #32). `leadership` — the prince-per-tribe roster (34:18–29) is administrative appointment, not the pack's leading-and-serving teaching register. `nations-and-peoples` — border names are geography, not the origin-of-nations register.)
### Anchor-extension candidates
None. (Engine-side anchor work for the borders material belongs to roster row 26's eventual pack.)
### Lexicon candidates
None. (The "boundaries of the promised land" / "map of Canaan in the Bible" query family, 34:1–12, belongs to roster row 26's eventual `inheritance` pack — the tag-gaps row already carries Num 34:2, 13–18 — and is noted there, not proposed here.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Numbers 35 (subdivided: 35:1–8, 35:9–34)
Existing tags (book doc): `pastoral-refuge-and-justice`, `sin`, `cities-of-refuge`, `vengeance`
### Applied-tag deltas
- KEEP `pastoral-refuge-and-justice` — the register-borderline call the book doc's Decision #15 recorded stands on evaluation: the institution protects the individual man slayer — "The cities shall be for your refuge from the avenger, that the man slayer not die until he stands before the congregation for judgment." (35:12), "The congregation shall deliver the man slayer out of the hand of the avenger of blood" (35:25) — with doors open "for the children of Israel, for the stranger, and for the foreigner living among them" (35:15); individual-protection-with-due-process substance, the personal register the pastoral ruling kept here.
- KEEP `cities-of-refuge` — the founding statute: "then you shall appoint for yourselves cities to be cities of refuge for you, that the man slayer who kills any person unwittingly may flee there" (35:11), six cities (35:13–14), murder and accident distinguished (35:16–24), no ransom (35:31–32), "for a statute and ordinance to you throughout your generations" (35:29). §11.1 adopted id, corpus-blocked roster row 25 — legal as a display tag. ROUTED engine-side: roster row 25 (`cities-of-refuge`, SKIPPED-blocked — Num 35 among its blocked refs; the standing misroute WARNING against `refuge-in-trouble` / `pastoral-refuge-and-justice` and the lexicon-extension either/or already carried there) owns the design; noted there, not duplicated. The adjacency tension with the kept pastoral tag above is the book doc's own flagged-for-Jesse record (Decision #50); this sweep leaves both standing per the never-silently-drop rule.
- KEEP `sin` — the closing weight on bloodguilt: "for blood pollutes the land. No atonement can be made for the land for the blood that is shed in it, but by the blood of him who shed it." (35:33).
- KEEP `vengeance` — blood-vengeance regulated and restrained: "The avenger of blood shall himself put the murderer to death. When he meets him, he shall put him to death." (35:19), bounded by the refuge cities (35:26–28), the congregation's judgment (35:24), and the witness rule — "but one witness shall not testify alone against any person so that he dies" (35:30).
(Considered and not added: `justice-and-oppression` — the due-process provisions are homicide procedure, not the pack's oppression-of-the-poor / corrupt-courts register. `image-of-god` — the no-ransom sanctity-of-life rule (35:31, 33) never grounds itself in the image; tagging would import Genesis 9:6's rationale. `priesthood` — the high-priest's-death provision (35:25, 28, 32) is one recurring clause inside the refuge institution, the Decision #50 skip. `presence-of-god` — "for I, the LORD, dwell among the children of Israel" (35:34) is a one-clause motive, the ch 2 precedent. `sojourners-and-strangers` — 35:15 is a single verse carried inside the pastoral justification, the Decision #50 skip.)
### Anchor-extension candidates
- vengeance | 35:19–27 | "The avenger of blood shall himself put the murderer to death. When he meets him, he shall put him to death." (35:19) | medium — the pack's anchors carry no avenger-of-blood text; Scripture's regulation-and-restraint of blood-vengeance is the second register the tag-gaps row's both-registers note names (converges with that row's delivered Num 35:19–27 append).
- sin | 35:33 | "for blood pollutes the land. No atonement can be made for the land for the blood that is shed in it, but by the blood of him who shed it." | low — a consequences-of-sin witness in the bloodguilt register; supporting only, and the curator should weigh it against the ch 32:23 candidate rather than take both.
### Lexicon candidates
None. (The "avenger of blood meaning" / "manslaughter vs murder in the Bible" / "cities of refuge in the Bible" query families belong to roster row 25's eventual pack — the tag-gaps `cities-of-refuge` append already carries Num 35:9–34 with the either/or lexicon flag — and are noted there, not proposed here.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
None.

## Numbers 36
Existing tags (book doc): `obedience-to-the-word`, `inheritance`
### Applied-tag deltas
- KEEP `obedience-to-the-word` — more than compliance formula: "The daughters of Zelophehad did as the LORD commanded Moses" (36:10) — the ruling they themselves sought in ch 27, they submit to when it constrains their own freedom (36:11–12); the hearing-and-doing substance the book doc's Decision #33 anchored on the Genesis 6:22/7:5 logic.
- KEEP `inheritance` — the closing case law binds inheritance to the father's tribe: "So shall no inheritance of the children of Israel move from tribe to tribe" (36:7), with the validated petition — "The tribe of the sons of Joseph speak what is right." (36:5) — and the one condition, "Let them be married to whom they think best, only they shall marry into the family of the tribe of their father." (36:6). §11.1 adopted id, corpus-blocked roster row 26 — legal as a display tag. ROUTED engine-side: roster row 26 (`inheritance`, SKIPPED-blocked — its blocked refs already include Num 36) owns the pack design; noted there, not duplicated.
(Considered and not added: `godly-marriage` — 36:6's marry-within-the-tribe condition is inheritance case law, not marriage teaching. `wisdom-from-god` — the LORD's ruling is legislation, not the pack's asking-for-wisdom register. `family-reconciliation` — no estrangement is present.)
### Anchor-extension candidates
- obedience-to-the-word | 36:10 | "The daughters of Zelophehad did as the LORD commanded Moses" | low — the pack's OT anchors are teaching texts (1 Samuel 15:22; Isaiah 1:19–20); a narrative did-as-commanded witness where the doing costs the doers something, supporting only.
### Lexicon candidates
None. (The "daughters of Zelophehad marriage" query family is served by roster row 26's eventual `inheritance` pack — the tag-gaps row carries Num 36:1–12 with the daughters-inheriting note from ch 27 — and by the tags above; not proposed here.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
None.

## Corrigenda — chapters 1–18 vs the 15 late-arriving adopted ids (2026-08-26)

This corrigendum exists because the chapters 1–18 sweeps ran before the canonical §11.1 adopted list (`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`, reconstructed 2026-08-26) was available, against a narrower legal tag universe (concept-index.md's 239 engine ids + the 50-row corpus-blocked roster only); 15 adopted engine-built:no ids — `confession-of-sin`, `death-of-a-believer`, `eternal-life`, `false-teachers`, `freedom-in-christ`, `gentleness-of-christ`, `gods-delight-in-his-people`, `living-for-gods-glory`, `new-birth`, `outpouring-of-the-spirit`, `sovereignty-of-god`, `sowing-and-reaping`, `speaking-in-tongues`, `the-branch`, `walking-in-truth` — were outside that universe and could not be tagged. Chapters 1–18 are here re-evaluated against those 15 ids only, presence bar first; the original entries above stand unedited (append-only).

- **ADD — Numbers 5: `confession-of-sin`.** WEB quote: "then he shall confess his sin which he has done; and he shall make restitution for his guilt in full" (5:7) — confession is the statute's own commanded first act of the remedy for every trespass case in the section (5:5–10), not a passing mention; the same statute-family substance as the Leviticus ledger's corrigenda REVERSAL restoring `confession-of-sin` on Leviticus 5 ("he shall confess that in which he has sinned," Lev 5:5 — that precedent's presence-bar reasoning applies verbatim here). The tag complements the sitting `repentance` KEEP on the same verses (whose recorded anchor-extension candidate, `repentance | 5:6–7`, stands unchanged): both genuinely apply per the §11.2 both-tags ruling — `repentance` carries the turning-plus-costly-amends substance, `confession-of-sin` the say-the-sin-aloud act a "confession of sin in the Bible" searcher wants — and `restitution` (the original sweep's ADD) carries the repayment mechanics. Display tag only; the id is engine-built: no with NO corpus-blocked roster row, so engine-side it remains an adopted vocabulary-addition candidate for the fixtures-first flow — nothing to route, nothing engine-side emitted. Ch 5 now stands at 4 tags (`repentance`, `clean-and-unclean`, `restitution`, `confession-of-sin`) — under the soft cap 6, each tag independently clearing the bar; no §11.6 yield required.
- Numbers 1 — no change — none of the 15 meet the presence bar.
- Numbers 2 — no change — none of the 15 meet the presence bar.
- Numbers 3 — no change — none of the 15 meet the presence bar. (God's claim "for all the firstborn are mine" (3:13) was checked against `sovereignty-of-god`; that id's recorded register — the taught rule-over-nations doctrine, per the Daniel ledger's log-1765 row — is not depicted by the Levite-exchange institution, whose substance the sitting `priesthood` tag and the ch 3 new-concept candidate already carry.)
- Numbers 4 — no change — none of the 15 meet the presence bar.
- Numbers 5 — `confession-of-sin` ADD per above; no other delta id meets the presence bar.
- Numbers 6 — no change — none of the 15 meet the presence bar.
- Numbers 7 — no change — none of the 15 meet the presence bar.
- Numbers 8 — no change — none of the 15 meet the presence bar.
- Numbers 9 — no change — none of the 15 meet the presence bar.
- Numbers 10 — no change — none of the 15 meet the presence bar.
- Numbers 11 — no change — checked closely: the Spirit episode (11:16–17, 24–30) sits in the OT empowerment-for-a-task register (the tag-gaps `empowered-by-the-spirit` register — a roster id that was already inside the original sweep's legal universe, so not this corrigendum's scope), not in `outpouring-of-the-spirit`'s register, which its tag-gaps row defines as the outpoured-Spirit PROMISE family (Joel 2:28–29 core; Isa 32:15; Ezek 39:29) — with the row's own Zechariah caveat discipline distinguishing OT Spirit texts from the outpouring register itself. Moses' wish "I wish that all the LORD's people were prophets, that the LORD would put his Spirit on them!" (11:29) anticipates that promise in a single verse; a promise-register tag on it would be thin single-verse and a read-forward. Honest-and-empty preferred.
- Numbers 12 — no change — Aaron's plea "please don't count this sin against us, in which we have done foolishly, and in which we have sinned" (12:11) was checked against `confession-of-sin`: a one-verse plea inside the judgment-and-intercession narrative, not the commanded/enacted-confession substance of the Num 5:7 / Lev 5:5 statute register; below the bar.
- Numbers 13 — no change — none of the 15 meet the presence bar.
- Numbers 14 — no change — three checked: `confession-of-sin` ("for we have sinned," 14:40, is words attached to the presumption the chapter condemns — the depicted-failure logic of §5's Genesis-3 worked example); `gods-delight-in-his-people` ("If the LORD delights in us," 14:8, a conditional clause inside the plea, its substance carried by the sitting `trust-in-god` tag); `sowing-and-reaping` (the measure-for-measure sentence, "even forty days, for every day a year, you will bear your iniquities," 14:34, is judgment narrative carried by `divine-judgment`, not the row's cross-testament moral-consequence PRINCIPLE-teaching register — the 2 Corinthians 9:6 precedent tags the principle stated as teaching, which no verse here does).
- Numbers 15 — no change — none of the 15 meet the presence bar.
- Numbers 16 — no change — none of the 15 meet the presence bar.
- Numbers 17 — no change — `the-branch` was checked against the budding rod ("Aaron's rod for the house of Levi had sprouted, budded, produced blossoms," 17:8): the id is the messianic Branch title register (Isa 4:2; Jer 23:5; Zech 3:8, 6:12); tagging the rod would be a typological read-forward, barred by the no-later-revelation-read-back rule.
- Numbers 18 — no change — none of the 15 meet the presence bar.

Register note: most of the 15 are later-revelation ids (`death-of-a-believer`, `eternal-life`, `false-teachers`, `freedom-in-christ`, `gentleness-of-christ`, `new-birth`, `outpouring-of-the-spirit`, `speaking-in-tongues`, `the-branch`, `walking-in-truth`) — excluded on the no-later-revelation-read-back rule as well as on absence; besides the Numbers 5 ADD above, none of the 15 has honest substantial presence anywhere in Numbers 1–18.

Closing note: chapters 19–36 were swept under the full post-reconstruction universe (canonical adopted list in hand) and need no re-check.


## Corrigenda addendum — Numbers 11 × empowered-by-the-spirit (2026-08-26)

Why: the chapters 1–18 corrigenda block above noted that the ch 11 Spirit episode sits
in the `empowered-by-the-spirit` register but placed the id outside that block's scope
(roster ids were already inside the original sweep's legal universe). The original ch
11 entry, checked, in fact never weighed the id — only `holy-spirit` was considered
there and declined on register grounds. This addendum closes that gap for the one
chapter × id pair; everything else above stands unedited (append-only).

Disposition: ADD `empowered-by-the-spirit` — WEB quote: "I will take of the Spirit
which is on you, and will put it on them; and they shall bear the burden of the people
with you, that you don't bear it yourself alone." (11:17), enacted in full: "took of
the Spirit that was on him, and put it on the seventy elders. When the Spirit rested
on them, they prophesied" (11:25), reaching Eldad and Medad in the camp ("and the
Spirit rested on them … and they prophesied in the camp," 11:26), and closed by Moses'
wish, "I wish that all the LORD's people were prophets, that the LORD would put his
Spirit on them!" (11:29). Register check against corpus-blocked roster row 13: the
row's register is the OT Spirit-comes-upon-for-a-task empowerment refrain (its spine
is the Judges "Spirit of the LORD came on him" texts), and Numbers 11 is exactly that
substance — the Spirit put on seventy named-task recipients to equip them to bear the
leadership burden — a full narrative movement (11:16–17, 24–30) and one of the
chapter's main themes, not a touch. Distinct query register from every sitting tag per
the §11.2 both-tags ruling: `leadership` carries the shared-burden structure but not
the Spirit; the original entry's `holy-spirit` decline (NT filled-with-the-Spirit
teaching register) was right and stands; no sitting tag serves "the Spirit rested on
them" / "Spirit on the seventy elders" / "Eldad and Medad" queries. Corpus-blocked
roster row 13 id — display tag only; engine finding ROUTED to row 13, not duplicated:
Num 11:16–17, 24–30 noted as candidate refs for that row's eventual pack, a Torah
narrative complement to its Judges-refrain spine (the row stays DEFERRED/gated;
nothing engine-side emitted).

Cap and yield handling (Decisions record): ch 11 goes 7 → 8 tags, reaching — not
exceeding — the hard ceiling. The §11.6 yield order was weighed: it triggers where
candidates exceed the ceiling, every sitting tag independently clears the presence
bar, and the ADD is a main-theme movement, so the tag lands with no yield and no drop.
A route-only disposition (decline the display tag at the cap, keep only the row-13
routing) was considered and rejected as the less honest call: the episode is a main
movement of the chapter and no sitting tag serves its queries. Ceiling / refinement
flag update: Numbers 11 now reads "hit hard ceiling 8 — marked for per-verse
refinement" (superseding the original entry's soft-cap flag by append, not by edit).
