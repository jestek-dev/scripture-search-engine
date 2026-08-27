# Daniel sweep ledger — Layer-3 tag sweep

- Book: Daniel, chapters 1–12 (complete)
- Sweep thread: Isaiah–Daniel group (Major Prophets thread of the whole-Bible coverage plan, Layer 3)
- Repo: scripture-search-engine @ origin/main pinned SHA `e762d1c629f5b121a2aacc6da57cca6bacc3215e`
- Date: 2026-08-26
- File naming: `sweep/daniel.md` per the coordinator's 2026-08-26 naming settlement (book-doc naming for all sweep ledgers, superseding the brief §4's `<book>-sweep-ledger.md` pattern).
- Sources: engine concept inventory — 239 ids (`ontology/concepts/*.yaml` at the pinned SHA, per the thread's `concept-inventory.md` census); adopted display vocabulary — 161 ids, canonical list `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (CONVENTIONS §11.1, canonical as of 2026-08-26).
- **STANDING CAVEAT — CORPUS-BLOCKED:** Daniel has ZERO fixture verses in the CI corpus (`pipeline/fixtures/web-subset.json` contains no Daniel at all). Every engine-facing candidate below — anchor-extension, lexicon, new-concept — is corpus-blocked until the corpus expansion lands, and each such line carries the marker `CORPUS-BLOCKED (Daniel: zero fixture verses)`. Nothing here can pass the gauntlet today.
- **OPEN QUESTION (flagged, not resolved):** the `end-times` scope question with Jesse (merge-or-two-ids vs `day-of-the-lord`; boundary with `second-coming`; corpus-blocked roster row 5 carries the explicit Jesse gate) is FLAGGED where it arises (Daniel 7 Decisions record) and deliberately not resolved either way in this ledger.
- Adopted-only display ids used in Daniel (all verified present on the canonical adopted list, each marked engine-built: no): `persecuted-for-gods-word`, `end-times`, `sovereignty-of-god`, `spiritual-warfare`. `book-of-life` verified ABSENT from both the engine inventory and the adopted list — a genuine new-concept candidate (recorded at chapter 12).
- Entry format: Torah-ledger per-chapter format (genesis-sweep-ledger.md Legend): existing tags → applied-tag deltas → anchor-extension candidates → lexicon candidates → new-concept candidates → decline-overturn proposals → ceiling/refinement flags → Decisions record.

## Assembly verification statement (mechanical, 2026-08-26)

Independent scripted re-verification of the drafted chunk (`sweep-chunks/daniel-01-12.md`) by the assembly worker, not relying on the chunk worker's self-report:

- Chapter entries: all 12 present, in order 1–12, full Torah-ledger section skeleton in every entry. PASS.
- WEB quotes: 137 ref-attributed quotes checked byte-for-byte against `web-text/daniel/<N>.txt` (verse-per-line WEB, split from the checksum-verified pinned source): **0 failures**. The one cross-chapter quote — "The judgment was set. The books were opened." (7:10), cited inside the chapter-12 `book-of-life` candidate — verified against chapter 7 via its explicit ref label. All remaining double-quoted spans in the file (87) are realistic query phrasings, motif titles, roster/decline citations, or meta labels — none is a WEB-attributed quote.
- Concept ids: 57 distinct backticked ids used; 56 resolve exactly against the 239-id engine inventory or the 161-id canonical adopted list; the single non-resolver is `book-of-life`, explicitly labeled NEW-CONCEPT CANDIDATE and confirmed absent from both lists (the point of the candidate). 0 unresolved-and-unlabeled ids.
- CORPUS-BLOCKED marker audit: all 54 engine-facing candidate lines (31 anchor-extension + 21 lexicon + 2 new-concept) carry `CORPUS-BLOCKED (Daniel: zero fixture verses)`: **0 missing, 0 fixes needed**. The 11 ROUTED lines are routings to the corpus-blocked roster (rows 4, 5, 12, 17, 32), explicitly not candidates, and are governed by their target rows.
- Deltas and yields: both ADDs (`mercy` Dan 9; `persecuted-for-gods-word` Dan 11) carry word-for-word WEB quotes; the one §11.6 yield (`integrity` on Dan 6, broad-duplicating-specific at the hard ceiling) has its Decisions-record entry. Mechanical recount matches the totals exactly: 2 ADD / 71 KEEP / 0 DROP; 31 anchor-extension, 21 lexicon, 2 new-concept, 0 decline-overturn. **0 count corrections needed.**

Per-chapter entries follow, verbatim from the verified chunk.

## Daniel 1
Existing tags (book doc): `providence`, `wisdom-from-god`, `holiness`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `providence` — God steers both sides of the catastrophe: "The Lord gave Jehoiakim king of Judah into his hand" (1:2), and "God made Daniel find kindness and compassion in the sight of the prince of the eunuchs" (1:9).
- KEEP `wisdom-from-god` — "God gave them knowledge and skill in all learning and wisdom" (1:17), proven when the king finds them "ten times better than all the magicians and enchanters" (1:20).
- KEEP `holiness` — Daniel "purposed in his heart that he would not defile himself" (1:8) — set-apartness kept inside a pagan court (borderline flag in book doc Decisions #14 stands; reversible there, not here).
- KEEP `sojourners-and-strangers` — the exile frame set here: deported, renamed ("The prince of the eunuchs gave names to them", 1:7), enrolled in the conqueror's academy (1:1–7).
- No ADD — no further concept in the 239-id library or the adopted vocabulary clears the honest-substantial-presence bar. (`fasting` considered for the vegetables-and-water test, 1:12 — the chapter never calls it fasting and does not teach fasting; carried as a lexicon candidate below instead of a forced tag.)
### Anchor-extension candidates
- wisdom-from-god | 1:17, 20 | "God gave them knowledge and skill in all learning and wisdom" (1:17) | medium-high — the pack (James 1:5; Prov 2:6) has no narrative OT anchor of God giving wisdom; Daniel 1 is the canonical one. CORPUS-BLOCKED (Daniel: zero fixture verses)
- providence | 1:9 | "God made Daniel find kindness and compassion in the sight of the prince of the eunuchs" (1:9) | low — the favor-with-authorities register (cf. the pack's Esther 4:14 anchor). CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- fasting | daniel fast | realistic queries: "what is the daniel fast", "daniel fast in the bible", "daniel diet vegetables and water" — the lay "Daniel fast" query family reaches for 1:12 ("let them give us vegetables to eat and water to drink") together with 10:2–3; the fasting pack's lexicon has no such term. CORPUS-BLOCKED (Daniel: zero fixture verses)
- holiness | purposed in his heart | realistic queries: "daniel purposed in his heart", "he would not defile himself", "standing firm in a secular culture" — anchor 1:8; matches the book doc's "Purposed in his heart" motif. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Daniel 2 (subdivided: 2:1–13; 2:14–23; 2:24–45; 2:46–49)
Existing tags (book doc): `dreams-and-visions`, `prayer`, `wisdom-from-god`, `providence`, `praise`, `occult-and-divination`, `god-reigns`
### Applied-tag deltas
- KEEP `dreams-and-visions` — the king "dreamed dreams; and his spirit was troubled" (2:1); "the secret was revealed to Daniel in a vision of the night" (2:19); the pack already anchors Daniel 2:28.
- KEEP `prayer` — under the death decree the four "desire mercies of the God of heaven concerning this secret" (2:18), and the answer comes (2:19).
- KEEP `wisdom-from-god` — "He gives wisdom to the wise, and knowledge to those who have understanding" (2:21); "I thank you and praise you, O God of my fathers, who have given me wisdom and might" (2:23).
- KEEP `providence` — "He changes the times and the seasons. He removes kings and sets up kings." (2:21).
- KEEP `praise` — "Then Daniel blessed the God of heaven" (2:19); "Blessed be the name of God forever and ever; for wisdom and might are his" (2:20).
- KEEP `occult-and-divination` — the diviner guild's own confession of failure: "There is not a man on the earth who can show the king’s matter" (2:10), answered by "there is a God in heaven who reveals secrets" (2:28) — described, never taught.
- KEEP `god-reigns` — "the God of heaven will set up a kingdom which will never be destroyed" (2:44).
- No ADD — at seven tags every remaining candidate fails the bar or duplicates: `kingdom-of-heaven` on 2:44 would read the NT kingdom teaching back onto the dream and duplicate `god-reigns` (broad-duplicating-specific); `thanksgiving` at 2:23 stays folded under `praise` per book doc Decisions #26; `messianic-prophecy` on the stone (2:34–35, 44–45) would adjudicate an identification the text itself does not make (the text interprets the stone as the kingdom, 2:44 — consistent with book doc Decisions #29 on `christ-the-cornerstone`).
### Anchor-extension candidates
- providence | 2:20-22 | "He changes the times and the seasons. He removes kings and sets up kings." (2:21) | high — the pack's own lexicon already carries "god rules over the nations" and "god is in control of governments" with no Daniel anchor; this is the Bible's most direct statement of that lexicon. CORPUS-BLOCKED (Daniel: zero fixture verses)
- god-reigns | 2:44 | "the God of heaven will set up a kingdom which will never be destroyed" (2:44) | medium-high. CORPUS-BLOCKED (Daniel: zero fixture verses)
- occult-and-divination | 2:27-28 | "The secret which the king has demanded can’t be shown to the king by wise men, enchanters, magicians, or soothsayers" (2:27) | medium — the divination-fails-where-God-reveals register; pack anchors are all command/narrative-warning texts. CORPUS-BLOCKED (Daniel: zero fixture verses)
- wisdom-from-god | 2:20-23 | "He gives wisdom to the wise, and knowledge to those who have understanding" (2:21) | medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- providence | he removes kings and sets up kings | realistic queries: "he removes kings and sets up kings", "does god put kings in power", "who puts leaders in power" — matches the book doc's "Most High rules" motif queries. CORPUS-BLOCKED (Daniel: zero fixture verses)
- dreams-and-visions | god who reveals secrets | realistic queries: "god who reveals secrets", "god reveals mysteries", "can god tell you your dream" — anchor 2:28, already in the pack. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- None. (The stone cut without hands stays a motif candidate per the book doc; no id fits without adjudication.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (2:1–13; 2:14–23; 2:24–45; 2:46–49) — marked for per-verse refinement
### Decisions record
- None.

## Daniel 3
Existing tags (book doc): `faith`, `worship`, `trust-in-god`, `gods-protection`, `angels`, `idolatry`, `persecuted-for-gods-word`
### Applied-tag deltas
- KEEP `faith` — the unconditional stake: "our God whom we serve is able to deliver us from the burning fiery furnace; and he will deliver us out of your hand, O king." (3:17), and "But if not, let it be known to you, O king, that we will not serve your gods or worship the golden image which you have set up." (3:18).
- KEEP `worship` — the chapter's contest is who may be worshiped: "you fall down and worship the golden image that Nebuchadnezzar the king has set up" (3:5), refused "that they might not serve nor worship any god except their own God" (3:28).
- KEEP `trust-in-god` — the king's verdict: God "delivered his servants who trusted in him" (3:28).
- KEEP `gods-protection` — "the fire had no power on their bodies" (3:27); "there is no other god who is able to deliver like this" (3:29).
- KEEP `angels` — "who has sent his angel and delivered his servants who trusted in him" (3:28), reported without adjudicating the 3:25 fourth figure (book doc Decisions #9 framing preserved).
- KEEP `idolatry` — state-compelled worship of a made image (3:5–6), refused: "They don’t serve your gods, and don’t worship the golden image which you have set up." (3:12).
- KEEP `persecuted-for-gods-word` (adopted id, log 1770) — "certain Chaldeans came near and brought accusation against the Jews" (3:8) and the furnace follows precisely their fidelity (3:12–23).
- No ADD — `governing-authorities` considered (the refusal of a royal decree of commanded worship, 3:16–18, is the OT's locus classicus for the obey-God-rather-than-men register in that pack's lexicon) and NOT added: the chapter's own substance — exclusive worship kept and vindicated — is already carried by `worship`, `idolatry`, and `persecuted-for-gods-word`; the civil-authority framing is the reader's category, not the chapter's teaching. Delegated default, reversible; carried as an anchor-extension candidate below.
### Anchor-extension candidates
- faith | 3:16-18 | "But if not, let it be known to you, O king, that we will not serve your gods or worship the golden image which you have set up." (3:18) | high — the "but if not" faith text; the faith pack has only two anchors (Heb 11:6; Rom 10:17) and nothing narrative. CORPUS-BLOCKED (Daniel: zero fixture verses)
- gods-protection | 3:24-28 | "the fire had no power on their bodies" (3:27) | high — "God in the fire" deliverance; pack anchors are Psalms only. CORPUS-BLOCKED (Daniel: zero fixture verses)
- governing-authorities | 3:16-18 | "we have no need to answer you in this matter" (3:16) | low-medium — enacted obey-God-rather-than-men alongside the pack's Acts 5:29; NOT applied as a display tag (see delta note). CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- gods-protection | fiery furnace | realistic queries: "the fiery furnace", "shadrach meshach and abednego", "god in the fire with us" — among the heaviest lay Daniel queries; no pack lexicon carries any of it. CORPUS-BLOCKED (Daniel: zero fixture verses)
- faith | but if not | realistic queries: "but if not bible verse", "faith even if god doesn't deliver", "trusting god when he doesn't answer" — matches the book doc's "But if not" motif. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- ROUTED — corpus-blocked roster row 17 `courage`: Dan 3:16–18 is that row's own roadmap append ("its roadmap appends (Dan 3; 6)"); already on the corpus-blocked roster, row 17 — no duplicate candidate here.
- ROUTED — corpus-blocked roster row 4 `persecuted-for-gods-word`: Dan 3 is among the row's recorded blocking refs; the display tag above stands (adopted vocabulary), but all engine-side anchor material for this id routes to row 4.
### Decline-overturn proposals
- None. (Book doc Decisions #21 — `suffering-for-christ` NOT tagged, NT-framed — re-checked and upheld; no new textual evidence.)
### Ceiling / refinement flags
- none (7 tags — over soft cap 6, under hard ceiling 8; every tag independently clears the bar; standing state from the approved application pass)
### Decisions record
- None. (No yield: the one candidate not added, `governing-authorities`, was declined on presence-of-teaching grounds, not capped out.)

## Daniel 4 (subdivided: 4:1–3; 4:4–18; 4:19–27; 4:28–33; 4:34–37)
Existing tags (book doc): `dreams-and-visions`, `humble-exaltation`, `divine-judgment`, `providence`, `praise`, `god-reigns`, `sovereignty-of-god`, `angels`
### Applied-tag deltas
- KEEP `dreams-and-visions` — "I saw a dream which made me afraid" (4:5), interpretable only by Daniel (4:18–19).
- KEEP `humble-exaltation` — the full arc: "Is not this great Babylon, which I have built" (4:30) to abasement to restoration, closing "those who walk in pride he is able to abase" (4:37).
- KEEP `divine-judgment` — "The sentence is by the decree of the watchers" (4:17); "it is the decree of the Most High, which has come on my lord the king" (4:24), executed the same hour (4:31–33).
- KEEP `providence` — the refrain "the Most High rules in the kingdom of men, and gives it to whomever he will" (4:17, 25, 32); "no one can stop his hand" (4:35).
- KEEP `praise` — "I blessed the Most High, and I praised and honored him who lives forever" (4:34).
- KEEP `god-reigns` — "His kingdom is an everlasting kingdom." (4:3), the kingship the ordeal ends by praising (4:34, 37).
- KEEP `sovereignty-of-god` (adopted id, log 1765) — the taught rule-over-governments doctrine, distinct register from `providence` per the application pass's both-tags reasoning (4:17, 25, 32).
- KEEP `angels` — "a holy watcher came down from the sky" (4:13) bearing the sentence (4:17).
- No ADD — chapter is at the hard ceiling of 8. `repentance` considered at 4:27 ("break off your sins by righteousness, and your iniquities by showing mercy to the poor") and declined on the presence bar: one verse of counsel inside a humbling narrative, thin single-verse — a presence-bar fail, not a cap yield.
### Anchor-extension candidates
- humble-exaltation | 4:29-37 | "those who walk in pride he is able to abase" (4:37) | high — the pack has no Daniel anchor; the recorded decline routing (pride at Dan 4:30, 37 → `humble-exaltation`, PR #41 lexicon extension) points exactly here. CORPUS-BLOCKED (Daniel: zero fixture verses)
- providence | 4:34-35 | "he does according to his will in the army of heaven, and among the inhabitants of the earth" (4:35) | medium-high. CORPUS-BLOCKED (Daniel: zero fixture verses)
- god-reigns | 4:1-3, 34 | "His kingdom is an everlasting kingdom." (4:3) | medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- humble-exaltation | those who walk in pride he is able to abase | realistic queries: "god humbles the proud king", "nebuchadnezzar eats grass", "pride comes before a fall in the bible" — anchor 4:28–37. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- `sovereignty-of-god` — adopted-id engine candidate (NOT a fresh mint; source: adopted display vocabulary, tag-gaps log line 1765, Isaiah-proposed row with Jeremiah and Daniel appends; no pack among the 239 engine ids). Daniel anchors: 4:17, 25, 32 ("the Most High rules in the kingdom of men, and gives it to whomever he will"), 4:35 ("no one can stop his hand"), 5:21. Realistic queries: "gods sovereignty over nations", "is god in control of governments", "god rules over kings". Register boundary vs `providence` (event-steering) is recorded in daniel.md Decisions #37 and must be honored at pack design. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit hard ceiling 8; book doc subdivides this chapter (4:1–3; 4:4–18; 4:19–27; 4:28–33; 4:34–37) — marked for per-verse refinement
### Decisions record
- None. (No yield: `repentance` failed the presence bar independently of the ceiling — see delta note.)

## Daniel 5
Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `providence`, `idolatry`, `sovereignty-of-god`
### Applied-tag deltas
- KEEP `divine-judgment` — the hand-written sentence read out: "God has counted your kingdom, and brought it to an end" (5:26), "you are weighed in the balances, and are found wanting" (5:27), executed that night (5:30).
- KEEP `humble-exaltation` — Nebuchadnezzar deposed "when his heart was lifted up, and his spirit was hardened so that he dealt proudly" (5:20) becomes the ignored warning: "You, his son, Belshazzar, have not humbled your heart, though you knew all this" (5:22).
- KEEP `providence` — "the Most High God gave Nebuchadnezzar your father the kingdom" (5:18), and holds Belshazzar's breath and ways in his hand (5:23).
- KEEP `idolatry` — the sacrilege that triggers the sentence: they "praised the gods of gold, and of silver, of bronze, of iron, of wood, and of stone" (5:4), indicted against "the God in whose hand your breath is" (5:23).
- KEEP `sovereignty-of-god` (adopted id, log 1765) — the taught doctrine: "until he knew that the Most High God rules in the kingdom of men, and that he sets up over it whomever he will" (5:21).
- No ADD — no further concept clears the bar. (`wisdom-from-god` stays un-tagged per book doc Decisions #24 — the chapter's wisdom-attributions are the queen's and king's pagan phrasing; re-checked, upheld. `the-breath-of-life` considered at 5:23 "the God in whose hand your breath is" — a dependence-on-God clause, not the pack's soul/afterlife teaching register; declined on the presence bar.)
### Anchor-extension candidates
- divine-judgment | 5:22-30 | "you are weighed in the balances, and are found wanting" (5:27) | high — the writing-on-the-wall judgment scene; the pack's lexicon ("gods judgment on sin") has no Daniel anchor. CORPUS-BLOCKED (Daniel: zero fixture verses)
- humble-exaltation | 5:18-22 | "You, his son, Belshazzar, have not humbled your heart, though you knew all this" (5:22) | medium — the recorded decline routing (pride at Dan 5:20–23 → `humble-exaltation`) points here. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- divine-judgment | the writing on the wall | realistic queries: "writing on the wall meaning", "mene mene tekel meaning", "weighed in the balances and found wanting" — matches the book doc's motif; anchor 5:5, 24–28. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Daniel 6
Existing tags (book doc): `prayer`, `gods-protection`, `trust-in-god`, `work-and-diligence`, `persecuted-for-gods-word`, `leadership`, `angels`, `god-reigns`
### Applied-tag deltas
- KEEP `prayer` — the story's hinge: "he kneeled on his knees three times a day, and prayed, and gave thanks before his God, as he did before" (6:10).
- KEEP `gods-protection` — "My God has sent his angel, and has shut the lions’ mouths" (6:22).
- KEEP `trust-in-god` — the narrator's verdict: "no kind of harm was found on him, because he had trusted in his God" (6:23).
- KEEP `work-and-diligence` — faithful service leaves no charge: "they could find no occasion or fault, because he was faithful" (6:4) (borderline flag in book doc Decisions #15 stands).
- KEEP `persecuted-for-gods-word` (adopted id, log 1770) — a law engineered against his fidelity alone: "unless we find it against him concerning the law of his God" (6:5).
- KEEP `leadership` — "over them three presidents, of whom Daniel was one" (6:2), "because an excellent spirit was in him" (6:3) — the governing register alongside `work-and-diligence`'s working one.
- KEEP `angels` — "My God has sent his angel, and has shut the lions’ mouths" (6:22).
- KEEP `god-reigns` — Darius's decree: "For he is the living God, and steadfast forever." (6:26).
- No ADD — chapter is at the hard ceiling of 8; see Decisions record for the one yielded candidate.
### Anchor-extension candidates
- prayer | 6:10 | "he kneeled on his knees three times a day, and prayed, and gave thanks before his God, as he did before" (6:10) | high — the pack has no Daniel anchor and its lexicon nothing for fixed daily prayer; the book doc's "three-times-daily prayer" motif feeds it. CORPUS-BLOCKED (Daniel: zero fixture verses)
- gods-protection | 6:19-23 | "My God has sent his angel, and has shut the lions’ mouths" (6:22) | high. CORPUS-BLOCKED (Daniel: zero fixture verses)
- integrity | 6:3-4 | "There wasn’t any error or fault found in him." (6:4) | medium — the blameless-under-scrutiny register; the pack (Prov 28:6; Job 31:5–6) has no narrative vindication anchor. CORPUS-BLOCKED (Daniel: zero fixture verses)
- governing-authorities | 6:10 | "When Daniel knew that the writing was signed" (6:10) | low — companion to the Dan 3:16–18 candidate: quiet noncompliance with an unlawful decree; NOT applied as a display tag (same reasoning as ch 3). CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- gods-protection | daniel in the lions den | realistic queries: "daniel in the lions den", "god shut the mouths of lions", "the lions den bible story" — heavy lay query family with no lexicon home. CORPUS-BLOCKED (Daniel: zero fixture verses)
- prayer | praying like daniel | realistic queries: "praying like daniel", "praying three times a day", "daily prayer routine in the bible" — anchor 6:10; matches the book doc motif. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- ROUTED — corpus-blocked roster row 17 `courage`: Dan 6 is that row's own roadmap append; already on the corpus-blocked roster, row 17 — no duplicate candidate.
- ROUTED — corpus-blocked roster row 32 `deliverance`: "Your God whom you serve continually, he will deliver you." (6:16); "He delivers and rescues." (6:27) — squarely that row's rescue-narrative register. Dan 6:16, 20, 27 are NOT among the row's recorded refs; offered to the expansion-thread queue as additional material for row 32, not as a new candidate.
- ROUTED — corpus-blocked roster row 4 `persecuted-for-gods-word`: Dan 6 is among the row's recorded blocking refs; engine-side anchor material routes to row 4.
### Decline-overturn proposals
- None. (Book doc Decisions #28 — `envy-and-jealousy` not tagged, motive unnamed in the text — re-checked against 6:3–5 and upheld; no new textual evidence.)
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement (chapter is NOT subdivided in the book doc; Decisions #5 there records the deliberate no-split, so refinement should anchor at verse ranges 6:1–9 / 6:10–24 / 6:25–28 if taken up)
### Decisions record
- YIELD — `integrity` met the presence bar (6:3–4: faultless under hostile scrutiny is depicted substantially, "There wasn’t any error or fault found in him.") but the chapter stands at the hard ceiling of 8 and the newcomer duplicates the already-carried 6:3–4 material (`work-and-diligence` + `leadership`) — yielded per §11.6 (broad-duplicating-specific), carried instead as the anchor-extension candidate above. No existing tag was dropped.

## Daniel 7 (subdivided: 7:1–8; 7:9–12; 7:13–14; 7:15–28)
Existing tags (book doc): `dreams-and-visions`, `divine-judgment`, `providence`, `god-reigns`, `messianic-prophecy`
### Applied-tag deltas
- KEEP `dreams-and-visions` — "Daniel had a dream and visions of his head while on his bed" (7:1).
- KEEP `divine-judgment` — the courtroom: "The judgment was set. The books were opened." (7:10); "they will take away his dominion" (7:26).
- KEEP `providence` — dominion given and removed from above: "dominion was given to it" (7:6), and the kingdom granted from the throne (7:14, 27).
- KEEP `god-reigns` — "Dominion was given him, and glory, and a kingdom, that all the peoples, nations, and languages should serve him." (7:14); "the saints of the Most High will receive the kingdom" (7:18).
- KEEP `messianic-prophecy` — "there came with the clouds of the sky one like a son of man" (7:13), the pack's own Daniel 7:13-14 anchor; carried strictly as the entry's signposted reading, no identification asserted (book doc Decisions #10 framing preserved).
- No ADD — `end-times` on this chapter is FLAGGED, not resolved (see Decisions record); `antichrist` stays off the little-horn texts per the standing contested-call record (§1(e): "identifying them with the antichrist is precisely the contested identification the Daniel book doc declines to adjudicate"); `second-coming` on 7:13 would be a later-revelation read-back (book doc Decisions #10).
### Anchor-extension candidates
- divine-judgment | 7:9-12 | "The judgment was set. The books were opened." (7:10) | high — the throne-and-books judgment scene; no pack anchors it (the pack's Rev 20:11-15 is its NT parallel). CORPUS-BLOCKED (Daniel: zero fixture verses)
- god-reigns | 7:27 | "The kingdom and the dominion, and the greatness of the kingdoms under the whole sky, will be given to the people of the saints of the Most High." (7:27) | medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- divine-judgment | ancient of days | realistic queries: "who is the ancient of days", "ancient of days meaning", "the books were opened at the judgment" — anchor 7:9–10; matches the book doc's motif. CORPUS-BLOCKED (Daniel: zero fixture verses)
- messianic-prophecy | one like a son of man | realistic queries: "son of man in daniel", "one like a son of man meaning", "why did jesus call himself the son of man" — anchor 7:13–14 (already the pack's); the pack's own framing (prophecies about Jesus) carries the signposted connection without adjudicating a scheme. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- None here. (The books-opened / written-in-the-book material of 7:10 rides the `book-of-life` candidate recorded at chapter 12, where the stronger verse lives.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (7:1–8; 7:9–12; 7:13–14; 7:15–28) — marked for per-verse refinement
### Decisions record
- FLAG (not a delta): `end-times` (adopted id, log 1759) genuinely touches this chapter — the vision runs to the final judgment and the everlasting kingdom, and 7:25's "until a time and times and half a time" is end-schedule vocabulary — but the chapter lacks the "time of the end" phrase the adopted row is scoped by, and the row's scope (merge-or-two-ids vs `day-of-the-lord`, boundary with `second-coming`) is an open question with Jesse project-wide (corpus-blocked roster row 5 carries the explicit Jesse gate). Flagged for the scope ruling rather than resolved either way; no tag applied.

## Daniel 8 (subdivided: 8:1–14; 8:15–27)
Existing tags (book doc): `dreams-and-visions`, `humble-exaltation`, `end-times`, `angels`
### Applied-tag deltas
- KEEP `dreams-and-visions` — "a vision appeared to me, even to me, Daniel" (8:1), interpreted at command (8:16).
- KEEP `humble-exaltation` — self-magnifying powers broken from above: "The male goat magnified himself exceedingly." (8:8) and its horn snaps; the fierce king — "He will magnify himself in his heart" — is "broken without human hands" (8:25) (humbling-only precedent per book doc Decisions #16).
- KEEP `end-times` (adopted id, log 1759) — the vision's own stated horizon: "the vision belongs to the time of the end" (8:17); "it belongs to the appointed time of the end" (8:19).
- KEEP `angels` — "Gabriel, make this man understand the vision" (8:16).
- No ADD — `divine-judgment` stays off per book doc Decisions #25 (8:25 is a single-verse presence; re-checked, upheld); nothing else clears the bar.
### Anchor-extension candidates
- humble-exaltation | 8:23-25 | "but he will be broken without human hands" (8:25) | medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- angels | gabriel | realistic queries: "gabriel in the bible", "who is the angel gabriel", "what angels are named in the bible" — the pack's lexicon has no named-angel terms though it anchors Daniel 9:21; Dan 8:16 is Gabriel's first appearance in Scripture. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- ROUTED — corpus-blocked roster row 5 `end-times`: the display tag above stands (adopted vocabulary), but all engine-side material for this id (8:17, 19, 26) routes to row 5, which also carries the explicit Jesse gate (merge-or-two-ids vs `day-of-the-lord`).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter (8:1–14; 8:15–27) — marked for per-verse refinement
### Decisions record
- None.

## Daniel 9 (subdivided: 9:1–19; 9:20–27)
Existing tags (book doc): `prayer`, `repentance`, `forgiveness-of-sins`, `covenant`, `fasting`, `angels`, `messianic-prophecy`
### Applied-tag deltas
- KEEP `prayer` — one long recorded prayer, "to seek by prayer and petitions, with fasting and sackcloth and ashes" (9:3), answered mid-sentence (9:20–21).
- KEEP `repentance` — corporate confession without self-defense: "we have sinned, and have dealt perversely, and have done wickedly, and have rebelled" (9:5), with the acknowledged need to "turn from our iniquities" (9:13).
- KEEP `forgiveness-of-sins` — "To the Lord our God belong mercies and forgiveness" (9:9); "Lord, hear. Lord, forgive. Lord, listen and do." (9:19).
- KEEP `covenant` — addressed to the God "who keeps covenant and loving kindness with those who love him and keep his commandments" (9:4), whose covenant curses have been justly poured out (9:11–13).
- KEEP `fasting` — "with fasting and sackcloth and ashes" (9:3); the pack already anchors Daniel 9:3.
- KEEP `angels` — "the man Gabriel, whom I had seen in the vision at the beginning, being caused to fly swiftly, touched me about the time of the evening offering" (9:21).
- KEEP `messianic-prophecy` — "the Anointed One will be cut off, and will have nothing" (9:26), carried as the entry's signposted reading with no calculation scheme endorsed (book doc Decisions #11 framing preserved).
- ADD `mercy` — WEB quote: "we do not present our petitions before you for our righteousness, but for your great mercies’ sake" (9:18; with 9:9, "To the Lord our God belong mercies and forgiveness") — the prayer's entire stated basis is God's mercy against Israel's demerit, the pack's God's-mercy register depicted as teaching substance, not a passing touch. Distinct register from `forgiveness-of-sins` (the pardon asked) — this names the ground it is asked on. Delegated-default ADD, reversible; it takes the chapter to the hard ceiling of 8, every tag independently clearing the bar.
### Anchor-extension candidates
- prayer | 9:3-19 | "Lord, hear. Lord, forgive. Lord, listen and do." (9:19) | high — the OT's model corporate-confession prayer; the pack has no OT prayer-narrative anchor. CORPUS-BLOCKED (Daniel: zero fixture verses)
- repentance | 9:4-14 | "we have sinned, and have dealt perversely, and have done wickedly, and have rebelled" (9:5) | medium-high. CORPUS-BLOCKED (Daniel: zero fixture verses)
- mercy | 9:9, 17-19 | "we do not present our petitions before you for our righteousness, but for your great mercies’ sake" (9:18) | medium — stands or falls with the ADD above. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- prayer | prayer of confession | realistic queries: "prayer of confession in the bible", "corporate confession of sin", "daniels prayer for his people" — anchor 9:3–19. CORPUS-BLOCKED (Daniel: zero fixture verses)
- messianic-prophecy | seventy weeks | realistic queries: "seventy weeks of daniel explained", "daniel 9 prophecy", "the anointed one cut off" — anchor 9:24–26; CAUTION carried from the book doc's motif list: routing must locate the passage descriptively and must NOT endorse any calculation scheme. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- None.
### Decline-overturn proposals
- None. (The recorded intercession→`prayer` ruling — declines §3.1, followed by the Daniel block — is honored: 9:3–19 stays under `prayer`, no intercession id proposed.)
### Ceiling / refinement flags
- hit hard ceiling 8 (after the `mercy` ADD); book doc subdivides this chapter (9:1–19; 9:20–27) — marked for per-verse refinement
### Decisions record
- The `mercy` ADD is recorded as a delegated default (see delta) — reversible; if the orchestrator judges the chapter's mercy material already adequately served by `forgiveness-of-sins`, drop the ADD, in which case the mercy anchor-extension candidate above still stands on its own.

## Daniel 10
Existing tags (book doc): `dreams-and-visions`, `fear-not`, `prayer`, `spiritual-warfare`, `angels`, `fasting`
### Applied-tag deltas
- KEEP `dreams-and-visions` — "So I was left alone and saw this great vision." (10:8), the overwhelming appearance of 10:5–9.
- KEEP `fear-not` — twice with a strengthening touch: "Don’t be afraid, Daniel" (10:12); "Greatly beloved man, don’t be afraid. Peace be to you. Be strong." (10:19) (borderline flag in book doc Decisions #19 stands).
- KEEP `prayer` — "from the first day that you set your heart to understand, and to humble yourself before your God, your words were heard" (10:12) — heard at once, answered three weeks later.
- KEEP `spiritual-warfare` (adopted id, log 1758) — "the prince of the kingdom of Persia withstood me twenty-one days" (10:13), the messenger returning to that fight (10:20–21); strictly the text's own words, no speculative demonology.
- KEEP `angels` — "Michael, one of the chief princes, came to help me" (10:13); "Michael your prince" (10:21).
- KEEP `fasting` — "I, Daniel, was mourning three whole weeks" (10:2); "I ate no pleasant food. No meat or wine came into my mouth." (10:3).
- No ADD — at the soft cap of 6 and nothing further clears the bar. (`gods-love` considered at "Daniel, you greatly beloved man", 10:11, and 10:19 — a personal address to Daniel, not the pack's taught God's-love substance; carried as a lexicon candidate below. `strength-in-weakness` stays off per book doc Decisions #23; re-checked, upheld.)
### Anchor-extension candidates
- fasting | 10:2-3 | "I ate no pleasant food. No meat or wine came into my mouth." (10:3) | medium — the pack anchors Daniel 9:3 but not the three-week partial fast that the lay "Daniel fast" family actually reaches for. CORPUS-BLOCKED (Daniel: zero fixture verses)
- fear-not | 10:12, 19 | "Greatly beloved man, don’t be afraid. Peace be to you. Be strong." (10:19) | low-medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- fasting | daniel fast | (same candidate as chapter 1; the two anchors 1:12 and 10:2–3 belong together) realistic queries: "what is the daniel fast", "daniel fast rules", "21 day daniel fast". CORPUS-BLOCKED (Daniel: zero fixture verses)
- angels | michael the archangel | realistic queries: "michael the archangel in the bible", "who is michael in daniel", "michael the great prince" — anchors 10:13, 21; 12:1. CORPUS-BLOCKED (Daniel: zero fixture verses)
- gods-love | greatly beloved | realistic queries: "greatly beloved in the bible", "does god delight in me", "beloved by god verse" — anchors 9:23; 10:11, 19; matches the book doc's "Greatly beloved" motif feeding the `gods-love` lexicon. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- ROUTED — corpus-blocked roster row 12 `spiritual-warfare`: Dan 10:13, 20–21 (and 12:1) are that row's own recorded blocking refs; the display tag above stands (adopted vocabulary), but all engine-side material routes to row 12, whose recorded lexicon fact (`resisting-the-devil` already carries the bare phrase "spiritual warfare") and two-register decision with `deliverance-from-demons` govern any eventual pack.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none (at soft cap 6; not subdivided — the book doc's Decisions #7 records chapters 10–12 as one continuous vision with a single BSB anchor each)
### Decisions record
- None.

## Daniel 11 (subdivided: 11:1–35; 11:36–45)
Existing tags (book doc): `providence`, `testing`, `humble-exaltation`, `end-times`
### Applied-tag deltas
- KEEP `providence` — the wars run on God's clock: "for the end will still be at the appointed time" (11:27), "it is yet for the time appointed" (11:35), "for that which is determined will be done" (11:36) (borderline flag in book doc Decisions #18 stands).
- KEEP `testing` — the stated refining purpose: "to refine them, and to purify, and to make them white, even to the time of the end" (11:35) (borderline flag in book doc Decisions #17 stands — God unnamed as agent in the verse).
- KEEP `humble-exaltation` — "He will exalt himself and magnify himself above every god" (11:36), "yet he will come to his end, and no one will help him" (11:45) (humbling-only precedent, Decisions #16).
- KEEP `end-times` (adopted id, log 1759) — the text's own vocabulary: "even to the time of the end" (11:35); "At the time of the end the king of the south will contend with him" (11:40).
- ADD `persecuted-for-gods-word` (adopted id, log 1770) — WEB quote: "Those who are wise among the people will instruct many; yet they will fall by the sword and by flame, by captivity and by plunder, many days." (11:33; with 11:32, "but the people who know their God will be strong and take action") — the faithful suffer precisely for fidelity and instruction under the sanctuary-profaning king; substantial (11:32–35), not a touch, and the same translation-neutral framing the application pass used on chs 3 and 6. Delegated-default ADD, reversible; the chapter moves from 4 to 5 tags. Cross-note: `testing` carries 11:35's refining purpose — distinct registers (the suffering vs its stated purpose), both honestly present.
- No other ADD — `knowing-god` considered at 11:32 ("but the people who know their God will be strong and take action") and declined on the presence bar: one clause in a 45-verse war chronicle, thin single-verse; carried as anchor-extension and lexicon candidates below. `covenant` considered ("the holy covenant", 11:28, 30, 32) and declined: the covenant is the object of hostility in the narrative, not covenant teaching.
### Anchor-extension candidates
- knowing-god | 11:32 | "but the people who know their God will be strong and take action" (11:32) | medium-high — a famous verse squarely in the pack's register with no pack anchor; heavy in remembered (KJV-shaped) phrasing. CORPUS-BLOCKED (Daniel: zero fixture verses)
- testing | 11:33-35 | "to refine them, and to purify, and to make them white, even to the time of the end" (11:35) | medium — joins the pack's refining anchors (Zech 13:9; Mal 3:2-3). CORPUS-BLOCKED (Daniel: zero fixture verses)
- providence | 11:27-36 | "for the end will still be at the appointed time" (11:27) | low-medium — the appointed-time refrain. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- knowing-god | the people who know their god | realistic queries: "those who know their god will be strong", "the people that do know their god shall be strong and do exploits", "know your god and take action" — anchor 11:32 (second phrasing is the KJV-remembered form users actually type). CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- ROUTED — corpus-blocked roster row 4 `persecuted-for-gods-word`: Dan 11:32–35 is NEW material for that row (its recorded refs are Jer 20/26/37–38, Dan 3/6, Esther) — offered to the expansion-thread queue as an additional ref for row 4, not as a new candidate. The row's G4 collision warning (suffering-for-christ owns bare "persecution"/"persecuted") stands.
- ROUTED — corpus-blocked roster row 5 `end-times`: engine-side material (11:35, 40) routes to row 5.
### Decline-overturn proposals
- None. (The standing §1(e) `antichrist` record is honored: the 11:36–45 self-exalting-king texts are NOT appended toward any antichrist id — the identification is precisely what the book doc declines to adjudicate; the book doc's fulfillment-neutral framing of 11:2–35 vs 36–45 is preserved.)
### Ceiling / refinement flags
- book doc subdivides this chapter (11:1–35; 11:36–45) — marked for per-verse refinement
### Decisions record
- The `persecuted-for-gods-word` ADD is recorded as a delegated default (see delta) — reversible; if dropped, the row-4 routing note above still carries the 11:32–35 material engine-side.

## Daniel 12
Existing tags (book doc): `hope-in-god`, `heavenly-reward`, `gods-protection`, `resurrection-of-the-dead`, `end-times`, `angels`
### Applied-tag deltas
- KEEP `hope-in-god` — unequaled trouble answered with deliverance and awakening "some to everlasting life" (12:1–2), "Blessed is he who waits" (12:12), and rest with a sure inheritance (12:13).
- KEEP `heavenly-reward` — "Those who turn many to righteousness will shine as the stars forever and ever." (12:3); "you will rest, and will stand in your inheritance at the end of the days" (12:13).
- KEEP `gods-protection` — "your people will be delivered, everyone who is found written in the book" (12:1).
- KEEP `resurrection-of-the-dead` — the text's own statement, no read-back (book doc Decisions #13): "Many of those who sleep in the dust of the earth will awake, some to everlasting life, and some to shame and everlasting contempt." (12:2); the pack already anchors Daniel 12:2.
- KEEP `end-times` (adopted id, log 1759) — "shut up the words and seal the book, even to the time of the end" (12:4), sealed to the end (12:9, 13).
- KEEP `angels` — "At that time Michael will stand up, the great prince who stands for the children of your people" (12:1).
- No ADD — at soft cap 6 and nothing further clears the bar. (`testing`/purification considered at 12:10, "Many will purify themselves, and make themselves white, and be refined" — an echo of 11:35 without the chapter making it its substance; declined. `sharing-your-faith` considered at 12:3's turning many to righteousness — the pack is NT witness-framed and the verse is a single clause; declined; the motif's queries ride the heavenly-reward lexicon candidate below.)
### Anchor-extension candidates
- heavenly-reward | 12:3, 13 | "Those who turn many to righteousness will shine as the stars forever and ever." (12:3) | high — the pack (crown texts) has no OT anchor; "shine like stars" queries are homeless. CORPUS-BLOCKED (Daniel: zero fixture verses)
- gods-protection | 12:1 | "your people will be delivered, everyone who is found written in the book" (12:1) | low-medium. CORPUS-BLOCKED (Daniel: zero fixture verses)
### Lexicon candidates
- heavenly-reward | shine like the stars | realistic queries: "shine like stars bible verse", "those who turn many to righteousness", "will we shine in heaven" — anchor 12:3. CORPUS-BLOCKED (Daniel: zero fixture verses)
- resurrection-of-the-dead | sleep in the dust of the earth | realistic queries: "sleep in the dust of the earth meaning", "some to everlasting life some to shame", "resurrection in the old testament" — anchor 12:2, already the pack's. CORPUS-BLOCKED (Daniel: zero fixture verses)
### New-concept candidates
- `book-of-life` — NEW-CONCEPT CANDIDATE (promotion of a deliberately-open motif, not a decline overturn: the tag-gaps-review Daniel block records "book of life (7:10; 12:1) — left as a motif candidate, not a gap row; Rev 20:12 and Ps 69:28 would join if a future thread judges it concept-worthy" — this sweep is that future thread and judges it concept-worthy). Rationale: heavy lay query family with no home in the 239-id library or the adopted vocabulary — no pack lexicon carries "book of life". Daniel anchors: "your people will be delivered, everyone who is found written in the book" (12:1); "The judgment was set. The books were opened." (7:10). NT/OT joiners for the curator: Rev 20:12; Rev 3:5; Ps 69:28; Luke 10:20; Phil 4:3. Realistic queries: "book of life in the bible", "is my name written in the book of life", "names blotted out of the book of life". Gist caution: describe the figure as the texts do; assurance-seeking users overlap `assurance-of-salvation` — cross-reference, don't collide. CORPUS-BLOCKED (Daniel: zero fixture verses)
- ROUTED — corpus-blocked roster row 12 `spiritual-warfare`: 12:1 (Michael standing up) is among that row's recorded refs; per the application pass's recorded skip (daniel.md Decisions #37), no tag here — ch 10 is the concept's home; material routes to row 12.
- ROUTED — corpus-blocked roster row 5 `end-times`: engine-side material (12:4, 9, 13) routes to row 5.
### Decline-overturn proposals
- None. (Book doc Decisions #20 — `resurrection` ("He is risen") NOT tagged on 12:2 — re-checked and upheld: the general-resurrection statement is carried by `resurrection-of-the-dead`, whose pack anchors 12:2; no new evidence, and Decisions #31's `doubt` rejection at 12:8 likewise stands — incomprehension, not unbelief.)
### Ceiling / refinement flags
- none (at soft cap 6; not subdivided — single BSB anchor, per book doc Decisions #7)
### Decisions record
- None.

---

# Totals (Daniel 1–12)

- Chapters swept: 12 of 12 (entries above for every chapter; honest-and-empty outcomes noted inline where nothing changed).
- Applied-tag deltas: 2 ADD (`mercy` Dan 9; `persecuted-for-gods-word` Dan 11 — both delegated defaults, reversible), 71 KEEP, 0 DROP.
- Anchor-extension candidates: 31 lines (all marked CORPUS-BLOCKED).
- Lexicon candidates: 21 lines (20 distinct — the `fasting | daniel fast` candidate appears at chs 1 and 10 as one candidate with two anchors; all marked CORPUS-BLOCKED).
- New-concept candidates: 2 (`book-of-life` — genuine new mint candidate; `sovereignty-of-god` — adopted-id engine candidate, log 1765; both CORPUS-BLOCKED).
- Decline-overturn proposals: 0.
- Corpus-blocked roster routings: rows 4 (chs 3, 6, 11 — ch 11 material is NEW for the row), 5 (chs 8, 11, 12), 12 (chs 10, 12), 17 (chs 3, 6), 32 (ch 6 — NEW material for the row).
- Ceiling / refinement flags: chapters 2, 4, 7, 8, 9, 11 (book-doc subdivided) + 4, 6, 9 at the hard ceiling of 8 (9 reaches it via this sweep's ADD) — distinct flagged set: 2, 4, 6, 7, 8, 9, 11.
- Standing framing preserved: four kingdoms, furnace figure, son of man, seventy weeks, Daniel 11 referents all fulfillment-neutral/signposted; `antichrist` untouched; `end-times` scope flagged (ch 7) rather than resolved, per the open question with Jesse.
