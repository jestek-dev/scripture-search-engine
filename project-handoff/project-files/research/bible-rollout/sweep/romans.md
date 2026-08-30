# Romans — Layer-3 tag-sweep ledger

**Book:** Romans (WEB VPL code `ROM`, 434 verses, 16 chapters)
**Repo SHA:** e762d1c629f5b121a2aacc6da57cca6bacc3215e (origin/main = HEAD; engine 0.14.0; 239 concept packs)
**Date:** 2026-08-26
**Worker:** Pauline-epistles sweep, Romans assignment

**Inputs used:**
- Prior art: `/mnt/project-files/research/bible-rollout/romans.md` (read in full, incl. Decisions record items 1–23 and the mechanical validation appendix). Existing tags are prior art; deltas below are add/keep/drop against that doc's final tag state (83 tag instances across 16 chapters after the 2026-08-25 application passes).
- Engine concept library: all 239 pack ids at e762d1c (`engine-ids.txt`) with per-pack lexicon/anchor reads from `ontology/concepts/*.yaml`; plus the 161-id adopted display-tag list (`adopted-161.txt`; CONVENTIONS §11.1). Legal tag vocabulary = the 303-id union. Every id below validated mechanically against those lists.
- `tag-gaps-review.md` §1 (contested calls, resolved by §11) and §3 (recorded declines/folds/not-gaps) via the briefing pack's verbatim extract; declines re-considerable only with new textual evidence, cited.
- Corpus-blocked roster: `engine-pack-backlog.md` 50-row roster (all re-verified STILL GATED post-#53). Matches are ROUTED, not duplicated.
- Binding rules: CONVENTIONS §3/§4/§5/§6/§9/§11 verbatim (presence bar first; soft cap 6 / hard ceiling 8; §11.6 yield order; both-tags ruling; no later-revelation read-backs; honest-and-empty preferred; no silent drops).

**WEB provenance:** all quotations below are word-for-word from the pinned ebible.org engwebp VPL edition declared in `pipeline/manifests/web.json`, fetched and sha256-verified against the manifest (`b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c` — exact match; byte-identical to what `npm run fetch:sources` verifies). This is pinned-text verification, not current-edition verification; no drift caveat applies. `pipeline/fixtures/web-subset.json` was regenerated from this same sha256 at PR #53, so fixture-witnessed verses agree by construction. WEB versification note: the letter's doxology stands at 14:24–26 in the WEB (ch. 14 has 26 verses; 16:25 is a textless line; ch. 16 ends at 16:24).

**Doctrinal posture:** the `election-and-predestination` pack's §4-neutral wording is binding precedent for contested passages (Rom 9 especially): this ledger reports what curated sources name and what the text says, in the text's own words; it adjudicates nothing, and no entry carries a theology verdict.

**Per-chapter schema:** Applied-tag deltas (ADD/KEEP/DROP) · Anchor-extension candidates (engine packs only) · Lexicon candidates · New-concept candidates · Decline-overturn proposals · Routes to the corpus-blocked roster · Ceiling/subdivision marker. Every yield or judgment call gets a Decisions-record entry at the end of the ledger.

---
## Romans 1
**Applied-tag deltas** (book doc: 7 tags → sweep: 8 — 7 KEEP, 1 ADD, 0 DROP):
- KEEP `salvation` — the thesis: "it is the power of God for salvation for everyone who believes" (1:16).
- KEEP `faith` — "For in it is revealed God’s righteousness from faith to faith"; "But the righteous shall live by faith." (1:17).
- KEEP `divine-judgment` — "For the wrath of God is revealed from heaven against all ungodliness and unrighteousness of men" (1:18); the threefold "God gave them up" (1:24, 26, 28).
- KEEP `those-who-never-heard` — "the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity, that they may be without excuse" (1:20).
- KEEP `sin` — "who suppress the truth in unrighteousness" (1:18) and the closing catalog: "those who practice such things are worthy of death" (1:29–32).
- KEEP `conscience` — "who, knowing the ordinance of God, that those who practice such things are worthy of death, not only do the same, but also approve of those who practice them" (1:32; both-tags beside `those-who-never-heard`, per the apologetics map's dual-anchor design).
- KEEP `creation-testifies` — "For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made" (1:20, with 1:19; the suppressed-witness edge is recorded in the pack itself).
- ADD `idolatry` — the indictment's hinge is the idolatrous exchange itself, depicted at length: "traded the glory of the incorruptible God for the likeness of an image of corruptible man, and of birds, four-footed animals, and creeping things" (1:23); "worshiped and served the creature rather than the Creator" (1:25). Substantial presence (1:21–25 carries the argument, not a passing mention); the engine pack has no Romans anchor today. Brings the chapter to the 8-tag hard ceiling; each tag independently clears the bar (Decisions D1).

**Anchor-extension candidates:**
- `idolatry` ← Romans 1:21-25, weight 0.75 — "worshiped and served the creature rather than the Creator" (1:25). The NT's diagnosis of idolatry's root; no Romans anchor in the pack.

**Lexicon candidates:**
- `idolatry`: "worship the creation instead of the creator"; "exchanged the glory of god for images"; "what does the bible say about worshiping created things".
- `divine-judgment`: "god gave them up"; "god gave them over meaning".

**New-concept candidates:** none — every theme present has an honest home in the 303-id union (checked against the declines and the roster).
**Decline-overturn proposals:** none.
**Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** HITS THE 8-TAG HARD CEILING (after the add); subdivided in romans.md (1:1–17 / 1:18–32) → per-verse refinement pass.

## Romans 2
**Applied-tag deltas** (book doc: 6 → sweep: 7 — 6 KEEP, 1 ADD, 0 DROP):
- KEEP `divine-judgment` — "the judgment of God is according to truth" (2:2); "treasuring up for yourself wrath in the day of wrath" (2:5); "God will judge the secrets of men" (2:16).
- KEEP `repentance` — "the goodness of God leads you to repentance" (2:4), despised at the peril of a "hardness and unrepentant heart" (2:5).
- KEEP `self-deception` — "You therefore who teach another, don’t you teach yourself? You who preach that a man shouldn’t steal, do you steal?" (2:21, with 2:1, 22–23).
- KEEP `judging-others` — "For in that which you judge another, you condemn yourself. For you who judge practice the same things." (2:1, with 2:2–3).
- KEEP `conscience` — "they show the work of the law written in their hearts, their conscience testifying with them, and their thoughts among themselves accusing or else excusing them" (2:15, with 2:14).
- KEEP `those-who-never-heard` — those without the written law judged by its work written on the heart, "in the day when God will judge the secrets of men" (2:12–16; both-tags beside `conscience`).
- ADD `circumcision-of-the-heart` (adopted id, display-only) — the phrase and its full teaching: "but he is a Jew who is one inwardly, and circumcision is that of the heart, in the spirit, not in the letter; whose praise is not from men, but from God" (2:29, with the 2:25–28 argument). Substantial presence: 2:25–29 is the section's point, not an aside. Engine-side this concept is corpus-blocked roster row 37, which itself records Rom 2:28-29 as in-corpus, unclaimed, and the natural NT keystone — this display tag is the ledger's counterpart to that recorded route, not a duplicate mint (Decisions D2).

**Anchor-extension candidates:**
- `favoritism` ← Romans 2:11, weight 0.55 — "For there is no partiality with God." God's impartiality in judgment; the pack's lexicon carries "partiality" and it has no Romans anchor. Single verse — anchor-only, deliberately not tagged (Decisions D3).

**Lexicon candidates:**
- `favoritism`: "does god show favoritism"; "god has no favorites"; "no partiality with god".
- `repentance`: "gods goodness leads to repentance"; "gods kindness leads you to repentance".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:**
- Rom 2:25–29 → roster row 37 (`circumcision-of-the-heart`): engine work stays with that row (its read-together heart-design with `new-heart` / `hardness-of-heart` is deferred whole); only the display tag is applied here.
- Rom 2:24 "the name of God is blasphemed among the Gentiles because of you" → roster row 8 (`gods-holy-name`, profaned-name register) — noted for that row's curator, not proposed separately.
**Ceiling/subdivision marker:** 7 tags (within ceiling); not subdivided.

## Romans 3
**Applied-tag deltas** (book doc: 5 → sweep: 5 — 5 KEEP, 0 ADD, 0 DROP):
- KEEP `sin` — "There is no one righteous; no, not one." (3:10); "for all have sinned, and fall short of the glory of God" (3:23).
- KEEP `justification-by-faith` — "We maintain therefore that a man is justified by faith apart from the works of the law." (3:28); "being justified freely by his grace" (3:24).
- KEEP `grace-not-earned` — "being justified freely by his grace through the redemption that is in Christ Jesus" (3:24); "Where then is the boasting? It is excluded." (3:27).
- KEEP `the-cross` — "whom God sent to be an atoning sacrifice through faith in his blood" (3:25).
- KEEP `gods-faithfulness` — "Will their lack of faith nullify the faithfulness of God? May it never be! Yes, let God be found true, but every man a liar." (3:3–4).
- Considered, not added: `sacrifice-and-atonement` (adopted id) — on display it would duplicate the sitting `the-cross` tag on the same verse (broad-duplicating-specific, the §11.6 yield class); engine-side the concept is roster row 1 (Decisions D4).

**Anchor-extension candidates:**
- `justification-by-faith` ← Romans 3:23-28, weight 0.9 — "a man is justified by faith apart from the works of the law" (3:28). Confirms the pack's own comment (Rom 3:28 recorded as a corpus-blocked keystone at mint; re-pin candidate).
- `the-cross` ← Romans 3:24-26, weight 0.8 — "an atoning sacrifice through faith in his blood... that he might himself be just and the justifier of him who has faith in Jesus" (3:25–26). The pack anchors Rom 5:8 but not the letter's atonement statement.
- `gods-faithfulness` ← Romans 3:3-4, weight 0.7 — "Will their lack of faith nullify the faithfulness of God?" (3:3). No Romans anchor in the pack.

**Lexicon candidates:**
- `justification-by-faith`: "just and the justifier"; "righteousness apart from the law"; "how can god be just and still forgive sinners".
- `sin`: "all have sinned and fall short of the glory of god"; "no one is righteous not even one".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:** Rom 3:25 noted for roster row 1 (`sacrifice-and-atonement`) — that row's recorded constraint ("`atonement` token owned by the-cross") is exactly why no separate candidate is proposed here.
**Ceiling/subdivision marker:** 5 tags; subdivided in romans.md (3:1–8 / 3:9–20 / 3:21–31) → per-verse refinement pass.

## Romans 4
**Applied-tag deltas** (book doc: 4 → sweep: 4 — 4 KEEP, 0 ADD, 0 DROP):
- KEEP `justification-by-faith` — "Abraham believed God, and it was accounted to him for righteousness." (4:3); "was raised for our justification" (4:25).
- KEEP `faith` — "he didn’t waver through unbelief, but grew strong through faith, giving glory to God" (4:20, with 4:18–21).
- KEEP `grace-not-earned` — "Now to him who works, the reward is not counted as grace, but as something owed." (4:4); "it is of faith, that it may be according to grace" (4:16).
- KEEP `forgiveness-of-sins` — "Blessed are they whose iniquities are forgiven, whose sins are covered." (4:7, with 4:8).
- Considered, not added: `covenant` — the chapter argues from the Abrahamic promise (4:13–17) but never uses covenant vocabulary, and its teaching substance here is the faith-crediting argument already tagged; declined on the presence bar, proposed as a low-weight anchor extension instead (Decisions D5). `hope-in-god` — "Against hope, Abraham in hope believed" (4:18) is one verse inside the anatomy of faith; thin single-verse (§11.6 class), not tagged.

**Anchor-extension candidates:**
- `justification-by-faith` ← Romans 4:3-5, weight 0.9 — "believes in him who justifies the ungodly, his faith is accounted for righteousness" (4:5). Confirms the pack's own corpus-blocked keystone note (Rom 4:5).
- `forgiveness-of-sins` ← Romans 4:7-8, weight 0.7 — "Blessed is the man whom the Lord will by no means charge with sin." (4:8). No Romans 4 anchor in the pack.
- `faith` ← Romans 4:18-21, weight 0.7 — "being fully assured that what he had promised, he was also able to perform" (4:21). The pack carries only two anchors today.
- `resurrection` ← Romans 4:24-25, weight 0.6 — "who believe in him who raised Jesus our Lord from the dead" (4:24). Pack anchors Rom 1:4; 6:5; 8:11 but not the resurrection–justification link.
- `covenant` ← Romans 4:13-17, weight 0.5 — "For the promise to Abraham and to his offspring that he would be heir of the world wasn’t through the law, but through the righteousness of faith." (4:13). Caveat: Abrahamic-promise substance without covenant vocabulary; a secondary witness for "abrahamic covenant" queries.

**Lexicon candidates:**
- `justification-by-faith`: "credited as righteousness"; "abraham believed god"; "faith counted as righteousness".
- `faith`: "hoping against hope"; "fully persuaded god can do what he promised".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 4 tags; not subdivided.

## Romans 5
**Applied-tag deltas** (book doc: 6 → sweep: 6 — 6 KEEP, 0 ADD, 0 DROP):
- KEEP `justification-by-faith` — "Being therefore justified by faith, we have peace with God through our Lord Jesus Christ" (5:1); "being now justified by his blood" (5:9).
- KEEP `gods-love` — "But God commends his own love toward us, in that while we were yet sinners, Christ died for us." (5:8); "God’s love has been poured into our hearts" (5:5).
- KEEP `hope-in-god` — "suffering produces perseverance; and perseverance, proven character; and proven character, hope; and hope doesn’t disappoint us" (5:3–5).
- KEEP `the-cross` — "at the right time Christ died for the ungodly" (5:6); "we were reconciled to God through the death of his Son" (5:10).
- KEEP `sin` — "as sin entered into the world through one man, and death through sin, so death passed to all men" (5:12).
- KEEP `grace-not-earned` — "But the free gift isn’t like the trespass." (5:15); "where sin abounded, grace abounded more exceedingly" (5:20).
- Considered, not added: `salvation` (5:9–10 "we will be saved from God’s wrath through him") — broad-duplicating-specific beside the sitting justification/cross tags (§11.6 class); `eternal-life` (adopted) — 5:21 is a single closing verse; the concept's honest Romans home is ch. 6 (added there). Decisions D6.

**Anchor-extension candidates:**
- `remembered-joy-in-trials` ← Romans 5:3-4, weight 0.6 — "we also rejoice in our sufferings, knowing that suffering produces perseverance; and perseverance, proven character; and proven character, hope" (5:3–4). Caveat: the pack is a James-1:2-4-shaped verse-memory concept; Rom 5:3-4 is the exact parallel chain — curation decides whether the verse-memory design admits a second-witness anchor.

**Lexicon candidates:**
- `justification-by-faith`: "peace with god"; "how can i be right with god".
- `gods-love`: "while we were still sinners christ died for us"; "does god love me even though i sin".
- `hope-in-god`: "hope does not disappoint"; "hope that does not put us to shame".
- `remembered-joy-in-trials`: "suffering produces perseverance"; "rejoice in our sufferings".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Prior-art tension noted (no action):** `peace-of-god.yaml` anchors Romans 5:1 engine-side, while romans.md Decision 14 deliberately declined the `peace-of-god` display tag on 5:1 (reconciliation-standing vs. Philippians-4 inner-peace register). Both records are visible to the curator; the display decline stands — this ledger changes neither.
**Ceiling/subdivision marker:** 6 tags; subdivided in romans.md (5:1–11 / 5:12–21) → per-verse refinement pass.

## Romans 6
**Applied-tag deltas** (book doc: 5 → sweep: 7 — 5 KEEP, 2 ADD, 0 DROP):
- KEEP `baptism` — "all of us who were baptized into Christ Jesus were baptized into his death? We were buried therefore with him through baptism into death" (6:3–4).
- KEEP `sin` — "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord." (6:23); "don’t let sin reign in your mortal body" (6:12–14).
- KEEP `holiness` — "present your members as servants to righteousness for sanctification" (6:19); "you have your fruit of sanctification" (6:22).
- KEEP `pastoral-freedom-from-bondage` — "so that we would no longer be in bondage to sin" (6:6); "Being made free from sin, you became bondservants of righteousness." (6:18).
- KEEP `identity-in-christ` — "consider yourselves also to be dead to sin, but alive to God in Christ Jesus our Lord" (6:11).
- ADD `surrender-to-god` — the chapter's repeated present-yourselves teaching: "present yourselves to God as alive from the dead, and your members as instruments of righteousness to God" (6:13); "present your members as servants to righteousness" (6:19, with 6:16). Substantial presence across the chapter's second half; the engine pack already anchors Romans 6:13 — the display tag aligns with the pack's own judgment (Decisions D7).
- ADD `eternal-life` (adopted id, display-only) — the chapter's stated outcome, twice: "the result of eternal life" (6:22) and "the free gift of God is eternal life in Christ Jesus our Lord" (6:23). Engine-side, the eternal-life standalone-pack question is recorded in `salvation.yaml` (backlog re-open note) — display tag only here (Decisions D8).

**Anchor-extension candidates:**
- `identity-in-christ` ← Romans 6:11, weight 0.7 — "consider yourselves also to be dead to sin, but alive to God in Christ Jesus our Lord" (6:11). Pack anchors only Galatians/Ephesians today; the book doc has carried this tag here since the pilot.
- `holiness` ← Romans 6:19-22, weight 0.65 — "present your members as servants to righteousness for sanctification" (6:19). No Romans anchor in the pack.

**Lexicon candidates:**
- `pastoral-freedom-from-bondage`: "slave to sin"; "how do i stop being a slave to sin".
- `identity-in-christ`: "dead to sin alive to god"; "consider yourself dead to sin".
- `salvation`: "the free gift of god is eternal life".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:** none (eternal-life is not a roster row; its engine question lives in `salvation.yaml`'s recorded note, cited above).
**Ceiling/subdivision marker:** 7 tags (within ceiling); not subdivided (romans.md Decision 7 left the 6:15 BSB break unmade — noted for the refinement pass only if Jesse splits it).

## Romans 7
**Applied-tag deltas** (book doc: 1 → sweep: 3 — 1 KEEP, 2 ADD, 0 DROP):
- KEEP `sin` — "sin, finding occasion through the commandment, deceived me, and through it killed me" (7:11); "I am fleshly, sold under sin... what I hate, that I do" (7:14–15).
- ADD `freedom-in-christ` (adopted id, display-only) — release from the law through union with Christ, taught at length: "you also were made dead to the law through the body of Christ, that you would be joined to another" (7:4); "But now we have been discharged from the law, having died to that in which we were held; so that we serve in newness of the spirit, and not in oldness of the letter." (7:6, with the 7:1–3 marriage analogy). This is the freed-from-the-law register natively, not a read-back (Decisions D9).
- ADD `covetousness` — coveting is the chapter's chosen case-study commandment, treated across two verses: "I wouldn’t have known coveting unless the law had said, 'You shall not covet.'" (7:7); "sin, finding occasion through the commandment, produced in me all kinds of coveting" (7:8). The engine pack already anchors Romans 7:7-8, so the display tag aligns with the pack's own scope judgment; borderline (the chapter's subject is law-and-sin, with coveting as the exhibit) — kept on the pack-anchor evidence (Decisions D10).
- The book doc's "(Only one honest tag from the current vocabulary)" note is superseded by these two adds — both were vocabulary-blocked at draft time (`freedom-in-christ` adopted 2026-08-25; `covetousness` minted in the 161-rollout) (Decisions D11).

**Anchor-extension candidates:**
- `pastoral-relapse-and-restoration` ← Romans 7:15-25, weight 0.6 — "For I don’t practice what I desire to do; but what I hate, that I do." (7:15); "What a wretched man I am! Who will deliver me out of the body of this death? I thank God through Jesus Christ, our Lord!" (7:24–25). The pastoral home romans.md's motif #9 already points to for "why do I keep sinning" queries. Caveat: the identity of the "I" is debated — `pastoral-freedom-from-bondage.yaml`'s comment records exactly that debate on its own 7:24-25 anchor; curation should weigh the two packs' shares together.

**Lexicon candidates:**
- `pastoral-relapse-and-restoration`: "why do i keep sinning"; "i do what i don't want to do".
- `pastoral-freedom-from-bondage`: "wretched man that i am"; "who will deliver me from this body of death".
- `freedom-in-christ` (for the eventual pack; adopted, no pack yet): "dead to the law"; "set free from the law"; "newness of the spirit".

**New-concept candidates:** none — the inner-war material has recorded homes (`sin`, `pastoral-relapse-and-restoration`, `pastoral-freedom-from-bondage`); checked against declines and roster.
**Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 3 tags; not subdivided.

## Romans 8
**Applied-tag deltas** (book doc: 8 → sweep: 8 — 8 KEEP, 0 ADD, 0 DROP; the chapter sits at the hard ceiling):
- KEEP `assurance-of-salvation` — "There is therefore now no condemnation to those who are in Christ Jesus" (8:1); "The Spirit himself testifies with our spirit that we are children of God" (8:16); "Who could bring a charge against God’s chosen ones? It is God who justifies." (8:33, with 8:34).
- KEEP `gods-love` — "Who shall separate us from the love of Christ?" (8:35); "nor any other created thing will be able to separate us from God’s love which is in Christ Jesus our Lord" (8:39).
- KEEP `identity-in-christ` — "you received the Spirit of adoption, by whom we cry, 'Abba! Father!'" (8:15); "and if children, then heirs—heirs of God and joint heirs with Christ" (8:17).
- KEEP `remembered-all-things-for-good` — "We know that all things work together for good for those who love God, for those who are called according to his purpose." (8:28).
- KEEP `victory-in-christ` — "No, in all these things we are more than conquerors through him who loved us." (8:37).
- KEEP `suffering-for-christ` — "if indeed we suffer with him, that we may also be glorified with him" (8:17); "For your sake we are killed all day long." (8:36).
- KEEP `adoption-as-gods-children` — "you received the Spirit of adoption, by whom we cry, 'Abba! Father!'" (8:15); "waiting for adoption, the redemption of our body" (8:23).
- KEEP `election-and-predestination` — the chain in the text's own order: "Whom he predestined, those he also called. Whom he called, those he also justified. Whom he justified, those he also glorified." (8:29–30) — §4-neutral, described as the text speaks.
- Candidates barred by the ceiling (§11.6 forbids displacement; every sitting tag independently clears the bar — Decisions D12): `walking-by-the-spirit` (8:1, 4 "don’t walk according to the flesh, but according to the Spirit"; 8:13–14 "led by the Spirit of God" — the pack itself anchors Rom 8:13-14; the STRONGEST barred candidate, first in line for the per-verse refinement pass), `holy-spirit` (8:9–16 indwelling), `holy-spirit-the-comforter` + `prayer` (8:26–27), `hope-in-god` (8:24–25), `why-god-allows-suffering` (8:18, 28 — skip already recorded in romans.md Decision 23).

**Anchor-extension candidates:**
- `prayer` ← Romans 8:26-27, weight 0.7 — "we don’t know how to pray as we ought. But the Spirit himself makes intercession for us with groanings which can’t be uttered." (8:26). No Romans anchor in the pack (intercession→`prayer` is the standing Genesis-thread ruling; `holy-spirit-the-comforter` already anchors 8:26 for the helper register).
- `holy-spirit` ← Romans 8:9-16, weight 0.7 — "if it is so that the Spirit of God dwells in you" (8:9); "as many as are led by the Spirit of God, these are children of God" (8:14). The pack has no Pauline anchor at all today.
- `new-heaven-and-earth` ← Romans 8:19-22, weight 0.6 — "the creation itself also will be delivered from the bondage of decay into the liberty of the glory of the children of God" (8:21). Serves "will the world be restored" queries; pack has only two anchors.
- `hope-in-god` ← Romans 8:24-25, weight 0.6 — "For we were saved in hope... But if we hope for that which we don’t see, we wait for it with patience." (8:24–25).

**Lexicon candidates:**
- `assurance-of-salvation`: "no condemnation"; "can anything separate me from god".
- `prayer`: "i don't know how to pray"; "the spirit intercedes for us"; "groanings too deep for words".
- `adoption-as-gods-children`: "abba father"; "abba father meaning".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:**
- Rom 8:34 "who also makes intercession for us" → roster row 24 (`mediator`) — the Christ-as-intercessor witness, noted for that row's curator beside its recorded in-corpus notes (1 John 2:1; Heb 12:24); not proposed separately.
**Ceiling/subdivision marker:** AT THE 8-TAG HARD CEILING; subdivided in romans.md (8:1–17 / 8:18–34 / 8:35–39) → per-verse refinement pass (the barred `walking-by-the-spirit` candidate is the headline item).

## Romans 9
**Applied-tag deltas** (book doc: 5 → sweep: 7 — 5 KEEP, 2 ADD, 0 DROP; §4-neutral throughout — this ledger describes what the text says and what sources name, adjudicating nothing):
- KEEP `providence` — "the purpose of God according to election might stand, not of works, but of him who calls" (9:11); "he has mercy on whom he desires, and he hardens whom he desires" (9:18); "hasn’t the potter a right over the clay...?" (9:21).
- KEEP `gods-faithfulness` — "But it is not as though the word of God has come to nothing. For they are not all Israel that are of Israel." (9:6).
- KEEP `faith` — "the Gentiles, who didn’t follow after righteousness, attained to righteousness, even the righteousness which is of faith" (9:30); "they didn’t seek it by faith, but as it were by works of the law" (9:32).
- KEEP `election-and-predestination` — in the text's own words: "the purpose of God according to election" (9:11); "I will have mercy on whom I have mercy" (9:15); the potter and the clay (9:20–21) — described as the text speaks, adjudicating nothing (the pack's §4-neutral gist is binding precedent).
- KEEP `gods-plan-for-israel` — "I have great sorrow and unceasing pain in my heart" (9:2); the privileges list (9:4–5); "it is not as though the word of God has come to nothing" (9:6).
- ADD `mercy` — mercy at God's initiative is the argument's own repeated vocabulary: "I will have mercy on whom I have mercy, and I will have compassion on whom I have compassion." (9:15); "So then it is not of him who wills, nor of him who runs, but of God who has mercy." (9:16); "vessels of mercy" (9:23). Substantial presence; §4-neutral (the text's own mercy language, no verdict) (Decisions D13).
- ADD `gentile-inclusion` (adopted id, display-only; §11.3) — "us, whom he also called, not from the Jews only, but also from the Gentiles?" (9:24); "I will call them 'my people,' which were not my people" (9:25); "the Gentiles, who didn’t follow after righteousness, attained to righteousness" (9:30). Engine-side the concept is roster row 40 — display tag only here. `nations-and-peoples` not co-applied: no origin-of-nations register in this chapter (Decisions D14).

**Anchor-extension candidates:**
- `mercy` ← Romans 9:15-16, weight 0.7 — "I will have mercy on whom I have mercy" (9:15). No Romans anchor in the pack.
- `remnant` ← Romans 9:27-29, weight 0.6 — "it is the remnant who will be saved" (9:27). The pack anchors Rom 11:4-5; ch. 9's Isaiah citations are a second Romans witness. Tag deliberately NOT applied on this chapter (quoted-prophecy material, §11.6 thin class; ch. 11 is where the letter teaches the remnant — tagged there) (Decisions D15).
- Deliberately NOT proposed: `election-and-predestination` ← Rom 9:6-24 — the pack comment and the backlog's flagged item #2 both record Rom 9 as "DELIBERATELY NOT ridden; potter texts enter only with the whole argument assertable." Routed below, not duplicated.

**Lexicon candidates:**
- `election-and-predestination`: "potter and clay"; "jacob i loved esau i hated"; "vessels of mercy and vessels of wrath".
- `mercy`: "i will have mercy on whom i have mercy"; "god of mercy and compassion".
- `gods-plan-for-israel`: "children of the promise"; "not all israel is israel".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:**
- Rom 9:6-24 → backlog flagged item #2 (`election-and-predestination`'s Rom 9 note): the whole-argument-assertable boundary is that record's own design constraint; nothing here pre-empts it.
- Rom 9:11-13 (chosen "being not yet born, neither having done anything good or bad") → roster row 21 (`gods-surprising-choice`) — the standing one-design ruling (decide with `god-looks-at-the-heart` + `humble-exaltation` together) binds; noted, not proposed.
- Rom 9:24-26, 30 → roster row 40 (`gentile-inclusion`) — display tag applied above; engine work stays with the row (Gal 3:28 and Acts 13:47-48 are its recorded free anchors).
**Ceiling/subdivision marker:** 7 tags (within ceiling); not subdivided (romans.md Decision 8 left the chapter whole — borderline; if Jesse ever splits it, the 9:6–29 election unit is the natural refinement target).

## Romans 10
**Applied-tag deltas** (book doc: 5 → sweep: 5 — 5 KEEP, 0 ADD, 0 DROP):
- KEEP `salvation` — "if you will confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved" (10:9, with 10:10); "Whoever will call on the name of the Lord will be saved." (10:13).
- KEEP `faith` — "So faith comes by hearing, and hearing by the word of God." (10:17); "The word is near you, in your mouth and in your heart" (10:8).
- KEEP `sharing-your-faith` — "How will they hear without a preacher? And how will they preach unless they are sent?" (10:14–15).
- KEEP `those-who-never-heard` — the chapter asks the question directly: "How then will they call on him in whom they have not believed?" (10:14); "didn’t they hear? Yes, most certainly, 'Their sound went out into all the earth'" (10:18).
- KEEP `gods-plan-for-israel` — "my heart’s desire and my prayer to God is for Israel, that they may be saved" (10:1); "they have a zeal for God, but not according to knowledge" (10:2); "All day long I stretched out my hands to a disobedient and contrary people." (10:21).
- Considered, not added: `zeal-for-god` (adopted) — 10:2 is a single verse, and roster row 36 itself records Rom 10:2 as the zeal-without-knowledge caution, the "wrong register" for that concept's Phinehas case; routed below (Decisions D16). `gentile-inclusion` — "there is no distinction between Jew and Greek" (10:12) and the 10:19–20 citations are genuine but subordinate to this chapter's Israel's-refusal argument; theme-witness-with-caveat (§11.6 class), declined here — chs. 9, 11, and 15 carry the tag where the theme is taught (Decisions D17).

**Anchor-extension candidates:**
- `sharing-your-faith` ← Romans 10:14-15, weight 0.75 — "How will they hear without a preacher? And how will they preach unless they are sent? As it is written: 'How beautiful are the feet of those who preach the Good News of peace'" (10:14–15). The pack has only a 2 Corinthians Pauline anchor today.
- `those-who-never-heard` ← Romans 10:14-18, weight 0.6 — "didn’t they hear? Yes, most certainly" (10:18). The pack anchors Rom 1:18-20 and 2:14-15; this is the argument's third leg.

**Lexicon candidates:**
- `salvation`: "confess with your mouth"; "romans road"; "call on the name of the lord".
- `sharing-your-faith`: "how beautiful are the feet"; "how will they hear without a preacher".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:** Rom 10:2 → roster row 36 (`zeal-for-god`) — that row's own caution note already cites this verse; nothing new proposed.
**Ceiling/subdivision marker:** 5 tags; not subdivided.

## Romans 11
**Applied-tag deltas** (book doc: 6 → sweep: 8 — 6 KEEP, 2 ADD, 0 DROP; hits the hard ceiling):
- KEEP `gods-faithfulness` — "God didn’t reject his people, whom he foreknew." (11:2); "For the gifts and the calling of God are irrevocable." (11:29).
- KEEP `grace-not-earned` — "a remnant according to the election of grace. And if by grace, then it is no longer of works; otherwise grace is no longer grace." (11:5–6).
- KEEP `providence` — "by their fall salvation has come to the Gentiles, to provoke them to jealousy" (11:11); "For God has bound all to disobedience, that he might have mercy on all." (11:32).
- KEEP `praise` — "Oh the depth of the riches both of the wisdom and the knowledge of God!... To him be the glory for ever! Amen." (11:33, 36).
- KEEP `election-and-predestination` — "a remnant according to the election of grace" (11:5); "the chosen ones obtained it, and the rest were hardened" (11:7); "concerning the election, they are beloved for the fathers’ sake" (11:28) — §4-neutral, described as the text speaks.
- KEEP `gods-plan-for-israel` — the chapter's whole question and answer: "did God reject his people? May it never be!" (11:1); the ingrafting (11:11–24); "a partial hardening has happened to Israel, until the fullness of the Gentiles has come in, and so all Israel will be saved" (11:25–26).
- ADD `remnant` — the letter's remnant teaching in full: Elijah's seven thousand — "I have reserved for myself seven thousand men who have not bowed the knee to Baal." (11:4) — and its application: "Even so too at this present time also there is a remnant according to the election of grace." (11:5). The engine pack already anchors Romans 11:4-5; the display tag aligns with the pack's own judgment (Decisions D18).
- ADD `gentile-inclusion` (adopted id, display-only; §11.3) — the ingrafting image is the theme itself: "you, being a wild olive, were grafted in among them and became partaker with them of the root and of the richness of the olive tree" (11:17); "by their fall salvation has come to the Gentiles" (11:11); "until the fullness of the Gentiles has come in" (11:25). Engine-side: roster row 40 (Decisions D19).
- YIELD (not applied, Decisions D20): `mercy` — genuinely present ("that by the mercy shown to you they may also obtain mercy... that he might have mercy on all", 11:31–32) but the ninth candidate at an 8-tag ceiling; yields under §11.6 as theme-witness beside the chapter's main themes; captured below as an anchor extension instead. Also considered and declined: `humble-exaltation` — "don’t boast over the branches" (11:18) and "Don’t be conceited, but fear" (11:20) are a no-boasting warning, not the God-exalts-the-humble register (presence-bar decline, plus the ceiling) (Decisions D21).

**Anchor-extension candidates:**
- `gods-faithfulness` ← Romans 11:29, weight 0.75 — "For the gifts and the calling of God are irrevocable." No Romans anchor in the pack.
- `praise` ← Romans 11:33-36, weight 0.7 — "Oh the depth of the riches both of the wisdom and the knowledge of God! How unsearchable are his judgments, and his ways past tracing out!" (11:33). The pack has no Pauline anchor.
- `mercy` ← Romans 11:30-32, weight 0.6 — "For God has bound all to disobedience, that he might have mercy on all." (11:32). Pairs with the ch. 9 mercy extension.

**Lexicon candidates:**
- `gods-plan-for-israel`: "grafted in"; "olive tree romans 11".
- `remnant`: "remnant chosen by grace"; "seven thousand who have not bowed to baal".
- `gods-faithfulness`: "the gifts and calling of god are irrevocable".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:** Rom 11:11-25 → roster row 40 (`gentile-inclusion`) — display tag applied above; engine design stays with the row.
**Ceiling/subdivision marker:** HITS THE 8-TAG HARD CEILING (after the adds); subdivided in romans.md (11:1–10 / 11:11–24 / 11:25–32 / 11:33–36) → per-verse refinement pass (the yielded `mercy` is the first candidate to re-seat there).

## Romans 12
**Applied-tag deltas** (book doc: 6 → sweep: 7 — 6 KEEP, 1 ADD, 0 DROP):
- KEEP `surrender-to-god` — "present your bodies a living sacrifice, holy, acceptable to God, which is your spiritual service" (12:1).
- KEEP `remembered-transformed-not-conformed` — "Don’t be conformed to this world, but be transformed by the renewing of your mind" (12:2).
- KEEP `spiritual-gifts` — "having gifts differing according to the grace that was given to us" (12:6, with the 12:4–8 list).
- KEEP `loving-others` — "Let love be without hypocrisy." (12:9); "In love of the brothers be tenderly affectionate to one another" (12:10); the enemy fed and given drink (12:20).
- KEEP `harmony-with-others` — "Be of the same mind one toward another." (12:16); "If it is possible, as much as it is up to you, be at peace with all men." (12:18).
- KEEP `vengeance` — "Don’t seek revenge yourselves, beloved, but give place to God’s wrath. For it is written, 'Vengeance belongs to me; I will repay, says the Lord.'" (12:19, with 12:17, 20–21). NOTE: the book doc anchored this tag on 12:18 because no verifiable 12:19 quote was then available (its Decision 20); the pinned VPL now witnesses 12:19 verbatim, so the justification can upgrade to the tag's own source verse — the engine pack already anchors Rom 12:19-21 (Decisions D22).
- ADD `humble-exaltation` — sustained humility teaching: "not to think of yourself more highly than you ought to think; but to think reasonably" (12:3); "Don’t set your mind on high things, but associate with the humble. Don’t be wise in your own conceits." (12:16). The engine pack already anchors Romans 12:3; display tag aligns (Decisions D23).
- Considered, not added (all §11.6 thin/passing classes — Decisions D24): `prayer` (12:12 "continuing steadfastly in prayer" — one phrase in the command cascade); `comforting-others` (12:15 "Weep with those who weep." — single verse, already the pack's anchor); `hospitality` (12:13 — romans.md Decision 15's passing-phrase decline stands; the pack anchors 12:13 engine-side); `generosity` and `work-and-diligence` (12:8, 11, 13 — single phrases, both packs already anchor their verses).

**Anchor-extension candidates:**
- `loving-others` ← Romans 12:9-10, weight 0.7 — "Let love be without hypocrisy... In love of the brothers be tenderly affectionate to one another; in honor prefer one another" (12:9–10). The pack's only Romans anchor today is 13:8-10.

**Lexicon candidates:**
- `vengeance`: "heap coals of fire on his head"; "overcome evil with good".
- `humble-exaltation`: "do not think of yourself more highly than you ought"; "associate with the humble".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 7 tags (within ceiling); not subdivided.

## Romans 13
**Applied-tag deltas** (book doc: 4 → sweep: 4 — 4 KEEP, 0 ADD, 0 DROP):
- KEEP `loving-others` — "Owe no one anything, except to love one another; for he who loves his neighbor has fulfilled the law." (13:8); "Love therefore is the fulfillment of the law." (13:10).
- KEEP `the-ten-commandments` — four commandments quoted and summed: "'You shall not commit adultery,' 'You shall not murder,' 'You shall not steal,' 'You shall not covet,'... are all summed up in this saying, namely, 'You shall love your neighbor as yourself.'" (13:9).
- KEEP `walking-in-the-light` — "Let’s therefore throw off the deeds of darkness, and let’s put on the armor of light. Let’s walk properly, as in the day" (13:12–13).
- KEEP `governing-authorities` — "Let every soul be in subjection to the higher authorities, for there is no authority except from God" (13:1); "he is a servant of God to you for good" (13:4); taxes, customs, respect, honor (13:6–7).
- Considered, not added (Decisions D25): `stewardship-of-days` — "knowing the time, that it is already time for you to awaken out of sleep" (13:11) is eschatological urgency, not the pack's time-management register; declined as a tag, proposed below as a caveated anchor extension. `second-coming` — "salvation is now nearer to us than when we first believed" (13:11) and "the day is near" (13:12) carry imminence framing without a coming-of-Christ statement; thin, declined. `praying-for-leaders` — its pack anchors Rom 13:1-7 engine-side, but the chapter contains no prayer-for-rulers teaching (that is 1 Tim 2:1-2); a display tag here would misstate the chapter. `drunkenness` / `self-control` — 13:13-14 vice-list phrases; both packs already anchor their verses (13:13; 13:14); passing mentions. `conscience` — 13:5 single verse; romans.md Decision 20's decline stands.

**Anchor-extension candidates:**
- `walking-in-the-light` ← Romans 13:12-13, weight 0.7 — "let’s put on the armor of light. Let’s walk properly, as in the day" (13:12–13). No Romans anchor in the pack. Cross-note for curation: `remembered-full-armor-of-god`'s pack comment records Rom 13:12 ("armor of light") as its known one-shared-word lexical near-miss — watch that collision when this anchor lands.
- `the-ten-commandments` ← Romans 13:9, weight 0.6 — the four-commandment quotation summed in neighbor-love. The pack carries a single anchor today.
- `stewardship-of-days` ← Romans 13:11-12, weight 0.5 — "knowing the time, that it is already time for you to awaken out of sleep" (13:11). Caveat: eschatological-urgency register, not time management; curation decides whether the pack's knowing-the-time family admits it. (The pack's sitting Romans anchor is 12:11 — a diligence verse; flagged for the curator's read alongside this.)

**Lexicon candidates:**
- `governing-authorities`: "no authority except from god"; "should christians obey the government".
- `walking-in-the-light`: "armor of light"; "cast off the works of darkness".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 4 tags; subdivided in romans.md (13:1–7 / 13:8–14) → per-verse refinement pass.

## Romans 14
**Applied-tag deltas** (book doc: 7 → sweep: 7 — 7 KEEP, 0 ADD, 0 DROP):
- KEEP `disputable-matters` — the vocabulary's anchor chapter: "Now accept one who is weak in faith, but not for disputes over opinions." (14:1); "Let each man be fully assured in his own mind." (14:5).
- KEEP `judgment-seat-of-christ` — "For we will all stand before the judgment seat of Christ." (14:10); "So then each one of us will give account of himself to God." (14:12).
- KEEP `loving-others` — "Yet if because of food your brother is grieved, you walk no longer in love. Don’t destroy with your food him for whom Christ died." (14:15).
- KEEP `harmony-with-others` — "So then, let’s follow after things which make for peace, and things by which we may build one another up." (14:19).
- KEEP `doubt` — "But he who doubts is condemned if he eats, because it isn’t of faith; and whatever is not of faith is sin." (14:23, with 14:22). Jesse-ratified use (romans.md Decision 4); see the id note below.
- KEEP `conscience` — "Let each man be fully assured in his own mind." (14:5); the doubting eater condemned (14:22–23).
- KEEP `judging-others` — "Don’t let him who eats despise him who doesn’t eat. Don’t let him who doesn’t eat judge him who eats, for God has accepted him." (14:3, with 14:4, 10, 13).
- Considered, not added (Decisions D26): `kingdom-of-heaven` — "God’s Kingdom is not eating and drinking, but righteousness, peace, and joy in the Holy Spirit" (14:17) is one verse; thin single-verse. `pastoral-serious-illness` — 14:7–9 ("If therefore we live or die, we are the Lord’s") is already that pack's own 14:8 anchor; passage-level, not chapter substance. `worship` — 14:11's every-knee citation is a single quoted verse.

**Anchor-extension candidates:**
- `loving-others` ← Romans 14:15, weight 0.6 — "Don’t destroy with your food him for whom Christ died." The pack's only Romans anchor is 13:8-10.
- DELIBERATELY NONE for `doubt`: `doubt.yaml`'s comment records Romans 14's "doubtful things" as a held SENSE BOUNDARY (the known trap) — the engine pack deliberately excludes this chapter while the ratified display tag stands. Recorded as an id-ambiguity for the curator; this ledger honors the pack's boundary and proposes nothing (Decisions D26).

**Lexicon candidates:**
- `disputable-matters`: "is it a sin to eat meat"; "christian liberty"; "weaker brother".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 7 tags (within ceiling); subdivided in romans.md (14:1–12 / 14:13–23 / 14:24–26 doxology, WEB placement) → per-verse refinement pass.

## Romans 15
**Applied-tag deltas** (book doc: 6 → sweep: 7 — 6 KEEP, 1 ADD, 0 DROP):
- KEEP `harmony-with-others` — "grant you to be of the same mind with one another according to Christ Jesus, that with one accord you may with one mouth glorify the God and Father of our Lord Jesus Christ" (15:5–6); "Therefore accept one another, even as Christ also accepted you" (15:7).
- KEEP `hope-in-god` — "through perseverance and through encouragement of the Scriptures we might have hope" (15:4); "Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope" (15:13).
- KEEP `sharing-your-faith` — "from Jerusalem and around as far as to Illyricum, I have fully preached the Good News of Christ" (15:19); "making it my aim to preach the Good News, not where Christ was already named" (15:20).
- KEEP `generosity` — "the good pleasure of Macedonia and Achaia to make a certain contribution for the poor among the saints who are at Jerusalem" (15:26); material things owed for spiritual things shared (15:27).
- KEEP `prayer` — "that you strive together with me in your prayers to God for me" (15:30, with 15:31–32).
- KEEP `benediction` — the two spoken blessings: "Now may the God of hope fill you with all joy and peace in believing" (15:13) and "Now the God of peace be with you all. Amen." (15:33).
- ADD `gentile-inclusion` (adopted id, display-only; §11.3) — "that the Gentiles might glorify God for his mercy" (15:9), the four-quotation chain — "Rejoice, you Gentiles, with his people." (15:10); "in him the Gentiles will hope" (15:12) — and Paul's commission "that I should be a servant of Christ Jesus to the Gentiles" (15:16). Substantial presence. Engine-side: roster row 40 (Decisions D27).
- Considered, not added (Decisions D27): `signs-and-wonders` — "in the power of signs and wonders" (15:19) is a single phrase; `messianic-prophecy` — the root-of-Jesse citation (15:12) is one quoted verse; `god-of-all-comfort` — "the God of perseverance and of encouragement" (15:5) already sits as that pack's 15:4 anchor; single-passage; `supporting-gospel-workers` — "to be helped on my way there by you" (15:24) is one verse, proposed below as an anchor extension instead.

**Anchor-extension candidates:**
- `generosity` ← Romans 15:26-27, weight 0.65 — "a certain contribution for the poor among the saints" (15:26). The pack's Pauline anchor is 2 Corinthians only.
- `sharing-your-faith` ← Romans 15:20-21, weight 0.6 — "making it my aim to preach the Good News, not where Christ was already named" (15:20).
- `prayer` ← Romans 15:30-32, weight 0.6 — "strive together with me in your prayers to God for me" (15:30). Pairs with the 8:26-27 candidate; the pack has no Romans anchor.
- `supporting-gospel-workers` ← Romans 15:23-24, weight 0.55 — "I hope to see you on my journey, and to be helped on my way there by you" (15:24) — the send-me-forward support pattern.

**Lexicon candidates:**
- `harmony-with-others`: "accept one another as christ accepted you".
- `hope-in-god`: "the god of hope".
- `supporting-gospel-workers`: "supporting a missionary journey"; "help gospel workers on their way".

**New-concept candidates:** none. **Decline-overturn proposals:** none.
**Routes to corpus-blocked:** Rom 15:8-12, 16 → roster row 40 (`gentile-inclusion`) — display tag applied above; engine design stays with the row.
**Ceiling/subdivision marker:** 7 tags (within ceiling); subdivided in romans.md (15:1–13 / 15:14–22 / 15:23–33) → per-verse refinement pass.

## Romans 16
**Applied-tag deltas** (book doc: 2 → sweep: 3 — 2 KEEP, 1 ADD, 0 DROP):
- KEEP `benediction` — "The grace of our Lord Jesus Christ be with you." (16:20); "The grace of our Lord Jesus Christ be with you all! Amen." (16:24 — the WEB's final text verse; 16:25 is a textless line).
- KEEP `hospitality` — Phoebe: "that you receive her in the Lord in a way worthy of the saints, and that you assist her in whatever matter she may need from you" (16:1–2); Gaius, "my host and host of the whole assembly" (16:23).
- ADD `false-teachers` (adopted id, display-only) — the chapter's one teaching unit is a direct warning against deceivers: "look out for those who are causing the divisions and occasions of stumbling, contrary to the doctrine which you learned, and turn away from them" (16:17); "by their smooth and flattering speech they deceive the hearts of the innocent" (16:18). Substantial for this chapter (two full verses of warning in a greetings chapter, singled out by the book doc's own section structure, "Avoid Divisions") (Decisions D28).
- Considered, not added (Decisions D28–D29): `unity-of-the-church` — its lexicon carries "divisions in the church," but 16:17–18 teaches vigilance against division-causers rather than the one-body substance; the same two verses cannot honestly carry both tags, and `false-teachers` names the passage's actual subject (the persons and their deception). `resisting-the-devil` / `victory-in-christ` / `satan` — "the God of peace will quickly crush Satan under your feet" (16:20) is a single verse (motif #14 in romans.md already records its homes); proposed below as an anchor extension instead.

**Anchor-extension candidates:**
- `hospitality` ← Romans 16:1-2, weight 0.55 — "receive her in the Lord in a way worthy of the saints... assist her in whatever matter she may need" (16:2) — the commend-and-receive register; the pack's Romans anchor today is 12:13.
- `resisting-the-devil` ← Romans 16:20, weight 0.5 — "And the God of peace will quickly crush Satan under your feet." The pack has only two anchors and carries "satan" in its lexicon.

**Lexicon candidates:**
- `false-teachers` (for the eventual pack; adopted, no pack yet): "people causing divisions in church"; "smooth talk and flattery"; "watch out for those who cause divisions".

**New-concept candidates:** none. **Decline-overturn proposals:** none. **Routes to corpus-blocked:** none.
**Ceiling/subdivision marker:** 3 tags; subdivided in romans.md (16:1–16 / 16:17–20 / 16:21–24) → per-verse refinement pass.

---

# Decisions record — Romans sweep (every yield and judgment call; reversible defaults Jesse can overturn)

- **D1 (ch 1).** `idolatry` ADDED as the 8th tag, taking the chapter to the hard ceiling — permitted because every tag independently clears the presence bar (§11.6); the 1:21–25 exchange is the indictment's hinge, not a mention.
- **D2 (ch 2).** `circumcision-of-the-heart` applied as an adopted DISPLAY tag while the engine concept stays with corpus-blocked roster row 37 (which already records Rom 2:28-29 as its in-corpus keystone). Display application ≠ engine mint; no duplication.
- **D3 (ch 2).** `favoritism` NOT tagged (2:11 is a single verse) — anchor-extension candidate only.
- **D4 (ch 3).** `sacrifice-and-atonement` (adopted) NOT tagged: broad-duplicating-specific beside the sitting `the-cross` on the same verse (§11.6 class); engine-side it is roster row 1.
- **D5 (ch 4).** `covenant` NOT tagged (no covenant vocabulary; substance is the faith-crediting argument already tagged) — captured as a 0.5-weight anchor-extension candidate with the register caveat. `hope-in-god` (4:18) thin single-verse, not tagged.
- **D6 (ch 5).** `salvation` (5:9–10) not added — broad-duplicating beside justification/cross tags; `eternal-life` (5:21) single verse — its honest Romans home is ch. 6.
- **D7 (ch 6).** `surrender-to-god` ADDED — the pack's own Rom 6:13 anchor evidences the scope; repeated present-yourselves teaching clears the bar.
- **D8 (ch 6).** `eternal-life` (adopted) ADDED on 6:22–23 (the chapter's stated outcome, twice); engine-side question stays with `salvation.yaml`'s recorded standalone-pack note.
- **D9 (ch 7).** `freedom-in-christ` (adopted) ADDED on 7:1–6 — freed-from-the-law register natively; not a read-back.
- **D10 (ch 7).** `covetousness` ADDED, borderline: coveting is the chapter's case-study commandment (7:7–8), and the engine pack itself anchors Rom 7:7-8. Drop if the bar is read as "the chapter teaches about coveting" rather than "treats it substantially."
- **D11 (ch 7).** The book doc's "(Only one honest tag)" note is superseded: both adds were vocabulary-blocked at draft time (adoption 2026-08-25; the 161-rollout mints). No prior judgment is overturned.
- **D12 (ch 8).** Ceiling holds at 8; §11.6 forbids displacement of sitting tags that clear the bar. Barred candidates recorded in-block; `walking-by-the-spirit` is the strongest (its pack anchors Rom 8:13-14) and is first in line at the per-verse refinement pass.
- **D13 (ch 9).** `mercy` ADDED — the argument's own repeated vocabulary (9:15–16, 23); justification kept §4-neutral per the election pack's binding precedent.
- **D14 (ch 9).** `gentile-inclusion` ADDED (adopted, §11.3); `nations-and-peoples` NOT co-applied — no origin-of-nations register in the chapter (the both-tags ruling requires each tag to clear the bar individually).
- **D15 (ch 9).** `remnant` NOT tagged on ch. 9 (quoted-prophecy material, thin) — anchor-extension candidate 9:27-29 instead; the taught remnant is tagged on ch. 11.
- **D16 (ch 10).** `zeal-for-god` NOT tagged; 10:2 routed to roster row 36, whose own caution note cites this verse as the wrong register.
- **D17 (ch 10).** `gentile-inclusion` NOT tagged on ch. 10 — genuine but subordinate (theme-witness-with-caveat class); carried on chs. 9, 11, 15 where taught.
- **D18 (ch 11).** `remnant` ADDED — pack anchors Rom 11:4-5; strongest presence in the letter.
- **D19 (ch 11).** `gentile-inclusion` ADDED — the ingrafting is the theme itself; engine-side stays roster row 40.
- **D20 (ch 11).** `mercy` YIELDS at the ceiling (ninth candidate; §11.6 theme-witness class beside the chapter's main themes) — NOT a silent drop: recorded here, captured as the Rom 11:30-32 anchor-extension candidate, and first to re-seat at per-verse refinement.
- **D21 (ch 11).** `humble-exaltation` declined on ch. 11 — 11:18–20 is a no-boasting warning, not the God-exalts-the-humble register (presence decline, independent of the ceiling).
- **D22 (ch 12).** `vengeance` justification upgrade noted: the pinned VPL now witnesses 12:19 verbatim, so the tag can anchor on its own source verse instead of the 12:18 stand-in the book doc used under its anchor rule. Book-doc edit deferred to the refinement pass (this ledger edits no book doc).
- **D23 (ch 12).** `humble-exaltation` ADDED on ch. 12 — sustained teaching at 12:3 and 12:16; pack anchors Rom 12:3.
- **D24 (ch 12).** Thin declines: `prayer` (12:12), `comforting-others` (12:15), `hospitality` (12:13 — romans.md Decision 15 stands), `generosity`, `work-and-diligence` — all single phrases/verses already anchored engine-side where relevant.
- **D25 (ch 13).** Declines: `stewardship-of-days` (register mismatch — caveated extension only), `second-coming` (imminence framing without the coming-of-Christ statement), `praying-for-leaders` (no prayer teaching in the chapter despite the pack's 13:1-7 anchor), `drunkenness`/`self-control` (vice-list phrases, already pack anchors), `conscience` (13:5, prior decline stands).
- **D26 (ch 14).** Declines: `kingdom-of-heaven` (14:17), `pastoral-serious-illness` (14:7–9), `worship` (14:11) — all thin. `doubt` id-ambiguity recorded: the ratified display tag stands while `doubt.yaml` holds Romans 14 as a deliberate sense boundary — no anchor extension proposed; flagged for the curator.
- **D27 (ch 15).** `gentile-inclusion` ADDED (15:8–12, 16). Declines: `signs-and-wonders`, `messianic-prophecy`, `god-of-all-comfort` (single phrases/verses; the last already anchors 15:4), `supporting-gospel-workers` (tag declined, extension proposed).
- **D28 (ch 16).** `false-teachers` (adopted) ADDED on 16:17–18 — the chapter's one teaching unit. `unity-of-the-church` declined for the same two verses: the passage teaches vigilance against division-causers, not one-body substance; one honest tag, not two, on two verses.
- **D29 (ch 16).** `resisting-the-devil`/`victory-in-christ`/`satan` declined on 16:20 (single verse; motif #14's homes recorded) — `resisting-the-devil` captured as an anchor-extension candidate.
- **D30 (id hygiene, per the coordinator's mid-sweep caution).** The scratchpad inventory's prefix-stripped pastoral ids were NOT trusted: every id in this ledger was validated verbatim against `engine-ids.txt` + the adopted list (and the five adopted ids re-checked against `tag-apply/adopted-concepts.md`, which now exists). The three pastoral ids used (`pastoral-freedom-from-bondage`, `pastoral-relapse-and-restoration`, `pastoral-serious-illness`) are the full engine spellings; a mechanical comm(1) check found zero out-of-vocabulary ids. No correction block needed.
- **D31 (scope).** This ledger is research/display-layer only: no repo change, no pack edit, no fixture, no book-doc edit. All engine-side candidates go through fixtures-first gauntlet batches per plan §3.3; NO MEASURABLE EFFECT still means don't merge.

## Sweep totals

- Chapters swept: 16/16. Tag deltas: **13 ADD** (ch1 `idolatry`; ch2 `circumcision-of-the-heart`; ch6 `surrender-to-god`, `eternal-life`; ch7 `freedom-in-christ`, `covetousness`; ch9 `mercy`, `gentile-inclusion`; ch11 `remnant`, `gentile-inclusion`; ch12 `humble-exaltation`; ch15 `gentile-inclusion`; ch16 `false-teachers`) · **83 KEEP** · **0 DROP** · **1 recorded YIELD** (`mercy`, ch11).
- Anchor-extension candidates: **31** (chs 1–16 as listed). Lexicon candidates: **26 phrasings across 20 concept rows**. New-concept candidates: **0** (Romans' themes are densely covered by the 303-id union). Decline-overturn proposals: **0**.
- Routes to corpus-blocked roster: rows 37 (`circumcision-of-the-heart`, Rom 2:25-29), 8 (`gods-holy-name`, Rom 2:24), 1 (`sacrifice-and-atonement`, Rom 3:25), 24 (`mediator`, Rom 8:34), 21 (`gods-surprising-choice`, Rom 9:11-13), 40 (`gentile-inclusion`, Rom 9/11/15), 36 (`zeal-for-god`, Rom 10:2), plus backlog flagged item #2 (`election-and-predestination`, Rom 9:6-24).
- Ceiling-marked: chs **1, 8, 11** (at the 8-tag hard ceiling). Subdivision-marked (subdivided in romans.md): chs **1, 3, 5, 8, 11, 13, 14, 15, 16**. Union for the per-verse refinement pass: 1, 3, 5, 8, 11, 13, 14, 15, 16.

## Survival audit (CONVENTIONS §9) — 2026-08-26, at delivery

Every write to this ledger was an atomic end-of-file append; after each append the pre-append byte range was re-hashed (sha256 of `head -c <prev_size>`) and matched the prior whole-file digest — all 10 appends verified "prior bytes intact" at write time. Final re-audit at delivery: the header block, all 16 chapter blocks (`## Romans 1`–`## Romans 16`), and the Decisions record are each present exactly once in the live file; three spot quotes re-verified byte-identical against the pinned sha256-verified VPL. No other file under /mnt/project-files was written by this sweep. File digest before this audit block: 7239bb218b59cab4f8e8dc75b37e27877c444d4ddbbbb11dff60c394811ac99c (60,704 bytes).

---

## Erratum — fresh-critic pass (2026-08-26; one atomic end-of-file append per CONVENTIONS §9)

A fresh critic verified quotes, ids, deltas, caps, neutrality, and the survival-audit digest clean, and sustained six objections plus four minor flags. All ten are corrected in this single appended block; no line above it was rewritten. Every cited source was re-read for this erratum at repo SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e; scripture wording is byte-exact from the pinned VPL.

### Sustained objections

**E1 — anchor-extension total (Sweep totals line).** The totals line's "31" is wrong. Mechanical recount, re-run for this erratum: candidate bullets per chapter are 1, 1, 3, 5, 1, 2, 1, 4, 2, 2, 3, 1, 3, 1, 4, 2 = **36 candidates across 30 unique concept ids** as originally listed (the ch 9 "Deliberately NOT proposed" and ch 14 "DELIBERATELY NONE" bullets are routing/boundary notes, not candidates, and were not counted). Post-erratum figure in the corrected-totals line below.

**E2 — lexicon totals (Sweep totals line).** "26 phrasings across 20 concept rows" is wrong. Mechanical recount, re-run for this erratum: **82 quoted phrasings across 38 concept rows (32 unique ids)** as originally listed. Post-erratum figure below.

**E3 — D24's generosity premise (ch 12).** D24 grouped `generosity` with `work-and-diligence` as packs that "already anchor their verses." Half of that is real: `work-and-diligence.yaml` does anchor Romans 12:11 (editorial, weight 0.8; its comment: ""not lagging in diligence, fervent in spirit, serving the Lord" — the book's 12:11-13 lead trimmed to the diligence verse (vv12-13 turn to hope, prayer, and hospitality)") — verified, and that half of D24 stands. But `generosity.yaml`'s anchors are 2 Corinthians 9:7, Acts 20:35, Proverbs 11:25, Luke 6:38, Matthew 5:42, and Psalms 37:21 — **zero Romans anchors**; the claim that its pack "already anchors" Rom 12:8/13 is wrong. The display-tag decline stands on its own ground (12:8 and 12:13 are single phrases in the command cascade; the presence bar never depended on the pack's anchor inventory). The no-extension disposition DOES change now that the premise is wrong — see D33 below.

**E4 — ch 6 `identity-in-christ` candidate rationale.** "Pack anchors only Galatians/Ephesians today" is wrong. `identity-in-christ.yaml` anchors Psalms 139:13-14 (1.0), Ephesians 2:10 (0.95), 1 Samuel 16:7 (0.85), 1 Peter 2:9 (0.8), Galatians 2:20 (0.75), and Ephesians 1:3 (0.7). Corrected rationale: the pack's anchors span Psalms, 1 Samuel, 1 Peter, Galatians, and Ephesians — and include **no Romans anchor**, which is the fact the candidate actually needs. The Rom 6:11 extension candidate itself stands unchanged.

**E5 / D32 (Decisions-class) — ch 2 `favoritism` ← Rom 2:11 candidate WITHDRAWN.** The candidate re-litigated the pack's own recorded boundary. `favoritism.yaml`'s header, verbatim (comment markers and line breaks normalized): "BOUNDARIES: Rom 2:11 ("there is no partiality with God") sits inside divine-judgment's Rom 2:5-11 span and is NOT re-anchored — Eph 6:9 and Col 3:25 carry the same witness free and clear." Its Eph 6:9 anchor comment repeats the claim: "(Rom 2:11 stays divine-judgment's)". This sweep offered no new textual evidence, and the sweep rules bar silent reversals of recorded declines and boundaries — the candidate is withdrawn. The rest of D3 stands (no display tag; single verse); the ch 2 favoritism lexicon row stands (query phrasings, not an anchor claim). Reversal path unchanged: new textual evidence, cited, through the pack's curator.

**E6 / D34 (Decisions-class) — ch 7 `freedom-in-christ` lexicon row RE-ROUTED.** The row's "(for the eventual pack; adopted, no pack yet)" contradicts a recorded engine-side resolution. `pastoral-freedom-from-bondage.yaml`'s lexicon comment (TAG-GAP ROLLOUT batch 5, Theme I, 2026-08-26) records, verbatim: "the review's freedom-in-christ row resolved as a LEXICON EXTENSION here", and: "The row's addiction-vs-doctrine two-register question is resolved engine-side as ONE pack carrying both registers (reversible at the re-pin, when Gal 2:4 and 4:22-31 become assertable and a split could stand on its own texts)." That recorded resolution is acknowledged and honored: the three phrasings — "dead to the law"; "set free from the law"; "newness of the spirit" — are re-addressed as lexicon-extension candidates for **`pastoral-freedom-from-bondage`** (whose anchors already include Romans 7:6 — its own comment: "discharged from the law, serving in newness of the spirit" — and Romans 7:24-25, so the phrasings land on sitting Romans 7 anchors). The `freedom-in-christ` DISPLAY tag on ch 7 (D9) is unaffected — display vocabulary and engine lexicon routing are separate layers, the same display/engine distinction the pack comment itself records. Collision check at e762d1c: none of the three phrasings appears in any pack lexicon.

### Minor flags

**F-a — spliced quotation (ch 9 "Deliberately NOT proposed" bullet, line 218).** One fused wording was attributed to two sources. The actual wordings, each quoted separately:
- `election-and-predestination.yaml` pack comment: "Rom 9:6-24 — the row's largest requested text — is corpus-blocked (Romans 9 absent) and DELIBERATELY NOT ridden as an anchor in this batch: the potter texts should enter with their whole argument assertable, not as a detached proof-text (recorded for the re-pin curator)."
- `engine-pack-backlog.md`, flagged item #2: "Rom 9:6-24 DELIBERATELY NOT RIDDEN (potter texts enter only with the whole argument assertable — for the re-pin curator)."
The bullet's substance (routed, not duplicated) is unchanged; the fused quote is retired.

**F-b — sibling-span collision note for ch 8 `holy-spirit` ← Rom 8:9-16 (appended to that candidate).** `walking-by-the-spirit.yaml` anchors Romans 8:13-14 (weight 0.9) inside the proposed span, and its header records the adjacent claims verbatim: "Rom 8:16 is assurance-of-salvation's and 8:17 suffering-for-christ's — this pack stops at 8:13-14." (`assurance-of-salvation.yaml`'s Romans 8:16 anchor verified present.) The 8:9-16 candidate therefore overlaps two sibling packs' recorded verse claims (8:13-14 walking-by-the-spirit's, 8:16 assurance-of-salvation's). Curation options in the repo's own precedent: trim the proposed span to 8:9-11 (collision-free) or record a deliberate overlap in all three files (the Eph 6:9 dual-note pattern). Noted; the candidate is otherwise unchanged.

**F-c — the four single-phrasing lexicon rows vs the plan's 2-3 phrasing guideline.**
- ch 6 `salvation`: one phrasing suffices — recorded, with the evidence. The realistic companions to "the free gift of god is eternal life" (6:23) are already owned: `sin.yaml` carries "the wages of sin" verbatim in its lexicon (and anchors Romans 6:23 at weight 1.0), and `salvation.yaml` itself already carries bare "eternal life". A second phrasing would either collide or duplicate.
- ch 11 `gods-faithfulness`: ADD "the gifts and calling of god are without repentance" — the KJV remembered phrasing of 11:29 (WEB: "For the gifts and the calling of God are irrevocable.") that older-translation searchers type. Curation caveat: shares the single token "repentance" with the `repentance` pack (multi-word entry, no shared phrase) — weigh at admission.
- ch 15 `harmony-with-others`: ADD "welcome one another as christ welcomed you" — the NIV/ESV remembered phrasing of 15:7 (WEB: "Therefore accept one another, even as Christ also accepted you"). No collision at e762d1c.
- ch 15 `hope-in-god`: ADD "abound in hope" — WEB 15:13 verbatim ("that you may abound in hope in the power of the Holy Spirit"). No collision at e762d1c.

**F-d / D35 (Decisions-class; reversible) — `humble-exaltation` register asymmetry recorded as one explicit judgment call.** The sweep declined the id on ch 11 (D21: "don't boast over the branches", 11:18; "Don't be conceited, but fear", 11:20 — read as a no-boasting warning, not the God-exalts-the-humble register) and added it on ch 12 (D23: 12:3 with 12:16 — humility-conduct verses). These are two applications of ONE register reading, recorded here as such: the pack covers humility-conduct grounded in God's exalting — evidenced by its own Romans anchor, `humble-exaltation.yaml`'s Romans 12:3 (editorial, weight 0.8; comment: ""not to think of yourself more highly than you ought" — the book lists it under both Faith and Humility; its context (sober self-assessment) makes this the honest home") — and does not cover pride-warnings generally. The asymmetry is a register call, not a mechanical one. Reversible: if the curator reads the register more broadly, ch 11 re-enters at the per-verse refinement pass, where it would still face the ch 11 hard ceiling alongside the yielded `mercy` (D20).

### Late candidate

**D33 (Decisions-class; consequence of E3) — `generosity` ← Romans 12:8, weight 0.55 (late anchor-extension candidate).** WEB, byte-exact from the pinned VPL: "he who gives, let him do it with generosity" (12:8 — the verse closes "he who shows mercy, with cheerfulness", the pack's own giver's-heart/cheerfulness frame). Assessed honestly against the bar: as a display tag, 12:8 remains a passing phrase in the command cascade — the decline stands (E3); as a single-verse anchor-only extension it follows the ledger's own pattern (`gods-faithfulness` ← 11:29; `the-ten-commandments` ← 13:9) and gives a pack with zero Romans anchors a Romans witness. Romans 12:13 was considered for the range and left out: "contributing to the needs of the saints, and given to hospitality." (12:13) is `hospitality.yaml`'s sitting in-corpus anchor, and a clause-level dual claim on a sibling pack's verse is the curator's call (Eph 6:9 dual-note precedent), not a sweep's — cross-noted for curation, not proposed. Pairs with the ch 15 candidate (`generosity` ← 15:26-27).

### Corrected totals (fresh-critic pass, 2026-08-26 — supersede the corresponding "Sweep totals" figures)

- Tag deltas: **13 ADD · 83 KEEP · 0 DROP · 1 recorded YIELD** — unchanged.
- Anchor-extension candidates: **36 across 29 unique concept ids** — per-chapter 1, 0, 3, 5, 1, 2, 1, 4, 2, 2, 3, 2, 3, 1, 4, 2 after the D32 withdrawal (ch 2: 1→0) and the D33 addition (ch 12: 1→2); unique ids 30 → 29 (`favoritism` leaves the list; `generosity` was already counted via ch 15).
- Lexicon candidates: **85 quoted phrasings across 38 concept rows (31 unique target ids)** — the recounted 82 (E2) plus the three phrasings added under F-c (ch 6 `salvation` recorded as sufficient at one); row count unchanged at 38 (the ch 7 row persists, re-addressed per D34); unique target ids 32 → 31 (`freedom-in-christ` is no longer a lexicon target; its display tag stands).
- New-concept candidates: **0**. Decline-overturn proposals: **0**. Routes to corpus-blocked: unchanged.

### §9 verification (this append)

Pre-append state of this file: 61,470 bytes, sha256 1133435b7468ffadffd51d92f333700f6c9a41c0b05dbf88574c3298c887de56. This erratum was written as ONE atomic end-of-file append; post-write, the first 61,470 bytes re-hash to that same digest (prior bytes intact) and this block is present exactly once. No other file was written.
