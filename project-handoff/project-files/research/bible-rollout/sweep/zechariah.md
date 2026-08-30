# Sweep ledger — Zechariah

- **Book:** Zechariah
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion corpus, branch claude/hearth-161-concept-packs-2tf8jk; pinned WEB sourceSha256 b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c — identical to main's committed fixture's pinned snapshot);
  fixture-witnessed-on-main chapters for this book: **Zechariah 13 only.** Chapters 1–12 and 14 are witnessed only by the unmerged expansion commit 87fd68c — engine candidates on those chapters are corpus-blocked until PR-beta merges (they ride PR-beta; noted per candidate). Ch 13 candidates are assertable on main's corpus today.
- **Inputs read:** BRIEF.md; zechariah.md book doc (incl. Decisions record 1–21, reviewer-pass note, critic confirmation); concept-index.md + full packs in packs/; declines.md (tag-gaps-review §3 + §1 + Jesse's 2026-08-25 postscript rulings); backlog-roster.md (engine-pack-backlog, 50-row roster + re-open notes); tag-apply/adopted-concepts.md (canonical §11.1 list, 161 ids with engine-built status)
- **Prior art:** the book doc's 65 existing tag instances (39 from the 131-id pass + the 2026-08-25 application pass, Decisions 21) are the keep baseline. `the-branch` is an adopted display-tag id (tag-apply/adopted-concepts.md: engine-built **no** — valid display vocabulary, no pack among the 239; its engine design was folded into `messianic-prophecy` at that pack's minting) — kept as prior art. NT passion connections (Matt 21/26/27; John 19; Mark 14; Rev 1:7) are prose signposts per book-doc Decisions 4 and are never used as tag rationales here.

## Zechariah 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "‘Return to me,’ says the LORD of Armies, ‘and I will return to you,’" | 1:3 | Opening call, with 1:4's "Return now from your evil ways" and 1:6 "Then they repented" — book-doc prior art confirmed |
| keep | `god-of-all-comfort` | "The LORD answered the angel who talked with me with kind and comforting words." | 1:13 | With 1:17 "the LORD will again comfort Zion" — prior art confirmed |
| keep | `divine-judgment` | "to cast down the horns of the nations" | 1:21 | Fathers overtaken (1:6), anger at the nations at ease (1:15) — prior art confirmed |
| keep | `dreams-and-visions` | "I had a vision in the night" | 1:8 | Vision sequence opens; interpreting angel throughout — prior art confirmed |
| keep | `angels` | "I asked, ‘My lord, what are these?’" | 1:9 | Rider, patrol, interceding angel (1:8–13) — prior art confirmed |
| keep | `restoration-of-israel` | "I have returned to Jerusalem with mercy." | 1:16 | House rebuilt, cities overflowing with prosperity (1:16–17) — prior art confirmed |

