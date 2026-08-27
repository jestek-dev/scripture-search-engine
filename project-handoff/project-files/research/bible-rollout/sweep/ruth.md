# Ruth sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (plus the §11.1 adopted
  display-tag vocabulary per CONVENTIONS §11; adopted ids used are named as such below)
- Book: Ruth (4 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/ruth.md
    (FINAL, 2 critic rounds; tags include the 2026-08-25 adopted-vocabulary application pass,
    its Decisions #19)
  - Concept inventory: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/concept-inventory.md (+ concept-ids.txt)
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/corpus-blocked-roster.md
  - WEB chapter text: repo-pinned VPL at
    /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt (book code RUT,
    85 verse lines; manifest pipeline/manifests/web.json sha b6f55cc7…, contentSha256
    944e3883…, re-admitted 2026-08-25 in PR #53 — the same text identity the fixture corpus
    was regenerated from). Every quote below was verified byte-for-byte (programmatic
    substring check, curly punctuation included) against this file before writing.
  - Corpus note: of Ruth, only chapter 1 is in the current 213-chapter fixture corpus;
    Ruth 2–4 are corpus-blocked and any engine-side candidate on them rides PR-β
    (corpus expansion). Marked per candidate below.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file. This worker writes ONLY
  this file (no book-doc edits, no tag-gaps.md appends — vocabulary observations are
  recorded in-ledger instead, per this sweep worker's task constraints).
- Legend — each chapter entry carries these sections, in order:
  1. "## Ruth <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Corpus-blocked routings ("routed to backlog: <id>" with roster row, or "none")
  9. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  10. Decisions record (every §11.6 yield and every delegated call, rationale, reversible — no silent drops, or "None.")

## Ruth 1

Existing tags (book doc): `pastoral-grief-and-loss`; `loving-others`; `faith`; `gods-provision`; `lament`; `oaths-and-vows` — 6 (soft cap).

Applied-tag deltas:
- KEEP `pastoral-grief-and-loss` — "the woman was bereaved of her two children and of her husband" (1:5); the grief is carried God-ward: "the Almighty has dealt very bitterly with me" (1:20). Personal register throughout (three family graves); the pastoral-register ruling was re-tested by the book doc (its Decisions #14) and stands.
- KEEP `loving-others` — "Don’t urge me to leave you" … "Where you die, I will die" (1:16–17); the kindness already named by Naomi: "as you have dealt with the dead and with me" (1:8).
- KEEP `faith` — "Your people will be my people, and your God my God" (1:16), sealed by oath in the LORD's name (1:17). Prior-art reasoning (book doc Decisions #4; Rahab precedent) re-checked against the current `faith` pack: a Gentile staking her future on Israel's God clears the presence bar.
- KEEP `gods-provision` — "the LORD had visited his people in giving them bread" (1:6), against the chapter's opening frame "there was a famine in the land" (1:1); the famine register is designed into this pack's lexicon ("famine in the land" is a lexicon term — the PR #41 extension routing Ruth's famine here is confirmed by the current pack).
- KEEP `lament` — "the LORD’s hand has gone out against me" (1:13); "Call me Mara, for the Almighty has dealt very bitterly with me" (1:20); "I went out full, and the LORD has brought me home again empty" (1:21). The Mara complaint is voiced straight to/about God and honored by the book; engine id (the adopted row landed as a pack).
- KEEP `oaths-and-vows` — "May the LORD do so to me, and more also, if anything but death parts you and me" (1:17): a formal oath formula in the LORD's name.
- ADD `care-for-widows` — in-chapter substance: "the woman was bereaved of her two children and of her husband" (1:5); the widow's plight carried God-ward, "the Almighty has afflicted me" (1:21). Re-judged against the ADMITTED engine pack, which itself anchors Ruth 1:3-5 (w0.8) and Ruth 1:20-21 (w0.75) — the curated pack design counts this chapter's widow narrative as core material its searchers ("bible verses for widows," "does god care for widows") should find. This reverses the 2026-08-25 application-pass skip (book doc Decisions #19), which reasoned from the adopted-row framing before the pack existed — see Decisions record. Takes the chapter to 7 tags (above soft cap 6, under ceiling 8; every tag independently clears the bar).

Anchor-extension candidates (Ruth 1 IS in the current fixture corpus — assertable now, no PR-β wait):
- `lament` | Ruth 1:20-21 | "Call me Mara, for the Almighty has dealt very bitterly with me" | w0.6 — the pack has no Ruth anchor; Naomi's Mara speech is a canonical personal-complaint text the book honors rather than rebukes.
- `oaths-and-vows` | Ruth 1:16-17 | "May the LORD do so to me, and more also, if anything but death parts you and me" | w0.55 — narrative exemplar of the sworn-oath formula; pack currently has no oath-narrative anchor from the historical books.
- `loving-others` | Ruth 1:16-17 | "where you go, I will go; and where you stay, I will stay" | w0.6 — pairs with the lexicon row below; the famous phrasing currently has no home.
- `gods-provision` | Ruth 1:6 | "the LORD had visited his people in giving them bread" | w0.55 — the famine-relief register the pack's own lexicon claims ("famine in the land," 1:1).

Lexicon candidates:
- `loving-others` | "where you go i will go; your people will be my people" | queries: "where you go I will go", "your people will be my people meaning", "Ruth's promise to Naomi". (XOR check due against `kindness` and `faith` at curation; the phrase belongs to exactly one target.)

New-concept candidates:
- `in-law-loyalty` (LOW CONFIDENCE — recorded so curation sees it once; not urged). Rationale: mother-in-law/daughter-in-law loyalty is vivid and sustained (1:14-18 — "but Ruth stayed with her," 1:14) and "bible verses about mother in law" / "in-law relationships in the bible" have no honest home (`family-reconciliation` is the estrangement register, `parenting` the child-raising register). Prior art: book doc motif 9 deliberately kept this motif-only — "a one-book base is thin for minting" — and that caution stands; this row exists to carry the motif into the curation feed, where Ruth 2:11 and 4:15 (other-chapter witnesses) can be weighed with it.

Decline-overturn proposals: None. (Ruth 1's famine was checked against §3.1's covered list — it stays routed to the `gods-provision` lexicon extension, which the anchor candidate above reinforces rather than overturns.)

Corpus-blocked routings: none.

Ceiling / refinement flags: none — 7 tags after the ADD (soft cap exceeded, ceiling not hit); chapter not subdivided in the book doc (kept whole per its Decisions #2).

Decisions record:
- ADD `care-for-widows` reverses an application-pass skip (book doc Decisions #19) on NEW evidence: the engine pack admitted in the 168→239 expansion anchors Ruth 1:3-5 and 1:20-21 directly, at core weights — evidence that post-dates the skip's reasoning ("the chapter depicts the widows' plight, not the care register"). The pack's own design resolves that register question the other way for search purposes. Reversible delegated default; a curator or Jesse can restore the skip.
- Soft-cap exceedance (7 tags): permitted under §11.6 (hard ceiling 8 where every tag independently clears; main themes first — the grief/loyalty/lament spine stays ahead of the add in tag order above).
- `kindness` considered, NOT added, despite the engine pack anchoring Ruth 1:8 (w0.75): in-chapter presence is the single greeting-blessing verse 1:8 ("May the LORD deal kindly with you"), already carried inside the `loving-others` justification — thin-single-verse class with no distinct register here; the tag stays on ch. 3 where the word is the chapter's hinge. No anchor extension needed (1:8 is already in the pack). Re-affirms the application-pass call; reversible.
- Prior-art drops re-checked and standing (book doc Decisions #7): `pastoral-hope-in-despair` (only despair is depicted here; hope arrives in later chapters), `loneliness` (bereavement register, already carried by `pastoral-grief-and-loss`), `waiting-for-a-child` (the ten childless years are reported data, not the waiting register).

## Ruth 2

Existing tags (book doc): `gods-provision`; `providence`; `generosity`; `refuge-in-trouble`; `hospitality`; `work-and-diligence`; `justice-and-oppression`; `sojourners-and-strangers` — 8 (HARD CEILING, reached at the 2026-08-25 application pass).

Applied-tag deltas: No changes — all 8 KEEP, each re-verified against the current library:
- KEEP `gods-provision` — "She ate, was satisfied, and left some of it" (2:14); "about an ephah of barley" (2:17): the hungry household fed past sufficiency.
- KEEP `providence` — "she happened to come to the portion of the field belonging to Boaz, who was of the family of Elimelech" (2:3): the narrator's pointed coincidence, the book's own signal of steering.
- KEEP `generosity` — "Also pull out some for her from the bundles, and leave it" (2:16); a seat and food at the meal (2:14): giving past every legal requirement.
- KEEP `refuge-in-trouble` — "the LORD, the God of Israel, under whose wings you have come to take refuge" (2:12). Single-verse witness, but it names the pack's exact register (God as refuge) and is the chapter's theological center; noted as the chapter's first yield candidate if the ceiling is ever contested by a stronger claim.
- KEEP `hospitality` — "Don’t go to glean in another field" … "stay here close to my maidens" (2:8); "Come here, and eat some bread" (2:14); the welcomed self-described foreigner (2:10).
- KEEP `work-and-diligence` — "has continued even from the morning until now" (2:7); "she gleaned in the field until evening" (2:17).
- KEEP `justice-and-oppression` — register note kept from the book doc: the provision-care side of the concept, Israel's gleaning law working as intended and exceeded — "Let her glean even among the sheaves, and don’t reproach her" (2:15).
- KEEP `sojourners-and-strangers` — "Why have I found favor in your sight, that you should take knowledge of me, since I am a foreigner?" (2:10); "It is the Moabite lady who came back with Naomi" (2:6).

Anchor-extension candidates (Ruth 2 is corpus-blocked — rides PR-β):
- `refuge-in-trouble` | Ruth 2:12 | "under whose wings you have come to take refuge" | w0.6 — the classic under-his-wings narrative text; pairs with the lexicon row below (the pack anchors Ps 91:4 but its lexicon lacks the wings phrasing).
- `kindness` | Ruth 2:20 | "who has not abandoned his kindness to the living and to the dead" | w0.7 — the book's hesed statement; the pack's Ruth anchors are 1:8 and (proposed, ch. 3 block) 3:10, and 2:20 is the strongest God-ward use.
- `hospitality` | Ruth 2:8-10 | "stay here close to my maidens" | w0.55 — a foreigner welcomed, protected, and watered; complements the pack's Lev 19:33-34 command anchor with a narrative exemplar.
- `work-and-diligence` | Ruth 2:7 | "has continued even from the morning until now" | w0.5 — the pack is anchor-thin (4 anchors, no narrative exemplar); low priority.

Lexicon candidates:
- `justice-and-oppression` | "gleaning" | queries: "gleaning in the bible", "what is gleaning in the book of Ruth", "leaving the edges of the field for the poor". Register caution for curation (from the book doc's own note): Ruth 2 is provision working as intended, not oppression — if fixtures show the mismatch, the term may belong on a future poverty-provision design instead; do not double-route.
- `refuge-in-trouble` | "under his wings" | queries: "under his wings", "take refuge under God's wings", "what does under his wings mean". (Ps 91:4 is already an anchor; the phrase is absent from the lexicon.)

New-concept candidates: None. (The gleaning/provision-for-the-poor question was already resolved by the book doc's gap row 3 into the `justice-and-oppression` row, whose pack now exists; the residual register question rides the lexicon row above.)

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `kinsman-redeemer` (roster row 27, which already carries Ruth 2–4) — the recognition verse "The man is a close relative to us, one of our near kinsmen" (2:20) is that row's material; not duplicated here as any fresh proposal.

Ceiling / refinement flags: HARD CEILING hit (8/8) — **PER-VERSE REFINEMENT candidate**. (Chapter not subdivided in the book doc.)

Decisions record:
- `blessing` considered, not added (2:4, 12, 19-20 blessing speech): ceiling holds and the substance (blessing prayed and granted) is tagged on ch. 4 — re-affirms book doc Decisions #7's cap yield; reversible.
- `kindness` considered, not added at ceiling: thin single-verse in-chapter witness (2:20) whose acts the existing `generosity` tag already carries — re-affirms the application-pass yield (book doc Decisions #19); carried instead as the anchor-extension candidate above. Reversible.
- `kinsman-redeemer` considered, not added: 2:20 is naming/recognition only; the institution's substance is chs. 3–4 where the tag sits (application-pass routing re-affirmed) — and the id rides the backlog roster (see routings).
- `pastoral-god-sees-my-suffering` considered, not added: the seeing/noticing in this chapter is Boaz's (2:5, 10-11), not framed as God's seeing; tagging would substitute the narrator's providence gesture (already tagged) for the pack's register.

## Ruth 3

Existing tags (book doc): `loving-others`; `honesty`; `kindness`; `kinsman-redeemer`; `oaths-and-vows` — 5.

Applied-tag deltas: No changes — all 5 KEEP, each re-verified against the current library:
- KEEP `loving-others` — "You have shown more kindness in the latter end than at the beginning, because you didn’t follow young men, whether poor or rich" (3:10): Ruth's costly loyalty toward the dead and toward Naomi, named by Boaz. Overlap with `kindness` is governed by the §11.2 both-tags ruling — each clears the presence bar independently.
- KEEP `kindness` — the concept's own word is the chapter's hinge, from Boaz's mouth (3:10, quote above). Engine id (the Ruth-minted gap row landed as a pack).
- KEEP `honesty` — "Now it is true that I am a near kinsman. However, there is a kinsman nearer than I." (3:12): the whole truth told against his own interest, and his hopes submitted to the prior right (3:13). Book doc Decisions #5 re-checked; stands.
- KEEP `kinsman-redeemer` — ADOPTED display id, engine-built: no (canonical list /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md, line 106; also corpus-blocked roster row 27) — "spread the corner of your garment over your servant; for you are a near kinsman" (3:9): the formal appeal to the institution itself, with the nearer kinsman's prior right carefully ordered (3:12–13).
- KEEP `oaths-and-vows` — "then I will do the duty of a kinsman for you, as the LORD lives" (3:13): the sworn pledge that drives the resolution.

Anchor-extension candidates (Ruth 3 is corpus-blocked — rides PR-β):
- `kindness` | Ruth 3:10 | "You have shown more kindness in the latter end than at the beginning" | w0.65 — the pack's word used of the book's central human virtue; completes the Ruth kindness arc with 1:8 (already anchored) and 2:20 (proposed above).

Lexicon candidates: None.

New-concept candidates: None. Noted for the record, not proposed: "you are a worthy woman" (3:11) sits in the query family of "virtuous woman in the bible" / "Proverbs 31 woman," which has no vocabulary home — but Proverbs 31 is the minting text and Ruth a supporting witness; per the Ecclesiastes-patience precedent (§3.5: a gap should come from the book that teaches it sustainedly), any candidate belongs to the Poetry thread's ledger, with Ruth 3:11 recorded here as its historical-books witness.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `kinsman-redeemer` (roster row 27) — the lexicon/anchor material of 3:9–13 ("spread the corner of your garment," "what is a kinsman redeemer") rides that row's eventual pack; not duplicated here as lexicon or new-concept proposals.

Ceiling / refinement flags: none — 5 tags; chapter not subdivided in the book doc.

Decisions record:
- Prior-art drops re-checked and standing (book doc Decisions #7): `self-control` / `pastoral-sexual-purity` (the scene displays propriety but teaches neither register — tagging would moralize past the narrative), `godly-marriage` (household-teaching register absent).
- `fear-not` considered, not added: "don’t be afraid" (3:11) is Boaz's personal reassurance to Ruth, not the divine-comfort register the pack serves; single-verse besides.
- `rest-for-the-weary` considered, not added: "shall I not seek rest for you" (3:1) is settled-security ("rest" = a home), not the Matthew 11:28 weary-soul register — same finding as book doc motif 7, which already flagged the rest-register lexicon question for curation review (no new evidence to add here).

## Ruth 4 (subdivided: 4:1–12; 4:13–17; 4:18–22)

Existing tags (book doc): `restoration`; `gods-faithfulness`; `blessing`; `providence`; `care-for-widows`; `kinsman-redeemer` — 6 (soft cap).

Applied-tag deltas: No changes — all 6 KEEP, each re-verified against the current library:
- KEEP `restoration` — "He shall be to you a restorer of life and sustain you in your old age" (4:15): the emptied woman refilled, point for point against ch. 1's complaint.
- KEEP `gods-faithfulness` — "Blessed be the LORD, who has not left you today without a near kinsman" (4:14): the unambiguous God-ward antecedent the book doc deliberately waited for (its Decisions #7 moved this tag off ch. 2's ambiguous 2:20 onto this verse).
- KEEP `blessing` — "May the LORD make the woman who has come into your house like Rachel and like Leah, which both built the house of Israel" (4:11): blessing spoken at the gate and then granted in a marriage and a son (4:13).
- KEEP `providence` — "the LORD enabled her to conceive" (4:13), one of the narrator's only direct divine attributions; and the ordinary events of gate, marriage, and birth carry Israel's royal line — "He is the father of Jesse, the father of David." (4:17; genealogy 4:18–22).
- KEEP `care-for-widows` — the purchase carries "Ruth the Moabitess, the wife of the dead" with the duty to her dead husband's name (4:5, 10), and the widow Naomi is blessed with a sustainer: "a restorer of life and sustain you in your old age" (4:15).
- KEEP `kinsman-redeemer` — ADOPTED display id, engine-built: no (adopted-concepts.md line 106; roster row 27) — the institution enacted in full: "If you will redeem it, redeem it" (4:4), the sandal custom (4:7–8), and the duty "to raise up the name of the dead on his inheritance" (4:5, 10) taken up before ten elders.

Anchor-extension candidates (Ruth 4 is corpus-blocked — rides PR-β):
- `care-for-widows` | Ruth 4:14-15 | "Blessed be the LORD, who has not left you today without a near kinsman" | w0.7 — completes the pack's Ruth arc: it currently anchors only ch. 1 (the plight); ch. 4 is the provision its searchers ask about ("does god care for widows").
- `restoration` | Ruth 4:15 | "He shall be to you a restorer of life" | w0.55 — narrative restorer-of-life text beside the pack's Ps 23:3 "restore my soul" register.
- `blessing` | Ruth 4:11-12 | "May the LORD make the woman who has come into your house like Rachel and like Leah" | w0.5 — the marriage-blessing register (pairs with the lexicon row below).

Lexicon candidates:
- `blessing` | "marriage blessing; wedding blessing" | queries: "marriage blessing in the bible", "bible blessing for a wedding", "may the LORD make the woman like Rachel and Leah". XOR caution for curation: `godly-marriage` owns bare "marriage" — the wedding-blessing phrasing must route to exactly one target; check both lexicons before adding.

New-concept candidates: None. The levirate duty ("to raise up the name of the dead on his inheritance," 4:5, 10) is NOT proposed separately — the recorded levirate either/or (Deut 25:5-10 append: separate `levirate-marriage` candidate only if curation scopes the redemption row narrow) rides roster row 27 with `kinsman-redeemer`; see routings. Genealogy-of-David queries are lookup-shaped (book doc motif 11 re-affirmed): no concept proposed.

Decline-overturn proposals: None.

Corpus-blocked routings: routed to backlog: `kinsman-redeemer` (roster row 27) — the gate transaction (4:1–10), the sandal custom (4:7–8), and the levirate either/or are that row's design material; not duplicated here.

Ceiling / refinement flags: SUBDIVIDED in the book doc (4:1–12; 4:13–17; 4:18–22) — **PER-VERSE REFINEMENT candidate**. Ceiling not hit (6 tags).

Decisions record:
- Prior-art drops re-checked and standing (book doc Decisions #7): `waiting-for-a-child` (the chapter depicts a birth, not the waiting register; the ten childless years are ch. 1 data and cross-chapter refs are forbidden), `humble-exaltation` (the humbling/exalting principle is never stated; `restoration` and `blessing` carry the actual emphases), `godly-marriage` (a marriage happens; nothing about marriage conduct is taught).
- `messianic-prophecy` considered, NOT added: the genealogy's landing on David (4:17–22) is genealogy, not prophecy about Christ; tagging it would be a later-revelation read-back (§5's Genesis-3 rule).
- `sojourners-and-strangers` not re-added on ch. 4: 4:5, 10 name "Ruth the Moabitess" within the transaction; the welcome substance is ch. 2's, where the tag sits (application-pass routing re-affirmed).
- `aging-and-old-age` considered, not added: "sustain you in your old age" (4:15) is one phrase inside the widow-provision blessing, promising a human sustainer — not the aging-with-faith teaching register; the material is already carried by `care-for-widows` and `restoration`. No anchor proposed either (register mismatch).

---

## Sweep summary & vocabulary cross-check (Ruth, 4/4 chapters)

- Applied-tag deltas: **1 ADD** (`care-for-widows`, ch. 1), **25 KEEP** (ch. 1: 6; ch. 2: 8; ch. 3: 5; ch. 4: 6), **0 DROP**. Post-sweep tag counts: ch. 1 = 7, ch. 2 = 8, ch. 3 = 5, ch. 4 = 6.
- Anchor-extension candidates: **12** (ch. 1: `lament`, `oaths-and-vows`, `loving-others`, `gods-provision` — all on Ruth 1, IN the current fixture corpus, assertable now; ch. 2: `refuge-in-trouble`, `kindness`, `hospitality`, `work-and-diligence`; ch. 3: `kindness`; ch. 4: `care-for-widows`, `restoration`, `blessing` — chs. 2–4 candidates ride PR-β).
- Lexicon candidates: **4** (`loving-others` "where you go i will go / your people will be my people"; `justice-and-oppression` "gleaning"; `refuge-in-trouble` "under his wings"; `blessing` "marriage blessing / wedding blessing").
- New-concept candidates: **1**, low confidence (`in-law-loyalty`, ch. 1 block — prior art's one-book-thin caution carried with it).
- Decline-overturn proposals: **0**. (The one reversal in this ledger — `care-for-widows` on ch. 1 — overturns a book-doc application-pass skip, not a tag-gaps-review §3 decline; recorded with its NEW evidence in the ch. 1 Decisions record.)
- Corpus-blocked routings: `kinsman-redeemer` → backlog roster row 27 (noted on chs. 2, 3, 4; roster row already carries Ruth 2–4 and the levirate either/or; nothing duplicated).
- Per-verse refinement candidates: **Ruth 2** (hard ceiling 8/8), **Ruth 4** (subdivided in the book doc: 4:1–12; 4:13–17; 4:18–22).
- Vocabulary cross-check against the canonical §11.1 list (/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md, published 2026-08-26 mid-sweep, superseding the briefing's reconstruction): every tag id in this ledger is either one of the 239 engine ids (verified against concept-ids.txt/inventory: `pastoral-grief-and-loss`, `loving-others`, `faith`, `gods-provision`, `lament`, `oaths-and-vows`, `care-for-widows`, `providence`, `generosity`, `refuge-in-trouble`, `hospitality`, `work-and-diligence`, `justice-and-oppression`, `sojourners-and-strangers`, `honesty`, `kindness`, `restoration`, `gods-faithfulness`, `blessing`) or the single adopted non-engine id `kinsman-redeemer` (canonical file line 106, "engine-built: no" — exact spelling match). No mismatches; no correction entries required. The `in-law-loyalty` proposal collides with no engine id, no adopted id, and no §3 decline or roster row.

## Final survival audit (CONVENTIONS §9) — 2026-08-26

Performed over the whole live file immediately before this closing append:
1. **Prior bytes unchanged:** sha256 of the first 23,647 bytes (all content before this block) matched the recorded post-write hash f34bd356… of the previous append — every earlier append survives byte-identical. Each of the five earlier appends (header + 4 chapter blocks) was likewise verified at write time against the preceding cumulative hash (a48100c1… → 526676ae… → 611e010c… → 079d1dc1… → f34bd356…); no clobber occurred at any step.
2. **All blocks present exactly once:** header, "## Ruth 1", "## Ruth 2", "## Ruth 3", "## Ruth 4 (subdivided…)" each grep-verified present (count = 1 each).
3. **Quote re-verification:** all 104 double-quoted spans in the file were re-extracted and substring-checked against the pinned VPL's RUT lines; every scripture span matches byte-for-byte (47 distinct WEB spans pre-verified before drafting, 0 failures). The checker's residue was manually confirmed to be exactly: legend placeholders, search-query phrasings, lexicon terms, one cross-book register reference (Ps 23:3 "restore my soul"), and WEB fragments carrying this ledger's own citation comma inside the closing quote mark (the WEB words themselves verified without it: "there was a famine in the land" 1:1; "but Ruth stayed with her" 1:14; "spread the corner of your garment over your servant" 3:9).
4. **Nothing re-applied:** no missing rows found, so no re-application was needed.

AUDIT RESULT: PASS — all contributions survive in the live file; prior bytes unchanged.
