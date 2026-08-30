# Sweep ledger — Haggai

- **Book:** Haggai
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c, identical to main's committed fixture snapshot);
  fixture-witnessed-on-main chapters for this book: none — all of Haggai is expansion-only (87fd68c); every engine candidate below is corpus-blocked until PR-beta merges
- **Inputs read:** BRIEF.md; haggai.md book doc; concept-index.md + packs/;
  declines.md (tag-gaps-review §3 + §1); backlog-roster.md (engine-pack-backlog);
  tag-apply/adopted-concepts.md (canonical §11.1 list, 161 ids with engine-built markers — the engine-built=no subset was checked per chapter; none is honestly present in Haggai, so every applied tag below is also an engine id in the 239 census)

## Haggai 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `obedience-to-the-word` | "obeyed the LORD their God’s voice, and the words of Haggai the prophet" | 1:12 | The rare heeded prophetic sermon — hearing becomes working on the house (1:12–14); prior art upheld |
| keep | `the-lords-discipline` | "I called for a drought on the land" | 1:11 | Corrective discipline of God's own people aimed at the turn 1:12 records ("You looked for much, and, behold, it came to little", 1:9); prior art upheld |
| keep | `presence-of-god` | "I am with you," says the LORD | 1:13 | God's whole answer to the obedient remnant; prior art upheld |
| keep | `putting-god-first` | "Is it a time for you yourselves to dwell in your paneled houses, while this house lies waste?" | 1:4 | The priorities confrontation, with the doubled "Consider your ways." (1:5, 7); the engine pack was minted from this chapter (putting-god-first.yaml anchors Hag 1:2-11); prior art upheld |
| keep | `the-house-of-god` | "Go up to the mountain, bring wood, and build the house. I will take pleasure in it, and I will be glorified" | 1:8 | The chapter's whole subject; pack anchors Hag 1:3-9; prior art upheld |
| keep | `remnant` | "all the remnant of the people, obeyed the LORD their God’s voice" | 1:12 | Phrase witness — the returned remnant obeying and working (1:12, 14); prior art upheld |

No adds, no drops: all six prior-art tags independently clear the presence bar against the 239-id library; no additional engine id is genuinely present (see (f) items 2–3).

### (b) Anchor-extension candidates
- `the-lords-discipline` — Haggai 1:5-11 — "I called for a drought on the land, on the mountains, on the grain, on the new wine, on the oil, on that which the ground produces, on men, on livestock, and on all the labor of the hands." (1:11) — proposed weight 0.80 — the pack has only 2 anchors, both NT (Heb 12:7-11, Rev 3:19); this is the canon's fullest narrated OT instance of corrective covenant discipline explicitly aimed at producing the turn (1:12). CORPUS-BLOCKED rider (Haggai expansion-only; re-check at PR-beta).
- `presence-of-god` — Haggai 1:13 — "I am with you," says the LORD — proposed weight 0.70 — the pack (6 anchors, no OT-narrative "I am with you" witness) gains the promise in its plainest oracle form; sibling occurrence 2:4 noted under Haggai 2 (b). CORPUS-BLOCKED rider.
- `remnant` — Haggai 1:12-14 — "all the remnant of the people, obeyed the LORD their God’s voice" (1:12) — proposed weight 0.60 — a phrase witness (the word "remnant" twice, 1:12, 14) showing the remnant acting, complementing the pack's promise-register anchors; the tag-gaps remnant row (Micah-minted) already carries these Haggai refs in its Where column. CORPUS-BLOCKED rider.
- Verified, no extension needed: `putting-god-first` already anchors Haggai 1:2-11 (weight 0.9 rider) and `the-house-of-god` already anchors Haggai 1:3-9 — both minted from this book; nothing to add.

### (c) Lexicon candidates
- `putting-god-first` — phrase: "consider your ways" — realistic query phrasings: "consider your ways bible verse"; "consider your ways meaning"; "haggai consider your ways" — Haggai's own doubled imperative (1:5, 7; again 2:15, 18); ≥2 significant tokens ({consider, ways}). CAVEAT for the curator: once the expansion corpus lands, the exact phrase is lexically retrievable from 1:5/1:7 themselves, so the row must show a measured miss (ordering/chip value) or it is NO MEASURABLE EFFECT.

### (d) New-concept candidates
- honest-and-empty — none. Checked against the 239 ids and the adopted-display prior art: the chapter's themes (priorities, discipline, presence, obedience, temple, remnant) all have exact engine homes now that `putting-god-first` and `the-house-of-god` (both minted from this book's tag-gap rows) are engine ids.

