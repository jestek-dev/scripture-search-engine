# Esther sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
  (re-verified at sweep time: HEAD identical to that SHA, working tree clean).
- Concept library at thread start: 239 packs in ontology/concepts/, plus the §11.1 adopted
  display-tag vocabulary per the BRIEFING §7 safe reconstruction (prefer engine ids; adopted
  ids only at exact roster/§2 spelling, source stated per use).
- Book: Esther (10 chapters, 167 WEB verses).
- Inputs: book doc /mnt/project-files/research/bible-rollout/esther.md (existing tags = prior
  art; FINAL at critic round 3, 2026-08-23, plus the 2026-08-25 adopted-vocabulary application
  pass, its Decisions #24); scout scratchpad (BRIEFING.md, conventions-extract.md,
  concept-inventory.md, concept-ids.txt, declines-and-contested.md, corpus-blocked-roster.md,
  book-docs-index.md, web-text-access.md, repo-state.md, plan-extract.md) at
  /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/.
- WEB text: the repo-pinned VPL snapshot pipeline/sources/vpl/engwebp_vpl.txt (manifest sha
  b6f55cc7…, contentSha256 944e3883…, re-admitted in PR #53) — book code EST, 167 verse lines;
  every quote below was verified byte-for-byte (grep -F) against that file before entering this
  ledger. This pinned-text verification supersedes the book doc's 2026-08-23 provenance
  limitation: the doc predates PR #53 and could verify only against the then-current ebible.org
  edition (same content sha b6f55cc7…), which is now the pinned identity.
- God-silence constraint (binding; book doc front matter + Decisions #3, re-confirmed
  mechanically against the pinned VPL at this sweep): WEB Esther contains zero occurrences of
  "God", "LORD", "Lord", or "Yahweh" in all 167 verses (case-insensitive grep = 0), and no
  prayer, sacrifice, or worship scene. No tag, justification, or quote below reads God-language
  into text that does not contain it.
- CORPUS-BLOCKED-UNTIL-EXPANSION (book-wide): Esther has ZERO verses in the current CI fixture
  corpus (213 chapters / 5,726 verses; corpusFingerprint 644b241c…; Esther absent from
  pipeline/fixtures/web-subset.json entirely). EVERY engine-facing candidate in this ledger
  (anchor extension, lexicon row, any eventual pack) is therefore marked
  CORPUS-BLOCKED-UNTIL-EXPANSION: it rides the PR-β full-corpus expansion owned by another
  thread, and nothing here is buildable or measurable before that lands. Candidates matching the
  engine-pack-backlog corpus-blocked roster are additionally ROUTED to their roster row
  ("routed to backlog: <id>") — never duplicated as fresh proposals.
- Ledger discipline: atomic end-of-file appends ONLY (chapter-block chunks; never whole-file
  rewrites), post-write verification after every append, final survival audit — CONVENTIONS §9
  protocol applies to this file.
- Vocabulary-source key used below: [engine] = one of the 239 ontology/concepts basename ids;
  [adopted] = §11.1 adopted display-tag id (tag-gaps-review §2 spelling, established on Tags
  lines in existing book docs); [roster N] = row N of the 50-row corpus-blocked roster in
  engine-pack-backlog.md.
- Anomaly (recorded once, referenced per chapter): `sowing-and-reaping` — on the book doc's
  Tags lines (chs 7, 9) since the 2026-08-25 application pass — is an adopted §2 id (the Hosea
  row) that is neither among the 239 engine ids nor on the 50-row corpus-blocked roster. It is
  treated here as [adopted] display vocabulary (established Tags-line precedent per BRIEFING
  §7); its engine-facing side is a future curation question on the Hosea tag-gaps row, and its
  Esther refs are corpus-blocked like everything else in this book.
- Legend — each chapter entry carries these sections, in order:
  1. "## Esther <chapter>" heading (with "(subdivided: <ranges>)" where the book doc
     subdivides it)
  2. Existing tags (book doc, post-2026-08-25 application pass)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision —
     per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or
     "None.")

## Vocabulary-reference update (appended 2026-08-26, before any chapter block)

