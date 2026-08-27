# Nehemiah sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + the 161 §11.1
  adopted display ids per the canonical list at
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (engine ids
  preferred; every non-engine id used below was verified present on that list, exact
  spelling, and its engine-built: no status is noted where it appears).
- Book: Nehemiah (13 chapters; 406 WEB verses — per-chapter counts verified against the
  pinned VPL: 11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31, matching the book doc)
- WEB text source: the repo-pinned ebible.org engwebp VPL snapshot at
  /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt (manifest
  pipeline/manifests/web.json, manifest sha b6f55cc7…, contentSha256 944e3883…,
  re-admitted 2026-08-25 in PR #53 — the same text identity the fixture corpus was
  regenerated from). Book code NEH; every WEB quote below was substring-verified
  byte-for-byte against that file (curly quotes and apostrophes preserved). Note the
  book doc's own provenance: pipeline/fixtures/web-subset.json witnesses Nehemiah 8
  (all 18 verses) only; this sweep quotes all chapters from the pinned VPL directly.
- Inputs:
  - Book doc (existing tags = prior art, incl. its 2026-08-25 adopted-vocabulary
    application pass, Decisions #33): /mnt/project-files/research/bible-rollout/nehemiah.md
  - Concept inventory: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/concept-inventory.md (+ concept-ids.txt)
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/corpus-blocked-roster.md
  - WEB access note: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/web-text-access.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Nehemiah-specific standing facts applied throughout:
  - Four non-engine display ids stand on this book's Tags lines, each verified against
    the canonical adopted-concepts.md (all four listed, engine-built: no) with book-doc
    precedent: `confession-of-sin` (chs 1, 9), `opposition-to-gods-work` (corpus-blocked
    roster row 39; chs 4, 6), `courage` (roster row 17; ch 6), `unequally-yoked` (roster
    row 47; ch 13). Findings about the three roster concepts are ROUTED to their roster
    rows below, never minted.
  - Nehemiah's nine recorded declines (tag-gaps-review §3.5) are applied, not
    re-litigated: `lament`, `idolatry`, `governing-authorities`, `counsel-and-advisers`,
    `empowered-by-the-spirit` (9:20, 30 routed to `holy-spirit`), `end-times`,
    `persecuted-for-gods-word` (routed to `opposition-to-gods-work`),
    `receiving-correction` (9:29-30 is the failure mode), and the `singing`/church-music
    non-row. This sweep found no NEW textual evidence against any of them — zero
    decline-overturn proposals in this ledger.
  - No `pastoral-*` id anywhere (project-wide pastoral-register ruling; the book doc's
    Decisions #2 routing of ch 5 to `justice-and-oppression` re-confirmed here).
  - `remembered-*` verse-memory concepts do not tag OT narrative; no later-revelation
    read-backs anywhere in this ledger.
- Legend — each chapter entry carries these sections, in order:
  1. "## Nehemiah <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2-3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")
- Formatting convention: word-for-word WEB quotes use curly double quotes (“…”);
  query phrasings, id mentions, and paraphrase use straight quotes or backticks.

---

## Nehemiah 1

1. Existing tags (book doc): `prayer`, `sin`, `covenant`, `confession-of-sin`, `remnant`, `restoration-of-israel`, `fasting` (7 tags).
2. Applied-tag deltas:
   - KEEP `prayer` — the chapter is one extended prayer: “I fasted and prayed before the God of heaven” (1:4), asking that God's ear be attentive “day and night” (1:6) down to the closing petition, “please prosper your servant today, and grant him mercy in the sight of this man” (1:11).
   - KEEP `sin` — national guilt owned personally: “Yes, I and my father’s house have sinned.” (1:6), “We have dealt very corruptly against you” (1:7).
   - KEEP `covenant` — the prayer stands on the God “who keeps covenant and loving kindness with those who love him and keep his commandments” (1:5) and pleads the Mosaic covenant word: “Remember, I beg you, the word that you commanded your servant Moses” (1:8).
   - KEEP `confession-of-sin` (adopted display id, engine-built: no) — the practice itself, an intercessor confessing the nation's sins as his own: “I confess the sins of the children of Israel which we have sinned against you. Yes, I and my father’s house have sinned.” (1:6).
   - KEEP `remnant` — the word itself names the community: “The remnant who are left of the captivity there in the province are in great affliction and reproach.” (1:3).
   - KEEP `restoration-of-israel` — the scatter-and-gather promise pleaded back to its giver: “I will scatter you among the peoples” (1:8), “but if you return to me, and keep my commandments and do them”, “yet I will gather them from there” (1:9).
   - KEEP `fasting` — narrated with its occasion: “I fasted and prayed before the God of heaven” (1:4).
3. Anchor-extension candidates:
   - `restoration-of-israel` | Nehemiah 1:8-9 | “but if you return to me, and keep my commandments and do them” … “yet I will gather them from there, and will bring them to the place that I have chosen” (1:9) | w0.6 — the promise prayed, complementing the pack's prophetic anchors (Jer 31, Ezek 36-37, Deut 30:1-5).
   - `remnant` | Nehemiah 1:2-3 | “The remnant who are left of the captivity there in the province are in great affliction and reproach.” (1:3) | w0.7 — post-exilic phrase witness; the pack has no Ezra-Nehemiah anchor.
   - `fasting` | Nehemiah 1:4 | “I fasted and prayed before the God of heaven” | w0.55 — personal penitential fast; matches the tag-gaps append 1c.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: 7 tags — above the soft cap of 6, below the hard ceiling of 8, every tag independently clearing the bar (the book doc's application pass landed here deliberately). Not subdivided in the book doc; no refinement flag.
8. Decisions record: `fear-of-the-lord` on 1:11 (“your servants who delight to fear your name”) re-checked and left off — a single clause; the book's home for the register is ch 5 (book doc Decisions #33 skip upheld). `gods-faithfulness` on 1:5 left off — one attribute clause the `covenant` justification already quotes. `exile-and-captivity` (adopted id, roster row 45) on 1:2-3 left off per the application pass's reasoning — `remnant` is the specific phrase witness on identical verses; the refs are ROUTED to backlog: `exile-and-captivity` (roster row 45, which already rides Jesse's fold-vs-separate call; Neh 1:2-3 recorded in the book doc's tag-gap item 2). No drops.

---

## Nehemiah 2 (subdivided: 2:1-10; 2:11-20)

1. Existing tags (book doc): `prayer`, `providence`, `leadership` (3 tags).
2. Applied-tag deltas:
   - KEEP `prayer` — the instant prayer between the king's question and the answer: “What is your request?” — “So I prayed to the God of heaven.” (2:4).
   - KEEP `providence` — every door opens under one stated explanation, given twice: “The king granted my requests, because of the good hand of my God on me.” (2:8), retold as “the hand of my God which was good on me” (2:18).
   - KEEP `leadership` — inspect first, speak after: the secret night survey (2:12-16), then “Come, let’s build up the wall of Jerusalem, that we won’t be disgraced.” (2:17), answered by “Let’s rise up and build.” (2:18).
3. Anchor-extension candidates:
   - `providence` | Nehemiah 2:8 | “The king granted my requests, because of the good hand of my God on me.” | w0.6 — God's unseen hand moving a pagan king; sits beside the pack's Esther 4:14 anchor in register.
   - `prayer` | Nehemiah 2:4 | “So I prayed to the God of heaven.” | w0.55 — the prayed-in-the-instant scene the book is famous for; the pack has no arrow-prayer anchor.
4. Lexicon candidates:
   - `providence` | term: "the good hand of god" | queries: "God's hand on my life", "the good hand of God", "God's favor at work". Coordinates with the Ezra book doc's identical motif (Ezra 7-8, its motif item 1) — one curation decision, not two.
   - `prayer` | term: "quick prayer in the moment" | queries: "quick prayer for help", "praying in the moment", "short prayer before speaking". Anchored by 2:4; check against the pack's existing "pray without ceasing" family before adding.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in the book doc (2:1-10; 2:11-20) — PER-VERSE REFINEMENT candidate.
8. Decisions record: `opposition-to-gods-work` (adopted id, roster row 39) on 2:10, 19 re-checked and left off — two in-scene verses; the book's homes are chs 4 and 6 (application-pass skip upheld); the 2:10, 19 evidence is ROUTED to backlog: `opposition-to-gods-work` (roster row 39; the refs already ride the book doc's tag-gap item 2 append). `courage` (roster row 17) on 2:2-5 (“Then I was very much afraid” yet he spoke) considered and left off — one moment of fear overcome inside a court scene, below the substantial-presence bar; the book's courage anchor is ch 6. No drops.

---

## Nehemiah 3

1. Existing tags (book doc): none — honest-and-empty ("no concept in the current vocabulary is genuinely present in this chapter").
2. Applied-tag deltas: No changes — re-swept against the full 239-pack library: the chapter is a builders' roster (gate by gate, name by name), and per the Genesis genealogy precedent a list does not carry a concept's teaching substance. Its one diligence clause (“earnestly repaired”, 3:20) and one failure clause (“their nobles didn’t put their necks to the Lord’s work”, 3:5) are single clauses, below the bar for `work-and-diligence` (book doc Decisions #8 upheld).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (not subdivided; honestly empty).
8. Decisions record: `servanthood`, `gathering-together`, and `unity-of-the-church` were each checked against the shared-labor picture and left off — the chapter reports cooperation as a roster, without any concept's teaching substance; `unity-of-the-church` on OT wall-building would additionally strain the pack's church register. No drops.

---

## Nehemiah 4 (subdivided: 4:1-8; 4:9-23)

1. Existing tags (book doc): `prayer`, `fear-not`, `gods-protection`, `work-and-diligence`, `opposition-to-gods-work`, `leadership` (6 tags).
2. Applied-tag deltas:
   - KEEP `prayer` — opposition met first by prayer, twice: the raw plea “Hear, our God, for we are despised. Turn back their reproach on their own head.” (4:4) and the summary sentence “But we made our prayer to our God, and set a watch against them day and night because of them.” (4:9).
   - KEEP `fear-not` — the do-not-fear word grounded in who God is: “Don’t be afraid of them! Remember the Lord, who is great and awesome” (4:14).
   - KEEP `gods-protection` — “God had brought their counsel to nothing” (4:15); “Our God will fight for us.” (4:20).
   - KEEP `work-and-diligence` — the chapter's working spine: “the people had a mind to work” (4:6); “everyone with one of his hands did the work, and with the other held his weapon” (4:17); labor “from the rising of the morning until the stars appeared” (4:21).
   - KEEP `opposition-to-gods-work` (adopted display id, engine-built: no; roster row 39) — the escalating playbook: “What are these feeble Jews doing?” (4:2), the fox-joke (4:3), then “they all conspired together to come and fight against Jerusalem” (4:8) and tenfold warnings (4:12).
   - KEEP `leadership` — crisis leadership move by move: guards set “by family groups with their swords, their spears, and their bows” (4:13), the fearful rallied (4:14), the trumpeter stationed — “Wherever you hear the sound of the trumpet, rally there to us.” (4:20).
3. Anchor-extension candidates:
   - `victory-in-christ` | Nehemiah 4:20 | “Our God will fight for us.” | w0.6 — the pack's lexicon already carries "god fights for us" / "the battle belongs to the lord" and anchors Exodus 14:13-14 in exactly this God-fights register; 4:20 is its Nehemiah witness.
   - `fear-not` | Nehemiah 4:14 | “Don’t be afraid of them! Remember the Lord, who is great and awesome” | w0.65 — a spoken do-not-fear command grounded in God, the pack's design register (Josh 1:9 sibling).
   - `gods-protection` | Nehemiah 4:15 | “God had brought their counsel to nothing” | w0.5 — a narrated protection outcome; the pack currently anchors Psalms/Isaiah promises only.
4. Lexicon candidates:
   - `prayer` | term: "pray and keep watch" | queries: "pray and take action", "praying while working", "watch and pray". Anchored by 4:9. CAUTION for the curator: the bare phrase "watch and pray" is already owned by `pastoral-freedom-from-bondage` (Matt 26:41) — an XOR check is required before any row.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at the soft cap (6 tags); subdivided in the book doc (4:1-8; 4:9-23) — PER-VERSE REFINEMENT candidate.
8. Decisions record: `do-not-lose-heart` considered and NOT added — the discouragement register is genuinely touched (“The strength of the bearers of burdens is fading”, 4:10, answered by rallying and resumed work, 4:14-15), but the chapter's answer to it is the fear-not word and the armed watch, which `fear-not` and `gods-protection` already carry; a seventh tag would duplicate that register (broad-duplicating-specific). `victory-in-christ` considered as a TAG and not added on the same ground — `gods-protection` carries 4:15, 20 at chapter level; the finding survives as the anchor-extension candidate above (exactly the plan §3.1 mechanism). `grumbling-and-complaining` on 4:10 checked and left off — Judah's word is discouragement reported, not the murmuring-against-God register. No drops.

---

## Nehemiah 5 (subdivided: 5:1-13; 5:14-19)

1. Existing tags (book doc): `repentance`, `generosity`, `justice-and-oppression`, `fear-of-the-lord`, `leadership`, `oaths-and-vows` (6 tags).
2. Applied-tag deltas:
   - KEEP `repentance` — wrong named (“You exact usury, everyone of his brother.” 5:7), its doers silenced (“Then they held their peace, and found not a word to say.” 5:8), the turning promised and performed: “We will restore them, and will require nothing of them.” (5:12), “The people did according to this promise.” (5:13). The book doc's Decisions #6 fence (a confronted turning) rides with the keep.
   - KEEP `generosity` — rights forgone at personal cost: “I didn’t demand the governor’s pay, because the bondage was heavy on this people.” (5:18), the open table of 5:17-18.
   - KEEP `justice-and-oppression` — national-scale economic oppression confronted and reversed: “we bring our sons and our daughters into bondage to be servants” (5:5), “Please let us stop this usury.” (5:10), restoration sworn and performed (5:11-13). Pastoral-register ruling routing re-confirmed: no `pastoral-*` id belongs here.
   - KEEP `fear-of-the-lord` — the fear of God as the stated ground of public ethics and office: “Shouldn’t you walk in the fear of our God because of the reproach of the nations, our enemies?” (5:9); “but I didn’t do so, because of the fear of God” (5:15).
   - KEEP `leadership` — twelve years without “the bread of the governor” (5:14), “Yes, I also continued in the work of this wall. We didn’t buy any land.” (5:16).
   - KEEP `oaths-and-vows` — the remedy bound by oath: “Then I called the priests, and took an oath of them, that they would do according to this promise.” (5:12), with the enacted sanction of the shaken-out lap (5:13).
3. Anchor-extension candidates:
   - `justice-and-oppression` | Nehemiah 5:1-13 | “Behold, we bring our sons and our daughters into bondage to be servants” (5:5); “You exact usury, everyone of his brother.” (5:7) | w0.7 — the row's remediation register: oppression not only denounced but reversed under oath (matches tag-gaps append 1a).
   - `fear-of-the-lord` | Nehemiah 5:9 | “Shouldn’t you walk in the fear of our God because of the reproach of the nations, our enemies?” | w0.65 — the ethics-and-office register the pack's Psalms/Proverbs anchors don't carry (matches append 1b).
   - `oaths-and-vows` | Nehemiah 5:12-13 | “Then I called the priests, and took an oath of them, that they would do according to this promise.” | w0.55 — an oath with priests and enacted sanction (matches append 1e).
   - `generosity` | Nehemiah 5:17-18 | “I didn’t demand the governor’s pay, because the bondage was heavy on this people.” | w0.5 — costly giving by a ruler; a narrative anchor the pack lacks.
4. Lexicon candidates:
   - `justice-and-oppression` | term: "usury and charging interest" | queries: "usury in the bible", "what does the bible say about charging interest", "lending money to the poor". The WEB's own word here is “usury” (5:7, 10); the pack's lexicon has no interest/lending vocabulary.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at the soft cap (6 tags); subdivided in the book doc (5:1-13; 5:14-19) — PER-VERSE REFINEMENT candidate.
8. Decisions record: `counsel-and-advisers` decline (tag-gaps-review §3.5: 5:7's “Then I consulted with myself” is deliberation, not the seeking-advisers register) re-checked and upheld — no new evidence. A debt-release/seventh-year concept was re-weighed (5:1-13 with 10:31's release pledge) and again NOT proposed — the book doc's motif 12 already leaves the debt-specific question to the curator, and the searchable core here (oppression-and-release) is routed via `justice-and-oppression`; the `contentment` pack's bare "debt" lexicon term is the wrong register for this chapter and was not extended. No drops.

---

## Nehemiah 6 (subdivided: 6:1-14; 6:15-19)

1. Existing tags (book doc): `prayer`, `gods-protection`, `opposition-to-gods-work`, `courage` (4 tags).
2. Applied-tag deltas:
   - KEEP `prayer` — the memoir's arrow-prayers under pressure: “But now, strengthen my hands.” (6:9); “Remember, my God, Tobiah and Sanballat according to these their works” (6:14, reported as the text's own voice).
   - KEEP `gods-protection` — every snare fails: the Ono ambush refused four times (6:2-4), the hired prophecy seen through — “I discerned, and behold, God had not sent him” (6:12) — and the finished wall as evidence: “they perceived that this work was done by our God” (6:16). Book doc Decisions #13's inferential caveat rides with the keep.
   - KEEP `opposition-to-gods-work` (adopted display id, engine-built: no; roster row 39) — the full playbook against one man: “But they intended to harm me.” (6:2), the open letter (6:5-7), the hired prophet (6:10-13), and after the wall stands, still “Tobiah sent letters to put me in fear.” (6:19).
   - KEEP `courage` (adopted display id, engine-built: no; roster row 17) — “Should a man like me flee? Who is there that, being such as I, would go into the temple to save his life? I will not go in.” (6:11); the prayer-entwined caveat (6:9) rides with the tag per the book doc.
   - ADD `slander-and-false-accusation` — the chapter's central weapon is a public false accusation: an open letter alleging “It is reported among the nations, and Gashmu says it, that you and the Jews intend to rebel.” (6:6), answered “There are no such things done as you say, but you imagine them out of your own heart.” (6:8); the hired prophecy is aimed the same way, “that they might have material for an evil report, that they might reproach me” (6:13). The pack's substance — lied about, and answering it — is depicted at chapter scale.
   - ADD `false-prophets` — a hired prophet tested and refused: “I discerned, and behold, God had not sent him, but he pronounced this prophecy against me. Tobiah and Sanballat had hired him.” (6:12), “He was hired so that I would be afraid, do so, and sin” (6:13), and more than one: “the prophetess Noadiah and the rest of the prophets that would have put me in fear” (6:14). This is the pack's recognize-and-test substance (its Deut 18:21-22 anchor register) in narrative form.
3. Anchor-extension candidates:
   - `slander-and-false-accusation` | Nehemiah 6:5-9 | “There are no such things done as you say, but you imagine them out of your own heart.” (6:8) | w0.6 — a public false accusation answered plainly; the pack's anchors are all Psalms/NT.
   - `false-prophets` | Nehemiah 6:10-14 | “I discerned, and behold, God had not sent him” (6:12) | w0.6 — an OT narrative instance of testing a prophecy; complements the pack's Deut 18:21-22 test anchor.
4. Lexicon candidates:
   - `wisdom-from-god` | term: "discerning a false message" | queries: "how to discern if a message is from God", "discernment about advice", "is this from God". Anchored by 6:12 (“I discerned”); the pack already carries bare "discernment" — this is a check-before-extend lead, not a confirmed gap.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at the soft cap after adds (6 tags); subdivided in the book doc (6:1-14; 6:15-19) — PER-VERSE REFINEMENT candidate.
8. Decisions record: The two ADDs are 239-library gains unavailable to the book doc's 131-id vintage and outside its adopted-pass worklist; both independently clear the presence bar (each rests on the chapter's own scenes, quoted above), and the both-tags ruling (§11.2) lets them stand beside `opposition-to-gods-work`, which names the campaign while they name its instruments. `persecuted-for-gods-word` decline re-checked and upheld (the target is a governor-builder, not a bearer of God's word as such; roster row 4 not routed to — no new register evidence). Roster routing: the ch 6 courage material (6:9-13) is already the recorded case on backlog roster row 17 (`courage`); the opposition material rides row 39 (`opposition-to-gods-work`) — routed to backlog: `courage` (row 17), `opposition-to-gods-work` (row 39); no fresh proposals minted. No drops.

---

## Nehemiah 7 (subdivided: 7:1-3; 7:4-73)

1. Existing tags (book doc): `priesthood` (1 tag — the book doc's single-tag chapter).
2. Applied-tag deltas:
   - KEEP `priesthood` — the office's genealogical-qualification register: families who “searched for their genealogical records, but couldn’t find them. Therefore they were deemed disqualified and removed from the priesthood.” (7:64), barred from the most holy things “until a priest stood up to minister with Urim and Thummim” (7:65).
3. Anchor-extension candidates:
   - `priesthood` | Nehemiah 7:63-65 | “Therefore they were deemed disqualified and removed from the priesthood.” (7:64) | w0.5 — the qualification register the pack's anchors (Exod 28, Heb 4-10) don't carry; COORDINATE with the parallel Ezra 2:61-63 (the Ezra thread stages the same append — one curation decision, per tag-gaps append 1n).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in the book doc (7:1-3; 7:4-73) — PER-VERSE REFINEMENT candidate.
8. Decisions record: Re-checks upheld from book doc Decisions #9 and #33: `providence` on 7:5 (“My God put into my heart”) — single clause, thinner than ch 2's doubled instance; `honesty` on 7:2 (“he was a faithful man and feared God above many”) — character note, not truth-telling substance; `fear-of-the-lord` on 7:2 — same single clause; `gods-protection` on 7:3's watches — human prudence with no divine-keeping statement. `exile-and-captivity` on 7:6 (“who went up out of the captivity”) — roster heading verse; ROUTED to backlog: `exile-and-captivity` (roster row 45, already carrying Neh 7:6 via the book doc's tag-gap item 2). No drops.

---

## Nehemiah 8 (subdivided: 8:1-12; 8:13-18)

1. Existing tags (book doc): `studying-the-word`, `joy-in-the-lord`, `obedience-to-the-word`, `worship`, `appointed-feasts`, `revival-and-reformation` (6 tags).
2. Applied-tag deltas:
   - KEEP `studying-the-word` — read, heard, explained until understood: “The ears of all the people were attentive to the book of the law.” (8:3); “they gave the sense, so that they understood the reading” (8:8); leaders gathered “to study the words of the law” (8:13).
   - KEEP `joy-in-the-lord` — “Don’t be grieved, for the joy of the LORD is your strength.” (8:10); “There was very great gladness.” (8:17). The pack itself anchors Nehemiah 8:10 at w1.
   - KEEP `obedience-to-the-word` — what is found written is done at once: the booths command found (8:14), proclaimed “to make temporary shelters, as it is written” (8:15), and kept by the whole assembly (8:16-17).
   - KEEP `worship` — the people answer “Amen, Amen” “with the lifting up of their hands” and “They bowed their heads, and worshiped the LORD with their faces to the ground.” (8:6).
   - KEEP `appointed-feasts` — the feast of the seventh month recovered from the text and kept (8:14-17). The pack itself anchors Nehemiah 8:13-18 at w1.
   - KEEP `revival-and-reformation` — word-driven corporate renewal at full scale (8:1-18). The pack itself anchors Nehemiah 8:1-8 at w0.9.
3. Anchor-extension candidates:
   - `studying-the-word` | Nehemiah 8:8 | “They read in the book, in the law of God, distinctly; and they gave the sense, so that they understood the reading.” | w0.8 — the read-and-explain register; the pack's four anchors carry no public-reading text.
   - `worship` | Nehemiah 8:6 | “They bowed their heads, and worshiped the LORD with their faces to the ground.” | w0.55 — corporate bodily worship at the opened book.
   - `obedience-to-the-word` | Nehemiah 8:14-17 | “They found written in the law how the LORD had commanded by Moses that the children of Israel should dwell in booths in the feast of the seventh month” (8:14) | w0.55 — found-written-then-done narrative.
4. Lexicon candidates:
   - `studying-the-word` | term: "public reading of scripture" | queries: "public reading of scripture", "reading the bible out loud", "scripture reading in church". The book doc's motif 8 records the gap (no "public reading" phrasing in the pack); the Deuteronomy thread's §3.5 note flags the same check on `studying-the-word` for Deut 31:10-13 — one curation decision.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: at the soft cap (6 tags); subdivided in the book doc (8:1-12; 8:13-18) — PER-VERSE REFINEMENT candidate. Three concept packs anchor inside this chapter (`joy-in-the-lord` 8:10; `appointed-feasts` 8:13-18; `revival-and-reformation` 8:1-8) — a dense chapter by any measure.
8. Decisions record: `gathering-together` considered and NOT added — “All the people gathered themselves together as one man” (8:1) genuinely depicts assembly, but the pack's meeting-together substance is carried here by `worship` and `studying-the-word` on the same verses, and a seventh tag would be broad-duplicating-specific. `delight-in-the-word` considered and NOT added — the chapter's register is public reading and study (attentiveness, understanding), not the meditate-day-and-night register; the weeping-then-joy arc is carried by `joy-in-the-lord`. `thanksgiving` on 8:12's feasting checked — celebration, not the giving-of-thanks practice; left off. No drops.

---

## Nehemiah 9

1. Existing tags (book doc): `prayer`, `gods-faithfulness`, `sin`, `repentance`, `covenant`, `praise`, `confession-of-sin`, `backsliding` (8 tags — the hard ceiling).
2. Applied-tag deltas:
   - KEEP `prayer` — a day structured around prayer: reading, confession, and worship by quarter-days (9:3), a loud cry (9:4), and the recited prayer of 9:5-38.
   - KEEP `gods-faithfulness` — mercy outlasting rebellion is the prayer's engine: “But you are a God ready to pardon, gracious and merciful, slow to anger, and abundant in loving kindness” (9:17); “Nevertheless in your manifold mercies you didn’t make a full end of them” (9:31).
   - KEEP `sin` — “confessed their sins and the iniquities of their fathers” (9:2); “you have dealt truly, but we have done wickedly” (9:33).
   - KEEP `repentance` — enacted at national scale: “assembled with fasting, with sackcloth, and dirt on them” (9:1), the recited turning pattern “when they returned and cried to you, you heard from heaven” (9:28), and the resolve “we make a sure covenant, and write it” (9:38).
   - KEEP `covenant` — God “made a covenant with him” (9:8) and “keeps covenant and loving kindness” (9:32); the people answer in kind (9:38).
   - KEEP `praise` — the summons that opens the prayer: “Stand up and bless the LORD your God from everlasting to everlasting! Blessed be your glorious name, which is exalted above all blessing and praise!” (9:5).
   - KEEP `confession-of-sin` (adopted display id, engine-built: no) — the practice structuring the whole day: “a fourth part they confessed and worshiped the LORD their God” (9:3).
   - KEEP `backsliding` — the corporate relapse cycle stated liturgically: “But after they had rest, they did evil again before you” (9:28), “many times you delivered them according to your mercies” (9:28).
3. Anchor-extension candidates (the ceiling makes this chapter's dropped-at-chapter-level material live here, per plan §3.1):
   - `slow-to-anger` | Nehemiah 9:31 | “Nevertheless in your manifold mercies you didn’t make a full end of them, nor forsake them; for you are a gracious and merciful God.” | w0.6 — the pack already anchors Neh 9:17 (w0.8); 9:31 completes the recital's second use of the formula.
   - `mercy` | Nehemiah 9:27-28 | “according to your manifold mercies you gave them saviors who saved them out of the hands of their adversaries” (9:27) | w0.55 — "manifold mercies" is a phrase family the pack lacks.
   - `hardness-of-heart` | Nehemiah 9:16-17 | “But they and our fathers behaved proudly, hardened their neck, didn’t listen to your commandments” (9:16) | w0.6 — corporate self-hardening vocabulary, kin to the pack's Prov 29:1 anchor; 9:29 (“stiffened their neck, and would not hear”) rides the same candidate.
   - `holy-spirit` | Nehemiah 9:20 | “You gave also your good Spirit to instruct them” | w0.5 — the Spirit as instructor; 9:30 (“testified against them by your Spirit through your prophets”) rides with it (matches tag-gaps append 1m; the `empowered-by-the-spirit` routing note on roster row 13 already records this Nehemiah decline).
   - `gods-provision` | Nehemiah 9:20-21 | “forty years you sustained them in the wilderness. They lacked nothing.” (9:21) | w0.6 — manna, water, and forty years' sustaining recited (book doc Decisions #10 flagged exactly this as pack material while dropping the tag).
   - `creation` | Nehemiah 9:6 | “You have made heaven, the heaven of heavens, with all their army, the earth and all things that are on it, the seas and all that is in them, and you preserve them all.” | w0.55 — making AND preserving in one confession (book doc motif 10's anchor flag, honored here).
   - `praise` | Nehemiah 9:5 | “Stand up and bless the LORD your God from everlasting to everlasting!” | w0.5 — a corporate doxology summons outside the Psalter.
4. Lexicon candidates: None (the "gracious and merciful, slow to anger" phrase family already lives in `slow-to-anger`'s lexicon and anchors).
5. New-concept candidates: None.
6. Decline-overturn proposals: None. (`receiving-correction` re-checked against 9:29-30 — still the failure mode, exactly as the recorded decline says; `empowered-by-the-spirit` re-checked at 9:20, 30 — still instruction and testimony, not empowerment-for-a-task; `lament` re-checked at 9:1 — penitential grief over sin, not complaint-to-God.)
7. Ceiling / refinement flags: HARD CEILING (8 tags) — PER-VERSE REFINEMENT candidate (not subdivided in the book doc; the refinement pass should section the prayer itself: 9:1-5 assembly and summons; 9:6-15 creation-to-Sinai recital; 9:16-31 rebellion-and-mercy cycles; 9:32-38 present distress and covenant resolve).
8. Decisions record: The book doc's Decisions #33 ceiling plan re-verified against the 239 library and upheld in full: `slow-to-anger` and `hardness-of-heart` remain duplicate-register with `gods-faithfulness`/`sin` on the same verses; `mercy` (engine pack, re-weighed fresh at this sweep) genuinely applies on 9:17, 19, 27-28, 31 but would be a ninth tag restating `gods-faithfulness`'s quoted verses — yielded as broad-duplicating-specific at the ceiling, surviving as the anchor-extension candidate above (this is the one new yield this sweep records; no silent drop). `signs-and-wonders` on 9:10 checked — one recital verse, below the bar. `exile-and-captivity` on 9:36-37 (“Behold, we are servants today”) — ROUTED to backlog: `exile-and-captivity` (roster row 45; refs already ride the book doc's tag-gap item 2). The “saviors who saved them” deliverance material (9:27) — ROUTED to backlog: `deliverance` (roster row 32); not minted, not proposed fresh. No drops of existing tags.

---

## Nehemiah 10 (subdivided: 10:1-27; 10:28-39)

1. Existing tags (book doc): `covenant`, `obedience-to-the-word`, `tithing`, `the-house-of-god`, `revival-and-reformation` (5 tags).
2. Applied-tag deltas:
   - KEEP `covenant` — the institution itself: signatories (10:1-27), and the whole community “entered into a curse and into an oath, to walk in God’s law” (10:29).
   - KEEP `obedience-to-the-word` — the oath's content is hearing-and-doing: “to observe and do all the commandments of the LORD our Lord” (10:29), practices pegged to “as it is written in the law” (10:34).
   - KEEP `tithing` — “the first fruits of our ground” (10:35), “the tithes of our ground to the Levites” (10:37), “the tithe of the tithes to the house of our God” (10:38).
   - KEEP `the-house-of-god` — the terms converge on the house, summed in one vow: “We will not forsake the house of our God.” (10:39).
   - KEEP `revival-and-reformation` — renewal spelled into concrete practice by “all those who had separated themselves from the peoples of the lands to the law of God” (10:28).
3. Anchor-extension candidates:
   - `the-house-of-god` | Nehemiah 10:39 | “We will not forsake the house of our God.” | w0.7 — a quotable vow phrase; the pack's post-exilic anchors are Haggai/Ezra only.
   - `tithing` | Nehemiah 10:35-38 | “and the tithes of our ground to the Levites” (10:37) | w0.6 — firstfruits-and-tithes system detail; the pack has no Ezra-Nehemiah anchor.
4. Lexicon candidates: None (`tithing` already carries "firstfruits"; `covenant` already carries "covenant promises").
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in the book doc (10:1-27; 10:28-39) — PER-VERSE REFINEMENT candidate.
8. Decisions record: Application-pass skips re-verified and upheld: `oaths-and-vows` on 10:29 (the single verse the `covenant` tag quotes verbatim — book's oath anchor stands at ch 5); `sabbath-rest` on 10:31 (one pledge verse; book doc Decisions #11); `unequally-yoked` on 10:30 (one pledge verse in the term list — the ref is ROUTED to backlog: `unequally-yoked` (roster row 47), where Neh 10:30 already rides via tag-gaps append 1q). 10:33's “the sin offerings to make atonement for Israel” — one term-list verse; ROUTED to backlog: `sacrifice-and-atonement` (roster row 1) as a minor Nehemiah witness, not proposed fresh. No drops.

---

## Nehemiah 11

1. Existing tags (book doc): none — honest-and-empty ("no concept in the current vocabulary is genuinely present in this chapter").
2. Applied-tag deltas: No changes — re-swept against the full 239-pack library: a settlement roster (11:3-36) carries no concept's teaching substance (Genesis genealogy precedent), and 11:1-2's lot-casting and willing settlers are two verses (“The people blessed all the men who willingly offered themselves to dwell in Jerusalem.” 11:2), below the bar for any pack (book doc Decisions #16 upheld).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (not subdivided; honestly empty).
8. Decisions record: `zion-city-of-god` considered fresh at this sweep and NOT added — “Jerusalem, the holy city” (11:1; also 11:18) is a genuine phrase witness, but two title phrases inside a settlement register do not depict the pack's celebration-of-Zion substance; recorded as a possible lexicon-color note only ("the holy city") for that pack's curator, below the confidence needed for a formal lexicon candidate. `generosity` and `blessing` on 11:2 re-checked and left off (the book doc's reasoning stands). The willing-self-offering motif remains logged in the book doc (motif 5), deliberately unpromoted. No drops.

---

## Nehemiah 12 (subdivided: 12:1-26; 12:27-43; 12:44-47)

1. Existing tags (book doc): `thanksgiving`, `joy-in-the-lord`, `worship` (3 tags).
2. Applied-tag deltas:
   - KEEP `thanksgiving` — the day's organizing act: Levites appointed “to praise and give thanks according to the commandment of David the man of God” (12:24), and “two great companies who gave thanks” (12:31) meeting in God's house (12:40).
   - KEEP `joy-in-the-lord` — “and rejoiced, for God had made them rejoice with great joy” … “so that the joy of Jerusalem was heard even far away” (12:43).
   - KEEP `worship` — dedication “with giving thanks and with singing, with cymbals, stringed instruments, and with harps” (12:27), purification of people, gates, and wall (12:30), “They offered great sacrifices that day” (12:43).
3. Anchor-extension candidates:
   - `thanksgiving` | Nehemiah 12:31 | “appointed two great companies who gave thanks and went in procession” | w0.6 — corporate thanksgiving as public act; the pack's anchors are all epistolary/psalmic.
   - `joy-in-the-lord` | Nehemiah 12:43 | “for God had made them rejoice with great joy; and the women and the children also rejoiced, so that the joy of Jerusalem was heard even far away” | w0.6 — God-given corporate joy; pairs with the pack's existing Neh 8:10 keystone.
   - `worship` | Nehemiah 12:27 | “to keep the dedication with gladness, both with giving thanks and with singing, with cymbals, stringed instruments, and with harps” | w0.55 — instrumental corporate worship; the pack has no OT-narrative music anchor.
4. Lexicon candidates:
   - `worship` | term: "worship music" | queries: "worship music in the bible", "singing in church", "musical instruments in worship". COORDINATE: the 1 Chronicles thread's recorded lexicon flag (§3.5 — "worship music"/"sing to the LORD" missing from `worship`/`praise`, 1 Chr 16:23; 25:6-7 anchors) is the same gap; Neh 12:27, 42, 46 join those refs — one curation decision, not two.
5. New-concept candidates: None.
6. Decline-overturn proposals: None. (The `singing`/church-music non-row decline re-checked and upheld — the material is honestly carried by `worship`/`praise`/`thanksgiving`; the lexicon candidate above is tuning on a live pack, not a row.)
7. Ceiling / refinement flags: subdivided in the book doc (12:1-26; 12:27-43; 12:44-47) — PER-VERSE REFINEMENT candidate.
8. Decisions record: `praise` re-weighed and again NOT added — 12:24 and 12:46 are real praise vocabulary, but `thanksgiving` and `worship` carry those same verses' substance and a third tag on the same two verses double-counts (book doc Decisions #26 upheld). `gods-faithfulness` on 12:43 checked — the joy is attributed to God, but one clause; carried by `joy-in-the-lord`. The clergy rolls (12:1-26) carry nothing by themselves (roster precedent). No drops.

---

## Nehemiah 13 (subdivided: 13:1-9; 13:10-14; 13:15-22; 13:23-31)

1. Existing tags (book doc): `tithing`, `sabbath-rest`, `prayer`, `backsliding`, `the-house-of-god`, `unequally-yoked`, `leadership`, `revival-and-reformation` (8 tags — the hard ceiling).
2. Applied-tag deltas:
   - KEEP `tithing` — the system found collapsed and rebuilt: “I perceived that the portions of the Levites had not been given them” (13:10); “Then all Judah brought the tithe of the grain, the new wine, and the oil to the treasuries.” (13:12); treasurers “counted faithful” (13:13).
   - KEEP `sabbath-rest` — profanation described (13:15-16), rebuked — “What evil thing is this that you do, and profane the Sabbath day?” (13:17) — and remedied: gates shut (13:19), Levites set “to sanctify the Sabbath day” (13:22).
   - KEEP `prayer` — the memoir's closing refrain, reported as the text's own voice: “Remember me, my God, concerning this” (13:14); “spare me according to the greatness of your loving kindness” (13:22); “Remember me, my God, for good.” (13:31).
   - KEEP `backsliding` — the sealed covenant found broken point by point on return (13:4-31), down to the priesthood: “they have defiled the priesthood and the covenant of the priesthood and of the Levites” (13:29).
   - KEEP `the-house-of-god` — breach and repair: Tobiah lodged “in the courts of God’s house” (13:7) and thrown out (13:8-9), and the pointed question “Why is God’s house forsaken?” (13:11).
   - KEEP `unequally-yoked` (adopted display id, engine-built: no; roster row 47) — the intermarriage pledge confronted at its breach, pressed with the Solomon argument: “Nevertheless foreign women caused even him to sin.” (13:26). The Ezra covenant-national caveat (never a direct template for the modern question) rides with the keep, per the book doc.
   - KEEP `leadership` — reform against entrenched interests, enforced point by point: the storeroom emptied (13:8), treasurers appointed (13:13), gates shut with a warning — “If you do so again, I will lay hands on you.” (13:21) — and the compromised grandson chased away (13:28).
   - KEEP `revival-and-reformation` — reform requires re-reforming: temple, tithe, Sabbath, and marriage each forced back into place, duties appointed as the memoir stops (13:30-31).
3. Anchor-extension candidates:
   - `sabbath-rest` | Nehemiah 13:15-22 | “What evil thing is this that you do, and profane the Sabbath day?” (13:17) | w0.6 — the pack's anchors are command/promise texts; this is the confronted-profanation narrative.
   - `tithing` | Nehemiah 13:10-12 | “Then all Judah brought the tithe of the grain, the new wine, and the oil to the treasuries.” (13:12) | w0.55 — withheld tithes and their restoration; kin to the pack's Malachi 3:8-10 register.
   - `the-house-of-god` | Nehemiah 13:11 | “Why is God’s house forsaken?” | w0.6 — a quotable question phrase for the pack's neglect register (Haggai 1 sibling).
   - `providence` | Nehemiah 13:2 | “however, our God turned the curse into a blessing” | w0.5 — one verse, but a strong phrase witness for the pack's God-overrules register (book doc motif 9's flag honored).
4. Lexicon candidates:
   - `prayer` | term: "remember me god" | queries: "remember me God", "does God remember what I do for him", "God remember my good deeds". The book doc's motif 1 records the gap explicitly: no "remember me" phrasing exists in the `prayer` lexicon; 13:14, 22, 31 (with 5:19) anchor it. The `remembered-*` packs are NT verse-memory concepts and are NOT the home (no read-back).
   - `providence` | term: "turned the curse into a blessing" | queries: "God turns curses into blessings", "God turned it for good", "when God reverses a curse". Anchored by 13:2.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING (8 tags) AND subdivided in the book doc (13:1-9; 13:10-14; 13:15-22; 13:23-31) — PER-VERSE REFINEMENT candidate on both grounds; the four sections partition the tag set naturally (each tag rests on a distinct section-scale movement, as the book doc's cap note records).
8. Decisions record: Application-pass and book-doc skips re-verified and upheld: `obedience-to-the-word` on 13:1-3 (three verses; Decisions #28); `oaths-and-vows` on 13:25 (one imposed-oath verse inside the confrontation; the book's oath anchor stands at ch 5); `idolatry` decline unchanged (no idol worship in the book's own time). `forgiveness-of-sins`/`mercy` on 13:22's “according to the greatness of your loving kindness” checked — one petition clause, carried by `prayer`. Roster routing: the intermarriage refs (13:23-27, with 10:30) are ROUTED to backlog: `unequally-yoked` (roster row 47, already carrying them via tag-gaps append 1q). The imprecatory prayers (13:29) stay reported-not-endorsed per book doc Decisions #3 — no tag rests on them beyond `prayer`'s reported-voice fence (Decisions #12). No drops.

---

## Book summary and survival audit — Nehemiah sweep complete (2026-08-26)

- Chapters swept: 13/13 against the full 239-pack engine library + the 161 §11.1 adopted
  display ids (canonical list /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md,
  received mid-sweep from the coordinator and used as the vocabulary reference; every
  non-engine id on this book's Tags lines — `confession-of-sin`, `opposition-to-gods-work`,
  `courage`, `unequally-yoked` — verified present there, exact spelling, engine-built: no).
- Applied-tag deltas: ADD 2 (Nehemiah 6: `slander-and-false-accusation`, `false-prophets`
  — both 239-library gains past the book doc's 131-id vintage); KEEP 47 (every existing
  tag re-cleared the presence bar); DROP 0.
- Anchor-extension candidates: 34 (ch 1: 3; ch 2: 2; ch 4: 3; ch 5: 4; ch 6: 2; ch 7: 1;
  ch 8: 3; ch 9: 7; ch 10: 2; ch 12: 3; ch 13: 4).
- Lexicon candidates: 9 (ch 2: 2; ch 4: 1; ch 5: 1; ch 6: 1; ch 8: 1; ch 12: 1; ch 13: 2),
  three carrying explicit cross-book coordination notes (Ezra "good hand" motif;
  1 Chronicles "worship music" flag; Deuteronomy "public reading" flag) and one an XOR
  caution ("watch and pray" owned by `pastoral-freedom-from-bondage`).
- New-concept candidates: 0 — every genuine Nehemiah theme has an engine home, an
  adopted-id home, or a corpus-blocked roster row.
- Decline-overturn proposals: 0 — all nine recorded Nehemiah declines re-checked and
  upheld; no new textual evidence found.
- Ceiling / refinement: hard ceiling (8 tags) hit at chs 9 and 13; book-doc-subdivided
  chs 2, 4, 5, 6, 7, 8, 10, 12, 13. PER-VERSE REFINEMENT candidates: chs 2, 4, 5, 6, 7,
  8, 9, 10, 12, 13 (ten chapters; ch 9 by ceiling, the rest by subdivision, ch 13 by both).
- Corpus-blocked backlog routings (route, don't duplicate — 6 roster rows):
  `exile-and-captivity` row 45 (Neh 1:2-3; 7:6; 9:36-37); `opposition-to-gods-work`
  row 39 (Neh 2:10, 19; 4; 6); `courage` row 17 (Neh 6:9-13); `unequally-yoked` row 47
  (Neh 10:30; 13:23-27); `deliverance` row 32 (Neh 9:27-28); `sacrifice-and-atonement`
  row 1 (Neh 10:33, minor witness).
- tag-gaps.md: no appends made by this sweep — the book doc's 2026-08-23 finalize already
  landed Nehemiah's 20 ref-appends and the checked-and-declined record; this sweep found
  no NEW vocabulary gap beyond those (its new findings are anchor/lexicon candidates on
  live packs and two tag ADDs, none of which is a tag-gaps row).
- Quote verification: 163 word-for-word WEB spans in this ledger substring-verified
  byte-for-byte against the pinned VPL (engwebp_vpl.txt, contentSha256 944e3883…),
  including a fresh re-extraction after the shared-scratchpad clobber warning; 115
  quote-to-verse-ref pairings additionally verified against their cited verses; 0 failures.
- SURVIVAL AUDIT (CONVENTIONS §9): performed at delivery, immediately before this block —
  the live file re-read in full; sha256 of the live file equals the sha256 of the
  concatenation of this thread's four staged chunks (2c42df5b…), i.e. every prior byte
  is unchanged and nothing foreign was interleaved; all 13 chapter blocks present exactly
  once (grep "^## Nehemiah <n>" = one hit each, 13 total); all 6 backlog-routing notes
  present. Each of the three chapter-block appends also passed its own post-write check
  (prefix sha unchanged; appended bytes sha-identical to the staged chunk). This closing
  block is itself an atomic end-of-file append and is verified the same way after write.
