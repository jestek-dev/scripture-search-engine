# 2 Chronicles sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (ids = YAML file basenames;
  14 pastoral-* files carry divergent inner ids — basename always wins), PLUS the §11.1
  adopted display-tag vocabulary per the BRIEFING §7 reconstruction (adopted-but-not-engine
  ids are exactly the corpus-blocked roster ids; each use below names its list).
- Book: 2 Chronicles (36 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/2-chronicles.md
    (FINAL 2026-08-23, 3 critic rounds; 2026-08-25 adopted-vocabulary application pass applied —
    Decisions #30 there itemizes 51 applications and 25 declines; those declines are prior art too)
  - Scout briefing + extracts: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
    (BRIEFING.md, conventions-extract.md, concept-inventory.md, concept-ids.txt,
    declines-and-contested.md, corpus-blocked-roster.md, book-docs-index.md,
    web-text-access.md, repo-state.md, plan-extract.md)
  - WEB text: repo-pinned VPL /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt,
    book code 2CH (822 verse lines verified) — the pinned-snapshot content (manifest sha b6f55cc7…,
    contentSha256 944e3883…, re-admitted 2026-08-25 in PR #53). Every WEB quote below was
    verified byte-for-byte (grep -F) against this file before appending.
  - Corpus-blocked roster (route, don't duplicate): engine-pack-backlog.md's 50-row roster —
    routed notes below name the roster row number.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification after every
  append, final survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## 2 Chronicles <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield and routed-note, what was yielded/routed and why — no silent drops, or "None.")
- Tag-id provenance convention: tags marked [engine] are among the 239 ontology/concepts ids;
  tags marked [adopted/roster] are §11.1 adopted display-tag ids that are corpus-blocked roster
  rows (usable as display tags per CONVENTIONS §11.1; engine work on them routes to the backlog).

### Vocabulary reference note (2026-08-26, mid-sweep coordinator update)

The §11.1 adopted-concepts list now exists canonically at
/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, engine-built
markers against the 239 census). It supersedes the BRIEFING §7 reconstruction named in this
ledger's header. Cross-checked: every non-engine id used in this ledger (`davidic-covenant`,
`exile-and-captivity`, `sacrifice-and-atonement`, `unequally-yoked`) appears in the canonical
file marked engine-built: no, and every formerly-adopted id this ledger marks [engine]
(`the-house-of-god`, `seeking-god`, `revival-and-reformation`, etc.) is marked engine-built: yes
there — the reconstruction and the canonical list agree for every id this book uses.

## 2 Chronicles 1

1. Existing tags (book doc): `wisdom-from-god`; `worship`
2. Applied-tag deltas:
   - KEEP `wisdom-from-god` [engine] — “Now give me wisdom and knowledge, that I may go out and come in before this people” (1:10), answered “wisdom and knowledge is granted to you” (1:12).
   - KEEP `worship` [engine] — Solomon and all the assembly go to “the high place that was at Gibeon; for God’s Tent of Meeting was there” (1:3), and he “offered one thousand burnt offerings on it” (1:6).
3. Anchor-extension candidates:
   - `wisdom-from-god` | 2 Chronicles 1:7-12 | “Now give me wisdom and knowledge, that I may go out and come in before this people” (1:10) | w0.8 — the narrative source-text of the ask-God-for-wisdom pattern the pack’s James 1:5 keystone teaches; no 2 Chronicles anchor exists in the pack.
4. Lexicon candidates:
   - `wisdom-from-god` | term: “solomon asked for wisdom” | queries: “Solomon asks God for wisdom”, “ask for wisdom like Solomon”, “God gave Solomon wisdom”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
8. Decisions record: `seeking-god` NOT added — 1:5 reads “Solomon and the assembly were seeking counsel there” (seeking counsel at the bronze altar, not the book’s seek-the-LORD formula); the book doc’s motif list cites 1:5 for the seeking motif, but the WEB wording does not carry the concept’s substance in-chapter. `asking-in-gods-will` stays off per the book doc Decisions #1 (later-revelation read-back; ruling respected, no new evidence).

## 2 Chronicles 2

1. Existing tags (book doc): `worship`; `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `worship` [engine] — the house’s stated purpose is Israel’s ordered worship: “to burn before him incense of sweet spices, for the continual show bread, and for the burnt offerings morning and evening, on the Sabbaths, on the new moons, and on the set feasts of the LORD our God. This is an ordinance forever to Israel.” (2:4), offered to a God “greater than all gods” (2:5).
   - KEEP `the-house-of-god` [engine — the id adopted 2026-08-25 is now among the 239 packs] — “Now Solomon decided to build a house for the LORD’s name, and a house for his kingdom.” (2:1), with the builder’s own limit: “who is able to build him a house, since heaven and the heaven of heavens can’t contain him?” (2:6).
3. Anchor-extension candidates:
   - `the-house-of-god` | 2 Chronicles 2:4-6 | “who is able to build him a house, since heaven and the heaven of heavens can’t contain him?” (2:6) | w0.6 — the pack anchors 2 Chr 7:12-16 but not the build-arc’s theology-of-the-house statement.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
8. Decisions record: `appointed-feasts` considered and NOT added — 2:4’s “on the set feasts of the LORD our God” is one phrase inside the purpose statement; the feast-calendar substance is stated in ch. 8 (see there). No yield.

## 2 Chronicles 3

1. Existing tags (book doc): `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `the-house-of-god` [engine] — the house itself rising: “Then Solomon began to build the LORD’s house at Jerusalem on Mount Moriah, where the LORD appeared to David his father” (3:1), through the gold-overlaid rooms to the two pillars named “Jachin” and “Boaz” (3:17). (Only one honest tag from the current vocabulary.)
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (1 tag; not subdivided in the book doc).
8. Decisions record: re-checked against the full 239-id library — an architectural record; no other concept’s teaching substance present (book doc Decisions #12 honest-and-empty reasoning stands, now with the one house tag). None.

## 2 Chronicles 4

1. Existing tags (book doc): `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `the-house-of-god` [engine] — the house furnished for its work, closing “Solomon made all the vessels that were in God’s house: the golden altar, the tables with the show bread on them” (4:19), lamp stands “according to the ordinance” (4:7, 4:20). (Only one honest tag from the current vocabulary.)
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (1 tag; not subdivided in the book doc).
8. Decisions record: re-checked against the full 239-id library — a furnishings inventory; nothing else clears the presence bar. None.

## 2 Chronicles 5

1. Existing tags (book doc): `presence-of-god`; `praise`; `worship`; `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `presence-of-god` [engine] — “then the house was filled with a cloud, even the LORD’s house” (5:13), “the priests could not stand to minister by reason of the cloud; for the LORD’s glory filled God’s house.” (5:14).
   - KEEP `praise` [engine] — “when the trumpeters and singers were as one, to make one sound to be heard in praising and thanking the LORD” with the refrain “For he is good, for his loving kindness endures forever!” (5:13).
   - KEEP `worship` [engine] — king and congregation before the ark, “sacrificing sheep and cattle that could not be counted or numbered for multitude” (5:6).
   - KEEP `the-house-of-god` [engine] — the finished house receives the ark: “all the work that Solomon did for the LORD’s house was finished” (5:1), the ark brought “into the inner sanctuary of the house, to the most holy place” (5:7).
   - ADD `glory-of-god` [engine] — the chapter’s climactic register in the concept’s own vocabulary: “for the LORD’s glory filled God’s house.” (5:14). Distinct from `presence-of-god`’s with-us register per the both-tags ruling (§11.2); the glory-filling-the-house scene is what a “glory of the LORD” searcher wants. The id entered the vocabulary after the book doc’s 131-id vintage; its 2026-08-25 pass had no such row.
3. Anchor-extension candidates:
   - `glory-of-god` | 2 Chronicles 5:13-14 | “the house was filled with a cloud, even the LORD’s house” … “for the LORD’s glory filled God’s house.” | w0.75 — the pack anchors Exod 33, Isa 6, Ezek 1/43 but not the temple-filling scene.
   - `presence-of-god` | 2 Chronicles 5:13-14 | “then the house was filled with a cloud, even the LORD’s house” | w0.6.
4. Lexicon candidates:
   - `glory-of-god` | term: “glory filled the temple” | queries: “the glory of the LORD filled the temple”, “glory filled the house of God”, “shekinah glory in the temple”. (The book doc’s motif 13 flagged the same phrasing gap against `presence-of-god`; `glory-of-god` is the better-fitting home now that it exists.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 tags; not subdivided in the book doc).
8. Decisions record: `thanksgiving` considered and NOT added — “praising and thanking the LORD” (5:13) is one act carried by `praise`; double-counting refused (matches the book doc’s ch. 20 precedent). None yielded.

## 2 Chronicles 6 (subdivided: 6:1–11; 6:12–42)

1. Existing tags (book doc): `prayer`; `gods-faithfulness`; `forgiveness-of-sins`; `repentance`; `covenant`; `davidic-covenant`; `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `prayer` [engine] — the dedication prayer itself: “to listen to the cry and to the prayer which your servant prays before you” (6:19), “Listen to the petitions of your servant and of your people Israel, when they pray toward this place.” (6:21).
   - KEEP `gods-faithfulness` [engine] — “who spoke with his mouth to David my father, and has with his hands fulfilled it” (6:4), “you spoke with your mouth, and have fulfilled it with your hand, as it is today” (6:15).
   - KEEP `forgiveness-of-sins` [engine] — the refrain: “then hear from heaven, and forgive the sin of your people Israel” (6:25), “and when you hear, forgive” (6:21).
   - KEEP `repentance` [engine] — the cases hinge on turning: “they turn again and confess your name” (6:24), “turn from their sin when you afflict them” (6:26), “if they return to you with all their heart and with all their soul” (6:38).
   - KEEP `covenant` [engine] — “you who keep covenant and loving kindness with your servants who walk before you with all their heart” (6:14), and the conditional word to David’s line (6:16).
   - KEEP `davidic-covenant` [adopted/roster row 44] — “There shall not fail you a man in my sight to sit on the throne of Israel” (6:16), closing “Remember your loving kindnesses to David your servant.” (6:42).
   - KEEP `the-house-of-god` [engine] — the prayer is the house’s charter: “heaven and the heaven of heavens can’t contain you; how much less this house which I have built!” (6:18), “that your eyes may be open toward this house day and night” (6:20).
3. Anchor-extension candidates:
   - `prayer` | 2 Chronicles 6:19-21 | “to listen to the cry and to the prayer which your servant prays before you” | w0.6 — the OT’s fullest prayer charter beyond the pack’s current anchors.
   - `forgiveness-of-sins` | 2 Chronicles 6:36-39 | “for there is no man who doesn’t sin” … “and forgive your people who have sinned against you” | w0.55.
4. Lexicon candidates:
   - `sin` | term: “there is no man who doesn’t sin” | queries: “no one is without sin”, “everyone sins bible verse”, “is anyone sinless”. (6:36 is a famous universal-sinfulness statement; `sin`’s lexicon has no such phrase; noted here rather than tagged — one clause inside a petition, below the presence bar.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags, all pre-existing, each independently clearing the bar; under the hard ceiling 8) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `davidic-covenant` (roster row 44) — 6:16-17, 42 are temple-side promise texts for that pack when PR-β lands; recorded here, not duplicated as a new proposal. `nations-and-peoples` considered and NOT added for the foreigner petition (6:32-33, “that all the peoples of the earth may know your name”) — two verses inside the prayer, a petition’s reach rather than the chapter’s substance; below the bar. None yielded.

## 2 Chronicles 7 (subdivided: 7:1–10; 7:11–22)

1. Existing tags (book doc): `prayer`; `repentance`; `forgiveness-of-sins`; `worship`; `thanksgiving`; `divine-judgment`; `seeking-god`; `the-house-of-god` (8 — at the hard ceiling)
2. Applied-tag deltas:
   - KEEP `prayer` [engine] — “I have heard your prayer” (7:12), “Now my eyes will be open and my ears attentive to prayer that is made in this place.” (7:15), and prayer inside the covenant terms: “humble themselves, pray, seek my face” (7:14).
   - KEEP `repentance` [engine] — “turn from their wicked ways” (7:14); the warning’s hinge: “But if you turn away and forsake my statutes” (7:19).
   - KEEP `forgiveness-of-sins` [engine] — “then I will hear from heaven, will forgive their sin, and will heal their land.” (7:14).
   - KEEP `worship` [engine] — fire falls and “They bowed themselves with their faces to the ground on the pavement, worshiped, and gave thanks to the LORD” (7:3).
   - KEEP `thanksgiving` [engine] — “worshiped, and gave thanks to the LORD” with the refrain “For he is good, for his loving kindness endures forever!” (7:3), the Levites’ instruments “made to give thanks to the LORD” (7:6).
   - KEEP `divine-judgment` [engine] — “then I will pluck them up by the roots out of my land which I have given them” (7:20), the house made “a proverb and a byword among all peoples” (7:20).
   - KEEP `seeking-god` [engine] — “if my people who are called by my name will humble themselves, pray, seek my face, and turn from their wicked ways” (7:14) — the pack’s own 2 Chr 7:14 anchor (w0.85).
   - KEEP `the-house-of-god` [engine] — “I have heard your prayer, and have chosen this place for myself for a house of sacrifice.” (7:12), “For now I have chosen and made this house holy, that my name may be there forever” (7:16) — the pack’s keystone anchor (2 Chr 7:12-16, w1).
3. Anchor-extension candidates:
   - `glory-of-god` | 2 Chronicles 7:1-3 | “fire came down from heaven and consumed the burnt offering and the sacrifices; and the LORD’s glory filled the house.” | w0.7.
   - `humble-exaltation` | 2 Chronicles 7:14 | “if my people who are called by my name will humble themselves, pray, seek my face” | w0.7 — the lexicon carries “humble yourselves”; the verse is a heavy humbling query target.
   - `forgiveness-of-sins` | 2 Chronicles 7:14 | “then I will hear from heaven, will forgive their sin, and will heal their land.” | w0.65.
4. Lexicon candidates:
   - `revival-and-reformation` | term: “God will heal our land” | queries: “will God heal our land”, “2 Chronicles 7:14 meaning”, “if my people who are called by my name”. (The pack anchors 7:14 at w1 and carries “if my people humble themselves and pray”; the heal-our-land and called-by-my-name phrasings are unserved variants. Guardrail: the book doc’s Decisions #4 covenant-scoping note — and the repo’s praying-for-leaders round-2 rejection of “2 Chr 7:14 as a modern-nation promise” — travel with this row.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: candidates exceeding the ceiling were declined, not swapped in — no existing tag yields (all eight independently clear the bar and none is a §11.6 yield-class member weaker than the newcomers): `revival-and-reformation` (its w1 anchor IS 7:14, but the chapter’s revival substance is carried by `repentance` + `seeking-god` + `prayer` here; declined at ceiling, anchor already in the pack); `glory-of-god` (7:1-3; declined at ceiling — recorded as anchor-extension candidate above; the display home for the glory scene is ch. 5’s ADD); `humble-exaltation` (7:14 one clause; declined at ceiling; anchor-extension candidate above). Routed to backlog: `davidic-covenant` (roster row 44) — 7:17-18 (“then I will establish the throne of your kingdom, according as I covenanted with David your father”), the roster row’s own named lone-free ref; recorded here, not re-proposed. Each decline reversible at the per-verse refinement pass.

## 2 Chronicles 8

1. Existing tags (book doc): `worship`
2. Applied-tag deltas:
   - KEEP `worship` [engine] — the completed house runs by the book: burnt offerings “even as the duty of every day required, offering according to the commandment of Moses” (8:13), priests and Levites in David’s divisions “to praise and to minister” (8:14).
   - ADD `appointed-feasts` [engine] — the feast calendar itself is stated as kept ordinance: “on the Sabbaths, on the new moons, and on the set feasts, three times per year, during the feast of unleavened bread, during the feast of weeks, and during the feast of booths.” (8:13) — the pack’s own vocabulary (its lexicon carries “feast of booths”; its anchors are Lev 23 / Deut 16:16-17-class calendar texts, and 8:13 is the monarchic keeping of exactly that calendar). The id entered the vocabulary after the book doc’s 131-id vintage.
3. Anchor-extension candidates:
   - `appointed-feasts` | 2 Chronicles 8:12-13 | “on the set feasts, three times per year, during the feast of unleavened bread, during the feast of weeks, and during the feast of booths” | w0.6.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
8. Decisions record: `holiness` considered and NOT added — 8:11 (“because the places where the LORD’s ark has come are holy”) is a single-verse rationale for a household move, below the substantial bar. None yielded.

## 2 Chronicles 9 (subdivided: 9:1–12; 9:13–28; 9:29–31)

1. Existing tags (book doc): `wisdom-from-god`
2. Applied-tag deltas:
   - KEEP `wisdom-from-god` [engine] — kings sought Solomon “to hear his wisdom, which God had put in his heart” (9:23); the queen who found “half of the greatness of your wisdom wasn’t told me” (9:6) blesses “the LORD your God, who delighted in you and set you on his throne” (9:8). (Only one honest tag from the current vocabulary.)
3. Anchor-extension candidates:
   - `wisdom-from-god` | 2 Chronicles 9:22-23 | “All the kings of the earth sought the presence of Solomon to hear his wisdom, which God had put in his heart.” | w0.55.
4. Lexicon candidates:
   - `wisdom-from-god` | term: “queen of sheba” | queries: “queen of Sheba visits Solomon”, “who was the queen of Sheba”, “queen of Sheba in the Bible”. (Name-locator query family with no lexicon home anywhere in the 239 packs; this chapter and 1 Kgs 10 are its texts.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (1 tag; sections diverge: Sheba / wealth / death).
8. Decisions record: re-checked against the 239-id library — the wealth catalog (9:13-28) depicts no concept’s teaching substance (`money-and-possessions` is the danger-of-riches register, a mismatch; `contentment` likewise). None yielded.

## 2 Chronicles 10

1. Existing tags (book doc): `providence`
2. Applied-tag deltas:
   - KEEP `providence` [engine] — the narrator’s verdict over the whole scene: “for it was brought about by God, that the LORD might establish his word, which he spoke by Ahijah the Shilonite to Jeroboam the son of Nebat.” (10:15). (Only one honest tag from the current vocabulary.)
3. Anchor-extension candidates:
   - `providence` | 2 Chronicles 10:15 | “for it was brought about by God, that the LORD might establish his word” | w0.6 — a narratorial sovereignty-over-politics attribution the pack’s OT anchors don’t cover.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (1 tag; not subdivided in the book doc).
8. Decisions record: routed to backlog: `counsel-and-advisers` (roster row 15) — 2 Chr 10:6-15 is the counsel-narrative twin of the roster’s named 1 Kgs 12:6-15 signature text: “King Rehoboam took counsel with the old men” (10:6), “But he abandoned the counsel of the old men which they had given him, and took counsel with the young men” (10:8, 10:13); recorded here, not duplicated as a new proposal. `receiving-correction` considered and NOT added — the chapter depicts counsel refused (the failure mode), and the concept’s substance is not stated in-chapter; per the Genesis-3 rule. None yielded.

## 2 Chronicles 11 (subdivided: 11:1–4; 11:5–12; 11:13–17; 11:18–23)

1. Existing tags (book doc): `obedience-to-the-word`; `worship`; `seeking-god`
2. Applied-tag deltas:
   - KEEP `obedience-to-the-word` [engine] — a mustered army stands down at the LORD’s word: “So they listened to the LORD’s words, and returned from going against Jeroboam.” (11:4).
   - KEEP `worship` [engine] — the faithful come “to Jerusalem to sacrifice to the LORD, the God of their fathers” (11:16), against Jeroboam’s “priests for the high places, for the male goat and calf idols which he had made” (11:15).
   - KEEP `seeking-god` [engine] — the migration’s stated motive: “those who set their hearts to seek the LORD, the God of Israel” (11:16).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (3 tags).
8. Decisions record: `idolatry` considered and NOT added — 11:15’s calf idols are one verse describing Jeroboam’s counterfeit as the Levites’ reason for leaving; the chapter’s substance is the faithful migration, not the idolatry teaching. None yielded.

## 2 Chronicles 12 (subdivided: 12:1–12; 12:13–16)

1. Existing tags (book doc): `divine-judgment`; `humble-exaltation`; `seeking-god`
2. Applied-tag deltas:
   - KEEP `divine-judgment` [engine] — “Shishak king of Egypt came up against Jerusalem, because they had trespassed against the LORD” (12:2), “You have forsaken me, therefore I have also left you in the hand of Shishak.” (12:5).
   - KEEP `humble-exaltation` [engine] — “Then the princes of Israel and the king humbled themselves” (12:6), “They have humbled themselves. I will not destroy them” (12:7), “When he humbled himself, the LORD’s wrath turned from him” (12:12).
   - KEEP `seeking-god` [engine] — the epitaph in the cautionary register: “He did that which was evil, because he didn’t set his heart to seek the LORD.” (12:14).
3. Anchor-extension candidates:
   - `humble-exaltation` | 2 Chronicles 12:6-7 | “They have humbled themselves. I will not destroy them” | w0.65 — the book’s first humbling-turns-the-sentence narrative; the pack has no 2 Chronicles anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (3 tags).
8. Decisions record: routed to backlog: `god-relents` (roster row 7) — 12:7 (“When the LORD saw that they humbled themselves, the LORD’s word came to Shemaiah, saying, ‘They have humbled themselves. I will not destroy them’”) is a wrath-relenting-on-response narrative for that pack’s re-pin curator, alongside its Jer 18 / Jonah 3 texts; recorded here, not duplicated as a new proposal. `repentance` stays off per the book doc Decisions #22 (12:6 humbling lacks turning language; no new evidence). None yielded.

## 2 Chronicles 13

1. Existing tags (book doc): `trust-in-god`; `covenant`; `gods-protection`; `worship`; `davidic-covenant`
2. Applied-tag deltas:
   - KEEP `trust-in-god` [engine] — the narrator’s explanation of the victory: “the children of Judah prevailed, because they relied on the LORD, the God of their fathers.” (13:18).
   - KEEP `covenant` [engine] — “the LORD, the God of Israel, gave the kingdom over Israel to David forever, even to him and to his sons by a covenant of salt” (13:5).
   - KEEP `gods-protection` [engine] — ambushed front and rear, “they cried to the LORD” (13:14) and “God struck Jeroboam and all Israel before Abijah and Judah” (13:15), “God delivered them into their hand” (13:16).
   - KEEP `worship` [engine] — the kept standing service against its counterfeit: “We have priests serving the LORD, the sons of Aaron, and the Levites in their work.” (13:10), morning-and-evening offerings, show bread, and lamp stand, “for we keep the instruction of the LORD our God” (13:11), against priests “of those who are no gods” (13:9).
   - KEEP `davidic-covenant` [adopted/roster row 44] — the sermon’s ground: “gave the kingdom over Israel to David forever… by a covenant of salt” (13:5, shared verse with `covenant`, the promise’s specific register per the book doc).
3. Anchor-extension candidates:
   - `trust-in-god` | 2 Chronicles 13:18 | “the children of Judah prevailed, because they relied on the LORD, the God of their fathers” | w0.6 — “relied on the LORD” is the book’s reliance formula; no pack anchor carries it.
4. Lexicon candidates:
   - `trust-in-god` | term: “relied on the LORD” | queries: “rely on God”, “relying on the Lord”, “what does it mean to rely on God”. (The lexicon has trust/lean-not phrasings but no rely-family term; 13:18, 14:11, and 16:7-8 are the anchor texts.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 tags; not subdivided in the book doc).
8. Decisions record: routed to backlog: `davidic-covenant` (roster row 44) — 13:5 (“a covenant of salt”) is a stress-text for that pack at re-pin. `priesthood` considered and NOT added — 13:9-11 states the Aaronic office’s legitimacy inside the battle sermon, but the substance is carried here by `worship` (the ordered-service register, the book doc’s round-2 call); adding both on the same verses would double-count one speech. None yielded.

### Correction — 2 Chronicles 12, Decisions record quote rendering (appended per §9; earlier bytes untouched)

The ch. 12 routed-note for `god-relents` rendered 12:7 as one span with inner single quote
marks; the WEB verse carries the inner speech in double curly quotes, so that composite span
is not a byte-for-byte substring. Corrected quotation, verified against the pinned VPL:
“When the LORD saw that they humbled themselves, the LORD’s word came to Shemaiah, saying,”
followed by “They have humbled themselves. I will not destroy them” (both 12:7). The routing
itself stands unchanged.

## 2 Chronicles 14

1. Existing tags (book doc): `prayer`; `trust-in-god`; `gods-protection`; `seeking-god`
2. Applied-tag deltas:
   - KEEP `prayer` [engine] — “Asa cried to the LORD his God” (14:11), answered at once (14:12).
   - KEEP `trust-in-god` [engine] — the prayer’s whole argument: “Help us, LORD our God; for we rely on you, and in your name we have come against this multitude.” (14:11).
   - KEEP `gods-protection` [engine] — “So the LORD struck the Ethiopians before Asa and before Judah; and the Ethiopians fled.” (14:12), “they were destroyed before the LORD and before his army” (14:13).
   - KEEP `seeking-god` [engine] — seeking made policy: Asa “commanded Judah to seek the LORD, the God of their fathers, and to obey his law and command” (14:4); “The land is yet before us, because we have sought the LORD our God. We have sought him, and he has given us rest on every side.” (14:7).
3. Anchor-extension candidates:
   - `trust-in-god` | 2 Chronicles 14:11 | “LORD, there is no one besides you to help, between the mighty and him who has no strength. Help us, LORD our God; for we rely on you” | w0.7 — the outnumbered-reliance prayer; no pack anchor covers the rely-on-you register.
4. Lexicon candidates: None (the rely-family lexicon row is logged at ch. 13).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (4 tags; not subdivided in the book doc).
8. Decisions record: routed to backlog: `deliverance` (roster row 32) — 14:11-13 is a rescue-narrative text for that pack’s re-pin curator (“Help us, LORD our God” answered by rout); recorded here, not duplicated as a new proposal. `fear-of-the-lord` stays off per the book doc Decisions #30 (14:14 in-scene aftermath; no new evidence). None yielded.

## 2 Chronicles 15

1. Existing tags (book doc): `covenant`; `repentance`; `presence-of-god`; `joy-in-the-lord`; `seeking-god`; `revival-and-reformation`; `oaths-and-vows` (7)
2. Applied-tag deltas:
   - KEEP `covenant` [engine] — “They entered into the covenant to seek the LORD, the God of their fathers, with all their heart and with all their soul” (15:12).
   - KEEP `repentance` [engine] — “But when in their distress they turned to the LORD, the God of Israel, and sought him, he was found by them.” (15:4); Asa “put away the abominations out of all the land of Judah and Benjamin” (15:8).
   - KEEP `presence-of-god` [engine] — “The LORD is with you while you are with him” (15:2); defectors come “when they saw that the LORD his God was with him” (15:9).
   - KEEP `joy-in-the-lord` [engine] — “All Judah rejoiced at the oath, for they had sworn with all their heart and sought him with their whole desire” (15:15).
   - KEEP `seeking-god` [engine] — the book’s key verse: “if you seek him, he will be found by you; but if you forsake him, he will forsake you” (15:2), enacted (15:12) and answered — “and he was found by them” (15:15).
   - KEEP `revival-and-reformation` [engine] — the reform arc: abominations put away, “he renewed the LORD’s altar that was before the LORD’s porch” (15:8), and a whole people re-covenanted with rejoicing (15:9-15).
   - KEEP `oaths-and-vows` [engine] — “They swore to the LORD with a loud voice, with shouting, with trumpets, and with cornets.” (15:14), “All Judah rejoiced at the oath” (15:15).
3. Anchor-extension candidates:
   - `seeking-god` | 2 Chronicles 15:2 | “The LORD is with you while you are with him; and if you seek him, he will be found by you; but if you forsake him, he will forsake you.” | w0.9 — Brooks’ key verse for the whole book; the pack anchors 7:14 but not the seek-and-be-found promise itself.
   - `revival-and-reformation` | 2 Chronicles 15:8-15 | “he took courage, and put away the abominations out of all the land of Judah and Benjamin” | w0.7.
4. Lexicon candidates:
   - `seeking-god` | term: “he will be found by you” | queries: “if you seek him he will be found”, “God will be found by those who seek him”, “the LORD is with you while you are with him”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags, all pre-existing, each independently clearing the bar; under the hard ceiling 8; not subdivided in the book doc).
8. Decisions record: routed to backlog: `wholehearted-devotion` (roster row 18) — 15:12, 15 (“with all their heart and with all their soul”; “sworn with all their heart and sought him with their whole desire”) are whole-heart texts for that row’s recorded lexicon-extension resolution (loving-god/seeking-god) at re-pin; recorded here, not duplicated. `idolatry` stays off per the book doc Decisions #30 (15:8 carried by `repentance`, 15:16 single-verse detail; no new evidence). None yielded.

## 2 Chronicles 16 (subdivided: 16:1–6; 16:7–10; 16:11–14)

1. Existing tags (book doc): `trust-in-god`; `seeking-god`
2. Applied-tag deltas:
   - KEEP `trust-in-god` [engine] — the stated-teaching exception argued in the book doc (Decisions #6) stands: Hanani states the positive case — “because you relied on the LORD, he delivered them into your hand” (16:8) — and the standing principle: “For the LORD’s eyes run back and forth throughout the whole earth, to show himself strong in the behalf of them whose heart is perfect toward him.” (16:9).
   - KEEP `seeking-god` [engine] — the cautionary register, the text’s own charge: “yet in his disease he didn’t seek the LORD, but just the physicians” (16:12).
   - ADD `trusting-in-man` [engine] — the concept’s exact substance stated in-chapter as the indictment: “Because you have relied on the king of Syria, and have not relied on the LORD your God, therefore the army of the king of Syria has escaped out of your hand.” (16:7) — the pack’s misplaced-reliance register (its lexicon: “trusting in man instead of god”, “trusting in horses and chariots”; its anchors Jer 17:5-6, Isa 31:1 are this same teaching). The id entered the vocabulary after the book doc’s 131-id vintage; both-tags with `trust-in-god` per §11.2 — the chapter states both sides of the one contrast, on distinct verses.
3. Anchor-extension candidates:
   - `trusting-in-man` | 2 Chronicles 16:7-9 | “Because you have relied on the king of Syria, and have not relied on the LORD your God” | w0.85 — the OT’s clearest narrative indictment of reliance on a human ally; strengthens a pack whose anchors are all prophetic-oracle texts.
   - `trust-in-god` | 2 Chronicles 16:9 | “For the LORD’s eyes run back and forth throughout the whole earth, to show himself strong in the behalf of them whose heart is perfect toward him.” | w0.7 — a famous, heavily-quoted promise verse with no anchor home.
4. Lexicon candidates:
   - `trust-in-god` | term: “the eyes of the LORD run to and fro” | queries: “the eyes of the LORD search the whole earth”, “God shows himself strong on behalf of the faithful”, “eyes of the LORD run to and fro throughout the earth”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (3 tags).
8. Decisions record: routed to backlog: `wholehearted-devotion` (roster row 18) — 16:9 (“them whose heart is perfect toward him”) joins the whole-heart texts for that row at re-pin. `receiving-correction` considered and NOT added — Asa rages and imprisons the seer (16:10), the failure mode; the concept’s substance is not stated in-chapter (Nehemiah-decline precedent). `justice-and-oppression` stays off per the book doc Decisions #30 (16:10 single in-scene verse; no new evidence). None yielded.

## 2 Chronicles 17

1. Existing tags (book doc): `studying-the-word`; `obedience-to-the-word`; `seeking-god`; `fear-of-the-lord`
2. Applied-tag deltas:
   - KEEP `studying-the-word` [engine] — the nationwide teaching mission: “They taught in Judah, having the book of the LORD’s law with them. They went about throughout all the cities of Judah and taught among the people.” (17:9).
   - KEEP `obedience-to-the-word` [engine] — the king “walked in his commandments, and not in the ways of Israel” (17:4).
   - KEEP `seeking-god` [engine] — “The LORD was with Jehoshaphat, because he walked in the first ways of his father David, and didn’t seek the Baals” (17:3), “but sought the God of his father” (17:4).
   - KEEP `fear-of-the-lord` [engine] — “The fear of the LORD fell on all the kingdoms of the lands that were around Judah, so that they made no war against Jehoshaphat.” (17:10).
3. Anchor-extension candidates:
   - `studying-the-word` | 2 Chronicles 17:7-9 | “They taught in Judah, having the book of the LORD’s law with them.” | w0.65 — the OT’s clearest national Scripture-teaching narrative; the pack’s anchors are all didactic texts.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (4 tags; not subdivided in the book doc).
8. Decisions record: None.

## 2 Chronicles 18 (subdivided: 18:1–11; 18:12–27; 18:28–34)

1. Existing tags (book doc): `guidance`; `pleasing-god-not-people`; `honesty`; `gods-protection`; `divine-judgment`; `dreams-and-visions` (6)
2. Applied-tag deltas:
   - KEEP `guidance` [engine] — “Please inquire first for the LORD’s word.” (18:4); “Isn’t there here a prophet of the LORD besides, that we may inquire of him?” (18:6).
   - KEEP `pleasing-god-not-people` [engine] — one prophet against four hundred and a king’s hatred: “As the LORD lives, I will say what my God says.” (18:13), at the price of a blow and a prison (18:23-26).
   - KEEP `honesty` [engine] — “How many times shall I adjure you that you speak to me nothing but the truth in the LORD’s name?” (18:15), against prophets carrying “a lying spirit” (18:22).
   - KEEP `gods-protection` [engine] — “But Jehoshaphat cried out, and the LORD helped him; and God moved them to depart from him.” (18:31).
   - KEEP `divine-judgment` [engine] — “the LORD has spoken evil concerning you” (18:22), executed by a bow drawn “at random” (18:33-34).
   - KEEP `dreams-and-visions` [engine] — the explicit vision report: “I saw the LORD sitting on his throne, and all the army of heaven standing on his right hand and on his left.” (18:18).
   - ADD `false-prophets` [engine] — the chapter enacts the concept’s own test and substance: four hundred prophets promise victory “with one mouth” (18:12) while carrying “a lying spirit in the mouth of all his prophets” (18:21-22), and Micaiah stakes the Deut 18:22 criterion the pack anchors: “If you return at all in peace, the LORD has not spoken by me.” (18:27). The how-to-recognize-a-false-prophet searcher’s narrative text; the chapter states the test, not merely the failure.
3. Anchor-extension candidates:
   - `false-prophets` | 2 Chronicles 18:18-27 | “the LORD has put a lying spirit in the mouth of these your prophets” | w0.6.
   - `pleasing-god-not-people` | 2 Chronicles 18:12-13 | “As the LORD lives, I will say what my God says.” | w0.7 — a narrative keystone for the fear-of-man register; the pack has no OT-narrative anchor.
4. Lexicon candidates:
   - `false-prophets` | term: “lying spirit” | queries: “lying spirit in the prophets”, “Micaiah and the four hundred prophets”, “how do I know a prophecy is from God”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags after the ADD, each independently clearing the bar; under the hard ceiling 8) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: `unequally-yoked` stays off per the book doc Decisions #30 (18:1’s alliance verse had no verified anchor there and the verdict verse is 19:2, tagged on ch. 19; no new evidence — the sweep confirms 18:1 “he allied himself with Ahab” is now verifiable against the pinned VPL, but the teaching substance still sits in 19:2, so the placement stands). None yielded.

## 2 Chronicles 19 (subdivided: 19:1–3; 19:4–11)

1. Existing tags (book doc): `repentance`; `justice-and-oppression`; `unequally-yoked`; `fear-of-the-lord`; `seeking-god` (5)
2. Applied-tag deltas:
   - KEEP `repentance` [engine] — rebuke answered with turning: Jehoshaphat “went out again among the people from Beersheba to the hill country of Ephraim, and brought them back to the LORD, the God of their fathers.” (19:4).
   - KEEP `justice-and-oppression` [engine] — the judges’ charge grounding courts in God’s character: “you don’t judge for man, but for the LORD” (19:6), “for there is no iniquity with the LORD our God, nor respect of persons, nor taking of bribes” (19:7).
   - KEEP `unequally-yoked` [adopted/roster row 47] — “Should you help the wicked, and love those who hate the LORD? Because of this, wrath is on you from before the LORD.” (19:2) — political-military alliance register, kept distinct from marriage per the row’s note.
   - KEEP `fear-of-the-lord` [engine] — reverence as the judges’ working ethic: “Now therefore let the fear of the LORD be on you.” (19:7), “You shall do this in the fear of the LORD, faithfully, and with a perfect heart.” (19:9).
   - KEEP `seeking-god` [engine] — the balancing clause: good things found in you, in that you “have set your heart to seek God” (19:3).
   - ADD `receiving-correction` [engine] — the concept’s substance enacted positively: the seer’s open rebuke (19:2) is received without rage — the narrative’s deliberate foil to Asa’s prison in 16:10 — and answered with reform: “Nevertheless there are good things found in you” (19:3) heard, and the king “brought them back to the LORD” (19:4). The pack’s register (open rebuke, teachable response) has no narrative anchor; this is its OT enactment. Id entered the vocabulary after the 131-id vintage.
3. Anchor-extension candidates:
   - `justice-and-oppression` | 2 Chronicles 19:5-10 | “you don’t judge for man, but for the LORD; and he is with you in the judgment” | w0.7 — the judges’ charge; the pack’s anchors carry no courts-charged text.
   - `favoritism` | 2 Chronicles 19:7 | “for there is no iniquity with the LORD our God, nor respect of persons, nor taking of bribes” | w0.6 — the pack’s god-shows-no-partiality register (Acts 10:34-35 anchor) stated in OT court language.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 HIT (6 tags after the ADD) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `unequally-yoked` (roster row 47) — 19:2 is the OT verdict text for that pack at re-pin. `favoritism` display tag considered and NOT added — 19:7 is one verse inside the judges’ charge; carried as an anchor-extension candidate instead (cap discipline; `justice-and-oppression` owns the scene). None yielded.

## 2 Chronicles 20 (subdivided: 20:1–13; 20:14–19; 20:20–30; 20:31–37)

1. Existing tags (book doc): `prayer`; `fear-not`; `trust-in-god`; `praise`; `worship`; `gods-protection`; `seeking-god`; `unequally-yoked` (8 — at the hard ceiling)
2. Applied-tag deltas:
   - KEEP `prayer` [engine] — the assembly’s temple-court prayer: “cry to you in our affliction, and you will hear and save” (20:9), “Our God, will you not judge them?” (20:12).
   - KEEP `fear-not` [engine] — “Don’t be afraid, and don’t be dismayed because of this great multitude; for the battle is not yours, but God’s.” (20:15), “Set yourselves, stand still, and see the salvation of the LORD with you” (20:17).
   - KEEP `trust-in-god` [engine] — “We don’t know what to do, but our eyes are on you.” (20:12); “Believe in the LORD your God, so you will be established!” (20:20).
   - KEEP `praise` [engine] — singers appointed before the army, “Give thanks to the LORD, for his loving kindness endures forever.” (20:21), “When they began to sing and to praise, the LORD set ambushers” (20:22).
   - KEEP `worship` [engine] — “all Judah and the inhabitants of Jerusalem fell down before the LORD, worshiping the LORD.” (20:18), the Levites praising “with an exceedingly loud voice” (20:19).
   - KEEP `gods-protection` [engine] — “the LORD set ambushers against the children of Ammon, Moab, and Mount Seir” (20:22); the nations hear “that the LORD fought against the enemies of Israel” (20:29).
   - KEEP `seeking-god` [engine] — the crisis’s first act: Jehoshaphat “set himself to seek the LORD” (20:3), and Judah gathers “to seek help from the LORD” (20:4).
   - KEEP `unequally-yoked` [adopted/roster row 47] — “Because you have joined yourself with Ahaziah, the LORD has destroyed your works.” (20:37); the ships wrecked before they can sail.
3. Anchor-extension candidates:
   - `victory-in-christ` | 2 Chronicles 20:15-17 | “for the battle is not yours, but God’s” … “Set yourselves, stand still, and see the salvation of the LORD” | w0.75 — the pack’s lexicon already carries “the battle belongs to the lord” and “god fights for us”, and its anchors include Exod 14:13-14; this is the other canonical stand-still-and-see text. (Anchor extension only — no display tag on OT narrative for a `-in-christ`-named id, per the no-read-back rule.)
   - `fasting` | 2 Chronicles 20:3-4 | “He proclaimed a fast throughout all Judah.” | w0.6 — a proclaimed corporate fast; sits beside the pack’s Ezra 8:21-23 and Esther 4:15-16 anchors.
   - `trust-in-god` | 2 Chronicles 20:12 | “We don’t know what to do, but our eyes are on you.” | w0.75 — a heavily-prayed phrase with no anchor home.
4. Lexicon candidates:
   - `victory-in-christ` | term: “the battle is not yours but God’s” | queries: “the battle is not yours”, “the battle is the Lord’s”, “stand still and see the salvation of the LORD”.
   - `trust-in-god` | term: “our eyes are on you” | queries: “we don’t know what to do but our eyes are on you”, “eyes on God in a crisis”, “Jehoshaphat’s prayer”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: candidates at the ceiling declined, no existing tag yields: `fasting` (20:3 single verse — thin-single-verse class; anchor-extension candidate above); `joy-in-the-lord` (20:27 “to go again to Jerusalem with joy; for the LORD had made them to rejoice over their enemies” — in-scene aftermath, carried by `praise`); `fear-of-the-lord` (20:29 is `gods-protection`’s quoted verse; book doc Decisions #30 decline stands); `thanksgiving` (20:21 refrain carried by `praise`, book doc Decisions #22 precedent). Routed to backlog: `deliverance` (roster row 32) — 20:15-24 (“see the salvation of the LORD”) is a core rescue-narrative text for the re-pin curator; recorded here, not duplicated. Each decline reversible at the per-verse refinement pass.

## 2 Chronicles 21 (subdivided: 21:1–11; 21:12–20)

1. Existing tags (book doc): `sin`; `divine-judgment`; `gods-faithfulness`; `davidic-covenant`
2. Applied-tag deltas:
   - KEEP `sin` [engine] — the reign’s catalog: “he killed all his brothers with the sword” (21:4), “He did that which was evil in the LORD’s sight.” (21:6), high places that “led Judah astray” (21:11), indicted in Elijah’s letter (21:12-13).
   - KEEP `divine-judgment` [engine] — “behold, the LORD will strike your people with a great plague” (21:14), delivered: “the LORD struck him in his bowels with an incurable disease” (21:18).
   - KEEP `gods-faithfulness` [engine] — “However the LORD would not destroy David’s house, because of the covenant that he had made with David, and as he promised to give a lamp to him and to his children always.” (21:7).
   - KEEP `davidic-covenant` [adopted/roster row 44] — the same 21:7 lamp-promise in its specific register (shared verse noted, per the book doc).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (4 tags).
8. Decisions record: routed to backlog: `davidic-covenant` (roster row 44) — 21:7 (“a lamp to him and to his children always”) is a stress-text for that pack at re-pin. None yielded.

## 2 Chronicles 22 (subdivided: 22:1–9; 22:10–12)

1. Existing tags (book doc): `providence`; `divine-judgment`
2. Applied-tag deltas:
   - KEEP `providence` [engine] — “Now the destruction of Ahaziah was of God, in that he went to Joram” (22:7).
   - KEEP `divine-judgment` [engine] — Ahaziah dies inside a decreed judgment: he falls to “Jehu the son of Nimshi, whom the LORD had anointed to cut off Ahab’s house” (22:7), “When Jehu was executing judgment on Ahab’s house” (22:8).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (2 tags).
8. Decisions record: routed to backlog: `counsel-and-advisers` (roster row 15) — 22:3-5 (“his mother was his counselor in acting wickedly”; “they were his counselors after the death of his father, to his destruction”; “He also followed their counsel”) is the wicked-counsel narrative for that row at re-pin; recorded here, not duplicated. `gods-protection` on 22:10-12 stays off per the book doc Decisions #18 (rescue narrated as Jehoshabeath’s act; God not named as agent in-chapter; no new evidence — the sweep confirms 22:11-12 names no divine agency). None yielded.

## 2 Chronicles 23 (subdivided: 23:1–11; 23:12–15; 23:16–21)

1. Existing tags (book doc): `covenant`; `worship`; `davidic-covenant`
2. Applied-tag deltas:
   - KEEP `covenant` [engine] — “All the assembly made a covenant with the king in God’s house.” (23:3); “Jehoiada made a covenant between himself, all the people, and the king, that they should be the LORD’s people.” (23:16).
   - KEEP `worship` [engine] — Baal’s house falls (23:17) and the LORD’s order returns: officers appointed “to offer the burnt offerings of the LORD, as it is written in the law of Moses, with rejoicing and with singing, as David had ordered.” (23:18).
   - KEEP `davidic-covenant` [adopted/roster row 44] — the coup’s warrant: “Behold, the king’s son must reign, as the LORD has spoken concerning the sons of David.” (23:3).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (3 tags).
8. Decisions record: routed to backlog: `davidic-covenant` (roster row 44) — 23:3 is a stress-text for that pack at re-pin. `revival-and-reformation` stays off per the book doc Decisions #30 (its verses are exactly those `covenant` and `worship` quote; no new evidence). None yielded.

## 2 Chronicles 24 (subdivided: 24:1–14; 24:15–16; 24:17–22; 24:23–27)

1. Existing tags (book doc): `generosity`; `sin`; `divine-judgment`; `the-house-of-god`
2. Applied-tag deltas:
   - KEEP `generosity` [engine] — glad, overflowing giving: “All the princes and all the people rejoiced, and brought in, and cast into the chest, until they had filled it.” (24:10), gathered “day by day” “in abundance” (24:11).
   - KEEP `sin` [engine] — the fall after Jehoiada: “They abandoned the house of the LORD, the God of their fathers, and served the Asherah poles and the idols” (24:18), prophets refused (24:19), and Zechariah stoned “at the commandment of the king in the court of the LORD’s house” (24:21).
   - KEEP `divine-judgment` [engine] — “so wrath came on Judah and Jerusalem for this their guiltiness” (24:18); “the LORD delivered a very great army into their hand, because they had forsaken the LORD” … “So they executed judgment on Joash.” (24:24).
   - KEEP `the-house-of-god` [engine] — the repair as the reign’s project: the chest at the gate (24:8), “They hired masons and carpenters to restore the LORD’s house” (24:12), “They set up God’s house as it was designed, and strengthened it.” (24:13).
3. Anchor-extension candidates:
   - `generosity` | 2 Chronicles 24:8-11 | “All the princes and all the people rejoiced, and brought in, and cast into the chest, until they had filled it.” | w0.6 — glad giving for God’s house; the pack has no OT-narrative anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None (24:19-22’s prophets-refused material feeds the ch. 36 new-concept candidate).
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (4 tags).
8. Decisions record: `watchman-and-warning` considered and NOT added — 24:19 (“Yet he sent prophets to them to bring them again to the LORD, and they testified against them; but they would not listen.”) is the sent-messengers theme, but the pack’s register is the watchman’s own duty to warn (Ezek 33), not warnings refused; mismatch. None yielded.

## 2 Chronicles 25 (subdivided: 25:1–13; 25:14–16; 25:17–24; 25:25–28)

1. Existing tags (book doc): `obedience-to-the-word`; `trust-in-god`; `sin`; `divine-judgment`; `idolatry`; `unequally-yoked` (6)
2. Applied-tag deltas:
   - KEEP `obedience-to-the-word` [engine] — the law obeyed against custom: the assassins’ children spared, “did according to that which is written in the law in the book of Moses, as the LORD commanded” (25:4), and a hundred talents written off at the man of God’s word (25:9-10).
   - KEEP `trust-in-god` [engine] — the man of God’s teaching: “for God has power to help, and to overthrow” (25:8), “The LORD is able to give you much more than this.” (25:9).
   - KEEP `sin` [engine] — victory curdles: the gods of Seir set up, “and bowed down himself before them and burned incense to them” (25:14); the prophet silenced (25:16).
   - KEEP `divine-judgment` [engine] — “for it was of God, that he might deliver them into the hand of their enemies, because they had sought after the gods of Edom” (25:20); “from the time that Amaziah turned away from following the LORD, they made a conspiracy against him” (25:27).
   - KEEP `idolatry` [engine] — the absurdity argument in narrative: “Why have you sought after the gods of the people, which have not delivered their own people out of your hand?” (25:15).
   - KEEP `unequally-yoked` [adopted/roster row 47] — the one obeyed alliance warning: “don’t let the army of Israel go with you, for the LORD is not with Israel” (25:7), the mercenaries sent home at real cost (25:10).
   - ADD `individual-responsibility` [engine] — the chapter quotes the pack’s own anchor teaching (Deut 24:16) verbatim as the acted-on law: “The fathers shall not die for the children, neither shall the children die for the fathers; but every man shall die for his own sin.” (25:4) — the concept’s exact substance (no punishment across generations), stated and obeyed in-chapter. Id entered the vocabulary after the 131-id vintage.
3. Anchor-extension candidates:
   - `individual-responsibility` | 2 Chronicles 25:3-4 | “But he didn’t put their children to death, but did according to that which is written in the law in the book of Moses” | w0.75 — the one OT narrative where Deut 24:16 is explicitly obeyed; strengthens a pack whose anchors are all statute/oracle texts.
4. Lexicon candidates: None.
5. New-concept candidates: None (25:16’s silenced prophet feeds the ch. 36 new-concept candidate).
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags after the ADD, each independently clearing the bar; under the hard ceiling 8) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `unequally-yoked` (roster row 47) — 25:7-10 is the obeyed-warning narrative for that pack at re-pin. Routed to backlog: `counsel-and-advisers` (roster row 15) — 25:16-17 (“Have we made you one of the king’s counselors?”; “Then Amaziah king of Judah consulted his advisers”) joins that row’s narrative set. None yielded.

## 2 Chronicles 26

1. Existing tags (book doc): `humble-exaltation`; `priesthood`; `seeking-god`
2. Applied-tag deltas:
   - KEEP `humble-exaltation` [engine] — both edges in one reign: “he was marvelously helped until he was strong” (26:15), then “But when he was strong, his heart was lifted up, so that he did corruptly” (26:16), and the lifted heart brought down publicly (26:19-21).
   - KEEP `priesthood` [engine] — the office’s boundary enforced against a king: “It isn’t for you, Uzziah, to burn incense to the LORD, but for the priests the sons of Aaron, who are consecrated to burn incense.” (26:18), Azariah with “eighty priests of the LORD, who were valiant men” (26:17) resisting him in the sanctuary.
   - KEEP `seeking-god` [engine] — the reign’s first movement: “He set himself to seek God in the days of Zechariah, who had understanding in the vision of God; and as long as he sought the LORD, God made him prosper.” (26:5) — the narrator’s report, no reader-directed formula (book doc Decisions #3 guardrail honored).
3. Anchor-extension candidates:
   - `humble-exaltation` | 2 Chronicles 26:15-16 | “But when he was strong, his heart was lifted up, so that he did corruptly” | w0.7 — the pride-before-fall narrative keystone; the pack’s anchors carry no narrative case.
   - `priesthood` | 2 Chronicles 26:16-20 | “It isn’t for you, Uzziah, to burn incense to the LORD, but for the priests the sons of Aaron” | w0.65.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (3 tags; not subdivided in the book doc).
8. Decisions record: `divine-judgment` stays off per the book doc Decisions #9 (single-strongest-reading; pride-and-fall is the stated mechanism; no new evidence). `pastoral-serious-illness` stays off per Decisions #9 (leprosy narrated as the LORD’s stroke; comfort-register misroute). None yielded.

## 2 Chronicles 27

1. Existing tags (book doc): none (honest-and-empty)
2. Applied-tag deltas: No changes — re-checked against the full 239-id library: no concept in the current vocabulary is genuinely present in this brief regnal record at the honest-substantial-presence bar. 27:6 (“So Jotham became mighty, because he ordered his ways before the LORD his God.”) is a one-line formula in the conduct register — not the hearing-and-doing register of `obedience-to-the-word`, and not `seeking-god`’s vocabulary (the book doc routed it to the seeking row as a ref, which stands); `work-and-diligence` and `integrity` were checked and are register mismatches (building projects and a summary formula, no taught substance).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (0 tags; not subdivided in the book doc).
8. Decisions record: honest-and-empty preserved (book doc Decisions #12); no forced tag. None yielded.

## 2 Chronicles 28 (subdivided: 28:1–4; 28:5–15; 28:16–27)

1. Existing tags (book doc): `sin`; `divine-judgment`; `loving-others`; `idolatry`; `justice-and-oppression` (5)
2. Applied-tag deltas:
   - KEEP `sin` [engine] — the escalating catalog: “burned his children in the fire, according to the abominations of the nations whom the LORD cast out before the children of Israel” (28:3); “In the time of his distress, he trespassed yet more against the LORD, this same King Ahaz.” (28:22).
   - KEEP `divine-judgment` [engine] — “Therefore the LORD his God delivered him into the hand of the king of Syria.” (28:5); “For the LORD brought Judah low because of Ahaz king of Israel” (28:19).
   - KEEP `loving-others` [engine] — enemy captives treated as kin at a prophet’s word: from the plunder they “clothed all who were naked among them, dressed them, gave them sandals, gave them something to eat and to drink, anointed them, carried all the feeble of them on donkeys, and brought them to Jericho” (28:15).
   - KEEP `idolatry` [engine] — the second absurdity argument: “Because the gods of the kings of Syria helped them, I will sacrifice to them, that they may help me.” — “But they were the ruin of him and of all Israel.” (28:23), with molten images, shut doors, and “altars in every corner of Jerusalem” (28:2, 28:24).
   - KEEP `justice-and-oppression` [engine] — oppression reversed mid-act: the intent to keep kin “as male and female slaves” (28:10) is halted by Oded’s “Aren’t there even with you trespasses of your own against the LORD your God?” (28:10), and the captives are sent home (28:11-15).
3. Anchor-extension candidates:
   - `idolatry` | 2 Chronicles 28:22-25 | “For he sacrificed to the gods of Damascus which had defeated him.” | w0.65 — the served-gods-that-failed absurdity in narrative; the pack’s anchors carry the Isaiah 44 satire but no narrative case.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (5 tags).
8. Decisions record: `trusting-in-man` considered and NOT added — Ahaz’s Assyria appeal (28:16, 28:21 “but it didn’t help him”) depicts misplaced reliance, but unlike 16:7-9 no speaker states the reliance-contrast teaching in-chapter; the narrator’s charge is trespass, not trust; presence bar not cleared (noted as a near-miss for the pack’s re-pin review, with 28:20-21 as evidence verses). `mercy` considered and NOT added — 28:8-15’s substance is carried by `loving-others` and `justice-and-oppression`; a third tag on the same scene would double-count. None yielded.

## 2 Chronicles 29 (subdivided: 29:1–19; 29:20–36)

1. Existing tags (book doc): `worship`; `repentance`; `covenant`; `praise`; `thanksgiving`; `joy-in-the-lord`; `revival-and-reformation`; `sacrifice-and-atonement` (8 — at the hard ceiling)
2. Applied-tag deltas:
   - KEEP `worship` [engine] — the service restored end to end: “All the assembly worshiped, the singers sang, and the trumpeters sounded.” (29:28), “So the service of the LORD’s house was set in order.” (29:35).
   - KEEP `repentance` [engine] — the unfaithfulness named and reversed: “For our fathers were unfaithful, and have done that which was evil in the LORD our God’s sight” (29:6), the uncleanness carried “out to the brook Kidron” (29:16).
   - KEEP `covenant` [engine] — “Now it is in my heart to make a covenant with the LORD, the God of Israel, that his fierce anger may turn away from us.” (29:10).
   - KEEP `praise` [engine] — “Hezekiah the king and the princes commanded the Levites to sing praises to the LORD with the words of David, and of Asaph the seer. They sang praises with gladness” (29:30).
   - KEEP `thanksgiving` [engine] — “Come near and bring sacrifices and thank offerings into the LORD’s house.” — “The assembly brought in sacrifices and thank offerings” (29:31).
   - KEEP `joy-in-the-lord` [engine] — “Hezekiah and all the people rejoiced because of that which God had prepared for the people; for the thing was done suddenly.” (29:36).
   - KEEP `revival-and-reformation` [engine] — the reform opening: “In the first year of his reign, in the first month, he opened the doors of the LORD’s house and repaired them.” (29:3), the whole house cleansed and the service restored in sixteen days (29:15-17, 29:35).
   - KEEP `sacrifice-and-atonement` [adopted/roster row 1] — the restored house’s first act: sin offerings “to make atonement for all Israel; for the king commanded that the burnt offering and the sin offering should be made for all Israel” (29:24), hands laid on the goats (29:23).
3. Anchor-extension candidates:
   - `revival-and-reformation` | 2 Chronicles 29:3-11 | “In the first year of his reign, in the first month, he opened the doors of the LORD’s house and repaired them.” | w0.7 — the fullest reform-opening narrative; the pack anchors 2 Kgs 23:1-3 but not the Hezekiah arc.
4. Lexicon candidates:
   - `praise` | term: “sing praises with instruments” | queries: “worship music in the Bible”, “instruments in worship”, “singing in church biblical basis”. (Cross-reference: the 1 Chronicles thread’s noted-not-logged lexicon flag on `worship`/`praise` — 1 Chr 16:23; 25:6-7 anchors; 2 Chr 29:25-30 (“with cymbals, with stringed instruments, and with harps, according to the commandment of David” … “for the commandment was from the LORD by his prophets”) is the same flag’s strongest ordinance text; append to that flag rather than duplicating.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `sacrifice-and-atonement` (roster row 1) — the roster row’s own recorded reason names 2 Chr 29 among its blocked anchors; 29:20-24 is that pack’s narrative atonement text at re-pin; recorded here, not duplicated. Candidates at the ceiling declined, no existing tag yields: `priesthood` (roster-verse class per book doc Decisions #30 — two roster verses, theme-witness; decline stands); `the-house-of-god` (cleansing carried by `revival-and-reformation`/`worship`/`repentance`; duplicate register, decline stands); `holiness` (the sanctify-yourselves refrain, 29:5, 15, 34, is in-scene ritual preparation, not the pack’s pursue-holiness teaching register). Each reversible at the per-verse refinement pass.

## 2 Chronicles 30 (subdivided: 30:1–12; 30:13–27)

1. Existing tags (book doc): `repentance`; `prayer`; `joy-in-the-lord`; `praise`; `worship`; `passover`; `revival-and-reformation`; `slow-to-anger` (8 — at the hard ceiling)
2. Applied-tag deltas:
   - KEEP `repentance` [engine] — the invitation: “turn again to the LORD, the God of Abraham, Isaac, and Israel, that he may return to the remnant of you that have escaped” (30:6), “Now don’t be stiff-necked, as your fathers were, but yield yourselves to the LORD” (30:8).
   - KEEP `prayer` [engine] — Hezekiah’s intercession: “May the good LORD pardon everyone” (30:18) “who sets his heart to seek God, the LORD, the God of his fathers” (30:19), answered: “The LORD listened to Hezekiah, and healed the people.” (30:20).
   - KEEP `joy-in-the-lord` [engine] — the feast kept “with great gladness” (30:21), doubled: “they kept another seven days with gladness” (30:23), and “So there was great joy in Jerusalem; for since the time of Solomon the son of David king of Israel there was nothing like this in Jerusalem.” (30:26).
   - KEEP `praise` [engine] — “The Levites and the priests praised the LORD day by day, singing with loud instruments to the LORD.” (30:21).
   - KEEP `worship` [engine] — the Passover kept by “a very great assembly” (30:13) with the city’s altars cleared first: “they took away all the altars for incense and threw them into the brook Kidron” (30:14).
   - KEEP `passover` [engine] — the feast itself: proclamation “from Beersheba even to Dan, that they should come to keep the Passover to the LORD, the God of Israel, at Jerusalem” (30:5), killed “on the fourteenth day of the second month” (30:15).
   - KEEP `revival-and-reformation` [engine] — the reform’s national reach: letters through all Israel, mockers and comers (30:10-11), and “the hand of God came on Judah to give them one heart” (30:12).
   - KEEP `slow-to-anger` [engine] — the credal attributes preached in the letter: “because the LORD your God is gracious and merciful, and will not turn away his face from you if you return to him.” (30:9).
3. Anchor-extension candidates:
   - `passover` | 2 Chronicles 30:1-5 | “that they should come to keep the Passover to the LORD, the God of Israel, at Jerusalem” | w0.7 — one of the OT’s two great kept Passovers; the pack’s OT anchors are all Pentateuch institution texts.
   - `slow-to-anger` | 2 Chronicles 30:9 | “because the LORD your God is gracious and merciful, and will not turn away his face from you if you return to him” | w0.65 — the Exod 34:6 formula preached in narrative.
   - `remnant` | 2 Chronicles 30:6 | “that he may return to the remnant of you that have escaped out of the hand of the kings of Assyria” | w0.6.
   - `prayer` | 2 Chronicles 30:18-20 | “The LORD listened to Hezekiah, and healed the people.” | w0.6 — intercession answered; mercy-over-ritual narrative.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: candidates at the ceiling declined, no existing tag yields: `remnant` (30:6 is `repentance`’s quoted verse — book doc Decisions #30 decline stands; anchor-extension candidate recorded above instead); `seeking-god` (30:19 is the exact span `prayer` quotes; decline stands); `humble-exaltation` (30:11 “some men of Asher, Manasseh, and Zebulun humbled themselves and came to Jerusalem” — thin single-verse class at a full ceiling); `appointed-feasts` (the feast substance carried by `passover`; broad-duplicating-specific class); `mercy` (30:9’s attributes carried by `slow-to-anger`). `grace-not-earned` stays off per book doc Decisions #19 (no-read-back; no new evidence). Each reversible at the per-verse refinement pass.

## 2 Chronicles 31

1. Existing tags (book doc): `tithing`; `generosity`; `work-and-diligence`; `revival-and-reformation`; `priesthood` (5)
2. Applied-tag deltas:
   - KEEP `tithing` [engine] — the concept’s own vocabulary end to end: “the children of Israel gave in abundance the first fruits of grain, new wine, oil, honey, and of all the increase of the field; and they brought in the tithe of all things abundantly” (31:5), “the tithe of cattle and sheep, and the tithe of dedicated things” (31:6).
   - KEEP `generosity` [engine] — “As soon as the commandment went out, the children of Israel gave in abundance” (31:5); heaps that leave the ministers fed with “plenty left over, for the LORD has blessed his people” (31:10).
   - KEEP `work-and-diligence` [engine] — the reign’s summary: “In every work that he began in the service of God’s house, in the law, and in the commandments, to seek his God, he did it with all his heart and prospered.” (31:21), stores brought in “faithfully” by named men “in their office of trust” (31:12, 31:15).
   - KEEP `revival-and-reformation` [engine] — the reform’s follow-through: all Israel “broke the pillars in pieces, cut down the Asherah poles, and broke down the high places and the altars out of all Judah and Benjamin, also in Ephraim and Manasseh, until they had destroyed them all” (31:1).
   - KEEP `priesthood` [engine] — the office’s machinery rebuilt: “Hezekiah appointed the divisions of the priests and the Levites after their divisions, every man according to his service” (31:2), the people’s portion commanded “that they might give themselves to the LORD’s law” (31:4), distribution “to give to their brothers by divisions, to the great as well as to the small” (31:15).
3. Anchor-extension candidates:
   - `tithing` | 2 Chronicles 31:5-10 | “and they brought in the tithe of all things abundantly” | w0.75 — the OT’s fullest tithe-response narrative; the pack’s anchors are Malachi/Proverbs/Leviticus teaching texts.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 tags; not subdivided in the book doc).
8. Decisions record: routed to backlog: `wholehearted-devotion` (roster row 18) — 31:21 (“he did it with all his heart and prospered”) joins that row’s whole-heart texts at re-pin. `seeking-god` stays off per the book doc Decisions #30 (31:21 is `work-and-diligence`’s quoted verse; narrator’s-voice guardrail; no new evidence). `blessing` stays off per book doc Decisions #22 (formula-framing guard; no new evidence). None yielded.

## 2 Chronicles 32 (subdivided: 32:1–8; 32:9–19; 32:20–23; 32:24–33)

1. Existing tags (book doc): `trust-in-god`; `fear-not`; `prayer`; `gods-protection`; `humble-exaltation`; `testing` (6)
2. Applied-tag deltas:
   - KEEP `trust-in-god` [engine] — the siege framed as a contest of reliance: “In whom do you trust, that you remain under siege in Jerusalem?” (32:10), answered beforehand: “An arm of flesh is with him, but the LORD our God is with us to help us and to fight our battles.” — “The people rested themselves on the words of Hezekiah king of Judah.” (32:8).
   - KEEP `fear-not` [engine] — “Be strong and courageous. Don’t be afraid or dismayed because of the king of Assyria, nor for all the multitude who is with him; for there is a greater one with us than with him.” (32:7).
   - KEEP `prayer` [engine] — “Hezekiah the king and Isaiah the prophet, the son of Amoz, prayed because of this, and cried to heaven.” (32:20); in illness “he prayed to the LORD; and he spoke to him, and gave him a sign.” (32:24).
   - KEEP `gods-protection` [engine] — “The LORD sent an angel, who cut off all the mighty men of valor, the leaders, and captains in the camp of the king of Assyria.” (32:21), “Thus the LORD saved Hezekiah and the inhabitants of Jerusalem” (32:22).
   - KEEP `humble-exaltation` [engine] — “his heart was lifted up” (32:25), and the remedy: “However, Hezekiah humbled himself for the pride of his heart, both he and the inhabitants of Jerusalem, so that the LORD’s wrath didn’t come on them in the days of Hezekiah.” (32:26).
   - KEEP `testing` [engine] — the Babylonian embassy: “God left him to test him, that he might know all that was in his heart.” (32:31).
3. Anchor-extension candidates:
   - `fear-not` | 2 Chronicles 32:7-8 | “Be strong and courageous. Don’t be afraid or dismayed because of the king of Assyria” | w0.7 — a spoken narrative fear-not charge with the greater-one-with-us ground; the pack has no Chronicles anchor.
   - `angels` | 2 Chronicles 32:21 | “The LORD sent an angel, who cut off all the mighty men of valor” | w0.6 — the destroying-angel deliverance; the pack has no such anchor.
   - `testing` | 2 Chronicles 32:31 | “God left him to test him, that he might know all that was in his heart.” | w0.65.
4. Lexicon candidates:
   - `trust-in-god` | term: “an arm of flesh” | queries: “arm of flesh vs the LORD”, “there is a greater one with us than with him”, “God fights our battles”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: `angels` display tag stays off per the book doc Decisions #30 (32:21 is `gods-protection`’s quoted verse — duplicate register at the cap; no new evidence; anchor-extension candidate recorded instead). `pastoral-prayer-for-healing` stays off per book doc Decisions #2 (two verses inside a siege chapter; the pastoral treatment lives on the 2 Kings 20 parallel; no new evidence). Routed to backlog: `deliverance` (roster row 32) — 32:21-22 (“Thus the LORD saved Hezekiah and the inhabitants of Jerusalem”) joins that row’s rescue-narrative set at re-pin. None yielded.

## 2 Chronicles 33 (subdivided: 33:1–9; 33:10–20; 33:21–25)

1. Existing tags (book doc): `repentance`; `prayer`; `humble-exaltation`; `sin`; `divine-judgment`; `idolatry`; `occult-and-divination` (7)
2. Applied-tag deltas:
   - KEEP `repentance` [engine] — the turn is total and bears fruit: humbled in chains, Manasseh prays and is heard (33:12-13); restored, “He took away the foreign gods and the idol out of the LORD’s house” (33:15) and “built up the LORD’s altar” (33:16).
   - KEEP `prayer` [engine] — “He prayed to him; and he was entreated by him, and heard his supplication” (33:13), remembered in his epitaph: “his prayer to his God” (33:18), “His prayer also, and how God listened to his request” (33:19).
   - KEEP `humble-exaltation` [engine] — “When he was in distress, he begged the LORD his God, and humbled himself greatly before the God of his fathers.” (33:12), with Amon the foil: “He didn’t humble himself before the LORD, as Manasseh his father had humbled himself” (33:23).
   - KEEP `sin` [engine] — the abomination catalog, seducing Judah “so that they did more evil than did the nations whom the LORD destroyed before the children of Israel” (33:9); “He did much evil in the LORD’s sight, to provoke him to anger.” (33:6).
   - KEEP `divine-judgment` [engine] — the word refused brings the chains: “The LORD spoke to Manasseh and to his people, but they didn’t listen.” (33:10), “Therefore the LORD brought on them the captains of the army of the king of Assyria, who took Manasseh in chains” (33:11).
   - KEEP `idolatry` [engine] — the deepest plunge: “he raised up altars for the Baals, made Asheroth, and worshiped all the army of the sky, and served them” (33:3), “He built altars for all the army of the sky in the two courts of the LORD’s house.” (33:5), the idol’s image “in God’s house” (33:7) — and the idolater himself removes them at his restoration (33:15).
   - KEEP `occult-and-divination` [engine] — the fullest practice list under royal sponsorship: “He practiced sorcery, divination, and witchcraft, and dealt with those who had familiar spirits and with wizards.” (33:6).
3. Anchor-extension candidates:
   - `repentance` | 2 Chronicles 33:12-13 | “When he was in distress, he begged the LORD his God, and humbled himself greatly before the God of his fathers.” | w0.8 — the canonical worst-king-restored narrative; a heavy is-it-too-late-for-me search target the pack’s anchors don’t carry.
   - `humble-exaltation` | 2 Chronicles 33:12-13 | “humbled himself greatly before the God of his fathers” | w0.7.
   - `occult-and-divination` | 2 Chronicles 33:6 | “He practiced sorcery, divination, and witchcraft, and dealt with those who had familiar spirits and with wizards.” | w0.65.
4. Lexicon candidates:
   - `repentance` | term: “manasseh repented” | queries: “did God forgive Manasseh”, “Manasseh’s prayer”, “can God forgive the worst sinner”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags, all pre-existing, each independently clearing the bar; under the hard ceiling 8) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `exile-and-captivity` (roster row 45, Jesse-gated routing — nothing prejudged) — 33:11 (Manasseh’s personal captivity, “bound him with fetters, and carried him to Babylon”) is recorded for that row’s curator; the display tag stays off this chapter per the book doc Decisions #30 (the chains verse is `divine-judgment`’s own quote; no new evidence). `forgiveness-of-sins` considered and NOT added — the restoration is narrated as supplication heard (33:13), without pardon vocabulary in-chapter; carried by `repentance`/`prayer`. None yielded.

## 2 Chronicles 34 (subdivided: 34:1–7; 34:8–13; 34:14–28; 34:29–33)

1. Existing tags (book doc): `studying-the-word`; `repentance`; `humble-exaltation`; `covenant`; `divine-judgment`; `idolatry`; `revival-and-reformation`; `seeking-god` (8 — at the hard ceiling)
2. Applied-tag deltas:
   - KEEP `studying-the-word` [engine] — the lost book found (“Hilkiah the priest found the book of the LORD’s law given by Moses.” 34:14), read (34:18), inquired of (“Go inquire of the LORD for me… concerning the words of the book that is found” 34:21), and read by the king to everyone: “he read in their hearing all the words of the book of the covenant that was found in the LORD’s house” (34:30).
   - KEEP `repentance` [engine] — the purge (34:3-7) and the torn robe: “When the king had heard the words of the law, he tore his clothes.” (34:19).
   - KEEP `humble-exaltation` [engine] — Huldah’s ground for the reprieve: “because your heart was tender, and you humbled yourself before God when you heard his words” (34:27).
   - KEEP `covenant` [engine] — “The king stood in his place and made a covenant before the LORD, to walk after the LORD, and to keep his commandments, his testimonies, and his statutes with all his heart and with all his soul” (34:31).
   - KEEP `divine-judgment` [engine] — “Behold, I will bring evil on this place and on its inhabitants, even all the curses that are written in the book” (34:24), “my wrath is poured out on this place, and it will not be quenched” (34:25).
   - KEEP `idolatry` [engine] — the purge at its most thorough: Baal altars broken, Asherah poles and images “in pieces, made dust of them, and scattered it on the graves of those who had sacrificed to them” (34:4), through Judah and “even to Naphtali” (34:6).
   - KEEP `revival-and-reformation` [engine] — the last reform arc entire: purge, repaired house, recovered word, covenant renewed, and “All his days they didn’t depart from following the LORD, the God of their fathers.” (34:33).
   - KEEP `seeking-god` [engine] — the programmatic opening: “while he was yet young, he began to seek after the God of David his father” (34:3).
3. Anchor-extension candidates:
   - `studying-the-word` | 2 Chronicles 34:14-21 | “Hilkiah the priest found the book of the LORD’s law given by Moses.” | w0.7 — the found-book narrative (with the 2 Kgs 22 parallel); the pack has no narrative anchor.
   - `covenant` | 2 Chronicles 34:31 | “made a covenant before the LORD, to walk after the LORD, and to keep his commandments” | w0.6.
4. Lexicon candidates:
   - `studying-the-word` | term: “book of the law found” | queries: “Josiah finds the book of the law”, “the lost book of the law”, “what happened when Josiah heard God’s word”.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING 8 HIT + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: candidates at the ceiling declined, no existing tag yields: `remnant` (34:9, 21 formula phrases — theme-witness class; book doc Decisions #30 decline stands); `the-house-of-god` (34:8-13 repair — the quote is now verifiable against the pinned VPL (“to repair the house of the LORD his God”, 34:8), but at a full ceiling the repair-scene tag would displace nothing weaker; recorded as evidence that the Decisions #30 no-verifiable-anchor ground is superseded by the ceiling ground); `obedience-to-the-word` (the covenant-keeping substance is carried by `covenant` + `studying-the-word`; broad-duplicating-specific class). Each reversible at the per-verse refinement pass.

## 2 Chronicles 35 (subdivided: 35:1–19; 35:20–24; 35:25–27)

1. Existing tags (book doc): `worship`; `obedience-to-the-word`; `passover`; `lament`
2. Applied-tag deltas:
   - KEEP `worship` [engine] — the Passover kept wholly by the book: divisions “according to the writing of David king of Israel, and according to the writing of Solomon his son” (35:4), offerings “as it is written in the book of Moses” (35:12), singers and gatekeepers at their posts (35:15), a service unmatched since Samuel (35:18).
   - KEEP `obedience-to-the-word` [engine] — every step measured against the written word: “to do according to the LORD’s word by Moses” (35:6), “They roasted the Passover with fire according to the ordinance.” (35:13) — while the tragedy turns on words not listened to: he “didn’t listen to the words of Neco from the mouth of God” (35:22).
   - KEEP `passover` [engine] — “Josiah kept a Passover to the LORD in Jerusalem. They killed the Passover on the fourteenth day of the first month.” (35:1); “There was no Passover like that kept in Israel from the days of Samuel the prophet” (35:18).
   - KEEP `lament` [engine] — lament institutionalized: “Jeremiah lamented for Josiah, and all the singing men and singing women spoke of Josiah in their lamentations to this day; and they made them an ordinance in Israel.” (35:25).
3. Anchor-extension candidates:
   - `passover` | 2 Chronicles 35:1-19 | “There was no Passover like that kept in Israel from the days of Samuel the prophet” | w0.7 — the second great kept Passover; the pack’s OT anchors are institution texts only.
   - `lament` | 2 Chronicles 35:24-25 | “All Judah and Jerusalem mourned for Josiah.” … “Jeremiah lamented for Josiah” | w0.6 — composed, taught lament as standing practice (the 2 Samuel-precedent register the row already collects).
4. Lexicon candidates: None.
5. New-concept candidates: None (35:22’s words-not-listened-to feeds the ch. 36 candidate’s pattern but is Neco’s singular case; not cited as its anchor).
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE (4 tags).
8. Decisions record: `pastoral-grief-and-loss` stays off per the book doc Decisions #2 (national mourning by ordinance, not a griever’s personal crisis; routed to `lament`, which now carries the chapter; no new evidence). `generosity` considered and NOT added — the king’s and princes’ Passover gifts (35:7-9) are royal provisioning inside the feast’s machinery, carried by `passover`/`worship`; below the concept’s giving-teaching bar. None yielded.

## 2 Chronicles 36 (subdivided: 36:1–10; 36:11–14; 36:15–21; 36:22–23)

1. Existing tags (book doc): `sin`; `divine-judgment`; `gods-faithfulness`; `exile-and-captivity`; `hardness-of-heart`; `slow-to-anger`; `restoration-of-israel` (7)
2. Applied-tag deltas:
   - KEEP `sin` [engine] — the climactic corporate catalog: “all the chiefs of the priests and the people trespassed very greatly after all the abominations of the nations; and they polluted the LORD’s house” (36:14), and the messengers mocked “until there was no remedy” (36:16).
   - KEEP `divine-judgment` [engine] — “until the LORD’s wrath arose against his people, until there was no remedy” (36:16); the sword “in the house of their sanctuary” (36:17), “They burned God’s house, broke down the wall of Jerusalem” (36:19).
   - KEEP `gods-faithfulness` [engine] — catastrophe and restoration alike keep the word: “to fulfill the LORD’s word by Jeremiah’s mouth” (36:21), “that the LORD’s word by the mouth of Jeremiah might be accomplished, the LORD stirred up the spirit of Cyrus king of Persia” (36:22).
   - KEEP `exile-and-captivity` [adopted/roster row 45] — the exile’s theological summary: “He carried those who had escaped from the sword away to Babylon, and they were servants to him and his sons until the reign of the kingdom of Persia” (36:20), “until the land had enjoyed its Sabbaths… to fulfill seventy years” (36:21).
   - KEEP `hardness-of-heart` [engine] — “but he stiffened his neck, and hardened his heart against turning to the LORD, the God of Israel” (36:13); “He didn’t humble himself before Jeremiah the prophet speaking from the LORD’s mouth.” (36:12).
   - KEEP `slow-to-anger` [engine] — patience before judgment: the LORD “sent to them by his messengers, rising up early and sending, because he had compassion on his people and on his dwelling place” (36:15), with the limit kept in view (36:16).
   - KEEP `restoration-of-israel` [engine] — the deliberate last word: “Whoever there is among you of all his people, the LORD his God be with him, and let him go up.” (36:23).
3. Anchor-extension candidates:
   - `hardness-of-heart` | 2 Chronicles 36:12-13 | “he stiffened his neck, and hardened his heart against turning to the LORD” | w0.7 — self-hardening against the prophetic word; the pack’s narrative anchors are Pharaoh texts only.
   - `slow-to-anger` | 2 Chronicles 36:15-16 | “rising up early and sending, because he had compassion on his people and on his dwelling place” | w0.7.
   - `restoration-of-israel` | 2 Chronicles 36:22-23 | “the LORD stirred up the spirit of Cyrus king of Persia” | w0.7 — the return’s opening document; the pack anchors prophetic promises, not the proclamation itself.
   - `gods-faithfulness` | 2 Chronicles 36:21-22 | “to fulfill the LORD’s word by Jeremiah’s mouth” | w0.6.
4. Lexicon candidates: None.
5. New-concept candidates:
   - Proposed id: `rejecting-gods-messengers` | Rationale: the persistent-warnings-refused theme is genuinely present across the book (16:10 Hanani imprisoned; 18:23-26 Micaiah struck and jailed; 24:19-21 prophets refused and Zechariah stoned; 25:16 the prophet silenced; 30:10 couriers mocked) and reaches its thesis statement here; a search user asking “what happens when God’s warnings are ignored” or “mocking God’s messengers” has no vocabulary home — `watchman-and-warning` is the warner’s duty register, `obedience-to-the-word` cannot take failure-mode tags, and `hardness-of-heart` names the heart-state, not the sent-messengers pattern. The book doc weighed this and left it a motif (motif 7, suggesting the searcher lands on Matt 23:37-class NT texts); this ledger re-raises it as a new-concept candidate because the sweep’s cross-book view can pair 2 Chr 36:15-16 with those NT anchors at pack time. | Anchor: 2 Chronicles 36:15-16 (w1) — “The LORD, the God of their fathers, sent to them by his messengers, rising up early and sending, because he had compassion on his people and on his dwelling place” (36:15) … “but they mocked the messengers of God, despised his words, and scoffed at his prophets, until the LORD’s wrath arose against his people, until there was no remedy.” (36:16) Supporting in-book: 24:19 (“Yet he sent prophets to them to bring them again to the LORD, and they testified against them; but they would not listen.”). | Query phrasings: “mocking God’s messengers”, “what happens when God’s warnings are ignored”, “until there was no remedy”.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: SOFT CAP 6 EXCEEDED (7 tags, all pre-existing, each independently clearing the bar; under the hard ceiling 8) + BOOK-DOC SUBDIVISION — PER-VERSE REFINEMENT CANDIDATE.
8. Decisions record: routed to backlog: `exile-and-captivity` (roster row 45) — 36:17-21 is that row’s fullest OT summary text; the fold-vs-separate routing remains Jesse’s call, nothing prejudged here. `oaths-and-vows` stays off per the book doc Decisions #30 (36:13 already carries `sin` and `hardness-of-heart`; three tags on one verse refused; no new evidence). `sabbath-rest` stays off per book doc Decisions #22 (the land’s Sabbaths are the Lev-26 land-rest register, not the day-of-rest teaching; no new evidence). None yielded.

# Book totals (2 Chronicles, 36/36 chapters swept)

- Applied-tag deltas: **155 KEEP** (every existing book-doc tag re-cleared the presence bar against
  the 239-id library — the 104 instances of the 2026-08-23 pass plus the 51 applications of the
  2026-08-25 adopted-vocabulary pass), **6 ADD**, **0 DROP**.
  - ADDs: `glory-of-god` (ch. 5); `appointed-feasts` (ch. 8); `trusting-in-man` (ch. 16);
    `false-prophets` (ch. 18); `receiving-correction` (ch. 19); `individual-responsibility` (ch. 25)
    — all six are engine ids that entered the vocabulary after the book doc’s 131-id vintage.
- Anchor-extension candidates: **52** (across 29 chapters; strongest: `seeking-god` 15:2 w0.9,
  `trusting-in-man` 16:7-9 w0.85, `repentance` 33:12-13 w0.8, `wisdom-from-god` 1:7-12 w0.8,
  `tithing` 31:5-10 w0.75, `individual-responsibility` 25:3-4 w0.75, `glory-of-god` 5:13-14 w0.75,
  `victory-in-christ` 20:15-17 w0.75).
- Lexicon candidates: **15** (across 14 chapters; e.g. “glory filled the temple” → `glory-of-god`;
  “God will heal our land” / “if my people who are called by my name” → `revival-and-reformation`;
  “relied on the LORD” + “the eyes of the LORD run to and fro” → `trust-in-god`; “the battle is not
  yours but God’s” → `victory-in-christ`; “lying spirit” → `false-prophets`; “manasseh repented” →
  `repentance`; “book of the law found” → `studying-the-word`; “queen of sheba” → `wisdom-from-god`).
- New-concept candidates: **1** — `rejecting-gods-messengers` (ch. 36 block; anchor 2 Chr 36:15-16
  w1, supporting 24:19; re-raises the book doc’s motif 7 with the pattern’s in-book case list).
- Decline-overturn proposals: **0** — every prior decline and Decisions-record withholding was
  re-checked and stands; where the sweep found new verifiable evidence it recorded the evidence
  (e.g. ch. 18’s 18:1, ch. 34’s 34:8) without overturning, since the original grounds still hold.
- Hard-ceiling (8-tag) chapters: **5** — 7, 20, 29, 30, 34.
- Soft-cap-6 hit or exceeded (6–7 tags): 6, 15, 18, 19, 25, 32, 33, 36.
- PER-VERSE REFINEMENT candidates: the book doc’s **22 subdivided chapters**
  (6, 7, 9, 11, 12, 16, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 32, 33, 34, 35, 36 — all five
  ceiling chapters are among them).
- Honest-and-empty: ch. 27 (preserved; re-checked against the full library).
- Corpus-blocked backlog routings: **20 routed notes across 8 roster rows** — `davidic-covenant`
  (row 44: chs. 6, 7, 13, 21, 23), `counsel-and-advisers` (row 15: chs. 10, 22, 25),
  `wholehearted-devotion` (row 18: chs. 15, 16, 31), `deliverance` (row 32: chs. 14, 20, 32),
  `unequally-yoked` (row 47: chs. 19, 25), `exile-and-captivity` (row 45: chs. 33, 36 — Jesse’s
  routing call untouched), `god-relents` (row 7: ch. 12), `sacrifice-and-atonement` (row 1: ch. 29).
  No roster concept was duplicated as a new proposal.
- tag-gaps.md: NOT touched (per this sweep’s write-scope instruction: this ledger is the thread’s
  only output file). The one vocabulary-gap finding (`rejecting-gods-messengers`) is recorded as
  the ch. 36 new-concept candidate above for the curation pass to log if adopted.
- Corrections: one appended correction entry (ch. 12 Decisions-record quote rendering); one
  appended vocabulary-reference note (canonical `tag-apply/adopted-concepts.md` supersedes the
  BRIEFING §7 reconstruction — cross-check clean).

# Survival audit (CONVENTIONS §9, final delivery — 2026-08-26)

- Whole-file re-read performed against the live ledger after the last append.
- **Block presence:** all 36 chapter blocks (`## 2 Chronicles 1` … `## 2 Chronicles 36`) present,
  exactly once each, in canonical order; header, vocabulary-reference note, ch. 12 correction
  entry, and Book-totals block all present.
- **Prior-bytes integrity:** every append in this session was verified immediately after write by
  md5 comparison of the pre-append byte prefix (PREFIX-OK on all 15 appends — no earlier byte was
  ever altered by a later write). At this final audit the live file is byte-identical to the
  ordered concatenation of this thread's appended blocks — no external edit, clobber, or loss
  occurred at any point.
- **Quote verification:** every double-quoted span in the ledger was re-extracted and re-checked
  by substring match directly against the pinned VPL's 2CH lines
  (/home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt, the PR #53 pinned
  content, contentSha256 944e3883…) at this audit — not against any intermediate temp file
  (per the 2026-08-26 shared-scratchpad advisory; this thread's temp files were book-prefixed
  and its extraction was additionally re-diffed against the VPL mid-session, EXTRACT-MATCHES-VPL).
  Result: every span presented as WEB text matches byte-for-byte, with exactly one exception —
  the ch. 12 Decisions-record composite span whose quote-mark rendering is superseded by the
  appended correction entry (the corrected split spans verify). All other non-matching spans are
  the declared non-Scripture categories: search-query phrasings, proposed lexicon terms,
  self-quotes of existing concept-pack lexicon entries, and one quoted repo design-note phrase.
- **Vocabulary cross-check (canonical adopted list):** all four non-engine ids used
  (`davidic-covenant`, `exile-and-captivity`, `sacrifice-and-atonement`, `unequally-yoked`)
  verified present in /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md
  marked engine-built: no; every id marked [engine] in this ledger resolves against the 239
  concept-ids census.
- **AUDIT RESULT: PASS.** 36/36 chapters delivered; no missing blocks; no clobbered bytes;
  nothing to re-apply.
