# Sweep ledger — Obadiah

- **Book:** Obadiah
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture's pinned snapshot); fixture-witnessed-on-main chapters for this book: **none** — Obadiah 1 is expansion-only (engine candidates on it are corpus-blocked until PR-beta merges; every (b) row below rides PR-beta)
- **Inputs read:** BRIEF.md; obadiah.md book doc; concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog)

## Obadiah 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will bring you down from there," says the LORD. | 1:4 | Prior art; the whole vision is God's sentence on Edom, widening to all nations (1:2–9, 15–16, 18) |
| keep | `humble-exaltation` | "Though you mount on high as the eagle, and though your nest is set among the stars, I will bring you down from there" | 1:4 | Prior art; God bringing down the proud (1:2–4) |
| keep | `self-deception` | "The pride of your heart has deceived you" ... "who says in his heart, ‘Who will bring me down to the ground?’" | 1:3 | Prior art (reviewer-ruled KEEP on 1:3 alone, Decisions #9) |
| keep | `betrayal` | "Friends who eat your bread lay a snare under you." | 1:7 | Prior art; both sides — Edom's violence against "your brother Jacob" (1:10–11) and Edom itself betrayed by allies (1:7) |
| keep | `day-of-the-lord` | "For the day of the LORD is near all the nations! As you have done, it will be done to you." | 1:15 | Prior art (2026-08-25 pass; the display row's minting book); engine pack anchors Obadiah 1:15 at 0.8 |
| keep | `gloating-over-downfall` | "and don’t rejoice over the children of Judah in the day of their destruction" | 1:12 | Prior art (adopted display id, minted from this book); engine side is backlog row 14 — see (f) ROUTED |
| keep | `restoration-of-israel` | "But in Mount Zion, there will be those who escape, and it will be holy. The house of Jacob will possess their possessions." | 1:17 | Prior art (2026-08-25 pass); the vision's second movement (1:17–21) |

No adds, no drops. Chapter stays at 7 tags (within ceiling 8). Considered for the open slot and not added: `remnant` (theme witness only — the chapter has escape-and-remain language, "those of his who remain" 1:14, "those who escape" 1:17, but never the remnant word and no remnant teaching beyond what `restoration-of-israel` already carries here; routed to (b)); `god-reigns` (thin single-verse, 1:21 — routed to (b)); `zion-city-of-god` (Zion here is the deliverance locus of the `restoration-of-israel` movement, not the city-of-God teaching substance — routed to (b), broad-duplicating-specific if tagged); `trusting-in-man` (Edom's misplaced confidence in terrain/allies/wisdom is depicted, but the chapter's indictment substance is pride and betrayal, already carried by `humble-exaltation` + `self-deception` + `betrayal`; the failed-alliance facts are the `betrayal` tag's own 1:7 anchor — no independent register); `vengeance` (recorded 2026-08-25 skip, Decisions #10 — stands, not relitigated).

### (b) Anchor-extension candidates
- `humble-exaltation` — Obadiah 1:2-4 — "The pride of your heart has deceived you" (1:3); "Though you mount on high as the eagle, and though your nest is set among the stars, I will bring you down from there," says the LORD. (1:4) — proposed weight 0.80 — the OT's sharpest bring-down-the-proud oracle; serves the pack's "pride" / "god resists the proud" query families, which currently have no OT-oracle anchor (pack is Peter/James/Psalm 75/Proverbs).
- `self-deception` — Obadiah 1:3 — "The pride of your heart has deceived you, you who dwell in the clefts of the rock, whose habitation is high, who says in his heart, ‘Who will bring me down to the ground?’" — proposed weight 0.75 — the pack's five anchors are all NT; this is the OT's most explicit self-deception text, register-verified by the book doc's reviewer ruling (Decisions #9: false self-assessment named with its internal source). Span note: 1:3 only — 1:7's deception is external (by allies) and was explicitly removed from this tag's anchor by that ruling.
- `betrayal` — Obadiah 1:7 — "All the men of your alliance have brought you on your way, even to the border. The men who were at peace with you have deceived you, and prevailed against you. Friends who eat your bread lay a snare under you." — proposed weight 0.60 — the bread-eating-friend image matching the pack's Ps 41:9 keystone family. Pack-comment note for the curator: betrayal.yaml's own header already names "Obad 1:10-14" among its corpus-blocked riders (the brother-Jacob side); the curator should scope the eventual Obadiah anchor(s) across both registers (1:7 betrayed-by-allies; 1:10-14 violence against a brother) in one decision.
- `restoration-of-israel` — Obadiah 1:17-21 — "But in Mount Zion, there will be those who escape, and it will be holy. The house of Jacob will possess their possessions." (1:17); "and the kingdom will be the LORD’s." (1:21) — proposed weight 0.70 — repossession-after-plunder promise; the pack currently has no Minor-Prophets anchor.
- `god-reigns` — Obadiah 1:21 — "Saviors will go up on Mount Zion to judge the mountains of Esau, and the kingdom will be the LORD’s." — proposed weight 0.65 — the doxological-kingship register the pack owns (OT declaration, no NT-kingdom read-back); consistent with the recorded keep-as-two-rows call vs `kingdom-of-heaven` (declines.md §1(e)) and with Zech 14:9's deferral (this candidate parallels, not preempts, that deferred decision — curator may decide the two verses together).
- `remnant` — Obadiah 1:17 — "But in Mount Zion, there will be those who escape, and it will be holy." — proposed weight 0.60 — THEME WITNESS, NOT PHRASE WITNESS (the book never uses a remnant word) — the same lower-confidence class the pack's own header records for its Malachi 3:16-18 flag; carried with that caveat verbatim in intent. Verse-scoped sibling with the `restoration-of-israel` candidate above (same verse, distinct registers — survival vs repossession; record in both files if adopted).
- `zion-city-of-god` — Obadiah 1:17, 21 — "But in Mount Zion, there will be those who escape, and it will be holy." (1:17); "Saviors will go up on Mount Zion" (1:21) — proposed weight 0.60 — LOW PRIORITY, stated honestly: "Mount Zion" is verbatim in both verses, so bare lexical retrieval will already serve "mount zion" queries once the corpus lands; the candidate's only value is concept-chip ordering. The curator may reasonably judge it NO MEASURABLE EFFECT and skip.

### (c) Lexicon candidates
- honest-and-empty — none. (The gloating query family — "rejoicing at someone's downfall", "when your enemy falls do not rejoice" — belongs to backlog row 14's eventual pack and is routed there, not logged here; no other unserved query family surfaced. "As you have done, it will be done to you" checked: the reap-what-you-sow family is carried by `sin`'s lexicon.)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: gloating → backlog row 14; edom/oracle-against-a-nation → `divine-judgment` + `nations-and-peoples` per the Jeremiah oracles-against-the-nations routing, declines.md §3.5; pride → `humble-exaltation` per the §3.1 covered list; brother-violence → `betrayal`.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (The Habakkuk `day-of-the-lord` decline (§3.5) was re-read since this book minted that row — it concerns Habakkuk's text, not Obadiah's, and nothing here bears on it.)

### (f) Decisions record
- **ROUTED to backlog row 14 (`gloating-over-downfall`):** matches backlog row 14; new evidence: "But don’t look down on your brother in the day of his disaster, and don’t rejoice over the children of Judah in the day of their destruction. Don’t speak proudly in the day of distress." (1:12); "Don’t enter into the gate of my people in the day of their calamity. Don’t look down on their affliction in the day of their calamity, neither seize their wealth on the day of their calamity." (1:13); also 1:14's cutting-off-the-fugitives prohibition. The roster row already names Obad 1:12-13 as a blocked defining text — this sweep confirms the full cascade runs 1:12-14 and adds no duplicate candidate. Row's own BORDERLINE flag (fold into broader betrayal/vengeance treatment, decide at re-pin with Theme G's vengeance row) noted and left intact.
- **`vengeance` skip stands** (book-doc Decisions #10): its Obad 1:15 substance (deeds returned on the doer's head) is carried on the same verse by `divine-judgment` + `day-of-the-lord` with no distinct register — recorded 2026-08-25, not relitigated; no new evidence found.
- **`restoration` non-tag stands** (book-doc Decisions #4): the personal renewal-prayer register does not fit territorial repossession; `restoration-of-israel` carries it. Re-affirmed against restoration-of-israel.yaml's own register-resolution header.
- **No NT read-backs** (book-doc Decisions #8 stands): no `second-coming` despite day-of-the-LORD language; no candidate above imports Brooks's Christ-framing or MHCC's church-typological reading.
- No yields (7 tags, under ceiling). No silent drops.

### (g) Ceiling flag
- no (7 tags; not subdivided in book doc — two BSB sections are recorded in the doc's Sections list (1:1–14; 1:15–21) but the single-chapter book was not flagged as a subdivision case; (b) spans above are already verse-scoped, so nothing further is owed to the refinement pass).
