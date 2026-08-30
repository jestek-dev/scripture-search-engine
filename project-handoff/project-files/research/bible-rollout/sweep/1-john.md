# 1 John — Layer-3 tag sweep ledger

**Book:** 1 John (5 chapters) · **Date:** 2026-08-26 · **Repo:** origin/main @ e762d1c629f5b121a2aacc6da57cca6bacc3215e · **Pass:** round 1 editor pass · **Text source:** pinned engwebp VPL (`engwebp_vpl-2026-08.zip`, sha256 `b6f55cc7…` verified against `pipeline/manifests/web.json` per sweep-kit web-access.md; book code 1JO). Every quote below is word-for-word from that file.

**Vocabulary:** the 239 engine concept ids (`ontology/concepts/*.yaml` basenames at e762d1c) plus the 161 adopted display-tag ids per the canonical `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (adopted ids used in this ledger — `confession-of-sin`, `false-teachers`, `eternal-life` — all verified present there, engine-built: no). Diff base: the applied tags in `/mnt/project-files/research/bible-rollout/1-john.md` (2026-08-25 state).

## 1 John 1

### Applied-tag deltas

Current tags (6): `walking-in-the-light`, `forgiveness-of-sins`, `self-deception`, `incarnation`, `confession-of-sin`, `resurrection`.

- KEEP `walking-in-the-light` — "But if we walk in the light as he is in the light, we have fellowship with one another" (1:7), under "God is light, and in him is no darkness at all." (1:5)
- KEEP `forgiveness-of-sins` — "If we confess our sins, he is faithful and righteous to forgive us the sins and to cleanse us from all unrighteousness." (1:9)
- KEEP `self-deception` — "If we say that we have no sin, we deceive ourselves, and the truth is not in us." (1:8)
- KEEP `incarnation` — "and the life was revealed, and we have seen, and testify" (1:2); "our hands touched, concerning the Word of life" (1:1)
- KEEP `confession-of-sin` (adopted display id) — "If we confess our sins" (1:9), against the denials of 1:8, 10
- KEEP `resurrection` — the apologetics-pass tag on the eyewitness opening: "the eternal life, which was with the Father, and was revealed to us" (1:2); the engine pack anchors 1 John 1:1-2. The book doc's scope caveat stands (referent is the whole incarnate life, not the appearances alone).
- ADD `presence-of-god` — the chapter's fellowship-with-God thread: "Yes, and our fellowship is with the Father and with his Son, Jesus Christ." (1:3); "If we say that we have fellowship with him and walk in the darkness, we lie and don’t tell the truth." (1:6). The engine pack itself anchors 1 John 1:3.
- Drops: none.

Result: 7 tags — above the soft cap 6, within the hard ceiling 8; every tag independently clears the presence bar.

### Anchor-extension candidates

- `incarnation` ← 1 John 1:1-2, proposed weight 0.7. Quote: "and the life was revealed, and we have seen, and testify, and declare to you the life, the eternal life, which was with the Father, and was revealed to us" (1:2). Affirmative statement, so the pack's sense-inversion bar does not apply (its header deliberately declines 1 John 4:2-3 because v3 is the negative half — that decline is honored, see 1 John 4 below). Pack is currently a tight three-anchor John-1 design; flagged for the curator rather than assumed.

### Lexicon candidates

- `forgiveness-of-sins` ← terms: "if we confess our sins"; "faithful and just to forgive" (remembered non-WEB phrasing; WEB reads "faithful and righteous"); "cleanse us from all unrighteousness". Queries a user would type: "if we confess our sins he is faithful and just", "1 John 1:9 meaning", "does God forgive me if I confess".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

- `witness-testimony` considered and NOT added: 1:2 "we have seen, and testify, and declare to you the life" is genuine testimony language, but the same three verses already carry `incarnation` and `resurrection`, and the apologetics register of 1:1-3 is carried by the `giving-an-answer` engine pack's existing 1 John 1:1-3 anchor. Declined as broad-duplicating-specific (third tag on one 3-verse span).
- `sin` considered and NOT added: the chapter's sin material (1:8-10) is fully served by the more specific `confession-of-sin` / `forgiveness-of-sins` / `self-deception`; `sin` is tagged where the chapter teaches it (ch 3).
- Soft-cap note: the `presence-of-god` add takes the chapter to 7 (> soft cap 6). Fellowship with God is a main thread of this chapter (1:3, 6, 7) and the engine pack anchors 1:3; recorded per §11.6 rather than silently held back.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## 1 John 2

### Applied-tag deltas

Current tags (8 — at the hard ceiling): `the-cross`, `obedience-to-the-word`, `loving-others`, `love-not-the-world`, `abiding-in-christ`, `walking-in-the-light`, `false-teachers`, `antichrist`.

- KEEP `the-cross` — "And he is the atoning sacrifice for our sins, and not for ours only, but also for the whole world." (2:2)
- KEEP `obedience-to-the-word` — "This is how we know that we know him: if we keep his commandments." (2:3)
- KEEP `loving-others` — "He who loves his brother remains in the light, and there is no occasion for stumbling in him." (2:10)
- KEEP `love-not-the-world` — "Don’t love the world or the things that are in the world." (2:15); "The world is passing away with its lusts" (2:17)
- KEEP `abiding-in-christ` — "remain in him, that when he appears, we may have boldness and not be ashamed before him at his coming." (2:28); "you will remain in him" (2:27)
- KEEP `walking-in-the-light` — "the darkness is passing away and the true light already shines." (2:8)
- KEEP `false-teachers` (adopted display id) — "They went out from us, but they didn’t belong to us" (2:19); "These things I have written to you concerning those who would lead you astray." (2:26)
- KEEP `antichrist` — "even now many antichrists have arisen" (2:18); "This is the Antichrist, he who denies the Father and the Son." (2:22)
- Adds: none possible — ceiling; see Decisions record. Drops: none.

### Anchor-extension candidates

- `abiding-in-christ` ← 1 John 2:24-28, proposed weight 0.85. Quote: "Therefore, as for you, let that remain in you which you heard from the beginning." (2:24) … "Now, little children, remain in him, that when he appears, we may have boldness and not be ashamed before him at his coming." (2:28). The pack currently anchors only John 15 (weights 1.0–0.8); "remain in me / remain in him" is its own lexicon register and 1 John is all in the fixture corpus. Secondary spans for the same candidate: 1 John 3:24 ("He who keeps his commandments remains in him, and he in him.", proposed 0.75) and 1 John 4:15-16 ("he who remains in love remains in God, and God remains in him.", 4:16, proposed 0.7) — one curator decision, not three separate rows.

### Lexicon candidates

- `love-not-the-world` ← terms: "lust of the flesh lust of the eyes pride of life"; "the pride of life"; "the world is passing away". Queries: "lust of the eyes meaning", "what is the pride of life in the Bible", "what does the world is passing away mean".

### New-concept candidates

- `the-anointing` — 1 John 2:20, 27: "You have an anointing from the Holy One, and you all have knowledge." (2:20); "the anointing which you received from him remains in you, and you don’t need for anyone to teach you." (2:27). Not covered by any of the 239 engine ids or the adopted list, and not among the §3 declines. Queries: "what is the anointing", "anointing of the Holy Spirit", "who teaches believers the anointing". CHECK-FIRST route: a lexicon extension of `holy-spirit` (which carries no "anointing" term today) before any mint; note the chapter itself never names the Spirit as the anointing (the identification is inferential), so a mint's gist must stay with the text's own wording.

### Decline-overturn proposals

none

### Decisions record

Ceiling discipline (§11.6) — candidates that cleared consideration but yielded to the 8-tag hard ceiling, none silently dropped:

- `knowing-god` yielded (theme-witness whose span is already tagged): the engine pack anchors 1 John 2:3-4 itself ("One who says, “I know him,” and doesn’t keep his commandments, is a liar", 2:4), but the sitting `obedience-to-the-word` tag's justification is that same 2:3-5 span; no sitting tag ranks below it under the yield order.
- `forgiveness-of-sins` yielded (thin single-verse): "your sins are forgiven you for his name’s sake." (2:12).
- `victory-in-christ` yielded (thin): "you have overcome the evil one." (2:13, 14).
- `second-coming` yielded (thin single-verse): "when he appears, we may have boldness and not be ashamed before him at his coming." (2:28).
- `eternal-life` (adopted) yielded (thin single-verse): "This is the promise which he promised us, the eternal life." (2:25).
- `end-times` (adopted) — "these are the end times" / "By this we know that it is the final hour." (2:18) — ROUTED to corpus-blocked roster row 5 (`end-times`, DEFERRED; merge-question with `day-of-the-lord` is Jesse's call). Not duplicated as a candidate here; 1 John 2:18 is noted against that row.
- `holy-spirit` for the anointing (2:20, 27) declined: the chapter never names the anointing as the Spirit — tagging would read the identification into the text; the material is carried as the `the-anointing` new-concept candidate above.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## 1 John 3

### Applied-tag deltas

Current tags (6): `gods-love`, `identity-in-christ`, `loving-others`, `holiness`, `sin`, `assurance-of-salvation`.

- KEEP `gods-love` — "See how great a love the Father has given to us, that we should be called children of God!" (3:1)
- KEEP `identity-in-christ` — "Beloved, now we are children of God." (3:2)
- KEEP `loving-others` — "this is the message which you heard from the beginning, that we should love one another" (3:11); "let’s not love in word only, or with the tongue only, but in deed and truth." (3:18)
- KEEP `holiness` — "Everyone who has this hope set on him purifies himself, even as he is pure." (3:3)
- KEEP `sin` — "Sin is lawlessness." (3:4); "He who sins is of the devil, for the devil has been sinning from the beginning." (3:8)
- KEEP `assurance-of-salvation` — "We know that we have passed out of death into life, because we love the brothers." (3:14); "God is greater than our heart, and knows all things." (3:20)
- ADD `adoption-as-gods-children` — "that we should be called children of God!" (3:1); "Beloved, now we are children of God." (3:2); "In this the children of God are revealed" (3:10). The engine pack's lexicon carries plain "children of god"; applied beside `gods-love` and `identity-in-christ` under the §11.2 both-tags ruling (each independently clears the bar — this chapter is the letter's children-of-God chapter).
- ADD `second-coming` — "we know that when he is revealed, we will be like him, for we will see him just as he is." (3:2), with the purifying hope of 3:3. The engine pack itself anchors 1 John 3:2-3 (weight 0.65). Flagged as this chapter's thinnest tag — first to drop if the ceiling must open.
- Drops: none.

Result: 8 tags — hard ceiling reached; yields recorded below.

### Anchor-extension candidates

- `adoption-as-gods-children` ← 1 John 3:1-2, proposed weight 0.9. Quote: "See how great a love the Father has given to us, that we should be called children of God!" (3:1). The pack has no Johannine anchor (Romans 8 / Galatians / Ephesians only); this is the theme's densest NT devotional text and 1 John is in the fixture corpus.
- `assurance-of-salvation` ← 1 John 3:19-21, proposed weight 0.75. Quote: "because if our heart condemns us, God is greater than our heart, and knows all things." (3:20). Secondary: 1 John 3:14 ("We know that we have passed out of death into life, because we love the brothers.", proposed 0.7).

### Lexicon candidates

- `assurance-of-salvation` ← terms: "when your heart condemns you"; "god is greater than our heart". Queries: "what does it mean when your heart condemns you", "God is greater than our heart meaning", "guilty conscience bible verse".
- `loving-others` ← term: "love in deed and truth". Queries: "love in action bible verse", "loving in deed and not in word".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

Ceiling discipline (§11.6) — the two adds filled the chapter to 8; remaining candidates yielded, none silently dropped:

- `satan` yielded (theme-witness-with-caveat): real presence — "He who sins is of the devil, for the devil has been sinning from the beginning. To this end the Son of God was revealed: that he might destroy the works of the devil." (3:8), "the children of the devil" (3:10), Cain "who was of the evil one" (3:12) — but the devil material frames the chapter's righteousness-and-love test rather than teaching about Satan himself, and its key sentence is already quoted in the sitting `sin` tag's justification. Yielded to the two adds, whose themes (children of God; the appearing hope) are the chapter's own headline and hinge. Reversible: if Jesse prefers, `satan` may displace `second-coming` (the marked thinnest tag).
- `new-birth` (adopted) yielded (thin single-verse): "Whoever is born of God doesn’t commit sin" (3:9). The born-of-God refrain is denser in ch 5 (see that chapter's Decisions record); also see §3.4's withheld `born-again` note (salvation.yaml owns the phrase).
- Ranking note for the two adds: `adoption-as-gods-children` is main-theme (3:1-2, 10 span the chapter's frame); `second-coming` rests on the engine pack's own 1 John 3:2-3 anchor — the curated source names this passage, which this ledger reports without adjudicating.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## 1 John 4

### Applied-tag deltas

Current tags (8 — at the hard ceiling): `gods-love`, `loving-others`, `incarnation`, `the-cross`, `victory-in-christ`, `fear-not`, `false-teachers`, `antichrist`.

- KEEP `gods-love` — "He who doesn’t love doesn’t know God, for God is love." (4:8); "In this is love, not that we loved God, but that he loved us" (4:10)
- KEEP `loving-others` — "Beloved, if God loved us in this way, we also ought to love one another." (4:11)
- KEEP `incarnation` — "every spirit who confesses that Jesus Christ has come in the flesh is of God" (4:2)
- KEEP `the-cross` — "sent his Son as the atoning sacrifice for our sins." (4:10)
- KEEP `victory-in-christ` — "greater is he who is in you than he who is in the world." (4:4)
- KEEP `fear-not` — "There is no fear in love; but perfect love casts out fear" (4:18)
- KEEP `false-teachers` (adopted display id) — "Beloved, don’t believe every spirit, but test the spirits, whether they are of God, because many false prophets have gone out into the world." (4:1)
- KEEP `antichrist` — "and this is the spirit of the Antichrist, of whom you have heard that it comes. Now it is in the world already." (4:3)
- Adds: none possible — ceiling; see Decisions record. Drops: none.

### Anchor-extension candidates

none new. Checked and NOT proposed: `incarnation` ← 1 John 4:2-3 — the pack header's sense-inversion sweep deliberately declines this span (v3 names the doctrine by denial); that recorded decline is honored, not re-litigated. The `abiding-in-christ` 4:15-16 span rides the single candidate recorded under 1 John 2.

### Lexicon candidates

none — `fear-not` already carries "perfect love casts out fear", `victory-in-christ` already carries "greater is he who is in you", and `false-prophets` already carries "test the spirits".

### New-concept candidates

none

### Decline-overturn proposals

none

### Decisions record

Ceiling discipline (§11.6) — candidates that cleared consideration but yielded, none silently dropped:

- `false-prophets` yielded (standing precedent upheld): the engine pack anchors 1 John 4:1 itself (weight 0.95), and the chapter's words are "many false prophets have gone out into the world" (4:1) — but the book doc's Decisions #12 already recorded this exact yield at the ceiling, with the substance carried by the sitting `false-teachers` and `antichrist` tags on the same verses. That call stands; still the first-ranked candidate should the ceiling ever open.
- `knowing-god` yielded (ceiling): the engine pack anchors 1 John 4:7-8 ("everyone who loves has been born of God and knows God.", 4:7); presence is genuine but the span is already carried by the sitting `gods-love` tag, and no sitting tag ranks below it under the yield order.
- `new-birth` (adopted) considered, not queued: "everyone who loves has been born of God" (4:7) — single-verse here; the refrain's home chapters are 3 and 5.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## 1 John 5

### Applied-tag deltas

Current tags (7): `assurance-of-salvation`, `faith`, `victory-in-christ`, `asking-in-gods-will`, `prayer`, `deity-of-christ`, `jesus-the-only-way`.

- KEEP `assurance-of-salvation` — "that you may know that you have eternal life" (5:13); the engine pack's keystone anchor is 1 John 5:11-13.
- KEEP `faith` — "This is the victory that has overcome the world: your faith." (5:4)
- KEEP `victory-in-christ` — "For whatever is born of God overcomes the world." (5:4); "Who is he who overcomes the world, but he who believes that Jesus is the Son of God?" (5:5)
- KEEP `asking-in-gods-will` — "that if we ask anything according to his will, he listens to us." (5:14)
- KEEP `prayer` — the intercession command: "he shall ask, and God will give him life for those who sin not leading to death." (5:16)
- KEEP `deity-of-christ` — "we are in him who is true, in his Son Jesus Christ. This is the true God and eternal life." (5:20). The book doc's signposted-reading caveat stands (consensus reading of a grammatically debated antecedent, resting also on 5:9-12); the engine pack anchors 1 John 5:20.
- KEEP `jesus-the-only-way` — "He who has the Son has the life. He who doesn’t have God’s Son doesn’t have the life." (5:12); pack anchors 1 John 5:11-12.
- ADD `eternal-life` (adopted display id) — the chapter's own purpose statement and refrain: "The testimony is this: that God gave to us eternal life, and this life is in his Son." (5:11); "that you may know that you have eternal life" (5:13); "This is the true God and eternal life." (5:20). Distinct query family ("what is eternal life") from the sitting assurance/only-way tags. Note: `eternal-life` is engine-built: no; its standalone-pack question is recorded in `salvation.yaml` per the backlog's re-open notes — display tag only, nothing prejudged.
- Drops: none.

Result: 8 tags — hard ceiling reached; yields recorded below.

### Anchor-extension candidates

- `witness-testimony` ← 1 John 5:9-11, proposed weight 0.7. Quote: "If we receive the witness of men, the witness of God is greater; for this is God’s testimony which he has testified concerning his Son." (5:9). REGISTER CAVEAT for the curator: the pack's five anchors are all John-the-Baptist / Jesus-self-witness texts; this span is God's own testimony concerning the Son — same witness-to-Jesus register, different witness. Flagged, not assumed.

### Lexicon candidates

none — `assurance-of-salvation` already carries "know that you have eternal life", `prayer` and `asking-in-gods-will` already carry the ask-according-to-his-will phrasings.

### New-concept candidates

none. The sin-leading-to-death material (5:16-17: "There is sin leading to death. I don’t say that he should make a request concerning this.") serves "unforgivable sin" queries and is ROUTED to corpus-blocked roster row 11 (`blasphemy-against-the-spirit`, SKIPPED-blocked; the pending fixture `unpardonable-sin` remains the measured-gap record). Not duplicated as a candidate; 1 John 5:16-17 is noted against that row as adjacent material for its eventual anxious-searcher design.

### Decline-overturn proposals

none

### Decisions record

Ceiling discipline (§11.6) — the `eternal-life` add filled the chapter to 8; remaining candidates yielded, none silently dropped:

- `new-birth` (adopted) yielded: the refrain is densest here — "Whoever believes that Jesus is the Christ has been born of God." (5:1); "For whatever is born of God overcomes the world." (5:4); "We know that whoever is born of God doesn’t sin" (5:18) — genuine presence, ranked second behind `eternal-life` (the chapter's stated purpose). Also carries §3.4's standing note: `born-again` was withheld because `salvation.yaml`'s lexicon owns "you must be born again" — a display tag here would still be legitimate under §11.1, but it lost the one open slot. First-ranked candidate if the ceiling opens.
- `witness-testimony` yielded (ceiling): 5:6-11 is a substantial testimony block ("For there are three who testify: the Spirit, the water, and the blood; and the three agree as one.", 5:7-8), but its content substance — eternal life located in the Son — is already routed by the sitting `assurance-of-salvation` and `jesus-the-only-way` tags on 5:11-12. Carried as the anchor-extension candidate above instead.
- `loving-god` yielded (thin): the engine pack anchors 1 John 5:3 itself ("For this is loving God, that we keep his commandments. His commandments are not grievous.") — genuine but a two-verse presence (5:2-3); yields as thin under §11.6 order.
- `idolatry` stays off (standing decision upheld, not a new yield): "Little children, keep yourselves from idols." (5:21) — the book doc's Decisions #10 presence-bar fail (one-verse closing charge the chapter never develops) stands; the engine pack keeps its 1 John 5:21 anchor regardless.
- `obedience-to-the-word` considered, not queued: "For this is loving God, that we keep his commandments." (5:3) — the keeping-commandments note here is inside the loving-God sentence; served in this letter by the ch 2 tag.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## Book totals

- **Applied-tag deltas:** 4 adds (`presence-of-god` ch 1; `adoption-as-gods-children` ch 3; `second-coming` ch 3; `eternal-life` ch 5), 35 keeps, 0 drops. Final tag counts: ch 1 = 7, ch 2 = 8, ch 3 = 8, ch 4 = 8, ch 5 = 8.
- **Anchor-extension candidates:** 4 — `incarnation` ← 1 John 1:1-2; `abiding-in-christ` ← 1 John 2:24-28 (secondary 3:24; 4:15-16, one decision); `adoption-as-gods-children` ← 1 John 3:1-2; `assurance-of-salvation` ← 1 John 3:19-21 (secondary 3:14); plus `witness-testimony` ← 1 John 5:9-11 with register caveat = 5 total.
- **Lexicon candidates:** 4 — `forgiveness-of-sins` (ch 1); `love-not-the-world` (ch 2); `assurance-of-salvation` (ch 3); `loving-others` (ch 3).
- **New-concept candidates:** 1 — `the-anointing` (1 John 2:20, 27; check-first `holy-spirit` lexicon route).
- **Decline-overturn proposals:** 0.
- **Routed items:** 2 — `end-times` material (1 John 2:18) → corpus-blocked roster row 5; sin-leading-to-death material (1 John 5:16-17) → corpus-blocked roster row 11 (`blasphemy-against-the-spirit` / pending fixture `unpardonable-sin`).
- **Ceiling-marked chapters (hard ceiling 8 hit):** 1 John 2, 3, 4, 5. Per-verse refinement: yes for all five chapters (ch 1 subdivided; chs 2–5 both).

## Round 2 — corrections (2026-08-26)

Critic round 1 returned 5 objections (1 blocking, 4 minor) on this file; 2-john.md, 3-john.md, and jude.md were approved with zero objections and are untouched. Per CONVENTIONS §9 this file is append-only: nothing above this heading has been rewritten; where an entry below conflicts with an earlier section, **this Round 2 section governs**. All five citations below were re-verified directly against the pack files at e762d1c before this append.

**C1 (BLOCKING) — 1 John 3 anchor-extension candidate `adoption-as-gods-children` ← 1 John 3:1-2 @ 0.9 is WITHDRAWN as written.** The candidate re-litigated a recorded pack boundary without disclosure: `adoption-as-gods-children.yaml`'s header (batch 6) records — verified verbatim — "1 John 3:1 (\"called children of God\") stays gods-love's — cross-noted, not claimed", and `gods-love.yaml` anchors 1 John 3:1 @ 0.75. That settled call is hereby surfaced and honored, not double-claimed. What remains, reframed as an explicit revisit-flag rather than a candidate: the cross-note names 3:1 only; if adoption-register queries ("children of god", the pack's own lexicon term) measurably miss 1 John 3 at curation time, the curator may revisit the recorded call on a **3:2-only** span — "Beloved, now we are children of God." (3:2) — as a deliberate reopening of that boundary, decided beside the gods-love anchor, never in addition to a 3:1 claim. Nothing is proposed for build now. Unchanged and restated for clarity: the chapter-3 **display tag** add of `adoption-as-gods-children` stands — tags are display-only (§11.7) and the pack's anchor-boundary note governs anchors, not tag presence; the tag sits beside `gods-love` under the §11.2 both-tags ruling, each clearing the bar on the chapter's own text.

**C2 (MINOR) — same row's parenthetical corrected.** The pack's anchors are Romans 8:15 (1.0), Galatians 3:26 (0.95), Ephesians 1:5 (0.9), Romans 8:23 (0.85), Galatians 4:4-7 (0.8), and Deuteronomy 14:1 (0.7) — not "(Romans 8 / Galatians / Ephesians only)". The "no Johannine anchor" observation stays true and stands.

**C3 (MINOR) — 1 John 1 anchor-extension wording corrected.** `incarnation` is not "a tight three-anchor John-1 design"; its three anchors are John 1:14 (1.0), John 1:1 (0.9), and Colossians 1:15-19 (0.8). The candidate itself (`incarnation` ← 1 John 1:1-2, proposed 0.7, sense-inversion note intact) stands with the description read as: a deliberately tight three-anchor design centered on John 1 plus Colossians 1 — flagged for the curator, not assumed.

**C4 (MINOR) — 1 John 1 lexicon candidate trimmed.** Check run and recorded: `forgiveness-of-sins.yaml` already carries "confess your sins" and "confession of sin" (batch-1 confession-of-sin extension) and already anchors 1 John 1:9 @ 0.9 — so the proposed term "if we confess our sins" adds no new coverage and is withdrawn. The candidate is trimmed to the genuinely new material only: terms "cleanse us from all unrighteousness" and the flagged non-WEB remembered phrasing "faithful and just to forgive" (WEB reads "faithful and righteous"). Queries unchanged: "if we confess our sins he is faithful and just", "1 John 1:9 meaning", "does God forgive me if I confess" — the first two now route on the remembered-phrasing term.

**C5 (MINOR) — Book totals headline corrected.** The anchor-extension bullet's headline count reads "4"; the correct headline is **5** as the bullet's own tail already states — and with C1's withdrawal the operative count is now **4**: `incarnation` ← 1 John 1:1-2; `abiding-in-christ` ← 1 John 2:24-28 (secondary 3:24; 4:15-16); `assurance-of-salvation` ← 1 John 3:19-21 (secondary 3:14); `witness-testimony` ← 1 John 5:9-11 (register caveat). The `adoption-as-gods-children` row is superseded by C1 (withdrawn; revisit-flag only).

**Everything else stands as written** — all applied-tag deltas (including the four adds), caps and yields, routing rows 5 and 11, the `the-anointing` new-concept candidate, and all quotes (critic-verified 83/83 byte-exact against the pinned VPL).

