# Genesis sweep ledger — Layer-3 tag sweep (Torah thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: Genesis (50 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/2026-08-22-genesis-pilot-summaries.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/corpus-blocked-roster.md
  - WEB chapter text (verse-numbered, from the pinned-source full-Bible fixture, sourceSha256
    b6f55cc7…, commit 87fd68c): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/web-text/genesis/<chapter>.txt
  - Worker instructions (entry format + verbatim rules): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/sweep-worker-instructions.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Genesis <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## Genesis 1
Existing tags (book doc): `creation`, `image-of-god`
### Applied-tag deltas
- KEEP `creation` — the pack's own anchor is Genesis 1:1 ("In the beginning, God created the heavens and the earth."); the six-day account is the chapter's whole substance.
- KEEP `image-of-god` — the pack anchors Genesis 1:26-27 itself ("God created man in his own image. In God's image he created him; male and female he created them.", 1:27).
- ADD `blessing` — WEB quote: "God blessed them. God said to them, “Be fruitful, multiply, fill the earth, and subdue it.”" (1:28) — the pack's anchor list already carries Genesis 1:28; the chapter enacts God's blessing on the creatures (1:22) and on mankind (1:28), not a passing mention.
### Anchor-extension candidates
- design-in-creation | 1:11-25, 31 | "God made the animals of the earth after their kind, and the livestock after their kind, and everything that creeps on the ground after its kind. God saw that it was good." (1:25) | low — the "after their kind" refrain and day-structure depict order in creation; the pack ("order in creation" in its lexicon) has no Genesis 1 anchor. Offered for curation, not tagged (the `creation` tag already carries the chapter; a second tag would be broad-duplicating-specific).
### Lexicon candidates
- creation | let there be light | realistic query phrasings: "let there be light", "god said let there be light", "let there be light verse"
- creation | six days of creation | realistic query phrasings: "the six days of creation", "creation in six days", "what did god create on each day"
- image-of-god | male and female he created them | realistic query phrasings: "male and female he created them", "god created them male and female"
### New-concept candidates
- dominion-and-creation-care | rationale: no id in the index or the adopted roster serves dominion-mandate / creation-stewardship queries; corpus-blocked roster row 16 `stewardship` is the entrusted-money/talents register, a different register (noted to avoid duplication, not routed — this is not that theme) | anchor: "Let them have dominion over the fish of the sea, and over the birds of the sky, and over the livestock, and over all the earth" (1:26; also 1:28); companion anchor Gen 2:15. Realistic queries: "dominion over the earth", "what does the bible say about taking care of the earth", "creation care".
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 2 (subdivided: 2:1–3; 2:4–25)
Existing tags (book doc): `sabbath-rest`, `work-and-diligence`, `pastoral-marriage-divorce-teaching`, `godly-marriage`, `creation`, `the-breath-of-life`
### Applied-tag deltas
- KEEP `sabbath-rest` — the pack anchors Genesis 2:1-3 itself ("he rested on the seventh day from all his work which he had done", 2:2; "God blessed the seventh day, and made it holy", 2:3).
- KEEP `work-and-diligence` — the pack anchors Genesis 2:15 itself ("The LORD God took the man, and put him into the garden of Eden to cultivate and keep it.").
- KEEP `pastoral-marriage-divorce-teaching` — the pack anchors Genesis 2:24 itself ("Therefore a man will leave his father and his mother, and will join with his wife, and they will be one flesh.").
- KEEP `godly-marriage` — the first marriage is the section's substance: "It is not good for the man to be alone. I will make him a helper comparable to him." (2:18), through 2:24-25.
- KEEP `creation` — the forming of man and woman retold from the ground: "The LORD God formed man from the dust of the ground" (2:7); the woman from the rib (2:21-22).
- KEEP `the-breath-of-life` — the pack's namesake anchor is Genesis 2:7 ("breathed into his nostrils the breath of life; and man became a living soul").
(No ADD — chapter is at the soft cap and no further concept clears the presence bar.)
### Anchor-extension candidates
- None. (Every kept tag's pack already anchors this chapter.)
### Lexicon candidates
- godly-marriage | one flesh | realistic query phrasings: "the two become one flesh", "what does one flesh mean", "leave and cleave"
- creation | garden of eden | realistic query phrasings: "the garden of eden", "where was the garden of eden", "rivers of eden"
- temptation | tree of the knowledge of good and evil | realistic query phrasings: "the tree of knowledge of good and evil", "why did god put the tree in the garden", "the forbidden tree" (the command lives at 2:16-17; the pack already anchors Gen 3:1-6, so the term extends an existing Genesis home)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6; book doc subdivides this chapter (2:1–3; 2:4–25) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 3
Existing tags (book doc): `sin`, `divine-judgment`, `temptation`, `mortality`
### Applied-tag deltas
- KEEP `sin` — the first sin and its unfolding: "she took some of its fruit, and ate. Then she gave some to her husband with her, and he ate it, too." (3:6), then shame, hiding, and blame (3:7-13).
- KEEP `divine-judgment` — sentences pronounced on serpent, woman, and man (3:14-19) and the expulsion: "So he drove out the man" (3:24).
- KEEP `temptation` — the pack anchors Genesis 3:1-6 itself ("Has God really said, 'You shall not eat of any tree of the garden'?", 3:1).
- KEEP `mortality` — the pack anchors Genesis 3:19 itself ("For you are dust, and you shall return to dust.").
- ADD `shame` — WEB quote: "I heard your voice in the garden, and I was afraid, because I was naked; so I hid myself." (3:10; with 3:7, "they both knew that they were naked. They sewed fig leaves together") — the chapter depicts shame substantially (nakedness, covering, hiding, fear), Scripture's origin narrative of it; not a passing touch. Note for the orchestrator: the pack's register is God removing shame and carries no Genesis anchor — a delegated-default ADD, droppable if the register is judged too far from a failure-narrative depiction.
### Anchor-extension candidates
- shame | 3:7-10 | "They heard the LORD God's voice walking in the garden in the cool of the day, and the man and his wife hid themselves from the presence of the LORD God among the trees of the garden." (3:8) | medium (stands or falls with the ADD above)
- sin | 3:6-7 | "she took some of its fruit, and ate. Then she gave some to her husband with her, and he ate it, too." (3:6) | medium — the pack anchors Romans 5:12 (sin entering the world) but not the event-text itself.
- messianic-prophecy | 3:15 | "I will put hostility between you and the woman, and between your offspring and her offspring. He will bruise your head, and you will bruise his heel." | low — curated sources traditionally read 3:15 as the first messianic promise; the chapter itself does not name the offspring, so this is offered to curation only, NOT applied as a tag (no later-revelation read-back at the display layer; curator adjudicates whether the pack claims it).
### Lexicon candidates
- sin | original sin | realistic query phrasings: "original sin", "how did sin enter the world", "the fall of man"
- temptation | the serpent | realistic query phrasings: "the serpent in the garden", "has god really said", "adam and eve eat the forbidden fruit"
### New-concept candidates
- ROUTED — corpus-blocked roster row 34 `running-from-god`: Gen 3:8 ("the man and his wife hid themselves from the presence of the LORD God") touches that row's territory, and the row itself records the "running from god" → Gen 3:8 engine hit as measured token-luck noise; the row's register (Jonah's flight from God's call) is not what this chapter depicts. Routed to row 34 — no tag, no duplicate candidate.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 4
Existing tags (book doc): `sin`, `worship`, `envy-and-jealousy`, `temptation`, `vengeance`
### Applied-tag deltas
- KEEP `sin` — "If you don't do well, sin crouches at the door. Its desire is for you, but you are to rule over it." (4:7), then the first murder (4:8) and its curse.
- KEEP `worship` — the first offerings brought to the LORD (4:3-4) and "At that time men began to call on the LORD's name." (4:26).
- KEEP `envy-and-jealousy` — the pack anchors Genesis 4:3-8 itself ("Cain was very angry, and the expression on his face fell.", 4:5).
- KEEP `temptation` — warned that sin's desire is for him, Cain gives in anyway (4:7-8); the depicted pull-and-yield is the register the book doc recorded.
- KEEP `vengeance` — Lamech's boast: "If Cain will be avenged seven times, truly Lamech seventy-seven times." (4:24) — escalating vengeance narrated, never commended.
- ADD `divine-judgment` — WEB quote: "Now you are cursed because of the ground, which has opened its mouth to receive your brother's blood from your hand." (4:11; sentence continues 4:12) — a substantial judgment scene: God confronts, convicts, and sentences the first murderer (4:9-16), squarely the pack's judgment-on-sin register.
### Anchor-extension candidates
- sin | 4:7 | "If you don't do well, sin crouches at the door. Its desire is for you, but you are to rule over it." | medium — a famous verse; the pack has no Genesis 4 anchor.
- vengeance | 4:15, 23-24 | "If Cain will be avenged seven times, truly Lamech seventy-seven times." (4:24) | low — the pack has no Genesis anchor; the sevenfold/seventy-sevenfold escalation is the narrative counterpoint to its Rom 12/Deut 32 teaching anchors.
### Lexicon candidates
- envy-and-jealousy | cain and abel | realistic query phrasings: "cain and abel", "why did cain kill abel", "am i my brother's keeper"
- sin | sin crouches at the door | realistic query phrasings: "sin is crouching at your door", "sin crouches at the door meaning"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 5
Existing tags (book doc): `presence-of-god`, `creation`, `mortality`
### Applied-tag deltas
- KEEP `presence-of-god` — "Enoch walked with God, and he was not found, for God took him." (5:24; also 5:22) — walking with God is the pack's communion-with-God register.
- KEEP `creation` — the record restates the creation of mankind: "In the day that God created man, he made him in God's likeness." (5:1; blessing and naming, 5:2).
- KEEP `mortality` — the chapter's refrain, eight times over: "then he died" (5:5, 8, 11, 14, 17, 20, 27, 31).
- ADD `image-of-god` — WEB quote: "In the day that God created man, he made him in God's likeness." (5:1; with 5:3, "became the father of a son in his own likeness, after his image") — the pack anchors Genesis 5:1-3 itself; the likeness-transmission point is this chapter's own teaching, not a read-in.
### Anchor-extension candidates
- presence-of-god | 5:22-24 | "Enoch walked with God, and he was not found, for God took him." (5:24) | medium — the pack has no Genesis anchor and "walked with God" is a heavy query phrase.
### Lexicon candidates
- presence-of-god | walked with god | realistic query phrasings: "enoch walked with god", "who was enoch in the bible", "what does it mean to walk with god"
- mortality | methuselah | realistic query phrasings: "oldest man in the bible", "how long did methuselah live"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 6 (subdivided: 6:1–7; 6:8–22)
Existing tags (book doc): `sin`, `obedience-to-the-word`
### Applied-tag deltas
- KEEP `sin` — "The LORD saw that the wickedness of man was great on the earth, and that every imagination of the thoughts of man's heart was continually only evil." (6:5); "the earth was filled with violence" (6:11).
- KEEP `obedience-to-the-word` — "Thus Noah did. He did all that God commanded him." (6:22).
- ADD `divine-judgment` — WEB quote: "I will destroy man whom I have created from the surface of the ground" (6:7; also "I will bring an end to all flesh", 6:13, and the flood announcement, 6:17) — the pack anchors Genesis 6:5-7 itself and carries "the flood" in its lexicon; the chapter's whole first movement is the judgment resolve.
### Anchor-extension candidates
- covenant | 6:18 | "But I will establish my covenant with you." | low — the Bible's first occurrence of the word; the pack anchors Gen 9:8-17 but not this 6:18 announcement. A single verse — anchor candidate only, not a tag (thin single-verse presence).
### Lexicon candidates
- divine-judgment | the days of noah | realistic query phrasings: "as in the days of noah", "why did god send the flood"
### New-concept candidates
- nephilim-and-the-sons-of-god | rationale: heavy curiosity-register searches with no honest home in the concept index, the declines, or the corpus-blocked roster; a curiosity-register concept has precedent (roster row 50, `leviathan-and-behemoth`). Any eventual gist must report the text's own words without adjudicating the contested identification of "God's sons" (covenant #6 discipline). | anchor: "The Nephilim were on the earth in those days, and also after that, when God's sons came in to men's daughters and had children with them. Those were the mighty men who were of old, men of renown." (6:4; with 6:1-2). Realistic queries: "who were the nephilim", "sons of god and daughters of men", "giants in the bible".
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (6:1–7; 6:8–22) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 7
Existing tags (book doc): `gods-protection`, `obedience-to-the-word`
### Applied-tag deltas
- KEEP `gods-protection` — "then the LORD shut him in." (7:16); "Only Noah was left, and those who were with him in the ship." (7:23).
- KEEP `obedience-to-the-word` — "Noah did everything that the LORD commanded him." (7:5; also "as God commanded Noah", 7:9, 16).
- ADD `divine-judgment` — WEB quote: "Every living thing was destroyed that was on the surface of the ground, including man, livestock, creeping things, and birds of the sky." (7:23; announced at 7:4, "I will destroy every living thing that I have made") — the flood judgment executed; the pack's lexicon carries "the flood" and its anchors include the Gen 6:5-7 resolve this chapter carries out.
### Anchor-extension candidates
- gods-protection | 7:16, 23 | "then the LORD shut him in." | low — the pack's anchors are all Psalms/Isaiah promise-texts; the shut-in preservation scene is a natural narrative anchor.
### Lexicon candidates
- gods-protection | noahs ark | realistic query phrasings: "noah's ark", "god shut noah in the ark" — NOTE: the WEB reads "ship" throughout, never "ark"; users will type "ark", so this is an alias-bridging question for the alias-mining loop (measured miss first, per §2.3), recorded as a candidate only.
- divine-judgment | forty days and forty nights | realistic query phrasings: "it rained forty days and forty nights", "the great flood in the bible"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 8
Existing tags (book doc): `gods-faithfulness`, `worship`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "God remembered Noah" (8:1) and the pledge "While the earth remains, seed time and harvest, and cold and heat, and summer and winter, and day and night will not cease." (8:22).
- KEEP `worship` — "Noah built an altar to the LORD, and took of every clean animal, and of every clean bird, and offered burnt offerings on the altar." (8:20).
(No ADD — honest-and-empty preferred: `providence` would broad-duplicate `gods-faithfulness`'s 8:1/8:21-22 grounding here, and `seasons-of-life` is the Ecclesiastes life-seasons register, not 8:22's agricultural rhythm.)
### Anchor-extension candidates
- gods-faithfulness | 8:1, 21-22 | "While the earth remains, seed time and harvest, and cold and heat, and summer and winter, and day and night will not cease." (8:22) | medium — the pack has no Genesis anchor; this pledge is the faithfulness register's narrative bedrock.
- worship | 8:20 | "Noah built an altar to the LORD, and took of every clean animal, and of every clean bird, and offered burnt offerings on the altar." | low — the first altar in Scripture; the pack's anchors are all liturgical/NT texts.
### Lexicon candidates
- gods-faithfulness | god remembered noah | realistic query phrasings: "god remembered noah", "what does it mean that god remembered noah"
- worship | altar | realistic query phrasings: "altars in the bible", "building an altar to the lord"
### New-concept candidates
- ROUTED — corpus-blocked roster row 1 `sacrifice-and-atonement`: Noah's burnt offerings and "The LORD smelled the pleasant aroma." (8:20-21) touch that row's sacrifice territory; not tagged (a narrated offering without the row's atonement teaching substance) and not duplicated — routed to row 1 for the re-pin curator's awareness as a possible pre-Levitical anchor.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 9 (subdivided: 9:1–17; 9:18–29)
Existing tags (book doc): `covenant`, `gods-faithfulness`, `sin`
### Applied-tag deltas
- KEEP `covenant` — the pack anchors Genesis 9:8-17 itself ("As for me, behold, I establish my covenant with you, and with your offspring after you", 9:9; "This is the token of the covenant", 9:12).
- KEEP `gods-faithfulness` — "I will look at it, that I may remember the everlasting covenant between God and every living creature of all flesh that is on the earth." (9:16; also 9:11, 15).
- KEEP `sin` — the flood's survivor falls: "He drank of the wine and got drunk. He was uncovered within his tent." (9:21), then Ham's dishonor and the curse (9:22-25).
- ADD `image-of-god` — WEB quote: "Whoever sheds man's blood, his blood will be shed by man, for God made man in his own image." (9:6) — the pack anchors Genesis 9:6 itself; the sanctity-of-life grounding is this chapter's own teaching.
- ADD `blessing` — WEB quote: "God blessed Noah and his sons, and said to them, “Be fruitful, multiply, and replenish the earth." (9:1; repeated "Be fruitful and multiply", 9:7) — the fresh-start blessing frames the chapter's first movement; the same substance the pack anchors at Gen 1:28.
(Considered and declined: `drunkenness` — 9:21 is narrated, not the pack's is-it-a-sin teaching register; the Esther 1:10 "scene-setting the text does not moralize" decline precedent applies, and the consequences here are served by the `sin` tag.)
### Anchor-extension candidates
- gods-faithfulness | 9:14-16 | "I will remember my covenant, which is between me and you and every living creature of all flesh, and the waters will no more become a flood to destroy all flesh." (9:15) | low — the pack has no Genesis anchor; the I-will-remember pledge is its register in narrative form.
### Lexicon candidates
- covenant | rainbow | realistic query phrasings: "rainbow in the bible", "what does the rainbow mean in the bible", "god's promise with the rainbow"
- image-of-god | whoever sheds man's blood | realistic query phrasings: "whoever sheds the blood of man", "capital punishment in the bible" — candidate only; the broader capital-punishment intent may exceed this pack's human-dignity register, so the alias-mining loop should measure first.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (9:1–17; 9:18–29) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 10
Existing tags (book doc): `nations-and-peoples`
### Applied-tag deltas
- KEEP `nations-and-peoples` — the pack anchors Genesis 10:32 itself ("These are the families of the sons of Noah, by their generations, according to their nations. The nations divided from these on the earth after the flood.") and carries "table of nations" in its lexicon. (Only one honest tag from the current vocabulary.)
### Anchor-extension candidates
- None. (The pack already anchors this chapter; 10:5, 20, 31 are interior to the same table.)
### Lexicon candidates
- nations-and-peoples | nimrod | realistic query phrasings: "who was nimrod in the bible", "nimrod mighty hunter before the lord"
### New-concept candidates
- None. (`gentile-inclusion`, roster row 40, was checked and is not present — its church-inclusion register would be a later-revelation read-back on this genealogy; no routing owed since nothing here matches the row's theme.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 11 (subdivided: 11:1–9; 11:10–26; 11:27–32)
Existing tags (book doc): `humble-exaltation`, `divine-judgment`
### Applied-tag deltas
- KEEP `humble-exaltation` — "let’s make a name for ourselves" (11:4) answered by God coming down, confusing, and scattering (11:5-9); the recorded "pride" decline routes plain pride queries here (PR #41 lexicon extension, Gen 11:4 named in that record).
- KEEP `divine-judgment` — the pack anchors Genesis 11:8-9 itself ("So the LORD scattered them abroad from there on the surface of all the earth. They stopped building the city.", 11:8).
- ADD `nations-and-peoples` — WEB quote: "Therefore its name was called Babel, because there the LORD confused the language of all the earth. From there, the LORD scattered them abroad on the surface of all the earth." (11:9) — the pack anchors Genesis 11:8-9 itself; the origin of the dispersed nations and languages is this chapter's own subject, continuous with the tagged table in Genesis 10.
(Considered and declined: `waiting-for-a-child` — the pack anchors 11:30 itself ("Sarai was barren. She had no child."), but one notice verse is thin single-verse presence; the theme is carried substantially on chapters 15–18 and 21.)
### Anchor-extension candidates
- humble-exaltation | 11:4-9 | "Come, let’s build ourselves a city, and a tower whose top reaches to the sky, and let’s make a name for ourselves, lest we be scattered abroad on the surface of the whole earth." (11:4) | medium — the pack has no Genesis anchor; the tower narrative is its self-exaltation-answered register in story form, and the PR #41 pride-lexicon routing already points here.
### Lexicon candidates
- nations-and-peoples | tower of babel | realistic query phrasings: "the tower of babel", "why did god confuse the languages", "where did languages come from in the bible"
- humble-exaltation | make a name for ourselves | realistic query phrasings: "make a name for ourselves bible", "what was wrong with the tower of babel"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (11:1–9; 11:10–26; 11:27–32) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 12
Existing tags (book doc): `trust-in-god`, `guidance`, `worship`, `honesty`, `blessing`
### Applied-tag deltas
- KEEP `trust-in-god` — "So Abram went, as the LORD had told him." (12:4) — leaving country, kin, and father's house on the strength of the word alone (12:1-4).
- KEEP `guidance` — "go to the land that I will show you" (12:1) — a destination disclosed only en route.
- KEEP `worship` — altars at Shechem (12:7) and Bethel: "There he built an altar to the LORD and called on the LORD’s name." (12:8).
- KEEP `honesty` — "Please say that you are my sister, that it may be well with me for your sake" (12:13) and Pharaoh's rebuke, "Why didn’t you tell me that she was your wife?" (12:18) — the deception and its fallout depicted at length (12:11-20).
- KEEP `blessing` — the pack anchors Genesis 12:2-3 itself ("I will make of you a great nation. I will bless you and make your name great. You will be a blessing.", 12:2).
(Considered and declined: `gods-protection` — "The LORD afflicted Pharaoh and his house with great plagues because of Sarai, Abram’s wife." (12:17) is real intervention but thin single-verse presence here; the parallel with sustained substance is tagged on ch. 20. `nations-and-peoples` — the pack anchors 12:3 itself, but the all-families clause is one line inside the call; not chapter substance. `gods-provision` — 12:10's famine is scene-setting; the famine→`gods-provision` routing is the PR #41 lexicon extension already recorded, no tag owed.)
### Anchor-extension candidates
- trust-in-god | 12:1-4 | "So Abram went, as the LORD had told him." (12:4) | medium — the pack's anchors are all Psalms/Proverbs/prophets promise-texts; the call-and-departure is the trust register enacted.
- guidance | 12:1 | "Leave your country, and your relatives, and your father’s house, and go to the land that I will show you." | low — single verse, but the go-where-I-show-you shape is the pack's direction-for-my-life register.
### Lexicon candidates
- guidance | leave your country | realistic query phrasings: "god calls abraham to leave his country", "the call of abram", "leave your country and your father's house"
- blessing | all the families of the earth | realistic query phrasings: "all the families of the earth will be blessed", "god's promise to abraham", "abrahamic blessing"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 13
Existing tags (book doc): `harmony-with-others`, `gods-faithfulness`
### Applied-tag deltas
- KEEP `harmony-with-others` — "Please, let there be no strife between you and me, and between your herdsmen and my herdsmen; for we are relatives." (13:8), with the costly first-choice concession (13:9).
- KEEP `gods-faithfulness` — the promise renewed and enlarged after the separation: "for I will give all the land which you see to you and to your offspring forever. I will make your offspring as the dust of the earth" (13:15-16).
- ADD `worship` — WEB quote: "to the place of the altar, which he had made there at the first. There Abram called on the LORD’s name." (13:4; and "built an altar there to the LORD", 13:18) — the return-to-the-altar and the new altar at Hebron bookend the chapter; calling on the LORD's name is the pack's register depicted, not a passing mention.
(Considered and declined: `generosity` — Abram's deference to Lot (13:9) is a giving-up, not the pack's giving-to-others teaching register; the concession substance is already carried by `harmony-with-others`.)
### Anchor-extension candidates
- harmony-with-others | 13:8-9 | "Isn’t the whole land before you? Please separate yourself from me. If you go to the left hand, then I will go to the right." (13:9) | medium — the pack's anchors are all NT exhortations; this is the live-at-peace register enacted at cost.
### Lexicon candidates
- harmony-with-others | abram and lot | realistic query phrasings: "abraham and lot separate", "let there be no strife between us", "abraham gives lot first choice"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 14 (subdivided: 14:1–16; 14:17–24)
Existing tags (book doc): `tithing`, `gods-protection`
### Applied-tag deltas
- KEEP `tithing` — the Bible's first tithe: "Abram gave him a tenth of all." (14:20) — the pack's lexicon carries "tithe" and the tenth-of-all act is the scene's point, not a passing touch.
- KEEP `gods-protection` — "Blessed be God Most High, who has delivered your enemies into your hand." (14:20) — the night rescue of Lot (14:14-16) credited to God's keeping.
- ADD `oaths-and-vows` — WEB quote: "I have lifted up my hand to the LORD, God Most High, possessor of heaven and earth, that I will not take a thread nor a sandal strap nor anything that is yours" (14:22-23) — a sworn oath enacted with its stated reason ("lest you should say, ‘I have made Abram rich.’", 14:23); the pack's swearing-an-oath register in narrative form.
(Considered and declined: `priesthood` — "He was priest of God Most High." (14:18) is the text's own word, but one identifying verse is thin single-verse presence, and the pack's substance for this figure lives in Hebrews — tagging here would invite the later-revelation read-back the group ruling bars; offered to curation as an anchor candidate below instead. `blessing` — Melchizedek's pronounced blessing (14:19-20) is two verses inside the meeting scene, thin against the war-and-oath substance of the chapter. `integrity` — Abram's refusal of Sodom's goods depicts it, but the refusal's substance is carried by the `oaths-and-vows` ADD.)
### Anchor-extension candidates
- tithing | 14:20 | "Abram gave him a tenth of all." | medium — the pack has no Genesis anchor; this is the tithe's first narrative occurrence.
- priesthood | 14:18-20 | "Melchizedek king of Salem brought out bread and wine. He was priest of God Most High." (14:18) | low — offered to curation only: the pack's Hebrews 7 anchors expound this figure, and whether the pack claims the Genesis scene is the curator's call, not a display-layer read-back.
- oaths-and-vows | 14:22-24 | "I have lifted up my hand to the LORD, God Most High, possessor of heaven and earth" (14:22) | low — the pack anchors no Genesis text; lifted-hand oath idiom.
### Lexicon candidates
- tithing | melchizedek | realistic query phrasings: "who was melchizedek", "abraham gives a tenth to melchizedek", "melchizedek bread and wine" — note for curation: bare "melchizedek" queries may belong to `priesthood` instead; the alias-mining loop should measure before either pack claims the term (XOR discipline).
- gods-protection | abram rescues lot | realistic query phrasings: "abraham rescues lot", "the battle of the kings in genesis"
### New-concept candidates
- ROUTED — corpus-blocked roster row 32 `deliverance`: Abram's armed night rescue of Lot (14:14-16) and the delivered-your-enemies credit (14:20) are that row's rescue-narrative register; routed to row 32, no fresh candidate. Display-side the chapter keeps `gods-protection` per prior art.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (14:1–16; 14:17–24) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 15
Existing tags (book doc): `faith`, `fear-not`, `gods-faithfulness`, `covenant`, `waiting-for-a-child`
### Applied-tag deltas
- KEEP `faith` — "He believed in the LORD, who credited it to him for righteousness." (15:6) — Scripture's foundational faith text, in this chapter.
- KEEP `fear-not` — "Don’t be afraid, Abram. I am your shield, your exceedingly great reward." (15:1) — the pack's fear-not address opens the vision.
- KEEP `gods-faithfulness` — God alone passes between the pieces: "behold, a smoking furnace and a flaming torch passed between these pieces." (15:17) — the promise-keeping God binding himself.
- KEEP `covenant` — the pack anchors Genesis 15:7-18 itself ("In that day the LORD made a covenant with Abram", 15:18).
- KEEP `waiting-for-a-child` — the pack anchors Genesis 15:2-5 itself ("what will you give me, since I go childless", 15:2).
- ADD `justification-by-faith` — WEB quote: "He believed in the LORD, who credited it to him for righteousness." (15:6) — the credited-as-righteousness substance is this verse's own wording, not a read-in; the book doc's post-pilot comment already marked 15:6 as the exact fit pending PR #43 clearance, and CONVENTIONS §11.5 has since ratified the PR #43 ids. Recorded as a delegated-default use of a PR #43 id per the §1(d) pattern (settled 2026-08-25; Jesse can overturn).
(Considered and declined: `sojourners-and-strangers` — "your offspring will live as foreigners in a land that is not theirs" (15:13) is a single prophetic verse, thin presence, and the chapter is at the soft cap.)
### Anchor-extension candidates
- faith | 15:6 | "He believed in the LORD, who credited it to him for righteousness." | high — the pack's only anchors are Hebrews 11:6 and Romans 10:17; this is the verse the NT faith texts expound, and the pack has no Genesis anchor.
- justification-by-faith | 15:6 | "He believed in the LORD, who credited it to him for righteousness." | medium — the pack's anchors are all NT; the credited-righteousness source text is here.
- fear-not | 15:1 | "Don’t be afraid, Abram. I am your shield, your exceedingly great reward." | low — the pack has no Genesis anchor; "I am your shield" is a heavy query phrase.
### Lexicon candidates
- faith | abraham believed god | realistic query phrasings: "abraham believed god and it was credited to him as righteousness", "abraham counted the stars", "so shall your offspring be"
- covenant | covenant between the pieces | realistic query phrasings: "the covenant between the pieces", "smoking furnace and flaming torch", "why did god pass between the animals"
### New-concept candidates
- ROUTED — corpus-blocked roster row 45 `exile-and-captivity`: the foretold four-hundred-year servitude in a foreign land (15:13-14) touches that row's territory; its fold-vs-separate routing is recorded as Jesse's call on the row — routed, not duplicated, and not tagged (single prophetic verse-pair).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 16
Existing tags (book doc): `pastoral-god-sees-my-suffering`, `loneliness`, `waiting-for-a-child`, `angels`
### Applied-tag deltas
- KEEP `pastoral-god-sees-my-suffering` — the pack's namesake anchor is Genesis 16:13 itself ("You are a God who sees"); Hagar's affliction met in the wilderness is precisely the personal-crisis register the group ruling scopes pastoral ids to.
- KEEP `loneliness` — a runaway servant alone in the wilderness, found and addressed by name: "Hagar, Sarai’s servant, where did you come from? Where are you going?" (16:8; found at the fountain, 16:7).
- KEEP `waiting-for-a-child` — the pack anchors Genesis 16:1-2 itself ("the LORD has restrained me from bearing", 16:2).
- KEEP `angels` — the pack anchors Genesis 16:7-12 itself ("The LORD’s angel found her by a fountain of water in the wilderness", 16:7).
(No ADD — no further concept clears the presence bar: the Sarai–Hagar contempt (16:4-6) is mistress–servant conflict, not `envy-and-jealousy`'s coveting register; honest-and-empty preferred.)
### Anchor-extension candidates
- loneliness | 16:7-13 | "The LORD’s angel found her by a fountain of water in the wilderness" (16:7) | low — the pack's anchors are promise-texts; the found-when-alone narrative is its register in story form.
### Lexicon candidates
- pastoral-god-sees-my-suffering | el roi | realistic query phrasings: "el roi meaning", "the god who sees me verse", "beer lahai roi" — the WEB reads "You are a God who sees" (16:13); "el roi" is an alias-bridging question for the alias-mining loop (measured miss first).
- angels | hagar and the angel | realistic query phrasings: "the angel of the lord appears to hagar", "who was hagar in the bible", "god finds hagar in the wilderness"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 17
Existing tags (book doc): `gods-faithfulness`, `obedience-to-the-word`, `covenant`
### Applied-tag deltas
- KEEP `gods-faithfulness` — the everlasting covenant restated by name to Abraham, Sarah, and the yet-unborn Isaac: "I will establish my covenant with him for an everlasting covenant for his offspring after him." (17:19; also 17:7, 21).
- KEEP `obedience-to-the-word` — Abraham "circumcised the flesh of their foreskin in the same day, as God had said to him." (17:23) — command carried out the very day.
- KEEP `covenant` — the pack anchors Genesis 17:2-14 itself ("I will establish my covenant between me and you and your offspring after you throughout their generations for an everlasting covenant", 17:7).
- ADD `nations-and-peoples` — WEB quote: "Your name will no more be called Abram, but your name will be Abraham; for I have made you the father of a multitude of nations." (17:5; refrain at 17:4, 6, 16, "she will be a mother of nations") — the multitude-of-nations promise names the chapter's renaming scenes; the pack's all-nations register, not a passing clause.
- ADD `waiting-for-a-child` — WEB quote: "Will a child be born to him who is one hundred years old? Will Sarah, who is ninety years old, give birth?" (17:17; answered, "Sarah, your wife, will bear you a son. You shall call his name Isaac.", 17:19) — the promised child named to a couple long past bearing is the pack's own register, mid-arc between its Gen 15:2-5 and 21:1-7 anchors.
(Considered and declined: `the-name-of-god` — "I am God Almighty. Walk before me and be blameless." (17:1) is one self-naming clause, thin single-verse presence; recorded as a lexicon candidate below. `blessing` — 17:16, 20 are real but ride inside the covenant substance already tagged; broad-duplicating-specific.)
### Anchor-extension candidates
- obedience-to-the-word | 17:23-27 | "circumcised the flesh of their foreskin in the same day, as God had said to him." (17:23) | low — the pack has no Genesis anchor; same-day obedience is its hear-and-do register enacted.
- waiting-for-a-child | 17:15-21 | "No, but Sarah, your wife, will bear you a son. You shall call his name Isaac." (17:19) | low — the pack anchors chs 15, 16, 21 but not the naming-of-Isaac promise.
### Lexicon candidates
- the-name-of-god | god almighty | realistic query phrasings: "el shaddai meaning", "what does god almighty mean", "i am god almighty"
- covenant | circumcision | realistic query phrasings: "covenant of circumcision", "why did god command circumcision", "abraham circumcision covenant" — bridge candidate only; see the new-concept candidate below for the fuller gap.
### New-concept candidates
- circumcision-covenant-sign | rationale: no id in the concept index or the adopted list serves plain circumcision queries; corpus-blocked roster row 37 `circumcision-of-the-heart` is the inward Deut 30:6/Rom 2:28-29 register and roster row 40 `gentile-inclusion` owns the NT must-Gentiles-circumcise dispute — both noted to avoid duplication, neither is this chapter's institution-of-the-sign theme | anchor: "This is my covenant, which you shall keep, between me and you and your offspring after you. Every male among you shall be circumcised." (17:10; with "It will be a token of the covenant between me and you.", 17:11). Realistic queries: "circumcision in the bible", "why did god command circumcision", "what is the covenant of circumcision".
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 18
Existing tags (book doc): `prayer`, `gods-faithfulness`, `hospitality`, `divine-judgment`
### Applied-tag deltas
- KEEP `prayer` — Abraham's intercession for Sodom, pressed six times from fifty down to ten: "What if ten are found there?" He said, "I will not destroy it for the ten’s sake." (18:32) — the intercession→`prayer` routing is the Genesis thread's own recorded ruling.
- KEEP `gods-faithfulness` — "Is anything too hard for the LORD? At the set time I will return to you, when the season comes around, and Sarah will have a son." (18:14).
- KEEP `hospitality` — the pack anchors Genesis 18:1-8 itself ("he ran to meet them from the tent door, and bowed himself to the earth", 18:2; the meal, 18:6-8).
- KEEP `divine-judgment` — the pack anchors Genesis 18:25 itself ("Shouldn’t the Judge of all the earth do right?"; the outcry and the going-down-to-see, 18:20-21).
- ADD `waiting-for-a-child` — WEB quote: "Now Abraham and Sarah were old, well advanced in age. Sarah had passed the age of childbearing." (18:11; the promise fixed, "Sarah your wife will have a son", 18:10) — the past-hope couple given a dated promise is the pack's register, substantially present in 18:9-15.
- ADD `doubt` — WEB quote: "Sarah laughed within herself, saying, “After I have grown old will I have pleasure, my lord being old also?”" (18:12; "Then Sarah denied it, saying, “I didn’t laugh,” for she was afraid.", 18:15) — disbelief voiced and directly answered by "Is anything too hard for the LORD?" (18:14); a PR #43 id, use recorded as a delegated default per the §1(d) pattern (ratified §11.5; Jesse can overturn).
### Anchor-extension candidates
- prayer | 18:23-32 | "Abraham came near, and said, “Will you consume the righteous with the wicked?" (18:23) | medium — the pack carries "intercession" in its lexicon but has no Genesis anchor; this is Scripture's first extended intercession scene.
- gods-faithfulness | 18:14 | "Is anything too hard for the LORD?" | medium — a heavy query phrase with no home in the pack's anchors.
### Lexicon candidates
- gods-faithfulness | is anything too hard for the lord | realistic query phrasings: "is anything too hard for the lord", "nothing is too hard for god", "sarah laughed"
- prayer | abraham intercedes for sodom | realistic query phrasings: "abraham pleads for sodom", "abraham bargains with god", "fifty righteous in sodom"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 19 (subdivided: 19:1–29; 19:30–38)
Existing tags (book doc): `sin`, `gods-protection`, `divine-judgment`, `hospitality`, `angels`
### Applied-tag deltas
- KEEP `sin` — the city's wickedness shown in action (the mob at the door, 19:4-9) and named: "the outcry against them has grown so great before the LORD that the LORD has sent us to destroy it." (19:13).
- KEEP `gods-protection` — "the men grabbed his hand, his wife’s hand, and his two daughters’ hands, the LORD being merciful to him; and they took him out" (19:16); "God remembered Abraham, and sent Lot out of the middle of the overthrow" (19:29).
- KEEP `divine-judgment` — the pack anchors Genesis 19:24-25 itself and carries "sodom and gomorrah" in its lexicon ("Then the LORD rained on Sodom and on Gomorrah sulfur and fire from the LORD out of the sky.", 19:24).
- KEEP `hospitality` — Lot urges the visitors in: "please come into your servant’s house, stay all night, wash your feet" (19:2); "He made them a feast, and baked unleavened bread" (19:3) — shelter defended at cost against the mob (19:6-8).
- KEEP `angels` — "The two angels came to Sodom at evening." (19:1); they strike the mob blind (19:11) and pull the family out (19:10, 15-16).
- ADD `mercy` — WEB quote: "your servant has found favor in your sight, and you have magnified your loving kindness, which you have shown to me in saving my life" (19:19; "the LORD being merciful to him", 19:16; Zoar granted, 19:21) — mercy named in the text's own words and enacted toward a lingering man; distinct facet from the rescue mechanics carried by `gods-protection`.
(Considered and declined: `drunkenness` — 19:32-35 is a narrated device the text does not moralize, per the Esther 1:10 precedent and this ledger's Genesis 9 call; the episode's wrong is carried by no teaching register in the vocabulary and is left to the subdivided-section refinement pass.)
### Anchor-extension candidates
- gods-protection | 19:15-16, 29 | "the LORD being merciful to him; and they took him out, and set him outside of the city." (19:16) | low — the pack's anchors are all Psalms/Isaiah promise-texts; the dragged-to-safety scene is the register in narrative form.
- mercy | 19:16-22 | "you have magnified your loving kindness, which you have shown to me in saving my life" (19:19) | low (stands or falls with the ADD above).
### Lexicon candidates
- divine-judgment | lots wife | realistic query phrasings: "lot's wife pillar of salt", "why did lot's wife look back", "remember lot's wife"
- gods-protection | lot rescued from sodom | realistic query phrasings: "how was lot saved from sodom", "god remembered abraham and saved lot"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6; book doc subdivides this chapter (19:1–29; 19:30–38) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 20
Existing tags (book doc): `honesty`, `pastoral-prayer-for-healing`, `gods-protection`
### Applied-tag deltas
- KEEP `honesty` — the half-true "She is my sister." (20:2) and its public unraveling: "What have you done to us? How have I sinned against you, that you have brought on me and on my kingdom a great sin?" (20:9; Abraham's rationalization, 20:11-13).
- KEEP `pastoral-prayer-for-healing` — "Abraham prayed to God. So God healed Abimelech, his wife, and his female servants, and they bore children." (20:17) — prayer answered with healing, the pack's namesake act; kept with the caveat that the healing here is of judicially-closed wombs (20:18), a theme-witness-with-caveat rather than a crisis teaching text — within the pastoral personal-crisis scoping since the depicted act (intercessory prayer for healing, answered) is the register itself.
- KEEP `gods-protection` — "I also withheld you from sinning against me. Therefore I didn’t allow you to touch her." (20:6) — God himself guards Sarah and Abimelech before any human act.
- ADD `integrity` — WEB quote: "Yes, I know that in the integrity of your heart you have done this" (20:6; Abimelech's plea, "I have done this in the integrity of my heart and the innocence of my hands.", 20:5) — the word and its substance carry the dream dialogue; God's own acknowledgment of integrity, the pack's register.
- ADD `dreams-and-visions` — WEB quote: "But God came to Abimelech in a dream of the night" (20:3; "God said to him in the dream", 20:6) — the chapter's turning scene is God speaking through a dream, the pack's own register (its Genesis anchors are 28, 37, 40-41, 46; this is the same vehicle).
(Considered and declined: `fear-of-the-lord` — "Surely the fear of God is not in this place" (20:11) is Abraham's mistaken assumption, one clause; thin single-verse presence and a failure-of-the-premise use.)
### Anchor-extension candidates
- integrity | 20:4-6 | "I have done this in the integrity of my heart and the innocence of my hands." (20:5) | medium — the pack's anchors are Job/Psalms/Proverbs sayings; this is a narrative where integrity is claimed, tested, and acknowledged by God.
- dreams-and-visions | 20:3-7 | "But God came to Abimelech in a dream of the night" (20:3) | low — the pack anchors five other Genesis dream texts but not this one.
- prayer-for-healing | 20:17 | "Abraham prayed to God. So God healed Abimelech, his wife, and his female servants" | low — the pack (display id pastoral-prayer-for-healing) has no OT narrative anchor; offered to curation with the closed-wombs caveat noted above.
### Lexicon candidates
- honesty | she is my sister | realistic query phrasings: "abraham lies about sarah", "why did abraham say sarah was his sister", "abraham and abimelech"
- integrity | integrity of my heart | realistic query phrasings: "integrity of heart in the bible", "did abimelech sin with sarah"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 21 (subdivided: 21:1–8; 21:9–21; 21:22–34)
Existing tags (book doc): `gods-faithfulness`, `pastoral-god-sees-my-suffering`, `gods-provision`, `waiting-for-a-child`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "The LORD visited Sarah as he had said, and the LORD did to Sarah as he had spoken." (21:1; "at the set time of which God had spoken", 21:2) — the promise of chs 17–18 kept to the letter and the calendar.
- KEEP `pastoral-god-sees-my-suffering` — a mother weeping at a bowshot's distance ("Don’t let me see the death of the child.", 21:16) answered from the sky: "God has heard the voice of the boy where he is." (21:17) — the pack's God-hears-my-cry register in a personal crisis, squarely within the pastoral personal-crisis scoping.
- KEEP `gods-provision` — "God opened her eyes, and she saw a well of water." (21:19) — water given at the point of death in the wilderness.
- KEEP `waiting-for-a-child` — the pack anchors Genesis 21:1-7 itself ("Who would have said to Abraham that Sarah would nurse children? For I have borne him a son in his old age.", 21:7).
- KEEP `oaths-and-vows` — "Therefore he called that place Beersheba, because they both swore an oath there." (21:31) — the well dispute settled by sworn covenant, seven ewe lambs as witness (21:22-32).
(Considered and declined: `angels` — "The angel of God called to Hagar out of the sky" (21:17) is a single appearance verse; thin single-verse presence, its substance carried by the pastoral tag. `presence-of-god` — "God was with the boy" (21:20) and "God is with you in all that you do" (21:22) are two attestation clauses, thin against the pack's communion register. `sojourners-and-strangers` — 21:23, 34 are framing clauses, not chapter substance; recorded as an anchor candidate below.)
### Anchor-extension candidates
- god-sees-my-suffering | 21:15-19 | "God has heard the voice of the boy where he is." (21:17) | medium — the pack (display id pastoral-god-sees-my-suffering) anchors Gen 16:13 but not the second Hagar scene; "God hears my cry" is in its lexicon.
- gods-provision | 21:19 | "God opened her eyes, and she saw a well of water." | low — the pack's anchors are all promise-texts; a narrative provision-at-the-brink scene.
- oaths-and-vows | 21:22-32 | "Therefore he called that place Beersheba, because they both swore an oath there." (21:31) | low — the pack has no Genesis anchor; the Beersheba oath is a covenant-swearing narrative.
- sojourners-and-strangers | 21:23, 34 | "Abraham lived as a foreigner in the land of the Philistines many days." (21:34) | low — explicit living-as-a-foreigner wording; the pack anchors Gen 23:4 only.
### Lexicon candidates
- waiting-for-a-child | birth of isaac | realistic query phrasings: "the birth of isaac", "god has made me laugh", "sarah nurses a child in her old age"
- pastoral-god-sees-my-suffering | hagar and ishmael | realistic query phrasings: "hagar and ishmael in the wilderness", "god heard the boy crying", "god sees a desperate mother"
- the-name-of-god | everlasting god | realistic query phrasings: "the everlasting god", "el olam meaning" — the WEB reads "called on the name of the LORD, the Everlasting God" (21:33); "el olam" is an alias-bridging question for the alias-mining loop (measured miss first).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (21:1–8; 21:9–21; 21:22–34) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 22
Existing tags (book doc): `gods-provision`, `trust-in-god`, `obedience-to-the-word`, `surrender-to-god`, `testing`, `blessing`, `angels`
### Applied-tag deltas
- KEEP `testing` — the pack anchors Genesis 22:1-14 itself ("After these things, God tested Abraham", 22:1; resolved in "For now I know that you fear God", 22:12) — the chapter's own opening frame and its main theme.
- KEEP `gods-provision` — "God will provide himself the lamb for a burnt offering, my son." (22:8), fulfilled in the ram (22:13) and fixed in the name "The LORD Will Provide" (22:14).
- KEEP `obedience-to-the-word` — "because you have obeyed my voice" (22:18) — God's own stated ground for the sworn blessing; the command obeyed from the early rising on (22:3).
- KEEP `trust-in-god` — three days' walk toward the unthinkable on the strength of the word alone (22:3-8), with "We will worship, and come back to you." (22:5) spoken on the way up.
- KEEP `surrender-to-god` — "you have not withheld your son, your only son, from me" (22:12; repeated in the oath, 22:16) — nothing held back, the pack's all-surrendered register.
- KEEP `blessing` — "I will bless you greatly, and I will multiply your offspring greatly like the stars of the heavens" (22:17); "All the nations of the earth will be blessed by your offspring" (22:18).
- KEEP `angels` — "The LORD’s angel called to him out of the sky" halting the raised knife (22:11-12), and a second call carrying the oath (22:15-18) — two speaking appearances at the chapter's turning points.
(Considered and declined: `fear-of-the-lord` — "For now I know that you fear God" (22:12) is one clause; thin single-clause presence whose substance is carried by `testing` and `surrender-to-god`; recorded as an anchor candidate below. `worship` — "We will worship" (22:5) and the altar (22:9) are instrumental to the test, broad-duplicating-specific against the tags above. `oaths-and-vows` — "‘I have sworn by myself,’ says the LORD" (22:16) is one verse; anchor candidate below. Per the group ruling, NO later-revelation typology is tagged: the substitution reading of 22:8, 13 is offered to curation as a note only, below.)
### Anchor-extension candidates
- fear-of-the-lord | 22:12 | "For now I know that you fear God, since you have not withheld your son, your only son, from me." | low — the pack's anchors are all wisdom/psalm sayings; this is the fear-of-God register demonstrated in narrative.
- oaths-and-vows | 22:16-18 | "‘I have sworn by myself,’ says the LORD" (22:16) | low — the pack's Hebrews 6:16-18 anchor expounds this very oath; the source text is here.
- the-cross | 22:8, 13 | "God will provide himself the lamb for a burnt offering" (22:8); "offered him up for a burnt offering instead of his son" (22:13) | curation note only, NOT a tag and NOT proposed as an applied anchor — curated sources traditionally read the substitution forward; the chapter itself does not, so the display layer does not tag it (group ruling: no later-revelation read-backs); the curator adjudicates whether any pack claims these verses.
### Lexicon candidates
- testing | binding of isaac | realistic query phrasings: "the binding of isaac", "abraham sacrifices isaac", "why did god ask abraham to sacrifice isaac"
- gods-provision | jehovah jireh | realistic query phrasings: "jehovah jireh meaning", "the lord will provide verse" — the WEB reads "The LORD Will Provide" (22:14); "jehovah jireh" is an alias-bridging question for the alias-mining loop (measured miss first).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- above soft cap 6 — 7 tags, each independently clearing the bar (dense chapter); under hard ceiling 8, so no yield required
### Decisions record
- None.

## Genesis 23
Existing tags (book doc): `pastoral-grief-and-loss`, `death-and-burial`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `pastoral-grief-and-loss` — "Abraham came to mourn for Sarah, and to weep for her." (23:2) — personal bereavement of a spouse, the pastoral personal-crisis register; the §11.4 grief-tags-kept ruling covers the pattern.
- KEEP `death-and-burial` — the whole chapter is the burial: the plea "that I may bury my dead out of my sight" (23:4), the purchase weighed out before witnesses (23:16), and "The field, and the cave that is in it, were deeded to Abraham by the children of Heth as a possession for a burial place." (23:20). Adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22, which already lists Gen 23 among its blocked refs.
- KEEP `sojourners-and-strangers` — the pack anchors Genesis 23:4 itself ("I am a stranger and a foreigner living with you.").
(No ADD — honest-and-empty preferred: the Hittites' courtesies and Abraham's insistence on full price (23:9, 13) are transaction conduct, thin against `integrity`'s walk-in-integrity register; no further concept clears the bar.)
### Anchor-extension candidates
- grief-and-loss | 23:2 | "Abraham came to mourn for Sarah, and to weep for her." | low — the pack (display id pastoral-grief-and-loss) has no Genesis anchor; Scripture's first extended mourning-and-burial scene.
### Lexicon candidates
- pastoral-grief-and-loss | death of a spouse | realistic query phrasings: "grieving the loss of my wife", "death of a spouse in the bible", "abraham mourns sarah"
- sojourners-and-strangers | stranger and foreigner | realistic query phrasings: "i am a stranger and a foreigner", "abraham buys a burial plot as a foreigner"
### New-concept candidates
- ROUTED — corpus-blocked roster row 22 `death-and-burial`: the cave of Machpelah purchase (23:3-20) is that row's burial-practice register, and the row already records Gen 23 among its corpus-blocked refs; "cave of machpelah" / "burial in the bible" query phrasings ride that row. Routed, not duplicated.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 24
Existing tags (book doc): `guidance`, `prayer`, `godly-marriage`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `guidance` — the servant's testimony: "As for me, the LORD has led me on the way to the house of my master’s relatives." (24:27; "who had led me in the right way", 24:48) — the whole errand is God-directed step by step.
- KEEP `prayer` — the sign asked at the spring (24:12-14) and answered mid-sentence: "Before he had finished speaking, behold, Rebekah came out" (24:15; retold, 24:45).
- KEEP `godly-marriage` — a wife sought under God's direction, given with consent ("Will you go with this man?" She said, "I will go.", 24:58) and received in love: "she became his wife. He loved her." (24:67).
- KEEP `oaths-and-vows` — "Please put your hand under my thigh. I will make you swear by the LORD" (24:2-3) — the mission opens under oath, with its release conditions spelled out (24:8, 41).
- ADD `worship` — WEB quote: "The man bowed his head, and worshiped the LORD." (24:26; again "I bowed my head, and worshiped the LORD", 24:48, and "he bowed himself down to the earth to the LORD", 24:52) — worship offered three times at the chapter's turning points, in direct response to answered prayer; the pack's bow-down register depicted, not a passing mention.
- ADD `kindness` — WEB quote: "Blessed be the LORD, the God of my master Abraham, who has not forsaken his loving kindness and his truth toward my master." (24:27) — kindness is the chapter's own repeated word: asked of God ("show kindness to my master Abraham", 24:12, 14), embodied in Rebekah's unasked watering of ten camels (24:19-20), and requested of the family ("if you will deal kindly and truly with my master", 24:49); the pack's showing-kindness register, whose Ruth 1:8 / 2 Samuel 9 anchors are the same loving-kindness narrative shape.
(Considered and declined: `hospitality` — Laban's welcome (24:31-33) is real but instrumental scene-mechanics beside the tags above. `gods-faithfulness` / `blessing` — "The LORD had blessed Abraham in all things" (24:1) and the family's blessing (24:60) are frame verses, broad-duplicating-specific against `guidance` and `kindness`.)
### Anchor-extension candidates
- guidance | 24:12-27, 48 | "As for me, the LORD has led me on the way" (24:27) | medium — the pack's anchors are all promise-texts; this is Scripture's fullest led-on-the-way narrative.
- prayer | 24:12-15 | "Before he had finished speaking, behold, Rebekah came out" (24:15) | medium — a specific petition answered before it ends; the pack has no Genesis anchor.
- kindness | 24:12-14, 27, 49 | "who has not forsaken his loving kindness and his truth toward my master" (24:27) | low (stands or falls with the ADD above).
### Lexicon candidates
- guidance | led me on the way | realistic query phrasings: "god led me on the way", "abraham's servant finds rebekah", "god's leading in finding a spouse"
- godly-marriage | isaac and rebekah | realistic query phrasings: "isaac and rebekah story", "how isaac met rebekah", "praying for a spouse"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 25 (subdivided: 25:1–11; 25:12–18; 25:19–34)
Existing tags (book doc): `prayer`, `gods-faithfulness`, `waiting-for-a-child`, `death-and-burial`
### Applied-tag deltas
- KEEP `prayer` — "Isaac entreated the LORD for his wife, because she was barren. The LORD was entreated by him" (25:21); Rebekah too "went to inquire of the LORD" and is answered with an oracle (25:22-23).
- KEEP `gods-faithfulness` — "After the death of Abraham, God blessed Isaac, his son." (25:11), and Ishmael's "twelve princes, according to their nations" (25:16) — the promises to both sons kept past the promise-bearer's death.
- KEEP `waiting-for-a-child` — the pack anchors Genesis 25:21 itself; twenty years from marriage (25:20) to birth (25:26), answered through prayer.
- KEEP `death-and-burial` — "Abraham gave up his spirit, and died at a good old age, an old man, and full of years, and was gathered to his people." (25:8), buried by his sons in the cave of Machpelah (25:9-10; Ishmael's death likewise, 25:17). Adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22, which already lists Gen 25 among its blocked refs.
(Considered and declined: `aging-and-old-age` — "died at a good old age" (25:8) is one clause of a death notice, not the pack's aging-with-faith teaching register. `nations-and-peoples` — "Two nations are in your womb" (25:23) and 25:16 are two verses, thin against the pack's table-of-nations register. `oaths-and-vows` — "Swear to me first." (25:33) is one verse inside the birthright sale.)
### Anchor-extension candidates
- prayer | 25:21-23 | "Isaac entreated the LORD for his wife, because she was barren. The LORD was entreated by him" (25:21) | low — intercession for a spouse answered; the pack has no Genesis anchor.
### Lexicon candidates
- waiting-for-a-child | isaac prayed for his wife | realistic query phrasings: "isaac prayed for rebekah", "praying for my wife to conceive"
- seeking-god | inquire of the lord | realistic query phrasings: "inquiring of the lord", "what does it mean to inquire of the lord" — the WEB reads "She went to inquire of the LORD." (25:22).
### New-concept candidates
- birthright | rationale: no id in the concept index, the adopted list, or the roster serves birthright queries; corpus-blocked roster row 26 `inheritance` is adjacent but is the Joshua land-allotment (and NT in-Christ) register, noted to avoid duplication, not routed — Esau's despised birthright is a different, heavily-searched theme | anchor: "Jacob said, “First, sell me your birthright.”" (25:31) through "So Esau despised his birthright." (25:34). Realistic queries: "esau sells his birthright", "what is a birthright in the bible", "why did esau despise his birthright".
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (25:1–11; 25:12–18; 25:19–34) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 26
Existing tags (book doc): `gods-faithfulness`, `presence-of-god`, `fear-not`, `harmony-with-others`, `blessing`, `envy-and-jealousy`, `oaths-and-vows`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "I will establish the oath which I swore to Abraham your father." (26:3) — the promise carried whole to the next generation, "because Abraham obeyed my voice" (26:5).
- KEEP `presence-of-god` — the chapter's refrain: "I will be with you" (26:3), "I am with you" (26:24), and even outsiders' verdict, "We saw plainly that the LORD was with you." (26:28).
- KEEP `fear-not` — "Don’t be afraid, for I am with you, and will bless you" (26:24) — the pack's divine fear-not address itself, spoken into Isaac's fear-driven chapter (cf. "for he was afraid to say, 'My wife'", 26:7); kept per this ledger's Gen 15:1 single-address precedent.
- KEEP `harmony-with-others` — well after well yielded rather than fought over ("He left that place, and dug another well. They didn’t argue over that one.", 26:22), ending in a sworn peace and a feast (26:28-31).
- KEEP `blessing` — "reaped in the same year one hundred times what he planted. The LORD blessed him." (26:12); "You are now the blessed of the LORD." (26:29; promised, 26:3-4, 24).
- KEEP `envy-and-jealousy` — "The Philistines envied him." (26:14) — the named envy that drives the stopped wells and the expulsion (26:15-16).
- KEEP `oaths-and-vows` — God's own sworn oath re-established (26:3) and the human oath closing the strife: "They rose up some time in the morning, and swore an oath to one another." (26:31).
- ADD `honesty` — WEB quote: "He said, “She is my sister,” for he was afraid to say, “My wife”" (26:7), unraveled by Abimelech's rebuke: "What is this you have done to us? One of the people might easily have lain with your wife, and you would have brought guilt on us!" (26:10) — a full deception-and-exposure scene (26:6-11), the same register this ledger keeps on chs 12 and 20.
- DROP `sojourners-and-strangers` — this chapter's WEB text carries no stranger/foreigner wording: 26:2-3 read "Don’t go down into Egypt. Live in the land I will tell you about. Live in this land" — §5's word-for-word in-chapter quote requirement cannot be met (the book doc's "live as a foreigner" justification is a paraphrase, not this text), and the residing-under-promise substance is carried by `gods-faithfulness`, `presence-of-god`, and `blessing`. Recorded in the Decisions record — not a silent drop.
### Anchor-extension candidates
- presence-of-god | 26:3, 24, 28 | "Don’t be afraid, for I am with you, and will bless you" (26:24) | medium — the I-am-with-you refrain across the chapter; the pack has no Genesis anchor.
- harmony-with-others | 26:17-22, 31 | "For now the LORD has made room for us, and we will be fruitful in the land." (26:22) | low — the pack's anchors are all NT exhortations; yielding-rather-than-quarreling enacted at cost.
- gods-provision | 26:1-3, 12 | "Isaac sowed in that land, and reaped in the same year one hundred times what he planted. The LORD blessed him." (26:12) | low — famine-season provision; the recorded famine→`gods-provision` routing (PR #41 lexicon extension, Gen 26 named in that record) points here, so this is its anchor-side counterpart. Not tagged — broad-duplicating-specific against `blessing` at a full chapter.
### Lexicon candidates
- harmony-with-others | isaacs wells | realistic query phrasings: "isaac's wells", "esek sitnah rehoboth", "the lord has made room for us"
- blessing | hundredfold | realistic query phrasings: "reaped a hundredfold", "isaac sowed and reaped a hundredfold"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit hard ceiling 8 (after the ADD/DROP above, 8 tags each independently clearing the bar) — marked for per-verse refinement
### Decisions record
- DROP `sojourners-and-strangers` (existing tag, not silently dropped): quote-requirement failure — no in-chapter WEB stranger/foreigner language exists to satisfy §5 ("Live in this land", 26:3), and the depicted substance is thin against the pack's living-as-a-foreigner register and already carried by other kept tags. The `honesty` ADD then fills the eighth slot at the hard ceiling; no further candidate was admitted.

## Genesis 27
Existing tags (book doc): `honesty`, `sin`, `blessing`, `vengeance`
### Applied-tag deltas
- KEEP `honesty` — the disguise carried through lie upon lie ("I am Esau your firstborn.", 27:19; "Are you really my son Esau?" He said, "I am.", 27:24) and named by Isaac: "Your brother came with deceit, and has taken away your blessing." (27:35).
- KEEP `sin` — the wrongdoing bears its own consequences within the chapter: Isaac trembling violently (27:33), Esau's bitter cry (27:34), hatred and a murder plot (27:41), and the family scattered (27:43-45).
- KEEP `blessing` — the whole chapter contends over the father's blessing ("that my soul may bless you before I die", 27:4; the blessing itself, 27:27-29; "Bless me, even me also, my father.", 27:34, 38) — the pack's lexicon carries "fathers blessing".
- KEEP `vengeance` — "Esau said in his heart, “The days of mourning for my father are at hand. Then I will kill my brother Jacob.”" (27:41) — planned revenge narrated, never commended, and it drives the flight (27:42-45).
(Considered and declined: `family-reconciliation` — the pack's register is the healing (its anchors are Gen 33:4 and 45:1-15); this chapter is the rupture those anchors resolve, so tagging it here would invert the register. `envy-and-jealousy` — Esau's hatred (27:41) is grievance over a theft, not the pack's coveting register. `favoritism` — enacted through the chapter's alignments but stated as text in ch. 25, not here; no in-chapter quote names it.)
### Anchor-extension candidates
- honesty | 27:18-27, 35 | "Your brother came with deceit, and has taken away your blessing." (27:35) | medium — the pack's anchors are all NT exhortations; Scripture's most extended deception narrative, with its cost shown in-chapter.
- blessing | 27:27-29, 38-40 | "God give you of the dew of the sky, of the fatness of the earth, and plenty of grain and new wine." (27:28) | low — the pack anchors Gen 48:15-16 but not the contested Isaac blessing scene.
### Lexicon candidates
- honesty | jacob deceives isaac | realistic query phrasings: "jacob steals esau's blessing", "jacob deceives his father", "jacob and esau blessing"
- blessing | bless me even me also | realistic query phrasings: "esau begs for a blessing", "bless me even me also my father"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 28 (subdivided: 28:1–9; 28:10–22)
Existing tags (book doc): `presence-of-god`, `gods-faithfulness`, `tithing`, `worship`, `dreams-and-visions`, `blessing`, `angels`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `presence-of-god` — "Behold, I am with you, and will keep you, wherever you go... For I will not leave you until I have done that which I have spoken of to you." (28:15), answered by Jacob's "Surely the LORD is in this place, and I didn’t know it." (28:16) — the pack's never-leave register in both directions.
- KEEP `gods-faithfulness` — "I am the LORD, the God of Abraham your father, and the God of Isaac. I will give the land you lie on to you and to your offspring." (28:13) — the promise restated whole to the third generation (28:13-14).
- KEEP `worship` — the pillar raised and anointed ("took the stone that he had put under his head, and set it up for a pillar, and poured oil on its top", 28:18) and the place consecrated (28:18-22).
- KEEP `dreams-and-visions` — the pack anchors Genesis 28:12 itself ("He dreamed and saw a stairway set upon the earth, and its top reached to heaven.").
- KEEP `blessing` — sent out under "the blessing of Abraham" ("May God Almighty bless you", 28:3-4) and extended by God himself: "In you and in your offspring, all the families of the earth will be blessed." (28:14).
- KEEP `angels` — "Behold, the angels of God were ascending and descending on it." (28:12) — one verse, but the chapter's defining image; the pack's John 1:51 anchor is this scene's echo.
- KEEP `oaths-and-vows` — "Jacob vowed a vow" (28:20) — Scripture's first recorded vow, its conditions and pledge spelled out in full (28:20-22).
- ADD `the-house-of-god` — WEB quote: "How awesome this place is! This is none other than God’s house, and this is the gate of heaven." (28:17; named Bethel, 28:19; "this stone, which I have set up for a pillar, will be God’s house", 28:22) — the chapter's own repeated words and its climactic naming; the pack's God's-dwelling-place register at its origin text.
- DROP `tithing` — §11.6 yield at the hard ceiling (see Decisions record): "Of all that you will give me I will surely give a tenth to you." (28:22) is one clause inside the vow already carried by `oaths-and-vows` — the thin-single-verse class yields first among these eight; the engine-side tithe coverage is preserved as an anchor-extension candidate below. Not a silent drop.
### Anchor-extension candidates
- the-house-of-god | 28:16-19, 22 | "This is none other than God’s house, and this is the gate of heaven." (28:17) | medium — the pack has no Genesis anchor; Bethel is the term's origin narrative.
- presence-of-god | 28:15-16 | "Behold, I am with you, and will keep you, wherever you go" (28:15) | medium — a heavy query register ("I will never leave you"); the pack has no Genesis anchor.
- tithing | 28:20-22 | "Of all that you will give me I will surely give a tenth to you." (28:22) | low — the display tag yielded at the ceiling; the pack anchors Gen 14:20's tithe scene via its lexicon but not Jacob's tenth-vow.
### Lexicon candidates
- dreams-and-visions | jacobs ladder | realistic query phrasings: "jacob's ladder", "stairway to heaven in the bible", "jacob's dream at bethel"
- the-house-of-god | bethel | realistic query phrasings: "what does bethel mean", "gate of heaven", "house of god in the bible" — bare "bethel" may be a place-name lookup; the alias-mining loop should measure before any pack claims it.
- presence-of-god | surely the lord is in this place | realistic query phrasings: "surely the lord is in this place", "god was here and i didn't know it"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit hard ceiling 8 (after the ADD/DROP above, 8 tags each independently clearing the bar); book doc subdivides this chapter (28:1–9; 28:10–22) — marked for per-verse refinement
### Decisions record
- YIELD (§11.6) `tithing` (existing tag): candidates exceeded the hard ceiling once `the-house-of-god` — a multi-verse, chapter-naming presence (28:17, 19, 22) — was admitted as genuinely stronger. Applying the yield order (no cross-ref class, no theme-witness-with-caveat present), the thin-single-verse class yields: `tithing` (28:22b, one clause inside the vow, its scene already carried by `oaths-and-vows`) over `angels` (28:12, the chapter's defining image). Engine-side tithe coverage preserved via the anchor-extension candidate; the drop is display-layer only and reversible.

## Genesis 29
Existing tags (book doc): `pastoral-god-sees-my-suffering`, `work-and-diligence`, `praise`, `honesty`
### Applied-tag deltas
- KEEP `pastoral-god-sees-my-suffering` — "The LORD saw that Leah was hated, and he opened her womb" (29:31); "Because the LORD has looked at my affliction" (29:32); "Because the LORD has heard that I am hated" (29:33) — the unloved wife seen and heard, the pack's register in a personal crisis, within the pastoral scoping.
- KEEP `work-and-diligence` — fourteen years of service narrated as the chapter's spine: "Jacob served seven years for Rachel. They seemed to him but a few days, for the love he had for her." (29:20; the second seven, 29:27-30).
- KEEP `praise` — "This time I will praise the LORD." (29:35) — the birth-sequence's climax, Judah's name given as an act of praise.
- KEEP `honesty` — the deceiver deceived: "In the morning, behold, it was Leah! He said to Laban, “What is this you have done to me? Didn’t I serve with you for Rachel? Why then have you deceived me?”" (29:25) — a full bait-and-switch scene (29:21-27).
- ADD `romantic-love-and-intimacy` — WEB quote: "Jacob loved Rachel. He said, “I will serve you seven years for Rachel, your younger daughter.”" (29:18; "They seemed to him but a few days, for the love he had for her.", 29:20; "he loved also Rachel more than Leah", 29:30) — romantic love depicted substantially as the chapter's driving motive. Adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 48, whose non-graphic celebration-register design note this narrative fits.
(Considered and declined: `waiting-for-a-child` — "but Rachel was barren" (29:31) is one notice clause; per this ledger's Gen 11:30 precedent the substance is carried on ch. 30. `gods-love` — 29:31's care for the unloved is already carried by the pastoral tag; broad-duplicating-specific.)
### Anchor-extension candidates
- god-sees-my-suffering | 29:31-33 | "Because the LORD has heard that I am hated, he has therefore given me this son also." (29:33) | medium — the pack (display id pastoral-god-sees-my-suffering) anchors Gen 16:13 but not Leah's texts, which are its seen-and-heard register exactly.
- praise | 29:35 | "This time I will praise the LORD." | low — the pack has no Genesis anchor; the Judah-name etymology is a natural one.
### Lexicon candidates
- pastoral-god-sees-my-suffering | leah unloved | realistic query phrasings: "god saw that leah was unloved", "feeling unloved by my husband", "leah in the bible"
- honesty | laban deceives jacob | realistic query phrasings: "jacob tricked into marrying leah", "why did laban switch leah for rachel"
- romantic-love-and-intimacy | jacob and rachel | realistic query phrasings: "jacob and rachel love story", "jacob worked seven years for rachel"
### New-concept candidates
- ROUTED — corpus-blocked roster row 48 `romantic-love-and-intimacy`: the Gen 29:18-20 love narrative is an engine-side anchor lead for that row's eventual pack (its Song of Solomon refs are corpus-blocked; this chapter is in-corpus for the display layer only). Routed with the ADD above, not duplicated.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 30 (subdivided: 30:1–24; 30:25–43)
Existing tags (book doc): `pastoral-god-sees-my-suffering`, `gods-provision`, `envy-and-jealousy`, `waiting-for-a-child`
### Applied-tag deltas
- KEEP `pastoral-god-sees-my-suffering` — "God remembered Rachel, and God listened to her, and opened her womb." (30:22; "God has judged me, and has also heard my voice", 30:6; "God listened to Leah", 30:17) — heard-in-affliction is the sisters' own repeated confession.
- KEEP `gods-provision` — "I have divined that the LORD has blessed me for your sake." (30:27), corroborated by Jacob ("The LORD has blessed you wherever I turned.", 30:30) and enacted in the increase: "The man increased exceedingly, and had large flocks" (30:43).
- KEEP `envy-and-jealousy` — "When Rachel saw that she bore Jacob no children, Rachel envied her sister." (30:1) — the pack's own word, and the spring of the whole birth contest (30:1-8, 14-16).
- KEEP `waiting-for-a-child` — the pack anchors Genesis 30:22-24 itself ("Give me children, or else I will die.", 30:1; "God has taken away my reproach.", 30:23).
(Considered and declined: `prayer` — "God listened to her" (30:17, 22) implies petition but no prayer is depicted in-chapter; thin. `work-and-diligence` — "you know how I have served you" (30:29) is two verses of back-reference; the served-years substance is tagged on ch. 29. `wrestling-with-god` — "I have wrestled with my sister with mighty wrestlings" (30:8) is sister-against-sister, not the pack's God-ward register.)
### Anchor-extension candidates
- envy-and-jealousy | 30:1, 8, 14-16 | "When Rachel saw that she bore Jacob no children, Rachel envied her sister." (30:1) | low — the pack anchors Gen 4 and 37 but not the sisters' rivalry; "sibling rivalry" is in its lexicon.
- god-sees-my-suffering | 30:6, 17, 22 | "God remembered Rachel, and God listened to her, and opened her womb." (30:22) | low — the pack (display id pastoral-god-sees-my-suffering) has no anchor in the Rachel-Leah cycle.
### Lexicon candidates
- waiting-for-a-child | give me children or else i will die | realistic query phrasings: "give me children or i die", "god remembered rachel", "rachel's barrenness"
- envy-and-jealousy | rachel and leah | realistic query phrasings: "rachel and leah rivalry", "jealous of my sister"
### New-concept candidates
- None. (The mandrakes episode (30:14-16) is curiosity trivia, not a search-scale theme; the speckled-flocks bargain (30:31-43) has its providence reading stated by the text only in ch. 31, so nothing is tagged or proposed here for it — no cross-chapter justification.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (30:1–24; 30:25–43) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 31
Existing tags (book doc): `pastoral-god-sees-my-suffering`, `gods-protection`, `work-and-diligence`, `harmony-with-others`, `dreams-and-visions`
### Applied-tag deltas
- KEEP `pastoral-god-sees-my-suffering` — "God has seen my affliction and the labor of my hands, and rebuked you last night." (31:42; "I have seen all that Laban does to you", 31:12) — the exploited worker's twenty years seen and vindicated by God, the pack's register in a personal crisis, within the pastoral scoping.
- KEEP `work-and-diligence` — "You know that I have served your father with all of my strength." (31:6); the twenty years itemized: "in the day the drought consumed me, and the frost by night; and my sleep fled from my eyes." (31:40; 31:38-41).
- KEEP `gods-protection` — "It is in the power of my hand to hurt you, but the God of your father spoke to me last night" (31:29; "God didn’t allow him to hurt me", 31:7; the dream restraint itself, 31:24) — protection enacted three ways across the chapter.
- KEEP `dreams-and-visions` — two divine dreams turn the chapter: "The angel of God said to me in the dream, ‘Jacob,’ and I said, ‘Here I am.’" (31:11) and "God came to Laban the Syrian in a dream of the night" (31:24).
- KEEP `harmony-with-others` — "Now come, let’s make a covenant, you and I. Let it be for a witness between me and you." (31:44) — the quarrel ends in a shared meal by the heap (31:46, 54) and a blessed parting (31:55).
- ADD `honesty` — WEB quote: "Jacob deceived Laban the Syrian, in that he didn’t tell him that he was running away." (31:20; "Your father has deceived me, and changed my wages ten times", 31:7; Laban's charge, "you have deceived me", 31:26-27; Rachel's cover-lie, 31:35) — deception named on every side of the quarrel, the register this ledger keeps on chs 12, 20, 26, 27, and 29.
- ADD `oaths-and-vows` — WEB quote: "Then Jacob swore by the fear of his father, Isaac." (31:53; the witness formula, "May this heap be a witness, and the pillar be a witness", 31:52; the vow recalled, "where you vowed a vow to me", 31:13) — the strife closed under sworn witness, the pack's swearing-an-oath register as on chs 21 and 26.
(Considered and declined: `covenant` — 31:44 is a human parity pact of witness; the pack's register is God's covenant promises (its anchors are Gen 9, 15, 17), and the scene's substance is carried by `harmony-with-others` and `oaths-and-vows`. `idolatry` — the stolen teraphim (31:19, 30-35) are narrated as stolen property, not worshiped or taught against; recorded as a lexicon candidate below. `sojourners-and-strangers` — "Aren’t we considered as foreigners by him?" (31:15) is the daughters' grievance idiom, one verse, not the living-as-a-foreigner register.)
### Anchor-extension candidates
- god-sees-my-suffering | 31:12, 42 | "God has seen my affliction and the labor of my hands" (31:42) | medium — the pack (display id pastoral-god-sees-my-suffering) anchors Gen 16:13 only; "God has seen my affliction" is its register verbatim in Jacob's mouth.
- dreams-and-visions | 31:10-13, 24 | "God came to Laban the Syrian in a dream of the night" (31:24) | low — the pack anchors five Genesis dream texts (chs 28, 37, 40, 41, 46) but neither of this chapter's two.
- work-and-diligence | 31:38-41 | "in the day the drought consumed me, and the frost by night; and my sleep fled from my eyes." (31:40) | low — the pack's anchors are Gen 2:15 and NT exhortations; costly faithful labor narrated at length.
### Lexicon candidates
- work-and-diligence | changed my wages ten times | realistic query phrasings: "working for an unfair boss", "jacob and laban wages", "being cheated at work bible"
- benediction | mizpah | realistic query phrasings: "mizpah blessing", "the lord watch between me and you" — note: 31:49 is popularly used as a benediction; in-chapter it is a watchman formula between wary parties, so the alias-mining loop should measure intent before any pack claims "mizpah".
- idolatry | household gods | realistic query phrasings: "what are teraphim", "why did rachel steal her father's idols", "household gods in the bible"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- above soft cap 6 — 7 tags, each independently clearing the bar; under hard ceiling 8, so no yield required
### Decisions record
- None.

## Genesis 32 (subdivided: 32:1–21; 32:22–32)
Existing tags (book doc): `prayer`, `gods-protection`, `presence-of-god`, `wrestling-with-god`, `blessing`, `angels`
### Applied-tag deltas
- KEEP `wrestling-with-god` — the pack anchors Genesis 32:24-30 itself ("Jacob was left alone, and wrestled with a man there until the breaking of the day.", 32:24; "for you have fought with God and with men, and have prevailed.", 32:28) — kept in its own terms per the group ruling; no later-revelation identification is tagged or proposed.
- KEEP `prayer` — "Please deliver me from the hand of my brother, from the hand of Esau" (32:11) — a crisis petition that pleads God's own promises back to him ("You said, ‘I will surely do you good’", 32:12; 32:9-12).
- KEEP `presence-of-god` — "I have seen God face to face, and my life is preserved." (32:30) — the Peniel naming; the night encounter itself (32:24-30) is presence at its most immediate.
- KEEP `blessing` — "I won’t let you go unless you bless me." (32:26); "So he blessed him there." (32:29) — the demanded blessing is the wrestling's hinge.
- KEEP `angels` — "Jacob went on his way, and the angels of God met him." (32:1) — an angelic host met at the journey's start, named Mahanaim (32:2); the pack's appearance register.
- KEEP `gods-protection` — "This is God’s army." (32:2) — the host encamped alongside the fearful camp, and the deliver-me petition ("lest he come and strike me and the mothers with the children", 32:11) is the pack's prayer-for-protection register.
(No ADD — at the soft cap. Considered and declined: `humble-exaltation` — "I am not worthy of the least of all the loving kindnesses" (32:10) is one clause inside the prayer, thin. `family-reconciliation` — this chapter is the fear-filled approach; the pack's register is the healing, anchored at 33:4 and tagged there. `fear-not` — Jacob "was greatly afraid" (32:7) but no divine fear-not address is spoken in-chapter.)
### Anchor-extension candidates
- prayer | 32:9-12 | "Please deliver me from the hand of my brother, from the hand of Esau" (32:11) | medium — the pack has no Genesis anchor; a model crisis prayer pleading God's own words.
- presence-of-god | 32:30 | "I have seen God face to face, and my life is preserved." | low — a heavy query phrase; the pack has no Genesis anchor.
- angels | 32:1-2 | "Jacob went on his way, and the angels of God met him." (32:1) | low — the pack anchors Gen 16:7-12 but not Mahanaim.
### Lexicon candidates
- wrestling-with-god | peniel | realistic query phrasings: "what does peniel mean", "i have seen god face to face", "where did jacob wrestle with god"
- wrestling-with-god | israel new name | realistic query phrasings: "why did god change jacob's name to israel", "what does the name israel mean"
- prayer | deliver me from my brother | realistic query phrasings: "jacob's prayer before meeting esau", "praying god's promises back to him"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6; book doc subdivides this chapter (32:1–21; 32:22–32) — marked for per-verse refinement
### Decisions record
- None.

## Genesis 33
Existing tags (book doc): `harmony-with-others`, `forgiving-others`, `family-reconciliation`
### Applied-tag deltas
- KEEP `family-reconciliation` — the pack anchors Genesis 33:4 itself ("Esau ran to meet him, embraced him, fell on his neck, kissed him, and they wept."); the twenty-year breach closes within the chapter (33:4-11).
- KEEP `forgiving-others` — the feared avenger sets the wrong aside: "I have enough, my brother; let that which you have be yours." (33:9; the embrace, 33:4), received by Jacob as grace: "I have seen your face, as one sees the face of God, and you were pleased with me." (33:10) — forgiveness enacted rather than taught.
- KEEP `harmony-with-others` — the dreaded meeting ends with peace kept on both sides (the gift pressed and accepted, 33:11; the escort declined gently, 33:13-15) and "Jacob came in peace to the city of Shechem" (33:18).
(No ADD — honest-and-empty preferred: `worship` — "He erected an altar there, and called it El Elohe Israel." (33:20) is one closing verse, thin single-verse presence; recorded as an anchor candidate below. `generosity` — the pressed gift (33:10-11) is restitution-shaped peacemaking, not the pack's cheerful-giving teaching register.)
### Anchor-extension candidates
- forgiving-others | 33:4-11 | "Esau ran to meet him, embraced him, fell on his neck, kissed him, and they wept." (33:4) | medium — the pack's anchors are all NT teaching texts; this is Scripture's archetypal enacted-forgiveness narrative (Gen 33:4 anchors `family-reconciliation` but not this pack).
- worship | 33:20 | "He erected an altar there, and called it El Elohe Israel." | low — the altar-naming close; the pack's anchors are liturgical/NT texts.
### Lexicon candidates
- family-reconciliation | jacob and esau reunion | realistic query phrasings: "jacob and esau reconcile", "esau forgives jacob", "jacob meets esau after twenty years"
- forgiving-others | seeing the face of god | realistic query phrasings: "i have seen your face as the face of god", "what did jacob mean seeing esau's face like the face of god"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 34
Existing tags (book doc): `sin`, `honesty`, `vengeance`
### Applied-tag deltas
- KEEP `sin` — "he had done folly in Israel in lying with Jacob’s daughter, a thing that ought not to be done." (34:7; "he had defiled Dinah", 34:5, 13) — the violation named as wrong by the text itself, and the response spirals into further wrong (34:25-29).
- KEEP `honesty` — "The sons of Jacob answered Shechem and Hamor his father with deceit" (34:13) — the covenant condition baited as a trap they intend to spring (34:14-17, 25).
- KEEP `vengeance` — "two of Jacob’s sons, Simeon and Levi, Dinah’s brothers, each took his sword, came upon the unsuspecting city, and killed all the males." (34:25) — revenge narrated and answered in-chapter by Jacob's protest ("You have troubled me, to make me odious to the inhabitants of the land", 34:30) and the brothers' unresolved retort ("Should he deal with our sister as with a prostitute?", 34:31).
(No ADD — honest-and-empty preferred: `pastoral-refuge-and-justice` — checked against the group ruling scoping pastoral ids to the personal-crisis register: its lexicon carries the assault vocabulary, but this chapter narrates the violation and a vengeance spiral without the pack's refuge/justice-for-the-oppressed comfort substance; not applied. `justice-and-oppression` — the oppression-of-the-poor/corrupt-courts register is not this chapter. `godly-marriage` — the marriage negotiation (34:8-12) is plot mechanics, not the pack's teaching register.)
### Anchor-extension candidates
- vengeance | 34:25-31 | "Should he deal with our sister as with a prostitute?" (34:31) | low — the pack anchors no Genesis text; the massacre-and-protest narrative is its revenge-never-commended register.
- honesty | 34:13-17 | "The sons of Jacob answered Shechem and Hamor his father with deceit" (34:13) | low — deceit named by the narrator in so many words.
### Lexicon candidates
- vengeance | simeon and levi | realistic query phrasings: "simeon and levi kill shechem", "revenge for dinah", "the massacre at shechem"
- sin | dinah | realistic query phrasings: "what happened to dinah in the bible", "dinah and shechem" — caution: bare "dinah" is a story lookup whose crisis-register cousins ("rape in the bible") already live in pastoral-refuge-and-justice's engine lexicon; the alias-mining loop should measure intent before any pack claims the name.
### New-concept candidates
- None. (Sexual violence in narrative: the declines file's Lamentations block already records Lam 5:11 as "a motif for a future cross-book decision (Gen 34; Judg 19), not a row" — Gen 34 is named in that standing record; witnessed here, not re-proposed.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 35 (subdivided: 35:1–15; 35:16–20; 35:21–26; 35:27–29)
Existing tags (book doc): `worship`, `gods-faithfulness`, `covenant`, `gods-protection`, `pastoral-grief-and-loss`
### Applied-tag deltas
- KEEP `worship` — "Put away the foreign gods that are among you, purify yourselves, and change your garments." (35:2); the altar built at God's command ("I will make there an altar to God, who answered me in the day of my distress", 35:3; built, 35:7) and the drink offering and oil poured out on the pillar (35:14).
- KEEP `gods-faithfulness` — "God, who answered me in the day of my distress, and was with me on the way which I went." (35:3); the promise carried whole to the third generation: "The land which I gave to Abraham and Isaac, I will give it to you, and to your offspring after you I will give the land." (35:12).
- KEEP `covenant` — the Gen 17 covenant renewed in person at Bethel: "I am God Almighty. Be fruitful and multiply. A nation and a company of nations will be from you, and kings will come out of your body." (35:11; the land grant, 35:12; the renaming, 35:10) — the pack's abrahamic-covenant register restated to Israel.
- KEEP `pastoral-grief-and-loss` — a chapter of gathered losses, each marked in its turn: Deborah buried under the oak "called Allon Bacuth" (35:8), "Rachel died, and was buried on the way to Ephrath" (35:19; the pillar on her grave, 35:20), and Isaac "gave up the spirit and died... old and full of days" (35:29) — kept within the §11.4 grief-tags pattern.
- ADD `idolatry` — WEB quote: "Put away the foreign gods that are among you" (35:2; "They gave to Jacob all the foreign gods which were in their hands, and the rings which were in their ears; and Jacob hid them under the oak", 35:4) — the renunciation and burial of household idols is the pack's false-gods register enacted in its remedy; the ch 31 teraphim thread resolves here in the text's own foreign-gods language.
- ADD `the-house-of-god` — WEB quote: "He built an altar there, and called the place El Beth El; because there God was revealed to him" (35:7; "Jacob called the name of the place where God spoke with him “Bethel”.", 35:15) — the commanded return to God's house at Bethel frames the chapter's first movement (35:1, 3, 6-7, 14-15), the register this ledger tags at its ch 28 origin.
- ADD `death-and-burial` — WEB quote: "Rachel died, and was buried on the way to Ephrath (also called Bethlehem). Jacob set up a pillar on her grave." (35:19-20; Deborah's burial, 35:8; "Esau and Jacob, his sons, buried him.", 35:29) — three burials with grave markers; adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22 (Gen 35 noted to that row as an additional anchor lead beside its listed Gen 23/25/47/49/50 refs).
- DROP `gods-protection` — "a terror of God was on the cities that were around them, and they didn’t pursue the sons of Jacob." (35:5) is the tag's whole in-chapter ground: one verse of enacted shielding, the same thin single-verse shape this ledger declined as an ADD at Gen 12:17; the journey's keeping is otherwise carried by `gods-faithfulness` (35:3). Recorded in the Decisions record — not a silent drop; engine-side coverage preserved below.
(Considered and declined: `pastoral-pregnancy-and-child-loss` — Rachel dies in childbirth but the child lives (35:17-18); the pack's lost-child register is not this text. `blessing` — "God appeared to Jacob again... and blessed him" (35:9) rides inside the covenant renewal; broad-duplicating-specific. `dreams-and-visions` — 35:9 is an appearance, not a dream or vision.)
### Anchor-extension candidates
- idolatry | 35:2-4 | "They gave to Jacob all the foreign gods which were in their hands, and the rings which were in their ears; and Jacob hid them under the oak which was by Shechem." (35:4) | medium — the pack has no Genesis anchor; Scripture's first put-away-your-idols scene.
- gods-protection | 35:5 | "a terror of God was on the cities that were around them, and they didn’t pursue the sons of Jacob." | low — preserves the dropped display tag's substance for curation.
- the-house-of-god | 35:1-7, 14-15 | "He built an altar there, and called the place El Beth El" (35:7) | low — companion to this ledger's ch 28 candidate; the return-and-renaming scene.
- grief-and-loss | 35:8, 19-20 | "Rachel died, and was buried on the way to Ephrath" (35:19) | low — the pack (display id pastoral-grief-and-loss) has no Genesis anchor beyond the ch 23 candidate.
### Lexicon candidates
- idolatry | foreign gods | realistic query phrasings: "put away your foreign gods", "getting rid of idols in your house", "what did jacob do with the foreign gods"
- pastoral-grief-and-loss | death of rachel | realistic query phrasings: "rachel dies giving birth to benjamin", "benoni and benjamin meaning", "rachel's tomb"
- the-house-of-god | el bethel | realistic query phrasings: "el bethel meaning", "jacob returns to bethel"
### New-concept candidates
- None. (Death in childbirth (35:16-19) was weighed and not proposed — its crisis register is served by `pastoral-grief-and-loss` here and by `pastoral-pregnancy-and-child-loss` where the child is lost. Reuben's act (35:22) is a one-verse notice with no teaching substance in-chapter; its consequence text lives in ch 49 and stays there — no cross-chapter justification.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- above soft cap 6 — 7 tags after the ADD/DROP above, each independently clearing the bar; book doc subdivides this chapter (35:1–15; 35:16–20; 35:21–26; 35:27–29) — marked for per-verse refinement
### Decisions record
- DROP `gods-protection` (existing tag, not silently dropped): presence-bar failure, not a §11.6 ceiling yield — the tag's entire in-chapter ground is the single verse 35:5, the shape this ledger's Gen 12 entry declined as thin single-verse presence; substance preserved engine-side via the anchor-extension candidate. Reversible at the per-verse refinement pass: the 35:1–15 subdivision could honestly carry it at section granularity.

## Genesis 36
Existing tags (book doc): `nations-and-peoples`
### Applied-tag deltas
- KEEP `nations-and-peoples` — the origin record of a nation: "This is the history of the generations of Esau the father of the Edomites in the hill country of Seir" (36:9; "These are the kings who reigned in the land of Edom, before any king reigned over the children of Israel.", 36:31; the chiefs "according to their families, after their places", 36:40) — the pack's nation-origin register, its second Genesis table. (Only one honest tag from the current vocabulary.)
### Anchor-extension candidates
- nations-and-peoples | 36:9, 31, 40-43 | "These are the kings who reigned in the land of Edom, before any king reigned over the children of Israel." (36:31) | low — the pack anchors Gen 10:32 but not the Edom table.
### Lexicon candidates
- nations-and-peoples | edom | realistic query phrasings: "who are the edomites", "esau's descendants", "edom in the bible"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 37
Existing tags (book doc): `honesty`, `pastoral-grief-and-loss`, `dreams-and-visions`, `envy-and-jealousy`
### Applied-tag deltas
- KEEP `envy-and-jealousy` — the pack anchors Genesis 37:3-11 itself ("His brothers envied him, but his father kept this saying in mind.", 37:11; hatred three times over, 37:4, 5, 8) — the explicit spring of the plot.
- KEEP `dreams-and-visions` — the pack anchors Genesis 37:5-10 itself ("Joseph dreamed a dream, and he told it to his brothers", 37:5; "Behold, this dreamer comes.", 37:19).
- KEEP `honesty` — the staged lie: "They took Joseph’s tunic, and killed a male goat, and dipped the tunic in the blood." (37:31), letting their father draw the false conclusion ("Joseph is without doubt torn in pieces.", 37:33).
- KEEP `pastoral-grief-and-loss` — "Jacob tore his clothes, and put sackcloth on his waist, and mourned for his son many days." (37:34; "he refused to be comforted. He said, “For I will go down to Sheol to my son, mourning.”", 37:35) — a father's grief for a believed-dead child, the pack's personal-crisis register, within the §11.4 pattern.
- ADD `betrayal` — WEB quote: "they conspired against him to kill him" (37:18; "Come, and let’s sell him to the Ishmaelites, and not let our hand be on him; for he is our brother, our flesh.", 37:27; sold "for twenty pieces of silver", 37:28) — betrayed-by-family is the pack's own lexicon register, and the sold-by-his-brothers narrative is the chapter's spine.
- ADD `favoritism` — WEB quote: "Now Israel loved Joseph more than all his children, because he was the son of his old age, and he made him a tunic of many colors. His brothers saw that their father loved him more than all his brothers, and they hated him" (37:3-4) — favoritism stated in-text with its cost narrated through the chapter; this ledger's Gen 27 decline (no in-chapter quote there) is satisfied here by the text itself.
(Considered and declined: `comforting-others` — "All his sons and all his daughters rose up to comfort him, but he refused to be comforted." (37:35) is one verse of failed comfort, thin. Per the group ruling, NO Joseph typology and no providence read-forward is tagged: this chapter's text states no God-meant-it purpose — that wording lives in chs 45 and 50 and stays there.)
### Anchor-extension candidates
- betrayal | 37:18-28 | "Come, and let’s sell him to the Ishmaelites, and not let our hand be on him; for he is our brother, our flesh." (37:27) | medium — the pack has no Genesis anchor; the betrayed-by-family register's defining OT narrative.
- favoritism | 37:3-4 | "Now Israel loved Joseph more than all his children" (37:3) | medium — the pack's anchors are law and epistle partiality texts; the family-favoritism narrative with its consequences.
- grief-and-loss | 37:33-35 | "he refused to be comforted" (37:35) | low — engine-side (display id pastoral-grief-and-loss); mourning for a child, in its lexicon's own territory.
### Lexicon candidates
- favoritism | coat of many colors | realistic query phrasings: "joseph's coat of many colors", "why did jacob favor joseph", "parental favoritism in the bible" — note: the WEB reads "tunic of many colors"; "coat of many colors" is an alias-bridging question for the alias-mining loop (measured miss first).
- betrayal | sold by his brothers | realistic query phrasings: "joseph sold into slavery", "joseph sold by his brothers", "betrayed by your own family"
- pastoral-grief-and-loss | refused to be comforted | realistic query phrasings: "refusing to be comforted", "grieving the loss of a child bible"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 38
Existing tags (book doc): `sin`, `repentance`
### Applied-tag deltas
- KEEP `sin` — the wickedness of Er and Onan named by the text ("Er, Judah’s firstborn, was wicked in the LORD’s sight", 38:7; "The thing which he did was evil in the LORD’s sight", 38:10) and Judah's own wrong exposed and owned ("She is more righteous than I", 38:26).
- KEEP `repentance` — "Judah acknowledged them, and said, “She is more righteous than I, because I didn’t give her to Shelah, my son.” He knew her again no more." (38:26) — public confession with depicted amendment; a single-scene presence kept as the chapter's moral turn (theme-witness).
- ADD `divine-judgment` — WEB quote: "Er, Judah’s firstborn, was wicked in the LORD’s sight. So the LORD killed him." (38:7; "The thing which he did was evil in the LORD’s sight, and he killed him also.", 38:10) — God's judgment on sin stated twice in the text's own words, the pack's judgment-on-sin register; a distinct facet from the `sin` tag's naming of the wrongs.
(Considered and declined: `care-for-widows` — Tamar's widowhood wronged (38:11, 14) is the register in its failure mode; per §5's Genesis-3 worked example a failure-depiction does not carry the concept's teaching substance; offered to curation as an anchor-extension candidate below. `pastoral-sexual-purity` — the chapter's sexual material is narrated device, not the struggle-and-flee register. `oaths-and-vows` — the pledge of signet, cord, and staff (38:17-18) is a commercial surety, not a sworn oath.)
### Anchor-extension candidates
- repentance | 38:26 | "She is more righteous than I, because I didn’t give her to Shelah, my son." | low — the pack has no Genesis anchor; confession-with-amendment in narrative form.
- care-for-widows | 38:11, 14, 26 | "Remain a widow in your father’s house, until Shelah, my son, is grown up" (38:11) | low — curation call: the withheld-duty narrative shows the widow-justice register in the negative; not tagged (see deltas).
- divine-judgment | 38:7, 10 | "Er, Judah’s firstborn, was wicked in the LORD’s sight. So the LORD killed him." (38:7) | low — the pack anchors Genesis flood/Sodom texts but not these two verdict sentences.
### Lexicon candidates
- divine-judgment | onan | realistic query phrasings: "why did god kill onan", "the sin of onan"
- repentance | she is more righteous than i | realistic query phrasings: "she is more righteous than i meaning", "judah admits his sin"
- sin | judah and tamar | realistic query phrasings: "judah and tamar story", "who was tamar in genesis"
### New-concept candidates
- ROUTED — corpus-blocked roster row 27 `kinsman-redeemer`: "Go in to your brother’s wife, and perform the duty of a husband’s brother to her, and raise up offspring for your brother." (38:8) is the levirate register whose either/or (Deut 25:5-10 → a separate `levirate-marriage` candidate) is carried on that row; Gen 38 is the practice's defining narrative, noted to row 27 as an anchor lead. Routed, not duplicated; no tag (no vocabulary id exists outside the gated row).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 39
Existing tags (book doc): `presence-of-god`, `pastoral-sexual-purity`, `sin`, `leadership`, `temptation`
### Applied-tag deltas
- KEEP `presence-of-god` — the chapter's refrain: "The LORD was with Joseph" (39:2; "His master saw that the LORD was with him", 39:3; "But the LORD was with Joseph, and showed kindness to him", 39:21; 39:23) — with him in the house and in the prison alike.
- KEEP `temptation` — "As she spoke to Joseph day by day, he didn’t listen to her, to lie by her, or to be with her." (39:10) — sustained solicitation resisted and finally fled (39:7-12).
- KEEP `pastoral-sexual-purity` — "He left his garment in her hand, and ran outside." (39:12; the refusal, 39:8-9) — the flee-sexual-immorality register enacted at the cost of freedom; serves the struggling-with-sexual-temptation searcher, within the pastoral personal-crisis scoping.
- KEEP `leadership` — trusted administration prospering under God: "Potiphar made him overseer over his house, and all that he had he put into his hand." (39:4; the prison keeper likewise, "committed to Joseph’s hand all the prisoners", 39:22-23).
- KEEP `sin` — "How then can I do this great wickedness, and sin against God?" (39:9) — one verse, but the chapter's hinge: the refusal grounded in sin's Godward nature (theme-witness).
- ADD `integrity` — WEB quote: "Behold, my master doesn’t know what is with me in the house, and he has put all that he has into my hand. No one is greater in this house than I am, and he has not kept back anything from me but you, because you are his wife." (39:8-9) — trust kept when betraying it would cost nothing visible; the pack's walk-in-integrity register tested at price, as at Gen 20.
- ADD `slander-and-false-accusation` — WEB quote: "The Hebrew servant, whom you have brought to us, came in to me to mock me, and as I lifted up my voice and cried, he left his garment by me, and ran outside." (39:17-18; the staged evidence, "She laid up his garment by her, until his master came home.", 39:16; imprisonment, 39:19-20) — a full false-accusation scene with fabricated evidence and unjust punishment, the pack's falsely-accused register.
(Considered and declined: `blessing` — "the LORD blessed the Egyptian’s house for Joseph’s sake" (39:5) rides inside the `presence-of-god` refrain; broad-duplicating-specific. `suffering-of-the-righteous` — the innocent imprisonment is depicted but not reflected on in-chapter; its substance is carried by the slander tag.)
### Anchor-extension candidates
- presence-of-god | 39:2-3, 21-23 | "But the LORD was with Joseph, and showed kindness to him, and gave him favor in the sight of the keeper of the prison." (39:21) | medium — "the LORD was with Joseph" is a heavy query phrase; the pack has no Genesis anchor.
- sexual-purity | 39:7-12 | "He left his garment in her hand, and ran outside." (39:12) | medium — the pack (display id pastoral-sexual-purity) has no narrative anchor; this is the flee-scene its "flee sexual immorality" lexicon teaches.
- slander-and-false-accusation | 39:13-20 | "She laid up his garment by her, until his master came home." (39:16) | low — the pack's anchors are Psalms/NT; a narrative false accusation with planted evidence.
- integrity | 39:8-9 | "he has not kept back anything from me but you, because you are his wife" (39:9) | low (stands with the ADD above).
### Lexicon candidates
- pastoral-sexual-purity | joseph and potiphars wife | realistic query phrasings: "joseph and potiphar's wife", "joseph flees temptation", "how did joseph resist temptation"
- presence-of-god | the lord was with joseph | realistic query phrasings: "the lord was with joseph", "god with you in hard times"
- sin | sin against god | realistic query phrasings: "all sin is against god", "great wickedness and sin against god"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- above soft cap 6 — 7 tags, each independently clearing the bar; under hard ceiling 8, so no yield required
### Decisions record
- None.

## Genesis 40
Existing tags (book doc): `wisdom-from-god`, `honesty`, `dreams-and-visions`
### Applied-tag deltas
- KEEP `dreams-and-visions` — the pack anchors Genesis 40:8 itself ("We have dreamed a dream, and there is no one who can interpret it."); two dreams told, interpreted, and fulfilled to the day (40:5-19, 20-22).
- KEEP `wisdom-from-god` — "Don’t interpretations belong to God?" (40:8) — discernment credited to God, not self, and exercised truly in both interpretations (40:12-13, 18-19).
- KEEP `honesty` — the hard word delivered as faithfully as the good: "Within three more days, Pharaoh will lift up your head from off you, and will hang you on a tree" (40:19) — truth told without softening to a man who could not repay it.
(No ADD — honest-and-empty preferred: `suffering-of-the-righteous` — "here also I have done nothing that they should put me into the dungeon" (40:15) is one protest verse, thin. `comforting-others` — noticing the officers' sadness ("Why do you look so sad today?", 40:7) is two verses of scene-opening care, thin.)
### Anchor-extension candidates
- wisdom-from-god | 40:8 | "Don’t interpretations belong to God?" | low — the pack's anchors are Proverbs/James sayings; the God-owned-discernment credit in narrative.
- dreams-and-visions | 40:5-22 | "They both dreamed a dream, each man his dream, in one night" (40:5) | low — the pack anchors 40:8 alone; the full two-dream cycle with dated fulfillment.
### Lexicon candidates
- dreams-and-visions | cupbearer and baker | realistic query phrasings: "the cupbearer and the baker's dreams", "joseph interprets dreams in prison"
- wisdom-from-god | interpretations belong to god | realistic query phrasings: "don't interpretations belong to god", "who gives the ability to interpret dreams"
### New-concept candidates
- None. (The forgotten-by-man motif was weighed and not proposed: "remember me when it is well with you... and bring me out of this house" (40:14) against "Yet the chief cup bearer didn’t remember Joseph, but forgot him." (40:23) is a real motif, but its plausible searches ("feeling forgotten") are the felt-unseen register already served by `pastoral-god-sees-my-suffering` and the hope registers; recorded here as raw motif feed per §5, not a gap row.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 41
Existing tags (book doc): `wisdom-from-god`, `gods-provision`, `humble-exaltation`, `dreams-and-visions`, `leadership`
### Applied-tag deltas
- KEEP `wisdom-from-god` — "It isn’t in me. God will give Pharaoh an answer of peace." (41:16) — discernment disclaimed as his own and credited to God, then acknowledged: "Because God has shown you all of this, there is no one so discreet and wise as you." (41:39).
- KEEP `gods-provision` — "The food will be to supply the land against the seven years of famine, which will be in the land of Egypt; so that the land will not perish through the famine." (41:36); "There was famine in all lands, but in all the land of Egypt there was bread." (41:54) — the recorded famine→`gods-provision` routing (PR #41 lexicon extension, Gen 41–47 named in that record) points here.
- KEEP `humble-exaltation` — "they brought him hastily out of the dungeon" (41:14) to "Behold, I have set you over all the land of Egypt." (41:41) — the dungeon-to-throne lift in a single day, the pack's promotion register in narrative form.
- KEEP `dreams-and-visions` — the pack anchors Genesis 41:25-32 itself ("The dream of Pharaoh is one. What God is about to do he has declared to Pharaoh.", 41:25); the double dream, the failed experts (41:8), and the dated fulfillment (41:53-54).
- KEEP `leadership` — "Now therefore let Pharaoh look for a discreet and wise man, and set him over the land of Egypt." (41:33), then the oversight executed: "Joseph laid up grain as the sand of the sea, very much, until he stopped counting" (41:49) — wise administration under God, the pack's godly-leader register.
- ADD `providence` — WEB quote: "The dream was doubled to Pharaoh, because the thing is established by God, and God will shortly bring it to pass." (41:32; "God has shown Pharaoh what he is about to do.", 41:28) — God announcing and then ordaining the course of years for nations is the pack's God-ordains-events register, stated three times in the chapter's own words (41:25, 28, 32); the pack anchors Gen 45:5-7 and 50:20 but this is the arc's providential hinge.
(Considered and declined: `holy-spirit` — "Can we find such a one as this, a man in whom is the Spirit of God?" (41:38) is one verse of Pharaoh's assessment, thin single-verse presence; routed engine-side below.)
### Anchor-extension candidates
- providence | 41:25-32 | "The dream was doubled to Pharaoh, because the thing is established by God, and God will shortly bring it to pass." (41:32) | medium — the pack anchors the arc's Gen 45/50 summary texts but not the announcement scene that sets them up.
- humble-exaltation | 41:14, 40-43 | "Then Pharaoh sent and called Joseph, and they brought him hastily out of the dungeon." (41:14) | medium — the pack's anchors are teaching texts (Ps 75:6-7 promotion register); this is its defining OT narrative.
- gods-provision | 41:34-36, 56-57 | "The food will be to supply the land against the seven years of famine" (41:36) | medium — anchor-side counterpart of the PR #41 famine-lexicon routing that names this chapter.
### Lexicon candidates
- dreams-and-visions | pharaohs dream | realistic query phrasings: "pharaoh's dream of seven cows", "joseph interprets pharaoh's dreams", "seven fat and seven thin cows meaning"
- humble-exaltation | from prison to palace | realistic query phrasings: "joseph from prison to palace", "how god promoted joseph", "exalted in one day"
- gods-provision | seven years of plenty | realistic query phrasings: "seven years of plenty and seven years of famine", "storing up in the good years", "god provides in famine"
### New-concept candidates
- ROUTED — corpus-blocked roster row 13 `empowered-by-the-spirit`: "Can we find such a one as this, a man in whom is the Spirit of God?" (41:38) is that row's Spirit-given-ability-for-a-task register (its Judges refrain texts are corpus-blocked); Gen 41:38 noted to row 13 as a possible additional anchor lead. Routed, not duplicated; not tagged (thin single-verse presence, see deltas).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 42
Existing tags (book doc): `honesty`, `repentance`, `gods-provision`
### Applied-tag deltas
- KEEP `honesty` — "We are all one man’s sons; we are honest men. Your servants are not spies." (42:11), put to proof: "you shall be bound, that your words may be tested, whether there is truth in you" (42:16) — the truthfulness claim is the chapter's tested question.
- KEEP `repentance` — "We are certainly guilty concerning our brother, in that we saw the distress of his soul, when he begged us, and we wouldn’t listen. Therefore this distress has come upon us." (42:21) — guilt owned aloud for the first time, twenty years on; Reuben presses it: "behold, his blood is required." (42:22).
- KEEP `gods-provision` — "Behold, I have heard that there is grain in Egypt. Go down there, and buy for us from there, so that we may live, and not die." (42:2); grain, money restored, and food for the way given (42:25) — the famine→`gods-provision` routing (PR #41) names Gen 41–47.
- ADD `conscience` — WEB quote: "We are certainly guilty concerning our brother" (42:21; "Their hearts failed them, and they turned trembling to one another, saying, “What is this that God has done to us?”", 42:28) — the inner witness accusing across decades and reading events as God's reckoning is the pack's conscience register depicted substantially (42:21-22, 28, 35), a distinct facet from the turning `repentance` names. Note for the orchestrator: the pack's anchors are Romans teaching texts; a delegated-default ADD, droppable if the register is judged too far from a narrative depiction.
### Anchor-extension candidates
- fear-of-the-lord | 42:18 | "Do this, and live, for I fear God." | low — one verse (not tagged; thin single-verse presence): the fear-of-God register as the ground of fair dealing with the powerless, a natural narrative anchor.
- conscience | 42:21-22, 28 | "What is this that God has done to us?" (42:28) | low (stands or falls with the ADD above).
### Lexicon candidates
- conscience | guilty conscience | realistic query phrasings: "guilty conscience in the bible", "when guilt catches up with you", "we are guilty concerning our brother"
- honesty | we are honest men | realistic query phrasings: "joseph accuses his brothers of spying", "we are honest men", "joseph tests his brothers"
### New-concept candidates
- None. (Jacob's bereavement protest — "You have bereaved me of my children! ... All these things are against me." (42:36) — was weighed for `pastoral-grief-and-loss` and declined: two verses of protest, thin, and the pastoral register is scoped to personal-crisis use; recorded as raw motif feed per §5, not a gap.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 43
Existing tags (book doc): `gods-provision`, `fear-not`
### Applied-tag deltas
- KEEP `gods-provision` — "The famine was severe in the land." (43:1) drives the second journey; the steward reframes even the returned silver as God's gift: "Your God, and the God of your father, has given you treasure in your sacks." (43:23); the family is fed at Joseph's table (43:31-34).
- KEEP `fear-not` — "Peace be to you. Don’t be afraid." (43:23) — spoken to men who "were afraid, because they were brought to Joseph’s house" (43:18); the pack's do-not-be-afraid address at the scene's turning point.
- ADD `mercy` — WEB quote: "May God Almighty give you mercy before the man, that he may release to you your other brother and Benjamin." (43:14; answered in the event: Simeon brought out, 43:23, and "God be gracious to you, my son.", 43:29) — mercy asked of God Almighty by name and granted through the chapter; the pack's mercy-and-compassion register, asked and enacted rather than merely mentioned.
(Considered and declined: `hospitality` — water, foot-washing, fodder, and a feast (43:24-34) depict the topic's form, but the host is a brother testing his own family incognito, not the pack's welcome-the-stranger teaching register; honest-and-empty preferred. `prayer` — 43:14 is a single petition verse, thin, and its substance is carried by the `mercy` ADD.)
### Anchor-extension candidates
- mercy | 43:14, 29 | "May God Almighty give you mercy before the man" (43:14) | low (stands or falls with the ADD above).
- fear-not | 43:23 | "Peace be to you. Don’t be afraid." | low — the pack has no Genesis anchor; a reassurance-to-the-terrified narrative scene.
- gods-provision | 43:23 | "Your God, and the God of your father, has given you treasure in your sacks." | low — provision credited to God in the text's own words.
### Lexicon candidates
- fear-not | peace be to you | realistic query phrasings: "peace be to you don't be afraid", "god calming my fears"
- gods-provision | treasure in your sacks | realistic query phrasings: "god has given you treasure in your sacks", "why was the money returned in their sacks"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 44
Existing tags (book doc): `repentance`, `loving-others`
### Applied-tag deltas
- KEEP `repentance` — "What will we tell my lord? What will we speak? How will we clear ourselves? God has found out the iniquity of your servants." (44:16) — sin confessed to God's account without excuse, and the change proven in deed: the man who once proposed the sale now offers himself (44:33).
- KEEP `loving-others` — "Now therefore, please let your servant stay instead of the boy, my lord’s slave; and let the boy go up with his brothers." (44:33; "For how will I go up to my father, if the boy isn’t with me?—lest I see the evil that will come on my father.", 44:34) — costly self-substituting love for brother and father, the pack's love-one-another register enacted at full price.
(No ADD — honest-and-empty preferred: `testing` — Joseph's staged cup-test (44:1-12) is a man testing men, not the pack's why-does-God-test-us register. `honesty` — the planted cup is the tester's device, not a truthfulness theme the chapter teaches. `family-reconciliation` — the turn is underway but the reconciliation itself happens in ch 45, where the pack anchors it.)
### Anchor-extension candidates
- loving-others | 44:18-34 | "Now therefore, please let your servant stay instead of the boy, my lord’s slave" (44:33) | medium — the pack's anchors are all teaching texts; Judah's plea is Scripture's archetypal stand-in-his-place narrative.
- repentance | 44:16 | "God has found out the iniquity of your servants." | low — the pack has no Genesis anchor; owned guilt without self-defense.
### Lexicon candidates
- loving-others | judah offers himself | realistic query phrasings: "judah offers himself in place of benjamin", "judah's plea to joseph", "laying down your life for a brother"
- repentance | god has found out our iniquity | realistic query phrasings: "god has found out our iniquity", "when hidden sin is exposed"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 45
Existing tags (book doc): `forgiving-others`, `providence`, `gods-provision`, `family-reconciliation`
### Applied-tag deltas
- KEEP `forgiving-others` — "Now don’t be grieved, nor angry with yourselves, that you sold me here, for God sent me before you to preserve life." (45:5); "He kissed all his brothers, and wept on them." (45:15) — the wronged man releases the wrong and comforts the wrongdoers.
- KEEP `providence` — the pack anchors Genesis 45:5-7 itself ("So now it wasn’t you who sent me here, but God", 45:8) — the whole story reframed under God's governing purpose in the text's own words.
- KEEP `gods-provision` — "There I will provide for you; for there are yet five years of famine; lest you come to poverty" (45:11); wagons, provision for the way, and the good of the land given (45:17-23).
- KEEP `family-reconciliation` — the pack anchors Genesis 45:1-15 itself ("I am Joseph! Does my father still live?", 45:3; "After that his brothers talked with him.", 45:15) — the estrangement ends in the pack's own anchor scene.
(Considered and declined: `remnant` — "God sent me before you to preserve for you a remnant on the earth" (45:7) is the pack's word in a single verse, thin single-verse presence; preserved engine-side below. `humble-exaltation` — "he has made me a father to Pharaoh" (45:8) is one clause recapping the ch 41 exaltation already tagged there.)
### Anchor-extension candidates
- remnant | 45:7 | "God sent me before you to preserve for you a remnant on the earth, and to save you alive by a great deliverance." | medium — the pack has no Genesis anchor; this is the remnant word's first covenant-family use, expounded by the pack's prophetic anchors.
- forgiving-others | 45:4-15 | "Now don’t be grieved, nor angry with yourselves, that you sold me here" (45:5) | medium — the pack's anchors are all NT teaching texts; companion to this ledger's ch 33 candidate.
### Lexicon candidates
- providence | god sent me before you | realistic query phrasings: "god sent me ahead of you", "it was not you who sent me here but god", "god's purpose in what others meant for harm"
- family-reconciliation | i am joseph | realistic query phrasings: "i am joseph your brother", "joseph reveals himself to his brothers", "joseph reunited with his brothers"
### New-concept candidates
- ROUTED — corpus-blocked roster row 32 `deliverance`: "to save you alive by a great deliverance" (45:7) is that row's rescue-narrative register in the text's own word; Gen 45:7 noted to row 32 as an additional anchor lead beside this ledger's ch 14 routing. Routed, not duplicated.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 46
Existing tags (book doc): `gods-faithfulness`, `fear-not`, `presence-of-god`, `guidance`, `dreams-and-visions`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "I am God, the God of your father. Don’t be afraid to go down into Egypt, for there I will make of you a great nation." (46:3) — the great-nation promise travels with the family across the border, and the reunion pledge is kept in the chapter itself (46:29-30).
- KEEP `fear-not` — "Don’t be afraid to go down into Egypt" (46:3) — the pack's address at the decision the patriarch feared.
- KEEP `presence-of-god` — "I will go down with you into Egypt. I will also surely bring you up again." (46:4) — God's own with-you pledge, the pack's never-leave-you register.
- KEEP `guidance` — Israel halts at Beersheba and "offered sacrifices to the God of his father, Isaac" (46:1) before the border, and the move proceeds only under the night-vision go-ahead (46:2-4) — direction sought and given at the fork, the pack's register.
- KEEP `dreams-and-visions` — the pack anchors Genesis 46:2 itself ("God spoke to Israel in the visions of the night, and said, “Jacob, Jacob!”").
(Considered and declined: `worship` — the sacrifices at 46:1 are one verse of scene-opening, thin single-verse presence, and their seeking substance is carried by the `guidance` keep. `nations-and-peoples` — the seventy-name list (46:8-27) is Israel's own family register, not the pack's table-of-nations register.)
### Anchor-extension candidates
- presence-of-god | 46:3-4 | "I will go down with you into Egypt. I will also surely bring you up again." (46:4) | medium — companion to this ledger's ch 28 candidate; the with-you pledge at a border crossing, and the pack has no Genesis anchor.
- fear-not | 46:3 | "Don’t be afraid to go down into Egypt" | low — the pack has no Genesis anchor; a named fear met with a reason ("for there I will make of you a great nation").
### Lexicon candidates
- presence-of-god | i will go down with you | realistic query phrasings: "god will go with you", "i will surely bring you up again", "god's presence in a big move"
- dreams-and-visions | visions of the night | realistic query phrasings: "god spoke in visions of the night", "jacob's vision at beersheba"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Genesis 47
Existing tags (book doc): `gods-provision`, `gods-faithfulness`, `leadership`, `death-and-burial`, `oaths-and-vows`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `gods-provision` — "Joseph provided his father, his brothers, and all of his father’s household with bread, according to the sizes of their families." (47:12); the starving nation's own verdict, "You have saved our lives!" (47:25) — the famine→`gods-provision` routing (PR #41, Gen 41–47 named) closes on this chapter.
- KEEP `gods-faithfulness` — "Israel lived in the land of Egypt, in the land of Goshen; and they got themselves possessions therein, and were fruitful, and multiplied exceedingly." (47:27) — the be-fruitful-and-multiply promise holding through a famine that "fainted" two lands (47:13).
- KEEP `leadership` — the famine administration in full: money, livestock, and land taken in for bread (47:14-20), the people resettled and seeded (47:21-23), and a durable statute, "you shall give a fifth to Pharaoh, and four parts will be your own" (47:24, 26) — the pack's wise-administration register at chapter length.
- KEEP `death-and-burial` — "Please don’t bury me in Egypt, but when I sleep with my fathers, you shall carry me out of Egypt, and bury me in their burying place." (47:29-30) — the dying charge about where and with whom to be buried; adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22, whose listed refs already include Gen 47.
- KEEP `oaths-and-vows` — "Israel said, “Swear to me,” and he swore to him." (47:31; the hand-under-the-thigh pledge, "please put your hand under my thigh, and deal kindly and truly with me", 47:29) — the burial charge bound by sworn oath, the pack's register.
- KEEP `sojourners-and-strangers` — "We have come to live as foreigners in the land" (47:4); "The years of my pilgrimage are one hundred thirty years... They have not attained to the days of the years of the life of my fathers in the days of their pilgrimage." (47:9) — unlike the Gen 26 quote-failure drop, this chapter carries the pack's foreigner-and-pilgrimage wording in-text, twice.
(No ADD — chapter is at the soft cap; `blessing` was considered and declined: "Jacob blessed Pharaoh" (47:7, 10) is two framing verses, thin against the chapter's substance.)
### Anchor-extension candidates
- sojourners-and-strangers | 47:4, 9 | "The years of my pilgrimage are one hundred thirty years." (47:9) | medium — the pack anchors Gen 23:4 only; Jacob-before-Pharaoh is the pilgrimage register's classic OT scene.
- gods-provision | 47:12-25 | "You have saved our lives!" (47:25) | low — provision administered through a man for two nations; the pack's anchors are promise-texts.
### Lexicon candidates
- sojourners-and-strangers | days of my pilgrimage | realistic query phrasings: "the years of my pilgrimage", "life as a pilgrimage in the bible", "jacob before pharaoh"
- oaths-and-vows | hand under the thigh | realistic query phrasings: "put your hand under my thigh meaning", "why swear with a hand under the thigh"
- gods-provision | you have saved our lives | realistic query phrasings: "joseph saves egypt from famine", "joseph buys all the land of egypt"
### New-concept candidates
- ROUTED — corpus-blocked roster row 22 `death-and-burial`: the burial charge (47:29-31) is that row's burial-practice register and the row already lists Gen 47 among its corpus-blocked refs — witnessing this ledger's ch 23/25/35 routings, not re-proposing. The display tag above rides the adopted §11.1 id.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- None.

## Genesis 48
Existing tags (book doc): `gods-faithfulness`, `gods-provision`, `presence-of-god`, `blessing`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "God Almighty appeared to me at Luz in the land of Canaan, and blessed me" (48:3; the promise recited in full, 48:4) and handed forward: "Behold, I am dying, but God will be with you, and bring you again to the land of your fathers." (48:21).
- KEEP `presence-of-god` — "The God before whom my fathers Abraham and Isaac walked" (48:15) and "God will be with you" (48:21) — walked-before-God communion and the with-you pledge, the register this ledger keeps at ch 5's "walked with God".
- KEEP `blessing` — the pack anchors Genesis 48:15-16 itself ("bless the lads, and let my name be named on them", 48:16); the adoption (48:5), the crossed-hands blessing (48:14, 17-20), and "He blessed them that day" (48:20) are the chapter's whole action.
- DROP `gods-provision` — the tag's entire in-chapter ground is one clause, "the God who has fed me all my life long to this day" (48:15), inside the blessing already carried by the pack-anchored `blessing` tag — the thin single-verse shape this ledger's Gen 35 `gods-protection` drop established. Recorded in the Decisions record — not a silent drop; engine-side coverage preserved below.
(Considered and declined: `adoption-as-gods-children` — "your two sons... are mine; Ephraim and Manasseh, even as Reuben and Simeon, will be mine." (48:5) is a grandfather's legal adoption of heirs, not the pack's Spirit-of-adoption register; tagging it would be a register mismatch inviting a read-back. `angels` — "the angel who has redeemed me from all evil" (48:16) is one clause; thin, and routed below.)
### Anchor-extension candidates
- gods-provision | 48:15 | "the God who has fed me all my life long to this day" | low — preserves the dropped display tag's substance for curation; a lifetime-provision testimony verse.
- presence-of-god | 48:15, 21 | "The God before whom my fathers Abraham and Isaac walked" (48:15) | low — companion to this ledger's ch 5 and ch 28 candidates.
### Lexicon candidates
- blessing | ephraim and manasseh | realistic query phrasings: "jacob blesses ephraim and manasseh", "why did jacob cross his hands", "god make you as ephraim and manasseh"
### New-concept candidates
- ROUTED — corpus-blocked roster row 21 `gods-surprising-choice`: the deliberate crossing of hands to set the younger before the firstborn — "Israel stretched out his right hand, and laid it on Ephraim’s head, who was the younger... guiding his hands knowingly" (48:14); "his younger brother will be greater than he" (48:19) — is that row's younger-over-elder register; Gen 48:14-20 noted to row 21 as an anchor lead. Routed, not duplicated; not tagged (no id exists outside the gated row, and the standing one-design ruling on that row binds).
- ROUTED — corpus-blocked roster row 23 `redeemer`: "the angel who has redeemed me from all evil" (48:16) is redeemer vocabulary in Jacob's own testimony; noted to row 23 (whose Job texts are corpus-blocked) as a possible additional anchor lead. Routed, not duplicated; not tagged (single clause).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- DROP `gods-provision` (existing tag, not silently dropped): presence-bar failure, not a §11.6 ceiling yield — the tag's whole in-chapter ground is the single clause at 48:15, per the Gen 35 thin-single-verse drop precedent; the clause itself sits inside the `blessing` tag's own anchored text. Substance preserved engine-side via the anchor-extension candidate; reversible if the per-verse refinement pass judges the lifelong-feeding testimony to carry section-level weight.

## Genesis 49 (subdivided: 49:1–28; 49:29–33)
Existing tags (book doc): `hope-in-god`, `gods-faithfulness`, `blessing`, `death-and-burial`
### Applied-tag deltas
- KEEP `gods-faithfulness` — Joseph's blessing rests wholly on God's proven help: "his bow remained strong. The arms of his hands were made strong, by the hands of the Mighty One of Jacob" (49:24), "even by the God of your father, who will help you, by the Almighty, who will bless you" (49:25).
- KEEP `blessing` — "All these are the twelve tribes of Israel... He blessed everyone according to his own blessing." (49:28) — the twelve-son blessing poem is the chapter's whole first movement (49:1-28), the pack's fathers-blessing register at its fullest OT scene.
- KEEP `death-and-burial` — "Bury me with my fathers in the cave that is in the field of Ephron the Hittite, in the cave that is in the field of Machpelah" (49:29-30; the family roll of the buried, 49:31), then "he gathered up his feet into the bed, breathed his last breath, and was gathered to his people." (49:33) — adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22, whose listed refs already include Gen 49.
- DROP `hope-in-god` — the tag's entire in-chapter ground is the single interjection "I have waited for your salvation, LORD." (49:18), one line inside the Dan oracle — the thin single-verse shape of this ledger's Gen 35 and Gen 48 drops. Recorded in the Decisions record — not a silent drop; engine-side coverage preserved below.
(Considered and declined: `messianic-prophecy` — 49:10 is signposted-only under the group ruling (forward-pointing notes go to curation, never tagged); see the curation note below. `divine-judgment` — the Reuben/Simeon/Levi demotions (49:3-7) are a father's prophetic verdicts, not the pack's judgment-of-God register. `vengeance` — "Cursed be their anger, for it was fierce" (49:7) revisits the ch 34 violence in two verses; thin, and the curse is on anger, not revenge teaching. Grief placement (the pilot's open question, 49 vs 50): this chapter records the death (49:33) with no mourning language at all — the weeping, seventy days, and lamentation are all in ch 50 — so the honest placement of `pastoral-grief-and-loss` is ch 50, where the book doc already carries it; no grief tag here.)
### Anchor-extension candidates
- hope-in-god | 49:18 | "I have waited for your salvation, LORD." | low — preserves the dropped display tag's substance for curation; a waited-for-salvation prayer verse with no home among the pack's anchors.
- blessing | 49:1-28 | "He blessed everyone according to his own blessing." (49:28) | low — the pack anchors Gen 48:15-16 but not the twelve-tribe blessing poem.
- messianic-prophecy | 49:10 | "The scepter will not depart from Judah, nor the ruler’s staff from between his feet, until he comes to whom it belongs. The obedience of the peoples will be to him." | curation note only, NOT a tag and NOT proposed as an applied anchor — per the group ruling (49:10 signposted-only; forward-pointing notes to curation) and this ledger's Gen 22 the-cross precedent: curated sources traditionally read the Judah oracle forward; the chapter itself does not name the one to come, so the display layer does not tag it and the curator adjudicates whether the pack claims the verse.
### Lexicon candidates
- blessing | jacob blesses his sons | realistic query phrasings: "jacob blesses his twelve sons", "jacob's last words to his sons", "the twelve tribes of israel blessed"
- messianic-prophecy | scepter shall not depart | realistic query phrasings: "the scepter will not depart from judah", "what does shiloh mean in genesis 49" — recorded with the curation gate above; whether the pack claims 49:10 is the curator's call, and the lexicon row only makes sense if it does.
### New-concept candidates
- ROUTED — corpus-blocked roster row 22 `death-and-burial`: the Machpelah burial charge (49:29-32) is that row's register and the row already lists Gen 49 — witnessing the ch 23/25/35/47 routings, not re-proposing.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (49:1–28; 49:29–33) — marked for per-verse refinement
### Decisions record
- DROP `hope-in-god` (existing tag, not silently dropped): presence-bar failure, not a §11.6 ceiling yield — the tag's whole in-chapter ground is the one-line interjection at 49:18, per the Gen 35 / Gen 48 thin-single-verse precedent. Substance preserved engine-side via the anchor-extension candidate; reversible at the per-verse refinement pass, though even at 49:1–28 section granularity the ground remains the single verse.

## Genesis 50 (subdivided: 50:1–14; 50:15–21; 50:22–26)
Existing tags (book doc): `pastoral-grief-and-loss`, `forgiving-others`, `providence`, `fear-not`, `gods-faithfulness`, `family-reconciliation`, `death-and-burial`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `pastoral-grief-and-loss` — "Joseph fell on his father’s face, wept on him, and kissed him." (50:1); "The Egyptians wept for Israel for seventy days." (50:3); "there they lamented with a very great and severe lamentation. He mourned for his father seven days." (50:10) — a son's raw grief for his father plus full mourning rites; the personal-bereavement register the pastoral scope covers (the 2 Samuel 18 precedent: raw grief served by this tag). On the pilot's open 49-vs-50 placement question: all of Genesis's mourning language for Jacob is in this chapter — ch 49 records only the death — so this placement is the honest one; recorded in both entries.
- KEEP `forgiving-others` — "Now, please forgive the disobedience of the servants of the God of your father." Joseph wept when they spoke to him. (50:17), and forgiveness enacted: "He comforted them, and spoke kindly to them." (50:21).
- KEEP `providence` — the pack anchors Genesis 50:20 itself ("As for you, you meant evil against me, but God meant it for good, to save many people alive, as is happening today.") — the book's summary providence word.
- KEEP `fear-not` — "Don’t be afraid, for am I in the place of God?" (50:19) and again "Now therefore don’t be afraid. I will provide for you and your little ones." (50:21) — the scene's repeated address to the terrified brothers, fear answered with reassurance and pledged provision.
- KEEP `gods-faithfulness` — "I am dying, but God will surely visit you, and bring you up out of this land to the land which he swore to Abraham, to Isaac, and to Jacob." (50:24) — dying certainty that the sworn promise holds beyond the book's last page.
- KEEP `family-reconciliation` — the pack anchors Genesis 50:15-21 itself ("It may be that Joseph will hate us", 50:15, answered with tears, kind words, and provision, 50:17-21) — the reconciliation holding after the father's death.
- KEEP `death-and-burial` — the embalming (50:2-3), the great burial procession to Machpelah ("buried him in the cave of the field of Machpelah", 50:13), and Joseph's own end: "they embalmed him, and he was put in a coffin in Egypt." (50:26) — adopted §11.1 id (engine-built: no); engine-side work routes to corpus-blocked roster row 22, whose listed refs already include Gen 50.
- KEEP `oaths-and-vows` — "Go up, and bury your father, just like he made you swear." (50:6) and "Joseph took an oath from the children of Israel, saying, “God will surely visit you, and you shall carry up my bones from here.”" (50:25) — sworn words honored and required, twice.
(No ADD — chapter is at the hard ceiling of 8, each tag independently clearing the bar. Considered and declined: `comforting-others` — "He comforted them, and spoke kindly to them." (50:21) is one verse inside the reconciliation scene already carried. `lament` — the funerary lamentation at 50:10 is mourning rite addressed to no one the text names, not the complaint-to-God lament practice; the §1(c) three-book grief-decline pattern and the Esther-decline ground both apply, so no `lament` proposal is made.)
### Anchor-extension candidates
- forgiving-others | 50:15-21 | "Now, please forgive the disobedience of the servants of the God of your father." (50:17) | medium — the pack's anchors are all NT teaching texts; companion to this ledger's ch 33 and ch 45 candidates.
- grief-and-loss | 50:1-10 | "there they lamented with a very great and severe lamentation. He mourned for his father seven days." (50:10) | low — engine-side (display id pastoral-grief-and-loss); companion to the ch 23/35/37 candidates; mourning a parent, in the pack's own territory.
- gods-faithfulness | 50:24-25 | "God will surely visit you, and bring you up out of this land to the land which he swore to Abraham, to Isaac, and to Jacob." (50:24) | low — the sworn-land certainty that bridges Genesis to Exodus; the pack has no Genesis anchor.
### Lexicon candidates
- forgiving-others | joseph forgives his brothers | realistic query phrasings: "joseph forgives his brothers", "am i in the place of god", "forgiving family who hurt you"
- pastoral-grief-and-loss | mourning a father | realistic query phrasings: "mourning the death of my father", "joseph mourns jacob", "grieving a parent in the bible"
- gods-faithfulness | god will surely visit you | realistic query phrasings: "god will surely visit you", "carry my bones up from egypt"
### New-concept candidates
- ROUTED — corpus-blocked roster row 22 `death-and-burial`: the embalming, procession, Machpelah burial, and coffin-in-Egypt close (50:1-14, 26) are that row's register and the row already lists Gen 50 — witnessing the ch 23/25/35/47/49 routings, not re-proposing. ("Why was Jacob embalmed" / "joseph's bones" query phrasings ride that row.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- at hard ceiling 8 (8 existing tags, each independently clearing the bar; no candidate exceeded the ceiling, so no yield was required) — marked for per-verse refinement; book doc subdivides this chapter (50:1–14; 50:15–21; 50:22–26) — marked for per-verse refinement
### Decisions record
- None. (The ceiling was reached by existing tags alone; no §11.6 yield occurred. The `comforting-others` and `lament` declines above are presence-bar/register calls, not yields.)

## Corrigenda — chapters 1–10 vs the 15 late-arriving adopted ids (2026-08-26)

Why: the chapters 1–10 sweep ran before the canonical §11.1 adopted list was
reconstructed at `tag-apply/adopted-concepts.md`, against the narrower two-list
universe (239 engine ids + 50 roster ids). The reconstruction surfaced 15 adopted
ids present in neither file — `confession-of-sin`, `death-of-a-believer`,
`eternal-life`, `false-teachers`, `freedom-in-christ`, `gentleness-of-christ`,
`gods-delight-in-his-people`, `living-for-gods-glory`, `new-birth`,
`outpouring-of-the-spirit`, `sovereignty-of-god`, `sowing-and-reaping`,
`speaking-in-tongues`, `the-branch`, `walking-in-truth` — which that worker could
not legally tag. This pass re-read chapters 1–10 against exactly those 15 ids,
each judged on its tag-gaps-review register, presence bar first.

Result: NO ADDs. Every one of the 15 either has an NT-register teaching substance
that would be a later-revelation read-back on these chapters, or (for the
OT-capable ids) a register these chapters do not carry. No caps were touched; no
§11.6 yields occurred. Per-chapter outcomes, with the close calls recorded:

- Genesis 1 — no change. Considered `sovereignty-of-god`: the row's register is
  "God is in control" of rulers and kingdoms (its anchor set is Isa 40/45, Jer 18/27,
  Daniel 2/4/5, Ezra 1); Genesis 1's creation fiat is already carried by `creation`,
  and the chapter governs no ruler or nation — the "rule" language (1:16-18) is the
  lights over day and night. Torah-corrigenda precedent confines the id to texts
  where God governs a ruler (Exod 9:16; Deut 2:30); declined here. Also considered
  `outpouring-of-the-spirit`: "God's Spirit was hovering over the surface of the
  waters" (1:2) is not the row's Spirit-poured-on-people register (Joel 2:28-29).
  `gods-delight-in-his-people` checked: "behold, it was very good" (1:31) is delight
  in the finished creation, not the Zeph 3:17 rejoicing-over-his-people comfort
  register.
- Genesis 2 — no change. None of the 15 is present; the chapter also sits at the
  soft cap of 6.
- Genesis 3 — no change. Considered `confession-of-sin`: "I ate it" (3:12, 13) is
  admission extracted under questioning and wrapped in blame-shifting ("The woman
  whom you gave to be with me", 3:12; "The serpent deceived me", 3:13), not the
  row's penitential/statute-commanded confession register (Lev 5:5; Ps 51; 1 John
  1:9). Considered `eternal-life`: "take also of the tree of life, and eat, and
  live forever" (3:22) narrates access barred to the tree, not the row's Johannine
  believe-and-have-eternal-life teaching — tagging it would be a later-revelation
  read-back. Considered `false-teachers`: the serpent's deception (3:1-5) is not
  the row's NT deceivers-in-the-church register, and per the CONVENTIONS §5 worked
  example Genesis never names the serpent as the devil.
- Genesis 4 — no change. Considered `confession-of-sin`: "My punishment is greater
  than I can bear" (4:13) is complaint at the sentence, not confession of the sin.
  Considered `sowing-and-reaping`: "when you till the ground, it won't yield its
  strength to you" (4:12) is a pronounced curse on the tiller, not the row's
  proverb-register moral-harvest frame (Hos 8:7; Gal 6:7-9; Prov 22:8). The chapter
  also sits at the soft cap of 6.
- Genesis 5 — no change. Considered `death-of-a-believer`: "Enoch walked with God,
  and he was not found, for God took him" (5:24) is a translation that bypasses
  death, and the row's register is the believer's death as gain / with-Christ-
  after-death comfort (Phil 1:21-23; 2 Cor 5:1-8) — a later-revelation read-back
  here; the chapter's death refrain is already carried by `mortality`.
- Genesis 6 — no change. Considered `sovereignty-of-god`: the flood resolve is
  divine-judgment governance, already carried by `divine-judgment`, not the row's
  rule-over-kings register. "My Spirit will not strive with man forever" (6:3) is
  likewise not the `outpouring-of-the-spirit` register. `gods-delight-in-his-people`
  checked: "Noah found favor in the LORD's eyes" (6:8) is favor shown, not the
  Zeph 3:17 rejoicing-over register.
- Genesis 7 — no change. None of the 15 is present.
- Genesis 8 — no change. Considered `sowing-and-reaping` on "While the earth
  remains, seed time and harvest, and cold and heat, and summer and winter, and day
  and night will not cease" (8:22): the verse is the natural-cycle preservation
  pledge — agricultural rhythm as promise — not the row's moral/spiritual
  consequence frame ("what a man sows, that he will also reap"); the chapter entry
  already declined `providence` and `seasons-of-life` on the same
  register-vs-occasion ground, and the verse is already the ledger's
  `gods-faithfulness` anchor-extension candidate.
- Genesis 9 — no change. None of the 15 is present; the covenant, blessing, and
  bloodshed-accounting material is carried by the existing `covenant`,
  `gods-faithfulness`, `image-of-god`, `blessing`, and `sin` tags.
- Genesis 10 — no change. "According to their languages" (10:5, 20, 31) is
  genealogical distribution, nowhere near the `speaking-in-tongues` gift register;
  Nimrod's kingdom (10:8-12) is narrated, with no rule-over-kings teaching for
  `sovereignty-of-god`.

Ids never plausibly present in chapters 1–10 (checked, no close call):
`freedom-in-christ`, `gentleness-of-christ`, `living-for-gods-glory`, `new-birth`,
`the-branch`, `walking-in-truth`.

Closing note: chapters 11–50 were swept under the full reconstructed universe
(engine ids + roster + the 15) and need no re-check; this corrigenda pass closes
the Genesis universe gap.
