# Sweep ledger — Hosea

- **Book:** Hosea
- **Sweep date:** 2026-08-26
- **Repo SHA (origin/main):** e762d1c629f5b121a2aacc6da57cca6bacc3215e
- **Concept census:** 239 (ontology/concepts/ @ SHA above)
- **WEB text source:** pipeline/fixtures/web-subset.json @ 87fd68c (full-Bible expansion; pinned WEB sourceSha256 b6f55cc7…, identical to main's committed fixture pin);
  fixture-witnessed-on-main chapters for this book: **none** — all 14 chapters of Hosea are expansion-only (absent from main's 5,726-verse fixture corpus), so EVERY engine candidate below (anchors and lexicon rows) is corpus-blocked and rides PR-β per backlog-roster.md; all are loggable now, assertable only after the expansion merges.
- **Inputs read:** BRIEF.md; hosea.md book doc (incl. its Decisions record and Reviewer/critic records); concept-index.md + packs/ (full YAMLs read for every id proposed or extended); declines.md (tag-gaps-review §3 + §1 + Jesse's 2026-08-25 postscript rulings); backlog-roster.md (engine-pack-backlog, 50-row roster); tag-apply/adopted-concepts.md (the canonical §11.1 adopted list, 161 ids with engine-built status — per coordinator update 2026-08-26)
- **Adopted-display-id status (per adopted-concepts.md):** the book doc's `spiritual-adultery` and `sowing-and-reaping` tags are §11.1 adopted display ids marked **engine-built: no** — valid display vocabulary with no pack in ontology/concepts/; both are handled below as prior art (kept) with their engine-side substance routed (row 2; `sin` lexicon respectively). Every id this ledger adds or extends is engine-built: yes (verified against the list and packs/).
- **Id-form note:** the pastoral packs' filenames are `pastoral-*.yaml` while their internal `id:` fields omit the prefix (e.g. `pastoral-relapse-and-restoration.yaml` carries `id: relapse-and-restoration`). This ledger follows the book doc's prior art and CONVENTIONS §5's worked example (never strip the prefix) and writes the filename form; flagged once here for the curator, not re-litigated per chapter.
- **Existing Hosea anchors found in packs (kept, not re-proposed):** `knowing-god` Hos 4:6 (0.95) + Hos 6:3 (0.85); `mercy` Hos 6:6 (0.95) + Hos 2:23 (0.7); `wrestling-with-god` Hos 12:3-4 (0.8). `pastoral-betrayal-and-marriage-crisis` deliberately excludes Hosea (its own YAML comment; book-doc Decisions #1) — honored throughout.

## Hosea 1

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will avenge the blood of Jezreel on the house of Jehu, and will cause the kingdom of the house of Israel to cease" | 1:4 | the children's names pronounce sentence (also 1:6, 1:9) |
| keep | `sin` | "the land commits great adultery, forsaking the LORD" | 1:2 | the stated ground of the sign-act |
| keep | `restoration` | "in the place where it was said to them, ‘You are not my people,’ they will be called ‘sons of the living God.’" | 1:10 | reversal beyond judgment, the chapter's own turn |
| keep | `spiritual-adultery` | "the land commits great adultery, forsaking the LORD" | 1:2 | adopted display id, prior art; engine side ROUTED to backlog row 2 (see f) |
| add | `restoration-of-israel` | "The children of Judah and the children of Israel will be gathered together, and they will appoint themselves one head" | 1:11 | national regathering promised in the chapter's own words — the pack's "god will gather israel" register; both-tags with `restoration` per §11.2 |

### (b) Anchor-extension candidates
- `restoration-of-israel` — Hosea 1:10–11 — "in the place where it was said to them, ‘You are not my people,’ they will be called ‘sons of the living God.’" — proposed weight 0.70 — the regathering promise with the not-my-people reversal; pack currently has no Hosea witness (anchors are Jer/Ezek/Deut/Ps).
- `adoption-as-gods-children` — Hosea 1:10 — "they will be called ‘sons of the living God.’" — proposed weight 0.60 — OT sonship register the pack already carries (Deut 14:1); attributed NT citation: Romans 9:26 quotes this verse — comment must state both contexts, no read-back in the gist.

### (c) Lexicon candidates
- honest-and-empty — none ("you are not my people" phrasings land 1:9–10 lexically once the expansion corpus merges; no concept row needed — the plan §3.3 NO-MEASURABLE-EFFECT class).

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `spiritual-adultery` (adopted display id, NOT an engine id): matches backlog row 2 — ROUTED, not duplicated. New evidence for that row from this chapter: "the land commits great adultery, forsaking the LORD" (1:2) — the minting book's opening charge.
- `restoration` + `restoration-of-israel` both kept per the §11.2 both-tags ruling; the §1(e) restoration-register TENSION (Isaiah block: personal-renewal vs national register) is RECORDED here, not relitigated — curator resolves at pack time with both in view.
- `adoption-as-gods-children` display tag considered and NOT added — thin single-verse witness (1:10); the anchor candidate in (b) carries it instead.
- `day-of-the-lord` considered for "It will happen in that day" (1:5) / "great will be the day of Jezreel" (1:11) and declined per the Habakkuk decline precedent (declines §3.5): adjacent day-language, never the phrase or theme.
- No yields — 5 tags, under soft cap.

### (g) Ceiling flag
- no

## Hosea 2

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-love` | "I will allure her, and bring her into the wilderness, and speak tenderly to her" | 2:14 | the wronged husband woos rather than discards (also 2:19) |
| keep | `divine-judgment` | "I will hedge up your way with thorns" | 2:6 | the stripping of the unfaithful wife (also 2:11, 2:13) |
| keep | `restoration` | "the valley of Achor for a door of hope" | 2:15 | judgment gives way to renewal (also 2:23) |
| keep | `covenant` | "In that day I will make a covenant for them with the animals of the field" | 2:18 | covenant formally remade, sealed in betrothal (2:19–20) |
| keep | `gods-provision` | "she didn’t know that I gave her the grain, the new wine, and the oil" | 2:8 | who really provides is the chapter's argument (book-doc Decisions #11 upheld) |
| keep | `spiritual-adultery` | "I will go after my lovers, who give me my bread and my water, my wool and my flax" | 2:5 | adopted display id, prior art; ROUTED to backlog row 2 (see f) |
| keep | `mercy` | "I will have mercy on her who had not obtained mercy" | 2:23 | Lo-Ruhamah overturned; pack already anchors 2:23 |

### (b) Anchor-extension candidates
- `gods-love` — Hosea 2:19–20 — "I will betroth you to me forever. Yes, I will betroth you to me in righteousness, in justice, in loving kindness, and in compassion." — proposed weight 0.80 — the betrothal-love register; gods-love has NO Hosea anchor today despite the book being its OT heartland.
- `knowing-god` — Hosea 2:20 — "I will even betroth you to me in faithfulness; and you shall know the LORD." — proposed weight 0.70 — verse-scoped sibling inside the gods-love 2:19–20 candidate (2 Chr 7:14 multi-claim precedent); the pack's OWN header already lists Hos 2:20 among its corpus-blocked densest witnesses — this formalizes it.
- `covenant` — Hosea 2:18 — "In that day I will make a covenant for them with the animals of the field, and with the birds of the sky" — proposed weight 0.65 — covenant remade with creation-wide peace; verse-disjoint from the gods-love 2:19–20 candidate (span discipline in f).
- `hope-in-god` — Hosea 2:15 — "I will give her vineyards from there, and the valley of Achor for a door of hope" — proposed weight 0.60 — the door-of-hope text itself; pairs with the (c) lexicon row.
- `gods-provision` — Hosea 2:8–9 — "she didn’t know that I gave her the grain, the new wine, and the oil, and multiplied to her silver and gold" | proposed weight 0.60 — the unrecognized-Provider register (giver AND taker, 2:9); the pack's anchors are all NT/Psalms provision-promises — this is its OT indictment-side witness.

### (c) Lexicon candidates
- `hope-in-god` — phrase: "door of hope" — realistic query phrasings: "valley of achor door of hope"; "door of hope in the bible"; "what is the valley of achor". (Two significant tokens {door, hope}; only admissible together with the Hos 2:15 anchor — an unanchored phrase would point at nothing the pack can chip, per gods-unchanging-nature's recorded Heb 13:8 discipline.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Span discipline on the betrothal oracle, decided here so candidates don't collide: `covenant` takes 2:18 alone; `gods-love` takes 2:19–20; `knowing-god` takes 2:20 verse-scoped; `mercy` keeps its existing 2:23. Recorded so the curation pass sees one design, not four accidents.
- `spiritual-adultery` ROUTED to backlog row 2; new evidence: "For their mother has played the prostitute" (2:5) with the days-of-the-Baals indictment (2:13) — the row's fullest single chapter.
- `knowing-god` display tag stays SKIPPED on this chapter (book-doc Decisions #21 tag-apply record: 2:20 is a thin single-clause witness on a cap-watch chapter) — the verse-scoped anchor candidate is the corrective, not a tag.
- 7 tags: above soft cap 6, below hard ceiling 8; all seven are pre-existing prior art and each independently clears the presence bar (book-doc reviewer record) — no yield forced, none taken.
- No yields — no silent drops.

### (g) Ceiling flag
- subdivided in book doc (sections: 2:1–13 / 2:14–23) → per-verse refinement pass; 7 tags (above soft cap, did not hit 8).

## Hosea 3

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-love` | "love a woman loved by another, and an adulteress, even as the LORD loves the children of Israel, though they turn to other gods" | 3:1 | the chapter's own comparison |
| keep | `restoration` | "Afterward the children of Israel shall return and seek the LORD their God, and David their king" | 3:5 | the sign's promised outcome |
| keep | `spiritual-adultery` | "even as the LORD loves the children of Israel, though they turn to other gods" | 3:1 | adopted display id, prior art; ROUTED to backlog row 2 (see f) |
| add | `restoration-of-israel` | "the children of Israel shall live many days without king, without prince, without sacrifice" … "Afterward the children of Israel shall return and seek the LORD their God" | 3:4–5 | the sign's read-out is national: long deprivation, then Israel's return — the pack's restoration-of-Israel register; both-tags with `restoration` |

### (b) Anchor-extension candidates
- `restoration-of-israel` — Hosea 3:4–5 — "Afterward the children of Israel shall return and seek the LORD their God, and David their king, and shall come with trembling to the LORD and to his blessings in the last days." — proposed weight 0.65 — the many-days-then-return shape of the exile-and-return hope.

### (c) Lexicon candidates
- ROUTED: matches backlog row 2 (`spiritual-adultery`) — the Hosea-and-Gomer story queries belong to that row's eventual pack, recorded as lexicon evidence for its curator: "why did god tell hosea to marry a prostitute"; "hosea and gomer"; "hosea buys gomer back". No row here — route, don't duplicate.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- "David their king" (3:5) ROUTED to backlog row 44 (`davidic-covenant`, DEFERRED-to-re-pin) as new evidence: "the children of Israel shall return and seek the LORD their God, and David their king" (3:5) — a prophets-side witness to the Davidic hope beyond the row's 2 Sam 7 home text. Not proposed as a `messianic-prophecy` anchor: identifying 3:5's "David" messianically is exactly the adjudication the no-read-back rule bars (contrast 11:1, where Matthew's citation is attributable).
- `spiritual-adultery` ROUTED to row 2; new evidence: 3:1 (quote above) — the buy-back command, the row's second defining text.
- No yields — 4 tags.

### (g) Ceiling flag
- no

## Hosea 4

honest-and-empty: no new candidates; existing book-doc tags reviewed and kept.

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `sin` | "There is cursing, lying, murder, stealing, and committing adultery; they break boundaries, and bloodshed causes bloodshed" | 4:2 | the formal charge sheet |
| keep | `divine-judgment` | "the LORD has a charge against the inhabitants of the land" | 4:1 | lawsuit frame with sentence following (4:9) |
| keep | `idolatry` | "Ephraim is joined to idols. Leave him alone!" | 4:17 | verdict over worship rotted into fertility religion (4:12–13) |
| keep | `knowing-god` | "My people are destroyed for lack of knowledge" | 4:6 | the chapter's diagnosis (4:1 too); pack already anchors 4:6 at 0.95 |
| keep | `spiritual-adultery` | "the spirit of prostitution has led them astray" | 4:12 | adopted display id, prior art; ROUTED to backlog row 2 (see f) |

### (b) Anchor-extension candidates
- honest-and-empty — none. (`knowing-god`'s 4:6 anchor already exists; 4:1's "no knowledge of God in the land" is adjacent to the same claim and adding it would double-fire one argument.)

### (c) Lexicon candidates
- honest-and-empty — none ("my people are destroyed for lack of knowledge" is already `knowing-god` lexicon: "lack of knowledge").

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `drunkenness` considered for "Prostitution, wine, and new wine take away understanding" (4:11) and declined: one aphorism inside an indictment, thin single-verse; the Jeremiah 13:13 decline (declines §3.5, "judgment imagery, not the practice") marks how carefully that pack's presence bar has been held.
- `empty-worship` considered for the shrine sacrifices (4:13–14) and declined: the depicted rot is idol-worship (the `idolatry` register), not piety-performed-for-show or worship-while-withholding-obedience.
- `spiritual-adultery` ROUTED to row 2; new evidence: "the spirit of prostitution has led them astray, and they have been unfaithful to their God" (4:12).
- No yields — 5 tags.

### (g) Ceiling flag
- no

## Hosea 5

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "For the judgment is against you; for you have been a snare at Mizpah" | 5:1 | summons of priests, people, and king; lion climax (5:14) |
| keep | `the-lords-discipline` | "The rebels are deep in slaughter, but I discipline all of them" | 5:2 | corrective aim stated at 5:15 (book-doc Decisions #6 upheld) |
| keep | `knowing-god` | "the spirit of prostitution is within them, and they don’t know the LORD" | 5:4 | stated root of the inability to return |
| keep | `spiritual-adultery` | "the spirit of prostitution is within them" | 5:4 | adopted display id, prior art; ROUTED to backlog row 2 (see f) |

### (b) Anchor-extension candidates
- `trusting-in-man` — Hosea 5:13 — "then Ephraim went to Assyria, and sent to King Jareb: but he is not able to heal you, neither will he cure you of your wound" — proposed weight 0.65 — the broken-reed-alliance register the pack was minted for (its Ezek 29:6-7 sibling); Assyria sought instead of the LORD who wounded to heal.
- `seeking-god` — Hosea 5:15 — "until they acknowledge their offense, and seek my face. In their affliction they will seek me earnestly." — proposed weight 0.60 — seek-my-face vocabulary the pack collects; comment must carry the context (seeking born of affliction after judicial withdrawal), so it validates rather than leads.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none. (God's judicial withdrawal — "He has withdrawn himself from them," 5:6; "I will go and return to my place," 5:15 — was weighed as a possible gap and NOT proposed: `wrestling-with-god` already carries "when god is silent", `hunger-for-god` the dryness register, and serving sin-caused-withdrawal texts to a felt-distance searcher would be pastorally wrong. Recorded as a motif, not a gap — hence no tag-gaps.md row.)

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `trusting-in-man` display tag considered and NOT added — 5:13 is a single verse here; the theme's substantial chapter is 7 (tagged there). Anchor candidate carries this verse.
- `spiritual-adultery` ROUTED to row 2; new evidence: "the spirit of prostitution is within them, and they don’t know the LORD" (5:4).
- No yields — 4 tags.

### (g) Ceiling flag
- no

## Hosea 6

honest-and-empty: no new candidates; existing book-doc tags reviewed and kept (Hosea's two existing engine anchors in this chapter verified in place).

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "Come! Let’s return to the LORD; for he has torn us to pieces, and he will heal us" | 6:1 | models the shape of return while God's reply exposes its shallowness (6:4) |
| keep | `divine-judgment` | "Therefore I have cut them to pieces with the prophets; I killed them with the words of my mouth" | 6:5 | judgment executed by the prophetic word |
| keep | `knowing-god` | "Let’s acknowledge the LORD. Let’s press on to know the LORD" | 6:3 | with 6:6's "the knowledge of God more than burnt offerings"; pack already anchors 6:3 at 0.85 |
| keep | `mercy` | "For I desire mercy, and not sacrifice" | 6:6 | the pack's own minting quotation; already anchored at 0.95 |

### (b) Anchor-extension candidates
- honest-and-empty — none (6:3 and 6:6 already anchored by `knowing-god` and `mercy` respectively; nothing else clears the bar).

### (c) Lexicon candidates
- honest-and-empty — none ("i desire mercy not sacrifice" is already `mercy` lexicon).

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none. (The book doc's no-`resurrection`-tag call on 6:2 is a book-doc decision, not a tag-gaps-review §3 decline; nothing here proposes revisiting it — the third-day language stays a prose signpost.)

### (f) Decisions record
- `revival-and-reformation` anchor considered for "Come! Let’s return to the LORD" (6:1–3) and declined on sense-inversion: God's direct reply — "your love is like a morning cloud, and like the dew that disappears early" (6:4) — frames the resolve as evaporating; anchoring a revival query here answers longing with a rebuke of feigned return (same ground as the reviewer's `hunger-for-god` drop, book-doc Decisions #12, which this sweep re-checked and upholds).
- `empty-worship` considered for the 6:6 context and declined: `mercy` owns 6:6, and the mercy pack's own Micah 7:18 comment shows the no-adjacent-re-anchoring discipline this would break.
- `covenant` stays restricted to ch 2 (book-doc Decisions #16): 6:7's "like Adam, have broken the covenant" is a breach reference, not the institution-and-renewal substance.
- No yields — 4 tags.

### (g) Ceiling flag
- no

## Hosea 7

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `self-deception` | "gray hairs are here and there on him, and he doesn’t realize it" | 7:9 | a nation blind to its own decay (7:2, 7:11) |
| keep | `sin` | "the iniquity of Ephraim is uncovered, also the wickedness of Samaria" | 7:1 | corruption surfacing at every attempted healing (7:4) |
| keep | `divine-judgment` | "When they go, I will spread my net on them. I will bring them down like the birds of the sky. I will chastise them" | 7:12 | concrete sentence (also 7:16) |
| add | `trusting-in-man` | "Ephraim is like an easily deceived dove, without understanding. They call to Egypt. They go to Assyria." | 7:11 | foreign-alliance reliance is a chapter theme — "Ephraim mixes himself among the nations" (7:8), "Strangers have devoured his strength" (7:9) — the pack's misplaced-trust register, not a passing touch |

### (b) Anchor-extension candidates
- `trusting-in-man` — Hosea 7:11 — "Ephraim is like an easily deceived dove, without understanding. They call to Egypt. They go to Assyria." — proposed weight 0.70 — the Egypt-and-Assyria vacillation text; sibling of the pack's corpus-blocked Isa 31:1 rider.
- `empty-worship` — Hosea 7:14 — "They haven’t cried to me with their heart, but they howl on their beds. They assemble themselves for grain and new wine." — proposed weight 0.70 — the lip-service register exactly (assembly without heart), the pack's Isa 29:13 sibling.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `empty-worship` display tag considered and NOT added — 7:14 is a single verse in this chapter (thin single-verse class); its substantial chapter is 8 (tagged there); anchor candidate carries the verse.
- No yields — 4 tags.

### (g) Ceiling flag
- no

## Hosea 8

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will send a fire on his cities, and it will devour its fortresses" | 8:14 | sentence on covenant-breach (also 8:7) |
| keep | `sin` | "they have broken my covenant and rebelled against my law" | 8:1 | covenant-breaking made concrete (8:11) |
| keep | `self-deception` | "They cry to me, ‘My God, we, Israel, acknowledge you!’" | 8:2 | pious words over a life that "has cast off that which is good" (8:3; book-doc Decisions #13 upheld) |
| keep | `idolatry` | "Of their silver and their gold they have made themselves idols, that they may be cut off" | 8:4 | Samaria's calf dismissed as workman-made and no God (8:5–6) |
| keep | `sowing-and-reaping` | "For they sow the wind, and they will reap the whirlwind" | 8:7 | adopted display id, prior art; engine substance routed to `sin` (see f) |
| add | `empty-worship` | "they sacrifice meat and eat it, but the LORD doesn’t accept them" | 8:13 | worship God rejects, stated twice over — hollow acknowledgment (8:2) and multiplied altars whose sacrifices the LORD refuses (8:11–13): the pack's why-God-rejects-worship register, substantial |

### (b) Anchor-extension candidates
- `sin` — Hosea 8:7 — "For they sow the wind, and they will reap the whirlwind." — proposed weight 0.70 — the harvest-law proverb; the pack already carries the register (Gal 6:7-8 anchor; "reap what you sow" lexicon), and this is its sharpest OT statement.
- `empty-worship` — Hosea 8:11–13 — "Because Ephraim has multiplied altars for sinning, they became for him altars for sinning." … "they sacrifice meat and eat it, but the LORD doesn’t accept them" — proposed weight 0.70 — multiplied ritual, refused worship.
- `idolatry` — Hosea 8:4–6 — "Of their silver and their gold they have made themselves idols" … "the calf of Samaria shall be broken in pieces" — proposed weight 0.70 — the calf-idol register continued from Exod 32 (the pack's "golden calf" lexicon whose Exod 32:1-8 anchor is itself corpus-blocked); a second calf witness for the same query family.

### (c) Lexicon candidates
- `sin` — phrase: "sow the wind reap the whirlwind" — realistic query phrasings: "sow the wind reap the whirlwind"; "reap the whirlwind meaning"; "sowing the wind bible verse". (Only admissible with the Hos 8:7 anchor above; pairs {sow, wind} / {reap, whirlwind} keep ≥2 significant tokens.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `sowing-and-reaping` (adopted display id; NOT an engine id and NOT a backlog roster row): engine-side disposition recorded here — treated as covered by `sin`'s designed "reap what you sow" lexicon; this chapter's evidence is therefore filed as the `sin` anchor + lexicon candidates above, and no mint is proposed. Display tag kept untouched as prior art.
- `trusting-in-man` considered for "Ephraim has hired lovers for himself" / gone up to Assyria (8:9–10) and declined for this chapter — the reliance theme is carried substantially by ch 7's tag and candidates; here it is one image inside the judgment oracle.
- 6 tags — at soft cap, each clears the bar; no yields.

### (g) Ceiling flag
- no

## Hosea 9

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "The days of visitation have come. The days of reckoning have come." | 9:7 | reckoning pronounced through the chapter (9:15, 9:17) |
| keep | `sin` | "They have deeply corrupted themselves, as in the days of Gibeah" | 9:9 | corruption measured against Israel's worst (9:10) |
| keep | `spiritual-adultery` | "you were unfaithful to your God. You love the wages of a prostitute at every grain threshing floor." | 9:1 | adopted display id, prior art; ROUTED to backlog row 2 (see f) |

### (b) Anchor-extension candidates
- honest-and-empty — none as extensions. ROUTED: matches backlog row 45 (`exile-and-captivity`, SKIPPED-blocked + Jesse's routing call) — new evidence from this chapter: "Ephraim will return to Egypt, and they will eat unclean food in Assyria" (9:3) and "they will be wanderers among the nations" (9:17) — a prophets-side exile witness for whichever way Jesse's fold-vs-mint call goes. Nothing proposed here.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `pastoral-pregnancy-and-child-loss` re-checked against 9:11–16 and the book doc's rejection (Decisions #10) is UPHELD emphatically: the barrenness and bereavement here are judgment imagery against a nation — "Give them a miscarrying womb and dry breasts" (9:14) must never surface for a grieving parent. Not a candidate for any pack.
- `spiritual-adultery` ROUTED to row 2; new evidence: 9:1 (quote above) — the register outside chs 1–3.
- Chapter deliberately left at 3 tags — honest-and-empty preferred over padding.
- No yields.

### (g) Ceiling flag
- no

## Hosea 10

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "He will demolish their altars. He will destroy their sacred stones." | 10:2 | through to the daybreak destruction of the king (10:14–15) |
| keep | `repentance` | "Break up your fallow ground, for it is time to seek the LORD" | 10:12 | the standing invitation inside the judgment oracle |
| keep | `sin` | "You have plowed wickedness. You have reaped iniquity. You have eaten the fruit of lies" | 10:13 | sin from the days of Gibeah (10:9) |
| keep | `idolatry` | "The inhabitants of Samaria will be in terror for the calves of Beth Aven" | 10:5 | the idol itself carried to Assyria (10:6) |
| keep | `sowing-and-reaping` | "Sow to yourselves in righteousness, reap according to kindness" | 10:12 | adopted display id, prior art; engine substance rides the ch-8 `sin` candidates |

### (b) Anchor-extension candidates
- `revival-and-reformation` — Hosea 10:12 — "Break up your fallow ground, for it is time to seek the LORD, until he comes and rains righteousness on you." — proposed weight 0.70 — the fallow-ground revival call preached as such for centuries; the pack's reform-narrative riders are all corpus-blocked, and this adds the prophets' imperative form. ONE-EXTENSION NOTE: `seeking-god` is the alternative honest home ("it is time to seek the LORD" is its vocabulary) — curator should place the verse in ONE of the two, not both; this ledger's default is revival-and-reformation (the corporate returning register), with seeking-god named as the road not taken.
- `trusting-in-man` — Hosea 10:13 — "for you trusted in your way, in the multitude of your mighty men" — proposed weight 0.65 — false confidence in military strength, the pack's Ps 33:16-17 sibling.

### (c) Lexicon candidates
- `revival-and-reformation` — phrase: "break up your fallow ground" — realistic query phrasings: "break up your fallow ground"; "fallow ground meaning in the bible"; "it is time to seek the lord". (Only with the Hos 10:12 anchor; {break, fallow, ground} ≥2 significant tokens. Jer 4:3, the twin text, is also corpus-blocked — noted for the curator.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- "They will tell the mountains, ‘Cover us!’ and the hills, ‘Fall on us!’" (10:8) — later cited at Luke 23:30 / Rev 6:16; left as prose-level fact, no anchor or tag proposed (read-back discipline; nothing in the vocabulary owns the image on its own terms).
- `seeking-god`/`revival-and-reformation` one-extension decision recorded in (b) — no double-fire proposed.
- No yields — 5 tags.

### (g) Ceiling flag
- no

## Hosea 11

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `gods-love` | "When Israel was a child, then I loved him, and called my son out of Egypt." | 11:1 | parental love remembered (11:3–4) and love that overrules wrath (11:8) |
| keep | `divine-judgment` | "the Assyrian will be their king, because they refused to repent" | 11:5 | real sentence pronounced before mercy overrules (11:6) |
| keep | `restoration` | "They will come trembling like a bird out of Egypt, and like a dove out of the land of Assyria; and I will settle them in their houses" | 11:11 | the homecoming |
| keep | `mercy` | "My heart is turned within me, my compassion is aroused" | 11:8 | compassion that spares the deserved sentence (11:9) |
| add | `restoration-of-israel` | "They will walk after the LORD, who will roar like a lion; for he will roar, and the children will come trembling from the west." | 11:10 | Israel regathered from Egypt and Assyria and resettled (11:11) — the pack's national-regathering register; both-tags with `restoration` |

### (b) Anchor-extension candidates
- `gods-love` — Hosea 11:1–4 — "I drew them with cords of a man, with ties of love; and I was to them like those who lift up the yoke on their necks; and I bent down to him and I fed him." — proposed weight 0.85 — the parental-love register (taught to walk, carried, fed): a gods-love face its current anchor set (betrothal, John 3:16, delight) does not carry.
- `mercy` — Hosea 11:8–9 — "How can I give you up, Ephraim? … My heart is turned within me, my compassion is aroused. I will not execute the fierceness of my anger." — proposed weight 0.80 — the OT's most dramatic compassion-overruling-wrath text; joins the pack's existing Hosea pair (2:23, 6:6).
- `gods-unchanging-nature` — Hosea 11:9 — "for I am God, and not man—the Holy One among you" — proposed weight 0.60, verse-scoped CAVEAT anchor — the contrast-of-nature ground (the pack's Num 23:19 precedent, whose comment pattern applies verbatim): the verse's contextual point is mercy transcending human anger, not a treatise on divine embodiment; comment must say so.
- `messianic-prophecy` — Hosea 11:1 — "and called my son out of Egypt" — proposed weight 0.60, CAVEAT anchor — attributed citation: Matthew 2:15 quotes this verse of Jesus; in Hosea's own context the son is Israel at the exodus, and the comment must carry BOTH statements (the pack's Ps 102:25-27→Heb 1 attributed-citation pattern under supremacy-of-christ). Engine-side location of a named citation, NOT a display tag — the book doc's no-later-revelation-tag call (Decisions #3) stands untouched.
- `restoration-of-israel` — Hosea 11:10–11 — "They will come trembling like a bird out of Egypt, and like a dove out of the land of Assyria; and I will settle them in their houses" — proposed weight 0.70 — regathering from the two exile lands by name.

### (c) Lexicon candidates
- `messianic-prophecy` — phrase: "out of egypt i called my son" — realistic query phrasings: "out of egypt i called my son"; "why does matthew quote hosea 11 1"; "out of egypt prophecy". (Only admissible together with the Hos 11:1 caveat anchor above — an unanchored phrase would point the concept at a verse it cannot chip; Matt 2 is itself corpus-blocked, noted.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- ROUTED: matches backlog row 7 (`god-relents`, SKIPPED-blocked) — new evidence: "I will not execute the fierceness of my anger. I will not return to destroy Ephraim, for I am God, and not man" (11:8–9) — a relenting text beyond the row's Jer/Jonah/Joel refs, for the row's conditional-prophecy gist care. Nothing minted or extended here for it.
- `slow-to-anger` considered for 11:8–9 and declined: that pack is deliberately Exod-34:6-formula-scoped (its own header declines even the verbatim in-corpus Nah 1:3); the `mercy` candidate above carries the register honestly.
- No later-revelation display tag on 11:1 (book-doc Decisions #3 re-checked and upheld); the messianic-prophecy item in (b) is an engine anchor candidate with an attributed-citation caveat, explicitly flagged for the curator as a different kind of claim.
- No yields — 5 tags.

### (g) Ceiling flag
- subdivided in book doc (sections: 11:1–7 / 11:8–12) → per-verse refinement pass.

## Hosea 12

honest-and-empty: no new candidates; existing book-doc tags reviewed and kept (the chapter's engine anchor `wrestling-with-god` Hos 12:3-4 verified in place).

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `wrestling-with-god` | "in his manhood he contended with God. Indeed, he struggled with the angel, and prevailed; he wept, and made supplication to him." | 12:3–4 | Jacob at the chapter's center; pack already anchors 12:3-4 at 0.8 |
| keep | `repentance` | "Therefore turn to your God. Keep kindness and justice, and wait continually for your God." | 12:6 | the ancestor's story turned into a summons |
| keep | `self-deception` | "Surely I have become rich. I have found myself wealth. In all my wealth they won’t find in me any iniquity that is sin." | 12:8 | wealth mistaken for innocence |
| keep | `divine-judgment` | "will punish Jacob according to his ways; according to his deeds he will repay him" | 12:2 | the LORD's controversy, closed at 12:14 |

### (b) Anchor-extension candidates
- honest-and-empty — none.

### (c) Lexicon candidates
- honest-and-empty — none.

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- `justice-and-oppression` considered for "A merchant has dishonest scales in his hand. He loves to defraud." (12:7) and declined — one verse; the register's substantial Minor-Prophets homes are Amos and Micah, and the book doc's `honesty` decline on the same verse (Decisions #15, depicted-failure trap) is upheld.
- `trusting-in-man` considered for "They make a covenant with Assyria, and oil is carried into Egypt" (12:1) and declined — single verse; carried by ch 7's tag and the ch-5/7/10/14 anchor candidates.
- No yields — 4 tags.

### (g) Ceiling flag
- no

## Hosea 13

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `divine-judgment` | "I will meet them like a bear that is bereaved of her cubs" | 13:8 | through to Samaria's fall (13:16) |
| keep | `sin` | "The guilt of Ephraim is stored up. His sin is stored up." | 13:12 | sinning more and more (13:2) |
| keep | `salvation` | "besides me there is no savior" | 13:4 | rescue belongs to God alone, argued through 13:9–10 (book-doc Decisions #5 upheld) |
| keep | `idolatry` | "Now they sin more and more, and have made themselves molten images of their silver" | 13:2 | craftsmen's calves kissed, answered by 13:4's exclusive claim |
| add | `no-other-god` | "you shall acknowledge no god but me, and besides me there is no savior" | 13:4 | the exclusivity claim in Hosea's own words — the pack's Isa 43:11 register exactly — argued out in "Where is your king now, that he may save you…?" (13:10); both-tags with `salvation` (different registers: exclusive deity vs rescue) |

### (b) Anchor-extension candidates
- `no-other-god` — Hosea 13:4 — "Yet I am the LORD your God from the land of Egypt; and you shall acknowledge no god but me, and besides me there is no savior." — proposed weight 0.85 — exclusive-saviorhood sibling of the pack's Isa 43:11 (0.9); gives the pack a second first-person no-savior-besides-me witness.
- `resurrection-of-the-dead` — Hosea 13:14 — "I will ransom them from the power of Sheol. I will redeem them from death! Death, where are your plagues? Sheol, where is your destruction?" — proposed weight 0.40, CAVEAT anchor on the pack's Job 19:25-27 precedent (0.4, dispute noted, never load-bearing) — attributed citation: 1 Cor 15:55 takes up the death-taunt; the verse's own closing line ("Compassion will be hidden from my eyes.") keeps its context judgment, and the comment must state that tension exactly as the book doc's prose does.

### (c) Lexicon candidates
- honest-and-empty — none ("o death where is your sting" phrasings already land 1 Corinthians 15:55 lexically in the live corpus — the NO-MEASURABLE-EFFECT class; no row proposed).

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none. (The book doc's no-`resurrection`-tag call at 13:14, Decisions #4, is re-checked and upheld; the (b) caveat-anchor candidate is an engine-side citation-location offer to the curator, not a tag and not an overturn.)

### (f) Decisions record
- ROUTED: matches backlog row 23 (`redeemer`, SKIPPED-blocked) — new evidence: "I will ransom them from the power of Sheol. I will redeem them from death!" (13:14) — a redemption-from-death witness beyond the row's Job case, for the decide-alongside-kinsman-redeemer design. Recorded there AND offered as the (b) caveat anchor; the curator holds both and should land the verse in at most one design.
- ROUTED: matches backlog row 33's recorded forgetting-in-prosperity extension flag (`remembrance-and-memorials`, BORDERLINE rider) — new evidence: "they were filled, and their heart was exalted. Therefore they have forgotten me." (13:6), with "For Israel has forgotten his Maker" (8:14) — the register's two sharpest Hosea texts.
- `humble-exaltation` considered for 13:6's pride-in-prosperity and declined — plain-pride queries are the PR #41 lexicon-extension territory already recorded as covered (declines §3.1); no new gap.
- No yields — 5 tags.

### (g) Ceiling flag
- no

## Hosea 14

### (a) Applied-tag deltas
| action | concept id | WEB quote (word-for-word, in-chapter) | verse ref | justification (one line) |
|---|---|---|---|---|
| keep | `repentance` | "Israel, return to the LORD your God; for you have fallen because of your sin. Take words with you, and return to the LORD." | 14:1–2 | the book's closing summons with words supplied |
| keep | `forgiveness-of-sins` | "Forgive all our sins, and accept that which is good" | 14:2 | the prayer and its answer ("my anger is turned away from them," 14:4) |
| keep | `gods-love` | "I will love them freely" | 14:4 | free, unearned love answering the return |
| keep | `restoration` | "I will heal their waywardness" … "He will blossom like the lily" | 14:4–5 | healing and flourishing after the fall (14:7) |
| keep | `pastoral-relapse-and-restoration` | "you have fallen because of your sin" … "I will heal their waywardness" | 14:1, 14:4 | the recorded pastoral-register exception (book-doc Decisions #7, reviewer-upheld) — kept |
| keep | `idolatry` | "neither will we say any more to the work of our hands, ‘Our gods!’" | 14:3 | the supplied prayer renounces handmade gods; God retires the idols (14:8) |
| add | `backsliding` | "I will heal their waywardness. I will love them freely; for my anger is turned away from them." | 14:4 | the drift-healed answer the pack collects — its OWN header already carries Hos 14:4 as a corpus-blocked rider; distinct register from the personal relapse tag per the pack's recorded relapse-boundary note, so both stand under §11.2 |

### (b) Anchor-extension candidates
- `backsliding` — Hosea 14:4 — "I will heal their waywardness. I will love them freely; for my anger is turned away from them." — proposed weight 0.80 — formalizes the pack header's existing Hos 14:4 rider as an anchor at the re-pin; the restoration side of the drift register (its Jer 3:6-14 rider's twin).
- `repentance` — Hosea 14:1–2 — "Israel, return to the LORD your God; for you have fallen because of your sin. Take words with you, and return to the LORD." — proposed weight 0.85 — the densest OT text behind the pack's own "return to the lord" lexicon phrase; its current OT anchor is Ezek 18:30-32 alone.
- `gods-love` — Hosea 14:4 — "I will love them freely" — proposed weight 0.75 — DUAL with the backsliding candidate on the same verse, different registers (love-freely vs waywardness-healed), recorded in both directions for the curator.
- `trusting-in-man` — Hosea 14:3 — "Assyria can’t save us. We won’t ride on horses; neither will we say any more to the work of our hands, ‘Our gods!’" — proposed weight 0.70 — the renunciation form of the register (the pack's "trusting in horses and chariots" lexicon phrase, prayed away).

### (c) Lexicon candidates
- `pastoral-relapse-and-restoration` — phrase: "will god take me back" — realistic query phrasings: "will god take me back"; "can god still love me after what i did"; "coming back to god after falling away". (Words absent from any passage — concept-vocabulary value, the plan §3.3 class (i); the pack's in-corpus Micah 7:8 / 1 John 1:9 anchors serve it today, and Hosea 14 joins at the re-pin.)

### (d) New-concept candidates
- honest-and-empty — none.

### (e) Decline-overturn proposals
- honest-and-empty — none.

### (f) Decisions record
- Span discipline on 14:4, decided here: two duals proposed on one verse (`backsliding` + `gods-love`), each register named; `forgiveness-of-sins` keeps its display citation of 14:2/14:4 (display-only, no anchor proposed); curator lands at most the two duals.
- `mercy` display tag stays SKIPPED (book-doc Decisions #21 tag-apply record: "for in you the fatherless finds mercy," 14:3, is a single clause whose substance `forgiveness-of-sins` and `gods-love` carry).
- `restoration-of-israel` considered and NOT added — 14:4–8 is healing-and-flourishing, not regathering; the `restoration` display tag carries it, and the §1(e) register tension is already recorded at ch 1.
- `grace-not-earned` stays dropped (book-doc Decisions #14 re-checked: "I will love them freely" genuinely teaches unmerited favor, but the id's register is the NT saved-by-grace formulation — read-back risk stands).
- A "heal my backsliding" lexicon row was considered and NOT proposed: the WEB's own words ("I will heal their waywardness") land lexically once the corpus expands — NO-MEASURABLE-EFFECT class.
- 7 tags — above soft cap 6, below hard ceiling 8; every tag independently clears the bar (six are reviewer-upheld prior art; the add carries the pack's own rider text). No yields — no silent drops.

### (g) Ceiling flag
- subdivided in book doc (sections: 14:1–3 / 14:4–9) → per-verse refinement pass; 7 tags (above soft cap, did not hit 8).

---

## Book roll-up (Hosea)

- **Applied-tag deltas:** 7 adds (`restoration-of-israel` chs 1, 3, 11; `trusting-in-man` ch 7; `empty-worship` ch 8; `no-other-god` ch 13; `backsliding` ch 14); 61 keeps; 0 drops.
- **Anchor-extension candidates:** 28 across 11 chapters (all corpus-blocked — Hosea is expansion-only; every one rides PR-β).
- **Lexicon candidates:** 5 (`hope-in-god` "door of hope"; `sin` "sow the wind reap the whirlwind"; `revival-and-reformation` "break up your fallow ground"; `messianic-prophecy` "out of egypt i called my son"; `pastoral-relapse-and-restoration` "will god take me back") — each tied to its anchor candidate where the phrase would otherwise be unanchored.
- **New-concept candidates:** none — every genuinely-present theme has an honest home in the 239, an existing decline, or a backlog roster row; accordingly this sweep appends NO new rows to tag-gaps.md.
- **Decline-overturn proposals:** none.
- **Backlog routes (route, don't duplicate):** row 2 `spiritual-adultery` (chs 1, 2, 3, 4, 5, 9 evidence + Gomer-story query phrasings); row 7 `god-relents` (11:8–9); row 23 `redeemer` (13:14); row 33 `remembrance-and-memorials` forgetting-in-prosperity flag (13:6; 8:14); row 44 `davidic-covenant` (3:5); row 45 `exile-and-captivity` (9:3; 9:17).
- **Per-verse refinement flags:** chs 2, 11, 14 (each subdivided in the book doc; chs 2 and 14 sit at 7 tags — above soft cap, below the hard ceiling; no chapter hit 8).
- **Honest-and-empty chapters (no new candidates):** 4, 6, 12.
