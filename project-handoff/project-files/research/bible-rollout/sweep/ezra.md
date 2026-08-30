# Ezra sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/, PLUS the §11.1 adopted
  display-tag vocabulary per the canonical list at
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, each
  marked engine-built yes/no). Every non-engine id used below is verified against that file
  and its list provenance is stated at each use.
- Book: Ezra (10 chapters; 280 WEB verses)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/ezra.md
    (FINAL 2026-08-23, 2 critic rounds; adopted-vocabulary application pass 2026-08-25 —
    its Decisions #26 is the freshest prior art re-judged here)
  - Briefing bundle (conventions-extract, concept-inventory, concept-ids, declines-and-contested,
    corpus-blocked-roster, book-docs-index, web-text-access, repo-state, plan-extract):
    /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/
  - Declines & contested calls: tag-gaps-review.md §3 + §1 as resolved by CONVENTIONS §11
    (Jesse's 2026-08-25 rulings applied, not re-litigated)
  - Corpus-blocked roster (route, don't duplicate): engine-pack-backlog.md, 50 rows
- WEB text: pinned VPL /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt,
  book code EZR (280 verse lines; manifest sha256 b6f55cc7…, contentSha256 944e3883…,
  re-admitted in PR #53 — the same text identity the fixture corpus is generated from).
  Every WEB quote below was verified byte-for-byte (substring match, curly punctuation
  preserved) against this file before append. Convention in this ledger: curly “…” spans are
  word-for-word WEB quotes; straight "…" spans are query phrasings, labels, or self-quotes.
- CORPUS STATUS (governs every engine-facing candidate below): the book of Ezra has ZERO
  verses in the current CI fixture corpus — re-verified mechanically for this ledger against
  pipeline/fixtures/web-subset.json at e762d1c (its only "Ezra" string matches are Nehemiah 8
  verses about Ezra the person). Therefore EVERY anchor-extension, lexicon, and new-concept
  candidate in this ledger is marked CORPUS-BLOCKED-UNTIL-EXPANSION: it rides the full-corpus
  expansion PR (PR-β, owned by another thread, currently blocked on the fixture-adjudication
  ruling packet) and cannot be built, asserted, or measured before that lands. Analysis and
  this ledger proceed in full regardless.
- Dormant existing anchors: three engine packs already carry Ezra anchors (declared but
  corpus-dormant until expansion): fasting — Ezra 8:21-23 (w0.7); appointed-feasts —
  Ezra 3:4-6 (w0.7); the-house-of-god — Ezra 3:8-11 (w0.7). Noted where relevant; no
  duplicate candidates are proposed for spans those anchors already cover.
- Ledger discipline: atomic end-of-file appends ONLY (chapter-block chunks), post-write
  verification after every append, final survival audit — CONVENTIONS §9 protocol applies
  to this file. This thread writes ONLY this file; no book doc, tag-gaps.md, or other shared
  file is touched.
- Legend (Torah-ledger precedent) — each chapter entry carries these sections, in order:
  1. "## Ezra <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term(s) | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield and every considered-and-not-added call — no silent drops, or "None.")

## Ezra 1

2. Existing tags (book doc): `providence`; `gods-faithfulness`; `generosity`; `restoration-of-israel`; `the-house-of-god`; `exile-and-captivity` — 6 (soft cap).
3. Applied-tag deltas:
   - KEEP `providence` — God governs the empire from the inside: “the LORD stirred up the spirit of Cyrus king of Persia” (1:1), and the returnees are “all whose spirit God had stirred” (1:5).
   - KEEP `gods-faithfulness` — the decree exists “that the LORD’s word by Jeremiah’s mouth might be accomplished” (1:1) — the promised return delivered.
   - KEEP `generosity` — the stay-behinds equip the goers: “strengthened their hands” with silver, gold, goods, animals, and precious things, “in addition to all that was willingly offered” (1:6; command at 1:4).
   - KEEP `restoration-of-israel` — the return's opening document: all whose spirit God stirred “rose up to build the LORD’s house which is in Jerusalem” (1:5; 1:1–5, 11).
   - KEEP `the-house-of-god` — the decree's whole object: “he has commanded me to build him a house in Jerusalem” (1:2), with the plundered vessels counted back (1:7–11).
   - KEEP `exile-and-captivity` — the captivity ends where the book begins: “when the captives were brought up from Babylon” (1:11). Provenance: §11.1 adopted display id (adopted-concepts.md, engine-built: no); corpus-blocked roster row 45, whose fold-vs-separate routing is reserved for Jesse — kept as prior-art display tag, nothing prejudged.
   - ADD none; DROP none — full 239-id re-check found no further concept whose teaching substance this chapter depicts.
4. Anchor-extension candidates (all CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `providence` | Ezra 1:1 | “the LORD stirred up the spirit of Cyrus king of Persia” | w0.75 — the OT's plainest God-moves-an-emperor narrative statement; sibling of the pack's Esther 4:14 anchor.
   - `gods-faithfulness` | Ezra 1:1 | “that the LORD’s word by Jeremiah’s mouth might be accomplished” | w0.6 — promise-kept register.
   - `restoration-of-israel` | Ezra 1:1-5 | “rose up to build the LORD’s house which is in Jerusalem” (1:5) | w0.6 — the return narrated; the pack currently has no post-exilic narrative anchor.
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION; fixture-first at PR-β):
   - `providence` | terms: "god turned the king's heart"; "god stirred up the spirit" | queries: "God changed the king's heart", "does God control kings and rulers", "God stirred his spirit" — no "heart of the king" or "stirred" phrasing exists in any current lexicon (verified against the 239-pack inventory); kin note: the praying-for-leaders backlog already names Prov 21:1 as a missing anchor.
6. New-concept candidates: None. (The exile theme is rostered — routed to backlog: exile-and-captivity, roster row 45.)
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 6 tags (soft cap hit, ceiling not); NOT subdivided in the book doc (kept whole, its Decisions #20); no per-verse refinement flag.
9. Decisions record: No §11.6 yields. Considered and not added: `worship` (vessels and proclamation, no worship practice depicted); `covenant` (a promise kept is carried by `gods-faithfulness`; no covenant is made or taught in-chapter).

## Ezra 2

2. Existing tags (book doc): `generosity`; `priesthood` — 2.
3. Applied-tag deltas:
   - KEEP `generosity` — freewill giving at the ruined site: “offered willingly for God’s house to set it up in its place” (2:68), “gave according to their ability into the treasury of the work” (2:69).
   - KEEP `priesthood` — the office's genealogical-qualification register: unproven priests “deemed disqualified and removed from the priesthood” (2:62), told to “not eat of the most holy things until a priest stood up to serve with Urim and with Thummim” (2:63). Engine id (239).
   - ADD none; DROP none — the muster list carries no other concept's teaching substance; honest-and-low is right for a census chapter.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `priesthood` | Ezra 2:61-63 | “deemed disqualified and removed from the priesthood” (2:62) | w0.5 — the genealogical-qualification register, present nowhere in the pack's establishment/high-priest anchors.
   - `generosity` | Ezra 2:68-69 | “offered willingly for God’s house to set it up in its place” (2:68) | w0.45.
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `priesthood` | term: "urim and thummim" | queries: "what are the Urim and Thummim", "Urim and Thummim in the Bible", "how did the high priest discern God's will" — a real lay search family with no current lexicon home; Ezra 2:63 is an honest anchor once assertable (Exod 28:30 / 1 Sam 28:6 are the cross-book kin, outside this ledger's scope).
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 2 tags; NOT subdivided (kept whole, book doc Decisions #20); none.
9. Decisions record: No yields. Re-checked and upheld from the book doc's 2026-08-25 pass: `exile-and-captivity` on 2:1 stays skipped (roster-heading mention, not the concept's substance); `restoration-of-israel` on 2:1 stays skipped (thin roster ref; home ch 1); `nations-and-peoples` not added (Israel's own muster is not the origin-of-nations register).

## Ezra 3 (subdivided: 3:1–7; 3:8–13)

2. Existing tags (book doc): `worship`; `praise`; `thanksgiving`; `obedience-to-the-word`; `appointed-feasts`; `the-house-of-god` — 6 (soft cap).
3. Applied-tag deltas:
   - KEEP `worship` — the altar rebuilt and Israel's sacrificial worship restored: “built the altar of the God of Israel” (3:2), offerings morning and evening (3:3–6), and the foundation celebrated “to praise the LORD, according to the directions of David king of Israel” (3:10).
   - KEEP `praise` — “All the people shouted with a great shout, when they praised the LORD” (3:11).
   - KEEP `thanksgiving` — the formula sung to one another: “praising and giving thanks to the LORD” (3:11), “For he is good, for his loving kindness endures forever toward Israel.” (3:11).
   - KEEP `obedience-to-the-word` — every restored step measured against the written standard: “as it is written in the law of Moses the man of God” (3:2), “as it is written” (3:4).
   - KEEP `appointed-feasts` — the calendar restored as a system: “They kept the feast of booths, as it is written” (3:4) and “all the set feasts of the LORD” (3:5). Engine pack already anchors Ezra 3:4-6 (w0.7, dormant).
   - KEEP `the-house-of-god` — “When the builders laid the foundation of the LORD’s temple” (3:10), cedar and masons funded (3:7–9). Engine pack already anchors Ezra 3:8-11 (w0.7, dormant).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `thanksgiving` | Ezra 3:11 | “For he is good, for his loving kindness endures forever toward Israel.” | w0.7 — the give-thanks refrain in narrative use; the pack has no OT-narrative witness of the formula.
   - `praise` | Ezra 3:10-11 | “All the people shouted with a great shout, when they praised the LORD” | w0.6.
   - (No candidates for `appointed-feasts` / `the-house-of-god` — their existing dormant anchors already cover the honest spans.)
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `thanksgiving` | term: "his loving kindness endures forever" (WEB wording, PD-safe) | queries: "give thanks to the Lord for he is good", "his love endures forever", "God is good his love endures" — NOTE: "his love endures forever" is the NIV-remembered form; plan §6 decision #5's default is PD-wording-only until Jesse rules, so the remembered form is recorded here as gated, not presumed.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 6 tags (soft cap hit); SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Considered and not added: `fear-not` — fear is named (“In spite of their fear because of the peoples of the surrounding lands”, 3:3) and answered by action, but no divine fear-not word is spoken; the chapter depicts courage under fear, not the concept's comfort substance (Genesis-3 rule); `pastoral-grief-and-loss` on 3:12–13 — barred by the pastoral-register ruling (national ceremony, not personal crisis; book doc motif 4 already records the weighing); `opposition-to-gods-work` thin witness 3:3 — home stays ch 4 (book-doc skip upheld).

## Ezra 4 (subdivided: 4:1–5; 4:6–16; 4:17–24)

2. Existing tags (book doc): `opposition-to-gods-work` — 1.
3. Applied-tag deltas:
   - KEEP `opposition-to-gods-work` — the paradigm chapter the concept was minted from: adversaries “weakened the hands of the people of Judah, and troubled them in building” (4:4), “hired counselors against them to frustrate their purpose” (4:5), and “made them to cease by force of arms” (4:23) — “Then work stopped on God’s house which is at Jerusalem.” (4:24). Provenance: §11.1 adopted display id (adopted-concepts.md, engine-built: no); corpus-blocked roster row 39 (Ezra absent from corpus is that row's own recorded reason). (Only one honest tag; zero ENGINE-vocabulary ids are genuinely present — consistent with the book doc's original honest-and-empty finding, Decisions #6, plus the 2026-08-25 adopted-row application.)
   - ADD none; DROP none.
4. Anchor-extension candidates: None — the concept has no engine pack to extend; routed to backlog: opposition-to-gods-work (roster row 39; Ezra 4:1–5, 23–24 are the row's founding refs, already recorded there).
5. Lexicon candidates: None.
6. New-concept candidates: None (the chapter's theme is the rostered concept — see the routing in item 4).
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 1 tag; SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Full-library re-check confirms the book doc's honest-and-empty reasoning against engine ids: `do-not-lose-heart` (the chapter depicts the failure mode — the hands ARE weakened); `gods-protection` (the work is stopped, not protected; protection is ch. 5's story); `honesty` / `slander-and-false-accusation` (the letter's charges are civic, addressed to a king, and 4:19's record search finds past rebellion real — not the personal false-accusation register); `governing-authorities` (imperial power halting the work is not the submit-honor-pray substance).

## Ezra 5 (subdivided: 5:1–5; 5:6–17)

2. Existing tags (book doc): `gods-protection`; `obedience-to-the-word`; `revival-and-reformation`; `the-house-of-god` — 4.
3. Applied-tag deltas:
   - KEEP `gods-protection` — narrated divine keeping under inspection: “But the eye of their God was on the elders of the Jews, and they didn’t make them cease” (5:5).
   - KEEP `obedience-to-the-word` — prophecy “in the name of the God of Israel” (5:1) heard and acted on at once: the leaders “rose up and began to build God’s house” (5:2). The book doc's own thinness note (Decisions #8: two verses, drop-first if judged too thin) is re-recorded, not resolved — kept as prior art.
   - KEEP `revival-and-reformation` — the stopped work revived at the prophets' word, “the prophets of God, helping them” (5:2).
   - KEEP `the-house-of-god` — the house is the whole matter under inquiry: “Who gave you a decree to build this house and to finish this wall?” (5:3), answered by “We are the servants of the God of heaven and earth” (5:11).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `revival-and-reformation` | Ezra 5:1-2 | “rose up and began to build God’s house” | w0.6 — the prophets-restart-the-work register; siblings of the pack's Neh 8 / 2 Kgs 23 anchors, and the narrative referent of its Haggai material.
   - `gods-protection` | Ezra 5:5 | “the eye of their God was on the elders of the Jews” | w0.5 — narrated protection (Genesis-pilot precedent: Gen 7's “the LORD shut him in” accepted narrated keeping; book doc Decisions #9).
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `gods-protection` | term: "God's eye on his people" | queries: "God is watching over me", "God's eye is on me", "God watched over them" — no eye-of-God phrasing in any current lexicon.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 4 tags; SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Considered and not added: `witness-testimony` (5:11's confession answers a building-permit inquiry; the pack is the John-register testimony to Jesus — wrong register and a read-back besides); `opposition-to-gods-work` thin witness 5:3 (challenge does not stop the work; home ch 4 — book-doc skip upheld).

## Ezra 6 (subdivided: 6:1–12; 6:13–18; 6:19–22)

2. Existing tags (book doc): `providence`; `joy-in-the-lord`; `worship`; `praying-for-leaders`; `the-house-of-god`; `passover`; `revival-and-reformation` — 7 (above soft cap 6, within hard ceiling 8; the book doc's Decisions #26 cap note stands).
3. Applied-tag deltas:
   - KEEP `providence` — the narrator's closing verdict: the LORD “had turned the heart of the king of Assyria to them, to strengthen their hands in the work of God” (6:22).
   - KEEP `joy-in-the-lord` — joy named and sourced: “kept the dedication of this house of God with joy” (6:16), “because the LORD had made them joyful” (6:22).
   - KEEP `worship` — dedication offerings (6:17) and ordered service: “They set the priests in their divisions and the Levites in their courses” (6:18), “as it is written in the book of Moses” (6:18).
   - KEEP `praying-for-leaders` — the restored temple's service includes prayer for the ruler: sacrifices offered that they may “pray for the life of the king and of his sons” (6:10). Book doc Decisions #7's borderline/drop-first note re-recorded, kept as honest presence.
   - KEEP `the-house-of-god` — the found decree's words “let the house be built” (6:3) carried through: “This house was finished on the third day of the month Adar” (6:15).
   - KEEP `passover` — post-exile Passover in the finished temple's first year: “The children of the captivity kept the Passover on the fourteenth day of the first month.” (6:19), with seven days of unleavened bread (6:22).
   - KEEP `revival-and-reformation` — the revived work carried to completion: “The elders of the Jews built and prospered, through the prophesying of Haggai the prophet and Zechariah” (6:14).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `providence` | Ezra 6:22 | “had turned the heart of the king of Assyria to them” | w0.65 — second witness of the ch-1 stirred-spirit register.
   - `passover` | Ezra 6:19-22 | “The children of the captivity kept the Passover on the fourteenth day of the first month.” | w0.6 — the pack has no post-exilic narrative witness.
   - `joy-in-the-lord` | Ezra 6:22 | “because the LORD had made them joyful” | w0.6 — God-sourced joy stated in so many words.
   - `praying-for-leaders` | Ezra 6:10 | “pray for the life of the king and of his sons” | w0.55 — an OT witness for a pack whose anchors are Jer 29:7 + NT.
5. Lexicon candidates: None new — the "God turned the king's heart" family is proposed at ch 1 (`providence`); 6:22 is its second in-book witness, recorded there.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 7 tags — ABOVE SOFT CAP (hard ceiling not hit); SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate (dense chapter on both counts).
9. Decisions record: No §11.6 yields required (7 ≤ 8). Considered and not added: `gods-faithfulness` (the completion fulfils ch 1's promise, but in-chapter the divine action is carried by `providence`; adding at above-cap density would be broad-duplicating-specific); `exile-and-captivity` on 6:19–21 (book-doc skip upheld — community-name mentions inside the Passover narrative the `passover` tag carries); `thanksgiving` (celebration present, formula absent — ch 3 carries the honest instance).

## Ezra 7 (subdivided: 7:1–10; 7:11–26; 7:27–28)

2. Existing tags (book doc): `studying-the-word`; `providence`; `praise`; `governing-authorities`; `the-house-of-god` — 5.
3. Applied-tag deltas:
   - KEEP `studying-the-word` — the book's defining portrait of a life ordered around Scripture: “For Ezra had set his heart to seek the LORD’s law, and to do it, and to teach statutes and ordinances in Israel.” (7:10); “a skilled scribe in the law of Moses” (7:6).
   - KEEP `providence` — the cause behind the royal generosity, named twice: “according to the good hand of his God on him” (7:9) and “who has put such a thing as this in the king’s heart” (7:27).
   - KEEP `praise` — Ezra blesses God: “Blessed be the LORD, the God of our fathers” (7:27).
   - KEEP `governing-authorities` — divine and civil authority side by side in the commission: judgment on whoever will not do “the law of your God and the law of the king” (7:26) — the book doc's modest-confidence flag stands.
   - KEEP `the-house-of-god` — the commission's object: God moved the king “to beautify the LORD’s house which is in Jerusalem” (7:27; treasure and exemptions 7:15–24).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `studying-the-word` | Ezra 7:10 | “For Ezra had set his heart to seek the LORD’s law, and to do it, and to teach statutes and ordinances in Israel.” | w0.85 — flagged as this book's strongest single engine-facing candidate: a classic devoted-to-Scripture verse (seek / do / teach) for a pack whose anchors are all NT + Psalms.
   - `providence` | Ezra 7:27 | “who has put such a thing as this in the king’s heart” | w0.6.
   - `governing-authorities` | Ezra 7:26 | “the law of your God and the law of the king” | w0.45 — modest confidence, matching the display tag's own caveat.
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `providence` | terms: "the good hand of God"; "God's hand on my life" | queries: "God's hand on my life", "the good hand of God on me", "God's favor on a journey" — book-doc motif 1; re-verified: no hand-of-God phrasing in any of the 239 lexicons.
   - `studying-the-word` | term: "set your heart to study God's word" | queries: "set my heart to study the Bible", "devoted to God's word like Ezra", "Ezra 7:10 meaning".
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 5 tags; SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Considered and not added: `wisdom-from-god` (7:25's “according to the wisdom of your God that is in your hand” is one clause inside the commission — below the bar); `benediction` re-checked and the book doc's Decisions #1 drop upheld (7:27 is doxology TO God; the pack's register is blessing pronounced over people — `praise` carries the verse honestly); `generosity` (the king's freely-offered treasure is royal provision, not giver's-heart teaching).

## Ezra 8 (subdivided: 8:1–20; 8:21–23; 8:24–36)

2. Existing tags (book doc): `prayer`; `trust-in-god`; `gods-protection`; `fasting`; `deliverance` — 5.
3. Applied-tag deltas:
   - KEEP `prayer` — corporate petition before a dangerous road, and the answer recorded: “So we fasted and begged our God for this, and he granted our request.” (8:23).
   - KEEP `trust-in-god` — trust staked at cost: having told the king “The hand of our God is on all those who seek him, for good” (8:22), Ezra is ashamed to hedge the testimony with an escort.
   - KEEP `gods-protection` — protection sought “to seek from him a straight way for us, for our little ones, and for all our possessions” (8:21) and granted: “he delivered us from the hand of the enemy and the bandits by the way” (8:31).
   - KEEP `fasting` — the practice proclaimed and answered: “Then I proclaimed a fast there at the river Ahava” (8:21). Engine id; the pack ALREADY anchors Ezra 8:21-23 (w0.7, dormant until expansion).
   - KEEP `deliverance` — the plain rescue register: “he delivered us from the hand of the enemy and the bandits by the way” (8:31). Provenance: §11.1 adopted display id (adopted-concepts.md, engine-built: no); corpus-blocked roster row 32, whose recorded refs include Ezra 8 — kept as display tag; engine-side routed to backlog: deliverance (roster row 32).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `trust-in-god` | Ezra 8:22 | “The hand of our God is on all those who seek him, for good” | w0.6 — trust enacted at cost, a narrative anchor for a proverb-heavy pack.
   - `gods-protection` | Ezra 8:31 | “he delivered us from the hand of the enemy and the bandits by the way” | w0.6 — journey-protection register (the pack's lexicon already carries "safe travel; traveling mercies" with no journey-narrative anchor).
   - `trusting-in-man` | Ezra 8:22 | “I was ashamed to ask of the king a band of soldiers and horsemen” | w0.5 — the inverse enactment of the pack's do-not-trust-horses-and-chariots register (Ps 33:16-17 / Isa 31:1 kin). NOT proposed as a display tag: the chapter depicts the positive counterpart, already tagged `trust-in-god`.
   - (No new `fasting` candidate — its existing dormant anchor already covers 8:21-23.)
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `fasting` | terms: "proclaim a fast"; "fasting for protection" | queries: "proclaiming a corporate fast", "fasting and prayer for protection", "fasting before a journey".
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 5 tags; SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Re-checked and upheld from book doc Decisions #19: `holiness` (8:28's consecration statement is one verse, not the chapter's substance); `worship` (8:35's arrival offerings, two verses); `guidance` (8:21's “a straight way” is a route-and-safety petition, not the decision-guidance register). Also considered: `priesthood` (8:24–30's consecrated carriers is a scene of the office at work, not its teaching substance — not added).

## Ezra 9 (subdivided: 9:1–4; 9:5–15)

2. Existing tags (book doc): `prayer`; `sin`; `gods-faithfulness`; `confession-of-sin`; `remnant`; `unequally-yoked` — 6 (soft cap).
3. Applied-tag deltas:
   - KEEP `prayer` — the kneeling public confession: “I fell on my knees, and spread out my hands to the LORD my God” (9:5), prayed while “everyone who trembled at the words of the God of Israel” gathers (9:4).
   - KEEP `sin` — guilt diagnosed and owned: “our iniquities have increased over our head, and our guiltiness has grown up to the heavens” (9:6), exile read as its wage (9:7, 13).
   - KEEP `gods-faithfulness` — grace that outran the guilt: “our God has not forsaken us in our bondage, but has extended loving kindness to us” (9:9).
   - KEEP `confession-of-sin` — the OT's paradigm corporate confession: “I am ashamed and blush to lift up my face to you” (9:6). Provenance: §11.1 adopted display id (adopted-concepts.md, engine-built: no; not on the corpus-blocked roster) — engine-side its query family already lives in `forgiveness-of-sins`' lexicon ("confess your sins; confession of sin"); kept as display tag with that note.
   - KEEP `remnant` — the phrase witness prayed by the survivors it names: “to leave us a remnant to escape” (9:8), “we are left a remnant that has escaped” (9:15).
   - KEEP `unequally-yoked` — the covenant-separation crisis: leaders “have not separated themselves from the peoples of the lands” (9:1), “so that the holy offspring have mixed themselves with the peoples of the lands” (9:2). Provenance: §11.1 adopted display id (adopted-concepts.md, engine-built: no); corpus-blocked roster row 47 (its recorded refs include these verses); the register caveat is carried unchanged — covenant-national background text, never a direct template for the modern marrying-a-non-believer question. Engine-side routed to backlog: unequally-yoked (roster row 47).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `remnant` | Ezra 9:8 | “to leave us a remnant to escape” | w0.65 (second in-chapter witness 9:15) — the pack has no post-exilic prayed-by-the-remnant witness.
   - `slow-to-anger` | Ezra 9:13 | “have punished us less than our iniquities deserve” | w0.5 — the pack's God's-patience register (Neh 9:17 is already its anchor; Ezra 9:13 is the sibling text).
   - `forgiveness-of-sins` | Ezra 9:6 | “our iniquities have increased over our head, and our guiltiness has grown up to the heavens” | w0.45 — the confession facet that pack's lexicon already claims ("confession of sin"); this is the engine home of the `confession-of-sin` display id, so the candidate and the display tag should be decided together at curation.
5. Lexicon candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `slow-to-anger` | term: "punished less than we deserve" | queries: "does God punish us less than we deserve", "God's mercy in judgment", "God has been patient with us" — book-doc motif 12; no such phrasing in any current lexicon.
   - `obedience-to-the-word` | term: "tremble at God's word" | queries: "tremble at his word", "what does it mean to tremble at God's word", "taking God's word seriously" — anchored in-chapter by “everyone who trembled at the words of the God of Israel” (9:4); kin text Isa 66:2 (outside this book, noted only).
6. New-concept candidates: None.
7. Decline-overturn proposals: None — Ezra's own recorded declines re-checked against the full 239-id library and upheld: `justice-and-oppression` (still nothing referenced — no oppression-of-the-poor or corrupt-courts theme; 9:8–9's bondage language is covenant-history recital inside a confession); `lament` (9:3–5 is penitential grief over sin, not the complaint-to-God register — decline stands); `idolatry` (the “abominations” are the peoples' practices motivating separation; no Israelite idol worship depicted — stands).
8. Ceiling / refinement flags: 6 tags (soft cap hit); SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. Considered and not added: `mercy` (9:8, 13 carry real grace-in-judgment language, but at cap the register is honestly held by `gods-faithfulness` plus the `slow-to-anger` candidates above — adding the broad id would be broad-duplicating-specific); `shame` (9:6's shame is guilt owned before God, carried by `sin`/`confession-of-sin`; the pack is the shame-lifted register, Isa 54:4); `repentance` deliberately NOT added — the book doc's Decisions #5 split stands (ch 9 is confession without yet the turning; ch 10 carries `repentance`); `sojourners-and-strangers` (the returnees are home, not sojourning; “we are bondservants” (9:9) is history recital — and the exile-routing question is Jesse-gated at roster row 45, nothing prejudged).

## Ezra 10 (subdivided: 10:1–5; 10:6–17; 10:18–44)

2. Existing tags (book doc): `repentance`; `covenant`; `confession-of-sin`; `oaths-and-vows`; `unequally-yoked`; `revival-and-reformation` — 6 (soft cap).
3. Applied-tag deltas:
   - KEEP `repentance` — the narrated arc of confession and turning: “make confession to the LORD, the God of your fathers and do his pleasure. Separate yourselves” (10:11), answered “We must do as you have said concerning us.” (10:12) and carried through (10:16–17). The book doc's fence stands verbatim in spirit: the tag marks the arc as the text tells it, not a verdict on the remedy (Decisions #4).
   - KEEP `covenant` — solemnly made and sworn: “let’s make a covenant with our God” (10:3).
   - KEEP `confession-of-sin` — enacted corporately: “Now while Ezra prayed and made confession, weeping and casting himself down before God’s house” (10:1). Provenance as at ch 9 (§11.1 adopted display id, engine-built: no).
   - KEEP `oaths-and-vows` — oath-taking as the binding mechanism: Ezra “made the chiefs of the priests, the Levites, and all Israel to swear that they would do according to this word. So they swore.” (10:5); “They gave their hand that they would put away their wives” (10:19).
   - KEEP `unequally-yoked` — the crisis named and its remedy narrated: “We have trespassed against our God, and have married foreign women of the peoples of the land. Yet now there is hope for Israel concerning this thing.” (10:2) — narrated, not prescribed; register caveat carried as at ch 9. Provenance: §11.1 adopted display id; roster row 47; engine-side routed to backlog: unequally-yoked (roster row 47).
   - KEEP `revival-and-reformation` — community reform carried to completion: “The children of the captivity did so.” (10:16), finished by “the first day of the first month” (10:17).
   - ADD none; DROP none.
4. Anchor-extension candidates (CORPUS-BLOCKED-UNTIL-EXPANSION):
   - `oaths-and-vows` | Ezra 10:5 | “made the chiefs of the priests, the Levites, and all Israel to swear that they would do according to this word. So they swore.” | w0.5 — a narrative oath-in-force witness for a pack whose anchors are teaching texts.
   - `repentance` | Ezra 10:11 | “make confession to the LORD, the God of your fathers and do his pleasure. Separate yourselves” | w0.45 — CAVEAT carried into any pack note: the anchor marks confession-and-turning language only, not an endorsement of the chapter's remedy (covenant #6, no theology adjudication; book doc Decisions #3–4 fence).
5. Lexicon candidates: None.
6. New-concept candidates: None.
7. Decline-overturn proposals: None.
8. Ceiling / refinement flags: 6 tags (soft cap hit); SUBDIVIDED in book doc → PER-VERSE REFINEMENT candidate.
9. Decisions record: No yields. `covenant` anchor-extension considered and NOT proposed — the engine pack collects God's covenant promises (Jer 31, Gen 15/17, 2 Sam 7, Luke 22); 10:3 is a communal pledge before God, whose engine-facing home is the `oaths-and-vows` candidate above (register mismatch recorded). `courage` checked — 10:4's “Be courageous, and do it.” is a single clause, below the presence bar as a tag; recorded as routed to backlog: courage (roster row 17) as a thin additional witness only (that row's case is Esther/Nehemiah). Pastoral-register ruling re-confirmed: no `pastoral-marriage-divorce-teaching` / `pastoral-betrayal-and-marriage-crisis` on this national proceeding (book doc Decisions #2 stands; tagging either would route a present-day marriage crisis to a national covenant proceeding).

---

# Sweep summary — Ezra (10/10 chapters)

- Applied-tag deltas: **0 ADD / 48 KEEP / 0 DROP** (per chapter: 6, 2, 6, 1, 4, 7, 5, 5, 6, 6).
  Honest finding: ezra.md is the freshest prior art in the history group (FINAL 2026-08-23,
  two critic rounds, plus the 2026-08-25 adopted-vocabulary application pass with its own
  missing-tag sweep) — re-judging every chapter against the full 239-id engine library plus
  the canonical §11.1 adopted list produced no honest add and no drop. Non-engine ids in use
  (all verified against tag-apply/adopted-concepts.md, engine-built: no): `exile-and-captivity`
  (ch 1), `opposition-to-gods-work` (ch 4), `deliverance` (ch 8), `confession-of-sin`
  (chs 9–10), `unequally-yoked` (chs 9–10).
- Anchor-extension candidates: **24**, every one CORPUS-BLOCKED-UNTIL-EXPANSION (Ezra has zero
  CI-corpus verses; all ride PR-β). Highest-value flag: `studying-the-word` | Ezra 7:10 | w0.85.
- Lexicon candidates: **9** (providence ×2, priesthood, thanksgiving, gods-protection,
  studying-the-word, fasting, slow-to-anger, obedience-to-the-word), all
  CORPUS-BLOCKED-UNTIL-EXPANSION; one carries the plan §6 decision #5 PD-only gate note
  (NIV-remembered "his love endures forever").
- New-concept candidates: **0** — every would-be candidate has an existing home or is rostered.
- Decline-overturn proposals: **0** — Ezra's recorded declines (justice-and-oppression, lament,
  idolatry) re-checked against the full library and upheld; no new textual evidence found.
- Backlog routings (route, don't duplicate): **6 routing notes / 5 distinct roster ids** —
  exile-and-captivity (row 45, ch 1; Jesse-gated routing untouched), opposition-to-gods-work
  (row 39, ch 4), deliverance (row 32, ch 8), unequally-yoked (row 47, chs 9 and 10),
  courage (row 17, ch 10 — thin-witness note only).
- Ceiling / per-verse refinement candidates: **chapters 3, 4, 5, 6, 7, 8, 9, 10** (all
  subdivided in the book doc; chapters 1–2 kept whole there). Chapter 6 additionally sits
  above the soft cap at 7 tags (hard ceiling 8 never hit; zero §11.6 yields anywhere).
- tag-gaps.md: **no append made** — no new vocabulary gap found (every genuine theme has an
  engine home, an adopted-list home, or a live roster/log row); per CONVENTIONS §9 this is
  recorded here rather than by touching the shared file.

# Survival audit (CONVENTIONS §9, final delivery)

- Every append above was an atomic end-of-file append; after each, the pre-append prefix was
  re-hashed (sha256 over the recorded byte length) and verified unchanged, and the appended
  bytes were diffed against the source block — all six appends verified clean at write time.
- Final re-read of the whole live file: byte-identical to the concatenation of the six source
  blocks (full-file diff, zero differences); all 10 "## Ezra <n>" chapter blocks present
  exactly once; prior bytes unchanged through every append.
- Live-file quote audit: 106 curly-quoted spans extracted from the file as written; 105 are
  word-for-word substrings of the pinned VPL (engwebp_vpl.txt — includes the one deliberate
  cross-book citation, Gen 7:16 “the LORD shut him in”); the single non-matching span is the
  header's own "“…”" notation-convention example, which quotes nothing. Zero scripture-quote
  failures.
- File state at audit: 35,582 bytes before this final block,
  sha256 3a26f3f2ec1d029226b9206b082d8213c581d0e44a13b75b7c5cbc1979a92994.
- AUDIT RESULT: **PASS** — all contributions survive, no clobbers observed, no shared file
  other than this ledger was written.
