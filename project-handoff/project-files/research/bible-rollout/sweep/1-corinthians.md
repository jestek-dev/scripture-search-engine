# 1 Corinthians — Layer-3 tag-sweep ledger

**Book:** 1 Corinthians (16 chapters, 437 verses) · **Sweep date:** 2026-08-26
**Repo:** `scripture-search-engine` @ `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (origin/main = HEAD; engine 0.14.0; 239 concept packs in `ontology/concepts/`)
**Legal tag vocabulary:** the 239 engine ids at e762d1c UNION the 161 adopted display-tag ids (CONVENTIONS §11.1) — 303 unique ids; every id below validated mechanically against `engine-ids.txt` / `adopted-161.txt`.
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/1-corinthians.md` (prior art — 70 tag instances across 16 chapters, critic loop complete, PR #43 uses ratified 2026-08-25); `concepts-inventory.md` + pack files read directly for every extension decision; `conventions-extract.md` (CONVENTIONS §3/§4/§5/§6/§9/§11 verbatim); `declines-and-contested.md` (tag-gaps-review.md §1 as resolved history + §3 declines + Jesse's 2026-08-25 postscript); `corpus-blocked.md` (50-row roster, all re-verified STILL GATED post-#53); plan §3/§5.2.
**WEB provenance:** pinned ebible.org engwebp VPL edition per `pipeline/manifests/web.json`, sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c` — archive fetched and checksum-verified against the manifest (exact match), unpacked in the sweep scratchpad. Every quotation in this ledger was taken word-for-word from that pinned VPL text (`1CO` lines), for **all 16 chapters** — a provenance improvement over the book doc, whose chapters 2–5, 8–9, 12, 14, 16 were current-edition-verified only. Typographic punctuation (curly apostrophes) preserved verbatim.
**Rules honored:** presence bar first (§5, §11.6); soft cap 6 / hard ceiling 8 with the §11.6 yield order; both-tags ruling (§11.2); no later-revelation read-backs; honest-and-empty preferred; no silent drops (every yield/judgment call in the Decisions record at the end); declines re-considerable only with new textual evidence, cited; corpus-blocked matches routed to the roster, not duplicated; doctrinally contested passages (chs 11, 12–14) described per the election-and-predestination pack's §4-neutral precedent — the ledger reports what sources name and adjudicates nothing.
**Scope:** research/display-layer only. Nothing here creates a concept pack, touches ENGINE_VERSION, fingerprints, weights, or the tokenizer; engine ingestion is fixtures-first gauntlet batches (plan §3.3). Anchor weights below are proposals on the packs' 0.0–1.0 scale.

Per-chapter sections follow, one atomic append each; Decisions record and survival audit at the end.

---
## 1 Corinthians 1 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `the-cross`, `harmony-with-others`, `wisdom-from-god`, `humble-exaltation`, `gods-faithfulness` (5 tags).

**1. Applied-tag deltas** (result: 6 tags — at the soft cap)

- KEEP `the-cross` — "For the word of the cross is foolishness to those who are dying, but to us who are being saved it is the power of God." (1:18); "we preach Christ crucified" (1:23). The chapter's central argument.
- KEEP `wisdom-from-god` — "Christ is the power of God and the wisdom of God" (1:24); "who was made to us wisdom from God" (1:30), set against the world's wisdom made foolish (1:20-21).
- KEEP `humble-exaltation` — "God chose the lowly things of the world, and the things that are despised" (1:28), "that no flesh should boast before God." (1:29); "He who boasts, let him boast in the Lord." (1:31).
- KEEP `gods-faithfulness` — "God is faithful, through whom you were called into the fellowship of his Son, Jesus Christ our Lord." (1:9); "who will also confirm you until the end, blameless" (1:8).
- ADD `unity-of-the-church` (adopted+engine id) — "that you all speak the same thing, and that there be no divisions among you, but that you be perfected together in the same mind and in the same judgment." (1:10), against the reported contentions and party slogans (1:11-12) and the counterquestion "Is Christ divided?" (1:13). Presence: the church-division problem is the chapter's occasion and first major theme, argued for four verses and answered by the whole cross argument. The pack itself already anchors 1 Corinthians 1:10 (weight 0.95) — the tag brings the display layer into line with the engine layer.
- ADD `gods-surprising-choice` (adopted display id; NOT yet an engine pack) — "God chose the foolish things of the world that he might put to shame those who are wise. God chose the weak things of the world that he might put to shame the things that are strong." (1:27); "God chose the lowly things of the world, and the things that are despised" (1:28), with the Corinthians' own calling as the proof — "not many are wise according to the flesh, not many mighty, and not many noble" (1:26). Presence: the concept's exact teaching substance, argued across 1:26-29. Applied alongside `humble-exaltation` under the both-tags ruling (§11.2) — the two registers (God's electing of the lowly / God exalting the humble and shaming boasting) genuinely both apply. Engine-side: ROUTED, not proposed — see routes below.
- DROP (proposed) `harmony-with-others` — yield class: broad-duplicating-specific. The justification's whole substance ("that there be no divisions among you", 1:10-12) is intra-assembly faction division, which is the register `unity-of-the-church` was designed to own: the pack's authoring comment records the boundary ("harmony-with-others owns the interpersonal-peace register... This pack is the church-body register") and claims 1 Cor 1:10 as its own anchor. Chapter 1 depicts no interpersonal-peace teaching distinct from the church-division theme. Not silent: Decisions record #1; reversible (the both-tags alternative — keep both at 7 tags — is recorded there).

**2. Anchor-extension candidates**

- `the-cross` — 1 Corinthians 1:18 — "For the word of the cross is foolishness to those who are dying, but to us who are being saved it is the power of God." — proposed weight 0.85. (Pack's only 1CO anchor today is 15:3; the word-of-the-cross text is its own much-searched register.)
- `wisdom-from-god` — 1 Corinthians 1:20-25 — "Hasn’t God made foolish the wisdom of this world?" (1:20); "because the foolishness of God is wiser than men, and the weakness of God is stronger than men." (1:25) — proposed weight 0.8. (Pack has no Pauline anchor at all; its lexicon is ask-for-wisdom shaped, so this is also a register widening — see lexicon candidates.)

**3. Lexicon candidates**

- `the-cross` — "the word of the cross"; "the foolishness of the cross"; "christ crucified".
- `wisdom-from-god` — "gods wisdom vs the worlds wisdom"; "the foolishness of god is wiser than men".
- `unity-of-the-church` — "is christ divided"; "church factions".

**4. New-concept candidates:** none — every honest theme has a home in the 303-id vocabulary.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** `gods-surprising-choice` engine work → roster row 21 (DEFERRED; the standing one-design ruling — decide with `god-looks-at-the-heart` + `humble-exaltation` together — binds, and the roster already records "1 Cor 1:26-29 verified IN CORPUS and UNCLAIMED — the design's natural NT keystone"). This sweep confirms the keystone reading from the pinned text and adds nothing to the roster; no `humble-exaltation` anchor extension on 1:26-29 is proposed here, precisely to avoid prejudging that three-row design (Decisions #2).

**6. Ceiling/subdivision:** 6 tags — at soft cap, under ceiling. Chapter subdivided in the book doc (3 sections) → flag for the per-verse refinement pass.

---
## 1 Corinthians 2 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `wisdom-from-god`, `the-cross` (2 tags).

**1. Applied-tag deltas** (result: 3 tags)

- KEEP `wisdom-from-god` — "But we speak God’s wisdom in a mystery, the wisdom that has been hidden, which God foreordained before the worlds for our glory" (2:7), revealed through the Spirit (2:10), closing "But we have Christ’s mind." (2:16).
- KEEP `the-cross` — "For I determined not to know anything among you except Jesus Christ and him crucified." (2:2); "For had they known it, they wouldn’t have crucified the Lord of glory." (2:8).
- ADD `holy-spirit` (adopted+engine id) — "But to us, God revealed them through the Spirit. For the Spirit searches all things, yes, the deep things of God." (2:10); "no one knows the things of God except God’s Spirit." (2:11); "we received not the spirit of the world, but the Spirit which is from God" (2:12); the natural man cannot receive "the things of God’s Spirit" because "they are spiritually discerned." (2:14). Presence: the Spirit's revealing and teaching work is the argued substance of the chapter's whole second half (2:10-16), not a passing mention. Register check done against the pack: `holy-spirit` is the general who-is/how-does-he-work family, and its comment routes comforter/counselor/helper queries elsewhere — 1 Cor 2 is revelation-by-the-Spirit, squarely inside the general family and nowhere near the John 14-16 comforter register.

**2. Anchor-extension candidates**

- `wisdom-from-god` — 1 Corinthians 2:6-10 — "we speak God’s wisdom in a mystery" (2:7); "Things which an eye didn’t see, and an ear didn’t hear, which didn’t enter into the heart of man, these God has prepared for those who love him." (2:9) — proposed weight 0.85. (Covers both the hidden-wisdom teaching and the much-searched 2:9 quotation; see lexicon note below.)
- `holy-spirit` — 1 Corinthians 2:10-14 — "But to us, God revealed them through the Spirit. For the Spirit searches all things, yes, the deep things of God." — proposed weight 0.7. (Pack currently has no Pauline anchor; sibling note: no span conflict — no other pack claims these verses.)

**3. Lexicon candidates**

- `wisdom-from-god` — "the mind of christ" (2:16); "eye has not seen ear has not heard" (2:9 — CAVEAT for the curator: popular usage reads 2:9 as a heaven text; its in-context home is God's prepared, Spirit-revealed wisdom, which is this pack. Routing the query here serves the verse people are actually quoting; the gist should describe, not correct, the popular use).

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 3 tags — well under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 3 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `spiritual-growth`, `christ-the-cornerstone`, `heavenly-reward`, `judgment-seat-of-christ`, `wisdom-from-god`, `envy-and-jealousy` (6 tags; `christ-the-cornerstone` is a PR #43 id, ratified 2026-08-25).

**1. Applied-tag deltas** (result: 7 tags — above soft cap, under ceiling; each independently clears the bar)

- KEEP `spiritual-growth` — "I fed you with milk, not with solid food, for you weren’t yet ready." (3:2), "as to babies in Christ" (3:1).
- KEEP `christ-the-cornerstone` — "For no one can lay any other foundation than that which has been laid, which is Jesus Christ." (3:11), with the master-builder charge (3:10).
- KEEP `heavenly-reward` — "each will receive his own reward according to his own labor." (3:8); "If any man’s work remains which he built on it, he will receive a reward." (3:14).
- KEEP `judgment-seat-of-christ` — "each man’s work will be revealed. For the Day will declare it, because it is revealed in fire; and the fire itself will test what sort of work each man’s work is." (3:13), loss suffered "but he himself will be saved, but as through fire." (3:15).
- KEEP `wisdom-from-god` — "For the wisdom of this world is foolishness with God." (3:19); "let him become a fool that he may become wise." (3:18).
- KEEP `envy-and-jealousy` — "For insofar as there is jealousy, strife, and factions among you, aren’t you fleshly" (3:3).
- ADD `the-house-of-god` (adopted+engine id) — "Don’t you know that you are God’s temple and that God’s Spirit lives in you?" (3:16); "for God’s temple is holy, which you are." (3:17), grounded in "You are God’s farming, God’s building." (3:9). Presence: the assembly-as-God's-dwelling is where the whole builders argument lands (3:9-17). Register check done against the pack: its NT landing anchor is Eph 2:21-22 (the church as "a habitation of God in the Spirit"), and 3:16-17 is that same corporate-dwelling register — NOT the individual body-as-temple sense (that is 6:19, which the pack's tokenizer note deliberately refuses to claim).

**2. Anchor-extension candidates**

- `the-house-of-god` — 1 Corinthians 3:16-17 — "Don’t you know that you are God’s temple and that God’s Spirit lives in you?" — proposed weight 0.75. (Corporate register per the pack's own Eph 2:21-22 comment; no span conflict — no pack claims 3:16-17 today.)
- `spiritual-growth` — 1 Corinthians 3:1-3 — "I fed you with milk, not with solid food, for you weren’t yet ready. Indeed, you aren’t ready even now" (3:2) — proposed weight 0.8. (Pack has only 2 anchors, none in 1CO; the milk/solid-food image is the query surface people bring.)
- `envy-and-jealousy` — 1 Corinthians 3:3 — "For insofar as there is jealousy, strife, and factions among you, aren’t you fleshly, and don’t you walk in the ways of men?" — proposed weight 0.6. (Pack's 1CO anchor today is 13:4 only.)

**3. Lexicon candidates**

- `spiritual-growth` — "milk vs solid food"; "babies in christ"; "signs of spiritual immaturity".
- `judgment-seat-of-christ` — "work tested by fire"; "gold silver and precious stones wood hay and straw".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 7 tags — one under the hard ceiling; flag for the per-verse refinement pass on density grounds (not subdivided in the book doc, but the chapter carries three distinct movements: milk/planting 3:1-9, foundation/fire 3:10-15, temple/boasting 3:16-23).

---
## 1 Corinthians 4 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `pleasing-god-not-people`, `suffering-for-christ`, `grace-not-earned` (3 tags).

**1. Applied-tag deltas** (result: 3 tags — no changes)

- KEEP `pleasing-god-not-people` — "But with me it is a very small thing that I should be judged by you, or by a human court." (4:3); "he who judges me is the Lord." (4:4); "Then each man will get his praise from God." (4:5).
- KEEP `suffering-for-christ` — the apostles "like men sentenced to death" (4:9): "we hunger, thirst, are naked, are beaten, and have no certain dwelling place." (4:11); "We are fools for Christ’s sake" (4:10); "Being persecuted, we endure." (4:12).
- KEEP `grace-not-earned` — "And what do you have that you didn’t receive? But if you did receive it, why do you boast as if you had not received it?" (4:7).
- No adds. Considered and not added (each below the presence bar; see Decisions #5): `leadership`/`servanthood` (4:1-2 regards the apostles as servants/stewards but the chapter teaches how to regard them, not leadership practice); `judging-others` (4:3-5 is evaluation-of-ministers, a different register from the speck-in-your-eye pack; noted as a lexicon-check lead only); `kingdom-of-heaven` (4:20 is one verse in passing).

**2. Anchor-extension candidates**

- `pleasing-god-not-people` — 1 Corinthians 4:3-5 — "But with me it is a very small thing that I should be judged by you, or by a human court. Yes, I don’t even judge my own self." — proposed weight 0.7. (Pack anchors GAL/COL/1TH today; this is its strongest 1CO text.)
- `grace-not-earned` — 1 Corinthians 4:7 — "For who makes you different? And what do you have that you didn’t receive?" — proposed weight 0.7. (The everything-is-received text under the boasting theme; no span conflict.)

**3. Lexicon candidates**

- `grace-not-earned` — "what do you have that you did not receive"; "everything is a gift from god".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** the stewardship language of 4:1-2 — "stewards of God’s mysteries" / "it is required of stewards that they be found faithful" (4:1-2; exact WEB: "Here, moreover, it is required of stewards that they be found faithful.") — matches roster row 16 (`stewardship`, DEFERRED, corpus-blocked on the two defining parables). Routed as an additional in-1CO witness note for that row's re-pin curator (the entrusted-with-a-trust register, here God's mysteries rather than money); NOT proposed as a separate candidate here.

**6. Ceiling/subdivision:** 3 tags — under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 5 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `holiness`, `sin`, `the-cross`, `church-discipline` (4 tags).

**1. Applied-tag deltas** (result: 4 tags — no changes)

- KEEP `church-discipline` — the assembly's commanded act: "you are to deliver such a one to Satan for the destruction of the flesh, that the spirit may be saved in the day of the Lord Jesus." (5:5); the association rules (5:9-11) and the closing charge "Put away the wicked man from among yourselves." (5:13). The pack already anchors 5:9-13.
- KEEP `holiness` — "Purge out the old yeast, that you may be a new lump, even as you are unleavened." (5:7); keeping the feast "with the unleavened bread of sincerity and truth." (5:8).
- KEEP `sin` — "It is actually reported that there is sexual immorality among you" (5:1), tolerated and boasted over: "You are arrogant, and didn’t mourn instead" (5:2); "Don’t you know that a little yeast leavens the whole lump?" (5:6).
- KEEP `the-cross` — "For indeed Christ, our Passover, has been sacrificed in our place." (5:7).
- No adds. Considered and not added: `passover` — 5:7-8 deploys Passover typology to ground the purge command; the chapter does not teach the feast itself, so the display presence bar fails, but the engine-side anchor is real (see extensions; Decisions #6). `judging-others` — 5:12 ("Don’t you judge those who are within?") is inside-vs-outside jurisdiction, not the pack's speck-and-log register.

**2. Anchor-extension candidates**

- `passover` — 1 Corinthians 5:7-8 — "For indeed Christ, our Passover, has been sacrificed in our place. Therefore let’s keep the feast" — proposed weight 0.8. (The NT christological Passover text; pack has no NT anchor per its inventory row. Sibling note: `the-cross` does not anchor 5:7 today, so no span conflict.)
- `holiness` — 1 Corinthians 5:6-8 — "Don’t you know that a little yeast leavens the whole lump? Purge out the old yeast, that you may be a new lump" — proposed weight 0.6. (The community-purity register; carries the much-quoted leaven proverb.)

**3. Lexicon candidates**

- `passover` — "christ our passover"; "jesus our passover lamb".
- `holiness` — "a little yeast leavens the whole lump"; "a little leaven leavens the whole lump" (NIV/ESV-remembered form; the WEB reads "yeast").
- `church-discipline` — "handed over to satan"; "the man sleeping with his fathers wife".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 4 tags — under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 6 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `pastoral-sexual-purity`, `identity-in-christ`, `harmony-with-others`, `forgiveness-of-sins`, `living-for-gods-glory` (5 tags).

**1. Applied-tag deltas** (result: 5 tags — no changes)

- KEEP `pastoral-sexual-purity` — "Flee sexual immorality!" (6:18); "he who commits sexual immorality sins against his own body." (6:18); "your body is a temple of the Holy Spirit who is in you" (6:19).
- KEEP `identity-in-christ` — "Don’t you know that your bodies are members of Christ?" (6:15); "You are not your own, for you were bought with a price." (6:19-20).
- KEEP `harmony-with-others` — brother against brother at law: "Why not rather be wronged? Why not rather be defrauded?" (6:7); "brother goes to law with brother, and that before unbelievers!" (6:6). (Unlike ch. 1, this IS interpersonal-dispute material — settle grievances, absorb wrong — so the tag stands here on its own register; see Decisions #1.)
- KEEP `forgiveness-of-sins` — "Some of you were such, but you were washed. You were sanctified. You were justified in the name of the Lord Jesus, and in the Spirit of our God." (6:11).
- KEEP `living-for-gods-glory` — "Therefore glorify God in your body and in your spirit, which are God’s." (6:20).
- No adds. Considered and not added: `drunkenness` (6:9-10 lists "nor drunkards" in the vice list — a passing mention; the pack already anchors 6:9-10 for the inherit-the-Kingdom warning, which is the right engine-side treatment); `resurrection` on 6:14 (the book doc's Decisions #17 decline stands — one grounding verse; ch. 15 is the home); `surrender-to-god` (its pack already anchors 6:19-20; the display substance is carried by `identity-in-christ` + `living-for-gods-glory` — broad-duplicating-specific).

**2. Anchor-extension candidates**

- `identity-in-christ` — 1 Corinthians 6:19-20 — "You are not your own, for you were bought with a price." — proposed weight 0.75. (SPAN SIBLING: `surrender-to-god` anchors 6:19-20 and `pastoral-sexual-purity` anchors 6:18-20 today — a third register on the same span; the bought-with-a-price ownership claim is the identity register. Recorded so the curator weighs three-on-one-span deliberately.)
- `forgiveness-of-sins` — 1 Corinthians 6:11 — "Some of you were such, but you were washed. You were sanctified. You were justified in the name of the Lord Jesus, and in the Spirit of our God." — proposed weight 0.7. (The washed/sanctified/justified past tense over named former lives; pack anchors ROM/EPH today.)

**3. Lexicon candidates**

- `pastoral-sexual-purity` — "your body is a temple"; "honor god with your body".
- `identity-in-christ` — "bought with a price"; "you are not your own".

**4. New-concept candidates**

- `lawsuits-among-believers` (6:1-8) — the question this passage exists to answer, with no honest home in the 303-id vocabulary: `harmony-with-others` covers peaceable relations broadly but nothing serves the can-Christians-sue question itself. Query phrasings: "can christians sue each other"; "lawsuits between believers"; "taking a brother to court". WEB evidence: "Dare any of you, having a matter against his neighbor, go to law before the unrighteous, and not before the saints?" (6:1); "But brother goes to law with brother, and that before unbelievers!" (6:6). Dedupe check done: not among the 239 engine ids, not among the 161 adopted, not in the corpus-blocked roster, not in the recorded declines. CHECK-FIRST instruction (per the sweep's extension-before-mint discipline): run a lexicon-extension check on `harmony-with-others` (which anchors no 1CO text today) before minting; if fixtures show "can christians sue" queries served by an extension + 6:1-8 anchor, no id is due.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 5 tags — under cap. Chapter subdivided in the book doc (3 sections) → flag for the per-verse refinement pass.

---
## 1 Corinthians 7 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `godly-marriage`, `pastoral-marriage-divorce-teaching`, `self-control`, `contentment`, `singleness` (5 tags).

**1. Applied-tag deltas** (result: 5 tags — no changes)

- KEEP `godly-marriage` — "Let the husband give his wife the affection owed her, and likewise also the wife her husband." (7:3); mutual bodily belonging (7:4), abstinence only "by consent for a season" (7:5). The pack anchors 7:3.
- KEEP `pastoral-marriage-divorce-teaching` — "But to the married I command—not I, but the Lord—that the wife not leave her husband" (7:10) "and that the husband not leave his wife." (7:11); the mixed-marriage cases (7:12-16): "Yet if the unbeliever departs, let there be separation." (7:15). The pack anchors 7:10-16.
- KEEP `self-control` — "But if they don’t have self-control, let them marry. For it’s better to marry than to burn with passion." (7:9); "that Satan doesn’t tempt you because of your lack of self-control." (7:5).
- KEEP `contentment` — "Let each man stay in that calling in which he was called." (7:20); "Brothers, let each man, in whatever condition he was called, stay in that condition with God." (7:24).
- KEEP `singleness` — "each man has his own gift from God" (7:7); "He who is unmarried is concerned for the things of the Lord, how he may please the Lord" (7:32); "that you may attend to the Lord without distraction." (7:35). The pack anchors four spans in this chapter (7:7-9, 25-28, 32-35, 39-40).
- No adds. Considered and not added: `bondservants-and-masters` — 7:21-23 is real counsel to enslaved believers, but within this chapter it serves as one of two illustrations (with circumcision, 7:18-19) of the stay-as-called principle that `contentment` carries; illustration is below the display presence bar. Engine-side anchor is honest — see extensions (Decisions #7). `fasting` (7:5 is one clause in passing).

**2. Anchor-extension candidates**

- `bondservants-and-masters` — 1 Corinthians 7:21-23 — "Were you called being a bondservant? Don’t let that bother you, but if you get an opportunity to become free, use it." (7:21); "You were bought with a price. Don’t become bondservants of men." (7:23) — proposed weight 0.6. (Pack anchors EPH/COL/1TI/TIT/PHM today; this is the one text with the if-you-can-gain-freedom counsel.)

**3. Lexicon candidates**

- `singleness` — "better to marry than to burn"; "is it good to stay single".
- `pastoral-marriage-divorce-teaching` — "married to an unbeliever"; "my husband is not a believer"; "should i stay with an unbelieving spouse".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter. (Checked: `unequally-yoked`, roster row 47, is the 2 Cor 6:14-18 register — the mixed-marriage material here is already served by `pastoral-marriage-divorce-teaching`'s 7:10-16 anchor and stays off that row, matching the row's own register caveats.)

**6. Ceiling/subdivision:** 5 tags — under cap. Chapter subdivided in the book doc (3 sections) → flag for the per-verse refinement pass.

---
## 1 Corinthians 8 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `disputable-matters`, `loving-others` (2 tags).

**1. Applied-tag deltas** (result: 4 tags)

- KEEP `disputable-matters` — "But food will not commend us to God. For neither, if we don’t eat are we the worse, nor if we eat are we the better." (8:8); "be careful that by no means does this liberty of yours become a stumbling block to the weak." (8:9).
- KEEP `loving-others` — "Knowledge puffs up, but love builds up." (8:1); "if food causes my brother to stumble, I will eat no meat forever more, that I don’t cause my brother to stumble." (8:13).
- ADD `conscience` (engine id) — "But some, with consciousness of an idol until now, eat as of a thing sacrificed to an idol, and their conscience, being weak, is defiled." (8:7); a weak brother's conscience "emboldened" toward what is for him sin (8:10); "wounding their conscience when it is weak, you sin against Christ." (8:12). Presence: the weak conscience is the pivot on which the whole chapter's argument turns (8:7-13) — argued teaching, not mention. Supporting record, NOT an overturn: tag-gaps-review §3.4 already records that the staging withheld the 1 Cor weak-conscience refs (8:7-12; 10:25-29) as a reversible call and that "the Romans `conscience` row has since landed and is the natural home if the curator wants the 1 Corinthians weak-conscience refs." The pack has since been extended for exactly the acting-against-conscience register (Rom 14:22-23, batch 6); this tag and the extension below take the invitation.
- ADD `no-other-god` (adopted+engine id) — "we know that no idol is anything in the world, and that there is no other God but one." (8:4); "yet to us there is one God, the Father, of whom are all things, and we for him; and one Lord, Jesus Christ, through whom are all things, and we live through him." (8:6). Presence: 8:4-6 is a full monotheistic confession argued against the many so-called gods (8:5) — the concept's own substance. This aligns with the book doc's own Decisions #16 reasoning, which declined `deity-of-christ` here because "the teaching substance is monotheism against idolatry" — that substance is precisely this pack's register.
- Considered and not added: `idolatry` — the chapter is ABOUT idol-food but teaches liberty, love, and monotheism rather than the practice or danger of idol worship (that teaching is ch. 10's "flee from idolatry"); topic-adjacency fails the presence bar here (Decisions #8).

**2. Anchor-extension candidates**

- `conscience` — 1 Corinthians 8:7-12 — "their conscience, being weak, is defiled" (8:7); "wounding their conscience when it is weak, you sin against Christ." (8:12) — proposed weight 0.75. (The §3.4 record names this the natural home; 10:25-29 is the same register's second witness — see ch. 10 notes. No span conflict: no pack claims 8:7-12 today.)
- `no-other-god` — 1 Corinthians 8:4-6 — "there is no other God but one" — proposed weight 0.8. (Pack has 11 anchors, none Pauline; this is the NT's crispest one-God-one-Lord confession.)
- `loving-others` — 1 Corinthians 8:1 — "Knowledge puffs up, but love builds up." — proposed weight 0.6. (Much-quoted; pack's 1CO anchors today are ch. 13 only.)

**3. Lexicon candidates**

- `loving-others` — "knowledge puffs up but love builds up".
- `conscience` — "weak conscience"; "violating my conscience"; "wounding a weak conscience".
- `disputable-matters` — "food sacrificed to idols"; "christian liberty"; "stumbling block to the weak".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none. (The `conscience` items above work WITH the §3.4 record's own stated disposition, not against it.)

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 4 tags — under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 9 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `sharing-your-faith`, `self-control`, `heavenly-reward`, `supporting-gospel-workers` (4 tags).

**1. Applied-tag deltas** (result: 4 tags — no changes)

- KEEP `sharing-your-faith` — "for necessity is laid on me; but woe is to me if I don’t preach the Good News." (9:16); "I have become all things to all men, that I may by all means save some." (9:22).
- KEEP `self-control` — "Every man who strives in the games exercises self-control in all things." (9:25); "but I beat my body and bring it into submission, lest by any means, after I have preached to others, I myself should be disqualified." (9:27).
- KEEP `heavenly-reward` — "Now they do it to receive a corruptible crown, but we an incorruptible." (9:25); "Run like that, so that you may win." (9:24).
- KEEP `supporting-gospel-workers` — the stacked argument (soldier, vineyard, flock, the unmuzzled ox, the temple's priests, 9:7-13) landing on "Even so the Lord ordained that those who proclaim the Good News should live from the Good News." (9:14) — a right Paul then surrenders (9:12, 15-18). The pack anchors 9:11-14.
- No adds. Considered and not added: `freedom-in-christ` (9:1, 19 use freedom language rhetorically; the concept's freedom-from-law substance is Galatians', not taught here); `discipleship` (imitation/mission material is carried by `sharing-your-faith` here).

**2. Anchor-extension candidates**

- `sharing-your-faith` — 1 Corinthians 9:19-23 — "I have become all things to all men, that I may by all means save some." (9:22) — proposed weight 0.85. (The adaptable-witness text; pack's only anchors today are elsewhere — 2CO per inventory.)
- `self-control` — 1 Corinthians 9:24-27 — "Every man who strives in the games exercises self-control in all things." — proposed weight 0.8. (Pack has just 3 anchors, ROM/2TI; the athlete text is its strongest 1CO witness.)
- `heavenly-reward` — 1 Corinthians 9:24-25 — "they do it to receive a corruptible crown, but we an incorruptible" — proposed weight 0.7. (Pack anchors EPH only today; the incorruptible-crown text is a native crown/reward query surface.)

**3. Lexicon candidates**

- `sharing-your-faith` — "all things to all men"; "become all things to all people".
- `self-control` — "discipline my body"; "beat my body and bring it into submission". (COLLISION CHECK for the curator: "run the race" phrasings are `remembered-looking-to-jesus` territory (Heb 12); the entries proposed here deliberately avoid the bare running phrase.)
- `supporting-gospel-workers` — "should pastors be paid"; "live from the gospel"; "do not muzzle the ox".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter. (Checked row 16 `stewardship`: 9:17's "I have a stewardship entrusted to me" is one clause inside the preaching-rights argument — noted here only; not routed as a witness, unlike 4:1-2.)

**6. Ceiling/subdivision:** 4 tags — under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 10 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `remembered-a-way-of-escape`, `lords-supper`, `divine-judgment`, `disputable-matters`, `gods-faithfulness`, `living-for-gods-glory`, `temptation` (7 tags).

**1. Applied-tag deltas** (result: 8 tags — HITS THE HARD CEILING; each independently clears the bar)

- KEEP `remembered-a-way-of-escape` — the concept's home text: "No temptation has taken you except what is common to man. God is faithful, who will not allow you to be tempted above what you are able, but will with the temptation also make the way of escape, that you may be able to endure it." (10:13). Pack anchors 10:13.
- KEEP `temptation` — the plain-query home for the same doctrine, applied both-tags per the 2026-08-25 pass (10:12-13): "Therefore let him who thinks he stands be careful that he doesn’t fall." (10:12).
- KEEP `gods-faithfulness` — "God is faithful, who will not allow you to be tempted above what you are able" (10:13).
- KEEP `divine-judgment` — the wilderness generation: "However with most of them, God was not well pleased, for they were overthrown in the wilderness." (10:5); "in one day twenty-three thousand fell" (10:8); "perished by the serpents" (10:9), "perished by the destroyer" (10:10); "written for our admonition" (10:11).
- KEEP `lords-supper` — "The cup of blessing which we bless, isn’t it a sharing of the blood of Christ? The bread which we break, isn’t it a sharing of the body of Christ?" (10:16); "You can’t both partake of the table of the Lord and of the table of demons." (10:21). Pack anchors 10:16.
- KEEP `disputable-matters` — "“All things are lawful for me,” but not all things are profitable." (10:23); eat what is sold "asking no question for the sake of conscience" (10:25), but abstain for the other's conscience (10:28-29).
- KEEP `living-for-gods-glory` — "Whether therefore you eat or drink, or whatever you do, do all to the glory of God." (10:31).
- ADD `idolatry` (engine id) — "Therefore, my beloved, flee from idolatry." (10:14); "Don’t be idolaters, as some of them were." (10:7); the doctrine behind the command: "the things which the Gentiles sacrifice, they sacrifice to demons and not to God, and I don’t desire that you would have fellowship with demons." (10:20); "You can’t both drink the cup of the Lord and the cup of demons." (10:21). Presence: the flee-idolatry command and the demons-behind-idols teaching are a main argued theme (10:7, 14-22) — this was the chapter's one glaring omission in prior art. Eighth tag admitted at the ceiling because it is a main theme, not a marginal one; yield analysis in Decisions #9.

**2. Anchor-extension candidates**

- `idolatry` — 1 Corinthians 10:14-22 — "Therefore, my beloved, flee from idolatry." — proposed weight 0.8. (Pack has 11 anchors, none Pauline; the NT's direct flee-command. SPAN SIBLING: `lords-supper` anchors 10:16 inside this span for the sharing-in-Christ register — recorded so the curator weighs the overlap; the claims are different registers of different verses' substance.)
- `temptation` — 1 Corinthians 10:13 — "No temptation has taken you except what is common to man." — proposed weight 0.9. (THREE-WAY SPAN SIBLING, recorded: `remembered-a-way-of-escape` (10:13, its home text) and `pastoral-freedom-from-bondage` (10:13) both anchor this verse today. The `temptation` pack's own lexicon is where-does-temptation-come-from shaped and carries no 10:13 phrasing, so the common-to-man register is currently reachable only via the remembered-* pack; the curator should decide this extension together with those two packs' claims — one verse, three registers, decide deliberately.)

**3. Lexicon candidates**

- `remembered-a-way-of-escape` — "god wont give you more than you can handle" (the NIV-remembered folk form of 10:13 — the pack carries "tempted beyond what you can bear" but not this, and it is likely the highest-volume phrasing of the verse).
- `idolatry` — "flee from idolatry"; "modern day idolatry".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 8 tags — HARD CEILING HIT (with the `idolatry` add). Chapter also subdivided in the book doc (3 sections). → Strong flag for the per-verse refinement pass: the chapter carries at least three verse-rangeable units (10:1-13 wilderness warnings + way of escape; 10:14-22 idolatry and the two tables; 10:23-33 conscience-liberty and God's glory) where dropped-at-chapter-level candidates (e.g. `conscience` on 10:25-29 — see ch. 8's §3.4-invited extension, second witness here) survive as engine anchors.

---
## 1 Corinthians 11 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `lords-supper`, `gathering-together`, `worship`, `the-lords-discipline`, `covenant`, `head-coverings` (6 tags).

**1. Applied-tag deltas** (result: 6 tags — no changes; at the soft cap)

- KEEP `lords-supper` — the received institution: "“Take, eat. This is my body, which is broken for you. Do this in memory of me.”" (11:24); "“This cup is the new covenant in my blood. Do this, as often as you drink, in memory of me.”" (11:25); "you proclaim the Lord’s death until he comes." (11:26); "But let a man examine himself" (11:28). Pack anchors 11:23-26 and 11:28.
- KEEP `gathering-together` — "when you come together in the assembly" (11:18); "when you come together to eat, wait for one another." (11:33).
- KEEP `worship` — regulated worship practice: "Every man praying or prophesying" (11:4), every woman "praying or prophesying" (11:5), and the assembly's supper (11:20-22).
- KEEP `the-lords-discipline` — "But when we are judged, we are disciplined by the Lord, that we may not be condemned with the world." (11:32); "For this cause many among you are weak and sickly, and not a few sleep." (11:30).
- KEEP `covenant` — "“This cup is the new covenant in my blood.”" (11:25).
- KEEP `head-coverings` — the one passage the question has: covering instructions for praying and prophesying argued from headship — "the head of every man is Christ, and the head of the woman is man, and the head of Christ is God." (11:3) — balanced by "neither is the woman independent of the man, nor the man independent of the woman, in the Lord." (11:11). Pack anchors 11:2-16 whole (its design: routes to all of it, rules on none of it). Doctrinal posture honored: describe and route, never adjudicate — gender roles are a DOCTRINAL-BASIS §4 non-criterion, per the pack's own gist-care note.
- Considered and not added: `men-and-women-in-the-church` — the head-coverings pack's authoring comment records the decided two-row design: this row is the narrow one-passage 1 Cor 11 lookup; `men-and-women-in-the-church` is the 1 Tim 2:8-15 row, corpus-blocked (roster row 41), whose re-pin curator "may still fold this row in." Adding it here would pre-empt that recorded design. Routed — see below. `drunkenness` — "One is hungry, and another is drunken." (11:21) is a reported symptom, not teaching on the practice; below the bar.

**2. Anchor-extension candidates**

- `the-lords-discipline` — 1 Corinthians 11:30-32 — "But when we are judged, we are disciplined by the Lord, that we may not be condemned with the world." — proposed weight 0.8. (Pack has only 2 anchors, none Pauline; this is the NT's most explicit discipline-of-believers-now text outside Hebrews 12.)
- `covenant` — 1 Corinthians 11:25 — "This cup is the new covenant in my blood." — proposed weight 0.6. (Pack's Pauline anchor today is GAL only; the cup-word is a native "new covenant" query surface. SPAN SIBLING: inside `lords-supper`'s 11:23-26 anchor — different register (covenant theology vs. the meal's practice), recorded for the curator.)

**3. Lexicon candidates**

- `lords-supper` — "taking communion unworthily"; "examine yourself before communion"; "why do we take communion".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** the 11:2-16 men-and-women material beyond the covering question → roster row 41 (`men-and-women-in-the-church`, SKIPPED-blocked; 1 Tim 2:8-15 absent from corpus; two-row design vs `head-coverings` already DECIDED and recorded in the head-coverings pack). This sweep adds one observation for that row's re-pin curator: 1 Cor 11:3-12 (headship + mutual dependence) is in the fixture corpus (1CO 11 witnessed) and would be the row's only in-corpus witness if the fold question reopens.

**6. Ceiling/subdivision:** 6 tags — at the soft cap. Chapter subdivided in the book doc (2 sections) → flag for the per-verse refinement pass (11:2-16 / 11:17-34 are cleanly separable anchor ranges).

---
## 1 Corinthians 12 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `spiritual-gifts`, `harmony-with-others`, `baptism`, `speaking-in-tongues` (4 tags; `baptism` is a PR #43 id, ratified 2026-08-25).

**1. Applied-tag deltas** (result: 5 tags)

- KEEP `spiritual-gifts` — "Now there are various kinds of gifts, but the same Spirit." (12:4); "But to each one is given the manifestation of the Spirit for the profit of all." (12:7); the Spirit "distributing to each one separately as he desires." (12:11); the ranked list (12:28) and "But earnestly desire the best gifts." (12:31).
- KEEP `harmony-with-others` — "that there should be no division in the body, but that the members should have the same care for one another." (12:25); "When one member suffers, all the members suffer with it." (12:26). Kept on its own mutual-care register alongside the unity add below, per the both-tags ruling (Decisions #10).
- KEEP `baptism` — "For in one Spirit we were all baptized into one body, whether Jews or Greeks, whether bond or free" (12:13).
- KEEP `speaking-in-tongues` — the gift's place among the Spirit's distributions: "to another different kinds of languages, and to another the interpretation of languages." (12:10); "Do all speak with various languages? Do all interpret?" (12:30). Descriptive per the doctrinal posture — continuation/cessation is a DOCTRINAL-BASIS non-criterion.
- ADD `unity-of-the-church` (adopted+engine id) — "For as the body is one and has many members, and all the members of the body, being many, are one body; so also is Christ." (12:12); "Now you are the body of Christ, and members individually." (12:27); "that there should be no division in the body" (12:25). Presence: the one-body-many-members argument (12:12-27) is the chapter's governing picture and the pack's own lexicon register ("one body in christ"). Applied alongside `harmony-with-others` per §11.2 — the church-body register and the mutual-care register both genuinely present.

**2. Anchor-extension candidates**

- `spiritual-gifts` — 1 Corinthians 12:4-11 — "Now there are various kinds of gifts, but the same Spirit." — proposed weight 0.95. (A real pack gap: its 1CO anchors today are 13:1 and 14:1-5 — the letter's actual gift-list chapter is unanchored. This is the passage "list of spiritual gifts" queries want.)
- `unity-of-the-church` — 1 Corinthians 12:12-27 — "For as the body is one and has many members, and all the members of the body, being many, are one body; so also is Christ." — proposed weight 0.85. (Pack anchors 1:10 in this book; the body metaphor is its highest-volume register.)
- `baptism` — 1 Corinthians 12:13 — "For in one Spirit we were all baptized into one body" — proposed weight 0.7. (Pack anchors ROM/GAL today; the Spirit-baptism-into-one-body text. Sits inside the unity span above — different register, recorded.)

**3. Lexicon candidates**

- `spiritual-gifts` — "list of spiritual gifts"; "what are the gifts of the holy spirit".
- `baptism` — "baptized into one body" (pack has only 2 lexicon entries today).

**4. New-concept candidates:** none. (For the eventual `speaking-in-tongues` engine pack — an adopted display-only id, NOT corpus-blocked — this sweep records a G4 fact for its curator: `spiritual-gifts` already carries "speaking in tongues", "gift of tongues", and "praying in tongues" as lexicon entries, so any future mint must resolve that ownership or land as a lexicon/anchor extension instead; see Decisions #11.)

**5. Decline-overturn proposals:** none. (The book doc's Decisions #5 decline of `trinity` on 12:4-6 was re-checked against the pinned text and stands — the triadic pattern is a supporting text; the chapter's teaching substance is gifts and the body.)

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 5 tags — under soft cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 13 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `loving-others`, `spiritual-gifts` (2 tags).

**1. Applied-tag deltas** (result: 2 tags — no changes; honest-and-lean preferred over padding)

- KEEP `loving-others` — the love chapter itself: "Love is patient and is kind. Love doesn’t envy. Love doesn’t brag, is not proud" (13:4); "bears all things, believes all things, hopes all things, and endures all things." (13:7); "The greatest of these is love." (13:13). Pack anchors 13:4-8 and 13:13.
- KEEP `spiritual-gifts` — "If I speak with the languages of men and of angels, but don’t have love, I have become sounding brass or a clanging cymbal." (13:1); the gifts weighed and found nothing without love (13:1-3), partial and passing (13:8-10). Pack anchors 13:1.
- No adds. Re-checked and standing: the 2026-08-25 pass's SKIP of `speaking-in-tongues` here (13:1, 8 deploy the gift as the love argument's rhetorical foil; the chapter teaches love, not the gift — presence bar fails). Also considered and not added: `hope-in-god` (13:7, 13 name hope inside love's portrait — not the concept's taught substance); `envy-and-jealousy` (13:4 "Love doesn’t envy." — one clause; the pack rightly anchors the verse (13:4) without the chapter needing the tag).

**2. Anchor-extension candidates:** none — the chapter's texts are already well anchored (`loving-others` 13:4-8, 13:13; `spiritual-gifts` 13:1; `envy-and-jealousy` 13:4).

**3. Lexicon candidates**

- `loving-others` — "the love chapter"; "love never fails" (13:8 — pack carries "love is patient love is kind" and "greatest of these is love" but not this, and it is a native query form).
- `hope-in-god` — "we see in a mirror dimly"; "through a glass darkly" (KJV-remembered form of 13:12). PARTIAL-FIT CAVEAT, carried from the book doc's motif list: no concept honestly owns 13:12's now-in-part/then-face-to-face register; `hope-in-god` is the nearest home. If the curator judges the fit dishonest, the right disposition is a no-home note, not a forced entry.

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 2 tags — well under cap. Not subdivided in the book doc; no refinement flag.

---
## 1 Corinthians 14 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `spiritual-gifts`, `worship`, `gathering-together`, `loving-others`, `speaking-in-tongues` (5 tags).

**1. Applied-tag deltas** (result: 5 tags — no changes)

- KEEP `spiritual-gifts` — "Follow after love and earnestly desire spiritual gifts, but especially that you may prophesy." (14:1); "since you are zealous for spiritual gifts, seek that you may abound to the building up of the assembly." (14:12); the working rules (14:26-33, 39-40).
- KEEP `worship` — gathered worship ordered for understanding: "I will sing with the spirit, and I will sing with the understanding also." (14:15); the visitor who "will fall down on his face and worship God, declaring that God is among you indeed." (14:25); "Let all things be done decently and in order." (14:40).
- KEEP `gathering-together` — "When you come together, each one of you has a psalm, has a teaching, has a revelation, has another language, or has an interpretation. Let all things be done to build each other up." (14:26).
- KEEP `loving-others` — "Follow after love" (14:1), with every gift bent toward edifying others: "he who prophesies edifies the assembly." (14:4).
- KEEP `speaking-in-tongues` — the chapter's full regulation of the gift: "He who speaks in another language edifies himself" (14:4); "let there be two, or at the most three, and in turn; and let one interpret." (14:27); "But if there is no interpreter, let him keep silent in the assembly" (14:28); "don’t forbid speaking with other languages." (14:39). Descriptive throughout (WEB's "other languages"); continuation/cessation adjudicated nowhere, per the §4-neutral precedent.
- Considered and not added: `men-and-women-in-the-church` for 14:34-35 (wives quiet in the assemblies) — same disposition as ch. 11: the adopted id's engine row is 1 Tim 2 and corpus-blocked (roster row 41), the recorded two-row design routes 1 Cor material narrowly, and two verses inside the ordering-of-speech argument sit below the chapter presence bar. Routed below. `unity-of-the-church` — order in the assembly is not the divisions register; no.

**2. Anchor-extension candidates**

- `worship` — 1 Corinthians 14:40 — "Let all things be done decently and in order." — proposed weight 0.6. (Pack has no Pauline anchor; the ordered-worship register and a native query phrase — see lexicon.)
- `gathering-together` — 1 Corinthians 14:26 — "When you come together, each one of you has a psalm, has a teaching, has a revelation, has another language, or has an interpretation. Let all things be done to build each other up." — proposed weight 0.7. (Pack's Pauline anchor today is 1TH; this is the NT's concretest picture of what a gathering does.)

**3. Lexicon candidates**

- `worship` — "decently and in order"; "order in church services".

**4. New-concept candidates**

- `gift-of-prophecy` (14:1-5, 24-25, 29-32) — the chapter argues at length for a gift the vocabulary names only inside `spiritual-gifts`: "he who prophesies speaks to men for their edification, exhortation, and consolation." (14:3); "he is greater who prophesies than he who speaks with other languages" (14:5); "For you all can prophesy one by one, that all may learn and all may be exhorted." (14:31). Query phrasings: "gift of prophecy"; "what is prophesying in church"; "prophecy vs tongues". Dedupe check done: not among the 239 engine ids or 161 adopted (nearest: `false-prophets` = the counterfeit register; `messianic-prophecy` = OT-prediction register; `dreams-and-visions` = revelation-medium register — none serves the congregational-gift question); not in the corpus-blocked roster; not in the recorded declines (1 Thess's testing-prophecies near-covered note, §3.5, is the discernment side, a different register). CHECK-FIRST instruction: run a lexicon-extension check on `spiritual-gifts` ("gift of prophecy" entry + a 1 Cor 14 anchor it already has) before minting — the tongues precedent (tongues queries live inside `spiritual-gifts`' lexicon) suggests extension, not mint, is the likely honest outcome. GIST CARE if ever minted: describe the gift as the text does; continuation/cessation is a DOCTRINAL-BASIS non-criterion.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** 14:34-35 (wives quiet in the assemblies) → roster row 41 (`men-and-women-in-the-church`, SKIPPED-blocked) as a second 1 Corinthians witness note for that row's re-pin curator (with the same describe-don't-adjudicate care the head-coverings pack records; the book doc's signpost — evangelicals differ on scope given 11:5 — carries over).

**6. Ceiling/subdivision:** 5 tags — under soft cap. Chapter subdivided in the book doc (2 sections) → flag for the per-verse refinement pass (14:1-25 argument / 14:26-40 ordering rules are separable anchor ranges).

---
## 1 Corinthians 15 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `resurrection`, `salvation`, `the-cross`, `victory-in-christ`, `caught-up-together`, `second-coming`, `mortality`, `resurrection-of-the-dead` (8 tags — already AT the hard ceiling; the 2026-08-25 apologetics pass put it there deliberately, both-tags boundary recorded in the book doc's Decisions #20).

**1. Applied-tag deltas** (result: 8 tags — no changes; ceiling holds)

- KEEP `resurrection` — "that he was raised on the third day according to the Scriptures" (15:4); the eyewitness roll: "he appeared to Cephas, then to the twelve." (15:5), "to over five hundred brothers at once" (15:6); "But now Christ has been raised from the dead." (15:20).
- KEEP `resurrection-of-the-dead` — the general-resurrection body, both-tags beside `resurrection` per the recorded two-id boundary: "So also is the resurrection of the dead. The body is sown perishable; it is raised imperishable." (15:42); "It is sown a natural body; it is raised a spiritual body." (15:44); "He became the first fruit of those who are asleep." (15:20).
- KEEP `salvation` — "the Good News which I preached to you... by which also you are saved" — exact WEB: "Now I declare to you, brothers, the Good News which I preached to you, which also you received, in which you also stand" (15:1), "by which also you are saved, if you hold firmly the word which I preached to you" (15:2).
- KEEP `the-cross` — "that Christ died for our sins according to the Scriptures" (15:3). Pack anchors 15:3.
- KEEP `victory-in-christ` — "“Death is swallowed up in victory.”" (15:54); "But thanks be to God, who gives us the victory through our Lord Jesus Christ." (15:57). Pack anchors 15:57.
- KEEP `caught-up-together` — "We will not all sleep, but we will all be changed" (15:51), "in a moment, in the twinkling of an eye, at the last trumpet." (15:52). Pack anchors 15:51-52.
- KEEP `second-coming` — "But each in his own order: Christ the first fruits, then those who are Christ’s at his coming." (15:23); "Then the end comes" (15:24).
- KEEP `mortality` — "For as in Adam all die, so also in Christ all will be made alive." (15:22); "The last enemy that will be abolished is death." (15:26). Pack anchors 15:21-22 and 15:26.
- No adds — the chapter is at the ceiling and no candidate outranks a standing tag (candidates checked and left off, each also engine-covered: `pastoral-grief-and-loss` (pack anchors 15:54-57 already; the chapter argues doctrine, not the grieving register), `giving-an-answer` (pack anchors 15:3-8 already — apologetics service is engine-side), `friendship` (15:33 one-verse proverb; pack anchors it), `grace-not-earned` (15:10 is testimony, not teaching substance), `kingdom-of-heaven` (15:24, 50 in passing)).

**2. Anchor-extension candidates**

- `salvation` — 1 Corinthians 15:1-4 — "by which also you are saved, if you hold firmly the word which I preached to you" (15:2) — proposed weight 0.8. (The gospel defined-and-delivered text; pack's Pauline anchors today are ROM/EPH/TIT. SPAN SIBLING: `the-cross` anchors 15:3, `resurrection` 15:4 — three registers across one four-verse span, recorded.)
- `victory-in-christ` — 1 Corinthians 15:54-57 (extend the existing 15:57 anchor to the span) — "“Death, where is your sting? Hades, where is your victory?”" (15:55) — proposed weight 0.9. (The sting-of-death taunt is the register's most-quoted surface and currently outside the anchor.)
- `second-coming` — 1 Corinthians 15:23 — "Christ the first fruits, then those who are Christ’s at his coming." — proposed weight 0.6. (Pack anchors 1TH/TIT today; the resurrection-order-fixed-to-his-coming text.)
- `mormon-evangelism` — 1 Corinthians 15:29 — "Or else what will they do who are baptized for the dead? If the dead aren’t raised at all, why then are they baptized for the dead?" — proposed weight 0.5. (The one verse "baptism for the dead" queries — a live LDS-dialogue question — can land on; pack anchors GAL/EPH/TIT today, none for this topic. GIST CARE: the engine reports that the verse is the locus of the question and says which source names it; it adjudicates neither the verse's meaning nor the practice — covenant #6.)
- `surrender-to-god` — 1 Corinthians 15:31 — "I affirm, by the boasting in you which I have in Christ Jesus our Lord, I die daily." — proposed weight 0.5. (The die-daily phrase is a native surrender-register query; pack's 1CO anchor today is 6:19-20.)

**3. Lexicon candidates**

- `victory-in-christ` — "death where is your sting"; "o death where is your sting" (KJV-remembered form); "death is swallowed up in victory".
- `resurrection-of-the-dead` — "the last adam" (15:45 — "The last Adam became a life-giving spirit."); "what will our resurrection bodies be like".
- `mormon-evangelism` — "baptism for the dead"; "baptized for the dead".
- `surrender-to-god` — "i die daily".

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** none for this chapter.

**6. Ceiling/subdivision:** 8 tags — AT THE HARD CEILING (standing since 2026-08-25), and subdivided in the book doc into 5 sections. → Strongest refinement-pass flag in the book: the five BSB units (15:1-11 / 12-19 / 20-34 / 35-49 / 50-58) are natural verse-range anchor units, and the chapter's tags map almost one-to-one onto them.

---
## 1 Corinthians 16 — swept 2026-08-26 (pinned WEB verified)

Prior art (book doc): `generosity`, `benediction` (2 tags; `benediction` is a PR #43 id, ratified 2026-08-25).

**1. Applied-tag deltas** (result: 2 tags — no changes; honest-and-lean)

- KEEP `generosity` — the collection for the saints: "On the first day of every week, let each one of you save as he may prosper, that no collections are made when I come." (16:2); "your gracious gift to Jerusalem" — exact WEB: "I will send whoever you approve with letters to carry your gracious gift to Jerusalem." (16:3).
- KEEP `benediction` — the letter's closing blessing in Paul's own hand: "This greeting is by me, Paul, with my own hand." (16:21); "The grace of the Lord Jesus Christ be with you." (16:23); "My love to all of you in Christ Jesus. Amen." (16:24).
- No adds. Considered and not added (Decisions #13): `courage` (16:13 "Watch! Stand firm in the faith! Be courageous! Be strong!" — thin single-verse, the §11.6 yield class; routed engine-side, see below); `hospitality` (16:6, 11 send-me-on-my-journey notes — travel logistics, not hospitality teaching); `servanthood` (16:15-16 commends the house of Stephanas, "they have set themselves to serve the saints" — commendation, not servanthood teaching); `work-and-diligence` (16:10, 16 mention the Lord's work in passing).

**2. Anchor-extension candidates**

- `generosity` — 1 Corinthians 16:1-3 — "On the first day of every week, let each one of you save as he may prosper" — proposed weight 0.7. (Pack's Pauline anchor today is 2CO; the weekly proportionate-setting-aside pattern is distinct giving teaching.)

**3. Lexicon candidates:** none proposed — the chapter's honest query surfaces are already served.

**4. New-concept candidates:** none.

**5. Decline-overturn proposals:** none.

**Routes to corpus-blocked roster:** 16:13 → roster row 17 (`courage`, DEFERRED — the row's whole case is corpus-blocked, and it records that in-corpus courage texts are `fear-not`'s divine-comfort register, "precisely NOT this gap"). New observation for that row's re-pin curator: 1 Cor 16:13 "Watch! Stand firm in the faith! Be courageous! Be strong!" is imperative HUMAN courage — the row's own register — though 1CO 16 is not in today's fixture corpus either (1CO witness chapters are 1, 6, 7, 10, 11, 13, 15), so it too waits on PR-β. Routed, not duplicated.

**6. Ceiling/subdivision:** 2 tags — well under cap. Chapter subdivided in the book doc (3 sections) → flag for the per-verse refinement pass.

---
# Decisions record — 1 Corinthians sweep, 2026-08-26

Every yield, drop, decline, and judgment call made in this sweep. Each is a delegated default, reversible on Jesse's word. Numbered entries are the ones the chapter sections cite.

1. **DROP proposed: `harmony-with-others` on ch. 1** (yield class: broad-duplicating-specific). The tag's whole justification (1:10-12, "that there be no divisions among you") is intra-assembly faction division — the register the `unity-of-the-church` pack's authoring comment explicitly assigns to itself ("harmony-with-others owns the interpersonal-peace register... This pack is the church-body register"), claiming 1 Cor 1:10 as its own anchor. Chapter 1 depicts no interpersonal-peace teaching distinct from that. Replaced by the `unity-of-the-church` add. NOT silent; reversible — the both-tags alternative (keep both, ch. 1 at 7 tags) is legitimate under §11.2 if Jesse prefers it. Contrast: `harmony-with-others` KEPT on ch. 6 (lawsuits between brothers — genuinely interpersonal-dispute material) and on ch. 12 (mutual care of members, see #10).
2. **`gods-surprising-choice` applied as a display tag on ch. 1; NO engine-side proposal, and NO `humble-exaltation` anchor extension on 1:26-29.** The adopted id is legal display vocabulary (§11.1) and 1:26-29 is its exact substance. Engine-side, roster row 21 already holds this find (1 Cor 1:26-29 "the design's natural NT keystone") under the standing one-design ruling (decide `gods-surprising-choice` + `god-looks-at-the-heart` + `humble-exaltation` together); proposing any of the three packs' anchors on these verses now would prejudge that design. Routed, not duplicated.
3. **ADD `holy-spirit` on ch. 2.** The Spirit's revealing work is the argued substance of 2:10-16. Register verified against the pack: general who-is/how-he-works family — not the comforter register its comment routes away.
4. **ADD `the-house-of-god` on ch. 3 (corporate register only); `building-on-the-rock` display considered and NOT added.** 3:16-17 is the assembly-as-God's-dwelling register (the pack's own Eph 2:21-22 NT landing), not the individual body-as-temple sense its tokenizer note refuses (that sense is 6:19, untouched). `building-on-the-rock` already anchors 3:10-15 engine-side, but at display level the foundation material is carried by `christ-the-cornerstone` + `judgment-seat-of-christ`; a third tag on the same verses is broad-duplicating-specific. Reversible.
5. **Ch. 4 considered-and-not-added set:** `leadership`/`servanthood` (4:1-2 teaches how to REGARD ministers, not leadership practice); `judging-others` (4:3-5 is evaluation-of-ministers, a different register from the speck-and-log pack — left as a lexicon-check lead only, no candidate logged); `kingdom-of-heaven` (4:20, one verse). Stewardship language of 4:1-2 routed to roster row 16 as a witness note.
6. **Ch. 5: `passover` display considered and NOT added; anchor extension proposed instead.** 5:7-8 deploys Passover typology to ground the purge command — engine anchor honest ("Christ, our Passover"), chapter presence bar not met for the feast concept itself. `judging-others` on 5:12 declined (inside-vs-outside jurisdiction, not the pack's register).
7. **Ch. 7: `bondservants-and-masters` display considered and NOT added; anchor extension proposed instead.** 7:21-23 is real counsel to enslaved believers but functions in-chapter as one of two illustrations (with circumcision) of the stay-as-called principle carried by `contentment`. Reversible — if Jesse reads 7:21-23 as freestanding teaching, the tag clears.
8. **Ch. 8 delta set.** ADD `conscience` (weak-conscience teaching is the chapter's pivot, 8:7-13; works WITH the tag-gaps-review §3.4 record, which names the Romans-landed `conscience` row "the natural home" for these refs — an invitation taken, not a decline overturned). ADD `no-other-god` (8:4-6 full monotheistic confession; consonant with the book doc's own Decisions #16 reasoning that the substance here is "monotheism against idolatry"). `idolatry` NOT added on ch. 8 — topic-adjacent; the flee-idolatry teaching lives in ch. 10.
9. **Ch. 10: ADD `idolatry`, taking the chapter to the 8-tag hard ceiling.** A main argued theme (10:7, 14-22: the flee command + the demons-behind-idols doctrine) missing from prior art. Yield analysis run per §11.6 before admitting the eighth tag: no standing tag is cross-ref-class, theme-witness-with-caveat, or broad-duplicating-specific; the thinnest (`living-for-gods-glory`, one verse, 10:31) was flagged as thin at its own 2026-08-25 application but is the unit's closing rule and was applied under Jesse's adopted-vocabulary ruling — it stands. Ceiling reached with every tag independently clearing the bar; chapter flagged hard for per-verse refinement.
10. **Ch. 12: `harmony-with-others` KEPT alongside the `unity-of-the-church` ADD** (both-tags ruling §11.2). Distinct registers both genuinely present: mutual care of members (12:25-26) vs. the one-body-in-Christ church register (12:12-27).
11. **`speaking-in-tongues` G4 fact recorded for the eventual engine pack** (adopted display-only id, not corpus-blocked): `spiritual-gifts` already carries "speaking in tongues", "gift of tongues", "praying in tongues" in its lexicon. Any future mint must resolve that ownership or land as an extension. Display tags on chs. 12 and 14 unaffected.
12. **`men-and-women-in-the-church` NOT added on chs. 11 or 14.** The head-coverings pack's authoring comment records the decided two-row design (1 Cor 11 = the narrow `head-coverings` lookup; the men-and-women row = 1 Tim 2:8-15, corpus-blocked roster row 41, fold reversible at re-pin). Both chapters' material routed to row 41 as witness notes (11:3-12 in-corpus; 14:34-35). Describe-don't-adjudicate posture maintained throughout — gender roles and continuation of gifts are DOCTRINAL-BASIS non-criteria.
13. **Ch. 16 considered-and-not-added set:** `courage` (16:13, thin single-verse — the §11.6 yield class; routed to roster row 17 with a new register observation), `hospitality` (travel logistics), `servanthood` (commendation, not teaching), `work-and-diligence` (passing mentions). Honest-and-lean at 2 tags.
14. **Ch. 15: no changes at the standing 8-tag ceiling.** Candidates checked and left off (`pastoral-grief-and-loss`, `giving-an-answer`, `friendship`, `grace-not-earned`, `kingdom-of-heaven`) — each either engine-anchored already or below the bar; none outranks a standing tag. The prior `resurrection` / `resurrection-of-the-dead` two-id boundary (book doc Decisions #20) re-verified against the pinned text and left intact.
15. **Ch. 6 considered-and-not-added set:** `drunkenness` (6:9-10 vice-list mention; pack's engine anchor on 6:9-10 is the right treatment), `resurrection` on 6:14 (book doc Decisions #17 stands), `surrender-to-god` (pack anchors 6:19-20; display substance carried by `identity-in-christ` + `living-for-gods-glory`). New-concept candidate `lawsuits-among-believers` logged with a check-`harmony-with-others`-extension-first instruction.
16. **Ch. 13 skips re-checked and standing:** `speaking-in-tongues` skip (13:1, 8 rhetorical foil — the 2026-08-25 pass's own call), `hope-in-god` and `envy-and-jealousy` below the bar. The 13:12 mirror-dimly queries carry a PARTIAL-FIT caveat on the `hope-in-god` lexicon candidate — a no-home note is the honest fallback.
17. **Erratum (this ledger, ch. 11 section):** the `covenant` keep-line renders its quote as "This cup is the new covenant in my blood." followed by a ledger-supplied closing curly quotation mark; in the pinned WEB, 11:25's quoted sentence continues "Do this, as often as you drink, in memory of me." The words quoted are verbatim; the closing mark placement is the ledger's, not WEB's. Recorded here per §9 rather than rewriting the appended block.
18. **Provenance delta vs. prior art:** every quote in this ledger was verified against the pinned engwebp VPL (sha256-verified) for ALL 16 chapters — including chs. 2-5, 8-9, 12, 14, 16, which the book doc could verify only against the then-current upstream edition. No divergence from any book-doc quotation was found in the verses re-checked.
19. **`election-and-predestination` considered and NOT added on ch. 1.** 1:26-29's choosing language is the surprising-choice register (see #2), and 1:2, 9, 24 "called" language is address, not election teaching substance. The pack's §4-neutral gist and its flagged Rom 9 boundary are untouched.

## Sweep totals

- Chapters swept: 16/16. Tag instances: 70 prior → 77 proposed (8 adds, 69 keeps, 1 proposed drop).
- Adds: `unity-of-the-church` (chs. 1, 12), `gods-surprising-choice` (ch. 1), `holy-spirit` (ch. 2), `the-house-of-god` (ch. 3), `conscience` (ch. 8), `no-other-god` (ch. 8), `idolatry` (ch. 10). Drop proposed: `harmony-with-others` (ch. 1).
- Anchor-extension candidates: 35 across 29 packs. Lexicon candidates: 32 rows / 68 phrasings across 30 ids. New-concept candidates: 2 (`lawsuits-among-believers`, `gift-of-prophecy`), both with check-extension-first instructions. Decline overturns proposed: 0.
- Ceiling markers: ch. 10 (hits 8 with the add) and ch. 15 (standing 8). Per-verse refinement flags: chs. 1, 3, 6, 7, 10, 11, 14, 15, 16.
- Corpus-blocked routes: roster rows 16 (ch. 4), 17 (ch. 16), 21 (ch. 1), 41 (chs. 11 and 14).
- Every tag id in this ledger validated verbatim against `engine-ids.txt` (239) / the adopted 161 list; all 15 `pastoral-*` ids used with their full prefix (the concepts-inventory table displays them prefix-stripped — do not copy ids from it).

## Survival audit (CONVENTIONS §9)

Written as 18 atomic end-of-file appends (header + 16 chapters + this closing block), each verified immediately after write: prior bytes sha256-unchanged and the appended block present byte-exact at EOF. Final-delivery re-audit performed after this append: all 18 blocks present in order, no foreign writes interleaved, no prior byte altered (per-append shas recorded in the sweep thread). This file is the 1 Corinthians sweep worker's alone; no other file under /mnt/project-files was touched.

---

# Erratum — 1 Corinthians sweep ledger, 2026-08-26 (fresh-critic pass)

Appended per CONVENTIONS §9 as one single atomic end-of-file block; nothing above this line was altered (prior bytes sha256-verified unchanged after the write, block verified present byte-exact at EOF). A fresh critic re-verified this ledger's quotes, ids, deltas, caps, schema, neutrality posture, and roster routes clean and sustained six objections plus one minor note — all corrected here. Every source cited below was re-read directly for this erratum (pack files at repo e762d1c, the book doc, `engine-ids.txt`, `concepts-inventory.md`, the engine tokenizer); block quotes reproduce whole source lines byte-exactly, comment markers and line wraps included. Where this block conflicts with earlier text, this block governs.

## E1 — Sweep totals: "35 anchor-extension candidates across 29 packs" — the pack count is wrong

Mechanical recount of the sixteen §2 sections: 35 candidates across **34 distinct packs**, not 29. Exactly one pack repeats — `wisdom-from-god` carries two candidates (ch. 1: 1:20-25; ch. 2: 2:6-10); every other pack appears once. Per-chapter candidate counts, chs. 1-16: 2, 2, 3, 2, 2, 2, 1, 3, 3, 2, 2, 3, 0, 2, 5, 1 — sum 35. The totals line is corrected to "35 across 34 packs".

## E2 — Two pack-census errors from reading the inventory instead of the packs

Both errors share one cause: the fourth column of `concepts-inventory.md` lists which of the 13 Pauline epistles appear in a pack's anchors — not the pack's anchors. The inventory's own header, byte-exact:

    239 packs. Generated 2026-08-26 by the Pauline-sweep prep worker; mechanical extract of each
    pack's `id`, `label`, first lexicon terms, and which of the 13 Pauline epistles appear in its
    `anchors` refs (book codes ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM; `-` = no
    Pauline anchor). Lexicon/anchor counts are per-pack totals. This is an index — for any
    tagging or extension decision, READ THE PACK FILE ITSELF (comments in the packs carry
    binding scope rulings, e.g. walking-in-the-light is scoped to ethical conduct).

The inventory is a briefing artifact and must not be treated as a pack census — its own header says so. This ledger did, twice:

**(a) Ch. 5 §2, `passover`.** The entry claims the pack "has no NT anchor per its inventory row." False: the row's `-` is the Pauline-anchor-books column — no *Pauline* anchor. `ontology/concepts/passover.yaml` @ e762d1c anchors **Luke 22:7-15** (weight 0.9) and **Matthew 26:17-19** (weight 0.8), both NT. Stated accurately, the real gap is that the pack has **no christological/epistolary anchor** — its NT anchors are the Gospels' Passover-preparation narratives (the feast kept by Jesus, not the feast fulfilled in him). The 5:7-8 candidate stands on that ground — and on the pack's own boundary comment, which already records the text as a known deferral (byte-exact, whole lines; the first line opens mid-sentence in the source's wrap):

    # Leviticus doc Decisions #45 — NOT decided here). the-cross keeps the
    # lamb-of-God atonement register (John 1:29 is its anchor; "the
    # passover lamb" rung here reaches the feast's own texts, and 1 Cor
    # 5:7's your-Passover-sacrificed text is corpus-blocked, deferred).

The candidate takes up a deferral the pack itself anticipates; it does not fill an absent-NT-anchor hole, because there is none.

**(b) Ch. 9 §2, `heavenly-reward`.** The entry claims "(Pack anchors EPH only today; the incorruptible-crown text is a native crown/reward query surface.)" — "EPH only" is a Pauline-scoped reading of the same inventory column (the row shows EPH). `ontology/concepts/heavenly-reward.yaml` @ e762d1c anchors **James 1:12** ("the crown of life", weight 1.0, torrey) and **1 Peter 5:4** ("the crown of glory", weight 0.8) alongside Ephesians 6:8 — two of its three anchors are crown texts, and its lexicon already carries "crown of life" and "crowns". Honest restatement, which weakens the entry's rationale: the pack has **no native crown/reward query-surface gap** — that surface is already anchored and phrased. What 9:24-25 adds is the pack's first Pauline and first 1CO anchor, carrying the corruptible-vs-incorruptible athletic register — growth the pack's own header already names as intended (byte-exact; the last line's trailing NOTE clause belongs to the source's next sentence):

    # rejects.md). Most crown texts are corpus-blocked (2 Tim 4:7-8, 1 Cor 9:25,
    # Rev 2:10, 1 Thess 2:19-20, Rev 22:12 — backlog.md); this pack should grow
    # with the corpus. NOTE for G4/doctrinal review: "reward" is not a

The candidate stands on the pack's recorded intention (1 Cor 9:25 is on its own growth list), not on a census gap.

## E3 — Ch. 10 §2, `temptation` ← 1 Cor 10:13: the candidate conceals a recorded contrary design decision; recast as a REVERSAL PROPOSAL

The entry recorded the three-way span-sibling fact but not the design decision behind it: both packs record, on the record, that 1 Cor 10:13 is deliberately NOT the `temptation` pack's to anchor. `ontology/concepts/temptation.yaml` @ e762d1c, boundary-design comment, byte-exact:

    #   - remembered-a-way-of-escape owns bare `temptation`/`tempted` (its
    #     2026-08-18 inventory rows) and 1 Cor 10:13, which is NOT
    #     re-anchored here. Every entry below keeps >= 2 significant tokens
    #     so the bare words stay that pack's own; on multi-word temptation
    #     queries both packs fire honestly.

`ontology/concepts/remembered-a-way-of-escape.yaml` @ e762d1c, the mirror record inside its lexicon:

      # (TAG-GAP batch 3, 2026-08-26: the new `temptation` teaching pack
      # deliberately keeps every entry >= 2 significant tokens so these two
      # bare words stay this pack's own; 1 Cor 10:13 stays this pack's only
      # anchor. Cross-related, recorded both files.)

RECAST: the ch. 10 §2 `temptation` ← 10:13 candidate is a **reversal proposal** against a design decision recorded in both pack files — not a routine extension. Such a proposal is re-openable only citing the original records, which this erratum now does, above. It is marked REVERSIBLE and DEFERRED to the curator, to be decided together with the two recorded owners' claims; this sweep does not adjudicate it.

Sub-defect corrected: the entry's clause "the common-to-man register is currently reachable only via the remembered-* pack" is wrong at anchor level — `pastoral-freedom-from-bondage` also anchors 1 Corinthians 10:13 today (weight 0.8; verified in its yaml @ e762d1c), exactly as the entry's own span-sibling note says one sentence earlier. "Only" holds solely of **lexicon phrasing**: `remembered-a-way-of-escape` alone carries 10:13 phrasings ("tempted beyond what you can bear"; "he will provide a way of escape"; "God is faithful and will not let you be tempted"; bare "temptation"/"tempted"), while `pastoral-freedom-from-bondage`'s lexicon is crisis-register and carries none.

## E4 — Decisions #9: the living-for-gods-glory thin flag is misattributed

Decisions #9 says the tag "was flagged as thin at its own 2026-08-25 application." Wrong application. The book doc's Decisions #19 (re-read directly) attaches the thin flag to the **ch. 6** use and applies ch. 10 without one — byte-exact fragment: "`living-for-gods-glory` on ch. 6 (log line 980 — 6:20 is the charge the whole 6:12–20 body argument lands on; one verse, flagged as the chapter's thinnest tag) and on ch. 10 (10:31, the unit's closing all-of-life rule)". The ch. 10 application (10:31) carries no thin flag; calling it ch. 10's thinnest tag (one verse) is this sweep's own assessment, not a 2026-08-25 record.

The yield-analysis outcome is unchanged. Re-argued on accurate grounds: §11.6's yield order asks whether any standing tag falls into a yield class — cross-ref-class, theme-witness-with-caveat, or broad-duplicating-specific — and none of ch. 10's seven standing tags does, `living-for-gods-glory` included: for all its one-verse compactness it is the unit's closing all-of-life rule, applied under Jesse's adopted-vocabulary ruling. With no standing tag yielding and `idolatry` a main argued theme (10:7, 14-22), the eighth tag is admitted at the ceiling exactly as before.

## E5 — Sweep totals: the pastoral-id attestation used wrong numbers

The totals line claims validation against "all 15 `pastoral-*` ids used with their full prefix." Two corrections. The engine has **14** `pastoral-*` ids, not 15 (recounted from `engine-ids.txt`, this ledger's own validation list). And this ledger itself uses **4** distinct pastoral ids in 11 occurrences: `pastoral-sexual-purity` (4), `pastoral-marriage-divorce-teaching` (4), `pastoral-grief-and-loss` (2), `pastoral-freedom-from-bondage` (1). Corrected attestation: every pastoral id used in this ledger — 4 distinct ids, 11 occurrences — carries its full prefix and matches `engine-ids.txt` verbatim; the engine's pastoral family numbers 14, and nothing in this ledger validated "all 15".

## E6 — Ch. 15 §2/§3, `mormon-evangelism` ← 15:29: breaks the pack's recorded design unflagged, twice; recast as a DESIGN-CHANGE PROPOSAL

`ontology/concepts/mormon-evangelism.yaml` @ e762d1c records two design decisions the ch. 15 entries silently cut against.

**(a) Every anchor is a deliberate dual with a home pack.** Header, byte-exact (the third line's clause continues into the related-edges sentence):

    # Saints. It groups the existing sub-concepts without replacing them —
    # every anchor below is a deliberate DUAL anchor with its home pack
    # (established wave practice), and the related edges pull each

No pack among the 239 anchors 1 Corinthians 15:29 (re-verified mechanically against `ontology/concepts/` at e762d1c: zero hits). A 15:29 anchor would therefore be this pack's **first solo anchor** — a change to the master-tag design itself, not an instance of it. (Same-entry census note, same class as E2: the entry's "pack anchors GAL/EPH/TIT today" is again the inventory's Pauline column; the pack's full anchor bed spans GAL, ISA, EPH, JOHN, TIT, PSA, MAT — 8 anchors, every one a recorded dual.)

**(b) Its lexicon admits movement-name entries only.** The tokenizer-decisions header covers exactly four entries — mormon, mormonism, lds, latter day saints — e.g. byte-exact:

    # TOKENIZER DECISIONS (G-4, engine-verified with significantWords;
    # logged in mormon-evangelism.json):
    #   - bare "mormon" ADMITTED ({mormon} appears in no WEB verse — the
    #     apologetics/godhead §1.6d option-3 precedent; no lexical rung can
    #     reach the movement register without it). "mormons" shares the stem;
    #     "mormon evangelism", "what do mormons believe", "witnessing to
    #     mormons" all fire by containment — none is a separate entry
    #     (worker duplicate/superset rule).

"baptism for the dead" / "baptized for the dead" would be the pack's **first topical (non-movement-name) lexicon entries**, and the routing consequence must be stated plainly: a scripture-topic query, typed by a user who named no movement, would surface a movement-labeled concept ("Mormon evangelism") on its chip. That is a neutrality-adjacent design change — the movement-name-only lexicon is precisely what currently confines this pack to users who name the movement themselves. On the two phrasings, the duplicate/superset rule was checked against the shared tokenizer rather than assumed: they do **not** collapse to one token set — "baptism for the dead" → {baptism, dead}, "baptized for the dead" → {baptiz, dead} (the stemmer strips -ed but not -ism, the same rule the pack's mormonism note records) — so the rule does not mechanically merge them; they are nonetheless one query family, and the ch. 15 §3 row is corrected to the **single phrasing "baptism for the dead"**, with "baptized for the dead" admissible only as a deliberate, logged near-duplicate under the pack's engine-verified-significantWords discipline.

RECAST: the 15:29 anchor plus lexicon row are together a **design-change proposal** — first solo anchor + first topical lexicon entries — requiring the curator's explicit sign-off; DEFERRED. The entry's original GIST CARE stands (the engine reports that a curated source names the verse as the locus of the question; it adjudicates neither the verse's meaning nor the practice — covenant #6), and this erratum adjudicates nothing either: it flags what the change would change.

## E7 (minor) — Ch. 12 §2, `unity-of-the-church` ← 12:12-27: collision note appended

The entry lacks the collision note this ledger's own practice supplies elsewhere (ch. 9 §3's COLLISION CHECK). Appended now: `spiritual-gifts` already carries the lexicon entry "many members one body" (verified in `ontology/concepts/spiritual-gifts.yaml` @ e762d1c) and anchors Romans 12:4-8 for the one-body-differing-gifts run; and the book doc's motif row 6 ("One body, many members" · 12:12–27) names its homes as `spiritual-gifts`, `harmony-with-others`. One-body-many-members queries therefore already reach `spiritual-gifts` by lexicon today, and the proposed 12:12-27 anchor would put `unity-of-the-church` on that same query family's span — beside the ch. 12 `baptism` 12:13 sibling already recorded. Different registers, all honestly present (gift-diversity vs. church-unity vs. `harmony-with-others`' mutual care, per Decisions #10); recorded so the curator weighs the three-way ownership of the "one body" query surface deliberately.

## Corrected sweep totals (supersede the corresponding lines above)

- Tag instances unchanged: 70 prior → 77 proposed — **8 adds / 69 keeps / 1 proposed drop**.
- Anchor-extension candidates: **35 across 34 packs** (only `wisdom-from-god` repeats — chs. 1 and 2), with **two recast** by this erratum: `temptation` ← 10:13 as a reversal proposal (E3) and `mormon-evangelism` ← 15:29 as a design-change proposal (E6), both deferred to the curator.
- Lexicon candidates: 32 rows across 30 ids unchanged; phrasings 68 → **67** with E6's collapse of the ch. 15 §3 row to one phrasing.
- Pastoral-id attestation corrected: **14** `pastoral-*` ids in the engine; **4** distinct used in this ledger (11 occurrences), all full-prefix, all matching `engine-ids.txt` verbatim.
- All other totals stand as written.

*Erratum recorded by the 2026-08-26 fresh-critic pass; one atomic append, §9-verified.*
