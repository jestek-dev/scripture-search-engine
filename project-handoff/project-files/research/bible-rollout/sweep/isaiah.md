# Isaiah sweep ledger (Layer-3 tag sweep — Isaiah–Daniel thread)

- Book: Isaiah — chapters 1–66 (complete).
- Sweep thread: Isaiah–Daniel group (Major Prophets), whole-Bible coverage plan Layer 3.
- Repo: scripture-search-engine @ origin/main SHA `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (pinned).
- Date: 2026-08-26.
- Sources: engine concept inventory — 239 ids in `ontology/concepts/*.yaml` at the pinned SHA
  (scratchpad `concept-inventory.md` census); adopted display vocabulary — the canonical §11.1 list,
  `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids, engine-built
  flags; verbatim scratchpad copy `adopted-concepts-canonical.md`), which supersedes the brief's §5
  reconstruction rule per the 2026-08-26 addendum. Prior art: `isaiah.md` book doc (tags as of the
  2026-08-25 passes); `declines-and-contested.md`; `corpus-blocked-roster.md` (50 rows). Quote
  source: WEB verse-per-line chapter files (`web-text/isaiah/<N>.txt`, split from the
  checksum-verified pinned source).
- Assembled from three chunk drafts (chapters 1–22 / 23–44 / 45–66), each independently verified by
  the assembly pass (mechanical results below). Chunk headers and entries are reproduced verbatim;
  assembly corrections are recorded here, never silently edited into chunk text.

## FLAG — ch 38 id-form reconciliation (pastoral-* prefixed ids), RESOLVED with corrected wording

`pastoral-serious-illness` and `pastoral-prayer-for-healing` (KEEPs on Isaiah 38) appear on neither
the scratchpad 239-id census nor the canonical adopted list — the chunk-2 worker flagged them as
"legacy 131-id-snapshot forms". **Assembly verification against the repo at the pinned SHA
corrects that reading**: the 14 pastoral-* packs' YAML `id:` fields carry the UNPREFIXED forms
(the scratchpad census was parsed from `id:` fields), while the canonical ledger form is the
PREFIXED filename per CONVENTIONS §5 ("never strip a prefix"). Verified at
`e762d1c`: `ontology/concepts/pastoral-serious-illness.yaml` carries `id: serious-illness-and-dying`;
`ontology/concepts/pastoral-prayer-for-healing.yaml` carries `id: prayer-for-healing`. So both
ch 38 tags are CANONICAL filename forms of live engine packs — not legacy ids — and the chunk-2
header/entry wording ("legacy 131-id vocabulary snapshot … the current engine carries the same
registers") is superseded by this note; the registers named there are those packs' own `id:` fields.
The same resolution covers the prior-art removal citations `pastoral-god-sees-my-suffering`
(`id: god-sees-my-suffering`), `pastoral-grief-and-loss` (`id: grief-and-loss`),
`pastoral-hope-in-despair` (`id: hope-in-despair`), and `pastoral-relapse-and-restoration`
(`id: relapse-and-restoration`). Ch 38's anchor-extension candidates target the `id:`-field forms
(`serious-illness-and-dying` / `prayer-for-healing`); curation should key them to the same packs.

## Assembly verification statement (independent, mechanical — 2026-08-26)

Scripted checks run by the assembly pass against the chunk files, `web-text/isaiah/`,
`concept-inventory.md` (239 ids), `adopted-concepts-canonical.md` (161 ids),
`corpus-blocked-roster.md` (50 rows), and `ontology/concepts/` filenames at the pinned SHA.
The chunk workers' self-reports were not trusted; every result below was recomputed.

1. **Coverage/order:** 66 of 66 chapter entries present, strictly ordered 1–66 across the three
   chunks; every entry carries the full Torah-ledger field set (existing tags → deltas → anchor
   candidates → lexicon candidates → new-concept candidates → overturns → ceiling/refinement →
   Decisions record). Surface formatting varies by chunk (dash-bullets / numbered 1–8 / labeled
   lines); field content is uniform.
2. **Quotes:** 352 quoted strings (≥8 chars) extracted and grepped against the WEB chapter files
   (normalization: typographic-quote folding and whitespace collapse only). 188 matched
   byte-for-byte, including every string presented as WEB text with a verse ref. The 164
   non-matching strings were individually reviewed: all are lexicon terms, realistic-query
   phrasings, existing pack-lexicon phrases, book-doc/roster/decline citations, or motif names —
   none is WEB-attributed. One truncation verified: ch 64's `"Will you keep silent…?"` (64:12) —
   the retained words are verbatim WEB; the ellipsis marks the elision. One labeled cross-chapter
   citation (ch 36 entry quoting 42:3, "He won't break a bruised reed.") verified against its
   stated chapter. **Zero composed quotes.**
3. **Id resolution:** 131 distinct backticked concept ids across the chunks. Every one resolves:
   engine YAML id (census) or engine pastoral-* filename form (verified against
   `ontology/concepts/` at the pinned SHA — see the FLAG above), or canonical adopted-list id, or
   corpus-blocked roster row, or the one explicitly labeled new-concept candidate
   (`peaceable-kingdom`). **Zero unresolved/unlabeled ids.** Adopted-only ids used as tags:
   `peace-among-nations` (ch 2), `outpouring-of-the-spirit` (chs 32, 44), `sovereignty-of-god`
   (chs 40, 45) — each cited to the canonical list in its chunk; `gentleness-of-christ`
   considered-and-not-applied (ch 42).
4. **ADD/Decisions discipline:** all 16 ADDs carry word-for-word WEB quotes (verified); every ADD,
   yield, and considered-not-added call has its Decisions-record line (verified per chapter).
   No DROPs anywhere; no silent yields found.
5. **Totals:** every chunk's self-reported totals recomputed mechanically and confirmed exactly
   (ADD 2/5/9; KEEP 92/92/104; anchors 18/27/24; lexicon 7/12/19). **No count corrections were
   required.** (Ch 38's "Existing tags" line shows 6 backticked ids; two are the parenthetical
   register references — true count 4, as the chunk reported.)
6. **Cross-chunk dedupe/reconciliation:** no identical candidate (same id + same verse range, or
   same lexicon phrase) is proposed twice; the ch 19 + ch 56 routings to roster row 40 are merged
   in the book totals below. Reconciliation notes (both candidates KEPT in every case):
   - `zion-city-of-god`: ch 33 (33:20–21) and ch 60 (60:14) EACH claim "first non-Psalms anchor
     for the pack". Both anchor candidates stand; at most one can be "first" — curation decides
     jointly (chs 60/62 display ADDs are related context).
   - `fear-of-the-lord` (8:12–13; 66:2), `humble-exaltation` (10:13–15; 14:12–15; 29:19–20;
     57:15), `vengeance` (34:8; 63:4): each pack drew independent "no Isaiah anchor" candidates
     from different chunks — all stand; curate per pack as one batch.
   - `restoration-of-israel`: three regathering extensions proposed independently (11:11–12;
     27:12–13; 60:4), each noting the pack's sole Isaiah anchor 43:5–7 — curate as one set; the
     ch 11 note also carries the recorded `restoration`-register TENSION (§1(e)), unresolved by
     design.
   - `resurrection-of-the-dead` (25:8; 26:19), `holy-spirit` (32:15; 44:3), `trusting-in-man`
     (2:22; 20:5–6; 30:1–3; 36:6), `prayer` (37:14–20; 62:6–7; 65:24), `god-reigns` (24:23;
     33:22): intra- and cross-chunk companion candidates, self-consistent (chunk text
     cross-references them); no conflict.
   - Consistent cross-chunk treatments verified: the ch 41→44 `the-first-and-the-last` lexicon
     deferral is delivered at ch 44; the ch 36 "bruised reed" collision caution is carried by the
     ch 42 lexicon row; the ch 45 "holy one of israel" candidate covers ch 47's occurrence as
     stated; Egypt-trust (`trusting-in-man`) is handled identically in chunks 1 and 2.

---

## CHUNK 1 of 3 — chapters 1–22 (worker draft, verbatim)

# Isaiah sweep chunk — chapters 1–22 (Layer-3 tag sweep, Major Prophets thread)

- Book: Isaiah — chapters 1–22 (chunk 1 of the Isaiah sweep; assembly appends this to isaiah-sweep-ledger.md)
- Date: 2026-08-26
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e (pinned)
- Concept library at thread start: 239 packs in ontology/concepts/ (per concept-inventory.md)
- Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/isaiah.md
- WEB text (quote source, byte-verified): scratchpad web-text/isaiah/<N>.txt
- Adopted-id note: every tag id below is an exact id from the 239-pack engine inventory EXCEPT
  `peace-among-nations` (Isaiah 2), which is an adopted display id — source: the canonical §11.1
  adopted list, /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md line 130
  (`peace-among-nations` — engine-built: no; local copy verified: scratchpad
  adopted-concepts-canonical.md), applied to isaiah.md ch 2 by the 2026-08-25 tag-application pass
  (isaiah.md Decisions record #63, log 1274); engine-side it sits on the corpus-blocked roster,
  row 29. The ch 11 new-concept candidate `peaceable-kingdom` was also checked against the
  canonical adopted list: absent — it remains a genuine gap.
- Entry format: Torah-ledger Legend (genesis-sweep-ledger.md) — existing tags → applied-tag deltas →
  anchor-extension candidates → lexicon candidates → new-concept candidates → decline-overturn
  proposals → ceiling/refinement flags → Decisions record.

---

## Isaiah 1 (subdivided: 1:1–9 / 1:10–20 / 1:21–31)
- Existing tags (book doc): `sin`, `repentance`, `forgiveness-of-sins`, `divine-judgment`, `empty-worship`, `justice-and-oppression`, `remnant` (7)
- Applied-tag deltas: No changes — KEEP all 7; each re-verified against the chapter text (indictment 1:4; wash/cease/learn 1:16–17; scarlet-to-snow 1:18; purging 1:25, 28–31; refused sacrifices 1:11–15; fatherless-and-widow justice 1:17, 21–23; very small remnant 1:9). The chapter is already the engine's own anchor ground for five of these packs (empty-worship 1:11–17; forgiveness-of-sins 1:18; justice-and-oppression 1:21–23; remnant 1:9; obedience-to-the-word 1:19–20).
- Anchor-extension candidates:
  - `repentance` | Isaiah 1:16–17 | “Wash yourselves. Make yourself clean. Put away the evil of your doings from before my eyes. Cease to do evil.” | w=0.75 — the pack's OT anchors lack Isaiah; this is the book's own turn-from-sin imperative, already the tag's justification in the book doc.
- Lexicon candidates:
  - `forgiveness-of-sins` | term: “come let us reason together” | queries: “come now let us reason together meaning”; “let us reason together verse”; “what does isaiah 1:18 mean”. (The pack anchors Isa 1:18 already and carries “white as snow”; the reason-together phrase itself is unserved.)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (1:1–9 / 1:10–20 / 1:21–31) — mark for per-verse refinement. Sits at 7 tags (above soft cap 6, below ceiling 8, per the book doc's recorded §11 pass).
- Decisions record: None (no yields; no drops).

## Isaiah 2 (subdivided: 2:1–4 / 2:5–22)
- Existing tags (book doc): `nations-and-peoples`, `humble-exaltation`, `divine-judgment`, `day-of-the-lord`, `idolatry`, `peace-among-nations` (6)
- Applied-tag deltas: No changes — KEEP all 6. `peace-among-nations` is the adopted display id (source noted in header); its in-chapter warrant stands: “They shall beat their swords into plowshares” (2:4).
- Anchor-extension candidates:
  - `trusting-in-man` | Isaiah 2:22 | “Stop trusting in man, whose breath is in his nostrils; for of what account is he?” | w=0.75 — the pack's exact register (Jer 17:5–6, Ps 146:3–4, Isa 31:1); this closing imperative is its Isaianic thesis verse.
  - `day-of-the-lord` | Isaiah 2:12 | “For there will be a day of the LORD of Armies for all that is proud and arrogant” | w=0.7 — the pack anchors Isa 13:6–13 but not this first named-day oracle.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (2:1–4 / 2:5–22) — mark for per-verse refinement.
- Decisions record:
  - `trusting-in-man` considered as a tag ADD and not applied: single-verse presence (2:22 only) — below the honest-substantial-presence bar at chapter level; carried as the anchor-extension candidate above instead.
  - ROUTED, not duplicated: swords-into-plowshares material (2:2–4) belongs to `peace-among-nations`, already on the corpus-blocked roster, row 29 (“the row IS those two texts” — Mic 4:1–4; Isa 2:2–4); engine-side findings ride that row at re-pin.

## Isaiah 3
- Existing tags (book doc): `divine-judgment`, `sin`, `humble-exaltation`, `justice-and-oppression` (4)
- Applied-tag deltas: No changes — KEEP all 4; each verified in-chapter (3:13 contend-and-judge; 3:8–9 parade-their-sin; 3:16–17, 24–26 arrogant daughters brought low; 3:14–15 vineyard-eaters).
- Anchor-extension candidates:
  - `justice-and-oppression` | Isaiah 3:14–15 | “you crush my people, and grind the face of the poor” | w=0.75 — the pack carries Isa 1:21–23 and 10:1–2; this courtroom charge is the book's third and most-quoted oppression text.
- Lexicon candidates:
  - `justice-and-oppression` | term: “grind the face of the poor” | queries: “grinding the faces of the poor meaning”; “what does the bible say about crushing the poor”. (Distinctive phrase, currently in no lexicon.)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## Isaiah 4
- Existing tags (book doc): `restoration`, `holiness`, `gods-protection`, `remnant` (4)
- Applied-tag deltas: No changes — KEEP all 4 (branch and washing 4:2–4; “shall be called holy” 4:3; canopy and pavilion 4:5–6; the survivors themselves 4:2–3). The `restoration`-register TENSION recorded beside the live `restoration-of-israel` row (declines-and-contested §1(e)) is noted and left to the curator, per that record's own instruction.
- Anchor-extension candidates:
  - `refuge-in-trouble` | Isaiah 4:6 | “for a refuge and for a shelter from storm and from rain” | w=0.6 — the pack's lexicon already carries “shelter in the storm”; this verse is its most literal OT wording (supporting weight; Zion-eschatology context noted for the curator).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## Isaiah 5 (subdivided: 5:1–7 / 5:8–30)
- Existing tags (book doc): `sin`, `divine-judgment`, `self-deception`, `humble-exaltation`, `justice-and-oppression` (5)
- Applied-tag deltas:
  - ADD `drunkenness` — two of the six woes are drink-woes with teaching substance, not scene-setting: “Woe to those who rise up early in the morning, that they may follow strong drink” (5:11, with the feasts that “don’t respect the work of the LORD”, 5:12), and “Woe to those who are mighty to drink wine, and champions at mixing strong drink” (5:22), whose drinking corrupts justice (5:23). Chapter lands at 6 — the soft cap, every tag independently clearing the bar.
  - KEEP the existing 5 (verified: woes catalog 5:8–23; wasteland verdict 5:5–6, 25–30; evil-for-good inversion 5:20–21; brought-low/exalted 5:15–16; vineyard verdict 5:7).
- Anchor-extension candidates:
  - `drunkenness` | Isaiah 5:11–12 | “Woe to those who rise up early in the morning, that they may follow strong drink” | w=0.7 — the pack has Proverbs and NT anchors only; this is the prophets' woe-register witness.
- Lexicon candidates:
  - `self-deception` | term: “call evil good and good evil” | queries: “woe to those who call evil good”; “calling evil good and good evil verse”; “what does the bible say about calling wrong right”. (Isa 5:20 is the phrase's source text; no lexicon carries it.)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (5:1–7 / 5:8–30) — mark for per-verse refinement. Lands at soft cap 6 after the ADD (no yield needed).
- Decisions record: None (the ADD displaces nothing; no drops).

## Isaiah 6
- Existing tags (book doc): `holiness`, `presence-of-god`, `forgiveness-of-sins`, `surrender-to-god`, `divine-judgment`, `angels`, `remnant` (7)
- Applied-tag deltas: No changes — KEEP all 7 (thrice-holy 6:3–5; throne vision 6:1–4; live coal 6:6–7; “Here I am. Send me!” 6:8; waste-cities commission 6:11–13; seraphim 6:2–7; stump 6:13).
- Anchor-extension candidates:
  - `surrender-to-god` | Isaiah 6:8 | “Here I am. Send me!” | w=0.8 — one of the most-searched surrender texts; the pack has no Isaiah anchor.
  - `hardness-of-heart` | Isaiah 6:9–10 | “Make the heart of this people fat. Make their ears heavy, and shut their eyes” | w=0.75 — the judicial-hardening commission the Gospels later cite; the pack's OT anchors are Exodus/Psalms/Ezekiel only.
- Lexicon candidates:
  - `surrender-to-god` | term: “here i am send me” | queries: “here am I send me verse”; “whom shall I send bible”; “here I am Lord send me”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: not subdivided; sits at 7 tags (above soft cap, below ceiling, per the book doc's recorded pass) — no ceiling hit.
- Decisions record:
  - `hardness-of-heart` considered as a tag ADD and not applied: 6:9–10 is genuinely present but is God's judicial word about the people rather than a chapter main theme, and adding it would push the chapter to the hard ceiling of 8 for a two-verse presence — §11.6 thin-single-verse reasoning applied preemptively; carried as the anchor-extension candidate above instead.

## Isaiah 7 (subdivided: 7:1–9 / 7:10–16 / 7:17–25)
- Existing tags (book doc): `trust-in-god`, `fear-not`, `doubt`, `divine-judgment`, `messianic-prophecy` (5)
- Applied-tag deltas: No changes — KEEP all 5 (believe-or-not-established 7:9; “Don’t be afraid” 7:4; Ahaz's refusal 7:12–13, ratified use per Decisions #10; Assyria-as-razor 7:17–25; Immanuel sign 7:14, already an engine anchor of `messianic-prophecy`).
- Anchor-extension candidates:
  - `trust-in-god` | Isaiah 7:9 | “If you will not believe, surely you shall not be established” | w=0.6 — the crisis-hinge maxim; supporting weight because it is a warning-form witness rather than an exhortation.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (7:1–9 / 7:10–16 / 7:17–25) — mark for per-verse refinement.
- Decisions record: None.

## Isaiah 8 (subdivided: 8:1–10 / 8:11–18 / 8:19–22)
- Existing tags (book doc): `fear-not`, `trust-in-god`, `gods-protection`, `divine-judgment`, `occult-and-divination`, `false-prophets` (6)
- Applied-tag deltas: No changes — KEEP all 6 (fear redirected 8:12–13; “I will wait for the LORD” 8:17; sanctuary and God-with-us 8:10, 14; flood to the neck 8:7–8 and thick darkness 8:21–22; mediums vs. the law 8:19–20 — the pack's own anchor; test-the-voices 8:20).
- Anchor-extension candidates:
  - `fear-of-the-lord` | Isaiah 8:12–13 | “The LORD of Armies is who you must respect as holy. He is the one you must fear.” | w=0.7 — the fear-displacement teaching (fear God, not their threats); the pack has no Isaiah anchor.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (8:1–10 / 8:11–18 / 8:19–22) — mark for per-verse refinement. At soft cap 6.
- Decisions record: None.

## Isaiah 9 (subdivided: 9:1–7 / 9:8–21)
- Existing tags (book doc): `hope-in-god`, `divine-judgment`, `the-lords-discipline`, `messianic-prophecy`, `deity-of-christ` (5)
- Applied-tag deltas: No changes — KEEP all 5 (gloom-to-light 9:1–2 with the child-king 9:6–7; open-mouth devouring and the four-fold refrain 9:12, 17, 21; unheeded correction 9:13; the born-child oracle 9:6–7 — an engine anchor of both `messianic-prophecy` and `deity-of-christ`, the latter carried strictly per the book doc's signpost rule, Decisions #64).
- Anchor-extension candidates:
  - `light-and-darkness` | Isaiah 9:2 | “The people who walked in darkness have seen a great light” | w=0.7 — the pack is currently all-Johannine; this is the OT source text of the light-dawning image and a heavily-queried verse.
- Lexicon candidates:
  - `light-and-darkness` | term: “walked in darkness have seen a great light” | queries: “people who walked in darkness have seen a great light meaning”; “great light verse isaiah”; “light in the darkness bible verse”. NOTE for the curator: the recorded Isaiah decline (declines-and-contested §3.5, Isaiah — “light in darkness → plausibly walking-in-the-light — if lexicon coverage proves thin … revisit as a lexicon extension, not a new id”) is honored: this is exactly a lexicon-extension proposal, no new id; the decline named `walking-in-the-light` as the plausible home, this sweep finds `light-and-darkness`'s register (light shining on people in darkness) the closer fit — both homes are listed so the curator routes once, with the original decline in view.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (9:1–7 / 9:8–21) — mark for per-verse refinement.
- Decisions record:
  - `light-and-darkness` considered as a tag ADD and not applied: the light image lives in 9:1–2 only (the oracle then moves to the child and to judgment) — thin at chapter level; carried as anchor-extension + lexicon candidates above.

## Isaiah 10 (subdivided: 10:1–4 / 10:5–19 / 10:20–34)
- Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `providence`, `fear-not`, `remnant`, `justice-and-oppression` (6)
- Applied-tag deltas: No changes — KEEP all 6 (judgment on rulers and on Assyria's pride 10:3–4, 12, 16–19; ax-boast answered 10:13–15, 33; rod-of-my-anger providence 10:5–7; “don’t be afraid of the Assyrian” 10:24–27; remnant-returns section 10:20–22 — the pack's own anchor; unrighteous-decrees woe 10:1–2 — likewise the pack's own anchor).
- Anchor-extension candidates:
  - `humble-exaltation` | Isaiah 10:13–15 | “Should an ax brag against him who chops with it?” | w=0.7 — the pride-of-the-instrument taunt; the pack has no Isaiah anchor despite the book's recorded pride-routing (declines-and-contested §3.5, Isaiah).
  - `providence` | Isaiah 10:5–7 | “Alas Assyrian, the rod of my anger, the staff in whose hand is my indignation!” | w=0.7 — God wielding a pagan empire that “doesn’t mean so” (10:7); the pack's Isaiah anchors are ch 40 only.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (10:1–4 / 10:5–19 / 10:20–34) — mark for per-verse refinement. At soft cap 6.
- Decisions record: None.

## Isaiah 11
- Existing tags (book doc): `nations-and-peoples`, `restoration`, `messianic-prophecy`, `remnant`, `justice-and-oppression` (5)
- Applied-tag deltas: No changes — KEEP all 5 (root-of-Jesse banner for the nations 11:10, 12; second-time regathering and highway 11:11–16; the shoot-from-Jesse oracle 11:1–10 — the pack's own anchor; remnant recovered 11:11, 16; judging the poor with righteousness 11:3–4).
- Anchor-extension candidates:
  - `restoration-of-israel` | Isaiah 11:11–12 | “the Lord will set his hand again the second time to recover the remnant that is left of his people” | w=0.8 — the regathering register in its own words; the pack's Isaiah anchor is 43:5–7 only. (Display-tag routing between `restoration` and `restoration-of-israel` on this chapter is the recorded register TENSION, declines-and-contested §1(e) — left to the curator; this engine-side anchor candidate stands on the pack's own regathering gist either way.)
- Lexicon candidates: None.
- New-concept candidates:
  - proposed-id `peaceable-kingdom` | rationale: no current or adopted id serves the creation-at-peace / animals-reconciled register — a genuinely searched family (“the lion will lay down with the lamb” — folk phrasing of this very text) with no vocabulary home (`peace-among-nations` is nation-vs-nation disarmament, and it is corpus-blocked roster row 29; `peace-of-god` is inner peace) | anchor: Isaiah 11:6–9 — “The wolf will live with the lamb, and the leopard will lie down with the young goat” … “They will not hurt nor destroy in all my holy mountain” (companion text Isa 65:25, outside this chunk) | queries: “lion lays down with the lamb verse”; “wolf and the lamb bible”; “will animals be at peace in heaven” | CHECK-FIRST FLAG: decide fold-vs-mint against `peace-among-nations` (roster row 29) at re-pin — one eschatological-peace concept or two registers; do not mint both without that decision.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (not subdivided; 5 tags).
- Decisions record:
  - `restoration-of-israel` considered as a tag ADD (both-tags ruling) and not applied: pre-deciding the recorded `restoration`-register TENSION (§1(e)) is exactly what that record instructs threads not to do; engine-side candidate carried above instead.

## Isaiah 12
- Existing tags (book doc): `thanksgiving`, `salvation`, `trust-in-god`, `joy-in-the-lord`, `praise` (5)
- Applied-tag deltas: No changes — KEEP all 5 (thanks 12:1, 4; “God is my salvation” 12:2–3 — 12:2 is already an `assurance-of-salvation` engine anchor; trust-not-afraid 12:2; joy at the wells 12:3; sing-his-excellent-things 12:5–6).
- Anchor-extension candidates: None.
- Lexicon candidates:
  - `salvation` | term: “wells of salvation” | queries: “draw water from the wells of salvation meaning”; “wells of salvation verse”. (Distinctive phrase of 12:3; no lexicon carries it.)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## Isaiah 13
- Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `day-of-the-lord` (3)
- Applied-tag deltas: No changes — existing tags sound (cruel-day oracle 13:9 — already the `day-of-the-lord` pack's own anchor at 13:6–13; arrogance-humbled 13:11; Medes and Sodom-like end 13:17–22). Honest-and-empty on deltas.
- Anchor-extension candidates: None — the chapter's distinctive material is already anchored in-pack.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## Isaiah 14 (subdivided: 14:1–2 / 14:3–23 / 14:24–27 / 14:28–32)
- Existing tags (book doc): `humble-exaltation`, `divine-judgment`, `providence`, `restoration`, `mortality` (5)
- Applied-tag deltas: No changes — KEEP all 5 (self-exaltation brought to the pit 14:13–15; Babylon/Assyria/Philistia sentences 14:22–31; sworn purpose 14:24–27; compassion-on-Jacob 14:1–3; Sheol scene 14:9–20).
- Anchor-extension candidates:
  - `humble-exaltation` | Isaiah 14:12–15 | “I will make myself like the Most High!” | w=0.75 — the five “I will” boasts answered by “Yet you shall be brought down to Sheol, to the depths of the pit” (14:15); among the most-searched pride texts, unanchored in any pack.
- Lexicon candidates:
  - `humble-exaltation` | terms: “fallen from heaven”; “son of the dawn” | queries: “how you have fallen from heaven meaning”; “who is lucifer in isaiah 14”; “morning star fallen from heaven”. ADJUDICATION GUARD (covenant #6): these route the searcher to the Isaiah 14 text itself, which the WEB addresses to the king of Babylon; the fall-of-Satan identification stays a signposted historic reading (book doc, Decisions #55), and the refs must NOT be appended to the `satan` pack — same guard as the recorded Ezek 28 non-append (declines-and-contested §1(e)).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (14:1–2 / 14:3–23 / 14:24–27 / 14:28–32) — mark for per-verse refinement.
- Decisions record:
  - 14:32's Zion-refuge line (“the LORD has founded Zion, and in her the afflicted of his people will take refuge”) re-checked and left alone — the book doc's passing-mention drop of `refuge-in-trouble` here (Decisions #53) stands; one verse, no new evidence.

## Isaiah 15
- Existing tags (book doc): `divine-judgment` (1, with the single-tag note)
- Applied-tag deltas: No changes — no concept in the current vocabulary is genuinely present beyond the existing tag (night-fall of Ar and Kir 15:1; “I will bring yet more on Dimon” 15:9). The chapter's other substance is Moab's mourning and the prophet's grief — see routing below. Honest-and-empty on deltas.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record:
  - ROUTED, not duplicated: the prophet's grief over a judged foreign nation — “My heart cries out for Moab!” (15:5, continuing at 16:9, 11) — is adjacent witness material for `gods-compassion-for-outsiders`, already on the corpus-blocked roster, row 9 (Jonah-defined, DEFERRED); noted for that row's re-pin curator, no new candidate minted.
  - `lament` considered and not applied: 15:2–5 is Moab's mourning described within a judgment oracle, not the complaint-to-God practice the lament row documents (consistent with the recorded 1 Sam / 2 Sam / 1 Chr grief-decline pattern, declines-and-contested §1(c)).

## Isaiah 16
- Existing tags (book doc): `humble-exaltation`, `divine-judgment`, `justice-and-oppression` (3)
- Applied-tag deltas: No changes — KEEP all 3 (pride of Moab 16:6, 14; dated sentence 16:13–14; shelter-the-outcasts counsel and the loving-kindness throne 16:3–5).
- Anchor-extension candidates:
  - `hospitality` | Isaiah 16:3–4 | “Hide the outcasts! Don’t betray the fugitive!” | w=0.6 — shelter-the-refugee counsel in imperative form; serves “what does the bible say about refugees” queries the pack's Lev 19:33–34 anchor also serves. (The recorded `sojourners-and-strangers` skip on this chapter — isaiah.md Decisions #63, “sheltering refugees, not living-as-a-foreigner” — is honored: this candidate goes to the sheltering-side pack, not that one.)
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record:
  - `messianic-prophecy` at 16:5 (throne in the tent of David) considered and not proposed: one verse inside the Moab oracle, no in-entry signpost; the theme's homes are chs 7/9/11 (same reasoning as the book doc's ch 4 skip, Decisions #63).

## Isaiah 17
- Existing tags (book doc): `divine-judgment`, `repentance`, `gods-protection`, `idolatry` (4)
- Applied-tag deltas: No changes — KEEP all 4 (ruinous-heap and thinned glory 17:1, 4–6; look-to-their-Maker turn 17:7–8; rebuked nations flee 17:12–14; hand-made altars abandoned 17:7–8).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record:
  - ROUTED, not duplicated: the forgetting-God root of the disaster — “you have forgotten the God of your salvation, and have not remembered the rock of your strength” (17:10) — matches the BORDERLINE forgetting-in-prosperity extension flag carried on `remembrance-and-memorials`, already on the corpus-blocked roster, row 33; noted for that row's re-pin curator, no new candidate minted.

## Isaiah 18
- Existing tags (book doc): `providence`, `divine-judgment` (2)
- Applied-tag deltas: No changes — existing tags sound (still-and-watching 18:4–5, kept per the book doc's borderline flag, Decisions #37; pruning-hooks judgment 18:5–6). Honest-and-empty on deltas.
- Anchor-extension candidates: None — 18:4 was weighed for a `providence` anchor and left: the famously obscure oracle gives the phrase little standalone retrieval value, matching the doc's own borderline flag.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None.

## Isaiah 19 (subdivided: 19:1–15 / 19:16–25)
- Existing tags (book doc): `divine-judgment`, `nations-and-peoples`, `salvation`, `restoration`, `blessing` (5)
- Applied-tag deltas: No changes — KEEP all 5 (Egypt struck 19:1–15; enemies made God's people 19:23–25; savior-and-defender sent 19:20; striking-and-healing return 19:22; threefold blessing 19:24–25 — `benediction` here was already considered and rejected, Decisions #17, and no new evidence disturbs that).
- Anchor-extension candidates:
  - `nations-and-peoples` | Isaiah 19:23–25 | “Blessed be Egypt my people, Assyria the work of my hands, and Israel my inheritance” | w=0.75 — the pack's Isaiah anchors are 2:2–4 and 49:6; this is Scripture's starkest enemies-into-peoples text.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (19:1–15 / 19:16–25) — mark for per-verse refinement.
- Decisions record:
  - ROUTED, not duplicated: the Egypt-and-Assyria-worship material (19:18–25) is witness material for the `gentile-inclusion` question, already on the corpus-blocked roster, row 40 (DEFERRED-to-re-pin, register decision recorded there); noted for that row's re-pin curator alongside its Acts texts, no new candidate minted.

## Isaiah 20
- Existing tags (book doc): `obedience-to-the-word` (1, with the single-tag note)
- Applied-tag deltas:
  - ADD `trusting-in-man` — the chapter's own point, stated in its closing verse: Egypt and Ethiopia were the coastland's hope, and that hope is marched away naked — “Behold, this is our expectation, where we fled for help to be delivered from the king of Assyria. And we, how will we escape?” (20:6, with the dismay of 20:5). This is the misplaced-trust concept's exact teaching substance (its pack pairs Jer 17:5 with Isa 31:1, the same Egypt-trust register), and it completes the book doc's own reading (“a compact warning against trusting a strong neighbor instead of God”) — consistent with Decisions #38, which declined `trust-in-god` here precisely because the chapter depicts trust misplaced. Chapter lands at 2 tags; the single-tag note comes off.
  - KEEP `obedience-to-the-word` (“He did so, walking naked and barefoot”, 20:2).
- Anchor-extension candidates:
  - `trusting-in-man` | Isaiah 20:5–6 | “Behold, this is our expectation, where we fled for help to be delivered from the king of Assyria. And we, how will we escape?” | w=0.65 — narrative enactment of the pack's Isa 31:1 teaching.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none.
- Decisions record: None (the ADD displaces nothing).

## Isaiah 21 (subdivided: 21:1–10 / 21:11–12 / 21:13–17)
- Existing tags (book doc): `divine-judgment` (1, with the single-tag note)
- Applied-tag deltas: No changes — no concept in the current vocabulary is genuinely present beyond the existing tag (fallen-Babylon word 21:9; Kedar's year 21:16–17). Honest-and-empty on deltas.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (21:1–10 / 21:11–12 / 21:13–17) — mark for per-verse refinement.
- Decisions record:
  - `watchman-and-warning` considered and not applied (tag, anchor, or lexicon): Isa 21:6–12's watchman — including the searched exchange “Watchman, what of the night?” (21:11) — is a literal military lookout reporting news, not the warn-the-wicked responsibility register the pack teaches (Ezek 33:1–9; Acts 20:26–27); appending would blur the pack's gist for no honest query gain.

## Isaiah 22 (subdivided: 22:1–14 / 22:15–25)
- Existing tags (book doc): `divine-judgment`, `humble-exaltation` (2)
- Applied-tag deltas: No changes — KEEP both (day of confusion and the unforgiven iniquity 22:5, 14; Shebna brought down, Eliakim clothed 22:16–23).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None — specifically, the recorded non-tag of `repentance` here (isaiah.md Decisions #49: 22:12–13 is God's call met by refusal, a depicted failure of the concept) is re-checked against the text and STANDS; no new textual evidence.
- Ceiling / refinement flags: subdivided in book doc (22:1–14 / 22:15–25) — mark for per-verse refinement.
- Decisions record:
  - The revelers' motto “Let’s eat and drink, for tomorrow we will die” (22:13) weighed for a lexicon home and left without one: `mortality` was already skipped here as the in-scene motto (Decisions #63), and `enjoying-gods-gifts`' eat-and-drink lexicon is the opposite register (Ecclesiastes' grateful enjoyment, not defiant fatalism); routing “eat drink and be merry” queries is a curation call better made at 1 Cor 15:32 (which quotes this verse) — noted, no candidate.
  - The key-of-David oracle (22:22) noted as a motif only (Rev 3:7 later takes up the image): a “key of David” query family exists but is thin and the identification is later-revelation; no gap row proposed.

---

# Chunk totals (chapters 1–22)

- Chapters swept: 22 of 22.
- Applied-tag deltas: ADD 2 (`drunkenness` Isa 5; `trusting-in-man` Isa 20); KEEP 92 existing tag instances; DROP 0. Honest-and-empty (no-delta) chapters: 20 of 22.
- Anchor-extension candidates: 18 (chs 1, 2×2, 3, 4, 5, 6×2, 7, 8, 9, 10×2, 11, 14, 16, 19, 20).
- Lexicon candidates: 7 rows (`forgiveness-of-sins` ch 1; `justice-and-oppression` ch 3; `self-deception` ch 5; `surrender-to-god` ch 6; `light-and-darkness` ch 9; `salvation` ch 12; `humble-exaltation` ch 14).
- New-concept candidates: 1 (`peaceable-kingdom`, Isa 11:6–9, with the mandatory fold-check vs corpus-blocked row 29).
- Decline-overturn proposals: 0.
- Corpus-blocked routings (route, don't duplicate): 4 — `peace-among-nations` (ch 2 → row 29); `gods-compassion-for-outsiders` (chs 15–16 → row 9); `remembrance-and-memorials` forgetting-in-prosperity flag (ch 17 → row 33); `gentile-inclusion` (ch 19 → row 40).
- Ceiling / per-verse refinement flags: no chapter hits the hard ceiling of 8 (chs 1 and 6 sit at 7 per the book doc's recorded passes; ch 5 lands at the soft cap 6 after its ADD). Book-doc-subdivided chapters marked for per-verse refinement: 1, 2, 5, 7, 8, 9, 10, 14, 19, 21, 22 (11 chapters).

## CHUNK 2 of 3 — chapters 23–44 (worker draft, verbatim — ch 38 id-form wording superseded by the FLAG above)

# Isaiah sweep — chunk: chapters 23–44 (Isaiah–Daniel tag sweep, Layer 3)

- Book: Isaiah · Chapter range: 23–44 (22 chapters)
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e (pinned)
- Date: 2026-08-26
- Inputs: sweep-brief.md; concept-inventory.md (239 engine ids); declines-and-contested.md;
  corpus-blocked-roster.md; /mnt/project-files/research/bible-rollout/isaiah.md (prior art);
  web-text/isaiah/<N>.txt (all quotes below copied word-for-word from these files)
- Adopted-id convention (CONVENTIONS §11.1): every tag id below is either (a) an engine id
  present in concept-inventory.md (239 ids @ pinned SHA), or (b) an adopted display id verified
  against the canonical §11.1 list, `adopted-concepts-canonical.md` in this scratchpad (=
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md, 161 ids — this
  citation supersedes the brief's §5 reconstruction rule per the 2026-08-26 mid-sweep update).
  Adopted-only ids used in this chunk (all verified on the canonical list, engine-built: no):
  `outpouring-of-the-spirit` (KEEP, isaiah.md chs 32, 44), `sovereignty-of-god` (KEEP,
  isaiah.md ch 40), `gentleness-of-christ` (considered-and-not-applied at ch 42 only).
  LEGACY-ID NOTE for assembly: `pastoral-serious-illness` and `pastoral-prayer-for-healing`
  (KEEPs on isaiah.md ch 38) are on NEITHER the 239-id engine census NOR the canonical adopted
  list — they are prior-art ids from the 131-id engine vocabulary snapshot isaiah.md was tagged
  under (2026-08-23); the current engine carries the same registers as
  `serious-illness-and-dying` / `prayer-for-healing` (which this chunk's anchor-extension rows
  target). The registers are kept; the id-form reconciliation is flagged for the assembly pass.
- Entry format: Torah-ledger legend (genesis-sweep-ledger.md), sections 1–9 per chapter.

## Isaiah 23

1. Existing tags (book doc): `divine-judgment`, `humble-exaltation`.
2. Applied-tag deltas: No changes — existing tags sound. KEEP `divine-judgment` (the oracle's own answer: the LORD of Armies planned Tyre's fall, 23:9, 11); KEEP `humble-exaltation` (the stated purpose is to stain "the pride of all glory", 23:9 — humbling-only side, covered by the Genesis 11 precedent per isaiah.md Decisions #34). Swept the full library: no other concept has honest, substantial presence (23:18's merchandise-to-holiness turn is a one-verse close; commerce/trade is not a vocabulary register).
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 2 tags).
8. Decisions record: None.

## Isaiah 24

1. Existing tags (book doc): `divine-judgment`, `sin`, `praise`, `god-reigns`.
2. Applied-tag deltas: No changes — existing tags sound; all four KEEP (world-emptying judgment 24:1–22; the covenant-transgression ground 24:5–6; the gleanings-remnant songs 24:14–16; the enthronement destination 24:23). `covenant` at 24:5 remains dropped as passing mention (isaiah.md Decisions #53); `day-of-the-lord` remains skipped per the recorded #63 reason (also-grade theme witness without the phrase, verses already carry `god-reigns`) — re-checked, no new evidence, the skip stands.
3. Anchor-extension candidates:
   - `god-reigns` | Isaiah 24:23 | "the LORD of Armies will reign on Mount Zion and in Jerusalem; and glory will be before his elders" | w=0.75. The pack's Isaiah anchor is 52:7; 24:23 is the OT enthronement declaration at the apocalypse's summit.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 4 tags).
8. Decisions record: None (the `day-of-the-lord` re-check above is a stands-as-recorded note, not a yield).

## Isaiah 25

1. Existing tags (book doc): `praise`, `refuge-in-trouble`, `hope-in-god`, `salvation`, `resurrection-of-the-dead`.
2. Applied-tag deltas: No changes — existing tags sound; all five KEEP (the psalm of 25:1; the stronghold-to-the-poor 25:4, already the engine pack's Isa 25:4 anchor; the waited-for God 25:9; his salvation 25:9; death swallowed up 25:8, worded on the text's own terms per Decisions #63). `pastoral-grief-and-loss` remains removed per the pastoral-register ruling (Decisions #24); `grief-and-loss` (engine) already anchors Isa 25:8 — no display re-add proposed, the national/eschatological register call stands.
3. Anchor-extension candidates:
   - `resurrection-of-the-dead` | Isaiah 25:8 | "He has swallowed up death forever! The Lord GOD will wipe away tears from off all faces." | w=0.7. The engine pack (1 Cor 15; Dan 12:2; John 5:28-29) carries no Isaiah anchor; 25:8 is the text 1 Cor 15:54 takes up.
4. Lexicon candidates:
   - `resurrection-of-the-dead` | "swallowed up death forever" | queries: "he will swallow up death forever", "death swallowed up in victory", "what does the bible say about death being defeated".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 5 tags).
8. Decisions record: None.

## Isaiah 26

1. Existing tags (book doc): `peace-of-god`, `trust-in-god`, `hunger-for-god`, `hope-in-god`, `gods-protection`, `resurrection-of-the-dead` — 6 tags, at the soft cap.
2. Applied-tag deltas: No changes — existing tags sound; all six KEEP (perfect peace 26:3, the engine pack's own Isa 26:3 anchor; the everlasting Rock 26:4; the soul's night-desire 26:8–9; waiting in the way of his judgments 26:8; the hide-a-moment shelter 26:20; the dead arising 26:19 against the oppressors' non-rising 26:14). At the soft cap; no candidate clears the bar to displace anything. The §3.5 Isaiah decline "perfect peace → peace-of-god, lexicon anchor at most" is honored — no separate row.
3. Anchor-extension candidates:
   - `resurrection-of-the-dead` | Isaiah 26:19 | "Your dead shall live. Their dead bodies shall arise. Awake and sing, you who dwell in the dust" | w=0.85. The plainest OT bodily-resurrection statement outside Dan 12:2; the pack has no Isaiah anchor.
   - `hunger-for-god` | Isaiah 26:8-9 | "With my soul I have desired you in the night. Yes, with my spirit within me I will seek you earnestly" | w=0.7. The pack is Psalms/NT only; this is the register's Isaiah witness.
4. Lexicon candidates:
   - `resurrection-of-the-dead` | "your dead shall live" · "awake and sing you who dwell in the dust" | queries: "your dead shall live verse", "will the dead rise", "awake you who dwell in the dust".
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; at soft cap 6, not ceiling).
8. Decisions record: None.

## Isaiah 27

1. Existing tags (book doc): `divine-judgment`, `gods-protection`, `forgiveness-of-sins`, `restoration`.
2. Applied-tag deltas: No changes — existing tags sound; all four KEEP (the sword on leviathan and the deserted city 27:1, 10–11; the vineyard kept night and day 27:3; Jacob's iniquity forgiven 27:9; blossoming and regathering 27:6, 12–13). `idolatry` remains skipped per the recorded #63 reason (thin 27:9); re-checked, stands.
3. Anchor-extension candidates:
   - `restoration-of-israel` | Isaiah 27:12-13 | "you will be gathered one by one, children of Israel" … "they will worship the LORD in the holy mountain at Jerusalem" | w=0.65. The pack anchors Isa 43:5-7 but not the one-by-one regathering-and-trumpet text.
4. Lexicon candidates: None.
5. New-concept candidates: None. ROUTED: the leviathan material (27:1, "the LORD with his hard and great and strong sword will punish leviathan, the fleeing serpent") matches `leviathan-and-behemoth` — already on corpus-blocked roster, row 50; route Isa 27:1 to the expansion thread's queue, do not duplicate (the pending fixture remains the measured-gap record).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 4 tags).
8. Decisions record: None.

## Isaiah 28

1. Existing tags (book doc): `divine-judgment`, `wisdom-from-god`, `drunkenness`. Subdivided in isaiah.md (28:1–13 / 28:14–22 / 28:23–29).
2. Applied-tag deltas: No changes — existing tags sound; all three KEEP (the trodden crown and annulled covenant with death 28:3, 15–22; the God-taught farmer 28:26, 29; the reeling priests and prophets 28:1–8). `christ-the-cornerstone` display rejection at 28:16 (Decisions #15, read-back: the id names Christ) stands — no new textual evidence; likewise the `justification-by-faith` rejection at 28:16 (#16) and the `rest-for-the-weary` passing-mention drop at 28:12 (#53).
3. Anchor-extension candidates:
   - `christ-the-cornerstone` | Isaiah 28:16 | "Behold, I lay in Zion for a foundation a stone, a tried stone, a precious cornerstone of a sure foundation. He who believes shall not act hastily." | w=0.8. Engine-side only, distinct from the display rejection above: the pack's anchors (1 Pet 2:4-7; Eph 2:19-22; Acts 4:11) all quote or echo this source text — 1 Pet 2:6 cites it verbatim — so "cornerstone" queries should surface it; the pack's gist already reports the NT identification as the NT's own claim, so no adjudication is added by anchoring the OT source.
   - `drunkenness` | Isaiah 28:7 | "The priest and the prophet reel with strong drink. They are swallowed up by wine." | w=0.55. The pack is Proverbs/NT teaching texts; this is Scripture's sharpest depiction of drink undoing judgment.
4. Lexicon candidates: None.
5. New-concept candidates: None ("covenant with death" is a memorable phrase but not a plausible search-scale register; left unlogged).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (28:1–13 / 28:14–22 / 28:23–29); per-verse refinement pass should anchor the cornerstone text at 28:16 exactly.
8. Decisions record: None.

## Isaiah 29

1. Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `restoration`, `empty-worship`. Subdivided in isaiah.md (29:1–16 / 29:17–24).
2. Applied-tag deltas: No changes — existing tags sound; all four KEEP (siege on Ariel and woe on the hidden schemers 29:2–3, 15; wise men's wisdom perishing while the humble rejoice 29:14, 19–20; deaf hearing and blind seeing 29:18, 24; lips-honor with distant heart 29:13 — the engine pack's own Isa 29:13 anchor).
3. Anchor-extension candidates:
   - `hardness-of-heart` | Isaiah 29:9-10 | "For the LORD has poured out on you a spirit of deep sleep, and has closed your eyes" | w=0.6. The God-sent stupor/insensibility register (the text Rom 11:8 takes up); the pack has no Isaiah anchor.
   - `humble-exaltation` | Isaiah 29:19-20 | "The humble also will increase their joy in the LORD, and the poor among men will rejoice in the Holy One of Israel." | w=0.6. A both-sides text (wise brought down 29:14, humble raised 29:19) for a pack whose OT anchors are Psalms/Proverbs.
4. Lexicon candidates: None.
5. New-concept candidates: None (the sealed-book image 29:11–12 is a motif, not a searched register).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (29:1–16 / 29:17–24).
8. Decisions record: None.

## Isaiah 30

1. Existing tags (book doc): `trust-in-god`, `divine-judgment`, `guidance`, `restoration`. Subdivided in isaiah.md (30:1–17 / 30:18–33).
2. Applied-tag deltas:
   - ADD `trusting-in-man` (engine id) — the chapter is the concept's teaching substance sustained across 30:1–7 and 30:15–17, not a passing touch: "Therefore the strength of Pharaoh will be your shame, and the refuge in the shadow of Egypt your confusion." (30:3), with the refused alternative stated at 30:15 ("You will be saved in returning and rest. Your strength will be in quietness and in confidence.") and the chosen horses failing at 30:16–17. Both-tags beside `trust-in-god` per the §11 ruling — the same passage read from the misplaced-trust side the pack collects (its Isa 31:1 anchor is this oracle cycle's next chapter). Chapter goes to 5 tags, within the soft cap.
   - KEEP `trust-in-god` (the woe against Egypt's shadow set against 30:15's offered rest), `divine-judgment` (the bulging-wall collapse 30:13–14; the rod on Assyria 30:30–33), `guidance` (30:21 — the engine pack's own Isa 30:21 anchor), `restoration` (binding up the fracture 30:26; weeping ended 30:19).
   - The recorded non-tag of `repentance` at 30:15 (stated but refused — Decisions #49) stands.
3. Anchor-extension candidates:
   - `trusting-in-man` | Isaiah 30:1-3 | "Therefore the strength of Pharaoh will be your shame, and the refuge in the shadow of Egypt your confusion." | w=0.75. Completes the pack's Egypt-reliance material (it has 31:1 but not this chapter's fuller statement).
4. Lexicon candidates:
   - `guidance` | "this is the way walk in it" | queries: "this is the way walk in it verse", "hearing God's voice behind you", "how do I know which way God wants me to go". (The pack anchors Isa 30:21 but its lexicon lacks the phrase.)
   - `trust-in-god` | "quietness and confidence" · "in returning and rest" | queries: "strength in quietness and confidence", "in returning and rest you will be saved", "quiet trust in God".
   - `hope-in-god` | "those who wait for him" | queries: "waiting on God verses", "blessed are those who wait for the Lord", "God's timing verses". (30:18: "Blessed are all those who wait for him." — the isaiah.md motif row "Waiting on the LORD" proposed exactly this lexicon route; carried here as a concrete candidate.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (30:1–17 / 30:18–33).
8. Decisions record: ADD recorded above (trusting-in-man; both-tags rationale). No yields — 5 tags, under the soft cap.

## Isaiah 31

1. Existing tags (book doc): `trust-in-god`, `gods-protection`, `repentance`.
2. Applied-tag deltas:
   - ADD `trusting-in-man` (engine id) — 31:1 is this pack's own anchor verse (Isaiah 31:1, w=0.85 in the pack), and the chapter teaches the concept in full: "Woe to those who go down to Egypt for help, and rely on horses, and trust in chariots because they are many, and in horsemen because they are very strong, but they don’t look to the Holy One of Israel, and they don’t seek the LORD!" (31:1), with the verdict "Now the Egyptians are men, and not God; and their horses flesh, and not spirit." (31:3). Both-tags beside `trust-in-god` per the §11 ruling. Chapter goes to 4 tags.
   - KEEP `trust-in-god` (the woe read from the look-to-the-Holy-One side, 31:1), `gods-protection` (birds hovering over Jerusalem, 31:5), `repentance` (the direct call "Return to him from whom you have deeply revolted", 31:6 — the recorded contrast with ch 22's refused call, Decisions #49). `idolatry` remains skipped per #63 (thin 31:7 duplicating the `repentance` quote); stands.
3. Anchor-extension candidates:
   - `gods-protection` | Isaiah 31:5 | "As birds hovering, so the LORD of Armies will protect Jerusalem. He will protect and deliver it. He will pass over and preserve it." | w=0.7. The pack is Psalms-only plus Isa 54:17; this is a distinct, quotable protection image.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 4 tags).
8. Decisions record: ADD recorded above. No yields.

## Isaiah 32

1. Existing tags (book doc): `divine-judgment`, `peace-of-god`, `outpouring-of-the-spirit` (adopted id — canonical adopted list, engine-built: no; in use on isaiah.md chs 32, 44). Subdivided in isaiah.md (32:1–8 / 32:9–20).
2. Applied-tag deltas:
   - ADD `messianic-prophecy` (engine id) — the chapter opens on the righteous-king portrait that isaiah.md's own entry signposts ("Christians have historically read this royal portrait as anticipating the Messiah"): "Behold, a king shall reign in righteousness, and princes shall rule in justice." (32:1), the ruler as hiding place, streams, and shade (32:2). Same handling as the #63 applications on chs 7/9/11 — the tag reports the historically-named reading through the entry's existing fulfillment-neutral signpost; nothing is adjudicated. Substantial presence: the whole 32:1–8 section. Chapter goes to 4 tags.
   - KEEP `divine-judgment` (the careless daughters' desolation 32:9–14), `peace-of-god` (righteousness' work is peace, quiet resting places 32:17–18 — the borderline register note at Decisions #42 stands as recorded), `outpouring-of-the-spirit` (the 32:15 hinge, the tag-gap row's own signature text).
3. Anchor-extension candidates:
   - `holy-spirit` | Isaiah 32:15 | "until the Spirit is poured on us from on high, and the wilderness becomes a fruitful field" | w=0.7. The engine pack's lexicon carries "pour out my spirit" / "outpouring of the holy spirit" and anchors Joel 2:28-29 and Ezek 36:26-27; 32:15 is the Isaiah witness those queries should also surface.
   - `messianic-prophecy` | Isaiah 32:1-2 | "Behold, a king shall reign in righteousness, and princes shall rule in justice." | w=0.6. Lower weight than the pack's named-child anchors (7:14; 9:6-7; 11:1-10): a source-named royal portrait without a title.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (32:1–8 / 32:9–20).
8. Decisions record: ADD recorded above (messianic-prophecy; signpost-carried, fulfillment-neutral). No yields.

## Isaiah 33

1. Existing tags (book doc): `divine-judgment`, `holiness`, `refuge-in-trouble`.
2. Applied-tag deltas:
   - ADD `zion-city-of-god` (engine id) — the chapter's climax is Zion as God's own secure city, sustained across its final movement: "Look at Zion, the city of our appointed festivals. Your eyes will see Jerusalem, a quiet habitation, a tent that won’t be removed." (33:20), with the LORD filling Zion with justice (33:5) and present there in majesty (33:21–22). The engine pack is Psalms-only; this is honest, substantial Isaiah presence. Chapter goes to 4 tags.
   - KEEP `divine-judgment` (the destroyer destroyed 33:1; peoples burned like lime 33:12), `holiness` (the devouring-fire question answered by the blameless walk 33:14–15), `refuge-in-trouble` (strength every morning, salvation in trouble 33:2; the fortress of rocks 33:16).
   - Considered, not added: `god-reigns` — 33:22 ("For the LORD is our judge. The LORD is our lawgiver. The LORD is our king. He will save us.") is the register exactly but a thin single-verse presence in this chapter; routed as an anchor-extension instead (below). The 33:2 `prayer` passing-mention drop (#53) and 33:24 `forgiveness-of-sins` drop (#53) stand.
3. Anchor-extension candidates:
   - `god-reigns` | Isaiah 33:22 | "For the LORD is our judge. The LORD is our lawgiver. The LORD is our king. He will save us." | w=0.7. A three-office kingship declaration for a pack whose Isaiah anchors are 52:7 (plus 24:23 proposed above).
   - `zion-city-of-god` | Isaiah 33:20-21 | "Look at Zion, the city of our appointed festivals. Your eyes will see Jerusalem, a quiet habitation, a tent that won’t be removed." | w=0.7. First non-Psalms anchor for the pack.
4. Lexicon candidates:
   - `god-reigns` | "the lord is our judge" · "the lord is our king" | queries: "the Lord is our judge our lawgiver our king", "God is my king verse", "the Lord will save us verse".
5. New-concept candidates: None ("the king in his beauty", 33:17, is a motif-grade phrase; no searched register uncovered).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 4 tags).
8. Decisions record: ADD recorded above (zion-city-of-god). Considered-not-added: `god-reigns` (thin single-verse 33:22 — presence-bar call, not a cap yield; anchor-extension proposed instead).

## Isaiah 34

1. Existing tags (book doc): `divine-judgment`, `nations-and-peoples`, `vengeance`.
2. Applied-tag deltas: No changes — existing tags sound; all three KEEP (rage against all nations and Edom's unquenched burning 34:2, 9–10; the summons of the peoples 34:1 — the Decisions #41 scope note stands; the day-of-vengeance text itself 34:8, recompense kept in God's hands alone per #63). Not subdivided per Decisions #2 (one continuous oracle narrowing from nations to Edom) — re-checked, stands.
3. Anchor-extension candidates:
   - `vengeance` | Isaiah 34:8 | "For the LORD has a day of vengeance, a year of recompense for the cause of Zion." | w=0.7. The pack's anchors are the vengeance-is-mine teaching texts; 34:8 names the divine vengeance-day verbatim. (Already staged as a tag-gap-row append in isaiah.md — carried here so the engine-side candidate is explicit.)
4. Lexicon candidates: None.
5. New-concept candidates: None (34:8 lacks "day of the LORD" phrasing; the §3.5 Habakkuk precedent — adjacent language is not the theme — applies, no `day-of-the-lord` touch).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 3 tags).
8. Decisions record: None.

## Isaiah 35

1. Existing tags (book doc): `fear-not`, `restoration`, `joy-in-the-lord`.
2. Applied-tag deltas: No changes — existing tags sound; all three KEEP (the fearful-heart charge 35:4; desert blossoming and waters breaking out 35:1–2, 5–7 with the signposted healing portrait preserved; everlasting joy on the ransomed 35:10, the desert itself rejoicing 35:2). The Round-1 removal of `pastoral-hope-in-despair` (Decisions #31 — national register, the bright panel of the 34–35 diptych) stands; `vengeance` remains skipped per #63 (single clause 35:4 in a chapter of comfort — homes 34/63); stands.
3. Anchor-extension candidates:
   - `fear-not` | Isaiah 35:3-4 | "Tell those who have a fearful heart" … "He will come and save you." | w=0.7. The pack's Isaiah anchors are 43:1-3 and 41:10; 35:4 is the third great Isaian fear-not, with its own save-you ground.
   - `comforting-others` | Isaiah 35:3-4 | "Strengthen the weak hands, and make the feeble knees firm." | w=0.6. The charge is addressed to comforters — the strengthen-the-fainthearted register the pack collects (1 Thess 5:14); Heb 12:12 takes this verse up.
4. Lexicon candidates:
   - `restoration` | "desert will blossom" | queries: "the desert shall blossom as the rose", "streams in the desert verse", "God makes the wilderness bloom".
5. New-concept candidates: None (the Holy Way, 35:8–10, stays a motif candidate as isaiah.md records).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 3 tags).
8. Decisions record: None.

## Isaiah 36

1. Existing tags (book doc): `trust-in-god` (single-tag chapter, standard note).
2. Applied-tag deltas: No changes — the single tag is sound and KEEPs (the whole confrontation turns on contested trust, 36:5–7, 15; Decisions #39's verify-the-bar note was cleared by the Round 1 critic). Considered, not added: `trusting-in-man` — the bruised-reed-of-Egypt truth (36:6) is the concept's material, but in this chapter it is voiced by the taunting enemy inside a narrative whose contested center the `trust-in-god` tag already carries; presence-bar call, routed engine-side instead (below).
3. Anchor-extension candidates:
   - `trusting-in-man` | Isaiah 36:6 | "Behold, you trust in the staff of this bruised reed, even in Egypt" | w=0.6. CAUTION for the curator: "bruised reed" also belongs to the servant-gentleness text (42:3, "He won’t break a bruised reed.") — any lexicon touch on this phrase must not hijack 42:3 queries; anchor only, no lexicon row proposed here.
4. Lexicon candidates: None.
5. New-concept candidates: None. ROUTED: the no-god-has-delivered taunt material (36:15, 18–20) belongs to the `deliverance` register — already on corpus-blocked roster, row 32; route with the ch 37 refs (see ch 37 entry), do not duplicate.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 1 tag).
8. Decisions record: Considered-not-added: `trusting-in-man` (enemy-voiced within the narrative; presence-bar call, not a cap yield).

## Isaiah 37

1. Existing tags (book doc): `prayer`, `gods-protection`, `divine-judgment`, `humble-exaltation`, `fear-not`, `angels`, `remnant` — 7 tags. Subdivided in isaiah.md (five sections, 37:1–7 / 8–13 / 14–20 / 21–35 / 36–38).
2. Applied-tag deltas: No changes — existing tags sound; all seven KEEP (Hezekiah spreading the letter and praying 37:14–20 with the oracle's "Because you have prayed" 37:21; the defend-this-city promise 37:35; hook and bridle 37:29 and the camp struck 37:36–38; the exalted voice against the Holy One answered 37:23, 29; the first word "Don’t be afraid" 37:6; the LORD's angel 37:36; the root-downward remnant 37:31–32). At 7, one under the ceiling; no candidate clears the bar to add (see Decisions). Intercession → `prayer` routing (§3.5 Isaiah decline: 37:4, 15–20) honored — no separate proposal.
3. Anchor-extension candidates:
   - `remnant` | Isaiah 37:31-32 | "The remnant that is escaped of the house of Judah will again take root downward, and bear fruit upward." | w=0.7. The pack anchors Isa 1:9 and 10:20-22; this is the narrative remnant promise (isaiah.md's append row already lists 37:31–32 — carried here as the explicit engine candidate).
   - `prayer` | Isaiah 37:14-20 | "Then Hezekiah went up to the LORD’s house, and spread it before the LORD." | w=0.65. The OT's model crisis-intercession narrative, answered in-text ("Because you have prayed to me against Sennacherib king of Assyria", 37:21); the pack has no OT narrative exemplar.
   - `providence` | Isaiah 37:26 | "Have you not heard how I have done it long ago, and formed it in ancient times? Now I have brought it to pass" | w=0.6. God's long-planned ordering of Assyria's career — the pack's ordains-events register.
4. Lexicon candidates: None.
5. New-concept candidates: None. ROUTED: the deliverance-narrative material (36:15, 18–20; 37:11–12, 20, 35–36; also 38:6) matches `deliverance` — already on corpus-blocked roster, row 32 (its recorded misroute evidence stands); route these refs to the expansion thread's queue, do not duplicate.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (37:1–7 / 8–13 / 14–20 / 21–35 / 36–38); at 7 tags, one under the ceiling.
8. Decisions record: Considered-not-added: `providence` (37:26 is a thin single-verse presence inside the oracle; chapter already at 7 — presence-bar call first, anchor-extension proposed instead).

## Isaiah 38

1. Existing tags (book doc): `pastoral-serious-illness`, `pastoral-prayer-for-healing` (legacy ids from the 131-id vocabulary snapshot, kept per Decisions #30 — genuinely personal register; NOT on the canonical adopted list or the 239-id engine census — see the header's legacy-id note; the current engine carries the same registers as `serious-illness-and-dying` / `prayer-for-healing`), `thanksgiving`, `forgiveness-of-sins`. Subdivided in isaiah.md (38:1–8 / 38:9–22).
2. Applied-tag deltas: No changes — existing tags sound; all four KEEP (sick and near death, set your house in order 38:1, the gates of Sheol 38:10; the wall-facing prayer and the fifteen-years answer 38:2–5; the living-shall-praise song 38:19–20; sins cast behind God's back 38:17).
3. Anchor-extension candidates:
   - `prayer-for-healing` | Isaiah 38:2-5 | "Then Hezekiah turned his face to the wall and prayed to the LORD" … "I have heard your prayer. I have seen your tears. Behold, I will add fifteen years to your life." | w=0.7. The OT's answered-healing-prayer narrative; the pack (James 5; Jer 17:14; Ps 103:2-3; Mark 1:40-42) has no OT narrative anchor.
   - `serious-illness-and-dying` | Isaiah 38:1 | "In those days Hezekiah was sick and near death." | w=0.6 (with the psalm of 38:10–17 as the facing-death interior). The pack's facing-death register gains its OT narrative.
   - `god-sees-my-suffering` | Isaiah 38:5 | "I have heard your prayer. I have seen your tears." | w=0.65. The pack's lexicon already carries "God sees my tears"; this verse is its OT statement.
4. Lexicon candidates: None.
5. New-concept candidates: None (the sundial sign stays a motif candidate as isaiah.md records).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (38:1–8 / 38:9–22).
8. Decisions record: None.

## Isaiah 39

1. Existing tags (book doc): `divine-judgment` (single-tag chapter, standard note; Decisions #40's descriptive wording stands).
2. Applied-tag deltas: No changes — existing single tag sound and KEEPs (the everything-to-Babylon announcement 39:5–7). Swept the full library: honest-and-empty beyond the one tag — the chapter is a short narrative bridge (treasures shown, verdict announced, Hezekiah's resigned reply); no other concept reaches substantial presence.
3. Anchor-extension candidates: None.
4. Lexicon candidates: None.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none (not subdivided; 1 tag).
8. Decisions record: None.

## Isaiah 40

1. Existing tags (book doc): `god-of-all-comfort`, `creation`, `rest-for-the-weary`, `doubt` (PR #43 id, ratified by Jesse 2026-08-25 — Decisions #11), `mortality`, `power-of-gods-word`, `sovereignty-of-god` (adopted id — canonical adopted list, engine-built: no; in use on isaiah.md chs 40, 45) — 7 tags. NOT subdivided (Decisions #4 — no BSB anchors at the real seams).
2. Applied-tag deltas: No changes — existing tags sound; all seven KEEP (comfort my people 40:1–2; Creator of the ends of the earth 40:12, 22, 26, 28; wings like eagles 40:30–31; the voiced complaint answered in-chapter 40:27–31; grass that withers 40:6–8; the word standing forever 40:8; drop-in-a-bucket rule over nations 40:15–17, 22–26). The #63 idolatry home-chapter yield (40:18–20 yields to ch 44) stands. Considered, not added: `shepherds-and-the-flock` — 40:11 ("He will feed his flock like a shepherd.") is the pack's own Isa 40:11 anchor (w=0.95), but a thin single-verse presence in this chapter; presence-bar call, and the engine anchor already routes shepherd queries here.
3. Anchor-extension candidates: None — the engine already anchors this chapter thoroughly (god-of-all-comfort Isa 40:1; mortality 40:6-7; power-of-gods-word 40:8; shepherds-and-the-flock 40:11; providence 40:15-17 and 40:23-24; creation implicit via 44:24-register; strength-in-weakness 40:29-31; rest-for-the-weary 40:31; glory-of-god 40:5). Existing coverage sound.
4. Lexicon candidates:
   - `god-of-all-comfort` | "comfort my people" | queries: "comfort comfort my people meaning", "God comforts his people verses", "speak tenderly to Jerusalem".
   - `strength-in-weakness` | "wings like eagles" · "renew their strength" | queries: "mount up with wings as eagles", "they that wait upon the Lord shall renew their strength", "renew my strength verse". XOR note: `rest-for-the-weary` also anchors 40:31 — the curator should give the phrase one home, not two.
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: none by rule (not subdivided; 7 tags — one under the ceiling, did not hit 8). Worth noting for the refinement pass anyway: the chapter's three movements (40:1–11 / 12–26 / 27–31) have no BSB anchors (Decisions #4), so any refinement must use verse-range anchors, not sections.
8. Decisions record: Considered-not-added: `shepherds-and-the-flock` (thin single-verse 40:11; presence-bar call, not a cap yield — engine anchor already serves).

## Isaiah 41

1. Existing tags (book doc): `fear-not`, `gods-protection`, `gods-provision`, `idolatry`, `the-first-and-the-last` — 5 tags. Subdivided in isaiah.md (41:1–20 / 41:21–29).
2. Applied-tag deltas: No changes — existing tags sound; all five KEEP (the chapter's repeated fear-not word 41:10, 13–14; enemies as nothing while God holds the right hand 41:11–13; water for the thirsty poor 41:17–20; the idols' nothing-verdict 41:21–24, 29; the title's first sounding 41:4). Considered, not added: `living-water` — the pack's own Isa 41:17-18 anchor covers the water material engine-side, but tagging it here would duplicate `gods-provision`'s quoted material at display level (broad-duplicating-specific by register); the engine anchor already routes.
3. Anchor-extension candidates: None — fear-not (41:10), living-water (41:17-18), idolatry (41:21-24, 29), and the-first-and-the-last (41:4) all already anchor this chapter in the engine. Existing coverage sound.
4. Lexicon candidates: None here (the missing "the first and the last" lexicon phrase is proposed at ch 44, where the exact wording occurs; 41:4's form is "the first, and with the last").
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (41:1–20 / 41:21–29).
8. Decisions record: Considered-not-added: `living-water` (display-level duplicate of `gods-provision`'s material; engine anchor already routes — presence-bar/duplication call, not a cap yield).

## Isaiah 42

1. Existing tags (book doc): `nations-and-peoples`, `praise`, `guidance`, `divine-judgment`, `servant-of-the-lord` — 5 tags. Subdivided in isaiah.md (42:1–9 / 42:10–17 / 42:18–25). First servant song; the entry's fulfillment-neutral signpost governs all framing here.
2. Applied-tag deltas: No changes — existing tags sound; all five KEEP (justice to the nations and light for the nations 42:1, 4, 6; the new song to the end of the earth 42:10–12; the blind led by unknown paths 42:16; Jacob given as plunder by the LORD against whom we sinned 42:24–25; the first servant poem described on its own terms, 42:1–9, with the messianic hearing carried only by the entry's existing signpost — preserved unchanged). Considered, not applied: the adopted id `gentleness-of-christ` (canonical adopted list, engine-built: no; §2 Theme H, "the bruised reed") — naming Christ on the unnamed servant's poem would assert the identification the signpost deliberately leaves as a reading (no-later-revelation-read-back rule); the servant's gentleness is honestly carried by `servant-of-the-lord`.
3. Anchor-extension candidates:
   - `guidance` | Isaiah 42:16 | "I will bring the blind by a way that they don’t know. I will lead them in paths that they don’t know. I will make darkness light before them, and crooked places straight." | w=0.6. A distinct God-leads-the-blind promise for a pack whose anchors are Psalms/Proverbs-register plus 30:21.
4. Lexicon candidates:
   - `servant-of-the-lord` | "bruised reed" · "light for the nations" | queries: "he will not break a bruised reed meaning", "bruised reed verse", "a light to the nations verse". (Collision note from ch 36 applies: keep the phrase pointed at 42:3, not the 36:6 staff-of-Egypt taunt.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (42:1–9 / 42:10–17 / 42:18–25); the refinement pass should keep the servant-poem boundary (42:1–9) exact.
8. Decisions record: Considered-not-applied: `gentleness-of-christ` (read-back guard; recorded so the call is visible and reversible).

## Isaiah 43

1. Existing tags (book doc): `fear-not`, `gods-protection`, `gods-love`, `salvation`, `forgiveness-of-sins`, `no-other-god`, `gods-unchanging-nature` — 7 tags. Subdivided in isaiah.md (43:1–13 / 43:14–21 / 43:22–28).
2. Applied-tag deltas:
   - ADD `restoration` (engine id) — the pack's own keystone Isaiah anchor lives in this chapter (restoration.yaml anchors Isa 43:18-19), and the new-exodus movement 43:14–21 is substantial: "Behold, I will do a new thing. It springs out now. Don’t you know it? I will even make a way in the wilderness, and rivers in the desert." (43:19). The recorded register TENSION (`restoration` personal-renewal vs national restoration — declines-and-contested §1(e)) is noted, not resolved here: this ADD follows isaiah.md's own standing warrant (its Checked-and-already-covered entry grounds national-restoration tagging in the pack's 43:18–19 anchor), and the curator resolves the register question with both readings in view. Chapter goes to 8 tags — the hard ceiling; every sitting tag was re-checked and independently clears the bar (each is quote-anchored in the book doc and engine-anchored: fear-not 43:1-3; restoration-of-israel 43:5-7; gods-love 43:4; no-other-god 43:10-11; forgiveness-of-sins 43:25).
   - KEEP all seven existing (redeemed and called by name 43:1, 5; through waters and fire 43:2; precious, honored, loved 43:4; besides me no savior 43:3, 11–12; blotting out transgressions 43:24–25; the witnesses-stand trial claim 43:10, 12; the no-god-formed time register 43:10 — the both-tags pair per the §11 ruling stands as applied).
3. Anchor-extension candidates: None — fear-not (43:1-3), gods-love (43:4), restoration-of-israel (43:5-7), no-other-god (43:10, 43:11), gods-unchanging-nature (43:10), forgiveness-of-sins (43:25), and restoration (43:18-19) all already anchor this chapter in the engine. Existing coverage sound.
4. Lexicon candidates:
   - `forgiveness-of-sins` | "blots out your transgressions" · "will not remember your sins" | queries: "God blots out my sins", "I am he who blots out your transgressions", "does God remember my sins". (43:25; the pack's lexicon has washed-clean and east-from-west phrasings but no blot-out family.)
5. New-concept candidates: None.
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (43:1–13 / 43:14–21 / 43:22–28) AND hits the hard ceiling (8 tags after the ADD): per-verse refinement should give each register its exact range (e.g. 43:1–7 comfort; 43:8–13 trial; 43:14–21 new exodus; 43:22–28 indictment-and-grace).
8. Decisions record: ADD recorded above (restoration — pack's-own-anchor warrant; register-tension note carried, not resolved). Ceiling reached at 8 with every tag independently clearing the bar — no §11.6 yield was required; recorded per the no-silent-drops rule.

## Isaiah 44

1. Existing tags (book doc): `fear-not`, `forgiveness-of-sins`, `creation`, `restoration`, `idolatry`, `no-other-god`, `outpouring-of-the-spirit` (adopted id — canonical adopted list, engine-built: no; in use on isaiah.md chs 32, 44), `the-first-and-the-last` — 8 tags, at the hard ceiling (Decisions #65). Subdivided in isaiah.md (44:1–20 / 44:21–28).
2. Applied-tag deltas: No changes — existing tags sound; all eight KEEP (don't be afraid, Jacob my servant 44:2, 8; transgressions blotted out like a cloud 44:22; the maker of all things alone 44:24 — the engine pack's own Isa 44:24 anchor; Jerusalem inhabited and waste places raised 44:26, 28; the idol-maker satire 44:9–20 — the engine pack's own Isa 44:9-20 anchor; besides me there is no God 44:6, 8 — engine anchors Isa 44:6/44:8; Spirit poured on your descendants 44:3; I am the first and I am the last 44:6 — engine anchor, both-tags split of the verse per the recorded boundary). At the hard ceiling: no candidate may enter without a yield, and none clears the bar to justify one (Cyrus-as-shepherd 44:28 is a thin single-verse providence presence whose home chapter is 45, where `providence` and `sovereignty-of-god` already sit).
3. Anchor-extension candidates:
   - `holy-spirit` | Isaiah 44:3 | "I will pour water on him who is thirsty, and streams on the dry ground. I will pour my Spirit on your descendants" | w=0.65. Companion to the 32:15 candidate — the pack's outpouring lexicon phrases should surface both Isaiah promises.
4. Lexicon candidates:
   - `the-first-and-the-last` | "the first and the last" | queries: "I am the first and the last", "who is the first and the last in the bible", "alpha and omega in the old testament". (The pack's lexicon carries "alpha and omega" and "the beginning and the end" but not the literal title phrase its own Isaiah anchors use — 44:6: "I am the first, and I am the last; and besides me there is no God.")
5. New-concept candidates: None (44:25's frustrated diviners is a one-verse touch; `occult-and-divination`'s teaching anchors 8:19-20 and 47:9-13 serve the register).
6. Decline-overturn proposals: None.
7. Per-verse refinement flag: FLAG — subdivided in isaiah.md (44:1–20 / 44:21–28) AND at the hard ceiling (8 tags): per-verse refinement should split the Spirit-promise (44:1–5), the trial claim (44:6–8), the satire (44:9–20), and the redeemer/Cyrus close (44:21–28).
8. Decisions record: Considered-not-added: `providence` at 44:28 (thin single-verse; home chapter 45 — presence-bar call at the ceiling, no yield spent). No existing tag dropped.

---

# Chunk totals (chapters 23–44)

- Chapters swept: 22/22 (23–44, in order).
- Applied-tag deltas: ADD 5 (`trusting-in-man` ch 30; `trusting-in-man` ch 31; `messianic-prophecy` ch 32; `zion-city-of-god` ch 33; `restoration` ch 43) · KEEP 92 (every existing tag instance re-verified) · DROP 0.
- Anchor-extension candidates: 27.
- Lexicon candidates: 12 rows.
- New-concept candidates: 0 (no real gap found that an existing/adopted id or a recorded decline does not cover).
- Decline-overturn proposals: 0.
- Routed to corpus-blocked backlog: 2 (leviathan 27:1 → roster row 50; deliverance narrative 36:15, 18–20; 37:11–12, 20, 35–36; 38:6 → roster row 32).
- Ceiling chapters: 43 (8 after ADD), 44 (8 standing).
- Per-verse refinement flags: 28, 29, 30, 32, 37, 38, 41, 42, 43, 44 (subdivided); 43 and 44 also at the hard ceiling.
- Servant-song framing: ch 42 handled with isaiah.md's fulfillment-neutral signpost preserved; no identification asserted anywhere in this chunk (covenant #6 respected — every justification reports what the text says or which source names a reading).

## CHUNK 3 of 3 — chapters 45–66 (worker draft, verbatim)

# Isaiah sweep ledger — CHUNK: chapters 45–66 (Layer-3 tag sweep, Major Prophets thread)

- Book: Isaiah · Chapter range: 45–66 (22 chapters)
- Repo: scripture-search-engine @ origin/main SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e (pinned)
- Date: 2026-08-26
- Concept library at thread start: 239 packs in `ontology/concepts/` (per concept-inventory.md), plus the
  adopted display vocabulary per CONVENTIONS §11.1 — canonical list:
  /mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids; local copy
  adopted-concepts-canonical.md in the scratchpad), which supersedes the brief's reconstruction rule per the
  mid-sweep coordinator update. Each adopted-only id used below cites that list.
- Inputs: isaiah.md (prior art — tags as of the 2026-08-25 passes, Decisions #63–65), concept-inventory.md,
  declines-and-contested.md, corpus-blocked-roster.md, web-text/isaiah/<N>.txt (all quotes below are word-for-word
  from these files).
- This is a chunk file for later assembly into isaiah-sweep-ledger.md; entry format follows the Torah thread's
  Legend (genesis-sweep-ledger.md). No repo changes, no engine changes, display/research layer only.
- Servant-songs note: chapters 49, 50, 52–53 (and the ch 61 commission) carry signposted, fulfillment-neutral
  framing in isaiah.md ("Christians have historically read/heard/seen…"); every justification below preserves that
  framing and adjudicates nothing (covenant #6).

---

## Isaiah 45
Existing tags (book doc): `providence`, `salvation`, `creation`, `nations-and-peoples`, `no-other-god`, `sovereignty-of-god`, `design-in-creation` — 7 tags.
Applied-tag deltas: No changes — KEEP all 7; each re-checked against the presence bar and clears it. `sovereignty-of-god` is an adopted-only id — verified on the canonical §11.1 adopted list (tag-apply/adopted-concepts.md, line "`sovereignty-of-god` — engine-built: no"; originally tag-gaps-review §2 / isaiah.md "Proposed new topics" #7, applied per isaiah.md Decisions #63 at tag-gaps log 1262; not among §3 declines). `jesus-the-only-way` remains correctly skipped per Decisions #65 (read-back guard: the chapter's exclusive Savior is the LORD).
Anchor-extension candidates:
- `no-other-god` | Isaiah 45:5–6 | “I am the LORD, and there is no one else. Besides me, there is no God.” | w=0.8, editorial. Low priority — the pack already anchors 45:21-22 and is dense; this adds the refrain's first sounding in the Cyrus oracle.
Lexicon candidates:
- `providence` | term: "create calamity" / "i form the light and create darkness" | queries: "does god create calamity", "isaiah 45:7 meaning", "does god create evil". In-chapter warrant: “I form the light and create darkness. I make peace and create calamity.” (45:7).
- `no-other-god` | term: "every knee shall bow" | queries: "every knee shall bow verse", "every knee will bow every tongue confess". In-chapter warrant: “to me every knee shall bow, every tongue shall take an oath” (45:23). Curator note: Phil 2:10 / Rom 14:11 quote this verse — whether the phrase belongs here or on `honor-the-son` is a routing call; log records the OT source.
- `holiness` | term: "holy one of israel" | queries: "holy one of israel meaning", "who is the holy one of israel". In-chapter warrant: “The LORD, the Holy One of Israel and his Maker says” (45:11). This follows the recorded Isaiah-block disposition (declines §3.5: the title routes to `holiness` and is "a lexicon-tuning question, not a vocabulary gap") — a candidate for that tuning, not a new id; the title recurs across the whole range (47:4; 48:17; 54:5; 60:9, 14).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: chapter carries 7 tags (above soft cap 6, within hard ceiling 8 per prior passes #63/#65) — not subdivided in the book doc; no refinement flag.
Decisions record: None (no yields; no changes).

## Isaiah 46
Existing tags (book doc): `gods-faithfulness`, `providence`, `idolatry`, `no-other-god` — 4 tags.
Applied-tag deltas:
- ADD `aging-and-old-age` — the carried-to-gray-hairs promise is this chapter's own teaching: “Even to old age I am he, and even to gray hairs I will carry you.” (46:4, with 46:3). The engine pack itself anchors Isaiah 46:4 at w=0.9 — the curated judgment that this verse carries the concept's substance. Applied beside `gods-faithfulness` per the §11.2 both-tags ruling (the aging-with-faith register vs. the God-keeps-his-word register; the verses overlap, the search intents do not). Distinct from the Decisions #21 rejection, which concerned `caring-for-aging-parents` (children's duty — genuinely not this text).
- KEEP the existing 4 — each re-checked and clears the bar.
Anchor-extension candidates: None — 46:4 (aging-and-old-age), 46:1-7 (idolatry), 46:9-11 (providence/no-other-god) are already engine anchors or richly covered.
Lexicon candidates:
- `providence` | term: "declare the end from the beginning" | queries: "declaring the end from the beginning", "does god know the future", "god declares the end from the beginning". In-chapter warrant: “I declare the end from the beginning, and from ancient times things that are not yet done.” (46:10).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (5 tags after add; not subdivided).
Decisions record: ADD recorded above; no yields.

## Isaiah 47
Existing tags (book doc): `divine-judgment`, `humble-exaltation`, `occult-and-divination`, `vengeance` — 4 tags.
Applied-tag deltas: No changes — KEEP all 4; each re-checked and clears the bar (the humbling-only `humble-exaltation` use is covered by the recorded Genesis-11 precedent, isaiah.md Decisions #34).
Anchor-extension candidates:
- `occult-and-divination` | Isaiah 47:12–14 | “let the astrologers, the stargazers, and the monthly prognosticators stand up and save you” | w=0.8, editorial. The pack's Isaiah anchor today is 8:19-20 only; 47:12-14 is Scripture's direct astrology text and the pack's lexicon already carries "astrology and horoscopes" — the anchor closes a real query-to-passage gap.
Lexicon candidates: None (the "holy one of israel" candidate at ch 45 covers 47:4's occurrence).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (not subdivided).
Decisions record: None. Routed to corpus-blocked backlog: God-as-Redeemer title material — “Our Redeemer, the LORD of Armies is his name, is the Holy One of Israel.” (47:4; recurring at 48:17; 54:5, 8; 59:20; 60:16; 63:16) — already on corpus-blocked roster, row 23 (`redeemer`, decide-alongside-`kinsman-redeemer` row 27); these Isaiah Redeemer-of-Israel refs go to the expansion thread's queue as register witnesses for that decision, not duplicated as a new candidate here.

## Isaiah 48 (subdivided: 48:1–11 / 48:12–22)
Existing tags (book doc): `the-lords-discipline`, `gods-faithfulness`, `guidance` — 3 tags.
Applied-tag deltas:
- ADD `the-first-and-the-last` — the title sounds in the chapter's own words: “I am he. I am the first. I am also the last.” (48:12). The engine pack already anchors Isaiah 48:12 (w=0.8); the display tag was skipped at Decisions #65 solely for want of a verified quote ("a follow-up candidate if a verified quote is staged") — the pinned web-text now supplies it word-for-word. Not a decline overturn; this is the follow-up #65 itself invited.
- KEEP the existing 3 — each re-checked and clears the bar.
Anchor-extension candidates:
- `testing` | Isaiah 48:10 | “I have refined you, but not as silver. I have chosen you in the furnace of affliction.” | w=0.7, editorial. The pack's lexicon carries "refined by fire" / "the refiners fire" and anchors Zech 13:9 and Mal 3:2-3; the furnace-of-affliction text is the same refining register. Curator note: overlaps `the-lords-discipline` (which tags this chapter for display); one extension, decided with that boundary in view.
Lexicon candidates:
- `peace-of-god` | term: "peace like a river" | queries: "peace like a river verse", "peace like a river in the bible". In-chapter warrant: “Then your peace would have been like a river” (48:18; the promise recurs at 66:12).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (48:1–11 / 48:12–22) — flagged for the per-verse refinement pass.
Decisions record: ADD recorded above; no yields. Routed to corpus-blocked backlog (two rows): (1) the for-my-name's-sake register — “For my name’s sake, I will defer my anger” (48:9, with 48:11) — already on corpus-blocked roster, row 8 (`gods-holy-name`; its recorded texts are Ezekiel's, and 48:9-11 is the same register in Isaiah): routed to the expansion queue, not duplicated. (2) the departure texts — “Leave Babylon! Flee from the Chaldeans!” (48:20, with 48:21) — already on corpus-blocked roster, row 45 (`exile-and-captivity`, Jesse's routing call pending): routed as new-exodus/departure witnesses.

## Isaiah 49
Existing tags (book doc): `nations-and-peoples`, `god-of-all-comfort`, `doubt`, `gods-love`, `restoration`, `servant-of-the-lord` — 6 tags.
Applied-tag deltas: No changes — KEEP all 6; each re-checked and clears the bar. The `servant-of-the-lord` justification's fulfillment-neutral signpost framing (second servant poem described on its own terms, riddle left standing) is preserved; `doubt` on 49:14 is Jesse-ratified (Decisions #12).
Anchor-extension candidates:
- `gods-love` | Isaiah 49:15–16 | “Can a woman forget her nursing child, that she should not have compassion on the son of her womb?” … “Behold, I have engraved you on the palms of my hands.” | w=0.85, editorial. The pack has no Isaiah 49 anchor; this is among the Bible's strongest mother-love-outdone texts and a heavy searcher target.
Lexicon candidates:
- `gods-love` | term: "engraved on the palms of his hands" | queries: "engraved on the palms of my hands", "can a mother forget her child verse", "does god forget me". In-chapter warrant: 49:15-16 as quoted above.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none at chapter level (6 tags = soft cap; not subdivided in the book doc).
Decisions record: None (no yields; no changes).

## Isaiah 50 (subdivided: 50:1–3 / 50:4–11)
Existing tags (book doc): `trust-in-god`, `obedience-to-the-word`, `servant-of-the-lord` — 3 tags.
Applied-tag deltas: No changes — KEEP all 3; each re-checked and clears the bar (the `obedience-to-the-word` borderline is the recorded Decisions #43 call; the third servant poem's fulfillment-neutral signpost is preserved).
Anchor-extension candidates: None — `servant-of-the-lord` already anchors 50:4-11. Considered and NOT proposed: `justification-by-faith` at 50:8 (“He who justifies me is near.”) — same read-back logic as the recorded rejections at 45:25 and 53:11 (Decisions #13–14): the verb is present, the Pauline by-faith mechanism is not the chapter's teaching.
Lexicon candidates:
- `comforting-others` | term: "sustain the weary with a word" | queries: "a word for the weary", "how to encourage someone who is weary", "words to sustain the weary". In-chapter warrant: “that I may know how to sustain with words him who is weary” (50:4). Curator note: WEB wording is "sustain with words him who is weary"; the familiar phrasing needs the mapping.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (50:1–3 / 50:4–11) — flagged for the per-verse refinement pass.
Decisions record: None. Routed to corpus-blocked backlog: the divorce-bill text — “Where is the bill of your mother’s divorce, with which I have put her away?” (50:1) — already on corpus-blocked roster, row 2 (`spiritual-adultery`; its minting texts are Hos 1–3 / Ezek 16/23): routed to the expansion queue as an Isaiah register witness (with 57:3-8, see ch 57), not duplicated.

## Isaiah 51 (subdivided: 51:1–16 / 51:17–23)
Existing tags (book doc): `god-of-all-comfort`, `fear-not`, `salvation`, `joy-in-the-lord`, `divine-judgment` — 5 tags.
Applied-tag deltas: No changes — KEEP all 5; each re-checked and clears the bar (`joy-in-the-lord` is the recorded Decisions #44 borderline, kept; the #63 `mortality` skip at 51:12 — thin, duplicating `fear-not`'s quoted verses — stands).
Anchor-extension candidates:
- `god-of-all-comfort` | Isaiah 51:12 | “I, even I, am he who comforts you.” | w=0.75, editorial. The pack's Isaiah anchors are 40:1 and 61:1-2; the first-person comfort declaration adds the strongest single-verse witness between them (51:3 supporting).
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (51:1–16 / 51:17–23) — flagged for the per-verse refinement pass.
Decisions record: None (no yields; no changes).

## Isaiah 52 (subdivided: 52:1–12 / 52:13–15)
Existing tags (book doc): `salvation`, `praise`, `nations-and-peoples`, `god-reigns`, `servant-of-the-lord` — 5 tags.
Applied-tag deltas: No changes — KEEP all 5; each re-checked and clears the bar. `god-reigns` already anchors 52:7 in the engine pack (w=0.85); the fourth-poem opening's fulfillment-neutral signpost framing is preserved.
Anchor-extension candidates: None — 52:7 (god-reigns) and 52:13-15 (servant-of-the-lord) are already engine anchors.
Lexicon candidates:
- `sharing-your-faith` | term: "beautiful feet" | queries: "beautiful feet verse", "how beautiful are the feet of those who bring good news". In-chapter warrant: “How beautiful on the mountains are the feet of him who brings good news” (52:7). Caveat carried from the book doc's motif note: in-chapter this is the herald announcing God's reign, not personal evangelism — Rom 10:15 is what makes the query family land here; the lexicon row should be designed with that NT bridge named, or routed to `god-reigns` instead. Flagged, not forced.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (52:1–12 / 52:13–15) — flagged for the per-verse refinement pass.
Decisions record: None. Routed to corpus-blocked backlog (two rows): (1) “my name is blasphemed continually all day long” (52:5, with 52:6 — "my people shall know my name") — already on corpus-blocked roster, row 8 (`gods-holy-name`): routed. (2) the clean-departure text — “Depart! Depart! Go out from there! Touch no unclean thing!” (52:11, with 52:12) — already on corpus-blocked roster, row 45 (`exile-and-captivity`): routed.

## Isaiah 53
Existing tags (book doc): `the-cross`, `humble-exaltation`, `servant-of-the-lord` — 3 tags.
Applied-tag deltas: No changes — existing tags sound; each re-checked and clears the bar. The chapter's three tags carry its whole weight, with the historic identification carried only by `the-cross`'s existing signpost (Decisions #32) and the poem otherwise described in its own astonished voice — that framing is preserved untouched. Honest-and-lean is right here; nothing in the vocabulary is both present and unserved.
Anchor-extension candidates: None — `the-cross` anchors 53:5 (w=1.0) and `servant-of-the-lord` anchors 53:1-12 (w=1.0) already; adding more Isaiah 53 anchors would be weight without value.
Lexicon candidates: None — "man of sorrows" and "suffering servant" are already in `servant-of-the-lord`'s lexicon; "by his wounds we are healed" and "the lamb of god" already in `the-cross`'s.
New-concept candidates: None.
Decline-overturn proposals: None — the `justification-by-faith` rejection at 53:11 (Decisions #14) stands; no new textual evidence.
Ceiling / refinement flags: none (not subdivided — Decisions #62 keeps the poem uncut).
Decisions record: None (no yields; no changes).

## Isaiah 54
Existing tags (book doc): `covenant`, `gods-love`, `fear-not`, `gods-protection` — 4 tags.
Applied-tag deltas:
- ADD `shame` — the removal of shame is the chapter's own promise, and Isaiah 54:4 is the engine pack's top anchor (w=1.0): “For you will forget the shame of your youth. You will remember the reproach of your widowhood no more.” (54:4). The verse teaches the concept's substance (shame remembered no more), not merely its topic; single-passage, so flagged borderline, but the pack's own w=1.0 anchor records the curated judgment that this is the concept's home text.
- KEEP the existing 4 — each re-checked and clears the bar.
Anchor-extension candidates: None — 54:1 (`waiting-for-a-child`, w=0.65), 54:4 (`shame`), 54:5-6/10 (`betrayal-and-marriage-crisis`), 54:10 (its w=0.8), and 54:17 (`gods-protection`, w=0.85) are all already engine anchors; ch 54's engine coverage is dense.
Lexicon candidates:
- `covenant` | term: "covenant of peace" | queries: "covenant of peace meaning", "my covenant of peace shall not be removed". In-chapter warrant: “my covenant of peace will not be removed” (54:10).
New-concept candidates: None.
Decline-overturn proposals: None — the book doc's deliberate non-tag of `waiting-for-a-child` (barren-woman metaphor for Zion, motif note) stands; the pastoral-register ruling likewise keeps `betrayal-and-marriage-crisis` off this national-register chapter (engine anchors already serve the searcher).
Ceiling / refinement flags: none (5 tags after add; not subdivided).
Decisions record: ADD recorded above; no yields.

## Isaiah 55
Existing tags (book doc): `hunger-for-god`, `grace-not-earned`, `repentance`, `forgiveness-of-sins`, `covenant`, `power-of-gods-word` — 6 tags.
Applied-tag deltas:
- ADD `seeking-god` — the chapter carries the concept's second-strongest engine anchor (Isaiah 55:6, w=0.95): “Seek the LORD while he may be found. Call on him while he is near.” (55:6). This is the chapter's hinge command and the concept's teaching substance in the imperative, distinct from `repentance`'s forsake-and-return register on 55:7 (§11.2 both-tags: each clears the bar on its own verse). Pushes the chapter past the soft cap — recorded below.
- KEEP the existing 6 — each re-checked and clears the bar.
Anchor-extension candidates: None — 55:1 (`living-water`, w=0.85), 55:6 (`seeking-god`), 55:7 (`forgiveness-of-sins`), 55:10-11 (`power-of-gods-word`, w=0.95) are already engine anchors.
Lexicon candidates:
- `trust-in-god` | term: "gods ways are higher" | queries: "gods ways are higher than our ways", "my thoughts are not your thoughts meaning". In-chapter warrant: “so are my ways higher than your ways, and my thoughts than your thoughts.” (55:9). Curator note: the book doc's motif list offers `wisdom-from-god` as the alternate route — one home, decided at curation.
New-concept candidates: None. Considered: `living-water` as a display tag on 55:1 — not added: same-verse weaker duplicate of the sitting `hunger-for-god` quote (the #63 same-verse-duplicate precedent), and the engine anchor already serves the searcher.
Decline-overturn proposals: None.
Ceiling / refinement flags: 7 tags after add — above soft cap 6, within hard ceiling 8; every tag independently clears the bar. Not subdivided; no refinement flag.
Decisions record: ADD recorded above. Soft-cap exceedance decision: `seeking-god` admitted as a 7th tag rather than yielded because it is main-theme material (the invitation movement's hinge) with its own engine anchor, and §11.6's yield order found no weaker sitting tag — no cross-ref-class, caveated, thin, or broad-duplicating tag is present to yield. No drops.

## Isaiah 56 (subdivided: 56:1–8 / 56:9–12)
Existing tags (book doc): `nations-and-peoples`, `sabbath-rest`, `covenant`, `worship` — 4 tags.
Applied-tag deltas: No changes — KEEP all 4; each re-checked and clears the bar. Considered and NOT added: `gentile-inclusion` (adopted id, §11.3) — declined for this chapter: the adopted id's register is the Gentiles-welcomed-without-the-law question (Acts 10–15; roster row 40's recorded extension check found exactly that register split), while Isaiah 56's foreigners are welcomed INTO covenant observance (Sabbath-keeping, holding fast the covenant) — tagging the church-inclusion category here would be a later-revelation read-back; `nations-and-peoples` honestly carries the chapter's welcome. Also considered and NOT added: `shepherds-and-the-flock` for 56:9-12 — a depicted failure of shepherding (worked-example logic, the Genesis-3 precedent), carried instead as an anchor-extension candidate below.
Anchor-extension candidates:
- `watchman-and-warning` | Isaiah 56:10 | “His watchmen are blind. They are all without knowledge. They are all mute dogs.” | w=0.55, editorial. The failure register — watchmen who cannot warn — is the classic negative witness to the pack's charge (its Ezek 33 anchor already includes the negligent watchman's guilt); low weight proposed accordingly.
- `shepherds-and-the-flock` | Isaiah 56:11 | “They are shepherds who can’t understand.” | w=0.6, editorial. Curator note: this is the bad-shepherds register the corpus-blocked roster's re-open notes flag (Ezek 34 / John 10 / John 21); decide this extension together with that re-open, not separately.
Lexicon candidates:
- `the-house-of-god` | term: "house of prayer" | queries: "house of prayer verse", "my house shall be called a house of prayer". In-chapter warrant: “for my house will be called a house of prayer for all peoples.” (56:7).
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (56:1–8 / 56:9–12) — flagged for the per-verse refinement pass.
Decisions record: None (no yields). Routed to corpus-blocked backlog: the foreigners-welcomed texts — “Also the foreigners who join themselves to the LORD to serve him” (56:6, with 56:3-8) — already on corpus-blocked roster, row 40 (`gentile-inclusion`, DEFERRED-to-re-pin): routed to the expansion queue as an OT anchor/boundary witness for that pack's eventual design (it shows the welcome-into-covenant register the pack must NOT absorb), not duplicated as a new candidate.

## Isaiah 57 (subdivided: 57:1–2 / 57:3–13 / 57:14–21)
Existing tags (book doc): `humble-exaltation`, `peace-of-god`, `sin`, `idolatry` — 4 tags.
Applied-tag deltas:
- ADD `backsliding` — the chapter names the concept verbatim and teaches its healing: “he went on backsliding in the way of his heart.” (57:17), answered by “I have seen his ways, and will heal him.” (57:18). The healing-the-backslider arc is a whole book-doc section (57:14–21, "Healing for the Repentant"), not a passing touch. `backsliding` is a doctrinal id, not a pastoral-* id, so the 2026-08-23 pastoral-register removal of `pastoral-relapse-and-restoration` from this chapter (Decisions #27, national register) is not disturbed — this tag carries the national-backsliding register that removal left untagged.
- KEEP the existing 4 — each re-checked and clears the bar (`peace-of-god` is the recorded Decisions #42 borderline, kept).
Anchor-extension candidates:
- `humble-exaltation` | Isaiah 57:15 | “I dwell in the high and holy place, with him also who is of a contrite and humble spirit” | w=0.85, editorial. The high-and-lofty-One-with-the-lowly text is a classic for the concept's register and the pack has no Isaiah anchor.
- `backsliding` | Isaiah 57:17–18 | “he went on backsliding in the way of his heart.” … “I have seen his ways, and will heal him.” | w=0.7, editorial. Verbatim phrase witness ("backsliding") plus the healing promise; the pack's OT anchors are thin (Jer 31:22 at w=0.5).
Lexicon candidates:
- `peace-of-god` | term: "no peace for the wicked" | queries: "there is no peace for the wicked", "why can't the wicked find peace". In-chapter warrant: “There is no peace” (57:21, with 57:20; the refrain also closes ch 48 at 48:22). Motif already recorded in the book doc; this is its lexicon landing.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (57:1–2 / 57:3–13 / 57:14–21) — flagged for the per-verse refinement pass.
Decisions record: ADD recorded above; no yields. Routed to corpus-blocked backlog: the adulterous-idolatry arraignment — “you sons of a sorceress, you offspring of adulterers and prostitutes” (57:3, with the bed imagery of 57:7-8) — already on corpus-blocked roster, row 2 (`spiritual-adultery`): routed with the 50:1 divorce-bill ref (see ch 50) as Isaiah register witnesses, not duplicated.

## Isaiah 58
Existing tags (book doc): `generosity`, `sabbath-rest`, `self-deception`, `empty-worship`, `fasting`, `justice-and-oppression` — 6 tags.
Applied-tag deltas: No changes — KEEP all 6; each re-checked and clears the bar (`self-deception` is the recorded Decisions #46 borderline, critic-accepted; the both-registers pairing with `empty-worship` on 58:2-5 is deliberate prior art).
Anchor-extension candidates:
- `justice-and-oppression` | Isaiah 58:6–7 | “to let the oppressed go free, and that you break every yoke” | w=0.8, editorial. The pack's Isaiah anchors stop at 10:1-2; the chosen-fast text is the book's strongest oppression-undone teaching and the display row's own append list already claims 58:6-10.
- `guidance` | Isaiah 58:11 | “the LORD will guide you continually, satisfy your soul in dry places” | w=0.65, editorial. Direct guide-you promise; the pack's Isaiah anchor is 30:21 only.
Lexicon candidates: None — `fasting` already anchors 58:3-7 (w=0.95) with the critique register in its pack, and `hospitality` already anchors 58:7.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: 6 tags = soft cap, no ceiling; not subdivided — no refinement flag.
Decisions record: None (no yields; no changes).

## Isaiah 59
Existing tags (book doc): `sin`, `repentance`, `salvation`, `divine-judgment`, `vengeance` — 5 tags.
Applied-tag deltas: No changes — KEEP all 5; each re-checked and clears the bar. The intercessor line (59:16) stays routed to `prayer` per the recorded Genesis-thread ruling (declines §3.1/§3.5 — not re-litigated; no new evidence).
Anchor-extension candidates:
- `sin` | Isaiah 59:1–2 | “your iniquities have separated you and your God, and your sins have hidden his face from you” | w=0.85, editorial. The pack's four anchors are all NT; this is Scripture's plainest sin-separates statement and a heavy searcher target.
Lexicon candidates:
- `sin` | term: "sin separates us from god" | queries: "does sin separate us from god", "why does god feel far away because of sin", "your sins have hidden his face". In-chapter warrant: 59:2 as quoted above.
New-concept candidates: None. Considered, recorded only: 59:17's breastplate-of-righteousness / helmet-of-salvation imagery is the OT source of Eph 6's armor, but `remembered-full-armor-of-god` is a verse-memory concept (Eph 6:11) and the remembered-* rule bars OT tagging or extension; noted for the curator, nothing proposed.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (not subdivided — Decisions #3 argues the seam).
Decisions record: None (no yields; no changes).

## Isaiah 60
Existing tags (book doc): `nations-and-peoples`, `restoration`, `presence-of-god` — 3 tags.
Applied-tag deltas:
- ADD `zion-city-of-god` — the whole chapter is the glorification of the city of God, named in its own words: “They will call you the LORD’s City, the Zion of the Holy One of Israel.” (60:14, with walls called Salvation and gates Praise, 60:18). The concept's anchors are all Psalms; Isaiah 60 is the register's fullest prophetic chapter and honest, sustained presence — main theme, not topic-touching.
- KEEP the existing 3 — each re-checked and clears the bar (the `restoration` use rides the recorded register-tension note, contested (e), unchanged).
Anchor-extension candidates:
- `zion-city-of-god` | Isaiah 60:14 | “They will call you the LORD’s City, the Zion of the Holy One of Israel.” | w=0.7, editorial. First non-Psalms anchor for the pack.
- `restoration-of-israel` | Isaiah 60:4 | “Your sons will come from far away, and your daughters will be carried in arms.” | w=0.7, editorial. The pack anchors Isa 43:5-7 already; 60:4 (with 60:9) extends the regathering register into the book's final movement.
Lexicon candidates:
- `walking-in-the-light` | term: "arise and shine" | queries: "arise shine for your light has come", "arise and shine verse". In-chapter warrant: “Arise, shine; for your light has come, and the LORD’s glory has risen on you!” (60:1). This follows the recorded Isaiah-block decline route verbatim ("if lexicon coverage proves thin for 'arise and shine' queries, revisit as a lexicon extension, not a new id") — logged as that revisit, with the register caveat that the concept's gist is the believer's ethical walk (1 John 1) while 60:1 is Zion addressed; if the mismatch is judged disqualifying, `presence-of-god` (tagged here on 60:19-20) is the alternate landing.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (4 tags after add; not subdivided).
Decisions record: ADD recorded above; no yields.

## Isaiah 61
Existing tags (book doc): `god-of-all-comfort`, `joy-in-the-lord`, `restoration`, `salvation` — 4 tags.
Applied-tag deltas:
- ADD `messianic-prophecy` — the anointed-one commission opens the chapter: “The Lord GOD’s Spirit is on me, because the LORD has anointed me to preach good news to the humble.” (61:1, with 61:2-3), and the book-doc entry already carries the fulfillment-neutral signpost ("a commission Christians have historically read as messianic"). The tag records that curated sources name the passage messianic — carried strictly through the entry's existing signpost, adjudicating nothing (covenant #6) — the same handling pass #63 applied on chs 7, 9, and 11, whose omission of ch 61 left the signposted commission untagged.
- KEEP the existing 4 — each re-checked and clears the bar. The pastoral-register removals here (Decisions #28) are respected — the national register stands; `god-of-all-comfort` continues to carry the comfort substance, and the engine's `near-to-the-brokenhearted` pack already anchors 61:1-3 for the personal-register searcher.
Anchor-extension candidates:
- `messianic-prophecy` | Isaiah 61:1–3 | “The Lord GOD’s Spirit is on me, because the LORD has anointed me to preach good news to the humble.” | w=0.8, editorial. The pack's Isaiah anchors are 7:14, 9:6-7, 11:1-10; the anointed-commission text (the passage Luke 4:18 reads) is the register's biggest Isaiah gap. Gist must stay source-attributed and fulfillment-neutral, per the pack's existing pattern.
Lexicon candidates:
- `freedom-from-bondage` | term: "liberty to the captives" | queries: "proclaim liberty to the captives", "set the captives free verse". In-chapter warrant: “to proclaim liberty to the captives and release to those who are bound” (61:1). Book-doc motif ("Freedom for captives") already points at this lexicon; the pack carries "breaking chains" but not this phrase family.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (5 tags after add; not subdivided).
Decisions record: ADD recorded above; no yields. Routed to corpus-blocked backlog: the good-news-to-the-humble commission (61:1-3) — already on corpus-blocked roster, row 31 (`good-news-for-the-poor`; its signature text Luke 4:18 quotes this passage): routed to the expansion queue as the OT source text for that pack's design, not duplicated.

## Isaiah 62
Existing tags (book doc): `restoration`, `gods-love`, `prayer`, `salvation` — 4 tags.
Applied-tag deltas:
- ADD `zion-city-of-god` — the chapter is spoken for the city by name and about the city throughout: “For Zion’s sake I will not hold my peace” (62:1), through the renaming (62:4, 12) to the city made "a praise on the earth" (62:7). Sustained, chapter-length presence of the Zion register, paired with ch 60's add so the two Zion chapters serve the same searcher.
- KEEP the existing 4 — each re-checked and clears the bar.
Anchor-extension candidates:
- `prayer` | Isaiah 62:6–7 | “You who call on the LORD, take no rest” … “give him no rest until he establishes” | w=0.6, editorial. Persistent-intercession teaching (the book doc's "Watchmen who give God no rest" motif); consistent with the standing intercession→`prayer` ruling — an extension of that pack, not a new id.
Lexicon candidates: None.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (5 tags after add; not subdivided).
Decisions record: ADD recorded above; no yields.

## Isaiah 63 (subdivided: 63:1–6 / 63:7–14 / 63:15–19)
Existing tags (book doc): `divine-judgment`, `gods-faithfulness`, `gods-love`, `vengeance`, `lament` — 5 tags.
Applied-tag deltas:
- ADD `holy-spirit` — the recital teaches by the Spirit's own history with Israel: “But they rebelled and grieved his Holy Spirit.” (63:10), “Where is he who put his Holy Spirit among them?” (63:11, with the Spirit giving rest, 63:14). Three verses across the recital's center — the OT's most sustained Holy-Spirit passage outside Ezekiel — and the grieving-the-Spirit teaching (which Eph 4:30 takes up) is substance, not topic-touch. Flagged borderline: if judged a stretch, it is the first to drop, and the lexicon candidate below still serves the searcher.
- KEEP the existing 5 — each re-checked and clears the bar (`gods-love` on 63:9 and `lament` on 63:15-19 stand as applied; the `pastoral-god-sees-my-suffering` removal, Decisions #29, is respected).
Anchor-extension candidates:
- `vengeance` | Isaiah 63:4 | “For the day of vengeance was in my heart, and the year of my redeemed has come.” | w=0.7, editorial. The pack has no Isaiah anchor; this is the day-of-vengeance text in God's own mouth — squarely the vengeance-is-God's-alone side the pack teaches (the display row's append already claims 63:1-6).
Lexicon candidates:
- `holy-spirit` | term: "grieve the holy spirit" | queries: "grieving the holy spirit", "can you grieve the holy spirit", "what does it mean to grieve the spirit". In-chapter warrant: 63:10 as quoted above. Curator note: Eph 4:30 is the query family's NT landing; neither it nor this phrase is in any pack lexicon today.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (63:1–6 / 63:7–14 / 63:15–19) — flagged for the per-verse refinement pass.
Decisions record: ADD recorded above; no yields.

## Isaiah 64
Existing tags (book doc): `presence-of-god`, `sin`, `repentance`, `surrender-to-god`, `lament`, `grace-not-earned` — 6 tags.
Applied-tag deltas: No changes — KEEP all 6; each re-checked and clears the bar (`surrender-to-god` is the recorded Decisions #47 borderline, critic-accepted; `grace-not-earned` carries the #64 corporate-confession caveat, preserved). Considered and NOT added: `unanswered-prayer` at 64:12 ("Will you keep silent…?") — the silence-of-God plea is one verse and the sitting `lament` tag honestly carries it.
Anchor-extension candidates:
- `grace-not-earned` | Isaiah 64:6 | “all our righteousness is like a polluted garment” | w=0.6, editorial. Carries the recorded context caveat forward (Decisions #64): corporate penitential confession; the soteriological application is application, not the verse's own claim — the gist note should say so.
Lexicon candidates:
- `grace-not-earned` | term: "filthy rags" | queries: "our righteousness is like filthy rags", "filthy rags verse". In-chapter warrant: 64:6 as quoted above. The book doc's motif note records the mapping need: WEB reads "polluted garment" where the remembered phrase is "filthy rags" — exactly the familiar-phrase-to-WEB mapping lexicons exist for.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: none (6 tags = soft cap; not subdivided).
Decisions record: None (no yields; no changes).

## Isaiah 65 (subdivided: 65:1–16 / 65:17–25)
Existing tags (book doc): `new-heaven-and-earth`, `divine-judgment`, `joy-in-the-lord`, `prayer`, `idolatry` — 5 tags.
Applied-tag deltas: No changes — KEEP all 5; each re-checked and clears the bar (`prayer` is the recorded Decisions #48 borderline, critic-accepted).
Anchor-extension candidates:
- `new-heaven-and-earth` | Isaiah 65:17 | “For, behold, I create new heavens and a new earth; and the former things will not be remembered, nor come into mind.” | w=0.95, editorial. The pack's only anchors are Revelation 21:1-4; Isaiah 65:17 is the promise's OT source text and its phrase is in the pack's lexicon verbatim ("new heavens and a new earth") — the largest single anchor gap this chunk found.
- `prayer` | Isaiah 65:24 | “before they call, I will answer; and while they are yet speaking, I will hear.” | w=0.7, editorial. The answered-before-asking promise (book-doc motif "God answers before we call").
Lexicon candidates:
- `prayer` | term: "before they call I will answer" | queries: "does god answer before we ask", "god hears before we pray". In-chapter warrant: 65:24 as quoted above.
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: SUBDIVIDED in book doc (65:1–16 / 65:17–25) — flagged for the per-verse refinement pass.
Decisions record: None (no yields; no changes).

## Isaiah 66 (subdivided: 66:1–6 / 66:7–14 / 66:15–24)
Existing tags (book doc): `humble-exaltation`, `god-of-all-comfort`, `divine-judgment`, `nations-and-peoples`, `worship`, `new-heaven-and-earth`, `fear-of-the-lord`, `empty-worship` — 8 tags (hard ceiling).
Applied-tag deltas: No changes — KEEP all 8; each re-checked and independently clears the bar (the #63 ceiling state stands: the `sabbath-rest` yield at 66:23 (Decisions #52) and the `idolatry` ceiling yield (#63) remain recorded; no new candidate surfaced in this sweep that outranks a sitting tag, so no fresh yield is forced). The `hell` non-tag at 66:24 (Decisions #51) stands — the worm-and-fire line describes dead bodies outside the city, and tagging `hell` would read Jesus' later application back into the text; no new textual evidence.
Anchor-extension candidates:
- `god-of-all-comfort` | Isaiah 66:13 | “As one whom his mother comforts, so I will comfort you.” | w=0.8, editorial. The mother-comfort text; not in the pack.
- `fear-of-the-lord` | Isaiah 66:2 | “but I will look to this man, even to he who is poor and of a contrite spirit, and who trembles at my word.” | w=0.75, editorial. The trembling-at-the-word register (66:5 supporting); the pack has no Isaiah anchor and the display row's append already claims 66:2, 5.
- `new-heaven-and-earth` | Isaiah 66:22 | “For as the new heavens and the new earth, which I will make, shall remain before me” | w=0.7, editorial. The permanence restatement, paired with the 65:17 candidate.
- `empty-worship` | Isaiah 66:3 | “He who kills an ox is as he who kills a man” | w=0.7, editorial. The offering-without-a-contrite-heart equivalences (66:3-4); the pack's Isaiah anchors are 1:11-17 and 29:13.
Lexicon candidates:
- `god-of-all-comfort` | term: "god comforts like a mother" | queries: "god comforts like a mother", "as one whom his mother comforts". In-chapter warrant: 66:13 as quoted above (book-doc motif "God's mother-like comfort").
New-concept candidates: None.
Decline-overturn proposals: None.
Ceiling / refinement flags: HARD CEILING — 8 tags; also SUBDIVIDED in book doc (66:1–6 / 66:7–14 / 66:15–24). Flagged for the per-verse refinement pass on both grounds.
Decisions record: No new yields this sweep; prior yields (#51 hell non-tag, #52 sabbath-rest yield, #63 idolatry ceiling yield) re-affirmed and left standing. Routed to corpus-blocked backlog: the cast-out-for-my-name's-sake persecution text — “Your brothers who hate you, who cast you out for my name’s sake” (66:5) — already on corpus-blocked roster, row 4 (`persecuted-for-gods-word`): routed to the expansion queue as an Isaiah witness (persecution of the word-tremblers from within Israel), not duplicated.

---

# Chunk totals (chapters 45–66)

- Chapters swept: 22 of 22 (45–66), in order; every chapter has an entry.
- Applied-tag deltas: 9 ADDs (`aging-and-old-age` 46; `the-first-and-the-last` 48; `shame` 54; `seeking-god` 55; `backsliding` 57; `zion-city-of-god` 60, 62; `messianic-prophecy` 61; `holy-spirit` 63), 0 DROPs, 104 KEEPs (every existing tag instance re-checked; none failed the bar).
- Anchor-extension candidates: 24. Lexicon candidates: 19. New-concept candidates: 0 — every genuine theme found has an honest home in the 239-pack library, the adopted vocabulary, or the corpus-blocked roster; honest-and-empty was the right answer for the new-concept class across the whole range.
- Decline-overturn proposals: 0 (no new textual evidence against any recorded decline; all standing declines and rulings — intercession→`prayer`, `justification-by-faith` read-back rejections, `hell` at 66:24, pastoral-register removals, `waiting-for-a-child` at 54:1 — re-checked and left standing).
- Routed to corpus-blocked backlog (route, don't duplicate): 7 routings — row 2 `spiritual-adultery` (Isa 50:1; 57:3-8), row 4 `persecuted-for-gods-word` (66:5), row 8 `gods-holy-name` (48:9-11; 52:5-6), row 23 `redeemer` (47:4; 48:17; 54:5, 8; 59:20; 60:16; 63:16), row 31 `good-news-for-the-poor` (61:1-3), row 40 `gentile-inclusion` (56:3-8), row 45 `exile-and-captivity` (48:20-21; 52:11-12).
- Per-verse refinement flags: 9 chapters — 48, 50, 51, 52, 56, 57, 63, 65 (subdivided in book doc), 66 (subdivided AND at the hard ceiling of 8).
- Soft-cap exceedances after adds: ch 45 (7, pre-existing), ch 55 (7, this sweep — decision recorded in the ch 55 entry); no chapter exceeds the hard ceiling.
- Adopted-only ids relied on: `sovereignty-of-god` (kept, ch 45) — verified against the canonical §11.1 adopted list (tag-apply/adopted-concepts.md; marked engine-built: no), cited in the ch 45 entry. All other ids used are exact ids from the 239-pack engine inventory (`zion-city-of-god` and `messianic-prophecy`, used in adds, are both engine-built and on the adopted list).

---

# Book totals — Isaiah (chapters 1–66)

Recomputed mechanically by the assembly pass from the 66 entries (chunk subtotals confirmed).

- Chapters swept: 66 of 66, in order; honest-and-empty (no-delta) chapters predominate.
- **Applied-tag deltas: ADD 16 · KEEP 288 · DROP 0.**
  ADDs: `drunkenness` (5); `trusting-in-man` (20, 30, 31); `messianic-prophecy` (32, 61);
  `zion-city-of-god` (33, 60, 62); `restoration` (43); `aging-and-old-age` (46);
  `the-first-and-the-last` (48); `shame` (54); `seeking-god` (55); `backsliding` (57);
  `holy-spirit` (63).
- **Anchor-extension candidates: 69** (18 + 27 + 24 by chunk; per-pack multi-candidate sets noted
  in the reconciliation notes above).
- **Lexicon candidates: 38 rows** (7 + 12 + 19 by chunk).
- **New-concept candidates: 1** — `peaceable-kingdom` (Isa 11:6–9; companion text 65:25), with the
  mandatory fold-vs-mint check against `peace-among-nations` (corpus-blocked roster row 29) before
  any mint.
- **Decline-overturn proposals: 0** — every recorded decline re-checked where touched; all stand
  (no new textual evidence anywhere in the book).
- **Corpus-blocked roster routings: 13 routing events across 12 distinct rows** (route, don't
  duplicate): row 2 `spiritual-adultery` (50:1; 57:3–8); row 4 `persecuted-for-gods-word` (66:5);
  row 8 `gods-holy-name` (48:9–11; 52:5–6); row 9 `gods-compassion-for-outsiders` (15:5; 16:9,
  11); row 23 `redeemer` (47:4; 48:17; 54:5, 8; 59:20; 60:16; 63:16 — decide alongside row 27
  `kinsman-redeemer`); row 29 `peace-among-nations` (2:2–4; plus the `peaceable-kingdom`
  fold-check); row 31 `good-news-for-the-poor` (61:1–3); row 32 `deliverance` (36:15, 18–20;
  37:11–12, 20, 35–36; 38:6); row 33 `remembrance-and-memorials` forgetting-in-prosperity flag
  (17:10); row 40 `gentile-inclusion` (19:18–25 AND 56:3–8 — merged from two chunks; ch 56's
  entry records the welcome-into-covenant register the pack must NOT absorb); row 45
  `exile-and-captivity` (48:20–21; 52:11–12); row 50 `leviathan-and-behemoth` (27:1).
- **Ceiling chapters (hard ceiling 8): 43 (8 after ADD), 44 (8 standing), 66 (8 standing).** No
  chapter exceeds 8; no §11.6 yield was forced anywhere (ch 43's ceiling arrival and ch 66's
  standing prior yields are recorded in their entries).
- **Soft-cap exceedances (7 tags):** 1, 6, 37, 40, 45 (all pre-existing per the book doc's recorded
  passes), 55 (this sweep — decision recorded in the ch 55 entry).
- **Per-verse refinement flags: 30 chapters** — 1, 2, 5, 7, 8, 9, 10, 14, 19, 21, 22, 28, 29, 30,
  32, 37, 38, 41, 42, 43, 44, 48, 50, 51, 52, 56, 57, 63, 65, 66 (exactly the book-doc-subdivided
  list in the brief §2; 43, 44, and 66 are additionally at the hard ceiling — dropped-at-ceiling
  material there survives as exact-range anchors via the refinement pass).
- Covenant #6 respected throughout: every messianic/servant-song justification reports what the
  text says or which source names a reading (fulfillment-neutral signposts preserved); nothing is
  adjudicated.
