# 1 Samuel sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (engine 0.14.0), plus the
  §11.1 adopted display-tag ids per the BRIEFING §7 reconstruction (engine ids preferred; a
  roster/§2 adopted id is used only with its exact recorded spelling, and its source is named).
- Book: 1 Samuel (31 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/1-samuel.md
    (FINAL, 3-round critic loop; tagged against the 131-id vocabulary @ b3f491d plus the
    2026-08-25 adopted-vocabulary application pass — see its Decisions item 29)
  - Concept inventory, declines & contested calls, corpus-blocked roster, plan/conventions
    extracts: this thread's scratchpad
    (/tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
    — concept-inventory.md, concept-ids.txt, declines-and-contested.md, corpus-blocked-roster.md,
    conventions-extract.md, plan-extract.md, book-docs-index.md, web-text-access.md, repo-state.md)
  - WEB text: the repo-pinned ebible.org engwebp VPL snapshot at
    /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt (book code 1SA,
    810 verse lines verified; manifest pipeline/manifests/web.json, sha b6f55cc7…, contentSha256
    944e3883…, re-admitted 2026-08-25 in PR #53 — the same text identity the fixture corpus was
    regenerated from). Every WEB quote below was verified word-for-word against this file.
- Rulings honored: CONVENTIONS §5 + §11 (presence bar first; soft cap 6 / hard ceiling 8;
  §11.6 yield order; both-tags ruling; honest-and-empty preferred; no later-revelation
  read-backs; exact ids = YAML basenames); tag-gaps-review §1 contested calls as resolved by
  Jesse 2026-08-25 (not re-litigated); §3 declines re-considerable only with new textual
  evidence, cited; corpus-blocked roster findings ROUTED, not duplicated.
- Ledger discipline: atomic end-of-file appends ONLY (chapter-block chunks), post-write
  verification after every append, final survival audit — CONVENTIONS §9 protocol applies
  to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## 1 Samuel <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with word-for-word in-chapter WEB quote + verse refs,
     or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | proposed terms | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote | query
     phrasings, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, citing the
     original decline, or "None.")
  8. Routed to backlog (corpus-blocked roster rows touched by this chapter, with refs, or "None.")
  9. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision —
     per-verse refinement markers, or "none")
  10. Decisions record (every §11.6 yield and every considered-and-declined call worth recording
      — no silent drops, or "None.")

---

## 1 Samuel 1
- Existing tags (book doc): `waiting-for-a-child`, `prayer`, `pastoral-god-sees-my-suffering`, `surrender-to-god`, `worship`, `oaths-and-vows`
- Applied-tag deltas:
  - KEEP `waiting-for-a-child` — the barren years and the answer: "the LORD had shut up her womb" (1:5–6); "will give to your servant a boy" (1:11); "the LORD remembered her" (1:19); "Hannah conceived, and bore a son" (1:20). The pack's own keystone anchor is 1 Samuel 1:9-20 (w1).
  - KEEP `prayer` — "I poured out my soul before the LORD" (1:15); "I prayed for this child, and the LORD has given me my petition which I asked of him" (1:27).
  - KEEP `pastoral-god-sees-my-suffering` — Hannah's own plea, personal register: "if you will indeed look at the affliction of your servant and remember me" (1:11).
  - KEEP `surrender-to-god` — the vow performed at full cost: "Therefore I have also given him to the LORD. As long as he lives he is given to the LORD." (1:28)
  - KEEP `worship` — "went up out of his city from year to year to worship and to sacrifice to the LORD of Armies in Shiloh" (1:3); "They rose up in the morning early and worshiped the LORD" (1:19); "He worshiped the LORD there." (1:28)
  - KEEP `oaths-and-vows` — "She vowed a vow" (1:11), and the vow kept in full when the child is weaned (1:24–28: "As long as he lives he is given to the LORD").
- Anchor-extension candidates:
  - `oaths-and-vows` | 1 Samuel 1:11, 24-28 | "She vowed a vow, and said, "LORD of Armies, if you will indeed look at the affliction of your servant…"" (1:11) … "Therefore I have also given him to the LORD." (1:28) | w0.6 — the pack's anchors are teaching texts (Num 30:2; Eccl 5:4-5); this is the canon's fullest kept-vow narrative.
- Lexicon candidates:
  - `waiting-for-a-child` | "hannahs prayer; hannah prayed for a son" | "Hannah's prayer for a baby"; "Hannah in the Bible"; "Hannah and Samuel". The pack anchors 1 Sam 1:9-20 but its lexicon has no name-based route; "Hannah" is the realistic entry point for this query family.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: soft cap 6 reached exactly (not exceeded); not subdivided in the book doc.
- Decisions record: `pastoral-pregnancy-and-child-loss` considered and declined — Hannah's grief is childlessness, not child loss; `waiting-for-a-child` is the honest register (its pack already carries this chapter). No yields.

## 1 Samuel 2 (subdivided: 2:1–11 / 2:12–26 / 2:27–36)
- Existing tags (book doc): `praise`, `humble-exaltation`, `sin`, `divine-judgment`
- Applied-tag deltas:
  - KEEP `praise` — "My heart exults in the LORD! My horn is exalted in the LORD." (2:1); "There is no one as holy as the LORD, for there is no one besides you, nor is there any rock like our God." (2:2)
  - KEEP `humble-exaltation` — "The LORD makes poor and makes rich. He brings low, he also lifts up. He raises up the poor out of the dust. He lifts up the needy from the dunghill to make them sit with princes" (2:7–8); "Don't keep talking so exceedingly proudly. Don't let arrogance come out of your mouth" (2:3).
  - KEEP `sin` — "Now the sons of Eli were wicked men. They didn't know the LORD." (2:12); "The sin of the young men was very great before the LORD; for the men despised the LORD's offering." (2:17)
  - KEEP `divine-judgment` — "those who honor me I will honor, and those who despise me will be cursed" (2:30), sealed with the sign: "in one day they will both die" (2:34); "they didn't listen to the voice of their father, because the LORD intended to kill them" (2:25).
  - ADD `priesthood` — the chapter's frame is the priesthood itself: the office's charter, "Didn't I choose him out of all the tribes of Israel to be my priest, to go up to my altar, to burn incense, to wear an ephod before me?" (2:28); its corruption, "The priest took all that the fork brought up for himself" (2:14–16) and "Why do you kick at my sacrifice and at my offering…?" (2:29); and its future, "I will raise up a faithful priest for myself who will do according to that which is in my heart and in my mind" (2:35). A "priests in the old testament" searcher (the pack's own lexicon term) is honestly served here; the id was unavailable at the book doc's 131-id vintage.
- Anchor-extension candidates:
  - `humble-exaltation` | 1 Samuel 2:7-8 | "He brings low, he also lifts up. He raises up the poor out of the dust." | w0.8 — the classic OT statement of the pack's gist; the pack has no OT-narrative-era anchor.
  - `priesthood` | 1 Samuel 2:27-36 | "I will raise up a faithful priest for myself who will do according to that which is in my heart and in my mind." (2:35) | w0.6 — the OT priests' charter and forfeit; complements the pack's Exodus 28:1 anchor.
  - `praise` | 1 Samuel 2:1-2 | "My heart exults in the LORD!" | w0.55 — Hannah's song as narrative praise.
- Lexicon candidates:
  - `praise` | "hannahs song" | "Hannah's song meaning"; "Hannah's song of praise"; "my heart rejoices in the Lord".
  - `holiness` | (review flag only, no term proposed) — "There is no one as holy as the LORD" (2:2) is God's-own-holiness, not the pack's call-to-be-holy register; the book doc's motif-13 flag and the Isaiah block's identical lexicon-tuning note both stand. Recorded here so the curator sees 1 Sam 2:2 beside Isaiah's "Holy One of Israel" question.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT candidate; 5 tags after delta, under the soft cap.
- Decisions record: `empty-worship` considered and declined — the sons rob worshipers by force ("if not, I will take it by force," 2:16); that is predation on worship, not the vain-worship/hypocrisy register the pack teaches. `messianic-prophecy` considered for 2:10 ("He will give strength to his king, and exalt the horn of his anointed") and declined — reading the anointed of Hannah's song as messianic prophecy is an identification the chapter itself does not make (no-adjudication rule). No yields.

## 1 Samuel 3
- Existing tags (book doc): `dreams-and-visions`, `divine-judgment`, `surrender-to-god`
- Applied-tag deltas:
  - KEEP `dreams-and-visions` — "The LORD's word was rare in those days. There were not many visions, then." (3:1); the night call received and named a vision: "Samuel was afraid to show Eli the vision" (3:15); "the LORD revealed himself to Samuel in Shiloh by the LORD's word" (3:21).
  - KEEP `divine-judgment` — "I will judge his house forever for the iniquity which he knew, because his sons brought a curse on themselves, and he didn't restrain them" (3:13); "the iniquity of Eli's house shall not be removed with sacrifice or offering forever" (3:14).
  - KEEP `surrender-to-god` — Eli's reception of the hardest word: "It is the LORD. Let him do what seems good to him." (3:18)
- Anchor-extension candidates:
  - `power-of-gods-word` | 1 Samuel 3:19 | "Samuel grew, and the LORD was with him and let none of his words fall to the ground." | w0.5 — the prophetic-word-upheld register beside the pack's Isaiah 40:8/55:10-11 anchors.
- Lexicon candidates:
  - `guidance` | "speak lord for your servant hears; how to hear gods voice" | "speak Lord your servant is listening"; "how to hear God's voice"; "God calling Samuel". Re-records the 1 Samuel block's standing lexicon-extension flag (tag-gaps log, non-row prose) with its in-chapter quote: "Speak, LORD; for your servant hears." (3:9–10)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `obedience-to-the-word` considered for Samuel's "Here I am" responsiveness and declined — the chapter depicts availability to God's voice, not the hearing-and-doing teaching substance. No yields.

---

**Convention notes (appended 2026-08-26, before the ch-4 block; per §9 no earlier bytes are rewritten):**
1. **§11.1 vocabulary reference update:** the canonical adopted-concepts list now exists at
   /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, each marked
   engine-built yes/no) and supersedes the BRIEFING §7 reconstruction as this ledger's §11.1
   reference. Cross-check run: every non-engine display id this book's prior art carries
   (`deliverance`, `remembrance-and-memorials`, `the-lords-anointed`, `god-looks-at-the-heart`,
   `death-and-burial` — all engine-built: no) and every engine id used so far resolves exactly
   against the canonical file; no correction needed to the ch 1–3 blocks.
