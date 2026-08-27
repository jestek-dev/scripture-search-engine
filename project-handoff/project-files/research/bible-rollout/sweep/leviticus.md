# Leviticus sweep ledger — Layer-3 tag sweep (Torah thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/
- Book: Leviticus (27 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/leviticus.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/corpus-blocked-roster.md
  - WEB chapter text (verse-numbered, from the pinned-source full-Bible fixture, sourceSha256
    b6f55cc7…, commit 87fd68c): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/web-text/leviticus/<chapter>.txt
  - Worker instructions (entry format + verbatim rules): /tmp/claude-0/-home-user-scripture-search-engine/5e0bc105-62e1-5d73-9153-a9665b825316/scratchpad/sweep-worker-instructions.md
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Leviticus <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")


## Leviticus 1
Existing tags (book doc): `worship`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `worship` — the chapter is Israel's approach-to-God law: the offering brought "at the door of the Tent of Meeting, that he may be accepted before the LORD" (1:3), rising as "a pleasant aroma to the LORD" (1:9, 13, 17); book-doc Decisions #11's regulation-not-narrative ruling holds against the text.
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1): "it shall be accepted for him to make atonement for him" (1:4) is the burnt-offering law's stated purpose. Display tag only; engine-side material routes to roster row 1.
### Anchor-extension candidates
- None. (Engine-side atonement anchor material from this chapter — 1:4 — matches corpus-blocked roster row 1 `sacrifice-and-atonement`: ROUTED there; already carried by the book doc's delivered tag-gaps append.)
### Lexicon candidates
- None.
### New-concept candidates
- None. (The "burnt offering meaning" / "pleasant aroma to the Lord" query families are offering-system material matching corpus-blocked roster row 1 — ROUTED, not minted.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 2
Existing tags (book doc): `tithing`
### Applied-tag deltas
- KEEP `tithing` — the concept's firstfruits side ("firstfruits" is in the pack lexicon): "As an offering of first fruits you shall offer them to the LORD" (2:12), with the first-fruits rite of 2:14–16; book-doc Decisions #12 stands. No other concept's teaching substance is genuinely present — the chapter stays single-tag.
### Anchor-extension candidates
- `tithing` | Leviticus 2:12–16 | "If you offer a meal offering of first fruits to the LORD" (2:14) | low
### Lexicon candidates
- `covenant` | salt of the covenant | realistic query phrasings: "salt of the covenant meaning", "why salt in offerings", "salt in the bible meaning"
### New-concept candidates
- None. (2:13's "the salt of the covenant of your God" is a single-verse motif — logged above as a `covenant` lexicon candidate, not a concept gap.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 3
Existing tags (book doc): none
### Applied-tag deltas
No changes — honest-and-empty stands: the peace-offering procedure engages no concept's teaching substance, and book-doc Decisions #13's `peace-of-god` withholding (word-match without substance) is confirmed against the chapter text.
### Anchor-extension candidates
- None.
### Lexicon candidates
- None.
### New-concept candidates
- None. (The peace-offering / "fellowship offering" query family — "peace offering meaning" — is offering-system material matching corpus-blocked roster row 1 `sacrifice-and-atonement`: ROUTED, not minted. 3:17's "you shall eat neither fat nor blood" is a motif, not a searchable concept gap.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 4
Existing tags (book doc): `sin`, `forgiveness-of-sins`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `sin` — unwitting sin counted as real guilt: "If anyone sins unintentionally, in any of the things which the LORD has commanded not to be done" (4:2), graded through priest, congregation, ruler, and commoner (4:3, 13, 22, 27).
- KEEP `forgiveness-of-sins` — the chapter's own refrain: "the priest shall make atonement for them, and they shall be forgiven" (4:20; also 4:26, 31, 35).
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1): the sin offering itself — hand on the head, blood applied, fat burned (4:4–35). Engine-side material routes to roster row 1.
### Anchor-extension candidates
- `forgiveness-of-sins` | Leviticus 4:27–31 | "the priest shall make atonement for him, and he will be forgiven" (4:31) | moderate — an OT mediated-forgiveness anchor for a pack whose anchors are all Psalms/prophets/NT.
### Lexicon candidates
- `sin` | unintentional sin | realistic query phrasings: "unintentional sin in the bible", "sinning without knowing it", "accidental sin"
### New-concept candidates
- None. (The leaders-held-to-account motif — "When a ruler sins," 4:22 — was considered for `leadership` and judged below the presence bar: the chapter grades offerings, it does not teach leadership.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 5 (subdivided: 5:1–13, 5:14–19)
Existing tags (book doc): `sin`, `forgiveness-of-sins`, `confession-of-sin`, `oaths-and-vows`, `restitution`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `sin` — guilt counted where it would be excused: "he is still guilty, and shall bear his iniquity" (5:17; cases at 5:1–4).
- KEEP `forgiveness-of-sins` — "and he shall be forgiven" through every grade of offering (5:10; also 5:13, 16, 18), with confession as the remedy's first step ("he shall confess that in which he has sinned," 5:5).
- DROP `confession-of-sin` — the id exists in neither the engine vocabulary (concept-index.md @ e762d1c) nor the 50-row corpus-blocked roster, so it is outside the sweep's legal exact-id universe; the substance is not a vocabulary gap — `forgiveness-of-sins` carries "confess your sins" and "confession of sin" in its lexicon and stays KEPT on this chapter with 5:5 in its justification.
- KEEP `oaths-and-vows` — the rash oath counted as sin: one who "swears rashly with his lips to do evil or to do good" (5:4).
- KEEP `restitution` — adopted display id (corpus-blocked roster row 28): "He shall make restitution for that which he has done wrong regarding the holy thing, and shall add a fifth part to it" (5:16). Engine-side material routes to roster row 28.
- KEEP `sacrifice-and-atonement` — adopted display id (roster row 1): the offering scaled to the offerer's means — lamb, birds, or flour (5:6–13).
### Anchor-extension candidates
- `clean-and-unclean` | Leviticus 5:2–3 | "if anyone touches any unclean thing, whether it is the carcass of an unclean animal" (5:2) | low
### Lexicon candidates
- `oaths-and-vows` | rash vow | realistic query phrasings: "making a rash vow", "rash promises in the bible", "swore an oath without thinking"
### New-concept candidates
- None. (Confession of sin is covered — see the DROP above. The poverty-scaled offering — "If he can’t afford a lamb," 5:7 — is offering-system material, ROUTED to roster row 1.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- DROP of `confession-of-sin` recorded (no silent drops): the id is outside both legal id lists (engine vocabulary and corpus-blocked roster); its substance rides the kept `forgiveness-of-sins` tag, whose lexicon carries the confession phrasings. NOTE for the chapters 10–27 workers: the book doc also carries `confession-of-sin` on Leviticus 16 and 26 — same disposition applies there; outside this worker's range.

## Leviticus 6 (subdivided: 6:1–7, 6:8–30)
Existing tags (book doc): `honesty`, `forgiveness-of-sins`, `restitution`, `priesthood`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `honesty` — wrong gain named and undone: one who "deals falsely with his neighbor in a matter of deposit, or of bargain, or of robbery" (6:2), "swearing to a lie" (6:3), must "restore it in full" (6:5).
- KEEP `forgiveness-of-sins` — "and he will be forgiven concerning whatever he does to become guilty" (6:7).
- KEEP `restitution` — adopted display id (corpus-blocked roster row 28): "he shall restore it in full, and shall add a fifth part more to it" (6:5), the neighbor repaid before the ram is offered. Engine-side material routes to roster row 28.
- KEEP `priesthood` — the priests' working law from 6:8: the perpetual altar fire ("Fire shall be kept burning on the altar continually; it shall not go out," 6:13), their portions, and the most-holy handling rules (6:14–30).
- KEEP `sacrifice-and-atonement` — adopted display id (roster row 1): restitution first, then the ram of the trespass offering and atonement (6:6–7).
### Anchor-extension candidates
- `honesty` | Leviticus 6:2–5 | "deals falsely with his neighbor in a matter of deposit, or of bargain, or of robbery" (6:2) | moderate — the pack's anchors are all NT; this is the OT lying-and-repair statute.
### Lexicon candidates
- None. ("The fire shall never go out" queries have no honest concept home; left as the book doc's motif.)
### New-concept candidates
- None. (6:2's "or has oppressed his neighbor" was considered for `justice-and-oppression` and judged below the presence bar: one clause inside the fraud statute, its substance carried by `honesty`/`restitution`.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- None.

## Leviticus 7
Existing tags (book doc): `thanksgiving`, `priesthood`
### Applied-tag deltas
- KEEP `thanksgiving` — the thank offering's own law: "If he offers it for a thanksgiving, then he shall offer with the sacrifice of thanksgiving unleavened cakes mixed with oil" (7:12), with its same-day feast (7:15); book-doc Decisions #14's borderline call is confirmed honest against the text.
- KEEP `priesthood` — the priests' portions fixed: the waved breast and heaved thigh "given them to Aaron the priest and to his sons as their portion forever" (7:34; also 7:6–10, 35–36).
### Anchor-extension candidates
- `thanksgiving` | Leviticus 7:12–15 | "the sacrifice of his peace offerings for thanksgiving shall be eaten on the day of his offering" (7:15) | moderate — Scripture's thank-offering law; the pack has no OT-rite anchor.
- `clean-and-unclean` | Leviticus 7:19–21 | "The meat that touches any unclean thing shall not be eaten" (7:19) | low — considered as a chapter tag and judged below the substantial-presence bar (the clean/unclean rules sit inside the peace-offering meal law); honest as an anchor.
### Lexicon candidates
- `thanksgiving` | thank offering | realistic query phrasings: "thank offering in the bible", "sacrifice of thanksgiving", "thanksgiving offering"
### New-concept candidates
- None. ("Cut off from his people" (7:20–21, 25, 27) is a real query family — "cut off from his people meaning" — but a penalty formula spanning many statutes, not a teaching concept; left as the book doc's motif.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 8
Existing tags (book doc): `holiness`, `obedience-to-the-word`, `priesthood`
### Applied-tag deltas
- KEEP `holiness` — persons set apart to God: "He poured some of the anointing oil on Aaron’s head, and anointed him, to sanctify him" (8:12); "sanctified Aaron, his garments, and his sons, and his sons’ garments with him" (8:30); seven days of consecration (8:33).
- KEEP `obedience-to-the-word` — the refrain "as the LORD commanded Moses" (8:9, 13, 17, 21, 29) closing with "Aaron and his sons did all the things which the LORD commanded by Moses" (8:36).
- KEEP `priesthood` — the ordination itself: washing, vestments, anointing, the three ordination offerings with blood on ear, thumb, and toe (8:6–30), and seven days kept at the Tent door (8:33–35).
### Anchor-extension candidates
- `priesthood` | Leviticus 8:1–36 | "He poured some of the anointing oil on Aaron’s head, and anointed him, to sanctify him" (8:12) | moderate — the OT priesthood's institution narrative; the pack's only OT anchors are Exodus 28:1 and Deuteronomy 33:8–11.
### Lexicon candidates
- `priesthood` | consecration | realistic query phrasings: "consecration in the bible", "how were priests ordained", "ordination in the bible"
### New-concept candidates
- None. (The Urim and Thummim (8:8) is a single-verse curiosity mention, not a search-scale concept; blood on the ear, thumb, and toe stays the book doc's motif.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 9
Existing tags (book doc): `presence-of-god`, `worship`, `benediction`, `priesthood`, `sacrifice-and-atonement`
### Applied-tag deltas
- ADD `glory-of-god` — WEB quote: "the LORD’s glory appeared to all the people" (9:23; announced at 9:6, "the LORD’s glory shall appear to you"; "Fire came out from before the LORD," 9:24) — the chapter's climax is the manifest glory of the LORD, the pack's own register (its lexicon carries "the glory of the lord"; its anchors are Exodus 33 / Ezekiel 43-type appearing-glory texts). Applied beside `presence-of-god` under the §11.2 both-tags ruling: appearing glory and God-with-his-people are distinct registers, each independently clearing the presence bar.
- KEEP `presence-of-god` — "today the LORD appears to you" (9:4), fulfilled before the whole camp (9:23–24).
- KEEP `worship` — the first full altar service ends with the people who "shouted, and fell on their faces" (9:24).
- KEEP `benediction` — "Aaron lifted up his hands toward the people, and blessed them" (9:22), then Moses and Aaron bless the people again (9:23); PR #43 id, ratified 2026-08-25.
- KEEP `priesthood` — the consecrated priesthood's first ministry: "Draw near to the altar, and offer your sin offering, and your burnt offering" (9:7), carried out at 9:8–22.
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1): "make atonement for yourself, and for the people" (9:7). Engine-side material routes to roster row 1.
### Anchor-extension candidates
- `glory-of-god` | Leviticus 9:23–24 | "the LORD’s glory appeared to all the people" (9:23) | moderate — a narrative appearing-glory anchor alongside the pack's Exodus 33:18–23 and Ezekiel 43:1–5.
- `benediction` | Leviticus 9:22 | "Aaron lifted up his hands toward the people, and blessed them" (9:22) | low — the priestly blessing's first enactment beside the pack's Numbers 6:24–26 source text.
### Lexicon candidates
- None. ("Fire from heaven on the altar" phrasings have no honest concept home; left as the book doc's motif.)
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit soft cap 6 (after the `glory-of-god` ADD; every tag independently clears the bar, main themes first — no yield required below the hard ceiling)
### Decisions record
- None.

## Leviticus 10
Existing tags (book doc): `holiness`, `divine-judgment`, `pastoral-grief-and-loss`, `clean-and-unclean`, `priesthood`
### Applied-tag deltas
- KEEP `holiness` — the event's own interpretation: "I will show myself holy to those who come near me, and before all the people I will be glorified" (10:3), and the standing charge to "make a distinction between the holy and the common" (10:10).
- KEEP `divine-judgment` — "Fire came out from before the LORD, and devoured them, and they died before the LORD" (10:2), the burning "which the LORD has kindled" (10:6).
- KEEP `pastoral-grief-and-loss` — genuinely individual register per the group-wide pastoral ruling (Lev 10 named): "Aaron held his peace" (10:3); mourning forbidden to the anointed (10:6–7); his grief-grounded answer "such things as these have happened to me" accepted by Moses (10:19–20).
- KEEP `clean-and-unclean` — the system's charter verse, which the pack itself anchors (Leviticus 10:10 is in its anchor list): "You are to make a distinction between the holy and the common, and between the unclean and the clean" (10:10).
- KEEP `priesthood` — the LORD's direct charge to Aaron's house: "You and your sons are not to drink wine or strong drink whenever you go into the Tent of Meeting" (10:9), distinguishing holy from common and teaching "all the statutes" (10:10–11), plus the priests' portions (10:12–15).
### Anchor-extension candidates
- `drunkenness` | Leviticus 10:8–11 | "You and your sons are not to drink wine or strong drink whenever you go into the Tent of Meeting, or you will die" (10:9) | low — a ministry-sobriety statute, adjacent to but not identical with the pack's getting-drunk register; caveat carried with the candidate.
### Lexicon candidates
- None.
### New-concept candidates
- `unauthorized-worship` | the strange-fire register — approaching God on self-chosen terms — is a real query family ("strange fire in the bible meaning", "why did God kill Nadab and Abihu") with no honest home in the current universe: `worship` covers right worship broadly, `divine-judgment` the judgment but not the offense's nature, `empty-worship` is the hypocrisy register. Not declined, not on the corpus-blocked roster. Check-first note: a lexicon extension of `divine-judgment` or `worship` should be measured before any mint. | Anchor: "offered strange fire before the LORD, which he had not commanded them. Fire came out from before the LORD, and devoured them" (10:1–2)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 11
Existing tags (book doc): `holiness`, `clean-and-unclean`
### Applied-tag deltas
- KEEP `holiness` — the food laws' stated purpose: "Sanctify yourselves therefore, and be holy; for I am holy" (11:44), grounded in "I am the LORD who brought you up out of the land of Egypt, to be your God" (11:45).
- KEEP `clean-and-unclean` — the pack's own core anchor chapter (Leviticus 11:1–47 is in its anchor list): the food laws in full, closing "to make a distinction between the unclean and the clean, and between the living thing that may be eaten and the living thing that may not be eaten" (11:47).
### Anchor-extension candidates
- None. (The chapter is already the `clean-and-unclean` pack's principal anchor, 11:1–47.)
### Lexicon candidates
- `clean-and-unclean` | eating pork | realistic query phrasings: "why couldn't Israelites eat pork", "is eating pork a sin in the bible", "pig unclean in the bible"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 12
Existing tags (book doc): `clean-and-unclean`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `clean-and-unclean` — the childbirth register of the system: "If a woman conceives, and bears a male child, then she shall be unclean seven days" (12:2), "the blood of purification" seasons kept from sanctuary and holy things (12:4–5).
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1): the season closed by offering — "He shall offer it before the LORD, and make atonement for her; then she shall be cleansed from the fountain of her blood" (12:7), scaled for the poor mother (12:8). Engine-side material routes to roster row 1.
### Anchor-extension candidates
- `clean-and-unclean` | Leviticus 12:1–8 | "If a woman conceives, and bears a male child, then she shall be unclean seven days" (12:2) | low — the childbirth register is absent from the pack's anchors.
### Lexicon candidates
- `clean-and-unclean` | purification after childbirth | realistic query phrasings: "purification after childbirth in the bible", "why was a woman unclean after giving birth", "leviticus 12 meaning"
### New-concept candidates
- None. (The poor mother's two-turtledoves offering — "If she cannot afford a lamb," 12:8 — is offering-system material, ROUTED to roster row 1. The eighth-day circumcision, 12:3, is a single-verse mention here; its teaching home is the Genesis 17 covenant material, not a Leviticus gap.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 13 (subdivided: 13:1–46, 13:47–59)
Existing tags (book doc): `clean-and-unclean`
### Applied-tag deltas
- KEEP `clean-and-unclean` — the diagnostic heart of the system: the priest examines, isolates, and re-examines "to pronounce it clean, or to pronounce it unclean" (13:59), and the confirmed leper "shall dwell alone. His dwelling shall be outside of the camp" (13:46). (Only one honest tag from the current vocabulary.)
### Anchor-extension candidates
- `clean-and-unclean` | Leviticus 13:45–46 | "He shall cover his upper lip, and shall cry, 'Unclean! Unclean!' ... He shall dwell alone. His dwelling shall be outside of the camp." (13:45–46) | medium — the leper-exclusion texts are a heavy query family (Gospel leper-cleansing background) and the pack carries no Leviticus 13 anchor.
### Lexicon candidates
- `clean-and-unclean` | leprosy | realistic query phrasings: "leprosy in the bible", "why were lepers unclean", "unclean unclean meaning"
### New-concept candidates
- None. (The examine-before-you-judge motif — "The priest shall examine him" through seven-day isolations, 13:4–8 — is procedure, not a searched teaching register; left as the book doc's motif.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- None.

## Leviticus 14 (subdivided: 14:1–32, 14:33–57)
Existing tags (book doc): `clean-and-unclean`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `clean-and-unclean` — the system's homecoming law: "This shall be the law of the leper in the day of his cleansing" (14:2), the two-bird rite and washing (14:4–9), the mildewed house pronounced clean or broken down (14:33–53), closing "to teach when it is unclean, and when it is clean" (14:57).
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1): cleansing completed by the eighth-day offerings, blood and oil on ear, thumb, and toe — "The priest shall make atonement for him, and he shall be clean" (14:20; also 14:18–19, 31, 53). Engine-side material routes to roster row 1.
### Anchor-extension candidates
- `clean-and-unclean` | Leviticus 14:1–9 | "This shall be the law of the leper in the day of his cleansing" (14:2) | low — the restoration/readmission side of the leprosy laws, absent from the pack's anchors.
### Lexicon candidates
- `clean-and-unclean` | cleansing of the leper | realistic query phrasings: "how were lepers cleansed in the bible", "leper cleansing ritual", "two birds ritual meaning"
- `clean-and-unclean` | mildew in a house | realistic query phrasings: "mold in the bible", "house with mold in leviticus"
### New-concept candidates
- None. (The poor man's scaled offering — "such as he is able to afford," 14:22 — is offering-system material, ROUTED to roster row 1.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- None.

## Leviticus 15
Existing tags (book doc): `clean-and-unclean`
### Applied-tag deltas
- KEEP `clean-and-unclean` — the bodily-discharge register: uncleanness spread by contact and answered by washing and evening (15:4–11, 19–27), with the system's stated purpose: "Thus you shall separate the children of Israel from their uncleanness, so they will not die in their uncleanness when they defile my tabernacle that is among them" (15:31). (Only one honest tag from the current vocabulary.)
### Anchor-extension candidates
- `clean-and-unclean` | Leviticus 15:31 | "Thus you shall separate the children of Israel from their uncleanness, so they will not die in their uncleanness when they defile my tabernacle that is among them" (15:31) | low — the purity system's own rationale verse, a strong answer text for "why all the purity laws" queries.
### Lexicon candidates
- `clean-and-unclean` | bodily discharges | realistic query phrasings: "why was a woman unclean during her period", "bodily discharge laws in the bible", "leviticus 15 meaning"
### New-concept candidates
- None. (The chapter treats none of it as moral fault; there is no distinct teaching register beyond the clean/unclean system already tagged.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 16
Existing tags (book doc): `forgiveness-of-sins`, `presence-of-god`, `repentance`, `confession-of-sin`, `fasting`, `priesthood`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `forgiveness-of-sins` — the day's own promise: "for on this day shall atonement be made for you, to cleanse you. You shall be clean from all your sins before the LORD" (16:30), the goat carrying "all their iniquities on himself to a solitary land" (16:22).
- KEEP `presence-of-god` — the whole rite governed by God's presence over the mercy seat: "for I will appear in the cloud on the mercy seat" (16:2), the incense cloud covering it "so that he will not die" (16:13).
- KEEP `repentance` — the people's commanded posture on the day: "you shall afflict your souls, and shall do no kind of work" (16:29), sins named and confessed rather than ignored (16:21, 31).
- KEEP `confession-of-sin` — LEGAL: exact id on the CONVENTIONS §11.1 adopted list (`tag-apply/adopted-concepts.md`, engine-built: no). Confession enacted nationally: "Aaron shall lay both his hands on the head of the live goat, and confess over him all the iniquities of the children of Israel" (16:21). Display tag only; see Decisions record for the engine-side routing note and the chapter-5 revisit flag.
- KEEP `fasting` — theme-witness-with-caveat, honestly cleared: the commanded self-denial "you shall afflict your souls" (16:29, 31) is the day's observance traditionally kept as fasting; the caveat (the WEB text says "afflict your souls," not "fast") stays attached to the tag's justification.
- KEEP `priesthood` — approach on God's terms only: "not to come at just any time into the Most Holy Place within the veil" (16:2), the anointed priest alone, bathed and in linen (16:3–4), "The priest, who is anointed and who is consecrated to be priest in his father's place, shall make the atonement" (16:32–33).
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1, which names Lev 16 as a distinctive anchor): the bull, the slain goat's blood on the mercy seat, the sent-away goat — "an everlasting statute for you, to make atonement for the children of Israel once in the year because of all their sins" (16:34). Engine-side material routes to roster row 1.
### Anchor-extension candidates
- `forgiveness-of-sins` | Leviticus 16:29–34 | "for on this day shall atonement be made for you, to cleanse you. You shall be clean from all your sins before the LORD" (16:30) | medium — the OT's yearly cleansing-from-all-sins promise; the pack's anchors are Psalms/prophets/NT.
- `presence-of-god` | Leviticus 16:2 | "for I will appear in the cloud on the mercy seat" (16:2) | low — a presence-on-God's-terms anchor; the pack has no Torah anchor.
(Engine-side scapegoat/Day-of-Atonement anchor material — 16:8–10, 20–22, 30, 34 — matches corpus-blocked roster row 1 `sacrifice-and-atonement`, which names Lev 16: ROUTED there, not proposed fresh.)
### Lexicon candidates
- `fasting` | afflict your souls | realistic query phrasings: "afflict your souls meaning", "day of atonement fasting", "is fasting commanded in the old testament"
("scapegoat in the bible" / "yom kippur in the old testament" / "day of atonement meaning" query families are the offering-system register matching roster row 1: ROUTED, not logged as lexicon rows here.)
### New-concept candidates
- None. (Every candidate register in this chapter either has a live home tagged above or matches corpus-blocked roster row 1.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- exceeds soft cap 6 (7 tags); under hard ceiling 8 — every tag independently clears the presence bar, main themes first; no yield required
### Decisions record
- `confession-of-sin` KEPT, not dropped (carried flag from the chapters 1–9 worker resolved): the id IS on the canonical §11.1 adopted list (`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`, reconstructed 2026-08-26 — a file the sweep-worker instructions predate and record as missing), marked engine-built: no. It is therefore inside the legal display-tag universe. Engine-side routing note: the id has NO corpus-blocked roster row, so its engine work has no roster home to route to — it remains an adopted vocabulary-addition candidate for the fixtures-first flow; nothing here creates a pack. FLAG for the orchestrator: the chapter-5 DROP of `confession-of-sin` (recorded in this ledger's Leviticus 5 entry on the ground that the id was outside both legal lists) was decided against the pre-reconstruction universe and should be revisited — the same reasoning would now KEEP it on Lev 5:5 ("he shall confess that in which he has sinned"). Same applies prospectively to the book doc's `confession-of-sin` on Leviticus 26 (the 19–27 worker's range).
- No tag yielded: 7 tags exceed the soft cap but sit under the hard ceiling with each independently clearing the bar; recorded here so the over-soft-cap state is not a silent call. The nearest-to-yield tag if refinement ever forces one is `fasting` (theme-witness-with-caveat class in the §11.6 yield order).

## Leviticus 17
Existing tags (book doc): `worship`, `sacrifice-and-atonement`
### Applied-tag deltas
- KEEP `worship` — sacrifice redirected to the one appointed place and away from rival objects: "that they may bring them to the LORD, to the door of the Tent of Meeting" (17:5), "They shall no more sacrifice their sacrifices to the goat idols, after which they play the prostitute" (17:7).
- KEEP `sacrifice-and-atonement` — adopted display id (corpus-blocked roster row 1, which names Lev 17:11 as a distinctive anchor): the system's own rationale verse — "For the life of the flesh is in the blood. I have given it to you on the altar to make atonement for your souls; for it is the blood that makes atonement by reason of the life" (17:11). Engine-side material routes to roster row 1.
- (`idolatry` considered for 17:7's goat idols and judged below the substantial-presence bar: a single motive clause inside the central-altar statute, not idolatry teaching; its substance is carried in the kept `worship` justification.)
### Anchor-extension candidates
- None. (17:11 — the "life is in the blood" anchor — is roster row 1's own named territory: ROUTED, not proposed fresh.)
### Lexicon candidates
- None. (The "why is the life in the blood" / "why couldn't Israel eat blood" query family is the atonement-system register matching roster row 1: ROUTED. No live pack honestly owns it — `the-cross` would be a later-revelation read-back on this chapter.)
### New-concept candidates
- None. (The "cut off from his people" penalty formula, 17:4, 9–10, 14, was already dispositioned at this ledger's Leviticus 7 entry as a motif, not a concept.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 18
Existing tags (book doc): `pastoral-sexual-purity`, `obedience-to-the-word`
### Applied-tag deltas
- KEEP `pastoral-sexual-purity` — genuinely individual-conduct register per the group-wide pastoral ruling (Lev 18 named): Scripture's foundational catalogue of sexual boundaries as covenant statute — the forbidden unions of 18:6–18, "You shall not lie carnally with your neighbor's wife, and defile yourself with her" (18:20), and the further prohibitions of 18:19–23.
- KEEP `obedience-to-the-word` — the chapter's frame on both ends: "You shall do my ordinances. You shall keep my statutes and walk in them" (18:4), statutes "which if a man does, he shall live in them" (18:5), closed by "Therefore you shall keep my requirements" (18:30).
### Anchor-extension candidates
- `sexual-purity` (display id in book docs: `pastoral-sexual-purity`) | Leviticus 18:6–23 | "You shall not lie carnally with your neighbor's wife, and defile yourself with her" (18:20) | medium — the pack's anchors are all NT/Job/Psalms; this is the OT statute catalogue the NT texts presuppose.
### Lexicon candidates
- `sexual-purity` (display id: `pastoral-sexual-purity`) | forbidden relationships | realistic query phrasings: "forbidden marriages in the bible", "incest in the bible", "leviticus 18 meaning"
- `divine-judgment` | the land vomited out | realistic query phrasings: "why did God drive out the Canaanites", "the land vomited out its inhabitants meaning" — grounded in "Therefore I punished its iniquity, and the land vomited out her inhabitants" (18:25); a lexicon lead only, `divine-judgment` is not tagged on this chapter.
### New-concept candidates
- `child-sacrifice-and-molech` | "who was Molech" / "child sacrifice in the bible" is a realistic query family with no honest home: `idolatry` and `occult-and-divination` are adjacent (the latter's Deut 18:9–14 anchor includes the pass-through-fire text) but neither lexicon serves Molech queries; not declined, not on the corpus-blocked roster. Single verse in this chapter but a recurring statute register (Lev 20 continues it — that worker's range). Check-first note: measure a lexicon extension of `idolatry` or `occult-and-divination` before any mint. | Anchor: "You shall not give any of your children as a sacrifice to Molech. You shall not profane the name of your God." (18:21)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 19
Existing tags (book doc): `holiness`, `loving-others`, `generosity`, `honesty`, `caring-for-aging-parents`, `justice-and-oppression`, `occult-and-divination`, `vengeance`
### Applied-tag deltas
- KEEP `holiness` — the Holiness Code's headline charge to the whole congregation: "You shall be holy; for I, the LORD your God, am holy" (19:2), worked out through the chapter's every cluster.
- KEEP `loving-others` — the second-greatest command's source text: "you shall love your neighbor as yourself" (19:18), extended to the foreigner: "you shall love him as yourself; for you lived as foreigners in the land of Egypt" (19:34).
- KEEP `generosity` — provision built into the harvest: corners, gleanings, and fallen grapes left behind — "You shall leave them for the poor and for the foreigner" (19:9–10).
- KEEP `honesty` — "You shall not steal" ... "You shall not lie" ... "You shall not deceive one another" (19:11), no false swearing (19:12), and "just balances, just weights, a just ephah, and a just hin" (19:35–36).
- KEEP `caring-for-aging-parents` — "Each one of you shall respect his mother and his father" (19:3) and "You shall rise up before the gray head and honor the face of the elderly" (19:32); PR #43 id, ratified 2026-08-25.
- KEEP `justice-and-oppression` — the statute layer of everyday justice: "You shall not oppress your neighbor, nor rob him" (19:13), wages not held overnight (19:13), "You shall do no injustice in judgment" (19:15), and no wronging the foreigner (19:33).
- KEEP `occult-and-divination` — the pack's own anchor verses (Leviticus 19:26 and 19:31 are in its anchor list): "You shall not use enchantments, nor practice sorcery" (19:26); "Don't turn to those who are mediums, nor to the wizards" (19:31).
- KEEP `vengeance` — the pack's own anchor verse (Leviticus 19:18 is in its anchor list): "You shall not take vengeance, nor bear any grudge against the children of your people" (19:18).
(All quotes verified against the fixture-witnessed chapter 19 text.)
### Anchor-extension candidates
- `loving-others` | Leviticus 19:18, 33–34 | "you shall love your neighbor as yourself" (19:18) | high — the command's own source text; the pack's anchors are all NT (Matthew 22:39 quotes this verse).
- `justice-and-oppression` | Leviticus 19:13–15 | "You shall not oppress your neighbor, nor rob him" (19:13) | medium — the civic-statute base beneath the pack's prophetic anchors.
- `generosity` | Leviticus 19:9–10 | "You shall leave them for the poor and for the foreigner" (19:10) | medium — the gleaning law, a heavy query family with no anchor in the pack.
- `slander-and-false-accusation` | Leviticus 19:16 | "You shall not go around as a slanderer among your people" (19:16) | low
- `fear-of-the-lord` | Leviticus 19:14, 32 | "but you shall fear your God" (19:14) | low — the fear of God as motive for unseen ethics; caveat: motive clauses, not fear-of-the-LORD teaching.
(`favoritism` (19:15), `hospitality` (19:33–34), `sabbath-rest` (19:3), `idolatry` (19:4), and `the-name-of-god` (19:12) already carry these verses in their anchor lists — no extensions needed.)
### Lexicon candidates
- `generosity` | gleaning | realistic query phrasings: "gleaning in the bible", "leaving the corners of the field", "what does the bible say about helping the poor"
### New-concept candidates
- `tattoos-and-cuttings` | "tattoos in the bible" / "is it a sin to get a tattoo" is a genuinely heavy lay query family with no home in any legal list (nothing adjacent carries body-marking vocabulary); not declined, not on the corpus-blocked roster. Caution carried: single statute verse — the 1 Timothy 5:23 "curiosity verse, not a search-scale theme" precedent weighs against a mint, but this family's search volume is of a different order; curator's call. | Anchor: "You shall not make any cuttings in your flesh for the dead, nor tattoo any marks on you" (19:28)
(19:19's mixed kinds — "Don't wear a garment made of two kinds of material" — was considered and not promoted: a smaller curiosity family, left as a motif.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hit hard ceiling 8 — marked for per-verse refinement
### Decisions record
- Book-doc Decisions #52's four ch-19 yields re-verified against the text and confirmed standing (no re-adds at the ceiling): `idolatry` (19:4, thin single-verse), `oaths-and-vows` (19:12, thin single-verse, substance carried by `honesty`), `the-name-of-god` (19:12, same verse), `sojourners-and-strangers` (19:33–34, its command quoted inside the kept `loving-others` justification).
- New sweep candidates yielding at the hard ceiling per the §11.6 order (each genuinely present, none addable at 8): `favoritism` (19:15 — the pack's own anchor verse; thin single-verse), `hospitality` (19:33–34 — pack anchor; broad-duplicating-specific beside `loving-others` and `justice-and-oppression`, which both carry 33–34), `sabbath-rest` (19:3, 30 — bare commands, not rest teaching; also the book doc's #28 ground), `fear-of-the-lord` (19:14, 32 — motive clauses; thin), `slander-and-false-accusation` (19:16 — thin single-verse), `pastoral-sexual-purity` (19:20–22, 29 — real but far thinner than the ch 18/20 catalogues). No existing tag dropped.

## Leviticus 20
Existing tags (book doc): `holiness`, `divine-judgment`, `pastoral-sexual-purity`, `occult-and-divination`
### Applied-tag deltas
- KEEP `holiness` — the chapter's center and close: "Sanctify yourselves therefore, and be holy; for I am the LORD your God" (20:7), "I am the LORD who sanctifies you" (20:8), and "You shall be holy to me, for I, the LORD, am holy, and have set you apart from the peoples, that you should be mine" (20:26).
- KEEP `divine-judgment` — God's own sentence beyond the courts: "I also will set my face against that person, and will cut him off from among his people" (20:3), repeated where the people hide their eyes (20:4–5) and against occult resort (20:6), with the abhorrence that expelled the nations (20:23).
- KEEP `pastoral-sexual-purity` — genuinely individual-conduct register per the group-wide pastoral ruling (Lev 20 named): chapter 18's boundaries restated case by case with their penalties — "The man who commits adultery with another man's wife, even he who commits adultery with his neighbor's wife, the adulterer and the adulteress shall surely be put to death" (20:10), through the cases of 20:11–21.
- KEEP `occult-and-divination` — the practice itself sentenced: "The person that turns to those who are mediums and wizards, to play the prostitute after them, I will even set my face against that person" (20:6), and "A man or a woman that is a medium or is a wizard shall surely be put to death" (20:27).
- (`obedience-to-the-word` considered for the frame clauses "You shall keep my statutes, and do them" (20:8, 22) and judged below the substantial-presence bar — framing inside a penalty code, thinner than ch 18's double frame. `clean-and-unclean` considered for 20:25 and judged below the bar: a single-verse restatement of the ch 11 system inside the set-apart peroration; logged as an anchor candidate instead.)
### Anchor-extension candidates
- `occult-and-divination` | Leviticus 20:6, 27 | "A man or a woman that is a medium or is a wizard shall surely be put to death" (20:27) | medium — the penalty side; the pack anchors ch 19's commands but not ch 20.
- `holiness` | Leviticus 20:26 | "You shall be holy to me, for I, the LORD, am holy, and have set you apart from the peoples, that you should be mine" (20:26) | medium — the set-apart-to-belong text; the pack has no Torah anchor.
- `clean-and-unclean` | Leviticus 20:25 | "You shall therefore make a distinction between the clean animal and the unclean" (20:25) | low
### Lexicon candidates
- `divine-judgment` | set my face against | realistic query phrasings: "I will set my face against meaning", "what does it mean when God sets his face against someone"
### New-concept candidates
- `child-sacrifice-and-molech` | continuation of this ledger's Leviticus 18 candidate (same id, one candidate — do not double-mint): here the register is sustained, 20:1–5, with the court penalty, God's own sentence, and the community's complicity addressed. Check-first note carried from ch 18: measure a lexicon extension of `idolatry` or `occult-and-divination` before any mint. | Anchor: "who gives any of his offspring to Molech shall surely be put to death" (20:2); "If the people of the land all hide their eyes from that person" (20:4)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 21
Existing tags (book doc): `holiness`, `priesthood`
### Applied-tag deltas
- KEEP `holiness` — the priestly form of the book's call: "They shall be holy to their God, and not profane the name of their God" (21:6), "He shall be holy to you, for I the LORD, who sanctify you, am holy" (21:8).
- KEEP `priesthood` — the priests' own holiness code: mourning and marriage bounded (21:1–9), the high priest held closer still "for the crown of the anointing oil of his God is upon him" (21:12), and the defect-barred descendant kept at the priestly table — "He shall eat the bread of his God, both of the most holy, and of the holy" (21:22).
- (`leadership` considered for the higher-standard motif and judged below the substantial-presence bar: the chapter is cultic office regulation, not leadership teaching — the pack's qualifications register is congregational eldership, a different institution.)
### Anchor-extension candidates
- `priesthood` | Leviticus 21:1–23 | "They shall be holy to their God, and not profane the name of their God, for they offer the offerings of the LORD made by fire" (21:6) | low — the priests' conduct code; the pack's OT anchors are institution texts only.
### Lexicon candidates
- `priesthood` | rules for priests | realistic query phrasings: "rules for priests in the old testament", "why couldn't priests touch dead bodies", "who could the high priest marry"
### New-concept candidates
- `disability` | "what does the bible say about disability" / "disability in the bible" is a genuine query family with no home in any legal list (`image-of-god` carries "human dignity" but no disability vocabulary); not declined, not on the corpus-blocked roster. Caution carried: any gist must hold the text's own balance — barred from altar service yet expressly kept at the priestly table — without adjudicating (covenant #6), and the concept's fuller anchors live elsewhere (e.g. 2 Samuel 9; John 9 — those books' threads to confirm); single-chapter witness here. | Anchor: "He shall eat the bread of his God, both of the most holy, and of the holy" (21:22), beside "who has a defect may approach to offer the bread of his God" (21:17)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 22
Existing tags (book doc): `holiness`, `worship`, `priesthood`, `the-name-of-god`
### Applied-tag deltas
- KEEP `holiness` — the refrain that carries the chapter: "I am the LORD who sanctifies them" (22:9, 16), closing in "You shall not profane my holy name, but I will be made holy among the children of Israel. I am the LORD who makes you holy" (22:32).
- KEEP `worship` — acceptable offering as the shape of honoring God: "that you may be accepted, you shall offer a male without defect" (22:19), nothing blemished brought to his altar (22:20–25).
- KEEP `priesthood` — the priests' handling of the holy things: the unclean priest kept back — "having his uncleanness on him, that soul shall be cut off from before me" (22:3) — and the careful rule of who in a priest's household eats the holy food (22:10–16).
- KEEP `the-name-of-god` — the honor of the name as the ground of it all: "that they not profane my holy name" (22:2), "You shall not profane my holy name, but I will be made holy among the children of Israel" (22:32).
### Anchor-extension candidates
- `worship` | Leviticus 22:17–25 | "that you may be accepted, you shall offer a male without defect" (22:19) | low — the give-God-your-best register; the pack has no offering-law anchor.
- (Engine-side material for 22:32's sanctified-name register — "I will be made holy among the children of Israel" — matches corpus-blocked roster row 8 `gods-holy-name`, whose recorded decision keeps it a separate register from `the-name-of-god`: ROUTED to row 8, not proposed as a `the-name-of-god` extension. The display tag above stands on the profaning side, which that pack's own Lev 19:12/24:15–16 anchors already own.)
### Lexicon candidates
- `worship` | without defect | realistic query phrasings: "giving God your best", "why did sacrifices have to be without blemish", "acceptable offering to God"
### New-concept candidates
- None. (22:28's "you shall not kill it and its young both in one day" is a single-verse animal-care motif, not a searched teaching register; left as a motif.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Leviticus 23 (subdivided: 23:1–3, 23:4–8, 23:9–14, 23:15–22, 23:23–25, 23:26–32, 23:33–44)
Existing tags (book doc): `sabbath-rest`, `worship`, `gathering-together`, `tithing`, `joy-in-the-lord`, `generosity`, `appointed-feasts`, `passover`
### Applied-tag deltas
- KEEP `sabbath-rest` — the Sabbath heads the sacred calendar: "on the seventh day is a Sabbath of solemn rest, a holy convocation" (23:3), and solemn rest frames the festal months (23:24, 32, 39).
- KEEP `worship` — a year built of "holy convocations" proclaimed "in their appointed season" (23:4), each with its offering made by fire to the LORD (23:8, 25, 36–37).
- KEEP `gathering-together` — the feasts are commanded assemblies in the text itself: "there shall be a holy convocation to you. You shall do no regular work" (23:21; also 23:3, 7–8, 35–36); book-doc Decisions #34's not-a-read-back ruling holds.
- KEEP `tithing` — the concept's firstfruits side: "you shall bring the sheaf of the first fruits of your harvest to the priest" (23:10), and the two loaves "for first fruits to the LORD" (23:17).
- KEEP `joy-in-the-lord` — commanded gladness at the feast of booths: "you shall rejoice before the LORD your God seven days" (23:40); single-verse but a direct command (book-doc Decisions #33's borderline call confirmed honest).
- KEEP `generosity` — the gleaning law repeated inside the harvest feast: "You must leave them for the poor and for the foreigner" (23:22).
- KEEP `appointed-feasts` — the pack's core anchor chapter (Leviticus 23:1–44 is in its anchor list): "The set feasts of the LORD, which you shall proclaim to be holy convocations, even these are my set feasts" (23:2).
- KEEP `passover` — the pack's own anchor verses (Leviticus 23:4–8 is in its anchor list): "In the first month, on the fourteenth day of the month in the evening, is the LORD's Passover" (23:5), with the seven days of unleavened bread (23:6–8).
### Anchor-extension candidates
- `sabbath-rest` | Leviticus 23:3 | "on the seventh day is a Sabbath of solemn rest, a holy convocation" (23:3) | low — the Sabbath inside the feast calendar; the pack anchors Lev 19:3 but not 23.
- `tithing` | Leviticus 23:10–11, 17 | "you shall bring the sheaf of the first fruits of your harvest to the priest" (23:10) | low — the firstfruits rites, beside the ch 2 candidate already logged.
- `joy-in-the-lord` | Leviticus 23:40 | "you shall rejoice before the LORD your God seven days" (23:40) | low — commanded feast joy; the pack has no OT-feast anchor.
### Lexicon candidates
- `appointed-feasts` | feast of trumpets | realistic query phrasings: "feast of trumpets meaning", "what is the feast of trumpets"
- `appointed-feasts` | feast of weeks | realistic query phrasings: "feast of weeks in the bible", "pentecost in the old testament"
### New-concept candidates
- None. (The calendar material is `appointed-feasts`' own territory; Day-of-Atonement query families were already ROUTED to corpus-blocked roster row 1 at this ledger's ch 16 entry.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
- hit hard ceiling 8 — marked for per-verse refinement
### Decisions record
- Book-doc Decisions #52's ch-23 `fasting` yield re-verified and confirmed standing: "You shall afflict yourselves" (23:27) / "you shall deny yourselves" (23:32) is genuine theme-witness-with-caveat presence (the text says self-denial, not fasting), and at the hard ceiling it yields first in its class; its query need is already carried by the ch 16 `fasting` tag and lexicon candidate.
- No tag yielded among the applied 8; recorded so the at-ceiling state is not a silent call. Nearest-to-yield if refinement ever forces one: `generosity` (23:22) and `joy-in-the-lord` (23:40), both thin single-verse class.

## Leviticus 24 (subdivided: 24:1–9, 24:10–23)
Existing tags (book doc): `worship`, `divine-judgment`, `the-name-of-god`, `restitution`, `sojourners-and-strangers`
### Applied-tag deltas
- KEEP `worship` — the sanctuary's unbroken daily service: oil "to cause a lamp to burn continually" (24:2) and the bread set in order "Every Sabbath day ... before the LORD continually" (24:8).
- KEEP `divine-judgment` — the case is decided by God himself: the people wait "until the LORD's will should be declared to them" (24:12), and his verdict is carried out as commanded (24:13–16, 23).
- KEEP `the-name-of-god` — the pack's own anchor verses (Leviticus 24:15–16 is in its anchor list): the man who "blasphemed the Name, and cursed" (24:11), and the standing law — "He who blasphemes the LORD's name, he shall surely be put to death" (24:16).
- KEEP `restitution` — adopted display id (corpus-blocked roster row 28, whose refs name Lev 24:17–21): the measured laws of injury — "fracture for fracture, eye for eye, tooth for tooth" (24:20) — and making good a killed animal (24:18, 21). Engine-side material routes to roster row 28.
- KEEP `sojourners-and-strangers` — the one-law principle sealing the case: "You shall have one kind of law for the foreigner as well as the native-born" (24:22); thin single-verse class, kept as prior art whose equal-standing substance the tag-gaps row already carries for this verse.
### Anchor-extension candidates
- `worship` | Leviticus 24:1–9 | "Every Sabbath day he shall set it in order before the LORD continually" (24:8) | low — the continual-service register; caveat: procedure, adjacent to the pack's praise register.
- (Engine-side eye-for-eye material — 24:17–21 — matches corpus-blocked roster row 28 `restitution`, whose refs name these verses: ROUTED, not proposed fresh. No `lords-supper` showbread anchor — book-doc Decisions #25's read-back bar holds.)
### Lexicon candidates
- `the-name-of-god` | blasphemy | realistic query phrasings: "what is blasphemy in the bible", "blaspheming God's name", "taking God's name in vain"
### New-concept candidates
- None. (The "eye for an eye meaning" query family is roster row 28's territory: ROUTED, not minted.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
### Decisions record
- None.

## Leviticus 25 (subdivided: 25:1–7, 25:8–22, 25:23–34, 25:35–38, 25:39–55)
Existing tags (book doc): `sabbath-rest`, `gods-provision`, `generosity`, `justice-and-oppression`, `kinsman-redeemer`, `sojourners-and-strangers`
### Applied-tag deltas
- ADD `bondservants-and-masters` — WEB quote: "you shall not make him to serve as a slave. As a hired servant, and as a temporary resident, he shall be with you" (25:39–40) — seventeen verses of bondservice law (25:39–55): the impoverished Israelite serves as a hired servant and goes free at Jubilee with his children, "For they are my servants, whom I brought out of the land of Egypt. They shall not be sold as slaves" (25:42); the chapter also permits buying foreign slaves and holding them as property — "from them you may buy male and female slaves" (25:44) — stated plainly, per the honest-description rule; harsh rule over brothers barred (25:43, 46, 53). The pack's own lexicon leads with "slavery, what does the bible say about slavery," and its Jeremiah 34:8–17 anchor shows it owns the OT Hebrew-servitude register. Engine id and adopted id both.
- KEEP `sabbath-rest` — the Sabbath principle written into the land: "in the seventh year there shall be a Sabbath of solemn rest for the land, a Sabbath to the LORD" (25:4), kept again in the Jubilee year (25:11–12).
- KEEP `gods-provision` — the pledge that makes the fallow year possible, framed strictly as the covenant's own terms to Israel in the land: to "What shall we eat the seventh year?" (25:20) God answers, "then I will command my blessing on you in the sixth year, and it shall bear fruit for the three years" (25:21).
- KEEP `generosity` — "If your brother has become poor, and his hand can't support himself among you, then you shall uphold him" (25:35), with "Take no interest from him or profit" (25:36).
- KEEP `justice-and-oppression` — "you shall not wrong one another" in Jubilee-priced sales (25:14, 17), no interest or profit from the poor (25:36–37), and no ruling "with harshness" over brothers (25:43, 46, 53).
- KEEP `kinsman-redeemer` — adopted display id (corpus-blocked roster row 27, whose refs name Lev 25): "then his kinsman who is next to him shall come, and redeem that which his brother has sold" (25:25), and the redemption of a brother sold to a foreigner (25:47–55). No redemption-in-Christ framing, per the book doc's register care. Engine-side material routes to roster row 27.
- KEEP `sojourners-and-strangers` — the claim beneath the whole chapter, in the pack's own register: "The land shall not be sold in perpetuity, for the land is mine; for you are strangers and live as foreigners with me" (25:23).
### Anchor-extension candidates
- `bondservants-and-masters` | Leviticus 25:39–46 | "you shall not make him to serve as a slave" (25:39) | medium — the OT statute base beside the pack's Jeremiah 34:8–17 anchor; the same span carries the permit text (25:44–46), which any anchor gist must state honestly.
- `gods-provision` | Leviticus 25:20–22 | "then I will command my blessing on you in the sixth year, and it shall bear fruit for the three years" (25:21) | medium — a covenant-provision anchor with the register caveat: Israel's land-covenant terms, not a general guarantee.
- `sabbath-rest` | Leviticus 25:1–7 | "in the seventh year there shall be a Sabbath of solemn rest for the land, a Sabbath to the LORD" (25:4) | low — the sabbath-year register, absent from the pack's anchors.
- `fear-of-the-lord` | Leviticus 25:17, 36, 43 | "You shall not wrong one another, but you shall fear your God" (25:17) | low — the fear of God as the sanction protecting the vulnerable in unenforceable dealings; caveat: motive clauses.
(Engine-side redemption/Jubilee material — 25:8–13, 23–34, 47–55 — matches corpus-blocked roster row 27 `kinsman-redeemer`: ROUTED there, not proposed fresh.)
### Lexicon candidates
- `justice-and-oppression` | lending at interest | realistic query phrasings: "usury in the bible", "what does the bible say about charging interest", "lending money to the poor"
- `sabbath-rest` | sabbath year | realistic query phrasings: "what is the sabbath year", "why did the land rest every seven years"
### New-concept candidates
- None. (The "year of jubilee meaning" / "proclaim liberty throughout the land" query family — "proclaim liberty throughout the land to all its inhabitants" (25:10) — matches corpus-blocked roster row 27 `kinsman-redeemer`'s Lev 25 territory: ROUTED, not minted; the row's future curator should weigh whether Jubilee needs its own lexicon rows there.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
- exceeds soft cap 6 (7 tags after the `bondservants-and-masters` ADD); under hard ceiling 8
### Decisions record
- No tag yielded: 7 tags exceed the soft cap but sit under the hard ceiling with each independently clearing the bar; recorded so the over-soft-cap state is not a silent call. Nearest-to-yield if refinement ever forces one is `sabbath-rest` (its land-Sabbath material is the frame the Jubilee chapters build on, broad-duplicating-specific beside the chapter's specific institutions).
- Group-wide pastoral withholdings re-verified and confirmed standing: `pastoral-freedom-from-bondage` stays off (the Jubilee's "proclaim liberty" is a national institution, not the personal-bondage register — book-doc Decisions #31(b)); `pastoral-refuge-and-justice` stays off (national covenant statute — #31(a)).

## Leviticus 26 (subdivided: 26:1–13, 26:14–39, 26:40–46)
Existing tags (book doc): `covenant`, `obedience-to-the-word`, `blessing`, `the-lords-discipline`, `repentance`, `gods-faithfulness`, `confession-of-sin`, `idolatry`
### Applied-tag deltas
- KEEP `covenant` — the chapter is the covenant's own sanctions: "and will establish my covenant with you" (26:9), "I will walk among you, and will be your God, and you will be my people" (26:12), and the remembering — "then I will remember my covenant with Jacob, my covenant with Isaac, and also my covenant with Abraham" (26:42).
- KEEP `obedience-to-the-word` — the hinge repeated at every turn: "If you walk in my statutes and keep my commandments, and do them" (26:3) against "But if you will not listen to me" (26:14, 18, 21, 27).
- KEEP `blessing` — the covenant's promised good for obedience in the land, framed strictly as the covenant's own terms to national Israel and not any private prosperity formula: rain in season (26:4), "You shall eat your bread to the full, and dwell in your land safely" (26:5), peace and fruitfulness (26:6–10).
- KEEP `the-lords-discipline` — the curses' own stated logic is corrective escalation: "then I will chastise you seven times more for your sins" (26:18), "If by these things you won't be turned back to me" (26:23), "I will also chastise you seven times for your sins" (26:28) — an escalation whose climax the text states without euphemism: "You will eat the flesh of your sons, and you will eat the flesh of your daughters" (26:29). Register caveat carried: national covenant discipline, beside the pack's personal Hebrews 12 register.
- KEEP `repentance` — the door out of judgment: "If they confess their iniquity and the iniquity of their fathers" (26:40), "if then their uncircumcised heart is humbled, and they then accept the punishment of their iniquity" (26:41).
- KEEP `gods-faithfulness` — God holds to his covenant even under the curses: "I will not reject them, neither will I abhor them, to destroy them utterly and to break my covenant with them" (26:44), remembering "the covenant of their ancestors" (26:45).
- KEEP `confession-of-sin` — LEGAL: exact id on the CONVENTIONS §11.1 adopted list (`tag-apply/adopted-concepts.md`, engine-built: no). The presence bar holds: confession is the named turning point of the whole restoration section — "If they confess their iniquity and the iniquity of their fathers, in their trespass which they trespassed against me" (26:40) — the condition on which God remembers the covenant (26:42). Display tag only; see Decisions record.
- KEEP `idolatry` — the covenant's opening line and its curse-side purge: "You shall make for yourselves no idols" (26:1 — no carved image, pillar, or figured stone to bow down to), and "I will destroy your high places, and cut down your incense altars" (26:30).
### Anchor-extension candidates
- `covenant` | Leviticus 26:9–13, 40–45 | "I will walk among you, and will be your God, and you will be my people" (26:12) | medium — the covenant formula and the remember-my-covenant texts; the pack has no Leviticus anchor.
- `the-lords-discipline` | Leviticus 26:18–28 | "then I will chastise you seven times more for your sins" (26:18) | medium — the pack's only anchors are Hebrews 12:7–11 and Revelation 3:19; caveat carried: national-covenant register, and the escalation includes the 26:29 hard text, to be described honestly wherever anchored.
- `gods-faithfulness` | Leviticus 26:44–45 | "I will not reject them, neither will I abhor them, to destroy them utterly and to break my covenant with them" (26:44) | low
(Engine-side heart-circumcision material — "if then their uncircumcised heart is humbled" (26:41) — matches corpus-blocked roster row 37 `circumcision-of-the-heart` (Deut 30:6; 10:16 register): ROUTED to row 37, not proposed fresh. Engine-side exile material — see Decisions record — ROUTED to roster row 45.)
### Lexicon candidates
- `covenant` | I will be your God and you will be my people | realistic query phrasings: "I will be your God and you will be my people meaning", "God dwelling with his people"
### New-concept candidates
- None. (Every candidate register either has a live home tagged above or matches a corpus-blocked roster row — rows 37 and 45 routings noted in this entry.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- book doc subdivides this chapter — marked for per-verse refinement
- hit hard ceiling 8 — marked for per-verse refinement
### Decisions record
- `confession-of-sin` KEPT (the carried flag resolved as instructed): the id IS on the canonical §11.1 adopted list, engine-built: no, with NO corpus-blocked roster row — so its engine work has no roster home; it remains an adopted vocabulary-addition candidate for the fixtures-first flow (Lev 5:5; 16:21; 26:40 are its natural Leviticus anchors, and the tag-gaps 1 John row already carries those refs). Consistent with this ledger's ch 16 disposition; the ch 5 revisit flag recorded there stands.
- Book-doc Decisions #30's `divine-judgment` yield re-verified and confirmed standing: genuinely present ("I will set my face against you," 26:17) but broad-duplicating-specific at the hard ceiling — `the-lords-discipline` carries the curses' own corrective logic and `covenant` their sanction frame.
- `exile-and-captivity` (adopted id, engine-built: no; corpus-blocked roster row 45) considered and yielded at the hard ceiling: genuinely present — "I will scatter you among the nations, and I will draw out the sword after you" (26:33), with the exiles' restoration hinge (26:40–45) — but the chapter stands at 8 with every tag independently clearing the bar, and the newcomer yields. Engine-side material ROUTED to roster row 45, where the fold-vs-separate routing (`sojourners-and-strangers`) is recorded as Jesse's call; 26:33–45 should ride that row's decision.

## Leviticus 27
Existing tags (book doc): `tithing`, `oaths-and-vows`
### Applied-tag deltas
- KEEP `tithing` — the pack's own anchor verse (Leviticus 27:30 is in its anchor list): "All the tithe of the land, whether of the seed of the land or of the fruit of the trees, is the LORD's. It is holy to the LORD" (27:30), and of herd and flock, "whatever passes under the rod, the tenth shall be holy to the LORD" (27:32).
- KEEP `oaths-and-vows` — the Bible's fullest vow-valuation system: "When a man consecrates a person to the LORD in a vow, according to your valuation" (27:2), scaled to the poor — "The priest shall assign a value according to his ability to pay" (27:8) — through animals, houses, and fields (27:9–25), and the devoted things beyond redemption (27:28–29).
- (`surrender-to-god` re-checked and the book doc's Decisions #32 withholding confirmed against the text: vow valuations are procedural dedication of property, not the concept's personal-yielding substance.)
### Anchor-extension candidates
- `oaths-and-vows` | Leviticus 27:1–13 | "When a man consecrates a person to the LORD in a vow, according to your valuation" (27:2) | low — the vow-valuation law; the pack's Torah anchors are Numbers 6:1–8 and 30:2 only.
### Lexicon candidates
- `oaths-and-vows` | redeeming a vow | realistic query phrasings: "can you take back a vow to God", "buying back a vow in the bible", "leviticus 27 meaning"
### New-concept candidates
- `devoted-to-destruction` | "devoted to destruction meaning" / "what does herem mean in the bible" is a genuine query family with no home in any legal list; not declined, not on the corpus-blocked roster. Caution carried: a single hard text here — to be described honestly, without adjudication — and the register's sustained material is in Joshua/Deuteronomy, so per the mint-from-the-book-that-teaches-it precedent (the Ecclesiastes patience ruling) the minting decision belongs to those books' threads; this entry logs the Leviticus witness. | Anchor: "No one devoted to destruction, who shall be devoted from among men, shall be ransomed" (27:29), beside "Everything that is permanently devoted is most holy to the LORD" (27:28)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- none
### Decisions record
- None.

## Corrigenda — chapters 1–9 vs the 15 late-arriving adopted ids (2026-08-26)

This corrigendum exists because the chapters 1–9 sweep ran before the canonical §11.1 adopted list (`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`, reconstructed 2026-08-26) was available, against a narrower legal tag universe (concept-index.md + the 50-row corpus-blocked roster only); 15 adopted engine-built:no ids — `confession-of-sin`, `death-of-a-believer`, `eternal-life`, `false-teachers`, `freedom-in-christ`, `gentleness-of-christ`, `gods-delight-in-his-people`, `living-for-gods-glory`, `new-birth`, `outpouring-of-the-spirit`, `sovereignty-of-god`, `sowing-and-reaping`, `speaking-in-tongues`, `the-branch`, `walking-in-truth` — were outside that universe and could not be tagged. Chapters 1–9 are here re-evaluated against those 15 ids only, presence bar first; the original entries above stand unedited (append-only).

- **REVERSAL — Leviticus 5: `confession-of-sin` DROP reversed; new disposition KEEP (book-doc tag restored).** The ch 5 entry's DROP rested solely on the id being outside the pre-reconstruction legal universe; the id IS on the canonical §11.1 adopted list (engine-built: no, no corpus-blocked roster row). On the text the presence bar holds: confession is the commanded first step of the remedy for every case in the chapter — WEB: "It shall be, when he is guilty of one of these, he shall confess that in which he has sinned" (5:5) — not a passing mention but the statute's own named act, consistent with this ledger's ch 16 and ch 26 KEEP dispositions (16:21; 26:40). This supersedes the Leviticus 5 Decisions-record DROP entry, which stays in place per the append-only rule; the ch-16 entry's revisit flag for ch 5 is hereby resolved. Ch 5 stands at 6 tags (`sin`, `forgiveness-of-sins`, `confession-of-sin`, `oaths-and-vows`, `restitution`, `sacrifice-and-atonement`) — at the soft cap 6, under the hard ceiling 8, each tag independently clearing the bar; no §11.6 yield required. Display tag only; engine-side the id remains an adopted vocabulary-addition candidate for the fixtures-first flow (no roster row to route to), as recorded at ch 16/26.
- Leviticus 1 — no change — none of the 15 meet the presence bar. (The "pleasant aroma to the LORD" / "accepted before the LORD" formulas (1:3–4, 9) were checked against `gods-delight-in-his-people` and judged below the bar: offering-acceptance procedure, not the concept's delight-in-his-people teaching substance.)
- Leviticus 2 — no change — none of the 15 meet the presence bar. (First-fruits offering (2:12, 14) is not `sowing-and-reaping` substance — no consequence-principle teaching.)
- Leviticus 3 — no change — none of the 15 meet the presence bar.
- Leviticus 4 — no change — none of the 15 meet the presence bar. (Sin is "made known" (4:23, 28) but no confession is commanded or enacted in this chapter — `confession-of-sin` would overreach; its Leviticus home is 5:5, 16:21, 26:40.)
- Leviticus 5 — `confession-of-sin` KEEP restored per the REVERSAL above; no other delta id meets the presence bar.
- Leviticus 6 — no change — none of the 15 meet the presence bar.
- Leviticus 7 — no change — none of the 15 meet the presence bar.
- Leviticus 8 — no change — none of the 15 meet the presence bar.
- Leviticus 9 — no change — none of the 15 meet the presence bar. (The appearing glory (9:6, 23–24) is already carried by the ch 9 `glory-of-god` ADD; `living-for-gods-glory` is a different, conduct-register concept not taught here, and `sovereignty-of-god` teaching substance is not present in the ordination-service narrative.)

Register note: most of the 15 are later-revelation ids (`death-of-a-believer`, `eternal-life`, `false-teachers`, `freedom-in-christ`, `gentleness-of-christ`, `new-birth`, `outpouring-of-the-spirit`, `speaking-in-tongues`, `the-branch`, `walking-in-truth`) — excluded on the no-later-revelation-read-back rule as well as on absence; none has honest substantial presence in Leviticus 1–9.

Closing note: chapters 10–27 were swept under the full post-reconstruction universe (canonical adopted list in hand) and need no re-check; their `confession-of-sin` dispositions (ch 16 KEEP, ch 26 KEEP) already reflect it.