### (b) Anchor-extension candidates
- `repentance` — Zechariah 1:3-4 — "‘Return to me,’ says the LORD of Armies, ‘and I will return to you,’" — proposed weight 0.85 — the OT return-formula text (pack lexicon "return to the lord" reaches it); no Zechariah anchor in the pack. Rides PR-beta (ch 1 not on main's corpus).
- `god-of-all-comfort` — Zechariah 1:13-17 — "kind and comforting words" / "the LORD will again comfort Zion" — proposed weight 0.6 — comfort vocabulary spoken over a community under seventy years of indignation. Rides PR-beta.

### (c) Lexicon candidates
- `repentance` — phrase: "return to me and i will return to you" — realistic query phrasings: "return to me and I will return to you"; "if I return to God will he return to me"; "return to the lord your god". Note for curator: Malachi 3:7 (main-witnessed) carries the same formula — the phrase serves both landings.

### (d) New-concept candidates
- honest-and-empty — none. (God's jealousy for Zion, 1:14, is a recorded decline — see (e)/(f).)

### (e) Decline-overturn proposals
- honest-and-empty — none. The Zechariah-block decline on God's jealousy/zeal (tag-gaps-review §3.5: "real theme but not judged a searched register; `envy-and-jealousy` ... must NOT receive these refs", citing Zech 1:14; 8:2) stands — this sweep found no textual evidence beyond the exact refs the decline already weighed.

### (f) Decisions record
- No yields (6 tags, at soft cap, none over). `wrestling-with-god` considered for the angel's "how long will you not have mercy on Jerusalem" (1:12) — declined: single verse, and the speaker is the interceding angel, not a person wrestling; below the presence bar. `mercy` considered (1:16) — declined: single-clause witness carried inside `restoration-of-israel`'s justification.

### (g) Ceiling flag
- Subdivided in book doc (sections: 1:1–6; 1:7–17; 1:18–21) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-protection` | "will be to her a wall of fire around it" | 2:5 | With 2:8 "he who touches you touches the apple of his eye" — prior art confirmed |
| keep | `presence-of-god` | "behold, I come and I will dwell within you" | 2:10 | With 2:5 "I will be the glory in the middle of her" and 2:11 "I will dwell among you" — prior art confirmed |
| keep | `nations-and-peoples` | "Many nations shall join themselves to the LORD in that day, and shall be my people" | 2:11 | Prior art confirmed |
| keep | `dreams-and-visions` | "I lifted up my eyes, and saw, and behold, a man with a measuring line in his hand." | 2:1 | Vision three; interpreting angels (2:3–4) — prior art confirmed |

### (b) Anchor-extension candidates
- `gods-protection` — Zechariah 2:5 — "will be to her a wall of fire around it" — proposed weight 0.75 — God himself as the city's defense; the pack has no OT-narrative-promise anchor outside Psalm 91/Isa 54. Rides PR-beta.
- `gods-protection` — Zechariah 2:8 — "he who touches you touches the apple of his eye" — proposed weight 0.7 — pairs with the lexicon candidate below; the phrase's best-known protective use. Rides PR-beta.
- `presence-of-god` — Zechariah 2:10-11 — "behold, I come and I will dwell within you" — proposed weight 0.75 — the dwell-in-your-midst promise; pack currently has no OT dwelling-promise anchor. Rides PR-beta.

### (c) Lexicon candidates
- `gods-protection` — phrase: "apple of his eye" — realistic query phrasings: "apple of his eye"; "you are the apple of god's eye"; "what does apple of his eye mean". Tokenizer note: {appl, eye} ≥ 2 significant tokens; no pack currently carries the phrase (vengeance.yaml's comment names "apple of his eye" as a known query class to keep clear of bare-{eye} entries). Deut 32:10 / Ps 17:8 are the sibling landings for the curator to weigh; Zech 2:8 is this book's.

### (d) New-concept candidates
- honest-and-empty — none. 2:11's nations-joined-to-the-LORD evidence is ROUTED — see (f).

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `gentile-inclusion` (adopted display id, tag-apply/adopted-concepts.md: engine-built **no**; backlog roster row 40, DEFERRED-to-re-pin) considered for 2:11 "Many nations shall join themselves to the LORD in that day, and shall be my people" — NOT tagged: thin single-verse in this chapter, and the substance is honestly carried by `nations-and-peoples` on the same verse. Evidence ROUTED to backlog row 40 (`gentile-inclusion`): new evidence "Many nations shall join themselves to the LORD in that day, and shall be my people" (2:11) — an OT anticipation ref for that row's curator; not duplicated as a candidate here.
- No yields (4 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 2:1–5; 2:6–13) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `forgiveness-of-sins` | "Behold, I have caused your iniquity to pass from you" | 3:4 | With 3:9 "I will remove the iniquity of that land in one day" — prior art confirmed |
| keep | `dreams-and-visions` | "He showed me Joshua the high priest standing before the LORD’s angel" | 3:1 | Fourth night-vision scene — prior art confirmed |
| keep | `angels` | "and the LORD’s angel was standing by" | 3:5 | The LORD's angel presides; at his word the garments are changed (3:3–6) — prior art confirmed |
| keep | `the-branch` | "behold, I will bring out my servant, the Branch" | 3:8 | Adopted display id, prior art (minted from this book); messianic reading stays a prose signpost |
| add | `messianic-prophecy` | "behold, I will bring out my servant, the Branch" | 3:8 | Engine id whose lexicon carries "the branch prophecy" / "who is the branch in the bible" and whose pack comment names Zech 3:8 as a deferred Branch text; applied alongside `the-branch` per the §11.2 both-tags ruling; attributed-fact framing per book-doc Decisions 4, nothing adjudicated |

### (b) Anchor-extension candidates
- `messianic-prophecy` — Zechariah 3:8 — "behold, I will bring out my servant, the Branch" — proposed weight 0.75 — the Branch title's first Zechariah appearance; the pack anchors Zech 6:12-13 already and its own comment defers 3:8. Rides PR-beta.
- `forgiveness-of-sins` — Zechariah 3:3-5 — "Behold, I have caused your iniquity to pass from you, and I will clothe you with rich clothing." — proposed weight 0.75 — the filthy-garments-removed scene, iniquity removed by God's own act; no Zechariah anchor in the pack. Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("Filthy garments" was considered and withheld: searchers' "filthy rags" queries target Isaiah 64:6's different sense; adding the phrase here would misroute them.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none. The Zechariah-block routing (tag-gaps-review §3.5: Satan the accuser → `resisting-the-devil`, "satan" in its lexicon) stands; see (f).

### (f) Decisions record
- `messianic-prophecy` ADDED (5th tag; see (a)) — delegated call: mirrors the ratified application-pass pattern on chs 9/11/12/13 and the engine pack's own absorption of the-branch row; reversible.
- `satan` (engine id, batch 2) considered for 3:1-2 "The LORD rebuke you, Satan!" — NOT tagged and NOT proposed as anchor: satan.yaml's header records the binding routing "Zech 3:1-2 stays routed to resisting-the-devil per the Zechariah block." Respected as recorded.
- `resisting-the-devil` stays withheld per book-doc Decisions 12 (the chapter depicts the LORD rebuking the accuser; no one models resisting) — confirmed.
- `grace-not-earned` stays withheld per book-doc Decisions 12 (Ephesians-2 teaching register; free cleansing carried in prose) — confirmed.
- `holiness` stays withheld per book-doc Decisions 13 (reclothing is cleansing for office; `forgiveness-of-sins` carries it) — confirmed.
- No yields (5 tags).

### (g) Ceiling flag
- no (not subdivided in book doc; did not hit hard ceiling 8)

## Zechariah 4

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `do-not-lose-heart` | "Indeed, who despises the day of small things?" | 4:10 | Vision aimed at a discouraged builder: mountain to plain, founding hands will finish (4:7–9) — prior art confirmed |
| keep | `dreams-and-visions` | "He said to me, “What do you see?”" | 4:2 | Prophet wakened, questioned, given the interpretation (4:1–6, 11–14) — prior art confirmed |
| keep | `angels` | "The angel who talked with me came again and wakened me" | 4:1 | Interpreting angel drives the whole vision — prior art confirmed |
| add | `holy-spirit` | "‘Not by might, nor by power, but by my Spirit,’ says the LORD of Armies" | 4:6 | The vision's center-word is the Spirit's sufficiency for God's work; the engine `holy-spirit` pack (post-dating the book doc's 131-id vocabulary) already carries Zech 4:6 as a noted ref of its folded outpouring-of-the-spirit row — the book doc's Decisions-5 decline was specifically about the comforter-register id, which this add does not touch |

### (b) Anchor-extension candidates
- Zech 4:6 is ALREADY carried by holy-spirit.yaml's fold comment as a noted ref riding the re-pin ("Zech 4:6; 12:10 (with the append's own caveat) ... ride the re-pin as this row's noted refs") — recorded here, not duplicated as a new candidate.
- `do-not-lose-heart` — Zechariah 4:6-10 — "Indeed, who despises the day of small things?" — proposed weight 0.7 — the discouraged-builder text; pairs with the lexicon candidate below. Rides PR-beta.

### (c) Lexicon candidates
- `holy-spirit` — phrase: "not by might nor by power but by my spirit" — realistic query phrasings: "not by might nor by power"; "not by might nor by power but by my spirit meaning"; "by my spirit says the lord". Tokenizer note: ≥ 2 significant tokens ({might, power, spirit}); the pack's current lexicon has no rung reaching this heavily-quoted verse.
- `do-not-lose-heart` — phrase: "the day of small things" — realistic query phrasings: "do not despise the day of small things"; "day of small things meaning"; "small beginnings in the bible".

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `holy-spirit` ADDED (4th tag; see (a)) — delegated call enabled by vocabulary growth since the book doc; reversible. The application pass's `outpouring-of-the-spirit` skip (OT-Spirit-register caveat) concerned the then-unminted gap row; the minted engine pack folded that row and claims 4:6 by name.
- `strength-in-weakness` considered for 4:6 — declined: that pack is the 2 Corinthians 12 grace-sufficient personal register, not Spirit-vs-might for corporate work.
- No yields (4 tags).

### (g) Ceiling flag
- no (not subdivided in book doc; did not hit hard ceiling 8)

## Zechariah 5

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "it will enter into the house of the thief, and into the house of him who swears falsely by my name" | 5:4 | The curse hunts sin into the sinner's own house (5:3–4) — prior art confirmed |
| keep | `sin` | "This is Wickedness;" | 5:8 | Wickedness personified, sealed, and removed from the land (5:6–11) — prior art confirmed |
| keep | `dreams-and-visions` | "Then again I lifted up my eyes and saw, and behold, a flying scroll." | 5:1 | Two more visions, angel prompting and interpreting — prior art confirmed |
| keep | `angels` | "Then the angel who talked with me came forward and said to me, “Lift up now your eyes" | 5:5 | Interpreting angel carries both visions and names the figure — prior art confirmed |

### (b) Anchor-extension candidates
- honest-and-empty — none. (`divine-judgment` already carries 11 anchors; 5:3-4 adds no distinctive query neighborhood.)

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `oaths-and-vows` considered for 5:3-4 ("him who swears falsely by my name") — declined: the chapter depicts judgment on false swearing, not the making/keeping-vows teaching that pack collects; two clauses of witness. `honesty` on ch 5 stays declined per book-doc Decisions 13 (the positive truth-telling teaching lives at 8:16-17, where the tag sits) — confirmed.
- No yields (4 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 5:1–4; 5:5–11) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 6

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `providence` | "These are the four winds of the sky, which go out from standing before the Lord of all the earth." | 6:5 | The world patrolled at God's command until his spirit is quieted (6:5–8) — prior art confirmed |
| keep | `dreams-and-visions` | "Again I lifted up my eyes, and saw, and behold, four chariots" | 6:1 | Final night vision, interpreted through "What are these, my lord?" (6:4) — prior art confirmed |
| keep | `the-branch` | "Behold, the man whose name is the Branch!" | 6:12 | Adopted display id, prior art (minted from this book); priest-king reading stays a prose signpost |
| add | `messianic-prophecy` | "Behold, the man whose name is the Branch!" | 6:12 | The engine pack ANCHORS Zechariah 6:12-13 (weight 0.8) as one of its folded Branch texts; applied alongside `the-branch` per the §11.2 both-tags ruling; attributed-fact framing per book-doc Decisions 4 |

### (b) Anchor-extension candidates
- honest-and-empty — none new. (messianic-prophecy.yaml already anchors Zechariah 6:12-13 at 0.8 — verified in the pack; no duplicate proposed.)

### (c) Lexicon candidates
- honest-and-empty — none. (The pack's "who is the branch in the bible" already carries the query family; "a priest on his throne" was considered and judged below realistic-query frequency.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `messianic-prophecy` ADDED (4th tag; see (a)) — delegated call: the engine pack's own anchor set names this chapter; reversible.
- `priesthood` considered for 6:13 "He will be a priest on his throne." — declined: the chapter is a crowning sign-act, not priesthood teaching; the verse's substance is carried by `messianic-prophecy`/`the-branch` on the same span.
- `angels` on ch 6 stays skipped per the application pass (two-verse interpreter mechanics, carried by `dreams-and-visions`) — confirmed.
- No yields (4 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 6:1–8; 6:9–15) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 7

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `loving-others` | "show kindness and compassion every man to his brother" | 7:9 | The substance God wanted instead of ritual (7:9–10) — prior art confirmed |
| keep | `divine-judgment` | "Therefore great wrath came from the LORD of Armies." | 7:12 | Calls unanswered in kind, land left desolate (7:13–14) — prior art confirmed |
| keep | `empty-worship` | "did you at all fast to me, really to me?" | 7:5 | Seventy years of fasting and feasting done for themselves (7:5–7) — prior art confirmed |
| keep | `fasting` | "Should I weep in the fifth month, separating myself, as I have done these so many years?" | 7:3 | The practice is the chapter's occasion (7:3, 5) — prior art confirmed |
| keep | `justice-and-oppression` | "Execute true judgment" / "Don’t oppress the widow, the fatherless, the foreigner, nor the poor" | 7:9–10 | Prior art confirmed; Zechariah's justice refs unify here per the standing ruling |
| add | `hardness-of-heart` | "they made their hearts as hard as flint, lest they might hear the law and the words which the LORD of Armies had sent" | 7:12 | The chapter's history lesson pivots on the refusal pattern — "they refused to listen, and turned their backs, and stopped their ears" (7:11) — and its consequence; exactly the pack's do-not-harden substance |

### (b) Anchor-extension candidates
- `hardness-of-heart` — Zechariah 7:11-12 — "they made their hearts as hard as flint" — proposed weight 0.8 — the OT's most vivid hard-heart image outside Pharaoh; distinctive query neighborhood ("heart hard as flint"). Rides PR-beta.
- `empty-worship` — Zechariah 7:5-6 — "did you at all fast to me, really to me?" — proposed weight 0.75 — self-directed religion exposed by God's own audit question; the pack's OT anchors are Isaiah/Ezekiel/Amos, no fasting text. Rides PR-beta.
- `unanswered-prayer` — Zechariah 7:13 — "as he called and they refused to listen, so they will call and I will not listen" — proposed weight 0.7 — a direct why-God-doesn't-listen teaching text; the pack's five anchors lack the covenant-refusal register. Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. (The existing lexicons — "hardened heart", "empty worship", "why doesnt god answer my prayers" — already carry the realistic phrasings for these texts.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `hardness-of-heart` ADDED (6th tag; see (a)) — delegated call; chapter now at the soft cap of 6, every tag independently clearing the bar; reversible.
- `care-for-widows` considered for 7:10 — declined: single verse, and Zechariah's justice refs unify on `justice-and-oppression` (standing ruling; the same verse already carries that tag).
- No yields (6 tags, at soft cap, none over).

### (g) Ceiling flag
- no (not subdivided in book doc; did not hit hard ceiling 8)

## Zechariah 8

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-faithfulness` | "They will be my people, and I will be their God, in truth and in righteousness." | 8:8 | With the thought-to-do-good symmetry (8:14–15) — prior art confirmed |
| keep | `fear-not` | "Don’t be afraid. Let your hands be strong." | 8:13 | Repeated at 8:15 — prior art confirmed |
| keep | `honesty` | "speak every man the truth with his neighbor. Execute the judgment of truth and peace in your gates" | 8:16 | With "love no false oath" (8:17) — prior art confirmed |
| keep | `nations-and-peoples` | "many peoples and strong nations will come to seek the LORD of Armies in Jerusalem" | 8:22 | With the ten-men-of-all-languages scene (8:23) — prior art confirmed |
| keep | `fasting` | "The fasts of the fourth, fifth, seventh, and tenth months shall be for the house of Judah joy, gladness, and cheerful feasts." | 8:19 | The ch 7 question answered — prior art confirmed |
| keep | `remnant` | "If it is marvelous in the eyes of the remnant of this people in those days" | 8:6 | With 8:11–12, promises addressed to "the remnant of this people" — prior art confirmed |
| keep | `restoration-of-israel` | "Behold, I will save my people from the east country and from the west country." | 8:7 | Return, dwelling, and the City of Truth (8:3–8) — prior art confirmed |

### (b) Anchor-extension candidates
- `honesty` — Zechariah 8:16-17 — "speak every man the truth with his neighbor." — proposed weight 0.8 — the source text of the pack's keystone anchor (Ephesians 4:25 quotes this verse); the pack has no OT anchor at all. Rides PR-beta. (The tag-gaps Zechariah block already recorded "speak truth with your neighbor" → `honesty` as a covered routing — this is its anchor-side completion, not a re-logged gap.)
- `nations-and-peoples` — Zechariah 8:20-23 — "many peoples and strong nations will come to seek the LORD of Armies in Jerusalem" — proposed weight 0.75 — the nations-pilgrimage register alongside the pack's Isa 2:2-4 sibling. Rides PR-beta.
- `restoration-of-israel` — Zechariah 8:7-8 — "Behold, I will save my people from the east country and from the west country." — proposed weight 0.7 — regathering with the covenant formula. Rides PR-beta.
- `fear-not` — Zechariah 8:13-15 — "Don’t be afraid. Let your hands be strong." — proposed weight 0.6 — courage grounded in God's turn to do good (mirrors the Zephaniah block's recorded do-not-fear anchor-extension lead). Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("Speak truth with your neighbor" phrasing already routes via `honesty`'s "speak truth" entry per the recorded covered-routing note.)

### (d) New-concept candidates
- honest-and-empty — none. 8:20-23's evidence is ROUTED — see (f).

### (e) Decline-overturn proposals
- honest-and-empty — none. The jealousy-of-God decline (§3.5, citing 8:2) stands — no new evidence beyond the decline's own ref.

### (f) Decisions record
- `gentile-inclusion` (adopted display id, engine-built no; backlog roster row 40) considered for 8:20-23 — NOT tagged: register mismatch with the row's church-inclusion substance (the Gentiles-welcomed-without-the-law question; the roster's own re-check recorded "register mismatch (origin-of-nations vs church-inclusion)"), and `nations-and-peoples` honestly carries the pilgrimage substance on the same verses; adding an 8th tag here would also pad to the hard ceiling. Evidence ROUTED to backlog row 40: "ten men out of all the languages of the nations will take hold of the skirt of him who is a Jew, saying, ‘We will go with you, for we have heard that God is with you.’" (8:23) — an OT anticipation ref for that row's curator.
- `aging-and-old-age` considered for 8:4 ("Old men and old women will again dwell in the streets of Jerusalem") — declined: restoration imagery, not aging-with-faith teaching.
- `presence-of-god` beyond ch 2 stays declined per book-doc Decisions 13 — confirmed.
- No yields (7 tags — one under the hard ceiling; every tag independently clears the bar).

### (g) Ceiling flag
- no (not subdivided in book doc; 7 tags — did not hit hard ceiling 8)

## Zechariah 9

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "the Lord will dispossess her, and he will strike her power in the sea; and she will be devoured with fire" | 9:4 | The burden on Tyre, Sidon, Philistia (9:1–7) — prior art confirmed |
| keep | `gods-protection` | "I will encamp around my house against the army" | 9:8 | With "The LORD of Armies will defend them" (9:15) — prior art confirmed |
| keep | `refuge-in-trouble` | "Turn to the stronghold, you prisoners of hope!" | 9:12 | Distress-shelter substance with the pack's own "stronghold" vocabulary (9:11–12) — prior art confirmed |
| keep | `messianic-prophecy` | "Behold, your King comes to you! He is righteous, and having salvation; lowly, and riding on a donkey" | 9:9 | Prior art confirmed; the engine pack anchors Zechariah 9:9 (0.85); NT citation stays an attributed-fact prose signpost |

### (b) Anchor-extension candidates
- `refuge-in-trouble` — Zechariah 9:11-12 — "Turn to the stronghold, you prisoners of hope!" — proposed weight 0.7 — stronghold-in-distress register; pairs with the lexicon candidate below. Rides PR-beta. (messianic-prophecy already anchors 9:9 — verified in the pack; no duplicate proposed.)

### (c) Lexicon candidates
- `refuge-in-trouble` — phrase: "prisoners of hope" — realistic query phrasings: "prisoners of hope"; "prisoner of hope meaning"; "turn to the stronghold you prisoners of hope". XOR-target note for curator: `hope-in-god` is the adjacent register; proposed here because the verse's own home and the pack's "stronghold in distress" vocabulary carry the landing — one pack only, per alias discipline.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `hope-in-god` considered for 9:12 — declined as a tag: single-verse phrase presence; the substance ("prisoners of hope" summoned to the stronghold) is carried by `refuge-in-trouble` on the same verse; served instead by the (c) lexicon candidate.
- Book-doc Decisions-13 declines re-checked and confirmed: `salvation` on 9:9 (how-can-I-be-saved NT register), `humble-exaltation` on 9:9 (no humbled-then-exalted teaching for people), `joy-in-the-lord` on 9:9 (promissory note, not chapter substance), `restoration-of-israel` ch 9 (single verse 9:12, already quoted under `refuge-in-trouble`), `remnant` ch 9 (single verse 9:7).
- No yields (4 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 9:1–8; 9:9–13; 9:14–17) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 10

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-provision` | "Ask of the LORD rain in the spring time" | 10:1 | Dependence redirected to the true Giver, against vain comfort (10:1–2) — prior art confirmed |
| keep | `gods-faithfulness` | "I will bring them back, for I have mercy on them. They will be as though I had not cast them off" | 10:6 | With "I have redeemed them" (10:8) — prior art confirmed |
| keep | `restoration-of-israel` | "I will signal for them and gather them, for I have redeemed them." | 10:8 | Regathering from Egypt and Assyria, a second exodus (10:6–12) — prior art confirmed |
| keep | `shepherds-and-the-flock` | "They are oppressed, because there is no shepherd." | 10:2 | Bad-shepherds register: anger against the shepherds, God visits his flock (10:3) — prior art confirmed |

### (b) Anchor-extension candidates
- `occult-and-divination` — Zechariah 10:2 — "the teraphim have spoken vanity, and the diviners have seen a lie; and they have told false dreams. They comfort in vain." — proposed weight 0.65 — a direct divination-is-empty teaching text; the pack's OT anchors lack the vain-comfort register. Rides PR-beta.
- `gods-provision` — Zechariah 10:1 — "Ask of the LORD rain in the spring time" — proposed weight 0.6 — ask-the-Giver text; the pack has no OT rain/agriculture anchor. Rides PR-beta.
- `restoration-of-israel` — Zechariah 10:8-12 — "I will signal for them and gather them, for I have redeemed them." — proposed weight 0.75 — the regathering cascade; sibling to the pack's Jeremiah/Ezekiel anchors. Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `occult-and-divination` considered as a tag for 10:2 — declined: single-verse foil inside the chapter's ask-the-LORD redirect, consistent with the application pass's `false-prophets`/`idolatry` ch-10 skips on the same clause; served by the (b) anchor candidate instead.
- `christ-the-cornerstone` on 10:4 stays declined per book-doc Decisions 3 (NT living-stone locator; tagging would be the read-back the conventions forbid) — re-checked against the yaml and confirmed.
- `joy-in-the-lord` on 10:7 stays declined per book-doc Decisions 13 — confirmed.
- No yields (4 tags).

### (g) Ceiling flag
- no (not subdivided in book doc; did not hit hard ceiling 8)

## Zechariah 11

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "For I will no more pity the inhabitants of the land," | 11:6 | Withdrawal of pity as sentence; broken staffs (11:10, 14); closing woe (11:17) — prior art confirmed |
| keep | `shepherds-and-the-flock` | "Feed the flock of slaughter." | 11:4 | The theme's darkest OT chapter, through "Woe to the worthless shepherd who leaves the flock!" (11:17) — prior art confirmed |
| keep | `justice-and-oppression` | "Their buyers slaughter them and go unpunished." | 11:5 | The flock as an oppressed people, shepherds without pity (11:4–6) — prior art confirmed |
| keep | `messianic-prophecy` | "So they weighed for my wages thirty pieces of silver." | 11:12 | Prior art confirmed; NT citation (Matt 26:15; 27:9–10) stays an attributed-fact prose signpost |

### (b) Anchor-extension candidates
- `messianic-prophecy` — Zechariah 11:12-13 — "So they weighed for my wages thirty pieces of silver." — proposed weight 0.75 — the thirty-silver text (attributed fact: Matthew 26:15; 27:9-10 cite it); the pack anchors Zech 9:9 and 6:12-13 but not this scene. Rides PR-beta.
- `shepherds-and-the-flock` — Zechariah 11:15-17 — "Woe to the worthless shepherd who leaves the flock!" — proposed weight 0.7 — the worthless-shepherd text. ROUTED-adjacent note: matches the backlog re-open note "shepherds-and-the-flock bad-shepherds register (Ezek 34 / John 10 / John 21)" — logged as evidence for that reopened register's curator rather than as an independent design. Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("Thirty pieces of silver" as a query realistically targets the Judas narrative; Matt 26–27 are the corpus landings and `messianic-prophecy`'s existing phrasings carry the prophecy-side intent.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `betrayal` considered for 11:12-13 — declined: in-chapter the register is the flock's contempt for the shepherd God gave them (rejection and insulting valuation), not betrayal by an intimate; tagging it would ride the Judas connection, which stays a prose signpost per book-doc Decisions 4 (no later-revelation read-back).
- `covenant` on 11:10 stays declined per book-doc Decisions 13 (covenant broken as sign-act; the id is the covenant-institution register) — confirmed.
- No yields (4 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 11:1–9; 11:10–17) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 12

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-protection` | "In that day the LORD will defend the inhabitants of Jerusalem." | 12:8 | Cup of reeling, burdensome stone, feeble made like David (12:2–4, 8) — prior art confirmed |
| keep | `repentance` | "I will pour on David’s house and on the inhabitants of Jerusalem the spirit of grace and of supplication." | 12:10 | Penitential mourning poured out by God, family by family (12:10–14) — prior art confirmed (book-doc Decisions 7, the softest call, re-checked and upheld) |
| keep | `divine-judgment` | "I will seek to destroy all the nations that come against Jerusalem" | 12:9 | Horses struck with terror, riders with madness (12:4) — prior art confirmed |
| keep | `day-of-the-lord` | "Behold, I will make Jerusalem a cup of reeling to all the surrounding peoples" | 12:2 | Prior art confirmed WITH the recorded caveat: the chapter's own wording is "In that day" (12:3, 4, 6, 8, 9, 11) — the phrase "day of the LORD" itself does not appear in ch 12 |
| keep | `messianic-prophecy` | "They will look to me whom they have pierced; and they shall mourn for him as one mourns for his only son" | 12:10 | Prior art confirmed; NT citation (John 19:37; Rev 1:7) stays an attributed-fact prose signpost |

### (b) Anchor-extension candidates
- `messianic-prophecy` — Zechariah 12:10 — "They will look to me whom they have pierced" — proposed weight 0.85 — the pierced-one oracle (attributed fact: John 19:37 cites it; Revelation 1:7 echoes it); absent from the pack's anchor set. Rides PR-beta.
- Zech 12:10's Spirit clause is ALREADY carried by holy-spirit.yaml's fold comment as a noted ref riding the re-pin, "with the append's own caveat" — recorded here, not duplicated.
- the-breath-of-life.yaml ALREADY anchors Zechariah 12:1 ("forms the spirit of man within him") — verified in the pack; no candidate needed.

### (c) Lexicon candidates
- `holy-spirit` — phrase: "spirit of grace and supplication" — realistic query phrasings: "spirit of grace and supplication"; "pour out a spirit of grace"; "what is the spirit of supplication". CAVEAT for curator (carried from the pack's own fold note): whether 12:10's "spirit" is the Holy Spirit is the append's recorded caveat — the phrase is proposed as query language locating the verse, adjudicating nothing.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Application-pass skips re-checked and confirmed: `lament` ch 12 (penitential mourning, not disaster lament; carried in full by `repentance`); `outpouring-of-the-spirit`/Spirit tag on 12:10 (OT-Spirit-register caveat; verse already carries three tags). `pastoral-grief-and-loss` stays declined per book-doc Decisions 7 (simile mourning, no death in the narrative; personal-crisis register not present at national-oracle scale).
- `creation` considered for 12:1 — declined: single-verse doxological credential; the distinctive clause is already anchored by `the-breath-of-life`.
- No yields (5 tags).

### (g) Ceiling flag
- Subdivided in book doc (sections: 12:1–9; 12:10–14) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 13

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `forgiveness-of-sins` | "In that day there will be a fountain opened to David’s house and to the inhabitants of Jerusalem, for sin and for uncleanness." | 13:1 | Cleansing provided at the source — prior art confirmed |
| keep | `testing` | "will refine them as silver is refined, and will test them like gold is tested" | 13:9 | Prior art confirmed; testing.yaml itself anchors Zechariah 13:9 (torrey 0.75) |
| keep | `divine-judgment` | "two parts in it will be cut off and die; but the third will be left in it" | 13:8 | Idols cut off, lying prophets silenced (13:2–3) — prior art confirmed |
| keep | `false-prophets` | "You must die, because you speak lies in the LORD’s name;" | 13:3 | Purge so complete the prophets disclaim the trade (13:4–6) — prior art confirmed |
| keep | `idolatry` | "I will cut off the names of the idols out of the land" | 13:2 | The purge's other half — prior art confirmed |
| keep | `messianic-prophecy` | "Strike the shepherd, and the sheep will be scattered" | 13:7 | Prior art confirmed; NT citation (Matt 26:31; Mark 14:27) stays an attributed-fact prose signpost |
| keep | `remnant` | "I will bring the third part into the fire" | 13:9 | The preserved third refined until the covenant exchange — "It is my people" (13:8–9) — prior art confirmed |

### (b) Anchor-extension candidates — NOTE: Zechariah 13 is main-witnessed; these are assertable on today's corpus, not PR-beta riders.
- `forgiveness-of-sins` — Zechariah 13:1 — "a fountain opened to David’s house and to the inhabitants of Jerusalem, for sin and for uncleanness" — proposed weight 0.75 — the fountain-for-sin text (hymn-heavy query neighborhood); pairs with the lexicon candidate below. IN CORPUS on main.
- `remnant` — Zechariah 13:8-9 — "but the third will be left in it" — proposed weight 0.8 — the refined-remnant text; span-sibling note: `testing` owns 13:9's refining clause (existing anchor) — propose 13:8-9 here with a dual-span note per the sibling precedent, or clip to 13:8 if the curator prefers zero overlap. IN CORPUS on main.
- `messianic-prophecy` — Zechariah 13:7 — "Strike the shepherd, and the sheep will be scattered" — proposed weight 0.75 — attributed fact: Matthew 26:31 / Mark 14:27 quote it; span-sibling note: `shepherds-and-the-flock` already anchors 13:7 (0.7) — dual-span per the recorded sibling precedent (zero shared lexicon phrases). IN CORPUS on main.

### (c) Lexicon candidates
- `forgiveness-of-sins` — phrase: "a fountain opened for sin" — realistic query phrasings: "fountain for sin and uncleanness"; "fountain opened in zechariah"; "there is a fountain for sin". Landing verse Zech 13:1 is main-witnessed — measurable today.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none. The Zechariah-block routing "refiner's fire → `testing` (anchors Zech 13:9 itself)" stands — confirmed against the pack.

### (f) Decisions record
- `shepherds-and-the-flock` ch 13 stays skipped per the application pass (single verse 13:7, shared with `messianic-prophecy`; the theme's home is ch 11) — confirmed.
- 7 tags — one under the hard ceiling; every tag independently clears the bar. No yields.

### (g) Ceiling flag
- Subdivided in book doc (sections: 13:1–6; 13:7–9) → per-verse refinement pass. Did not hit hard ceiling 8.

## Zechariah 14

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "their flesh will consume away while they stand on their feet" | 14:12 | The nations gathered, then struck; great panic (14:2–3, 12–15) — prior art confirmed |
| keep | `worship` | "will go up from year to year to worship the King, the LORD of Armies, and to keep the feast of booths" | 14:16 | Rain withheld from families that do not go up to worship (14:17) — prior art confirmed |
| keep | `holiness` | "every pot in Jerusalem and in Judah will be holy to the LORD of Armies" | 14:21 | "HOLY TO THE LORD" on the horses' bells (14:20) — prior art confirmed |
| keep | `nations-and-peoples` | "everyone who is left of all the nations that came against Jerusalem" | 14:16 | All the families of the earth in the pilgrimage (14:16–17) — prior art confirmed |
| keep | `day-of-the-lord` | "Behold, a day of the LORD comes" | 14:1 | The phrase's own closing panorama (14:1–9) — prior art confirmed |
| add | `god-reigns` | "The LORD will be King over all the earth. In that day the LORD will be one, and his name one." | 14:9 | The chapter's stated summit, with the King worshiped year by year (14:16–17) — exactly the pack's "god is king" substance; see (f) for the open joint-decision note |
| add | `appointed-feasts` | "to worship the King, the LORD of Armies, and to keep the feast of booths" | 14:16 | The feast of booths named three times (14:16, 18, 19) as the closing scene's practice — the pack's own "feast of booths" lexicon names it; a major tabernacles text |

### (b) Anchor-extension candidates
- `god-reigns` — Zechariah 14:9 — "The LORD will be King over all the earth." — proposed weight 0.8 — the OT's plainest universal-kingship sentence; the pack has no Minor-Prophets anchor. Rides PR-beta.
- `day-of-the-lord` — Zechariah 14:1-9 — "Behold, a day of the LORD comes" — proposed weight 0.85 — the phrase-bearing panorama; the pack anchors five other Minor-Prophets day texts but not Zechariah's. Rides PR-beta.
- `living-water` — Zechariah 14:8 — "living waters will go out from Jerusalem" — proposed weight 0.8 — one of the three OT living-waters-from-the-sanctuary texts (pack already anchors Ezekiel 47:1-12 at 0.95). Rides PR-beta.
- `appointed-feasts` — Zechariah 14:16-19 — "to keep the feast of booths" — proposed weight 0.7 — the feast of booths' prophetic text (read at Sukkot); the pack's anchors are all law/history. Rides PR-beta.
- `holiness` — Zechariah 14:20-21 — "HOLY TO THE LORD" — proposed weight 0.65 — holiness overflowing to ordinary things; distinctive inscription phrase. Rides PR-beta.

### (c) Lexicon candidates
- honest-and-empty — none. ("The lord will be king over all the earth" was considered and judged already reachable through `god-reigns`'s "god is king" / "the lord reigns" entries once the anchor lands.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none. The Zechariah-block deferral (tag-gaps-review §3.5: "Zech 14:9's kingship deferred to the `god-reigns` / `kingdom-of-heaven` joint decision") is a deferral, not a decline, and this ledger does not resolve it — see (f).

### (f) Decisions record
- `god-reigns` ADDED (6th tag; see (a)) — delegated call: the deferral recorded in the Zechariah block concerns which tag-gaps ROW receives the 14:9 ref (the `god-reigns` vs `kingdom-of-heaven` kept-separate design, §1(e)); it does not bar display-tagging with the existing engine id whose substance ("The LORD will be King over all the earth") the chapter states verbatim. The joint row decision REMAINS OPEN; the (b) anchor candidate is routed to whichever design the curator lands. Reversible.
- `appointed-feasts` ADDED (7th tag; see (a)) — delegated call; chapter now at 7, one under the hard ceiling, every tag independently clearing the bar. Reversible.
- `living-water` considered as a tag for 14:8 — declined: single verse; served by the (b) anchor candidate.
- `second-coming` stays a prose signpost per book-doc Decisions 4 (later-revelation read-back on this book) — confirmed. `remnant` ch 14 stays skipped per the application pass (14:16 is the nations'-survivors register, carried by `nations-and-peoples`) — confirmed.
- No yields (7 tags, none over the ceiling).

### (g) Ceiling flag
- Subdivided in book doc (sections: 14:1–15; 14:16–21) → per-verse refinement pass. Did not hit hard ceiling 8.

---

## Book roll-up

- **Chapters swept:** 14/14 against the full 239-id engine library, the adopted display list (via prior art), declines.md (§3 + §1 + rulings), and backlog-roster.md.
- **Applied-tag deltas:** 6 adds (`messianic-prophecy` chs 3, 6; `holy-spirit` ch 4; `hardness-of-heart` ch 7; `god-reigns` ch 14; `appointed-feasts` ch 14); 65 keeps; 0 drops. No chapter exceeds 7 tags; no yields anywhere, so no yield-class entries were needed beyond the per-chapter "no yields" records.
- **Anchor-extension candidates:** 24 proposed (3 assertable now on Zech 13; 21 ride PR-beta), plus 3 explicitly-not-duplicated notes (messianic-prophecy 6:12-13 and 9:9 already anchored; the-breath-of-life 12:1 already anchored; holy-spirit 4:6/12:10 already noted refs in the fold comment).
- **Lexicon candidates:** 7 (`repentance` return-formula; `gods-protection` apple-of-his-eye; `holy-spirit` not-by-might; `do-not-lose-heart` day-of-small-things; `refuge-in-trouble` prisoners-of-hope; `holy-spirit` spirit-of-grace-and-supplication with caveat; `forgiveness-of-sins` fountain-for-sin, main-measurable).
- **New-concept candidates:** none — honest-and-empty across all 14 chapters; every theme found has an honest home in the current vocabulary or an existing row. No tag-gaps.md append was required (nothing vocabulary-absent found), so no write was made to tag-gaps.md.
- **Decline-overturn proposals:** none. All standing Zechariah-block declines/routings re-checked and confirmed (Satan→resisting-the-devil; refiner's fire→testing; return-to-me→repentance; speak-truth→honesty; jealousy-of-God not-a-register; 14:9 joint decision left open).
- **Routed to backlog:** 2 evidence routings to roster row 40 `gentile-inclusion` (Zech 2:11; 8:23); 1 evidence note to the shepherds-and-the-flock bad-shepherds re-open note (Zech 11:15-17).
- **Ceiling flags:** no chapter hit the hard ceiling of 8; chapters 1, 2, 5, 6, 9, 11, 12, 13, 14 are subdivided in the book doc and are flagged for the per-verse refinement pass on that ground.

## Erratum — pastoral-* id normalization (2026-08-26)

Vocabulary-consistency check (Minor Prophets thread, 2026-08-26): the 14
`pastoral-*` packs' YAML `id:` fields omit the `pastoral-` prefix; per
CONVENTIONS §5 the canonical id for ledger use is the prefixed FILENAME form
(never strip the prefix). One mention in this ledger used the unprefixed
YAML-id form as a concept id. Original lines are left untouched per
CONVENTIONS §9; read them with the correction below.

- Zechariah 4, §(f) Decisions record — "`strength-in-weakness` considered
  for 4:6 — declined: that pack is the 2 Corinthians 12 grace-sufficient
  personal register ...": the pack considered is the pastoral pack; read as
  canonical `pastoral-strength-in-weakness` (pack file
  `ontology/concepts/pastoral-strength-in-weakness.yaml`, YAML
  `id: strength-in-weakness`).
