# Colossians — Layer-3 tag-sweep ledger

**Book:** Colossians (4 chapters; VPL book code `COL` in the pinned engwebp source)
**Repo SHA:** e762d1c629f5b121a2aacc6da57cca6bacc3215e (origin/main = HEAD; engine 0.14.0; 239 concept packs)
**Date:** 2026-08-26
**Sweep worker:** Pauline-epistles group, Philippians+Colossians assignment (Philippians ledger delivered first, same session)
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/colossians.md` (prior art — existing tags with WEB-quote justifications); full engine concept library `ontology/concepts/` at e762d1c (239 ids, lexicons + anchors read from the pack files); adopted display-tag list (161 ids, CONVENTIONS §11.1; regenerated copy in the sweep briefing pack); `tag-gaps-review.md` §1 (contested calls, resolved by §11) and §3 (recorded declines/folds/not-gaps); `engine-pack-backlog.md` corpus-blocked roster (50 rows, re-verified STILL GATED post-#53); CONVENTIONS §3/§4/§5/§6/§9/§11.
**WEB provenance:** pinned ebible.org engwebp VPL per `pipeline/manifests/web.json`, sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c` — archive fetched and sha256-verified against the manifest (exact match) by the sweep prep worker; every quote below is word-for-word from that pinned text (COL 1–4), not a current-edition fetch. No drift caveat applies.
**Legal tag vocabulary:** the 239 engine ids UNION the 161 adopted ids (303 unique). Every id written below was mechanically validated with `grep -qx` against both lists.
**Rules applied:** presence bar first (§5, §11.6); soft cap 6 / hard ceiling 8; §11.6 yield order; both-tags ruling (§11.2); no later-revelation read-backs; no silent drops — every yield/drop has a Decisions-record entry; declines re-considerable only with new textual evidence; corpus-blocked matches routed, not duplicated; doctrinal posture per §6 and the election-and-predestination pack's §4-neutral precedent — this ledger reports what curated sources name and adjudicates nothing; `supremacy-of-christ` handling stays descriptive throughout.

Prior-art baseline (book doc tag lines, re-verified verse-by-verse against the pinned VPL this sweep): ch 1 = 7 tags, ch 2 = 8 (hard ceiling, reached at the 2026-08-25 application pass), ch 3 = 7, ch 4 = 5. Every sitting justification quote in the book doc was re-checked word-for-word against the pinned text and verified (the book doc's chs 2 and 4 were originally current-edition-checked only; this sweep's pinned-text re-check closes that caveat for every quoted fragment cited below).

---

## Colossians 1

### 1. Applied-tag deltas (vs book doc: 7 sitting tags; result: 8 tags — 1 add, 7 keeps, 0 drops)