### (e) Decline-overturn proposals
- honest-and-empty — none. The Haggai per-block decline (declines.md §3.5: "`lament`, `idolatry`, and the justice/oppression rows — no substantial Haggai material") stands; re-read of chapter 1 surfaces no new textual evidence against it.

### (f) Decisions record
1. No yields — 6 tags, at the soft cap, none over.
2. `gods-provision` considered for 1:6-11 (scarcity material) and NOT added: the chapter presents the shortfall as discipline ("Because of my house that lies waste", 1:9), not provision teaching; consistent with book-doc Decisions #3's guardrail reasoning and the famine/scarcity→`gods-provision` routing being a lexicon matter for books that teach provision.
3. `work-and-diligence` NOT re-opened: book-doc Decisions #4's drop (temple rebuilding as obedience, not diligence-in-labor teaching) stands; no new evidence.
4. `repentance` NOT re-opened for 1:12-15: book-doc Decisions #7 (text's own vocabulary is obey/fear, carried by `obedience-to-the-word`) stands.
5. Lexicon candidate "wages... into a bag with holes" (1:6) considered and skipped: post-expansion the exact phrase is lexically retrievable; no concept-routing gap identifiable from the ledger side.
6. Backlog-roster check: no chapter-1 candidate matches any of the 50 corpus-blocked rows (closest inspected: none apply — Haggai appears in no roster row).
7. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): `sowing-and-reaping` (adopted, engine-built: no) considered for 1:6 ("You have sown much, and bring in little") and NOT added — the chapter's frustrated harvest is literal covenant discipline (carried by `the-lords-discipline`), not the moral sow-what-you-reap law that id names. No other engine-built=no adopted id is honestly present.

### (g) Ceiling flag
- no ceiling hit (6 tags); **subdivided in book doc** (sections: 1:1–11; 1:12–15) → eligible for the per-verse refinement pass.

## Haggai 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `presence-of-god` | "and work, for I am with you," says the LORD of Armies | 2:4 | Ground of the command to keep building, with "my Spirit lived among you" (2:5); prior art upheld |
| keep | `fear-not` | "Don’t be afraid." | 2:5 | God's word to the disheartened remnant (2:3–5), with the strengthening triple "be strong" (2:4); prior art upheld |
| keep | `divine-judgment` | "I will shake the heavens, the earth, the sea, and the dry land" | 2:6 | The shaking of all nations and overthrow of kingdoms — "I will overthrow the throne of kingdoms" (2:22); prior art upheld |
| add | `clean-and-unclean` | "If one who is unclean by reason of a dead body touches any of these, will it be unclean?" | 2:13 | The chapter turns on a ceremonial-purity ruling — holy meat cannot hallow by touch (2:12) but defilement transfers (2:13), applied: "That which they offer there is unclean" (2:14); the exact-register id (minted 2026-08-26 rollout batch 1) did not exist in the book doc's 131-id vocabulary |
| drop | `holiness` | "That which they offer there is unclean" | 2:14 | Proposed drop, recorded not silent: `holiness`'s register is the NT call to pursue holiness (1 Pet 1:15-16 keystone; clean-and-unclean.yaml's own header: "`holiness` covers the call to be holy, not the category system"); with `clean-and-unclean` available the tag is broad-duplicating-specific — the book doc's own reviewer flagged it "the doc's most stretchable tag". Reversible; Jesse can keep both under the both-tags ruling |
| keep | `blessing` | "From today I will bless you" | 2:19 | Covenant pledge from the foundation day, reversing the struck harvests (2:15–19); guardrail framing per book-doc Decisions #1 upheld |
| keep | `putting-god-first` | "Consider, please, from this day and backward" | 2:18 | The priorities lesson dated to the turn (2:14–19); pack anchors Hag 2:15-19; prior art upheld |
| keep | `the-house-of-god` | "The latter glory of this house will be greater than the former" | 2:9 | The house's future is the opening oracle's substance (2:3, 7–9); pack anchors Hag 2:6-9; prior art upheld |

Net: 7 tags → 7 tags (one add, one recorded drop proposal).

