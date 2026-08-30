# Titus — Layer-3 tag-sweep ledger

**Book:** Titus (3 chapters, 46 verses) · **Sweep worker:** Pauline-epistles group (Titus + Philemon assignment) · **Date:** 2026-08-26
**Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (engine 0.14.0; 239 concept packs) — read-only; no repo changes.
**Legal tag vocabulary:** the 239 engine ids at e762d1c UNION the 161 adopted display ids (union 303). Every id below validated mechanically against `engine-ids.txt` / `adopted-161.txt`.
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/titus.md` (prior art; existing tags are prior art, not re-derived); `ontology/concepts/*.yaml` pack files read directly for every extension decision; `tag-gaps-review.md` §1 (resolved) + §3 (declines) via the briefing extract; corpus-blocked roster (50 rows) via the briefing extract; CONVENTIONS §3/§4/§5/§6/§9/§11 verbatim extract; coverage plan §3/§5.2 extract.
**WEB provenance, honestly stated:** all quotations verified word-for-word against the repo-pinned ebible.org engwebp VPL edition (sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`, exact match to `pipeline/manifests/web.json` — this IS the pinned edition, no drift caveat). Additionally, Titus 2–3 (30 verses) are witnessed in `pipeline/fixtures/web-subset.json` and were cross-checked mechanically this session: all 30 fixture verses byte-identical to the pinned VPL. Titus 1 (16 verses) has zero fixture witnesses; its sole textual authority is the pinned VPL itself. This upgrades the book doc's 2026-08-23 provenance (its ch. 1 was then checkable against the current edition only).
**Prior-art status notes:** the book doc's PR #43 use (`justification-by-faith`, ch. 3) is ratified by Jesse 2026-08-25 (§11.5) and standing. Chapters 2 and 3 already sit at the 8-tag hard ceiling from the 2026-08-25 application pass. Doctrinal posture per the election-and-predestination pack's §4-neutral precedent: this ledger reports what curated sources name and what the WEB text says; it adjudicates nothing.

Chapter sections below are appended one at a time (atomic end-of-file appends, CONVENTIONS §9); the ledger closes with the Decisions record and survival audit.

---

## Titus 1 (16 verses)

### 1. Applied-tag deltas (prior art: 3 tags — `self-deception`, `leadership`, `false-teachers`)

- **KEEP `self-deception`** (engine id) — the chapter's closing diagnosis is the concept's exact substance, profession contradicted by life: "They profess that they know God, but by their deeds they deny him, being abominable, disobedient, and unfit for any good work." (1:16), with "both their mind and their conscience are defiled" (1:15). Prior reviewer ruling (book doc Decision 3, borderline kept) re-verified against the pinned text; presence bar cleared.
- **KEEP `leadership`** (engine + adopted id) — the chapter's first and structural task: "I left you in Crete for this reason, that you would set in order the things that were lacking and appoint elders in every city, as I directed you" (1:5), the office qualified by character — "For the overseer must be blameless, as God’s steward" (1:7) — across 1:5–9. The engine pack (`leadership.yaml`) already anchors Titus 1:5–9 at 0.85.
- **KEEP `false-teachers`** (adopted display id; engine coverage via `false-prophets`, whose label and lexicon carry "false teachers") — the urgency behind the whole chapter: "For there are also many unruly men, vain talkers and deceivers, especially those of the circumcision, whose mouths must be stopped: men who overthrow whole houses, teaching things which they ought not, for dishonest gain’s sake." (1:10–11), with the sharp-reproof charge at 1:13.
- **ADD: none. DROP: none.** Candidates weighed and declined are itemized in the Decisions record (D2): `gods-faithfulness` (1:2, thin single-verse — routed to anchor + lexicon candidates below), `giving-an-answer` (1:9, passing item inside a qualification list; the pack itself holds Titus 1:9 at LOW weight 0.5 with a rehoming note), `eternal-life` (1:2, passing phrase in the greeting — routed), `legalism` (1:14, single verse — routed to the corpus-blocked roster), `truth` (register mismatch — checked, not routed), plus the book doc's standing non-uses (`good-works` ch-1 skip; `hospitality` 1:8; `honesty`), all left standing.

### 2. Anchor-extension candidates

- **`gods-faithfulness` — Titus 1:2 — proposed weight 0.7.** WEB: "in hope of eternal life, which God, who can’t lie, promised before time began" (1:2). The God-cannot-lie promise text serves the pack's "god keeps his promises" register directly; the pack has no Titus anchor. Rider: Titus 1 not in the fixture corpus — unmeasurable until PR-β; queue, don't build (plan §3.3).
- **`false-prophets` — Titus 1:10-11 — proposed weight 0.7.** WEB: "For there are also many unruly men, vain talkers and deceivers … whose mouths must be stopped: men who overthrow whole houses, teaching things which they ought not, for dishonest gain’s sake." (1:10–11). The pack's church-age false-teachers half (2 Pet 2:1 merge) has no Pauline pastoral-epistle anchor; this is the greed-motive text. Same PR-β rider as above.
- No-duplicate check: `leadership` already anchors 1:5–9 (0.85); `giving-an-answer` already anchors 1:9 (0.5, with its own rehoming sub-call toward the corpus-blocked `contending-for-the-faith` row — noted, not disturbed); `good-works` already anchors 1:16 (0.6, corpus-blocked rider). Nothing re-proposed.

### 3. Lexicon candidates

- **`gods-faithfulness`:** "god cannot lie"; "can god lie"; "it is impossible for god to lie" (Heb 6:18's remembered phrasing, which Titus 1:2 also serves). Existing lexicon carries "god keeps his promises" but no lie-phrasing.
- **`leadership`:** "who can be a pastor"; "requirements to be an elder"; "choosing church leaders". (Existing lexicon already carries "qualifications of an elder" — these are the adjacent phrasings people actually type; alias-mining rule applies: run against the live engine first, never add a row for a query that already lands.)

### 4. New-concept candidates

None. The chapter's one theme without a positive home — sound doctrine / teaching truth — is a recorded decline for this very book ("served in the negative by the `false-teachers` row", tag-gaps-review §3.5 Titus note); no new textual evidence, so it stands.

### 5. Decline-overturn proposals

None.

### 6. Ceiling / subdivision marker

Does not hit the 8-tag ceiling (3 tags). **Subdivided in the book doc** (3 BSB sections: 1:1–4 / 1:5–9 / 1:10–16) → flagged for the per-verse refinement pass.

### Corpus-blocked routes (this chapter)

- **`legalism` → roster row 43** (Col 2 register, SKIPPED-blocked): Titus 1:14 "not paying attention to Jewish fables and commandments of men who turn away from the truth" recorded as an additional witness for the re-pin curator; not duplicated as a candidate here (ch. 3 adds 3:9).
- **`eternal-life` → the roster's re-open note** (eternal-life standalone-pack question, recorded in `salvation.yaml`'s lexicon-extension comment): Titus 1:2 "in hope of eternal life" recorded as an additional witness.
- **`truth` (roster row 42) checked, NOT routed:** the row waits on the what-is-truth register (John 18:37–38); Titus 1:1's "the knowledge of the truth which is according to godliness" is a different register — recorded so the check is visible.

---

## Titus 2 (15 verses — fixture-witnessed 15/15, byte-exact vs pinned VPL)

### 1. Applied-tag deltas (prior art: 8 tags — AT THE HARD CEILING)

All eight prior tags re-verified against the pinned text and **KEPT**; no adds are possible without a yield, and no keep fails the presence bar, so there are no deltas. Justifications re-anchored:

- **KEEP `grace-not-earned`** — "For the grace of God has appeared, bringing salvation to all men, instructing us" (2:11–12): grace arrives before it asks, and itself does the teaching.
- **KEEP `self-control`** — the chapter's refrain across every group: "older men should be temperate, sensible, sober minded" (2:2); young wives "sober minded, chaste" (2:5); "exhort the younger men to be sober minded" (2:6); all taught to "live soberly, righteously, and godly in this present age" (2:12).
- **KEEP `second-coming`** — "looking for the blessed hope and appearing of the glory of our great God and Savior, Jesus Christ" (2:13).
- **KEEP `the-cross`** — "who gave himself for us, that he might redeem us from all iniquity and purify for himself a people for his own possession, zealous for good works" (2:14).
- **KEEP `deity-of-christ`** — the WEB's rendering titles Jesus directly: "our great God and Savior, Jesus Christ" (2:13). Re-verified letter-for-letter against the pinned VPL this sweep; the tag reports the rendering, per the standing reviewer ruling (book doc Decision 2) and the pack's own comment (the one-article construction stays out of display wording).
- **KEEP `godly-marriage`** — "that they may train the young wives to love their husbands, to love their children, to be sober minded, chaste, workers at home, kind, being in subjection to their own husbands, that God’s word may not be blasphemed" (2:4–5). Prior Decision 8 (borderline kept) stands; at the ceiling with every tag clearing the bar, no yield is forced.
- **KEEP `discipleship`** — the older-training-younger pattern: older women "teachers of that which is good, that they may train the young wives" (2:3–4), Titus himself "an example of good works" (2:7). Display tag only: the engine pack's binding comment assigns the Titus 2:3–5 anchor to `godly-marriage` and carries the older-training-younger register via 2 Tim 2:2 — so no anchor extension is proposed here (see §2).
- **KEEP `bondservants-and-masters`** — "Exhort servants to be in subjection to their own masters and to be well-pleasing in all things, not contradicting, not stealing, but showing all good fidelity, that they may adorn the doctrine of God, our Savior, in all things" (2:9–10). Pack already anchors 2:9–10 at 0.85.
- **ADD: none (ceiling). DROP: none.** Would-be adds recorded per the no-silent-drop rule (Decisions D3): `aging-and-old-age` (2:2–3 — honest instruction to older believers, but at the ceiling it is the theme-witness-with-caveat class; routed to an anchor-extension candidate below so the refinement pass can seat it as a verse range) and `salvation` (2:11 "bringing salvation to all men" — broad-duplicating-specific beside `grace-not-earned`; the pack's own Titus 2:11 anchor already carries the engine side).

### 2. Anchor-extension candidates

- **`self-control` — Titus 2:2-6 — proposed weight 0.7.** WEB: "older men should be temperate, sensible, sober minded" (2:2); "exhort the younger men to be sober minded" (2:6). The pack has no Titus anchor and its lexicon ("self control; self controlled") is exactly what the refrain teaches. OVERLAP RECORDED: `godly-marriage` owns 2:3–5 (Torrey WIVES) — the sober-minded refrain is the verses' own words, so this is the 2 Tim 1:7 / Rom 13:1-7 dual-claim pattern; record in both files if adopted. Narrow alternative if the curator prefers disjoint spans: two single-verse anchors, Titus 2:2 (0.65) + Titus 2:6 (0.6). Boundary honored: 2:12 stays inside `pastoral-freedom-from-bondage`'s 2:11–12 anchor. In corpus (fixture-witnessed).
- **`aging-and-old-age` — Titus 2:2-3 — proposed weight 0.55.** WEB: "that older men should be temperate, sensible, sober minded, sound in faith, in love, and in perseverance, and that older women likewise be reverent in behavior" (2:2–3). The pack's six anchors are all OT/Wisdom; this is the NT aging-with-faith instruction text. OVERLAP RECORDED: 2:3 sits inside `godly-marriage`'s 2:3–5 span — dual claim, record both files if adopted. In corpus.
- No-duplicate check: 2:3–5 `godly-marriage` (0.75); 2:7 `good-works` (0.9); 2:9–10 `bondservants-and-masters` (0.85); 2:11 `salvation` (0.7); 2:11–12 `pastoral-freedom-from-bondage` (0.85); 2:13 `deity-of-christ` (0.8) + `second-coming` (0.7) + `mormon-evangelism` (movement-qualified); 2:14 `good-works` (1.0, keystone). Nothing re-proposed.

### 3. Lexicon candidates

- **`second-coming`:** "the blessed hope"; "what is the blessed hope"; "looking for his appearing". Existing lexicon has no blessed-hope phrasing; Titus 2:13 is the anchor already in the pack.
- **`grace-not-earned`:** "grace teaches us"; "grace teaches us to say no to ungodliness" (NIV-remembered phrasing of 2:12 — the WEB prints "denying ungodliness", so the remembered form reaches nothing lexically; `salvation`'s "you must be born again" remembered-phrasing precedent); "does grace change how you live".
- **`sharing-your-faith`:** "witness by example"; "living so others see christ"; "adorn the doctrine" (the WEB's own phrase, 2:10). Caution recorded: 2:10's anchor belongs to `bondservants-and-masters`; these are lexicon-side phrasings for the witness-of-conduct intent (2:5, 2:8, 2:10 motive clauses), not an anchor claim.

### 4. New-concept candidates

None. The adorning-the-doctrine motif (book doc motif 7) is served as the `sharing-your-faith` lexicon candidate above, not a new id — every other theme in the chapter has an exact home among the 303.

### 5. Decline-overturn proposals

None.

### 6. Ceiling / subdivision marker

**HITS THE 8-TAG HARD CEILING** (8 tags, every one independently clearing the bar per the 2026-08-25 application pass, re-verified). **Subdivided in the book doc** (2 BSB sections: 2:1–10 / 2:11–15) → flagged for the per-verse refinement pass; the refinement pass is where the ceiling-yielded `aging-and-old-age` and the `self-control` refrain get exact verse-range homes (candidates staged in §2).

---

## Titus 3 (15 verses — fixture-witnessed 15/15, byte-exact vs pinned VPL)

### 1. Applied-tag deltas (prior art: 8 tags — AT THE HARD CEILING)

All eight prior tags re-verified against the pinned text and **KEPT**; no adds without a yield; no deltas.

- **KEEP `salvation`** — the chapter's center: "he saved us through the washing of regeneration and renewing by the Holy Spirit, whom he poured out on us richly through Jesus Christ our Savior" (3:5–6).
- **KEEP `grace-not-earned`** — "not by works of righteousness which we did ourselves, but according to his mercy" (3:5). Pack anchors Titus 3:5 at 0.8.
- **KEEP `justification-by-faith`** — "that being justified by his grace, we might be made heirs according to the hope of eternal life" (3:7). PR #43 use, ratified by Jesse 2026-08-25 (§11.5) — standing, no longer pending review. The grace-not-faith-instrument caveat stays recorded in the book doc's Decision 1; the pack's own Titus 3:5–7 anchor comment carries the same reading.
- **KEEP `harmony-with-others`** — "to speak evil of no one, not to be contentious, to be gentle, showing all humility toward all men" (3:2), with quarrels shunned: "shun foolish questionings, genealogies, strife, and disputes about the law; for they are unprofitable and vain" (3:9).
- **KEEP `good-works`** — the refrain pressed home: "to be ready for every good work" (3:1); "insist confidently, so that those who have believed God may be careful to maintain good works" (3:8); "Let our people also learn to maintain good works to meet necessary needs" (3:14) — always downstream of the mercy that saved (3:5), per the pack's own grace-first gist.
- **KEEP `governing-authorities`** — "Remind them to be in subjection to rulers and to authorities, to be obedient" (3:1). Pack anchors 3:1–2 at 0.85.
- **KEEP `church-discipline`** — "Avoid a factious man after a first and second warning, knowing that such a one is perverted and sinful, being self-condemned" (3:10–11). Pack anchors 3:10–11 at 0.9.
- **KEEP `outpouring-of-the-spirit`** (adopted display id) — the letter-side outpouring text: the Holy Spirit "whom he poured out on us richly through Jesus Christ our Savior" (3:6, with 3:5). ENGINE ROUTING NOTE: the engine-side fold of this row into `holy-spirit` is decided (`holy-spirit.yaml` header: "outpouring-of-the-spirit … folds HERE"). The display id remains legal adopted vocabulary per §11.1, so the tag stands; its engine value routes to `holy-spirit` (anchor-extension candidate in §2), not to a standalone pack.
- **ADD: none (ceiling). DROP: none.** Would-be adds recorded (Decisions D4): `mercy` (3:5 clause — `mercy.yaml`'s own boundary comment routes Titus 3:5 to `grace-not-earned`/`justification-by-faith`; declined), `kindness` (3:4 — single clause, and the pack's register is the human virtue; declined as a tag, offered as a caveated anchor candidate in §2), `new-birth` (adopted id; "washing of regeneration" — declined at the ceiling and per the 1 John born-again withheld precedent: `salvation.yaml` owns "you must be born again"; routed as a `salvation` lexicon candidate), `faith-and-works` (its Titus 3:8 anchor already exists; a display tag would duplicate `good-works`' insistence-text register here), `eternal-life` (3:7 phrase — routed to the roster re-open note).

### 2. Anchor-extension candidates

- **`holy-spirit` — Titus 3:5-6 — proposed weight 0.7.** WEB: "he saved us through the washing of regeneration and renewing by the Holy Spirit, whom he poured out on us richly through Jesus Christ our Savior" (3:5–6). The decided outpouring fold names the pour/outpouring lexicon entries as the register's carriers, but the pack has no letter-side outpouring anchor (its pour texts are Acts 2 / Joel 2). OVERLAP RECORDED: `justification-by-faith` owns the 3:5–7 span and `grace-not-earned` owns 3:5 — different claims, each the verses' own words (Rom 13:1–7 dual precedent); record in all files if adopted. In corpus (fixture-witnessed).
- **`harmony-with-others` — Titus 3:2 — proposed weight 0.65.** WEB: "to speak evil of no one, not to be contentious, to be gentle, showing all humility toward all men" (3:2). Exactly the pack's peaceable-relations register ("avoid quarreling"); no Titus anchor. OVERLAP RECORDED: `governing-authorities` owns the 3:1–2 span (its comment quotes through "to speak evil of no one") — dual claim, record both files if adopted. In corpus.
- **`kindness` — Titus 3:4 — proposed weight 0.5, CAVEATED.** WEB: "But when the kindness of God our Savior and his love toward mankind appeared" (3:4). A famous kindness-of-God text that would serve "what does the bible say about kindness" honestly — but the pack's recorded register is the human virtue (its hesed boundary keeps "loving kindness" with `mercy`). Offered as the curator's call; decline-ready if the register stays human-only.
- No-duplicate check: 3:1–2 `governing-authorities` (0.85); 3:5 `grace-not-earned` (0.8); 3:5–7 `justification-by-faith` (0.8); 3:8 `faith-and-works` (0.65, torrey); 3:10–11 `church-discipline` (0.9); 3:14 `good-works` (0.85). Nothing re-proposed.

### 3. Lexicon candidates

- **`salvation`:** "washing of regeneration"; "what is the washing of regeneration"; "saved by his mercy". (The pack already carries "you must be born again" and the eternal-life extension; these are the Titus-3 phrasings with no current home.)
- **`church-discipline`:** "how to handle a divisive person"; "divisive people in the church"; "when to avoid someone in the church". (Existing lexicon is sin-handling and restoration phrasings; the factious-man query family is distinct.)

### 4. New-concept candidates

None. Every honest theme has an exact home among the 303 or a standing routed decline.

### 5. Decline-overturn proposals

None. (The Titus sound-doctrine decline and the 1 John born-again withholding both stand — no new textual evidence beyond what those records already weighed.)

### 6. Ceiling / subdivision marker

**HITS THE 8-TAG HARD CEILING** (8 tags, every one independently clearing the bar, re-verified). **Subdivided in the book doc** (3 BSB sections: 3:1–8 / 3:9–11 / 3:12–15) → flagged for the per-verse refinement pass.

### Corpus-blocked routes (this chapter)

- **`legalism` → roster row 43:** Titus 3:9 "shun foolish questionings, genealogies, strife, and disputes about the law; for they are unprofitable and vain" recorded as an additional witness (with 1:14) for the re-pin curator.
- **`inheritance` → roster row 26** (NT in-Christ heirs register recorded there for re-pin): Titus 3:7 "we might be made heirs according to the hope of eternal life" recorded as an additional NT-register witness.
- **`eternal-life` → the roster's re-open note:** Titus 3:7 "the hope of eternal life" recorded (with 1:2).

---

## Decisions record — Titus sweep (2026-08-26)

Every yield and judgment call in this sweep, per §11.6's no-silent-drop rule. All reversible defaults Jesse can overturn.

1. **Zero drops; all 19 prior tag applications kept** (ch. 1: 3; ch. 2: 8; ch. 3: 8). Every keep was re-verified against the pinned VPL (quotes word-for-word, refs in-chapter, presence bar re-judged) — none rests on the prior doc's authority alone.
2. **Ch. 1 declined adds** (each weighed against the presence bar): `gods-faithfulness` (1:2 is one verse in the greeting — thin single-verse; served instead by the anchor + lexicon candidates); `giving-an-answer` (1:9 is a passing item inside the elder list — same passing-phrase ruling the book doc applied to `hospitality` on 1:8; corroborated by the pack's own LOW-0.5 weight and rehoming sub-call); `eternal-life` (1:2 phrase — routed); `legalism` (1:14 single verse — routed to roster row 43); `truth` (register mismatch with roster row 42 — checked, not routed, recorded). The book doc's standing non-uses (`good-works` on ch. 1 per its Decision 9; `hospitality`; `honesty`) all left standing — no new evidence disturbs them.
3. **Ch. 2 ceiling yields (would-be adds, recorded not silent):** `aging-and-old-age` (2:2–3 clears the presence bar as instruction to older believers but is the theme-witness class at a full ceiling; seated instead as a §2 anchor-extension candidate for the refinement pass); `salvation` (2:11 — broad-duplicating-specific beside `grace-not-earned`; engine side already carried by the pack's Titus 2:11 anchor). Prior Decision 8's `godly-marriage` borderline-keep re-affirmed: at the ceiling with every tag clearing the bar independently, §11.6 forces no yield.
4. **Ch. 3 ceiling yields (would-be adds, recorded not silent):** `mercy` (barred by `mercy.yaml`'s own Titus 3:5 boundary comment); `kindness` (register caveat; caveated anchor candidate offered instead); `new-birth` (born-again phrasing owned by `salvation` per the 1 John withholding — routed as a `salvation` lexicon candidate); `faith-and-works` (anchor exists; tag would duplicate `good-works`' register here); `eternal-life` (routed to the roster re-open note).
5. **`outpouring-of-the-spirit` kept as a display tag despite the decided engine fold into `holy-spirit`.** §11.1 makes the adopted list legal display vocabulary; an engine-side fold does not amend the display list. The engine value is routed honestly: the §2 `holy-spirit` Titus 3:5–6 anchor candidate, no standalone-pack proposal.
6. **`justification-by-faith` (PR #43) standing** per Jesse's 2026-08-25 ratification (§11.5); the in-verse grace-instrument caveat remains recorded in the book doc, not re-litigated here.
7. **`deity-of-christ` on 2:13** re-verified letter-for-letter against the pinned VPL ("our great God and Savior, Jesus Christ"); the tag reports the WEB rendering per the standing reviewer ruling — no adjudication of the underlying construction (§6; covenant #6).
8. **`discipleship` display tag kept while proposing no anchor** — the pack's binding comment ("Titus 2:3-5 stays godly-marriage's; the older-training-younger register is carried by 2 Tim 2:2") governs anchors, not display tags; honored as written.
9. **Overlapping-anchor proposals flagged, never silent:** `self-control` 2:2–6 (overlaps `godly-marriage` 2:3–5), `aging-and-old-age` 2:2–3 (same), `holy-spirit` 3:5–6 (overlaps `justification-by-faith` 3:5–7 and `grace-not-earned` 3:5), `harmony-with-others` 3:2 (overlaps `governing-authorities` 3:1–2) — each cites the Rom 13:1–7 / 2 Tim 1:7 dual-claim precedent and requires both-files recording if adopted. Disjoint narrow alternatives offered where they exist.
10. **All anchor candidates are queue-only.** Titus 1 candidates are corpus-blocked until PR-β (Titus 1 not in the fixture corpus); Titus 2–3 candidates are in-corpus but still follow the fixtures-first gauntlet path (plan §3.3) — nothing here creates a pack, moves a weight, or touches ENGINE_VERSION.
11. **Provenance decision:** quotes verified against the pinned VPL (sha256-verified = manifest); Titus 2–3 additionally cross-checked against `web-subset.json` fixture witnesses (30/30 byte-identical, mechanical). Recorded per CONVENTIONS §3 — this is pinned-text verification, honestly claimable for all three chapters.

## Survival audit — Titus ledger

2026-08-26: ledger written as 5 atomic end-of-file appends (header; ch. 1; ch. 2; ch. 3; this Decisions/audit block). After every append the full file was re-read and byte-compared against a running mirror: pre-existing bytes unchanged and the new block present, all 5/5 writes verified. No other file under /mnt/project-files was touched by this worker for this book. Final re-audit at delivery: all sections present exactly once (grep: one `## Titus 1`, one `## Titus 2`, one `## Titus 3`, one Decisions record).

---

## Erratum — Titus ledger (2026-08-26)

Appended per CONVENTIONS §9 as one atomic end-of-file block; nothing above this line was altered.

1. **Decisions item 8 slightly misquotes `discipleship.yaml`'s binding comment.** The item renders it "Titus 2:3-5 stays godly-marriage's; the older-training-younger register is carried by 2 Tim 2:2". The pack's actual wording, byte-exact (header boundary comment, quoted verbatim including its wrap):
   ```
   # Titus 2:3-5 stays godly-marriage's (the older-training-younger
   # register is carried by 2 Tim 2:2 instead).
   ```
   That is, a parenthesis rather than a semicolon, and the sentence ends "...by 2 Tim 2:2 instead)." Substance unaffected: the boundary and Decision 8's ruling (the comment governs anchors, not display tags) stand as written.