- **KEEP `deity-of-christ`** — "He is the image of the invisible God, the firstborn of all creation" (1:15); "All things have been created through him and for him" (1:16); "For all the fullness was pleased to dwell in him" (1:19). Pack anchors 1:15–20 material via its Colossians entries.
- **KEEP `supremacy-of-christ`** — the Christ-poem's preeminence claims: "He is before all things, and in him all things are held together" (1:17); "that in all things he might have the preeminence" (1:18). Pack anchors 1:15 (1.0), 1:16 (0.95), 1:17 (0.9), 1:18 (0.9) — its home chapter. Descriptive register kept exactly as the pack's §-signposted comments have it; nothing adjudicated.
- **KEEP `the-cross`** — "having made peace through the blood of his cross" (1:20); "yet now he has reconciled in the body of his flesh through death" (1:22).
- **KEEP `forgiveness-of-sins`** — "in whom we have our redemption, the forgiveness of our sins" (1:14).
- **KEEP `prayer`** — "praying always for you" (1:3); "we also, since the day we heard this, don’t cease praying and making requests for you" (1:9), the petition running to 1:12.
- **KEEP `thanksgiving`** — "We give thanks to God the Father of our Lord Jesus Christ" (1:3); "giving thanks to the Father, who made us fit to be partakers of the inheritance of the saints in light" (1:12). Taught repeatedly (1:3, 1:12; cf. the book-level pattern) — unlike Philippians 1's single formula, this clears the bar on two teaching-weight occurrences.
- **KEEP `suffering-for-christ`** — "Now I rejoice in my sufferings for your sake, and fill up on my part that which is lacking of the afflictions of Christ in my flesh for his body’s sake" (1:24).
- **ADD `hope-in-god`** — re-admission of a candidate the book doc declined ONLY on the old 6-cap (its Decision 6: "Hope is genuinely present... but the six slots went to the chapter's main argument"). The cap is now soft 6 / hard 8 (§11.6, post-dating that decision), and the presence case is three-fold and spans the chapter: "the hope which is laid up for you in the heavens" (1:5 — the pack's own torrey anchor); "not moved away from the hope of the Good News" (1:23); "which is Christ in you, the hope of glory" (1:27). Not a decline-overturn in the §3 sense — the book doc's own record shows a cap-ground, not a presence-ground, decline.

### 2. Anchor-extension candidates

- `knowing-god` ← **Colossians 1:9-10**, weight 0.7 — "that you may be filled with the knowledge of his will in all spiritual wisdom and understanding" (1:9), "increasing in the knowledge of God" (1:10). Pack has no Pauline anchor; pairs with this sweep's Philippians 3:8–11 proposal (Philippians ledger, ch 3 §2). (Display tag yielded at the ceiling — Decisions C2.)
- `abiding-in-christ` ← **Colossians 1:27**, weight 0.7 — "which is Christ in you, the hope of glory". Pack has no Pauline anchor; the Christ-in-you register is its lexicon's own family. Book-doc motif 1 named `hope-in-god` and `abiding-in-christ` as this verse's homes — the first is now tagged; this extension serves the second.
- `light-and-darkness` ← **Colossians 1:12-13**, weight 0.65 — "the inheritance of the saints in light, who delivered us out of the power of darkness" (1:12–13). Transfer-between-dominions register; pack has no Pauline anchor.
- `salvation` ← **Colossians 1:13-14**, weight 0.65 — "who delivered us out of the power of darkness, and translated us into the Kingdom of the Son of his love, in whom we have our redemption, the forgiveness of our sins". CURATOR NOTE: the pack's lexicon is evangelistic ("how can i be saved"); this is an accomplished-rescue statement — weigh routing before adding.

### 3. Lexicon candidates

- `hope-in-god`: "Christ in you the hope of glory"; "the hope of glory"; "hope stored up in heaven".
- `abiding-in-christ`: "Christ in you"; "Christ lives in me".
- `light-and-darkness`: "delivered from darkness"; "brought out of darkness into light".

### 4. New-concept candidates

None — honest-and-empty. One route executed: 1:12's "the inheritance of the saints in light" is `inheritance`-register material and `inheritance` is corpus-blocked — **route: corpus-blocked roster row 26** (which already records the NT in-Christ register as a design to decide at re-pin, with 1 Pet 1:4 / Eph 1:11–14); Col 1:12 recorded there as an additional NT witness. No duplicate candidate minted.

### 5. Decline-overturn proposals

None. (The `hope-in-god` add is a cap-ground re-admission under the new ceiling, documented in §1 and Decisions C1 — not the reversal of a §3 recorded decline.)

### 6. Ceiling / subdivision marker

**FLAGGED for the per-verse refinement pass:** chapter now sits at the 8-tag hard ceiling (1 add executed, 1 candidate yielded — Decisions C2), and the book doc subdivides it (1:1–2 / 1:3–14 / 1:15–23 / 1:24–29). Refinement targets with ranges: `knowing-god` (1:9–10), plus the considered-and-declined set in Decisions C3 (`creation` 1:16–17, `image-of-god` 1:15).

---

## Colossians 2

### 1. Applied-tag deltas (vs book doc: 8 sitting tags at the hard ceiling; result: 8 tags — 0 adds, 8 keeps, 0 drops)

All eight sitting tags re-verified against the pinned text (closing the chapter's current-edition-only caveat) and kept; two new candidates weighed and yielded at the ceiling (Decisions C4); the 2026-08-25 application pass's two recorded skips stand.

- **KEEP `deity-of-christ`** — "For in him all the fullness of the Deity dwells bodily" (2:9), "and in him you are made full, who is the head of all principality and power" (2:10). Pack anchors 2:9 at 0.9.
- **KEEP `victory-in-christ`** — "Having stripped the principalities and the powers, he made a show of them openly, triumphing over them in it" (2:15).
- **KEEP `the-cross`** — "wiping out the handwriting in ordinances which was against us. He has taken it out of the way, nailing it to the cross" (2:14).
- **KEEP `forgiveness-of-sins`** — "He made you alive together with him, having forgiven us all our trespasses" (2:13).
- **KEEP `baptism`** — "having been buried with him in baptism, in which you were also raised with him through faith in the working of God, who raised him from the dead" (2:12). PR #43 id, ratified 2026-08-25; the pack's own comment corpus-defers Col 2:12 as an anchor (chapter absent from the fixture corpus) — display tag unaffected.
- **KEEP `disputable-matters`** — "Let no one therefore judge you in eating or drinking, or with respect to a feast day or a new moon or a Sabbath day" (2:16), "which are a shadow of the things to come; but the body is Christ’s" (2:17). Book-doc Decisions 2 and 10 (the `sabbath-rest` boundary and the register caveat) stand unchanged.
- **KEEP `false-teachers`** — "Now I say this that no one may delude you with persuasiveness of speech" (2:4); "Be careful that you don’t let anyone rob you through his philosophy and vain deceit, after the tradition of men" (2:8); "Let no one rob you of your prize by self-abasement and worshiping of the angels" (2:18). The whole chapter is the protective argument — the id's paradigm Pauline chapter.
- **KEEP `legalism`** — "Don’t handle, nor taste, nor touch" (2:21), "according to the precepts and doctrines of men" (2:22), rules that "indeed appear like wisdom in self-imposed worship, humility, and severity to the body, but aren’t of any value against the indulgence of the flesh" (2:23).

### 2. Anchor-extension candidates

- `spiritual-growth` ← **Colossians 2:6-7**, weight 0.7 — "As therefore you received Christ Jesus the Lord, walk in him, rooted and built up in him and established in the faith, even as you were taught, abounding in it in thanksgiving." Book-doc motif 2's material; pack has EPH anchor only. (Display tag yielded at the ceiling — Decisions C4.)
- `wisdom-from-god` ← **Colossians 2:3**, weight 0.65 — "in whom all the treasures of wisdom and knowledge are hidden." Wisdom located in Christ — a register the pack (no Pauline anchors) lacks.

### 3. Lexicon candidates

- `spiritual-growth`: "rooted and built up in Christ"; "walk in him".
- `wisdom-from-god`: "treasures of wisdom and knowledge"; "wisdom hidden in Christ".
- `victory-in-christ`: "disarmed the powers" (NIV-remembered form of 2:15); "triumphing over the powers".
- `legalism` (for the eventual pack — see §4 route): "don't handle don't taste don't touch"; "man-made religious rules"; "legalism in the bible".

### 4. New-concept candidates

None — honest-and-empty. Two routes executed, no duplicates minted:

- **Route: corpus-blocked roster row 43 (`legalism`).** Col 2:16–23 is that row's own recorded minting text ("corpus-blocked: Col 2:16-23 absent (Col corpus = chs 1, 3); grace-not-earned extension route flagged for re-pin"). The display tag above stands (display layer is not corpus-gated); the engine-pack material and the §3 lexicon feed ride row 43.
- **Route: corpus-blocked roster row 37 (`circumcision-of-the-heart`).** "In him you were also circumcised with a circumcision not made with hands, in the putting off of the body of the sins of the flesh, in the circumcision of Christ" (2:11) — a NT made-without-hands witness for that row's deferred heart-design (its noted free keystone is Rom 2:28–29). No display tag proposed: one verse inside the fullness argument; presence bar not met at chapter level.

### 5. Decline-overturn proposals

None.

### 6. Ceiling / subdivision marker

**FLAGGED for the per-verse refinement pass:** chapter sits at the 8-tag hard ceiling (reached at the 2026-08-25 application pass; this sweep yielded two further candidates — Decisions C4). Book doc leaves ch 2 deliberately undivided (its Decision 3) with the ready BSB boundary at 2:6 recorded. Refinement targets with ranges: `spiritual-growth` (2:6–7), `wisdom-from-god` (2:3), the standing skipped pair from the application pass (`angels` 2:18; `supremacy-of-christ` 2:10), and the routed `circumcision-of-the-heart` witness (2:11).

---

## Colossians 3

### 1. Applied-tag deltas (vs book doc: 7 sitting tags; result: 8 tags — 1 add, 7 keeps, 0 drops)

- **KEEP `identity-in-christ`** — "For you died, and your life is hidden with Christ in God" (3:3); "but Christ is all, and in all" (3:11). Book-doc Decision 10's keep-rationale (no read-back — the chapter is the concept's own teaching substance) reaffirmed.
- **KEEP `holiness`** — "Put to death therefore your members which are on the earth" (3:5); "put on the new man" (3:10); "as God’s chosen ones, holy and beloved" (3:12).
- **KEEP `forgiving-others`** — "bearing with one another, and forgiving each other, if any man has a complaint against any; even as Christ forgave you, so you also do" (3:13). Pack anchors 3:13.
- **KEEP `thanksgiving`** — "and be thankful" (3:15); "giving thanks to God the Father through him" (3:17); "singing with grace in your heart to the Lord" (3:16). Pack anchors 3:17.
- **KEEP `godly-marriage`** — "Wives, be in subjection to your husbands, as is fitting in the Lord" (3:18); "Husbands, love your wives, and don’t be bitter against them" (3:19). Described, not adjudicated, per book-doc Decision 9.
- **KEEP `remembered-work-as-for-the-lord`** — the concept's own 1.0 anchor text: "And whatever you do, work heartily, as for the Lord and not for men" (3:23). No read-back (NT epistle source text).
- **KEEP `bondservants-and-masters`** — "Servants, obey in all things those who are your masters according to the flesh, not just when they are looking, as men pleasers, but in singleness of heart, fearing God" (3:22), with "the reward of the inheritance" (3:24) and "there is no partiality" (3:25). Pack anchors 3:22; described-not-adjudicated framing carried.
- **ADD `thought-life`** — the chapter's thesis command, and the pack's own 0.9 anchor: "Set your mind on the things that are above, not on the things that are on the earth" (3:1–2, with "seek the things that are above" in 3:1). Id post-dates the book doc's 131-id snapshot (minted in the 161-rollout with `Colossians 3:1-2` as a designed anchor); main-theme first — the whole put-off/put-on argument flows from the set-your-mind command. Chosen for the single open slot over the book doc's four Decision-5 standbys on main-theme grounds (Decisions C5).

### 2. Anchor-extension candidates

- `new-creation` ← **Colossians 3:9-11**, weight 0.75 — "seeing that you have put off the old man with his doings, and have put on the new man, who is being renewed in knowledge after the image of his Creator" (3:9–10). Old-man/new-man renewal register; pack (2CO GAL anchors) lacks the Colossians statement. (Display candidate yielded at the ceiling — Decisions C5.)
- `worship` ← **Colossians 3:16**, weight 0.7 — "in all wisdom teaching and admonishing one another with psalms, hymns, and spiritual songs, singing with grace in your heart to the Lord." The 1 Chronicles block's lexicon finding ("worship music" / singing phrasings uncarried) gets its NT anchor here; pack has no Pauline anchor. `delight-in-the-word` already anchors 3:16 for the word-dwelling register — dual claim, deliberate, distinct registers.
- `heavenly-reward` ← **Colossians 3:24**, weight 0.7 — "knowing that from the Lord you will receive the reward of the inheritance; for you serve the Lord Christ." 3:24 is unclaimed by the packs that share this chapter (3:22 `bondservants-and-masters`, 3:23 `remembered-work-as-for-the-lord`/`pleasing-god-not-people`, 3:25 `favoritism` — per the bondservants pack's own claim comment). CURATOR NOTE: the verse's "inheritance" wording also feeds corpus-blocked row 26 — see §4; one verse, two registers, decide together.

### 3. Lexicon candidates

- `thought-life`: "set your mind on things above"; "seek the things above"; "heavenly minded".
- `worship`: "psalms hymns and spiritual songs"; "singing in worship"; "why do we sing in church".
- `new-creation`: "put off the old man"; "the new self"; "put on the new man".

### 4. New-concept candidates

None — honest-and-empty. One route executed: 3:24's "the reward of the inheritance" is NT in-Christ `inheritance`-register material — **route: corpus-blocked roster row 26** (same routing as Col 1:12, recorded in ch 1 §4); no duplicate candidate minted. One §4-neutral non-find recorded: "as God’s chosen ones, holy and beloved" (3:12) was checked against `election-and-predestination` and NOT tagged — an address formula grounding the ethical charge, not election teaching; the pack's §4-neutral wording is the binding precedent and nothing here adjudicates (Decisions C6).

### 5. Decline-overturn proposals

None.

### 6. Ceiling / subdivision marker

**FLAGGED for the per-verse refinement pass:** chapter now sits at the 8-tag hard ceiling (1 add executed; five candidates standing yielded — Decisions C5), and the book doc subdivides it (3:1–17 / 3:18–21 / 3:22–25). Refinement targets with ranges: `peace-of-god` (3:15 — pack already anchors it), `worship` (3:16), `parenting` (3:20–21 — pack already anchors it), `new-creation` (3:9–11), `covetousness` (3:5 — pack already anchors it).

---

## Colossians 4

### 1. Applied-tag deltas (vs book doc: 5 sitting tags; result: 5 tags — 0 adds, 5 keeps, 0 drops)

An honest below-cap chapter; no forced additions.

- **KEEP `prayer`** — "Continue steadfastly in prayer, watching in it with thanksgiving" (4:2); Epaphras "always striving for you in his prayers, that you may stand perfect and complete in all the will of God" (4:12).
- **KEEP `sharing-your-faith`** — "praying together for us also, that God may open to us a door for the word, to speak the mystery of Christ" (4:3); "that I may reveal it as I ought to speak" (4:4).
- **KEEP `stewardship-of-days`** — "Walk in wisdom toward those who are outside, redeeming the time" (4:5). Single-verse but the pack's own lexicon phrase verbatim ("redeeming the time"); no yield pressure (chapter below cap).
- **KEEP `bondservants-and-masters`** — the code's closing word to the other side: "Masters, give to your servants that which is just and equal, knowing that you also have a Master in heaven" (4:1). One verse, flagged thin at application; kept — it completes the 3:22–4:1 code across the chapter seam and the described-not-adjudicated framing stands.
- **KEEP `giving-an-answer`** — "Let your speech always be with grace, seasoned with salt, that you may know how you ought to answer each one" (4:6), addressed to conduct "toward those who are outside" (4:5). Pack anchors 4:6 at 0.85; outsider-directed register beside `sharing-your-faith` per the both-tags ruling (book-doc Decision 12).

### 2. Anchor-extension candidates

- `prayer` ← **Colossians 4:2**, weight 0.65 — "Continue steadfastly in prayer, watching in it with thanksgiving." The steadfast-continuance register; pack's Pauline anchors are Eph/Phil/1Th — no Colossians entry.

### 3. Lexicon candidates

- `giving-an-answer`: "speech seasoned with salt"; "how to answer unbelievers"; "gracious speech".
- `prayer`: "devote yourselves to prayer" (NIV-remembered form of 4:2).
- `guidance` and/or `sharing-your-faith` — the "open door" family (4:3 "that God may open to us a door for the word"): "God opens doors"; "when God opens a door"; "open door for the gospel". CURATOR NOTE: a real, common query family with no current lexicon home (checked across the 303-id vocabulary); per the check-lexicon-before-mint discipline this is an extension question, not a gap row — `sharing-your-faith` fits the 4:3 ministry register, `guidance` the general-providence register users usually intend; other witnesses at 1 Cor 16:9; 2 Cor 2:12; Rev 3:8. Decide one home, not two.

### 4. New-concept candidates

None — honest-and-empty. Checked and not proposed: Archippus's charge (4:17 "Take heed to the ministry which you have received in the Lord, that you fulfill it") — single-verse, served by `leadership`/`discipleship` registers at best, not a search-scale gap; Epaphras's "great zeal for you" (4:13) — intercessor's zeal for people, NOT the corpus-blocked `zeal-for-god` row-36 register (its vigilante-violence gist caution noted; nothing routed because nothing matches); letter-exchange instructions (4:16) — structure-trivia, the Philemon-block house-church precedent applied (`gathering-together` covers the 4:15 house-assembly substance without a tag being warranted here).

### 5. Decline-overturn proposals

None.

### 6. Ceiling / subdivision marker

**FLAGGED (subdivision only) for the per-verse refinement pass:** chapter is at 5 tags — below the soft cap, no ceiling event — but the book doc subdivides it (4:1–6 / 4:7–14 / 4:15–18), which is this pass's other flag condition. Refinement note: all tag substance sits in 4:1–6; 4:7–18 is greetings/logistics and honestly tag-empty.

---

## Decisions record — Colossians sweep (2026-08-26)

Every yield, drop, and judgment call this sweep made, each reversible on Jesse's word. Prior book-doc Decisions (1–12 there) all stand except where a sweep entry below explicitly acts.

- **C1. Ch 1: `hope-in-god` added (to 8 — the hard ceiling).** The book doc's Decision 6 declined it explicitly and only on the then-6-cap ("the six slots went to the chapter's main argument") while affirming presence ("Hope is genuinely present"). §11.6's soft-6/hard-8 post-dates that decision; presence re-verified on three spanning verses (1:5, 1:23, 1:27), pack's own torrey anchor at 1:5. Classified as a cap-ground re-admission, NOT a §3 decline-overturn (the §3 roster was checked; this decline is recorded in the book doc, on cap grounds). Reversible.
- **C2. Ch 1: `knowing-god` yielded at the ceiling (NOT applied).** Presence real ("that you may be filled with the knowledge of his will", 1:9; "increasing in the knowledge of God", 1:10) but it is the prayer-report's content inside the chapter's christological argument — theme-witness class against `hope-in-god`'s three-witness spread; with both candidates for one slot, `hope-in-god` wins on the §11.6 walk (main-theme spread vs two-verse prayer clause). Survival: anchor extension 1:9–10 proposed (ch 1 §2). Reversible; named refinement-pass candidate.
- **C3. Ch 1 considered and NOT added (register grounds):** `creation` — "For by him all things were created" (1:16) is the Creator's-identity register, whose display substance is carried by `supremacy-of-christ`/`deity-of-christ`; the pack already anchors 1:16 engine-side, so "creation" queries reach the chapter without a tag that would mispromise creation-account substance. `image-of-god` — "He is the image of the invisible God" (1:15) is Christ-as-image; the pack's lexicon is anthropological ("made in gods image, human dignity") and its own comment records 1:15 as the christological landing — anchored engine-side already, display tag would misroute; the renewed-image believer verse (3:10) is likewise already the pack's anchor. Each reversible.
- **C4. Ch 2: two candidates yielded at the standing ceiling (NOT applied); no sitting tag disturbed.** `spiritual-growth` (2:6–7 "rooted and built up in him") and `wisdom-from-god` (2:3 "all the treasures of wisdom and knowledge") both clear the presence bar narrowly but are thin (two verses / one verse) against eight sitting tags that each clear it strongly; §11.6 thin-single-verse class yields first and both newcomers sit in it. Survival: both proposed as anchor extensions (ch 2 §2). The 2026-08-25 application pass's recorded skips (`angels` 2:18 cross-ref class; `supremacy-of-christ` 2:10 thin, substance carried by `deity-of-christ` + the ch 1 tag) were re-checked and stand — no new evidence. Reversible.
- **C5. Ch 3: `thought-life` added to the single open slot; five standbys remain yielded.** The candidate pool for the eighth slot was six: the book doc Decision-5 standbys `peace-of-god` (3:15), `worship` (3:16), `parenting` (3:20–21), `new-creation` (3:9–11), plus `covetousness` (3:5) and the new-vocabulary `thought-life` (3:1–2). `thought-life` won on main-themes-first: 3:1–2 is the chapter's thesis command from which the whole argument runs, and the pack was designed with `Colossians 3:1-2` as an anchor (0.9). The five others remain off at the ceiling, each with engine-side coverage: `peace-of-god`, `parenting`, `covetousness` already anchor their verses in their packs; `worship` and `new-creation` get anchor-extension proposals (ch 3 §2). All five are named refinement-pass candidates with exact ranges (ch 3 §6). Reversible — any swap is well-defined.
- **C6. Ch 3: `election-and-predestination` checked and NOT tagged.** "as God’s chosen ones, holy and beloved" (3:12) is the address formula grounding the put-on charge, not election teaching; tagging would put doctrinal freight on a passing designation. The pack's §4-neutral gist ("routes, adjudicates nothing") is the binding precedent; this ledger follows it and adjudicates nothing. Reversible.
- **C7. Ch 2 routes executed:** `legalism` engine material → corpus-blocked roster row 43 (display tag stands, corpus routing recorded); `circumcision-of-the-heart` witness (2:11) → row 37. Ch 1/ch 3 route: `inheritance` witnesses (1:12; 3:24) → row 26. No corpus-blocked concept was duplicated as a candidate.
- **C8. Ch 4: no adds — honest below-cap chapter.** Considered set recorded in ch 4 §4 (Archippus 4:17, Epaphras's zeal 4:13, letter logistics 4:16); `thanksgiving` on 4:2 stays declined per book-doc Decision 7 (modifier inside the prayer command — no new evidence); `taming-the-tongue` for 4:6 (book-doc motif 8's "nearest home") resolved instead to the `giving-an-answer` lexicon candidate, since that pack already anchors 4:6 and owns the answering-outsiders register — routing "seasoned with salt" queries to the gossip-register pack would misroute. Reversible.
- **C9. Both-tags applications standing:** `false-teachers` + `legalism` (ch 2, from the application pass) and `sharing-your-faith` + `giving-an-answer` (ch 4, from Decision 12) re-verified as genuinely distinct registers; no change.
- **C10. No decline was overturned and no decline-overturn was proposed** — nothing in Colossians produced new textual evidence against any §3 recorded decline.
- **C11. Doctrinal posture:** household code (3:18–4:1) kept described-not-adjudicated per book-doc Decision 9; the Christ-hymn and fullness claims carried with the packs' signposted consensus wording; no prosperity framing anywhere (3:24's reward text quoted only inside its serve-the-Lord-Christ context); no theology scores.
- **C12. Id-validation note:** per the coordinator's mid-sweep caution about the briefing inventory's prefix-stripped `pastoral-*` ids — no pastoral id (stripped or otherwise) appears in this ledger; all ids used were validated verbatim against `engine-ids.txt` and `tag-apply/adopted-concepts.md`.

## Survival audit — Colossians ledger

Per CONVENTIONS §9 (applied to sweep ledgers): every write above was an atomic end-of-file append; after each append the file was re-read and verified — pre-existing bytes unchanged (header and all prior chapter blocks intact, byte-prefix checked) and the new block present. Final audit at this delivery: appends 1–6 (header; chs 1, 2, 3, 4; this Decisions+audit block) all present in order, no foreign edits observed, no other file under /mnt/project-files touched by this worker. Cross-audit of this worker's other deliverable at this same delivery: `sweep/philippians.md` re-checked — all seven of its appends (header, chs 1–4, Decisions+audit, id-validation note) still present and intact. Chapter-block count: 4/4; Decisions entries C1–C12; ledger complete.

---

## Erratum — fresh-critic pass (2026-08-26, atomic append per §9)

An independent fresh-critic verification of this ledger (quotes, ids, deltas, caps, presence bar, schema, neutrality — all clean) sustained the following objections. Corrections are made here by append only; no prior byte of this ledger is altered. Every cited source below was re-read by this erratum's author; every quote is byte-exact from the named file at repo SHA e762d1c.

**E1. Ch 1 §1, `deity-of-christ` keep — anchoring claim corrected; keep re-argued and STANDS.** The entry claims: "Pack anchors 1:15–20 material via its Colossians entries." That is false. `deity-of-christ.yaml`'s only Colossians anchor is `Colossians 2:9` ([editorial], 0.9; its comment: "For in him all the fullness of the Deity dwells bodily" (WEB wording — Colossians 2 NOT in web-subset). Not a portion but all the fullness, dwelling bodily.) — no ref in that pack touches 1:15–20. The packs that actually anchor Col 1:15–20 (each verified in its yaml): `supremacy-of-christ` — Colossians 1:15 ([editorial], 1.0), 1:16 (0.95), 1:17 (0.9), 1:18 (0.9); `image-of-god` — Colossians 1:15 ([torrey], 0.8); `creation` — Colossians 1:16 ([editorial], 0.8). Restated justification for the keep, on accurate grounds: the keep stands on the chapter's own text, not on any anchor claim — the entry's three quoted verses are themselves the deity substance (1:15 "the image of the invisible God"; 1:16 "All things have been created through him and for him"; 1:19 "all the fullness was pleased to dwell in him" — the same fullness register as the pack's lexicon entry "fullness of deity" and its Col 2:9 anchor). Presence is honest at chapter level on those three spanning verses; engine-side, deity queries reach Colossians through the pack's Col 2:9 anchor, and 1:15–20 is engine-reachable through the three packs named above. KEEP unchanged; the anchoring sentence is corrected as above. Reversible.