2. **Quote-glyph record:** the ch 1–3 blocks above quote the WEB with straight-apostrophe
   normalization (glyph-only; wording, casing, and internal punctuation are word-for-word
   against the pinned VPL — the same recorded normalization the FINAL book doc uses). From the
   ch-4 block onward, quotes reproduce the pinned VPL's typographic glyphs (curly apostrophes
   and quotation marks) byte-faithfully.

## 1 Samuel 4
- Existing tags (book doc): `divine-judgment` (only tag)
- Applied-tag deltas:
  - KEEP `divine-judgment` — the defeat the elders cannot explain is the LORD's: “Why has the LORD defeated us today before the Philistines?” (4:3); the sentence of ch. 2 falls on schedule inside this chapter’s own lines: “God’s ark was taken; and the two sons of Eli, Hophni and Phinehas, were slain.” (4:11, with 4:17–18). (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates: None.
- Lexicon candidates:
  - `glory-of-god` | “ichabod; the glory has departed” | “what does Ichabod mean”; “the glory has departed from Israel meaning”; “Ichabod in the Bible”. In-chapter ground: “She named the child Ichabod, saying, ‘The glory has departed from Israel!’” (4:21–22). Lexicon color only — a `glory-of-god` TAG was considered and declined (register mismatch: the pack teaches God’s glory revealed; this chapter mourns its departure).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `trusting-in-man` considered for the ark-as-talisman move (“that it may come among us and save us,” 4:3) and declined — the misplaced trust here is in a sacred object treated as a charm, not the pack’s trust-in-human-strength register. `glory-of-god` declined per the lexicon note above. No yields.

## 1 Samuel 5
- Existing tags (book doc): `divine-judgment` (only tag)
- Applied-tag deltas:
  - KEEP `divine-judgment` — “But the LORD’s hand was heavy on the people of Ashdod, and he destroyed them and struck them with tumors” (5:6); “the LORD’s hand was against the city with a very great confusion” (5:9); “The hand of God was very heavy there.” (5:11)
  - ADD `idolatry` — the chapter’s first movement is the canon’s plainest idol-powerlessness narrative: “behold, Dagon had fallen on his face to the ground before the LORD’s ark; and the head of Dagon and both the palms of his hands were cut off on the threshold” (5:3–4), and the Ashdodites’ own verdict, “his hand is severe on us and on Dagon our god” (5:7). A “false gods in the bible” searcher (the pack’s own lexicon term) is honestly served; the presence is substantial (5:1–7), not incidental.
- Anchor-extension candidates:
  - `idolatry` | 1 Samuel 5:2-7 | “behold, Dagon had fallen on his face to the ground before the LORD’s ark; and the head of Dagon and both the palms of his hands were cut off on the threshold.” (5:4) | w0.6 — a narrative anchor for the pack’s idols-are-nothing register (its current narrative anchors are golden-calf texts).
- Lexicon candidates:
  - `idolatry` | “dagon” | “who was Dagon in the Bible”; “Dagon and the ark”; “Dagon falls before the ark”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## 1 Samuel 6
