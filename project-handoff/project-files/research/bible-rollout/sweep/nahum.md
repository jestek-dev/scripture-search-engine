# Sweep ledger — Nahum

- **Book:** Nahum
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc7… — identical to main's committed-fixture sourceSha256);
  fixture-witnessed-on-main chapters for this book: **Nahum 1** (all 15 verses main-witnessed, byte-identical to the expansion text per prep verification). Nahum 2–3 are expansion-only (87fd68c): engine candidates on those chapters are corpus-blocked until PR-β; Nahum 1 candidates would be assertable today (none are proposed — see ch 1 (b)).
- **Inputs read:** BRIEF.md; nahum.md book doc (incl. Decisions record and reviewer pass); concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog); tag-apply/adopted-concepts.md (canonical §11.1 list per coordinator update, 2026-08-26)
- **§11.1 adopted-id statuses cited in this ledger** (per `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`): `justice-and-oppression` — engine-built: yes (pack in ontology/concepts/ @ e762d1c); `slow-to-anger` — engine-built: yes; `vengeance` — engine-built: yes.
- **File-name note:** ledger filed as `sweep/nahum-sweep-ledger.md` per the coordinator's instruction to match the sibling threads' established `<book>-sweep-ledger.md` pattern (overrides BRIEF §C/§F's `sweep/<book>.md` spec; content format unchanged).
- **Standing prior ruling honored throughout:** Nahum's justice material was merged into the single id `justice-and-oppression` (tag-gaps Nahum appends, 2026-08-23); no separate oppression id is proposed anywhere below.

## Nahum 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "The LORD takes vengeance on his adversaries, and he maintains wrath against his enemies." / "I will make your grave, for you are vile." | 1:2, 1:14 | The avenging-God poem plus the sentence on Nineveh; pack already anchors Nahum 1:2–6 (editorial, 0.85) |
| keep | `refuge-in-trouble` | "The LORD is good, a stronghold in the day of trouble; and he knows those who take refuge in him." | 1:7 | Refuge held out inside the judgment storm; pack already anchors Nahum 1:7 (torrey, 0.8) |
| keep | `slow-to-anger` | "The LORD is slow to anger, and great in power, and will by no means leave the guilty unpunished." | 1:3 | The formula's own text in this book — patience and justice in one breath; display tag stands even though the pack deliberately does NOT anchor Nah 1:3 (see (f)) |
| keep | `vengeance` | "The LORD is a jealous God and avenges." | 1:2 | Vengeance as the LORD's own prerogative, distinct from the sentence-on-Nineveh register; display tag stands even though the pack deliberately does not re-anchor Nah 1:2–3 (see (f)) |

No adds. Chapter tag count: 4. Full 239-id pass run; no further id clears the honest-substantial-presence bar (nearest misses recorded in (f)).

### (b) Anchor-extension candidates
- honest-and-empty — none, deliberately, on the one main-witnessed chapter: `divine-judgment` (Nah 1:2–6) and `refuge-in-trouble` (Nah 1:7) already anchor this chapter, and the two remaining natural extensions are BLOCKED by binding boundary comments inside the packs themselves, recorded in (f). Proposing them would contradict recorded pack design, not extend it.

### (c) Lexicon candidates
- honest-and-empty — none. "stronghold in distress" and "refuge" phrasings are already in `refuge-in-trouble`'s lexicon; "slow to anger" and "gods patience" already in `slow-to-anger`'s; `day-of-the-lord` phrasing checked — the phrase never occurs in Nahum ("the day of trouble", 1:7, is refuge-in-trouble's territory; matches the recorded Habakkuk decline's reasoning, tag-gaps-review §3.5).

### (d) New-concept candidates
- proposed id `gods-goodness` — evidence: "The LORD is good, a stronghold in the day of trouble; and he knows those who take refuge in him." (1:7) — "God is good" / "the Lord is good" are heavy lay queries with NO lexicon home anywhere in the 239 packs (grep at sweep time: no pack carries "the lord is good", "god is good", or a goodness register; `hunger-for-god` quotes Ps 34:8's "taste and see" only in an anchor comment). Ids checked and why they don't cover it: `gods-love` (love register; the delight extension is a different comfort register), `gods-faithfulness` (promise-keeping constancy), `blessing` (received benefits), `mercy` (pity toward the guilty), `refuge-in-trouble` (owns the Nah 1:7 anchor but serves shelter queries, not goodness queries). Backlog roster checked: no matching row (rows 1–50). CAVEATS, stated honestly: Nahum's in-book witness is one clause of one verse already inside `refuge-in-trouble`'s Nah 1:7 anchor, and the mint case would rest on cross-book texts (Ps 34:8; 100:5; 106:1; 136:1; Jas 1:17); recommend the curation pass FIRST check a lexicon extension of `gods-love` (the routing that concept's bare-"love" precedent suggests) before minting, per the check-first pattern. NOT logged as a Nahum tag (single verse, below the presence bar for display).

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Anchor-extension BLOCKS honored (the reason (b) is empty): (1) `slow-to-anger.yaml` header, verbatim boundary: "Nah 1:3 (verbatim in corpus) is NOT an anchor: divine-judgment owns the Nah 1:2-6 span, and the verse's own point is patience WITHOUT acquittal — the two packs cross-relate instead." (2) `vengeance.yaml` header, verbatim boundary: "Nah 1:2-3 (the canonical vengeance-belongs-to-God statement) sits inside divine-judgment's Nah 1:2-6 span and is NOT re-anchored (the slow-to-anger batch-2 precedent)." Both display tags (per the book doc) remain honest — tags are display-only and the presence bar is met in-chapter — but no engine extension is proposed against recorded pack design.
- God's jealousy (1:2, "The LORD is a jealous God and avenges.") checked and NOT logged anywhere, per the recorded Zechariah decline (tag-gaps-review §3.5): "real theme but not judged a searched register; `envy-and-jealousy` is the human vice and must NOT receive these refs." No new textual evidence beyond another instance of the same register; no overturn proposed.
- 1:15 good-news herald ("Behold, on the mountains the feet of him who brings good news, who publishes peace!") checked: single verse; the Isa 52:7 parallel is anchored by `god-reigns` (Isaiah's row), and no beautiful-feet lexicon exists — left as a motif note for the Isaiah-side curator rather than a Nahum candidate (a Nahum-anchored "good news feet" entry would misdirect the query family away from its keynote text).
- Book-doc rejections UPHELD, none reversed: `restoration` and `pastoral-freedom-from-bondage` off 1:12–13 (Decisions #3 — renewal-prayer and addiction-recovery registers respectively); `gods-protection` and `pastoral-refuge-and-justice` off 1:7 (Decisions #2 — wrong registers; `refuge-in-trouble` is the honest home); `gods-faithfulness` off 1:12–13 (Decisions #5).
- No yields (4 tags, under soft cap).

### (g) Ceiling flag
- no (4 tags; not subdivided in book doc — Decisions #1: no BSB intra-chapter boundary; the 1:2–8 / 1:9–15 shift is carried in prose).

## Nahum 2

honest-and-empty: no new candidates; existing book-doc tags reviewed and kept.

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "“Behold, I am against you,” says the LORD of Armies" | 2:13 | The sack of the city is the LORD's own sentence, sealed in his own voice |
| keep | `justice-and-oppression` | "The lion tore in pieces enough for his cubs, and strangled prey for his lionesses" | 2:12 | Prior art (adopted-vocabulary add, 2026-08-25, per the merged Nahum justice ruling); the lions'-den taunt names Nineveh's predation and God's answer to it (2:13) |

No adds. Chapter tag count: 2. Full 239-id pass run; battle poetry with no further honest tag — the book doc's original "(Only one honest tag from the current vocabulary.)" judgment, updated only by the 2026-08-25 `justice-and-oppression` add, stands.

### (b) Anchor-extension candidates
- honest-and-empty — none. `justice-and-oppression` @ Nah 2:11–13 checked: the tyrant-predation register is already carried by its Prov 28:15–16 (the roaring-lion wicked ruler) and Isa 10:1–2 anchors; a Nahum 2 anchor would add weight without a distinct query register. `restoration-of-israel` @ 2:2 checked: single parenthetical verse ("For the LORD restores the excellency of Jacob as the excellency of Israel"), below anchor substance (mirrors the book doc's `gods-faithfulness` reasoning, Decisions #5).

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `restoration` NOT revisited for 2:2 (book doc Decisions #3 upheld — renewal-prayer register; the national-restoration register question is the recorded Isaiah-block TENSION (`restoration` vs `restoration-of-israel`, tag-gaps-review §1(e)) and is the curator's to resolve, not this sweep's).
- No yields (2 tags).

### (g) Ceiling flag
- no (2 tags; not subdivided in book doc).

## Nahum 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "Woe to the bloody city!" / "“Behold, I am against you,” says the LORD of Armies" | 3:1, 3:5 | Judgment pronounced with its indictment attached; fatal, unmourned end (3:7, 3:19) |
| keep | `justice-and-oppression` | "It is all full of lies and robbery—no end to the prey." | 3:1 | Prior art (adopted-vocabulary add, 2026-08-25); predatory oppression indicted — "who sells nations" (3:4), "who hasn’t felt your endless cruelty?" (3:19) — God's justice answering the oppressor, no political adjudication |

No adds. Chapter tag count: 2. Full 239-id pass run; no further id clears the bar (nearest misses in (f)).

### (b) Anchor-extension candidates
- `justice-and-oppression` — Nahum 3:1 — "Woe to the bloody city! It is all full of lies and robbery—no end to the prey." — proposed weight 0.60 — the woe-against-the-oppressor-empire register: the pack's anchors indict corrupt courts, withheld wages, and tyrant rulers, but none carries the international-scale oppressor called to account ("who sells nations", 3:4; "who hasn’t felt your endless cruelty?", 3:19 — evidence for the curator; the anchor claim itself is 3:1). Distinct from the Nah 2 non-candidate above: 3:1 is the indictment stated as teaching-register woe, not battle imagery. CORPUS-BLOCKED (Nahum 3 expansion-only); rides PR-β.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `occult-and-divination` checked for 3:4 ("the mistress of witchcraft, who sells nations through her prostitution, and families through her witchcraft") and NOT added: the witchcraft language is the oracle's metaphor for Nineveh's seductive, enslaving statecraft — the chapter contains no teaching about occult practice; tagging would trade on the word, not the concept.
- Backlog roster row 14 (`gloating-over-downfall`) checked for 3:19 ("All who hear the report of you clap their hands over you") and NOT routed: that row's texts CONDEMN gloating over a fallen enemy (Prov 24:17–18; Obad 1:12–13); Nahum 3:19 reports the nations' applause as the vindication of the oppressed, without moral censure — a different register. Recorded so no later thread mistakes it for an unlogged match.
- `humble-exaltation` NOT revisited (book doc Decisions #4 upheld — the indictment is cruelty, not self-exaltation answered by humbling, and the chapter teaches nothing about God exalting the humble).
- No yields (2 tags).

### (g) Ceiling flag
- no (2 tags; not subdivided in book doc).

---
END OF NAHUM SWEEP — 2026-08-26, sweep worker (Minor Prophets thread), repo @ e762d1c.