Mid-sweep coordinator notice: the canonical §11.1 adopted-concepts list now exists at
/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, alphabetized,
engine-built markers against the 239-id census). That file — not the header's BRIEFING §7
reconstruction — is this ledger's §11.1 vocabulary reference from here on. Cross-check result:
every non-engine id used in this ledger (`courage`, `deliverance`, `exile-and-captivity`,
`persecuted-for-gods-word`, `remembrance-and-memorials`, `sowing-and-reaping`) appears in the
canonical file, each marked "engine-built: no" — zero mismatches with the header's
reconstruction. The header's `sowing-and-reaping` anomaly note is superseded in part: the id IS
canonically adopted (no anomaly of status); what remains true is that it is neither an engine
pack nor a corpus-blocked-roster row, so its engine-facing side stays a future curation
question on the Hosea tag-gaps row. The [adopted] source key below now means: listed in
tag-apply/adopted-concepts.md with engine-built: no.

# Chapter entries

## Esther 1 (subdivided: 1:1–8; 1:9–22)

- Existing tags (book doc): none — honest-and-empty ("no concept in the current vocabulary is
  genuinely present in this chapter").
- Applied-tag deltas: No changes — honest-and-empty CONFIRMED against the full 239-id engine
  library plus the 161-id adopted list. Re-checked at this sweep, each failing the
  honest-substantial-presence bar:
  - `drunkenness` [engine] — "when the heart of the king was merry with wine" (1:10) is
    scene-setting the text does not moralize; the recorded decline (tag-gaps-review §3.5,
    Esther block) stands, no new evidence.
  - `governing-authorities` [engine] — the unalterable "laws of the Persians and the Medes"
    (1:19) are narrative setting, not the concept's believers-under-authority teaching register.
  - `godly-marriage` / `leadership` [engine] — Memucan's counsel "that every man should rule
    his own house" (1:22) is reported counsel the text does not endorse (book doc Decisions
    #10); no teaching substance.
  - `humble-exaltation` [engine] — no exalting or humbling agent is named anywhere in this book
    (book doc Decisions #9 register argument governs all ten chapters; not re-litigated).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 0 tags — no cap hit; SUBDIVIDED in the book doc (1:1–8; 1:9–22)
  → PER-VERSE REFINEMENT candidate.
- Decisions record: None (no yields).

## Esther 2 (subdivided: 2:1–20; 2:21–23)

- Existing tags (book doc): `exile-and-captivity`; `sojourners-and-strangers`.
- Applied-tag deltas:
  - KEEP `exile-and-captivity` [adopted; roster 45] — the cast is introduced as the
    deportation's descendants: Mordecai's line "had been carried away from Jerusalem with the
    captives" (2:6), and the whole story runs downstream of that removal. Display tag stands;
    engine-facing side routed to backlog: exile-and-captivity (roster row 45 — the
    fold-vs-separate routing vs `sojourners-and-strangers` is Jesse's call; nothing prejudged
    here).
  - KEEP `sojourners-and-strangers` [engine] — the living-as-foreigners register of the same
    facts: a deported family's orphan rises in a foreign court with identity concealed —
    "Esther had not made known her people nor her relatives" (2:10), "as Mordecai had
    commanded her" (2:20).
  - No adds. Re-checked, each failing the presence bar:
    - `betrayal` [engine] — the Bigthan/Teresh conspiracy (2:21–23) is a servants' plot
      against the king; no friend-or-kin material (recorded decline, §3.5 Esther block,
      stands).
    - `providence` [engine] — Esther's favor (2:9, 15, 17) is narrated with no agent named;
      the book doc's deliberate withhold (Decisions #6) stands under the presence bar.
    - `parenting` [engine] — 2:7's guardianship is fostering narrated, not the
      train-up-a-child teaching register (Decisions #12).
    - `waiting-for-a-child` [engine] — no barrenness or waiting-for-children material.
    - `favoritism` [engine] — "Esther obtained favor in the sight of all those who looked at
      her" (2:15) is favor received, not the partiality-as-sin register.
- Anchor-extension candidates: None proposed. The natural candidate (`sojourners-and-strangers`
  @ Esther 2:5–6) is deliberately NOT proposed: 2:5–6 is exile-history register material, and
  proposing it as a sojourners anchor now would prejudge the Jesse-gated fold-vs-separate call
  — routed to backlog: exile-and-captivity (roster row 45).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 2 tags — no cap hit; SUBDIVIDED in the book doc (2:1–20;
  2:21–23) → PER-VERSE REFINEMENT candidate.
- Decisions record: None (no yields).

## Esther 3

- Existing tags (book doc): `persecuted-for-gods-word`; `exile-and-captivity`.
- Applied-tag deltas:
  - KEEP `persecuted-for-gods-word` [adopted; roster 4] — the row's national-scale case: an
    empire-wide decree "to destroy, to kill, and to cause to perish, all Jews, both young and
    old, little children and women, in one day" (3:13), with the text's only stated ground for
    the enmity being "that he was a Jew" (3:4) — a people marked for who they are, the book's
    silence intact. Display tag stands; engine-facing side routed to backlog:
    persecuted-for-gods-word (roster row 4 — Esther is named among that row's blocking refs;
    the G4 boundary design vs `suffering-for-christ` is recorded there).
  - KEEP `exile-and-captivity` [adopted; roster 45] — the diaspora-at-risk register: "a
    certain people scattered abroad and dispersed among the peoples in all the provinces"
    (3:8), now marked for destruction where it lives. Routed to backlog: exile-and-captivity
    (roster row 45).
  - No adds. Re-checked, each failing the presence bar:
    - `sin` [engine] — Haman's evil is narrated, not the wages-of-sin doctrine register
      (book doc Decisions #12).
    - `pleasing-god-not-people` [engine] — Mordecai defies man, but no divine allegiance is
      voiced anywhere; the text's stated ground is only "that he was a Jew" (3:4)
      (Decisions #12; God-silence constraint).
    - `envy-and-jealousy` [engine] — 3:5 ("Haman was full of wrath") is rage at a slight;
      envy's anatomy is chapter 5's material.
    - `occult-and-divination` [engine] — "they cast Pur, that is, the lot" (3:7) is a dating
      device reported without teaching or moralizing; the pack's register is
      prohibition/practice teaching, absent here.
    - `nations-and-peoples` [engine] — the 127-province empire is not the origin-of-nations
      register (book doc Decisions #12 precedent from ch 1).
- Anchor-extension candidates: None — the chapter's persecution material is roster row 4's own
  case; routed to backlog: persecuted-for-gods-word (roster row 4).
- Lexicon candidates: None as fresh rows — "Haman's plot" / "persecution of the Jews in the
  Bible" / "antisemitism in the Bible" phrasings (book doc motif 7) belong to the roster-4
  pack's eventual design; routed to backlog: persecuted-for-gods-word (roster row 4).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 2 tags — no cap hit; not subdivided; none.
- Decisions record: None (no yields).

## Esther 4

- Existing tags (book doc): `providence`; `courage`; `deliverance`; `fasting`.
- Applied-tag deltas:
  - KEEP `providence` [engine] — the book's one God-adjacent tag, argued from the chapter's
    own words: "relief and deliverance will come to the Jews from another place" (4:14) — a
    deliverance certain with no visible power behind it — and "Who knows if you haven’t come
    to the kingdom for such a time as this?" (4:14) — placement read as purpose. That veiled
    confidence in an unnamed ordering power is the concept's substance in the only form this
    book carries it; the pack itself already anchors Esther 4:14 (w0.65, editorial, "defensible
    only as that"). The agent stays unnamed here as in the text.
  - KEEP `courage` [adopted; roster 17] — the book's defining act of costly courage, resolved
    with no recorded divine word answering it: knowing the law of 4:11 ("there is one law for
    him, that he be put to death, except those to whom the king might hold out the golden
    scepter"), Esther sets the terms and goes — "Then I will go in to the king, which is
    against the law; and if I perish, I perish." (4:16). Routed to backlog: courage (roster
    row 17 — Esth 4:11-16 is that row's own case).
  - KEEP `deliverance` [adopted; roster 32] — the searched phrase itself, agent unnamed:
    "relief and deliverance will come to the Jews from another place" (4:14). Routed to
    backlog: deliverance (roster row 32 — Esth 4:14 is among that row's requested refs; the
    row's measured "god will deliver you" misroute note rides there).
  - KEEP `fasting` [engine] — "there was great mourning among the Jews, and fasting, and
    weeping, and wailing" (4:3); Esther's commanded corporate fast, "neither eat nor drink
    three days, night or day" (4:16) — fasting named with no prayer named, the book's defining
    reticence carried rather than smoothed over.
  - No adds. Re-checked, each failing the presence bar:
    - `lament` [engine] — 4:1–3's loud public mourning is addressed to no one the text names;
      the recorded decline (tag-gaps-review §3.5 Esther block; §1(c)-adjacent, on its own
      distinct ground) stands — no new textual evidence.
    - `trust-in-god` [engine] — "if I perish, I perish" is resolve; no trust in God is voiced
      (Decisions #12; God-silence constraint).
    - `prayer` [engine] — no prayer appears anywhere in WEB Esther (mechanically confirmed).
    - `pastoral-god-sees-my-suffering` and all `pastoral-*` [engine] — barred on
      national-scale material (book doc Decisions #2), and the sees-my-suffering gist would
      additionally assert what this book never says.
- Anchor-extension candidates:
  - `fasting` [engine] | Esther 4:3 | "there was great mourning among the Jews, and fasting,
    and weeping, and wailing" | proposed w0.5 — the communal mourning-fast beside the pack's
    existing Esther 4:15-16 (w0.75) anchor; gives "fasting in the bible" learners the
    provinces-wide fast, not only Esther's commanded one. CORPUS-BLOCKED-UNTIL-EXPANSION.
- Lexicon candidates:
  - `providence` [engine] | "for such a time as this" (secondary form: "such a time as this")
    | realistic phrasings: "for such a time as this", "for such a time as this meaning",
    "why has God placed me where I am" — searchers type the verse's own words constantly; the
    pack already anchors Esther 4:14 yet its lexicon carries no form of the phrase (book doc
    motif 1's standing flag, promoted here). CORPUS-BLOCKED-UNTIL-EXPANSION (the anchor cannot
    surface while Esther is absent from the corpus; unmeasurable until PR-β).
  - "if I perish I perish" phrasings ("esther if i perish i perish", "risking everything to do
    what is right") — not proposed as a fresh row; routed to backlog: courage (roster row 17),
    whose recorded case already carries 4:16.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 4 tags — under soft cap; not subdivided (book doc keeps ch 4
  whole); none.
- Decisions record: None (no yields).

## Esther 5 (subdivided: 5:1–8; 5:9–14)

- Existing tags (book doc): `envy-and-jealousy`; `courage`.
- Applied-tag deltas:
  - KEEP `envy-and-jealousy` [engine] — envy's anatomy narrated: Haman goes out "joyful and
    glad of heart" (5:9), inventories riches, children, and honors, and empties it all in one
    sentence — "Yet all this avails me nothing, so long as I see Mordecai the Jew sitting at
    the king’s gate" (5:13). The pack's anchors already include narrated jealousy
    (1 Sam 18:6-9; Gen 4; Gen 37), so a narrative instance carries the tag (book doc
    Decisions #7).
  - KEEP `courage` [adopted; roster 17] — the resolve carried into act: uncalled, "Esther put
    on her royal clothing and stood in the inner court of the king’s house" (5:1), then spends
    the king's open-handed "It shall be given you even to the half of the kingdom" (5:3) on
    nothing but an invitation. Routed to backlog: courage (roster row 17 — Esth 5:1-2 is in
    that row's case).
  - No adds. Re-checked, each failing the presence bar:
    - `contentment` [engine] — 5:11–13 is the failure mode, unusable by the Genesis-3 rule
      (book doc Decisions #12; motif 13).
    - `self-control` [engine] — "Haman restrained himself" (5:10) is one clause in service of
      malice (Decisions #12).
    - `receiving-correction` / `taming-the-tongue` [engine] — Zeresh and the friends' counsel
      (5:14) is counsel to murder; no concept substance.
- Anchor-extension candidates:
  - `envy-and-jealousy` [engine] | Esther 5:9-13 | "Yet all this avails me nothing, so long as
    I see Mordecai the Jew sitting at the king’s gate" | proposed w0.7 — joins the pack's
    narrated-jealousy anchors; the canon's cleanest everything-possessed-poisoned-by-one-thing
    scene, strong for "envy in my heart" / "struggling with envy" learners.
    CORPUS-BLOCKED-UNTIL-EXPANSION.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 2 tags — no cap hit; SUBDIVIDED in the book doc (5:1–8; 5:9–14)
  → PER-VERSE REFINEMENT candidate.
- Decisions record: None (no yields).

## Esther 6

- Existing tags (book doc): `self-deception`.
- Applied-tag deltas:
  - KEEP `self-deception` [engine] — the chapter turns on Haman deceived by his own
    self-estimate: he "said in his heart, “Who would the king delight to honor more than
    myself?”" (6:6), designs the honors accordingly, and must bestow every one of them on the
    man he came to hang (6:10-11) — the conceit dismantled in-chapter by his own counselors:
    "you will surely fall before him" (6:13). (Only one honest tag from the current
    vocabulary.)
  - No adds. Re-checked, each failing the presence bar or a standing withhold:
    - `humble-exaltation` [engine] — the reversal pattern is present, but the pack's label and
      lexicon name God as the exalter and no exalting or humbling agent is named in the
      chapter; the book doc's withhold (Decisions #9 — expressly recorded as "the single call
      most reasonably overturned", reserved to Jesse) stands. No new textual evidence; this
      sweep does not re-litigate a recorded register call.
    - `providence` [engine] — "On that night, the king couldn’t sleep." (6:1) is the famous
      hinge, but the chapter names no agent, and even 6:13 names an outcome pattern rather
      than an unnamed source the way 4:14's "from another place" does (book doc Decisions #6
      and motif 3 — the deliberate withhold stands under the presence bar).
- Anchor-extension candidates:
  - `self-deception` [engine] | Esther 6:6 | "said in his heart, “Who would the king delight
    to honor more than myself?”" | proposed w0.7 — sits squarely in the pack's Gal 6:3 /
    Luke 18:11 thinks-himself-to-be-something register; the pack currently has no OT narrative
    anchor. CORPUS-BLOCKED-UNTIL-EXPANSION.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 1 tag — no cap hit; not subdivided; none.
- Decisions record: None (no yields).

## Esther 7

- Existing tags (book doc): `courage`; `sowing-and-reaping`.
- Applied-tag deltas:
  - KEEP `courage` [adopted; roster 17] — the confrontation made with the adversary at the
    table: asked her petition, Esther answers "let my life be given me at my petition, and my
    people at my request" (7:3) — "we are sold, I and my people, to be destroyed, to be slain,
    and to perish" (7:4) — and names him to his face: "An adversary and an enemy, even this
    wicked Haman!" (7:6). Routed to backlog: courage (roster row 17 — Esth 7:6 is in that
    row's case).
  - KEEP `sowing-and-reaping` [adopted — canonical list, engine-built: no] — the reversal the
    text leaves uncommented: Haman is hanged on "the gallows that he had prepared for
    Mordecai" (7:10) — the schemer's own device returning on him, carried as narrative
    pattern with no named divine judgment, and never as formula (doctrinal guardrail).
  - No adds. Re-checked, each failing the presence bar:
    - `slander-and-false-accusation` [engine] — Esther's accusation is true and the chapter
      has no false-witness material.
    - `vengeance` [engine] — the king's wrath and sentence (7:7-10) are royal justice
      narrated, not the concept's leave-vengeance-to-God teaching.
    - `divine-judgment` [engine] — no divine actor appears (God-silence constraint); the
      chapter's justice is the king's.
    - `humble-exaltation` [engine] — withheld per the book-wide Decisions #9 register
      argument (see ch 6).
- Anchor-extension candidates: None — the gallows-reversal refs (7:10; 9:25) already ride the
  adopted Hosea `sowing-and-reaping` tag-gaps row; that id has no engine pack, so an anchor
  proposal has nowhere to land until the row is curated (and Esther refs are corpus-blocked
  regardless).
- Lexicon candidates: None.
- New-concept candidates: None. ("Reap what you sow" narrative queries are the Hosea
  `sowing-and-reaping` row's design question, already logged — not re-proposed.)
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 2 tags — no cap hit; not subdivided (book doc Decisions #19
  deliberately keeps ch 7 whole despite two BSB headings); none.
- Decisions record: None (no yields).

## Esther 8 (subdivided: 8:1–6; 8:7–17)

- Existing tags (book doc): `deliverance`.
- Applied-tag deltas:
  - KEEP `deliverance` [adopted; roster 32] — the way through an irreversible decree (what is
    sealed with the king's ring "may not be reversed by any man", 8:8): the counter-decree
    grants the Jews of every city "to gather themselves together and to defend their lives"
    (8:11), carried by couriers on royal horses — deliverance arriving by decree and rider,
    with no deliverer named beyond the human actors the text supplies. (Only one honest tag
    from the current vocabulary.) Routed to backlog: deliverance (roster row 32).
  - No adds. Re-checked, each failing the presence bar or barred as read-back:
    - `gods-protection` [engine] — the Jews are delivered by decree and sword with no named
      divine protector; the pack is the God-as-shield register (book doc Decisions #12
      stands).
    - `joy-in-the-lord` [engine] — "The Jews had light, gladness, joy, and honor" (8:16) is
      real and unsourced; the decline stands (Decisions #12; the Ezra 6:22
      explicit-attribution precedent cuts against it).
    - `victory-in-christ` [engine] — later-revelation read-back on OT narrative; barred.
    - `nations-and-peoples` [engine] and `gentile-inclusion` [adopted] — "Many from among the
      peoples of the land became Jews" (8:17) is neither the origin-of-nations register nor
      the church-inclusion register (the latter a read-back here; the register-mismatch
      finding recorded on roster row 40 also noted). Checked, not tagged.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 1 tag — no cap hit; SUBDIVIDED in the book doc (8:1–6; 8:7–17)
  → PER-VERSE REFINEMENT candidate.
- Decisions record: None (no yields).

## Esther 9 (subdivided: 9:1–17; 9:18–32)

- Existing tags (book doc): `deliverance`; `vengeance`; `sowing-and-reaping`;
  `appointed-feasts`; `remembrance-and-memorials`.
- Applied-tag deltas:
  - KEEP `deliverance` [adopted; roster 32] — the rescue realized, agent unnamed: "the
    opposite happened, that the Jews conquered those who hated them" (9:1), and the days are
    kept as those in which the Jews "had rest from their enemies" (9:16, 22). Routed to
    backlog: deliverance (roster row 32).
  - KEEP `vengeance` [engine] — decree-authorized avenging narrated without moral comment:
    seventy-five thousand killed "of those who hated them; but they didn’t lay their hand on
    the plunder" (9:16) — reported exactly, neither endorsed nor condemned, as the text itself
    passes no verdict.
  - KEEP `sowing-and-reaping` [adopted — canonical list, engine-built: no] — the letters' own
    summary of the story's pattern: "his wicked plan, which he had planned against the Jews,
    should return on his own head" (9:25) — stated as the narrative's shape, never as formula.
  - KEEP `appointed-feasts` [engine] — Purim instituted: "a day of gladness and feasting, a
    holiday, and a day of sending presents of food to one another" (9:19); "they called these
    days “Purim”, from the word “Pur.”" (9:26) — presented as taken on by the Jews themselves,
    with no divine command anywhere in the chapter (the self-imposed caveat the pack's
    existing Esther 9:20-28 anchor context requires).
  - KEEP `remembrance-and-memorials` [adopted; roster 33] — a feast, not a stone, as the
    memorial: the days "should be remembered and kept throughout every generation" (9:28), the
    memory never to perish. Routed to backlog: remembrance-and-memorials (roster row 33 —
    Esth 9:26-28 is named in that row's spine).
  - No adds. Re-checked, each failing the presence bar:
    - `generosity` [engine] — "gifts to the needy" (9:22) is one phrase inside the feast
      ordinance; presence bar fails for a tag (book doc motif 13's lexicon-color-only flag
      honored — see lexicon below).
    - `thanksgiving` / `worship` [engine] — Purim is instituted with feasting and gladness but
      without one word of thanks or worship toward God; the declines stand (Decisions #12;
      God-silence constraint).
    - `oaths-and-vows` [engine] — "imposed on themselves" (9:27, 31) is obligation language
      with no oath or vow vocabulary (the 1 Chronicles 29:24 withdrawal precedent's caution
      applies).
    - `joy-in-the-lord` [engine] — gladness unsourced, as ch 8.
- Anchor-extension candidates: None proposed. Two deliberate non-proposals recorded:
  - `appointed-feasts` — the pack's existing Esther 9:20-28 (w0.6) anchor already spans the
    institution; widening to 9:29-32 (the confirming letters) adds nothing a learner needs.
  - `vengeance` @ Esther 9 — deliberately NOT proposed: the pack's register is
    vengeance-belongs-to-God / do-not-repay (Rom 12:19-21 keystone), and an Esther 9 anchor
    would hand "revenge"/"vengeance" searchers authorized-avenging narrative — the very
    misroute the row's standing wording concern warns against. The display tag above carries
    the chapter honestly; the engine pack should not.
- Lexicon candidates:
  - `appointed-feasts` [engine] | "purim" (secondary form: "feast of purim") | realistic
    phrasings: "Purim in the bible", "what is the feast of Purim", "why do Jews celebrate
    Purim" — the pack anchors Esther 9:20-28 yet its lexicon carries no Purim term at all;
    "Purim" searchers currently have no route to the pack's own anchor.
    CORPUS-BLOCKED-UNTIL-EXPANSION (the anchor cannot surface while Esther is absent from the
    corpus).
  - `generosity` [engine] | "gifts to the needy" | realistic phrasings: "giving gifts to the
    needy", "giving to the poor in the bible" — lexicon color only, honoring the book doc's
    motif-13 flag; no Esther anchor proposed (presence bar fails for a tag, and the term could
    in principle be measured against the pack's existing anchors — that check belongs to
    curation, not this ledger). Esther-anchored measurement CORPUS-BLOCKED-UNTIL-EXPANSION.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 5 tags — under soft cap 6; SUBDIVIDED in the book doc (9:1–17;
  9:18–32) → PER-VERSE REFINEMENT candidate.
- Decisions record: None (no yields).

## Esther 10

- Existing tags (book doc): `leadership`.
- Applied-tag deltas:
  - KEEP `leadership` [engine] — influence held and spent for a people's good, the epilogue's
    whole note: Mordecai next to the king, "seeking the good of his people and speaking peace
    to all his descendants" (10:3). (Only one honest tag from the current vocabulary.)
  - No adds. Re-checked, each failing the presence bar:
    - `servanthood` [engine] — 10:3 is advocacy from high position, not the serve-one-another
      teaching register.
    - `humble-exaltation` [engine] — Mordecai's rise is reported with no exalting agent named;
      the book-wide Decisions #9 withhold stands.
    - `blessing` [engine] — no blessing language in the three verses.
- Anchor-extension candidates:
  - `leadership` [engine] | Esther 10:3 | "seeking the good of his people and speaking peace
    to all his descendants" | proposed w0.55 — joins the pack's narrative anchors
    (Exod 18:13-26; Ps 78:70-72); a compact influence-spent-for-others exemplar.
    CORPUS-BLOCKED-UNTIL-EXPANSION.
- Lexicon candidates:
  - `leadership` [engine] | "using influence for good" | realistic phrasings: "using your
    influence for good", "using your position to help others" — book doc motif 12's
    phrasings; the pack's lexicon carries "godly leader" / "biblical leadership" but not the
    influence register — curator should verify against the live lexicon before any row.
    CORPUS-BLOCKED-UNTIL-EXPANSION as to Esther-anchored measurement.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 1 tag — no cap hit; not subdivided; none.
- Decisions record: None (no yields).

# Book summary (Esther, 10 chapters — sweep complete)

- Chapters swept: 10/10 against the 239-id engine library + the canonical 161-id adopted list
  (tag-apply/adopted-concepts.md) + the reviewed declines and contested-call rulings.
- Applied-tag deltas: ADD 0 / KEEP 20 / DROP 0. Chapter 1's honest-and-empty state is
  confirmed, not changed. Every keep carries an in-chapter, byte-verified WEB quote. The
  book's God-silence held everywhere: no candidate naming God as actor cleared the bar outside
  the existing ch-4 `providence` call, and none was forced.
- Anchor-extension candidates: 4, ALL CORPUS-BLOCKED-UNTIL-EXPANSION —
  1. fasting | Esther 4:3 | w0.5
  2. envy-and-jealousy | Esther 5:9-13 | w0.7
  3. self-deception | Esther 6:6 | w0.7
  4. leadership | Esther 10:3 | w0.55
  Two deliberate non-proposals recorded in place (vengeance @ Esth 9 — misroute risk;
  appointed-feasts widening — no value); one routed instead of proposed
  (sojourners-and-strangers @ Esth 2:5-6 → roster row 45, Jesse-gated).
- Lexicon candidates: 4, ALL CORPUS-BLOCKED-UNTIL-EXPANSION as to Esther-anchored
  measurement —
  1. providence | "for such a time as this" (the strongest of the four: the pack anchors
     Esther 4:14 with no lexicon route to it)
  2. appointed-feasts | "purim"
  3. generosity | "gifts to the needy" (lexicon color only, per the book doc's motif-13 flag)
  4. leadership | "using influence for good"
- New-concept candidates: 0 — every theme genuinely present has a home in the engine
  vocabulary, the adopted list, or a corpus-blocked roster row. Honest-and-empty preferred
  over invention.
- Decline-overturn proposals: 0 — no new textual evidence surfaced against any recorded
  decline (drunkenness 1:10; lament 4:1-3; betrayal; justice-and-oppression;
  gods-plan-for-israel routing — all re-checked, all standing).
- Backlog routings (route, don't duplicate — 5 roster ids, 10 chapter-level routings):
  - roster row 4 persecuted-for-gods-word — ch 3
  - roster row 17 courage — chs 4, 5, 7
  - roster row 32 deliverance — chs 4, 8, 9
  - roster row 33 remembrance-and-memorials — ch 9
  - roster row 45 exile-and-captivity — chs 2, 3 (Jesse-gated fold-vs-separate; nothing
    prejudged)
- Ceiling / refinement: NO chapter hit the soft cap 6 or the hard ceiling 8 (max is ch 9 at 5
  tags); zero §11.6 yields, zero Decisions-record entries needed. PER-VERSE REFINEMENT
  candidates (book-doc subdivision): chapters 1, 2, 5, 8, 9.
- tag-gaps.md: NO appends made — no new vocabulary gap found (checked against the live table's
  Esther appends of 2026-08-23/25, the current vocabulary, and the declines/roster). The
  shared file was not touched by this thread.

# Survival audit (CONVENTIONS §9, final — 2026-08-26)

- Write history: this file was built in 6 atomic end-of-file appends (header; vocabulary-
  reference update + chs 1–2; chs 3–4; chs 5–7; chs 8–10; book summary), plus this audit
  block. No whole-file rewrite occurred at any point.
- Prior-bytes verification: after EVERY append, the entire pre-existing prefix was re-hashed
  and matched byte-identical (md5 chain: 5,006 B → 10,060 B → 16,750 B → 23,160 B →
  31,275 B → 34,005 B, each prefix verified against the recorded hash of the previous full
  file). PASS at every step.
- Block presence at final re-read: header + vocabulary-reference update + 10 chapter blocks
  (Esther 1–10, each with the full 9-part legend) + book summary — all present, in order,
  exactly once (heading enumeration confirmed at file state md5 d3a4fb48b32a2d4a3d16b51d83493d7f,
  34,005 bytes, immediately before this block).
- Quote re-verification at audit time: all 48 WEB spans quoted anywhere in this ledger were
  re-verified byte-for-byte (grep -F) directly against the pinned VPL's EST lines
  (pipeline/sources/vpl/engwebp_vpl.txt, 167 verse lines) — 48/48 PASS.
- God-silence re-check at audit time: case-insensitive grep for god/lord/yahweh over the 167
  pinned EST lines = 0 occurrences — the constraint held in source and in this ledger.
- Shared-file discipline: this thread wrote ONLY this ledger file. tag-gaps.md, esther.md,
  and every other book's ledger were left untouched.
- Anomaly for the coordinator (does not affect this ledger's integrity): the scout-scratchpad
  directory this worker was pointed at is in practice SHARED with sibling book workers — a
  sibling (2 Samuel, by content) overwrote the generic filename quotes.txt there mid-sweep.
  This ledger's verification was unaffected (re-run under a unique filename,
  esther-ledger-quotes-verify.txt, directly against the repo VPL); sibling workers should
  avoid generic filenames in that scratchpad.
- AUDIT RESULT: PASS — all blocks survive, prior bytes unchanged throughout, every quote
  pinned-text-verified.