- Existing tags (book doc): `divine-judgment` (only tag)
- Applied-tag deltas:
  - KEEP `divine-judgment` — the plague acknowledged in gold at the diviners’ counsel (“Five golden tumors and five golden mice… for one plague was on you all,” 6:4; “you shall give glory to the God of Israel,” 6:5), and the striking at Beth Shemesh: “He struck of the men of Beth Shemesh, because they had looked into the LORD’s ark” (6:19), with the survivors’ question, “Who is able to stand before the LORD, this holy God?” (6:20). (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates:
  - `hardness-of-heart` | 1 Samuel 6:6 | “Why then do you harden your hearts as the Egyptians and Pharaoh hardened their hearts? When he had worked wonderfully among them, didn’t they let the people go, and they departed?” | w0.5 — the pack’s own warning register (its Exodus 7/14 anchors are this verse’s cited precedent), spoken as a learn-from-history caution. TAG considered and declined: thin single-verse in a chapter whose substance is the ark’s return.
- Lexicon candidates: None beyond the ch-2 `holiness` review flag, which 6:20 also feeds (cross-noted there).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `fear-of-the-lord` considered for 6:20 and declined — one verse of dread after judgment, not the chapter’s teaching substance (thin single-verse). `occult-and-divination` considered for the Philistine “priests and the diviners” (6:2) and declined — pagan diviners consulted by pagans, reported without the prohibition register the pack teaches. No yields.

## 1 Samuel 7
- Existing tags (book doc): `repentance`, `prayer`, `gods-protection`, `gods-faithfulness`, `deliverance`, `idolatry`, `remembrance-and-memorials` (7 tags)
- Applied-tag deltas:
  - KEEP `repentance` — “If you are returning to the LORD with all your heart, then put away the foreign gods and the Ashtaroth from among you, and direct your hearts to the LORD, and serve him only” (7:3); the Mizpah fast and confession, “We have sinned against the LORD.” (7:6)
  - KEEP `prayer` — “Don’t stop crying to the LORD our God for us” (7:8); “Samuel cried to the LORD for Israel, and the LORD answered him.” (7:9)
  - KEEP `gods-protection` — “the LORD thundered with a great thunder on that day on the Philistines and confused them; and they were struck down before Israel.” (7:10, 13)
  - KEEP `gods-faithfulness` — the named stone’s testimony: “The LORD helped us until now.” (7:12)
  - KEEP `deliverance` (adopted display id, engine-built: no) — the rescue register in promise and plea: “he will deliver you out of the hand of the Philistines” (7:3); “that he will save us out of the hand of the Philistines” (7:8, with the rout and recovered cities, 7:11, 14).
  - KEEP `idolatry` — “Then the children of Israel removed the Baals and the Ashtaroth, and served the LORD only.” (7:3–4)
  - KEEP `remembrance-and-memorials` (adopted display id, engine-built: no) — “Then Samuel took a stone and set it between Mizpah and Shen, and called its name Ebenezer, saying, ‘The LORD helped us until now.’” (7:12)
- Anchor-extension candidates:
  - `fasting` | 1 Samuel 7:6 | “They gathered together to Mizpah, and drew water, and poured it out before the LORD, and fasted on that day, and said there, ‘We have sinned against the LORD.’” | w0.5 — a penitential-fast narrative instance beside the pack’s Joel 2:12-15 teaching anchor. TAG considered and declined: thin single-verse at a 7-tag chapter.
  - `repentance` | 1 Samuel 7:3-6 | “If you are returning to the LORD with all your heart, then put away the foreign gods” (7:3) | w0.6 — a complete narrative return-to-the-LORD arc (call, putting-away, confession).
- Lexicon candidates: None (the Ebenezer query family belongs to the routed roster row — see below).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `remembrance-and-memorials` (roster row 33; the row already names 1 Sam 7:12 Ebenezer) — this chapter’s find adds the query family “what does Ebenezer mean” / “here I raise my Ebenezer” / “remembering God’s help” for that row’s eventual pack.
  - routed to backlog: `deliverance` (roster row 32; the row’s requested refs include 1 Sam 7) — in-chapter evidence 7:3, 7:8–11, 14 as above.
- Ceiling / refinement flags: 7 tags — over the soft cap 6, under the hard ceiling 8; each tag independently clears the presence bar (the 2026-08-25 application pass argued this chapter to 7 within the ceiling, and this sweep re-affirms each). Not subdivided in the book doc; no ceiling hit, so no per-verse refinement flag.
- Decisions record: `lament` on 7:2 (“all the house of Israel lamented after the LORD”) — the Joel row’s own WITH-CAVEAT single ref; the recorded decline (tag-gaps-review §1(c) pattern and the book doc’s 2026-08-25 pass) is honored, no tag, no overturn (no new evidence). `fasting` declined as recorded above. No yields.

## 1 Samuel 8
- Existing tags (book doc): `prayer`, `leadership`, `justice-and-oppression`
- Applied-tag deltas:
  - KEEP `prayer` — “Samuel prayed to the LORD” (8:6); “Samuel heard all the words of the people, and he rehearsed them in the ears of the LORD” (8:21), receiving direction each time (8:7, 22).
  - KEEP `leadership` — the definitive warning on power that takes: “This will be the way of the king who shall reign over you: he will take your sons… He will take your daughters… He will take your fields… and you will be his servants” (8:11–17), set against the failed judgeship of Samuel’s sons (8:1–3).
  - KEEP `justice-and-oppression` — the courtroom register: Samuel’s sons “turned away after dishonest gain, took bribes, and perverted justice” (8:3), the failure the elders cite (8:5).
  - ADD `trusting-in-man` — the chapter’s central theme, which the book doc recorded as having “no vocabulary id” at its 131-id vintage, now has an honest engine home: Israel trades God’s kingship for a human protector — “they have not rejected you, but they have rejected me as the king over them” (8:7); “No, but we will have a king over us, that we also may be like all the nations; and that our king may judge us, and go out before us, and fight our battles” (8:19–20) — with the cost named, “You will cry out in that day because of your king whom you will have chosen for yourselves; and the LORD will not answer you in that day” (8:18). The pack’s do-not-put-your-trust-in-princes substance (Ps 146:3-4) is exactly this chapter’s teaching.
- Anchor-extension candidates:
  - `trusting-in-man` | 1 Samuel 8:4-20 | “they have not rejected you, but they have rejected me as the king over them” (8:7) | w0.7 — the canon’s fullest narrative of trading God’s rule for human security.
  - `unanswered-prayer` | 1 Samuel 8:18 | “You will cry out in that day because of your king whom you will have chosen for yourselves; and the LORD will not answer you in that day.” | w0.45 — the judgment-silence register beside the pack’s Prov 21:13 anchor.
- Lexicon candidates:
  - `trusting-in-man` | “israel demands a king; make us a king like all the nations” | “why did Israel want a king”; “Israel asks for a king”; “give us a king Bible verse”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: 4 tags after delta; none.
- Decisions record: The book doc’s parenthetical note that this chapter’s central theme “still has no vocabulary id” is superseded by the `trusting-in-man` ADD above (a post-131 engine mint); recorded so the prior-art note is not silently contradicted. No yields.

## 1 Samuel 9
- Existing tags (book doc): `providence` (only tag)
- Applied-tag deltas:
  - KEEP `providence` — a lost-donkey errand steered to a kingdom: “Now the LORD had revealed to Samuel a day before Saul came” (9:15), “Tomorrow about this time I will send you a man out of the land of Benjamin” (9:16), and at the gate, “Behold, the man of whom I spoke to you!” (9:17), with the errand itself dissolved — “your donkeys who were lost three days ago… they have been found” (9:20). (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates:
  - `providence` | 1 Samuel 9:15-17 | “Now the LORD had revealed to Samuel a day before Saul came” (9:15) | w0.55 — a divine-appointment narrative anchor for the pack’s ordains-events register.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `gods-surprising-choice` (roster row 21; the row names 1 Sam 9:21) — in-chapter evidence: “Am I not a Benjamite, of the smallest of the tribes of Israel? And my family the least of all the families of the tribe of Benjamin?” (9:21). The standing one-design ruling (decide with `god-looks-at-the-heart` + `humble-exaltation` together) is honored — nothing prejudged here.
- Ceiling / refinement flags: none.
- Decisions record: `humble-exaltation` considered for the least-of-tribes man seated “in the best place” (9:22) and declined — the reversal substance is the routed `gods-surprising-choice` design’s territory; tagging `humble-exaltation` here would prejudge the one-design ruling the roster reserves for Jesse. `pastoral-god-sees-my-suffering` on 9:16 (“I have looked upon my people, because their cry has come to me”) remains untagged per the book doc’s Decisions item 3 — national register, not the pack’s personal-crisis register; this sweep re-affirms that call. No yields.

## 1 Samuel 10
- Existing tags (book doc): `guidance`, `presence-of-god`, `the-lords-anointed`
- Applied-tag deltas:
  - KEEP `guidance` — three confirming signs given in advance (10:2–8) and fulfilled the same day: “God gave him another heart; and all those signs happened that day” (10:9); and the further oracle when the chosen man is missing: “The LORD answered, ‘Behold, he has hidden himself among the baggage.’” (10:22)
  - KEEP `presence-of-god` — “Then the LORD’s Spirit will come mightily on you… for God is with you” (10:6–7); “the Spirit of God came mightily on him, and he prophesied among them” (10:10).
  - KEEP `the-lords-anointed` (adopted display id, engine-built: no) — the term’s first defining scene: “Hasn’t the LORD anointed you to be prince over his inheritance?” (10:1)
- Anchor-extension candidates:
  - `trusting-in-man` | 1 Samuel 10:18-19 | “But you have today rejected your God, who himself saves you out of all your calamities and your distresses; and you have said to him, ‘No! Set a king over us!’” | w0.5 — the ch-8 theme restated at the coronation. TAG considered and declined: two verses inside a chapter whose main themes are anointing, signs, and proclamation; the theme’s tag home is ch. 8.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `empowered-by-the-spirit` (roster row 13) — 1 Sam 10:6, 10 (“the Spirit of God came mightily on him”) extends the row’s Spirit-came-mightily refrain beyond its recorded Judges refs; noted for the row’s eventual curator.
  - routed to backlog: `the-lords-anointed` (roster row 46) — 10:1 is the phrase’s first defining scene; the row’s recorded refs are 1 Sam 24; 26 (+ 2 Sam) — 10:1 and 16:13 belong on the row as the anointing scenes its guard design will need.
- Ceiling / refinement flags: none.
- Decisions record: `humble-exaltation` considered for the hiding-among-the-baggage scene (10:22) and declined — bashfulness at proclamation, not the pack’s God-exalts-the-humble teaching. No yields.

## 1 Samuel 11
- Existing tags (book doc): `gods-protection`, `worship`, `deliverance`
- Applied-tag deltas:
  - KEEP `gods-protection` — the Spirit-roused rescue: “The dread of the LORD fell on the people, and they came out as one man” (11:7), and Saul’s own verdict, “today the LORD has rescued Israel” (11:13).
  - KEEP `worship` — the kingdom renewed “before the LORD in Gilgal”: “There they offered sacrifices of peace offerings before the LORD; and there Saul and all the men of Israel rejoiced greatly.” (11:15)
  - KEEP `deliverance` (adopted display id, engine-built: no) — the siege broken on schedule: “Tomorrow, by the time the sun is hot, you will be rescued” (11:9), and the day claimed for God alone: “No man shall be put to death today; for today the LORD has rescued Israel.” (11:13)
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `empowered-by-the-spirit` (roster row 13) — “God’s Spirit came mightily on Saul when he heard those words” (11:6); extends the row’s refrain list.
  - routed to backlog: `deliverance` (roster row 32) — in-chapter evidence 11:9, 11, 13 as above.
- Ceiling / refinement flags: none.
- Decisions record: `mercy` considered for Saul’s clemency (“No man shall be put to death today,” 11:13) and declined — one verse of royal clemency, not the pack’s divine-mercy or be-merciful teaching substance (thin single-verse). No yields.

## 1 Samuel 12
- Existing tags (book doc): `gods-faithfulness`, `prayer`, `fear-not`, `obedience-to-the-word`, `fear-of-the-lord`, `leadership` (6 tags)
- Applied-tag deltas:
  - KEEP `gods-faithfulness` — “For the LORD will not forsake his people for his great name’s sake, because it has pleased the LORD to make you a people for himself.” (12:22)
  - KEEP `prayer` — “Pray for your servants to the LORD your God, that we not die” (12:19), and Samuel’s vow: “far be it from me that I should sin against the LORD in ceasing to pray for you” (12:23).
  - KEEP `fear-not` — “Don’t be afraid. You have indeed done all this evil; yet don’t turn away from following the LORD, but serve the LORD with all your heart.” (12:20)
  - KEEP `obedience-to-the-word` — the covenant fork: “If you will fear the LORD, and serve him, and listen to his voice, and not rebel against the commandment of the LORD…” / “But if you will not listen to the LORD’s voice… then the LORD’s hand will be against you” (12:14–15, 24–25).
  - KEEP `fear-of-the-lord` — the charge in classic form, twice: “If you will fear the LORD, and serve him” (12:14); “Only fear the LORD, and serve him in truth with all your heart” (12:24).
  - KEEP `leadership` — the outgoing judge’s open audit: “Whose ox have I taken? Whose donkey have I taken? Whom have I defrauded? Whom have I oppressed? Of whose hand have I taken a bribe…?” — acquitted by all Israel before the LORD (12:3–5), beside the sin named in the transfer (12:12–13).
- Anchor-extension candidates:
  - `prayer` | 1 Samuel 12:23 | “far be it from me that I should sin against the LORD in ceasing to pray for you” | w0.6 — a famous intercession commitment; the pack’s lexicon carries “intercession” with no OT-narrative anchor for it.
  - `trusting-in-man` | 1 Samuel 12:12, 17-19 | “you said to me, ‘No, but a king shall reign over us,’ when the LORD your God was your king” (12:12) | w0.5 — the ch-8 theme recalled and confessed (“we have added to all our sins this evil, to ask for a king,” 12:19).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: soft cap 6 reached exactly (not exceeded); not subdivided in the book doc.
- Decisions record: `trusting-in-man` TAG considered and declined at the soft cap — genuinely present as the confessed sin (12:12, 17, 19), but the chapter’s teaching weight sits on the covenant charge going forward, and the theme’s narrative witness is carried at ch. 8; recorded as the anchor-extension candidate above rather than a seventh tag (soft-cap restraint; broad-duplicating-specific spirit of the §11.6 order). `idolatry` considered for 12:21 (“Don’t turn away to go after vain things which can’t profit or deliver”) and declined — single warning verse; the book doc’s 2026-08-25 pass declined the same ref on the same ground and this sweep re-affirms it. No yields.

## 1 Samuel 13 (subdivided: 13:1–7 / 13:8–15 / 13:16–23)
- Existing tags (book doc): `divine-judgment` (only tag)
- Applied-tag deltas:
  - KEEP `divine-judgment` — the sentence on Saul’s dynasty for the unlawful sacrifice: “You have done foolishly. You have not kept the commandment of the LORD your God” (13:13); “But now your kingdom will not continue… because you have not kept that which the LORD commanded you.” (13:14) (Only one honest tag from the current vocabulary.)
- Anchor-extension candidates: None.
- Lexicon candidates: None in the engine vocabulary (the chapter’s heaviest query phrase is routed below).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `god-looks-at-the-heart` (roster row 6) — “The LORD has sought for himself a man after his own heart” (13:14) is the query family “man after God’s own heart” / “what does a man after God’s own heart mean” / “why was David a man after God’s own heart”; no engine pack carries the phrase, and row 6 (with the standing one-design ruling) is its natural design home. Noted for that row’s curator.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: `obedience-to-the-word` and `testing` remain untagged per the book doc’s Decisions item 25 — the chapter depicts a failure of obedience under pressure, the concepts’ failure mode (the Genesis-3 rule); this sweep re-affirms the call against the 239-id library. No yields.

## 1 Samuel 14 (subdivided: 14:1–23 / 14:24–46 / 14:47–52)
- Existing tags (book doc): `faith`, `gods-protection`, `deliverance`, `oaths-and-vows`
- Applied-tag deltas:
  - KEEP `faith` — two lives staked on who God is: “It may be that the LORD will work for us, for there is no restraint on the LORD to save by many or by few” (14:6), the offered sign taken as given: “Come up after me, for the LORD has delivered them into the hand of Israel.” (14:10, 12)
  - KEEP `gods-protection` — “the earth quaked, so there was an exceedingly great trembling” (14:15); “behold, they were all striking each other with their swords in very great confusion” (14:20); “So the LORD saved Israel that day.” (14:23)
  - KEEP `deliverance` (adopted display id, engine-built: no) — the rescue register in creed and verdict: “there is no restraint on the LORD to save by many or by few” (14:6); “So the LORD saved Israel that day” (14:23).
  - KEEP `oaths-and-vows` — the rash oath and its near-fatal cost, told as warning: “Cursed is the man who eats any food until it is evening” (14:24), snaring Jonathan (14:43–44), until the people’s counter-oath redeems him: “As the LORD lives, there shall not one hair of his head fall to the ground, for he has worked with God today!” (14:45)
- Anchor-extension candidates:
  - `faith` | 1 Samuel 14:6 | “there is no restraint on the LORD to save by many or by few” | w0.6 — the pack’s only anchors are two NT teaching verses; this is the classic OT narrative statement of acting on God’s sufficiency.
  - `unanswered-prayer` | 1 Samuel 14:37 | “Saul asked counsel of God: ‘Shall I go down after the Philistines? Will you deliver them into the hand of Israel?’ But he didn’t answer him that day.” | w0.5 — a narrative God-silence instance beside the pack’s Lam 3:8/Ps 80:4 anchors.
- Lexicon candidates:
  - `faith` | “save by many or by few” | “God can save by many or by few”; “when the odds are against you Bible”; “Jonathan and his armor bearer”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `deliverance` (roster row 32) — in-chapter evidence 14:6, 23, 45 as above.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 1 Samuel 15
- Existing tags (book doc): `obedience-to-the-word`, `divine-judgment`, `sin`
- Applied-tag deltas:
  - KEEP `obedience-to-the-word` — the sentence at the chapter’s heart: “Has the LORD as great delight in burnt offerings and sacrifices, as in obeying the LORD’s voice? Behold, to obey is better than sacrifice, and to listen than the fat of rams.” (15:22; the pack already anchors 1 Samuel 15:22, w0.75)
  - KEEP `divine-judgment` — the commanded ban: “I remember what Amalek did to Israel… Now go and strike Amalek” (15:2–3), and the rejection of the king who softened it: “Because you have rejected the LORD’s word, he has also rejected you from being king” (15:23, 26, 28).
  - KEEP `sin` — the confession that names sin’s anatomy: “I have sinned; for I have transgressed the commandment of the LORD and your words, because I feared the people and obeyed their voice.” (15:24, 30)
- Anchor-extension candidates:
  - `pleasing-god-not-people` | 1 Samuel 15:24 | “because I feared the people and obeyed their voice” | w0.6 — the fear-of-man register’s classic narrative proof-text, beside the pack’s Prov 29:25 anchor. TAG considered and declined: the chapter depicts the failure mode of the pack’s please-God-not-people direction (the Genesis-3 rule), so it feeds the engine anchor, not a display tag.
  - `gods-unchanging-nature` | 1 Samuel 15:29 | “Also the Strength of Israel will not lie nor repent; for he is not a man, that he should repent.” | w0.7 — sibling text to the pack’s Numbers 23:19 anchor (“does god change” queries); the chapter’s held-side-by-side tension (15:11, 35) is signposted in the book doc’s Decisions item 4 and adjudicated nowhere.
- Lexicon candidates:
  - `obedience-to-the-word` | “to obey is better than sacrifice; obedience is better than sacrifice” | “obedience is better than sacrifice meaning”; “does God want sacrifice or obedience”; “what does 1 Samuel 15:22 mean”. Re-records the 1 Samuel block’s standing lexicon-extension flag (tag-gaps log, non-row prose) — the pack anchors the verse but its lexicon does not carry the remembered phrase.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `god-relents` (roster row 7) — “It grieves me that I have set up Saul to be king” (15:11) and “The LORD grieved that he had made Saul king over Israel” (15:35), held beside 15:29, are exactly the row’s recorded gist-care question (divine grief vs. immutability); noted for that row’s re-pin curator, nothing prejudged.
- Ceiling / refinement flags: none (kept whole in the book doc despite three Berean headings — its Decisions item 15; not a subdivision).
- Decisions record: `idolatry` on 15:23 remains untagged — “stubbornness is as idolatry and teraphim” is idolatry-as-analogy, not the practice (the book doc’s 2026-08-25 pass declined it on the presence bar; this sweep re-affirms, noting without contradiction that the engine pack itself anchors 1 Sam 15:23 for lexical “witchcraft/idolatry” queries — an engine-side routing, not a display-tag warrant). `pleasing-god-not-people` declined as recorded above. No yields.

## 1 Samuel 16 (subdivided: 16:1–13 / 16:14–23)
- Existing tags (book doc): `guidance`, `humble-exaltation`, `presence-of-god`, `god-looks-at-the-heart`, `the-lords-anointed`
- Applied-tag deltas:
  - KEEP `guidance` — Samuel corrected mid-choice and told, “You shall anoint to me him whom I name to you” (16:3): “Don’t look on his face, or on the height of his stature… For man looks at the outward appearance, but the LORD looks at the heart” (16:7), then “Arise! Anoint him, for this is he.” (16:12)
  - KEEP `humble-exaltation` — seven sons pass by unchosen while the youngest keeps the sheep — “There remains yet the youngest. Behold, he is keeping the sheep” (16:11) — and the overlooked one is anointed king (16:12–13).
  - KEEP `presence-of-god` — “Then the LORD’s Spirit came mightily on David from that day forward” (16:13), and the servant’s word: “and the LORD is with him.” (16:18)
  - KEEP `god-looks-at-the-heart` (adopted display id, engine-built: no) — the chapter’s most-searched sentence, God’s own criterion: “For man looks at the outward appearance, but the LORD looks at the heart.” (16:7)
  - KEEP `the-lords-anointed` (adopted display id, engine-built: no) — the phrase’s second defining scene: “Then Samuel took the horn of oil and anointed him in the middle of his brothers.” (16:13; also 16:6, “Surely the LORD’s anointed is before him.”)
- Anchor-extension candidates: None (the 16:7 anchor question belongs to the routed roster row below).
- Lexicon candidates: None in the engine vocabulary.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `god-looks-at-the-heart` (roster row 6; keystone 1 Sam 16:7, which the row records as currently living as an `identity-in-christ` anchor) — this sweep re-affirms 16:7 as the row’s keystone; the one-design ruling with `gods-surprising-choice` + `humble-exaltation` is honored, nothing prejudged.
  - routed to backlog: `gods-surprising-choice` (roster row 21; the row names 1 Sam 16:7) — in-chapter evidence 16:6–13 (the unchosen seven, the youngest fetched from the sheep).
  - routed to backlog: `the-lords-anointed` (roster row 46) — 16:13 belongs with 10:1 as the anointing scenes for the row’s guard design (see the ch-10 routing).
  - routed to backlog: `empowered-by-the-spirit` (roster row 13) — “the LORD’s Spirit came mightily on David from that day forward” (16:13), with the counter-verse “the LORD’s Spirit departed from Saul” (16:14) noted for the row’s departure-register boundary (its recorded lone in-corpus text is Judges 16:20, the departure).
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: `identity-in-christ` NOT tagged despite the engine pack’s own 1 Sam 16:7 anchor — a later-revelation category read back onto OT narrative is barred by CONVENTIONS §5; the engine-side anchor is a routing fact, not a display-tag warrant (same distinction as the ch-15 idolatry note). 16:14 (“an evil spirit from the LORD troubled him”) remains quoted-not-explained per the book doc’s Decisions item 5; no tag rests on it. No yields.

## 1 Samuel 17
- Existing tags (book doc): `faith`, `trust-in-god`, `gods-protection`, `deliverance`
- Applied-tag deltas:
  - KEEP `faith` — confidence standing on God against every visible mismatch: “who is this uncircumcised Philistine, that he should defy the armies of the living God?” (17:26); “I come to you in the name of the LORD of Armies… the LORD doesn’t save with sword and spear; for the battle is the LORD’s” (17:45, 47).
  - KEEP `trust-in-god` — past deliverances grounding present trust: “The LORD, who delivered me out of the paw of the lion and out of the paw of the bear, will deliver me out of the hand of this Philistine.” (17:34–37)
  - KEEP `gods-protection` — “Today, the LORD will deliver you into my hand… that all the earth may know that there is a God in Israel” (17:46).
  - KEEP `deliverance` (adopted display id, engine-built: no) — the rescue register in testimony and taunt: “The LORD, who delivered me out of the paw of the lion” (17:37); “the LORD doesn’t save with sword and spear” (17:47).
- Anchor-extension candidates:
  - `victory-in-christ` | 1 Samuel 17:45-47 | “for the battle is the LORD’s, and he will give you into our hand” (17:47) | w0.8 — the pack’s own lexicon carries the bare phrase “the battle belongs to the lord” and it already anchors OT narrative (Exodus 14:13-14); 1 Sam 17:47 is the phrase’s source text and currently unanchored. TAG considered and declined: a Christ-named id on OT narrative is a later-revelation read-back for display purposes (the same §5 bar as `identity-in-christ` on ch. 16); the engine anchor is the right vehicle.
- Lexicon candidates:
  - `faith` | “david and goliath” | “David and Goliath story”; “what can we learn from David and Goliath”; “facing giants in the Bible”. The canon’s most-searched narrative has no name-based route in any pack lexicon; `faith` (tagged here, and carrying the chapter’s creed) is the honest home. Flagged for curation to weigh against a `victory-in-christ` routing instead — one home, not two.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `deliverance` (roster row 32) — in-chapter evidence 17:37, 46–47 as above.
  - routed to backlog: `courage` (roster row 17) — “Let no man’s heart fail because of him. Your servant will go and fight with this Philistine” (17:32) and 17:34–37 are natural candidate refs for the row’s courage-to-act register (its recorded case is Esther/Nehemiah; the row notes “courage in the bible” already surfaces lexically — these refs are for the curator’s design, not a duplicate proposal).
- Ceiling / refinement flags: none.
- Decisions record: `fear-not` considered — Israel “dismayed and greatly afraid” (17:11, 24) depicts fear, and no divine “don’t be afraid” word is spoken in-chapter; the pack’s comfort register is absent, so declined (failure-mode side). No yields.

## 1 Samuel 18 (subdivided: 18:1–4 / 18:5–16 / 18:17–30)
- Existing tags (book doc): `friendship`, `envy-and-jealousy`, `presence-of-god`
- Applied-tag deltas:
  - KEEP `friendship` — “the soul of Jonathan was knit with the soul of David, and Jonathan loved him as his own soul” (18:1), the covenant sealed with royal gifts: “Jonathan stripped himself of the robe that was on him and gave it to David with his clothing, even including his sword, his bow, and his sash.” (18:3–4)
  - KEEP `envy-and-jealousy` — the song’s arithmetic curdles: “They have credited David with ten thousands, and they have only credited me with thousands. What can he have more but the kingdom?” (18:8); “Saul watched David from that day and forward.” (18:9, 12, 15, 29; the engine pack already anchors 1 Samuel 18:6-9, w0.85)
  - KEEP `presence-of-god` — stated three times: “Saul was afraid of David, because the LORD was with him” (18:12); “David behaved himself wisely in all his ways; and the LORD was with him” (18:14); “Saul saw and knew that the LORD was with David” (18:28).
- Anchor-extension candidates:
  - `friendship` | 1 Samuel 18:1-4 | “the soul of Jonathan was knit with the soul of David, and Jonathan loved him as his own soul” (18:1) | w0.75 — the canon’s defining friendship narrative; the pack’s anchors are all proverb/teaching texts plus John 15:13.
- Lexicon candidates:
  - `friendship` | “david and jonathan” | “David and Jonathan friendship”; “Jonathan and David covenant”; “covenant friendship in the Bible”. No pack lexicon carries the pair’s names — the realistic entry point for this heavily-searched narrative.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 1 Samuel 19
- Existing tags (book doc): `friendship`, `gods-protection`
- Applied-tag deltas:
  - KEEP `friendship` — Jonathan between his father’s spear and his friend: “Don’t let the king sin against his servant, against David; because he has not sinned against you… Why then will you sin against innocent blood, to kill David without a cause?” (19:4–5)
  - KEEP `gods-protection` — every net fails: “So Michal let David down through the window. He went away, fled, and escaped” (19:12), and at Naioth, “God’s Spirit came on Saul’s messengers, and they also prophesied” — three squads and then the king himself disarmed (19:20–24).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `empowered-by-the-spirit` (roster row 13) — 19:20–23 (“God’s Spirit came on Saul’s messengers”) extends the Spirit-came refrain family; noted with the caveat that here the Spirit disarms pursuers rather than empowering a deliverer — a boundary datum for the row’s design.
- Ceiling / refinement flags: none.
- Decisions record: `receiving-correction` considered for “Saul listened to the voice of Jonathan” (19:6) and declined — the acceptance is momentarily real but the same chapter resumes the spear (19:9–10); one swiftly-reversed scene is not the pack’s teachable-spirit substance. No yields.

## 1 Samuel 20
- Existing tags (book doc): `friendship`, `oaths-and-vows`
- Applied-tag deltas:
  - KEEP `friendship` — covenant friendship tested and proven: “Jonathan caused David to swear again, for the love that he had for him; for he loved him as he loved his own soul” (20:17), through the shielding at the feast (20:32–34) to the weeping farewell: “They kissed one another and wept with one another, and David wept the most.” (20:41)
  - KEEP `oaths-and-vows` — a binding oath between friends, sworn and honored: “Go in peace, because we have both sworn in the LORD’s name, saying, ‘The LORD is between me and you, and between my offspring and your offspring, forever.’” (20:12–17, 42)
  - ADD `kindness` — covenant loving-kindness asked and pledged, the request whose fulfillment the pack already anchors at 2 Samuel 9:1-7: “Therefore deal kindly with your servant, for you have brought your servant into a covenant of the LORD with you” (20:8); “You shall not only show me the loving kindness of the LORD while I still live, that I not die; but you shall also not cut off your kindness from my house forever” (20:14–15). A “showing kindness” searcher is honestly served by the scene the pack’s own 2 Samuel anchor pays off.
- Anchor-extension candidates:
  - `kindness` | 1 Samuel 20:14-15 | “show me the loving kindness of the LORD while I still live… you shall also not cut off your kindness from my house forever” | w0.6 — completes the arc of the pack’s 2 Samuel 9:1-7 anchor (Mephibosheth) with its origin scene.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `honesty` not applicable — the cover story (20:6, 28–29) is deception reported without comment, the concept’s failure mode (same rule as the book doc’s ch-21 call). No yields.

## 1 Samuel 21
- Existing tags (book doc): none (honest-and-empty)
- Applied-tag deltas: No changes — re-judged against the full 239-id library and still honestly empty. The deceptions (the cover story at Nob, 21:2; the feigned madness at Gath, 21:13) are the failure mode of `honesty`; the show bread remains a priest’s concession the chapter itself never frames as divine provision (“I have no common bread, but there is holy bread,” 21:4, 6), and tagging `gods-provision` would read Jesus’ later citation back into the narrative — the book doc’s Decisions item 22 reasoning holds under the current vocabulary too.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `loneliness` considered (“Why are you alone, and no man with you?” 21:1) and declined — the chapter reports isolation as a fugitive fact, without the pack’s felt-loneliness comfort substance. No yields.

## 1 Samuel 22
- Existing tags (book doc): `guidance` (only tag)
- Applied-tag deltas:
  - KEEP `guidance` — David waits on God’s direction and receives it through a prophet: “until I know what God will do for me” (22:3), and Gad’s word, “Don’t stay in the stronghold. Depart, and go into the land of Judah,” which David obeys (22:5).
  - ADD `slander-and-false-accusation` — the chapter’s dominant event proceeds from a false charge: “Why have you conspired against me, you and the son of Jesse…?” (22:13), pressed against Ahimelech’s truthful defense — “Don’t let the king impute anything to his servant, nor to all the house of my father; for your servant knew nothing of all this, less or more” (22:15) — and answered with the massacre of the innocent (“he killed on that day eighty-five people who wore a linen ephod,” 22:18). A “falsely accused” searcher is honestly served by the priest condemned on an accusation the chapter itself shows to be false; the id was unavailable at the book doc’s 131-id vintage, which recorded the massacre as having “no honest vocabulary home.”
- Anchor-extension candidates:
  - `slander-and-false-accusation` | 1 Samuel 22:13-19 | “Why have you conspired against me, you and the son of Jesse…?” (22:13) | w0.55 — a narrative instance of judicial murder on a false charge, beside the pack’s psalm anchors.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: The book doc’s note that the Nob massacre “has no vocabulary home” is partially superseded by the `slander-and-false-accusation` ADD above (a post-131 mint); the massacre’s full horror still exceeds any concept and the summary continues to carry it. `leadership` considered for Saul’s paranoid court speech (22:7–8) and declined — failure-mode depiction without the pack’s teaching substance. No yields.

## 1 Samuel 23
- Existing tags (book doc): `guidance`, `gods-protection`, `friendship`
- Applied-tag deltas:
  - KEEP `guidance` — David inquires before every move and is answered every time: “Shall I go and strike these Philistines?” (23:2), “Then David inquired of the LORD yet again” (23:4), and by the ephod: “Will the men of Keilah deliver me and my men into the hand of Saul?” “They will deliver you up.” (23:9–12)
  - KEEP `gods-protection` — the standing verdict over the manhunt: “Saul sought him every day, but God didn’t deliver him into his hand” (23:14), and the encirclement broken by a messenger’s interruption (23:26–28).
  - KEEP `friendship` — Jonathan’s wilderness visit: he “strengthened his hand in God,” promising “you will be king over Israel, and I will be next to you,” covenanting before the LORD a final time (23:16–18).
- Anchor-extension candidates:
  - `guidance` | 1 Samuel 23:2-12 | “Therefore David inquired of the LORD, saying, ‘Shall I go and strike these Philistines?’” (23:2) | w0.6 — the canon’s cleanest ask-before-acting narrative; the pack’s anchors are all teaching texts.
  - `friendship` | 1 Samuel 23:16 | “Jonathan, Saul’s son, arose and went to David into the woods, and strengthened his hand in God.” | w0.65 — the encourage-a-friend-in-God register.
- Lexicon candidates:
  - `guidance` | “inquired of the lord” | “David inquired of the Lord”; “asking God before making a decision”; “seeking God’s direction before acting”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `betrayal` considered for the Ziphite informers (23:19–20) and Keilah’s foretold surrender (23:11–12) and declined — the pack’s register is the wound of an intimate’s betrayal (Ps 55:12-14); informers and frightened townsfolk are not that register, and the surrender never occurs. `fear-not` considered for Jonathan’s “Don’t be afraid” (23:17) and declined — a friend’s reassurance, honestly carried by the `friendship` tag, not the pack’s divine-comfort register. No yields.

## 1 Samuel 24
- Existing tags (book doc): `trust-in-god`, `self-control`, `the-lords-anointed`
- Applied-tag deltas:
  - KEEP `trust-in-god` — vengeance handed entirely to God: “May the LORD judge between me and you, and may the LORD avenge me of you; but my hand will not be on you” (24:12); “May the LORD therefore be judge, and give sentence between me and you, and see, and plead my cause, and deliver me out of your hand.” (24:15)
  - KEEP `self-control` — a conscience struck over a robe corner: “Afterward, David’s heart struck him because he had cut off Saul’s skirt” (24:5), and “So David checked his men with these words, and didn’t allow them to rise against Saul.” (24:7)
  - KEEP `the-lords-anointed` (adopted display id, engine-built: no) — the phrase’s defining narrative use: “The LORD forbid that I should do this thing to my lord, the LORD’s anointed, to stretch out my hand against him, since he is the LORD’s anointed.” (24:6, 10)
  - ADD `vengeance` — the chapter enacts the pack’s exact teaching (leave vengeance to God) in its own words: “may the LORD avenge me of you; but my hand will not be on you” (24:12), pressed home twice more — “‘Out of the wicked comes wickedness;’ but my hand will not be on you” (24:13) and “May the LORD therefore be judge… and plead my cause” (24:15) — with even Saul conceding the ethic: “if a man finds his enemy, will he let him go away unharmed?” (24:19). A “revenge in the Bible” searcher is honestly served; the id (whose lexicon carries “vengeance is mine; getting back at someone”) genuinely applies beside `trust-in-god` under the both-tags ruling — the quotes overlap but the registers differ (whom to trust vs. what not to take into your own hands).
- Anchor-extension candidates:
  - `vengeance` | 1 Samuel 24:10-15 | “may the LORD avenge me of you; but my hand will not be on you” (24:12) | w0.7 — the canon’s fullest refusal-of-revenge narrative; the pack’s anchors are all teaching texts.
- Lexicon candidates:
  - `vengeance` | “david spares saul” | “David spares Saul in the cave”; “why didn’t David kill Saul”; “leaving revenge to God”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `the-lords-anointed` (roster row 46; the row’s recorded refs include 1 Sam 24) — in-chapter evidence 24:6, 10 as above; the row’s misapplication-guard design note stands.
- Ceiling / refinement flags: none (4 tags after delta).
- Decisions record: None.

## 1 Samuel 25 (subdivided: 25:1 / 25:2–44)
- Existing tags (book doc): `harmony-with-others`, `trust-in-god`, `divine-judgment`
- Applied-tag deltas:
  - KEEP `harmony-with-others` — Abigail’s costly peacemaking between four hundred drawn swords and a household: “On me, my lord, on me be the blame!” (25:24), the convoy of food (25:18, 27), and the raging man talked back from bloodshed: “Go up in peace to your house. Behold, I have listened to your voice and have granted your request.” (25:35)
  - KEEP `trust-in-god` — the lesson David learns aloud: “Blessed is the LORD, who has pleaded the cause of my reproach from the hand of Nabal, and has kept back his servant from evil.” (25:39; also 25:26, 32–34)
  - KEEP `divine-judgment` — “About ten days later, the LORD struck Nabal, so that he died” (25:38); “The LORD has returned the evildoing of Nabal on his own head.” (25:39)
  - ADD `vengeance` — the chapter argues the pack’s teaching in Abigail’s own words: “the LORD has withheld you from blood guiltiness and from avenging yourself with your own hand” (25:26), “either that you have shed blood without cause, or that my lord has avenged himself” (25:31), and David’s verdict, “blessed are you, who have kept me today from blood guiltiness, and from avenging myself with my own hand” (25:33) — then shows God settling the account himself (25:38–39). The avenging-yourself vocabulary is explicit and sustained; applied beside the kept tags under the both-tags ruling.
- Anchor-extension candidates:
  - `vengeance` | 1 Samuel 25:26-33 | “blessed are you, who have kept me today from blood guiltiness, and from avenging myself with my own hand” (25:33) | w0.65 — the talked-back-from-revenge narrative, sibling to the ch-24 candidate.
- Lexicon candidates:
  - `harmony-with-others` | “abigail” | “Abigail in the Bible”; “Abigail and David”; “peacemaker in the Bible”. No pack lexicon carries her name; the peacemaking tag here is the honest home.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `death-and-burial` (roster row 22) — “Samuel died; and all Israel gathered themselves together and mourned for him, and buried him at his house at Ramah” (25:1); the 2026-08-25 pass skipped the display tag here (one-verse notice), and this sweep concurs — the ref belongs on the roster row’s burial-practice spine, not on a tag line.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: `wisdom-from-god` considered for “Blessed is your discretion” (25:33) and declined — the chapter commends Abigail’s discernment but never depicts wisdom sought from or given by God, the pack’s teaching substance. `contentment` considered for Nabal’s refusal (25:10–11) and declined — a rich man’s stinginess is at most the failure-mode edge of the pack; the Esther-block precedent (Haman’s discontent weighed and not promoted) applies. No yields.

## 1 Samuel 26
- Existing tags (book doc): `gods-protection`, `trust-in-god`, `the-lords-anointed`
- Applied-tag deltas:
  - KEEP `gods-protection` — the whole camp held under God’s hand while David walks in and out untouched: “No man saw it, or knew it, nor did any awake; for they were all asleep, because a deep sleep from the LORD had fallen on them.” (26:12)
  - KEEP `trust-in-god` — the future left in God’s hands twice over: “As the LORD lives, the LORD will strike him; or his day shall come to die, or he shall go down into battle and perish” (26:10), and “The LORD will give to every man his righteousness and his faithfulness… and let him deliver me out of all oppression.” (26:23–24)
  - KEEP `the-lords-anointed` (adopted display id, engine-built: no) — the second sparing rests on the same ground as the first: “Don’t destroy him, for who can stretch out his hand against the LORD’s anointed, and be guiltless?” (26:9, 11, 16, 23)
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `the-lords-anointed` (roster row 46; the row’s recorded refs include 1 Sam 26) — in-chapter evidence 26:9–11, 16, 23 as above.
- Ceiling / refinement flags: none.
- Decisions record: `vengeance` considered (the refusal of Abishai’s stroke, 26:8–11, enacts the same leave-it-to-God ethic tagged on chs. 24–25) and declined — the explicit avenging vocabulary is absent here, the quoted ground is already carried by `trust-in-god` and `the-lords-anointed`, and tagging the same act a third time reads as padding (the book doc’s own ch-24/26 `self-control` reasoning, Decisions item 9). Recorded as a yield-class call, not a silent drop. No other changes.

## 1 Samuel 27
- Existing tags (book doc): none (honest-and-empty)
- Applied-tag deltas: No changes — re-judged against the full 239-id library and still honestly empty. The opening despair (“I will now perish one day by the hand of Saul,” 27:1) and the sustained deception of Achish (“David saved neither man nor woman alive… ‘Lest they should tell about us,’” 27:11) are failure modes the narrator reports “without a word of praise or blame” (book doc); no concept’s teaching substance is present.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: `sojourners-and-strangers` considered for David’s sixteen months in Philistine country (27:2–7) and declined — strategic flight and vassalage, not the pack’s live-faithfully-as-a-foreigner teaching (Jer 29:4-6 register). `trusting-in-man` considered for the flight to Achish and declined — the chapter never frames the move as misplaced trust; importing that verdict would adjudicate what the narrator leaves unadjudicated. The book doc’s Decisions items 1 and 7 (the `doubt` near-use rejected; no praise-or-blame framing) are re-affirmed under the current vocabulary. No yields.

## 1 Samuel 28 (subdivided: 28:1–6 / 28:7–25)
- Existing tags (book doc): `divine-judgment`, `occult-and-divination`
- Applied-tag deltas:
  - KEEP `divine-judgment` — the ch-15 sentence restated with a date: “Because you didn’t obey the LORD’s voice, and didn’t execute his fierce wrath on Amalek, therefore the LORD has done this thing to you today” (28:18), “The LORD has torn the kingdom out of your hand and given it to your neighbor, even to David” (28:17), “and tomorrow you and your sons will be with me” (28:19).
  - KEEP `occult-and-divination` — the canon’s most famous narrative case with the ban visible in-chapter: “Saul had sent away those who had familiar spirits and the wizards out of the land” (28:3, 9), yet “Saul disguised himself… and they came to the woman by night. Then he said, ‘Please consult for me by the familiar spirit’” (28:8) — the practice prohibited, depicted, and ending in terror (28:20). (The engine pack anchors 1 Samuel 28:3-20, w0.9.)
  - ADD `unanswered-prayer` — the chapter’s hinge is God’s silence, stated twice in its own words: “When Saul inquired of the LORD, the LORD didn’t answer him by dreams, by Urim, or by prophets” (28:6), and Saul’s confession, “God has departed from me, and answers me no more, by prophets, or by dreams” (28:15). The pack’s when-God-doesn’t-answer register (its Prov 21:13 anchor is exactly this judgment-silence) is substantially present — it is why Saul goes to Endor at all.
- Anchor-extension candidates:
  - `unanswered-prayer` | 1 Samuel 28:6 | “When Saul inquired of the LORD, the LORD didn’t answer him by dreams, by Urim, or by prophets.” | w0.6 — the canon’s starkest narrative of divine silence, beside the pack’s Lam 3:8/Ps 80:4 anchors (sibling of the ch-14 candidate, 14:37).
- Lexicon candidates:
  - `occult-and-divination` | “witch of endor; medium of endor” | “witch of Endor in the Bible”; “did Saul really see Samuel”; “séance in the Bible”. The pack anchors 28:3-20 but its lexicon carries no Endor route — these are the realistic phrasings (the book doc’s motif 7 recorded the same family).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: The Endor scene stays narrated as the text narrates it (the book doc’s Decisions item 6 — Samuel presented as truly speaking, mechanism unadjudicated); the `unanswered-prayer` ADD rests on 28:6, 15 only and adjudicates nothing about the medium. `fear-not` considered for “Don’t be afraid!” (28:13) and declined — Saul’s words to the medium, not the pack’s divine-comfort register. No yields.

## 1 Samuel 29
- Existing tags (book doc): none (honest-and-empty)
- Applied-tag deltas: No changes — re-judged against the full 239-id library and still honestly empty. The extraction from the impossible march (“Make the man return… lest in the battle he become an adversary to us,” 29:4) names no divine cause anywhere in the chapter; `providence` would fail the in-chapter anchor requirement (the book doc’s Decisions item 8, re-affirmed — the summary signposts the reading without tagging it).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog: None.
- Ceiling / refinement flags: none.
- Decisions record: The 29:9 simile (“as an angel of God”) remains no ground for `angels` — the 1 Samuel block’s recorded no-angels check (tag-gaps-review §3.5) stands. No yields.

## 1 Samuel 30 (subdivided: 30:1–20 / 30:21–31)
- Existing tags (book doc): `pastoral-hope-in-despair`, `guidance`, `gods-faithfulness`, `generosity`
- Applied-tag deltas:
  - KEEP `pastoral-hope-in-despair` — a man at the absolute bottom, personal-crisis register: the city burned, the families taken (30:3–5), “David was greatly distressed, for the people spoke of stoning him… but David strengthened himself in the LORD his God.” (30:6)
  - KEEP `guidance` — the ephod inquiry and God’s direct answer: “David inquired of the LORD, saying, ‘If I pursue after this troop, will I overtake them?’ He answered him, ‘Pursue, for you will surely overtake them, and will without fail recover all.’” (30:7–8)
  - KEEP `gods-faithfulness` — the promise kept to the letter: “David recovered all that the Amalekites had taken” (30:18); “There was nothing lacking to them, neither small nor great… David brought them all back.” (30:19)
  - KEEP `generosity` — shares alike for the faint at the brook: “as his share is who goes down to the battle, so shall his share be who stays with the baggage. They shall share alike” (30:24), and unasked gifts to the elders of Judah: “Behold, a present for you from the plunder of the LORD’s enemies.” (30:26)
- Anchor-extension candidates:
  - `pastoral-hope-in-despair` | 1 Samuel 30:6 | “but David strengthened himself in the LORD his God” | w0.7 — the register’s classic narrative text; the pack anchors 1 Kings 19:4-7 but not this verse, whose remembered phrasing (“David encouraged himself in the Lord,” KJV) is a live query family.
- Lexicon candidates:
  - `pastoral-hope-in-despair` | “strengthened himself in the lord; david encouraged himself in the lord” | “David encouraged himself in the Lord”; “how to strengthen yourself in God”; “encouraging yourself when everyone is against you”. Re-records the 1 Samuel block’s standing lexicon-extension flag with its in-chapter quote (30:6).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `deliverance` (roster row 32) — “who has preserved us, and delivered the troop that came against us into our hand” (30:23) and the recover-all rescue arc (30:8, 18–19); candidate refs for the row beyond its recorded 1 Sam 7–26 span.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT candidate.
- Decisions record: `lament` on 30:4 (“lifted up their voice and wept until they had no more power to weep”) — the recorded decline (tag-gaps-review §1(c): narrative weeping, not the practice of complaint carried to God) is honored; no tag, no overturn (no new evidence — 30:6 turns to strengthening, exactly as the decline reasoned). `justice-and-oppression` considered for the share-alike statute (30:24–25) and declined — an equity ruling among comrades, not the pack’s oppression-of-the-poor/corrupt-courts register. `kindness` considered for the revived Egyptian (30:11–12) and declined — the food revives an informant the pursuit needs; the chapter does not teach kindness through it (thin). No yields.

## 1 Samuel 31
- Existing tags (book doc): `death-and-burial` (only tag; the pre-2026-08-25 line read “none”)
- Applied-tag deltas:
  - KEEP `death-and-burial` (adopted display id, engine-built: no) — burial with honor as the book’s last act: “all the valiant men arose, went all night, and took the body of Saul and the bodies of his sons from the wall of Beth Shan” (31:12), “They took their bones and buried them under the tamarisk tree in Jabesh, and fasted seven days.” (31:13)
- Applied-tag deltas (continued): no ADDs — the narrator names the LORD as actor nowhere in the chapter; `divine-judgment` would require importing ch. 28’s sentence (or 1 Chr 10:13-14) across the chapter boundary, which the in-chapter-refs rule forbids (the book doc’s Decisions item 23, re-affirmed against the 239-id library).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Routed to backlog:
  - routed to backlog: `death-and-burial` (roster row 22; the row records 1 Sam 31:11-13 as its ONLY in-corpus ref) — this sweep re-affirms 31:11–13 as the row’s standing witness; with 25:1 (routed at that chapter) the book contributes two burial-practice refs to the row’s spine.
- Ceiling / refinement flags: none.
- Decisions record: `mortality` considered for Saul’s death scene (31:4–6) and declined — the chapter reports deaths without the pack’s life-is-short teaching substance. `pastoral-grief-and-loss` considered for the Jabesh mourning fast (31:13) and declined — national-scale honors, not the pack’s personal-crisis register (the project-wide pastoral-register ruling). (Only one honest tag from the current vocabulary.) No yields.

---

# Book-level closing sections

## Convention-note amendment (quote glyphs, appended after mechanical verification)
Amends convention note 2 above without rewriting it: in the ch 4–31 blocks, where a quoted WEB
span itself contains direct speech, the WEB's inner double curly quotation marks (“ ”) are
rendered as single curly quotes (‘ ’) — standard nested-quotation practice, the same class of
glyph-only normalization the FINAL book doc records for itself. Mechanical verification (script
output preserved at this thread's scratchpad, 1-samuel-quote-verify2.txt): every WEB-claimed
span of ≥5 words in this ledger — 302 span-parts checked, including all ADD/KEEP justifications —
matches the pinned VPL word-for-word at wording/casing/punctuation level under quote-glyph
normalization only; every span the check reports as not-in-WEB is a deliberate non-WEB span
(query phrasings, lexicon terms, book-doc self-quotes). Cross-verse spans (8:19–20; 20:14–15)
were verified across the verse boundary.

## Cross-worker dedupe (per coordinator instruction, 2026-08-26)
Two new-concept candidates already proposed in the Judges worker's ledger
(judges-sweep-ledger.md) are NOT re-minted here; 1 Samuel contributes supporting evidence:
- Supporting evidence for the Judges ledger's `evil-spirit-from-god` candidate — 1 Samuel
  16:14 (“Now the LORD’s Spirit departed from Saul, and an evil spirit from the LORD troubled
  him.”); 18:10 (“an evil spirit from God came mightily on Saul, and he prophesied in the
  middle of the house”); 19:9 (“An evil spirit from the LORD was on Saul as he sat in his house
  with his spear in his hand”); also 16:15–16, 23. The book doc's Decisions item 5
  (quoted-verbatim, not explained) governs any eventual gist.
- Supporting evidence for the Judges ledger's `asking-god-for-a-sign` candidate — 1 Samuel
  10:2–9 (three confirming signs given through Samuel: “all those signs happened that day,”
  10:9, with 10:7 “when these signs have come to you”); 14:9–10 (Jonathan: “This shall be the
  sign to us,” 14:10). Caveat for the candidate's curator: in both scenes the sign is
  God-initiated or proposed before acting, never demanded as a test — a gist boundary datum.

## Book-level summary
- Chapters swept: 31/31 against the 239-pack engine library + the canonical §11.1 adopted list
  (tag-apply/adopted-concepts.md) + the tag-gaps-review §3 declines and §1 contested calls (as
  ruled) + the 50-row corpus-blocked roster.
- Applied-tag deltas: **8 ADDs** (`priesthood` ch 2; `idolatry` ch 5; `trusting-in-man` ch 8;
  `kindness` ch 20; `slander-and-false-accusation` ch 22; `vengeance` chs 24, 25;
  `unanswered-prayer` ch 28), **83 KEEPs** (every prior-art tag re-affirmed), **0 DROPs**.
  Post-sweep tag total 91; honest-and-empty chapters remain 21, 27, 29.
- Anchor-extension candidates: 29 (across `oaths-and-vows`, `humble-exaltation`, `priesthood`,
  `praise`, `power-of-gods-word`, `idolatry`, `hardness-of-heart`, `fasting`, `repentance`,
  `trusting-in-man` ×3, `unanswered-prayer` ×3, `providence`, `prayer`, `faith`,
  `pleasing-god-not-people`, `gods-unchanging-nature`, `victory-in-christ`, `friendship` ×2,
  `kindness`, `slander-and-false-accusation`, `guidance`, `vengeance` ×2,
  `pastoral-hope-in-despair`).
- Lexicon candidates: 16 (incl. the `holiness` God's-own-holiness review flag; headline items:
  “hannah” → `waiting-for-a-child`, “david and jonathan” → `friendship`, “david and goliath” →
  `faith`, “to obey is better than sacrifice” → `obedience-to-the-word`, “witch of endor” →
  `occult-and-divination`, “ichabod” → `glory-of-god`, “strengthened himself in the lord” →
  `pastoral-hope-in-despair`, “israel demands a king” → `trusting-in-man`).
- New-concept candidates: 0 minted; 2 supporting-evidence references to Judges-ledger
  candidates (above).
- Decline-overturn proposals: 0 — every recorded decline touching 1 Samuel was re-checked and
  re-affirmed (lament 7:2/15:35/30:4; angels; idolatry 12:21/15:23; the ch-13/21/27/29/31
  honest-and-empty and failure-mode calls).
- Corpus-blocked routings: 22 routing notes to 9 roster rows — rows 6 (`god-looks-at-the-heart`;
  chs 13, 16), 7 (`god-relents`; ch 15), 13 (`empowered-by-the-spirit`; chs 10, 11, 16, 19),
  17 (`courage`; ch 17), 21 (`gods-surprising-choice`; chs 9, 16), 22 (`death-and-burial`;
  chs 25, 31), 32 (`deliverance`; chs 7, 11, 14, 17, 30), 33 (`remembrance-and-memorials`;
  ch 7), 46 (`the-lords-anointed`; chs 10, 16, 24, 26). Nothing duplicated as a fresh proposal.
- Per-verse refinement candidates: the 8 book-doc-subdivided chapters — **2, 13, 14, 16, 18,
  25, 28, 30**. No chapter hit the 8-tag hard ceiling (maximum after deltas: ch 7 at 7 tags,
  each independently clearing the presence bar; chs 1 and 12 sit at the soft cap 6).
- tag-gaps.md: NOT touched (this worker's instruction restricts writes to this ledger file
  only); no new vocabulary gap was found that is absent from vocabulary + declines + roster.

## Survival audit (CONVENTIONS §9, final delivery — 2026-08-26)
Full re-read of the live file completed after the last content append. Results:
- Byte integrity: the live file is byte-identical to this worker's append-built mirror copy
  (every append was written to both and cmp-verified immediately after each of the 13 writes;
  final cmp re-run at this audit) — no prior bytes were altered by any write, and no
  concurrent-thread clobber occurred.
- Block census: all 31 chapter blocks present, each exactly once (## 1 Samuel 1 … 31), in
  order; header, two convention notes, the convention-note amendment, the cross-worker dedupe
  entry, and the book-level summary each present exactly once. 633 lines / 79,228 bytes at
  audit time (before this audit block).
- Quote verification standing: the mechanical wording-level check recorded in the
  convention-note amendment above passed for all WEB-claimed spans; no re-application of any
  missing row was needed (nothing was lost).
**AUDIT RESULT: PASS — all contributions survive in the live file exactly once; prior bytes unchanged.**
