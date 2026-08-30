# John sweep ledger — Layer-3 tag sweep (Gospels+Acts thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + 161 §11.1 adopted display ids
- Book: John (21 chapters)
- WEB text source: pinned full-Bible fixture web-subset.json @ commit 87fd68c
  (sourceSha256 b6f55cc7…, branch claude/hearth-161-concept-packs-2tf8jk), read via
  webchap.py in this thread's scratchpad; every quote below is word-for-word from that
  output, from within the chapter being tagged.
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/john.md
    (final, critic-approved 2026-08-23; tag-application, apologetics, and new-mint passes of
    2026-08-25 included)
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/declines-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/corpus-blocked.md
  - WEB access memo: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/web-text-access.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Standing note on pastoral-register id forms: john.md (written against the 131-id
  vocabulary at b3f491d) carries `pastoral-*` ids (`pastoral-grief-and-loss`,
  `pastoral-prayer-for-healing`, `pastoral-freedom-from-bondage`, `pastoral-serious-illness`,
  `pastoral-betrayal-and-marriage-crisis`, `pastoral-relapse-and-restoration`). The current
  engine index at e762d1c lists these packs unprefixed (`grief-and-loss`, `prayer-for-healing`,
  `freedom-from-bondage`, `serious-illness-and-dying`, `betrayal-and-marriage-crisis`,
  `relapse-and-restoration`). KEEP entries below keep the book doc's spelling as prior art and
  note the current engine id; no book-doc edit is proposed here (out of this thread's scope) —
  flagged once, for the refinement/curation pass.
- Standing guards respected book-wide: John 6 lords-supper withhold (no later-revelation
  read-back; drafter A item 10); John 7:53–8:11 and 5:3b–4 presented as the staged WEB carries
  them, no manuscript claims; Ps 82 / John 10:34 recorded decline + guard from the apologetics
  work — nothing in this ledger touches 10:34–35 as a proposal.
- Legend — each chapter entry carries these sections, in order:
  1. "## John <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## John 1 (subdivided: 1:1–18 / 1:19–28 / 1:29–34 / 1:35–42 / 1:43–51)

Existing tags (book doc): `deity-of-christ`, `incarnation`, `faith`, `the-cross`, `sharing-your-faith`, `grace-not-earned`, `light-and-darkness`, `witness-testimony` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `deity-of-christ` — “the Word was with God, and the Word was God” (1:1), “I have seen and have testified that this is the Son of God.” (1:34).
- KEEP `incarnation` — “The Word became flesh and lived among us.” (1:14) — the concept's defining text; engine anchor already at Jn 1:14.
- KEEP `faith` — “to them he gave the right to become God’s children, to those who believe in his name” (1:12; also 1:7, 50).
- KEEP `the-cross` — “Behold, the Lamb of God, who takes away the sin of the world!” (1:29, repeated 1:36); prior atonement-before-the-crucifixion call (drafter A item 6) stands; engine anchor already at Jn 1:29.
- KEEP `sharing-your-faith` — “He first found his own brother, Simon, and said to him, ‘We have found the Messiah!’” (1:41), “Come and see.” (1:46).
- KEEP `grace-not-earned` — “born, not of blood, nor of the will of the flesh, nor of the will of man, but of God” (1:13), “From his fullness we all received grace upon grace.” (1:16).
- KEEP `light-and-darkness` — “The light shines in the darkness, and the darkness hasn’t overcome it.” (1:5; also 1:4, 9); engine anchor already at Jn 1:4-5.
- KEEP `witness-testimony` — “The same came as a witness, that he might testify about the light” (1:7; also 1:19–34); engine anchors already at Jn 1:6-8, 1:19-23.
- No ADDs, no DROPs — chapter sits at the hard ceiling and every sitting tag independently clears the presence bar.

Anchor-extension candidates:
- `adoption-as-gods-children` | John 1:12–13 | “as many as received him, to them he gave the right to become God’s children … who were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.” | moderate — the pack has NO gospel/acts anchors and its lexicon carries "children of god"; this is John's own children-of-God text.
- `salvation` | John 1:11–13 | “He came to his own, and those who were his own didn’t receive him. But as many as received him, to them he gave the right to become God’s children” | low — engine already anchors Jn 1:12; propose widening to 1:11–13 only if the curator wants the receive/reject contrast in one range; otherwise skip.

Lexicon candidates:
- `grace-not-earned` | "grace upon grace" — phrasings: "grace upon grace meaning"; "full of grace and truth"; "grace and truth came through jesus christ".
- `sharing-your-faith` | "come and see" — phrasings: "come and see bible verse"; "invite a friend to church verse". (Two-word core is stopword-light; QR-6 equality rules apply — flag for the alias route rather than bare lexicon if it collapses to one significant token.)

New-concept candidates: None — every theme present has a vocabulary home (new-birth, witness-testimony, i-am-sayings, eternal-life are adopted ids; the rest are engine packs).

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) + book-doc subdivision (5 sections) — mark for the per-verse refinement pass. Refinement leads: `witness-testimony` is 1:6–8 + 1:19–34; `sharing-your-faith` is 1:35–46; `deity-of-christ` spans 1:1–18 + 1:34, 49 — clean per-section anchoring available.

