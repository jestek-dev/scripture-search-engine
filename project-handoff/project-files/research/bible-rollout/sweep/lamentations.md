# Lamentations sweep ledger — Layer-3 tag sweep (Isaiah–Daniel thread)

- Book: Lamentations (chapters 1–5, complete)
- Sweep thread: Isaiah–Daniel group (Major Prophets), Layer 3 of the whole-Bible coverage
  plan (§5.2 template); display/research-layer only — no engine changes, no repo changes,
  no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e (pinned)
- Date: 2026-08-26
- Sources: engine concept inventory at the pinned SHA (239 ids; scratchpad
  concept-inventory.md census) + canonical adopted display-tag list
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids,
  CONVENTIONS §11.1, 2026-08-26 addendum).
- Book doc (prior art): /mnt/project-files/research/bible-rollout/lamentations.md
  (APPROVED, critic loop closed R5; 2026-08-25 tag-application pass included).
- Drafted by the chunk worker (sweep-chunks/lamentations-01-05.md, all 5 chapters);
  independently re-verified mechanically at assembly (results below).
- Vocabulary note: all tag ids below are exact ids from the 239-pack engine inventory
  (concept-inventory.md) except `pastoral-hope-in-despair` and `pastoral-god-sees-my-suffering`.
  Checked against the canonical §11.1 adopted list (scratchpad
  adopted-concepts-canonical.md, mirroring
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md, 161 ids): neither
  pastoral- id appears there, and neither is in the 239 under that exact name. They are
  PRIOR-ART display ids from the 131-id vocabulary era (commit b3f491d, project-wide rollout
  ruling per tag-gaps-review §1(d)), standing on this book doc's ch 3 `**Tags:**` line since
  2026-08-23; this chunk only KEEPs them (no new use), and their engine counterparts
  `hope-in-despair` and `god-sees-my-suffering` exist unprefixed in the 239. Flagged for the
  assembly pass's id re-verification. Anchor/lexicon candidates below always name the
  ENGINE id.
- WEB text: web-text/lamentations/1–5.txt (verse-per-line, pinned source sha256 b6f55cc7…);
  every quote below verified byte-for-byte against those files.

## Assembly verification (2026-08-26, mechanical, scripted)

- Chapter entries: all 5 present, in canonical order; every entry carries the Torah-ledger
  legend sections in order (Existing tags → Applied-tag deltas → Anchor-extension candidates
  → Lexicon candidates → New-concept candidates → Decline-overturn proposals → Ceiling /
  refinement flags → Decisions record), with a "Routed to corpus-blocked backlog" section on
  chapters 1 and 3 per the route-don't-duplicate rule.
