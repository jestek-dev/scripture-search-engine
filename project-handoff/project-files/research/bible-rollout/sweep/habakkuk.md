# Sweep ledger — Habakkuk

- **Book:** Habakkuk
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture's pinned snapshot); fixture-witnessed-on-main chapters for this book: **Habakkuk 3 only** (all 19 verses main-witnessed — its (b) rows are assertable now); Habakkuk 1–2 are expansion-only (engine candidates on them are corpus-blocked until PR-beta merges; their (b)/(c) rows ride PR-beta)
- **Inputs read:** BRIEF.md; habakkuk.md book doc; concept-index.md + packs/; declines.md (tag-gaps-review §3 + §1 + postscript rulings); backlog-roster.md (engine-pack-backlog); tag-apply/adopted-concepts.md (§11.1 canonical list, 161 ids with engine-built markers — checked; no adopted-only id has honest substantial presence in Habakkuk)

## Habakkuk 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `wrestling-with-god` | "LORD, how long will I cry, and you will not hear?" | 1:2 | Prior art; both complaints carried to God and held there (1:2–4; 1:12–17); the pack's own anchor is Habakkuk 1:2-4 |
| keep | `divine-judgment` | "I am raising up the Chaldeans, that bitter and hasty nation" | 1:6 | Prior art; God's announced judgment on Judah — "You, Rock, have established him to punish." (1:12) |
| keep | `providence` | "I am working a work in your days which you will not believe though it is told you" | 1:5 | Prior art; God's unseen governance of nations asserted in advance (1:5–6) |
| keep | `lament` | "Why do you show me iniquity, and look at perversity?" | 1:3 | Prior art (2026-08-25 pass); classic complaint form addressed to God, renewed at 1:12–17, beside `wrestling-with-god` under the both-tags ruling |
| keep | `suffering-of-the-righteous` | "You who have purer eyes than to see evil" ... "the wicked swallows up the man who is more righteous than he" | 1:13 | Prior art (apologetics pass); the theodicy question as faithful speech; pack anchors Habakkuk 1:13 |
| add | `justice-and-oppression` | "Therefore the law is paralyzed, and justice never prevails; for the wicked surround the righteous; therefore justice comes out perverted." | 1:4 | The first complaint's whole subject is violence and failed civic justice (1:2–4 — "destruction and violence are before me. There is strife, and contention rises up.", 1:3); the unify-on-this-id rule applies; register verified against the pack's corrupt-courts/civic scope |

Chapter moves 5 → 6 tags (at the soft cap, under ceiling 8). No drops.

### (b) Anchor-extension candidates
- `justice-and-oppression` — Habakkuk 1:2-4 — "LORD, how long will I cry, and you will not hear? I cry out to you “Violence!” and will you not save?" (1:2); "Therefore the law is paralyzed, and justice never prevails" (1:4) — proposed weight 0.70 — the paralyzed-law/perverted-justice text; the pack has no anchor voicing the complaint *about* injustice to God (its anchors are indictments and statutes). Corpus-blocked (Hab 1 expansion-only; rides PR-beta). Span note: verse-scoped sibling with `wrestling-with-god`'s existing Habakkuk 1:2-4 anchor (0.7) — two honest registers of one complaint (the protest act vs the injustice protested); record in both files if adopted.
- `prosperity-of-the-wicked` — Habakkuk 1:14-17 — "He takes up all of them with the hook. He catches them in his net and gathers them in his dragnet. Therefore he rejoices and is glad." (1:15); "because by them his life is luxurious and his food is good" (1:16) — proposed weight 0.65 — the wicked flourishing *by* their predation, put to God as grievance ("Will he therefore continually empty his net, and kill the nations without mercy?", 1:17) — exactly the pack's grievance register (Job 21:7 / Jer 12:1 family). Deliberately disjoint from `suffering-of-the-righteous`'s existing Habakkuk 1:13 anchor (adjacent, no overlap). Corpus-blocked; rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. (`wrestling-with-god` already carries "how long o lord" and "when god is silent"; the theodicy phrasings are `why-god-allows-suffering`'s existing entries.)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: violence/injustice → `justice-and-oppression`; theodicy → `suffering-of-the-righteous` + `why-god-allows-suffering` + `prosperity-of-the-wicked`, all live; Babylon's self-worship, "whose strength is their god" 1:11 / "he sacrifices to his net" 1:16 → depicted trait of the invader, not teaching substance for `trusting-in-man` or `idolatry`; no backlog-roster row matches Habakkuk 1.)

