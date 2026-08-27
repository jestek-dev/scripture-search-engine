# 2 Thessalonians — Layer-3 tag-sweep ledger

**Book:** 2 Thessalonians (3 chapters, 47 verses; VPL code `2TH`)
**Repo SHA:** `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (origin/main, engine 0.14.0, 239 concept packs)
**Date:** 2026-08-26
**Sweep worker:** Pauline-epistles group (1–2 Thessalonians assignment)
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/2-thessalonians.md` (prior art — 18 existing tag instances); full 239-id engine library (`ontology/concepts/` at the SHA above, packs read directly); 161-id adopted display list (union vocabulary 303 ids); `tag-gaps-review.md` §1/§3 (incl. the §3.5 2-Thessalonians decline block); corpus-blocked 50-row roster; CONVENTIONS §3/§4/§5/§6/§9/§11.
**WEB provenance, honestly stated:** the CI fixture corpus (`pipeline/fixtures/web-subset.json`) contains ZERO 2 Thessalonians verses, so no verse of this book has a fixture witness. Every quotation below was checked word-for-word against the repo-pinned ebible.org engwebp VPL snapshot itself (sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`, verified against `pipeline/manifests/web.json` — the pinned edition, not a current-edition fetch). That pinned VPL is this ledger's sole textual authority for all three chapters — an upgrade on the book doc's 2026-08-23 provenance, which was current-edition-only for the whole book.
**Standing routing honored:** the prior rollout folded this letter's man-of-lawlessness material into the 1 John–homed `antichrist` row; the engine `antichrist` pack now anchors 2 Thessalonians 2:1-12 with the binding three-word-family lexicon rule and the no-identification rule. This sweep respects that routing throughout.
**Tag-id validation:** every id in this ledger was mechanically checked against `engine-ids.txt` (239) ∪ `adopted-161.txt` (161); ids marked *(adopted, display-only)* have no engine pack yet.

Existing 2 Thessalonians anchors in the engine at this SHA (so extension candidates below are non-duplicates): 2 Th 2:1-12 (antichrist); 2:13-14 (election-and-predestination); 2:16-17 (god-of-all-comfort); 3:14-15 (church-discipline). Chapters 1 and 3 (outside 3:14-15) carry no anchors anywhere in the library.

---

## 2 Thessalonians 1

**Applied-tag deltas** (book doc carries 5; all re-verified against the pinned WEB text):
- KEEP `thanksgiving` — "We are bound to always give thanks to God for you, brothers" (1:3), because faith and love keep growing.
- KEEP `suffering-for-christ` — "your perseverance and faith in all your persecutions and in the afflictions which you endure" (1:4), suffering for "God’s Kingdom, for which you also suffer" (1:5).
- KEEP `divine-judgment` — "For it is a righteous thing with God to repay affliction to those who afflict you" (1:6), "punishing those who don’t know God" (1:8).
- KEEP `second-coming` — "when the Lord Jesus is revealed from heaven with his mighty angels in flaming fire" (1:7), coming "to be glorified in his saints" (1:10).
- KEEP `hell` — "eternal destruction from the face of the Lord and from the glory of his might" (1:9). The book doc's reviewer ruling (substance-bound, not lexicon-bound) re-checked and affirmed; the Gehenna-imagery mismatch stays a lexicon question, addressed below.
- No adds, no drops. Considered and declined: `prayer` (1:11 — a single closing intercession verse, not prayer teaching); `glory-of-god` (1:9–12 — the register here is Christ glorified in his saints and his name in them, not the pack's glory-of-God register; would misroute "show me your glory" queries); `vengeance` as a tag (1:6 — divine recompense stated in one verse; carried as an anchor candidate instead, below).

**Anchor-extension candidates** (no pack anchors this chapter today):
- `divine-judgment` — 2 Thessalonians 1:6-9, "For it is a righteous thing with God to repay affliction to those who afflict you" (1:6) … "punishing those who don’t know God" (1:8) — two-directional judgment stated as teaching; proposed weight 0.8.
- `hell` — 2 Thessalonians 1:9, "who will pay the penalty: eternal destruction from the face of the Lord and from the glory of his might" — one of the NT's plainest eternal-punishment statements; proposed weight 0.7.
- `second-coming` — 2 Thessalonians 1:7-10, "when the Lord Jesus is revealed from heaven with his mighty angels in flaming fire" (1:7); "when he comes in that day to be glorified in his saints" (1:10) — the revelation-from-heaven register; proposed weight 0.6.
- `suffering-for-christ` — 2 Thessalonians 1:4-5, "your perseverance and faith in all your persecutions and in the afflictions which you endure. This is an obvious sign of the righteous judgment of God" (1:4-5) — persecution as evidence of worthiness; proposed weight 0.6.
- `vengeance` — 2 Thessalonians 1:6-8, "For it is a righteous thing with God to repay affliction to those who afflict you" (1:6) — God as the one who repays (the pack's Romans-12:19 register); proposed weight 0.5, with a dual note against the `divine-judgment` candidate above (both genuinely claim 1:6 — record the dual, or let the curator pick one).

**Lexicon candidates:**
- `hell` — "eternal destruction"; "separated from god forever" (the 1:9 idiom the current Gehenna-shaped lexicon cannot reach — the book doc's recorded lexicon-tuning question, made concrete).
- `vengeance` — "will god punish those who hurt me"; "god will repay" (adjacency note: `divine-judgment` is the other honest home; assign to one pack only).

**New-concept candidates:** none.

**Decline-overturn proposals:** none (the §3.5 decline "eternal punishment (1:9) → covered: `hell` and `divine-judgment` jointly serve it" is confirmed, not contested — the anchor candidates above are how the coverage becomes real).

**Ceiling/subdivision marker:** no — 5 tags; chapter left whole in the book doc (its Decisions 3 records the BSB 1:5 break as declined).

---

## 2 Thessalonians 2

**Applied-tag deltas** (book doc carries 6; all re-verified against the pinned WEB text):
- KEEP `second-coming` — the chapter's question is "the coming of our Lord Jesus Christ" (2:1): the claim "that the day of Christ has already come" (2:2) is false, and the lawless one is destroyed "by the manifestation of his coming" (2:8).
- KEEP `divine-judgment` — "God sends them a powerful delusion, that they should believe a lie" (2:11), "that they all might be judged who didn’t believe the truth, but had pleasure in unrighteousness" (2:12).
- KEEP `salvation` — "God chose you from the beginning for salvation through sanctification of the Spirit and belief in the truth" (2:13).
- KEEP `god-of-all-comfort` — the closing prayer to the God "who loved us and gave us eternal comfort and good hope through grace" (2:16), asked to "comfort your hearts and establish you in every good work and word" (2:17). The pack anchors 2:16-17.
- KEEP `antichrist` — this letter's word family for the figure: "the man of sin is revealed, the son of destruction" (2:3), who "sits as God in the temple of God, setting himself up as God" (2:4), destroyed "by the manifestation of his coming" (2:8). Described exactly as the text describes him, no identification offered — per the pack's own no-identification rule and the book doc's Decisions 4. The pack anchors 2:1-12.
- KEEP `election-and-predestination` — "God chose you from the beginning for salvation through sanctification of the Spirit and belief in the truth" (2:13), election stated as ground for thanks. The pack anchors 2:13-14; its §4-neutral gist is the binding posture — reported, not adjudicated.
- No adds, no drops. Considered and declined: `day-of-the-lord` (2:2 — WEB here reads "the day of Christ", a single-verse phrase witness; the tag-apply skip stands: "The chapter's tag home remains `second-coming`"); `satan` (2:9, "according to the working of Satan with all power and signs and lying wonders" — a single attributive clause, no Satan teaching); `signs-and-wonders` (2:9 — counterfeit "lying wonders"; the pack's register is God's genuine miracles, so tagging would misroute miracle queries to a deception text); `gathering-together` and `caught-up-together` non-uses re-affirmed on 2:1 (book doc Decisions 5 and 6 — the eschatological assembling is not the meeting-together register, and this chapter teaches what precedes the day, not the catching up).

**Routed to the corpus-blocked roster (route, don't duplicate):**
- `end-times` *(adopted, display-only)* — this chapter is prime end-times material (rebellion, man of sin, restrainer, 2:1–12), but the id sits on roster row 5 (DEFERRED, corpus-blocked) with an OPEN Jesse question: merge-or-two-ids vs `day-of-the-lord` (flagged item 1). Routed: corpus-blocked roster row 5, with 2 Th 2:1-12 noted as an in-letter witness for whenever that design is decided. CONTINGENT — no scope decided here.
- `truth` *(adopted, display-only)* — "because they didn’t receive the love of the truth, that they might be saved" (2:10) and "belief in the truth" (2:13) are real truth-register material, but the id sits on roster row 42 (DEFERRED-to-re-pin; the what-is-truth register waits for its John 17–18 texts). Routed: corpus-blocked roster row 42, refs noted for that row's curator.

**Anchor-extension candidates:**
- `divine-judgment` — 2 Thessalonians 2:11-12, "God sends them a powerful delusion, that they should believe a lie, that they all might be judged who didn’t believe the truth" (2:11-12) — judicial delusion; proposed weight 0.5. (The §3.5 decline routed this material "contextually under divine-judgment"; this makes the routing concrete.)
- `salvation` — 2 Thessalonians 2:13-14, "God chose you from the beginning for salvation through sanctification of the Spirit and belief in the truth" (2:13) — proposed weight 0.4, dual note: `election-and-predestination` already anchors 2:13-14 for the election register; this would claim the salvation-through-sanctification register (record the dual in both packs, or let election's anchor stand alone).
- `obedience-to-the-word` — 2 Thessalonians 2:15, "stand firm and hold the traditions which you were taught by us" — holding taught teaching; proposed weight 0.4 (the book doc's motif 6 home).
- `second-coming` deliberately NOT extended here: the pack already carries nine anchors, and pointing return-of-Christ queries at the man-of-sin passage would repeat the misroute the book doc's Decisions 6 guards against; the `antichrist` pack's 2:1-12 anchor already owns this text.

**Lexicon candidates:**
- `antichrist` — "who is the restrainer"; "the mystery of lawlessness"; "the falling away" (all three are 2 Th 2 phrasings no current entry serves; the pack's three-word-family rule welcomes them).
- `divine-judgment` — "god sends a strong delusion"; "strong delusion" (the §3.5 decline's own "lexicon-tuning at most", delivered).
- `obedience-to-the-word` — "hold to the traditions"; "stand firm in the faith" (contingent on the 2:15 anchor above).

**New-concept candidates:** none — every residual register checked against the 303-id union, the declines (powerful delusion → divine-judgment; forged letters → not a plausible search intent, §3.5), and the roster (rows 5 and 42 routed above).

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** SUBDIVISION — 6 tags (soft cap, under the ceiling), but the chapter is subdivided in the book doc (2:1–12 / 2:13–17), so it is flagged for the per-verse refinement pass; the two roster routings above ride that pass.

---

## 2 Thessalonians 3

**Applied-tag deltas** (book doc carries 7; all re-verified against the pinned WEB text):
- KEEP `prayer` — "Finally, brothers, pray for us, that the word of the Lord may spread rapidly and be glorified" (3:1).
- KEEP `gods-faithfulness` — "But the Lord is faithful, who will establish you and guard you from the evil one." (3:3).
- KEEP `work-and-diligence` — the standing rule: "If anyone is not willing to work, don’t let him eat." (3:10); Paul's own "in labor and travail worked night and day" (3:8); the idle commanded "that they work with quietness and eat their own bread" (3:12).
- KEEP `do-not-lose-heart` — "But you, brothers, don’t be weary in doing what is right." (3:13). The book doc's borderline-kept ruling re-checked and affirmed (single verse, but the concept's substance verbatim; the pack's lexicon carries "weary in doing good").
- KEEP `benediction` — "Now may the Lord of peace himself give you peace at all times in all ways." (3:16); "The grace of our Lord Jesus Christ be with you all. Amen." (3:18). (PR #43 id, ratified 2026-08-25.)
- KEEP `church-discipline` — "withdraw yourselves from every brother who walks in rebellion" (3:6); "note that man and have no company with him, to the end that he may be ashamed" (3:14); "Don’t count him as an enemy, but admonish him as a brother." (3:15). The pack anchors 3:14-15.
- KEEP `discipleship` — "For you know how you ought to imitate us." (3:7); "to make ourselves an example to you, that you should imitate us" (3:9).
- No adds, no drops. Considered and declined: `peace-of-god` (3:16 — the book doc's Decisions 8 non-use re-affirmed: a benediction line, not peace teaching; tagging would route anxiety queries to a closing blessing); `supporting-gospel-workers` (3:1 — praying for the word's spread is intercession, not the pack's material-support register; and 3:8–9's refusing support is that register's inverse); `pleasing-god-not-people` (3:7–9's self-support parallels 1 Th 2:9 but the chapter states it as work-example teaching, already carried by `work-and-diligence` and `discipleship`).

**Anchor-extension candidates** (only 3:14-15 is anchored today):
- `work-and-diligence` — 2 Thessalonians 3:10-12, "If anyone is not willing to work, don’t let him eat." (3:10); "work with quietness and eat their own bread" (3:12) — the register's bluntest biblical statement, currently unreachable through any anchor; proposed weight 0.9.
- `gods-faithfulness` — 2 Thessalonians 3:3, "But the Lord is faithful, who will establish you and guard you from the evil one." — proposed weight 0.6.
- `do-not-lose-heart` — 2 Thessalonians 3:13, "But you, brothers, don’t be weary in doing what is right." — the phrase family its lexicon already carries; proposed weight 0.5.
- `benediction` — 2 Thessalonians 3:16-18, "Now may the Lord of peace himself give you peace at all times in all ways." (3:16) — proposed weight 0.5.
- `discipleship` — 2 Thessalonians 3:7-9, "to make ourselves an example to you, that you should imitate us" (3:9) — the deliberate-example register; proposed weight 0.5.
- `prayer` — 2 Thessalonians 3:1-2, "pray for us, that the word of the Lord may spread rapidly and be glorified" (3:1) — praying for gospel workers; proposed weight 0.4.

**Lexicon candidates:**
- `work-and-diligence` — "what does the bible say about laziness"; "if a man will not work he shall not eat"; "laziness in the bible" (no current entry carries the laziness/idleness word family at all).

**New-concept candidates:** none — the idleness theme's §3.5 decline ("idleness / laziness (2Th 3:6–12) → covered: `work-and-diligence`") is confirmed by this sweep; the anchor + lexicon candidates above are the delivery of that routing, not a new id.

**Decline-overturn proposals:** none.

**Ceiling/subdivision marker:** SUBDIVISION — 7 tags (above the soft cap, under the ceiling; each independently clears the bar), and the chapter is subdivided in the book doc (3:1–5 / 3:6–15 / 3:16–18), so it is flagged for the per-verse refinement pass.

---

## Decisions record — 2 Thessalonians sweep (2026-08-26)

Every yield and judgment call in this sweep, each a reversible default Jesse can overturn. No existing tag was dropped and none was added anywhere in this book — all 18 prior tag instances were re-verified against the pinned WEB text and kept; the sweep's whole yield is anchor/lexicon candidates and two roster routings.

1. **Ch. 1 declines:** `prayer` (1:11 single closing verse), `glory-of-god` (Christ-glorified-in-saints register, not the pack's; would misroute), `vengeance`-as-tag (single-verse; survives as the 1:6-8 anchor candidate with a recorded dual against `divine-judgment`). Honest-and-empty preferred; ch. 1 stays at 5.
2. **Ch. 1 `hell`/`divine-judgment` duals.** Both candidates claim overlapping 1:6-9 ground; ranges were drawn to minimize overlap (1:6-9 judgment arc vs 1:9 penalty verse) and the `vengeance` dual is flagged — curator assigns, nothing double-claimed silently.
3. **Ch. 2 `end-times` ROUTED, not proposed.** Prime material, but roster row 5 is corpus-blocked-deferred AND the merge-vs-two-ids question against `day-of-the-lord` is Jesse's open call (flagged item 1). Recorded as contingent witness refs on that row; no scope decided by this sweep.
4. **Ch. 2 `truth` ROUTED** to roster row 42 (2:10, 13 refs noted for that row's curator; the what-is-truth register still waits for its John texts).
5. **Ch. 2 declines:** `day-of-the-lord` (2:2's "the day of Christ" — single-verse phrase witness, and the WEB wording differs from the pack's phrase; tag-apply skip stands), `satan` (2:9 attributive clause), `signs-and-wonders` (2:9 "lying wonders" are counterfeit — the genuine-miracles pack must not receive them), `gathering-together` / `caught-up-together` non-uses on 2:1 re-affirmed per the book doc's Decisions 5–6.
6. **Ch. 2 `second-coming` anchor deliberately not extended** — routing return-of-Christ queries into the man-of-sin passage is the misroute the book doc guards against; `antichrist` 2:1-12 owns the text.
7. **Ch. 3 declines:** `peace-of-god` on 3:16 (non-use re-affirmed), `supporting-gospel-workers` (wrong register on 3:1; inverse register at 3:8–9), `pleasing-god-not-people` (material already carried by kept tags).
8. **§3.5 declines confirmed, delivered as extensions:** idleness → `work-and-diligence` (3:10-12 anchor + laziness lexicon), powerful delusion → `divine-judgment` (2:11-12 anchor + "strong delusion" lexicon), eternal punishment → `hell` + `divine-judgment` (1:9 / 1:6-9 anchors). No decline is overturned; each is made reachable.
9. **Doctrinal posture.** The man of sin and the restrainer are described only as the text describes them (per the `antichrist` pack's no-identification rule and the book doc's Decisions 4); 2:11–12 is reported in the text's own causal order; election (2:13) is stated as the text's thanksgiving per the `election-and-predestination` pack's §4-neutral precedent. No timetable, no identification, no adjudication anywhere in this ledger.
10. **Provenance.** Zero fixture witnesses exist for this book; all three chapters were verified against the pinned sha256-matched VPL edition directly — the book's first pinned-text verification (the 2026-08-23 book doc was current-edition-only throughout).

**Corpus-blocked routings this book:** 2 — `end-times` → roster row 5 (contingent, Jesse's merge question open); `truth` → roster row 42.

**Survival audit (CONVENTIONS §9), 2026-08-26:** after the final append, the whole ledger was re-read end-to-end: header + three chapter blocks + this Decisions record present in order, all prior bytes byte-identical at every append (verified by `cmp` against a pre-append snapshot after each of the 5 writes). All ids validated against the 239+161 union; all quotes copied from the pinned VPL text of the chapter being tagged.
