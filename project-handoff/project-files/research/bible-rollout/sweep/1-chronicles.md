# 1 Chronicles sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (per the history-books
  scout's concept-inventory.md); §11.1 adopted display-tag vocabulary per the canonical
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids,
  engine-built flags checked against the 239-pack census).
- Book: 1 Chronicles (29 chapters; WEB book code 1CH, 942 verse lines)
- Inputs:
  - Book doc (existing tags = prior art, incl. the 2026-08-25 adopted-tag application pass):
    /mnt/project-files/research/bible-rollout/1-chronicles.md
  - Scout briefing + extracts (conventions, plan, concept inventory, declines/contested,
    corpus-blocked roster): /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
  - Declines & contested calls: tag-gaps-review.md §3 + §1 as resolved by CONVENTIONS §11
    (Jesse 2026-08-25 rulings applied, not re-litigated)
  - Corpus-blocked roster (route, don't duplicate): engine-pack-backlog.md, 50 rows, all
    still gated on PR-β per the 2026-08-26 re-verification
  - WEB text: repo-pinned VPL /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt
    (manifest pipeline/manifests/web.json, manifest sha b6f55cc7…, contentSha256 944e3883…,
    re-admitted 2026-08-25 in PR #53). Every quotation in this ledger was verified
    byte-for-byte (grep -F, curly apostrophes intact) against that file before writing —
    117/117 planned spans matched, zero mismatches.
- CORPUS STATUS (binding for every engine-facing candidate below): 1 Chronicles has ZERO
  verses in the current CI fixture corpus (pipeline/fixtures/web-subset.json, 213 chapters).
  Therefore EVERY anchor-extension, lexicon, and new-concept candidate in this ledger is
  **CORPUS-BLOCKED-UNTIL-EXPANSION** — it rides the full-corpus expansion PR (PR-β, owned by
  another thread, blocked on the corpus-expansion ruling packet). Candidate sections below
  carry the mark once per section rather than per row; it applies to every row.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification after every
  append, final survival audit — CONVENTIONS §9 protocol applies to this file. This thread
  writes ONLY this file (no book-doc edits, no tag-gaps.md writes).
- Rules applied: CONVENTIONS §5 + §11 verbatim — honest-substantial-presence bar first,
  always; soft cap 6 / hard ceiling 8; §11.6 yield order (cross-ref class → theme-witness-
  with-caveat → thin single-verse → broad-duplicating-specific) with a Decisions-record
  entry for every yield; both-tags ruling; no later-revelation read-backs; honest-and-empty
  preferred; exact ids only (YAML basenames; adopted ids exactly as the §11.1 list spells
  them); no theology adjudication in any label or gist. The prior rollout's deliberate
  choice to leave 1 Chronicles 21:1 unharmonized with 2 Samuel 24:1 is respected throughout.
- Legend — each chapter entry carries these sections, in order:
  1. "## 1 Chronicles <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc, incl. 2026-08-25 application pass)
  3. Applied-tag deltas (ADD / KEEP / DROP with word-for-word in-chapter WEB quote + verse refs, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.") — all CORPUS-BLOCKED-UNTIL-EXPANSION
  5. Lexicon candidates (id | proposed term(s) | 2–3 realistic query phrasings, or "None.") — all CORPUS-BLOCKED-UNTIL-EXPANSION
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote | query phrasings, or "None.") — all CORPUS-BLOCKED-UNTIL-EXPANSION
  7. Decline-overturn proposals (declined item | NEW textual evidence | pointer to original decline, or "None.")
  8. Corpus-blocked routing ("routed to backlog: <id> (roster row N)" notes, or "None.")
  9. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  10. Decisions record (every §11.6 yield and every weighed-and-declined call — no silent drops, or "None.")

---

## 1 Chronicles 1 (subdivided: 1:1–27; 1:28–34; 1:35–54)
- Existing tags (book doc): `nations-and-peoples`
- Applied-tag deltas:
  - KEEP `nations-and-peoples` — the chapter is the table of nations retold: every people traced through "Noah, Shem, Ham, and Japheth" (1:4), the world's families listed before the line narrows to "Abram (also called Abraham)" (1:27).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `nations-and-peoples` | 1 Chronicles 1:5–23 | "in his days the earth was divided" (1:19) | w0.5 — the Chronicler's compressed Genesis-10 table; pack already anchors Genesis 10:32, this is the OT's second full statement of it.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 1 Chronicles 2
- Existing tags (book doc): none (honest-and-empty).
- Applied-tag deltas: No changes — genealogy roster; honest-and-empty stands against the full 239-id library.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: `divine-judgment` weighed for 2:3 — Er "was wicked in the LORD’s sight; and he killed him" — and declined: one verse inside a 55-verse tribal roster does not clear the substantial-presence bar (same arithmetic as the book doc's ch-7/27 declines).

## 1 Chronicles 3
- Existing tags (book doc): none (honest-and-empty).
- Applied-tag deltas: No changes — royal-line genealogy; honest-and-empty stands against the full library (the exile-crossing line of 3:17–24 is narrative identity material, not any concept's teaching substance).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Chronicles 4 (subdivided: 4:1–8; 4:9–10; 4:11–23; 4:24–43)
- Existing tags (book doc): `prayer` (single-tag chapter)
- Applied-tag deltas:
  - KEEP `prayer` — Jabez's complete asked-and-answered prayer inside the genealogy: he "called on the God of Israel" and "God granted him that which he requested" (4:9–10).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `prayer` | 1 Chronicles 4:10 | "God granted him that which he requested" | w0.6 — with the book doc's recorded caution carried: the passage's popular prosperity-formula use is the DOCTRINAL-BASIS named exclusion, so gist/fixture design must stay descriptive.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `prayer` | terms: "prayer of jabez", "jabez" | queries: "prayer of Jabez", "Jabez in the Bible", "bless me and enlarge my border" — heavy query family with no current lexicon home; prosperity-misuse caution as above (carried from the book doc's noted-not-logged flag and the tag-gaps-review §3.5 1 Chronicles note — this is that flag surfaced for curation, not a new duplicate).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (4 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: the book doc's deliberate `blessing` withhold on 4:10 (Decisions #7 — prosperity-misroute risk on the single most exploited passage) stands; no new textual evidence, not re-litigated.

## 1 Chronicles 5 (subdivided: 5:1–10; 5:11–22; 5:23–26)
- Existing tags (book doc): `trust-in-god`, `prayer`, `divine-judgment`
- Applied-tag deltas:
  - KEEP `trust-in-god` — the battle's stated turning point: "he answered them because they put their trust in him" (5:20).
  - KEEP `prayer` — "they cried to God in the battle" and were answered (5:20).
  - KEEP `divine-judgment` — "They trespassed against the God of their fathers" (5:25); "So the God of Israel stirred up the spirit of Pul king of Assyria" and the eastern tribes were carried away (5:26).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `trust-in-god` | 1 Chronicles 5:20 | "he answered them because they put their trust in him" | w0.7 — a narrative trust-answered anchor for a pack whose anchors are all didactic; the book doc's motif 11 named this verse.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `exile-and-captivity` (roster row 45) — 5:6 (Beerah carried away captive), 5:22 ("They lived in their place until the captivity"), 5:25–26 (the Assyrian deportation "to this day"). New 1 Chronicles witnesses for that row; the fold-vs-separate routing remains Jesse's call, nothing prejudged.
- Ceiling / refinement flags: book-doc subdivision (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `idolatry` weighed for 5:25 ("played the prostitute after the gods of the peoples of the land") and declined — one clause inside the judgment report; the judgment substance is already carried by `divine-judgment`, and the chapter does not depict idolatry's teaching substance beyond naming the trespass.

## 1 Chronicles 6 (subdivided: 6:1–30; 6:31–47; 6:48–53; 6:54–81)
- Existing tags (book doc): `worship` (single-tag chapter)
- Applied-tag deltas:
  - KEEP `worship` — the founding of the ordered song ministry: the singers David set over "the service of song in the LORD’s house" (6:31), ministering by their appointed order (6:31–33, 39, 44).
  - ADD `priesthood` — the chapter's spine is the priestly tribe itself: the high-priestly line traced from Aaron to the captivity (6:1–15), the Levites "appointed for all the service of the tabernacle of God’s house" (6:48), and the reserved altar work — "But Aaron and his sons offered on the altar of burnt offering, and on the altar of incense" ... "to make atonement for Israel, according to all that Moses the servant of God had commanded" (6:49). This is the pack's own OT register (its anchors include Exodus 28:1; Deuteronomy 33:8–11); the id postdates the book doc's 131-id vintage, so this is a gap-closing add, not an overturn. Chapter now carries 2 tags.
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `priesthood` | 1 Chronicles 6:48–49 | "But Aaron and his sons offered on the altar of burnt offering, and on the altar of incense" (6:49) | w0.7 — the OT division of ministry stated in one breath (Levites serve, Aaron's sons atone).
  - `worship` | 1 Chronicles 6:31–32 | "the service of song in the LORD’s house" (6:31) | w0.6 — the institutional founding of Israel's song ministry.
- Lexicon candidates: None (the music/singing lexicon flag is carried at ch. 16 and 25, its densest anchors).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (4 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 1 Chronicles 7
- Existing tags (book doc): `comforting-others`
- Applied-tag deltas:
  - KEEP `comforting-others` — the muster's one open scene: "Ephraim their father mourned many days, and his brothers came to comfort him" (7:22), with the house rebuilt afterward (7:23–24).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `comforting-others` | 1 Chronicles 7:21–23 | "Ephraim their father mourned many days, and his brothers came to comfort him" (7:22) | w0.6 — a narrative model-comfort anchor beside the pack's Job 2:11–13.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: the pastoral-register decline on 7:21–23 (`pastoral-grief-and-loss`; book doc Decisions #3 — three verses inside a forty-verse muster fail the substantial-presence bar) stands; the §1(c) `lament` decline for 7:22 (bereavement, not the lament practice) is ruled and not re-litigated.

## 1 Chronicles 8
- Existing tags (book doc): none (honest-and-empty).
- Applied-tag deltas: No changes — Benjamin/Saul genealogy; honest-and-empty stands against the full library.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Chronicles 9 (subdivided: 9:1–34; 9:35–44)
- Existing tags (book doc): `the-house-of-god`
- Applied-tag deltas:
  - KEEP `the-house-of-god` — the restored community organized entirely around the house's service: "very able men for the work of the service of God’s house" (9:13), gatekeepers in their office of trust (9:22), for whom "it was their duty to open it morning by morning" (9:27), vessels counted in and out, singers on duty day and night (9:26–33).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `the-house-of-god` | 1 Chronicles 9:22–33 | "it was their duty to open it morning by morning" (9:27) | w0.55 — the house's daily service kept by a resettled people.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: the book doc's `worship` withhold for ch. 9 (Decisions #13 — the in-chapter text never uses worship/praise language for the service) stands; no new evidence.

## 1 Chronicles 10
- Existing tags (book doc): `divine-judgment`, `sin`, `seeking-god`
- Applied-tag deltas:
  - KEEP `divine-judgment` — the narrator's explicit sentence: "So Saul died for his trespass which he committed against the LORD" (10:13), "Therefore he killed him, and turned the kingdom over to David the son of Jesse" (10:14).
  - KEEP `sin` — the trespass named in full: the LORD's word not kept, counsel sought from a familiar spirit (10:13).
  - KEEP `seeking-god` — the book's seeking theme opens in its cautionary register: Saul "asked counsel of one who had a familiar spirit, to inquire" (10:13) "and didn’t inquire of the LORD. Therefore he killed him, and turned the kingdom over to David the son of Jesse" (10:14).
  - ADD `occult-and-divination` — the chapter's verdict makes medium-consulting a named capital trespass: Saul died because "he asked counsel of one who had a familiar spirit, to inquire" (10:13) — the same forbidden practice the pack's own OT anchors condemn (Deuteronomy 18:9–14; 1 Samuel 28:3–20, the very séance this verse refers back to), here with the narrator's own judgment attached. Justification refs in-chapter only; the id postdates the book doc's vocabulary vintage. Chapter now carries 4 tags.
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `occult-and-divination` | 1 Chronicles 10:13–14 | "he asked counsel of one who had a familiar spirit, to inquire" (10:13) | w0.6 — the OT's plainest narrative verdict on consulting a medium.
  - `seeking-god` | 1 Chronicles 10:13–14 | "and didn’t inquire of the LORD. Therefore he killed him, and turned the kingdom over to David the son of Jesse" (10:14) | w0.5 — the cautionary end of the chain the pack already anchors at 1 Chronicles 16:10–11 and 28:9.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `death-and-burial` (roster row 22) — 10:11–12: the valiant men of Jabesh Gilead "buried their bones under the oak in Jabesh, and fasted seven days"; a new burial-practice witness for that row (its lone in-corpus ref today is the 1 Samuel 31 parallel of this very scene).
- Ceiling / refinement flags: none.
- Decisions record: the book doc's `fasting` decline (10:12's seven-day fast is funerary custom reported without teaching substance) stands — the funerary register is carried in the row-22 routing above, not as a tag.

## 1 Chronicles 11 (subdivided: 11:1–9; 11:10–47)
- Existing tags (book doc): `gods-faithfulness`, `gods-protection`
- Applied-tag deltas:
  - KEEP `gods-faithfulness` — the kingship arrives as a word kept: David anointed "according to the LORD’s word by Samuel" (11:3), the mighty men gathered to make him king "according to the LORD’s word concerning Israel" (11:10).
  - KEEP `gods-protection` — the victories are the LORD's: "the LORD saved them by a great victory" (11:14); David grows great "for the LORD of Armies was with him" (11:9).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `shepherds-and-the-flock` | 1 Chronicles 11:2 | "You shall be shepherd of my people Israel" | w0.6 — the shepherd-as-leader commission verse, the pack's own Psalms 78:70–72 register in narrative form.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `shepherds-and-the-flock` weighed as a tag ADD and declined on the presence bar — 11:2 is one commission clause in a 47-verse chapter (thin single-verse class); routed to the anchor-extension candidate above instead.

## 1 Chronicles 12 (subdivided: 12:1–22; 12:23–40)
- Existing tags (book doc): `gods-faithfulness`, `harmony-with-others`
- Applied-tag deltas:
  - KEEP `gods-faithfulness` — the muster gathers "to turn the kingdom of Saul to him, according to the LORD’s word" (12:23).
  - KEEP `harmony-with-others` — hearts knit in peace around a common allegiance: "my heart will be united with you" (12:17), Amasai's Spirit-given "Peace, peace be to you, and peace be to your helpers" (12:18), a nation of one heart (12:38–40). (Register call recorded in book doc Decisions #9; stands.)
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `empowered-by-the-spirit` (roster row 13) — 12:18: "Then the Spirit came on Amasai", who then speaks the pledge. A non-Judges Spirit-came-on witness for that row's re-pin curator (the roster's blocking refs are the Judges refrain).
  - routed to backlog: `counsel-and-advisers` (roster row 15) — 12:32: Issachar's "men who had understanding of the times, to know what Israel ought to do"; the roster row already names 1 Chr 12 among its signature texts.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: the application-pass declines for ch. 12 (book doc Decisions #28: `counsel-and-advisers` and `leadership` at 12:32 — one list-item inside the muster; `wholehearted-devotion` at 12:33, 38 — muster descriptors) stand; the substance is served by the row-15 routing above.

## 1 Chronicles 13
- Existing tags (book doc): `divine-judgment`, `blessing`, `leadership`, `seeking-god`
- Applied-tag deltas:
  - KEEP `divine-judgment` — "he struck him because he put his hand on the ark; and he died there before God" (13:10).
  - KEEP `blessing` — the same ark, rightly housed: "the LORD blessed Obed-Edom’s house and all that he had" (13:14).
  - KEEP `leadership` — the project begins with consultation, not decree: "David consulted with the captains of thousands and of hundreds, even with every leader" (13:1), and moves only when "the thing was right in the eyes of all the people" (13:4).
  - KEEP `seeking-god` — the project framed as seeking resumed after neglect: "let’s bring the ark of our God back to us again, for we didn’t seek it in the days of Saul" (13:3).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `leadership` | 1 Chronicles 13:1–4 | "David consulted with the captains of thousands and of hundreds, even with every leader" (13:1) | w0.6 — consultative decision-making as narrative leadership substance.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `divine-judgment` | terms: "uzzah", "why did uzzah die" | queries: "why did Uzzah die", "Uzzah and the ark", "why was touching the ark punished" — the familiar query spelling is "Uzzah" while the WEB reads "Uzza" (13:9–11), so no bare word search can serve these queries; the book doc flagged exactly this spelling gap for any lexicon touching the ark narratives.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: the book doc's `obedience-to-the-word` withhold on ch. 13 (Decisions #5 — the chapter depicts the failure mode; the success is tagged on ch. 15) and its `worship` withhold (13:8 is one verse of celebration inside an interrupted arc) both stand; no new evidence.

## 1 Chronicles 14
- Existing tags (book doc): `guidance`, `obedience-to-the-word`, `gods-protection`
- Applied-tag deltas:
  - KEEP `guidance` — "David inquired of God" before each battle and received different directions each time: "Go up; for I will deliver them into your hand" (14:10), then "You shall not go up after them. Turn away" (14:14).
  - KEEP `obedience-to-the-word` — the outcome tied to doing exactly what was said: "David did as God commanded him" (14:16).
  - KEEP `gods-protection` — "God has gone out before you to strike the army of the Philistines" (14:15).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `guidance` | 1 Chronicles 14:10–16 | "David inquired of God" (14:10) | w0.7 — the ask-before-acting narrative pattern, twice in one chapter with different answers.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `guidance` | terms: "inquire of the lord", "inquired of god" | queries: "inquiring of the Lord", "David inquired of the Lord", "asking God before a decision" — the inquire-vocabulary appears in no current lexicon, and in this book it is the stated difference between Saul (10:14) and David (14:10, 14).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: the application-pass `idolatry` decline at 14:12 (one in-scene verse — the abandoned gods burned) stands (book doc Decisions #28).

## 1 Chronicles 15 (subdivided: 15:1–24; 15:25–29)
- Existing tags (book doc): `obedience-to-the-word`, `worship`, `seeking-god`
- Applied-tag deltas:
  - KEEP `obedience-to-the-word` — the correction chapter: the ordinance named (15:13), the ark borne "as Moses commanded according to the LORD’s word" (15:15).
  - KEEP `worship` — appointed singers "sounding aloud and lifting up their voices with joy" (15:16), the procession with shouting, trumpets, and cymbals (15:28).
  - KEEP `seeking-god` — the diagnosis in seeking language: "we didn’t seek him according to the ordinance" (15:13).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `obedience-to-the-word` | 1 Chronicles 15:13–15 | "we didn’t seek him according to the ordinance" (15:13) | w0.65 — the named diagnosis and the done-as-written correction in one span.
  - `priesthood` | 1 Chronicles 15:2 | "No one ought to carry God’s ark but the Levites. For the LORD has chosen them to carry God’s ark, and to minister to him forever" | w0.5 — the chosen-ministers register in David's own ruling.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `priesthood` weighed as a tag ADD and declined on the presence bar — the chapter's subject is the Levites' right carrying inside the obedience arc, and the chosen-ministers point is concentrated in 15:2 (thin single-verse class); routed to the anchor-extension candidate above.

## 1 Chronicles 16 (subdivided: 16:1–6; 16:7–36; 16:37–43)
- Existing tags (book doc): `thanksgiving`, `praise`, `worship`, `covenant`, `joy-in-the-lord`, `seeking-god`, `idolatry` (7 tags — over the soft cap, under the ceiling; each cleared the bar at the application pass)
- Applied-tag deltas:
  - KEEP `thanksgiving` — thanks as the chapter's founding act: Levites appointed "to commemorate, to thank, and to praise the LORD" (16:4); "Oh give thanks to the LORD. Call on his name" (16:8); "Oh give thanks to the LORD, for he is good, for his loving kindness endures forever" (16:34).
  - KEEP `praise` — "Sing to him. Sing praises to him" (16:9); all the people "praised the LORD" (16:36).
  - KEEP `worship` — "Ascribe to the LORD the glory due to his name" ... "Worship the LORD in holy array" (16:29), with continual ministry established before the ark (16:37–40).
  - KEEP `covenant` — "Remember his covenant forever" (16:15), "the covenant which he made with Abraham, his oath to Isaac" (16:16–17).
  - KEEP `joy-in-the-lord` — "Let the heart of those who seek the LORD rejoice" (16:10), creation itself called to joy (16:31–33).
  - KEEP `seeking-god` — "Seek the LORD and his strength. Seek his face forever more" (16:11) — the pack's own 16:10–11 anchor text.
  - KEEP `idolatry` — the creed-line comparison: "all the gods of the peoples are idols, but the LORD made the heavens" (16:26).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `thanksgiving` | 1 Chronicles 16:34 | "Oh give thanks to the LORD, for he is good, for his loving kindness endures forever" | w0.85 — the refrain verse itself, one of Scripture's most-quoted thanksgiving lines.
  - `thanksgiving` | 1 Chronicles 16:8 | "Oh give thanks to the LORD. Call on his name" | w0.7 — the psalm's opening command.
  - `god-reigns` | 1 Chronicles 16:31 | "Let them say among the nations" ... "The LORD reigns!" | w0.7 — the pack's Psalms 96:10 line in its Chronicles setting.
  - `covenant` | 1 Chronicles 16:15–17 | "the covenant which he made with Abraham, his oath to Isaac" (16:16) | w0.7 — the Abraham-Isaac-Jacob covenant memory sung.
  - `glory-of-god` | 1 Chronicles 16:24, 28–29 | "Declare his glory among the nations" (16:24) | w0.5 — declare-his-glory register beside the pack's manifest-glory anchors.
  - `worship` | 1 Chronicles 16:29 | "Worship the LORD in holy array" | w0.6 — a direct worship command in the pack's own vocabulary.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `thanksgiving` | terms: "his loving kindness endures forever", "his love endures forever" | queries: "give thanks to the Lord for he is good", "his love endures forever", "God's love endures forever" — the refrain (16:34, 41) is a heavy remembered-phrase family carried by no current lexicon (NIV-remembered wording included per the PD-wording caution — flag for the plan §6 decision-5 posture before any non-WEB phrasing lands).
  - `worship` | terms: "worship music", "temple musicians" | queries: "worship music in the Bible", "temple musicians", "music in worship" — the book doc's recorded flag (neither `worship` nor `praise` carries music/singing/instrument phrasings; 16:23 and 25:6–7 would anchor); surfaced for curation, not duplicated as a gap row (Nehemiah's no-row decline governs — lexicon extension is the route).
  - `praise` | terms: "sing to the lord", "sing praises" | queries: "sing to the Lord", "singing to God", "songs of praise in the Bible" — anchored by "Sing to the LORD, all the earth!" (16:23) and "Sing to him. Sing praises to him" (16:9).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (3 sections); 7 tags (soft cap exceeded under §11.6 with each tag independently clearing the bar) → PER-VERSE REFINEMENT candidate.
- Decisions record: `god-reigns` weighed as an 8th tag and YIELDED (§11.6 thin-single-verse class — the kingship note is one psalm line, 16:31, in a 43-verse chapter; presence bar not cleared for the chapter as a whole); carried as the anchor-extension candidate above. The book doc's cap-line drops (Decisions #17: `gods-faithfulness` folded into `covenant`; `salvation` declined as read-back risk; `nations-and-peoples` left out as the psalm's outward edge) stand unchanged — re-weighed against the 239-id library, same verdicts.

## 1 Chronicles 17 (subdivided: 17:1–15; 17:16–27)
- Existing tags (book doc): `covenant`, `gods-faithfulness`, `prayer`, `humble-exaltation`, `davidic-covenant`
- Applied-tag deltas:
  - KEEP `covenant` — the binding commitment retold in full: "I will be his father, and he will be my son" (17:13), "I will settle him in my house and in my kingdom forever. His throne will be established forever" (17:14).
  - KEEP `gods-faithfulness` — "I will not take my loving kindness away from him" (17:13); David's prayer stands on the promise: "you are God, and have promised this good thing to your servant" (17:26).
  - KEEP `prayer` — David sits before the LORD and prays the promise back: "Who am I, LORD God, and what is my house, that you have brought me this far?" (17:16) through 17:27.
  - KEEP `humble-exaltation` — "I took you from the sheep pen, from following the sheep, to be prince over my people Israel" (17:7), answered by "Who am I…?" (17:16).
  - KEEP `davidic-covenant` (§11.1 adopted display id, engine-built: no) — the promise itself, 17:11–14; display tag stands, engine side rides the roster (routing below).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `covenant` | 1 Chronicles 17:11–14 | "I will settle him in my house and in my kingdom forever. His throne will be established forever" (17:14) | w0.75 — the Chronicles parallel of the pack's existing 2 Samuel 7:12–16 anchor.
  - `no-other-god` | 1 Chronicles 17:20 | "there is no one like you, neither is there any God besides you" | w0.6 — the pack's exact register in David's prayer.
  - `prayer` | 1 Chronicles 17:16–27 | "Who am I, LORD God, and what is my house, that you have brought me this far?" (17:16) | w0.6 — praying a promise back to God as narrative prayer substance.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `davidic-covenant` (roster row 44) — 17:7–14 is the row's fullest Chronicles statement (the roster already lists the Chronicles stress-texts among its blocked refs).
  - routed to backlog: `gods-surprising-choice` (roster row 21) — 17:7 ("I took you from the sheep pen, from following the sheep, to be prince") as a new witness for the standing one-design decision (with `god-looks-at-the-heart` + `humble-exaltation`); nothing prejudged, per the Jesse gate.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `no-other-god` weighed as a tag ADD and declined on the presence bar — 17:20 is one confession verse inside the prayer (thin single-verse class); routed to the anchor-extension candidate above.

## 1 Chronicles 18
- Existing tags (book doc): `gods-protection`, `justice-and-oppression`
- Applied-tag deltas:
  - KEEP `gods-protection` — the chapter's stated engine, twice verbatim: "The LORD gave victory to David wherever he went" (18:6, 13).
  - KEEP `justice-and-oppression` — the reign's verdict in the righteous-ruler register: "he executed justice and righteousness for all his people" (18:14).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `gods-protection` | 1 Chronicles 18:6, 13 | "The LORD gave victory to David wherever he went" | w0.6 — the repeated attribution formula.
  - `justice-and-oppression` | 1 Chronicles 18:14 | "he executed justice and righteousness for all his people" | w0.55 — the righteous-ruler register the shared row's append opened.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Chronicles 19
- Existing tags (book doc): `trust-in-god`, `kindness`, `comforting-others`
- Applied-tag deltas:
  - KEEP `trust-in-god` — Joab's battle-line theology: do your utmost and commit the outcome — "Be courageous, and let’s be strong for our people and for the cities of our God. May the LORD do that which seems good to him" (19:13).
  - KEEP `kindness` — "I will show kindness to Hanun the son of Nahash, because his father showed kindness to me" (19:2) — kindness offered, misread, and costly.
  - KEEP `comforting-others` — David "sent messengers to comfort him concerning his father" (19:2), the comfort suspected as espionage (19:3) — the practice's cautionary side, reported without the text faulting the comforters.
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `kindness` | 1 Chronicles 19:2 | "I will show kindness to Hanun the son of Nahash, because his father showed kindness to me" | w0.6 — remembered kindness repaid, beside the pack's 2 Samuel 9:1–7 anchor (the same Davidic practice).
  - `trust-in-god` | 1 Chronicles 19:13 | "May the LORD do that which seems good to him" | w0.65 — commit-the-outcome trust under pressure.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `courage` (roster row 17) — 19:13 "Be courageous, and let’s be strong for our people and for the cities of our God": the human courage-to-act register that row documents (its own note says the in-corpus texts are fear-not's divine-comfort register, which is precisely not the gap); a new witness for the re-pin curator.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Chronicles 20
- Existing tags (book doc): none (honest-and-empty; the chapter contains no reference to God — book doc Decisions #10).
- Applied-tag deltas: No changes — honest-and-empty stands against the full library; 20:3's harshest verse remains reported without comment and without cross-book harmonization, per the book doc's no-import precedent.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Chronicles 21
- Existing tags (book doc): `sin`, `repentance`, `divine-judgment`, `prayer`, `worship`, `satan`, `mercy`, `angels` (8 tags — HARD CEILING)
- Applied-tag deltas:
  - KEEP `sin` — guilt incurred and owned: "I have sinned greatly, in that I have done this thing" (21:8).
  - KEEP `repentance` — confession without excuse, sackcloth, faces to the ground (21:8, 16).
  - KEEP `divine-judgment` — the pestilence, seventy thousand fallen, the destroying angel over Jerusalem (21:12, 14–16).
  - KEEP `prayer` — the intercession "but these sheep, what have they done?" (21:17), and the altar prayer: David "called on the LORD; and he answered him from the sky by fire" (21:26).
  - KEEP `worship` — costly sacrifice as the resolution: "nor offer a burnt offering that costs me nothing" (21:24), offerings answered by fire (21:26–28).
  - KEEP `satan` — "Satan stood up against Israel, and moved David to take a census of Israel" (21:1) — reported exactly as the WEB gives it, no theory of agency, no harmonization with 2 Samuel 24:1 (the prior rollout's deliberate call, respected). Note: 1 Chronicles 21:1 is ALREADY an engine anchor of `satan` (w0.8) — dormant until expansion.
  - KEEP `mercy` — "Let me fall, I pray, into the LORD’s hand, for his mercies are very great" (21:13).
  - KEEP `angels` — the LORD's angel "having a drawn sword in his hand stretched out over Jerusalem" (21:16), halted (21:15), commanding through Gad (21:18), and "he put his sword back into its sheath" (21:27).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `mercy` | 1 Chronicles 21:13 | "Let me fall, I pray, into the LORD’s hand, for his mercies are very great" | w0.75 — a classic mercy prooftext; the book doc and the shared table's Hosea row both name it.
  - `angels` | 1 Chronicles 21:15–16, 27 | "having a drawn sword in his hand stretched out over Jerusalem" (21:16) | w0.65 — the destroying-angel narrative, beside the pack's Exodus/Genesis appearance anchors.
  - `worship` | 1 Chronicles 21:24–26 | "nor offer a burnt offering that costs me nothing" (21:24) | w0.6 — the costly-worship verse; the 2 Samuel thread's recorded `worship` lexicon-extension flag (2 Sam 24:24) has its Chronicles parallel here.
  - `prayer` | 1 Chronicles 21:26 | "called on the LORD; and he answered him from the sky by fire" | w0.55 — prayer answered visibly at the future temple site.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `mercy` | terms: "his mercies are very great", "fall into the hands of the lord" | queries: "his mercies are great", "fall into the hands of a merciful God", "God's mercy is great" — the phrase family the book doc flagged for the eventual mercy pack work; no current lexicon carries it.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `god-relents` (roster row 7) — 21:15: "the LORD saw, and he relented of the disaster" — a narrative relenting witness (not conditional-prophecy wording) for that row's re-pin curator; the row's gist-care note (keep separate from immutability) applies.
- Ceiling / refinement flags: HARD CEILING 8 → PER-VERSE REFINEMENT candidate (the sin/judgment/intercession/altar arc subdivides naturally at 21:1–7, 21:8–17, 21:18–30 for verse-range anchoring).
- Decisions record: at the ceiling, no further candidates were weighed for tags; all new material routed to anchor-extension/routing rows above. The 21:1 no-harmonization ruling (book doc Decisions #4) is respected, not re-litigated.

## 1 Chronicles 22 (subdivided: 22:1–5; 22:6–19)
- Existing tags (book doc): `obedience-to-the-word`, `fear-not`, `gods-faithfulness`, `davidic-covenant`, `the-house-of-god`, `seeking-god` (6 tags — soft cap)
- Applied-tag deltas:
  - KEEP `obedience-to-the-word` — the condition over the whole enterprise: "Then you will prosper, if you observe to do the statutes and the ordinances which the LORD gave Moses concerning Israel" (22:13) — covenant language, not formula (book doc Decisions #16).
  - KEEP `fear-not` — the charge in classic form: "Be strong and courageous. Don’t be afraid and don’t be dismayed" (22:13).
  - KEEP `gods-faithfulness` — rest given as promised: "Hasn’t he given you rest on every side?" (22:18), and the named son foretold (22:9).
  - KEEP `davidic-covenant` (§11.1 adopted display id, engine-built: no) — the promise recited to the son it names: "He shall build a house for my name; and he will be my son, and I will be his father" (22:10); engine side rides the roster (routing below).
  - KEEP `the-house-of-god` — the site identified: "This is the house of the LORD God, and this is the altar of burnt offering for Israel" (22:1), and the house begun in earnest (22:2–5, 14–16).
  - KEEP `seeking-god` — the closing charge: "Now set your heart and your soul to follow the LORD your God" (22:19).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `the-house-of-god` | 1 Chronicles 22:1 | "This is the house of the LORD God, and this is the altar of burnt offering for Israel" | w0.75 — the landmark identification verse.
  - `fear-not` | 1 Chronicles 22:13 | "Be strong and courageous. Don’t be afraid and don’t be dismayed" | w0.6 — the Joshua-formula charge handed to Solomon.
  - `seeking-god` | 1 Chronicles 22:19 | "Now set your heart and your soul to follow the LORD your God" | w0.65 — the seek-the-LORD chain's charge to the princes (pack anchors 16:10–11 and 28:9 already; 22:19 completes the book's chain with 10:13–14 and 15:13).
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `fear-not` | terms: "be strong and courageous" | queries: "be strong and courageous", "be strong and courageous Bible verse", "God said be strong and courageous" — the Joshua-block lexicon-extension flag (tag-gaps-review §3.5, "be strong and courageous" → `fear-not`) with 1 Chronicles 22:13 and 28:20 as additional anchors; surfaced, not duplicated.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `davidic-covenant` (roster row 44) — 22:9–10, the promise handed on.
- Ceiling / refinement flags: book-doc subdivision (2 sections); soft cap 6 reached → PER-VERSE REFINEMENT candidate.
- Decisions record: `work-and-diligence` weighed for 22:2, 15 (masons, "workmen with you in abundance") and declined — workforce rosters inside the preparation narrative, not the concept's teaching substance (same verdict as the book doc's ch-26 call).

## 1 Chronicles 23 (subdivided: 23:1–6; 23:7–23; 23:24–32)
- Existing tags (book doc): `worship`, `praise`
- Applied-tag deltas:
  - KEEP `worship` — the Levite order rebuilt around the house's service: "four thousand praised the LORD with the instruments which I made for giving praise" (23:5), duties in 23:28–31.
  - KEEP `praise` — a standing daily office created: "to stand every morning to thank and praise the LORD, and likewise in the evening" (23:30).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `priesthood` | 1 Chronicles 23:13 | "Aaron was separated that he should sanctify the most holy things, he and his sons forever, to burn incense before the LORD, to minister to him, and to bless in his name forever" | w0.6 — the set-apart-forever statement of the priestly calling.
  - `praise` | 1 Chronicles 23:30 | "to stand every morning to thank and praise the LORD, and likewise in the evening" | w0.6 — praise as a standing daily office.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: book-doc subdivision (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `priesthood` weighed as a tag ADD and declined on the presence bar — the chapter's subject is the Levites' reorganized service; the Aaron-set-apart point is one verse (23:13, thin single-verse class); routed to the anchor-extension candidate above.

## 1 Chronicles 24
- Existing tags (book doc): none (honest-and-empty at the 131-id vintage and the application pass).
- Applied-tag deltas:
  - ADD `priesthood` — the chapter IS the priesthood put in order: "Eleazar and Ithamar served as priests" (24:2), David divides them "according to their ordering in their service" (24:3) into the twenty-four courses, each lot fixing when they "come into the LORD’s house according to the ordinance given to them by Aaron their father" (24:19). The whole chapter depicts the ordered priestly ministry — the pack's own OT register; the id postdates the book doc's vocabulary vintage, so this is a gap-closing add. (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `priesthood` | 1 Chronicles 24:1–19 | "to come into the LORD’s house according to the ordinance given to them by Aaron their father" (24:19) | w0.6 — the twenty-four priestly courses, the OT's fullest priestly-service ordering.
- Lexicon candidates: None.
- New-concept candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - proposed-id `casting-lots` | rationale: "casting lots in the Bible" is a real lay query family with no vocabulary home — `guidance` is God-directs-the-seeker, `occult-and-divination` is the forbidden practices, and neither carries lot vocabulary; this book depicts the sanctioned practice repeatedly and levellingly | in-book anchors: 24:5 "divided impartially by drawing lots"; 24:31; 25:8 "the small as well as the great, the teacher as well as the student"; 26:13 "They cast lots, the small as well as the great, according to their fathers’ houses, for every gate" | out-of-book anchor candidates for the curator: Proverbs 16:33; Leviticus 16:8; Joshua 18:6; Jonah 1:7; Acts 1:26 | queries: "casting lots in the Bible", "what does the Bible say about casting lots", "deciding by lot" | checked against the declines (§3), the contested calls (§1), and the 50-row roster: absent from all three. Gist must describe the practice, never adjudicate its use today.
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: the book doc's `obedience-to-the-word` decline at 24:19 (Decisions #13 — administrative compliance, not hearing-and-doing substance) stands; the `priesthood` ADD is a different register (ordered ministry), not an overturn of that call.

## 1 Chronicles 25
- Existing tags (book doc): `worship`, `praise`
- Applied-tag deltas:
  - KEEP `worship` — a permanent, skilled music ministry: "for song in the LORD’s house, with cymbals, stringed instruments, and harps, for the service of God’s house" (25:6), two hundred eighty-eight "instructed in singing to the LORD" (25:7).
  - KEEP `praise` — the service defined as praise: set apart to prophesy "in giving thanks and praising the LORD with the harp" (25:3).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `worship` | 1 Chronicles 25:6–7 | "for song in the LORD’s house, with cymbals, stringed instruments, and harps, for the service of God’s house" (25:6) | w0.65 — the trained-musicians charter; with 16:23 this is the anchor pair for the music-phrasings lexicon flag (see ch. 16 lexicon candidates).
  - `praise` | 1 Chronicles 25:1–3 | "who were to prophesy with harps, with stringed instruments, and with cymbals" (25:1) | w0.6 — skilled instrumental praise as appointed ministry.
- Lexicon candidates: covered by the ch. 16 music-phrasings entries (25:6–7 named there as co-anchor); nothing separate added here.
- New-concept candidates: None (25:8's lot-casting rides the ch. 24 `casting-lots` candidate).
- Decline-overturn proposals: None.
- Corpus-blocked routing: None.
- Ceiling / refinement flags: none.
- Decisions record: the book doc's `spiritual-gifts` decline (Decisions #19 — NT-register read-back on "prophesy with harps") stands; no new evidence, and the no-read-back rule governs.

## 1 Chronicles 26 (subdivided: 26:1–19; 26:20–32)
- Existing tags (book doc): `the-house-of-god`, `stewardship`
- Applied-tag deltas:
  - KEEP `the-house-of-god` — the house's perimeter and business set in order: every gate assigned by lot, "watchman opposite watchman" (26:16), Levites over the treasuries, officers and judges for God's business and the king's (26:30, 32).
  - KEEP `stewardship` (§11.1 adopted display id, engine-built: no) — dedicated wealth held in trust across generations: Ahijah "over the treasures of God’s house and over the treasures of the dedicated things" (26:20); "They dedicated some of the plunder won in battles to repair the LORD’s house" (26:27). Engine side rides the roster (routing below).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `the-house-of-god` | 1 Chronicles 26:20–28 | "over the treasures of God’s house and over the treasures of the dedicated things" (26:20) | w0.55 — the house's treasuries and trust-offices.
- Lexicon candidates: None.
- New-concept candidates: None (26:13–14's lot-casting rides the ch. 24 `casting-lots` candidate).
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `stewardship` (roster row 16) — 26:20–28 (treasurers over the dedicated things); the roster row already lists "all 1 Chr refs" among its blocked texts.
- Ceiling / refinement flags: book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: the book doc's `work-and-diligence` decline for ch. 26 (Decisions #13 — rosters of appointments do not depict the concept's substance) stands.

## 1 Chronicles 27
- Existing tags (book doc): `counsel-and-advisers`
- Applied-tag deltas:
  - KEEP `counsel-and-advisers` (§11.1 adopted display id, engine-built: no) — the roster ends at the king's inner counsel, named man by man: Jonathan the counselor (27:32), "Ahithophel was the king’s counselor. Hushai the Archite was the king’s friend" (27:33–34). Engine side rides the roster (routing below). (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `counsel-and-advisers` (roster row 15) — 27:32–34, the row's own central figures (the roster names 1 Chr 27 among its signature texts).
- Ceiling / refinement flags: none.
- Decisions record: the book doc's `gods-faithfulness` decline at 27:23 ("the LORD had said he would increase Israel like the stars of the sky" — one rationale verse in a 34-verse roster; Decisions #13) stands; `stewardship` at 27:25–31 remains declined per the application pass (pure roster of crown property — book doc Decisions #28), and those verses are NOT added to the row-16 routing (the roster's 1 Chr refs already cover the book).

## 1 Chronicles 28 (subdivided: 28:1–10; 28:11–21)
- Existing tags (book doc): `obedience-to-the-word`, `fear-not`, `presence-of-god`, `davidic-covenant`, `god-looks-at-the-heart`, `seeking-god`, `wholehearted-devotion`, `the-house-of-god` (8 tags — HARD CEILING)
- Applied-tag deltas:
  - KEEP `obedience-to-the-word` — the double charge: "observe and seek out all the commandments of the LORD your God" (28:8), the kingdom established "if he continues to do my commandments and my ordinances" (28:7).
  - KEEP `fear-not` — "Be strong and courageous, and do it. Don’t be afraid, nor be dismayed" (28:20).
  - KEEP `presence-of-god` — the courage's ground: "the LORD God, even my God, is with you. He will not fail you nor forsake you" (28:20).
  - KEEP `davidic-covenant` (§11.1 adopted display id, engine-built: no) — "he has chosen Solomon my son to sit on the throne of the LORD’s kingdom over Israel" (28:5), "for I have chosen him to be my son, and I will be his father" (28:6), condition kept beside it (28:7); engine side rides the roster (routing below).
  - KEEP `god-looks-at-the-heart` (§11.1 adopted display id, engine-built: no) — "the LORD searches all hearts, and understands all the imaginations of the thoughts" (28:9); engine side rides the roster (routing below).
  - KEEP `seeking-god` — the promise-form, both halves kept: "If you seek him, he will be found by you; but if you forsake him, he will cast you off forever" (28:9) — an existing engine anchor of the pack (w0.8, dormant until expansion).
  - KEEP `wholehearted-devotion` (§11.1 adopted display id, engine-built: no) — "serve him with a perfect heart and with a willing mind" (28:9); engine side rides the roster (routing below).
  - KEEP `the-house-of-god` — the pattern handed over piece by piece, "the plans of all that he had by the Spirit" (28:12), understood "in writing from the LORD’s hand" (28:19).
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `fear-not` | 1 Chronicles 28:20 | "Be strong and courageous, and do it. Don’t be afraid, nor be dismayed" | w0.65 — the charge's second, fuller statement.
  - `presence-of-god` | 1 Chronicles 28:20 | "the LORD God, even my God, is with you. He will not fail you nor forsake you" | w0.6 — the with-you/never-forsake register the pack's lexicon already carries via Hebrews 13:5.
  - `god-reigns` | 1 Chronicles 28:5 | "he has chosen Solomon my son to sit on the throne of the LORD’s kingdom over Israel" | w0.55 — "the throne of the LORD’s kingdom": the kingdom named as the LORD's own with a human king seated on it; feeds the recorded `god-reigns`/`kingdom-of-heaven` scoping note without deciding it.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `seeking-god` | terms: "if you seek him he will be found" | queries: "if you seek him he will be found by you", "seek God and he will be found", "what happens if I seek God" — the promise-form phrasing of the pack's own 28:9 anchor; no current lexicon term carries the found-by-you wording.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `davidic-covenant` (roster row 44) — 28:5–7.
  - routed to backlog: `god-looks-at-the-heart` (roster row 6) — 28:9, the verse the shared row carries from this book; the standing one-design ruling (with `gods-surprising-choice` + `humble-exaltation`) binds, nothing prejudged.
  - routed to backlog: `wholehearted-devotion` (roster row 18) — 28:9; that row is DESIGN-RESOLVED to land as a `loving-god`/`seeking-god` lexicon extension at re-pin (reversible), so no separate proposal is made here.
- Ceiling / refinement flags: HARD CEILING 8; book-doc subdivision (2 sections) → PER-VERSE REFINEMENT candidate (priority: the 28:9 verse alone carries three concepts' material).
- Decisions record: at the ceiling, no further candidates admitted: `god-reigns` at 28:5 YIELDED (§11.6 thin-single-verse class; carried as the anchor-extension candidate above); `leadership` at 28:1–10, 20 remains YIELDED per the application pass (book doc Decisions #28: duplicate register with `fear-not`/`presence-of-god` at the ceiling) — both survive as per-verse refinement material. `inheritance` weighed for 28:8 ("leave it for an inheritance to your children") and declined — one clause, and the roster row 26's register is the Joshua land-allotment spine; not routed, not tagged.

## 1 Chronicles 29 (subdivided: 29:1–9; 29:10–20; 29:21–25; 29:26–30)
- Existing tags (book doc): `generosity`, `praise`, `prayer`, `providence`, `thanksgiving`, `stewardship`, `wholehearted-devotion`, `mortality` (8 tags — HARD CEILING)
- Applied-tag deltas:
  - KEEP `generosity` — willing, glad giving as the chapter's engine: "Who then offers willingly to consecrate himself today to the LORD?" (29:5), "with a perfect heart they offered willingly to the LORD" (29:9), framed as returning God's own (29:14), never as leverage.
  - KEEP `praise` — the doxology: "Yours, LORD, is the greatness, the power, the glory, the victory, and the majesty!" (29:11), all the assembly blessing the LORD (29:20).
  - KEEP `prayer` — the prayer over the offering, from "who am I" (29:14) to "give to Solomon my son a perfect heart" (29:19).
  - KEEP `providence` — "Yours is the kingdom, LORD, and you are exalted as head above all" (29:11), "Both riches and honor come from you, and you rule over all!" (29:12), "all things come from you" (29:14).
  - KEEP `thanksgiving` — "we thank you and praise your glorious name" (29:13).
  - KEEP `stewardship` (§11.1 adopted display id, engine-built: no) — "all things come from you, and we have given you of your own" (29:14) — possession held in trust, kept clear of prosperity framing per book doc Decisions #6; engine side rides the roster (routing below).
  - KEEP `wholehearted-devotion` (§11.1 adopted display id, engine-built: no) — "with a perfect heart they offered willingly to the LORD" (29:9), "give to Solomon my son a perfect heart" (29:19); engine side rides the roster (routing below).
  - KEEP `mortality` — "Our days on the earth are as a shadow, and there is no remaining" (29:15), spoken inside the doxology.
- Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `providence` | 1 Chronicles 29:11–12 | "Both riches and honor come from you, and you rule over all!" (29:12) | w0.75 — the rule-over-all doxology, the pack's God-is-in-control register in worship form.
  - `generosity` | 1 Chronicles 29:9, 14 | "all things come from you, and we have given you of your own" (29:14) | w0.7 — the giving-back-God's-own theology of giving.
  - `god-reigns` | 1 Chronicles 29:11 | "Yours is the kingdom, LORD, and you are exalted as head above all" | w0.7 — the kingdom named as the LORD's own; with 29:23 ("Then Solomon sat on the throne of the LORD as king instead of David his father", w0.6 as a companion ref) this feeds the recorded god-reigns/kingdom scoping note without deciding it.
  - `mortality` | 1 Chronicles 29:15 | "Our days on the earth are as a shadow, and there is no remaining" | w0.6 — the days-as-shadow register beside the pack's Psalms 90 and 103 anchors.
  - `sojourners-and-strangers` | 1 Chronicles 29:15 | "we are strangers before you and foreigners, as all our fathers were" | w0.55 — the sojourner confession the pack's own Psalms 39:12 anchor echoes.
  - `thanksgiving` | 1 Chronicles 29:13 | "we thank you and praise your glorious name" | w0.55 — thanks spoken over gifts God himself supplied.
  - `humble-exaltation` | 1 Chronicles 29:12 | "It is in your hand to make great" | w0.5 — the pack's promotion-comes-from-God register (Psalms 75:6–7) in David's own words.
- Lexicon candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
  - `mortality` | terms: "our days on the earth are as a shadow", "days are a shadow" | queries: "our days are a shadow", "life is a shadow Bible verse", "life is short Bible verse" — the shadow phrasing is carried by no current lexicon (the pack has "life is short" but not the remembered shadow wording).
  - `generosity` | terms: "everything comes from god", "we have given you of your own" | queries: "everything belongs to God", "giving back to God what is his", "all things come from you" — the 29:14 phrase family; no current lexicon carries it.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Corpus-blocked routing:
  - routed to backlog: `stewardship` (roster row 16) — 29:12–16 ("we have given you of your own" — the row's teaching-substance text per the book doc).
  - routed to backlog: `wholehearted-devotion` (roster row 18) — 29:9, 17, 19 ("perfect heart" refs; rides the row's design-resolution as above).
  - routed to backlog: `god-looks-at-the-heart` (roster row 6) — 29:17 ("you try the heart and have pleasure in uprightness"), the row's second 1 Chronicles witness; tag remains yielded per the application pass (theme's home chapter is 28).
- Ceiling / refinement flags: HARD CEILING 8; book-doc subdivision (4 sections) → PER-VERSE REFINEMENT candidate (the doxology 29:10–19 alone carries seven concepts' material).
- Decisions record: at the ceiling, no further candidates admitted: `god-reigns` at 29:11, 23 YIELDED (§11.6 thin-single-verse class at the ceiling; carried as anchor-extension candidates above); `sojourners-and-strangers` at 29:15 weighed and YIELDED (thin single-verse at the ceiling; anchor-extension candidate above); `humble-exaltation` at 29:12 weighed and YIELDED (same class; anchor-extension candidate above). The application-pass yields (`god-looks-at-the-heart` 29:17; `the-house-of-god` 29:1 — book doc Decisions #28) stand, re-weighed with the same verdicts.

---

# Survival audit (CONVENTIONS §9, final delivery — 2026-08-26)

- Whole-file re-read performed after the last chapter append. All 29 chapter blocks
  (`## 1 Chronicles 1` … `## 1 Chronicles 29`) present exactly once each, in order; the
  header block's bytes verified unchanged (sha256 of the original 4,583-byte header prefix
  re-computed and matched: e79e3cee…). Every append in this file's history passed its
  post-write prefix-hash check (prior bytes unchanged at 4,583 → 9,943 → 16,836 → 24,820 →
  35,336 → 47,468 → 60,174 bytes); no whole-file rewrite ever occurred.
- Quote re-verification (final, after a coordinator warning that the shared scratchpad's
  generic-named temp files can be clobbered by sibling workers): all quoted spans were
  re-extracted from THIS file's live bytes and re-checked byte-for-byte (grep -F) against
  the pinned VPL (contentSha256 944e3883…), using book-prefixed temp files
  (1-chronicles-quotes-verify.txt, 1-chronicles-vpl-1ch.txt). Result: 148 distinct quoted
  spans; 143 WEB-claimed spans ALL match the 1CH corpus bytes; the 5 non-matching spans are
  all deliberate non-WEB quotes (the legend's self-quoted markers "None." / "none" /
  "No changes — <reason>.", the deliberately elided "Who am I…?" whose unelided parts
  verify at 17:16, and the roster-quoted phrase "all 1 Chr refs" from
  engine-pack-backlog.md row 16). Query phrasings and lexicon terms are declared non-WEB
  and were excluded from the WEB claim by construction.
- §11.1 vocabulary cross-check against the canonical
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (per the
  coordinator's mid-sweep update): every non-engine id used in this ledger —
  `davidic-covenant`, `god-looks-at-the-heart`, `wholehearted-devotion`, `stewardship`,
  `counsel-and-advisers` — appears in the canonical file with exactly that spelling, each
  marked "engine-built: no", matching this ledger's treatment (display KEEP + backlog
  routing). All other ids used resolve against the 239 engine basenames. Zero corrections
  needed; no correction entries required.
- Totals (mechanical count over this file): chapters swept 29/29; applied-tag deltas:
  ADD 3 (`priesthood` on chs 6 and 24; `occult-and-divination` on ch 10), KEEP 79, DROP 0;
  anchor-extension candidates 50; lexicon candidates 11; new-concept candidates 1
  (`casting-lots`, ch 24); decline-overturn proposals 0 (all recorded declines and rulings
  applied, none re-litigated; 1 Chr 21:1 left unharmonized as ruled); corpus-blocked
  routing notes 17, across 11 roster rows (7 god-relents, 13 empowered-by-the-spirit,
  15 counsel-and-advisers, 16 stewardship, 17 courage, 18 wholehearted-devotion,
  21 gods-surprising-choice, 22 death-and-burial, 44 davidic-covenant, 45
  exile-and-captivity, 6 god-looks-at-the-heart). Every engine-facing candidate is marked
  CORPUS-BLOCKED-UNTIL-EXPANSION (1 Chronicles has zero fixture-corpus verses; all
  candidates ride PR-β).
- Ceiling / refinement roster: hard ceiling 8 — chapters 21, 28, 29; soft cap 6 — chapter
  22; 7 tags — chapter 16. PER-VERSE REFINEMENT candidates (ceiling-hit or book-doc
  subdivided): chapters 1, 4, 5, 6, 9, 11, 12, 15, 16, 17, 21, 22, 23, 26, 28, 29
  (16 chapters).
- Honest-and-empty chapters preserved: 2, 3, 8, 20 (ch 24 moved from empty to a single
  honest `priesthood` tag; all other empties stand).
- AUDIT RESULT: PASS — all blocks present, prior bytes unchanged, quotes verified against
  the pinned text, vocabulary verified against the canonical §11.1 list.
