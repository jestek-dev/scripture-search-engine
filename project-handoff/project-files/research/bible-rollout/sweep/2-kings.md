# 2 Kings sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (plus the §11.1 adopted
  display-tag vocabulary — canonical list per the coordinator's 2026-08-26 update:
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md, 161 ids, each marked
  engine-built yes/no; engine ids preferred throughout. Cross-checked: the only non-engine
  adopted ids used on 2 Kings tag lines are `exile-and-captivity` and `davidic-covenant`, both
  confirmed on the canonical list as engine-built: no)
- Book: 2 Kings (25 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/2-kings.md
  - Scout briefing + pointer files: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
    (BRIEFING.md, conventions-extract.md, concept-inventory.md, concept-ids.txt,
    declines-and-contested.md, corpus-blocked-roster.md, book-docs-index.md,
    web-text-access.md, repo-state.md, plan-extract.md)
  - WEB text: repo-pinned VPL snapshot, /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt,
    book code 2KI, 719 verse lines (manifest sha b6f55cc7…, contentSha256 944e3883…, re-admitted
    2026-08-25 in PR #53). Every quote below was verified byte-for-byte against this file.
    Note: this resolves the book doc's Decisions 21 provenance limitation — the doc was verified
    against the then-drifted current edition (sha b6f55cc7…), and the repo has since re-pinned to
    exactly that content, so the doc's quotes and this ledger's quotes share one text identity.
- **CORPUS-BLOCKED-UNTIL-EXPANSION (global):** 2 Kings has ZERO fixture verses in the current CI
  corpus (fixture Kings selections are 1 Kings 16, 18, 19 only). EVERY engine-facing candidate in
  this ledger — every anchor extension, every lexicon row whose evidence is a 2 Kings text, and
  every fixture that would assert a 2 Kings ref — is CORPUS-BLOCKED-UNTIL-EXPANSION and rides
  PR-β (the full-corpus expansion, owned by another thread, blocked on Jesse's ruling packet).
  Nothing here is buildable now; building would assert absent verses. Display-tag deltas (ADD/
  KEEP/DROP) are display-layer only and are not corpus-gated.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification after every append,
  final survival audit — CONVENTIONS §9 protocol applies to this file. Written ONLY by the 2 Kings
  sweep worker; no other shared file is edited by this thread.
- Rulings honored (not re-litigated): §11 both-tags; grief tags on 2 Kings 4 KEPT and annotated
  (CONVENTIONS §11(4) — settled, honored below); §1 contested calls per Jesse's 2026-08-25
  rulings; the book doc's own Decisions record (its considered-and-dropped calls are prior art).
- Legend — each chapter entry carries these sections, in order:
  1. "## 2 Kings <chapter>" heading (with "(subdivided: <ranges>)" per the book doc's Sections)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with word-for-word in-chapter WEB quote + verse refs)
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight — all
     CORPUS-BLOCKED-UNTIL-EXPANSION, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings — engine measurement
     CORPUS-BLOCKED-UNTIL-EXPANSION where the serving anchor is a 2 Kings text, or "None.")
  6. New-concept candidates (or "None.")
  7. Decline-overturn proposals (only with NEW textual evidence, citing the original decline,
     or "None.")
  8. Ceiling / refinement flags (soft cap 6 / hard ceiling 8 / book-doc subdivision → per-verse
     refinement markers, or "none")
  9. Decisions record (every §11.6 yield and every delegated call — no silent drops, or "None.")

## 2 Kings 1
Existing tags (book doc): `divine-judgment`, `occult-and-divination`, `angels`
### Applied-tag deltas
- KEEP `divine-judgment` — fire answers the arrest parties: "Then fire came down from the sky, and consumed him and his fifty." (1:10, again 1:12), and the sentence lands exactly as spoken: "You will not come down from the bed where you have gone up, but you will surely die." (1:4; fulfilled 1:17).
- KEEP `occult-and-divination` — the indicted errand is consulting a rival oracle: "Is it because there is no God in Israel that you go to inquire of Baal Zebub, the god of Ekron?" (1:3; repeated 1:6, 16).
- KEEP `angels` — "the LORD’s angel" directs the whole confrontation: "But the LORD’s angel said to Elijah the Tishbite, “Arise, go up to meet the messengers of the king of Samaria" (1:3), and "Go down with him. Don’t be afraid of him." (1:15).
- No ADD — no further concept in the 239-id library or the adopted list clears the honest-substantial-presence bar. `no-other-god` was weighed on the thrice-repeated "Is it because there is no God in Israel" rhetoric (1:3, 6, 16) and declined: the chapter indicts practical atheism in the act of divination (carried by `occult-and-divination`); the pack's monotheism-apologetics register ("no god besides me") is not this chapter's substance.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- occult-and-divination | 1:2-4 | "Go, inquire of Baal Zebub, the god of Ekron, whether I will recover from this sickness." (1:2) with the indictment "Is it because there is no God in Israel that you go to inquire of Baal Zebub, the god of Ekron?" (1:3) | w0.7 — the pack's OT anchors (Deut 18, Lev 19, 1 Sam 28) lack a consulting-a-rival-oracle narrative; this is the seek-another-oracle register searchers ask about.
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- occult-and-divination | baal zebub | realistic query phrasings: "who is Baal Zebub", "Beelzebub in the Old Testament", "the god of Ekron". Caveat for curation: NT "Beelzebul" queries (prince-of-demons dispute, Matt 12/Mark 3/Luke 11) are adjacent and partly owned by the corpus-blocked `blasphemy-against-the-spirit` territory (roster row 11); scope the term to the 2 Kings 1 register or leave to full-corpus lexical retrieval.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (chapter kept whole in the book doc — Decisions 20)
### Decisions record
- None.

## 2 Kings 2 (subdivided: 2:1–14; 2:15–18; 2:19–25)
Existing tags (book doc): `divine-judgment`, `leadership`
### Applied-tag deltas
- KEEP `divine-judgment` — the Bethel mockers: "cursed them in the LORD’s name" and "two female bears came out of the woods and mauled forty-two of those youths" (2:23-24); reported without further comment, per the book doc's Decisions 4 (that call stands).
- KEEP `leadership` — succession sought, granted, and recognized: "Please let a double portion of your spirit be on me." (2:9); the mantle taken up (2:13-14); "The spirit of Elijah rests on Elisha." (2:15).
- ADD `signs-and-wonders` — the succession is sealed by miracle after miracle: the struck Jordan parts twice ("they were divided here and there", 2:8; "Where is the LORD, the God of Elijah?", 2:14), and Jericho's spring is healed at the LORD's word: "I have healed these waters. There shall not be from there any more death or barren wasteland." (2:21-22). The pack's substance — God's power displayed in mighty works — is the chapter's own mechanism, not a passing touch. (Pack anchors are Acts/John only; see anchor extension.)
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- leadership | 2:9-15 | "Please let a double portion of your spirit be on me." (2:9) | w0.6 — the pack's succession/mentoring register (2 Tim 2:2 already anchored) has no OT succession narrative; this is Scripture's fullest mantle-passing scene.
- signs-and-wonders | 2:19-22 | "I have healed these waters. There shall not be from there any more death or barren wasteland." (2:21) | w0.5 — an OT miracle-of-mercy anchor for a pack whose anchors are all NT.
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- leadership | passing the mantle | realistic query phrasings: "passing the mantle in the bible", "Elijah passes his mantle to Elisha", "double portion of your spirit" (motif #11 of the book doc flagged this family; "passing the torch" phrasings currently have no lexicon home anywhere — verified against the 239-pack inventory).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (2:1–14; 2:15–18; 2:19–25) — marked for per-verse refinement
### Decisions record
- Delegated-default note on the ADD: `signs-and-wonders` on a judgment-and-succession chapter is the sweep's call under the both-tags ruling; if the miracle register is judged too thin beside chs. 4–6, this is the first 2 Kings 2 tag to drop (the other two stand on their own).

## 2 Kings 3
Existing tags (book doc): `guidance`, `gods-provision`
### Applied-tag deltas
- KEEP `guidance` — the campaign turns on seeking the LORD's word: "Isn’t there a prophet of the LORD here, that we may inquire of the LORD by him?" (3:11), answered with exact instructions (3:16-19).
- KEEP `gods-provision` — "that valley will be filled with water, and you will drink" (3:17); "This is an easy thing in the LORD’s sight." (3:18); "the country was filled with water" (3:20).
- No ADD. `trust-in-god` stays off per the book doc's Decisions 24 (would double-count the inquiry act); `signs-and-wonders` was weighed and declined as broad-duplicating-specific — the water miracle IS the `gods-provision` justification, and the chapter has no second wonder.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- guidance | 3:11-19 | "Isn’t there a prophet of the LORD here, that we may inquire of the LORD by him?" (3:11) | w0.5 — an inquire-of-the-LORD narrative anchor; the pack's anchors are all didactic/poetic.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None. (3:27's unresolved "There was great wrath against Israel" stays unadjudicated per the book doc's Decisions 5.)
### Ceiling / refinement flags
- none (chapter kept whole — Decisions 20; single Berean heading)
### Decisions record
- None.

## 2 Kings 4 (subdivided: 4:1–7; 4:8–17; 4:18–37; 4:38–44)
Existing tags (book doc): `gods-provision`, `hospitality`, `pastoral-pregnancy-and-child-loss`, `waiting-for-a-child`, `prayer`
### Applied-tag deltas
- KEEP `gods-provision` — oil to pay the debt and live ("Go, sell the oil, and pay your debt; and you and your sons live on the rest.", 4:7) and bread for a hundred with leftovers: "They will eat, and will have some left over." (4:43-44).
- KEEP `hospitality` — the Shunammite's standing welcome: "Let’s set a bed, a table, a chair, and a lamp stand for him there." (4:10, with 4:8-9).
- KEEP `pastoral-pregnancy-and-child-loss` — the promised son dies on his mother's knees ("he sat on her knees until noon, and then died", 4:20) and her anguish is honored: "Leave her alone, for her soul is troubled within her" (4:27); "Did I ask you for a son, my lord?" (4:28). RULING HONORED: kept per Jesse's 2026-08-25 delegation and CONVENTIONS §11(4) — settled, not re-litigated here.
- KEEP `waiting-for-a-child` — the ache named before the promise: "Most certainly she has no son, and her husband is old." (4:14), answered: "At this season next year, you will embrace a son." (4:16-17). Same §11(4) settlement honored.
- KEEP `prayer` — behind the shut door: "He went in therefore, and shut the door on them both, and prayed to the LORD." (4:33).
- ADD `care-for-widows` — the opening narrative is a destitute widow rescued: "Your servant my husband is dead. You know that your servant feared the LORD. Now the creditor has come to take for himself my two children to be slaves." (4:1), and provision is made for her and her sons (4:2-7). The pack's substance (God's care for the widow, Ruth 1 / Ps 146:9 register) is depicted at full narrative scale, distinct from the generic-provision tag.
- ADD `signs-and-wonders` — four distinct miracles in one chapter: the multiplied oil (4:1-7), the raising ("Then the child sneezed seven times, and the child opened his eyes.", 4:35), the healed pot ("there is death in the pot!", 4:40-41), and the multiplied loaves "according to the LORD’s word" (4:44). "Miracles of Elisha" searchers land here first; substantial, chapter-defining presence.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- care-for-widows | 4:1-7 | "Your servant my husband is dead. You know that your servant feared the LORD. Now the creditor has come to take for himself my two children to be slaves." (4:1) | w0.75
- waiting-for-a-child | 4:14-17 | "At this season next year, you will embrace a son." (4:16) | w0.7 — the pack's OT barrenness anchors (Hannah, Sarah, Rebekah, Rachel) would gain the Shunammite; note her hope-put-away register ("do not lie to your servant", 4:16), per the book doc's Decisions 3.
- gods-provision | 4:42-44 | "They will eat, and will have some left over." (4:43) | w0.65 — the OT feeding-multiplication text that prefigures the pack's Matt 6 register at narrative scale.
- pastoral-pregnancy-and-child-loss | 4:18-37 | "he sat on her knees until noon, and then died" (4:20) | w0.35 LOW, WITH CAUTION — the chapter ends in the child restored, which a bereaved searcher may find painful ("why not my child?"); the pack already weights 2 Sam 12:22-23 at w0.5 for exactly this register care. Offered to curation with the caution attached; this is an anchor-weight question only — the display tag itself is settled KEPT (§11(4)).
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- care-for-widows | the widows oil | realistic query phrasings: "the widow's oil", "Elisha and the widow's oil", "the widow's oil story"
- signs-and-wonders | miracles of elisha | realistic query phrasings: "miracles of Elisha", "what miracles did Elisha perform", "Elijah and Elisha miracles" (no lexicon anywhere in the 239 packs carries Elisha; verified against the inventory)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 7 tags after adds — soft cap 6 exceeded (within hard ceiling 8; every tag independently clears the bar; main themes first: gods-provision, signs-and-wonders, care-for-widows carry the chapter's four narratives, the remaining four are §11-settled or section-specific); book doc subdivides (4 sections) — marked for per-verse refinement (each of the four narratives is a natural per-section anchor unit)
### Decisions record
- Soft-cap exceedance is deliberate, not an over-cap yield situation: candidate count never exceeded 8, so no §11.6 yield was forced; recorded so the refinement pass knows the order — if trimming to 6 is later required, `prayer` (single-verse, 4:33, inside the raising narrative carried by signs-and-wonders) yields first as thin single-verse, then `waiting-for-a-child` as the §11.6 broad-vs-specific overlap with the pregnancy-loss tag — BUT both are Jesse-settled KEPT tags (§11(4) / Decisions 3), so any actual drop needs Jesse's word, not a sweep call.

## 2 Kings 5 (subdivided: 5:1–14; 5:15–27)
Existing tags (book doc): `obedience-to-the-word`, `sharing-your-faith`, `humble-exaltation`, `honesty`
### Applied-tag deltas
- KEEP `obedience-to-the-word` — the cure hangs on doing the word: "Go and wash in the Jordan seven times, and your flesh shall come again to you, and you shall be clean." (5:10), done "according to the saying of the man of God" (5:14).
- KEEP `sharing-your-faith` — the captive girl's witness ("I wish that my lord were with the prophet who is in Samaria!", 5:3) ends in a foreign commander's confession (5:15). Book doc Decisions 8's borderline-kept call honored.
- KEEP `humble-exaltation` — the great man's expectation must die first: "Behold, I thought, ‘He will surely come out to me, and stand, and call on the name of the LORD his God" (5:11), before "his flesh was restored like the flesh of a little child" (5:14).
- KEEP `honesty` — Gehazi's lie to his master's face: "Your servant went nowhere." (5:25), answered in-chapter (5:26-27), per the Decisions 7 precedent.
- ADD `no-other-god` — the narrative's stated climax is an exclusive-God confession: "See now, I know that there is no God in all the earth, but in Israel." (5:15), enacted in Naaman's vow: "your servant will from now on offer neither burnt offering nor sacrifice to other gods, but to the LORD" (5:17). Not a passing touch — the whole arc terminates here (Elisha's stated purpose: "he shall know that there is a prophet in Israel", 5:8).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- no-other-god | 5:15-17 | "See now, I know that there is no God in all the earth, but in Israel." (5:15) | w0.7 — a Gentile-confession narrative anchor; the pack's anchors are all declarative texts.
- obedience-to-the-word | 5:10-14 | "How much rather then, when he says to you, ‘Wash, and be clean’?" (5:13) | w0.6
- humble-exaltation | 5:9-14 | "Behold, I thought, ‘He will surely come out to me" (5:11) | w0.55 — the humbling-before-blessing arc in narrative.
- pastoral-prayer-for-healing | 5:10-14 | "Go and wash in the Jordan seven times, and your flesh shall come again to you, and you shall be clean." (5:10) | w0.5 — the book doc's motif #12 flagged Naaman for this pack's anchor review: a cleansing granted through humble obedience, useful precisely because it resists formula. Offered to curation with that framing; NOT tagged (no prayer in the episode; the display tag would misstate the chapter's mechanism, which `obedience-to-the-word` carries).
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- pastoral-prayer-for-healing | naaman | realistic query phrasings: "Naaman healed of leprosy", "Naaman and Elisha", "wash in the Jordan seven times". Curation caveat: bare "Naaman" is a story-lookup that full-corpus lexical retrieval will already serve once 2 Kings 5 is in corpus — expect NO MEASURABLE EFFECT on the bare name; the value, if any, is the phrase rows routing to the healing register. Measure before minting.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 5 tags after add (within soft cap); book doc subdivides (5:1–14; 5:15–27) — marked for per-verse refinement
### Decisions record
- None.
## 2 Kings 6 (subdivided: 6:1–7; 6:8–23; 6:24–33)
Existing tags (book doc): `gods-protection`, `prayer`, `fear-not`, `loving-others`, `angels`
### Applied-tag deltas
- KEEP `gods-protection` — the unseen army around one man: "Don’t be afraid, for those who are with us are more than those who are with them." (6:16), and "behold, the mountain was full of horses and chariots of fire around Elisha" (6:17).
- KEEP `prayer` — three prayers answered as spoken: "LORD, please open his eyes, that he may see." (6:17); "Please strike this people with blindness." (6:18); "LORD, open these men’s eyes, that they may see." (6:20).
- KEEP `fear-not` — "Don’t be afraid" spoken into visible surrounding danger (6:15-16).
- KEEP `loving-others` — captured enemies fed, not killed: "Set bread and water before them, that they may eat and drink, then go to their master." (6:22), and the raids stop (6:23).
- KEEP `angels` — the unveiled host: "the mountain was full of horses and chariots of fire around Elisha" (6:17), in the text's own words only.
- ADD `signs-and-wonders` — the LORD's power stooping to an ordinary loss: "He cut down a stick, threw it in there, and made the iron float." (6:5-7) — a distinct miracle narrative (the floating ax head) not carried by any existing tag, plus the blindness-and-sight wonder (6:18-20). Chapter-scale miracle presence, honest under the both-tags ruling.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- gods-protection | 6:15-17 | "Don’t be afraid, for those who are with us are more than those who are with them." (6:16) | w0.85 — a famous protection text; the pack's anchors are Psalms/Isaiah only.
- angels | 6:17 | "behold, the mountain was full of horses and chariots of fire around Elisha" | w0.75 — the angel-armies register ("angel armies" searchers) has no anchor in the pack.
- fear-not | 6:16 | "Don’t be afraid, for those who are with us are more than those who are with them." | w0.6
- loving-others | 6:21-23 | "Set bread and water before them, that they may eat and drink, then go to their master." (6:22) | w0.5 — narrative counterpart to the pack's love-your-enemies anchors (Matt 5:44); offered to curation.
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- angels | chariots of fire | realistic query phrasings: "chariots of fire in the bible", "horses and chariots of fire", "angel armies" (verified: no pack lexicon carries any of these)
- gods-protection | more with us than with them | realistic query phrasings: "those who are with us are more than those who are with them", "more are with us than against us", "open his eyes that he may see"
### New-concept candidates
- None. (The siege famine and cannibalism report (6:26-30) is deliberately NOT a candidate, per the book doc's motif #14 — horror the text records, not a theme a searcher should land on; restated here so the refinement pass doesn't reopen it.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 6 tags after add — soft cap 6 reached exactly (every tag independently clears the bar); book doc subdivides (6:1–7; 6:8–23; 6:24–33) — marked for per-verse refinement
### Decisions record
- At the cap: the next honest candidate did not exist (nothing further clears the bar), so no §11.6 yield occurred. For the refinement pass: `signs-and-wonders` sits on 6:1-7 + 6:18-20; `gods-protection`/`angels`/`fear-not`/`prayer` on 6:8-23; the famine section 6:24-33 carries no tag by design (Decisions 10 of the book doc).

## 2 Kings 7
Existing tags (book doc): `gods-provision`, `gods-faithfulness`
### Applied-tag deltas
- KEEP `gods-provision` — famine to plenty overnight, priced in advance: "Tomorrow about this time a seah of fine flour will be sold for a shekel, and two seahs of barley for a shekel, in the gate of Samaria." (7:1), fulfilled: "So a seah of fine flour was sold for a shekel, and two measures of barley for a shekel, according to the LORD’s word." (7:16).
- KEEP `gods-faithfulness` — the chapter's engine is the word kept: "according to the LORD’s word" (7:16), with fulfillment and the scoffer's end replayed verse by verse (7:17-20).
- No ADD. `doubt` on the scoffing captain ("if the LORD made windows in heaven, could this thing be?", 7:2) stays off per the book doc's Decisions 1 — the pack serves the pastoral honest-questions register, and the chapter depicts contemptuous unbelief judged (the Genesis-3 rule); honored, not re-litigated. `sharing-your-faith` on "Today is a day of good news, and we keep silent." (7:9) stays off per Decisions 11 — in-chapter the news is plunder and survival, not faith; the same reasoning keeps a "day of good news" lexicon row OFF `sharing-your-faith` (an evangelistic read-in the chapter does not carry).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- gods-provision | 7:1-2, 16 | "Tomorrow about this time a seah of fine flour will be sold for a shekel" (7:1) | w0.5 — a provision-against-all-odds narrative anchor.
- gods-faithfulness | 7:16-20 | "So a seah of fine flour was sold for a shekel, and two measures of barley for a shekel, according to the LORD’s word." (7:16) | w0.5 — the word-fulfilled register (see the lexicon row below; the pack's lexicon has no "his word came to pass" phrasing anywhere — the book doc's motif #1 flagged exactly this).
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- gods-faithfulness | gods word never fails | realistic query phrasings: "God's word never fails", "does God keep his word", "fulfilled prophecy in the Bible" — the book doc's motif #1 (the word-of-the-LORD-fulfilled refrain: 1:17; 7:16-18; 9:25-26, 36-37; 10:10; 15:12; 23:16; 24:2, 13) is the anchor evidence; Brooks' book conclusion names this as 2 Kings' theme.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (chapter kept whole — Decisions 20, one prophecy-to-fulfillment arc)
### Decisions record
- None.

## 2 Kings 8 (subdivided: 8:1–6; 8:7–15; 8:16–29)
Existing tags (book doc): `providence`, `gods-faithfulness`
### Applied-tag deltas
- KEEP `providence` — the perfectly timed petition: "behold, the woman whose son he had restored to life begged the king for her house and for her land" at the very moment her story is told (8:5-6), inside an arc the LORD set moving ("the LORD has called for a famine", 8:1). Book doc Decisions 12's framing honored.
- KEEP `gods-faithfulness` — Judah survives on nothing but the promise: "However, the LORD would not destroy Judah, for David his servant’s sake, as he promised him to give to him a lamp for his children always." (8:19).
- No ADD. `davidic-covenant` on 8:19 stays skipped per the book doc's Decisions 29 (same-verse restatement of the `gods-faithfulness` justification; the concept's book witness lives on chs. 19–20); honored. `restoration` on the Shunammite's land stays off per Decisions 24 (property and politics, not the renewal-prayer register). Hazael's regicide (8:10-15) carries no tag per Decisions 13.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- providence | 8:1-6 | "As he was telling the king how he had restored to life him who was dead, behold, the woman whose son he had restored to life begged the king for her house and for her land." (8:5) | w0.6 — narrated-timing providence; the pack's narrative anchors are Genesis/Esther only.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (8:1–6; 8:7–15; 8:16–29) — marked for per-verse refinement
### Decisions record
- ROUTED to backlog: `davidic-covenant` (corpus-blocked roster row 44) — 8:19 ("a lamp for his children always") belongs to that row's Kings stress-text set; recorded as a candidate anchor for the row's re-pin curator, not duplicated as a proposal here.

## 2 Kings 9 (subdivided: 9:1–13; 9:14–29; 9:30–37)
Existing tags (book doc): `divine-judgment`
### Applied-tag deltas
- KEEP `divine-judgment` — the anointing carries the sentence: "You must strike your master Ahab’s house, that I may avenge the blood of my servants the prophets, and the blood of all the servants of the LORD, at the hand of Jezebel." (9:7), and each death lands on words spoken long before: "‘and I will repay you in this plot of ground,’ says the LORD" (9:25-26); "The dogs will eat the flesh of Jezebel on the plot of Jezreel" (9:36-37). (Only one honest tag from the current vocabulary — re-confirmed against the full 239-id library.)
- No ADD. Weighed and declined: `vengeance` — 9:7 is the LORD's own avenging, not the pack's leave-vengeance-to-God teaching register (tagging would blur the register; see anchor note below); `leadership` on the anointing scene — commissioning to judgment, not the pack's servant-leadership substance; `justice-and-oppression` — the blood of Naboth is avenged wrong, but the in-chapter substance is judgment executed, already carried.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- divine-judgment | 9:25-26, 30-37 | "‘and I will repay you in this plot of ground,’ says the LORD" (9:26) | w0.5 — prophecy-executed narrative anchor.
- vengeance | 9:7 | "that I may avenge the blood of my servants the prophets" | w0.4 LOW, WITH CAVEAT — the pack teaches the vengeance-is-the-LORD's principle (Rom 12/Deut 32); 9:7+9:26 ("I will repay") is that principle enacted by God himself. Offered to curation only; NOT tagged (the display register would read as endorsing human revenge, which the chapter does not teach).
### Lexicon candidates
- None. (Bare "Jezebel" story-lookups will be served by full-corpus lexical retrieval once 2 Kings enters the corpus; no lexicon row is warranted — noted so the curation pass doesn't mint one.)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (9:1–13; 9:14–29; 9:30–37) — marked for per-verse refinement
### Decisions record
- None.

## 2 Kings 10 (subdivided: 10:1–17; 10:18–27; 10:28–36)
Existing tags (book doc): `divine-judgment`
### Applied-tag deltas
- KEEP `divine-judgment` — "Know now that nothing will fall to the earth of the LORD’s word, which the LORD spoke concerning Ahab’s house." (10:10); Ahab's house ends "according to the LORD’s word which he spoke to Elijah" (10:17); the LORD's commendation of the executed sentence (10:30) stands beside Jehu's unchanged heart (10:29, 31), both reported per the book doc's Decisions 6. (Only one honest tag from the current vocabulary — re-confirmed against the full 239-id library.)
- No ADD. Weighed and declined: `obedience-to-the-word` — 10:30's commendation is real, but the chapter's counterweight is its refusal ("But Jehu took no heed to walk in the law of the LORD, the God of Israel, with all his heart.", 10:31) — a both-things chapter whose teaching substance is neither obedience nor its failure alone; `honesty` on the ruse stays off per Decisions 7 (the deception is instrumental to the commended purge and never evaluated in-chapter); `empty-worship` — Jehu's Baal-festival pretense is a trap, not the pack's hypocritical-worship register.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- gods-faithfulness | 10:10 | "Know now that nothing will fall to the earth of the LORD’s word, which the LORD spoke concerning Ahab’s house." | w0.5 — the word-fulfilled register (pairs with the ch. 7 lexicon row; motif #1).
### Lexicon candidates
- None new (the ch. 7 `gods-faithfulness` row covers this chapter's evidence).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (10:1–17; 10:18–27; 10:28–36) — marked for per-verse refinement
### Decisions record
- ROUTED to backlog: `zeal-for-god` (corpus-blocked roster row 36) — "Come with me, and see my zeal for the LORD." (10:16) is direct zeal vocabulary in narrative, and Jehu's violent, half-hearted zeal (10:16 beside 10:29-31) is precisely the vigilante-violence gist CAUTION that row already carries for its re-pin curator. Ref routed to row 36; no fresh candidate minted.
## 2 Kings 11 (subdivided: 11:1–3; 11:4–16; 11:17–21)
Existing tags (book doc): `covenant`, `worship`, `revival-and-reformation`
### Applied-tag deltas
- KEEP `covenant` — the coup's spine is covenant-making: "he made a covenant with them, and made a covenant with them in the LORD’s house, and showed them the king’s son" (11:4); the covenant given at the crowning (11:12); and the summit: "Jehoiada made a covenant between the LORD and the king and the people, that they should be the LORD’s people" (11:17).
- KEEP `worship` — the heir "hidden in the LORD’s house" (11:3) and false worship demolished: "All the people of the land went to the house of Baal, and broke it down." (11:18), with officers appointed over the LORD's house (11:18).
- KEEP `revival-and-reformation` — the book's reform pattern in miniature: covenant renewed (11:17) and Baal's house torn down, its priest killed (11:18).
- No ADD. `gods-protection` on Joash's preservation stays off per the book doc's Decisions 24 (in-chapter it is Jehosheba's and the temple's work, never God-attributed); `leadership` on Jehoiada was weighed and declined — the priest's orchestration is real, but the chapter's teaching substance is the covenant restoration, not a leadership model (the book's mentor-leadership witness lives on chs. 2 and 12).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- covenant | 11:17 | "Jehoiada made a covenant between the LORD and the king and the people, that they should be the LORD’s people" | w0.6 — a people-renewal covenant anchor; the pack's narrative anchors are Genesis/Exodus cutting scenes.
- revival-and-reformation | 11:17-18 | "All the people of the land went to the house of Baal, and broke it down." (11:18) | w0.5 — the pack anchors 2 Kings 23:1-3 already; this is the same pattern's first instance.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (11:1–3; 11:4–16; 11:17–21) — marked for per-verse refinement
### Decisions record
- None.

## 2 Kings 12 (subdivided: 12:1–16; 12:17–21)
Existing tags (book doc): `honesty`, `generosity`, `leadership`
### Applied-tag deltas
- KEEP `honesty` — trust without audit, stated twice: "Moreover they didn’t demand an accounting from the men into whose hand they delivered the money to give to those who did the work; for they dealt faithfully." (12:15) — the book's rare positive honesty depiction (Decisions 7 precedent).
- KEEP `generosity` — the repairs run on what people freely bring: "all the money that it comes into any man’s heart to bring into the LORD’s house" (12:4), filling the chest again and again (12:9-10).
- KEEP `leadership` — a king formed by a mentor: "Jehoash did that which was right in the LORD’s eyes all his days in which Jehoiada the priest instructed him." (12:2).
- ADD `the-house-of-god` — the chapter's whole project is the LORD's house itself: money "brought into the LORD’s house" (12:4), "they shall repair the damage to the house, wherever any damage is found" (12:5), workmen "who had the oversight of the LORD’s house" (12:11), and its treasures stripped to buy off Hazael (12:18). The pack's temple register ("the house of the lord", "the temple in the bible") is the chapter's substance, not its setting — distinct from `worship` (which stays off per the book doc's Decisions 24: temple maintenance is not worship's substance; that reasoning bars `worship`, not the temple-as-subject concept).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- honesty | 12:15 | "Moreover they didn’t demand an accounting from the men into whose hand they delivered the money to give to those who did the work; for they dealt faithfully." | w0.6 — a positive trustworthiness narrative; the pack's anchors are all exhortation texts.
- the-house-of-god | 12:4-15 | "they shall repair the damage to the house, wherever any damage is found" (12:5) | w0.5
- generosity | 12:4, 9-10 | "all the money that it comes into any man’s heart to bring into the LORD’s house" (12:4) | w0.5 — freewill-giving narrative anchor.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 4 tags after add (within soft cap); book doc subdivides (12:1–16; 12:17–21) — marked for per-verse refinement
### Decisions record
- Delegated-default note on the ADD: `the-house-of-god` rests on the sweep's reading that Decisions 24's worship-drop reasoning does not extend to the temple-register concept (which did not exist in the 131-id vocabulary the doc was tagged against). Reversible; if judged over-fine, the chapter keeps its three prior tags.

## 2 Kings 13 (subdivided: 13:1–13; 13:14–25)
Existing tags (book doc): `prayer`, `gods-faithfulness`, `covenant`
### Applied-tag deltas
- KEEP `prayer` — an evil king's plea heard: "Jehoahaz begged the LORD, and the LORD listened to him; for he saw the oppression of Israel" (13:4-5).
- KEEP `gods-faithfulness` — unearned mercy grounded in old promises: "But the LORD was gracious to them, and had compassion on them, and favored them because of his covenant with Abraham, Isaac, and Jacob" (13:23).
- KEEP `covenant` — the same verse makes the covenant the stated reason Israel is not destroyed or cast out "as yet" (13:23).
- ADD `mercy` — the chapter names God's compassion as the acting cause twice: "the LORD listened to him; for he saw the oppression of Israel" (13:4) and "the LORD was gracious to them, and had compassion on them" (13:23) — the pack's God's-mercy-and-compassion register depicted at national scale, distinct from the promise-keeping substance carried by `gods-faithfulness` (both-tags ruling; each clears independently).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- mercy | 13:22-23 | "But the LORD was gracious to them, and had compassion on them, and favored them because of his covenant with Abraham, Isaac, and Jacob" (13:23) | w0.6
- prayer | 13:4-5 | "Jehoahaz begged the LORD, and the LORD listened to him" (13:4) | w0.55 — a heard-prayer narrative from an undeserving petitioner.
### Lexicon candidates
- None.
### New-concept candidates
- None. Weighed and declined: `signs-and-wonders` on the revival at Elisha's bones ("As soon as the man touched Elisha’s bones, he revived, and stood up on his feet.", 13:21) — thin single-verse presence; recorded as an anchor thought for the refinement pass, not a tag (the book doc's Decisions 26 no-relic-theology framing stands).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 4 tags after add (within soft cap); book doc subdivides (13:1–13; 13:14–25) — marked for per-verse refinement
### Decisions record
- ROUTED to backlog: `deliverance` (corpus-blocked roster row 32) — "The LORD gave Israel a savior, so that they went out from under the hand of the Syrians" (13:5) is that row's rescue-narrative register exactly (the row's refs are 1 Sam/2 Sam/Judg/1 Kgs; 13:5 is a candidate anchor for its re-pin curator). Ref routed; no duplicate proposal.

## 2 Kings 14 (subdivided: 14:1–22; 14:23–29)
Existing tags (book doc): `humble-exaltation`, `obedience-to-the-word`, `gods-faithfulness`
### Applied-tag deltas
- KEEP `humble-exaltation` — the lifted heart brought down: "You have indeed struck Edom, and your heart has lifted you up. Enjoy the glory of it, and stay at home; for why should you meddle to your harm, that you fall, even you, and Judah with you?" (14:10), and the fall follows (14:11-14).
- KEEP `obedience-to-the-word` — mercy constrained by the written word: the assassins' children spared "according to that which is written in the book of the law of Moses" (14:6).
- KEEP `gods-faithfulness` — "The LORD didn’t say that he would blot out the name of Israel from under the sky; but he saved them by the hand of Jeroboam the son of Joash." (14:27, with 14:25-26).
- ADD `individual-responsibility` — the pack's own law text is quoted verbatim and enacted in-chapter: "The fathers shall not be put to death for the children, nor the children be put to death for the fathers; but every man shall die for his own sin." (14:6) — Deut 24:16, already the pack's anchor, applied in narrative. The teaching substance (each answers for his own sin, no generational punishment) is present word-for-word.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- individual-responsibility | 14:5-6 | "but the children of the murderers he didn’t put to death, according to that which is written in the book of the law of Moses" (14:6) | w0.75 — the canonical narrative enactment of the pack's Deut 24:16 anchor.
- humble-exaltation | 14:8-14 | "You have indeed struck Edom, and your heart has lifted you up." (14:10) | w0.55 — the pride-before-fall narrative edge (Genesis 11 precedent per the book doc's Decisions 9).
- gods-faithfulness | 14:26-27 | "For the LORD saw the affliction of Israel, that it was very bitter for all" (14:26) | w0.5
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 4 tags after add (within soft cap); book doc subdivides (14:1–22; 14:23–29) — marked for per-verse refinement
### Decisions record
- `mercy` on 14:26-27 was weighed under the both-tags ruling and DECLINED — the compassion substance ("the LORD saw the affliction of Israel") is the same verse-set already justifying `gods-faithfulness`, and the book doc's Decisions 24 precedent (ch. 3: adding a second tag on one act double-counts) applies; the ch. 13 `mercy` ADD carries the register for the book. Recorded so the decline is not silent.

## 2 Kings 15
Existing tags (book doc): `divine-judgment`, `gods-faithfulness`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `divine-judgment` — "The LORD struck the king, so that he was a leper to the day of his death" (15:5).
- KEEP `gods-faithfulness` — the promise to Jehu kept to the generation: "Your sons to the fourth generation shall sit on the throne of Israel." — "So it came to pass." (15:12).
- KEEP `justice-and-oppression` — national-scale violence and extraction: "he ripped up all their women who were with child" (15:16), and "Menahem exacted the money from Israel, even from all the mighty men of wealth" (15:19-20).
- No ADD — nothing further in the 239-id library clears the bar on this king-list chapter.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- gods-faithfulness | 15:12 | "This was the LORD’s word which he spoke to Jehu, saying, “Your sons to the fourth generation shall sit on the throne of Israel.” So it came to pass." | w0.5 — the word-fulfilled register again (motif #1).
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (chapter kept whole — Decisions 20: one accelerating spiral of conspiracies)
### Decisions record
- ROUTED to backlog: `exile-and-captivity` (corpus-blocked roster row 45) — the FIRST deportation is this chapter's: "Tiglath Pileser king of Assyria came and took Ijon" and "he carried them captive to Assyria" (both 15:29, verified against the pinned VPL). The book doc's Decisions 29 skipped the ch. 15 display tag on two grounds — no verifiable anchor quote AND thin single-verse presence. New information recorded: the anchor is NOW verifiable against the re-pinned VPL (this ledger verifies it), but the thin-single-verse ground stands on its own, so the skip is honored and the tag is NOT added; 15:29 is routed to row 45 as deportation-spine evidence for the eventual concept (whichever way Jesse's fold-vs-separate call goes). This is a routing note, not a decline-overturn.
## 2 Kings 16
Existing tags (book doc): `sin`, `idolatry`
### Applied-tag deltas
- KEEP `sin` — one portrait of covenant unfaithfulness: Ahaz "even made his son to pass through the fire, according to the abominations of the nations" (16:3-4), and the LORD's own altar displaced by a pagan copy (16:10-18).
- KEEP `idolatry` — the substance itemized: child sacrifice and worship "in the high places, on the hills, and under every green tree" (16:3-4); the Damascus altar imported and "The bronze altar, which was before the LORD, he brought from the front of the house" (16:14, with 16:10-16).
- No ADD. `trusting-in-man` was weighed for Ahaz's Assyria appeal — "I am your servant and your son. Come up and save me out of the hand of the king of Syria" (16:7) with the temple treasures as the price (16:8) — and DECLINED as a tag: the chapter depicts the misplaced reliance but never teaches or evaluates it in-chapter (the reliance even *succeeds* politically, 16:9); under the honest-presence bar this is depiction without the concept's teaching substance (Genesis-3 rule). Offered instead as an anchor extension below, where curated framing can carry the register.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- trusting-in-man | 16:7-9 | "I am your servant and your son. Come up and save me out of the hand of the king of Syria" (16:7) | w0.55, WITH CAVEAT — classic exposition text for reliance-on-powers instead of the LORD (the pack's Isa 31:1 / Ezek 29:6-7 register in narrative); the caveat is that the narrative itself does not editorialize, so the gist must not overclaim.
- idolatry | 16:3-4 | "even made his son to pass through the fire, according to the abominations of the nations" (16:3) | w0.6
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (chapter kept whole — Decisions 20: a single portrait of Ahaz's unfaithfulness)
### Decisions record
- None.

## 2 Kings 17 (subdivided: 17:1–4; 17:5–23; 17:24–41)
Existing tags (book doc): `sin`, `divine-judgment`, `covenant`, `idolatry`, `exile-and-captivity`, `fear-of-the-lord`
### Applied-tag deltas
- KEEP `sin` — the book's fullest indictment: "It was so because the children of Israel had sinned against the LORD their God" (17:7), itemized across 17:7-17.
- KEEP `divine-judgment` — the stated consequence: "Therefore the LORD was very angry with Israel, and removed them out of his sight. There was none left but the tribe of Judah only." (17:18, with 17:20, 23).
- KEEP `covenant` — breach AND terms both present: "They rejected his statutes and his covenant that he made with their fathers" (17:15), and the covenant's own charge restated verbatim: "You shall not fear other gods" (17:35, 37-38) — the book doc's Decisions 14 reasoning re-confirmed against the Genesis-3 rule.
- KEEP `idolatry` — the indictment's substance (high places, pillars and Asherah poles, the calves, "worshiped all the army of the sky, and served Baal", 17:16, across 17:9-17) living on in resettled Samaria: "They feared the LORD, and also served their own gods" (17:33, 41).
- KEEP `exile-and-captivity` (adopted display id, engine-built: no) — deportation as a theological event with the narrator's why: "So Israel was carried away out of their own land to Assyria to this day." (17:23, with 17:6).
- KEEP `fear-of-the-lord` — the resettlement narrative turns the phrase over a dozen times: a priest teaches "how they should fear the LORD" (17:28), and the charge stands: "But you shall fear the LORD your God, and he will deliver you out of the hand of all your enemies." (17:39, with 17:35-36).
- ADD `hardness-of-heart` — the pivot of the whole explanation: warned by every prophet and every seer ("Turn from your evil ways", 17:13), "Notwithstanding, they would not listen, but hardened their neck like the neck of their fathers who didn’t believe in the LORD their God." (17:14), and the resettled peoples repeat it: "However they didn’t listen, but they did what they did before." (17:40). The pack's register includes depicted hardening (its Exodus 7 Pharaoh anchors), so the failure-depiction objection does not bar it; the hardening is the chapter's stated causal hinge, not a passing touch. (`repentance` remains correctly absent per the book doc's Decisions 14 — the call is present but refused; this ADD tags the refusal-concept, which is exactly what the chapter teaches.)
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- hardness-of-heart | 17:13-14 | "Notwithstanding, they would not listen, but hardened their neck like the neck of their fathers who didn’t believe in the LORD their God." (17:14) | w0.65 — the stiff-necked national register; the pack has no Kings anchor.
- idolatry | 17:29-33 | "They feared the LORD, and also served their own gods" (17:33) | w0.7 — the syncretism text; serves the can-you-serve-God-and-something-else query family (see lexicon row).
- divine-judgment | 17:18-23 | "Therefore the LORD was very angry with Israel, and removed them out of his sight." (17:18) | w0.6
- fear-of-the-lord | 17:36-39 | "But you shall fear the LORD your God, and he will deliver you out of the hand of all your enemies." (17:39) | w0.55
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- idolatry | serving god and other gods | realistic query phrasings: "can you serve God and other gods", "mixing religions in the bible", "syncretism in the bible" — anchored by 17:33/41; the book doc's motif #4 flagged exactly this family. Curation caveat: keep clear of Matt 6:24's serving-two-masters territory (owned by `contentment`'s lexicon via money register).
### New-concept candidates
- None.
### Decline-overturn proposals
- None. (The book doc's Decisions 29 skip of `occult-and-divination` here — 17:17 is a single list item inside the sin catalog — is honored; the divination clause stays inside the `sin`/`idolatry` justifications.)
### Ceiling / refinement flags
- 7 tags after add — soft cap 6 exceeded (within hard ceiling 8; every tag independently clears; main themes first: sin, divine-judgment, exile-and-captivity are the chapter's spine); book doc subdivides (17:1–4; 17:5–23; 17:24–41) — marked for per-verse refinement
### Decisions record
- ROUTED to backlog: `exile-and-captivity` (corpus-blocked roster row 45) — 17:6, 22-23 are the row's deportation-spine texts; the display tag above uses the adopted id per §11.1, while the ENGINE-side disposition (fold into `sojourners-and-strangers` vs separate id) remains Jesse's call per the roster — nothing prejudged here, refs routed only.
- Soft-cap exceedance recorded (no §11.6 yield forced — candidates never exceeded 8). For the refinement pass, the yield order if ever trimmed to 6: `fear-of-the-lord` (section-specific to 17:24-41) then `hardness-of-heart` (single-hinge presence) — recorded for transparency, no drop made.

## 2 Kings 18 (subdivided: 18:1–12; 18:13–16; 18:17–37)
Existing tags (book doc): `trust-in-god`, `obedience-to-the-word`, `presence-of-god`, `revival-and-reformation`
### Applied-tag deltas
- KEEP `trust-in-god` — named as Hezekiah's defining mark: "He trusted in the LORD, the God of Israel, so that after him was no one like him among all the kings of Judah" (18:5), then besieged in speech: "What confidence is this in which you trust?" (18:19); "Don’t let Hezekiah make you trust in the LORD" (18:30).
- KEEP `obedience-to-the-word` — "He didn’t depart from following him, but kept his commandments, which the LORD commanded Moses." (18:6), practiced in the reform (18:4).
- KEEP `presence-of-god` — the stated secret: "The LORD was with him. Wherever he went, he prospered." (18:7).
- KEEP `revival-and-reformation` — Judah's first great reform: "He removed the high places, broke the pillars, and cut down the Asherah." (18:4), Nehushtan included.
- No ADD. `trusting-in-man` was weighed on the bruised-reed taunt (18:21, 24) and declined as a tag — the anti-Egypt trust-teaching is voiced entirely inside Rabshakeh's hostile speech, which the book doc's Decisions 15 rightly carries as the speaker's claims, not narrative teaching; offered as an anchor extension below with that caveat explicit.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- trust-in-god | 18:5-7 | "He trusted in the LORD, the God of Israel, so that after him was no one like him among all the kings of Judah" (18:5) | w0.8 — Scripture's flagship trusted-in-the-LORD narrative commendation; the pack has no narrative anchor.
- trusting-in-man | 18:21 | "you trust in the staff of this bruised reed, even in Egypt. If a man leans on it, it will go into his hand and pierce it." | w0.6, WITH CAVEAT — sibling text to the pack's Ezek 29:6-7 anchor (the same bruised-reed-Egypt image; Isaiah 36:6 is the parallel); the words are Rabshakeh's, so the gist must frame it as the taunt the narrative reports.
- revival-and-reformation | 18:3-6 | "He removed the high places, broke the pillars, and cut down the Asherah." (18:4) | w0.6 — Hezekiah's reform beside the pack's existing Josiah anchor (2 Kings 23:1-3).
- presence-of-god | 18:7 | "The LORD was with him. Wherever he went, he prospered." | w0.5 — the God-with-him narrative formula; offered to curation (prosperity-gospel guardrail: the gist must record presence, not technique — DOCTRINAL-BASIS exclusion noted).
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- trusting-in-man | trusting in egypt | realistic query phrasings: "trusting in Egypt instead of God", "Egypt a broken reed", "relying on the wrong things". COLLISION WARNING for curation: do NOT add bare "bruised reed" — that phrase's famous devotional home is Isa 42:3 (a bruised reed he will not break — the servant's gentleness, `servant-of-the-lord` territory), the OPPOSITE intent; a bare-phrase row would hijack comfort-seeking queries. Scope to the Egypt-trust phrasings only.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (18:1–12; 18:13–16; 18:17–37) — marked for per-verse refinement
### Decisions record
- None.

## 2 Kings 19 (subdivided: 19:1–7; 19:8–19; 19:20–34; 19:35–37)
Existing tags (book doc): `prayer`, `gods-protection`, `divine-judgment`, `fear-not`, `angels`, `davidic-covenant`, `remnant`
### Applied-tag deltas
- KEEP `prayer` — the letter spread out and prayed over: "Hezekiah went up to the LORD’s house, and spread it before the LORD." (19:14), the prayer of 19:15-19, and the direct answer: "You have prayed to me against Sennacherib king of Assyria, and I have heard you." (19:20).
- KEEP `gods-protection` — "For I will defend this city to save it, for my own sake and for my servant David’s sake." (19:34), kept that same night (19:35).
- KEEP `divine-judgment` — blasphemy answered: "Whom have you defied and blasphemed?" — "Against the Holy One of Israel!" (19:22); "therefore I will put my hook in your nose, and my bridle in your lips" (19:28); the camp struck (19:35) and Sennacherib dead by the sword in his own land as first spoken (19:7, 37).
- KEEP `fear-not` — the LORD's first word to the terrified king: "Don’t be afraid of the words that you have heard" (19:6).
- KEEP `angels` — "That night, the LORD’s angel went out and struck one hundred eighty-five thousand in the camp of the Assyrians." (19:35).
- KEEP `davidic-covenant` (adopted display id, engine-built: no) — the promise as the city's stated defense: "for my own sake and for my servant David’s sake" (19:34).
- KEEP `remnant` — the theme's vocabulary in narrative crisis: "lift up your prayer for the remnant that is left" (19:4), and "For out of Jerusalem a remnant will go out, and out of Mount Zion those who shall escape. The LORD’s zeal will perform this." (19:31, with 19:30).
- ADD `no-other-god` — the prayer's core argument and the rescue's stated purpose: "you are the God, even you alone, of all the kingdoms of the earth" (19:15); the nations' gods "were no gods, but the work of men’s hands" (19:18); "save us, I beg you, out of his hand, that all the kingdoms of the earth may know that you, LORD, are God alone." (19:19). Substantial, argument-bearing presence — the chapter's theology turns on it.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- prayer | 19:14-19 | "Hezekiah went up to the LORD’s house, and spread it before the LORD." (19:14) | w0.7 — the spread-the-letter prayer narrative (see lexicon row).
- no-other-god | 19:15, 19 | "you are the God, even you alone, of all the kingdoms of the earth" (19:15) | w0.75
- gods-protection | 19:32-35 | "For I will defend this city to save it, for my own sake and for my servant David’s sake." (19:34) | w0.7
- remnant | 19:30-31 | "For out of Jerusalem a remnant will go out, and out of Mount Zion those who shall escape. The LORD’s zeal will perform this." (19:31) | w0.7 — the pack's remnant anchors lack this narrative-crisis text.
- angels | 19:35 | "That night, the LORD’s angel went out and struck one hundred eighty-five thousand in the camp of the Assyrians." | w0.65
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- prayer | spread it before the lord | realistic query phrasings: "spread the letter before the Lord", "Hezekiah's prayer", "bring your problems to God like Hezekiah's letter"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 8 tags after add — HARD CEILING 8 reached (every tag independently clears the bar; main themes first: prayer, gods-protection, divine-judgment, no-other-god carry the chapter's arc); book doc subdivides (4 sections) — marked for per-verse refinement (priority candidate: the ceiling plus four sections make this the book's densest chapter)
### Decisions record
- At the ceiling, one further candidate was weighed and YIELDED per §11.6 (recorded, not silent): `idolatry` on 19:18's "work of men’s hands" — yielded as broad-duplicating-specific (the idols-are-nothing substance is the `no-other-god` argument itself, inside the prayer; it has no independent chapter presence). No existing tag was dropped.
- ROUTED to backlog: `davidic-covenant` (corpus-blocked roster row 44) — 19:34 is a stress-text for that row; display tag stands on the adopted id, engine refs routed only.

## 2 Kings 20 (subdivided: 20:1–11; 20:12–21)
Existing tags (book doc): `pastoral-prayer-for-healing`, `prayer`, `davidic-covenant`
### Applied-tag deltas
- KEEP `pastoral-prayer-for-healing` — a dying man's prayer and tears, answered: "I have heard your prayer. I have seen your tears. Behold, I will heal you." (20:5, with 20:2-3, 7) — heard as this one king's story, not a formula (the book doc's Decisions 2(b) register guard stands).
- KEEP `prayer` — "Then he turned his face to the wall, and prayed to the LORD" (20:2), answered "Before Isaiah had gone out into the middle part of the city" (20:4-5).
- KEEP `davidic-covenant` (adopted display id, engine-built: no) — healing and defense grounded in the promise: "I will defend this city for my own sake, and for my servant David’s sake." (20:6).
- ADD `signs-and-wonders` — the sign is asked for, offered, and given in the text's own vocabulary: "What will be the sign that the LORD will heal me, and that I will go up to the LORD’s house the third day?" (20:8); "This will be the sign to you from the LORD" (20:9); "he brought the shadow ten steps backward" (20:11). A sign-attestation narrative — the pack's substance, not a passing mention.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- pastoral-prayer-for-healing | 20:1-7 | "I have heard your prayer. I have seen your tears. Behold, I will heal you." (20:5) | w0.65 — with the pack's no-guarantee register guard carried into the gist (one king's story).
- prayer | 20:2-5 | "Then he turned his face to the wall, and prayed to the LORD" (20:2) | w0.55
- signs-and-wonders | 20:8-11 | "This will be the sign to you from the LORD, that the LORD will do the thing that he has spoken" (20:9) | w0.55
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None. (Decisions 16's no-verdict handling of 20:19 stands; `humble-exaltation` is not read back from the Chronicles parallel — cross-book, barred.)
### Ceiling / refinement flags
- 4 tags after add (within soft cap); book doc subdivides (20:1–11; 20:12–21) — marked for per-verse refinement
### Decisions record
- ROUTED to backlog: `davidic-covenant` (corpus-blocked roster row 44) — 20:6 routed as with 19:34.
- ROUTED to backlog: `god-relents` (corpus-blocked roster row 7) — NEW in-book evidence recorded for that row's re-pin curator: 20:1-6 is a pronounced sentence reversed upon prayer ("Set your house in order; for you will die, and not live.", 20:1, reversed by "I have heard your prayer." and "Behold, I will heal you.", both 20:5). This is the row's conditional-word register in narrative; the row's recorded gist cares (conditional prophecy; keep separate from immutability) ride unchanged. Routed, not minted, and NOT proposed as a display tag (the concept is not in the engine or adopted vocabularies).
## 2 Kings 21 (subdivided: 21:1–18; 21:19–26)
Existing tags (book doc): `sin`, `divine-judgment`, `idolatry`, `occult-and-divination`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `sin` — the reign that out-sins the displaced nations: "Manasseh seduced them to do that which is evil more than the nations did whom the LORD destroyed before the children of Israel." (21:9, with 21:2, 11), plus the innocent blood (21:16).
- KEEP `divine-judgment` — the sentence through "his servants the prophets" (21:10): "Behold, I will bring such evil on Jerusalem and Judah that whoever hears of it, both his ears will tingle." (21:12); "I will wipe Jerusalem as a man wipes a dish, wiping it and turning it upside down" (21:13).
- KEEP `idolatry` — the reversal itemized: "he built again the high places which Hezekiah his father had destroyed; and he raised up altars for Baal, and made an Asherah" (21:3), "He built altars in the LORD’s house, of which the LORD said, “I will put my name in Jerusalem.”" (21:4-5), and the engraved Asherah image in the temple itself (21:7).
- KEEP `occult-and-divination` — royal sponsorship at its worst: "practiced sorcery, used enchantments, and dealt with those who had familiar spirits and with wizards" (21:6).
- KEEP `justice-and-oppression` — beyond the idolatry: "Moreover Manasseh shed innocent blood very much, until he had filled Jerusalem from one end to another" (21:16).
- No ADD — nothing further clears the bar (the five together already carry the chapter's whole substance).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- occult-and-divination | 21:6 | "practiced sorcery, used enchantments, and dealt with those who had familiar spirits and with wizards" | w0.7 — the royal-sponsorship register; pairs with the pack's Deut 18 prohibition anchor as command-and-violation.
- idolatry | 21:3-7 | "He built altars in the LORD’s house, of which the LORD said, “I will put my name in Jerusalem.”" (21:4) | w0.65
- justice-and-oppression | 21:16 | "Moreover Manasseh shed innocent blood very much, until he had filled Jerusalem from one end to another" | w0.6 — innocent-blood national-guilt register (motif #10; see lexicon row).
- divine-judgment | 21:12-13 | "I will wipe Jerusalem as a man wipes a dish, wiping it and turning it upside down" (21:13) | w0.6
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- justice-and-oppression | innocent blood | realistic query phrasings: "innocent blood in the bible", "does God judge nations for bloodshed", "national sin in the bible" — anchored by 21:16 with 24:3-4; the book doc's motif #10 named this family and the project ruling routes it here, never to pastoral-* tags.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (21:1–18; 21:19–26) — marked for per-verse refinement
### Decisions record
- None.

## 2 Kings 22 (subdivided: 22:1–7; 22:8–13; 22:14–20)
Existing tags (book doc): `repentance`, `studying-the-word`, `humble-exaltation`, `revival-and-reformation`
### Applied-tag deltas
- KEEP `repentance` — the king's whole response to the word: "When the king had heard the words of the book of the law, he tore his clothes." (22:11), "and have torn your clothes and wept before me, I also have heard you" (22:19).
- KEEP `studying-the-word` — "I have found the book of the law in the LORD’s house." (22:8): read, read again before the king (22:10), and made the standard for inquiry and action (22:13). The book doc's Decisions 17 register-loosest flag carried forward unchanged.
- KEEP `humble-exaltation` — Huldah's oracle grounds the answer in the humbled heart: "because your heart was tender, and you humbled yourself before the LORD" (22:19).
- KEEP `revival-and-reformation` — the reform's ignition: the found book (22:8) and "great is the LORD’s wrath that is kindled against us, because our fathers have not listened to the words of this book" (22:13), setting chapter 23's national turning in motion.
- No ADD. `the-house-of-god` was weighed (the repairs, 22:3-7) and declined — here the temple is the setting where the book is found, not the chapter's substance (contrast ch. 12, where the house itself is the project); `receiving-correction` was weighed for the torn-clothes response and declined — the pack's register is receiving human criticism (Proverbs open-rebuke texts), and Josiah's response to the word is already carried by `repentance`/`humble-exaltation`.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- repentance | 22:11, 18-19 | "because your heart was tender, and you humbled yourself before the LORD" (22:19) | w0.65 — response-to-the-word repentance narrative.
- studying-the-word | 22:8-13 | "I have found the book of the law in the LORD’s house." (22:8) | w0.55 — with the register caveat (narrative of recovery, not practice-instruction) carried into the gist.
- revival-and-reformation | 22:8-20 | "great is the LORD’s wrath that is kindled against us, because our fathers have not listened to the words of this book" (22:13) | w0.55 — the discovery stage of the pack's existing Josiah anchor (2 Kings 23:1-3).
### Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- revival-and-reformation | the book of the law found | realistic query phrasings: "Josiah finds the book of the law", "the lost book of the law", "Hilkiah found the book"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (22:1–7; 22:8–13; 22:14–20) — marked for per-verse refinement
### Decisions record
- None.

## 2 Kings 23 (subdivided: 23:1–3; 23:4–20; 23:21–27; 23:28–30; 23:31–37)
Existing tags (book doc): `covenant`, `obedience-to-the-word`, `worship`, `divine-judgment`, `revival-and-reformation`, `idolatry`, `passover`
### Applied-tag deltas
- KEEP `covenant` — the public covenant at the pillar: "The king stood by the pillar and made a covenant before the LORD to walk after the LORD and to keep his commandments, his testimonies, and his statutes with all his heart and all his soul" — "and all the people agreed to the covenant." (23:3, with 23:2, 21).
- KEEP `obedience-to-the-word` — purge and Passover execute the book point by point: "that he might confirm the words of the law which were written in the book" (23:24), by the king who turned "according to all the law of Moses" (23:25).
- KEEP `worship` — false worship dismantled shrine by shrine (23:4-20) and true worship restored at center: "Keep the Passover to the LORD your God, as it is written in this book of the covenant." (23:21).
- KEEP `divine-judgment` — the wrath reform does not cancel: "Notwithstanding, the LORD didn’t turn from the fierceness of his great wrath" (23:26); "I will also remove Judah out of my sight, as I have removed Israel" (23:27).
- KEEP `revival-and-reformation` — Scripture's fullest reform narrative (23:1-25); the engine pack itself anchors 2 Kings 23:1-3 (the library's ONLY 2 Kings anchor — noted for the record).
- KEEP `idolatry` — the purge names its objects shrine by shrine (23:4-20), the teraphim and idols swept away (23:24).
- KEEP `passover` — "Keep the Passover to the LORD your God, as it is written in this book of the covenant." (23:21), kept as none had been "from the days of the judges who judged Israel" (23:22-23).
- No ADD. `loving-god` was weighed on 23:25 ("turned to the LORD with all his heart, and with all his soul, and with all his might" — the Shema formula in the royal epitaph) and declined as a display tag: single-verse evaluation formula, and the chapter is already at 7 tags; the whole-heart vocabulary question is routed (below) per the roster's recorded design resolution rather than tagged.
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- revival-and-reformation | extend the pack's existing 2 Kings 23:1-3 anchor to 23:1-25, or add 23:21-25 | "There was no king like him before him, who turned to the LORD with all his heart, and with all his soul, and with all his might" (23:25) | w0.65 — the full reform arc (covenant → purge → Passover → epitaph), not just the covenant scene.
- passover | 23:21-23 | "Keep the Passover to the LORD your God, as it is written in this book of the covenant." (23:21) | w0.6 — the pack's only historical-books witness would be the greatest kept Passover.
- covenant | 23:1-3 | "and all the people agreed to the covenant" (23:3) | w0.6
### Lexicon candidates
- None new (ch. 22's "the book of the law found" row serves this arc).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- 7 tags — soft cap 6 exceeded (within hard ceiling 8; every tag independently clears; the book doc's Decisions 29 already recorded the §11 accounting for this chapter); book doc subdivides (5 sections) — marked for per-verse refinement (priority candidate: 5 sections, 7 tags)
### Decisions record
- ROUTED to backlog: `wholehearted-devotion` (corpus-blocked roster row 18) — 23:3 ("with all his heart and all his soul") and 23:25 ("with all his heart, and with all his soul, and with all his might") are exactly that row's whole-heart texts; the row is DESIGN-RESOLVED (batch 5) to land as lexicon extensions of `loving-god` + `seeking-god`, not a third id — 23:3, 25 are routed to row 18 as the strongest narrative candidates for that extension when it unblocks. No tag, no duplicate proposal (and the `loving-god` decline above defers to this same routing).
## 2 Kings 24
Existing tags (book doc): `divine-judgment`, `exile-and-captivity`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `divine-judgment` — the hand behind Babylon's named twice: "Surely at the commandment of the LORD this came on Judah, to remove them out of his sight for the sins of Manasseh" (24:3), "For through the anger of the LORD, this happened in Jerusalem and Judah, until he had cast them out from his presence." (24:20).
- KEEP `exile-and-captivity` (adopted display id, engine-built: no) — the first Jerusalem deportation: "He carried away all Jerusalem, and all the princes, and all the mighty men of valor, even ten thousand captives, and all the craftsmen and the smiths. No one remained except the poorest people of the land." (24:14, with 24:15-16).
- KEEP `justice-and-oppression` — the stated, unpardoned ground: "and also for the innocent blood that he shed; for he filled Jerusalem with innocent blood, and the LORD would not pardon" (24:4).
- No ADD. `the-lords-discipline` stays off per the book doc's Decisions 24 (Hebrews-12 father-child register; national chastening is register-mismatched); `gods-faithfulness` on 24:13's "as the LORD had said" was weighed and declined — word-fulfillment in judgment is already the `divine-judgment` justification here (broad-duplicating-specific).
### Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION)
- divine-judgment | 24:2-4, 20 | "Surely at the commandment of the LORD this came on Judah, to remove them out of his sight for the sins of Manasseh" (24:3) | w0.6 — the narrator's own theology of the fall.
- justice-and-oppression | 24:4 | "and also for the innocent blood that he shed; for he filled Jerusalem with innocent blood, and the LORD would not pardon" | w0.55 — pairs with 21:16 (the ch. 21 lexicon row's second anchor).
### Lexicon candidates
- None new (the ch. 21 "innocent blood" row lists 24:3-4 as its second witness).
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (chapter kept whole — Decisions 20: one tightening-grip movement)
### Decisions record
- ROUTED to backlog: `exile-and-captivity` (corpus-blocked roster row 45) — 24:14-16 routed as deportation-spine evidence, same terms as ch. 17's routing (fold-vs-separate stays Jesse's call).

## 2 Kings 25 (subdivided: 25:1–7; 25:8–21; 25:22–26; 25:27–30)
Existing tags (book doc): `exile-and-captivity`
### Applied-tag deltas
- KEEP `exile-and-captivity` (adopted display id, engine-built: no) — the deportation completed in the chapter's own words: "Nebuzaradan the captain of the guard carried away captive the rest of the people who were left in the city" (25:11), and "So Judah was carried away captive out of his land." (25:21). The chapter's pre-§11 honest-and-empty state and its reasoning (Decisions 19: the chapter names the LORD only in constructs; the judgment frame is tagged on ch. 24) stand exactly as the book doc's 2026-08-25 note preserved them; this concept requires no divine-actor claim.
- No ADD — re-judged against all 239 ids: nothing else clears the bar. Specifically re-weighed and declined: `divine-judgment` (Decisions 19's in-chapter-justification bar holds — the alternative it names remains Jesse's to prefer); `hope-in-god` on the Jehoiachin ending (25:27-30 — kindness narrated, God unnamed; Decisions 19/24); `davidic-covenant` display tag (David and the promise are unnamed in-chapter — Decisions 29's skip honored); `sojourners-and-strangers` (the exiles' life abroad is not depicted beyond the table scenes; and the exile-routing question is Jesse's, not tagged around).
### Anchor-extension candidates
- None proposed from this chapter (its engine-facing material is wholly the routed exile/davidic registers below).
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides (25:1–7; 25:8–21; 25:22–26; 25:27–30) — marked for per-verse refinement; single-tag chapter (only one honest tag from the current vocabulary — the adopted exile id)
### Decisions record
- ROUTED to backlog: `exile-and-captivity` (corpus-blocked roster row 45) — 25:11, 21 routed (with 15:29; 17:6, 22-23; 24:14-16 this completes the book's deportation spine for the row).
- ROUTED to backlog: `davidic-covenant` (corpus-blocked roster row 44) — 25:27-30 (Jehoiachin released: "released Jehoiachin king of Judah out of prison", 25:27; "Jehoiachin ate bread before him continually all the days of his life", 25:29) recorded for that row's curator as the book-doc-noted consensus-hope text (the surviving lamp of David) — with the book doc's caution repeated: David is unnamed in-chapter, so any anchor gist must not overclaim. Routed, not tagged (Decisions 19/29 honored).

---

# Book-level summary blocks (for the orchestrator and the curation pass)

## Corpus-blocked roster routings (route, don't duplicate — consolidated)
| roster row | id | 2 Kings refs routed | note |
|---|---|---|---|
| 45 | exile-and-captivity | 15:29; 17:6, 22-23; 24:14-16; 25:11, 21 | deportation spine; fold-vs-separate remains Jesse's call — nothing prejudged |
| 44 | davidic-covenant | 8:19; 19:34; 20:6; 25:27-30 | display tags stand on chs. 19-20 (adopted id); engine refs routed |
| 18 | wholehearted-devotion | 23:3, 25 | rides the recorded loving-god + seeking-god lexicon-extension design |
| 36 | zeal-for-god | 10:16 | Jehu's zeal is the row's vigilante-violence caution made narrative |
| 32 | deliverance | 13:5 | "The LORD gave Israel a savior" — the row's rescue register |
| 7 | god-relents | 20:1-6 | pronounced sentence reversed on prayer; row's gist cares ride unchanged |

## Sweep totals (2 Kings, 25/25 chapters)
- Applied-tag deltas: **84 KEEP, 11 ADD, 0 DROP** (adds: ch2 `signs-and-wonders`; ch4 `care-for-widows`, `signs-and-wonders`; ch5 `no-other-god`; ch6 `signs-and-wonders`; ch12 `the-house-of-god`; ch13 `mercy`; ch14 `individual-responsibility`; ch17 `hardness-of-heart`; ch19 `no-other-god`; ch20 `signs-and-wonders`). Every add and keep carries a word-for-word in-chapter WEB quote verified byte-for-byte against the pinned VPL.
- Anchor-extension candidates: **63** (all CORPUS-BLOCKED-UNTIL-EXPANSION).
- Lexicon candidates: **13** rows (all engine measurement CORPUS-BLOCKED-UNTIL-EXPANSION where anchored to 2 Kings texts).
- New-concept candidates: **0** — every genuine 2 Kings theme is either in the 239-id library, the adopted list, or an existing corpus-blocked roster row (routed above); honest-and-empty preferred over inventing.
- Decline-overturn proposals: **0** — no recorded decline was found wrong on new textual evidence; all prior-art declines and the §1 rulings (including the 2 Kings 4 grief-tags KEPT settlement) honored as written.
- Ceiling-hit chapters: **ch. 19 (8 tags — hard ceiling)**. Soft-cap-6-exceeded: chs. 4 and 17 (7 tags each after adds), ch. 23 (7, pre-existing). One §11.6 yield recorded (ch. 19, `idolatry`, broad-duplicating-specific) — no silent drops.
- Per-verse refinement candidates (ceiling-hit OR book-doc-subdivided): chs. 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22, 23, 25 (19 chapters; priority: 19, then 23, then 4/17). Kept-whole, no flags: chs. 1, 3, 7, 15, 16, 24.

---

# Final survival audit (CONVENTIONS §9) — 2026-08-26, 2 Kings sweep worker

Run after the last content append, against the live file at
/mnt/project-files/research/bible-rollout/sweep/2-kings-sweep-ledger.md:

1. **Whole-file integrity:** the live ledger byte-compares EQUAL to the concatenation of this
   thread's five verified append chunks — every earlier contribution survives and no pre-existing
   byte was altered by any append (each append was also individually verified at write time:
   prior-bytes cmp + appended-block cmp, all clean).
2. **Block completeness:** all 25 chapter blocks present exactly once (`## 2 Kings 1` … `## 2 Kings 25`),
   each carrying the full 9-section legend; header, roster-routing table, and sweep-totals blocks present.
3. **Delta ledger mechanical count:** 84 KEEP / 11 ADD / 0 DROP lines — matches the totals block.
4. **Quote re-verification (final):** a fresh `2KI` extraction was taken from the pinned VPL
   (/home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt; byte-identical to the
   extraction used during drafting) and every double-quoted span in the live ledger was
   substring-checked against it: 305 spans, 254 matched byte-for-byte; the 51 non-matching spans
   were individually adjudicated and are ALL declared non-Scripture material — the legend's own
   placeholders and "None." literals, realistic query phrasings on lexicon/new-concept rows,
   pack-lexicon term citations (e.g. the `no-other-god` and `the-house-of-god` lexicon phrases),
   and this ledger's self-quotes of book-doc cautions. No span presented as WEB text failed
   verification. (Note: per the coordinator's shared-scratchpad warning, all verification temp
   files were re-created under 2-kings-prefixed names and the entire live ledger was re-verified
   against a fresh pinned-VPL extraction after the warning — no reliance on any generic-named
   temp file remains in this audit.)
5. **Vocabulary audit:** every tag id on ADD/KEEP lines resolves exactly against the 239 engine
   basenames, except `exile-and-captivity` and `davidic-covenant`, which resolve against the
   canonical §11.1 adopted list (/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md,
   both marked engine-built: no) — as declared in the header. No id invented, no prefix stripped.
6. **Scope audit:** this thread wrote ONLY this ledger file. No book doc, no tag-gaps.md row, no
   repo file, and no other thread's ledger was touched (the sweep's tag-gap findings all resolved
   to existing rows/roster routings, so no tag-gaps.md append was warranted).

**AUDIT RESULT: PASS** — all blocks present, prior bytes unchanged, every WEB-claimed quote
verified byte-for-byte against the pinned VPL.
