# 1 Kings sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: 1 Kings (22 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/1-kings.md
    (FINAL, tagged against the 131-id vocabulary @ b3f491d plus the adopted-vocabulary
    application pass; existing tags re-judged here as deltas, the doc itself untouched)
  - Concept inventory (239 ids + lexicons + anchors): scratchpad concept-inventory.md /
    concept-ids.txt (history-books scout, this session's scratchpad)
  - Declines & contested calls (tag-gaps-review.md §1 + §3 + Jesse's 2026-08-25 postscript
    rulings): scratchpad declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate; 50 rows, all re-verified still gated on
    PR-β): scratchpad corpus-blocked-roster.md
  - Adopted display-tag vocabulary: CONVENTIONS §11.1 (161 ids); the adopted-concepts.md file
    is missing from /mnt/project-files, so the BRIEFING §7 safe reconstruction is used —
    engine ids preferred; a roster/§2 id used only with exact roster spelling and named as such.
  - WEB text: the repo-pinned VPL snapshot at
    pipeline/sources/vpl/engwebp_vpl.txt (manifest pipeline/manifests/web.json, sha
    b6f55cc7…, contentSha256 944e3883…, re-admitted 2026-08-25 in PR #53 — the same text
    identity the fixture corpus was regenerated from). Every quotation below was verified
    byte-for-byte against that file (book code 1KI; 816 verse lines).
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification after every
  append, final survival audit — CONVENTIONS §9 protocol applies to this file.
- Rules applied: CONVENTIONS §5 + §11 verbatim — exact ids (basename-as-id for the 14
  divergent pastoral-* files); word-for-word in-chapter WEB quotes; honest-substantial-
  presence bar first, always; soft cap 6 / hard ceiling 8 with the §11.6 yield order and a
  Decisions-record entry for every yield; both-tags ruling; no later-revelation read-backs;
  honest-and-empty preferred; no theology adjudication. Recorded declines are re-considerable
  only with NEW textual evidence, cited against the original decline. Corpus-blocked-roster
  concepts are ROUTED (roster row number named), never re-proposed.
- Legend — each chapter entry carries these sections, in order:
  1. "## 1 Kings <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## 1 Kings 1
