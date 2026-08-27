# Sweep ledger — Jonah

- **Book:** Jonah
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc7… — identical to main's committed-fixture sourceSha256);
  fixture-witnessed-on-main chapters for this book: **none** — all four chapters of Jonah are expansion-only (87fd68c). Every engine-side candidate below is corpus-blocked until the expansion PR (PR-β) merges and rides it; display-tag deltas are unaffected.
- **Inputs read:** BRIEF.md; jonah.md book doc (incl. Decisions record and reviewer pass); concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog)
- **File-name note:** ledger filed as `sweep/jonah-sweep-ledger.md` per the coordinator's instruction to match the sibling threads' established `<book>-sweep-ledger.md` pattern (overrides BRIEF §C/§F's `sweep/<book>.md` spec; content format unchanged).

## Jonah 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `providence` | "the LORD sent out a great wind on the sea" / "The LORD prepared a huge fish to swallow up Jonah" | 1:4, 1:17 | God governs sea, storm, lot (1:7), and creature to arrest his prophet; sailors confess "you, LORD, have done as it pleased you" (1:14) |
| keep | `the-lords-discipline` | "I know that because of me this great storm is on you" | 1:12 | Corrective storm aimed at God's own servant, ending in preservation (1:15, 17); flagged in book doc (Decisions #7), sustained by its reviewer — upheld here |
| keep | `running-from-god` | "to flee to Tarshish from the presence of the LORD" | 1:3 | Prior art (adopted display id); the concept's defining narrative — engine side is backlog roster row 34, ROUTED, not re-proposed |
| keep | `gods-compassion-for-outsiders` | "you, LORD, have done as it pleased you" | 1:14 | Prior art (adopted display id); the pagan crew's plea heard, sailors end fearing the LORD (1:16) — engine side is backlog roster row 9, ROUTED |
| add | `fear-of-the-lord` | "I am a Hebrew, and I fear the LORD, the God of heaven, who has made the sea and the dry land." / "Then the men feared the LORD exceedingly; and they offered a sacrifice to the LORD and made vows." | 1:9, 1:16 | The chapter's arc moves pagan sailors from fear of the storm (1:5) through "the men were exceedingly afraid" (1:10) to reverent fear of the LORD with sacrifice and vows — the pack's reverence-piety register, not fear-not's comfort register; three-verse, chapter-shaping presence |

Chapter tag count after deltas: 5 (soft cap 6 not reached).

### (b) Anchor-extension candidates
- `the-lords-discipline` — Jonah 1:4–17 — "I know that because of me this great storm is on you" (1:12); "The LORD prepared a huge fish to swallow up Jonah" (1:17) — proposed weight 0.60 — the pack holds only two anchors, both NT teaching (Heb 12:7–11; Rev 3:19); Jonah 1 is the canon's plainest OT narrative of God correcting his own servant unto preservation, serving "why is god disciplining me" searchers. CORPUS-BLOCKED (Jonah expansion-only); rides PR-β.
- `providence` — Jonah 1:17 — "The LORD prepared a huge fish to swallow up Jonah" — proposed weight 0.55 — the "prepared" verb chain (fish 1:17; vine, worm, wind in ch 4) is the book's providence signature; low weight, the pack's 13-anchor spine already carries the register. CORPUS-BLOCKED; rides PR-β.

### (c) Lexicon candidates
- ROUTED: matches backlog row 34 (`running-from-god`) — query phrasings "jonah runs from god"; "jonah and the whale"; "swallowed by a big fish" belong to that row's territory; new evidence for its curator: "But Jonah rose up to flee to Tarshish from the presence of the LORD" (1:3); "The LORD prepared a huge fish to swallow up Jonah" (1:17). Not logged as fresh lexicon rows here.

### (d) New-concept candidates
- honest-and-empty — none. Checked: sent-storm/sea material has no concept home but is carried here by `providence` + `the-lords-discipline` (refuge-in-trouble's storm register is the shelter-seeker's, not the sent storm); flight material is roster row 34.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- ADD `fear-of-the-lord` (delegated call): the pack (batch 3) postdates the 2026-08-23 book doc, so the id was never considered there. Presence bar checked first: 1:9 (confession), 1:10 (dread), 1:16 (reverent fear + sacrifice + vows) — the sailors' conversion arc is chapter substance, not topic-touching. Boundary honored: this is the piety register; no `fear-not` material exists in the chapter.
- Book-doc drops UPHELD, none reversed: `worship` (Decisions #12 — 1:16 is one verse of depicted act; its substance now partially served by the `fear-of-the-lord` add, which spans the arc rather than the act); `sharing-your-faith` (Decisions #15 — compelled confession, not the witness register); no `obedience-to-the-word` (trap tag, chapter depicts the refusal — Decisions #16).
- `oaths-and-vows` checked, not added: "made vows" (1:16) is a single clause; below the presence bar.
- No yields (5 tags, under soft cap).

### (g) Ceiling flag
- no (5 tags; not subdivided in book doc — Decisions #3 declined subdivision, sustained by reviewer).

## Jonah 2

honest-and-empty at chapter top does NOT apply — one engine-side candidate set below; existing book-doc tags reviewed and kept unchanged.

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `prayer` | "I called because of my affliction to the LORD. He answered me." | 2:2 | The whole chapter is a prayer prayed and answered (2:1, 2:7) |
| keep | `salvation` | "Salvation belongs to the LORD." | 2:9 | In-text load-bearing confession; book doc Decisions #8 sustained by its reviewer — upheld |
| keep | `pastoral-hope-in-despair` | "yet you have brought my life up from the pit, LORD my God" | 2:6 | Prior art (display id; engine pack id `hope-in-despair`, file `pastoral-hope-in-despair.yaml`); pit-rescue register upheld for ch 2 per the prior pastoral-register ruling — personal-crisis register genuinely matches here |
| keep | `thanksgiving` | "I will sacrifice to you with the voice of thanksgiving. I will pay that which I have vowed." | 2:9 | The rescued man's stated response |

No adds. Chapter tag count: 4.

### (b) Anchor-extension candidates
- `salvation` — Jonah 2:9 — "Salvation belongs to the LORD." — proposed weight 0.65 — every current anchor is NT gospel-register; this is the OT's compressed statement that deliverance is God's alone (the book doc's sustained ground for the tag), and the remembered phrase has no anchor home. CORPUS-BLOCKED; rides PR-β.
- `god-sees-my-suffering` (pack file `ontology/concepts/pastoral-god-sees-my-suffering.yaml`) — Jonah 2:2 — "Out of the belly of Sheol I cried. You heard my voice." — proposed weight 0.60 — fits the pack's "God hears my cry" lexicon exactly; CAUTION for curator: pastoral pack, Jesse-approved anchor set (2026-07-31 external reviews) — extension must clear that pastoral-review bar, not just the gauntlet. CORPUS-BLOCKED; rides PR-β.
- `idolatry` — Jonah 2:8 — "Those who regard vain idols forsake their own mercy." — proposed weight 0.55 — single-verse aphorism (noted), but a widely-quoted verse (NIV-remembered "cling to worthless idols") with no anchor; the pack's 11 anchors do not carry the forfeited-mercy angle. CORPUS-BLOCKED; rides PR-β.

### (c) Lexicon candidates
- `salvation` — phrase: "salvation belongs to the lord" — realistic query phrasings: "salvation belongs to the lord"; "salvation is of the lord"; "salvation comes from the lord" — anchor evidence 2:9 (candidate above); phrase currently in no lexicon.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `god-sees-my-suffering` display tag NOT added despite 2:2 fitting its lexicon: the chapter's answered-cry substance is already the doc's `prayer` justification verbatim — a broad-duplicating add; engine-side anchor candidate logged in (b) instead.
- `lament` checked, not added: Jonah 2 is a thanksgiving psalm looking back on rescue ("He answered me", 2:2), not the complaint practice the lament pack documents.
- Book-doc trap-tag call UPHELD: no `refuge-in-trouble` (Decisions #16 — God is sender and rescuer; the psalm's shape is not the refuge register).
- No yields (4 tags).

### (g) Ceiling flag
- no (4 tags; not subdivided in book doc).

## Jonah 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "let them turn everyone from his evil way and from the violence that is in his hands" | 3:8 | Scripture's largest-scale repentance scene; God responds to the turning (3:10) |
| keep | `divine-judgment` | "In forty days, Nineveh will be overthrown!" | 3:4 | Announced sentence drives the chapter; book doc Decisions #10 sustained — upheld |
| keep | `faith` | "The people of Nineveh believed God" | 3:5 | Bare preached word believed and acted on citywide; sustained by book-doc reviewer — upheld |
| keep | `obedience-to-the-word` | "So Jonah arose, and went to Nineveh, according to the LORD’s word." | 3:3 | The book's structural hinge — the fled commission done as given; Decisions #11 sustained — upheld |
| keep | `gods-compassion-for-outsiders` | "God saw their works, that they turned from their evil way." | 3:10 | Prior art (adopted display id); mercy enacted on a pagan city — engine side is backlog roster row 9, ROUTED |
| add | `fasting` | "they proclaimed a fast and put on sackcloth, from their greatest even to their least" | 3:5 | Citywide penitential fast is the chapter's depicted practice — man and animal decreed to fast (3:7), sackcloth and ashes from king down (3:6) — matching the fasting pack's corporate-penitential register (its Joel 2:12–15 / Esther 4:15–16 anchor class); multi-verse chapter substance, not topic-touching |

Chapter tag count after deltas: 6 (at soft cap; hard ceiling 8 not reached; no yield required).

### (b) Anchor-extension candidates
- `fasting` — Jonah 3:5–9 — "they proclaimed a fast and put on sackcloth, from their greatest even to their least" (3:5); "let neither man nor animal, herd nor flock, taste anything" (3:7) — proposed weight 0.75 — the canon's largest corporate penitential fast is absent from the pack; joins its corpus-blocked penitential riders (Joel 2:12–15, Esther 4:15–16, Dan 9:3, Ezra 8:21–23). CORPUS-BLOCKED; rides PR-β.
- `repentance` — Jonah 3:5–10 — "God saw their works, that they turned from their evil way. God relented of the disaster which he said he would do to them, and he didn’t do it." (3:10) — proposed weight 0.80 — the pack's eight anchors are all teaching statements; this is the narrative keystone of turning-met-by-mercy. Cross-note: 3:9–10's relenting clause is backlog row 7's register (god-relents) — this candidate claims the human turning, adjudicates nothing about the divine relenting. CORPUS-BLOCKED; rides PR-β.
- `faith` — Jonah 3:5 — "The people of Nineveh believed God; and they proclaimed a fast" — proposed weight 0.60 — the pack holds only two anchors (Heb 11:6; Rom 10:17); this is Rom 10:17's substance (faith comes by the preached word) depicted at city scale. CORPUS-BLOCKED; rides PR-β.

### (c) Lexicon candidates
- `repentance` — phrase: "sackcloth and ashes" — realistic query phrasings: "sackcloth and ashes"; "what does sackcloth and ashes mean"; "repenting in sackcloth and ashes" — evidence 3:5–6 ("covered himself with sackcloth, and sat in ashes"); verified absent from every lexicon in the 239 packs (grep at sweep time).
- ROUTED: matches backlog row 7 (`god-relents`) — query phrasings "does god change his mind"; "god relented"; "who knows whether god will relent" belong to that row; new evidence for its curator: "Who knows whether God will not turn and relent, and turn away from his fierce anger, so that we might not perish?" (3:9); "God relented of the disaster which he said he would do to them, and he didn’t do it." (3:10). Not duplicated here.

### (d) New-concept candidates
- honest-and-empty — none. `revival-and-reformation` checked and declined for the citywide turning: its register is renewal among God's own people ("if my people humble themselves"); Nineveh is a pagan city, and the substance is honestly carried by `repentance` + `gods-compassion-for-outsiders` (roster row 9).

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- ADD `fasting` (delegated call): distinguished from the two recorded fasting declines — Malachi's ("never appears in the book") and 1 Chronicles' ("funerary custom, reported without teaching substance"): Jonah 3's fast is multi-verse penitential substance (3:5–9) integral to the chapter's action. Distinguished from the Joel 2 precedent (BRIEF §D): there `fasting` yielded because the chapter HIT the hard ceiling of 8; Jonah 3 sits at 6 with the add, so no yield tension arises. Ordering: main themes (`repentance`, `divine-judgment`) stay first; `fasting` appended last.
- ROUTED, not minted: god-relents material (3:9–10) → backlog roster row 7, per the route-don't-duplicate rule; recorded in (c).
- No yields (6 tags, soft cap, every tag independently clears the bar).

### (g) Ceiling flag
- no (6 tags — soft cap reached but hard ceiling 8 not hit; not subdivided in book doc).

## Jonah 4

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-love` | "you are a gracious God and merciful, slow to anger, and abundant in loving kindness" | 4:2 | God's self-revealed character quoted as the reason Jonah fled, enacted in the closing plea (4:10–11) |
| keep | `wrestling-with-god` | "I am right to be angry, even to death." | 4:9 | A whole chapter of the prophet angry at God and arguing, met by God's patient questions (4:4, 4:9–11) — the pack's protest-engagement register exactly |
| keep | `gods-compassion-for-outsiders` | "Shouldn’t I be concerned for Nineveh, that great city, in which are more than one hundred twenty thousand persons who can’t discern between their right hand and their left hand, and also many animals?" | 4:11 | Prior art (adopted display id); the theme's defining text — engine side is backlog roster row 9, ROUTED |
| add | `slow-to-anger` | "I knew that you are a gracious God and merciful, slow to anger, and abundant in loving kindness, and you relent of doing harm." | 4:2 | The Exod 34:6 formula verbatim in-chapter as the chapter's hinge, and God's patience narratively enacted toward both Nineveh (the spared city Jonah waits on, 4:5) and his angry prophet (4:4, 4:9–11); pack postdates the book doc; precedent: `slow-to-anger` tagged on Nahum 1's formula text |

Chapter tag count after deltas: 4.

### (b) Anchor-extension candidates
- `slow-to-anger` — Jonah 4:2 — "I knew that you are a gracious God and merciful, slow to anger, and abundant in loving kindness, and you relent of doing harm." — proposed weight 0.85 — a verbatim instance of the formula the pack is built on, prayed AGAINST God by an angry prophet — a register no current anchor carries; joins the pack's corpus-blocked formula riders (Exod 34:6–7; Num 14:18; Neh 9:17; Ps 145:8). The tag-gaps `slow-to-anger` row (Nahum-minted) itself lists Jonah 4:2 as an expected sibling ref. Cross-note: the verse's "you relent of doing harm" clause is backlog row 7's register — this candidate adjudicates nothing there. CORPUS-BLOCKED; rides PR-β.
- `wrestling-with-god` — Jonah 4:1–9 — "He prayed to the LORD" (4:2); "Is it right for you to be angry?" (4:4); "I am right to be angry, even to death." (4:9) — proposed weight 0.75 — the pack's "angry at god" / "arguing with god" lexicon has no anchor where the anger is at God's MERCY and God answers with questions; honest sibling of its Hos 12:3–4 / Hab 1:2–4 anchors. CORPUS-BLOCKED; rides PR-β.

### (c) Lexicon candidates
- ROUTED: matches backlog row 7 (`god-relents`) — "you relent of doing harm" (4:2) is that row's register; evidence recorded for its curator alongside the ch 3 material in (c) above. Not duplicated.

### (d) New-concept candidates
- honest-and-empty — none. Anger-at-God phrasings checked: `wrestling-with-god` lexicon already carries "angry at god" and "arguing with god" — covered, no row.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- ADD `slow-to-anger` (delegated call): presence bar checked first — the formula is quoted verbatim (4:2) AND the chapter dramatizes the attribute (God's forbearance with Jonah's repeated death-wish anger, 4:4, 4:9). Not a read-back and not a word-match-only tag.
- `mercy` checked, NOT added: 4:2's "merciful" is inside the formula already carried by `gods-love` (kept) and `slow-to-anger` (added), and the outsider-directed mercy is `gods-compassion-for-outsiders` (kept) — a fourth id on the same verse would be broad-duplicating-specific.
- Book-doc calls UPHELD, none reversed: `pastoral-hope-in-despair` stays OFF ch 4 (Decisions #9 — the death-wish is anger at mercy, not the despair-ministry register; the 1 Kgs 19:4–7 parallel remains capture-file material, not a tag); `those-who-never-heard` stays dropped (Decisions #14 — near-opposite register); `nations-and-peoples` stays dropped (Decisions #13 — origin/spread register; matches the Obadiah ruling); no `contentment` trap tag (Decisions #16).
- No yields (4 tags).

### (g) Ceiling flag
- no (4 tags; not subdivided in book doc).

---
END OF JONAH SWEEP — 2026-08-26, sweep worker (Minor Prophets thread), repo @ e762d1c.

## Addendum — §11.1 adopted-list reference (appended 2026-08-26, same sweep session)

Per the coordinator's mid-sweep update: the CONVENTIONS §11.1 adopted-concepts
list now exists canonically at
`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`
(161 ids, each marked engine-built yes/no against the 239-concept main census).
Engine-built statuses for the adopted ids cited above, verified against that
file (all consistent with this ledger's treatment — no delta entry changes):

- `running-from-god` — engine-built: **no** (valid display tag, no pack in
  ontology/concepts/; engine side stays ROUTED to backlog roster row 34).
- `gods-compassion-for-outsiders` — engine-built: **no** (valid display tag,
  no pack; engine side stays ROUTED to backlog roster row 9).
- `god-relents` — engine-built: **no** (no pack; stays ROUTED to backlog
  roster row 7; never applied as a tag here).
- `fasting` — engine-built: yes; `fear-of-the-lord` — engine-built: yes;
  `slow-to-anger` — engine-built: yes (the ch 1, 3, 4 adds above are engine
  ids with packs @ e762d1c, as treated).
- `pastoral-hope-in-despair` (ch 2 keep) is NOT on the adopted list — it is
  pre-adoption vocabulary from the book doc's 131-id era; its engine pack at
  e762d1c is `id: hope-in-despair` (file `pastoral-hope-in-despair.yaml`),
  exactly as noted in the ch 2 table.

## Erratum — pastoral-* id normalization (2026-08-26)

Vocabulary-consistency check (Minor Prophets thread, 2026-08-26): the 14
`pastoral-*` packs' YAML `id:` fields omit the `pastoral-` prefix; per
CONVENTIONS §5 the canonical id for ledger use is the prefixed FILENAME form
(never strip the prefix). Two mentions in this ledger used the unprefixed
YAML-id form as a concept id. Original lines are left untouched per
CONVENTIONS §9; read them with the corrections below.

- Jonah 2, §(b) Anchor-extension candidates — the candidate id is written
  `god-sees-my-suffering` (the pack file
  `ontology/concepts/pastoral-god-sees-my-suffering.yaml` is named correctly
  in the same entry); read the candidate's concept id as canonical
  `pastoral-god-sees-my-suffering`.
- Jonah 2, §(f) Decisions record — "`god-sees-my-suffering` display tag NOT
  added despite 2:2 fitting its lexicon ...": read as canonical
  `pastoral-god-sees-my-suffering`.

Not defects (stand as written): the ch 2 table's "(display id; engine pack
id `hope-in-despair`, file `pastoral-hope-in-despair.yaml`)" parenthetical
and the §11.1 addendum's "`id: hope-in-despair`" line are deliberate
quotations of the YAML-id/filename mismatch, not id usages.