**E2. Ch 3 §2, `heavenly-reward` ← 3:24 — RECAST from plain candidate to REVERSAL PROPOSAL.** The entry claims 3:24 is "unclaimed by the packs that share this chapter (3:22 `bondservants-and-masters`, 3:23 `remembered-work-as-for-the-lord`/`pleasing-god-not-people`, 3:25 `favoritism` — per the bondservants pack's own claim comment)". That misreads the comment, which assigns 3:23–24 as a span AWAY, twice. `bondservants-and-masters.yaml` header comment (verbatim, comment line-wrap joined): "OTHER BOUNDARIES: Col 3:23-24 stay remembered-work-as-for-the-lord's / pleasing-god-not-people's and Col 3:25 favoritism's — the anchor below is Col 3:22 alone. 1 Tim 6:6-10 and 6:17 stay contentment's — verse-disjoint." And again on its Colossians anchor (verbatim): "Anchor is v22 alone — 3:23-24 stay remembered-work-as-for-the-lord's / pleasing-god-not-people's, 3:25 favoritism's (recorded above)." The true fact the entry reached for is preserved: no anchor REF covers 3:24 — `remembered-work-as-for-the-lord` anchors Colossians 3:23 alone ([editorial], 1.0) and `pleasing-god-not-people` anchors Colossians 3:23 alone ([editorial], 0.65); `bondservants-and-masters` anchors 3:22 alone (0.8), `favoritism` 3:25 (0.7). But the recorded boundary assigns the 3:23–24 span to those two packs, so a `heavenly-reward` anchor on 3:24 is not a free-verse claim — it crosses a boundary recorded in a merged pack file. RECAST: this is a REVERSAL PROPOSAL against the `bondservants-and-masters.yaml` recorded 3:23–24 boundary, deferred to the curator, who must either re-draw that boundary deliberately (in the pack file, with the comment updated in the same change) or decline the anchor. The 3:24 CURATOR NOTE (row-26 inheritance register — see E3) rides whichever way that decision goes. Reversible; nothing applied.

