# Jeremiah — Layer-3 tag sweep ledger (assembled)

- Book: Jeremiah; chapters 1–52 (complete).
- Sweep thread: Isaiah–Daniel group (Major Prophets), Layer 3 of the whole-Bible coverage plan.
- Repo: scripture-search-engine @ origin/main, pinned SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e.
- Date: 2026-08-26.
- Sources: engine concept inventory — 239 ids in `ontology/concepts/*.yaml` at the pinned SHA
  (scratchpad `concept-inventory.md`); adopted display vocabulary — canonical §11.1 list at
  `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids, engine-built
  flags; per the 2026-08-26 brief addendum this file supersedes the earlier reconstruction rule).
- Assembly: three self-verified chunk drafts (chapters 1–17, 18–34, 35–52), independently
  re-verified and merged by the assembly worker; chapter entries below are reproduced verbatim
  from the chunks; cross-chunk merges live in the Book totals section.

Standing rulings preserved (assembled ledger, binding throughout):

1. **Pastoral register.** pastoral-* tags belong to the personal-crisis register only — kept on
   the confessions (chs 15, 20) and on Baruch (ch 45), off national oracles (chs 8, 31 rulings
   re-affirmed in the entries below).
2. **Jer 29:11 guardrail.** The `hope-in-god` justification on ch 29 stays anchored to the dated
   seventy-year communal pledge to the exiles (29:10, answered 29:14); no individual-guarantee
   framing is introduced anywhere in this ledger.
3. **`prayer-for-healing` / Decisions #63 consistency flag (curator-facing, carried from the
   ch 17 entry).** The engine pack `prayer-for-healing` anchors Jeremiah 17:14 at w=0.8, while
   book-doc Decisions #63 declines the `pastoral-prayer-for-healing` display tag on ch 17 on
   register grounds (17:14 read in-context as persecution-anguish, not sickness). The display
   decline is left standing (no new textual evidence); the disagreement between the display
   decline and the engine anchor is flagged for the pack curator to resolve at curation time.

Id conventions and legacy-id flags (preserved from the chunk headers, plus the coordinator's
mid-assembly correction — none silently normalized):

- Chunk 1–17 header: "The pastoral-* prefixed ids used by the book doc are the pre-§11.1 131-id
  display vocabulary's forms (CONVENTIONS §5's own worked example names
  `pastoral-god-sees-my-suffering` as the exact display id); kept as prior art where in use."
- Chunk 18–34 header: "the pastoral packs tag under their prefixed display ids per CONVENTIONS §5
  (`pastoral-<id>`); the corresponding engine yaml ids at this SHA are unprefixed (verified in
  ontology/concepts/pastoral-*.yaml: e.g. `pastoral-god-sees-my-suffering` → engine id
  `god-sees-my-suffering`, `pastoral-hope-in-despair` → `hope-in-despair`,
  `pastoral-grief-and-loss` → `grief-and-loss`, `pastoral-pregnancy-and-child-loss` →
  `pregnancy-and-child-loss`). Engine candidates below use the engine ids; Tags-line references
  keep the display form." Adopted-only ids used in that chunk, each confirmed on the canonical
  list, engine-built: no — `god-relents`, `persecuted-for-gods-word`, `sovereignty-of-god`,
  `the-branch`.
- Chunk 35–52 header: `persecuted-for-gods-word` sourced to the canonical adopted list (entry
  "engine-built: no"; in use on jeremiah.md Tags lines, chs 18, 20, 26, 36–38; also corpus-blocked
  roster row 4); `pastoral-hope-in-despair` and `pastoral-god-sees-my-suffering` are display ids
  in long-standing book-doc use with engine-side registers `hope-in-despair` /
  `god-sees-my-suffering` in the 239 inventory.
- **Coordinator correction (2026-08-26, applied at assembly):** the 14 pastoral-* concept packs
  have YAML `id:` fields WITHOUT the pastoral- prefix; for ledgers the PREFIXED form — the
  filename under `ontology/concepts/`, per CONVENTIONS §5 (never strip pastoral- prefixes) — is
  canonical, with the yaml-id mapping as a parenthetical. Two filenames diverge further:
  `pastoral-refuge-and-justice.yaml` → yaml id `refuge-and-justice-for-the-oppressed`;
  `pastoral-serious-illness.yaml` → yaml id `serious-illness-and-dying`. All seven prefixed
  pastoral ids used in this ledger (`pastoral-god-sees-my-suffering`, `pastoral-hope-in-despair`,
  `pastoral-grief-and-loss`, `pastoral-pregnancy-and-child-loss`, `pastoral-prayer-for-healing`,
  `pastoral-relapse-and-restoration`, `pastoral-refuge-and-justice`) were verified against the
  filenames in the repo at the pinned SHA — all present. The chunk-header wording above is
  preserved verbatim as written; where it says "engine id", read "yaml `id:` field" per this
  correction — the prefixed filename form remains the id of record.
- Quote conventions differ by chunk and are preserved: chunks 1–17 and 18–34 put WEB quotes in
  double quotation marks and query phrasings plain or in single quotes; chunk 35–52 also uses
  double quotes for lexicon terms and query phrasings. Only WEB-attributed spans were subject to
  byte-for-byte verification.

## Assembly verification statement (2026-08-26, mechanical, independent of chunk self-reports)

- **Coverage:** all 52 chapter entries present, in canonical order 1–52 across the three chunks
  (17 + 17 + 18); Torah-ledger entry format consistent throughout (chunks 18–34 and 35–52 number
  the eight fields; chunk 1–17 labels them — same fields, same order).
- **Quotes:** 293 double-quoted spans extracted and checked against the pinned
  `web-text/jeremiah/<N>.txt` files; 256 are WEB-attributed and every one verifies byte-for-byte
  in its cited chapter (labeled cross-chapter citations — e.g. the ch 48 entry's Jeremiah 42:10
  witness — verified against their stated chapters). The remaining 37 spans are query phrasings,
  lexicon terms, motif titles, or quotations of book-doc/ruling text (chunk 35–52's double-quote
  convention), not WEB attributions; zero WEB-quote failures. No composed quotes found.
- **Ids:** every backticked id resolves — 49 engine-only ids, 43 ids on both the engine census
  and the adopted list, 12 adopted-list/roster ids used with their source labeled
  (`sovereignty-of-god`, `the-branch`, `god-relents`, `persecuted-for-gods-word` as adopted
  display ids; `circumcision-of-the-heart`, `courage`, `deliverance`, `exile-and-captivity`,
  `famine-of-hearing-gods-word`, `gentile-inclusion`, `gods-holy-name`, `redeemer` as
  corpus-blocked roster-row citations), 7 pastoral-* prefixed display ids verified against the
  `ontology/concepts/` filenames at the pinned SHA, and 2 explicitly-labeled new-concept
  candidate ids (`calling-and-commission`, `gods-grief-in-judgment`). No unresolvable unlabeled
  ids.
- **Counts (recomputed mechanically):** every chunk-summary count reproduced exactly — ADDs
  8+3+6, DROPs 0+1+0, KEEPs 81+81+52, anchor-extension candidates 38+35+21, lexicon candidates
  7+12+6, new-concept candidates 1+0+1. **No count corrections were needed.** (Note: chunk
  18–34's anchor count of 35 includes the ch 20 `god-sees-my-suffering` row, written with its
  display-form parenthetical — confirmed a real candidate row.)
- **Deltas:** every ADD carries an in-chapter WEB quote; the single DROP (`hope-in-god`, ch 31,
  §11.6 yield) has its full Decisions-record entry including the alternative-yield analysis;
  every considered-not-added call found in the entries carries a Decisions-record (or, in chunk
  1–17's format, an explicitly recorded in-delta) line.
- **Cross-chunk dedupe:** no identical id+ref anchor rows across chunks; the only overlapping
  candidate pair (`false-prophets` Jer 6:14 vs 8:11, near-identical phrasing) was already flagged
  in-entry with a take-one-not-both curator note. Roster-row routings cited by multiple chunks
  are merged into single per-row notes in Book totals below; nothing was dropped in the merge.
- **Refinement flags:** the 32 chapters flagged as subdivided exactly match the brief's
  Jeremiah subdivided list; no chapter is flagged that the brief omits, none omitted that it
  lists.

---


### Chapters 1–17 (chunk: jeremiah-01-17.md, self-verified; independently re-verified at assembly)

## Jeremiah 1

Existing tags (book doc): `fear-not`, `presence-of-god`, `gods-protection`, `dreams-and-visions`, `power-of-gods-word`
Applied-tag deltas:
- KEEP all 5 — re-verified in-chapter: `fear-not` (1:8, 1:17), `presence-of-god` (1:8, 1:19), `gods-protection` (1:18–19), `dreams-and-visions` (1:11–14, two vision-oracles), `power-of-gods-word` (1:12). No adds: the call narrative's remaining substance (commissioning) has no honest home in the current vocabulary — see new-concept candidate below.
Anchor-extension candidates:
- `fear-not` | Jer 1:8 | "Don’t be afraid because of them, for I am with you to rescue you" | w=0.7
- `power-of-gods-word` | Jer 1:12 | "I watch over my word to perform it" | w=0.8 (the book doc's Isaiah-thread append list already stages this ref; recorded here as the engine-facing candidate)
- `gods-protection` | Jer 1:18-19 | "They will fight against you, but they will not prevail against you" | w=0.6
Lexicon candidates: None.
New-concept candidates:
- proposed id `calling-and-commission` — God's call and commissioning of a person. Rationale: "God's calling" queries have no honest home: `guidance` owns direction-for-my-life phrasings, `discipleship` owns follow-Jesus phrasings, but neither serves the call/commission register (Jer 1, Exod 3, Isa 6, Amos 7:14–15). Anchor: Jer 1:4-10, keystone 1:5 "Before I formed you in the womb, I knew you. Before you were born, I sanctified you. I have appointed you a prophet to the nations." plus 1:9 "Behold, I have put my words in your mouth." Queries: what is God calling me to do / before I formed you in the womb meaning / does God call ordinary people. Check-first note: run a `guidance` + `discipleship` lexicon check before minting (CONVENTIONS §9 discipline); the book doc's motif list already carries the *Known before birth / appointed from the womb* entry (1:5) as raw feed. Not on the corpus-blocked roster; not among the §3 declines; not on the adopted list.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (5 tags; not subdivided in book doc).
Decisions record: None (no yields). Book-doc Decisions #72 (ch 1 left without `divine-judgment`; 1:16 previews the message, below the bar) re-checked against 1:14–16 and re-affirmed.

## Jeremiah 2

Existing tags (book doc): `sin`, `divine-judgment`, `self-deception`, `the-lords-discipline`, `idolatry`
Applied-tag deltas:
- KEEP all 5 — `sin` (2:13, 2:22), `divine-judgment` (2:9, 2:35), `self-deception` (2:23, 2:35), `the-lords-discipline` (2:19 with 2:30's refused correction; book-doc Decisions #49 flags it the chapter's weakest tag — re-checked, kept: the correction-built-into-sin substance is stated in God's own words), `idolatry` (2:11–13, 27–28).
- ADD `living-water` (engine id) — the chapter's central indictment is the pack's own keystone image, stated in God's own words and anchored by the pack itself (Jeremiah 2:13, w=0.8 in the pack): "they have forsaken me, the spring of living waters, and cut out cisterns for themselves: broken cisterns that can’t hold water" (2:13). Chapter lands at 6 (soft cap).
Anchor-extension candidates:
- `backsliding` | Jer 2:19 | "Your own wickedness will correct you, and your backsliding will rebuke you" | w=0.55 (pack already carries the national register via Judges 2:11-19 and Jer 31:22)
- `trusting-in-man` | Jer 2:36-37 | "for the LORD has rejected those in whom you trust, and you won’t prosper with them" | w=0.55 (foreign-alliance register, matching the pack's Isaiah 31:1 anchor; considered as a tag and judged below the presence bar for this chapter — the alliance material is two passages inside an idolatry indictment, topic-touch not teaching substance)
Lexicon candidates:
- `living-water` | term: broken cisterns | queries: broken cisterns meaning / forsaking the spring of living water / living water in the Old Testament (the book doc's motif list stages the same phrase; XOR-clean — no other pack carries cistern vocabulary)
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 reached after the add; not subdivided in book doc.
Decisions record: None (no yields; the `trusting-in-man` non-add is a presence-bar call, not a cap yield — recorded above with its routing to an anchor-extension candidate).

## Jeremiah 3 (subdivided: 3:1–5, 3:6–10, 3:11–25)

Existing tags (book doc): `repentance`, `forgiveness-of-sins`, `restoration`
Applied-tag deltas:
- KEEP all 3 — `repentance` (3:12–13, 3:25), `forgiveness-of-sins` (3:12), `restoration` (3:14–18).
- ADD `backsliding` (engine id; also adopted list, engine-built: yes) — the chapter is Scripture's densest backsliding text: "backsliding Israel" named at 3:6, 8, 11, 12, and God's own healing pledge, "Return, you backsliding children, and I will heal your backsliding" (3:22). The pack's substance (drifting from God; falling away) is depicted and named throughout, and its anchor set already accepts the national register (Judges 2:11-19). Cross-note: the book doc's checked-and-covered list routed *backsliding and returning (3; 8:5)* to `repentance` + `pastoral-relapse-and-restoration` — that routing predates the `backsliding` engine pack (not in the 131-id vocabulary; in the 239 census). Tagging the now-live id is an application of the current vocabulary, not an overturn of the §3.5 routing decline; both tags stand per the both-tags ruling (§11.2). Chapter lands at 4.
Anchor-extension candidates:
- `backsliding` | Jer 3:22 | "Return, you backsliding children, and I will heal your backsliding" | w=0.85 (the pack's only Jeremiah anchor today is 31:22 at w=0.5; 3:22 is the stronger, direct text)
- `repentance` | Jer 3:12-13 | "Return, you backsliding Israel" ... "Only acknowledge your iniquity" | w=0.75 (pack has no Jeremiah anchor)
Lexicon candidates:
- `backsliding` | term: heal your backsliding | queries: can God heal my backsliding / I keep falling away from God / coming back after falling away
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). Book-doc Decisions #15 (`pastoral-relapse-and-restoration` removed from ch 3, national register) re-affirmed — the new `backsliding` add is the doctrinal register, not a pastoral-* tag, so the pastoral-register ruling is untouched.

## Jeremiah 4 (subdivided: 4:1–4, 4:5–18, 4:19–31)

Existing tags (book doc): `repentance`, `divine-judgment`, `lament`, `hardness-of-heart`, `remnant`
Applied-tag deltas:
- KEEP all 5 — `repentance` (4:1, 3, 14), `divine-judgment` (4:6, 12, 28), `lament` (4:19–21), `hardness-of-heart` (4:3–4), `remnant` (4:27). No adds; `creation` correctly absent per book-doc Decisions #61 (4:23–26 is de-creation imagery, re-affirmed), `false-prophets` at 4:10 re-checked against the full WEB text and still below the bar (a single verse, and the deception is voiced as Jeremiah's accusation to God, not false-prophet teaching — the prior skip's presence-call stands, not just its anchor-availability ground).
Anchor-extension candidates:
- `lament` | Jer 4:19 | "My anguish, my anguish! I am pained at my very heart!" | w=0.7 (pack's Jeremiah anchor today is 10:19-20 only)
- `remnant` | Jer 4:27 | "yet I will not make a full end" | w=0.6 (the refrain's first and homed occurrence, per book-doc Decisions #86(d))
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: ROUTED, not duplicated — the circumcision-of-the-heart material (4:4 "Circumcise yourselves to the LORD, and take away the foreskins of your heart") is already on the corpus-blocked roster, row 37 (`circumcision-of-the-heart`, whose deferral note itself names the Jer 4:4 routing); finding routed to the expansion thread's queue, no anchor-extension proposed here so the read-together heart-design stays whole.

## Jeremiah 5

Existing tags (book doc): `sin`, `divine-judgment`, `self-deception`, `false-prophets`, `fear-of-the-lord`, `justice-and-oppression`
Applied-tag deltas:
- KEEP all 6 — `sin` (5:6, 5:25), `divine-judgment` (5:9, 5:29), `self-deception` (5:12), `false-prophets` (5:31), `fear-of-the-lord` (5:22–24), `justice-and-oppression` (5:26–28). No adds — chapter at the soft cap and no unrepresented concept clears the bar.
Anchor-extension candidates:
- `fear-of-the-lord` | Jer 5:22-24 | "Don’t you fear me?" ... "Let’s now fear the LORD our God, who gives rain, both the former and the latter, in its season" | w=0.75 (pack's Jeremiah anchor today is 10:7 only)
- `justice-and-oppression` | Jer 5:26-28 | "They don’t plead the cause, the cause of the fatherless" | w=0.7 (pack has no Jeremiah anchor; the book doc's live-row append stages 5:26–29)
- `power-of-gods-word` | Jer 5:14 | "I will make my words in your mouth fire, and this people wood, and it will devour them" | w=0.6 (word-as-fire register; the display tag stays off per book-doc #86(a), but the engine-side candidate is now quotable from the full text)
- `remnant` | Jer 5:18 | "I will not make a full end of you" | w=0.55
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 (existing); not subdivided in book doc.
Decisions record: Re-affirmed prior yields, no new drops: `hardness-of-heart` (5:3, 5:23) stays yielded per book-doc #86(d) — the 5:22–23 strophe is homed on `fear-of-the-lord` and the chapter sits at cap; `prosperity-of-the-wicked` (5:27–28) stays yielded to `justice-and-oppression`'s same-passage tag per #86(c), its home being ch 12.

## Jeremiah 6

Existing tags (book doc): `divine-judgment`, `sin`, `rest-for-the-weary`, `false-prophets`
Applied-tag deltas:
- KEEP all 4 — `divine-judgment` (6:6, 6:19, 6:30), `sin` (6:7, 6:13), `rest-for-the-weary` (6:16; book-doc Decisions #26's counter-reading noted and the keep re-affirmed — the concept's substance is stated verbatim in God's own words), `false-prophets` (6:13–15). No adds: `testing` at 6:27–30 considered — four verses of refining imagery, but the depicted substance is assay-unto-rejection ("In vain they go on refining, for the wicked are not plucked away", 6:29), not trials proving faith; below the bar as a tag (consistent with book-doc #65's single-clause declines on 17:10 and 20:12), recorded as an anchor-extension candidate instead. `empty-worship` at 6:20 (one verse, unacceptable offerings) below the bar; its home is ch 7.
Anchor-extension candidates:
- `rest-for-the-weary` | Jer 6:16 | "ask for the old paths, ‘Where is the good way?’ and walk in it, and you will find rest for your souls" | w=0.7 (pack has no OT prophetic anchor; heavy phrase for rest-for-your-souls queries)
- `false-prophets` | Jer 6:14 | "They have healed also the hurt of my people superficially, saying, ‘Peace, peace!’ when there is no peace." | w=0.7
- `testing` | Jer 6:27-30 | "I have made you a tester of metals and a fortress among my people, that you may know and try their way." | w=0.5 (refiner register with a rejection outcome — curator should weigh the register mismatch noted above)
Lexicon candidates:
- `false-prophets` | term: peace peace when there is no peace | queries: peace peace when there is no peace meaning / false peace Bible verse / prophets who promise peace (book-doc motif list stages the same phrase)
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (4 tags; not subdivided in book doc).
Decisions record: None (no yields).

## Jeremiah 7 (subdivided: 7:1–15, 7:16–29, 7:30–34)

Existing tags (book doc): `self-deception`, `obedience-to-the-word`, `divine-judgment`, `idolatry`, `justice-and-oppression`
Applied-tag deltas:
- KEEP all 5 — `self-deception` (7:4, 8, 10), `obedience-to-the-word` (7:23), `divine-judgment` (7:14, 20, 32), `idolatry` (7:18, 30–31), `justice-and-oppression` (7:5–7).
- ADD `empty-worship` (engine id; also adopted list, engine-built: yes) — the temple sermon is a defining text of the pack's register (worship without amended life; the pack anchors Isaiah 1:11-17 and Amos 5:21-24, the same genre): "Don’t trust in lying words, saying, ‘The LORD’s temple, the LORD’s temple, the LORD’s temple, are these.’" (7:4), sharpened at 7:11, "Has this house, which is called by my name, become a den of robbers in your eyes?", and grounded in 7:22–23 — sacrifice was never the first command, "Listen to my voice, and I will be your God, and you shall be my people" (7:23). Chapter lands at 6 (soft cap).
Anchor-extension candidates:
- `empty-worship` | Jer 7:4-11 | "Don’t trust in lying words, saying, ‘The LORD’s temple, the LORD’s temple, the LORD’s temple, are these.’" | w=0.85 (pack has no Jeremiah anchor; the temple sermon completes its prophetic-critique set)
- `obedience-to-the-word` | Jer 7:22-23 | "Listen to my voice, and I will be your God, and you shall be my people" | w=0.7 (pack has no Jeremiah anchor; obedience-before-sacrifice matches its 1 Samuel 15:22 anchor's register)
Lexicon candidates:
- `empty-worship` | term: den of robbers | queries: den of robbers meaning / why did Jesus call the temple a den of thieves / trusting church attendance instead of obedience (the NT connection is the pack curator's to attribute; the display layer adjudicates nothing)
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 reached after the add; subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). `care-for-widows` at 7:6 stays off per book-doc #86(c) (single list-item verse, carried by `justice-and-oppression`) — re-affirmed. `the-house-of-god` considered (7:2–14 is temple material) and judged below the bar: the chapter warns against false trust in the house rather than teaching the pack's dwelling-place substance; no candidate emitted.

## Jeremiah 8 (subdivided: 8:1–13, 8:14–17, 8:18–22)

Existing tags (book doc): `sin`, `divine-judgment`, `self-deception`, `false-prophets`, `lament`
Applied-tag deltas:
- KEEP all 5 — `sin` (8:5–6), `divine-judgment` (8:1–2, 13, 17), `self-deception` (8:8, 11), `false-prophets` (8:10–11), `lament` (8:18–22). No adds: `repentance` at 8:4–6 is the failure depiction ("No one repents of his wickedness"), which does not earn the tag under the Genesis-3 worked example.
Anchor-extension candidates:
- `lament` | Jer 8:21-22 | "For the hurt of the daughter of my people, I am hurt. I mourn." | w=0.75 (with 8:22's "Is there no balm in Gilead? Is there no physician there?" inside the range; pack's Jeremiah anchor today is 10:19-20 only)
- `false-prophets` | Jer 8:11 | "saying, “Peace, peace,” when there is no peace" | w=0.6 (duplicate phrasing of 6:14 — curator should take one of the two, not both)
Lexicon candidates: None (the balm-in-Gilead phrase was weighed and left as the book doc's motif entry — its query family splits between comfort and healing registers with no XOR-clean single target).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). Book-doc Decisions #21 (`pastoral-grief-and-loss` removed, national register, routed to the live `lament` row) re-affirmed.

## Jeremiah 9

Existing tags (book doc): `taming-the-tongue`, `divine-judgment`, `lament`, `knowing-god`, `hardness-of-heart`, `mortality`
Applied-tag deltas:
- KEEP all 6 — `taming-the-tongue` (9:3, 8), `divine-judgment` (9:7, 16), `lament` (9:1, 17–21), `knowing-god` (9:23–24; the pack already anchors Jeremiah 9:23-24 at w=0.9), `hardness-of-heart` (9:26), `mortality` (9:21–22). No adds — chapter at the soft cap; `testing` at 9:7 ("I will melt them and test them") is a single clause inside the judgment sentence, below the bar (consistent with book-doc #65).
Anchor-extension candidates:
- `taming-the-tongue` | Jer 9:3-8 | "They bend their tongue, as their bow, for falsehood" ... "Their tongue is a deadly arrow. It speaks deceit." | w=0.7 (pack has no Jeremiah anchor; sustained OT tongue text)
- `mortality` | Jer 9:21 | "For death has come up into our windows." | w=0.55 (the book doc's live-row append stages 9:21–22)
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 (existing); not subdivided in book doc.
Decisions record: ROUTED, not duplicated — the uncircumcised-heart material (9:26 "all the house of Israel are uncircumcised in heart") is already on the corpus-blocked roster, row 37 (`circumcision-of-the-heart`; its deferral note names the Jer 9:26 routing); routed to the expansion thread's queue.

## Jeremiah 10 (subdivided: 10:1–16, 10:17–25)

Existing tags (book doc): `worship`, `creation`, `divine-judgment`, `guidance`, `the-lords-discipline`, `idolatry`, `occult-and-divination`
Applied-tag deltas:
- KEEP all 7 — `worship` (10:6–7, 10), `creation` (10:12, 16; pack anchors Jeremiah 10:12), `divine-judgment` (10:18, 22), `guidance` (10:23; book-doc #50's thin-presence flag noted, keep re-affirmed — the dependence confession is the concept's substance stated as prayer), `the-lords-discipline` (10:24), `idolatry` (10:3–5, 8–9, 14–15; pack anchors Jeremiah 10:3-5), `occult-and-divination` (10:2). No adds — chapter at 7; any add would land on the hard ceiling and nothing outranks the existing set.
Anchor-extension candidates:
- `guidance` | Jer 10:23 | "LORD, I know that the way of man is not in himself. It is not in man who walks to direct his steps." | w=0.6 (pack has no Jeremiah anchor; heavy query verse for direct-my-steps phrasings)
- `the-lords-discipline` | Jer 10:24 | "LORD, correct me, but gently; not in your anger, lest you reduce me to nothing." | w=0.6 (pack today has only Hebrews 12:7-11 and Revelation 3:19 — the asked-for-gentle-correction register is unserved)
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: 7 tags (above soft cap, each independently cleared at the 2026-08-25 pass); subdivided in book doc — mark for per-verse refinement pass.
Decisions record: Re-affirmed prior yields, no new drops: `lament` (10:19–20 — the pack's own anchor) stays yielded per book-doc #86(d) (adding would hit the ceiling; lament homed on chs 4, 8, 9); `fear-of-the-lord` (10:7, single clause in the doxology) and `god-reigns`/`no-other-god` (10:6–7, 10 are `worship`'s entire anchor — same-verse restatement, #86(b)) stay off.

## Jeremiah 11 (subdivided: 11:1–17, 11:18–23)

Existing tags (book doc): `covenant`, `obedience-to-the-word`, `divine-judgment`, `gods-protection`
Applied-tag deltas:
- KEEP all 4 — `covenant` (11:3–4, 10), `obedience-to-the-word` (11:4, 7), `divine-judgment` (11:11, 23), `gods-protection` (11:18, 21–23).
- ADD `persecuted-for-gods-word` (adopted list — engine-built: no; in use on jeremiah.md chs 18, 20, 26, 36–38 per Decisions #85) — the chapter's second BSB section is a persecution-for-the-word narrative: "the men of Anathoth, who seek your life, saying, ‘You shall not prophesy in the LORD’s name, that you not die by our hand’" (11:21), with the prophet "like a gentle lamb that is led to the slaughter" (11:19). The concept's substance (suffering for carrying God's message) is depicted across 11:18–23; ch 11 was not on the 2026-08-25 worklist, so this is a fresh candidate, not a reversal of a recorded skip. Chapter lands at 5.
Anchor-extension candidates:
- `covenant` | Jer 11:3-4 | "Cursed is the man who doesn’t hear the words of this covenant" | w=0.6 (pack's Jeremiah anchor today is 31:31-34 only; the Sinai-covenant recital adds the conditional register)
- `vengeance` | Jer 11:20 | "I will see your vengeance on them; for to you I have revealed my cause" | w=0.5 (vengeance-handed-to-God register, matching the pack's routing caveat; the book doc's live-row append stages 15:15; 18:21–23; 20:12 but not 11:20 — this ref completes the confessions' set)
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: ROUTED, not duplicated — engine-side, `persecuted-for-gods-word` is already on the corpus-blocked roster, row 4; finding routed to the expansion thread's queue with the NEW ref Jer 11:18–23 (the Anathoth plot), which the book doc's own proposal ref-list (15:15; 18:18; 20; 26; 36–38) does not carry. The display ADD above is display-layer only per §11.1.

## Jeremiah 12 (subdivided: 12:1–4, 12:5–13, 12:14–17)

Existing tags (book doc): `wrestling-with-god`, `divine-judgment`, `restoration`, `prosperity-of-the-wicked`
Applied-tag deltas:
- KEEP all 4 — `wrestling-with-god` (12:1, 5–6; book-doc #46's gist flag noted, keep re-affirmed), `divine-judgment` (12:12, 17), `restoration` (12:15–16), `prosperity-of-the-wicked` (12:1–4; the pack anchors Jeremiah 12:1 at w=0.8). No adds.
Anchor-extension candidates:
- `nations-and-peoples` | Jer 12:16 | "if they will diligently learn the ways of my people, to swear by my name" ... "then they will be built up in the middle of my people" | w=0.5 (nations-joining-Israel register; fits the pack's blessing-of-the-nations anchors)
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). `doubt` at 12:1–4 stays off per book-doc #32 (a trusting protest, not doubt) — re-affirmed. Cross-note for the curator: 12:14–17's built-up-among-my-people offer is an OT witness adjacent to corpus-blocked row 40 (`gentile-inclusion`, register decision deferred to re-pin); noted for that row's curator, not proposed as anything here.

## Jeremiah 13 (subdivided: 13:1–11, 13:12–14, 13:15–27)

Existing tags (book doc): `humble-exaltation`, `sin`, `divine-judgment`
Applied-tag deltas:
- KEEP all 3 — `humble-exaltation` (13:9, 15, 18), `sin` (13:23), `divine-judgment` (13:14, 24). No adds — honest-and-empty beyond these three; the belt and wine-container sign-acts carry no additional concept's teaching substance, and 13:13's drunkenness stays declined (judgment imagery, not the practice — §3.5 Jeremiah decline, re-affirmed against the full text).
Anchor-extension candidates:
- `humble-exaltation` | Jer 13:15-18 | "Don’t be proud, for the LORD has spoken." | w=0.6 (the PR #41 routing sends plain pride queries to this pack, which has no Jeremiah anchor; 13:9's "I will ruin the pride of Judah, and the great pride of Jerusalem" sits in the range)
Lexicon candidates:
- `hardness-of-heart` | term: can a leopard change its spots | queries: can a leopard change its spots bible verse / can people really change / am I too far gone to change — anchor text 13:23 "Can the Ethiopian change his skin, or the leopard his spots?"; XOR caveat for the curator: the hopeful register of the same query family belongs to `new-creation` — decide the single target before adding the row (book-doc motif list stages the same phrase).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields).

## Jeremiah 14

Existing tags (book doc): `divine-judgment`, `sin`, `prayer`, `hope-in-god`, `false-prophets`
Applied-tag deltas:
- KEEP all 5 — `divine-judgment` (14:12, 15–16), `sin` (14:7, 20), `prayer` (14:7–9, 19–22 with the 14:11 prohibition; book-doc #45's borderline flag noted, keep re-affirmed), `hope-in-god` (14:8, 22), `false-prophets` (14:13–16).
- ADD `unanswered-prayer` (engine id; also adopted list, engine-built: yes) — the chapter is the canonical depiction of prayer shut out: "Don’t pray for this people for their good." (14:11) and "When they fast, I will not hear their cry" (14:12), against the people's own double plea (14:7–9, 19–22). The pack's register already includes the shut-out side (its anchors Lamentations 3:8 and 3:44 are this exact register), so the depicted refusal is the concept's teaching substance, not a mere failure scene; not a pastoral-* pack, so the register ruling does not apply. Chapter lands at 6 (soft cap).
Anchor-extension candidates:
- `unanswered-prayer` | Jer 14:11-12 | "When they fast, I will not hear their cry" | w=0.7 — cross-note: corpus-blocked row 10 (`famine-of-hearing-gods-word`) defers a word-withheld vs prayer-shut-out lexicon-routing decision (the Lamentations cross-note); this candidate should be decided with that row's settlement, not before it.
- `false-prophets` | Jer 14:14 | "The prophets prophesy lies in my name. I didn’t send them." | w=0.8 (pack's Deuteronomy 18:21-22 test register meets its narrative counterpart; no Jeremiah anchor today)
- `hope-in-god` | Jer 14:8 | "You hope of Israel, its Savior in the time of trouble" | w=0.55
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 reached after the add; not subdivided in book doc.
Decisions record: None (no yields). Drought/famine material (14:1–6) stays routed to the PR #41 `gods-provision` lexicon extension per the §3.5 Jeremiah decline — re-affirmed, no tag (provision-withheld would be dishonest presence). `doubt` at 14:8–9, 19 stays off per book-doc #33 — re-affirmed.

## Jeremiah 15 (subdivided: 15:1–9, 15:10–18, 15:19–21)

Existing tags (book doc): `divine-judgment`, `wrestling-with-god`, `delight-in-the-word`, `doubt`, `pastoral-god-sees-my-suffering`, `gods-protection`
Applied-tag deltas:
- KEEP all 6 — `divine-judgment` (15:1–3), `wrestling-with-god` (15:10, 19), `delight-in-the-word` (15:16), `doubt` (15:18; Jesse-ratified 2026-08-25, book-doc #27), `pastoral-god-sees-my-suffering` (15:15; the confessions are the personal-crisis register the pastoral ruling protects — book-doc #23, preserved; id source: in use on jeremiah.md ch 15's Tags line, the pre-§11.1 display form CONVENTIONS §5 itself exemplifies — engine counterpart `god-sees-my-suffering` in the 239 census), `gods-protection` (15:20–21). No adds — chapter at the soft cap; the confessions' remaining registers are carried (see yields below).
Anchor-extension candidates:
- `delight-in-the-word` | Jer 15:16 | "Your words were found, and I ate them. Your words were to me a joy and the rejoicing of my heart" | w=0.8 (pack has three anchors, none prophetic; this is the register's strongest OT narrative text)
- `doubt` | Jer 15:18 | "Will you indeed be to me as a deceitful brook, like waters that fail?" | w=0.6 (pack has only Mark 9:23-24 and James 1:5-6; a believer's voiced doubt answered by God at 15:19)
Lexicon candidates:
- `delight-in-the-word` | term: I ate your words | queries: your words were found and I ate them meaning / eating God's word / devouring scripture
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 (existing); subdivided in book doc — mark for per-verse refinement pass.
Decisions record: Re-affirmed prior yields, no new drops: `lament` on the confessions stays yielded per book-doc #86(d) (the log row's own boundary note: `wrestling-with-god` / `doubt` / the kept pastoral tags carry 15:10–18); `persecuted-for-gods-word` stays off per #86(b) (15:15 is `pastoral-god-sees-my-suffering`'s entire anchor — same-verse restatement). ROUTED, not duplicated — engine-side persecution finding (15:15 "Remember me, visit me, and avenge me of my persecutors") is corpus-blocked roster row 4 material; the ref is already in that proposal's list. Also noted for the roster: 15:20–21 ("I am with you to save you and to deliver you" ... "I will deliver you out of the hand of the wicked") is rescue-register material adjacent to row 32 (`deliverance`); routed as a note to that row's queue, not proposed here.

## Jeremiah 16 (subdivided: 16:1–13, 16:14–21)

Existing tags (book doc): `divine-judgment`, `restoration`, `refuge-in-trouble`, `nations-and-peoples`
Applied-tag deltas:
- KEEP all 4 — `divine-judgment` (16:4, 13, 18), `restoration` (16:14–15), `refuge-in-trouble` (16:19), `nations-and-peoples` (16:19–21).
- ADD `restoration-of-israel` (engine id; also adopted list, engine-built: yes) — the chapter's second BSB section is the regathering promise in God's own words: "I will bring them again into their land that I gave to their fathers." (16:15), framed as the new-exodus oath (16:14–15) — exactly the pack's substance (its anchors are the same register: Jer 31:8-11, 29:14). Applied alongside `restoration` per the both-tags ruling (§11.2); cross-note: the Isaiah-block `restoration`-register TENSION (§1(e)) is left to the curator — this add takes no side, it applies the national pack to a national text. Chapter lands at 5.
Anchor-extension candidates:
- `restoration-of-israel` | Jer 16:14-15 | "I will bring them again into their land that I gave to their fathers." | w=0.7 (pack has Jeremiah 29 and 31 anchors; 16:14–15 adds the new-exodus-oath framing)
- `refuge-in-trouble` | Jer 16:19 | "LORD, my strength, my stronghold, and my refuge in the day of affliction" | w=0.65 (pack has no Jeremiah anchor)
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). `singleness` considered for 16:2 ("You shall not take a wife") and rejected — a prophetic sign-act commanded for one man as a judgment portent, not the concept's teaching substance; recorded so the call is visible.

## Jeremiah 17 (subdivided: 17:1–11, 17:12–18, 17:19–27)

Existing tags (book doc): `sin`, `trust-in-god`, `self-deception`, `sabbath-rest`
Applied-tag deltas:
- KEEP all 4 — `sin` (17:1, 3–4), `trust-in-god` (17:7–8), `self-deception` (17:9–10), `sabbath-rest` (17:21–27).
- ADD `trusting-in-man` (engine id; also adopted list, engine-built: yes) — the chapter is the pack's minting text: its keystone anchor is Jeremiah 17:5-6 at w=1.0, and the substance is stated in God's own words: "Cursed is the man who trusts in man, relies on strength of flesh, and whose heart departs from the LORD." (17:5). The book doc tags only the blessed half (`trust-in-god`, 17:7–8); both halves genuinely apply — both-tags ruling (§11.2).
- ADD `living-water` (engine id; also adopted list, engine-built: yes) — the pack's own anchor Jeremiah 17:13 (w=0.9) is in-chapter, stating the concept's substance: "they have forsaken the LORD, the spring of living waters" (17:13). Same ground as the ch 2 add. Chapter lands at 6 (soft cap).
Anchor-extension candidates:
- `self-deception` | Jer 17:9-10 | "The heart is deceitful above all things and it is exceedingly corrupt. Who can know it?" | w=0.85 (no pack in the 239 census anchors 17:9 — a heavy gap: the verse is the query family's signature text, with 17:10's "I, the LORD, search the mind. I try the heart" completing it)
- `trust-in-god` | Jer 17:7-8 | "Blessed is the man who trusts in the LORD, and whose confidence is in the LORD." | w=0.8 (pack has no Jeremiah anchor; the tree-planted-by-waters text pairs with its Proverbs 3:5-6 keystone)
- `sabbath-rest` | Jer 17:21-22 | "make the Sabbath day holy, as I commanded your fathers" | w=0.6 (pack has no prophetic anchor; the gates oracle adds the city's-future stakes register)
Lexicon candidates:
- `self-deception` | term: the heart is deceitful above all things | queries: the heart is deceitful above all things meaning / can I trust my heart / follow your heart bible (book-doc motif list stages the same phrase)
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: soft cap 6 reached after the adds; subdivided in book doc — mark for per-verse refinement pass.
Decisions record: None (no yields). Consistency flag for the curator (not an overturn): book-doc Decisions #63 declines `pastoral-prayer-for-healing` on this chapter (17:14 "Heal me, O LORD, and I will be healed. Save me, and I will be saved" — in-context persecution-anguish, not sickness), while the engine pack `prayer-for-healing` anchors Jeremiah 17:14 at w=0.8. The display decline and the engine anchor disagree about the verse's register; flagged for the pack curator to resolve at curation time — the display decline is left standing here (no new textual evidence; the in-context reading holds: 17:15–18 is the persecutors' taunt and the prophet's plea against them).

### Chapters 18–34 (chunk: jeremiah-18-34.md, self-verified; independently re-verified at assembly)

## Jeremiah 18 (subdivided: 18:1–17 / 18:18–23)

1. Existing tags (book doc): `providence`, `repentance`, `divine-judgment`, `god-relents`, `persecuted-for-gods-word` (5)
2. Applied-tag deltas: No changes. KEEP `providence` (potter over the clay applied to nations, 18:6–10); KEEP `repentance` (the return-now plea, 18:8, 11); KEEP `divine-judgment` (scattering as with an east wind, 18:15–17); KEEP `god-relents` (adopted id, canonical §11.1 list, engine-built: no; 18:7–10 is the concept's defining statement); KEEP `persecuted-for-gods-word` (adopted id, canonical §11.1 list, engine-built: no; the plot of 18:18–23).
3. Anchor-extension candidates:
   - `providence` | Jer 18:6 | "as the clay in the potter’s hand, so are you in my hand, house of Israel" | w=0.8. The pack has no potter/clay anchor and its lexicon carries no potter vocabulary; this is the OT's governance-over-nations statement of the image. Curator caution: keep the gist on God's freedom over nations — Rom 9:21's potter belongs to `election-and-predestination` territory; do not blur the registers.
4. Lexicon candidates:
   - `providence` | 'the potter and the clay' | queries: 'God is the potter we are the clay', 'potter and clay meaning in the bible', 'can God remake me'. (Anchor above supplies the in-corpus text; Isa 64:8 is the other classic phrasing, outside this book.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (18:1–17 / 18:18–23) — mark for per-verse refinement. 5 tags, under the soft cap.
8. Decisions record:
   - `god-relents` findings (18:7–10, "if that nation, concerning which I have spoken, turns from their evil, I will repent of the evil that I thought to do to them", 18:8) — already on corpus-blocked roster, row 7 (Jer 18:7–10 is that row's named blocking ref). ROUTED to the expansion thread's queue; no engine candidate emitted here.
   - `persecuted-for-gods-word` findings (18:18, "Come, and let’s strike him with the tongue") — already on corpus-blocked roster, row 4. ROUTED; no duplicate candidate.
   - `hardness-of-heart` considered, not added: 18:12's stubbornness-of-heart clause is a single verse inside the people's refusal; below the substantial-presence bar (consistent with the book doc's item-86 skip pattern).
   - `vengeance` considered, not added: 18:19–23 depicts an imprecatory prayer handing the cause to God, but the chapter never states the vengeance-belongs-to-God teaching the pack carries; the tag-gaps `vengeance` append already logs 18:21–23 — nothing new to log.

## Jeremiah 19

1. Existing tags (book doc): `divine-judgment`, `sin`, `idolatry` (3)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (the smashed jar, 19:10–11); KEEP `sin` (the charge sheet, 19:4–5); KEEP `idolatry` (Topheth's practice itemized, 19:4–5, 13). All three honestly present; nothing else in the current vocabulary clears the bar.
3. Anchor-extension candidates:
   - `idolatry` | Jer 19:4-5 | "built the high places of Baal to burn their children in the fire for burnt offerings to Baal" | w=0.6. The pack anchors no child-sacrifice text; this and Jer 32:35 (see ch 32) would let 'child sacrifice' queries land on the passages that indict it.
4. Lexicon candidates:
   - `idolatry` | 'child sacrifice' | queries: 'child sacrifice in the bible', 'who was molech in the bible', 'did israel sacrifice children'. (No pack's lexicon carries this vocabulary today.)
   - `hardness-of-heart` | 'stiff-necked' | queries: 'stiff-necked meaning in the bible', 'what does stiff-necked mean'. In-book witness 19:15 — "they have made their neck stiff, that they may not hear my words"; the classic stiff-necked anchors (Exod 32–33) already sit in that pack's neighborhood, so this is lexicon-only.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (not subdivided; 3 tags).
8. Decisions record:
   - `hardness-of-heart` considered as a display tag, not added: 19:15 is one closing verse; below the bar.

## Jeremiah 20 (subdivided: 20:1–6 / 20:7–18)

1. Existing tags (book doc): `wrestling-with-god`, `doubt`, `pastoral-god-sees-my-suffering`, `gods-protection`, `pastoral-hope-in-despair`, `divine-judgment`, `persecuted-for-gods-word`, `power-of-gods-word` (8 — at the hard ceiling)
2. Applied-tag deltas: No changes. All 8 KEEP — each was individually argued in the book doc (the two pastoral tags are the personal-crisis register's anchor case in this book, kept under the pastoral-register ruling; `doubt` ratified by Jesse 2026-08-25; `persecuted-for-gods-word` and the ceiling call documented in the doc's item 85). No candidate found that outranks a present tag.
3. Anchor-extension candidates:
   - `power-of-gods-word` | Jer 20:9 | "a burning fire shut up in my bones. I am weary with holding it in. I can’t." | w=0.75. The pack's anchors are all word-endures/word-effective texts; this is the word-irresistible witness and a heavily searched phrase.
   - `god-sees-my-suffering` (engine id; display `pastoral-god-sees-my-suffering`) | Jer 20:12 | "who tests the righteous, who sees the heart and the mind" + "for I have revealed my cause to you" | w=0.6. Pastoral pack — curation note: this pack is harm-gate curated (its fixture asserts dangerous near-misses never rank); propose only through that gauntlet.
4. Lexicon candidates:
   - `power-of-gods-word` | 'fire shut up in my bones' | queries: 'fire shut up in my bones meaning', 'compelled to preach the word', 'cant stop speaking about god'.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING (8 tags, per book doc item 85) AND subdivided (20:1–6 / 20:7–18) — mark for per-verse refinement. Refinement suggestion: the two halves split cleanly — 20:1–6 carries `divine-judgment` + `persecuted-for-gods-word`; 20:7–18 carries the confession tags.
8. Decisions record:
   - `persecuted-for-gods-word` findings (20:1–2, "Then Pashhur struck Jeremiah the prophet and put him in the stocks"; mockery 20:7–10) — already on corpus-blocked roster, row 4 (Jer 20 is a named blocking ref there). ROUTED.
   - `praise` considered, not added: 20:13 is a single verse of doxology inside the lament swing; below the bar, and the chapter is at ceiling.
   - `vengeance` considered, not added: 20:12's avenge clause is one clause; the tag-gaps `vengeance` append already logs 20:12.

## Jeremiah 21 (subdivided: 21:1–10 / 21:11–14)

1. Existing tags (book doc): `divine-judgment`, `justice-and-oppression` (2)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (God himself fighting against the city, 21:5–7, 10); KEEP `justice-and-oppression` (the standing charge to David's house, 21:12). Honest-and-thin is correct here; the way-of-life-and-death word (21:8–9) is logged as a motif in the book doc and no concept in the current vocabulary carries it without a read-back.
3. Anchor-extension candidates: None. (21:12's justice charge is the same royal-duty material as 22:3, where the fuller statement lives — one candidate emitted there, not two.)
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (21:1–10 / 21:11–14) — mark for per-verse refinement.
8. Decisions record: nothing yielded; nothing routed.

## Jeremiah 22 (subdivided: 22:1–5 / 22:6–9 / 22:10–12 / 22:13–23 / 22:24–30)

1. Existing tags (book doc): `divine-judgment`, `justice-and-oppression`, `knowing-god` (3)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (three royal sentences, 22:11–12, 18–19, 24–30); KEEP `justice-and-oppression` (throne's terms of tenure, 22:3, 13); KEEP `knowing-god` (Josiah's practice as knowing God, 22:15–16).
3. Anchor-extension candidates:
   - `justice-and-oppression` | Jer 22:3 | "Execute justice and righteousness, and deliver him who is robbed out of the hand of the oppressor" | w=0.75. The pack has Isaiah's corrupt-rulers texts but no royal-duty command; this is the positive charge form.
   - `knowing-god` | Jer 22:15-16 | "He judged the cause of the poor and needy; so then it was well. Wasn’t this to know me?" | w=0.7. The pack anchors Jer 31:34 and 9:23–24 but not this knowing-God-defined-by-practice text (the tag-gaps knowing-god append already lists it; carried here as the engine-side candidate).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (five sections) — mark for per-verse refinement.
8. Decisions record:
   - `covetousness` considered, not added: 22:17 names covetous eyes and heart in one verse of the Jehoiakim woe; below the bar.
   - `care-for-widows` considered, not added: 22:3's widow/fatherless clause is a list item inside the justice charge (the book doc's item-86 call, reaffirmed); the ref already rides the tag-gaps care-for-widows append.

## Jeremiah 23 (subdivided: 23:1–8 / 23:9–32 / 23:33–40)

1. Existing tags (book doc): `divine-judgment`, `restoration`, `self-deception`, `presence-of-god`, `false-prophets`, `power-of-gods-word`, `the-branch` (7)
2. Applied-tag deltas:
   - ADD `shepherds-and-the-flock` (engine id) — the chapter opens with Scripture's sharpest bad-shepherds oracle and its reversal: "Woe to the shepherds who destroy and scatter the sheep of my pasture!" (23:1) and "I will set up shepherds over them who will feed them." (23:4). This is the shepherd-as-leader register the pack collects (its anchors include Ezek 34:11–16, Acts 20:28–31, 1 Pet 5:2–3), not literal husbandry; four verses of teaching substance. Chapter lands at 8.
   - KEEP the existing 7 unchanged (`the-branch` is an adopted id, canonical §11.1 list, engine-built: no; the messianic reading stays a signposted historic reading, adjudicating nothing).
3. Anchor-extension candidates:
   - `shepherds-and-the-flock` | Jer 23:1-4 | "Woe to the shepherds who destroy and scatter the sheep of my pasture!" | w=0.75. Completes the bad-shepherds set beside the pack's Ezek 34 anchor. Cross-note: the corpus-blocked roster's addendum lists the bad-shepherds register as a question that reopens at the re-pin — this candidate feeds that reopening, not a new pack.
   - `messianic-prophecy` | Jer 23:5-6 | "I will raise to David a righteous Branch" + the name "The LORD our righteousness" | w=0.9. The pack anchors Jer 33:14–16 (the restatement) but not this first Branch text; its lexicon already carries 'the branch prophecy'. Descriptive gist only — the tag-line rule (source names the passage, no adjudication) applies.
   - `false-prophets` | Jer 23:16 | "They speak a vision of their own heart, and not out of the mouth of the LORD" | w=0.9; supporting range 23:21–22 ("I didn’t send these prophets, yet they ran. I didn’t speak to them, yet they prophesied.") and the dream material 23:25–28. The pack has zero Jeremiah anchors although this book is Scripture's most sustained treatment (the book doc says exactly this).
   - `presence-of-god` | Jer 23:23-24 | "Can anyone hide himself in secret places so that I can’t see him?" + "Don’t I fill heaven and earth?" | w=0.7. Register caution (matches book doc Decisions item 47): this is omnipresence-as-warning; the pack's lexicon is nearness/comfort — the curator should decide whether the pack spans both registers before taking the anchor.
4. Lexicon candidates:
   - `shepherds-and-the-flock` | 'bad shepherds' + 'woe to the shepherds' | queries: 'woe to the shepherds who scatter the flock', 'bad shepherds in the bible', 'what does the bible say about bad pastors'.
   - `presence-of-god` | 'can anyone hide from god' | queries: 'can you hide from god', 'god fills heaven and earth meaning', 'omnipresence of god in the bible'. (Only if the register decision above admits the warning side.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING — lands at 8 with the add — AND subdivided (23:1–8 / 23:9–32 / 23:33–40) — mark for per-verse refinement. Refinement suggestion: 23:1–8 carries `shepherds-and-the-flock`, `restoration`, `the-branch`; 23:9–32 the prophet material; 23:33–40 the message-formula ban (`divine-judgment`).
8. Decisions record:
   - Ceiling reached at 8 with every tag independently clearing the bar; no yield required (8 is the permitted ceiling), none taken.
   - `remnant` stays off the chapter (book doc item 86(b) reaffirmed: 23:3 sits inside `restoration`'s justification) — and the engine `remnant` pack already anchors Jer 23:3-4, so no engine candidate is due either.
   - `dreams-and-visions` considered, not added: 23:25–28 condemns lying dreams; the pack's register is God speaking through dreams — tagging the counterfeit would invert it. Routed into the `false-prophets` anchor candidate instead.

## Jeremiah 24

1. Existing tags (book doc): `restoration`, `divine-judgment`, `providence`, `knowing-god` (4)
2. Applied-tag deltas: No changes. KEEP `restoration` (24:6–7 build-and-plant pledge); KEEP `divine-judgment` (bad figs given up, 24:8–10); KEEP `providence` (deportation claimed as God's own act for good, 24:5); KEEP `knowing-god` (heart to know me, 24:7).
3. Anchor-extension candidates:
   - `knowing-god` | Jer 24:7 | "I will give them a heart to know me, that I am the LORD" | w=0.8. The pack lacks this given-heart text (its Jeremiah anchors are 31:34 and 9:23–24).
   - `restoration-of-israel` | Jer 24:5-7 | "I will bring them again to this land. I will build them, and not pull them down. I will plant them, and not pluck them up." | w=0.75. The pack anchors Jer 29:14 and 31:8–11; the good-figs return pledge is the same register from the deportation side.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (not subdivided; 4 tags).
8. Decisions record:
   - `restoration-of-israel` considered as a display tag, not added: 24:5–7 is the same-verse substance of the existing `restoration` + `providence` + `knowing-god` justifications (book doc item 86(b) same-verse precedent); emitted as the engine anchor candidate above instead.
   - `remnant` stays off (book doc item 86(b): the chapter's own remnant vocabulary attaches to the bad figs, 24:8) — reaffirmed against the full text.

## Jeremiah 25 (subdivided: 25:1–14 / 25:15–33 / 25:34–38)

1. Existing tags (book doc): `divine-judgment`, `repentance`, `nations-and-peoples` (3)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (the cup pressed on every nation, 25:15–29); KEEP `repentance` (the twenty-three-year spurned call, 25:3–6); KEEP `nations-and-peoples` (all the kingdoms of the world in view, 25:17–26).
3. Anchor-extension candidates:
   - `divine-judgment` | Jer 25:15-17 | "Take this cup of the wine of wrath from my hand, and cause all the nations to whom I send you to drink it." | w=0.65; supporting 25:31 ("the LORD has a controversy with the nations. He will enter into judgment with all flesh"). The pack has no cup-of-wrath text; the image is heavily searched and links forward canonically.
4. Lexicon candidates:
   - `divine-judgment` | 'the cup of god's wrath' | queries: 'cup of gods wrath meaning', 'cup of wrath in the bible', 'what is the cup of wrath'.
5. New-concept candidates: None.
6. Decline-overturn proposals: None. (`day-of-the-lord` at 25:30–33 re-checked against the full text: the phrase does not occur in the chapter — the recorded discretionary decline, book doc item 86(c), stands; no new evidence.)
7. Ceiling / refinement flags: subdivided in book doc (25:1–14 / 25:15–33 / 25:34–38) — mark for per-verse refinement.
8. Decisions record:
   - `shepherds-and-the-flock` considered, not added: 25:34–38's shepherds are doomed leaders addressed in judgment imagery ('wail, you shepherds'), not shepherd-office teaching; the ch 23 add is the honest home in this book.
   - `drunkenness` considered, not added: 25:27's drink-and-vomit command is judgment imagery, the same ground as the recorded 13:13 decline (drunkenness-as-imagery, not the practice); not an overturn, no new evidence.

## Jeremiah 26 (subdivided: 26:1–6 / 26:7–15 / 26:16–19 / 26:20–24)

1. Existing tags (book doc): `repentance`, `pleasing-god-not-people`, `divine-judgment`, `god-relents`, `persecuted-for-gods-word` (5)
2. Applied-tag deltas: No changes. KEEP `repentance` (the sermon's whole aim, 26:3, 13); KEEP `pleasing-god-not-people` (the whole message kept under death threat, 26:2, 14–15); KEEP `divine-judgment` (the Shiloh sentence, 26:6); KEEP `god-relents` (adopted id, canonical §11.1 list, engine-built: no; 26:13, 19); KEEP `persecuted-for-gods-word` (adopted id, canonical §11.1 list, engine-built: no; 26:8–15, 20–23).
3. Anchor-extension candidates:
   - `pleasing-god-not-people` | Jer 26:14-15 | "behold, I am in your hand. Do with me what is good and right in your eyes" | w=0.55. The pack is entirely NT-anchored; this is the OT narrative witness of a messenger refusing to trim God's word under threat.
4. Lexicon candidates:
   - `repentance` | 'amend your ways' | queries: 'amend your ways and your doings meaning', 'amend your ways bible verse'. In-book witness 26:13 ("amend your ways and your doings"); also 7:3 outside this chunk.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (four sections) — mark for per-verse refinement.
8. Decisions record:
   - `god-relents` findings (26:3, 13, and the elders' precedent 26:19 — "Didn’t he fear the LORD, and entreat the favor of the LORD, and the LORD relented of the disaster which he had pronounced against them?") — already on corpus-blocked roster, row 7 (Jer 26:3–19 is that row's named blocking ref). ROUTED.
   - `persecuted-for-gods-word` findings (26:8 "You shall surely die!", the trial, and Uriah's execution 26:20–23) — already on corpus-blocked roster, row 4 (Jer 26 is a named blocking ref). ROUTED.
   - Courage register: Jeremiah standing his ground at trial (26:12–15) is exactly the 'courage to do the right thing' register of corpus-blocked roster row 17 (whose recorded case is Esther/Nehemiah material). ROUTED as an additional in-book witness for that row's queue; no candidate minted here.
   - Intercession at 27-adjacent 26:19 (entreating the LORD's favor) stays routed to `prayer` per the Genesis thread's standing ruling; no overturn proposed.

## Jeremiah 27

1. Existing tags (book doc): `providence`, `divine-judgment`, `false-prophets` (3)
2. Applied-tag deltas: No changes. KEEP `providence` (kingdoms given to whom it seems right, 27:5–7); KEEP `divine-judgment` (sword, famine, pestilence on the yoke-refusers, 27:8); KEEP `false-prophets` (the standing don't-listen warning, 27:9–10, 14–16).
3. Anchor-extension candidates:
   - `providence` | Jer 27:5-6 | "I have made the earth, the men, and the animals that are on the surface of the earth by my great power and by my outstretched arm. I give it to whom it seems right to me." | w=0.75. The pack's God-rules-the-nations anchors are Psalms/Isaiah; this is the explicit Creator-therefore-disposer argument (its lexicon already carries 'god rules over the nations').
   - `occult-and-divination` | Jer 27:9 | "don’t listen to your prophets, to your diviners, to your dreams, to your soothsayers, or to your sorcerers" | w=0.6. The pack anchors Jer 10:2 and 29:8–9 but not this fullest Jeremiah list.
   - `false-prophets` | Jer 27:14-15 | "they prophesy falsely in my name" | w=0.7. Part of the Jeremiah anchor set this pack lacks (with 23:16 and 28:8–9).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None. (Intercession at 27:18 — "let them now make intercession to the LORD of Armies" — stays routed to `prayer` per the Genesis thread's ruling; re-checked, no overturn.)
7. Ceiling / refinement flags: none (not subdivided; 3 tags).
8. Decisions record:
   - `sovereignty-of-god` stays off this chapter per book doc item 86(b) (27:5–7 is `providence`'s entire justification); reaffirmed.

## Jeremiah 28

1. Existing tags (book doc): `divine-judgment`, `false-prophets` (2)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (Hananiah's sentence and death, 28:16–17); KEEP `false-prophets` (the book's clearest test case, 28:2–4, 9, 15). Honest-and-thin: the chapter is a single narrative collision and these two ids carry all of it.
3. Anchor-extension candidates:
   - `false-prophets` | Jer 28:8-9 | "As for the prophet who prophesies of peace, when the word of the prophet happens, then the prophet will be known, that the LORD has truly sent him." | w=0.85; supporting 28:15 ("The LORD has not sent you, but you make this people trust in a lie"). This is the narrative twin of the pack's Deut 18:21–22 fulfillment-test anchor; nothing in the pack serves 'how do you know a prophet is truly sent' phrasings from the OT narrative side.
4. Lexicon candidates: None. (Considered 'hananiah' as a term — name-lookup trivia, not pack-scale; not proposed.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (not subdivided; 2 tags).
8. Decisions record: nothing yielded; nothing routed.

## Jeremiah 29 (subdivided: 29:1–23 / 29:24–32)

1. Existing tags (book doc): `hope-in-god`, `praying-for-leaders`, `prayer`, `hunger-for-god`, `divine-judgment`, `sojourners-and-strangers`, `false-prophets` (7)
2. Applied-tag deltas: No changes; all 7 KEEP. The 29:11 guardrail is preserved untouched: the `hope-in-god` justification stays anchored to the seventy-year communal pledge ("thoughts of peace, and not of evil, to give you hope and a future" dated by 29:10 and answered by the return, 29:14) — no individual-guarantee framing introduced anywhere in this entry.
3. Anchor-extension candidates: None — deliberately empty. This chapter is already the most densely engine-anchored in the book: `sojourners-and-strangers` anchors Jer 29:4-6, `praying-for-leaders` Jer 29:7 (w=1.0), `occult-and-divination` Jer 29:8-9, `hope-in-god` Jer 29:11 (w=1.0), `seeking-god` Jer 29:12-13 (w=1.0), `restoration-of-israel` Jer 29:14. Every major teaching verse already has its engine home.
4. Lexicon candidates: None (the packs above already carry the chapter's famous phrasings, including 'I know the plans I have for you').
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (29:1–23 / 29:24–32) — mark for per-verse refinement.
8. Decisions record:
   - `restoration-of-israel` and `seeking-god` considered as display tags, not added: both are same-verse restatements of existing tags' justifications (29:10/14 inside `hope-in-god`; 29:12–13 split across `prayer` and `hunger-for-god`) — book doc item 86(b) precedent — and both packs already anchor those exact verses, so no engine candidate is due either.
   - `persecuted-for-gods-word` findings (Shemaiah's demand "that you should put him in the stocks and in shackles", 29:26, with the rebuke demand 29:27) — already on corpus-blocked roster, row 4. ROUTED as additional in-book refs for that row's queue (the row's named Jeremiah refs are chs 20/26/37–38; 29:24–32 extends the set).

## Jeremiah 30

1. Existing tags (book doc): `restoration`, `fear-not`, `the-lords-discipline`, `gods-protection`, `messianic-prophecy` (5)
2. Applied-tag deltas: No changes. KEEP `restoration` (captivity reversed, health restored, 30:3, 17–19); KEEP `fear-not` (30:10); KEEP `the-lords-discipline` (correction in measure, 30:11, 14–15); KEEP `gods-protection` (30:11, 16); KEEP `messianic-prophecy` (30:9, 21, signposted reading, adjudicating nothing).
3. Anchor-extension candidates:
   - `the-lords-discipline` | Jer 30:11 | "I will correct you in measure, and will in no way leave you unpunished" | w=0.7. The pack holds only Heb 12:7–11 and Rev 3:19; this is the OT covenant-chastening witness (with Jer 31:18 below).
   - `restoration-of-israel` | Jer 30:3 | "I will reverse the captivity of my people Israel and Judah" | w=0.8. The pack lacks the book-of-comfort's opening thesis verse.
   - `messianic-prophecy` | Jer 30:9 | "they will serve the LORD their God, and David their king, whom I will raise up to them" | w=0.6. Descriptive gist only (raised-up David text; the tag-gaps messianic-promise append already lists it — carried here as the engine-side candidate).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None. (30:7's great day — "that day is great, so that none is like it" — re-checked for `day-of-the-lord`: the phrase itself is absent; the Habakkuk adjacent-not-same precedent applies, no proposal.)
7. Ceiling / refinement flags: none (not subdivided; 5 tags).
8. Decisions record:
   - `restoration-of-israel` considered as a display tag, not added: 30:3 and 30:18 sit inside `restoration`'s justification and 30:10 inside `fear-not`'s (item 86(b) same-verse precedent); engine candidate emitted instead.
   - `prayer-for-healing` considered, not added: 30:17 ("I will restore health to you, and I will heal you of your wounds") addresses the nation's wound in a judgment-and-restoration oracle, not the pastoral sickness register that pack serves; noted for the curator only.

## Jeremiah 31 (subdivided: 31:1–25 / 31:26–40)

1. Existing tags (book doc): `covenant`, `gods-love`, `forgiveness-of-sins`, `repentance`, `restoration`, `hope-in-god`, `knowing-god` (7)
2. Applied-tag deltas:
   - ADD `individual-responsibility` (engine id; the pack's own anchor is Jer 31:29-30, w=0.9) — the chapter states the principle in its own words: the proverb "The fathers have eaten sour grapes, and the children’s teeth are set on edge." will be said no more, "But everyone will die for his own iniquity. Every man who eats the sour grapes, his teeth will be set on edge." (31:29–30). Two verses that ARE the concept's defining OT text alongside Ezek 18; honest substantial presence.
   - ADD `restoration-of-israel` (engine id; the pack's w=1.0 anchor is Jer 31:8-11) — distinct verses from `restoration`'s justification (31:4, 13, 25): "Behold, I will bring them from the north country, and gather them from the uttermost parts of the earth" (31:8) and "He who scattered Israel will gather him, and keep him, as a shepherd does his flock." (31:10). The regathering-of-Israel register in its defining chapter; both-tags ruling (§11.2) applies beside `restoration`.
   - DROP `hope-in-god` (yield — see Decisions record). Chapter lands at 8.
   - KEEP the other six unchanged.
3. Anchor-extension candidates:
   - `forgiveness-of-sins` | Jer 31:34 | "for I will forgive their iniquity, and I will remember their sin no more" | w=0.85. The pack's large anchor set has no new-covenant text; 'remember their sin no more' phrasings currently have no engine home.
   - `repentance` | Jer 31:18-19 | "Turn me, and I will be turned, for you are the LORD my God" + "Surely after that I was turned. I repented." | w=0.75. The pack has no Jeremiah anchor; Ephraim's prayer is the OT's model turn-me text and the WEB uses the pack's own vocabulary ('I repented').
   - `the-lords-discipline` | Jer 31:18 | "You have chastised me, and I was chastised, as an untrained calf" | w=0.65. Discipline received and bearing fruit — pairs with the Jer 30:11 candidate.
   - `rest-for-the-weary` | Jer 31:25 | "For I have satiated the weary soul, and I have replenished every sorrowful soul." | w=0.6. The pack's anchors are all invitation texts; this is the promise-fulfilled form, and 'weary' is already in its lexicon.
4. Lexicon candidates:
   - `covenant` | 'write my law on their hearts' | queries: 'god will write his law on our hearts', 'law written on the heart new covenant', 'new covenant in the old testament'. COLLISION WARNING for the curator: `conscience` already owns the near-identical Rom 2:15 phrase 'law written on their hearts' — any covenant lexicon row must XOR against that pack or the two registers (innate moral law vs new-covenant promise) will cross-route. The anchor (Jer 31:31-34) is already covenant's w=1.0, so this is lexicon-only.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: HARD CEILING — lands at 8 after the two adds and one yield — AND subdivided (31:1–25 / 31:26–40) — mark for per-verse refinement. Refinement suggestion: 31:1–25 carries `gods-love`, `restoration`, `restoration-of-israel`, `repentance`; 31:26–40 carries `covenant`, `forgiveness-of-sins`, `knowing-god`, `individual-responsibility`.
8. Decisions record:
   - YIELD (no silent drop): with nine honest candidates the §11.6 order forces one out. No cross-ref-class or theme-witness-with-caveat tags present; the thin-single-verse class contains `hope-in-god`, whose entire in-chapter justification is 31:17 ("There is hope for your latter end") — the book doc's own item 48 already named this chapter's thinnest tags. Its substance (hope of the children's return) is carried by `restoration-of-israel`'s regathering promise and `gods-love`'s everlasting-love ground. `hope-in-god` therefore yields; reversible by re-adding with 31:16–17 if Jesse prefers trimming a different tag (the alternative yield candidate under the same clause is `knowing-god`, single-verse 31:34, but that verse is the new covenant's inmost clause and outranks on main-themes-first).
   - `backsliding` considered, not added: 31:22's backsliding-daughter clause is a single enigmatic verse (the book doc deliberately declines to interpret 31:22); the engine pack already carries Jer 31:22 as a w=0.5 anchor, so nothing is lost.
   - `pastoral-pregnancy-and-child-loss` / `pastoral-grief-and-loss` stay off Rachel's weeping (31:15–17) — book doc item 66 and the pastoral-register ruling reaffirmed: corporate figure for the exiled nation, personal-crisis register does not apply.

## Jeremiah 32 (subdivided: 32:1–15 / 32:16–25 / 32:26–35 / 32:36–44)

1. Existing tags (book doc): `trust-in-god`, `prayer`, `covenant`, `restoration`, `divine-judgment`, `sovereignty-of-god`, `idolatry` (7)
2. Applied-tag deltas: No changes; all 7 KEEP (`sovereignty-of-god` is an adopted id, canonical §11.1 list, engine-built: no; its substance is carried engine-side by `providence` — candidate below).
3. Anchor-extension candidates:
   - `providence` | Jer 32:27 | "Behold, I am the LORD, the God of all flesh. Is there anything too hard for me?" | w=0.7. The nothing-too-hard exchange (prayed at 32:17, answered at 32:27) has no engine home; `providence` is the nearest register (the adopted `sovereignty-of-god` id remains display-only).
   - `covenant` | Jer 32:40 | "I will make an everlasting covenant with them, that I will not turn away from following them, to do them good" | w=0.7. The pack anchors 31:31–34 but not the everlasting-covenant restatement.
   - `restoration-of-israel` | Jer 32:37 | "I will gather them out of all the countries where I have driven them in my anger" | w=0.8.
   - `idolatry` | Jer 32:35 | "to cause their sons and their daughters to pass through fire to Molech" | w=0.6. Pairs with the ch 19 candidate for 'child sacrifice' / Molech queries.
   - `gods-love` | Jer 32:41 | "Yes, I will rejoice over them to do them good, and I will plant them in this land assuredly with my whole heart and with my whole soul." | w=0.65. The pack's lexicon already carries 'god rejoices over you' but its only rejoice-anchor is Zeph 3:17; this is the with-whole-heart companion text.
4. Lexicon candidates:
   - `providence` | 'nothing is too hard for god' | queries: 'is anything too hard for god', 'nothing is impossible for god verse', 'is anything too hard for the lord'. (Gen 18:14 is the other classic witness, outside this book.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (four sections) — mark for per-verse refinement.
8. Decisions record:
   - `persecuted-for-gods-word` findings ("Jeremiah the prophet was shut up in the court of the guard", 32:2, for prophesying the city's fall, 32:3) — already on corpus-blocked roster, row 4. ROUTED as additional in-book refs (the row names chs 37–38; the court-of-the-guard imprisonment begins here).
   - `restoration-of-israel` considered as a display tag, not added: 32:37 sits inside `restoration`'s justification (item 86(b) same-verse precedent); engine candidate emitted instead.
   - `gods-love` considered as a display tag, not added: 32:41 is a single verse inside the restoration pledge; below the bar; engine candidate only.

## Jeremiah 33 (subdivided: 33:1–13 / 33:14–26)

1. Existing tags (book doc): `prayer`, `restoration`, `forgiveness-of-sins`, `covenant`, `gods-faithfulness`, `thanksgiving`, `the-branch` (7)
2. Applied-tag deltas: No changes; all 7 KEEP (`the-branch` is an adopted id, canonical §11.1 list, engine-built: no; the signposted-reading discipline stands).
3. Anchor-extension candidates:
   - `forgiveness-of-sins` | Jer 33:8 | "I will cleanse them from all their iniquity by which they have sinned against me. I will pardon all their iniquities" | w=0.8. Cleansing-and-pardon promise; pairs with the 31:34 candidate.
   - `gods-faithfulness` | Jer 33:19-21 | "If you can break my covenant of the day and my covenant of the night" | w=0.7; supporting 33:14 ("I will perform that good word which I have spoken"). The pack has no promise-staked-on-creation text; 'god keeps his promises' queries would gain their strongest OT guarantee image.
   - `thanksgiving` | Jer 33:11 | "Give thanks to the LORD of Armies, for the LORD is good, for his loving kindness endures forever" | w=0.6. The refrain's Jeremiah occurrence — restored worshipers taught the give-thanks formula.
   - `restoration-of-israel` | Jer 33:7 | "I will restore the fortunes of Judah and Israel, and will build them as at the first" | w=0.7.
4. Lexicon candidates:
   - `prayer` | 'call to me and i will answer' | queries: 'call to me and i will answer you meaning', 'god answers when we call', 'jeremiah 33 3 meaning'. The pack already anchors Jer 33:3 (w=0.65) — "Call to me, and I will answer you, and will show you great and difficult things, which you don’t know" — but its lexicon does not carry the phrase.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (33:1–13 / 33:14–26) — mark for per-verse refinement.
8. Decisions record:
   - `persecuted-for-gods-word` finding ("while he was still locked up in the court of the guard", 33:1) — already on corpus-blocked roster, row 4. ROUTED (continuation of the 32:2 imprisonment refs).
   - `messianic-prophecy` considered as a display add beside `the-branch`, not added: the engine pack already anchors Jer 33:14-16 at w=1.0 and the display substance is carried by `the-branch` on the same verses — a same-verse duplicate under item 86(b); no engine candidate due (already anchored).
   - `shepherds-and-the-flock` considered, not added: 33:12–13's shepherds are restored-pastureland imagery (flocks counted again), not shepherd-office teaching.

## Jeremiah 34 (subdivided: 34:1–7 / 34:8–22)

1. Existing tags (book doc): `divine-judgment`, `covenant`, `bondservants-and-masters`, `oaths-and-vows` (4)
2. Applied-tag deltas: No changes. KEEP `divine-judgment` (liberty proclaimed to the sword, 34:17–22); KEEP `covenant` (the temple covenant cut and profaned, 34:15–18); KEEP `bondservants-and-masters` (release enacted and revoked, 34:8–17 — the engine pack itself anchors Jer 34:8-17, w=0.75; recorded as the text records it, endorsing nothing); KEEP `oaths-and-vows` (the sworn rite violated, 34:15–19).
3. Anchor-extension candidates:
   - `oaths-and-vows` | Jer 34:15-18 | "when they cut the calf in two and passed between its parts" + "but you turned and profaned my name" | w=0.55. The pack's anchors are all teaching texts on swearing and keeping vows; this is the narrative witness of a broken sworn covenant and its cost. Alternative routing: the curator may prefer these verses on `covenant` — one home, not both.
4. Lexicon candidates:
   - `covenant` | 'cut a covenant' + 'covenant between the pieces' | queries: 'cutting a covenant meaning', 'covenant between the pieces', 'why did they cut animals in half in the bible'. The pack already anchors Gen 15:7-18 (the defining pieces text) and Jer 34:18 adds the second witness, so this is lexicon-only.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (34:1–7 / 34:8–22) — mark for per-verse refinement.
8. Decisions record:
   - `freedom-from-bondage` considered, not added: the chapter's liberty is literal manumission law, not the pack's addiction/sin-slavery register; tagging it would misroute crisis queries. `bondservants-and-masters` is the honest home and already holds the engine anchor.
   - No theology adjudicated: the slavery material is recorded as the text records it (the book doc's endorsing-nothing note preserved).

### Chapters 35–52 (chunk: jeremiah-35-52.md, self-verified; independently re-verified at assembly)

## Jeremiah 35
1. Existing tags (book doc): `obedience-to-the-word`, `divine-judgment`
2. Applied-tag deltas:
   - KEEP `obedience-to-the-word` — the chapter's whole object lesson: "Will you not receive instruction to listen to my words?" (35:13); the Rechabites "have obeyed the voice of Jonadab the son of Rechab, our father, in all that he commanded us" (35:8) while Judah "have not listened to me" (35:16).
   - KEEP `divine-judgment` — "Behold, I will bring on Judah and on all the inhabitants of Jerusalem all the evil that I have pronounced against them" (35:17).
   - No adds — swept against the full library: the Rechabites' generational fidelity is already logged as a motif ("keeping a family commitment"); `integrity` / `oaths-and-vows` checked and not present (a father's standing command, not an oath or a walk-in-integrity teaching); `caring-for-aging-parents` stays rejected per jeremiah.md Decisions #43. Honest as-is.
3. Anchor-extension candidates:
   - `obedience-to-the-word` | Jeremiah 35:13-16 | "but I have spoken to you, rising up early and speaking, and you have not listened to me" (35:14) | w=0.6 — the obey-a-man-vs-hear-God contrast is a distinctive OT witness for hear-and-obey queries; pack currently has no Jeremiah anchor.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in book doc).
8. Decisions record: None.

## Jeremiah 36 (subdivided: 36:1–10 / 36:11–19 / 36:20–26 / 36:27–32)
1. Existing tags (book doc): `divine-judgment`, `repentance`, `power-of-gods-word`, `persecuted-for-gods-word` (adopted id)
2. Applied-tag deltas:
   - KEEP `divine-judgment` — the burned scroll answered: "He will have no one to sit on David’s throne" (36:30).
   - KEEP `repentance` — the scroll's stated purpose: "that they may each return from his evil way; that I may forgive their iniquity and their sin" (36:3).
   - KEEP `power-of-gods-word` — the word outlasting the fire: "Take again another scroll, and write in it all the former words that were in the first scroll" (36:28), "and many similar words were added to them" (36:32).
   - KEEP `persecuted-for-gods-word` (adopted; §11.1 source cited in header) — "to arrest Baruch the scribe and Jeremiah the prophet; but the LORD hid them" (36:26).
   - No adds — `hardness-of-heart` considered for 36:24 ("were not afraid, and didn’t tear their garments") and declined: a depicted failure without the concept's stated teaching (Genesis-3 worked example).
3. Anchor-extension candidates:
   - `power-of-gods-word` | Jeremiah 36:27-32 | "Take again another scroll, and write in it all the former words that were in the first scroll" (36:28) | w=0.8 — the narrative enactment of indestructibility; the book doc already staged 36:23–32 for this concept's tag-gaps append; promoting to an engine anchor-extension candidate.
4. Lexicon candidates:
   - `power-of-gods-word` | "can gods word be destroyed" | queries: "can God's word be destroyed", "who burned the scroll in the Bible", "Jehoiakim burned Jeremiah's scroll".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (4 sections) — mark for per-verse refinement pass.
8. Decisions record: ROUTED — engine-side persecution findings (36:26 arrest order) go to the corpus-blocked roster's `persecuted-for-gods-word` backlog (already on corpus-blocked roster, row 4; that row names Jer 20/26/37–38 — 36:26 joins it). Not duplicated as a new candidate.

## Jeremiah 37
1. Existing tags (book doc): `self-deception`, `divine-judgment`, `persecuted-for-gods-word` (adopted id)
2. Applied-tag deltas:
   - KEEP `self-deception` — "Don’t deceive yourselves" (37:9): false hope in Egypt's relief column named for the illusion it is.
   - KEEP `divine-judgment` — the unchanged sentence to the king's face: "You will be delivered into the hand of the king of Babylon." (37:17).
   - KEEP `persecuted-for-gods-word` (adopted) — "The princes were angry with Jeremiah, and struck him, and put him in prison in the house of Jonathan the scribe" (37:15).
   - ADD `slander-and-false-accusation` (engine id) — the arrest, beating, and imprisonment all flow from a false charge: "You are defecting to the Chaldeans!" (37:13), answered "That is false! I am not defecting to the Chaldeans." (37:14), and the prophet's innocence plea, "How have I sinned against you, against your servants, or against this people, that you have put me in prison?" (37:18). This is the concept's own substance (the falsely accused before God and men), not covered by the persecution tag's register (suffering for the word) — both genuinely apply; both-tags ruling (§11.2). Chapter lands at 4 tags.
3. Anchor-extension candidates:
   - `slander-and-false-accusation` | Jeremiah 37:13-15 | "You are defecting to the Chaldeans!" (37:13) / "That is false! I am not defecting to the Chaldeans." (37:14) | w=0.6 — a narrative OT witness; pack anchors are currently Psalms/NT only.
4. Lexicon candidates:
   - `slander-and-false-accusation` | "accused of something i didnt do" | queries: "falsely accused in the Bible", "Bible verses when you are accused of something you didn't do".
5. New-concept candidates: None.
6. Decline-overturn proposals: None (intercession at 37:3 stays routed to `prayer` per the Genesis thread's ruling — single verse, below the bar as a tag).
7. Ceiling / refinement flags: none (4 tags; not subdivided in book doc).
8. Decisions record: ROUTED — 37:13–16 persecution material to corpus-blocked roster row 4 (`persecuted-for-gods-word`; the row already names Jer 37–38). The `slander-and-false-accusation` ADD is a sweep delegated default, reversible.

## Jeremiah 38
1. Existing tags (book doc): `divine-judgment`, `persecuted-for-gods-word` (adopted id)
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "This city will surely be given into the hand of the army of the king of Babylon" (38:3), burned with fire if the king will not go out (38:17–18).
   - KEEP `persecuted-for-gods-word` (adopted) — lowered by cords into the dungeon of Malchijah: "In the dungeon there was no water, but mire; and Jeremiah sank in the mire." (38:6). (WEB-vocabulary ruling preserved: "dungeon", not "cistern".)
   - ADD `obedience-to-the-word` (engine id) — the final interview turns on hearing-and-doing as life or death, stated in the concept's own terms: "Obey, I beg you, the LORD’s voice, in that which I speak to you; so it will be well with you, and your soul will live." (38:20), with the choice laid out — "If you will go out to the king of Babylon’s princes, then your soul will live, and this city will not be burned with fire" (38:17). The obey-and-it-will-be-well principle is explicit, not merely a narrated failure (same ground as the kept ch 42 tag, jeremiah.md Decisions #52). Chapter lands at 3 tags.
   - `pastoral-refuge-and-justice` NOT re-added — jeremiah.md Decisions #20 stands (God's part in the rescue is stated only at 39:16–18, outside the chapter); no new in-chapter evidence.
3. Anchor-extension candidates:
   - `obedience-to-the-word` | Jeremiah 38:20 | "Obey, I beg you, the LORD’s voice, in that which I speak to you; so it will be well with you, and your soul will live." | w=0.55 — narrative witness; supporting weight only.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (3 tags; not subdivided in book doc).
8. Decisions record: ROUTED — Ebedmelech's advocacy ("these men have done evil in all that they have done to Jeremiah the prophet", 38:9; the rescue, 38:7–13) matches the corpus-blocked `courage` row's courage-to-do-the-right-thing register (already on corpus-blocked roster, row 17); routed there, not tagged and not duplicated. 38:1–6 persecution material joins roster row 4 (`persecuted-for-gods-word`, which names Jer 38 already).

## Jeremiah 39 (subdivided: 39:1–10 / 39:11–18)
1. Existing tags (book doc): `divine-judgment`, `trust-in-god`, `gods-protection`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "Then the king of Babylon killed Zedekiah’s sons in Riblah before his eyes" (39:6); "Behold, I will bring my words on this city for evil, and not for good; and they will be accomplished before you in that day" (39:16).
   - KEEP `trust-in-god` — "you will escape with your life, because you have put your trust in me" (39:18).
   - KEEP `gods-protection` — "you will not be given into the hand of the men of whom you are afraid" (39:17).
   - No adds — swept the full library; the fall narrative's substance is carried by the three kept tags. Honest as-is.
3. Anchor-extension candidates:
   - `trust-in-god` | Jeremiah 39:18 | "you will escape with your life, because you have put your trust in me" | w=0.6 — a trust-rewarded narrative promise; the pack's anchors are wisdom/psalm texts.
   - `gods-protection` | Jeremiah 39:17-18 | "you will not be given into the hand of the men of whom you are afraid" (39:17) | w=0.55.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (2 sections) — mark for per-verse refinement pass.
8. Decisions record: ROUTED — Ebedmelech deliverance material (39:15–18) joins the ch 38 routing to corpus-blocked roster row 17 (`courage`).

## Jeremiah 40 (subdivided: 40:1–6 / 40:7–12 / 40:13–16)
1. Existing tags (book doc): `divine-judgment` (single honest tag)
2. Applied-tag deltas:
   - KEEP `divine-judgment` — even the Babylonian captain names the catastrophe as the LORD's sentence: "The LORD your God pronounced this evil on this place" (40:2); "Because you have sinned against the LORD, and have not obeyed his voice, therefore this thing has come on you" (40:3).
   - ADD `remnant` (engine id) — the chapter is the remnant's regathering and fragile settlement: "the king of Babylon had left a remnant of Judah" (40:11), "then all the Jews returned out of all places where they were driven" (40:12), and the stakes stated in remnant terms — "Why should he take your life, that all the Jews who are gathered to you should be scattered, and the remnant of Judah perish?" (40:15). jeremiah.md Decisions #86(a) skipped this add solely on its "No verifiable anchor" ground (the concept's material was unquoted in the doc and log rows, and "quotes are never composed from memory"); the pinned WEB text now verifies the quotes byte-for-byte, so the mechanical ground is discharged. The book doc's own tag-gaps `remnant` append already lists 40:11, 15 and calls chs 40–44 "Scripture's most sustained remnant narrative". Chapter lands at 2 tags.
   - `trusting-in-man` checked for Gedaliah's fatal credulity (40:14, 16) and declined — the concept is trusting man instead of God (Jer 17:5 register); Gedaliah's misjudgment of a report is not that register (consistent with jeremiah.md Decisions #36).
3. Anchor-extension candidates:
   - `remnant` | Jeremiah 40:11-12 | "the king of Babylon had left a remnant of Judah" (40:11) | w=0.55 — narrative witness for the remnant-regathered register.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None (the `remnant` ADD reverses a book-doc mechanical skip with the now-verifiable text, cited above — not a tag-gaps-review §3 decline).
7. Ceiling / refinement flags: subdivided in book doc (3 sections) — mark for per-verse refinement pass.
8. Decisions record: The `remnant` ADD is recorded against Decisions #86(a)'s no-verifiable-anchor skip, now discharged by the pinned web-text; reversible.

## Jeremiah 41 (subdivided: 41:1–10 / 41:11–18)
1. Existing tags (book doc): none — book doc records the chapter as honestly tagless
2. Applied-tag deltas:
   - ADD `betrayal` (engine id) — the chapter's central event is treachery at table, the concept's own Psalm-41:9 register (its anchors include narrative betrayals: Judas, 2 Samuel 15:12): "and there they ate bread together in Mizpah" (41:1), "Then Ishmael the son of Nethaniah arose, and the ten men who were with him, and struck Gedaliah the son of Ahikam the son of Shaphan with the sword and killed him" (41:2) — trust-then-murder by a table companion, compounded on the pilgrims lured with "Come to Gedaliah the son of Ahikam." (41:6). The book doc's "none" weighed pastoral-grief (Decisions #67) and the assassination-motif decline, but the `betrayal` pack was not considered in any recorded decision; this is an add, not an overturn. Chapter lands at 1 tag — "(Only one honest tag from the current vocabulary.)"
   - The recorded decline "assassination/political violence (chs 40–41) — not a plausible search-user concept; no row" is preserved — no new concept proposed.
3. Anchor-extension candidates:
   - `betrayal` | Jeremiah 41:1-2 | "and there they ate bread together in Mizpah" (41:1) | w=0.5 — matches the pack's 2 Samuel 15:12 narrative-witness weight class.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (2 sections) — mark for per-verse refinement pass.
8. Decisions record: The `betrayal` ADD is a sweep delegated default on a chapter the book doc left tagless; the book doc's zero-tag call did not consider this pack, and the honest-presence case is the table-fellowship treachery itself. Reversible — dropping it restores the recorded honest-and-empty state.

## Jeremiah 42
1. Existing tags (book doc): `guidance`, `obedience-to-the-word`, `fear-not`, `remnant`
2. Applied-tag deltas:
   - KEEP `guidance` — "that the LORD your God may show us the way in which we should walk, and the things that we should do" (42:3), answered after ten days with clear direction (42:7–12).
   - KEEP `obedience-to-the-word` — the vow "Whether it is good, or whether it is bad, we will obey the voice of the LORD our God" (42:6) against the closing charge "you have not obeyed the LORD your God’s voice" (42:21).
   - KEEP `fear-not` — "Don’t be afraid of the king of Babylon, of whom you are afraid." (42:11).
   - KEEP `remnant` — "for we are left but a few of many" (42:2).
   - ADD `self-deception` (engine id) — the chapter's own verdict is that the asking was self-deceiving pretense: "For you have dealt deceitfully against your own souls" (42:20), the vow (42:5–6) against the intent. Per jeremiah.md Decisions #53's own reasoning (this concept's substance IS the failure), the depicted self-deceit is honest presence; ch 42 states it in-chapter, one chapter before the tagged chs 43–44. Chapter lands at 5 tags.
   - `asking-in-gods-will` stays rejected per jeremiah.md Decisions #31 (counterfeit asking does not earn the tag) — preserved, no new evidence.
3. Anchor-extension candidates:
   - `guidance` | Jeremiah 42:3 | "that the LORD your God may show us the way in which we should walk, and the things that we should do" | w=0.55 — CAVEAT for the curator: the chapter ends in disobedience (42:20–22); any fixture must not surface this as an unconditional guidance promise — the value is the show-us-the-way query language itself.
4. Lexicon candidates: None.
5. New-concept candidates: None here — but 42:10 ("for I grieve over the distress that I have brought on you") is recorded as the second in-range witness for the ch 48 new-concept candidate (see Jeremiah 48, section 5).
6. Decline-overturn proposals: None (sojourners-and-strangers stays off chs 42–44 per Decisions #86(c): the row's substance is living-as-a-foreigner, 29:4–7's register).
7. Ceiling / refinement flags: none (5 tags; not subdivided in book doc).
8. Decisions record: The `self-deception` ADD is a sweep delegated default, reversible; it extends the deliberate #53 pattern (chs 43–44) one chapter back to the verdict verse itself.

## Jeremiah 43
1. Existing tags (book doc): `self-deception`, `divine-judgment`
2. Applied-tag deltas:
   - KEEP `self-deception` — "You speak falsely. The LORD our God has not sent you" (43:2): the proud men persuade themselves God's answer is a lie (kept deliberately per jeremiah.md Decisions #53).
   - KEEP `divine-judgment` — the hidden stones sign: "Behold, I will send and take Nebuchadnezzar the king of Babylon, my servant, and will set his throne on these stones that I have hidden" (43:10).
   - No adds — `idolatry` stays off per Decisions #86(c) (43:12–13 is idols burned in judgment, not practice depicted); `obedience-to-the-word` declined (43:4, 7 narrate the failure only; the principle is stated in ch 42, where it is tagged); `providence` declined ("my servant" at 43:10 is a single title inside the judgment oracle, carried by `divine-judgment`). Honest as-is.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in book doc).
8. Decisions record: None.

## Jeremiah 44 (subdivided: 44:1–14 / 44:15–19 / 44:20–30)
1. Existing tags (book doc): `sin`, `divine-judgment`, `self-deception`, `idolatry`, `power-of-gods-word`
2. Applied-tag deltas:
   - KEEP `sin` — "Because you have burned incense and because you have sinned against the LORD" (44:23).
   - KEEP `divine-judgment` — "Behold, I will set my face against you for evil, even to cut off all Judah" (44:11).
   - KEEP `self-deception` — "for then we had plenty of food, and were well, and saw no evil" (44:17): ruin blamed on a neglected goddess (kept per Decisions #53).
   - KEEP `idolatry` — the defiant vow "to burn incense to the queen of the sky and to pour out drink offerings to her" (44:17).
   - KEEP `power-of-gods-word` — the contest of words: the remnant "will know whose word will stand, mine or theirs" (44:28).
   - No adds — `oaths-and-vows` checked for "We will surely perform our vows that we have vowed, to burn incense to the queen of the sky" (44:25) and declined: vows to a false god condemned in object, not the concept's keep-your-vows-to-God teaching; `remnant` stays off per Decisions #86(b) (same-verse restatement of `divine-judgment`'s 44:12, 27–28 anchors). Honest as-is at 5 tags.
3. Anchor-extension candidates:
   - `power-of-gods-word` | Jeremiah 44:28-29 | "will know whose word will stand, mine or theirs" (44:28) | w=0.7 — already staged in the book doc's tag-gaps append for this concept; promoting to an engine anchor-extension candidate.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (3 sections) — mark for per-verse refinement pass.
8. Decisions record: ROUTED — "my name will no more be named in the mouth of any man of Judah in all the land of Egypt" (44:26, God swearing by his great name) matches the corpus-blocked `gods-holy-name` row's name-profaned register (already on corpus-blocked roster, row 8); routed there as an additional anchor lead, not duplicated.

## Jeremiah 45
1. Existing tags (book doc): `pastoral-hope-in-despair` (display id, pastoral register), `contentment`
2. Applied-tag deltas:
   - KEEP `pastoral-hope-in-despair` — standing pastoral-register ruling preserved (jeremiah.md Decisions #25: one named individual's crisis, kept): "Woe is me now! For the LORD has added sorrow to my pain! I am weary with my groaning, and I find no rest." (45:3), answered personally — "but I will let you escape with your life wherever you go" (45:5).
   - KEEP `contentment` — "Do you seek great things for yourself? Don’t seek them" (45:5): ambition curbed, life itself received as enough.
   - No adds — the chapter is a five-verse personal oracle; the two kept tags are its whole substance. Honest as-is.
3. Anchor-extension candidates:
   - `contentment` | Jeremiah 45:5 | "Do you seek great things for yourself? Don’t seek them" | w=0.6 — the book doc's motif list already flags this as a `contentment` lexicon/anchor-extension candidate.
4. Lexicon candidates:
   - `contentment` | "seeking great things" | queries: "do you seek great things for yourself", "ambition in the Bible", "is ambition a sin".
5. New-concept candidates: None.
6. Decline-overturn proposals: None (`benediction` at 45:5 stays rejected per Decisions #42).
7. Ceiling / refinement flags: none (2 tags; not subdivided in book doc).
8. Decisions record: None.

## Jeremiah 46
1. Existing tags (book doc): `divine-judgment`, `nations-and-peoples`, `fear-not`, `the-lords-discipline`, `day-of-the-lord`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "They didn’t stand, because the LORD pushed them." (46:15).
   - KEEP `nations-and-peoples` — the collection's own header: "The LORD’s word which came to Jeremiah the prophet concerning the nations." (46:1) (borderline flag preserved, jeremiah.md Decisions #54).
   - KEEP `fear-not` — "But don’t you be afraid, Jacob my servant. Don’t be dismayed, Israel; for, behold, I will save you from afar" (46:27).
   - KEEP `the-lords-discipline` — "but I will correct you in measure, and will in no way leave you unpunished" (46:28).
   - KEEP `day-of-the-lord` — the phrase witness at Carchemish: "For that day is of the Lord, GOD of Armies, a day of vengeance" (46:10).
   - No adds. Honest as-is at 5 tags.
3. Anchor-extension candidates:
   - `fear-not` | Jeremiah 46:27-28 | "But don’t you be afraid, Jacob my servant. Don’t be dismayed, Israel; for, behold, I will save you from afar" (46:27) | w=0.7 — near-verbatim sibling of the pack's Isaiah 43:1-3 keystone; strong OT witness.
   - `the-lords-discipline` | Jeremiah 46:28 | "but I will correct you in measure, and will in no way leave you unpunished" | w=0.65 — the pack has only two anchors (Hebrews 12:7-11, Revelation 3:19); this adds the OT correct-in-measure register the book doc's covered-list already points here.
   - `day-of-the-lord` | Jeremiah 46:10 | "For that day is of the Lord, GOD of Armies, a day of vengeance" | w=0.6 — the book's one phrase-witness; matches the tag-gaps append.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (5 tags; not subdivided in book doc — single staged BSB anchor, Decisions #8).
8. Decisions record: STANDING YIELD PRESERVED — `vengeance` at 46:10 remains routed to `day-of-the-lord`, its firm home in this chapter (jeremiah.md Decisions #86(d)); not re-added.

## Jeremiah 47
1. Existing tags (book doc): `divine-judgment` (single honest tag)
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "for the LORD will destroy the Philistines, the remnant of the isle of Caphtor" (47:4); the sword cannot rest: "How can you be quiet, since the LORD has given you a command?" (47:7).
   - No adds — a seven-verse doom oracle; nothing else in the library clears the bar. Honest as-is.
3. Anchor-extension candidates: None.
4. Lexicon candidates:
   - `divine-judgment` | "sword of the lord" | queries: "sword of the LORD meaning", "what is the sword of the LORD in the Bible" — anchored by "You sword of the LORD, how long will it be before you are quiet?" (47:6).
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (1 tag; not subdivided in book doc).
8. Decisions record: None.

## Jeremiah 48
1. Existing tags (book doc): `divine-judgment`, `humble-exaltation`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "for I have broken Moab like a vessel in which no one delights" (48:38).
   - KEEP `humble-exaltation` — "We have heard of the pride of Moab. He is very proud in his loftiness, his pride, his arrogance, and the arrogance of his heart." (48:29).
   - No adds — `complacency` considered for 48:11 and held to anchor-extension only (one verse-image inside a foreign-nation oracle; the concept's tag substance is the spiritual apathy of God's own people); mercy-deferred (48:47) stays a motif ("Reversal of the nations' captivity"), per the book doc's check-`restoration`-lexicons-first note. Honest as-is.
3. Anchor-extension candidates:
   - `complacency` | Jeremiah 48:11 | "Moab has been at ease from his youth, and he has settled on his dregs" | w=0.6 — the settled-on-dregs image is the same idiom as the pack's Zephaniah 1:12 anchor (undisturbed ease, never poured out); a natural OT sibling anchor.
4. Lexicon candidates: None.
5. New-concept candidates:
   - proposed id `gods-grief-in-judgment` — the judge grieving over his own sentence, a register no current id carries (`lament` is the human practice; `slow-to-anger` is God's patience before judging; `mercy` doesn't carry grief-while-executing). Anchors: "Therefore I will wail for Moab. Yes, I will cry out for all Moab." (48:31); "Therefore my heart sounds for Moab like flutes" (48:36); second in-range witness Jeremiah 42:10 — "for I grieve over the distress that I have brought on you". Realistic queries: "does God enjoy punishing", "does God grieve when he judges", "God's compassion in judgment". Declines checked: not declined anywhere; nearest recorded routing is Ezekiel's God-desires-none-to-perish → `repentance` lexicon-extension (declines §3.5) — a distinct register (desire that they turn vs grief while striking); the curator should decide the boundary with that routing in view, and check `slow-to-anger` / `mercy` lexicons first. Cross-book candidates for the curator: Lam 3:33, Hos 11:8, Isa 15–16 (not asserted here; out of range).
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: none (2 tags; not subdivided in book doc — single staged BSB anchor, Decisions #8).
8. Decisions record: `complacency` met the anchor-relevance test but NOT the display-tag presence bar — recorded here so the no-tag call is explicit, not silent.

## Jeremiah 49 (subdivided: 49:1–6 / 49:7–22 / 49:23–27 / 49:28–33 / 49:34–39)
1. Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `care-for-widows`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — sworn on Bozrah: "Bozrah will become an astonishment, a reproach, a waste, and a curse" (49:13), with each nation sentenced in turn.
   - KEEP `humble-exaltation` — "the pride of your heart has deceived you" (49:16), "though you should make your nest as high as the eagle, I will bring you down from there" (49:16).
   - KEEP `care-for-widows` — God's own pledge inside Edom's sentence: "Leave your fatherless children. I will preserve them alive. Let your widows trust in me." (49:11).
   - No adds — `gods-protection` stays off per jeremiah.md Decisions #68 (49:11 is one verse, routed to `care-for-widows`); trust-in-treasures (49:4) stays a motif ("false security"), per the book doc's check-lexicons-first note. Honest as-is.
3. Anchor-extension candidates:
   - `care-for-widows` | Jeremiah 49:11 | "Leave your fatherless children. I will preserve them alive. Let your widows trust in me." | w=0.75 — first-person divine pledge; the book doc's tag-gaps append already carries it with the widen-to-fatherless note for the curator.
   - `humble-exaltation` | Jeremiah 49:16 | "the pride of your heart has deceived you" | w=0.65 — the searched Obadiah-1:3 phrase family; the pack's current anchors are all human-virtue texts, and PR #41 gave it the pride lexicon this anchor would serve.
4. Lexicon candidates:
   - `humble-exaltation` | "pride of your heart has deceived you" | queries: "pride of your heart meaning", "how does pride deceive you".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (5 sections) — mark for per-verse refinement pass.
8. Decisions record: None.

## Jeremiah 50 (subdivided: 50:1–3 / 50:4–10 / 50:11–16 / 50:17–20 / 50:21–46)
1. Existing tags (book doc): `divine-judgment`, `restoration`, `forgiveness-of-sins`, `covenant`, `justice-and-oppression`, `vengeance`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "for she has been proud against the LORD, against the Holy One of Israel" (50:29).
   - KEEP `restoration` — "I will bring Israel again to his pasture" (50:19) (the §1(e) register TENSION with `restoration-of-israel` noted below, not pre-decided).
   - KEEP `forgiveness-of-sins` — "the iniquity of Israel will be sought for, and there will be none" (50:20).
   - KEEP `covenant` — "Come, and join yourselves to the LORD in an everlasting covenant that will not be forgotten" (50:5) (thin-presence flag preserved, jeremiah.md Decisions #55).
   - KEEP `justice-and-oppression` — "Their Redeemer is strong. The LORD of Armies is his name. He will thoroughly plead their cause" (50:34).
   - KEEP `vengeance` — "for it is the vengeance of the LORD" (50:15).
   - ADD `restoration-of-israel` (engine id) — the national-return substance is explicit and sustained: "the children of Israel will come, they and the children of Judah together; they will go on their way weeping, and will seek the LORD their God" (50:4); "I will bring Israel again to his pasture" (50:19). The pack's own anchors already include Jeremiah 29:14 and 31:8-11 — this is squarely its register. Applied alongside `restoration` under the both-tags ruling (§11.2), explicitly WITHOUT pre-deciding the §1(e) restoration-register tension (declines-and-contested.md §1(e)) — the more specific id serves "will God restore Israel" searchers either way. Chapter lands at 7 tags (above soft cap 6, under ceiling 8; every tag independently clears the bar).
3. Anchor-extension candidates:
   - `restoration-of-israel` | Jeremiah 50:4-5 | "the children of Israel will come, they and the children of Judah together; they will go on their way weeping, and will seek the LORD their God" (50:4) | w=0.7.
   - `forgiveness-of-sins` | Jeremiah 50:20 | "for I will pardon them whom I leave as a remnant" | w=0.7 — sins sought and not found; a distinctive OT completeness-of-pardon witness.
4. Lexicon candidates:
   - `justice-and-oppression` | "plead my cause" | queries: "God will plead my cause", "who defends the oppressed", "my Redeemer is strong".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (5 sections) — mark for per-verse refinement pass; 7 tags (above soft cap, noted).
8. Decisions record: ROUTED — bad-shepherds material ("My people have been lost sheep. Their shepherds have caused them to go astray." 50:6; "Israel is a hunted sheep." 50:17) joins the corpus-blocked roster's recorded re-open note on the `shepherds-and-the-flock` bad-shepherds register (roster addendum note, alongside Ezek 34 / John 10); routed, not tagged (at cap-adjacent density, and the register reopens at re-pin). ROUTED — "Their Redeemer is strong." (50:34) noted to corpus-blocked roster row 23 (`redeemer`) as the national-redeemer register witness for that row's decide-alongside design (row's own register is Job's personal redeemer; noted, not asserted). The `restoration-of-israel` ADD is a sweep delegated default, reversible; the soft-cap exceedance is deliberate and documented here.

## Jeremiah 51 (subdivided: 51:1–14 / 51:15–19 / 51:20–58 / 51:59–64)
1. Existing tags (book doc): `divine-judgment`, `creation`, `gods-faithfulness`, `vengeance`, `idolatry`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "for the LORD is a God of retribution. He will surely repay" (51:56).
   - KEEP `creation` — "He has made the earth by his power. He has established the world by his wisdom. By his understanding he has stretched out the heavens." (51:15).
   - KEEP `gods-faithfulness` — "For Israel is not forsaken, nor Judah, by his God, by the LORD of Armies" (51:5).
   - KEEP `vengeance` — "for it is the vengeance of the LORD, the vengeance of his temple" (51:11).
   - KEEP `idolatry` — "his molten images are falsehood, and there is no breath in them" (51:17).
   - No adds — `sojourners-and-strangers` considered for the exile-spirituality verse ("Remember the LORD from afar, and let Jerusalem come into your mind", 51:50) and declined as a tag: one verse, below the substantial-presence bar (the register is honestly homed on ch 29); `power-of-gods-word` stays off per Decisions #86(a) — 51:12's purposed-and-done clause is a single supporting clause inside the judgment oracle. Honest as-is at 5 tags.
3. Anchor-extension candidates:
   - `gods-faithfulness` | Jeremiah 51:5 | "For Israel is not forsaken, nor Judah, by his God, by the LORD of Armies" | w=0.6 — not-forsaken-though-guilty; a distinct register from the pack's promise-keeping anchors.
   - `vengeance` | Jeremiah 51:36 | "Behold, I will plead your cause, and take vengeance for you" | w=0.6 — vengeance as God's own act on behalf of the wronged; matches the pack's Lamentations 3:64-66 weight class. (Same never-endorse-human-revenge wording caveat as the tag-gaps row.)
   - `creation` note: 51:15 near-verbatim repeats the pack's existing Jeremiah 10:12 anchor — no extension proposed (duplicate value).
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (4 sections) — mark for per-verse refinement pass.
8. Decisions record: ROUTED — exile-register material ("Flee out of the middle of Babylon!" 51:6; "My people, go away from the middle of her" 51:45; "Remember the LORD from afar, and let Jerusalem come into your mind" 51:50) joins corpus-blocked roster row 45 (`exile-and-captivity` — SKIPPED-blocked + Jesse's routing call); routed, not duplicated.

## Jeremiah 52 (subdivided: 52:1–11 / 52:12–23 / 52:24–30 / 52:31–34)
1. Existing tags (book doc): `divine-judgment`, `sin`
2. Applied-tag deltas:
   - KEEP `divine-judgment` — "For through the LORD’s anger this happened in Jerusalem and Judah, until he had cast them out from his presence" (52:3).
   - KEEP `sin` — "He did that which was evil in the LORD’s sight, according to all that Jehoiakim had done" (52:2), with siege, famine, capture, and exile as its unfolded cost.
   - No adds — `hope-in-god` stays off per jeremiah.md Decisions #69 (Jehoiachin's release, "Jehoiachin ate bread before him continually all the days of his life" 52:33, never names God — reported as kindness without a doctrinal claim); famine at 52:6 ("the famine was severe in the city, so that there was no bread for the people of the land") stays routed to the PR #41 `gods-provision` lexicon extension per the book doc's covered-list. Honest as-is.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Ceiling / refinement flags: subdivided in book doc (4 sections) — mark for per-verse refinement pass.
8. Decisions record: ROUTED — the deportation record (52:28–30, three numbered waves; "So Judah was carried away captive out of his land." 52:27) joins corpus-blocked roster row 45 (`exile-and-captivity`); routed, not duplicated.

---

## Book totals (Jeremiah 1–52, assembled; recomputed mechanically at assembly)

- **Applied-tag deltas:** 17 ADDs, 214 KEEPs, 1 DROP/yield.
  - ADDs by chapter: ch 2 `living-water`; ch 3 `backsliding`; ch 7 `empty-worship`; ch 11
    `persecuted-for-gods-word` (adopted id); ch 14 `unanswered-prayer`; ch 16
    `restoration-of-israel`; ch 17 `trusting-in-man` + `living-water`; ch 23
    `shepherds-and-the-flock`; ch 31 `individual-responsibility` + `restoration-of-israel`;
    ch 37 `slander-and-false-accusation`; ch 38 `obedience-to-the-word`; ch 40 `remnant`;
    ch 41 `betrayal`; ch 42 `self-deception`; ch 50 `restoration-of-israel`.
  - DROP/yield: `hope-in-god`, ch 31 (§11.6 thin-single-verse yield at the hard ceiling;
    full Decisions-record entry in the ch 31 entry, reversible, alternative yield named).
- **Anchor-extension candidates: 94** (38 + 35 + 21; per-chapter rows above). Merged
  multi-chunk sets (all refs preserved; nothing lost in the merge):
  - `false-prophets` — six candidates across chunks 1–17 and 18–34: Jer 6:14 (w=0.7), 8:11
    (w=0.6; near-duplicate phrasing of 6:14 — curator should take one of the two, not both,
    per the ch 8 entry's own note), 14:14 (w=0.8), 23:16 (w=0.9, with supporting 23:21–22,
    25–28), 27:14-15 (w=0.7), 28:8-9 (w=0.85, with supporting 28:15). The pack has zero
    Jeremiah anchors today although this book is Scripture's most sustained treatment; the
    six rows are one coherent candidate set for the curator to take as a batch.
  - `restoration-of-israel` — six candidates across all three chunks: Jer 16:14-15 (w=0.7),
    24:5-7 (w=0.75), 30:3 (w=0.8), 32:37 (w=0.8), 33:7 (w=0.7), 50:4-5 (w=0.7). Distinct
    verse ranges, one register; no duplicates.
  - Other ids with candidates in more than one chunk (distinct refs, no conflicts):
    `power-of-gods-word` (1:12; 5:14; 20:9; 36:27-32; 44:28-29), `the-lords-discipline`
    (10:24; 30:11; 31:18; 46:28), `obedience-to-the-word` (7:22-23; 35:13-16; 38:20),
    `forgiveness-of-sins` (31:34; 33:8; 50:20), `remnant` (4:27; 5:18; 40:11-12), `covenant`
    (11:3-4; 32:40), `repentance` (3:12-13; 31:18-19), `rest-for-the-weary` (6:16; 31:25),
    `fear-not` (1:8; 46:27-28), `gods-protection` (1:18-19; 39:17-18), `trust-in-god`
    (17:7-8; 39:18), `guidance` (10:23; 42:3), `justice-and-oppression` (5:26-28; 22:3),
    `humble-exaltation` (13:15-18; 49:16), `gods-faithfulness` (33:19-21; 51:5), `vengeance`
    (11:20; 51:36).
  - Reconciliation note (`hope-in-god`): the ch 14 anchor candidate (14:8, w=0.55) stands
    alongside the ch 31 display yield — the yield is a chapter-31 display-density call, the
    candidate an engine-side proposal on a different chapter; no conflict, both kept.
  - No-extension notes preserved as written: `creation` 51:15 (near-verbatim repeat of the
    pack's Jer 10:12 anchor); `remnant` ch 23 (pack already anchors Jer 23:3-4).
- **Lexicon candidates: 25** (7 + 12 + 6; per-chapter rows above). Two ids carry rows from
  two chunks with distinct terms, both kept: `hardness-of-heart` ('can a leopard change its
  spots', ch 13, XOR caveat vs `new-creation`; 'stiff-necked', ch 19), `divine-judgment`
  ('the cup of god's wrath', ch 25; 'sword of the lord', ch 47); `providence` and `covenant`
  each carry two rows from a single chunk (chs 18/32 and 31/34).
- **New-concept candidates: 2** — `calling-and-commission` (ch 1, with check-first note
  against `guidance`/`discipleship` lexicons) and `gods-grief-in-judgment` (ch 48, with the
  ch 42:10 second witness and check-first boundaries vs `slow-to-anger`/`mercy` and the
  Ezekiel §3.5 routing).
- **Decline-overturn proposals: 0.** Boundary cases documented in-entry and none touching a
  §3 decline: the ch 3 `backsliding` add applies a now-live engine id cross-noted against the
  §3.5 routing decline; the ch 40 `remnant` add discharges book-doc Decisions #86(a)'s
  no-verifiable-anchor mechanical skip with the now-pinned WEB text.
- **Corpus-blocked roster routings, merged by row** (route, don't duplicate — one note per
  row, all chunk refs combined):
  - Row 4 `persecuted-for-gods-word`: refs already named by the row or book-doc proposal —
    Jer 15:15; 18:18; 20:1–2 (and ch 20 generally); 26:8–23; 36:26; 37:13–16; 38:1–6. NEW
    refs contributed by this sweep for the row's queue: Jer 11:18–23 (the Anathoth plot);
    29:24–32 (Shemaiah's stocks-and-shackles demand); 32:2–3 (court-of-the-guard
    imprisonment begins); 33:1 (its continuation). The ch 11 display ADD is display-layer
    only per §11.1.
  - Row 7 `god-relents`: Jer 18:7–10 and 26:3–19 are the row's own named blocking refs;
    findings routed, no candidates minted.
  - Row 8 `gods-holy-name`: Jer 44:26 (God swearing by his great name / name no more named
    in Egypt) routed as an additional anchor lead.
  - Row 10 `famine-of-hearing-gods-word`: the ch 14 `unanswered-prayer` anchor candidate
    (14:11-12) is cross-noted to that row's deferred word-withheld vs prayer-shut-out
    routing decision — decide together, not before it.
  - Row 17 `courage`: new in-book witnesses routed from both later chunks — Jer 26:12–15
    (Jeremiah standing his ground at trial); 38:7–13 and 39:15–18 (Ebedmelech's advocacy and
    deliverance).
  - Row 23 `redeemer`: Jer 50:34 ("Their Redeemer is strong.") noted as the
    national-redeemer register witness for that row's decide-alongside design.
  - Row 32 `deliverance`: Jer 15:20–21 rescue-register material noted for the row's queue.
  - Row 37 `circumcision-of-the-heart`: Jer 4:4 and 9:26 — both already named in the row's
    deferral note; routed so the read-together heart-design stays whole.
  - Row 40 `gentile-inclusion`: Jer 12:14–17 (built-up-among-my-people offer) noted for the
    re-pin curator.
  - Row 45 `exile-and-captivity`: Jer 51:6, 45, 50 (flee-Babylon / remember-from-afar) and
    52:27–30 (the numbered deportation record) routed.
  - Roster addendum, `shepherds-and-the-flock` bad-shepherds re-open note: the ch 23 anchor
    candidate (23:1-4) feeds that reopening, and Jer 50:6, 17 (lost sheep / hunted sheep)
    join it from ch 50; routed, not duplicated.
- **Ceiling chapters (hard ceiling of 8 reached):** 20 (existing), 23 and 31 (land at 8
  after deltas). Near-ceiling for the curator's awareness: chs 10 and 50 sit at 7.
- **Per-verse refinement flags (subdivided in book doc; matches the brief's list exactly,
  32 chapters):** 3, 4, 7, 8, 10, 11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 25, 26, 29,
  31, 32, 33, 34, 36, 39, 40, 41, 44, 49, 50, 51, 52.
- **Count corrections: none** — every chunk-summary figure reproduced exactly under
  independent recomputation.
