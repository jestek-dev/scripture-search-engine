# Exodus sweep ledger — Layer-3 tag sweep (Torah thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: Exodus (40 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/exodus.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/corpus-blocked-roster.md
  - WEB chapter text (verse-numbered, from the pinned-source full-Bible fixture, sourceSha256
    b6f55cc7…, commit 87fd68c): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/web-text/exodus/<chapter>.txt
  - Worker instructions (entry format + verbatim rules): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/sweep-worker-instructions.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Exodus <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")


## Exodus 1
Existing tags (book doc): `providence`, `pleasing-god-not-people`, `justice-and-oppression`
### Applied-tag deltas
- ADD fear-of-the-lord — WEB quote: "But the midwives feared God, and didn't do what the king of Egypt commanded them, but saved the baby boys alive." (1:17); "Because the midwives feared God, he gave them families." (1:21) — the fear of God is the chapter's twice-named motive for the midwives' conduct and is rewarded by God; distinct register from pleasing-god-not-people (reverence toward God vs freedom from fear of man), both genuinely apply per the §11.2 both-tags ruling
- KEEP providence — "the more they afflicted them, the more they multiplied and the more they spread out" (1:12); "God dealt well with the midwives, and the people multiplied" (1:20) — every scheme quietly overturned; quotes verified word-for-word
- KEEP pleasing-god-not-people — "the midwives feared God, and didn't do what the king of Egypt commanded them" (1:17) — verified; the fear-of-man-vs-God register is the chapter's hinge
- KEEP justice-and-oppression — "they made their lives bitter with hard service in mortar and in brick" (1:14) — national enslavement is the chapter's substance (1:11–14)
### Anchor-extension candidates
- governing-authorities | 1:15–21 | "But the midwives feared God, and didn't do what the king of Egypt commanded them" (1:17) | medium — the pack's lexicon already carries "obey god rather than men" and "civil disobedience in the bible" but its anchors are all NT; this is the canonical OT case
- fear-of-the-lord | 1:17, 1:21 | "Because the midwives feared God, he gave them families." (1:21) | low-medium — the pack has no narrative anchor of the fear of God motivating and rewarded
### Lexicon candidates
None.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines recorded for transparency (not yields): `honesty` stays withheld per book-doc Decisions #17 — no new textual evidence, the midwives' false answer (1:19) remains a hard case, not honesty teaching; `blessing` on 1:21 ("he gave them families") — single-verse reward notice, below the bar. Corpus-blocked routing: the midwives' defiance (1:17) is courage-to-do-the-right-thing material — routed to roster row 17 (`courage`, DEFERRED) as a candidate ref for that row's eventual pack, not duplicated here.

## Exodus 2 (subdivided: 2:1–10, 2:11–22, 2:23–25)
Existing tags (book doc): `gods-faithfulness`, `providence`, `justice-and-oppression`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP gods-faithfulness — "God heard their groaning, and God remembered his covenant with Abraham, with Isaac, and with Jacob." (2:24) — verified word-for-word; the hinge of the book
- KEEP providence — the condemned deliverer is drawn out by Pharaoh's own daughter and his mother is paid to nurse him (2:5–10): "Take this child away, and nurse him for me, and I will give you your wages." (2:9)
- KEEP justice-and-oppression — "the children of Israel sighed because of the bondage, and they cried, and their cry came up to God because of the bondage" (2:23)
- KEEP sojourners-and-strangers — "I have lived as a foreigner in a foreign land." (2:22)
(No additions — no further concept clears the honest-substantial-presence bar.)
### Anchor-extension candidates
- god-sees-my-suffering | 2:23–25 | "God heard their groaning... God saw the children of Israel, and God understood." (2:24–25) | medium — the engine pack already anchors Exod 3:7; 2:23–25 is the narrative seam its "does God see me / God hears my cry" lexicon queries want (engine-side only; the display tag stays off per the pastoral-register ruling — national-scale material)
### Lexicon candidates
- gods-faithfulness | god remembered his covenant | realistic query phrasings: "God remembered his covenant", "does God remember his promises"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields. Presence-bar declines (not yields): `adoption-as-gods-children` on 2:10 — Moses' adoption by Pharaoh's daughter is a human-adoption narrative, not the pack's theological-adoption substance (would trade on the word); `hospitality`/`kindness` on 2:6, 2:20 — single-verse touches; `covenant` on 2:24 — single remembrance verse whose substance is carried by gods-faithfulness; `pastoral-god-sees-my-suffering` stays removed per the pastoral-register ruling (assembly Decisions #46 honored; engine-side need served by the anchor-extension candidate above).