**E3. Ch 1 §4 (and the ch 3 §4 / C7 echoes) — no roster write occurred; routing notes live in THIS ledger.** Ch 1 §4 states "Col 1:12 recorded there as an additional NT witness" (and C7 records the same routing for 3:24). The live `engine-pack-backlog.md` row 26 contains no such entry; it reads, in full and verbatim: "| 26 | inheritance | G | SKIPPED-blocked | corpus-blocked: Joshua's dense text (chs 13-21), Num 26-36, Deut refs, Ps 105/111/119:111 all absent; in-corpus 1 Pet 1:4 / Eph 1:11-14 are the NT in-Christ register — a different design to decide at re-pin, recorded |". Corrected wording for every "recorded there" in this ledger's row-26 and row-37/row-43 routes: the routing note lives in THIS ledger only, flagged here for the respective row's curator to pick up at re-pin; no write to `engine-pack-backlog.md` (or any other file) occurred, per this sweep's no-other-files rule. The routes themselves stand as ledger-side flags.

**E4. C5 / ch 3 §6 — Decision-5 standby attribution corrected.** Both places attribute "`new-creation` (3:9–11)" to the book doc's Decision-5 standbys. The book doc's Decision 5 records (verbatim): "`peace-of-god` (3:15), `worship` (3:16), `parenting` (3:20–21), and `new-creation` (3:9–10) are all defensibly present". The Decision-5 standby range is 3:9–10. This ledger's own ch 3 §2 anchor proposal (`new-creation` ← Colossians 3:9-11) stands as this sweep's own choice — the 3:11 extension ("but Christ is all, and in all" closing the renewal sentence) is the sweep's judgment, distinguished from, not attributed to, the book-doc record.