### (e) Decline-overturn proposals
- honest-and-empty — none. The recorded Habakkuk `day-of-the-lord` decline (declines.md §3.5, Habakkuk item; restated in day-of-the-lord.yaml's header: "Habakkuk's checked-and-declined stands") was re-checked against the full text: the book still never uses the phrase; "the day of trouble" (3:16) and "the appointed time" (2:3) remain adjacent language, not the theme. No new textual evidence; the decline stands.

### (f) Decisions record
- `why-god-allows-suffering` NOT added as tag and NOT proposed as anchor: the chapter poses the question, but the tag would be broad-duplicating-specific beside `suffering-of-the-righteous` + `wrestling-with-god` + `lament` (all kept), and the apologetics map deliberately anchored the theodicy question here ONCE via `suffering-of-the-righteous` 1:13 with a cross edge (book doc Decisions #12) — that single-anchor design is respected; the packs are cross-related.
- `prosperity-of-the-wicked` NOT added as tag (anchor candidate only): the apologetics map's recorded cross-edge design ("that id is NOT also added to ch 1", book doc Decisions #12) is display-layer prior art and stands; the (b) row is engine-layer and does not reverse it.
- `wrestling-with-god` second-anchor extension (1:12-13) considered and declined: the pack already anchors this book's wrestle at 1:2-4; a same-dialogue second anchor adds ordering weight without a new query family — likely NO MEASURABLE EFFECT.
- `trusting-in-man` considered and declined (1:11, 1:15-16): the chapter *depicts* Babylon's self-trust and net-worship as the trait God will punish; it does not teach the misplaced-trust register the pack serves (Gen-3-resisting-the-devil worked-example class).
- No yields (6 tags, at soft cap, under ceiling). No silent drops.

### (g) Ceiling flag
- Subdivided in book doc (sections: 1:1–4 / 1:5–11 / 1:12–17, BSB) → flag for the per-verse refinement pass. Not at ceiling (6 tags).

## Habakkuk 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `faith` | "but the righteous will live by his faith" | 2:4 | Prior art; the book's hinge verse, kept in its own-horizon reading (no `justification-by-faith` read-back per book doc Decisions #2) |
| keep | `trust-in-god` | "Though it takes time, wait for it, because it will surely come. It won’t delay." | 2:3 | Prior art; the explicit call to wait on God's sure promise |
| keep | `divine-judgment` | "The cup of the LORD’s right hand will come around to you, and disgrace will cover your glory." | 2:16 | Prior art; five woes pronounced over the oppressor (2:6–19) |
| keep | `humble-exaltation` | "Behold, his soul is puffed up. It is not upright in him" | 2:4 | Prior art; the arrogant gatherer of nations ("gathers to himself all nations and heaps to himself all peoples", 2:5) brought low by the plundered peoples (2:6–8, 16) |
| keep | `idolatry` | "Woe to him who says to the wood, ‘Awake!’ or to the mute stone, ‘Arise!’" | 2:19 | Prior art (2026-08-25 pass); the fifth woe is a whole idol-satire unit (2:18–19) answered by 2:20 |
| add | `justice-and-oppression` | "Woe to him who builds a town with blood, and establishes a city by iniquity!" | 2:12 | Woes 1–3 are oppression-economics through and through — extortion ("Woe to him who increases that which is not his, and who enriches himself by extortion!", 2:6), evil gain (2:9), city-on-blood (2:12), plunder of peoples (2:8) — the pack's civic/economic register; unify-on-this-id rule |

Chapter moves 5 → 6 tags (at the soft cap, under ceiling 8). No drops.

### (b) Anchor-extension candidates
- `faith` — Habakkuk 2:4 — "Behold, his soul is puffed up. It is not upright in him, but the righteous will live by his faith." — proposed weight 0.90 — the pack has only two anchors (Heb 11:6, Rom 10:17) and lacks the OT source-verse of the NT's live-by-faith citations; heavily searched in remembered phrasings (see (c)). Corpus-blocked (Hab 2 expansion-only; rides PR-beta). No competing claimant: no pack anchors any Habakkuk 2 verse (verified by grep over all 239 packs).
- `trust-in-god` — Habakkuk 2:3 — "For the vision is yet for the appointed time, and it hurries toward the end, and won’t prove false. Though it takes time, wait for it, because it will surely come. It won’t delay." — proposed weight 0.70 — the pack's Torrey heritage is WAITING UPON GOD (Isa 40:31, Ps 27:14, Lam 3:25-26) and this is the prophets' plainest wait-for-God's-timing verse. Corpus-blocked; rides PR-beta.
- `glory-of-god` — Habakkuk 2:14 — "For the earth will be filled with the knowledge of the LORD’s glory, as the waters cover the sea." — proposed weight 0.80 — the famous earth-filled-with-glory promise (Isa 11:9's twin); the pack already anchors Hab 3:3-4, so the book's glory register is pack-recognized; this adds the promise verse users actually quote. Corpus-blocked; rides PR-beta.
- `idolatry` — Habakkuk 2:18-19 — "What value does the engraved image have, that its maker has engraved it; the molten image, even the teacher of lies, that he who fashions its form trusts in it, to make mute idols?" — proposed weight 0.70 — a complete idol-satire in the pack's own Jer 10 / Isa 40 register ("there is no breath at all within it", 2:19), ending in the living-God contrast (2:20). Corpus-blocked; rides PR-beta.
- `justice-and-oppression` — Habakkuk 2:6-12 — "Woe to him who increases that which is not his, and who enriches himself by extortion!" (2:6); "Woe to him who builds a town with blood, and establishes a city by iniquity!" (2:12) — proposed weight 0.70 — the woe-oracle form of the pack's economic-oppression register (extortion, evil gain, bloodshed-built wealth). Corpus-blocked; rides PR-beta.

### (c) Lexicon candidates
- `faith` — phrase: "the righteous shall live by faith" — realistic query phrasings: "the righteous shall live by faith"; "the just shall live by faith"; "live by faith" — the KJV/ESV-remembered forms of 2:4 (WEB: "the righteous will live by his faith"); no pack lexicon carries any live-by-faith phrasing (verified by grep); token note: {live, faith} shares only {live} with walking-by-the-spirit's "live by the spirit".
- `trust-in-god` — phrase: "waiting on god" — realistic query phrasings: "waiting on god"; "wait on the lord"; "waiting on gods timing" — a heavy devotional query family with no lexicon home anywhere in the 239 packs (verified by grep: no pack lexicon carries a wait-phrase); the pack's own Torrey outline is WAITING UPON GOD and its Isa 40:31 / Ps 27:14 / Lam 3:25-26 anchors are the landing texts, with Hab 2:3 as the extension anchor above. (Alternative routing for the curator: `rest-for-the-weary` also anchors Isa 40:31, but its register is exhaustion, not timing — `trust-in-god` is the honest home.)

### (d) New-concept candidates
- honest-and-empty — none. (Checked: "write the vision, and make it plain" (2:2) — quote-retrieval need, served lexically once the corpus lands, and `dreams-and-visions` would be the register home if fixtures ever show a miss; woes-against-nations → `divine-judgment` + `justice-and-oppression`; Sheol-appetite (2:5) → mortality imagery, not a register; no backlog-roster row matches Habakkuk 2.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (The book-doc `justification-by-faith` decline on 2:4 (Decisions #2, reviewer-SUSTAINED) is a later-revelation read-back bar and stands; nothing in this sweep touches it — the NT reuse remains a prose signpost only.)

### (f) Decisions record
- `glory-of-god` NOT added as tag (anchor candidate only): 2:14 is one verse inside the woes — thin single-verse class; the chapter's substance is the vision and the five woes.
- `drunkenness` anchor on 2:15-16 considered and declined: drunkenness.yaml's own header declines judgment-imagery drink texts (Isa 28:1-8, Jer 13:13 — "the Jeremiah decline the row records, applied to both"); 2:15's woe is drink used as a weapon of degradation inside Babylon's judgment figure ("so that you may gaze at their naked bodies!"), not the practice-teaching register — same class, same disposition, recorded here with the pointer for the curator.
- `watchman-and-warning` considered and declined (2:1): "I will stand at my watch" is the prophet awaiting God's answer to his own complaint, not the warn-the-wicked charge (Ezek 33 register) the pack serves.
- 2:20 ("But the LORD is in his holy temple. Let all the earth be silent before him!") — the book doc's `presence-of-god` register-mismatch drop (Decisions #7) re-checked and respected; no `worship`/`the-house-of-god` candidate proposed: the verse is a hush-before-the-Judge summons, and bare lexical retrieval will serve its quote-queries once the corpus lands.
- `vanity-of-life` (§11.1 adopted id, engine-built: no; backlog roster row 19) checked against 2:13 ("the nations weary themselves for vanity"): the word is labor-for-nothing under judgment, not the row's Ecclesiastes hebel-thesis register — no match, nothing routed.
- No yields (6 tags, at soft cap, under ceiling). No silent drops.

### (g) Ceiling flag
- Subdivided in book doc (sections: 2:1–5 / 2:6–20, BSB) → flag for the per-verse refinement pass. Not at ceiling (6 tags).

## Habakkuk 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `joy-in-the-lord` | "yet I will rejoice in the LORD. I will be joyful in the God of my salvation!" | 3:18 | Prior art; joy in God himself amid total loss (3:17–18); pack anchors Habakkuk 3:17-18 (main-corpus witnessed) |
| keep | `trust-in-god` | "I must wait quietly for the day of trouble" | 3:16 | Prior art; trembling trust that holds while ruin approaches, sustained by "GOD, the Lord, is my strength." (3:19) |
| keep | `prayer` | "A prayer of Habakkuk, the prophet, set to victorious music." | 3:1 | Prior art; the chapter is itself a prayer with its plea at the front (3:2) |
| keep | `divine-judgment` | "You marched through the land in wrath. You threshed the nations in anger." | 3:12 | Prior art; God's wrath against wickedness in the sung theophany (3:12–13) |
| add | `glory-of-god` | "His glory covered the heavens, and his praise filled the earth." | 3:3 | The theophany recital's substance is God's glorious appearing (3:3–4 "His splendor is like the sunrise. Rays shine from his hand", plus 3:11's light-of-your-arrows); glory-of-god.yaml itself anchors Habakkuk 3:3-4 (0.85, in corpus) as its theophany-register witness |

Chapter moves 4 → 5 tags (under soft cap 6). No drops.

### (b) Anchor-extension candidates
- `mercy` — Habakkuk 3:2 — "In wrath, you remember mercy." — proposed weight 0.65 — the wrath-tempered-by-mercy plea users quote; ASSERTABLE NOW (Hab 3 is main-corpus witnessed). Verse-scoped sibling note: revival-and-reformation.yaml already anchors Habakkuk 3:2 (0.85, in corpus) for the renew-your-work register — two honest registers of one verse ("Renew your work in the middle of the years" vs "In wrath, you remember mercy"); record in both files if adopted.

### (c) Lexicon candidates
- `joy-in-the-lord` — phrase: "though the fig tree does not bud" — realistic query phrasings: "though the fig tree does not bud"; "even if the fig tree does not blossom"; "yet i will rejoice in the lord" — the NIV/ESV-remembered forms of 3:17-18 (WEB: "even though the fig tree doesn’t flourish"); the pack anchors Habakkuk 3:17-18 but its lexicon has no fig-tree or rejoice-anyway phrasing, so remembered-translation queries reach the verse only by partial token luck ({fig, tree} also lives in Matt 21 / Joel 1). Anchor is in-corpus, so this is measurable now (alias-mining loop: run the phrasings against the live engine first; add rows only on a measured miss).

### (d) New-concept candidates
- honest-and-empty — none. (Checked: trust-amid-loss → `joy-in-the-lord` + `trust-in-god`, both live and both anchored here; theophany → `glory-of-god`; "He makes my feet like deer’s feet" (3:19) — quote-retrieval, in corpus, no register gap; no backlog-roster row matches Habakkuk 3.)

### (e) Decline-overturn proposals
- honest-and-empty — none. (Book-doc declines re-checked and respected: `praise`/`worship` drop (Decisions #6, reviewer-SUSTAINED — 3:18–19's exultation is `joy-in-the-lord`'s register); `salvation` non-tag (Decisions #10 — national deliverance, not the how-can-I-be-saved register).)

### (f) Decisions record
- `revival-and-reformation` tag considered and declined: its pack anchors Hab 3:2 ("Renew your work in the middle of the years"), but in-chapter that is one petitionary verse — thin single-verse class; the chapter's substance is theophany-recital and trust. The pack's existing anchor already serves the register; no tag, no extension needed.
- `gods-provision` anchor on 3:17-18 considered and declined: the pack's scarcity lexicon ("when resources run out", "famine in the land") could reach for this text, but the verses teach joy while provision *stays* failed — anchoring a no-provision text to a God-provides concept would mislabel the chip; `joy-in-the-lord` owns 3:17-18 (pack comment in glory-of-god.yaml confirms the ownership pattern). Left to the curator with this note.
- `fear-not` considered and declined: the prophet trembles and waits (3:16); no do-not-fear teaching present.
- No yields (5 tags, under soft cap). No silent drops.

### (g) Ceiling flag
- Subdivided in book doc (sections: 3:1–16 / 3:17–19, BSB) → flag for the per-verse refinement pass. Not at ceiling (5 tags).

---

*Ledger complete: Habakkuk 1–3 swept 2026-08-26 against the 239-id engine library, the reviewed declines, and the corpus-blocked roster. Totals: 2 chapters at 6 tags, 1 at 5; adds 3 (`justice-and-oppression` ×2, `glory-of-god` ×1), drops 0; anchor-extension candidates 8 (1 assertable now on main corpus — mercy @ Hab 3:2; 7 ride PR-beta); lexicon candidates 3 (faith live-by-faith family; trust-in-god waiting family; joy-in-the-lord fig-tree family); new concepts 0; decline overturns 0; backlog routes 0.*