Decisions record:
- Standing prior yields re-checked, all stand: `discipleship` (1:35–51, yielded at ceiling, homes at chs. 8/21), `new-birth` (1:12–13 carried by `grace-not-earned`, anchor text is ch. 3), `creation` (1:3 carried by sitting `deity-of-christ`/`incarnation` entries — apologetics-pass call), `trinity` (raw material, not the taught relation), `baptism` (John's baptizing serves the witness theme), `angels` (1:51 one verse of promise).
- `jehovahs-witness-evangelism` / `mormon-evangelism` carry Jn 1:1 / Jn 1:3 engine anchors, but they are audience-register apologetics packs, not chapter themes — the chapter does not depict their teaching substance; not display-taggable here. No route needed: their anchors already exist on main.
- `adoption-as-gods-children` display tag considered — genuine presence (1:12–13) but the chapter is at the hard ceiling and the substance is carried by `grace-not-earned` + `faith` on the same verses; yielded as broad-duplicating-specific. The anchor-extension candidate above is the vehicle instead.

## John 2 (subdivided: 2:1–11 / 2:12–25)

Existing tags (book doc): `faith`, `worship`, `resurrection` — 3.

Applied-tag deltas:
- KEEP `faith` — “This beginning of his signs Jesus did in Cana of Galilee, and revealed his glory; and his disciples believed in him.” (2:11; also 2:22–23 with 2:24–25's caution).
- KEEP `worship` — “Take these things out of here! Don’t make my Father’s house a marketplace!” (2:16), “Zeal for your house will eat me up.” (2:17) — the borderline call (drafter A item 9) stands.
- KEEP `resurrection` — “Destroy this temple, and in three days I will raise it up.” (2:19), “But he spoke of the temple of his body.” (2:21) — apologetics-pass add; engine anchor already at Jn 2:19.
- ADD `signs-and-wonders` — the chapter names, counts, and interprets the first sign: “This beginning of his signs Jesus did in Cana of Galilee, and revealed his glory” (2:11), the demand “What sign do you show us, seeing that you do these things?” (2:18), and “many believed in his name, observing his signs which he did” (2:23). Honest substantial presence: sign-and-belief is the chapter's own frame, not a proof-text; the engine pack (lexicon "miracles of jesus") has no John-narrative anchor before ch. 3:2. Chapter goes 3 → 4.

Anchor-extension candidates:
- `signs-and-wonders` | John 2:1–11 | “This beginning of his signs Jesus did in Cana of Galilee, and revealed his glory; and his disciples believed in him.” | moderate — the pack anchors Jn 3:2 and Jn 20:30-31 but not the first sign itself; "miracles of jesus" searchers should reach Cana.

Lexicon candidates:
- `signs-and-wonders` | "water into wine" — phrasings: "jesus turns water into wine"; "first miracle of jesus"; "wedding at cana".
- `resurrection` | "destroy this temple" — phrasings: "destroy this temple and in three days i will raise it up"; "destroy this temple meaning".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (2 sections) — refinement-pass marker only; chapter sits at 4 tags, no cap pressure.

Decisions record:
- `passover` considered (2:13, 23): the feast is a date-and-place marker here — no Passover teaching substance, no lamb typology in the text of the chapter; presence bar fails; not tagged.
- `gods-provision` considered for Cana: wine supplied at a feast is the sign-of-glory register (2:11 gives the chapter's own interpretation), not the God-meets-needs teaching the pack serves; declined.
- `the-house-of-god` considered (2:16 “my Father’s house”): the temple-cleansing substance is carried by `worship` (prior art); adding the temple id would duplicate the same two verses; yielded as broad-duplicating-specific.
- ADD `signs-and-wonders` ordering note: placed after the three sitting tags; no yield needed (chapter well under cap).
## John 3 (subdivided: 3:1–21 / 3:22–36)

Existing tags (book doc): `gods-love`, `salvation`, `faith`, `divine-judgment`, `new-birth`, `eternal-life`, `witness-testimony`, `jesus-the-only-way` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `gods-love` — “For God so loved the world, that he gave his only born Son” (3:16), “The Father loves the Son” (3:35); engine anchor already at Jn 3:16.
- KEEP `salvation` — “God didn’t send his Son into the world to judge the world, but that the world should be saved through him.” (3:17); engine anchors already at Jn 3:16, 3:3.
- KEEP `faith` — “He who believes in him is not judged. He who doesn’t believe has been judged already” (3:18; also 3:12, 15–16, 36).
- KEEP `divine-judgment` — “This is the judgment, that the light has come into the world, and men loved the darkness rather than the light” (3:19), “the wrath of God remains on him” (3:36).
- KEEP `new-birth` (§11.1 adopted) — “unless one is born anew, he can’t see God’s Kingdom.” (3:3; also 3:5–8) — the concept's anchor text.
- KEEP `eternal-life` (§11.1 adopted) — “whoever believes in him should not perish, but have eternal life” (3:16; also 3:15, 36).
- KEEP `witness-testimony` — “What he has seen and heard, of that he testifies; and no one receives his witness.” (3:32), “He must increase, but I must decrease.” (3:30).
- KEEP `jesus-the-only-way` — “One who believes in the Son has eternal life, but one who disobeys the Son won’t see life” (3:36); engine anchor already at Jn 3:36.
- No ADDs, no DROPs — hard ceiling; every sitting tag independently clears the presence bar.

Anchor-extension candidates:
- `the-cross` | John 3:14–15 | “As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up, that whoever believes in him should not perish, but have eternal life.” | moderate — the typology is stated by Jesus in-text (no read-back needed); the pack's only John anchor is 1:29, and "bronze serpent" queries have no landing.

Lexicon candidates:
- `the-cross` | "lifted up like the serpent" — phrasings: "as moses lifted up the serpent"; "bronze serpent and jesus"; "son of man must be lifted up".
- `gods-love` | already carries "god so loved the world" — no row needed; recorded as checked.

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) + book-doc subdivision (2 sections) — mark for per-verse refinement. Refinement leads: 3:1–8 (`new-birth`), 3:16–21 (`gods-love`/`divine-judgment`), 3:22–36 (`witness-testimony`).

Decisions record:
- Standing prior calls re-checked, all stand: `humble-exaltation` on 3:30 (John's personal humility, not the God-exalts-the-humble teaching), `kingdom-of-heaven` (3:3, 5 carried inside `new-birth`'s quote), `holy-spirit` (3:5–8 are `new-birth`'s verses; 3:34 a clause), `light-and-darkness` (3:19–21 are `divine-judgment`'s quoted verses).
- `joy-in-the-lord` considered (3:29 “Therefore my joy is made full.”): thin single verse inside the witness unit; not tagged.
- `baptism` considered (3:22–23 narrates baptizing): narrative setting, no baptism teaching; presence bar fails; not tagged.

## John 4 (subdivided: 4:1–26 / 4:27–38 / 4:39–42 / 4:43–54)

Existing tags (book doc): `worship`, `sharing-your-faith`, `faith`, `salvation`, `pastoral-prayer-for-healing` (current engine id `prayer-for-healing`) — 5.

Applied-tag deltas:
- KEEP `worship` — “the true worshipers will worship the Father in spirit and truth, for the Father seeks such to be his worshipers.” (4:23; also 4:20–24); engine lexicon already carries "worship in spirit and in truth".
- KEEP `sharing-your-faith` — “Come, see a man who told me everything that I have done. Can this be the Christ?” (4:29), “many of the Samaritans believed in him because of the word of the woman” (4:39), “look at the fields, that they are white for harvest already” (4:35).
- KEEP `faith` — “He believed, as did his whole house.” (4:53), “Many more believed because of his word.” (4:41).
- KEEP `salvation` — “salvation is from the Jews” (4:22) widening to “this is indeed the Christ, the Savior of the world.” (4:42).
- KEEP `pastoral-prayer-for-healing` — “begged him that he would come down and heal his son, for he was at the point of death.” (4:47); the face-to-face-plea signpost (drafter A item 3) stands.
- ADD `living-water` — the engine pack's own anchor scene, never considered by the earlier passes (the id entered the vocabulary after the book doc's 131-id snapshot): “he would have given you living water” (4:10), “whoever drinks of the water that I will give him will never thirst again; but the water that I will give him will become in him a well of water springing up to eternal life.” (4:14), with the woman's reply “Sir, give me this water” (4:15). Honest substantial presence: a six-verse offer-and-response unit (4:10–15) that is the conversation's hinge. Engine anchors already at Jn 4:10-14. Chapter goes 5 → 6 (soft cap reached, not exceeded).

Anchor-extension candidates:
- `prayer-for-healing` | John 4:46–53 | “he went to him and begged him that he would come down and heal his son, for he was at the point of death.” … “Jesus said to him, ‘Go your way. Your son lives.’” | moderate — the pack carries a single anchor (Mk 1:40-42); a parent's answered plea for a dying child is exactly its query register.
- `signs-and-wonders` | John 4:46–54 | “Unless you people see signs and wonders, you will in no way believe.” (4:48), “This is again the second sign that Jesus did” (4:54) | low-moderate — the literal phrase "signs and wonders" occurs in-text; note the register caveat: 4:48 is a rebuke of sign-dependence, so the gist must stay descriptive.

Lexicon candidates:
- `living-water` | "woman at the well" — phrasings: "woman at the well"; "never thirst again bible verse"; "well of water springing up to eternal life".
- `sharing-your-faith` | "white for harvest" — phrasings: "fields are white for harvest"; "the harvest is ready bible verse".
- `salvation` | "savior of the world" — phrasings: "jesus savior of the world"; "savior of the world bible verse".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (4 sections) — refinement-pass marker; chapter at soft cap 6 after the ADD, under the hard ceiling.

Decisions record:
- `hunger-for-god` considered for 4:13–15 (the thirst register the pack carries for chs. 6–7): substance sits on `living-water`'s exact verses here, and the added tag would triple the same three verses; yielded as broad-duplicating-specific. The pack's thirst lexicon already routes; no extension needed from this chapter.
- `signs-and-wonders` display tag considered (4:48, 54): genuine but subordinate — the healing unit's display substance is carried by `pastoral-prayer-for-healing` + `faith` on the same verses; yielded as broad-duplicating-specific; anchor-extension candidate recorded instead.
- ADD `living-water` ordering: appended after sitting tags; soft cap reached exactly; no yield required.
- Book-doc id form: `pastoral-prayer-for-healing` ↔ engine `prayer-for-healing` (see header note); KEEP recorded against the book doc's spelling.
## John 5 (subdivided: 5:1–15 / 5:16–30 / 5:31–47)

Existing tags (book doc): `deity-of-christ`, `salvation`, `faith`, `divine-judgment`, `witness-testimony`, `resurrection-of-the-dead`, `honor-the-son` — 7.

Applied-tag deltas:
- KEEP `deity-of-christ` — “he not only broke the Sabbath, but also called God his own Father, making himself equal with God.” (5:18; also 5:19–23, 26).
- KEEP `salvation` — “he who hears my word and believes him who sent me has eternal life, and doesn’t come into judgment, but has passed out of death into life.” (5:24), “I say these things that you may be saved.” (5:34).
- KEEP `faith` — “For if you believed Moses, you would believe me; for he wrote about me.” (5:46; also 5:24, 38, 44).
- KEEP `divine-judgment` — “he has given all judgment to the Son” (5:22; also 5:27–30).
- KEEP `witness-testimony` — “the very works that I do, testify about me, that the Father has sent me.” (5:36), “You search the Scriptures … these are they which testify about me.” (5:39; also 5:31–37).
- KEEP `resurrection-of-the-dead` — “all who are in the tombs will hear his voice and will come out; those who have done good, to the resurrection of life; and those who have done evil, to the resurrection of judgment.” (5:28–29); engine anchor already at Jn 5:28-29.
- KEEP `honor-the-son` — “that all may honor the Son, even as they honor the Father. He who doesn’t honor the Son doesn’t honor the Father who sent him.” (5:23); engine anchor already at Jn 5:22-23.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `deity-of-christ` | John 5:17–18 | “But Jesus answered them, ‘My Father is still working, so I am working, too.’ … he not only broke the Sabbath, but also called God his own Father, making himself equal with God.” | moderate — the pack's nine anchors skip John 5; this is the Gospel's plainest stated-equality text and an apologetics-query landing.
- `messianic-prophecy` | John 5:46 | “For if you believed Moses, you would believe me; for he wrote about me.” | low — Jesus' own in-text claim that Moses wrote of him; the pack has no gospel/acts anchors; thin single verse, curator's call.

Lexicon candidates:
- `salvation` | "passed from death to life" — phrasings: "passed out of death into life"; "passed from death to life meaning".
- `studying-the-word` | "you search the scriptures" — phrasings: "you search the scriptures meaning"; "searching the scriptures but missing jesus". NOTE: the prior display decline (5:39–40 is the concept's failure mode, not its teaching) stands for tagging; the lexicon question is separate and the gist would need the indictment register said out loud — flagged for the curator, not assumed.

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (3 sections) — refinement-pass marker; 7 tags (above soft cap, under ceiling; every tag clears the bar individually).

Decisions record:
- Standing prior calls re-checked, all stand: `sabbath-rest` decline (dispute scene, not the gift of rest — 5:9–18), `studying-the-word` display decline (5:39–40 indictment register), `angels` on 5:4 (staged-text policy respected; no manuscript claim made; one narrative verse — thin).
- `prayer-for-healing` considered (5:6–9 healing of the thirty-eight-year invalid): the man asks nothing and doesn't know who healed him (5:13) — no plea register; presence bar for that pack fails; not tagged.
- `sin` considered (5:14 “Sin no more, so that nothing worse happens to you.”): thin single verse; not tagged; noted as possible future lexicon color for `sin` ("go and sin no more" belongs to 8:11 primarily — see ch. 8).

## John 6 (subdivided: 6:1–15 / 6:16–21 / 6:22–58 / 6:59–66 / 6:67–71)

Existing tags (book doc): `faith`, `gods-provision`, `salvation`, `assurance-of-salvation`, `hunger-for-god`, `eternal-life`, `i-am-sayings` — 7.

Applied-tag deltas:
- KEEP `faith` — “This is the work of God, that you believe in him whom he has sent.” (6:29), “We have come to believe and know that you are the Christ, the Son of the living God.” (6:69).
- KEEP `gods-provision` — “Jesus took the loaves, and having given thanks, he distributed … as much as they desired.” (6:11), “filled twelve baskets with broken pieces” (6:13).
- KEEP `salvation` — “everyone who sees the Son and believes in him should have eternal life; and I will raise him up at the last day.” (6:40; also 6:47, 51–54).
- KEEP `assurance-of-salvation` — “He who comes to me I will in no way throw out.” (6:37), “of all he has given to me I should lose nothing” (6:39).
- KEEP `hunger-for-god` — “Don’t work for the food which perishes, but for the food which remains to eternal life” (6:27), “Whoever comes to me will not be hungry” (6:35); the direction-of-language signpost (drafter A item 7) stands.
- KEEP `eternal-life` (§11.1 adopted) — “You have the words of eternal life.” (6:68; also 6:27, 40, 47, 54).
- KEEP `i-am-sayings` — “I am the bread of life.” (6:35; repeated 6:41, 48, 51); engine anchor already at Jn 6:35.
- ADD `election-and-predestination` — the discourse's divine-initiative thread, taught three times over: “All those whom the Father gives me will come to me.” (6:37), “No one can come to me unless the Father who sent me draws him; and I will raise him up in the last day.” (6:44), “no one can come to me, unless it is given to him by my Father.” (6:65). Honest substantial presence: a repeated teaching strand, not a proof-text; both-tags beside `assurance-of-salvation` (divine-initiative register vs. kept-secure register on 6:37–40, per CONVENTIONS §11(2)). The id is engine vocabulary ([ENGINE], Theme K) never considered by the earlier passes for John. Chapter goes 7 → 8 (hard ceiling reached).

Anchor-extension candidates:
- `election-and-predestination` | John 6:37, 44, 65 | “No one can come to me unless the Father who sent me draws him; and I will raise him up in the last day.” | strong — the pack has NO gospel/acts anchors; John 6's drawing/giving texts are the standard NT election texts outside Romans/Ephesians. (Gist caution: the pack's §4-neutral gist read is flagged for Jesse in the backlog — extension must not adjudicate between readings; covenant #6.)
- `gods-provision` | John 6:5–13 | “Jesus took the loaves, and having given thanks, he distributed to the disciples, and the disciples to those who were sitting down, likewise also of the fish as much as they desired.” | moderate — the pack's anchors are Matthew-only; the feeding of the five thousand is the provision narrative users expect.
- `hunger-for-god` | John 6:27, 35 | “Whoever comes to me will not be hungry, and whoever believes in me will never be thirsty.” | moderate — pack anchors Mt 5:6 only; this is its satisfaction text.
- `grumbling-and-complaining` | John 6:41–43 | “The Jews therefore murmured concerning him … ‘Don’t murmur among yourselves.’” | low — the manna-murmuring echo is in-text (6:31, 49 name the wilderness manna); thin, curator's call.

Lexicon candidates:
- `election-and-predestination` | "the father draws him" — phrasings: "no one can come to me unless the father draws him"; "drawn by the father meaning"; "does god draw people to jesus".
- `faith` | "to whom would we go" — phrasings: "lord to whom shall we go"; "you have the words of eternal life".
- `gods-provision` | "five loaves and two fish" — phrasings: "feeding of the five thousand"; "five loaves and two fish meaning".

New-concept candidates: None.

Decline-overturn proposals: None. The John 6 `lords-supper` withhold was deliberately re-examined against the chapter text as instructed: the chapter narrates no institution of the Supper, and its own interpretive keys point the eating language at coming-and-believing (“Whoever comes to me will not be hungry, and whoever believes in me will never be thirsty.” 6:35) and at spirit-not-flesh (“It is the spirit who gives life. The flesh profits nothing. The words that I speak to you are spirit, and are life.” 6:63). No new in-chapter evidence for the eucharistic read exists; the withhold STANDS (recorded here so the reconsideration is not silent).

Ceiling / refinement flags: HARD CEILING (8, reached by this sweep's ADD) + book-doc subdivision (5 sections) — mark for per-verse refinement. Refinement leads: 6:1–15 (`gods-provision`), 6:22–58 (`hunger-for-god`/`i-am-sayings`/`election-and-predestination`), 6:60–71 (`faith`).

Decisions record:
- `lords-supper` reconsideration recorded above — withhold stands, no overturn proposed.
- `fear-not` on 6:20 (“It is I. Don’t be afraid.”): prior thin-single-verse decline stands.
- `betrayal` considered (6:64, 70–71 — “one of you is a devil … it was he who would betray him”): two narrative asides; thin; not tagged (the betrayal home in John is ch. 13 — see there).
- `signs-and-wonders` considered (6:2, 14, 26): genuine sign-vocabulary presence, but the chapter is now at the hard ceiling and the sign material is carried by `gods-provision` + `faith`; yielded as broad-duplicating-specific under §11.6.
- ADD ordering at the ceiling: `election-and-predestination` enters as a main-theme discourse strand; no sitting tag is displaced; every sitting tag re-checked against the bar — all clear.
## John 7 (subdivided: 7:1–24 / 7:25–36 / 7:37–44 / 7:45–53)

Existing tags (book doc): `faith`, `hunger-for-god`, `obedience-to-the-word`, `holy-spirit` — 4.

Applied-tag deltas:
- KEEP `faith` — “For even his brothers didn’t believe in him.” (7:5), “But of the multitude, many believed in him.” (7:31), “So a division arose in the multitude because of him.” (7:43).
- KEEP `hunger-for-god` — “If anyone is thirsty, let him come to me and drink!” (7:37); the direction-of-language signpost stands.
- KEEP `obedience-to-the-word` — “If anyone desires to do his will, he will know about the teaching, whether it is from God or if I am speaking from myself.” (7:17).
- KEEP `holy-spirit` — “But he said this about the Spirit, which those believing in him were to receive.” (7:39); the double-routing guard against `holy-spirit-the-comforter` stands.
- ADD `living-water` — the engine pack's second anchor scene, not in the book doc's vocabulary era: “He who believes in me, as the Scripture has said, from within him will flow rivers of living water.” (7:38, with the cry of 7:37 and the evangelist's gloss 7:39). Honest substantial presence: the feast-climax invitation is the section 7:37–44's own subject. Engine anchors already at Jn 7:37-39. Chapter goes 4 → 5.

Anchor-extension candidates: None — `living-water`, `holy-spirit`, and `obedience-to-the-word` already anchor the chapter's teaching texts on main.

Lexicon candidates:
- `living-water` | "rivers of living water" — phrasings: "rivers of living water meaning"; "out of his belly shall flow rivers"; "come to me and drink".
- `judging-others` | "judge righteous judgment" — phrasings: "judge righteous judgment meaning"; "don't judge by appearances bible verse" (7:24).

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (4 sections) — refinement-pass marker; 5 tags, under soft cap.

Decisions record:
- Triple-coverage note on 7:37–39: `living-water` + `hunger-for-god` + `holy-spirit` now all cite the living-water cry. Each carries a distinct register (the image itself / the human thirst / the promised Spirit) and each clears the bar independently — the both-tags ruling (§11(2)) covers it; recorded so the refinement pass sees the density on three verses.
- `judging-others` display tag considered (7:24): thin single verse inside the Sabbath defense; not tagged; lexicon candidate recorded instead.
- `messianic-prophecy` considered (7:42 — the crowd cites the Bethlehem/David expectation): spoken as the crowd's debate, not the chapter's teaching; presence bar fails; not tagged.
- 7:53 stands in the staged WEB as regular text; presented as carried, no manuscript claim (book-wide policy respected).

## John 8 (subdivided: 8:1–11 / 8:12–29 / 8:30–47 / 8:48–59)

Existing tags (book doc): `forgiveness-of-sins`, `deity-of-christ`, `sin`, `pastoral-freedom-from-bondage` (current engine id `freedom-from-bondage`), `walking-in-the-light`, `discipleship`, `witness-testimony`, `i-am-sayings` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `forgiveness-of-sins` — “Neither do I condemn you. Go your way. From now on, sin no more.” (8:11; scene 8:3–11).
- KEEP `deity-of-christ` — “Most certainly, I tell you, before Abraham came into existence, I AM.” (8:58), “unless you believe that I am he, you will die in your sins.” (8:24); engine anchor already at Jn 8:58.
- KEEP `sin` — “everyone who commits sin is the bondservant of sin.” (8:34), “you will die in your sins” (8:21, 24); engine anchor already at Jn 8:34.
- KEEP `pastoral-freedom-from-bondage` — “If therefore the Son makes you free, you will be free indeed.” (8:36); engine anchor already at Jn 8:36.
- KEEP `walking-in-the-light` — “I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.” (8:12).
- KEEP `discipleship` — “If you remain in my word, then you are truly my disciples.” (8:31); engine anchor already at Jn 8:31-32.
- KEEP `witness-testimony` — “I am one who testifies about myself, and the Father who sent me testifies about me.” (8:18; unit 8:13–18); engine anchor already at Jn 8:14-18.
- KEEP `i-am-sayings` — the absolute uses: 8:58 with 8:24 (“unless you believe that I am he”); engine anchors already at Jn 8:58, 8:24; the apologetics-pass dual-register call stands.
- No ADDs, no DROPs — hard ceiling.

Anchor-extension candidates:
- `judging-others` | John 8:7 | “He who is without sin among you, let him throw the first stone at her.” | moderate — "cast the first stone" is a heavy query family with no anchor in the pack; the verse is the culture's own citation for it.
- `satan` | John 8:44 — already an engine anchor on main (Jn 8:44); recorded as checked, no extension needed.

Lexicon candidates:
- `freedom-from-bondage` | "the truth will set you free" — phrasings: "the truth will set you free"; "the son sets you free"; "free indeed meaning".
- `forgiveness-of-sins` | "go and sin no more" — phrasings: "go and sin no more"; "neither do i condemn you"; "woman caught in adultery".
- `judging-others` | "cast the first stone" — phrasings: "cast the first stone"; "he who is without sin"; "let him who is without sin throw the first stone".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) + book-doc subdivision (4 sections) — mark for per-verse refinement. Refinement leads: 8:1–11 (`forgiveness-of-sins`), 8:12–29 (`walking-in-the-light`/`witness-testimony`), 8:30–47 (`discipleship`/`freedom-from-bondage`/`sin`), 8:48–59 (`deity-of-christ`/`i-am-sayings`).

Decisions record:
- `satan` display tag considered (8:44 — “he is a liar, and the father of lies.”): genuine single-verse presence of the pack's defining text, but the chapter is at the hard ceiling and 8:44 is quoted under `sin`'s reference range; yielded as thin-single-verse under §11.6; the engine anchor already exists, so search coverage does not depend on the display tag.
- `abiding-in-christ` brush at 8:31 (“remain in my word”): prior deliberate non-tag stands (the vine discourse owns the concept).
- `truth` (§11.1 adopted) considered (8:32 “You will know the truth, and the truth will make you free.”): the what-is-truth register the adopted id serves is the ch. 17–18 material (routed there to corpus-blocked row 42); here the truth clause functions inside the freedom teaching, carried by `discipleship` + `pastoral-freedom-from-bondage` on the same verses; yielded as broad-duplicating-specific at a ceiling chapter.
- 7:53–8:11 presented as the staged WEB carries it (regular text, no bracket); no manuscript claim made (book-wide policy respected).
- Book-doc id form: `pastoral-freedom-from-bondage` ↔ engine `freedom-from-bondage` (see header note).
## John 9 (not subdivided)

Existing tags (book doc): `faith`, `sharing-your-faith`, `suffering-for-christ`, `divine-judgment`, `light-and-darkness`, `why-god-allows-suffering` — 6.

Applied-tag deltas:
- KEEP `faith` — the healed man's journey: “A man called Jesus made mud” (9:11) → “He is a prophet.” (9:17) → “He said, ‘Lord, I believe!’ and he worshiped him.” (9:38).
- KEEP `sharing-your-faith` — “One thing I do know: that though I was blind, now I see.” (9:25; also 9:30–33).
- KEEP `suffering-for-christ` — “if any man would confess him as Christ, he would be put out of the synagogue.” (9:22), “They insulted him … Then they threw him out.” (9:34).
- KEEP `divine-judgment` — “I came into this world for judgment, that those who don’t see may see; and that those who see may become blind.” (9:39; also 9:41).
- KEEP `light-and-darkness` — “While I am in the world, I am the light of the world.” (9:5), with the sight-and-blindness verdict (9:39–41).
- KEEP `why-god-allows-suffering` — “This man didn’t sin, nor did his parents, but that the works of God might be revealed in him.” (9:3); the this-case-not-every-case caveat stands; engine anchor already at Jn 9:2-3.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `honor-the-son` | John 9:35–38 | “‘Do you believe in the Son of God?’ … He said, ‘Lord, I believe!’ and he worshiped him.” | moderate — worship offered to Jesus and received without correction; a natural extension of the pack's Mt 28:9/Jn 20:28-29 family.

Lexicon candidates:
- `sharing-your-faith` | "i was blind but now i see" — phrasings: "i was blind but now i see"; "once was blind but now i see bible verse".
- `why-god-allows-suffering` | "who sinned this man or his parents" — phrasings: "who sinned this man or his parents"; "why was the man born blind".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: none — single continuous narrative (book doc deliberately kept it whole), 6 tags at the soft cap.

Decisions record:
- `honor-the-son` display tag considered (9:38): a single-verse climax; thin-single-verse under the yield order at a soft-cap chapter; anchor-extension candidate recorded instead — the display route stays with `faith`, whose justification already quotes the verse.
- `sabbath-rest` decline stands (9:14–16 is Sabbath controversy, not the gift of rest — book-wide prior call).
- `signs-and-wonders` considered (9:16 “How can a man who is a sinner do such signs?”): the sign material is carried by the chapter's sitting narrative tags; not added at the soft cap; the sign-chapter anchor set proposed at chs. 2 and 4 suffices for the pack.

## John 10 (subdivided: 10:1–21 / 10:22–39 / 10:40–42)

Existing tags (book doc): `the-cross`, `deity-of-christ`, `assurance-of-salvation`, `gods-protection`, `salvation`, `guidance`, `shepherds-and-the-flock`, `jesus-the-only-way` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `the-cross` — “The good shepherd lays down his life for the sheep.” (10:11; also 10:15, 17–18: “No one takes it away from me, but I lay it down by myself.”).
- KEEP `deity-of-christ` — “I and the Father are one.” (10:30), heard as the claim it is: “because you, being a man, make yourself God.” (10:33); engine anchor already at Jn 10:30-33.
- KEEP `assurance-of-salvation` — “I give eternal life to them. They will never perish, and no one will snatch them out of my hand.” (10:28); engine anchor already at Jn 10:28-29.
- KEEP `gods-protection` — “No one is able to snatch them out of my Father’s hand.” (10:29).
- KEEP `salvation` — “I am the door. If anyone enters in by me, he will be saved” (10:9), “I came that they may have life, and may have it abundantly.” (10:10).
- KEEP `guidance` — “My sheep hear my voice, and I know them, and they follow me.” (10:27; also 10:3–5); the signposted borderline call (drafter A item 8) stands.
- KEEP `shepherds-and-the-flock` — “I am the good shepherd. I know my own, and I’m known by my own” (10:14; figure 10:1–16); engine anchor already at Jn 10:11-16.
- KEEP `jesus-the-only-way` — “I am the door. If anyone enters in by me, he will be saved” (10:9); engine anchor already at Jn 10:9.
- No ADDs, no DROPs — hard ceiling.

Anchor-extension candidates:
- `gods-protection` | John 10:28–29 | “no one will snatch them out of my hand. My Father who has given them to me is greater than all. No one is able to snatch them out of my Father’s hand.” | strong — the pack has NO gospel/acts anchors; the double-grip text is its most-searched NT expression.
- `guidance` | John 10:3–5, 27 | “the sheep follow him, for they know his voice.” (10:4) | moderate — pack has no gospel/acts anchors; "hearing God's voice" queries land here.
- `salvation` | John 10:9–10 | “I came that they may have life, and may have it abundantly.” | low-moderate — gives "abundant life" queries a stated anchor (see lexicon row).

Lexicon candidates:
- `salvation` | "abundant life" — phrasings: "abundant life meaning"; "life more abundantly"; "i came that they may have life".
- `shepherds-and-the-flock` | "sheep know his voice" — phrasings: "my sheep hear my voice"; "the sheep know his voice".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) + book-doc subdivision (3 sections) — mark for per-verse refinement. Refinement leads: 10:1–18 carries five of the eight tags; 10:22–39 carries `deity-of-christ` and the assurance pair — clean per-section split available.

Decisions record:
- Ps 82 / John 10:34 guard respected: the recorded decline + guard from the apologetics work stands; nothing in this ledger proposes any tag, anchor, lexicon row, or gist touching 10:34–35's “you are gods” material. `power-of-gods-word` was re-checked and needs nothing: the pack already anchors Jn 10:35 on main and its lexicon already carries "scripture cannot be broken" — recorded as checked, not proposed.
- ROUTE (corpus-blocked, re-open note — bad-shepherds register of `shepherds-and-the-flock`): John 10 evidence for that register — “The thief only comes to steal, kill, and destroy.” (10:10), “The hired hand flees because he is a hired hand and doesn’t care for the sheep.” (10:13; also 10:1, 8, 12) — routed to the engine-pack-backlog re-open roster (Ezek 34 / John 10 / John 21), NOT duplicated as a new gap here.
- `witness-testimony` on 10:25, 41–42 — prior thin-presence skip stands (“The works that I do in my Father’s name, these testify about me.” is one verse plus the coda).
- `deliverance-from-demons` re-checked (10:20–21): accusation vocabulary only, no exorcism — the book-wide checked-none finding stands.
## John 11 (subdivided: 11:1–16 / 11:17–37 / 11:38–44 / 11:45–57)

Existing tags (book doc): `resurrection`, `pastoral-grief-and-loss` (current engine id `grief-and-loss`), `faith`, `pastoral-serious-illness` (current engine id `serious-illness-and-dying`), `the-cross`, `i-am-sayings`, `resurrection-of-the-dead` — 7.

Applied-tag deltas:
- KEEP `resurrection` — “I am the resurrection and the life. He who believes in me will still live, even if he dies.” (11:25), enacted: “He who was dead came out, bound hand and foot with wrappings” (11:44); the ruled distinct-from-Easter flag (drafter A item 2) stands.
- KEEP `pastoral-grief-and-loss` — consolers around the sisters (11:19, 31), the identical lament “Lord, if you would have been here, my brother wouldn’t have died.” (11:21, 32), and “Jesus wept.” (11:35); engine anchors already at Jn 11:33-36.
- KEEP `faith` — “Didn’t I tell you that if you believed, you would see God’s glory?” (11:40), “Yes, Lord. I have come to believe that you are the Christ, God’s Son” (11:27).
- KEEP `pastoral-serious-illness` — “Lord, behold, he for whom you have great affection is sick.” (11:3), answered with purpose: “This sickness is not to death, but for the glory of God” (11:4).
- KEEP `the-cross` — Caiaphas' unwitting substitution prophecy: “it is advantageous for us that one man should die for the people” (11:50), “and not for the nation only, but that he might also gather together into one the children of God who are scattered abroad.” (11:52).
- KEEP `i-am-sayings` — “I am the resurrection and the life.” (11:25); engine anchor already at Jn 11:25.
- KEEP `resurrection-of-the-dead` — “He who believes in me will still live, even if he dies. Whoever lives and believes in me will never die.” (11:25–26) at a real grave (11:43–44); both-tags call stands; engine anchor already at Jn 11:25-26.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `glory-of-god` | John 11:4, 40 | “This sickness is not to death, but for the glory of God, that God’s Son may be glorified by it.” … “if you believed, you would see God’s glory” | moderate — the pack has NO gospel/acts anchors; John's glory-through-the-sign frame is a natural NT anchor.
- `serious-illness-and-dying` | John 11:3–4 | “Lord, behold, he for whom you have great affection is sick.” | low-moderate — the pack carries only Jn 14:1-3; a loved one's grave sickness brought to Jesus is its narrative register.

Lexicon candidates:
- `grief-and-loss` | "jesus wept" — phrasings: "jesus wept meaning"; "did jesus cry"; "shortest verse in the bible".
- `resurrection` | already carries "i am the resurrection and the life" — recorded as checked, no row needed.

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (4 sections) — refinement-pass marker; 7 tags (above soft cap, under ceiling; each independently clears the bar).

Decisions record:
- `glory-of-god` display tag considered (11:4, 40): two frame verses around the sign — thin against the chapter's seven sitting main-theme tags; adding would reach the ceiling on a two-verse frame; yielded as thin-single-verse; anchor-extension candidate recorded instead.
- Prior declines re-checked, both stand: `prayer` on 11:41–42 (two verses whose stated point is the bystanders' belief), `envy-and-jealousy` on 11:48 (the council's motive is fear of Rome and loss of place; the text never names envy).
- Book-doc id forms: `pastoral-grief-and-loss` ↔ `grief-and-loss`; `pastoral-serious-illness` ↔ `serious-illness-and-dying` (see header note).

## John 12 (subdivided: 12:1–11 / 12:12–19 / 12:20–36 / 12:37–50)

Existing tags (book doc): `the-cross`, `faith`, `walking-in-the-light`, `pleasing-god-not-people`, `praise`, `divine-judgment` — 6.

Applied-tag deltas:
- KEEP `the-cross` — “unless a grain of wheat falls into the earth and dies, it remains by itself alone. But if it dies, it bears much fruit.” (12:24), “And I, if I am lifted up from the earth, will draw all people to myself.” (12:32), said “signifying by what kind of death he should die.” (12:33).
- KEEP `faith` — “though he had done so many signs before them, yet they didn’t believe in him” (12:37), “Whoever believes in me, believes not in me, but in him who sent me.” (12:44).
- KEEP `walking-in-the-light` — “Walk while you have the light, that darkness doesn’t overtake you.” (12:35), “believe in the light, that you may become children of light.” (12:36; also 12:46).
- KEEP `pleasing-god-not-people` — “for they loved men’s praise more than God’s praise.” (12:43, with 12:42); engine anchor already at Jn 12:43.
- KEEP `praise` — “Hosanna! Blessed is he who comes in the name of the Lord, the King of Israel!” (12:13).
- KEEP `divine-judgment` — “Now is the judgment of this world.” (12:31), “The word that I spoke will judge him in the last day.” (12:48).
- ADD `surrender-to-god` — reinstates drafter B's own recorded cap-era drop ("squeezed out by the cap" under the old 6-tag rule; the ceiling is now 8): “He who loves his life will lose it. He who hates his life in this world will keep it to eternal life.” (12:25), with Jesus' own submission: “Now my soul is troubled. What shall I say? ‘Father, save me from this time’? But I came to this time for this cause.” (12:27). Honest substantial presence: the lose-your-life saying plus the Son's accepted hour, a connected unit (12:23–28). Chapter goes 6 → 7.
- ADD `hardness-of-heart` — the chapter's own explanation of unbelief, taught through Isaiah: “He has blinded their eyes and he hardened their heart, lest they should see with their eyes, and perceive with their heart, and would turn, and I would heal them.” (12:40, unit 12:37–41). Both-tags beside `faith` (the unbelief narrative vs. the hardening explanation, per §11(2)). The id is engine vocabulary never considered for John by the earlier passes. Chapter goes 7 → 8 (hard ceiling reached).

Anchor-extension candidates:
- `hardness-of-heart` | John 12:39–40 | “For this cause they couldn’t believe, for Isaiah said again: ‘He has blinded their eyes and he hardened their heart…’” | strong — the pack carries a single anchor (Mk 6:52); this is the NT's fullest hardening text outside Romans.
- `surrender-to-god` | John 12:24–27 | “He who loves his life will lose it.” | moderate — the pack's gospel anchors are Synoptic; John's form of deny-yourself has none.
- `messianic-prophecy` | John 12:14–16 | “As it is written, ‘Don’t be afraid, daughter of Zion. Behold, your King comes, sitting on a donkey’s colt.’” | moderate — the pack has NO gospel/acts anchors; an explicit written-fulfillment citation.
- `the-cross` | John 12:24, 32–33 | “And I, if I am lifted up from the earth, will draw all people to myself.” | moderate — the pack's only John anchor is 1:29.

Lexicon candidates:
- `the-cross` | "grain of wheat" — phrasings: "grain of wheat dies meaning"; "unless a grain of wheat falls to the ground"; "lifted up from the earth meaning".
- `surrender-to-god` | "loves his life will lose it" — phrasings: "he who loves his life will lose it"; "dying to self in the bible".

New-concept candidates: None. (The hour-of-Jesus / cross-as-glorification motif (12:23–28; 2:4; 7:30; 13:1; 17:1) was checked for a home: `glory-of-god` covers the query register via lexicon extension — see the row below — so no mint is proposed.)

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8, reached by this sweep's two ADDs) + book-doc subdivision (4 sections) — mark for per-verse refinement. Refinement leads: 12:1–8 (anointing), 12:12–19 (`praise`/`messianic-prophecy` material), 12:20–36 (`the-cross`/`surrender-to-god`), 12:37–50 (`faith`/`hardness-of-heart`/`divine-judgment`).

Decisions record:
- Both ADDs enter at/below the ceiling with every sitting tag re-checked against the presence bar — all clear; no displacement, no yield of an existing tag.
- `glory-of-god` lexicon lead (not a tag): “The time has come for the Son of Man to be glorified.” (12:23), “Father, glorify your name!” (12:28) — proposed phrasings for the pack's lexicon: "jesus glorified meaning"; "the hour has come glorify your son". Display tag not added: the glorification clauses are carried inside `the-cross`'s unit at a ceiling chapter.
- Prior declines re-checked, all stand: `generosity` on 12:3–8 (costly devotion, not giving to others), `worship` on 12:20 (feast-attendance narrative), `angels` on 12:29 (a crowd's guess about the voice, not an appearance), `discipleship` on 12:25–26 (inside the grain-of-wheat unit carried by `the-cross`), `servanthood` on 12:26 (single verse), `eternal-life` on 12:25, 50 (scattered clauses).
- `betrayal` considered (12:4–6 — Judas “who would betray him … he was a thief”): two aside verses; thin; the betrayal home is ch. 13.
## John 13 (subdivided: 13:1–17 / 13:18–30 / 13:31–38)

Existing tags (book doc): `loving-others`, `gods-love`, `obedience-to-the-word`, `pastoral-betrayal-and-marriage-crisis` (current engine id `betrayal-and-marriage-crisis`), `servanthood` — 5.

Applied-tag deltas:
- KEEP `loving-others` — “A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another.” (13:34), “By this everyone will know that you are my disciples, if you have love for one another.” (13:35); engine anchor already at Jn 13:34-35.
- KEEP `gods-love` — “having loved his own who were in the world, he loved them to the end.” (13:1).
- KEEP `obedience-to-the-word` — “For I have given you an example, that you should also do as I have done to you.” (13:15), “If you know these things, blessed are you if you do them.” (13:17); engine anchor already at Jn 13:17.
- KEEP `pastoral-betrayal-and-marriage-crisis` — “He who eats bread with me has lifted up his heel against me.” (13:18), the dipped morsel handed to the betrayer (13:26); the marriage-facet-absent signpost (drafter B item 2) stands.
- KEEP `servanthood` — “If I then, the Lord and the Teacher, have washed your feet, you also ought to wash one another’s feet.” (13:14; scene 13:3–17); engine anchor already at Jn 13:12-15.
- ADD `betrayal` — the engine pack's own anchor scene (its anchors already include Jn 13:18-21, and its lexicon carries "who betrayed jesus; judas betrays jesus"): “that the Scripture may be fulfilled, ‘He who eats bread with me has lifted up his heel against me.’” (13:18), “one of you will betray me.” (13:21), and the identification by morsel (13:26–30). Honest substantial presence: the betrayal announcement is a whole section (13:18–30). Both-tags beside the pastoral id (the who-betrayed-Jesus narrative register vs. the betrayed-by-a-companion crisis register, per §11(2)). Chapter goes 5 → 6.

Anchor-extension candidates:
- `satan` | John 13:27 | “After the piece of bread, then Satan entered into him.” | low-moderate — the pack anchors Jn 8:44 but not the entering text; "satan entered judas" queries land here (also 13:2).

Lexicon candidates:
- `loving-others` | "a new commandment" — phrasings: "a new commandment i give to you"; "new commandment love one another".
- `betrayal` | "he who eats bread with me" — phrasings: "he who eats bread with me lifted his heel"; "why did judas betray jesus".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (3 sections) — refinement-pass marker; 6 tags at the soft cap after the ADD.

Decisions record:
- ADD `betrayal` ordering: enters at the soft cap exactly; no yield needed; the both-tags pairing with the pastoral id is deliberate and recorded (two registers, one scene).
- `satan` display tag considered (13:2, 27): two narrative verses; thin-single-verse; anchor-extension candidate recorded instead.
- Prior calls re-checked, all stand: `discipleship` on 13:35 (single verse, quoted under `loving-others`), `humble-exaltation` not applicable (the footwashing's serving posture is `servanthood`'s register, not God-exalts-the-humble).
- `glory-of-god` noted (13:31–32 “Now the Son of Man has been glorified, and God has been glorified in him.”): two transitional verses; thin; covered by the glorification lexicon lead recorded at ch. 12.
- Book-doc id form: `pastoral-betrayal-and-marriage-crisis` ↔ engine `betrayal-and-marriage-crisis` (see header note).

## John 14 (not subdivided)

Existing tags (book doc): `trust-in-god`, `holy-spirit-the-comforter`, `peace-of-god`, `obedience-to-the-word`, `deity-of-christ`, `second-coming`, `loving-god`, `jesus-the-only-way` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `trust-in-god` — “Don’t let your heart be troubled. Believe in God. Believe also in me.” (14:1; also 14:29).
- KEEP `holy-spirit-the-comforter` — “he will give you another Counselor, that he may be with you forever: the Spirit of truth” (14:16–17), “the Counselor, the Holy Spirit, whom the Father will send in my name, will teach you all things, and will remind you of all that I said to you.” (14:26); engine anchors already at Jn 14:16-17, 14:26.
- KEEP `peace-of-god` — “Peace I leave with you. My peace I give to you; not as the world gives, I give to you.” (14:27); engine anchor already at Jn 14:27.
- KEEP `obedience-to-the-word` — “If you love me, keep my commandments.” (14:15), “If a man loves me, he will keep my word.” (14:23); engine anchors already at Jn 14:15, 14:21.
- KEEP `deity-of-christ` — “He who has seen me has seen the Father.” (14:9), the mutual indwelling (14:10–11); engine anchor already at Jn 14:9; the range-left-standing note on 14:28 (drafter B item 7) stands.
- KEEP `second-coming` — “I will come again and will receive you to myself; that where I am, you may be there also.” (14:3); the r1 narrowing to 14:3 stands; engine anchor already at Jn 14:3.
- KEEP `loving-god` — “One who has my commandments and keeps them, that person is one who loves me.” (14:21; both-tags beside `obedience-to-the-word` stands).
- KEEP `jesus-the-only-way` — “I am the way, the truth, and the life. No one comes to the Father, except through me.” (14:6); engine anchor already at Jn 14:6.
- No ADDs, no DROPs — hard ceiling.

Anchor-extension candidates:
- `fear-not` | John 14:27 | “Don’t let your heart be troubled, neither let it be fearful.” | strong — the pack has NO gospel/acts anchors; this is the Farewell discourse's own fear-not command and a heavy comfort query landing.
- `prayer` | John 14:13–14 — already engine anchors on main (Jn 14:13-14); recorded as checked, no extension needed. Same for `loneliness` (Jn 14:18 anchored), `knowing-god` (Jn 14:7 anchored), `presence-of-god` (Jn 14:23 anchored), `serious-illness-and-dying` (Jn 14:1-3 anchored).

Lexicon candidates:
- `jesus-the-only-way` | "i am the way the truth and the life" — phrasings: "i am the way the truth and the life"; "no one comes to the father except through me". (The pack's lexicon carries the question forms but not the verse's own wording.)
- `trust-in-god` | "let not your heart be troubled" — phrasings: "do not let your heart be troubled"; "let not your heart be troubled meaning".
- `second-coming` | "i go to prepare a place for you" — phrasings: "in my father's house are many mansions"; "i go to prepare a place for you". (WEB wording is “In my Father’s house are many homes.” — the KJV "mansions"/NIV "rooms" phrasings are exactly the cross-translation case the Layer-2 program mines; flag for the alias/translation-token route as well.)

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) — mark for per-verse refinement (chapter kept whole by the book doc as one continuous discourse; the refinement pass can anchor per teaching unit: 14:1–7, 14:8–14, 14:15–24, 14:25–31).

Decisions record:
- Candidates at the ceiling, yielded per §11.6, each recorded: `fear-not` (14:27 — drafter B's original cap-drop note stands; the engine-side gap is closed by the anchor-extension candidate above, which is the better vehicle); `loneliness` (14:18 “I will not leave you orphans.” — single verse; engine anchor already exists, so search coverage does not depend on a display tag); `prayer` (14:13–14 — two verses carried inside the discourse; the tag lives at ch. 16); `knowing-god` (14:7 — single verse); `trinity` (the chapter narrates Father, Son, and Spirit but does not teach the three-in-one relation as such — standing skip kept); `asking-in-gods-will` (in-my-name is not according-to-his-will — drafter B item 9 stands).
- 14:28 (“for the Father is greater than I.”) left standing in the text per the book doc's no-flattening policy; no proposal touches it (covenant #6 — no adjudication).
## John 15 (not subdivided)

Existing tags (book doc): `abiding-in-christ`, `spiritual-growth`, `loving-others`, `friendship`, `suffering-for-christ`, `i-am-sayings` — 6.

Applied-tag deltas:
- KEEP `abiding-in-christ` — “Remain in me, and I in you.” (15:4), “apart from me you can do nothing.” (15:5; unit 15:4–10); engine anchors already at Jn 15:4, 15:5, 15:7, 15:16.
- KEEP `spiritual-growth` — “Every branch that bears fruit, he prunes, that it may bear more fruit.” (15:2), “In this my Father is glorified, that you bear much fruit” (15:8; also 15:5, 16).
- KEEP `loving-others` — “This is my commandment, that you love one another, even as I have loved you.” (15:12; also 15:17); engine anchor already at Jn 15:12.
- KEEP `friendship` — “Greater love has no one than this, that someone lay down his life for his friends.” (15:13), “But I have called you friends” (15:15); engine anchor already at Jn 15:13.
- KEEP `suffering-for-christ` — “If the world hates you, you know that it has hated me before it hated you.” (15:18), “If they persecuted me, they will also persecute you.” (15:20), “for my name’s sake” (15:21).
- KEEP `i-am-sayings` — “I am the true vine, and my Father is the farmer.” (15:1; also 15:5).
- No ADDs, no DROPs.

Anchor-extension candidates:
- `suffering-for-christ` | John 15:18–21 | “If they persecuted me, they will also persecute you.” | strong — the pack's only anchor is Mt 5:10; this is the NT's fullest the-world-will-hate-you teaching and a heavy persecution-query landing.
- `election-and-predestination` | John 15:16, 19 | “You didn’t choose me, but I chose you and appointed you, that you should go and bear fruit” | moderate — joins the John 6/17 candidate set for a pack with no gospel/acts anchors.

Lexicon candidates:
- `friendship` | "greater love has no one than this" — phrasings: "greater love has no man than this"; "lay down his life for his friends".
- `spiritual-growth` | "bear much fruit" — phrasings: "bear fruit bible verse"; "pruning in the bible"; "every branch that bears fruit he prunes".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: none — chapter kept whole by the book doc (one continuous discourse), 6 tags at the soft cap.

Decisions record:
- `gods-love` considered (15:9 “Even as the Father has loved me, I also have loved you. Remain in my love.”, 15:13): genuine register, but 15:9–10 sit inside `abiding-in-christ`'s quoted unit and 15:12–13 under `loving-others`/`friendship`; at the soft cap this is carried-by-existing-tags; not added. Engine side already covered: `gods-love` anchors Jn 15:13 on main — recorded as checked.
- `joy-in-the-lord` on 15:11 — prior single-verse call (tag kept to ch. 16) stands; the pack's engine anchor IS Jn 15:11, so nothing is lost.
- `prayer` on 15:7, 16 (ask-whatever clauses) — carried inside the abiding/fruit units; not tagged; the ask-in-my-name lexicon lead is recorded at ch. 16.
- `holy-spirit-the-comforter` on 15:26 — prior thin call stands (two verses; the teaching homes are chs. 14 and 16); engine anchor already at Jn 15:26.
- `messianic-prophecy` considered (15:25 “They hated me without a cause.”): single fulfillment verse; thin; not proposed.

## John 16 (not subdivided)

Existing tags (book doc): `holy-spirit-the-comforter`, `joy-in-the-lord`, `suffering-for-christ`, `prayer`, `peace-of-god` — 5.

Applied-tag deltas:
- KEEP `holy-spirit-the-comforter` — “if I don’t go away, the Counselor won’t come to you” (16:7), “when he, the Spirit of truth, has come, he will guide you into all truth” (16:13; unit 16:7–15); engine anchors already at Jn 16:7, 16:13.
- KEEP `joy-in-the-lord` — “You will be sorrowful, but your sorrow will be turned into joy.” (16:20), “no one will take your joy away from you.” (16:22; unit 16:20–24).
- KEEP `suffering-for-christ` — “They will put you out of the synagogues. Yes, the time is coming that whoever kills you will think that he offers service to God.” (16:2; also 16:33's trouble).
- KEEP `prayer` — “whatever you may ask of the Father in my name, he will give it to you.” (16:23), “Ask, and you will receive, that your joy may be made full.” (16:24).
- KEEP `peace-of-god` — “I have told you these things, that in me you may have peace. In the world you have trouble; but cheer up! I have overcome the world.” (16:33); engine anchor already at Jn 16:33.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `victory-in-christ` | John 16:33 | “In the world you have trouble; but cheer up! I have overcome the world.” | strong — the pack has NO gospel/acts anchors and its lexicon already carries "overcome the world"; this is that phrase's source text.
- `suffering-for-christ` | John 16:1–4 | “whoever kills you will think that he offers service to God.” | moderate — pairs with the 15:18–21 candidate (one Farewell-discourse persecution range may serve both).
- `joy-in-the-lord` | John 16:20–24 | “your sorrow will be turned into joy.” | moderate — the pack's only John anchor is 15:11; the sorrow-to-joy unit is its teaching text.

Lexicon candidates:
- `peace-of-god` | "in the world you have trouble" — phrasings: "in this world you will have trouble"; "in the world you will have tribulation" (translation-variant flag: WEB reads "trouble").
- `prayer` | "ask in my name" — phrasings: "ask in jesus name"; "praying in jesus name"; "whatever you ask in my name".
- `joy-in-the-lord` | "sorrow turned into joy" — phrasings: "sorrow will be turned into joy"; "no one will take your joy away".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: none — chapter kept whole (one continuous discourse), 5 tags under the soft cap.

Decisions record:
- `victory-in-christ` display tag considered (16:33): the overcoming clause is Christ's own, stated once, and `peace-of-god` carries the verse's teaching to the believer — the prior decline stands; the engine-side gap is closed by the anchor-extension candidate above (the pack's lexicon phrase currently has no anchor to land on).
- `those-who-never-heard` considered (16:8–11 — “he will convict the world about sin, about righteousness, and about judgment”): the pack's register is general revelation / without excuse; conviction by the Spirit is a different substance, and the engine anchor at Jn 16:8 already exists on main; not display-tagged; recorded as checked.
- `holy-spirit` routing guard stands: 16:7–15 are the Comforter id's exact verses; the broader who-is-the-Spirit id stays off (book-wide double-routing rule).
- `grief-and-loss` (16:20–22 sorrow material): engine anchor already at Jn 16:22; display substance carried by `joy-in-the-lord`'s sorrow-to-joy reading — recorded as checked, not added.
## John 17 (not subdivided)

Existing tags (book doc): `prayer`, `gods-protection`, `holiness`, `gods-love`, `deity-of-christ`, `eternal-life`, `unity-of-the-church`, `trustworthiness-of-scripture` — 8 (hard ceiling).

Applied-tag deltas:
- KEEP `prayer` — the whole chapter is Jesus praying: “I pray for them.” (17:9), “Not for these only do I pray, but for those also who will believe in me through their word” (17:20).
- KEEP `gods-protection` — “Holy Father, keep them through your name” (17:11), “that you would keep them from the evil one.” (17:15; also 17:12).
- KEEP `holiness` — “Sanctify them in your truth. Your word is truth.” (17:17), “that they themselves also may be sanctified in truth.” (17:19).
- KEEP `gods-love` — “that the world may know that you sent me and loved them, even as you loved me.” (17:23), “that the love with which you loved me may be in them” (17:26).
- KEEP `deity-of-christ` — “glorify me with your own self with the glory which I had with you before the world existed.” (17:5), “you loved me before the foundation of the world.” (17:24).
- KEEP `eternal-life` (§11.1 adopted) — the in-text definition: “This is eternal life, that they should know you, the only true God, and him whom you sent, Jesus Christ.” (17:3; also 17:2).
- KEEP `unity-of-the-church` — “that they may all be one; even as you, Father, are in me, and I in you” (17:21; also 17:11, 22–23); engine anchor already at Jn 17:21-23.
- KEEP `trustworthiness-of-scripture` — “Your word is truth.” (17:17; both-tags beside `holiness` stands); engine anchor already at Jn 17:17.
- No ADDs, no DROPs — hard ceiling.

Anchor-extension candidates:
- `knowing-god` | John 17:3 | “This is eternal life, that they should know you, the only true God, and him whom you sent, Jesus Christ.” | strong — the pack's only John anchor is 14:7; this is Scripture's own definition-form knowing-God text.
- `gods-protection` | John 17:11, 15 | “Holy Father, keep them through your name … keep them from the evil one.” | strong — the pack has NO gospel/acts anchors (pairs with the Jn 10:28-29 candidate at ch. 10).
- `holiness` | John 17:17–19 | “Sanctify them in your truth. Your word is truth.” | moderate — the pack has NO gospel/acts anchors; sanctification prayed, not just commanded.
- `the-name-of-god` | John 17:6, 26 | “I revealed your name to the people whom you have given me” … “I made known to them your name, and will make it known” | moderate — no gospel/acts anchors in the pack.
- `no-other-god` | John 17:3 | “the only true God” | moderate — the pack's lexicon already carries "the only true god" with no anchor for it to land on.
- `election-and-predestination` | John 17:2, 6, 9 | “I don’t pray for the world, but for those whom you have given me, for they are yours.” | moderate — completes the John 6/15/17 given-by-the-Father set.
- `glory-of-god` | John 17:1, 4–5, 22–24 | “Father, the time has come. Glorify your Son, that your Son may also glorify you” | moderate — joins the ch. 11 candidate for a pack with no gospel/acts anchors.

Lexicon candidates:
- `unity-of-the-church` | "that they may all be one" — phrasings: "that they may be one meaning"; "jesus prays for unity"; "why are there so many denominations".
- `knowing-god` | "know the only true god" — phrasings: "this is eternal life that they may know you"; "what does it mean to know god".
- `prayer` | "high priestly prayer" — phrasings: "high priestly prayer of jesus"; "jesus prays for his disciples"; "john 17 prayer".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: HARD CEILING (8) — mark for per-verse refinement (kept whole as one continuous prayer; refinement units: 17:1–5 for himself, 17:6–19 for the disciples, 17:20–26 for all who will believe).

Decisions record:
- ROUTE (corpus-blocked row 42, `truth`): John 17's what-is-truth evidence — “Sanctify them in your truth. Your word is truth.” (17:17), “that they themselves also may be sanctified in truth.” (17:19) — routed to the blocked `truth` row as supporting material, NOT duplicated as a gap or proposed as a pack; display substance stays carried by `holiness` + `trustworthiness-of-scripture` (the standing both-tags pair).
- Candidates at the ceiling, yielded per §11.6, each recorded with its vehicle: `knowing-god` (17:3, 25–26 — genuine but the verse is `eternal-life`'s quoted definition; broad-duplicating-specific; anchor-extension instead), `the-name-of-god` (17:6, 11–12, 26 — the kept-through-your-name clause is `gods-protection`'s quote; anchor-extension instead), `glory-of-god` (17:1–5, 22–24 — the glory clauses are `deity-of-christ`'s quoted verses; anchor-extension instead), `election-and-predestination` (given-me clauses thread the prayer but every quotable instance sits inside sitting tags' ranges; anchor-extension instead), `joy-in-the-lord` (17:13 single verse — prior ch.-16-only call stands).
- `no-other-god` display considered (17:3 “the only true God”): one clause; thin-single-verse; anchor-extension recorded instead. No adjudicating gloss proposed (covenant #6).

## John 18 (subdivided: 18:1–14 / 18:15–27 / 18:28–40)

Existing tags (book doc): `surrender-to-god`, `providence`, `kingdom-of-heaven`, `truth`, `i-am-sayings` — 5.

Applied-tag deltas:
- KEEP `surrender-to-god` — “Jesus therefore, knowing all the things that were happening to him, went out” (18:4), “Put the sword into its sheath. The cup which the Father has given me, shall I not surely drink it?” (18:11); the signposted no-surrender-vocabulary call (drafter B item 3) stands.
- KEEP `providence` — “that the word might be fulfilled which he spoke, ‘Of those whom you have given me, I have lost none.’” (18:9), “that the word of Jesus might be fulfilled, which he spoke, signifying by what kind of death he should die.” (18:32), with Caiaphas' standing counsel (18:14).
- KEEP `kingdom-of-heaven` — “My Kingdom is not of this world.” (18:36); engine anchor already at Jn 18:36.
- KEEP `truth` (§11.1 adopted) — “I have come into the world, that I should testify to the truth. Everyone who is of the truth listens to my voice.” (18:37), met by “What is truth?” (18:38).
- KEEP `i-am-sayings` — “Jesus said to them, ‘I am he.’ … they went backward and fell to the ground.” (18:5–6); the consensus-reading signpost stands.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `surrender-to-god` | John 18:11 | “The cup which the Father has given me, shall I not surely drink it?” | moderate — the pack's anchors are Synoptic (Lk 22:42 etc.); John's cup-saying has none.
- `betrayal` | John 18:2–5 | “Now Judas, who betrayed him, also knew the place” (18:2) | low — the pack already anchors the arrest via Lk 22:47-48; add only if the curator wants John's account addressable.

Lexicon candidates:
- `kingdom-of-heaven` | "my kingdom is not of this world" — phrasings: "my kingdom is not of this world meaning"; "jesus kingdom not of this world".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (3 sections) — refinement-pass marker; 5 tags, under the soft cap.

Decisions record:
- ROUTE (corpus-blocked row 42, `truth`): John 18's what-is-truth evidence — “that I should testify to the truth. Everyone who is of the truth listens to my voice.” (18:37) and Pilate's “What is truth?” (18:38) — routed to the blocked `truth` row (the display tag above is the §11.1 adopted display use the roster explicitly allows; only the ENGINE pack is blocked). No lexicon row proposed here: "what is truth" phrasings belong to the blocked row's own design.
- `betrayal` display tag considered (18:2–5): the arrest executes the betrayal but the chapter's substance is arrest and trials; the prior betrayed-reader-is-served-by-13 call stands; anchor-extension candidate (low) recorded instead.
- `pastoral-relapse-and-restoration` on the denials (18:17, 25–27): prior call stands — the chapter depicts only the fall; tagging it would route "rising after a fall" searches to falling (the Genesis-3 principle).
- `slander-and-false-accusation` considered (18:29–30 the unspecified charge, 18:38 “I find no basis for a charge against him.”): the trial's false-accusation shape is real but the personal-register pack ("when people lie about you") would be a register mismatch on a passion narrative; not proposed; noted for the curator.
- `gods-protection` on 18:8–9 — prior two-verses-inside-the-arrest skip stands (the keeping is prayed at length in ch. 17, where the tag lives).
## John 19 (subdivided: 19:1–16 / 19:17–27 / 19:28–37 / 19:38–42)

Existing tags (book doc): `the-cross`, `providence`, `caring-for-aging-parents`, `death-and-burial` — 4.

Applied-tag deltas:
- KEEP `the-cross` — the crucifixion itself: “where they crucified him, and with him two others” (19:18), “I am thirsty!” (19:28), “It is finished!” (19:30).
- KEEP `providence` — “You would have no power at all against me, unless it were given to you from above.” (19:11), with the fulfillment refrain “that the Scripture might be fulfilled” (19:24, 28, 36).
- KEEP `caring-for-aging-parents` — “he said to his mother, ‘Woman, behold, your son!’ Then he said to the disciple, ‘Behold, your mother!’ From that hour, the disciple took her to his own home.” (19:26–27); the ratified two-verse call (drafter B item 4) stands.
- KEEP `death-and-burial` (§11.1 adopted) — “So they took Jesus’ body, and bound it in linen cloths with the spices, as the custom of the Jews is to bury.” (19:40), the new garden tomb (19:41–42).
- ADD `messianic-prophecy` — explicit written-fulfillment citations structure the crucifixion account: “that the Scripture might be fulfilled, which says, ‘They parted my garments among them. They cast lots for my clothing.’” (19:24), “that the Scripture might be fulfilled, ‘A bone of him will not be broken.’” (19:36), “Again another Scripture says, ‘They will look on him whom they pierced.’” (19:37). Honest substantial presence: three named Scripture citations plus the thirst fulfillment (19:28) — the "prophecies fulfilled at the crucifixion" query family's primary landing. Both-tags beside `providence` (the fulfillment-of-written-prophecy register vs. the sovereignty-over-events register, per §11(2)). Chapter goes 4 → 5.

Anchor-extension candidates:
- `the-cross` | John 19:28–30 | “When Jesus therefore had received the vinegar, he said, ‘It is finished!’ Then he bowed his head and gave up his spirit.” | strong — the pack's only John anchor is 1:29; "it is finished" is among the heaviest cross queries.
- `messianic-prophecy` | John 19:24, 36–37 | “They will look on him whom they pierced.” | strong — the pack has NO gospel/acts anchors; these are its cleanest NT fulfillment citations.
- `governing-authorities` | John 19:11 | “You would have no power at all against me, unless it were given to you from above.” | low-moderate — state power relativized from above; single verse, curator's call.

Lexicon candidates:
- `the-cross` | "it is finished" — phrasings: "it is finished meaning"; "jesus said it is finished"; "last words of jesus on the cross".
- `messianic-prophecy` | "prophecies fulfilled at the crucifixion" — phrasings: "prophecies fulfilled at the cross"; "old testament prophecies about jesus death"; "that the scripture might be fulfilled".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (4 sections) — refinement-pass marker; 5 tags, under the soft cap.

Decisions record:
- ROUTE (corpus-blocked row 22, `death-and-burial`): John 19's burial evidence — “bound it in linen cloths with the spices, as the custom of the Jews is to bury.” (19:40), Joseph of Arimathaea and Nicodemus with “a mixture of myrrh and aloes, about a hundred Roman pounds” (19:38–39), the new tomb (19:41–42) — routed to the blocked row as the roster itself directs (GOSPELS SWEEP note on row 22); the display tag above is the §11.1 adopted display use; only the ENGINE pack is blocked.
- `governing-authorities` display tag considered (19:11): one teaching verse inside the trial; thin-single-verse; anchor-extension candidate recorded instead.
- `passover` considered (19:14 “the Preparation Day of the Passover”, 19:31, 42): time markers; the passover-lamb typology is NOT stated by the chapter's text (19:36's citation is unattributed there), so tagging would read it back — not tagged (no-read-back rule).
- `witness-testimony` on 19:35 (“He who has seen has testified, and his testimony is true.”): single verse; prior thin call stands.
- `slander-and-false-accusation` (19:4, 6 “I find no basis for a charge against him.”): same register-mismatch conclusion as ch. 18; not proposed.

## John 20 (subdivided: 20:1–10 / 20:11–18 / 20:19–23 / 20:24–31)

Existing tags (book doc): `resurrection`, `faith`, `doubt`, `deity-of-christ`, `pastoral-grief-and-loss` (current engine id `grief-and-loss`), `honor-the-son` — 6.

Applied-tag deltas:
- KEEP `resurrection` — the empty tomb and graveclothes (20:1–8), “I am ascending to my Father and your Father” (20:17), the appearances (20:19–20, 26–29); engine anchor already at Jn 20:27-28.
- KEEP `faith` — “he saw and believed.” (20:8), “these are written that you may believe that Jesus is the Christ, the Son of God, and that believing you may have life in his name.” (20:31).
- KEEP `doubt` — “Unless I see in his hands the print of the nails … I will not believe.” (20:25), answered: “Don’t be unbelieving, but believing.” (20:27).
- KEEP `deity-of-christ` — “Thomas answered him, ‘My Lord and my God!’” (20:28), received with blessing (20:29); engine anchor already at Jn 20:28-29.
- KEEP `pastoral-grief-and-loss` — Mary weeping at the tomb: “Woman, why are you weeping?” (20:13, 15), met by name: “Jesus said to her, ‘Mary.’” (20:16); the grief-answered flag (drafter B item 5) stands.
- KEEP `honor-the-son` — worship-language addressed to Jesus and blessed: “My Lord and my God!” (20:28), “Blessed are those who have not seen and have believed.” (20:29); engine anchor already at Jn 20:28-29.
- No ADDs, no DROPs.

Anchor-extension candidates:
- `doubt` | John 20:24–29 | “Unless I see in his hands the print of the nails, put my finger into the print of the nails, and put my hand into his side, I will not believe.” | strong — the pack's only anchor is Mk 9:23-24; Thomas is the doubt narrative users actually search.
- `ascension` | John 20:17 | “I am ascending to my Father and your Father, to my God and your God.” | moderate — the pack's anchors are Acts/Luke; John's own ascension word has none.

Lexicon candidates:
- `doubt` | "doubting thomas" — phrasings: "doubting thomas story"; "blessed are those who have not seen"; "thomas doubted jesus".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (4 sections) — refinement-pass marker; 6 tags at the soft cap.

Decisions record:
- Prior skips re-checked at the soft cap, all stand: `peace-of-god` (the thrice “Peace be to you.” greeting, 20:19, 21, 26 — greeting, not teaching), `forgiveness-of-sins` (20:23 is a commissioning word about the disciples' ministry, not God-forgives-you substance), `sharing-your-faith` (20:21 single verse), `holy-spirit` (20:22 one verse of narrative bestowal), `angels` (20:12 two verses inside the narrative).
- `signs-and-wonders` considered (20:30–31 — “Jesus did many other signs … but these are written that you may believe”): the purpose statement is `faith`'s quoted anchor; engine anchor already exists at Jn 20:30-31, so nothing is lost; yielded as broad-duplicating-specific at the soft cap.
- Book-doc id form: `pastoral-grief-and-loss` ↔ engine `grief-and-loss` (see header note).

## John 21 (subdivided: 21:1–14 / 21:15–25)

Existing tags (book doc): `pastoral-relapse-and-restoration` (current engine id `relapse-and-restoration`), `gods-provision`, `discipleship`, `loving-god`, `shepherds-and-the-flock` — 5.

Applied-tag deltas:
- KEEP `pastoral-relapse-and-restoration` — three questions over three denials: “He said to him the third time, ‘Simon, son of Jonah, do you have affection for me?’ Peter was grieved because he asked him the third time” (21:17), restored and recommissioned (21:15–19).
- KEEP `gods-provision` — “Cast the net on the right side of the boat, and you will find some.” (21:6), “they saw a fire of coals there, with fish and bread laid on it.” (21:9), “full of one hundred fifty-three great fish” (21:11).
- KEEP `discipleship` — “he said to him, ‘Follow me.’” (21:19), repeated against comparison: “You follow me.” (21:22).
- KEEP `loving-god` — “Simon, son of Jonah, do you love me more than these?” (21:15), asked three times (21:15–17); engine anchor already at Jn 21:15-17.
- KEEP `shepherds-and-the-flock` — “Feed my lambs.” (21:15), “Tend my sheep.” (21:16), “Feed my sheep.” (21:17); engine anchor already at Jn 21:15-17.
- ADD `resurrection` — the chapter is a resurrection-appearance narrative end to end: “After these things, Jesus revealed himself again to the disciples at the sea of Tiberias.” (21:1), “This is now the third time that Jesus was revealed to his disciples after he had risen from the dead.” (21:14), the risen Lord recognized (“It’s the Lord!”, 21:7) and eating with them (21:12–13). Honest substantial presence: the appearance frame is the narrative's own stated subject (21:1, 14), not an inference. Chapter goes 5 → 6.

Anchor-extension candidates:
- `relapse-and-restoration` | John 21:15–19 | “He said to him the third time, ‘Simon, son of Jonah, do you have affection for me?’ … Jesus said to him, ‘Feed my sheep.’” | strong — the pack has NO gospel/acts anchors; Peter's restoration is the NT's defining rising-after-a-fall narrative.
- `resurrection` | John 21:1, 14 | “This is now the third time that Jesus was revealed to his disciples after he had risen from the dead.” | low-moderate — gives the pack's appearance-family a John 21 landing (it already holds Lk 24:42-43's eating proof; 21:12–13 parallels it).

Lexicon candidates:
- `shepherds-and-the-flock` | "feed my sheep" — phrasings: "feed my sheep meaning"; "feed my lambs tend my sheep".
- `relapse-and-restoration` | "do you love me three times" — phrasings: "why did jesus ask peter three times"; "did jesus forgive peter"; "restoration of peter".

New-concept candidates: None.

Decline-overturn proposals: None.

Ceiling / refinement flags: book-doc subdivision (2 sections) — refinement-pass marker; 6 tags at the soft cap after the ADD.

Decisions record:
- ROUTE (corpus-blocked re-open note, `shepherds-and-the-flock` registers): John 21's under-shepherd charge — “Feed my lambs.” / “Tend my sheep.” / “Feed my sheep.” (21:15–17) — routed to the engine-pack-backlog re-open roster (Ezek 34 / John 10 / John 21), completing the ch. 10 route; NOT duplicated as a new gap.
- ADD `resurrection` ordering: enters at the soft cap exactly; no yield needed. Recorded rationale: the prior passes tagged the appearance chapters 20 (and 2's prediction) but never dispositioned ch. 21 for the id — this closes an honest gap ("resurrection appearances" searches should reach the lakeshore scene).
- `second-coming` considered (21:22–23 “If I desire that he stay until I come, what is that to you?”): two verses correcting a rumor about the beloved disciple; thin; not tagged.
- `witness-testimony` considered (21:24 “This is the disciple who testifies about these things … his witness is true.”): single closing verse; thin; not tagged.
- `sharing-your-faith` / fishing imagery: John 21's catch is not given the fishers-of-men interpretation in this Gospel's text — no tag proposed on imagery the chapter doesn't teach (no read-back).
- Book-doc id form: `pastoral-relapse-and-restoration` ↔ engine `relapse-and-restoration` (see header note).
---

# Survival audit (CONVENTIONS §9) — 2026-08-26, end of sweep

Full-file re-read after the final chapter append. Results:

- **All 21 chapter entries present, in order 1→21**, each carrying all 8 required sections
  (existing tags / deltas / anchor-extensions / lexicon / new-concept / decline-overturns /
  ceiling flags / Decisions record). Header block intact and unmodified.
- **Quote verification (mechanical):** every curly-quoted span in every chapter entry was split
  on ellipses and checked as a word-for-word substring of that chapter's WEB text from the
  pinned fixture (webchap.py, commit 87fd68c). 328 fragments checked, **0 mismatches**.
  Normalization applied symmetrically on both sides: quotation marks (curly double/single) and
  apostrophes stripped, whitespace collapsed — i.e., where a WEB-internal double quotation was
  nested to single marks inside a ledger span, the words and punctuation are otherwise verbatim.
- **One in-place correction during audit**, recorded per no-silent-edits: the John 12 ADD line
  originally set a book-doc citation ("squeezed out by the cap" — drafter B's phrase, not WEB
  text) in curly quotes, colliding with this ledger's curly-equals-WEB convention; the marks were
  changed to straight quotes (no words changed, no WEB quote touched). All other bytes of every
  earlier append verified unchanged by the full re-read.
- **Roll-up counts:** applied-tag deltas — 9 ADDs (ch2 `signs-and-wonders`; ch4 `living-water`;
  ch6 `election-and-predestination`; ch7 `living-water`; ch12 `surrender-to-god`,
  `hardness-of-heart`; ch13 `betrayal`; ch19 `messianic-prophecy`; ch21 `resurrection`),
  129 KEEPs, 0 DROPs. Anchor-extension candidates: 46. Lexicon candidate rows: 45
  (incl. the ch12 Decisions-recorded `glory-of-god` lead). New-concept candidates: 0
  (every John theme has an engine or §11.1 home). Decline-overturn proposals: 0
  (John 6 `lords-supper` reconsideration recorded and withheld; Ps 82 / John 10:34 guard
  respected untouched).
- **Ceiling / refinement flags:** hard-ceiling chapters — 1, 3, 6, 8, 10, 12, 14, 17
  (6 pre-existing; 6 and 12 reached by this sweep's ADDs). Flagged for the per-verse
  refinement pass (ceiling and/or book-doc subdivision): 1–8, 10–14, 17–21.
  Unflagged: 9, 15, 16.
- **Corpus-blocked routes (no duplication):** row 22 `death-and-burial` ← John 19:38–42;
  row 42 `truth` ← John 17:17–19 + 18:37–38; re-open note `shepherds-and-the-flock` registers
  ← John 10:1–13 + 21:15–17.

AUDIT RESULT: **PASS** — ledger complete and intact.

---

# PASTORAL-ID ERRATUM (2026-08-26)

Delivery-pass audit of the 14 pastoral-* concept ids. The canonical ledger form is the
`pastoral-` prefixed filename stem; the unprefixed YAML ids are the wrong form. This
ledger's header note (and its "engine-side candidates use the index id" convention)
declared the unprefixed spelling for candidate lines; the project has since settled on
the prefixed form as canonical, so that convention is superseded. Occurrences below are
recorded append-only (no body edit); the canonical form governs wherever the wrong form
appears. Parenthetical "(current engine id ...)" annotations merely discuss the
discrepancy and are not listed. Line numbers refer to the file state as audited
(pre-erratum).

1.  John 4 entry (line 156, anchor-extension candidate): `prayer-for-healing`
    → canonical `pastoral-prayer-for-healing`.
2.  John 5 entry (line 205, considered/not-tagged note): `prayer-for-healing`
    → canonical `pastoral-prayer-for-healing`.
3.  John 8 entry (line 294, lexicon candidate): `freedom-from-bondage`
    → canonical `pastoral-freedom-from-bondage`.
4.  John 8 entry (line 302, ceiling/refinement leads): `freedom-from-bondage`
    → canonical `pastoral-freedom-from-bondage`.
5.  John 11 entry (line 392, anchor-extension candidate): `serious-illness-and-dying`
    → canonical `pastoral-serious-illness-and-dying`.
6.  John 11 entry (line 395, lexicon candidate): `grief-and-loss`
    → canonical `pastoral-grief-and-loss`.
7.  John 14 entry (line 493, checked-anchors note): `serious-illness-and-dying`
    → canonical `pastoral-serious-illness-and-dying`.
8.  John 16 entry (line 575, considered/not-added note): `grief-and-loss`
    → canonical `pastoral-grief-and-loss`.
9.  John 21 entry (line 724, anchor-extension candidate): `relapse-and-restoration`
    → canonical `pastoral-relapse-and-restoration`.
10. John 21 entry (line 729, lexicon candidate): `relapse-and-restoration`
    → canonical `pastoral-relapse-and-restoration`.

Total: 10 occurrences. Canonical form governs.