**E5. Two note-level corrections.** (a) Ch 2 §2, `spiritual-growth`: "pack has EPH anchor only" is wrong — Eph 4:15 (0.9) is the pack's only PAULINE anchor, but the pack's top anchor is 1 Peter 2:2 ([editorial], 1.0; comment: "as newborn babies, long for the pure spiritual milk, that with it you may grow"). Read the entry as "pack's only Pauline anchor is EPH". (b) C6 presents the election pack's gist in quote marks as "routes, adjudicates nothing" — that is a compressed paraphrase, not a citation, and is hereby unquoted (read it as a gloss). The pack comment's actual wording, verbatim (comment line-wrap joined): "This pack ROUTES to what the texts say — foreknew, predestined, called, justified, glorified; chosen before the foundation of the world; election as ground for thanks — and adjudicates NOTHING between the historic readings of those words." C6's substance (checked, NOT tagged, nothing adjudicated) is unaffected.

**E6. Ch 3 §3, `thought-life` lexicon candidate — one row WITHDRAWN as redundant.** The candidate row "set your mind on things above" already sits verbatim in `thought-life.yaml`'s lexicon (`- set your mind on things above`) — the query already lands; the candidate is withdrawn. The entry's other two rows stand: "seek the things above" (tokens {seek, thing}) and "heavenly minded" ({heavenly, mind}) are token-distinct from every sitting row of the pack under the one tokenizer's stopword/stemming rules.

**Corrected totals — Colossians ledger (superseding any prior tally):** 2 adds (`hope-in-god` ch 1; `thought-life` ch 3) / 27 keeps (7 + 8 + 7 + 5) / 0 drops. Lexicon candidate phrasings: 31 (32 minus the E6 `thought-life` withdrawal). Anchor-extension candidates: 9 plain candidates plus 1 recast as a reversal proposal (`heavenly-reward` ← 3:24, deferred to the curator per E2).

*Erratum block appended 2026-08-26 by the fresh-critic pass; atomic single append; prior bytes verified unchanged post-write per §9.*