- WEB quotes: 68 WEB-attributed quotes checked byte-for-byte against
  web-text/lamentations/<N>.txt (split from the pinned source, sha256 b6f55cc7…): 68/68
  exact — 67 inside their own chapter file; 1 (the "bear lying in wait" quote in the
  chapter-2 entry's new-concept candidate) is cited as Lam 3:10 and matches 3.txt verbatim.
  The other 39 double-quoted strings in the entries are query phrasings, pack-lexicon terms,
  or document citations — none WEB-attributed; the roster quote "to be settled across both
  rows together" was verified verbatim against corpus-blocked roster row 10.
- Concept ids: 35 distinct backticked ids; 0 unresolvable. 31 resolve exactly against the
  239-id engine inventory (YAML `id:` census) and/or the 161-id canonical adopted list.
  3 are pastoral-prefixed ids that resolve against pack FILENAMES under
  `ontology/concepts/` in the repo at the pinned SHA (verified present at e762d1c):
  `pastoral-hope-in-despair` and `pastoral-god-sees-my-suffering` (KEEP-only, verified
  verbatim on the book doc's chapter-3 `**Tags:**` line) and
  `pastoral-near-to-the-brokenhearted` (citation of the book doc's Decisions #6 yield,
  verified verbatim there). Per the coordinator's 2026-08-26 vocabulary ruling, the
  pastoral packs carry unprefixed YAML `id:` fields (`hope-in-despair`,
  `god-sees-my-suffering`, `near-to-the-brokenhearted` — confirmed in the three files),
  while the prefixed FILENAME form is canonical for ledgers per CONVENTIONS §5 ("never
  strip a prefix"). The chunk's vocabulary note above — accurate against the yaml-id
  census and the adopted list, and its prior-art/KEEP-only sourcing verified against the
  book doc — is therefore superseded on one point: these are not legacy-era-only ids but
  canonical prefixed forms of live engine packs; they are deliberately NOT normalized in
  either direction. The 1 remaining id, `when-god-feels-against-you`, is an explicitly
  labeled check-first new-concept candidate.
- Prior-art cross-check: the "Existing tags (book doc)" list of every chapter matches the
  book doc's `**Tags:**` line exactly (6/4/8/4/4 tags); the chapter-3 standing yields
  (`prayer` + `pastoral-near-to-the-brokenhearted`, Decisions #6; `unanswered-prayer`,
  Decisions #14 with refs 3:8, 3:44 and the flag for Jesse) match the book doc's Decisions
  record.
- Engine-data claims: every "already engine data at this SHA" anchor claim and every
  pack-lexicon claim in the entries was re-verified against the inventory (unanswered-prayer
  Lam 3:8 w=0.9 / 3:44 w=0.8; gods-faithfulness Lam 3:22-23 w=1.0 + both hymn phrases;
  hope-in-despair Lam 3:21-23 w=0.85; trust-in-god Lam 3:25-26 w=0.65; providence
  Lam 3:37-38 w=0.8; lament Lam 3:19-20 w=1.0 + Lam 1:12 w=0.7 + "pour out your heart to
  god"; vengeance Lam 3:64-66 w=0.75; divine-judgment "gods wrath"; restoration
  "restore me | renew me"; wrestling-with-god "when god is silent" / "how long o lord";
  god-of-all-comfort's four-term lexicon without the negative phrasing): 0 mismatches.
- Counts: ADD 1 / KEEP 26 / DROP 0; new-concept candidates 1; decline-overturn proposals 0;
  corpus-blocked routings 2; chapter-3 already-engine-data notes 7 — all confirmed by
  recount. Two totals in the chunk draft failed recount and are corrected in the totals
  section below, marked "[Assembly correction 2026-08-26: …]": anchor-extension candidates
  16 proposed (draft said 13), lexicon candidates 5 (draft said 6).
- No substantive defect found: no composed quote, no unresolvable id, no missing chapter.

---

## Lamentations 1

**Existing tags (book doc):** `sin`, `divine-judgment`, `loneliness`, `lament`,
`sojourners-and-strangers`, `vengeance` — 6 tags (soft cap reached).

**Applied-tag deltas:** No changes — all six existing tags re-verified against the chapter
text and kept; no add clears the honest-substantial-presence bar without exceeding what the
chapter's main themes warrant.
- KEEP `sin` — the ruin is expressly traced to guilt: "Jerusalem has grievously sinned." (1:8); "the LORD has afflicted her for the multitude of her transgressions" (1:5).
- KEEP `divine-judgment` — the affliction is the LORD's own act "in the day of his fierce anger" (1:12; also 1:13–15, 17).
- KEEP `loneliness` — the comfortless-solitude refrain tolls through the poem: "There is no one to comfort her." (1:17; variations at 1:2, 9, 16, 21). Book-doc Decisions #4 caveat (personified city) stands.
- KEEP `lament` — the canonical opening city-lament: "How the city sits solitary, that was full of people!" (1:1), grief told whole before God across 1:1–22.
- KEEP `sojourners-and-strangers` — the exile register at the poem's head: "Judah has gone into captivity because of affliction and because of great servitude." (1:3). Standing routing: Lamentations exile texts ride the sojourners row, and the exile-vs-separate-id question is roster row 45 (see routing note below).
- KEEP `vengeance` — repayment left to God, never taken: "Do to them as you have done to me for all my transgressions." (1:22, with 1:21).
- Considered, not added: `betrayal` — "All her friends have dealt treacherously with her. They have become her enemies." (1:2) and 1:19 depict allies-turned-enemies, but the betrayed figure is the personified city and her political "lovers"; the chapter touches the topic without depicting the friend/kin betrayal substance the concept teaches. Carried below as a low-weight anchor-extension candidate instead of a seventh tag.
- Considered, not added: `god-of-all-comfort` — the chapter depicts the ABSENCE of comfort ("the comforter who should refresh my soul is far from me", 1:16); presence bar not met for the comfort concept itself. Carried as a lexicon candidate (the negative phrasing is how comfortless searchers phrase it).

**Anchor-extension candidates:**
- `lament` | Lam 1:1-2 | "How the city sits solitary, that was full of people!" | w=0.8 (pack already anchors Lam 1:12 at 0.7 and Lam 3:19-20 at 1.0; the book's signature opening is the stronger city-lament anchor).
- `betrayal` | Lam 1:2 | "All her friends have dealt treacherously with her. They have become her enemies." | w=0.55 — CAVEAT for curation: the betrayed figure is the personified city (political allies); reads honestly for "betrayed by a friend / friends turned on me" queries but is not personal-register narrative.
- `vengeance` | Lam 1:21-22 | "Let all their wickedness come before you. Do to them as you have done to me for all my transgressions." | w=0.55 (pack already anchors Lam 3:64-66 at 0.75; this is the communal parallel — modest weight).

**Lexicon candidates:**
- `god-of-all-comfort` | term: "no one to comfort me" | queries: "I have no one to comfort me", "no one comforts me", "feeling comfortless and alone". Evidence: the refrain at 1:2, 9, 16, 17, 21 ("There is no one to comfort me.", 1:21). The pack's lexicon (comfort | god of all comfort | comfort in hard times | comfort in affliction) does not carry the negative phrasing; this closes the book doc's standing extension-candidate check.

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Routed to corpus-blocked backlog:** exile/captivity anchor material (1:3; cf. 4:22) —
already on corpus-blocked roster, row 45 (`exile-and-captivity`, SKIPPED-blocked + Jesse's
fold-vs-separate call). Routed, not duplicated; the display-layer `sojourners-and-strangers`
routing above stands per the recorded Lamentations precedent (tag-gaps-review §1(e)).

**Ceiling / refinement flags:** none — soft cap 6 reached but not exceeded; hard ceiling not
hit; chapter not subdivided in the book doc.

**Decisions record:** None (no cap yields this pass).

## Lamentations 2

**Existing tags (book doc):** `divine-judgment`, `prayer`, `lament`, `false-prophets` — 4 tags.

**Applied-tag deltas:** No changes — all four existing tags re-verified and kept; no honest
add found.
- KEEP `divine-judgment` — the chapter's whole first movement: "The Lord has become as an enemy. He has swallowed up Israel." (2:5); "The LORD has done that which he planned. He has fulfilled his word that he commanded in the days of old." (2:17).
- KEEP `prayer` — the summons obeyed in the closing verses: "Pour out your heart like water before the face of the Lord." (2:19), then "Look, LORD, and see to whom you have done thus!" (2:20).
- KEEP `lament` — the second alphabet poem drives communal grief toward prayer (2:1–22; 2:18–19 is the pivot).
- KEEP `false-prophets` — the aftermath verdict: "Your prophets have seen false and foolish visions for you." (2:14).
- Considered, not added: `wrestling-with-god` — the accusatory questions of 2:20 are genuine protest-to-God, but they live inside the summoned prayer the chapter already carries under `prayer` + `lament`; adding it here would broad-duplicate those two tags on the same verses without distinct teaching substance. (Not a cap yield — the chapter is at 4 tags; this is a presence/duplication judgment.)
- Considered, not added: `gods-provision` — the starving-children material (2:11–12, 19–20) stays routed per the recorded Lamentations decline (famine/scarcity → the PR #41 `gods-provision` lexicon extension; declines §3.5); depiction of famine is not the provision concept's teaching substance.

**Anchor-extension candidates:**
- `divine-judgment` | Lam 2:1-5 | "In the tent of the daughter of Zion, he has poured out his wrath like fire." | w=0.7 — the wrath-of-God anchor the book doc's extension-candidates list pointed at; note the LEXICON side of that book-doc candidate is already served at this SHA ("gods wrath" is in divine-judgment's lexicon), so only the anchor remains live.
- `lament` | Lam 2:18-19 | "Pour out your heart like water before the face of the Lord." | w=0.8 — the OT text behind the pack's own lexicon phrase "pour out your heart to god" (currently anchored only via Ps 62:8).

**Lexicon candidates:** None — the book doc's "God's wrath / anger of God" extension
candidate is already covered ("gods wrath" present in `divine-judgment`'s lexicon at this
SHA); no other realistic query phrasing found unserved.

**New-concept candidates:**
- Proposed id `when-god-feels-against-you` (CHECK-FIRST: lexicon extension of `wrestling-with-god` before any mint) | rationale: "when it feels like God is against me" / "God has become my enemy" is a real pastoral query family no lexicon carries — `wrestling-with-god` has "angry at god / when god is silent", `hope-in-despair` the despair register, but nothing serves the God-as-adversary experience Lamentations states more starkly than any book. Anchors: Lam 2:4-5 — "He has bent his bow like an enemy." / "The Lord has become as an enemy. He has swallowed up Israel." — and Lam 3:10 — "He is to me as a bear lying in wait, as a lion in hiding." Queries: "when it feels like god is against me", "god has become my enemy", "why is god fighting against me". Gist caution carried from the book doc's motif note: needs careful wording — the poems present the enmity as experienced judgment, not as God's settled character (2:17 grounds it in his fulfilled word; 3:31-33 answers it). Elevates the book doc's "God as enemy" motif candidate to a ledger row; no decline covers it.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none — 4 tags; not subdivided.

**Decisions record:** None (no cap yields this pass).

## Lamentations 3 (subdivided: 3:1–18 / 3:19–36 / 3:37–66)

**Existing tags (book doc):** `pastoral-hope-in-despair`, `gods-faithfulness`, `hope-in-god`,
`the-lords-discipline`, `repentance`, `pastoral-god-sees-my-suffering`, `lament`, `vengeance`
— 8 tags (HARD CEILING). Standing yields already recorded in the book doc: `prayer` and
`pastoral-near-to-the-brokenhearted` (Decisions #6, at the then-6-cap, refs 3:55–57
preserved); `unanswered-prayer` (Decisions #14, at the 8-ceiling, refs 3:8 and 3:44
preserved, flagged for Jesse).

**Applied-tag deltas:** No changes — all eight existing tags re-verified and kept; the
chapter is at the hard ceiling and no candidate outranks a standing tag under §11.6.
- KEEP `pastoral-hope-in-despair` — "My strength has perished, along with my expectation from the LORD." (3:18) answered by "This I recall to my mind; therefore I have hope." (3:21) — hope recovered at the bottom.
- KEEP `gods-faithfulness` — "They are new every morning. Great is your faithfulness." (3:23, with 3:22, 32) — the pack's own keystone anchor text.
- KEEP `hope-in-god` — "Therefore I will hope in him." (3:24) and the goodness of waiting (3:25–26).
- KEEP `the-lords-discipline` — affliction received as discipline from a God who "does not afflict willingly, nor grieve the children of men." (3:33; yoke 3:27–30; "For the Lord will not cast off forever." 3:31).
- KEEP `repentance` — "Let us search and try our ways, and turn again to the LORD." (3:40, with the confession of 3:42).
- KEEP `pastoral-god-sees-my-suffering` — "LORD, you have seen my wrong. Judge my cause." (3:59; also 3:50, 3:60–63).
- KEEP `lament` — the book's center: individual lament in triple acrostic, "I am the man who has seen affliction by the rod of his wrath." (3:1), descending before hope is found (3:1–66).
- KEEP `vengeance` — "You will pay them back, LORD, according to the work of their hands." (3:64) — repayment entrusted, never taken (3:58–66).

**Anchor-extension candidates** (this is the per-verse refinement payload — every yielded or
at-ceiling candidate survives here as an exact-range engine candidate; several are already
engine data, verified at this SHA and listed so the refinement pass doesn't re-derive them):
- `the-lords-discipline` | Lam 3:31-33 | "For he does not afflict willingly, nor grieve the children of men." | w=0.75 — the pack currently anchors only Heb 12:7-11 and Rev 3:19; this is the OT witness for "why is god disciplining me" queries.
- `repentance` | Lam 3:40-41 | "Let us search and try our ways, and turn again to the LORD." | w=0.7 — the self-examination register; pack lexicon already carries "return to the lord" but no Lamentations anchor.
- `near-to-the-brokenhearted` | Lam 3:55-57 | "You came near in the day that I called on you." | w=0.7 — preserves the book doc's Decisions #6 yield (`pastoral-near-to-the-brokenhearted` dropped at the display cap) as an engine anchor with an exact range.
- `prayer` | Lam 3:55-56 | "I called on your name, LORD, out of the lowest dungeon." | w=0.6 — preserves the Decisions #6 `prayer` yield; CURATION NOTE: overlaps the near-to-the-brokenhearted candidate above on 3:55-57 — pick one home or weight both deliberately, don't double-route by accident.
- `god-sees-my-suffering` | Lam 3:58-60 | "LORD, you have seen my wrong. Judge my cause." | w=0.65 — pack anchors stop at Ps 27:10; this adds the sufferer's appeal to the God who has seen it all.
- `justice-and-oppression` | Lam 3:34-36 | "to subvert a man in his cause, the Lord doesn’t approve." | w=0.6 — direct teaching that God never approves crushing prisoners or denying a man justice (3:34-36); too thin for a display tag at this chapter's ceiling (see Decisions record) but a clean anchor.
- Already engine data at this SHA (verified; no action needed — listed so the refinement pass doesn't re-propose them): `unanswered-prayer` anchors Lam 3:8 (w=0.9) and Lam 3:44 (w=0.8) — the Decisions #14 display yield is already fully served engine-side; `gods-faithfulness` anchors Lam 3:22-23 (w=1.0); `hope-in-despair` anchors Lam 3:21-23 (w=0.85); `trust-in-god` anchors Lam 3:25-26 (w=0.65); `providence` anchors Lam 3:37-38 (w=0.8); `lament` anchors Lam 3:19-20 (w=1.0); `vengeance` anchors Lam 3:64-66 (w=0.75).

**Lexicon candidates:**
- `unanswered-prayer` | term: "prayers not getting through" | queries: "my prayers aren't getting through", "it feels like god isn't listening", "praying to a closed heaven". Evidence: "Yes, when I cry, and call for help, he shuts out my prayer." (3:8); "You have covered yourself with a cloud, so that no prayer can pass through." (3:44). ROUTING GATE: the word-withheld vs prayer-shut-out query-routing decision is recorded as deferred with corpus-blocked roster row 10 (`famine-of-hearing-gods-word`) "to be settled across both rows together" — this candidate rides that joint decision; route with row 10, do not settle unilaterally.
- `the-lords-discipline` | term: "does not afflict willingly" | queries: "does god enjoy punishing us", "does god want to hurt me", "why would a loving god afflict me". Evidence: 3:33.
- Already covered (book-doc extension candidate closed): the hymn phrasing of 3:23 — `gods-faithfulness`'s lexicon already carries both "great is your faithfulness" and "his mercies are new every morning" at this SHA; no action.

**New-concept candidates:** None from this chapter alone — the two gaps the book doc logged
(`unanswered-prayer`, `lament`) are both live engine concepts at this SHA with Lamentations 3
anchors already in place. (The `when-god-feels-against-you` check-first candidate is carried
on the chapter 2 entry; its 3:10-13 refs belong to it.)

**Decline-overturn proposals:** None.

**Routed to corpus-blocked backlog:** the unanswered-prayer lexicon candidate's query-routing
question — already on corpus-blocked roster, row 10 (`famine-of-hearing-gods-word`), whose
recorded reason carries the Lamentations cross-note by name. Routed, not duplicated.

**Ceiling / refinement flags:** PER-VERSE REFINEMENT FLAGGED — chapter is subdivided in the
book doc (3:1–18 / 3:19–36 / 3:37–66, BSB anchors) AND stands at the hard ceiling of 8. The
anchor-extension candidates above carry exact verse ranges per movement: affliction 3:8
(engine-held), hope 3:22-26 (engine-held) + 3:31-33, justice-and-return 3:34-36, 3:40-41,
3:55-60, 3:64-66 (partly engine-held).

**Decisions record:**
- Standing yields honored, not re-litigated: `unanswered-prayer` (Decisions #14 ceiling yield — its refs 3:8, 3:44 are ALREADY the engine pack's anchors, so the display yield costs the searcher nothing engine-side; the book doc's flag for Jesse stands as written); `prayer` and `pastoral-near-to-the-brokenhearted` (Decisions #6 yields — both preserved above as anchor-extension candidates with exact ranges, which is precisely the survival path plan §3.1 intends).
- At-ceiling candidates yielded THIS pass (each met an arguable presence reading but yields under the §11.6 order; recorded here so no drop is silent): `trust-in-god` (3:25-26 — broad-duplicating-specific: `hope-in-god` already carries 3:24-26's waiting register; engine already anchors Lam 3:25-26 on trust-in-god regardless); `providence` (3:37-38 — thin single-verse-pair; engine already anchors Lam 3:37-38 at w=0.8); `justice-and-oppression` (3:34-36 — thin single-passage witness inside a chapter whose main themes lie elsewhere; preserved as the anchor-extension candidate above).

## Lamentations 4

**Existing tags (book doc):** `divine-judgment`, `sin`, `lament`, `false-prophets` — 4 tags.

**Applied-tag deltas:** One ADD; all four existing tags kept.
- KEEP `divine-judgment` — "The LORD has accomplished his wrath. He has poured out his fierce anger. He has kindled a fire in Zion" (4:11; scattering at 4:16).
- KEEP `sin` — iniquity "greater than the sin of Sodom" (4:6), traced to the leaders (4:13).
- KEEP `lament` — the fourth alphabet poem walks the streets after the fall: "How the gold has become dim!" (4:1), cataloging the reversals without looking away (4:1–22).
- KEEP `false-prophets` — "It is because of the sins of her prophets and the iniquities of her priests" (4:13), who "shed the blood of the just" (4:13).
- ADD `trusting-in-man` — the chapter depicts misplaced human trust failing twice over: "In our watching we have watched for a nation that could not save." (4:17), and the king in whose shadow they hoped to live "was taken in their pits" (4:20 — cited as the human king only, per the book doc's no-read-back Decisions #12). This is the concept's teaching substance shown in outcome — trust in a nation and a man collapsing where the book's hope-texts (3:21–26) point elsewhere. Chapter moves to 5 tags, within the soft cap.
- Considered, not added: `restoration` — "The punishment of your iniquity is accomplished, daughter of Zion. He will no more carry you away into captivity." (4:22) remains one closing verse in a chapter of horror; the book doc's Decisions #5 rejection stands (no new textual evidence — carried below as a low-weight anchor candidate instead).
- Considered, not added: `gods-provision` — famine depiction (4:4-10) stays routed per the recorded Lamentations decline (declines §3.5).

**Anchor-extension candidates:**
- `trusting-in-man` | Lam 4:17 | "In our watching we have watched for a nation that could not save." | w=0.7 — fits the pack's failed-reliance register (cf. its Ezek 29:6-7 anchor).
- `divine-judgment` | Lam 4:11 | "He has kindled a fire in Zion" | w=0.7 — the second wrath anchor the book doc's extension-candidates list named (with 2:1-4).
- `restoration-of-israel` | Lam 4:22 | "He will no more carry you away into captivity." | w=0.5 — modest: the book's first turn toward captivity's end; display-tag rejection (Decisions #5) unaffected.

**Lexicon candidates:** None — no realistic unserved query phrasing found (siege-famine
phrasings ride the PR #41 `gods-provision` famine lexicon per the standing decline).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none — 5 tags after the add; not subdivided.

**Decisions record:** None (no cap yields; the ADD lands under the soft cap).

## Lamentations 5

**Existing tags (book doc):** `prayer`, `sin`, `restoration`, `lament` — 4 tags.

**Applied-tag deltas:** No changes — all four existing tags re-verified and kept; no honest
add found.
- KEEP `prayer` — the whole chapter is one communal prayer: "Remember, LORD, what has come on us. Look, and see our reproach." (5:1) through "Turn us to yourself, LORD, and we will be turned." (5:21).
- KEEP `sin` — inherited and owned: "Our fathers sinned, and are no more. We have borne their iniquities." (5:7); "The crown has fallen from our head. Woe to us, for we have sinned!" (5:16).
- KEEP `restoration` — "Turn us to yourself, LORD, and we will be turned. Renew our days as of old." (5:21), grounded in the everlasting throne (5:19).
- KEEP `lament` — the closing communal lament, alphabet discipline released, ending unresolved: "But you have utterly rejected us. You are very angry against us." (5:22).
- Considered, not added: `god-reigns` — "You, LORD, remain forever. Your throne is from generation to generation." (5:19) is one verse of confession inside the prayer; thin single-verse, presence bar not met for a display tag. Carried as an anchor-extension candidate.
- Considered, not added: `wrestling-with-god` — "Why do you forget us forever, and forsake us for so long a time?" (5:20) is one protest question inside the prayer the chapter already carries; carried as a lexicon candidate instead.
- Considered, not added: `care-for-widows` — the 2026-08-25 pass's presence-bar rejection stands (5:3 is the sufferers' self-description, not care-and-duty teaching); no new textual evidence.
- Considered, not added: `individual-responsibility` — "Our fathers sinned, and are no more. We have borne their iniquities." (5:7) states the generational-consequence experience the concept ANSWERS (Ezek 18), but the chapter contains no individual-responsibility teaching — tagging it here would invert the concept's substance. Noted only; 5:16 shows the chapter also owns its own sin, so no decline-overturn or gap either.

**Anchor-extension candidates:**
- `restoration` | Lam 5:21 | "Turn us to yourself, LORD, and we will be turned. Renew our days as of old." | w=0.75 — the pack's "restore me / renew me" register in communal form; strong fit beside its Ps 23:3 / Isa 43:18-19 anchors.
- `god-reigns` | Lam 5:19 | "You, LORD, remain forever. Your throne is from generation to generation." | w=0.6 — matches the pack's enthronement register (cf. its Ps 93:1-2 anchor); the one fixed point the chapter's prayer stands on.

**Lexicon candidates:**
- `wrestling-with-god` | term: "why do you forget us" | queries: "why has god forgotten me", "does god forget his people", "god has forsaken us". Evidence: "Why do you forget us forever, and forsake us for so long a time?" (5:20). CURATION NOTE: adjacent to `god-sees-my-suffering`'s "does God see me" family — check both routes; the forsaken-protest register fits wrestling-with-god's existing "how long o lord" entry best.
- `restoration` | term: "renew our days as of old" | queries: "renew our days as of old", "prayer for god to restore us", "lord restore what was lost". Evidence: 5:21; the pack's lexicon carries only first-person-singular forms ("restore me | renew me").

**New-concept candidates:** None — the sexual-violence-in-war material
("They ravished the women in Zion, the virgins in the cities of Judah.", 5:11)
stays where the recorded decline
put it (declines §3.5, Lamentations item): one verse, flagged in the book doc as a motif for
a future cross-book decision (Gen 34; Judg 19), not a row. No new textual evidence; not
re-proposed.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** none — 4 tags; not subdivided.

**Decisions record:** None (no cap yields this pass).

---

# Chunk totals (chapters 1–5)

- Applied-tag deltas: 1 ADD (`trusting-in-man`, ch 4), 26 KEEP, 0 DROP.
- Anchor-extension candidates: 16 proposed — ch 1 ×3, ch 2 ×2, ch 3 ×6, ch 4 ×3, ch 5 ×2
  (plus 7 verified-already-engine-data notes on ch 3). [Assembly correction 2026-08-26: the
  chunk draft said 13; mechanical recount of the candidate bullets is 16.]
- Lexicon candidates: 5 (ch 1 ×1, ch 3 ×2, ch 5 ×2, plus 1 already-covered closure note each
  on chs 2 and 3). [Assembly correction 2026-08-26: the chunk draft said 6; mechanical recount
  of the term bullets is 5, matching the draft's own per-chapter breakdown.]
- New-concept candidates: 1 (check-first `when-god-feels-against-you`, ch 2 entry).
- Decline-overturn proposals: 0.
- Routed to corpus-blocked backlog: 2 (roster row 45 `exile-and-captivity`, ch 1; roster
  row 10 `famine-of-hearing-gods-word` joint-routing gate, ch 3).
- Ceiling / per-verse refinement: chapter 3 flagged (subdivided + hard ceiling 8, with
  standing `unanswered-prayer` yield accounted for); chapters 1, 2, 4, 5 unflagged.