Existing tags (book doc): `humble-exaltation`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `humble-exaltation` — the self-exalter brought low: Adonijah "exalted himself, saying, “I will be king.”" (1:5) ends the chapter afraid at the altar's horns and bowing to the king (1:50–53), while David blesses "the LORD, the God of Israel, who has given one to sit on my throne today" (1:48).
- KEEP `oaths-and-vows` — the succession turns on a sworn word remembered and kept the same day: "most certainly as I swore to you by the LORD, the God of Israel, saying, ‘Assuredly Solomon your son shall reign after me, and he shall sit on my throne in my place;’ I will most certainly do this today." (1:30).
- No adds — checked against the full 239-id library: `leadership` (court intrigue, not leadership teaching) and `providence` (the text names no divine hand in this chapter) do not clear the presence bar.
### Anchor-extension candidates
- oaths-and-vows | 1 Kings 1:29-30 | "The king vowed and said, “As the LORD lives, who has redeemed my soul out of all adversity, most certainly as I swore to you by the LORD... I will most certainly do this today.”" (1:29-30) | 0.6 — the pack has kept-vow verses (Ps 56:12; 116:14) but no kept-oath narrative; see also the 2:42-43 broken-oath candidate on the next chapter (one 1 Kings anchor may be enough — curator's pick).
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## 1 Kings 2 (subdivided: 2:1–9; 2:10–12; 2:13–46)
Existing tags (book doc): `obedience-to-the-word`, `divine-judgment`, `davidic-covenant`, `death-and-burial`, `leadership`
### Applied-tag deltas
- KEEP `obedience-to-the-word` — David's charge makes written Scripture the condition of the throne: "keep the instruction of the LORD your God, to walk in his ways, to keep his statutes, his commandments, his ordinances, and his testimonies, according to that which is written in the law of Moses, that you may prosper" (2:3).
- KEEP `divine-judgment` — long-deferred accounts settled under God's word: Abiathar expelled "that he might fulfill the LORD’s word which he spoke concerning the house of Eli in Shiloh" (2:27); over Joab, "The LORD will return his blood on his own head" (2:32); over Shimei, "the LORD will return your wickedness on your own head" (2:44).
- KEEP `davidic-covenant` — adopted display tag (roster spelling); the promise quoted at the succession: "If your children are careful of their way, to walk before me in truth with all their heart and with all their soul, there shall not fail you... a man on the throne of Israel" (2:4). Routed to backlog: davidic-covenant (roster row 44) — engine-side material rides PR-β, not re-proposed here.
- KEEP `death-and-burial` — adopted display tag (roster spelling); the formula that governs both books of Kings begins: "David slept with his fathers, and was buried in David’s city." (2:10). Routed to backlog: death-and-burial (roster row 22).
- KEEP `leadership` — the royal charge as a throne's handover terms: "I am going the way of all the earth. You be strong therefore, and show yourself a man" (2:2), with the law-of-Moses condition attached (2:3-4).
- ADD `oaths-and-vows` — the chapter's closing case is an oath sworn, broken, and paid for: Shimei is confined on oath, and the king's indictment is oath-language exactly — "Didn’t I adjure you by the LORD and warn you...?" (2:42), "Why then have you not kept the oath of the LORD and the commandment that I have instructed you with?" (2:43). The pack's teaching substance (keep your vows; Eccl 5:4-5 register) is depicted from the broken side with the text's own oath vocabulary — not a failure-mode read-back, since the chapter states the norm ("the oath of the LORD") being enforced.
### Anchor-extension candidates
- oaths-and-vows | 1 Kings 2:42-43 | "Why then have you not kept the oath of the LORD and the commandment that I have instructed you with?" (2:43) | 0.6 — broken-oath narrative; pair-or-pick with the 1:29-30 candidate above.
- obedience-to-the-word | 1 Kings 2:3-4 | "keep the instruction of the LORD your God... according to that which is written in the law of Moses, that you may prosper in all that you do" (2:3) | 0.65 — the pack's OT anchors (1 Sam 15:22; Isa 1:19-20) lack a walk-in-the-written-word charge.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Soft cap 6 reached exactly (6 tags, each independently clearing the bar). Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None (no yields; the ADD lands at the soft cap, not over it).

## 1 Kings 3 (subdivided: 3:1–15; 3:16–28)
Existing tags (book doc): `wisdom-from-god`, `asking-in-gods-will`, `dreams-and-visions`, `leadership`
### Applied-tag deltas
- KEEP `wisdom-from-god` — the Bible's signature narrative of wisdom asked and given: "Give your servant therefore an understanding heart to judge your people, that I may discern between good and evil" (3:9); "behold, I have given you a wise and understanding heart" (3:12); "they saw that the wisdom of God was in him to do justice" (3:28).
- KEEP `asking-in-gods-will` — PR #43 id, ratified 2026-08-25; a request granted because it was the right one: "This request pleased the Lord, that Solomon had asked this thing." (3:10), "Because you have asked this thing, and have not asked for yourself long life, nor have you asked for riches for yourself... behold, I have done according to your word" (3:11-12).
- KEEP `dreams-and-visions` — the whole exchange is night revelation: "In Gibeon, the LORD appeared to Solomon in a dream by night" (3:5); "Solomon awoke; and behold, it was a dream." (3:15).
- KEEP `leadership` — the leader's confessed inadequacy at the throne: "I am just a little child. I don’t know how to go out or come in." (3:7), asking an understanding heart "to judge your people" (3:9).
### Anchor-extension candidates
- wisdom-from-god | 1 Kings 3:5-12 | "Give your servant therefore an understanding heart to judge your people, that I may discern between good and evil" (3:9) | 0.9 — the pack (James 1:5; Prov 2:6; 9:10; 2:11) has no narrative anchor at all; this is the canon's defining ask-God-for-wisdom story and the natural target for "solomon asked for wisdom" queries.
- asking-in-gods-will | 1 Kings 3:10-14 | "Because you have asked this thing, and have not asked for yourself long life, nor have you asked for riches for yourself, nor have you asked for the life of your enemies, but have asked for yourself understanding to discern justice" (3:11) | 0.85 — the pack's anchors (Jas 4:3; 1 Jn 5:14-15; Matt 26:39) teach the principle; this is its positive narrative case.
- dreams-and-visions | 1 Kings 3:5 | "In Gibeon, the LORD appeared to Solomon in a dream by night; and God said, “Ask for what I should give you.”" (3:5) | 0.7 — the pack's OT dream anchors are all Genesis/Daniel/Numbers; this adds the Kings instance.
### Lexicon candidates
- wisdom-from-god | solomon asked for wisdom; an understanding heart | realistic query phrasings: "how did solomon get his wisdom", "solomon's prayer for wisdom", "ask god for an understanding heart"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 4
Existing tags (book doc): `wisdom-from-god`
### Applied-tag deltas
- KEEP `wisdom-from-god` — the source named before the fame: "God gave Solomon abundant wisdom, understanding, and breadth of mind like the sand that is on the seashore." (4:29); "People of all nations came to hear the wisdom of Solomon" (4:34). (Book doc's "only one honest tag" note stands.)
- No adds — checked against the full library: `gods-provision` / `blessing` on the peace-and-plenty portrait (4:20, 25) stay off per the book doc's Decisions record #4 (DOCTRINAL-BASIS anti-formula guardrail; the chapter never uses blessing language and reports rather than teaches); `nations-and-peoples` (4:34's all-nations audience) is a one-verse audience note, not the concept's substance.
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## 1 Kings 5
Existing tags (book doc): `gods-faithfulness`, `harmony-with-others`
### Applied-tag deltas
- KEEP `gods-faithfulness` — the project rests on promises kept: "But now the LORD my God has given me rest on every side. There is no enemy and no evil occurrence." (5:4); the temple-builder son foretold to David now at work — "‘Your son, whom I will set on your throne in your place shall build the house for my name.’" (5:5); "The LORD gave Solomon wisdom, as he promised him." (5:12).
- KEEP `harmony-with-others` — international peace made and kept: "Hiram had always loved David" (5:1); "There was peace between Hiram and Solomon, and the two of them made a treaty together." (5:12).
- No adds — `work-and-diligence` considered for the levy and stone-cutting rolls (5:13-18): conscripted-labor logistics reported without work-ethic teaching substance; does not clear the bar. `the-house-of-god` considered: the house is planned here, but the concept's dwelling substance arrives with the oracle of ch. 6 and the dedication of ch. 8; a plans-and-timber chapter only touches the topic.
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## 1 Kings 6
Existing tags (book doc): `presence-of-god`, `obedience-to-the-word`
### Applied-tag deltas
- KEEP `presence-of-god` — the building's whole point in God's own voice: "I will dwell among the children of Israel, and will not forsake my people Israel." (6:13), with the inner sanctuary prepared "to set the ark of the LORD’s covenant there" (6:19).
- KEEP `obedience-to-the-word` — the oracle inside the building log makes obedience the condition: "Concerning this house which you are building, if you will walk in my statutes, and execute my ordinances, and keep all my commandments to walk in them, then I will establish my word with you" (6:12).
- ADD `the-house-of-god` — new-since-tagging engine id (batches 2-6); the chapter IS the building of the LORD's house: "he began to build the LORD’s house" (6:1), the mid-build oracle "Concerning this house which you are building" (6:12), and the seven-year completion — "the house was finished throughout all its parts and according to all its specifications" (6:38). The pack's register ("the house of god; house of the lord; the temple in the bible; gods dwelling place") is this chapter's subject, not a topic-touch.
### Anchor-extension candidates
- the-house-of-god | 1 Kings 6:11-13 | "Concerning this house which you are building, if you will walk in my statutes... I will dwell among the children of Israel, and will not forsake my people Israel." (6:12-13) | 0.7 — the pack's anchors (2 Chr 7:12-16; Hag 1-2; Ezra 3; Ezek 43) skip Solomon's temple itself; this is the first-temple oracle joining house and dwelling.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## 1 Kings 7 (subdivided: 7:1–12; 7:13–51)
Existing tags (book doc): `work-and-diligence`
### Applied-tag deltas
- KEEP `work-and-diligence` — master craftsmanship carried to completion in the LORD's service: Hiram "was filled with wisdom and understanding and skill to work all works in bronze. He came to King Solomon and performed all his work." (7:14); "So Hiram finished doing all the work that he worked for King Solomon in the LORD’s house" (7:40); "Thus all the work that King Solomon did in the LORD’s house was finished." (7:51). (Book doc's single-tag judgment call stands.)
- No adds — `the-house-of-god` considered and declined for this chapter: a furnishings-and-castings catalog touches the temple topic, but the concept's dwelling-of-God substance lives in the ch. 6 oracle, the ch. 8 dedication, and the ch. 9 answer; tagging the construction log too would be broad-duplicating-specific across chapters. (Routed as those chapters' tags/anchors, not this one's.)
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 8 (subdivided: 8:1–11; 8:12–21; 8:22–53; 8:54–61; 8:62–66)
Existing tags (book doc): `presence-of-god`, `prayer`, `forgiveness-of-sins`, `covenant`, `gods-faithfulness`, `benediction`, `davidic-covenant`, `wholehearted-devotion`
### Applied-tag deltas
- KEEP `presence-of-god` — the cloud and glory filling the house — "the cloud filled the LORD’s house" (8:10), "for the LORD’s glory filled the LORD’s house" (8:11) — held with Solomon's own check: "heaven and the heaven of heavens can’t contain you" (8:27).
- KEEP `prayer` — the dedication prayer itself, "spread out his hands toward heaven" (8:22), pleading case after case with "hear in heaven" through 8:53, and the closing wish that these words "be near to the LORD our God day and night" (8:59).
- KEEP `forgiveness-of-sins` — the prayer's refrain: "hear in heaven, your dwelling place; and when you hear, forgive." (8:30; the forgive-plea recurs at 8:34, 36, 39, 50).
- KEEP `covenant` — the ark of the LORD's covenant enthroned with the Horeb tablets — "There was nothing in the ark except the two stone tablets which Moses put there at Horeb" (8:9) — under the confession "who keeps covenant and loving kindness with your servants" (8:23).
- KEEP `gods-faithfulness` — "There has not failed one word of all his good promise, which he promised by Moses his servant." (8:56); "who has kept with your servant David my father that which you promised him" (8:24).
- KEEP `benediction` — PR #43 id, ratified 2026-08-25; Solomon "stood and blessed all the assembly of Israel with a loud voice" (8:55): "May the LORD our God be with us as he was with our fathers. Let him not leave us or forsake us" (8:57).
- KEEP `davidic-covenant` — adopted display tag (roster spelling); the promise prayed back at the dedication: "may LORD, the God of Israel, keep with your servant David my father that which you have promised him" (8:25). Routed to backlog: davidic-covenant (roster row 44).
- ADD `the-house-of-god` — new-since-tagging engine id; the chapter is the dedication of the LORD's house, the pack's exact register: "I have surely built you a house of habitation, a place for you to dwell in forever." (8:13); "that your eyes may be open toward this house night and day, even toward the place of which you have said, ‘My name shall be there;’" (8:29). Main theme first — this is the chapter's very subject.
- DROP `wholehearted-devotion` — §11.6 yield at the hard ceiling (see Decisions record). The concept's honest presence is one benediction verse — "Let your heart therefore be perfect with the LORD our God" (8:61) — the thin-single-verse class in the yield order. Routed to backlog: wholehearted-devotion (roster row 18; 8:61 is that row's own first-listed ref, and the roster records its design resolution as a loving-god/seeking-god lexicon extension at re-pin).
### Anchor-extension candidates
- the-house-of-god | 1 Kings 8:10-13 | "I have surely built you a house of habitation, a place for you to dwell in forever." (8:13) | 0.85 — the first temple's dedication moment; the pack currently reaches Solomon's temple only via 2 Chronicles.
- the-house-of-god | 1 Kings 8:27-30 | "But will God in very deed dwell on the earth? Behold, heaven and the heaven of heavens can’t contain you; how much less this house that I have built!" (8:27) | 0.8 — the "does God live in a building" question asked and answered inside the dedication itself.
- glory-of-god | 1 Kings 8:10-11 | "so that the priests could not stand to minister by reason of the cloud; for the LORD’s glory filled the LORD’s house." (8:11) | 0.8 — the pack's glory-filling anchors are Exodus 33 and Ezekiel; this is the temple-filling instance.
- nations-and-peoples | 1 Kings 8:41-43 | "Moreover, concerning the foreigner, who is not of your people Israel, when he comes out of a far country for your name’s sake" (8:41), "that all the peoples of the earth may know your name" (8:43) | 0.7 — the foreigner's-prayer case; offered as anchor, not tag (one prayer case among many — thin for a chapter tag at this density).
- gods-faithfulness | 1 Kings 8:56 | "There has not failed one word of all his good promise, which he promised by Moses his servant." (8:56) | 0.85 — a signature not-one-word-failed verse the pack lacks.
### Lexicon candidates
- presence-of-god | where does god dwell | realistic query phrasings: "where does god dwell", "does god live in a temple", "can a building contain god"
- the-house-of-god | solomon dedicates the temple | realistic query phrasings: "solomon's temple dedication", "solomon's prayer of dedication", "the glory filled the temple"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- HARD CEILING 8 hit (8 tags, each independently clearing the bar). Book-doc subdivision (5 sections) → per-verse refinement candidate on both grounds.
### Decisions record
- Yield at hard ceiling: candidates exceeding 8 were resolved per the §11.6 order (cross-ref class → theme-witness-with-caveat → thin single-verse → broad-duplicating-specific). `wholehearted-devotion` (8:61 only — thin single-verse) YIELDED to admit `the-house-of-god` (the chapter's main theme); not silently dropped — its substance and ref are recorded in the DROP entry above and routed to roster row 18.
- Considered and not tagged at the ceiling (recorded, no silent losses): `no-other-god` (8:60 "that all the peoples of the earth may know that the LORD himself is God. There is no one else." — single verse, and ALREADY the pack's own 1 Kings 8:60 anchor, so search coverage exists without the tag); `glory-of-god` (8:10-11 — two verses inside the presence-of-god justification; anchor-extension offered instead); `nations-and-peoples` (8:41-43 — one prayer case; anchor-extension offered instead); `worship` and `repentance` remain off per the book doc's original cap decision (Decisions record #6), their substance still visible inside the kept tags' justifications.
- Roster routing note: 8:39 "for you, even you only, know the hearts of all the children of men" — routed to backlog: god-looks-at-the-heart (roster row 6; the one-design ruling with gods-surprising-choice/humble-exaltation binds there). Not a tag candidate here (single parenthetical clause).

## 1 Kings 9 (subdivided: 9:1–9; 9:10–28)
Existing tags (book doc): `obedience-to-the-word`, `gods-faithfulness`, `davidic-covenant`
### Applied-tag deltas
- KEEP `obedience-to-the-word` — the dynasty's condition in God's own voice: "if you will walk before me as David your father walked, in integrity of heart and in uprightness, to do according to all that I have commanded you" (9:4), with the abandonment scenario spelled out — "Because they abandoned the LORD their God" (9:9).
- KEEP `gods-faithfulness` — chapter 8's prayer heard and answered: "I have heard your prayer and your supplication that you have made before me. I have made this house holy" (9:3), "as I promised to David your father" (9:5).
- KEEP `davidic-covenant` — adopted display tag (roster spelling); restated to Solomon personally with its condition: "then I will establish the throne of your kingdom over Israel forever, as I promised to David your father" (9:5). Routed to backlog: davidic-covenant (roster row 44).
- ADD `the-house-of-god` — new-since-tagging engine id; God's answer consecrates the house as his own: "I have made this house holy, which you have built, to put my name there forever; and my eyes and my heart shall be there perpetually." (9:3) — with the counter-case stated of "this house, which I have made holy for my name, out of my sight" (9:7). The dwelling-of-God substance, in the divine voice.
### Anchor-extension candidates
- the-house-of-god | 1 Kings 9:3 | "I have made this house holy, which you have built, to put my name there forever; and my eyes and my heart shall be there perpetually." (9:3) | 0.8 — the consecration answer; completes the ch. 6/8 first-temple set.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 10 (subdivided: 10:1–13; 10:14–29)
Existing tags (book doc): `wisdom-from-god`
### Applied-tag deltas
- KEEP `wisdom-from-god` — the fame that draws a queen is God-sourced: "the fame of Solomon concerning the LORD’s name" (10:1); "Solomon answered all her questions." (10:3); "All the earth sought the presence of Solomon to hear his wisdom which God had put in his heart." (10:24). (Book doc's single-tag note and the no-`blessing` wealth-catalog decision — Decisions record #4 — both stand.)
- No adds — `nations-and-peoples` considered for the queen of Sheba: one foreign visitor and a tribute list are not the concept's origin-of-the-nations / all-nations substance (the register-mismatch finding recorded on roster row 40's extension check points the same way); does not clear the bar.
### Anchor-extension candidates
- None.
### Lexicon candidates
- wisdom-from-god | queen of sheba | realistic query phrasings: "queen of sheba visits solomon", "who was the queen of sheba", "queen of sheba hard questions"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 11 (subdivided: 11:1–13; 11:14–25; 11:26–43)
Existing tags (book doc): `sin`, `divine-judgment`, `covenant`, `gods-faithfulness`, `davidic-covenant`, `idolatry`, `wholehearted-devotion`
### Applied-tag deltas
- KEEP `sin` — the apostasy told plainly: "Solomon did that which was evil in the LORD’s sight, and didn’t go fully after the LORD, as David his father did." (11:6), with the high places for the nations' abominations (11:5, 7-8).
- KEEP `divine-judgment` — the sentence spoken and set in motion: "I will surely tear the kingdom from you, and will give it to your servant." (11:11), with adversaries the LORD himself raises up (11:14, 23).
- KEEP `covenant` — the charge names the breach exactly: "you have not kept my covenant and my statutes, which I have commanded you" (11:11).
- KEEP `gods-faithfulness` — mercy measured out inside the judgment: "Nevertheless, I will not do it in your days, for David your father’s sake" (11:12), "that David my servant may have a lamp always before me in Jerusalem" (11:36).
- KEEP `davidic-covenant` — adopted display tag (roster spelling); the promise under stress: one tribe kept "for David my servant’s sake and for Jerusalem’s sake" (11:32, with 11:13, 36). Routed to backlog: davidic-covenant (roster row 44).
- KEEP `idolatry` — the wise king's drift into the nations' cults: Ashtoreth, Milcom, and high places for Chemosh and Molech — "His wives turned his heart away." (11:3; 11:5, 7-8).
- KEEP `wholehearted-devotion` — adopted display tag (roster spelling); the measuring rod applied and failed: "his heart was not perfect with the LORD his God, as the heart of David his father was" (11:4). Routed to backlog: wholehearted-devotion (roster row 18; 11:4 is among that row's own listed refs).
- ADD `backsliding` — engine pack whose register is exactly this chapter's arc ("falling away from the faith; drifting from god", with an OT-narrative anchor precedent at Judg 2:11-19): the man who loved the LORD (3:3, outside this chapter and not leaned on) is depicted HERE drifting in old age — "When Solomon was old, his wives turned away his heart after other gods" (11:4); "his heart was turned away from the LORD, the God of Israel, who had appeared to him twice" (11:9); "he didn’t keep that which the LORD commanded" (11:10). In-chapter substance: a once-devoted heart turning away — not merely sin in general (which the `sin` tag carries) but the turning itself, named three times by the narrator.
### Anchor-extension candidates
- backsliding | 1 Kings 11:4-9 | "When Solomon was old, his wives turned away his heart after other gods; and his heart was not perfect with the LORD his God, as the heart of David his father was." (11:4) | 0.75 — the canon's premier late-life drift narrative; the pack's only OT-narrative anchor is Judges 2:11-19.
- idolatry | 1 Kings 11:4-8 | "Then Solomon built a high place for Chemosh the abomination of Moab, on the mountain that is before Jerusalem, and for Molech the abomination of the children of Ammon." (11:7) | 0.7 — the pack anchors 1 Kings 18:21 but not Solomon's own turn, the referent of "how did solomon fall into idolatry" queries.
### Lexicon candidates
- backsliding | solomon turned away from god | realistic query phrasings: "why did solomon fall away from god", "solomon's foreign wives", "how did solomon fall into idolatry"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- HARD CEILING 8 hit (8 tags, each independently clearing the bar; no candidate beyond 8, so no yields). Book-doc subdivision (3 sections) → per-verse refinement candidate on both grounds.
### Decisions record
- Ceiling reached without yields: the ADD lands as the 8th tag and every candidate beyond it was judged below the presence bar, not yielded (`humble-exaltation` for the fallen wise king — the chapter has no exalting-the-humble substance; `trusting-in-man` — the marriages are covenant breach, not a trusting-man-over-God teaching).

## 1 Kings 12 (subdivided: 12:1–19; 12:20–24; 12:25–33)
Existing tags (book doc): `providence`, `sin`, `obedience-to-the-word`, `counsel-and-advisers`, `idolatry`, `justice-and-oppression`, `leadership`
### Applied-tag deltas
- KEEP `providence` — God's unseen hand inside a political catastrophe, named twice: "for it was a thing brought about from the LORD, that he might establish his word" (12:15); "Everyone return to his house; for this thing is from me." (12:24).
- KEEP `sin` — the calves and their machinery, with the narrator's five-word verdict: "This thing became a sin, for the people went even as far as Dan to worship before the one there." (12:30).
- KEEP `obedience-to-the-word` — a depicted success, not a failure mode: "So they listened to the LORD’s word, and returned and went their way, according to the LORD’s word." (12:24).
- KEEP `counsel-and-advisers` — adopted display tag (roster spelling); the Bible's defining bad-counsel narrative: "But he abandoned the counsel of the old men which they had given him, and took counsel with the young men who had grown up with him" (12:8; refused again at 12:13-14), and a kingdom torn over it. Routed to backlog: counsel-and-advisers (roster row 15 — 1 Kgs 12:6-15 is that row's own signature text; the "multitude of counselors" hijack finding is recorded there for the re-pin curator).
- KEEP `idolatry` — a state cult built from fear: "So the king took counsel, and made two calves of gold; and he said to them, “It is too much for you to go up to Jerusalem. Look and behold your gods, Israel, which brought you up out of the land of Egypt!”" (12:28), with high-place houses, non-Levite priests (12:31), and the feast "which he had devised of his own heart" (12:33).
- KEEP `justice-and-oppression` — the grievance that splits the kingdom: "Your father made our yoke difficult." (12:4) answered with "My father chastised you with whips, but I will chastise you with scorpions." (12:14), and the forced-labor chief stoned (12:18).
- KEEP `leadership` — the servant-leadership proof text, offered and refused: "If you will be a servant to this people today, and will serve them, and answer them with good words, then they will be your servants forever." (12:7).
- No adds — `trusting-in-man` considered for Jeroboam's fear-driven religion (12:26-27): the text depicts self-securing unbelief, but the concept's substance (trusting human power INSTEAD of God — princes, horses, alliances) is not what 12:26-33 teaches; `idolatry`/`sin` carry it. Does not clear the bar.
### Anchor-extension candidates
- idolatry | 1 Kings 12:28-30 | "made two calves of gold; and he said to them, “It is too much for you to go up to Jerusalem. Look and behold your gods, Israel, which brought you up out of the land of Egypt!”" (12:28) | 0.8 — the pack anchors Exodus 32's golden calf; Jeroboam's calves are the north's founding cult and the books-of-Kings refrain referent ("the sins of Jeroboam").
- providence | 1 Kings 12:15 | "for it was a thing brought about from the LORD, that he might establish his word, which the LORD spoke by Ahijah the Shilonite to Jeroboam the son of Nebat." (12:15) | 0.7 — a sovereignty-inside-politics anchor; the pack's narrative anchors are Genesis/Esther, nothing in Kings.
### Lexicon candidates
- idolatry | jeroboams golden calves | realistic query phrasings: "jeroboam's golden calves", "why did jeroboam make golden calves", "the calves at bethel and dan"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Soft cap 6 exceeded (7 tags, each independently clearing the bar — §11.6 allows to 8). Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None (no yields).

## 1 Kings 13 (subdivided: 13:1–10; 13:11–34)
Existing tags (book doc): `divine-judgment`, `honesty`, `death-and-burial`, `false-prophets`, `temptation`
### Applied-tag deltas
- KEEP `divine-judgment` — the word against the altar with its instant sign (13:2-5), and the sentence on the LORD's own messenger: "Because you have been disobedient to the LORD’s word, and have not kept the commandment which the LORD your God commanded you" (13:21), "your body will not come to the tomb of your fathers" (13:22), executed by the lion (13:24-26).
- KEEP `honesty` — the chapter's hinge is a lie told in God's name: "“I also am a prophet as you are; and an angel spoke to me by the LORD’s word...” He lied to him." (13:18) — and a man dies of believing it.
- KEEP `death-and-burial` — adopted display tag (roster spelling); a burial the narrative makes pointed: "He laid his body in his own grave; and they mourned over him, saying, “Alas, my brother!”" (13:30), "Lay my bones beside his bones." (13:31). Routed to backlog: death-and-burial (roster row 22 — 1 Kgs 13 is among that row's own blocked refs).
- KEEP `false-prophets` — the register's rarest case, a genuine prophet lying in the LORD's name (13:18); the discernment question the pack exists for, posed at maximum difficulty.
- KEEP `temptation` — temptation clothed in religious authority: the man who refused the king — "Even if you gave me half of your house, I would not go in with you" (13:8) — is won back by an invitation dressed as revelation (13:15-19) and dies of yielding (13:24).
- No adds. `obedience-to-the-word` stays OFF per the book doc's Decisions record #7 and the §5 worked-example rule: the chapter depicts the failure mode (a genuine command abandoned on a claimed counter-revelation); its teaching substance remains motif feed, not a tag. Honored, not re-litigated.
### Anchor-extension candidates
- false-prophets | 1 Kings 13:18 | "He said to him, “I also am a prophet as you are; and an angel spoke to me by the LORD’s word, saying, ‘Bring him back with you into your house, that he may eat bread and drink water.’” He lied to him." (13:18) | 0.6 — the how-do-I-test-a-claimed-revelation case; the pack's test-the-word anchors (Deut 18:21-22; 13:1-3) gain their hardest narrative.
### Lexicon candidates
- false-prophets | the old prophet who lied | realistic query phrasings: "the old prophet of bethel who lied", "why was the man of god killed by a lion", "prophet claimed an angel spoke to him"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 14 (subdivided: 14:1–20; 14:21–31)
Existing tags (book doc): `divine-judgment`, `sin`, `death-and-burial`, `idolatry`
### Applied-tag deltas
- KEEP `divine-judgment` — the sweeping oracle: "I... will utterly sweep away the house of Jeroboam, as a man sweeps away dung until it is all gone." (14:10), the child dying at the threshold "according to the LORD’s word" (14:17-18, foretold 14:12), Israel's scattering foretold (14:15-16), and Shishak stripping the treasuries (14:25-26).
- KEEP `sin` — the charge on both kingdoms: Jeroboam has "done evil above all who were before you" (14:9); "Judah did that which was evil in the LORD’s sight... above all that their fathers had done" (14:22).
- KEEP `death-and-burial` — adopted display tag (roster spelling); the one honored grave in a doomed house: "All Israel will mourn for him and bury him; for he only of Jeroboam will come to the grave, because in him there is found some good thing toward the LORD" (14:13). Routed to backlog: death-and-burial (roster row 22).
- KEEP `idolatry` — indicted on both thrones: Jeroboam "made for yourself other gods, molten images... and have cast me behind your back" (14:9); Judah's "high places, sacred pillars, and Asherah poles on every high hill and under every green tree" (14:23).
- No adds — checked against the full library; nothing new clears the bar (`pastoral-grief-and-loss` for the dying child considered: the scene is a judgment oracle to a disguised queen, not the personal-grief register; the pastoral-register ruling's national-scale bar holds).
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (2 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 15 (subdivided: 15:1–8; 15:9–24; 15:25–34)
Existing tags (book doc): `gods-faithfulness`, `divine-judgment`, `wholehearted-devotion`
### Applied-tag deltas
- KEEP `gods-faithfulness` — the lamp that burns through bad kings: "Nevertheless for David’s sake, the LORD his God gave him a lamp in Jerusalem, to set up his son after him and to establish Jerusalem" (15:4).
- KEEP `divine-judgment` — Ahijah's oracle executed to the last breath: "He didn’t leave to Jeroboam any who breathed, until he had destroyed him, according to the saying of the LORD, which he spoke by his servant Ahijah the Shilonite" (15:29).
- KEEP `wholehearted-devotion` — adopted display tag (roster spelling); the measuring rod in both directions: Abijam's "heart was not perfect with the LORD his God" (15:3), but "the heart of Asa was perfect with the LORD all his days" (15:14). Routed to backlog: wholehearted-devotion (roster row 18; 15:3, 14 are among that row's own listed refs).
- No adds — `trusting-in-man` considered for Asa's treasury-funded Ben Hadad alliance (15:18-19): 1 Kings reports the stratagem without teaching substance or verdict (the prophetic rebuke lives in 2 Chronicles 16, outside this book — and cross-book justification is barred); does not clear the bar here. `davidic-covenant` considered as an ADD (15:4's lamp): the promise substance is carried by `gods-faithfulness`'s justification and the refs are already on the roster row — routed to backlog: davidic-covenant (roster row 44) as a ref note (15:4-5), not added as a fourth tag.
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 16 (subdivided: 16:1–14; 16:15–28; 16:29–34)
Existing tags (book doc): `divine-judgment`, `sin`, `idolatry`
### Applied-tag deltas
- KEEP `divine-judgment` — the oracle against Baasha — "Because I exalted you out of the dust and made you prince over my people Israel, and you have walked in the way of Jeroboam" (16:2) — fulfilled through Zimri "according to the LORD’s word which he spoke against Baasha by Jehu the prophet" (16:12); Zimri dies "for his sins which he sinned" (16:19); and Joshua's centuries-old word lands on Jericho's rebuilder "according to the LORD’s word, which he spoke by Joshua the son of Nun" (16:34).
- KEEP `sin` — the accelerating descent: Omri "dealt wickedly above all who were before him" (16:25); "Ahab the son of Omri did that which was evil in the LORD’s sight above all that were before him." (16:30).
- KEEP `idolatry` — Baal officially established: Ahab "took as wife Jezebel the daughter of Ethbaal king of the Sidonians, and went and served Baal and worshiped him. He raised up an altar for Baal in the house of Baal, which he had built in Samaria." (16:31-32), and "Ahab made the Asherah" (16:33).
- No adds — `drunkenness` considered for Elah "drinking himself drunk in the house of Arza" (16:9): scene-setting the text does not moralize; declined on the Esther 1:10 precedent (tag-gaps-review §3.5, Esther block).
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- word-of-the-lord-fulfilled | rationale: 1 Kings runs on a fulfillment refrain no current id targets — "according to the LORD’s word" as a narrative bookkeeping formula (in this chapter at 16:12 and 16:34; the same formula carries 2:27; 12:15; 15:29; 17:16; 22:38). `gods-faithfulness` serves the promise side and `divine-judgment` the sentence side, but neither lexicon carries "fulfilled prophecy" / "God's word came true" phrasings, and `messianic-prophecy` is Christ-scoped. CHECK-FIRST flag (per the plan's extension-before-mint rule): a lexicon extension of `gods-faithfulness` (terms like "does god keep his word", "fulfilled prophecy") may serve the query family without a new id — decide there before minting. Not on any decline list or the corpus-blocked roster (verified against both). | anchors: "Thus Zimri destroyed all the house of Baasha, according to the LORD’s word which he spoke against Baasha by Jehu the prophet" (16:12); "according to the LORD’s word, which he spoke by Joshua the son of Nun" (16:34); companion refs 15:29; 22:38. Realistic queries: "fulfilled prophecy in the bible", "does god keep his word", "prophecies that came true in the bible".
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 17 (subdivided: 17:1–7; 17:8–16; 17:17–24)
Existing tags (book doc): `gods-provision`, `trust-in-god`, `pastoral-prayer-for-healing`, `lament`
### Applied-tag deltas
- KEEP `gods-provision` — bread and meat by ravens — "I have commanded the ravens to feed you there." (17:4), "The ravens brought him bread and meat in the morning, and bread and meat in the evening" (17:6) — and the jars that outlast the famine: "The jar of meal didn’t run out and the jar of oil didn’t fail, according to the LORD’s word, which he spoke by Elijah." (17:16).
- KEEP `trust-in-god` — the widow stakes her last meal on the word: "She went and did according to the saying of Elijah; and she, he, and her household ate many days." (17:15), as Elijah had done at Cherith — "So he went and did according to the LORD’s word" (17:5).
- KEEP `pastoral-prayer-for-healing` — one widow's household, the personal-crisis register (book doc Decisions record #3): "He cried to the LORD... “LORD my God, please let this child’s soul come into him again.” The LORD listened to the voice of Elijah; and the soul of the child came into him again, and he revived." (17:20-22).
- KEEP `lament` — a protest prayed straight at God and answered: "LORD my God, have you also brought evil on the widow with whom I am staying, by killing her son?" (17:20). (This ref is the book's recorded append to the Joel `lament` row; the §1(c) personal-grief decline pattern is not disturbed — this is a complaint-to-God, not raw grief.)
- ADD `care-for-widows` — engine pack whose register ("widow; does god care for widows; god of the fatherless", with Ruth-narrative anchors) is the chapter's middle movement: God directs his prophet to a starving widow — "Behold, I have commanded a widow there to sustain you." (17:9) — and sustains her house through the famine: "make me a little cake from it first... For the LORD, the God of Israel, says, ‘The jar of meal will not run out, and the jar of oil will not fail, until the day that the LORD sends rain on the earth.’" (17:13-14), then gives her back her son alive — "Elijah said, “Behold, your son lives.”" (17:23). Substantial presence: a widow's plight, provision, and restoration occupy 17:8-24.
### Anchor-extension candidates
- gods-provision | 1 Kings 17:8-16 | "For the LORD, the God of Israel, says, ‘The jar of meal will not run out, and the jar of oil will not fail, until the day that the LORD sends rain on the earth.’" (17:14) | 0.85 — the famine-provision narrative the pack's lexicon ("famine in the land; when resources run out") is built for, with no Kings anchor today.
- care-for-widows | 1 Kings 17:8-16 | "Behold, I have commanded a widow there to sustain you." (17:9) | 0.75 — the Zarephath widow joins the pack's Ruth anchors as its provision-in-extremity case.
- pastoral-prayer-for-healing | 1 Kings 17:20-22 | "The LORD listened to the voice of Elijah; and the soul of the child came into him again, and he revived." (17:22) | 0.75 — the pack's four anchors have no OT narrative answer-scene; the book doc already argued this chapter into the pack's register.
### Lexicon candidates
- gods-provision | the jar of meal will not run out; widow of zarephath | realistic query phrasings: "widow of zarephath story", "the flour and oil that did not run out", "god provides in famine" (restates the book's recorded near-covered flag, tag-gaps-review §3.5 1 Kings note)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None (5 tags, under the soft cap; the ADD is a new-vocabulary catch, not a re-litigation — `care-for-widows` entered the engine after this book was tagged).

## 1 Kings 18 (subdivided: 18:1–15; 18:16–40; 18:41–46)
Existing tags (book doc): `prayer`, `worship`, `trust-in-god`, `false-prophets`, `fear-of-the-lord`, `idolatry`, `wholehearted-devotion`
### Applied-tag deltas
- KEEP `prayer` — the fire falls on a prayer, not a performance: "Hear me, LORD, hear me, that this people may know that you, LORD, are God, and that you have turned their heart back again." (18:37-38), and the rain comes while Elijah bows "on the earth, and put his face between his knees" (18:42), sending his servant back "seven times" (18:43).
- KEEP `worship` — the day's whole question is whom Israel will worship: "How long will you waver between the two sides? If the LORD is God, follow him; but if Baal, then follow him." (18:21), answered face-down: "The LORD, he is God! The LORD, he is God!" (18:39).
- KEEP `trust-in-god` — one prophet stakes everything on God answering: "I, even I only, am left as a prophet of the LORD; but Baal’s prophets are four hundred fifty men." (18:22); "The God who answers by fire, let him be God." (18:24); "I have done all these things at your word." (18:36).
- KEEP `false-prophets` — rival-god prophets en masse: from morning to the evening offering they cry, leap, and cut themselves "until the blood gushed out on them" (18:28), "but there was no voice, no answer, and nobody paid attention" (18:29).
- KEEP `fear-of-the-lord` — the theme lived under hostile power: "Now Obadiah feared the LORD greatly" (18:3), hiding and feeding a hundred prophets (18:4, 13); "But I, your servant, have feared the LORD from my youth." (18:12).
- KEEP `idolatry` — the sin behind the drought named to the king's face: "you have forsaken the LORD’s commandments and you have followed the Baals" (18:18), with the waver-call of 18:21.
- KEEP `wholehearted-devotion` — adopted display tag (roster spelling); the classic call against a divided heart: "How long will you waver between the two sides?" (18:21). Routed to backlog: wholehearted-devotion (roster row 18 — which itself records 18:21 as in-corpus but "owned by idolatry"; the divided-heart register rides that row's re-pin resolution).
- No adds — `signs-and-wonders` considered (the fire-answer is a divine attestation miracle, 18:38-39): at 7 tags the tag would be broad-duplicating-specific — the fire's substance already carries the `prayer`/`trust-in-god`/`worship` justifications; offered as an anchor extension instead (below). `no-other-god` considered for 18:39's confession: single-verse; offered as an anchor extension instead.
### Anchor-extension candidates
- prayer | 1 Kings 18:36-38 | "Hear me, LORD, hear me, that this people may know that you, LORD, are God, and that you have turned their heart back again." (18:37) | 0.8 — the answered-prayer narrative for "God answered by fire" and persistent-rain-prayer queries (18:41-45 rides the same range decision).
- false-prophets | 1 Kings 18:26-29 | "They cried aloud, and cut themselves in their way with knives and lances until the blood gushed out on them." (18:28), "but there was no voice, no answer, and nobody paid attention." (18:29) | 0.7 — the empty-rival-prophecy scene; NOTE the repo fixture carries this chapter as a pastoral harm gate for "prophets cutting themselves" (book doc Decisions record #10) — curator should honor that gate when weighting.
- no-other-god | 1 Kings 18:39 | "When all the people saw it, they fell on their faces. They said, “The LORD, he is God! The LORD, he is God!”" (18:39) | 0.65 — the pack already anchors 1 Kgs 8:60; the Carmel confession is the narrative twin.
- signs-and-wonders | 1 Kings 18:36-39 | "Then the LORD’s fire fell and consumed the burnt offering, the wood, the stones, and the dust; and it licked up the water that was in the trench." (18:38) | 0.7 — the pack's anchors are all NT; "miracles in the bible" queries plausibly want Carmel.
### Lexicon candidates
- prayer | elijah prayed for rain | realistic query phrasings: "elijah praying for rain", "keep praying when nothing happens", "praying seven times"
- false-prophets | prophets of baal | realistic query phrasings: "elijah and the prophets of baal", "the contest on mount carmel", "the god who answers by fire"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Soft cap 6 exceeded (7 tags, each independently clearing the bar). Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None (no yields; the two considered-and-not-tagged candidates are recorded in the deltas with their anchor-extension routing).

## 1 Kings 19 (subdivided: 19:1–8; 19:9–18; 19:19–21)
Existing tags (book doc): `pastoral-hope-in-despair`, `presence-of-god`, `loneliness`, `gods-provision`, `angels`, `remnant`
### Applied-tag deltas
- KEEP `pastoral-hope-in-despair` — the pack's register exactly (its own anchors include 1 Kgs 19:4-7): "he requested for himself that he might die, and said, “It is enough. Now, O LORD, take away my life; for I am not better than my fathers.”" (19:4) — met with food, sleep, presence, and a future (19:5-18).
- KEEP `presence-of-god` — the LORD passes by, and is not in the wind, earthquake, or fire: "After the fire, there was a still small voice." (19:12), and Elijah wraps his face in his mantle (19:13).
- KEEP `loneliness` — "I, even I only, am left; and they seek my life, to take it away." (19:10, repeated 19:14), answered with seven thousand unbowed (19:18) and a companion: "Then he arose, and went after Elijah, and served him." (19:21).
- KEEP `gods-provision` — "there was at his head a cake baked on the coals, and a jar of water" (19:6), twice, "because the journey is too great for you" (19:7), and "he... went in the strength of that food forty days and forty nights" (19:8).
- KEEP `angels` — the canon's gentlest angel scene: "behold, an angel touched him, and said to him, “Arise and eat!”" (19:5); "The LORD’s angel came again the second time" (19:7).
- KEEP `remnant` — the pack ALREADY anchors 1 Kings 19:18 (w0.9): "Yet I reserved seven thousand in Israel, all the knees of which have not bowed to Baal, and every mouth that has not kissed him." (19:18).
- No adds — `rest-for-the-weary` considered (sleep and food for the exhausted servant, 19:5-8): broad-duplicating-specific — the scene's rest-and-restoration substance is precisely `pastoral-hope-in-despair`'s own 19:4-7 anchor and the `gods-provision` justification; declined at this density. `guidance` considered for the still small voice: the chapter depicts God speaking to a despairing prophet, not guidance-seeking teaching; the recorded routing (tag-gaps-review §3.5, 1 Kings note: "still small voice" → the `guidance` hearing-God's-voice lexicon flag) is honored as a lexicon candidate below, not a tag.
### Anchor-extension candidates
- presence-of-god | 1 Kings 19:11-13 | "After the earthquake a fire passed; but the LORD was not in the fire. After the fire, there was a still small voice." (19:12) | 0.75 — "still small voice" queries currently have no anchor home; the pack's Ps 139/James 4 anchors don't carry this scene.
### Lexicon candidates
- guidance | still small voice | realistic query phrasings: "what is the still small voice", "how does god speak to us", "gods gentle whisper" (restates the recorded §3.5 flag — joins the 1 Samuel hearing-God's-voice lexicon-review item)
- pastoral-hope-in-despair | elijah under the juniper tree | realistic query phrasings: "elijah wanted to die", "ministry burnout in the bible", "when serving god wears you out" (restates the recorded §3.5 flag; the pack already anchors 19:4-7)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Soft cap 6 reached exactly. Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 20 (subdivided: 20:1–12; 20:13–34; 20:35–43)
Existing tags (book doc): `gods-protection`, `divine-judgment`, `deliverance`
### Applied-tag deltas
- KEEP `gods-protection` — two impossible deliverances, each with its stated purpose: "Have you seen all this great multitude? Behold, I will deliver it into your hand today. Then you will know that I am the LORD." (20:13); the second expressly answering the slander "The LORD is a god of the hills, but he is not a god of the valleys" — "therefore I will deliver all this great multitude into your hand, and you shall know that I am the LORD." (20:28).
- KEEP `divine-judgment` — the acted parable and its sentence: "Because you have let go out of your hand the man whom I had devoted to destruction, therefore your life will take the place of his life, and your people take the place of his people." (20:42), with the lion's judgment on the man who "have not obeyed the LORD’s voice" (20:36) beside it.
- KEEP `deliverance` — adopted display tag (roster spelling); the plain rescue register with its purpose clause, twice (20:13, 28). Routed to backlog: deliverance (roster row 32 — 1 Kgs 20 is among that row's own requested refs; the row's measured "god will deliver you" misroute finding is recorded there for the re-pin).
- No adds — `obedience-to-the-word` stays OFF for the struck-prophet scene (20:35-36) per the book doc's Decisions record #7 (failure-mode rule); `mercy` considered for "the kings of the house of Israel are merciful kings" (20:31): a Syrian servants' gambit that the chapter's verdict scene overturns — not the concept's teaching substance; `humble-exaltation` considered for "Don’t let him who puts on his armor brag like he who takes it off." (20:11): a proverb-flash in a war narrative, thin single-verse.
### Anchor-extension candidates
- None (the deliverance-register texts ride roster row 32; extending `gods-protection` — a Psalm-91 personal-refuge pack — with battle texts would blur the very boundary the roster row exists to design).
### Lexicon candidates
- None.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (3 sections) → per-verse refinement candidate.
### Decisions record
- None.

## 1 Kings 21
Existing tags (book doc): `sin`, `honesty`, `divine-judgment`, `repentance`, `covetousness`, `fasting`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `sin` — coveting, false witness, judicial murder, and theft in one royal act, summed by the text: "I have found you, because you have sold yourself to do that which is evil in the LORD’s sight." (21:20; also 21:25).
- KEEP `honesty` — the crime's machinery is manufactured testimony: "she wrote letters in Ahab’s name and sealed them with his seal" (21:8); "Set two men, wicked fellows, before him, and let them testify against him" (21:10).
- KEEP `divine-judgment` — the sentence in the stolen vineyard: "In the place where dogs licked the blood of Naboth, dogs will lick your blood, even yours." (21:19); the house sentenced like Jeroboam's and Baasha's (21:22); "The dogs will eat Jezebel by the rampart of Jezreel." (21:23).
- KEEP `repentance` — reported in God's own words, sincerity not adjudicated (book doc Decisions record #9): "See how Ahab humbles himself before me? Because he humbles himself before me, I will not bring the evil in his days" (21:29), on the sackcloth and fasting of 21:27.
- KEEP `covetousness` — the pack ALREADY anchors 1 Kings 21:1-16 (w0.8): "Give me your vineyard, that I may have it for a garden of herbs" (21:2), refused on the LORD's ground — "May the LORD forbid me, that I should give the inheritance of my fathers to you!" (21:3) — and the king "sullen and angry... would eat no bread" (21:4), desire ripening into murder and seizure (21:15-16).
- KEEP `fasting` — both edges in one chapter: "Proclaim a fast, and set Naboth on high among the people." (21:9, done 21:12) as cover for murder, and Ahab's real self-humbling fast God acknowledges (21:27-29).
- KEEP `justice-and-oppression` — legal process operated as a weapon: the elders "did as Jezebel had instructed them in the letters" (21:11), the fabricated capital charge "Naboth cursed God and the king!" (21:13), the stoning, and the LORD's word at the gate: "Have you killed and also taken possession?" (21:19).
- ADD `slander-and-false-accusation` — engine pack whose register ("falsely accused; false witnesses against me") is the chapter's engine: "Set two men, wicked fellows, before him, and let them testify against him, saying, ‘You cursed God and the king!’ Then carry him out, and stone him to death." (21:10); executed verbatim — "The wicked fellows testified against him, even against Naboth, in the presence of the people, saying, “Naboth cursed God and the king!”" (21:13). Naboth is Scripture's clearest narrative of an innocent man destroyed by procured false witness; distinct substance from `honesty` (the liars' sin) and `justice-and-oppression` (the state machinery) — the victim's side, which is the pack's search register.
### Anchor-extension candidates
- slander-and-false-accusation | 1 Kings 21:8-14 | "The wicked fellows testified against him, even against Naboth, in the presence of the people, saying, “Naboth cursed God and the king!”" (21:13) | 0.7 — the pack's anchors are all psalm/NT first-person; this is its narrative case.
- repentance | 1 Kings 21:27-29 | "Because he humbles himself before me, I will not bring the evil in his days; but I will bring the evil on his house in his son’s day." (21:29) | 0.6 — God's own acknowledgment of a wicked king's self-humbling; gist caution — describe, don't adjudicate sincerity (the book doc's #9 wording is the model).
- fasting | 1 Kings 21:27-29 | "he tore his clothes, put sackcloth on his body, fasted, lay in sackcloth, and went about despondently" (21:27) | 0.55 — a fast God visibly weighs; word any use carefully against the same chapter's weaponized fast (21:9, 12), per the book's own tag-gap caution.
### Lexicon candidates
- covetousness | naboths vineyard | realistic query phrasings: "story of naboth's vineyard", "ahab and naboth", "coveting a neighbor's property"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- HARD CEILING 8 hit (8 tags, each independently clearing the bar; no candidate beyond 8). NOT subdivided in the book doc — the ceiling alone marks it → per-verse refinement candidate.
### Decisions record
- Ceiling reached without yields: the ADD lands as the 8th tag; candidates beyond 8 were judged below the bar, not yielded (`envy-and-jealousy` — the chapter's desire is coveting a thing, already the `covetousness` pack's own anchor, not resenting a person; `pastoral-refuge-and-justice` — barred by the project-wide pastoral-register ruling on this chapter's national-scale injustice, book doc Decisions record #3).

## 1 Kings 22 (subdivided: 22:1–28; 22:29–40; 22:41–50; 22:51–53)
Existing tags (book doc): `pleasing-god-not-people`, `dreams-and-visions`, `divine-judgment`, `false-prophets`
### Applied-tag deltas
- KEEP `pleasing-god-not-people` — Micaiah under maximum pressure to join the four hundred: "Please let your word be like the word of one of them, and speak good." — "As the LORD lives, what the LORD says to me, that I will speak." (22:13-14), at the price of a slap (22:24) and "bread of affliction and... water of affliction" (22:27).
- KEEP `dreams-and-visions` — Micaiah's two reported visions: "I saw all Israel scattered on the mountains, as sheep that have no shepherd." (22:17) and "I saw the LORD sitting on his throne, and all the army of heaven standing by him on his right hand and on his left." (22:19).
- KEEP `divine-judgment` — the word finds the disguised king: "A certain man drew his bow at random, and struck the king of Israel between the joints of the armor." (22:34); he dies at evening (22:35), and "the dogs licked up his blood... according to the LORD’s word which he spoke." (22:38).
- KEEP `false-prophets` — the classic discernment scene: "about four hundred men... said, “Go up; for the Lord will deliver it into the hand of the king.”" (22:6) against one, with the mechanism explained to Ahab truthfully before he rides: "the LORD has put a lying spirit in the mouth of all these your prophets; and the LORD has spoken evil concerning you." (22:23; signposted, not adjudicated — book doc Decisions record #8).
- No adds — `honesty` considered for Micaiah's truth-telling: broad-duplicating-specific here — the truth-under-pressure substance IS the `pleasing-god-not-people` justification; `trusting-in-man` considered for the echo-chamber court: the four hundred are carried by `false-prophets`; neither clears the bar as separate substance.
### Anchor-extension candidates
- false-prophets | 1 Kings 22:19-23 | "Now therefore, behold, the LORD has put a lying spirit in the mouth of all these your prophets; and the LORD has spoken evil concerning you." (22:23) | 0.75 — the majority-report-versus-true-word scene; gist caution per the book doc's #8 (quote the mechanism, adjudicate nothing).
- pleasing-god-not-people | 1 Kings 22:13-14 | "As the LORD lives, what the LORD says to me, that I will speak." (22:14) | 0.75 — the pack's anchors (Gal 1:10; Prov 29:25) are propositional; Micaiah is the narrative spine for "courage to speak the truth" phrasings.
### Lexicon candidates
- false-prophets | micaiah | realistic query phrasings: "micaiah and the 400 prophets", "the lying spirit in 1 kings 22", "prophets who say what the king wants to hear"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- Book-doc subdivision (4 sections) → per-verse refinement candidate.
### Decisions record
- None.

---

# Book rollup — 1 Kings (22/22 chapters swept)

- Applied-tag deltas: **7 ADD** (ch 2 `oaths-and-vows`; chs 6, 8, 9 `the-house-of-god`; ch 11 `backsliding`; ch 17 `care-for-widows`; ch 21 `slander-and-false-accusation`), **88 KEEP**, **1 DROP** (ch 8 `wholehearted-devotion`, §11.6 yield at the hard ceiling, Decisions-recorded, routed to roster row 18). All six adds of engine ids are new-vocabulary catches — every added engine id entered the library after this book was tagged at b3f491d, except `oaths-and-vows` (ch 2), which extends a tag the book already uses on ch 1.
- Anchor-extension candidates: **31** (per-chapter above; densest on chs 8 and 18).
- Lexicon candidates: **14** rows across 11 chapters.
- New-concept candidates: **1** — `word-of-the-lord-fulfilled` (ch 16 block), CHECK-FIRST flagged against a `gods-faithfulness` lexicon extension before any mint; verified absent from the declines and the corpus-blocked roster.
- Decline-overturn proposals: **0** — no §3 decline was found wanting on new textual evidence; the three §3.5 1-Kings "noted, not logged" lexicon flags (still small voice → `guidance`; juniper-tree burnout → `pastoral-hope-in-despair`; jar-of-meal → `gods-provision`) are restated as lexicon candidates in their chapters, which is the routing those notes themselves prescribe.
- Corpus-blocked routings (route, don't duplicate — all ride PR-β): `davidic-covenant` row 44 (chs 2, 8, 9, 11; ref note 15:4-5); `death-and-burial` row 22 (chs 2, 13, 14); `counsel-and-advisers` row 15 (ch 12); `wholehearted-devotion` row 18 (ch 8 yield, chs 11, 15, 18); `deliverance` row 32 (ch 20); `god-looks-at-the-heart` row 6 (8:39 ref note). The Jesse-gated items on those rows (rows 6/18/21 one-design ruling; row 45; end-times) are untouched and un-prejudged here.
- Per-verse refinement candidates: **18 chapters** — 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 (book-doc subdivided), 21 (hard ceiling, not subdivided), 22 (subdivided). Hard-ceiling chapters: **8, 11, 21**. Only chapters 1, 4, 5, 6 need no refinement pass.
- Book-doc integrity: /mnt/project-files/research/bible-rollout/1-kings.md was read as prior art and NOT modified; its Decisions-record rulings (#3 pastoral register, #4 anti-formula, #7 failure-mode obedience, #8-#11) were honored, not re-litigated. tag-gaps.md was NOT touched (this worker's brief: ledger file only).

## Vocabulary cross-check against the canonical §11.1 list (added mid-sweep)

The header above cites the BRIEFING §7 reconstruction because `tag-apply/adopted-concepts.md`
was missing at sweep start. Mid-sweep (2026-08-26) the coordinator announced the canonical
file now exists at `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`
(161 ids, engine-built markers). Cross-check performed before this final block: every
non-engine id used in this ledger — `davidic-covenant`, `death-and-burial`,
`counsel-and-advisers`, `wholehearted-devotion`, `deliverance`, plus the routed-only
`god-looks-at-the-heart` — appears on the canonical list (all marked engine-built: no),
and every other tag id in this ledger resolves against the 239 engine basenames.
**No mismatch; no correction entries needed.** The canonical file supersedes the header's
reconstruction reference from this point.

## Survival audit (CONVENTIONS §9, final delivery)

Performed after the last chapter append and this rollup's staging, 2026-08-26:

1. Whole-file re-read: header present and byte-unchanged (spot-verified after every append);
   all 22 chapter blocks present exactly once (`^## 1 Kings ` count = 22); all 154 section
   markers present (22 × 7 legend sections); no truncation (file ends with this audit block).
2. Delta integrity: mechanical grep counts match the rollup — 7 ADD / 88 KEEP / 1 DROP;
   13 routed-to-backlog lines.
3. Quote integrity: 95 distinct quoted WEB strings from this ledger were re-verified
   byte-for-byte (grep -F) against the pinned VPL
   (pipeline/sources/vpl/engwebp_vpl.txt, contentSha256 944e3883…) — all matched, zero
   failures, curly punctuation intact. The scratchpad working copy of the 1KI text was
   additionally diffed against a fresh VPL extraction: identical (no shared-scratchpad
   clobber affected this ledger).
4. No other shared file was written by this worker.

RESULT: PASS — all contributions survive in the live file; prior bytes unchanged.