## Exodus 3
Existing tags (book doc): `presence-of-god`, `angels`, `justice-and-oppression`, `the-name-of-god`
### Applied-tag deltas
- KEEP presence-of-god — "the place you are standing on is holy ground" (3:5); "Certainly I will be with you." (3:12) — verified
- KEEP angels — "The LORD's angel appeared to him in a flame of fire out of the middle of a bush." (3:2)
- KEEP justice-and-oppression — "I have surely seen the affliction of my people who are in Egypt, and have heard their cry because of their taskmasters" (3:7)
- KEEP the-name-of-god — "I AM WHO I AM" (3:14); "This is my name forever, and this is my memorial to all generations." (3:15)
(No additions from the current vocabulary clear the bar.)
### Anchor-extension candidates
- presence-of-god | 3:4–6 | "Don't come close. Take off your sandals, for the place you are standing on is holy ground." (3:5) | medium — the pack has no OT theophany anchor; holy-ground queries are presence queries
### Lexicon candidates
- the-name-of-god | i am who i am | realistic query phrasings: "I am who I am meaning", "what does I AM mean", "what is God's name" — the pack anchors Exod 3:13–15 but its lexicon does not carry the I-AM formula itself
- presence-of-god | holy ground | realistic query phrasings: "standing on holy ground", "take off your shoes holy ground", "why did Moses take off his sandals"
### New-concept candidates
- calling-and-commission | genuine gap: "God's calling on my life", "feeling unqualified for God's call", "who am I to do this" queries have no honest home — `guidance` is direction-seeking, `pastoral-strength-in-weakness` (display: personal weakness) covers only the inadequacy register, `discipleship` is follow-Jesus (a read-back for OT narrative); not in the declines, not on the corpus-blocked roster | anchors: "God called to him out of the middle of the bush, and said, 'Moses! Moses!'" (3:4); "Come now therefore, and I will send you to Pharaoh" (3:10); "Who am I, that I should go to Pharaoh...?" answered "Certainly I will be with you." (3:11–12). Cross-book strengthening expected from Genesis 12 (Abram) and the prophetic call narratives.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields. Presence-bar declines (not yields): `holiness` on 3:5 — holy ground makes a place holy; the concept is persons called to holiness (same logic as book-doc Decisions #27); `i-am-sayings` — the Johannine register, barred as a later-revelation read-back; `gods-provision` on 3:8 ("a land flowing with milk and honey") — land promise, not provision teaching.

## Exodus 4
Existing tags (book doc): `doubt`, `pastoral-strength-in-weakness`, `worship`
### Applied-tag deltas
- ADD signs-and-wonders — WEB quote: "see that you do before Pharaoh all the wonders which I have put in your hand" (4:21); "This is so that they may believe that the LORD, the God of their fathers, the God of Abraham, the God of Isaac, and the God of Jacob, has appeared to you." (4:5) — the giving of authenticating signs (rod-to-snake, leprous hand, water-to-blood) is the chapter's spine (4:1–9, 17, 21, 28–31), and the pack's lexicon ("signs and wonders", "miracles in the bible") is exactly what these verses serve
- KEEP doubt — "they will not believe me, nor listen to my voice" (4:1); "Oh, Lord, please send someone else." (4:13) — ratified PR #43 use (book-doc Decisions #16, ratified 2026-08-25)
- KEEP pastoral-strength-in-weakness — "I am slow of speech, and of a slow tongue" (4:10) answered "I will be with your mouth, and teach you what you shall speak." (4:12) — Moses' personal inadequacy: genuinely personal register, passes the pastoral-register ruling
- KEEP worship — "then they bowed their heads and worshiped" (4:31)
### Anchor-extension candidates
- signs-and-wonders | 4:1–9, 28–31 | "It will happen, if they will not believe even these two signs or listen to your voice, that you shall take of the water of the river..." (4:9) | medium — the pack's anchors are Acts/John only; this is the OT signs-as-authentication narrative
- adoption-as-gods-children | 4:22–23 | "Israel is my son, my firstborn" (4:22) | low — the pack already anchors Deut 14:1's corporate OT sonship; a corporate-register note would be needed
### Lexicon candidates
None.
### New-concept candidates
None. (The bridegroom-of-blood episode, 4:24–26, is a curiosity passage without search-scale concept substance; noted, not proposed.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `hardness-of-heart` on 4:21 stays skipped per the book doc's own 2026-08-25 tag-pass reasoning (one announcement verse; the theme's substance lives in chs 7–14); `faith` on 4:31 ("The people believed") — single verse.

## Exodus 5
Existing tags (book doc): `prayer`, `justice-and-oppression`, `knowing-god`, `lament`
### Applied-tag deltas
- KEEP prayer — "Moses returned to the LORD, and said, 'Lord, why have you brought trouble on this people? Why is it that you have sent me?'" (5:22) — verified
- KEEP justice-and-oppression — "You shall no longer give the people straw to make brick, as before." (5:7); "your servants are beaten; but the fault is in your own people" (5:16) — oppression sharpened is the chapter's substance
- KEEP knowing-god — "Who is the LORD, that I should listen to his voice to let Israel go? I don't know the LORD, and moreover I will not let Israel go." (5:2) — the refusal that frames the contest
- KEEP lament — "You have not rescued your people at all!" (5:23) — raw complaint addressed to the LORD, the register the lament row documents
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- wrestling-with-god | 5:22–23 | "Lord, why have you brought trouble on this people? Why is it that you have sent me?" (5:22) | medium — the pack anchors Jer 20:7–9 and Hab 1:2–4; Moses' first why-complaint is the same arguing-with-God register
### Lexicon candidates
None.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields. Considered, not added (not a yield): `wrestling-with-god` as a display tag — 5:22–23 already carries prayer + lament; a third id on the same two verses would be broad-duplicating-specific; routed engine-side as the anchor-extension candidate above. Corpus-blocked routing: the "Let my people go" query family (first occurrence 5:1, "Let my people go, that they may hold a feast to me in the wilderness") → roster row 32 (`deliverance`, SKIPPED-blocked) — noted for that row's eventual lexicon, not duplicated here.

## Exodus 6 (subdivided: 6:1–13, 6:14–30)
Existing tags (book doc): `covenant`, `gods-faithfulness`, `justice-and-oppression`, `the-name-of-god`
### Applied-tag deltas
- KEEP covenant — "I have also established my covenant with them, to give them the land of Canaan" (6:4); "I have remembered my covenant." (6:5) — verified
- KEEP gods-faithfulness — "I will bring you into the land which I swore to give to Abraham, to Isaac, and to Jacob" (6:8)
- KEEP justice-and-oppression — "I have heard the groaning of the children of Israel, whom the Egyptians keep in bondage" (6:5)
- KEEP the-name-of-god — "I appeared to Abraham, to Isaac, and to Jacob, as God Almighty; but by my name the LORD I was not known to them." (6:3)
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
None. (The redemption/deliverance material routes to the corpus-blocked roster; see Decisions record.)
### Lexicon candidates
None.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields. Presence-bar declines (not yields): `doubt` on 6:12, 6:30 ("uncircumcised lips") — two objection verses echoing ch 4, where the theme's substance and existing tag live; `knowing-god` on 6:7 stays skipped per the book doc's tag-pass reasoning (one goal-clause inside the promise chain); `hope-in-god`/`do-not-lose-heart` on 6:9 — the verse depicts crushed inability to listen ("for anguish of spirit, and for cruel bondage"), not either concept's teaching substance. Corpus-blocked routings: 6:6 "I will redeem you with an outstretched arm" → roster row 23 (`redeemer`, SKIPPED-blocked) — noted for that row's eventual curator as OT national-redemption vocabulary beside its Job register; 6:6–8 "I will" deliverance chain → roster row 32 (`deliverance`, SKIPPED-blocked).

## Exodus 7
Existing tags (book doc): `divine-judgment`, `obedience-to-the-word`, `hardness-of-heart`, `knowing-god`
### Applied-tag deltas
- ADD signs-and-wonders — WEB quote: "I will harden Pharaoh's heart, and multiply my signs and my wonders in the land of Egypt." (7:3); "When Pharaoh speaks to you, saying, 'Perform a miracle!'" (7:9) — the sign-contest (serpent sign, first wonder-plague) is the chapter's frame, in the pack's own vocabulary
- ADD occult-and-divination — WEB quote: "Then Pharaoh also called for the wise men and the sorcerers. They also, the magicians of Egypt, did the same thing with their enchantments." (7:11); "but Aaron's rod swallowed up their rods" (7:12) — sorcery confronted and outmatched by God's power, the narrative-confrontation register the pack's Acts 13:8–11 anchor already covers; the enchantments recur at 7:22
- KEEP divine-judgment — "so I will lay my hand on Egypt, and bring out my armies, my people the children of Israel, out of the land of Egypt by great judgments" (7:4); the river turned to blood (7:20–21)
- KEEP obedience-to-the-word — "Moses and Aaron did so. As the LORD commanded them, so they did." (7:6) — the refrain recurs at 7:10, 7:20
- KEEP hardness-of-heart — "Pharaoh's heart was hardened, and he didn't listen to them, as the LORD had spoken." (7:13); "he didn't even take this to heart" (7:23)
- KEEP knowing-god — "The Egyptians shall know that I am the LORD when I stretch out my hand on Egypt" (7:5)
### Anchor-extension candidates
- knowing-god | 7:5, 7:17 | "In this you shall know that I am the LORD." (7:17) | medium — the pack has no Exodus purpose-formula anchor although the original tag-gap row recorded these refs for the curator
- occult-and-divination | 7:11–12, 7:22 | "They also, the magicians of Egypt, did the same thing with their enchantments." (7:11) | medium — the pack has no Exodus magicians anchor
### Lexicon candidates
- occult-and-divination | pharaohs magicians | realistic query phrasings: "pharaoh's magicians", "egyptian magicians in the bible", "magicians who copied moses"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- No §11.6 yields — six candidates, each independently clearing the presence bar; soft cap reached, hard ceiling not.

## Exodus 8
Existing tags (book doc): `prayer`, `divine-judgment`, `gods-protection`, `hardness-of-heart`, `knowing-god`
### Applied-tag deltas
- ADD occult-and-divination — WEB quote: "The magicians tried with their enchantments to produce lice, but they couldn't." (8:18); "Then the magicians said to Pharaoh, 'This is God's finger;'" (8:19) — the magician contest begun in ch 7 (and continued at 8:7, frogs duplicated) reaches its surrender here; same register as the ch 7 ADD
- KEEP prayer — "Entreat the LORD, that he take away the frogs" (8:8); "The LORD did according to the word of Moses" (8:13, 8:31) — intercession asked and answered to the letter
- KEEP divine-judgment — "behold, I will plague all your borders with frogs" (8:2); lice from the dust (8:16–17); "grievous swarms of flies" (8:24)
- KEEP gods-protection — "I will set apart in that day the land of Goshen, in which my people dwell" (8:22)
- KEEP hardness-of-heart — "But when Pharaoh saw that there was a respite, he hardened his heart" (8:15); "Pharaoh hardened his heart this time also" (8:32)
- KEEP knowing-god — "that you may know that there is no one like the LORD our God" (8:10); "to the end you may know that I am the LORD on the earth" (8:22)
### Anchor-extension candidates
- gods-protection | 8:22–23 | "I will put a division between my people and your people." (8:23) | medium — the pack's anchors are Psalms/Isaiah promises; the Goshen division is the narrative case its "divine protection" lexicon queries want
### Lexicon candidates
None.
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- No §11.6 yields — six tags, each independently clearing the bar. Considered, not added (not a yield): `signs-and-wonders` on ch 8 — the sign vocabulary here is incidental (8:19 "God's finger", 8:23 "This sign shall happen by tomorrow") and the plague substance is carried by divine-judgment; the signs-as-authentication substance lives in chs 4 and 7, where it is tagged.

## Exodus 9
Existing tags (book doc): `divine-judgment`, `gods-protection`, `hardness-of-heart`, `knowing-god`, `the-name-of-god`
### Applied-tag deltas
- ADD fear-of-the-lord — WEB quote: "Those who feared the LORD's word among the servants of Pharaoh made their servants and their livestock flee into the houses." (9:20); "But as for you and your servants, I know that you don't yet fear the LORD God." (9:30) — fearing the LORD's word, both heeded (9:20) and refused (9:21, 9:30), is a named thread of the chapter, and heeding it is protective
- KEEP divine-judgment — "For this time I will send all my plagues against your heart" (9:14): pestilence (9:6), boils (9:10), unprecedented hail (9:24–25)
- KEEP gods-protection — "nothing shall die of all that belongs to the children of Israel" (9:4); "Only in the land of Goshen, where the children of Israel were, there was no hail." (9:26)
- KEEP hardness-of-heart — both directions verified: "The LORD hardened the heart of Pharaoh" (9:12); "he sinned yet more, and hardened his heart" (9:34)
- KEEP knowing-god — "that you may know that there is no one like me in all the earth" (9:14); "that you may know that the earth is the LORD's" (9:29)
- KEEP the-name-of-god — "but indeed for this cause I have made you stand: to show you my power, and that my name may be declared throughout all the earth" (9:16)
### Anchor-extension candidates
- fear-of-the-lord | 9:20–21, 9:30 | "Those who feared the LORD's word among the servants of Pharaoh made their servants and their livestock flee into the houses." (9:20) | low-medium — the pack has no heeding-the-warning narrative anchor
- gods-protection | 9:4, 9:6–7, 9:26 | "The LORD will make a distinction between the livestock of Israel and the livestock of Egypt" (9:4) | low — with ch 8's Goshen extension, one combined division-of-Goshen extension would serve both chapters
### Lexicon candidates
- repentance | shallow repentance | realistic query phrasings: "fake repentance", "saying sorry without changing", "why did Pharaoh keep changing his mind"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- No §11.6 yields — six tags, each independently clearing the bar. Presence-bar declines (not yields): `repentance` on 9:27 ("I have sinned this time. The LORD is righteous") — the chapter depicts the failure mode, retracted at 9:34–35; tagging would misroute repentance queries (the Gen-3 `resisting-the-devil` worked-example logic); served as the lexicon candidate above instead; `humble-exaltation` on 9:17 ("you still exalt yourself against my people") — single verse; the theme's Exodus home is 10:3, where it is tagged.

## Exodus 10
Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `gods-protection`, `hardness-of-heart`, `knowing-god`
### Applied-tag deltas
- KEEP divine-judgment — locusts: "They shall eat the residue of that which has escaped, which remains to you from the hail" (10:5), "There remained nothing green, either tree or herb of the field, through all the land of Egypt." (10:15); darkness: "even darkness which may be felt" (10:21)
- KEEP humble-exaltation — "How long will you refuse to humble yourself before me?" (10:3) — the question that names the whole contest
- KEEP gods-protection — "but all the children of Israel had light in their dwellings" (10:23)
- KEEP hardness-of-heart — "I have hardened his heart and the heart of his servants" (10:1); "But the LORD hardened Pharaoh's heart" (10:20, 10:27)
- KEEP knowing-god — "that you may know that I am the LORD" (10:2)
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- parenting | 10:1–2 | "that you may tell in the hearing of your son, and of your son's son, what things I have done to Egypt" (10:2) | low — congruent with the pack's Deut 6:6–7 tell-the-next-generation anchor
### Lexicon candidates
- parenting | telling the next generation | realistic query phrasings: "teaching my children about God's works", "telling your children what God has done"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (5 tags). Presence-bar declines (not yields): `repentance` on 10:16–17 ("I have sinned against the LORD your God" — same failure-mode logic as ch 9, hardened again at 10:20); `surrender-to-god` on 10:26 ("Not a hoof shall be left behind" — a bargaining-scene detail, not consecration teaching; stays a book-doc motif); `light-and-darkness` on 10:23 — the pack is the Johannine light-of-the-world register (read-back); the verse is carried by gods-protection.

## Exodus 11
Existing tags (book doc): `divine-judgment`, `gods-protection`
### Applied-tag deltas
- KEEP divine-judgment — "all the firstborn in the land of Egypt shall die, from the firstborn of Pharaoh who sits on his throne" (11:5); "There will be a great cry throughout all the land of Egypt" (11:6) — the final sentence pronounced; verified word-for-word
- KEEP gods-protection — "But against any of the children of Israel a dog won't even bark or move its tongue... that you may know that the LORD makes a distinction between the Egyptians and Israel." (11:7)
(No additions — a 10-verse announcement chapter; nothing further clears the bar.)
### Anchor-extension candidates
None.
### Lexicon candidates
- gods-protection | the lord makes a distinction | realistic query phrasings: "the LORD makes a distinction", "does God treat his people differently" — the book doc's motif line records the same query family
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (2 tags). Presence-bar declines (not yields): `hardness-of-heart` on 11:10 stays skipped per the book doc's own 2026-08-25 tag-pass reasoning (one narrator's refrain verse; the theme's substance lives in chs 7–10 and 14, where it is tagged); `knowing-god` on 11:7 — one purpose-formula verse whose substance is carried by gods-protection; `signs-and-wonders` on 11:9–10 ("that my wonders may be multiplied") — a narrator's frame refrain, not the chapter's substance (same logic as the ch 8 decline); `blessing`/`providence` on 11:3 ("The LORD gave the people favor in the sight of the Egyptians") — single verse.

## Exodus 12 (subdivided: 12:1–28, 12:29–42, 12:43–51)
Existing tags (book doc): `divine-judgment`, `gods-protection`, `worship`, `parenting`, `obedience-to-the-word`, `passover`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP divine-judgment — "I will go through the land of Egypt in that night, and will strike all the firstborn in the land of Egypt, both man and animal. I will execute judgments against all the gods of Egypt." (12:12); "there was not a house where there was not one dead" (12:30) — verified
- KEEP gods-protection — "When I see the blood, I will pass over you, and no plague will be on you to destroy you" (12:13); "will not allow the destroyer to come in to your houses to strike you" (12:23)
- KEEP worship — "You shall keep it as a feast to the LORD" (12:14); "The people bowed their heads and worshiped." (12:27)
- KEEP parenting — "when your children ask you, 'What do you mean by this service?'" (12:26) — the rite built to be explained to the next generation
- KEEP obedience-to-the-word — "as the LORD had commanded Moses and Aaron, so they did" (12:28); "As the LORD commanded Moses and Aaron, so they did." (12:50) — the double frame of the institution
- KEEP passover — "you shall eat it in haste: it is the LORD's Passover" (12:11); "It is the sacrifice of the LORD's Passover, who passed over the houses of the children of Israel in Egypt" (12:27) — the institution itself, the pack's own root anchors (Exod 12:1–14, 21–28)
- KEEP sojourners-and-strangers — "One law shall be to him who is born at home, and to the stranger who lives as a foreigner among you." (12:49)
(No additions — seven tags already exceed the soft cap; nothing further clears the bar without duplicating; see Decisions record.)
### Anchor-extension candidates
- gods-protection | 12:13, 12:21–23 | "When I see the blood, I will pass over you" (12:13) | medium — the pack's anchors are Psalms/Isaiah promises; the blood-marked-house narrative is the canonical protection-by-God's-provision case its "divine protection" queries want
### Lexicon candidates
- passover | blood on the doorposts | realistic query phrasings: "blood on the doorposts meaning", "why did Israel put blood on the doorposts", "lamb without blemish passover"
### New-concept candidates
None. (The remembrance/memorial material routes to the corpus-blocked roster; see Decisions record.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (7 tags stand, each independently clearing the bar per the book doc's 2026-08-25 tag-apply ceiling note; within hard ceiling 8)
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields — all 7 existing tags independently clear the bar; none dropped. Considered, not added (not a yield): `appointed-feasts` on 12:14–20 — the chapter's feast substance is the Passover/unleavened-bread institution itself, exactly what `passover` covers (its lexicon carries "feast of unleavened bread"); adding the broader calendar id here would be broad-duplicating-specific, and the passover ↔ appointed-feasts scoping is the reviewer's recorded call (declines file §1(e)), not re-adjudicated here. Read-back bar honored: no `lords-supper` and no `the-cross` on the lamb/blood material (12:5–7, 13, 21–23) — the NT reading is a later-revelation read-back; the typological connection is offered to concept-pack curation only (the `passover` pack already anchors these verses). Corpus-blocked routing: the memorial/remembrance thread (12:14 "This day shall be a memorial for you"; 12:24–27; 12:42 "a night to be much observed") → roster row 33 (`remembrance-and-memorials`, SKIPPED-blocked) — noted as candidate refs for that row's eventual pack, not duplicated here.

## Exodus 13 (subdivided: 13:1–16, 13:17–22)
Existing tags (book doc): `guidance`, `parenting`, `tithing`, `gods-faithfulness`, `passover`
### Applied-tag deltas
- KEEP guidance — "The LORD went before them by day in a pillar of cloud, to lead them on their way, and by night in a pillar of fire, to give them light" (13:21); the route itself chosen by God: "God didn't lead them by the way of the land of the Philistines, although that was near" (13:17) — verified
- KEEP parenting — "You shall tell your son in that day" (13:8); "when your son asks you in time to come, saying, 'What is this?' ... you shall tell him, 'By strength of hand the LORD brought us out from Egypt, from the house of bondage.'" (13:14)
- KEEP tithing — "Sanctify to me all the firstborn, whatever opens the womb among the children of Israel, both of man and of animal. It is mine." (13:2) — the firstfruits side of the pack, per the book doc's recorded reading (Decisions #23 logic); borderline stands as prior art
- KEEP gods-faithfulness — the land "which he swore to your fathers to give you" (13:5, 13:11); Joseph's bones carried on the oath "God will surely visit you" (13:19)
- KEEP passover — "Remember this day, in which you came out of Egypt, out of the house of bondage" (13:3); "Seven days you shall eat unleavened bread, and in the seventh day shall be a feast to the LORD." (13:6) — the feast fixed in its season (13:3–10), inside the pack's "feast of unleavened bread" scope
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- guidance | 13:17–18, 13:21–22 | "The LORD went before them by day in a pillar of cloud, to lead them on their way" (13:21) | medium — the pack's anchors are Psalms/Proverbs promise texts; the pillar is the canonical narrative case of God leading his people, and the protective detour (13:17–18) is guidance-with-reasons
### Lexicon candidates
- guidance | pillar of cloud and fire | realistic query phrasings: "pillar of cloud and fire meaning", "how did God lead Israel in the wilderness"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (5 tags). Presence-bar declines (not yields): `oaths-and-vows` on 13:19 ("he had made the children of Israel swear") — one reported oath verse, not oath teaching; `providence` on 13:17–18 — the protective detour is explicit divine leading, already carried by guidance (a second id on the same two verses would be broad-duplicating-specific); `obedience-to-the-word` — no obedience refrain in this chapter. Corpus-blocked routings: the sign-memorial thread (13:3 "Remember this day"; 13:9 "for a sign to you on your hand, and for a memorial between your eyes"; 13:16) → roster row 33 (`remembrance-and-memorials`, SKIPPED-blocked); the firstborn-redemption vocabulary (13:13 "you shall redeem all the firstborn of man among your sons"; 13:15) → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked) — noted as candidate refs for those rows' eventual curators, not duplicated here.

## Exodus 14
Existing tags (book doc): `salvation`, `fear-not`, `gods-protection`, `faith`, `divine-judgment`, `grumbling-and-complaining`, `hardness-of-heart`, `knowing-god`
### Applied-tag deltas
- KEEP salvation — "Stand still, and see the salvation of the LORD, which he will work for you today" (14:13), answered by "Thus the LORD saved Israel that day out of the hand of the Egyptians" (14:30) — verified word-for-word
- KEEP fear-not — "Don't be afraid. Stand still" (14:13) to a trapped, terrified people (14:10)
- KEEP gods-protection — the pillar "came between the camp of Egypt and the camp of Israel... One didn't come near the other all night." (14:20); "the waters were a wall to them on their right hand and on their left" (14:22, 14:29)
- KEEP faith — "the people feared the LORD; and they believed in the LORD and in his servant Moses" (14:31)
- KEEP divine-judgment — "The LORD overthrew the Egyptians in the middle of the sea." (14:27); "There remained not so much as one of them." (14:28)
- KEEP grumbling-and-complaining — "Because there were no graves in Egypt, have you taken us away to die in the wilderness?" (14:11); "it would have been better for us to serve the Egyptians than to die in the wilderness" (14:12) — the pack's own Exod 14:11–12 anchor
- KEEP hardness-of-heart — "I will harden Pharaoh's heart, and he will follow after them" (14:4, also 14:8, 14:17) — the pack's own Exod 14:4 anchor
- KEEP knowing-god — "the Egyptians shall know that I am the LORD" (14:4); "The Egyptians shall know that I am the LORD when I have gotten myself honor over Pharaoh" (14:18)
(No additions possible — chapter stands at the hard ceiling of 8; see Decisions record for the one candidate that yields.)
### Anchor-extension candidates
- fear-not | 14:10–14 | "Don't be afraid. Stand still, and see the salvation of the LORD" (14:13) | medium — the pack's anchors are promise texts (Isaiah, Joshua, Psalms); this is the canonical narrative fear-not at the moment of entrapment
### Lexicon candidates
- victory-in-christ | the lord will fight for you | realistic query phrasings: "the Lord will fight for you you need only be still", "God fights my battles", "stand still and see the salvation of the Lord" — the pack anchors Exod 14:13–14 already but its lexicon carries only "god fights for us", not the verse's own phrasing
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement
### Decisions record
- §11.6 yield (candidate exceeding the ceiling): `victory-in-christ` — genuinely present ("The LORD will fight for you, and you shall be still." 14:14; "the LORD fights for them against the Egyptians" 14:25) and the engine pack itself anchors 14:13–14; at the 8-tag ceiling it yields as theme-witness-with-caveat (an NT-framed id on OT narrative whose display substance here is already carried by salvation + gods-protection + fear-not); engine-side the pack needs no extension, and the lexicon candidate above covers the query gap. Standing declines honored (not yields): `angels` on 14:19 stays skipped per the book doc's 2026-08-25 tag-pass reasoning (single in-scene verse, scene carried by gods-protection, chapter at ceiling). Note: Exod 14 is a fixture-witnessed chapter in prior art (pinned web-subset.json); all quotes re-verified against the chapter text.

## Exodus 15 (subdivided: 15:1–21, 15:22–27)
Existing tags (book doc): `praise`, `gods-provision`, `testing`, `grumbling-and-complaining`
### Applied-tag deltas
- KEEP praise — "I will sing to the LORD, for he has triumphed gloriously." (15:1); "This is my God, and I will praise him" (15:2); Miriam and all the women answer "with tambourines and with dances" (15:20–21) — verified
- KEEP gods-provision — "he threw it into the waters, and the waters were made sweet" (15:25); Elim's "twelve springs of water and seventy palm trees" (15:27)
- KEEP testing — "There he made a statute and an ordinance for them, and there he tested them." (15:25)
- KEEP grumbling-and-complaining — "The people murmured against Moses, saying, 'What shall we drink?'" (15:24)
(No additions — nothing further clears the bar; see Decisions record.)
### Anchor-extension candidates
- prayer-for-healing | 15:26 | "for I am the LORD who heals you" | medium — the classic healer self-revelation the pack's "healing" queries want; engine-side only — the display tag stays off per the pastoral-register ruling (corporate covenant word to the nation; book-doc Decisions #18/#46 honored)
- no-other-god | 15:11 | "Who is like you, LORD, among the gods? Who is like you, glorious in holiness, fearful in praises, doing wonders?" | low-medium — the pack's incomparability anchors are Isaiah/Deuteronomy; this is the formula's oldest poetic occurrence
- god-reigns | 15:18 | "The LORD will reign forever and ever." | low — single verse, congruent with the pack's "the lord reigns" lexicon
### Lexicon candidates
- no-other-god | who is like you among the gods | realistic query phrasings: "who is like you among the gods", "there is none like our God"
- prayer-for-healing | i am the lord who heals you | realistic query phrasings: "I am the LORD who heals you", "God my healer"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `worship` — the song's substance is carried by praise; a second id on the same verses would be broad-duplicating-specific; `holiness` on 15:11 ("glorious in holiness") — God's own holiness in one verse; the concept is persons called to holiness (same lexicon-tuning routing as the Isaiah decline in the declines file §3.5); `no-other-god` and `god-reigns` as display tags — each one verse (15:11; 15:18), thin single-verse; served engine-side as anchor-extension candidates above; `gods-love` on 15:13 ("in your loving kindness") — single verse; `obedience-to-the-word` on 15:26 — one conditional-promise verse, not the chapter's substance. `pastoral-prayer-for-healing` stays removed per the pastoral-register ruling (book-doc Decisions #18/#46); the engine-side need is served by the anchor-extension candidate above.

## Exodus 16
Existing tags (book doc): `gods-provision`, `sabbath-rest`, `testing`, `grumbling-and-complaining`
### Applied-tag deltas
- KEEP gods-provision — "Behold, I will rain bread from the sky for you" (16:4); "he who gathered much had nothing over, and he who gathered little had no lack" (16:18); "The children of Israel ate the manna forty years" (16:35) — verified
- KEEP sabbath-rest — "Tomorrow is a solemn rest, a holy Sabbath to the LORD" (16:23); "So the people rested on the seventh day." (16:30) — sabbath-keeping introduced before Sinai
- KEEP testing — "that I may test them, whether they will walk in my law or not" (16:4) — the pack's own Exod 16:4 anchor
- KEEP grumbling-and-complaining — "The whole congregation of the children of Israel murmured against Moses and against Aaron" (16:2); "We wish that we had died by the LORD's hand in the land of Egypt, when we sat by the meat pots" (16:3); "he hears your murmurings against the LORD" (16:7–8)
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- gods-provision | 16:4, 16:13–18, 16:31–35 | "Behold, I will rain bread from the sky for you" (16:4) | high — the pack has no manna anchor at all (its anchors are Matt 6 / Phil 4 / Psalms promises); forty years of daily bread is the Bible's defining provision narrative and the natural landing for "daily bread" queries the lexicon already carries
- sabbath-rest | 16:23–30 | "Behold, because the LORD has given you the Sabbath, therefore he gives you on the sixth day the bread of two days." (16:29) | medium — the pack anchors Exod 20 and 31 but not the pre-Sinai sabbath narrative
- glory-of-god | 16:7, 16:10 | "behold, the LORD's glory appeared in the cloud" (16:10) | low — a two-verse appearance scene; congruent with the pack's Exod 33:18–23 anchor
### Lexicon candidates
- gods-provision | manna | realistic query phrasings: "what is manna", "manna from heaven meaning", "bread from heaven in the Bible" — no pack in the index carries the word
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `knowing-god` on 16:6, 16:12 stays skipped per the book doc's own 2026-08-25 tag-pass reasoning (formula verses framing the provision answer, not the chapter's substance); `glory-of-god` on 16:7, 16:10 — a two-verse scene inside the murmuring-answer narrative; served engine-side as the anchor-extension candidate above; `obedience-to-the-word` — the chapter depicts the failure mode ("they didn't listen to Moses" 16:20; "How long do you refuse to keep my commandments and my laws?" 16:28), same logic as the Gen-3 worked example. Corpus-blocked routing: the kept-omer memorial (16:32 "Let an omer-full of it be kept throughout your generations, that they may see the bread with which I fed you in the wilderness"; 16:33–34) → roster row 33 (`remembrance-and-memorials`, SKIPPED-blocked) — candidate refs noted, not duplicated.

## Exodus 17 (subdivided: 17:1–7, 17:8–16)
Existing tags (book doc): `gods-provision`, `prayer`, `gods-protection`, `grumbling-and-complaining`
### Applied-tag deltas
- KEEP gods-provision — "You shall strike the rock, and water will come out of it, that the people may drink." (17:6) — verified word-for-word
- KEEP prayer — "Moses cried to the LORD, saying, 'What shall I do with these people? They are almost ready to stone me.'" (17:4); the raised hands steadied by Aaron and Hur until sunset (17:9–12), with the book doc's signposted long-read-as-intercession framing kept, not stated as narrative fact
- KEEP gods-protection — "Joshua defeated Amalek and his people with the edge of the sword." (17:13); the altar named "The LORD our Banner" (17:15)
- KEEP grumbling-and-complaining — "Why have you brought us up out of Egypt, to kill us, our children, and our livestock with thirst?" (17:3); "the people quarreled with Moses" (17:2)
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
None.
### Lexicon candidates
- victory-in-christ | the lord our banner | realistic query phrasings: "the LORD is my banner meaning", "Jehovah Nissi" — no pack in the index carries the banner title; the pack's battle-belongs-to-the-LORD register fits the Amalek narrative
- prayer | aaron and hur | realistic query phrasings: "Aaron and Hur holding up Moses' hands", "holding up your leader's arms" — a heavy sermon-query family; the intercession framing stays signposted per the book doc's Decisions #35, not adjudicated
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (4 tags). Standing declines honored (not yields): `testing` stays withheld per book-doc Decisions #14 — at Massah the people test the LORD ("Why do you test the LORD?" 17:2; "because they tested the LORD, saying, 'Is the LORD among us, or not?'" 17:7), the inverse of the pack's God-tests-his-people register; `lament` on 17:4 stays skipped per the 2026-08-25 tag-pass (single verse already carried by prayer; lament's Exodus substance is 5:22–23). Considered, not added (not a yield): `victory-in-christ` on 17:8–16 — the battle-won-by-the-LORD substance is display-carried by gods-protection; the query gap is served by the lexicon candidate above. Corpus-blocked routings: 17:14 "Write this for a memorial in a book" → roster row 33 (`remembrance-and-memorials`, SKIPPED-blocked); Jethro-adjacent counsel material is ch 18's routing, not this chapter's.

## Exodus 18 (subdivided: 18:1–12, 18:13–27)
Existing tags (book doc): `sharing-your-faith`, `praise`, `knowing-god`, `leadership`
### Applied-tag deltas
- ADD receiving-correction — WEB quote: "Moses' father-in-law said to him, 'The thing that you do is not good.'" (18:17); "So Moses listened to the voice of his father-in-law, and did all that he had said." (18:24) — the chapter's whole second half is a leader receiving blunt correction with a teachable spirit and acting on all of it; the pack's anchors are Proverbs aphorisms with no narrative case
- KEEP sharing-your-faith — "Moses told his father-in-law all that the LORD had done to Pharaoh and to the Egyptians for Israel's sake" (18:8) — testimony that moves an outsider to confession (book-doc Decisions #21's justification stands)
- KEEP praise — "Jethro rejoiced for all the goodness which the LORD had done to Israel" (18:9); "Blessed be the LORD, who has delivered you out of the hand of the Egyptians" (18:10)
- KEEP knowing-god — "Now I know that the LORD is greater than all gods" (18:11)
- KEEP leadership — "you shall provide out of all the people able men which fear God: men of truth, hating unjust gain" (18:21); "they shall share the load with you" (18:22) — the pack's own Exod 18:13–26 anchor
### Anchor-extension candidates
- receiving-correction | 18:17–24 | "The thing that you do is not good." (18:17) | medium — the pack has no narrative anchor of correction received and acted on
- sharing-your-faith | 18:8–11 | "Moses told his father-in-law all that the LORD had done" (18:8) | low-medium — the pack's anchors are NT commissioning texts; this is the OT testimony-that-persuades case
### Lexicon candidates
- leadership | delegation | realistic query phrasings: "biblical delegation", "Jethro principle", "delegating in ministry" — the pack anchors Exod 18:13–26 but its lexicon carries no delegation term
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (5 tags). Standing decline honored (not a yield): `wisdom-from-god` stays withheld per book-doc Decisions #21 — Jethro's counsel is human advice conditioned on God's approval ("If you will do this thing, and God commands you so" 18:23), not the divine gift the pack names. Presence-bar declines (not yields): `family-reconciliation` on 18:2–7 — a reunion scene with no estrangement-and-reconciliation substance depicted; `worship` on 18:12 — single burnt-offering verse, carried by praise; `rest-for-the-weary` on 18:18 ("You will surely wear away") — burnout vocabulary in one warning verse, not the pack's Matthew-11:28 rest register. Corpus-blocked routing: Jethro's counsel scene (18:19 "Listen now to my voice. I will give you counsel, and God be with you."; 18:13–26) → roster row 15 (`counsel-and-advisers`, DEFERRED) — the canonical human-advisers narrative, noted as candidate refs for that row's eventual pack (which the roster records as currently misrouting to holy-spirit-the-comforter), not duplicated here.

## Exodus 19 (subdivided: 19:1–15, 19:16–25)
Existing tags (book doc): `covenant`, `holiness`, `presence-of-god`, `obedience-to-the-word`
### Applied-tag deltas
- KEEP covenant — "if you will indeed obey my voice and keep my covenant, then you shall be my own possession from among all peoples" (19:5), offered and accepted (19:7–8) — verified word-for-word; the pack's own Exod 24:3–8 anchor sits downstream of this offer
- KEEP holiness — "you shall be to me a kingdom of priests and a holy nation" (19:6); "sanctify them today and tomorrow, and let them wash their garments" (19:10); "Let the priests also, who come near to the LORD, sanctify themselves" (19:22)
- KEEP presence-of-god — "on the third day the LORD will come down in the sight of all the people on Mount Sinai" (19:11); "Moses led the people out of the camp to meet God" (19:17); "All of Mount Sinai smoked, because the LORD descended on it in fire" (19:18)
- KEEP obedience-to-the-word — "All the people answered together, and said, 'All that the LORD has spoken we will do.'" (19:8)
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- presence-of-god | 19:16–20 | "All of Mount Sinai smoked, because the LORD descended on it in fire" (19:18) | medium — the pack's anchors are promise/nearness texts (Ps 139, Jas 4:8); it has no Sinai-theophany anchor, and "meet God" (19:17) is the scene's own vocabulary
- priesthood | 19:6 | "you shall be to me a kingdom of priests and a holy nation" (19:6) | low-medium — the pack's 1 Pet 2:9 "royal priesthood" anchor quotes this verse's phrase; it has no OT corporate-priesthood anchor
### Lexicon candidates
- covenant | treasured possession | realistic query phrasings: "God's treasured possession", "kingdom of priests and holy nation meaning"
- gods-protection | on eagles wings | realistic query phrasings: "on eagles' wings Bible verse", "God carried me on eagles' wings" — nearest honest home for the 19:4 rescue-and-carry register ("how I bore you on eagles' wings, and brought you to myself"); flagged for the curator against the Isa 40:31 wings-as-eagles queries that rest-for-the-weary already owns
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `priesthood` as a display tag — one phrase in the covenant offer (19:6) plus two mentions of priests (19:22, 19:24); the corporate-priesthood substance is carried by covenant + holiness, served engine-side by the anchor-extension candidate above; `gods-love` on 19:4 ("brought you to myself") — single verse, served by the lexicon candidate above; `fear-of-the-lord` on 19:16 ("all the people who were in the camp trembled") — dread at the theophany, not the pack's reverence teaching (ch 20:20 is that theme's home); `glory-of-god` — the chapter's descent scene never uses glory vocabulary; presence-of-god carries it.

## Exodus 20 (subdivided: 20:1–17, 20:18–21, 20:22–26)
Existing tags (book doc): `the-ten-commandments`, `sabbath-rest`, `worship`, `caring-for-aging-parents`, `fear-not`, `testing`, `idolatry`, `the-name-of-god`
### Applied-tag deltas
- KEEP the-ten-commandments — "God spoke all these words" (20:1) heading the ten (20:1–17) — the pack's sole anchor IS Exod 20:1–17; verified
- KEEP sabbath-rest — "Remember the Sabbath day, to keep it holy." (20:8); "therefore the LORD blessed the Sabbath day, and made it holy" (20:11) — the pack's own Exod 20:8–11 anchor
- KEEP worship — "You shall have no other gods before me." (20:3); the plain altar with the promise "In every place where I record my name I will come to you and I will bless you." (20:24)
- KEEP caring-for-aging-parents — "Honor your father and your mother, that your days may be long in the land" (20:12) — ratified PR #43 use (book-doc Decisions #15, ratified 2026-08-25); the lexicon question on plain honoring-parents queries stays recorded in the book doc's tag-gap note
- KEEP fear-not — "Don't be afraid, for God has come to test you" (20:20)
- KEEP testing — "God has come to test you, and that his fear may be before you, that you won't sin." (20:20)
- KEEP idolatry — "You shall not make for yourselves an idol" (20:4); "You shall most certainly not make gods of silver or gods of gold for yourselves to be alongside me." (20:23) — the pack's own Exod 20:3–6 anchor
- KEEP the-name-of-god — "You shall not misuse the name of the LORD your God" (20:7) — the pack's own Exod 20:7 anchor
(No additions possible — chapter stands at the hard ceiling of 8; see Decisions record for the candidates that yield.)
### Anchor-extension candidates
- fear-of-the-lord | 20:18–20 | "that his fear may be before you, that you won't sin" (20:20) | medium — the fear-that-keeps-from-sin register; the pack has no anchor for the Sinai paradox (don't be afraid / let his fear be before you)
- testing | 20:20 | "God has come to test you, and that his fear may be before you, that you won't sin." (20:20) | low-medium — the pack anchors Exod 16:4 but not this second Exodus test text
### Lexicon candidates
- the-ten-commandments | ten commandments list | realistic query phrasings: "list of the ten commandments", "what are the ten commandments in order"
- fear-of-the-lord | afraid of god | realistic query phrasings: "is it wrong to be afraid of God", "fear of the Lord meaning"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- §11.6 yield (candidate exceeding the ceiling): `covetousness` — genuinely present ("You shall not covet your neighbor's house. You shall not covet your neighbor's wife" 20:17), and the engine pack's own first anchor is Exod 20:17; at the 8-tag ceiling it yields as thin single-verse (one commandment verse whose display substance rides the-ten-commandments), engine-side already fully served by the pack's existing anchor — no extension needed. Presence-bar declines (not yields): `honesty` on 20:16 ("You shall not give false testimony against your neighbor") — single commandment verse, carried by the-ten-commandments (and slander-and-false-accusation's register is being accused, not the prohibition); `no-other-god` on 20:3 — single verse, substance carried by idolatry + worship; `gods-love` on 20:6 ("showing loving kindness to thousands of those who love me") — single clause inside the second commandment; `fear-of-the-lord` as a display tag — one verse (20:20) already quoted by two standing tags (fear-not, testing); served engine-side by the anchor-extension candidate above. Note: Exod 20 is a fixture-witnessed chapter in prior art (pinned web-subset.json); all quotes re-verified against the chapter text.

## Exodus 21
Existing tags (book doc): `pastoral-refuge-and-justice`, `cities-of-refuge`, `restitution`
### Applied-tag deltas
- ADD bondservants-and-masters — WEB quote: "If you buy a Hebrew servant, he shall serve six years, and in the seventh he shall go out free without paying anything." (21:2); "I love my master, my wife, and my children. I will not go out free" (21:5); "If a man strikes his servant’s eye, or his maid’s eye, and destroys it, he shall let him go free for his eye’s sake." (21:26) — servant-and-master law is the chapter’s opening block (21:1–11) and returns in the master-liability statutes (21:20–21, 26–27, 32); the pack’s own Jer 34:8–17 anchor is the later prophetic indictment for breaking exactly this six-year release law, and "what does the bible say about slavery" queries honestly land here
- KEEP pastoral-refuge-and-justice — statutes protecting individual vulnerable persons: refuge for the unintentional killer (21:13), punishment for the master who kills his servant (21:20), freedom for the maimed servant (21:26–27) — assembly Decisions #46 kept it as genuinely individual register; the #22 statute-not-narrative caveat stands
- KEEP cities-of-refuge — "I will appoint you a place where he shall flee" (21:13) — the institution’s root text; adopted id, engine work routed to roster row 25
- KEEP restitution — "he shall pay for the loss of his time, and shall provide for his healing until he is thoroughly healed" (21:19); "the owner of the pit shall make it good" (21:34) — measured-remedy statutes run 21:18–36; adopted id, engine work routed to roster row 28
### Anchor-extension candidates
- bondservants-and-masters | 21:1–11, 26–27 | "If you buy a Hebrew servant, he shall serve six years, and in the seventh he shall go out free without paying anything." (21:2) | medium — the pack’s anchors are NT house-code texts plus Jer 34:8–17, which cites this statute; the source law itself is unanchored
### Lexicon candidates
- bondservants-and-masters | servant who loves his master | realistic query phrasings: "pierced ear servant meaning", "bondservant in the Bible", "why did the servant stay with his master" — anchored by "his master shall bore his ear through with an awl, and he shall serve him forever" (21:6)
### New-concept candidates
None. (Restitution and refuge material match roster rows; see Decisions record.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `justice-and-oppression` — the chapter is measured penal/civil remedy, not the pack’s oppression-of-the-poor register; its protection-of-the-vulnerable substance is carried by pastoral-refuge-and-justice; `vengeance` on 21:23–25 ("eye for eye, tooth for tooth, hand for hand, foot for foot") — judicial proportionality administered by judges, not the pack’s leave-revenge-to-God teaching; tagging would misroute; `caring-for-aging-parents` on 21:15, 21:17 — two penal statutes on attacking/cursing parents; the honoring-parents home is 20:12; `godly-marriage` on 21:10–11 — single-statute protection clause. Corpus-blocked routings: the restitution statutes (21:18–36, incl. the "eye for an eye" query family on 21:23–25, which the book doc’s motif line already records) → roster row 28 (`restitution`, SKIPPED-blocked, whose reason names Exod 21:18–22:15); the appointed refuge (21:13–14) → roster row 25 (`cities-of-refuge`, SKIPPED-blocked, root text; the roster’s misroute warning vs refuge-in-trouble / pastoral-refuge-and-justice noted, and the book doc’s 2026-08-25 both-tags flag for Jesse on exactly this pairing stands) — candidate refs noted, not duplicated.

## Exodus 22
Existing tags (book doc): `pastoral-refuge-and-justice`, `tithing`, `care-for-widows`, `oaths-and-vows`, `restitution`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP pastoral-refuge-and-justice — "If you take advantage of them at all, and they cry at all to me, I will surely hear their cry" (22:23); the poor man’s garment returned by sundown, "for I am gracious" (22:27) — individual vulnerable persons under God’s own sanction; verified word-for-word
- KEEP tithing — "You shall not delay to offer from your harvest and from the outflow of your presses." (22:29) — the pack’s firstfruits side, per book-doc Decisions #23; the no-tenth caveat stands as prior art
- KEEP care-for-widows — "You shall not take advantage of any widow or fatherless child." (22:22) — the pack’s own Exod 22:22–24 anchor; the command anchor itself
- KEEP oaths-and-vows — "the oath of the LORD shall be between them both" (22:11) — the oath as legal instrument settling bailment disputes
- KEEP restitution — "he who kindled the fire shall surely make restitution" (22:6); "If a man borrows anything of his neighbor’s, and it is injured, or dies... he shall surely make restitution." (22:14) — repayment statutes run 22:1–15; adopted id, engine work routed to roster row 28
- KEEP sojourners-and-strangers — "You shall not wrong an alien or oppress him, for you were aliens in the land of Egypt." (22:21)
(No additions — chapter stands at the soft cap of 6; see Decisions record.)
### Anchor-extension candidates
- justice-and-oppression | 22:21–27 | "If you take advantage of them at all, and they cry at all to me, I will surely hear their cry" (22:23) | medium — the pack’s anchors have no covenant-code oppression text; God pledging himself against oppressors of widow, orphan, alien, and poor borrower is the register its "god hates injustice" queries want (engine-side; display substance is carried by the specific ids above)
### Lexicon candidates
None. (The interest/usury query family has no honest home in any pack; see New-concept candidates.)
### New-concept candidates
- lending-and-interest | genuine gap: "usury in the Bible", "what does the Bible say about charging interest", "lending money to the poor" (the book doc’s motif line records the same family) have no vocabulary home — `contentment` carries "debt" but is borrower-side contentment teaching, `generosity` is cheerful giving, and no roster row covers lending; not in the declines file | anchor: "If you lend money to any of my people with you who is poor, you shall not be to him as a creditor. You shall not charge him interest." (22:25), with the sundown-collateral rule (22:26–27); cross-book strengthening expected from Lev 25:35–37, Deut 23:19–20, Ps 15:5, Neh 5, Prov 28:8
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6
### Decisions record
- No §11.6 yields — six tags, each independently clearing the bar. Considered, not added (not a yield): `justice-and-oppression` — genuinely present at 22:21–27, but the three standing tags (pastoral-refuge-and-justice, care-for-widows, sojourners-and-strangers) already quote those very verses; a fourth id on the same span would be broad-duplicating-specific, and the engine-side need is served by the anchor-extension candidate above. Presence-bar declines (not yields): `occult-and-divination` on 22:18 ("You shall not allow a sorceress to live.") — a single list-item statute, same logic as the book doc’s 2026-08-25 skip of `idolatry` ch 22; `idolatry` on 22:20 stays skipped per that same tag-pass reasoning; `holiness` on 22:31 ("You shall be holy men to me") — one verse plus a dietary rule; the persons-consecrated substance lives in chs 19, 28–29; `mercy` on 22:27 ("for I am gracious") — single clause; `godly-marriage` on 22:16–17 — seduction-dowry statute, not marriage teaching. Corpus-blocked routing: 22:1–15 repayment statutes → roster row 28 (`restitution`, SKIPPED-blocked) — candidate refs noted, not duplicated.

## Exodus 23 (subdivided: 23:1–19, 23:20–33)
Existing tags (book doc): `pastoral-refuge-and-justice`, `honesty`, `sabbath-rest`, `worship`, `gods-protection`, `guidance`, `angels`, `idolatry`
### Applied-tag deltas
- KEEP pastoral-refuge-and-justice — "You shall not deny justice to your poor people in their lawsuits." (23:6); "You shall not oppress an alien, for you know the heart of an alien, since you were aliens in the land of Egypt." (23:9) — verified word-for-word
- KEEP honesty — "You shall not spread a false report." (23:1); "Keep far from a false charge" (23:7)
- KEEP sabbath-rest — "but the seventh year you shall let it rest and lie fallow, that the poor of your people may eat" (23:11); "on the seventh day you shall rest, that your ox and your donkey may have rest, and the son of your servant, and the alien may be refreshed" (23:12)
- KEEP worship — "You shall observe a feast to me three times a year." (23:14); "Three times in the year all your males shall appear before the Lord GOD." (23:17)
- KEEP gods-protection — "I will be an enemy to your enemies, and an adversary to your adversaries" (23:22); "I will send my terror before you" (23:27)
- KEEP guidance — "Behold, I send an angel before you, to keep you by the way, and to bring you into the place which I have prepared." (23:20)
- KEEP angels — "Pay attention to him, and listen to his voice. Don’t provoke him... for my name is in him." (23:21) — record-without-settling wording per the book doc’s log note
- KEEP idolatry — "don’t invoke the name of other gods or even let them be heard out of your mouth" (23:13); "You shall make no covenant with them, nor with their gods." (23:32)
(No additions possible — chapter stands at the hard ceiling of 8; see Decisions record for the candidates that yield.)
### Anchor-extension candidates
- appointed-feasts | 23:14–17 | "You shall observe a feast to me three times a year." (23:14) | medium — the pack anchors Deut 16:16–17’s three-times command but not this earliest festal-calendar text
- favoritism | 23:2–3, 6–8 | "You shall not favor a poor man in his cause." (23:3); "You shall take no bribe, for a bribe blinds those who have sight and perverts the words of the righteous." (23:8) | medium — the pack anchors Lev 19:15; the Exodus court-impartiality texts, including the no-favoring-the-poor edge its James 2 anchors don’t cover, are unanchored
- loving-others | 23:4–5 | "If you meet your enemy’s ox or his donkey going astray, you shall surely bring it back to him again." (23:4) | low-medium — the pack’s enemy-love anchors are NT teaching; this is the OT practical enemy-kindness case
- pleasing-god-not-people | 23:2 | "You shall not follow a crowd to do evil." (23:2) | low-medium — the crowd-pressure register; the pack has no OT command anchor
### Lexicon candidates
- pleasing-god-not-people | do not follow the crowd | realistic query phrasings: "peer pressure Bible verse", "do not follow the crowd to do evil", "standing alone for what is right" — the book doc’s motif line records the same family; nearest honest home in the vocabulary
### New-concept candidates
None. (The little-by-little conquest promise, 23:29–30, is a motif in the book doc without search-scale concept substance beyond it; noted, not proposed.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- §11.6 yield (candidate exceeding the ceiling): `appointed-feasts` — genuinely present (23:14–17, the three-feast calendar), but at the 8-tag ceiling it yields: its display substance here is a four-verse block already quoted by the standing `worship` tag, and the passover ↔ appointed-feasts scoping is the reviewer’s recorded call (declines file §1(e)); engine-side served by the anchor-extension candidate above.
- §11.6 yield (candidate exceeding the ceiling): `favoritism` — genuinely present (23:2–3, 6–8, impartial courts), but at the 8-tag ceiling it yields: the same verses are already quoted by the standing `honesty` and `pastoral-refuge-and-justice` tags; engine-side served by the anchor-extension candidate above.
- Standing skip honored (not a yield): `sojourners-and-strangers` on 23:9 stays skipped per the book doc’s 2026-08-25 tag-pass (thin single-verse yield at the ceiling; the alien-oppression substance rides pastoral-refuge-and-justice’s 23:9 quote). Presence-bar declines (not yields): `passover` on 23:15 ("You shall observe the feast of unleavened bread.") — single calendar verse; the institution’s home is chs 12–13; `gods-provision` and any healing id on 23:25–26 ("he will bless your bread and your water, and I will take sickness away from among you") — corporate covenant promise under the book doc’s prosperity guardrail (Decisions #36), not provision/healing teaching; `obedience-to-the-word` on 23:13, 23:21–22 — conditional frame clauses inside the promise section, carried by guidance and angels; `loving-others` on 23:4–5 — two-verse case law, served engine-side as the anchor-extension candidate above.

## Exodus 24 (subdivided: 24:1–11, 24:12–18)
Existing tags (book doc): `covenant`, `obedience-to-the-word`, `worship`, `presence-of-god`
### Applied-tag deltas
- KEEP covenant — "Look, this is the blood of the covenant, which the LORD has made with you concerning all these words." (24:8); "He took the book of the covenant and read it in the hearing of the people" (24:7) — the pack’s own Exod 24:3–8 anchor; verified word-for-word
- KEEP obedience-to-the-word — "All the words which the LORD has spoken will we do." (24:3); "We will do all that the LORD has said, and be obedient." (24:7)
- KEEP worship — "worship from a distance" (24:1); "offered burnt offerings and sacrificed peace offerings of cattle to the LORD" (24:5)
- KEEP presence-of-god — "They saw the God of Israel. Under his feet was like a paved work of sapphire stone" (24:10); "They saw God, and ate and drank." (24:11); "Moses entered into the middle of the cloud" (24:18)
(No additions — nothing further clears the bar; see Decisions record.)
### Anchor-extension candidates
- presence-of-god | 24:9–11 | "They saw God, and ate and drank." (24:11) | medium — the covenant meal in God’s unharming presence; the pack’s anchors are nearness-promise texts with no narrative case like it
- glory-of-god | 24:15–17 | "The appearance of the LORD’s glory was like devouring fire on the top of the mountain in the eyes of the children of Israel." (24:17) | low-medium — the pack anchors Exod 33:18–23 but not the Sinai glory-settling scene
### Lexicon candidates
- covenant | blood of the covenant | realistic query phrasings: "blood of the covenant meaning", "why blood in Old Testament covenants", "covenant ceremony in Exodus" — the pack anchors Exod 24:3–8 but its lexicon does not carry the phrase; the book doc’s motif line records the same family
- presence-of-god | seeing god | realistic query phrasings: "did anyone see God in the Old Testament", "they saw the God of Israel meaning"
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `glory-of-god` — explicit glory vocabulary (24:16–17) but a closing two-verse scene already quoted by the standing presence-of-god tag; served engine-side as the anchor-extension candidate above; `leadership` on 24:14 ("Whoever is involved in a dispute can go to them.") — single delegation verse; the theme’s home is ch 18. Read-back bar honored (group-wide ruling): no `lords-supper` and no `the-cross` on the blood of the covenant (24:6–8) — the NT connection (Matt 26:28 wording; Heb 9) is a later-revelation read-back; the forward-pointing note is offered to concept-pack curation only.

## Exodus 25
Existing tags (book doc): `presence-of-god`, `generosity`
### Applied-tag deltas
- KEEP presence-of-god — "Let them make me a sanctuary, that I may dwell among them." (25:8); "There I will meet with you, and I will tell you from above the mercy seat" (25:22) — the stated purpose of the whole instruction; verified word-for-word
- KEEP generosity — "From everyone whose heart makes him willing you shall take my offering." (25:2)
(No additions — nothing further clears the bar; sparse-but-specific chapter, two honest tags stand.)
### Anchor-extension candidates
- generosity | 25:1–8 | "From everyone whose heart makes him willing you shall take my offering." (25:2) | medium — the pack’s anchors are NT giving texts; the freewill-offering root text is the OT case its "cheerful giver" register wants
- the-house-of-god | 25:8–9 | "Let them make me a sanctuary, that I may dwell among them." (25:8) | medium — the pack anchors temple texts (2 Chr 7; Haggai; Ezra) but has no tabernacle-commission anchor, and "gods dwelling place" is its own lexicon term
### Lexicon candidates
None. (The mercy-seat and ark query families route to the roster and a new-concept candidate; see below.)
### New-concept candidates
- ark-of-the-covenant | genuine gap: "ark of the covenant meaning", "what was inside the ark of the covenant", "what is the mercy seat" are search-scale artifact queries with no vocabulary home (no pack carries "ark" or "mercy seat"; `the-house-of-god` is the building, not the artifact); not in the declines file, not a roster row | anchors: "You shall put the covenant which I shall give you into the ark." (25:16); "There I will meet with you, and I will tell you from above the mercy seat, from between the two cherubim which are on the ark of the covenant" (25:22). Cross-book strengthening expected from Exod 37, Num 10, Josh 3–6, 1 Sam 4–6, 2 Sam 6, 1 Kgs 8. Curator cross-note: the mercy-seat/atonement register overlaps roster row 1 (`sacrifice-and-atonement` — Lev 16 is its day-of-atonement text); decide the boundary together, without NT propitiation read-back in any gist.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (2 tags — honest-and-sparse preferred over stretching). Presence-bar declines (not yields): `the-house-of-god` as a display tag — the dwelling purpose is two verses (25:8, 25:22) already quoted by the standing presence-of-god tag, and the rest is furniture specification; served engine-side as the anchor-extension candidate above; `covenant` on 25:16, 25:21–22 — the covenant appears as the deposited object, not covenant teaching; `sacrifice-and-atonement` — no atonement act occurs in this chapter (the mercy seat is specified as furniture; atonement’s Exodus substance is chs 29–30, where it is tagged). Read-back bar honored (group-wide ruling): no Hebrews typology on mercy seat, bread of the presence, or lampstand; forward-pointing notes go to curation only. Corpus-blocked routing: the mercy-seat query family (25:17–22) → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked, whose reason names Exod 29–30 alongside Lev 16) — noted for that row’s eventual curator alongside the ark-of-the-covenant candidate’s cross-note, not duplicated.

## Exodus 26
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands: no concept in the current vocabulary is genuinely present in this chapter (curtain, board, bar, veil, and screen specification throughout; the one purpose-clause echo, "according to the way that it was shown to you on the mountain," 26:30, is a pattern refrain, not concept substance).
### Anchor-extension candidates
None.
### Lexicon candidates
None.
### New-concept candidates
None. (The veil query family — "holy of holies", "veil in the tabernacle meaning" — is recorded in the book doc’s motif line; its heavy query form, "why was the temple veil torn", is an NT-event query this chapter cannot honestly serve, and a concept minted here would invite the read-back the conventions bar.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (0 tags). Presence-bar declines (not yields): `holiness` on 26:33–34 stays withheld per book-doc Decisions #27 — the veil makes places and things holy; the concept is persons called to holiness; `the-house-of-god` — structure specification without a dwelling-teaching statement (contrast 25:8); `presence-of-god` — the chapter never states the meeting/dwelling purpose in its own words. Read-back bar honored (group-wide ruling): no Hebrews veil typology (Heb 10:20) as a tag basis; the forward-pointing note goes to curation only.

## Exodus 27
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands: no concept in the current vocabulary is genuinely present in this chapter (bronze altar, courtyard, and vessel specification; the closing lamp statute, 27:20–21, is a two-verse duty, not concept substance).
### Anchor-extension candidates
None.
### Lexicon candidates
None. (The continual-lamp motif — "keep the lamp burning Bible" — is already recorded in the book doc’s motif line; no pack honestly owns it.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (0 tags). Presence-bar declines (not yields): `priesthood` on 27:21 ("Aaron and his sons shall keep it in order from evening to morning before the LORD") — a two-verse tending duty; the office’s substance is chs 28–29, where it is tagged; `worship` — the altar of burnt offering is specified as apparatus (27:1–8) with no act or teaching of worship in the chapter; `the-house-of-god` — specification without a dwelling-teaching statement, same logic as ch 26. Read-back bar honored (group-wide ruling): no altar/sacrifice typology as a tag basis; forward-pointing notes go to curation only.

## Exodus 28
Existing tags (book doc): `holiness`, `priesthood`
### Applied-tag deltas
- KEEP holiness — "that they make Aaron’s garments to sanctify him, that he may minister to me in the priest’s office" (28:3); the engraved plate "‘HOLY TO THE LORD.’" (28:36); "and shall anoint them, and consecrate them, and sanctify them" (28:41) — persons consecrated, per book-doc Decisions #27; verified word-for-word
- KEEP priesthood — "Bring Aaron your brother, and his sons with him, near to you from among the children of Israel, that he may minister to me in the priest’s office" (28:1) — the pack’s own Exod 28:1 anchor; "Aaron shall bear the names of the children of Israel in the breastplate of judgment on his heart, when he goes in to the holy place" (28:29)
(No additions — nothing further clears the bar; sparse-but-specific chapter, two honest tags stand.)
### Anchor-extension candidates
- priesthood | 28:29–30 | "Aaron shall bear the names of the children of Israel in the breastplate of judgment on his heart, when he goes in to the holy place, for a memorial before the LORD continually." (28:29) | low-medium — the pack anchors 28:1 (the appointment) but not the representative bearing-the-people register its "high priest" queries want
- holiness | 28:36–38, 28:41 | "You shall make a plate of pure gold, and engrave on it, like the engravings of a signet, ‘HOLY TO THE LORD.’" (28:36) | low-medium — the set-apart-to-the-LORD formula and the persons-consecration verse are unanchored in the pack
### Lexicon candidates
- priesthood | high priest breastplate | realistic query phrasings: "high priest breastplate meaning", "twelve stones on the breastplate", "priest bearing names on his heart" — the book doc’s motif line records the same family
- guidance | urim and thummim | realistic query phrasings: "what are Urim and Thummim", "how did Israel discern God's will" (28:30) — nearest honest home (the pack’s "gods will for my life" register); flagged with a register caution for the curator: sanctioned priestly means, not to be listed anywhere near `occult-and-divination`
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (2 tags). Presence-bar declines (not yields): `wisdom-from-god` on 28:3 ("all who are wise-hearted, whom I have filled with the spirit of wisdom") — single verse; the Spirit-given-skill substance and its existing tag live in ch 31; `occult-and-divination` on 28:30 — the Urim and Thummim are a sanctioned priestly means; tagging the forbidden-practices pack would misroute (served instead by the guidance lexicon candidate above, with its register caution); `glory-of-god` on 28:2, 28:40 ("for glory and for beauty") — garment-splendor phrase, not the pack’s divine-glory register. Corpus-blocked routing: 28:3’s spirit-of-wisdom craftsmanship → roster row 3 (`craftsmanship-and-creativity`, DEFERRED, whose reason names Exod 31; 35–36) — candidate ref noted, not duplicated. Read-back bar honored (group-wide ruling): no Hebrews high-priest typology (Heb 4–7) as a tag basis; the forward-pointing note goes to curation only.

## Exodus 29
Existing tags (book doc): `presence-of-god`, `holiness`, `worship`, `priesthood`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP presence-of-god — "I will dwell among the children of Israel, and will be their God." (29:45); "that I might dwell among them: I am the LORD their God" (29:46) — the promise under all the ritual detail; verified word-for-word
- KEEP holiness — "and he shall be made holy, and his garments, and his sons" (29:21); "Whatever touches the altar shall be holy." (29:37) — persons consecrated, per book-doc Decisions #27
- KEEP worship — "It shall be a continual burnt offering throughout your generations at the door of the Tent of Meeting before the LORD" (29:42); "it is a pleasant aroma, an offering made by fire to the LORD" (29:18)
- KEEP priesthood — "They shall have the priesthood by a perpetual statute. You shall consecrate Aaron and his sons." (29:9)
- KEEP sacrifice-and-atonement — "It is a sin offering." (29:14); "Every day you shall offer the bull of sin offering for atonement." (29:36); "Seven days you shall make atonement for the altar, and sanctify it" (29:37) — adopted OT-ritual register id; engine work routed to roster row 1
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- presence-of-god | 29:42–46 | "I will dwell among the children of Israel, and will be their God." (29:45) | medium — the dwell-among-and-meet-with promise ("where I will meet with you, to speak there to you," 29:42) is unanchored in the pack; with ch 25’s sanctuary-purpose text these are the tabernacle presence-texts the pack lacks
### Lexicon candidates
None. (The sin-offering, laying-on-of-hands, and atonement query families belong to roster row 1’s eventual pack; see Decisions record.)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (5 tags). Presence-bar declines (not yields): `knowing-god` on 29:46 ("They shall know that I am the LORD their God") — one purpose-formula verse, same logic as the book doc’s 2026-08-25 skips on chs 6 and 16; the verse is already quoted territory of presence-of-god’s justification; `glory-of-god` on 29:43 ("the place shall be sanctified by my glory") — single clause. Corpus-blocked routing: the whole ordination-offering complex (29:10–37 — sin offering, whole burnt offering, ram of consecration, blood on ear/thumb/toe, seven-day altar atonement) and its query families ("what is a sin offering", "laying on of hands on the sacrifice", "pleasing aroma to the LORD meaning") → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked, whose reason names Exod 29–30) — candidate refs noted for that row’s eventual curator, not duplicated. Read-back bar honored (group-wide ruling; book-doc Decisions #26): no `the-cross` and no Hebrews typology on the offerings — the adopted `sacrifice-and-atonement` tag carries the OT-ritual register without NT atonement framing.

## Exodus 30
Existing tags (book doc): `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP sacrifice-and-atonement — "Aaron shall make atonement on its horns once in the year; with the blood of the sin offering of atonement" (30:10); "each man shall give a ransom for his soul to the LORD" (30:12); "The rich shall not give more, and the poor shall not give less, than the half shekel... to make atonement for your souls." (30:15) — atonement at the system’s edges; adopted OT-ritual register id, engine work routed to roster row 1. (Only one honest tag from the current vocabulary — the book doc’s dated single-tag note stands confirmed.)
(No additions — nothing further clears the bar; honest-and-sparse preferred over stretching.)
### Anchor-extension candidates
None. (`sacrifice-and-atonement` has no engine pack to extend; its Exod 30 refs ride roster row 1.)
### Lexicon candidates
None. (The half-shekel query family — "atonement money meaning", "half shekel tax", "ransom for his soul" — belongs to roster row 1’s eventual pack; see Decisions record. The washing-basin motif is already in the book doc’s motif line.)
### New-concept candidates
None.
### Decline-overturn proposals
None. (Book-doc Decisions #25 — no `prayer` on the incense altar — was re-examined against the chapter text and stands: the chapter never connects incense with prayer in its own words; no new textual evidence exists to cite.)
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (1 tag). Standing declines honored (not yields): `prayer` on 30:1–10 stays withheld per book-doc Decisions #25 — incense-as-prayer is later-revelation framing (Ps 141; Rev 5/8) the conventions bar; `holiness` stays withheld per Decisions #27 — the oil and incense chapters make things holy ("Whatever touches them shall be holy," 30:29), and the one persons-clause (30:30, "You shall anoint Aaron and his sons, and sanctify them") is a single verse echoing chs 28–29, where the tag lives. Presence-bar declines (not yields): `presence-of-god` on 30:6, 30:36 ("where I will meet with you") — locational refrain clauses, not the chapter’s substance; `favoritism`/`justice-and-oppression` on 30:15 — the rich-and-poor-alike clause is one verse inside the ransom statute, not partiality teaching. Corpus-blocked routing: 30:10 (yearly atonement on the incense altar’s horns) and 30:11–16 (census ransom, "to make atonement for your souls") with the query families "atonement money meaning", "half shekel tax" → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked, whose reason names Exod 29–30) — candidate refs noted, not duplicated. Read-back bar honored (group-wide ruling): no NT ransom framing (Mark 10:45) on 30:12; the forward-pointing note goes to curation only.

## Exodus 31 (subdivided: 31:1–11, 31:12–17, 31:18)
Existing tags (book doc): `wisdom-from-god`, `sabbath-rest`, `covenant`, `craftsmanship-and-creativity`
### Applied-tag deltas
- KEEP wisdom-from-god — "I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge, and in all kinds of workmanship" (31:3); "in the heart of all who are wise-hearted I have put wisdom" (31:6) — craft skill as God's own gift; verified word-for-word
- KEEP sabbath-rest — "Most certainly you shall keep my Sabbaths; for it is a sign between me and you throughout your generations, that you may know that I am the LORD who sanctifies you." (31:13); "on the seventh day is a Sabbath of solemn rest, holy to the LORD" (31:15) — the pack's own Exod 31:13–17 anchor
- KEEP covenant — "the children of Israel shall keep the Sabbath, to observe the Sabbath throughout their generations, for a perpetual covenant" (31:16); "he gave Moses the two tablets of the covenant, stone tablets, written with God's finger" (31:18)
- KEEP craftsmanship-and-creativity — "Behold, I have called by name Bezalel the son of Uri, the son of Hur, of the tribe of Judah." (31:2), filled with the Spirit of God for every craft (31:3–5), with Oholiab appointed and the wise-hearted gifted (31:6) — adopted id; engine work routed to roster row 3
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- wisdom-from-god | 31:1–6 | "I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge, and in all kinds of workmanship" (31:3) | medium — the pack's anchors are James 1:5 / Proverbs ask-for-wisdom texts with no skill-wisdom anchor; this extension is exactly the unresolved check-wisdom-from-god-extension-first flag that roster row 3 carries — cross-note the two so the craftsmanship decision is made with this candidate in view
- holiness | 31:13 | "that you may know that I am the LORD who sanctifies you" (31:13) | low — the LORD-who-sanctifies self-title, persons register; single verse, engine-side only
### Lexicon candidates
- sabbath-rest | sabbath sign | realistic query phrasings: "the sabbath is a sign", "sign between God and Israel", "why is the sabbath so serious" — the pack anchors 31:13–17 but its lexicon carries no sign vocabulary; the book doc's motif line records the same family
### New-concept candidates
None. (31:7's ark and mercy seat listing is command inventory; the ch 25 `ark-of-the-covenant` candidate stands witnessed, not re-proposed.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `holiness` on 31:13–15 — the sanctifier clause is one verse and the rest makes a day holy, not persons (book-doc Decisions #27 logic); served engine-side by the anchor-extension candidate above; `knowing-god` on 31:13 ("that you may know") — one purpose-formula clause, same logic as the chs 6/16/29 skips; `holy-spirit` on 31:3 — the pack is the NT filled-with-the-Spirit/Pentecost register; the Spirit-given-skill substance is carried by wisdom-from-god + craftsmanship-and-creativity; `obedience-to-the-word` on 31:11 ("according to all that I have commanded you they shall do") — a closing refrain clause. Corpus-blocked routings: the Bezalel calling material (31:1–11; query families "who was Bezalel", "God and creativity", "is art a calling from God") → roster row 3 (`craftsmanship-and-creativity`, DEFERRED, whose reason names Exod 31 and whose unresolved extension check the wisdom-from-god candidate above serves); 31:3's Spirit-filling-for-a-task → roster row 13 (`empowered-by-the-spirit`, DEFERRED) — noted as an OT candidate ref beside its Judges refrain, not duplicated here.

## Exodus 32
Existing tags (book doc): `sin`, `prayer`, `divine-judgment`, `gods-faithfulness`, `idolatry`, `sacrifice-and-atonement`
### Applied-tag deltas
- ADD backsliding — WEB quote: "They have turned away quickly out of the way which I commanded them. They have made themselves a molded calf" (32:8) — God's own verdict names the chapter's event as swift turning-aside from the commanded way; the apostasy-narrative register is the pack's own class (its Judges 2:11–19 anchor is the same falling-away narrative), distinct from idolatry (the object worshiped) per the §11.2 both-tags ruling
- KEEP sin — "You have sinned a great sin." (32:30); "Oh, this people have sinned a great sin, and have made themselves gods of gold." (32:31) — named without softening; verified word-for-word
- KEEP prayer — "Moses begged the LORD his God" (32:11); "Yet now, if you will, forgive their sin—and if not, please blot me out of your book which you have written." (32:32) — intercession twice standing between Israel and destruction
- KEEP divine-judgment — the tablets broken (32:19), the calf ground to powder and drunk (32:20), "About three thousand men fell of the people that day." (32:28); "The LORD struck the people, because of what they did with the calf, which Aaron made." (32:35)
- KEEP gods-faithfulness — "Remember Abraham, Isaac, and Israel, your servants, to whom you swore by your own self" (32:13); "So the LORD turned away from the evil which he said he would do to his people." (32:14) — the plea that prevails is God's sworn word (book-doc Decisions #31 framing stands)
- KEEP idolatry — "Come, make us gods, which shall go before us" (32:1); "These are your gods, Israel, which brought you up out of the land of Egypt." (32:4) — the pack's own Exod 32:1–8 anchor
- KEEP sacrifice-and-atonement — "Perhaps I shall make atonement for your sin." (32:30) — adopted OT-ritual register id; engine work routed to roster row 1
### Anchor-extension candidates
- backsliding | 32:7–8 | "They have turned away quickly out of the way which I commanded them." (32:8) | low-medium — the pack anchors Judges 2:11–19 but has no Exodus calf anchor; the turned-aside-quickly verdict is the OT's first covenant-apostasy text
- gods-faithfulness | 32:11–14 | "Remember Abraham, Isaac, and Israel, your servants, to whom you swore by your own self" (32:13) | medium — the pack's anchors are promise-statement texts; it has no narrative case of God's sworn word prevailing as the ground of intercession
### Lexicon candidates
- prayer | standing in the gap | realistic query phrasings: "standing in the gap prayer", "Moses interceded for Israel", "can prayer change God's mind" — the declines file (§3.5, Ezekiel block) already flags "standing in the gap" as a prayer lexicon-extension candidate on Ezek 22:30; Exod 32:11–14, 30–32 is the narrative case that flag wants, recorded here so the curator decides both together
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit soft cap 6 (7 tags stand, each independently clearing the bar; within hard ceiling 8)
### Decisions record
- No §11.6 yields — seven tags, each independently clearing the bar. Presence-bar declines (not yields): `pleasing-god-not-people` on Aaron's capitulation (32:1–6, 22–24) — the chapter depicts the failure mode (Gen-3 `resisting-the-devil` worked-example logic); tagging would misroute; `repentance` — no repentance is depicted (the people move from feast to judgment with no recorded turning); `vengeance` on 32:27 — divinely commanded judgment executed by the Levites, not the pack's leave-revenge-to-God teaching; `leadership` on 32:26 ("Whoever is on the LORD's side, come to me!") — single rallying verse; `covenant` — present as the broken tablets (32:15–19), object not teaching; the remaking is ch 34's tagged substance. Corpus-blocked routings: 32:14 ("the LORD turned away from the evil which he said he would do") → roster row 7 (`god-relents`, SKIPPED-blocked) — the classic narrative relenting text, noted as a candidate ref for that row's eventual pack beside its Jer/Jonah/Joel refs, not duplicated here; 32:26–29 (the Levites' sword-zeal, "Consecrate yourselves today to the LORD" 32:29) → roster row 36 (`zeal-for-god`, SKIPPED-blocked) — same register as its Phinehas case; the roster's vigilante-violence gist CAUTION applies squarely; 32:30–33 (atonement sought, "blot me out of your book") → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked), where the tag already routes. Motif witnessed, not proposed: the blot-out-of-your-book exchange (32:32–33) is the earliest book-of-life text — recorded toward the Daniel block's standing motif-not-gap disposition (declines file §3.5; Dan 7:10; 12:1 with Rev 20:12; Ps 69:28), not minted.

## Exodus 33 (subdivided: 33:1–6, 33:7–11, 33:12–23)
Existing tags (book doc): `presence-of-god`, `prayer`, `guidance`, `angels`
### Applied-tag deltas
- ADD glory-of-god — WEB quote: "Please show me your glory." (33:18); "It will happen, while my glory passes by, that I will put you in a cleft of the rock, and will cover you with my hand until I have passed by" (33:22) — the chapter's climactic scene is the pack's own keystone (its anchors include Exod 33:18–23 and its lexicon carries "show me your glory"); distinct register from presence-of-god (the manifested glory Moses asks to see vs God's going-with) per the §11.2 both-tags ruling; the glory material stays in the chapter's own terms per the group-wide ruling
- KEEP presence-of-god — "My presence will go with you, and I will give you rest." (33:14); "The LORD spoke to Moses face to face, as a man speaks to his friend." (33:11); "If your presence doesn't go with me, don't carry us up from here." (33:15) — the chapter's whole argument; verified word-for-word
- KEEP prayer — Moses' persistent, escalating intercession: "please show me your way" (33:13), "don't carry us up from here" (33:15), "Please show me your glory." (33:18)
- KEEP guidance — "Behold, you tell me, 'Bring up this people;' and you haven't let me know whom you will send with me" (33:12); "please show me your way, now, that I may know you" (33:13)
- KEEP angels — "I will send an angel before you" (33:2) offered in place of God's own going — "I will not go up among you" (33:3) — the substitution Moses refuses (33:15–16)
### Anchor-extension candidates
- presence-of-god | 33:12–16 | "My presence will go with you, and I will give you rest." (33:14) | high — the pack's anchors are nearness-promise texts (Ps 139; Jas 4:8; Heb 13:5) with no Exodus presence-bargain; this is the canonical text where God's going-with is preferred to the promised land itself, and "in your presence" queries want it
- knowing-god | 33:13 | "please show me your way, now, that I may know you" (33:13) | low-medium — the pack's knowing-God-as-relationship register has no OT plea anchor; single verse, engine-side only
### Lexicon candidates
- presence-of-god | face to face | realistic query phrasings: "God spoke to Moses face to face", "face to face with God", "friend of God in the Bible" — the book doc's motif line records the same family; nearest honest home
- glory-of-god | cleft of the rock | realistic query phrasings: "hidden in the cleft of the rock", "rock of ages cleft for me", "why couldn't Moses see God's face" — the pack anchors 33:18–23 but its lexicon carries none of the scene's own vocabulary
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (5 tags). Standing declines honored (not yields): `rest-for-the-weary` on 33:14 stays withheld per book-doc Decisions #28 — the promise is to Moses about the journey, not the pack's Matthew-11:28 weariness register (engine-side the pack already anchors Exod 33:14, so no extension is needed); `friendship` on 33:11 stays withheld per book-doc Decisions #29 — the pack covers human friendship; divine friendship stays a motif. Presence-bar declines (not yields): `seeking-god` on 33:7 ("Everyone who sought the LORD went out to the Tent of Meeting") — single narrative verse; `mercy` on 33:19 ("will show mercy on whom I will show mercy") — single clause, and its Rom 9:15 election use is a later-revelation frame not read back; `worship` on 33:10 ("all the people rose up and worshiped") — single verse; `knowing-god` on 33:13 — one clause inside the plea already quoted by guidance; served engine-side by the anchor-extension candidate above.

## Exodus 34 (subdivided: 34:1–9, 34:10–35)
Existing tags (book doc): `gods-love`, `forgiveness-of-sins`, `covenant`, `worship`, `presence-of-god`, `idolatry`, `slow-to-anger`, `the-name-of-god`
### Applied-tag deltas
- KEEP gods-love — "a merciful and gracious God, slow to anger, and abundant in loving kindness and truth" (34:6); "keeping loving kindness for thousands" (34:7) — the WEB's own love vocabulary in God's self-revelation (book-doc Decisions #30 stands); verified word-for-word
- KEEP forgiveness-of-sins — "forgiving iniquity and disobedience and sin" (34:7), answered at once by "pardon our iniquity and our sin, and take us for your inheritance" (34:9)
- KEEP covenant — "Behold, I make a covenant" (34:10); "He wrote on the tablets the words of the covenant, the ten commandments." (34:28) — the covenant broken in ch 32 remade
- KEEP worship — "Moses hurried and bowed his head toward the earth, and worshiped." (34:8); "for you shall worship no other god" (34:14)
- KEEP presence-of-god — "The LORD descended in the cloud, and stood with him there" (34:5); "please let the Lord go among us" (34:9); "the skin of his face shone by reason of his speaking with him" (34:29)
- KEEP idolatry — "you shall break down their altars, and dash in pieces their pillars" (34:13); "for the LORD, whose name is Jealous, is a jealous God" (34:14); "You shall make no cast idols for yourselves." (34:17)
- KEEP slow-to-anger — "The LORD! The LORD, a merciful and gracious God, slow to anger" (34:6) — the pack's own Exod 34:6–7 anchor, the formula's source text
- KEEP the-name-of-god — "proclaimed the LORD's name" (34:5); "The LORD! The LORD, a merciful and gracious God" (34:6) — the pack's own Exod 34:5 anchor
(No additions possible — chapter stands at the hard ceiling of 8; see Decisions record for the candidates that yield.)
### Anchor-extension candidates
- forgiveness-of-sins | 34:6–9 | "forgiving iniquity and disobedience and sin" (34:7) | medium — the pack's anchors are Psalms/Isaiah/1 John texts; the OT forgiveness self-revelation its "god forgives" queries want is unanchored
- gods-love | 34:6–7 | "abundant in loving kindness and truth, keeping loving kindness for thousands" (34:6–7) | low-medium — the pack's "steadfast love of the lord" lexicon has no anchor on the OT loving-kindness keystone
- mercy | 34:6–7 | "The LORD! The LORD, a merciful and gracious God" (34:6) | low-medium — cross-note: slow-to-anger already anchors 34:6–7; the curator should decide one home or two rather than double-anchoring the formula
- appointed-feasts | 34:18–24 | "Three times in the year all your males shall appear before the Lord GOD, the God of Israel." (34:23) | low-medium — the pack anchors Deut 16:16–17's three-times command but not this covenant-renewal calendar restatement
- individual-responsibility | 34:7 | "visiting the iniquity of the fathers on the children, and on the children's children" (34:7) | low — the tension text the pack's "generational sin"/"generational curses" queries cite; record-without-adjudicating note for the curator (the pack's gist is the Ezek 18 teaching; searchers of those phrasings still expect this verse surfaced)
### Lexicon candidates
- slow-to-anger | merciful and gracious | realistic query phrasings: "merciful and gracious God slow to anger", "the LORD the LORD merciful and gracious" — the pack's lexicon carries only the "compassionate and gracious god" wording variant, not the WEB's own "merciful and gracious"
- idolatry | jealous god | realistic query phrasings: "why is God a jealous God", "the LORD whose name is Jealous" — the book doc's motif line records the same family; nearest honest home
- presence-of-god | moses face shone | realistic query phrasings: "why did Moses' face shine", "Moses' shining face meaning", "why did Moses wear a veil" — the book doc's motif line records the same family
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- §11.6 yield (candidate exceeding the ceiling): `mercy` — genuinely present ("a merciful and gracious God," 34:6, with Moses' pardon plea, 34:9), but at the 8-tag ceiling it yields as broad-duplicating-specific: the standing gods-love, slow-to-anger, and forgiveness-of-sins tags already quote 34:6–7 between them; engine-side served by the anchor-extension candidate above with its one-home-or-two cross-note.
- §11.6 yield (candidate exceeding the ceiling): `appointed-feasts` — genuinely present (34:18–24, the restated festal calendar), but at the 8-tag ceiling it yields as theme-witness-with-caveat: the calendar is restated inside the covenant terms the standing covenant tag carries, and the passover ↔ appointed-feasts scoping is the reviewer's recorded call (declines file §1(e)), same disposition as this ledger's ch 23 yield; engine-side served by the anchor-extension candidate above.
- Presence-bar declines (not yields): `passover` on 34:25 ("The sacrifice of the feast of the Passover shall not be left to the morning.") — single calendar verse; the institution's home is chs 12–13 (ch 23 precedent); `sabbath-rest` on 34:21 — single restatement verse; the theme's homes are chs 16, 20, 31, 35; `tithing` on 34:19–20, 34:26 — scattered firstborn/firstfruits restatement clauses below the bar at chapter scale; its Exodus homes (chs 13, 22) stand; `fasting` on 34:28 ("he neither ate bread, nor drank water") — a narrative datum about Moses, not fasting teaching; `individual-responsibility` on 34:7 — tagging would misroute display-side (the pack teaches the Ezek 18 each-soul answer; this text states the visiting) — served by the record-without-adjudicating anchor note above. Read-back bar honored (group-wide ruling): no 2 Cor 3 veil typology on 34:29–35; the glory/presence material stays in the chapter's own terms.

## Exodus 35
Existing tags (book doc): `generosity`, `wisdom-from-god`, `sabbath-rest`, `craftsmanship-and-creativity`
### Applied-tag deltas
- KEEP generosity — "Whoever is of a willing heart, let him bring it as the LORD's offering" (35:5); "The children of Israel brought a free will offering to the LORD; every man and woman whose heart made them willing" (35:29) — a whole chapter of freewill giving; verified word-for-word
- KEEP wisdom-from-god — "He has filled him with the Spirit of God, in wisdom, in understanding, in knowledge, and in all kinds of workmanship" (35:31); "All the women who were wise-hearted spun with their hands" (35:25)
- KEEP sabbath-rest — "on the seventh day there shall be a holy day for you, a Sabbath of solemn rest to the LORD" (35:2) — the rebuilding begins with rest (35:1–3)
- KEEP craftsmanship-and-creativity — "Behold, the LORD has called by name Bezalel" (35:30); "He has put in his heart that he may teach, both he and Oholiab" (35:34) — adopted id; engine work routed to roster row 3
(No additions — nothing further clears the bar.)
### Anchor-extension candidates
- generosity | 35:20–29 | "They came, everyone whose heart stirred him up, and everyone whom his spirit made willing, and brought the LORD's offering" (35:21) | medium — the pack's anchors are NT giving texts plus Proverbs; with ch 25's command text this is the response narrative its "cheerful giver" register wants
- wisdom-from-god | 35:30–35 | "He has filled them with wisdom of heart to work all kinds of workmanship" (35:35) | low-medium — adds the gift-extends-to-teaching register (35:34) to the ch 31 candidate; decide together with roster row 3's extension check
### Lexicon candidates
- generosity | willing heart | realistic query phrasings: "giving with a willing heart", "freewill offering in the Bible", "whose heart stirred him up" — the pack's lexicon carries no willing-heart vocabulary; the book doc's motif line records the same family
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (4 tags). Presence-bar declines (not yields): `work-and-diligence` — 35:10's call to the wise-hearted is anticipatory; the labor itself begins in ch 36, where the tag lives; `spiritual-gifts` on 35:25–26, 30–35 — the pack is the NT gifts-of-the-Spirit register (read-back risk); the gifted-for-service substance is carried by wisdom-from-god + craftsmanship-and-creativity; `obedience-to-the-word` on 35:1, 35:4, 35:29 — command-relay refrain clauses, not the executed-obedience substance (that lives in chs 39–40, where it is tagged); `worship` — no act or teaching of worship in the chapter. Corpus-blocked routing: 35:30–35 (Bezalel and Oholiab gifted to work and to teach; the wise-hearted women spinning, 35:25–26) → roster row 3 (`craftsmanship-and-creativity`, DEFERRED, whose reason names Exod 35–36) — candidate refs noted, not duplicated.

## Exodus 36
Existing tags (book doc): `generosity`, `work-and-diligence`, `craftsmanship-and-creativity`
### Applied-tag deltas
- KEEP generosity — "The people have brought much more than enough for the service of the work which the LORD commanded to make." (36:5); "So the people were restrained from bringing." (36:6); "the stuff they had was sufficient to do all the work, and too much" (36:7) — giving so abundant it must be stopped; verified word-for-word
- KEEP work-and-diligence — "everyone whose heart stirred him up to come to the work to do it" (36:2); "All the wise men, who performed all the work of the sanctuary, each came from his work which he did." (36:4)
- KEEP craftsmanship-and-creativity — "Bezalel and Oholiab shall work with every wise-hearted man, in whom the LORD has put wisdom and understanding to know how to do all the work for the service of the sanctuary" (36:1); the curtains "the work of a skillful workman" (36:8) — adopted id; engine work routed to roster row 3
(No additions — nothing further clears the bar; the chapter's body, 36:8–38, is construction specification.)
### Anchor-extension candidates
- generosity | 36:3–7 | "The people have brought much more than enough for the service of the work" (36:5) | medium — the stop-the-giving scene has no anchor anywhere in the pack; with ch 35's candidate, one combined freewill-offering extension (35:21–29 + 36:3–7) would serve both chapters
### Lexicon candidates
- generosity | more than enough | realistic query phrasings: "the people gave more than enough", "told to stop giving in the Bible", "overflowing generosity" — the book doc's motif line records the same family
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (3 tags). Presence-bar declines (not yields): `obedience-to-the-word` on 36:1 ("according to all that the LORD has commanded") — a refrain clause; the executed-obedience substance lives in chs 39–40; `wisdom-from-god` on 36:1–2 — the wise-hearted vocabulary here restates chs 31/35, where the tag and its fuller texts live; carried in this chapter by craftsmanship-and-creativity + work-and-diligence (a third id on the same two verses would be broad-duplicating-specific). Corpus-blocked routing: 36:1–2, 36:8 (the wise-hearted at work) → roster row 3 (`craftsmanship-and-creativity`, DEFERRED, whose reason names Exod 35–36) — candidate refs noted, not duplicated.

## Exodus 37
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands: no concept in the current vocabulary is genuinely present in this chapter (Bezalel's fabrication of ark, mercy seat, table, lampstand, and incense altar throughout; skilled execution is recorded — "after the art of the perfumer," 37:29 — without the Spirit-given-gifting substance that grounds the craftsmanship tags in chs 31, 35–36).
### Anchor-extension candidates
None.
### Lexicon candidates
None. (The one-piece hammered lampstand query family is already recorded in the book doc's motif line; no pack honestly owns it.)
### New-concept candidates
None. (The ark and mercy-seat fabrication, 37:1–9 — "He made a mercy seat of pure gold." (37:6) — is witnessed as strengthening refs for the ch 25 `ark-of-the-covenant` candidate, whose rationale already anticipated Exod 37; not re-proposed.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (0 tags). Presence-bar declines (not yields): `craftsmanship-and-creativity` — the chapter records craft output only; the calling/gifting substance (31:3; 35:31; 36:1–2) never appears in its own words, and prior art's honest-and-empty call (book-doc Decisions #32) is confirmed, matching the chs 25–30 sweep's disposition on specification chapters; `worship` — the furnishings are specified as apparatus (ch 27 logic); `the-house-of-god` — fabrication without a dwelling-teaching statement (chs 26–27 logic); `sacrifice-and-atonement` — no atonement act occurs; the incense altar and anointing oil are made as objects, and roster row 1's Exodus refs stay chs 29–30. Read-back bar honored (group-wide ruling): no Hebrews typology on ark, mercy seat, or lampstand; forward-pointing notes go to curation only.

## Exodus 38
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands: no concept in the current vocabulary is genuinely present in this chapter (bronze altar, basin, and courtyard fabrication, 38:1–20, then the itemized materials accounting, 38:21–31; the two genuine resonances — the serving women's mirrors, 38:8, and the public accounting — are single-scene material below the bar, preserved in the book doc's motif lines).
### Anchor-extension candidates
None.
### Lexicon candidates
None. (The ministering-women query family, 38:8, has no honest pack home; recorded in the book doc's motif line.)
### New-concept candidates
None. (The financial-accountability query family — "handling God's money honestly", "financial accountability in church" — is real but routes to roster row 16 rather than a fresh mint; see Decisions record.)
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (0 tags). Presence-bar declines (not yields): `integrity` on 38:21–31 — the itemized accounting is a record, not integrity teaching (no conduct standard is taught in the chapter's own words); `craftsmanship-and-creativity` on 38:22–23 — credit lines naming Bezalel and Oholiab ("an engraver, and a skillful workman, and an embroiderer," 38:23), not gifting substance; `worship`/`servanthood` on 38:8 ("the ministering women who ministered at the door of the Tent of Meeting") — single verse. Corpus-blocked routings: the public accounting of the offering under Ithamar (38:21–31 — "These are the amounts of materials used for the tabernacle... as they were counted, according to the commandment of Moses," 38:21) → roster row 16 (`stewardship`, DEFERRED) — the accountable-handling-of-entrusted-resources register, noted as candidate refs for that row's eventual pack, not duplicated here; the census silver at a beka a head (38:25–26 — "half a shekel... for everyone who passed over to those who were counted") → roster row 1 (`sacrifice-and-atonement`, SKIPPED-blocked) — ch 30's atonement money materialized, noted beside the chs 29–30 refs already routed there.

## Exodus 39
Existing tags (book doc): `obedience-to-the-word`, `priesthood`
### Applied-tag deltas
- KEEP obedience-to-the-word — the chapter's drumbeat "as the LORD commanded Moses" (39:1, 5, 7, 21, 26, 29, 31) culminating in "The children of Israel did according to all that the LORD commanded Moses; so they did." (39:32) and Moses' inspection: "behold, they had done it as the LORD had commanded" (39:43) — verified word-for-word
- KEEP priesthood — "made the holy garments for Aaron, as the LORD commanded Moses" (39:1); the breastplate stones "according to the names of the children of Israel, twelve, according to their names" (39:14); "They made the plate of the holy crown of pure gold, and wrote on it an inscription, like the engravings of a signet: 'HOLY TO THE LORD'." (39:30)
(No additions — nothing further clears the bar; two honest tags stand, as prior art's dated note records.)
### Anchor-extension candidates
- obedience-to-the-word | 39:32, 39:42–43 | "The children of Israel did according to all that the LORD commanded Moses; so they did." (39:32) | medium — the pack's anchors are hearing-and-doing teaching texts (James 1; Matt 7; 1 Sam 15:22); it has no exact-execution narrative anchor, and the inspected-and-approved close is the canonical case
### Lexicon candidates
- holiness | holy to the lord | realistic query phrasings: "holy to the LORD inscription", "what does holy to the LORD mean" — anchored by 39:30; the pack's lexicon carries "set apart" but not the inscription formula (engine-side note only; the display tag stays off per the Decisions record)
### New-concept candidates
None.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- none
### Decisions record
- No §11.6 yields (2 tags). Standing decline honored (not a yield): `blessing` on 39:43 ("and Moses blessed them") stays withheld per book-doc Decisions #33 — one closing verse, below the substantial-presence bar. Presence-bar declines (not yields): `holiness` — the chapter fabricates holy things (garments, the inscribed plate); the persons-consecration substance lives in chs 28–29 and 40:13 (Decisions #27 logic); served engine-side by the lexicon note above; `work-and-diligence` on 39:32, 39:42 — the finished-work notices are carried by the standing obedience-to-the-word quotes; `craftsmanship-and-creativity` on 39:3, 39:8 ("the work of a skillful workman") — execution detail; the gifting substance and its tags live in chs 31, 35–36 (prior art's untagged call honored). Read-back bar honored (group-wide ruling): no Hebrews high-priest typology on the garments; forward-pointing notes go to curation only.

## Exodus 40 (subdivided: 40:1–33, 40:34–38)
Existing tags (book doc): `presence-of-god`, `obedience-to-the-word`, `guidance`, `priesthood`
### Applied-tag deltas
- ADD glory-of-god — WEB quote: "Then the cloud covered the Tent of Meeting, and the LORD's glory filled the tabernacle." (40:34); "Moses wasn't able to enter into the Tent of Meeting, because the cloud stayed on it, and the LORD's glory filled the tabernacle." (40:35) — explicit glory vocabulary twice at the book's climax; the pack's own Ezek 43:1–5 anchor is the parallel glory-fills-the-house scene, and its "the glory of the lord" lexicon is exactly this text's language; distinct register from presence-of-god (the manifested filling glory vs God dwelling and going with Israel) per the §11.2 both-tags ruling; the glory material stays in the chapter's own terms per the group-wide ruling
- KEEP presence-of-god — "the cloud covered the Tent of Meeting, and the LORD's glory filled the tabernacle" (40:34); "For the cloud of the LORD was on the tabernacle by day, and there was fire in the cloud by night, in the sight of all the house of Israel, throughout all their journeys." (40:38) — the goal of the whole book arrives; verified word-for-word
- KEEP obedience-to-the-word — "Moses did so. According to all that the LORD commanded him, so he did." (40:16), with "as the LORD commanded Moses" sealing each assembly step (40:19, 21, 23, 25, 27, 29, 32) until "So Moses finished the work." (40:33)
- KEEP guidance — "When the cloud was taken up from over the tabernacle, the children of Israel went onward, throughout all their journeys" (40:36); "but if the cloud wasn't taken up, then they didn't travel until the day that it was taken up" (40:37)
- KEEP priesthood — "You shall put on Aaron the holy garments; and you shall anoint him, and sanctify him, that he may minister to me in the priest's office." (40:13); "Their anointing shall be to them for an everlasting priesthood throughout their generations." (40:15)
### Anchor-extension candidates
- glory-of-god | 40:34–38 | "Then the cloud covered the Tent of Meeting, and the LORD's glory filled the tabernacle." (40:34) | high — the pack anchors Exod 33:18–23 and Ezek 43:1–5 but not the OT's first glory-fills-the-house scene, which 1 Kgs 8 and 2 Chr 7 echo; the book doc's "glory filled the tabernacle"/"shekinah glory" motif queries want this text
- guidance | 40:36–38 | "When the cloud was taken up from over the tabernacle, the children of Israel went onward, throughout all their journeys" (40:36) | medium — completes ch 13's pillar candidate with the settled travel-by-cloud pattern (Num 9 will strengthen cross-book)
- the-house-of-god | 40:33–35 | "So Moses finished the work." (40:33), followed by the filling (40:34) | medium — the pack's anchors are all temple texts (2 Chr 7; Haggai; Ezra; Ezek 43); the tabernacle completed and indwelt is the root case of its "gods dwelling place" register (engine-side; display substance carried by presence-of-god + glory-of-god)
### Lexicon candidates
- glory-of-god | glory filled the tabernacle | realistic query phrasings: "the glory of the LORD filled the tabernacle", "shekinah glory meaning", "God's glory filling the temple" — the pack's lexicon carries no filling vocabulary
### New-concept candidates
- anointing | genuine gap: "anointing in the Bible", "what does it mean to be anointed", "anointing oil meaning" are search-scale queries with no vocabulary home — no engine pack, adopted id, or roster row carries the practice (roster row 46 `the-lords-anointed` is the touch-not-the-king narrative register, a different theme; `messianic-prophecy` is the Christ-title; `holy-spirit` doesn't carry the word); not in the declines file | anchors: "You shall take the anointing oil, and anoint the tabernacle and all that is in it, and shall make it holy" (40:9); "You shall anoint them, as you anointed their father, that they may minister to me in the priest's office. Their anointing shall be to them for an everlasting priesthood throughout their generations." (40:15). In-book strengthening from Exod 29:7; 30:22–33; 37:29; cross-book from Lev 8, 1 Sam 10/16, Ps 133. Curator cautions: keep the row 46 boundary explicit, and treat the NT Spirit-anointing register (1 John 2:20; 2 Cor 1:21) as a design decision at pack time — describe, don't adjudicate, and no read-back grounds the OT refs.
### Decline-overturn proposals
None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- No §11.6 yields (5 tags). Presence-bar declines (not yields): `holiness` on 40:9–15 — consecration clauses inside the setup instructions ("anoint... and sanctify"), carried by priesthood; the persons-consecration substance lives in chs 28–29; `worship` on 40:23–29 — the bread set in order, lamps lit, incense burned, and offerings offered are assembly-execution steps, not worship teaching; `the-house-of-god` — its two candidate verses (40:34–35) are already quoted by the standing presence-of-god tag and the glory-of-god ADD; a third id on the same verses would be broad-duplicating-specific; served engine-side by the anchor-extension candidate above; `obedience` refrain material fully carried by the standing tag. Read-back bar honored (group-wide ruling): no John 1:14 tabernacled-among-us and no Hebrews framing on the filling scene; the glory/presence material stays in its own terms, and forward-pointing notes go to curation only.

## Corrigenda — chapters 1–10 vs the 15 late-arriving adopted ids (2026-08-26)

Why: chapters 1–10 were swept before the canonical §11.1 adopted list existed at
`tag-apply/adopted-concepts.md`, under the interim two-list universe (239 engine ids +
50 roster ids). The canonical list adds 15 legal adopted ids in neither file
(`confession-of-sin`, `death-of-a-believer`, `eternal-life`, `false-teachers`,
`freedom-in-christ`, `gentleness-of-christ`, `gods-delight-in-his-people`,
`living-for-gods-glory`, `new-birth`, `outpouring-of-the-spirit`, `sovereignty-of-god`,
`sowing-and-reaping`, `speaking-in-tongues`, `the-branch`, `walking-in-truth`). This
block re-evaluates ONLY those 15 ids against chapters 1–10; all other chapter-1–10
conclusions stand unchanged.

### Corrigendum ADD

- Exodus 9: ADD sovereignty-of-god — WEB quote: "but indeed for this cause I have made
  you stand: to show you my power, and that my name may be declared throughout all the
  earth" (9:16), with "that you may know that there is no one like me in all the earth"
  (9:14), "The LORD hardened the heart of Pharaoh" (9:12), and "that you may know that
  the earth is the LORD's" (9:29) — the chapter's own declarations that God has raised
  and sustains a foreign king for God's stated purpose, disposes of that king's heart,
  and owns the whole earth. Register checked against the id's tag-gaps row (Isa 45
  Cyrus raised for God's purpose; Dan 2:21 removing and setting up kings; Jer 27:5–7;
  Ezra's turned royal hearts): 9:15–16 is that rule-over-kings register stated
  in-chapter to the king himself, multi-verse and explicit, not an incidental touch —
  it clears the honest-substantial-presence bar. Distinct query register from the
  chapter's standing tags per the §11.2 both-tags ruling: the-name-of-god carries the
  name-declared clause, knowing-god the purpose formulas, hardness-of-heart the heart
  verses; none serves "God is in control" / "God's sovereignty" queries. This is the
  chapter's 7th tag — see Decisions record below.

### Per-chapter outcomes (the 15 delta ids only)

- Exodus 1 — no change. None of the 15 present; the scheme-backfiring irony (1:10–12)
  is the standing `providence` tag's substance, not `sowing-and-reaping`'s moral-harvest
  teaching register; `walking-in-truth` (Johannine-epistle register) has no candidate —
  the midwives' answer (1:19) is the book doc's standing hard case, not truth-walk
  teaching.
- Exodus 2 — no change. None of the 15 present; national rescue-anticipation material
  stays routed to roster row 32 (`deliverance`), not read back as `freedom-in-christ`.
- Exodus 3 — no change. None of the 15 present; the commission and name material is
  carried by the standing tags; `eternal-life` / `new-birth` / `outpouring-of-the-spirit`
  are later-revelation registers with no in-chapter candidate anyway.
- Exodus 4 — no change. Close call recorded: `gods-delight-in-his-people` on "Israel is
  my son, my firstborn" (4:22) — a sonship claim pressed against Pharaoh, not the id's
  delight-rejoicing register; declined at the register, same logic as the ch-2
  adoption-as-gods-children decline.
- Exodus 5 — no change. None of the 15 present; "Let my people go" (5:1) stays routed
  to roster row 32 (`deliverance`), not `freedom-in-christ` (read-back).
- Exodus 6 — no change. None of the 15 present; the I-will redemption chain (6:6–8)
  stays routed to roster rows 23 (`redeemer`) and 32 (`deliverance`) per the standing
  entry; `sovereignty-of-god` on 6:1 ("by a strong hand he shall let them go") — a
  single announcement verse, below the bar.
- Exodus 7 — no change (6 tags stand). Close calls recorded: `sovereignty-of-god` on
  7:3–5 — announcement verses whose substance the chapter carries under
  hardness-of-heart, divine-judgment, and knowing-god; the register's in-chapter
  declaration to the king lives in ch 9, where it is now tagged; `false-teachers` on
  the magicians (7:11, 7:22) — they are sorcery-practitioners, carried by the standing
  occult-and-divination tag; the id's deceptive-teachers-in-the-assembly register is a
  later-revelation category with no in-chapter candidate.
- Exodus 8 — no change (6 tags stand). Same magician disposition as ch 7 (8:7, 8:18–19
  carried by occult-and-divination); none of the 15 otherwise present.
- Exodus 9 — corrigendum ADD sovereignty-of-god (above; now 7 tags). Close call
  recorded: `confession-of-sin` on "I have sinned this time. The LORD is righteous, and
  I and my people are wicked." (9:27) — the chapter depicts the failure mode, retracted
  at 9:34–35 ("he sinned yet more, and hardened his heart"); tagging would misroute
  confession queries — the same Gen-3 worked-example logic as the standing `repentance`
  decline in this chapter's entry. Unlike the Leviticus 5 / Numbers 5 corrigendum ADDs,
  Exodus 1–10 has no confession statute or genuine confession scene.
- Exodus 10 — no change (5 tags stand). Close calls recorded: `confession-of-sin` on
  "I have sinned against the LORD your God" (10:16–17) — same failure-mode logic as
  ch 9 (hardened again at 10:20); `sovereignty-of-god` on 10:1–2 ("I have hardened his
  heart... that I may show these my signs among them") — purpose-orchestration verses
  carried by the standing hardness-of-heart and knowing-god tags; thinner than ch 9's
  in-chapter rule-over-the-king declaration, below the bar on its own.

Not present in any of chapters 1–10, no candidate verse to weigh: `death-of-a-believer`
(1:6 and 2:23 are narrative death notices, not the id's dying-in-faith register),
`eternal-life`, `gentleness-of-christ`, `living-for-gods-glory` (9:16 is God declaring
his own name and power, not believer-conduct teaching), `new-birth` (the chs 1–2 births
are literal), `outpouring-of-the-spirit`, `speaking-in-tongues`, `the-branch`.

### Decisions record (corrigenda)

- Exodus 9 soft cap: the corrigendum ADD makes 7 tags, exceeding the soft cap 6, under
  the hard ceiling 8; every tag independently clears the presence bar, main themes
  first, so no §11.6 yield is triggered (yield order applies where candidates exceed
  the ceiling). Recorded per the corrigenda instruction; no existing tag dropped.
- No other chapter's tag set changes; all standing declines, routings, and candidates
  in the chapter 1–10 entries remain in force.

Closing note: chapters 11–40 were swept under the full canonical universe
(adopted-concepts.md ∪ concept-index.md ∪ roster) and need no re-check.