### (b) Anchor-extension candidates
- `clean-and-unclean` — Haggai 2:11-14 — "If someone carries holy meat in the fold of his garment, and with his fold touches bread, stew, wine, oil, or any food, will it become holy?" (2:12) — proposed weight 0.75 — a narrated case ruling of the transfer principle (Lev 10:10's distinction charge exercised by priests), a register the pack's statute anchors don't yet show. CORPUS-BLOCKED rider (Haggai expansion-only).
- `fear-not` — Haggai 2:4-5 — "Yet now be strong, Zerubbabel,’ says the LORD. ‘Be strong, Joshua son of Jehozadak, the high priest. Be strong, all you people of the land" (2:4) with "Don’t be afraid." (2:5) — proposed weight 0.65 — be-strong-and-don't-fear oracle to discouraged workers, the Joshua-block "be strong and courageous"→`fear-not` precedent. CORPUS-BLOCKED rider.
- `presence-of-god` — Haggai 2:4-5 noted as the sibling of the 1:13 candidate above ("for I am with you" + "my Spirit lived among you"); propose ONE Haggai anchor for this pack, curator to pick 1:13 or 2:4-5 — not both (anchor-dilution discipline).

### (c) Lexicon candidates
- `the-house-of-god` — phrase: "rebuilding the temple" — realistic query phrasings: "rebuilding the temple in the bible"; "who rebuilt the temple after the exile"; "haggai rebuild the temple" — the pack's lexicon (house of god / house of the lord / the temple in the bible / gods dwelling place) has no rebuild-register entry; Haggai 1–2 and Ezra are the landing texts. CAVEAT: "rebuild" never occurs in Haggai's WEB text (the book says "build", 1:8), so this is a genuine vocabulary rung, not exact-phrase-retrievable; still requires a measured miss at curation.

### (d) New-concept candidates
- honest-and-empty — none. Checked: the shaking-of-nations material is `divine-judgment`/`day-of-the-lord` territory (see (f) item 2); Zerubbabel-signet material has no honest search-scale concept home that isn't a messianic read-back (see (f) item 3); no backlog row matches.

### (e) Decline-overturn proposals
- honest-and-empty — none. The book-doc/application-pass skip of `day-of-the-lord` on this chapter (theme witness, phrase absent) is a recorded decline-class decision and stands — no new textual evidence: the chapter still never uses the phrase (nearest: "In that day", 2:23).

### (f) Decisions record
1. Yield-adjacent recorded delta: `holiness` drop proposed (see (a)) — class broad-duplicating-specific under §11.6's vocabulary, superseded by the exact-register `clean-and-unclean` unavailable at book-doc time. Not a silent drop; reversible; if Jesse keeps both, the chapter sits at 8 (hard ceiling) with every tag clearing the bar.
2. `day-of-the-lord` NOT re-opened (application-pass skip recorded in book-doc Decisions #14 stands): Haggai is a theme witness only; the shaking/overthrow verses are fully carried by `divine-judgment`. The end-times roster row (backlog row 5) was checked — its refs are Daniel/2 Tim, no routing due.
3. `servant-of-the-lord` considered for 2:23 ("I will take you, Zerubbabel my servant... and will make you like a signet ring, for I have chosen you") and NOT added: the pack's register is Isaiah's servant songs / suffering servant; a Zerubbabel-messianic reading would be a later-revelation read-back (kept as prose in the book doc, per its NT-signposts rule). Also checked `messianic-prophecy` (locator design requires an NT citation of the passage; the NT never quotes Hag 2:23) and `election-and-predestination` ("I have chosen you" is office-appointment narrative, not election teaching) — neither clears the bar.
4. `holy-spirit` considered for 2:5 ("my Spirit lived among you") and NOT added: single retrospective clause, below the substantial-presence bar (same ground as the book doc's `covenant` fold at 2:5).
5. `nations-and-peoples` considered for 2:6-7 ("I will shake all nations. The treasure of all nations will come") and NOT added: the pack's register is origin/table-of-nations and all-nations mission scope, not nations as judgment-shaking objects; `divine-judgment` carries these verses.
6. `gods-provision` NOT re-opened for 2:8 ("The silver is mine, and the gold is mine"): book-doc Decisions #3's drop stands; no new evidence.
7. Backlog-roster check: no chapter-2 candidate matches any roster row (sacrifice-and-atonement row 1 checked for 2:14's unclean offerings — that row is the atonement ritual system, not defiled-offering rejection; no route).
8. §11.1 adopted-list check (canonical tag-apply/adopted-concepts.md): no engine-built=no adopted id is honestly present; nearest considered was `sovereignty-of-god` for the shaking oracles (2:6-7, 21-22) — the chapter depicts judgment acts, not sovereignty teaching, and `divine-judgment` carries the verses.

### (g) Ceiling flag
- no ceiling hit (7 tags after delta; 8 if Jesse keeps `holiness`); **subdivided in book doc** (sections: 2:1–9; 2:10–19; 2:20–23) → eligible for the per-verse refinement pass.

---
*Ledger complete: Haggai 1–2 swept 2026-08-26 against the 239-id library, declines.md, and backlog-roster.md. All quotes word-for-word WEB from the 87fd68c expansion fixture (glyphs preserved). No engine changes, no repo writes; display-layer and research output only.*
