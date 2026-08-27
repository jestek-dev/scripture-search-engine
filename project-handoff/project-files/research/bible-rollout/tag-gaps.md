# Bible rollout — shared tag-gap log

Candidate concepts for future engine packs, collected across the book threads of the
full-Bible chapter-summaries rollout. A row here records that a theme is genuinely
present in Scripture, useful to a search user, and absent from the current concept
vocabulary (`ontology/concepts/*.yaml`). **Logging a gap does NOT create a concept**
— per the repo's data rules, a concept pack needs a golden fixture first and a
gauntlet run showing measurable effect; `NO MEASURABLE EFFECT` means don't merge.

Append rules (binding, from `CONVENTIONS.md` §9):

- APPEND rows only; never edit or delete another book's rows.
- Before adding a row, check this table AND the current vocabulary. If the theme is
  already listed, append your book's refs to that row's **Where encountered** column
  (and leave the rest of the row alone) instead of adding a new row.
- Log only real gaps — not every motif. Motif candidates that do have a vocabulary
  home belong in your book doc, not here.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `temptation` | Gen 3:1–6; 4:7; 39:7–12; Jas 1:2, 12–15 | "Temptation" is a plain, heavy lay query with no plain concept to land on — Gen 3:1–6 is Scripture's first temptation narrative, 4:7 its first warning. The vocabulary carries only the response side (`resisting-the-devil`, `remembered-a-way-of-escape`), and the extension candidate (`temptation-and-the-fall` → `remembered-a-way-of-escape` lexicon) was deferred in PR #41, so the gap is still open. | Genesis / 2026-08-23 |
| `mortality` (or `death`) | Gen 5:5–31 ("then he died," eight times); 3:19; Jas 1:10–11; 4:14 | Mortality itself — "why do we die," "death in the Bible" — is distinct from mourning a loss; `pastoral-grief-and-loss` covers the griever, not mortality. Overlaps `death-and-burial` below; decide one concept or two before minting. | Genesis / 2026-08-23 |
| `death-and-burial` | Gen 47:29–31; 49:29–32; 50:1–14; 50:24–26; also 23; 25:7–10 | Burial charges, the family grave, dying well — "funerals in the Bible" is a real pastoral-practice query; `pastoral-grief-and-loss` covers the griever, not the practice or the dying person's charge. See overlap note on `mortality` above. | Genesis / 2026-08-23 |
| `vengeance` | Gen 27:41–45; 34:25–31; 4:23–24 (Lamech); Obad 1:15; Nah 1:2–3; Rom 12:17–21; Rev 6:9–11; 18:20; 19:2 | "Revenge in the Bible" is a common lay search with no home. Genesis narrates revenge condemned in-text (34:30; 49:5–7) — the gist would need careful wording so it routes to what Scripture says about vengeance, not endorsement. | Genesis / 2026-08-23 |
| `angels` | Gen 19:1–22; 28:12; 32:1–2; also 16:7–11; 22:11; 2 Peter 2:4, 11; Col 2:18; Jude 1:6, 9; Zech 1:9–14; 2:3–4; 3:1–7; 4:1–6; 5:5–11; 6:4–5; Rev 5:11–12; 7:1–3, 11; 8:2–5; 10:1–6; 12:7–9; 14:6–20; 22:8–9 | Heavily searched topic; multiple distinct angelic scenes in Genesis alone, none currently taggable — no angel concept anywhere in the vocabulary. | Genesis / 2026-08-23 |
| `sojourners-and-strangers` | Gen 23:4 ("I am a stranger and a foreigner living with you"); 26:3; 28:4; 47:9; Heb 11:13–16; 13:14 | Living as a foreigner recurs across the patriarchal narratives and matters to displaced readers. | Genesis / 2026-08-23 |
| `oaths-and-vows` | Gen 47:29–31; 50:5–6; 50:25; also 21:22–34; 24:2–9; 26:28–31; 28:20–22; Jas 5:12 | "Swearing an oath," "making a vow to God" — binding the future before God is a recurring biblical practice with no concept. | Genesis / 2026-08-23 |
| `leadership` | Gen 41:33–57; 47:13–26; 39:4–6, 22–23; 3 John 1:9–10 | "Biblical leadership" queries; wise administration under God. `wisdom-from-god` covers the gift, not leadership queries — could alternatively be a lexicon extension of `wisdom-from-god`; check that route before minting a new id. | Genesis / 2026-08-23 |
| `day-of-the-lord` | Obad 1:15–16; Joel 1:15; 2:1–11, 31; 3:14; Amos 5:18–20; 8:9–10; Hag 2:6–7, 21–23; Mal 3:2; 4:1–3; 4:5; Zeph 1:7, 14–18; 2:2–3; Zech 14:1–21 ("Behold, a day of the LORD comes," 14:1); 12:3–9 | "The day of the LORD" is a named, load-bearing prophetic theme ("the day of the LORD is near all the nations!", 1:15) and a common lay query ("what is the day of the Lord"), with no vocabulary home: `divine-judgment` is broader and never surfaces the phrase, and `second-coming` is the NT event, a later-revelation read-back for these texts. Recurs across the Twelve (Joel, Amos 5, Zeph 1, Mal 4). | Obadiah / 2026-08-23 |
| `betrayal` | Obad 1:7 ("Friends who eat your bread lay a snare under you"); 1:10–14 | "Betrayed by family" / "betrayed by a friend" are heavy pastoral queries with no home: `pastoral-betrayal-and-marriage-crisis` is marriage-specific, `family-reconciliation` covers reconciliation (tagging a betrayal chapter with it is the Genesis-3 trap), `envy-and-jealousy` is a different substance. Obadiah gives both sides in one chapter — brother Esau's violence and gloating against "your brother Jacob," and Edom itself betrayed by its own allies. | Obadiah / 2026-08-23 |
| `restoration-of-israel` | Obad 1:17–21; Zech 1:16–17; 8:1–8; 9:12; 10:6–10 | "Restoration of Israel" / "will God restore Israel" queries have no home: the existing `restoration` concept is the personal renewal-prayer register ("restore my soul," Ps 23:3 anchor; its pack marks itself deliberately distinct from other registers), not national restoration. Obadiah's whole second movement is exactly this — escape and holiness on Mount Zion, "The house of Jacob will possess their possessions" (1:17). Recurs across the Twelve (Hos 14; Joel 3; Amos 9:11–15; Mic 7:8–20; Zeph 3:14–20). | Obadiah / 2026-08-23 |
| `gloating-over-downfall` | Obad 1:12–13 | "Is it wrong to celebrate someone's downfall" / "rejoicing when an enemy falls" is a real conscience query; Obad 1:12 ("don't rejoice over the children of Judah in the day of their destruction") is, with Prov 24:17, its most direct text, and no concept covers it. BORDERLINE row — reviewer may fold this into a broader betrayal/vengeance treatment rather than mint an id. | Obadiah / 2026-08-23 |
| `false-teachers` | 2 John 1:7–11; 2 Peter 2:1–22, 3:16–17; Col 2:4, 8, 16–23; Gal 1:6–9; 4:17; 5:7–12; 6:12–13; 2 Cor 2:17; 11:3–4, 13–15; 1 John 2:18–26; 4:1–6; Jude 1:4, 8–19; Rev 2:14–15, 20–24; 13:11–15; 16:13; 18:23; 19:20 | Deceivers who deny that Jesus Christ came in the flesh, and the command not to receive or sponsor them, have no vocabulary home — "false teachers in the Bible", "supporting false teaching" are real lay queries with nowhere to land. The theme recurs across the catholic epistles (1 John, Jude, 2 Peter); sibling threads should append their refs to this row rather than mint a duplicate. | 2 John / 2026-08-23 |
| `outpouring-of-the-spirit` | Joel 2:28–29; Zech 4:6; 12:10 (OT Spirit register, not the Joel outpouring scene itself — see the Zechariah block caveat) | "God pours out his Spirit" / "Holy Spirit poured out on all flesh" / "sons and daughters will prophesy": the vocabulary's Spirit concepts — `holy-spirit-the-comforter` (Johannine Comforter register), `spiritual-gifts` (1 Cor gifts register), `remembered-fruit-of-the-spirit` (Gal 5 verse-memory register) — all carry NT-church registers, and `dreams-and-visions` anchors Joel 2:28 only for its dreams register — so the outpoured-Spirit promise itself, among the most-preached texts in the Twelve via Acts 2, has no concept. | Joel / 2026-08-23 |
| `fasting` | Joel 1:14; 2:12, 15; Zech 7:3–6; 8:19 | "Fasting in the Bible" / "biblical fasting" is a common practice query (Lent, corporate fasts); `repentance` covers the turning of the heart, not the practice, and no id names fasting anywhere in the vocabulary. | Joel / 2026-08-23 |
| `lament` | Joel 1:8–14; 2:17; Hab 1:2–4; 1:12–17; Zech 12:10–14 (penitential mourning over the pierced one, not disaster lament — see the Zechariah block caveat) | "Lament in the Bible" / "how to lament" is a growing lay and pastoral query (whole books — Lamentations, many Psalms — will hit this gap); `pastoral-grief-and-loss` serves the bereaved person, not the biblical practice of communal lament over calamity and sin. | Joel / 2026-08-23 |
| `governing-authorities` | Rom 13:1–7 | "What does the Bible say about government," "obeying the law," "should Christians pay taxes" are heavy lay queries with no concept home: `praying-for-leaders` covers only the prayer response, not the subjection/authority teaching Rom 13 (and 1 Pet 2) actually gives. | Romans / 2026-08-23 |
| `conscience` | Rom 2:14–15; 13:5; 14:22–23 | "Conscience in the Bible," "acting against your conscience," "is it a sin if I'm not sure" — conscience is load-bearing in three Romans chapters and a common pastoral query; `disputable-matters` covers the gray-area dispute, not conscience itself, and `doubt`'s gist is unbelief-shaped. | Romans / 2026-08-23 |
| `election-and-predestination` | Rom 8:29–30; 9:6–24; 11:5–7, 28–29; Eph 1:4–5, 11 | "Predestination," "election," "does God choose who is saved" are among the most-asked doctrine queries and have no concept; `providence` ("god is in control") is the nearest neighbor but its lexicon won't catch predestination/election phrasing. Gist would need §4-neutral wording (DOCTRINAL-BASIS rules election disputes out as admission criteria) — route to what the text says, adjudicating nothing. | Romans / 2026-08-23 |
| `adoption-as-gods-children` | Rom 8:15–17, 23; 9:4; Eph 1:5; Gal 3:26; 4:4–7 | "Adopted by God," "adoption in the Bible," "children of God" — the adoption metaphor (also Gal 4, Eph 1) is distinct from generic `identity-in-christ` ("self worth; gods workmanship") and is what adoption-motivated searchers (including adoptive parents) actually type. Could alternatively be a lexicon extension of `identity-in-christ`; check that route before minting. | Romans / 2026-08-23 |
| `gods-plan-for-israel` | Rom 9:1–5; 10:1; 11:1–2, 11–32 | "Has God rejected Israel," "will Israel be saved," "Israel and the church" — three full chapters of Romans answer this and users ask it constantly (often around current events); no concept comes near it (`nations-and-peoples` is the Gen-10 origin-of-nations concept). Gist wording must stay descriptive of Rom 11's own claims, not adjudicate eschatology (millennial views are a §4 non-criterion). | Romans / 2026-08-23 |
| `judging-others` | Rom 2:1–3; 14:3–4, 10–13; Jas 4:11–12; 2:12–13; 5:9 | "Judge not," "judging others," "who am I to judge" — one of the most-typed Bible queries; `disputable-matters` covers gray-area liberty but not the judge-not command itself (Rom 2 and 14, Matt 7:1, Jas 4:11–12 would anchor it). | Romans / 2026-08-23 |
| `supporting-gospel-workers` | 3 John 1:5–8 | "Supporting missionaries" / "sending out workers" is a real congregational query, and its home text is exactly here — workers who took nothing from outsiders, supported by the church so that helpers become "fellow workers for the truth." `hospitality` and `generosity` cover parts of it; check a lexicon-extension route on those two before minting a new id. | 3 John / 2026-08-23 |
| `walking-in-truth` | 3 John 1:3–4 ("even as you walk in truth"; "my children walking in truth"; also 1:3 "testified about your truth") | The phrase occurs three times in four verses and is the letter's stated greatest joy; "walking in truth" / "what does walk in truth mean" are common lay phrasings with no vocabulary home — `walking-in-the-light` is the 1 John 1:7 light concept, and `obedience-to-the-word` and `honesty` are adjacent at best. Check a lexicon-extension route via `walking-in-the-light` / `obedience-to-the-word` before minting a new id. | 3 John / 2026-08-23 |
| `false-prophets` | Mic 2:6–11; 3:5–7, 11; Zech 10:2; 13:2–6 | "False prophets" / "false teachers in the Bible" are heavy lay queries with no vocabulary home. Micah gives the classic profiles — prophets who cry "Peace!" for whoever feeds them and preach for money — and models the contrast (3:8). `self-deception` covers the hearers' side, not the prophet-for-hire theme itself. | Micah / 2026-08-23 |
| `justice-and-oppression` | Mic 2:1–2, 8–9; 3:1–3, 9–11; 6:10–12; 7:3; Nah 2:11–13; 3:1, 4, 19; Amos 2:6–7; 4:1; 5:7, 10–15, 24; 8:4–6; Mal 2:17; 3:5; Zeph 3:1, 19; Jas 2:6–7; 5:1–6; Zech 7:9–10; 8:16–17; 9:8; 10:2; 11:4–6 | "Justice in the Bible" / "oppression of the poor" / "corrupt leaders" are common topical queries. `pastoral-refuge-and-justice` is deliberately the personal abuse-crisis register, not the civic/economic-justice topic; nothing serves it. Micah's land-seizure, bribed courts, and rigged scales are the OT core of the theme. | Micah / 2026-08-23 |
| `peace-among-nations` | Mic 4:1–4 | "Swords into plowshares" and "what does the Bible say about war/world peace" have no home: `peace-of-god` is the inner-peace/anxiety register (Phil 4:6–7), so the Bible's best-known peace-between-nations text is unreachable as a concept. Isa 2:2–4 is the parallel; Joel 3:10 is the deliberate inversion. | Micah / 2026-08-23 |
| `idolatry` | Mic 1:7; 5:12–14; Hos 4:12–19; 8:4–6; 10:5–6; 13:2; 14:3, 8; Hab 2:18–19; Mal 2:11; Zeph 1:4–6; 1 John 5:21; Zech 10:2; 13:2; Rev 9:20; 13:4, 8, 12–15; 21:8; 22:15 | "Idolatry" / "idols in the Bible" is a heavy topical query with no concept anywhere in the 131-id vocabulary (`worship` covers the positive side only). Micah has Samaria's smashed idols and the end-times purge of images, Asherah poles, and sorceries. | Micah / 2026-08-23 |
| `remnant` | Mic 2:12; 4:6–7; 5:7–8; 7:18; Hag 1:12, 14; 2:2; Mal 3:16–18; Zeph 2:7, 9; 3:12–13; Zech 8:6, 11–12; 9:7; 13:8–9; 14:16 | "What is the remnant in the Bible" is a real study query; the remnant is the load-bearing hope word of the prophets (gathered flock, lame made strong, dew and lion, pardoned heritage) and no concept carries it. | Micah / 2026-08-23 |
| `legalism` | Col 2:16–23 | "Legalism in the Bible," "do Christians have to follow rules," man-made religion — "Don't handle, nor taste, nor touch." `grace-not-earned` is saved-by-works-shaped (Eph 2) and `disputable-matters` covers the judging side; neither catches plain legalism queries. Could alternatively extend `grace-not-earned`'s lexicon — check that route before minting. | Colossians / 2026-08-23 |
| `bondservants-and-masters` | Col 3:22–4:1; 3:11; Eph 6:5–9 | "What does the Bible say about slavery" is a common, weighty query with no concept anywhere in the vocabulary. Gist wording needs the same care as the Genesis `vengeance` row — it must route to what the text actually says (reciprocal duties, work as for the Lord, an impartial "Master in heaven"), never read as endorsement. | Colossians / 2026-08-23 |
| `supremacy-of-christ` | Col 1:15–20; 2:10 | "Firstborn of all creation," "supremacy of Christ," "Christ holds all things together" — `deity-of-christ` serves is-Jesus-God queries but its lexicon carries none of the supremacy/preeminence-over-creation-and-powers phrasing. Likely better as a lexicon extension of `deity-of-christ` than a new id — check the extension route before minting. | Colossians / 2026-08-23 |
| `running-from-god` | Jonah 1:3 ("to flee to Tarshish from the presence of the LORD"); 1:10; 4:2 | "Running from God," "you can't outrun God," "fleeing God's calling" are common lay queries with no home: `surrender-to-god` is the consecration register ("all to Jesus I surrender," Rom 12:1 anchor), `obedience-to-the-word` the hearing-and-doing register, and `the-lords-discipline` covers God's corrective response, not the flight itself. Jonah 1 is Scripture's defining flight-from-the-call narrative; kin texts (Ps 139:7–10; Gen 3:8) would anchor it beyond Jonah. | Jonah / 2026-08-23 |
| `gods-compassion-for-outsiders` | Jonah 3:10; 4:2, 4:10–11 ("Shouldn't I be concerned for Nineveh, that great city...?"); 1:14–16 | "Does God love people outside the church," "does God care about my enemies," "God's mercy on other nations" have no honest home: `nations-and-peoples` is the origin/spread/purpose register (Acts 17:26–27, Gen 10–12 anchors), `gods-love` is God's love generally without the outsider edge that makes these queries distinct, and `those-who-never-heard` is the general-revelation/"without excuse" register — nearly the opposite claim from Jonah 4:11's pity on those "who can't discern between their right hand and their left hand." Jonah is the theme's defining book (Brooks 1919 book conclusion: God of the Gentiles as well as the Jew). Could alternatively be a lexicon extension of `gods-love`; check that route before minting. | Jonah / 2026-08-23 |

## Checked and already covered (not gaps)

Recorded so later threads don't re-log them:

- **pride** (Gen 11:4; 3:5–6) — covered: handled in PR #41 as a lexicon extension of
  `humble-exaltation` with fixtures, so plain "pride" queries route there. Residual
  concern that `humble-exaltation` names God's response rather than the human posture
  is a lexicon-tuning question for that concept, not a new-concept gap.
- **famine / scarcity** (Gen 26, 41–47) — covered: handled in PR #41 as a lexicon
  extension of `gods-provision` with fixtures.
- **temptation** — NOT covered; it remains a real gap (see the table). Its extension
  candidate (`temptation-and-the-fall` → `remembered-a-way-of-escape`) was deferred
  in PR #41, so nothing serves plain "temptation" queries yet.
- **barrenness / waiting** → `waiting-for-a-child`; **sibling rivalry** →
  `envy-and-jealousy` / `family-reconciliation`; **intercession** → `prayer` — all
  covered by admitted concepts.

## Joshua appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Joshua's locations to the named row earlier in this file — read them together
with that row; the other rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `fear-of-the-lord` | Josh 4:24 ("that you may fear the LORD your God forever"); 24:14 ("Now therefore fear the LORD, and serve him"); Mal 1:14; 2:5; 3:16 (twice); 4:2 | "Fear of the Lord" is a heavy, distinct lay query ("what does it mean to fear God") with no concept anywhere in the vocabulary; `fear-not` carries the opposite intent (do not be afraid). Recurs everywhere (Prov 1:7; Ps 111:10; Eccl 12:13) — sibling threads should append refs here. | Joshua / 2026-08-23 |
| `loving-god` | Josh 22:5 ("to love the LORD your God, to walk in all his ways"); 23:11 | "How to love God" / "love the Lord your God" queries have no target: `gods-love` is God's love for us, `loving-others` is neighbor-love. The greatest-commandment register (Deut 6:5; Matt 22:37) is simply absent from the vocabulary. | Joshua / 2026-08-23 |
| `inheritance` | Josh 11:23; 13:14, 33 ("The LORD, the God of Israel, is their inheritance"); 14:9; 18:3; 21:43–45; chs. 13–21 passim | Joshua is Scripture's densest inheritance text, and "inheritance in the Bible" / "our inheritance in Christ" (1 Pet 1:4; Eph 1:11–14) queries have no concept. | Joshua / 2026-08-23 |
| `remembrance-and-memorials` | Josh 4:1–9, 20–24 (the twelve stones, "What do these stones mean?"); 24:26–27 (the witness stone) | "Memorial stones," "remembering God's faithfulness," "why memorials in the Bible" — remembering-and-retelling God's works is a recurring biblical practice with no concept; `parenting` catches only the tell-your-children edge. | Joshua / 2026-08-23 |
| `cities-of-refuge` | Josh 20:1–9 | "Cities of refuge" is a real lookup query (like `the-ten-commandments`, the searcher wants the passage). WARNING: `refuge-in-trouble` (Psalm register, God as refuge) and `pastoral-refuge-and-justice` (personal abuse-crisis register) are adjacent but would misroute this query — and tagging Josh 20 with either would misroute their pastoral queries, which is exactly why the lookup id is proposed instead. Could also be a lexicon-extension question; flagged for curation judgment. | Joshua / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Josh 23:7, 16; 24:14–15, 20, 23 ("Put away the foreign gods which are among you") | Joshua 24 is a paradigm put-away-your-idols text for the gap Micah logged; same rationale as that row. | Joshua / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Josh 2:12–21 (the spies' oath to Rahab); 6:26; 9:15–20 (the Gibeonite oath kept at cost); 14:9 | Joshua adds the Bible's clearest kept-costly-oath narrative (ch. 9) to the Genesis row. | Joshua / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Josh 1:1–9, 16–18; 3:7; 4:14; 23–24 (farewell charges) | Succession and commissioning material for the Genesis row ("passing the torch"). | Joshua / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Josh 5:13–15 | The commander of the LORD's army; note for the row's wording — many readers take this figure as more than an angel, so record the ref without settling the identification. | Joshua / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Josh 8:33, 35 (the foreigner included in the covenant assembly); 20:9 (refuge for the alien) | The foreigner-included texts complement the Genesis row's living-as-a-foreigner refs. | Joshua / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Josh 20:3, 5, 9 (the avenger of blood — vengeance restrained by law) | Adds the institutional restraint-of-vengeance side to the Genesis row. | Joshua / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | Josh 24:29–33 (three burials close the book: Joshua, Joseph's bones, Eleazar) | Joseph's bones buried at Shechem completes the Gen 50:24–26 oath the Genesis row cites. | Joshua / 2026-08-23 |

Lexicon-extension flags from Joshua (not gap rows; for curation review before any new id):

- "be strong and courageous" → `fear-not` (its lexicon already carries "take courage" and it anchors Josh 1:9; the verbatim phrase itself is unserved).
- "as for me and my house we will serve the LORD" / "choose this day whom you will serve" → `surrender-to-god` (Josh 24:15, 22).
- God's-promised-rest phrasings ("rest from enemies," "entering God's rest"; Josh 1:13, 15; 11:23; 21:44; 23:1) → review against `rest-for-the-weary`'s bare-word "rest" lexicon entry (Matt 11:28 register) before deciding anything.

## Ruth appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Ruth's locations to the named row earlier in this file — read them together with
that row; the other rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `kinsman-redeemer` | Ruth 2:20 ("The man is a close relative to us, one of our near kinsmen"); 3:9, 12–13; 4:1–10, 14 | "Kinsman redeemer" is a classic lookup-plus-teaching query ("what is a kinsman redeemer in the Bible," "right of redemption," "goel") with no home anywhere in the vocabulary, and Ruth is its canonical text. Should carry the levirate duty too ("to raise up the name of the dead on his inheritance," 4:5, 10; Deut 25:5–10 background). Design note: keep the pack to what the text and curated sources say about the institution — the redemption-in-Christ register belongs to existing NT concepts (`salvation`, `forgiveness-of-sins`), not read back into this one. | Ruth / 2026-08-23 |
| `kindness` | Ruth 1:8 ("May the LORD deal kindly with you, as you have dealt with the dead and with me"); 2:20 ("who has not abandoned his kindness to the living and to the dead"); 3:10 | "What does the Bible say about kindness" is a heavy lay query with no target: `loving-others` speaks the love-one-another register, `gods-faithfulness` God's own faithfulness — neither lexicon carries "kindness." Ruth uses the word for the book's central virtue (hesed), human and divine. Could alternatively be a lexicon-extension review on `loving-others`; check that route before minting. | Ruth / 2026-08-23 |
| `care-for-widows` | Ruth 1:3, 5, 20–21; 4:5, 10, 14–15; Jas 1:27 | "Bible verses for widows" / "does God care for widows" are real pastoral queries; `pastoral-grief-and-loss` serves the griever but not the widow-specific care register (Deut 24:19–21, Ps 68:5, 1 Tim 5, James 1:27 would anchor it). Lexicon design note from this book: the WEB's Ruth never says "widow" — its phrase is "the wife of the dead" (4:5) — so anchors must come from elsewhere even though Ruth is the narrative people will expect. | Ruth / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Ruth 1:13 ("the LORD's hand has gone out against me"); 1:20–21 ("Don't call me Naomi. Call me Mara... the Almighty has afflicted me") | Adds the personal-complaint side to the Joel row's communal-lament refs: Naomi's Mara speech is a paradigm voiced complaint that the book honors rather than rebukes — the "is it okay to be angry with God" register. | Ruth / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Ruth 2:2–3, 7–9, 15–16 (gleaning rights honored and enlarged) | Adds the positive counterpart to the Micah row's oppression texts: Ruth 2 shows Israel's provision-for-the-poor law (gleaning, Lev 19:9–10 / Deut 24:19 background) working as intended, honored and exceeded. Register note for the eventual curator: "helping the poor" queries may want this provision-care side split from the oppression-judgment side — decide one concept or two before minting. | Ruth / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Ruth 1:22; 2:6, 10 ("Why have I found favor... since I am a foreigner?"), 21; 4:5, 10 | The Moabitess foreigner welcomed into Israel — field to gate to genealogy; the welcome-received complement to the Genesis row's living-as-a-foreigner refs and Joshua's foreigner-included texts. | Ruth / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Ruth 1:16–17 (Ruth's oath by the LORD: "May the LORD do so to me, and more also, if anything but death parts you and me"); 3:13 ("as the LORD lives") | Adds Scripture's best-known loyalty oath — an oath that converts ("your God my God") — to the Genesis row. | Ruth / 2026-08-23 |

## Hosea appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Per this file's append rules, Hosea's `idolatry` refs (Hos 4:12–19; 8:4–6;
10:5–6; 13:2; 14:3, 8) were merged directly into the existing Micah `idolatry` row's
Where column earlier in this file — Hosea alone names calf idols, sacred stones, and
"the work of our hands" across six chapters — rather than duplicated here. The rows
below are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `spiritual-adultery` | Hos 1:2; 2:2–13; 3:1; 4:12; 5:4, 7; 9:1 | "Spiritual adultery" / "unfaithful to God" is a distinct, searched register — the relationship framing of idolatry, and Hosea's controlling metaphor. Nothing covers the God-ward unfaithfulness sense: `pastoral-betrayal-and-marriage-crisis` is human-marriage pastoral care and its YAML deliberately excludes Hosea. Overlaps the `idolatry` row earlier in this file (object register vs. relationship register) — decide one concept or two before minting. | Hosea / 2026-08-23 |
| `sowing-and-reaping` | Hos 8:7; 10:12–13; Gal 6:7–9 | "You reap what you sow" (Gal 6:7–8) is among the commonest remembered Bible phrasings, and "sow the wind, reap the whirlwind" is proverbial English straight from Hosea; no concept carries the sowing/reaping moral-consequence frame in either testament. | Hosea / 2026-08-23 |
| `knowing-god` | Hos 2:20; 4:1, 6; 5:4; 6:3, 6 | "Knowing God" / "my people are destroyed for lack of knowledge" (a famous, heavily quoted line) has no landing place: `hunger-for-god` owns the desire register (thirst/longing, per its YAML sense boundaries), not the knowledge-of-God relationship register that is Hosea's repeated diagnosis and remedy. Could alternatively be a lexicon extension of `hunger-for-god` — check that route before minting. | Hosea / 2026-08-23 |
| `mercy` | Hos 2:23; 6:6; 11:8–9; 14:3 | Bare "mercy" and "I desire mercy, not sacrifice" (quoted twice by Jesus, Matt 9:13; 12:7) are common queries with no id: `gods-love` owns "love", `forgiveness-of-sins` owns guilt/pardon, but the mercy/compassion register (Hebrew hesed territory) falls between them. Likely a lexicon-extension candidate on `gods-love` or `forgiveness-of-sins` rather than a new concept — check that route first. | Hosea / 2026-08-23 |

## Nahum appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Per this file's append rules, two of Nahum's items were merged into
existing rows' Where columns earlier in this file rather than duplicated here:

- **`vengeance` (Genesis row):** `Nah 1:2–3` appended. Nahum strengthens the row
  from the other side: Genesis narrates human revenge; Nahum 1:2 ("The LORD takes
  vengeance on his adversaries") is the canonical statement that vengeance belongs
  to God — exactly the text a "revenge in the Bible" query should reach alongside
  the Rom 12:19 logic the row's wording concern anticipates.
- **`justice-and-oppression` (Micah row):** `Nah 2:11–13; 3:1, 4, 19` appended —
  Nahum's staged `oppression` gap is the same theme, so it merges rather than
  minting a duplicate id. Register note for the eventual curator: Micah's refs
  carry the civic/economic register (land-seizure, bribed courts); Nahum adds the
  oppressed-by-empire register ("does God judge oppressors" / "what does the
  Bible say about tyrants" — "Woe to the bloody city!... who hasn't felt your
  endless cruelty?"). Exodus/Amos/Habakkuk and the Zephaniah/Malachi threads will
  reinforce this row; wording must route to God's justice for the oppressed,
  never political adjudication.

The row below is a new gap.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `slow-to-anger` | Nah 1:3 | "God is slow to anger" / "God's patience" is a plain lay query with no home: `divine-judgment` carries the wrath side ("gods wrath" is in its lexicon) but nothing carries God's patience, and the formula is one of Scripture's most repeated self-descriptions (Exod 34:6; Joel 2:13; Jonah 4:2; Ps 103:8) — Joel and Jonah threads will hit it too; this is the shared row, so sibling threads should append refs here rather than mint a duplicate. | Nahum / 2026-08-23 |

## Amos appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Per this file's append rules, two of Amos's items were merged into
existing rows' Where columns earlier in this file rather than duplicated here:

- **`justice-and-oppression` (Micah row):** `Amos 2:6–7; 4:1; 5:7, 10–15, 24; 8:4–6`
  appended — Amos's staged `justice-and-oppression-of-the-poor` gap is the same
  theme under the unified id Micah's thread landed, so it merges rather than
  minting a duplicate. Amos supplies the theme's signature texts ("establish
  justice in the courts," 5:15; "let justice roll on like rivers," 5:24; the
  needy sold "for a pair of sandals," 2:6). Lexicon note for the eventual
  curator: the famous query form "let justice roll down like waters" (KJV/ESV
  phrasing) shares almost no tokens with the WEB's "roll on like rivers" —
  the pack's lexicon must carry both phrasings.
- **`day-of-the-lord` (Obadiah row):** `Amos 5:18–20; 8:9–10` appended — Amos
  5:18–20 is the theme's earliest sustained treatment ("It is darkness, and not
  light"), which that row's rationale already anticipated (it names Amos 5).

The rows below are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `empty-worship` (or `religious-hypocrisy`) | Amos 4:4–5; 5:21–24; 8:5; Gal 2:11–14; Zech 7:5–6 | "Empty worship," "religious hypocrisy," "going through the motions" — a recurring whole-canon theme (Isa 1:11–17; Mal 1; Matt 15:8) with no home: `worship` carries the adoration register, `self-deception` the self-directed register; neither answers a user asking why God rejects worship. Amos is the landmark OT text ("I hate, I despise your feasts," 5:21). | Amos / 2026-08-23 |
| `famine-of-hearing-gods-word` | Amos 8:11–12 | "Famine of the word" is a known preaching/search phrase and the felt-need query "when God is silent" has no home: `delight-in-the-word` and `studying-the-word` carry the positive-practice register, and the silence-of-God register exists nowhere. Narrow (one primary passage) — may be better served as a lexicon/anchor extension of an existing word concept than a new id; logged so the call is made deliberately. | Amos / 2026-08-23 |

## Habakkuk appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Habakkuk logs no new rows — both of its items were merged into existing
rows' Where columns earlier in this file, per this file's append rules:

- **`idolatry` (Micah row, Hosea refs already merged):** `Hab 2:18–19` appended —
  the staged Habakkuk `idolatry` row was a confirmed three-way collision with the
  Hosea and Micah threads; one row stands (Micah's, first-merged) and Habakkuk
  contributes only its refs. Hab 2:18–19 is a compact teaching text (the maker
  "trusts in it," yet "there is no breath at all within it").
- **`lament` (Joel row):** `Hab 1:2–4; 1:12–17` appended — Habakkuk opens as a
  formal complaint to God ("LORD, how long will I cry, and you will not hear?",
  1:2) and its whole first chapter is structured lament, a strong witness for the
  existing row.

Checked and declined: `day-of-the-lord` (Obadiah row) — Habakkuk never uses the
phrase; its nearest language ("the day of trouble," 3:16; "the appointed time,"
2:3) is adjacent, not the same theme, so no Habakkuk refs were appended there.

## Ephesians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Per this file's append rules, three of Ephesians's items were merged into
existing rows' Where columns earlier in this file rather than duplicated here:

- **`election-and-predestination` (Romans row):** `Eph 1:4–5, 11` appended —
  "chose us in him before the foundation of the world," "predestined us for
  adoption as children," "foreordained according to the purpose of him who does
  all things after the counsel of his will." Ephesians 1 is, with Romans 8–9,
  the text these queries land on; strengthens the Romans case.
- **`adoption-as-gods-children` (Romans row):** `Eph 1:5` appended ("predestined
  us for adoption as children through Jesus Christ to himself") — the Romans row
  already anticipated Eph 1.
- **`bondservants-and-masters` (Colossians row):** `Eph 6:5–9` appended — the
  staged Ephesians `slavery-in-the-bible` row is the same what-does-the-Bible-
  say-about-slavery gap Colossians logged first, so it folds into that row
  rather than minting a duplicate id. Eph 6:5–9 carries the same reciprocal
  duties and leveling claims the row's wording concern anticipates ("give up
  threatening"; "there is no partiality with him"); 1 Cor 7:21–22, Philemon,
  and 1 Pet 2:18–25 will reinforce this row from later threads.

The row below is a new gap (checked against the current table: no existing
unity/church-oneness row — `harmony-with-others` and `gathering-together` are
vocabulary neighbors, not rows, and neither covers the ecclesial-oneness sense).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `unity-of-the-church` | Eph 4:3–6, 13; 2:14–16 | "Church unity," "unity in the church," "one body in Christ" are common lay/pastor queries with no home: `harmony-with-others` is interpersonal-peace shaped ("getting along with others") and `gathering-together` is meeting-attendance shaped; neither carries the one-body/one-Spirit ecclesial oneness that Eph 4:3–6 teaches and 2:14–16 grounds. Ps 133, John 17:20–23, 1 Cor 1:10, and Phil 2:1–2 would anchor the same row for later threads. | Ephesians / 2026-08-23 |

## Haggai appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Per this file's append rules, two of Haggai's items were merged into
existing rows' Where columns earlier in this file rather than duplicated here:

- **`remnant` (Micah row):** `Hag 1:12, 14; 2:2` appended — "all the remnant of
  the people" is the book's name for the obeying, working community; the remnant
  theme is carried by the narrative itself.
- **`day-of-the-lord` (Obadiah row, Amos refs already merged):** `Hag 2:6–7,
  21–23` appended — "Yet once more, it is a little while, and I will shake the
  heavens, the earth, the sea, and the dry land"; "In that day, says the LORD of
  Armies" — the shaking-of-the-nations / "in that day" horizon. Caveat for the
  row's framing: Haggai never uses the phrase "day of the LORD" itself, so if the
  eventual pack's framing is phrase-based, the Haggai refs are theme witnesses,
  not phrase witnesses.

Checked and declined: `lament`, `idolatry`, and the justice/oppression rows — no
substantial Haggai material; nothing appended there.

The rows below are new gaps (checked against the current table: no
priorities/first-place row and no house-of-God row exists — the concurrent
Ephesians block was re-read before this append and collides with neither).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `putting-god-first` | Hag 1:2–11 ("Consider your ways"; paneled houses while the LORD's house lies waste); 2:15–19 | "Putting God first," "priorities," "seek God first" are heavy lay queries with no honest home: `surrender-to-god` covers yielding the self, `love-not-the-world` covers worldliness, `stewardship-of-days` covers time, `pleasing-god-not-people` covers audience — none serves the first-place/priorities question Haggai 1 poses (and Matt 6:33 answers). Guardrail note for any future pack: Hag 1:6–11 / 2:15–19 must be framed as covenant discipline and covenant pledge, never give-to-get. | Haggai / 2026-08-23 |
| `the-house-of-god` | Hag 1:4, 8–9, 14; 2:3, 7–9 | "God's house," "the temple in the Bible," "why does God's house matter" — the vocabulary has `worship` and `gathering-together` for the acts and the assembly, but nothing for the house/dwelling-of-God theme that runs tabernacle → temple → Haggai's latter-glory promise (→ NT temple language). Check first whether a lexicon extension of `worship` or `presence-of-god` serves these queries before minting a new id. | Haggai / 2026-08-23 |

## Matthew appends — 2026-08-23 (Gospels+Acts thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Matthew's locations to the named row earlier in this file — read them together
with that row; the other rows are new gaps. Sourced from the Matthew book doc's
Tag-gap candidates section (`matthew.md`, this directory) and re-deduped against
this file's live state at delivery (the concurrent Ephesians and Haggai blocks were
re-read before this append and collide with nothing below): several themes Matthew
staged as new gaps had already been logged by sibling threads — `mercy` (Hosea),
`fasting` (Joel), `judging-others` and the god-and-government theme as
`governing-authorities` (Romans), `loving-god` (Joshua), and the hypocrisy theme as
`empty-worship`/`religious-hypocrisy` (Amos) — so those appear here as ref-appends
instead of duplicate ids.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `kingdom-of-heaven` (or `kingdom-of-god`) | Matt 3:2; 4:17; 5:3, 10, 19–20; 6:10, 33; 10:7; 13:11, 24–52 | Matthew's central announcement and the theme of a whole parable discourse; "kingdom of heaven meaning", "parables of the kingdom", "seek first the kingdom" are heavy queries with no concept home anywhere in the vocabulary. | Matthew (Gospels+Acts) / 2026-08-23 |
| `discipleship` (following Jesus) | Matt 4:18–22; 8:18–22; 9:9; 10:24–25, 37–39 | "Follow Jesus", "cost of discipleship", "take up your cross" — a core lay query family; nothing in the vocabulary covers the call to follow or its cost. | Matthew (Gospels+Acts) / 2026-08-23 |
| `blasphemy-against-the-spirit` (the unpardonable sin) | Matt 12:31–32 | "What is the unforgivable sin", "have I blasphemed the Holy Spirit" — a recurring pastoral-anxiety query that `forgiveness-of-sins` does not answer (the passage is precisely about the exception). | Matthew (Gospels+Acts) / 2026-08-23 |
| `deliverance-from-demons` (or `spiritual-warfare`) | Matt 8:16, 28–34; 9:32–34; 12:22–29, 43–45 | "Demon possession in the Bible", "casting out demons" — repeated narrative substance in Matthew; `resisting-the-devil` covers the believer's resistance posture, not deliverance. Check overlap with `pastoral-freedom-from-bondage` before minting. | Matthew (Gospels+Acts) / 2026-08-23 |
| `stewardship` | Matt 25:14–30 | Faithfulness with what the Master entrusts: "parable of the talents meaning" / "stewardship in the Bible" queries; `work-and-diligence` catches the diligence facet, `tithing` the giving facet, and the near-name `stewardship-of-days` is a distinct time-focused concept — entrusted-resources faithfulness has no concept. Check the lexicon-extension route on `work-and-diligence` before minting, and mind the id-space closeness to `stewardship-of-days`. | Matthew (Gospels+Acts) / 2026-08-23 |
| `servanthood` | Matt 20:25–28; 23:11 | Greatness through serving: "servant leadership Bible" is a real query; `humble-exaltation` names God's reversal, not the serving posture itself. Could be a lexicon extension of `humble-exaltation` — check that route first. | Matthew (Gospels+Acts) / 2026-08-23 |
| `gentleness-of-christ` (the bruised reed) | Matt 11:29; 12:15–21 | "He won't break a bruised reed" / "Jesus gentle and humble in heart" — real comfort queries about Christ's gentleness with the fragile. `pastoral-near-to-the-brokenhearted` is the nearest id, but the pastoral-* packs are the personal-crisis register (cross-thread ruling), and Matthew 12's anchor is a messianic servant-song fulfillment citation, not an individual-comfort scene — so the theme currently has no fitting home. | Matthew (Gospels+Acts) / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | Matt 4:1–11 (the temptation of Jesus — Scripture's fullest temptation narrative); 6:13 ("Bring us not into temptation"); 26:41 ("Watch and pray, that you don't enter into temptation") | `resisting-the-devil` honestly tags Matt 4, but the plain "temptation" query gap Genesis logged remains open; Matthew adds its defining NT narrative and two prayer texts. | Matthew (Gospels+Acts) / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Matt 1:20–24; 2:13, 19; 4:6, 11; 13:39–49; 24:31; 26:53; 28:2–7 | Matthew's angelic material spans the annunciation dreams, ministry after the temptation, the end-of-age harvest, the twelve legions saying, and the tomb — refs for the Genesis row. | Matthew (Gospels+Acts) / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Matt 5:33–37 (Jesus' teaching against swearing — "don't swear at all... let your 'Yes' be 'Yes'"); 14:7–9 (Herod's destructive oath) | The concept's key NT counterpoint texts — teaching against oath-taking, and a kept oath that kills. | Matthew (Gospels+Acts) / 2026-08-23 |
| `mercy` *(append to existing Hosea row)* | Matt 5:7; 9:13, 27; 12:7 | Matthew supplies the NT side that row anticipated: Jesus quotes Hos 6:6 twice ("I desire mercy, and not sacrifice," 9:13; 12:7), plus "Blessed are the merciful" (5:7) and a son-of-David mercy cry (9:27). | Matthew (Gospels+Acts) / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Matt 4:2; 6:16–18; 9:14–15 | Adds Jesus' direct teaching on how to fast (in secret, 6:16–18) and the bridegroom logic of when to fast (9:14–15) to the Joel row's practice refs. | Matthew (Gospels+Acts) / 2026-08-23 |
| `judging-others` *(append to existing Romans row)* | Matt 7:1–5 | The Romans row's rationale already names Matt 7:1; the beam-and-speck teaching ("Don't judge, so that you won't be judged") is the query family's primary anchor text. | Matthew (Gospels+Acts) / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Matt 22:15–22 | Matthew staged this as `god-and-government` — the same gap the Romans row logged first ("should Christians pay taxes"); "render to Caesar" (give to Caesar what is Caesar's, and to God what is God's) is the query family's most-quoted text, and `praying-for-leaders` covers only prayer. | Matthew (Gospels+Acts) / 2026-08-23 |
| `empty-worship` (or `religious-hypocrisy`) *(append to existing Amos row)* | Matt 6:2, 5, 16; 7:5; 15:7–9; 23:5–7, 13–33 | Matthew staged this as `hypocrisy` — the Amos row (whose rationale already cites Matt 15:8) is the same gap, and Matthew is Scripture's densest source: piety performed to be seen, lips honoring while the heart is far, and the ch. 23 woes. Register note for the curator: Matthew's refs run broader than worship — religion performed for show generally — so weigh the id's scope (and the lexicon-extension route on `pleasing-god-not-people` / `self-deception`) when deciding. (Proposed independently by both Matthew drafters.) | Matthew (Gospels+Acts) / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | Matt 22:34–40 | The greatest-commandment text the Joshua row's rationale anticipated (Matt 22:37): love the Lord with all your heart, soul, and mind — the first commandment, absent from the vocabulary while `loving-others` carries the second. | Matthew (Gospels+Acts) / 2026-08-23 |

Extension-check flag from Matthew (not a gap row; for curation review before any
new id): the Sadducee dispute (Matt 22:23–33) teaches the resurrection of the dead
generally — if `resurrection` ("He is risen") is scoped to Easter, a lexicon
extension covering "resurrection of the dead" / "life after death" queries is worth
checking before anyone mints a separate id.

## Job appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Job's locations to the named row earlier in this file — read them together with
that row; the other rows are new gaps. (Dedupe re-run at write time against the file
as it stands — including the Hosea, Nahum, Amos, Habakkuk, Ephesians, and Haggai
blocks that landed after this book's critic approval, and the Matthew block that
landed concurrently with this write and was re-checked immediately after: no
collisions with the eight new rows below; all five append targets confirmed present.)

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `suffering-of-the-righteous` | Job 1–2 (the frame); 9:22–24; 21:7–26; 42:7 | "Why does God allow suffering," "why do bad things happen to good people" — the question the whole book stages. The pastoral packs serve the sufferer's own comfort queries (`pastoral-god-sees-my-suffering`, `pastoral-hope-in-despair`), but the why-question itself has no concept, and Job is its canonical text. | Job / 2026-08-23 |
| `prosperity-of-the-wicked` | Job 21:7–34; 24:1–17; also 12:6 | "Why do the wicked prosper" is a classic search (Job 21, Psalm 73, Jeremiah 12:1; Hab 1:13 asks the same why-silent question) with no vocabulary home. Needs careful gisting so it routes to Scripture's own wrestling, not to an answer the texts don't give. | Job / 2026-08-23 |
| `redeemer` | Job 19:25–27; 33:24, 33:28 | "My redeemer lives," "who is my redeemer" — 19:25 is one of the most-searched verses in Job. `hope-in-god` catches the mood but not the redeemer-language queries; no concept carries redeemer/ransom vocabulary. Adjacent row: Ruth's `kinsman-redeemer` earlier in this file (the goel institution — the same Hebrew word behind 19:25); the Job queries are the personal my-redeemer-lives register, but decide alongside that row (one concept, two, or an extension) before minting. | Job / 2026-08-23 |
| `mediator` | Job 9:32–35 ("no umpire between us"); 16:19–21; 33:23–24 | "Mediator between God and man," "advocate with the Father" — Job's umpire-longing is the Old Testament's clearest statement of the need; a natural future bridge to 1 Timothy 2:5 / 1 John 2:1 texts. Overlaps `redeemer` above; decide one concept or two before minting. | Job / 2026-08-23 |
| `integrity` | Job 2:3, 2:9; 27:5–6; 31:6 | "Integrity in the Bible," "man of integrity" — the book's own repeated word for Job. `honesty` covers truth-telling but not the whole-life uprightness these queries mean; could alternatively be a lexicon extension of `honesty` — check that route before minting. | Job / 2026-08-23 |
| `satan` | Job 1:6–12; 2:1–7 | "Who is Satan," "Satan in the Bible" — heavily searched; the vocabulary carries only the response side (`resisting-the-devil`). Job's heavenly-court scenes (with Genesis 3 read canonically, Zechariah 3, and the Gospels) are the texts such searches want. Gist must keep the engine descriptive, not speculative. | Job / 2026-08-23 |
| `comforting-others` | Job 2:11–13; 16:2–5; 21:34; 42:11 | "How to comfort someone who is grieving," "what to say to a suffering friend" — Job supplies both the model (seven days of silence; "I would strengthen you with my mouth") and the anti-model ("miserable comforters"). `god-of-all-comfort` covers God comforting us, not the human practice. | Job / 2026-08-23 |
| `leviathan-and-behemoth` | Job 41:1–34; 40:15–24; 3:8 | "Leviathan," "behemoth in the Bible" — perennial curiosity queries with no home (`creation` lexicon carries neither word). Precedent: the Genesis thread logged `angels` for the same kind of named-figure search. | Job / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Job 7:6–10 ("my days are swifter than a weaver's shuttle"; "he who goes down to Sheol will come up no more"); 14:1–12 ("Man, who is born of a woman, is of few days"; "If a man dies, will he live again?"); 10:20–22; 17:13–16 | Job is Scripture's densest meditation on mortality outside Genesis 5 and Ecclesiastes. | Job / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Job 1:6; 2:1 ("God's sons came to present themselves before the LORD"); 38:7 ("all the sons of God shouted for joy"); 33:23 ("an angel, an interpreter, one among a thousand") | The heavenly-court scenes are among the most-asked-about angel/heavenly-beings texts. | Job / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Job 24:2–12 (the oppression catalog: landmarks moved, the fatherless and widow stripped); 29:12–17 ("I delivered the poor who cried... I was eyes to the blind, and feet to the lame"); 31:16–22 (the oath of care for the poor, the widow, the fatherless, and the unclothed) | Job adds the righteous-ruler and personal-obligation registers (just rule practiced, care sworn on oath) and the lament that heaven seems silent over oppression (ch. 24) — routed here per the 2026-08-23 pastoral-register ruling this row's rationale carries; the personal-crisis `pastoral-*` packs must not carry this societal material. | Job / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Job 3; 6:2–13; 7:11–21; 10:1–22; 16:6–17; 30:16–31 | Job supplies the sustained personal-lament texts alongside the row's communal register (Joel), Naomi's complaint (Ruth append), and Habakkuk's structured complaint: complaint carried *to* God rather than away from him, with the honest speaker vindicated at 42:7. | Job / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Job 28:28 ("Behold, the fear of the Lord, that is wisdom. To depart from evil is understanding."); 1:1, 1:8–9 ("one who feared God"; "Does Job fear God for nothing?"); 37:24 | The book is framed by it, and 28:28 adds the wisdom-equation text to the row's serve-the-LORD refs. Curator note: `wisdom-from-god` anchors Prov 9:10, so wisdom-flavored queries land there, but the bare phrase and its piety sense remain unserved. | Job / 2026-08-23 |

## Galatians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at delivery (the concurrent
Matthew and Job blocks were re-read before this append). Per this file's append
rules, four of Galatians's six staged items were merged into existing rows' Where
columns earlier in this file rather than duplicated here:

- **`false-teachers` (2 John row):** `Gal 1:6–9; 4:17; 5:7–12; 6:12–13` appended —
  Galatians staged this as `false-teaching`; the 2 John row is the same gap and
  explicitly invites sibling appends. Galatians adds the "different 'good news'"
  warning (1:6–9 — Scripture's sharpest curse on another gospel), the agitators'
  self-serving zeal (4:17), the yeast-in-the-lump interference (5:7–12), and the
  circumcision party's motives unmasked (6:12–13).
- **`adoption-as-gods-children` (Romans row):** `Gal 3:26; 4:4–7` appended — the
  Romans row's rationale already anticipated Gal 4; 4:5 ("that we might receive
  the adoption as children") and the Abba-Father cry (4:6) are the doctrine's
  namesake texts.
- **`sowing-and-reaping` (Hosea row):** `Gal 6:7–9` appended — the Hosea row's
  rationale already cites Gal 6:7–8 as the commonest remembered phrasing.
  Doctrinal note carried from the Galatians staging: gist wording must route to
  the moral/spiritual principle Gal 6:8 states (flesh reaps corruption, Spirit
  reaps eternal life) and never to seed-faith return-on-giving framing — the
  exclusion `docs/DOCTRINAL-BASIS.md` §3 names.
- **`empty-worship`/`religious-hypocrisy` (Amos row):** `Gal 2:11–14` appended —
  Galatians staged this as `hypocrisy`; the Matthew thread has already ruled the
  Amos row the hypocrisy theme's shared home, so Galatians folds there too.
  Register note reinforcing Matthew's scope-weighing note: Gal 2:13 uses the
  word "hypocrisy" itself of Peter and Barnabas, but the register is conduct
  inconsistency under peer pressure (table-fellowship withdrawal), not piety
  performed for show — one more reason the eventual id's scope needs the
  broader-than-worship decision Matthew's note flags.

The rows below are new gaps (checked against the current table and vocabulary:
no freedom row exists anywhere — `pastoral-freedom-from-bondage` is a vocabulary
neighbor, not a row, and Matthew's `deliverance-from-demons` row touches it only
for overlap-checking — and the only Spirit rows carry other registers: Joel's
outpouring promise, not the daily walk).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `freedom-in-christ` | Gal 5:1, 13; 2:4; 4:22–31 | "Freedom in Christ," "Christian liberty," "what is Christian freedom" — the vocabulary's only freedom concept is `pastoral-freedom-from-bondage`, whose lexicon is addiction-keyed (addiction; alcoholism). The doctrinal-liberty query has no honest home — and the gap is now fully unserved: the independent review removed that pastoral tag from Gal 5 under the pastoral-register ruling (Galatians doc, Decisions 5), so no tag reaches these passages. Could alternatively be a lexicon extension of that concept — decide one concept or two before minting. | Galatians / 2026-08-23 |
| `walking-by-the-spirit` | Gal 5:16–18, 25 (also Rom 8:4–14) | "Walk in the Spirit," "led by the Spirit," "life in the Spirit" — the Spirit-led-life queries have no home: `remembered-fruit-of-the-spirit` is keyed to the 5:22–23 list, `holy-spirit-the-comforter` to John 14, and the `outpouring-of-the-spirit` row earlier in this file is the Joel 2 promise register, not the daily-walk register. Could be a lexicon extension of `remembered-fruit-of-the-spirit`; check that route before minting. | Galatians / 2026-08-23 |

## Malachi appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at write time (the Matthew,
Job, and Galatians blocks were re-read before this append). Per this file's
append rules, five of Malachi's staged items were merged into existing rows'
Where columns earlier in this file rather than duplicated here:

- **`fear-of-the-lord` (Joshua row; Job refs already appended):** `Mal 1:14;
  2:5; 3:16 (twice); 4:2` appended — Malachi staged this as a new row, but the
  Joshua row is the same gap and explicitly invites sibling appends, so Malachi
  folds there. The book of memory is written "for those who feared the LORD and
  who honored his name" (3:16), the sun of righteousness rises "to you who fear
  my name" (4:2), Levi's covenant standard is "he feared me, and stood in awe of
  my name" (2:5, included on reviewer suggestion), and "my name is awesome among
  the nations" (1:14).
- **`day-of-the-lord` (Obadiah row; Amos and Haggai refs already merged):**
  `Mal 3:2; 4:1–3; 4:5` appended — "who can endure the day of his coming?"
  (3:2); the day "burning like a furnace" (4:1); and "the great and terrible day
  of the LORD" (4:5), the Old Testament arrangement's closing use of the phrase.
  The row's rationale already anticipated Mal 4.
- **`justice-and-oppression` (Micah row; Nahum, Amos, Ruth, and Job refs
  already merged):** `Mal 2:17; 3:5` appended — "Where is the God of justice?"
  (2:17) is the hinge question of the whole book, answered by 3:5's swift
  judgment on those who oppress the hireling in his wages, the widow, and the
  fatherless, and who deprive the foreigner of justice. Mal 3:5 carries both
  the justice and the oppression sides of the row.
- **`remnant` (Micah row; Haggai refs already merged):** `Mal 3:16–18`
  appended, with a lower-confidence flag recorded here as staged: Malachi never
  uses a remnant word, so this is a theme witness, not a phrase witness — the
  community divides and a spared group emerges ("those who feared the LORD,"
  written in the book of memory, the LORD's "own possession... I will spare
  them"), which is the row's substance (a faithful group spared within judged
  Israel). The eventual curator should weigh the refs accordingly.
- **`idolatry` (Micah row; Hosea and Habakkuk refs already merged):**
  `Mal 2:11` appended, flagged LOW-CONFIDENCE as staged: "has married the
  daughter of a foreign god" concerns intermarriage with worshipers of a
  foreign god — alliance-with-idolatry rather than idol worship, and the
  chapter's own charge is covenant treachery. Appended so the ref is not lost;
  keep it only if the eventual pack's framing is broad enough to include
  alliance-with-idolatry passages, otherwise drop it there.

Checked and declined: `lament` (the altar-tears of Mal 2:13 are rejected
weeping over unaccepted offerings, not lament practice), `false-prophets`
(Malachi indicts corrupt priests, not false prophets), and `fasting` (never
appears in the book) — nothing appended there.

The row below is a new gap (checked against the current table and vocabulary:
no immutability/does-God-change row exists anywhere in this file; `slow-to-anger`
(Nahum) is the patience register, a different divine attribute).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `gods-unchanging-nature` | Mal 3:6 | "God never changes" / "I the LORD do not change" / immutability queries have no home: `gods-faithfulness` is keyed to faithfulness-and-promise language ("god is faithful", "god keeps his promises") and no lexicon entry serves the does-God-change question. Mal 3:6 grounds Israel's survival in God's unchangingness — a distinct, commonly searched divine attribute (Num 23:19 and Jas 1:17 are the same family). Could alternatively be a lexicon extension of `gods-faithfulness`; check that route before minting. | Malachi / 2026-08-23 |

## Zephaniah appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. The live file was re-read immediately before this append (the concurrent
Malachi merges into the `day-of-the-lord`, `justice-and-oppression`, `idolatry`,
and `remnant` rows were already present and collide with nothing here). Per this
file's append rules, four of Zephaniah's staged items were merged into existing
rows' Where columns earlier in this file rather than duplicated here:

- **`day-of-the-lord` (Obadiah row):** `Zeph 1:7, 14–18; 2:2–3` appended —
  Zephaniah is the theme's densest book per verse: "the day of the LORD is at
  hand" (1:7), "The great day of the LORD is near" (1:14), "a day of wrath"
  (1:15), "before the day of the LORD's anger comes on you" (2:2).
- **`remnant` (Micah row):** `Zeph 2:7, 9; 3:12–13` appended — the coast kept
  "for the remnant of the house of Judah" (2:7), "The remnant of my people"
  plundering Moab (2:9), and "The remnant of Israel" purified — no iniquity, no
  lies, no fear (3:12–13). Brooks' 1919 key thought for the whole book is
  "Remnant."
- **`idolatry` (Micah row):** `Zeph 1:4–6` appended — "the remnant of Baal",
  idolatrous priests, rooftop worship of the army of the sky, and divided oaths
  "by the LORD" and "by Malcam".
- **`justice-and-oppression` (Micah row):** `Zeph 3:1, 19` appended — Zephaniah's
  staged `oppression` gap is the same theme, so it merges rather than duplicates
  (same routing as Nahum's). Jerusalem herself as "the oppressing city" (3:1) and
  God's pledge "I will deal with all those who afflict you" (3:19) — note this
  extends the theme to God's own city as oppressor, not only foreign powers.

Checked and already covered (recorded so later threads don't re-log): God's
presence in the midst (Zeph 3:5, 15, 17) → `presence-of-god` exists, dropped from
Zeph 3's tags only under the 6-cap — lexicon lead, not a gap; do not fear / weak
hands (Zeph 3:13, 15–16) → `fear-not` exists, Zeph 3:16–17 is an anchor-extension
lead; humility / pride inversion (Zeph 2:3; 3:11–12) → `humble-exaltation` exists
(its lexicon already carries "humility" and "pride").

The rows below are new gaps (checked against the current table: no complacency
row and no delight/rejoicing-over row exists anywhere in the live file, and
neither id is in the 131-id vocabulary).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `complacency` | Zeph 1:12 | Spiritual complacency/apathy is a real lay query ("complacency in the Bible", "lukewarm faith") with no vocabulary home. Zeph 1:12 is a classic text: the men "settled on their dregs" who say "The LORD will not do good, neither will he do evil." `self-deception` was checked and is the wrong register — it covers deceiving yourself about your own state (Jas 1:22–24; Rev 3:17), not complacent denial that God acts. Amos's "at ease in Zion" territory (Amos 6:1) belongs to the Amos thread if it logs the same theme — dedupe on merge. | Zephaniah / 2026-08-23 |
| `gods-delight-in-his-people` | Zeph 3:14–17 | "God delights in you", "God rejoices over you", "does God sing over us" are heavily-searched comfort queries, and Zeph 3:17 ("He will rejoice over you with joy… He will rejoice over you with singing") is their landing verse — currently reachable through no concept. Check-first alternative: a lexicon/anchor extension of `gods-love` (which already carries the love register but has no delight/rejoicing-over phrasing and no Zeph 3:17 anchor) — decide extension vs. new id before minting, per the `leadership` row's precedent. Remembered-phrasing note: searchers quote NIV "quiet you with his love" / "mighty to save"; WEB reads "calm you in his love" / "a mighty one who will save". | Zephaniah / 2026-08-23 |


## Philippians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Re-deduped against this file's live
state at delivery (~95 rows; the Matthew, Job, Galatians, and Malachi blocks were
re-read before this append, and the Zephaniah block that landed concurrently with
this write was re-checked immediately after — its rows and merges collide with
nothing below). Two of Philippians's staged items fold into existing
rows rather than minting duplicates: its staged `discipleship` row is the same gap
as Matthew's `discipleship` (following Jesus) row — same suggested id, same query
family — so Philippians contributes only its refs (with a register note: Philippians
carries the imitation-of-a-mentor side, "be imitators together of me," alongside
Matthew's follow-Jesus texts); and Phil 3:20 goes to the Genesis
`sojourners-and-strangers` row as staged. `death-of-a-believer` was checked against
the Genesis `mortality` and `death-and-burial` rows and kept as a NEW row — those
cover mortality in general and burial practice, not the dying believer's hope of
being with Christ, though the overlap flag for the eventual curator is kept in-row.
`thought-life` collides with nothing (`remembered-transformed-not-conformed` and
`self-control` are vocabulary neighbors, not rows). Rows marked *(append to
existing row)* add Philippians's locations to the named row earlier in this file —
read them together with that row; the other rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `death-of-a-believer` (or `with-christ-after-death`) | Phil 1:21–23; 2 Cor 5:1–8; 4:14 | "To die is gain" / "depart and be with Christ, which is far better" is the believer's hope in the face of death itself — "what happens when a Christian dies," "facing death without fear," "to die is gain meaning." `pastoral-grief-and-loss` serves the mourner, `resurrection` and `second-coming` the final state; the Genesis `mortality` row covers mortality in general, not the dying believer's hope of being with Christ. Overlaps that `mortality` row — decide one concept or two before minting. | Philippians / 2026-08-23 |
| `thought-life` | Phil 4:8 | "Whatever things are true… think about these things" answers a live lay query family — "what should I think about," "guarding your thoughts," "take every thought captive" (2 Cor 10:5 is the other anchor). `remembered-transformed-not-conformed` is Romans-12 verse-memory and `self-control` is behavior-shaped; nothing serves plain thought-life queries. | Philippians / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | Phil 3:17 ("Brothers, be imitators together of me, and note those who walk this way, even as you have us for an example"); 4:9 ("The things which you learned, received, heard, and saw in me: do these things") | Adds the imitation/mentoring register to the Matthew row's follow-Jesus texts: "spiritual mentor," "following a godly example," "discipling someone" — `spiritual-growth` covers growth itself, `sharing-your-faith` evangelism; the imitation relationship belongs to this row. | Philippians / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Phil 3:20 ("our citizenship is in heaven") | The resident-foreigner identity stated from the heavenly side — pairs with the Genesis stranger-and-foreigner refs, Joshua's foreigner-included texts, and Ruth's welcome-received refs. | Philippians / 2026-08-23 |

## 2 Corinthians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at delivery (~97 rows; the
Malachi, Zephaniah, and Philippians blocks landed after this book's staging and
were re-read immediately before this append). Per this file's append rules, two of
2 Corinthians's five staged items were merged into existing rows' Where columns
earlier in this file rather than duplicated:

- **`false-teachers` (2 John row; Gal refs already merged):** `2 Cor 2:17;
  11:3–4, 13–15` appended — "false apostles, deceitful workers, masquerading as
  Christ's apostles" (11:13), with Satan himself masquerading as an angel of
  light (11:14–15), the serpent's craftiness aimed at corrupting minds (11:3),
  and "peddling the word of God" (2:17). The 2 John row explicitly invites
  sibling appends; 2 Corinthians 11:13–15 is one of the theme's defining texts.
- **`life-after-death` → `death-of-a-believer` (Philippians row):** `2 Cor
  5:1–8; 4:14` appended — the staged 2 Corinthians `life-after-death` row
  ("what happens when we die," "absent from the body, present with the Lord,"
  "heaven when I die") is the same believer's-hope-beyond-death gap the
  Philippians thread logged concurrently as `death-of-a-believer` (or
  `with-christ-after-death`): 2 Cor 5:8 and Phil 1:23 are the query family's
  twin texts, so 2 Corinthians contributes refs rather than a duplicate id.
  2 Cor 5:1–8 adds the eternal-dwelling ("a building from God... eternal, in
  the heavens") and at-home-with-the-Lord texts; 4:14 the raised-with-Jesus
  ground. The staged row's own cross-note (partial overlap with the Genesis
  `mortality` row — hope-beyond-death facet vs. why-we-die; decide one concept
  or two before minting) is already carried by the Philippians row's in-row
  overlap flag, so nothing is lost in the fold.

The rows below are new gaps (checked against the live table and vocabulary: no
unanswered-prayer, church-discipline, or unequally-yoked row exists anywhere in
this file, and none of the three ids is in the 131-id vocabulary).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `unanswered-prayer` | 2Cor 12:8–9 | "Why doesn't God answer my prayers" / "when God says no" is a heavy pastoral query with no home: `prayer` is keyed to how-to-pray and ask-and-receive phrases, and nothing serves the unanswered case. 2 Corinthians 12:8–9 is Scripture's paradigm text — asked three times, answered with sufficient grace instead of removal. `pastoral-strength-in-weakness` catches the grace side but not the query. | 2 Corinthians / 2026-08-23 |
| `unequally-yoked` | 2Cor 6:14–18 | "Unequally yoked" and "dating/marrying a non-believer" are heavy lay queries with no home: `godly-marriage` is marriage-teaching shaped and 6:14 names no marriage; `love-not-the-world` and `holiness` are adjacent but neither catches the yoking phrase or the relationship intent. Could alternatively be a lexicon extension of `holiness` or `love-not-the-world` — check that route before minting. | 2 Corinthians / 2026-08-23 |
| `church-discipline` | 2Cor 2:5–11; 7:8–12; 13:1–2, 10 | "Church discipline" / "how should a church handle sin" / "restoring a fallen believer" has no home: `the-lords-discipline` is God's discipline of individuals, and `forgiving-others` covers only the forgiveness half. 2 Corinthians narrates the full arc — punishment "inflicted by the many" (2:6), then forgiveness and restoration before the man is "swallowed up with his excessive sorrow" (2:7), with authority "for building up and not for tearing down" (13:10). Matt 18:15–17 and 1 Cor 5 will want the same row. | 2 Corinthians / 2026-08-23 |

## 1 John appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at write time (the Zephaniah
and Philippians blocks, and a concurrent 2 Corinthians ref-append to the
`false-teachers` row, were re-read before this append). Per this file's append
rules, two of 1 John's staged items were merged into existing rows' Where columns
earlier in this file rather than duplicated here:

- **`false-teachers` (2 John row; 2 Peter, Colossians, Galatians, and 2 Corinthians
  refs already merged):** `1 John 2:18–26; 4:1–6` appended — the row explicitly
  invites the catholic-epistle siblings, and 1 John supplies the theme's
  discernment command ("don't believe every spirit, but test the spirits," 4:1)
  and the they-went-out-from-us profile (2:19) alongside the deny-the-Christ
  denial texts (2:22–23; 4:2–3).
- **`idolatry` (Micah row; Hosea, Habakkuk, Malachi, Joshua, and Zephaniah refs
  already merged):** `1 John 5:21` appended — the letter's closing charge, "keep
  yourselves from idols," the gap's first NT-epistle ref in this log; 1 John's
  staged row noted the gap is vocabulary-wide, which the Micah row already records.

Withheld (checked and already covered — recorded so later threads don't re-log):
`born-again` (1 John's "born of God" refrain, 2:29; 3:9; 4:7; 5:1, 4, 18) —
`salvation.yaml`'s lexicon already carries "you must be born again" (and
`new-creation.yaml`'s header says salvation owns that phrasing); found by the
1 Peter thread's critic, verified by grep at this delivery. Withheld from this
log; a delivery note was added to the 1 John book doc.

The rows below are new gaps (checked at write time against the live table — no
antichrist or confession row exists anywhere in this file — and against the
ontology lexicons: no non-comment lexicon line in `ontology/concepts/*.yaml`
matches "antichrist" or "confess"; the only "confess" hits are YAML comments in
`forgiveness-of-sins.yaml` and `repentance.yaml`, which is what the second row's
extension caveat is for).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `antichrist` | 1 John 2:18, 22; 4:3; Rev 13:1–18; 17:8–14; 19:19–20 | "Who is the antichrist" is a massively common query, and 1 John is where the word actually occurs in Scripture (with 2 John 1:7). Could be folded into the `false-teachers` row's eventual concept or into a `second-coming` lexicon extension — decide one route before minting. | 1 John / 2026-08-23 |
| `confession-of-sin` | 1 John 1:8–10 | "Confessing your sins" / "confession in the Bible" queries name the practice, not the result; `forgiveness-of-sins` covers God's side and `repentance` the turning, but neither lexicon obviously serves "confess." Check a lexicon-extension route on those two concepts before minting a new id. | 1 John / 2026-08-23 |

## Exodus appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Exodus's locations to the named row earlier in this file — read them together
with that row; the other rows are new gaps. Sourced from the Exodus book doc's
Tag-gap candidates section (`exodus.md`, this directory) under its standing delivery
rule: every candidate re-checked by THEME against this file's live state at delivery
(including the Matthew, Job, Galatians, Malachi, Zephaniah, Philippians,
2 Corinthians, and 1 John blocks that landed after that doc's round-3 critic read) — no theme collision with the
eight new rows below; all append targets confirmed present, none already carrying
Exodus refs. Four of the doc's
candidates (`lament`, `knowing-god`, `idolatry`, and the justice/oppression theme)
had landed as sibling rows while the doc was in its critic loop and appear here as
ref-appends, as the doc's own annotations direct. The last three appends are the
optional proactive refs the round-3 critic flagged (rows that themselves cite or
anticipate the Exodus text); the fourth flagged option, `the-house-of-god`, was
skipped — no §9 duty, and the tabernacle material is already captured in the
Exodus doc's tags and motif lines.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `hardness-of-heart` | Exodus 4:21; 7:13–14, 22; 8:15, 19, 32; 9:12, 34–35; 10:1, 20, 27; 11:10; 14:4, 8, 17 | "Pharaoh hardened his heart" / "hardening of the heart" is one of the most-asked Exodus questions and a common self-examination query ("is my heart hardened?"). No concept covers it; `self-deception` is adjacent but names a different mechanism. The text carries both directions (Pharaoh hardens his own heart; the LORD hardens it), so the gist would need to describe, not adjudicate. | Exodus / 2026-08-23 |
| `passover` | Exodus 12:1–28, 43–51; 13:3–10 | "Passover" is a heavy, plain lay query (and a Holy Week query) with no concept to land on. `lords-supper` covers the NT meal, not the OT feast; tagging Exodus 12 with `lords-supper` would be a later-revelation read-back. | Exodus / 2026-08-23 |
| `grumbling-and-complaining` | Exodus 14:11–12; 15:24; 16:2–3, 7–8; 17:2–3 | "Grumbling/complaining in the Bible" is a common search; the murmuring motif is Exodus–Numbers' backbone and none of it is currently taggable. Distinct from the `lament` row earlier in this file (complaint *against* God/leaders vs complaint *to* God) — decide one concept or two before minting. | Exodus / 2026-08-23 |
| `the-name-of-god` | Exodus 3:13–15; 6:2–3; 9:16; 20:7; 34:5–7 | "I AM WHO I AM", "what is God's name", "meaning of Jehovah/Yahweh" are heavy queries with no concept. Distinct from the `knowing-god` row: this is the revelation and honor of the name itself (including the third commandment). | Exodus / 2026-08-23 |
| `sacrifice-and-atonement` | Exodus 29:10–14, 33, 36–37; 30:10, 15–16; 32:30 | Sacrificial atonement, sin offering, ransom for the soul — "atonement in the Old Testament," "sin offering meaning" have no home: `the-cross` is the NT atonement concept, and the conventions bar reading it back onto OT ritual. | Exodus / 2026-08-23 |
| `restitution` | Exodus 21:18–36; 22:1–15 (also 21:23–25) | Restitution and civil justice — paying back what was stolen or damaged, proportional remedy. "Restitution in the Bible," "eye for an eye" are common queries; `pastoral-refuge-and-justice` is keyed to the oppressed person's rescue, not civil remedy between neighbors. (Alternative id: `justice-and-restitution`.) | Exodus / 2026-08-23 |
| `priesthood` | Exodus 28:1–43; 29:1–37, 44; 39:1–31; 40:12–15; Heb 2:17–18; 4:14–16; 5:1–10; 6:20; 7:11–28; 8:1–2; 9:11–14, 24; 10:19–22 | The priesthood — mediation, ordination, bearing the people's names before God. "High priest in the Bible," "priests in the Old Testament" have no concept; heavy Hebrews-facing search traffic. Adjacent row: Job's `mediator` (the umpire/advocate longing) is a different register from the institution itself — decide the two together before minting. | Exodus / 2026-08-23 |
| `craftsmanship-and-creativity` | Exodus 31:1–11; 35:30–35; 36:1–2 | Spirit-given craftsmanship and creativity — "God and creativity," "art as worship." NOTE: check first whether a lexicon extension of `wisdom-from-god` serves better than a new id — its anchor here IS wisdom language. | Exodus / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Exodus 1:11–14 (taskmasters and hard service); 2:23–25 (Israel's cry under bondage comes up to God); 3:7–9 ("I have surely seen the affliction of my people... I know their sorrows"); 5:6–19 (bricks without straw); 6:5–7 | Register note for the row: Exodus adds the national-enslavement register — God's response to national-scale oppression of the poor and enslaved, the material routed out of pastoral-* tags under the 2026-08-23 pastoral-register ruling (Exodus doc, Decisions #46), which must not lose its landing place. | Exodus / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Exodus 20:3–6, 23; 22:20; 23:13, 24, 32–33; 32:1–8, 31–35; 34:12–17 | Adds the command texts the theme rests on (the first and second commandments) and the paradigm narrative for the row's "golden calf" query (Exodus 32), plus the covenant-snare warnings (23; 34). | Exodus / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Exodus 5:22–23; 17:4 | Adds the leader's raw "why" carried *to* God — "Lord, why have you brought trouble on this people?" — from its first narrative occurrence; distinct from the new `grumbling-and-complaining` row above (complaint to God vs complaint against God/leaders). | Exodus / 2026-08-23 |
| `knowing-god` *(append to existing Hosea row)* | Exodus 5:2; 6:7; 7:5, 17; 8:10, 22; 9:14, 29; 10:2; 14:4, 18; 16:12; 18:11 | "That you may know that I am the LORD" is the stated purpose of the plagues and the exodus — from Pharaoh's "I don't know the LORD" (5:2) to Jethro's "Now I know" (18:11). These purpose-formula refs bear on that row's flagged `hunger-for-god` lexicon-extension call (knowledge register, not desire register) — recorded for the curator, not adjudicated. | Exodus / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Exodus 2:22 ("I have lived as a foreigner in a foreign land"); 12:48–49 (one law for the native and the stranger who keeps Passover); 18:3; 22:21; 23:9 ("You shall not wrong an alien... for you were aliens in the land of Egypt") | Adds the you-were-foreigners command texts to the row's living-as-a-foreigner refs. | Exodus / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Exodus 3:2 (the LORD's angel appears in the flame of the bush); 14:19 (the angel of God moves behind the camp of Israel); 23:20–23 (the angel sent before Israel, "my name is in him"); 32:34; 33:2 | The angel-who-goes-before-the-nation texts; 23:20–23's "my name is in him" warrants the same record-without-settling care the Joshua append notes for Josh 5:13–15. | Exodus / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Exodus 18:13–26 | Jethro's structure of able, God-fearing rulers of thousands/hundreds/fifties/tens — the classic "biblical delegation" passage. | Exodus / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Exodus 22:10–11 | "The oath of the LORD shall be between them both" — the oath as a legal instrument settling bailment disputes. | Exodus / 2026-08-23 |
| `slow-to-anger` *(append to existing Nahum row)* | Exodus 34:6 | The formula's source text, which that row's rationale already cites and invites: the LORD's own self-proclamation — "a merciful and gracious God, slow to anger, and abundant in loving kindness and truth." | Exodus / 2026-08-23 |
| `cities-of-refuge` *(append to existing Joshua row)* | Exodus 21:13 | The institution's root text — "I will appoint you a place where he shall flee" — anticipating the Joshua 20 cities that row logs. | Exodus / 2026-08-23 |
| `care-for-widows` *(append to existing Ruth row)* | Exodus 22:22–24 | Adds the direct command anchor that row's lexicon note wants (the WEB's Ruth never says "widow"): "You shall not take advantage of any widow or fatherless child," with God's own I-will-surely-hear-their-cry sanction. | Exodus / 2026-08-23 |
## Jude appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at delivery. Vocabulary check
re-run at delivery against the 131 `ontology/concepts/*.yaml` lexicons: no
non-comment lexicon line matches "contend", "false teacher", or "apostasy", and
every "angel" hit is an incidental phrase inside another concept's lexicon
(e.g. `hospitality`'s "entertained angels", `gods-protection`'s "angels charge
over you"), not an angels concept — all three staged items are genuine gaps;
none withheld. Per this file's append rules, two of Jude's three staged items
were merged into existing rows' Where columns earlier in this file rather than
duplicated here:

- **`false-teachers` (2 John row; 2 Peter, Colossians, Galatians, 2 Corinthians,
  and 1 John refs already merged):** `Jude 1:4, 8–19` appended — the row
  explicitly invites the catholic-epistle siblings, and Jude supplies the
  letter's central subject: infiltrators who "crept in secretly," turning God's
  grace into indecency and denying Christ (1:4), exposed through the
  Cain–Balaam–Korah woe and the reefs/waterless-clouds/wandering-stars
  images (1:8–19).
- **`angels` (Genesis row; Joshua, Matthew, Job, and Exodus append-rows
  elsewhere in this file):** `Jude 1:6, 9` appended — the angels who "didn't
  keep their first domain," held in everlasting bonds under darkness (1:6), and
  Michael the archangel's dispute with the devil over the body of Moses (1:9)
  — both heavily searched angel texts ("fallen angels in chains", "Michael
  the archangel").

The row below is a new gap (checked at write time against the live table — no
contending-for-the-faith or defending-the-faith row exists anywhere in this
file — and against the ontology lexicons as above).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `contending-for-the-faith` | Jude 1:3–4, 17–23 | "Contend for the faith" / "defending the faith" / "standing up for truth" are common queries whose anchor text is Jude 3, with no vocabulary home: `faith` serves trust-in-Christ queries, not the defense of the once-for-all-delivered faith (the Jude doc dropped its `faith` tag on that ground — Decisions item 7). Distinct from the threat-side `false-teachers` row (this is the believer's response: contend, build up, keep yourselves, rescue). | Jude / 2026-08-23 |

## Mark appends — 2026-08-23 (Gospels+Acts thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Mark's locations to the named row earlier in this file — read them together
with that row; the other row is a new gap. Sourced from the Mark book doc's
Tag-gap candidates section (`mark.md`, this directory) and re-deduped against this
file's live state at delivery (the concurrent Jude block was re-read before this
append and collides with nothing below): Mark's refs for the gaps the Matthew block
logged go to those rows, and the themes sibling threads logged first follow the
same routing Matthew's delivery used — Mark staged `hypocrisy` (→ Amos's
`empty-worship`/`religious-hypocrisy` row) and `god-and-government` (→ Romans'
`governing-authorities` row); only `money-and-possessions` was still absent from
the live log at delivery and appears as a new row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `money-and-possessions` | Mark 4:19 (“the deceitfulness of riches”); 10:17–27 (the rich man, the needle’s eye); 12:41–44 | "What does the Bible say about money," "can a rich person be saved," "danger of wealth" are heavy lay queries. The vocabulary covers giving (`generosity`, `tithing`) and money-contentment (`contentment`), but not the danger-of-riches teaching these passages carry. Check the lexicon-extension route on `contentment` or `love-not-the-world` before minting. | Mark (Gospels+Acts) / 2026-08-23 |
| `kingdom-of-heaven` (or `kingdom-of-god`) *(append to existing Matthew row)* | Mark 1:14–15; 4:11, 26–32; 9:1, 47; 10:14–15, 23–25; 12:34; 14:25; 15:43 | Mark’s form is “God’s Kingdom” throughout — if minted, the id/lexicon must cover both phrasings ("kingdom of God", "kingdom of heaven"). | Mark (Gospels+Acts) / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | Mark 1:16–20; 2:14; 8:34–38; 10:21, 28–31 | "Take up your cross" and "follow me" are Mark’s spine; `suffering-for-christ` and `surrender-to-god` catch facets, but the call-to-follow query family still has no home. | Mark (Gospels+Acts) / 2026-08-23 |
| `blasphemy-against-the-spirit` *(append to existing Matthew row)* | Mark 3:28–30 | Mark adds the narrator’s reason: “because they said, ‘He has an unclean spirit.’” (3:30). | Mark (Gospels+Acts) / 2026-08-23 |
| `deliverance-from-demons` *(append to existing Matthew row)* | Mark 1:21–28, 32–34, 39; 3:11–12, 22–27; 5:1–20; 6:7, 13; 7:24–30; 9:14–29, 38–39 | Mark is Scripture’s densest deliverance narrative; the strongest single anchor set for this proposed concept. | Mark (Gospels+Acts) / 2026-08-23 |
| `servanthood` *(append to existing Matthew row)* | Mark 9:35; 10:42–45 | 10:45 (“not to be served but to serve”) is the theme’s definitive verse; supports the row’s extension-check against `humble-exaltation`. | Mark (Gospels+Acts) / 2026-08-23 |
| `mercy` *(append to existing Hosea row)* | Mark 5:19 (“how he had mercy on you”); 10:47–48 (“have mercy on me!”) | Mark staged this under the Matthew drafts’ `mercy` proposal; the Hosea row logged the gap first (Matthew’s refs are already appended there). | Mark (Gospels+Acts) / 2026-08-23 |
| `empty-worship` (or `religious-hypocrisy`) *(append to existing Amos row)* | Mark 7:6 (“you hypocrites”); 12:15 (“knowing their hypocrisy”); 12:38–40 | Mark staged this as `hypocrisy` — the same gap the Amos row logged first (same routing as Matthew’s delivery): Mark carries the Isaiah lips/heart indictment and the scribes’ pretense. | Mark (Gospels+Acts) / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | Mark 12:29–33 | The Shema plus “more important than all whole burnt offerings” (12:33) — the greatest-commandment register that row logs. | Mark (Gospels+Acts) / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Mark 12:13–17 | Mark staged this as `god-and-government` — the same gap the Romans row logged first ("should Christians pay taxes"); "give to Caesar the things that are Caesar's" is Mark's form of the query family's most-quoted text. | Mark (Gospels+Acts) / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | Mark 1:12–13 (“tempted by Satan,” forty days); 14:38 (“Watch and pray, that you may not enter into temptation”) | Mark's compressed wilderness temptation and the Gethsemane watch-and-pray charge add to the row's plain-"temptation" anchor set. | Mark (Gospels+Acts) / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Mark 1:13 (“the angels were serving him”); 8:38; 12:25; 13:27, 32 | Ministry in the wilderness, the Son of Man coming “with the holy angels,” the risen “like angels in heaven,” the gathering angels, and the angels’ ignorance of the day. (Mark 16:5’s “young man… dressed in a white robe” is not called an angel in the WEB text and is not claimed as one.) | Mark (Gospels+Acts) / 2026-08-23 |

Extension-check flags from Mark (not gap rows; for curation review before any new id):

- **Resurrection of the dead generally** — Mark 12:18–27 teaches the general
  resurrection; adds Mark's parallel to the flag at the end of the Matthew block
  (if `resurrection` ("He is risen") is Easter-scoped, check a lexicon extension
  for "resurrection of the dead" / "life after death" queries before minting).
- **Watchfulness / readiness** — Mark 13:33–37 (“Watch!”) and 14:38 (“Watch and
  pray”). "Keep watch" / "be ready for Christ's return" queries most naturally
  extend `second-coming`'s lexicon; check that route before proposing a concept.

## James appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads. Re-deduped against this file's live state at delivery (the Exodus and Jude
blocks, the newest at read time, were re-read immediately before this append) and
re-checked against the `ontology/concepts/*.yaml` lexicons. Per this file's append
rules, six of James's staged items were merged into existing rows' Where columns
earlier in this file rather than duplicated here:

- **`temptation` (Genesis row):** `Jas 1:2, 12–15` appended — the NT's anatomy of
  temptation ("each one is tempted when he is drawn away by his own lust and
  enticed," 1:14). Lexicon check at delivery confirms the row still open: the
  vocabulary carries only the response side (`resisting-the-devil`,
  `remembered-a-way-of-escape`, `testing`).
- **`oaths-and-vows` (Genesis row):** `Jas 5:12` appended — the epistles' oath
  prohibition ("let your "yes" be "yes", and your "no", "no""), the counterpart to
  the Matt 5:33–37 teaching in the Matthew append block.
- **`mortality` (Genesis row):** `Jas 1:10–11; 4:14` appended — "you are a vapor
  that appears for a little time and then vanishes away" (4:14), and the rich man
  fading like the flower of the grass (1:10–11).
- **`judging-others` (Romans row):** `Jas 4:11–12; 2:12–13; 5:9` appended — the
  James doc staged this as a new row, but the Romans row is the same gap and its
  rationale already cites Jas 4:11–12 ("who are you to judge another?"); James also
  adds the judged-by-the-law-of-freedom texts (2:12–13) and "the judge stands at
  the door" (5:9).
- **`care-for-widows` (Ruth row):** `Jas 1:27` appended — the James doc staged this
  as a new `widows-and-orphans` row, itself flagged thin (one defining verse); the
  Ruth row is the same gap, already names James 1:27 as a wanted anchor, and its
  Exodus append (Exod 22:22–24) supplies the command anchor — the thinness flag
  resolves by merging. Lexicon check at delivery: no lexicon owns
  "widow"/"orphan"/"fatherless" (only YAML comment lines), so the row itself
  remains a genuine gap.
- **`justice-and-oppression` (Micah row):** `Jas 2:6–7; 5:1–6` appended — the James
  doc's staged `wealth-and-poverty` row folds here for its oppression side (the
  rich oppressing and dragging believers to court, 2:6–7; wages held back by fraud
  crying out to the Lord of Armies, 5:1–6). The rest of that staged row was
  withheld on vocabulary evidence found at delivery: `contentment.yaml`'s lexicon
  deliberately carries bare "wealth" and "money" as designed triggers routing
  money/wealth queries to the canon's contentment teaching, so the staged
  rationale's "no home" claim for the money-query side is partly false. The
  rich-poor reversal texts (Jas 1:9–11; 2:5 — the lowly exalted, the poor chosen
  "to be rich in faith") fit neither the oppression row nor `contentment` cleanly;
  they are recorded here for the eventual curator (nearest vocabulary neighbor:
  `humble-exaltation` for 1:9–10's lowly/exalted frame) rather than minted as a
  thin row.

The row below is a new gap (checked at write time against the live table — no
favoritism/partiality row exists anywhere in this file — and against the ontology
lexicons: no lexicon line matches "favoritism" or "partiality"; the only grep hits
are incidental comment words in `divine-judgment.yaml` ("impartial") and
`image-of-god.yaml` ("partially"), neither a lexicon entry).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `favoritism` | James 2:1–9; 3:17 ("without partiality") | "Favoritism in the Bible" / "showing partiality" is a plain lay query with no vocabulary home; James 2:1–9 is Scripture's direct treatment, and no current id (not `loving-others`, not `harmony-with-others`) names the sin itself. | James / 2026-08-23 |

## Zechariah appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited except the permitted Where-column
ref-merges listed below. The live file was re-read immediately before this
append (the concurrent Mark block was present and collides with nothing here);
a James block then landed concurrently with this write, and its full-file save
briefly reverted these eleven Where-column merges — they were re-deduped
against the James-updated rows (its `justice-and-oppression` refs now precede
Zechariah's there) and re-applied; this note records the race. Per this file's
append rules, all twelve of Zechariah's staged ref items were merged into
existing rows' Where columns earlier in this file rather than duplicated as
rows:

- **`day-of-the-lord` (Obadiah row):** `Zech 14:1–21 ("Behold, a day of the
  LORD comes," 14:1); 12:3–9` appended — Zechariah 14 is the theme's fullest
  single-chapter panorama, and the "in that day" refrain runs through chs. 12–14.
- **`fasting` (Joel row):** `Zech 7:3–6; 8:19` appended — the fasting-practice
  question put to the priests, and the fasts turned to "joy, gladness, and
  cheerful feasts."
- **`lament` (Joel row):** `Zech 12:10–14` appended WITH CAVEAT — a God-given,
  structured public mourning (family by family), but penitential mourning over
  the pierced one rather than disaster lament; weigh the ref accordingly.
- **`idolatry` (Micah row):** `Zech 10:2; 13:2` appended — teraphim speaking
  vanity, and the day the names of the idols are "remembered no more."
- **`remnant` (Micah row):** `Zech 8:6, 11–12; 9:7; 13:8–9; 14:16` appended —
  the remnant inheriting the promises, a Philistine "remnant for our God," the
  refined third, and "everyone who is left of all the nations."
- **`false-prophets` (Micah row):** `Zech 10:2; 13:2–6` appended — diviners who
  "have seen a lie" and the purge in which prophets deny the trade.
- **`justice-and-oppression` (Micah row):** `Zech 7:9–10; 8:16–17; 9:8; 10:2;
  11:4–6` appended — Zechariah's staged `oppression` and `justice-and-oppression`
  items both fold here (the same routing Nahum's and Zephaniah's oppression gaps
  took): "Execute true judgment," protect widow/fatherless/foreigner/poor, truth
  and peace in the gates, "no oppressor will pass through them any more," and the
  flock "oppressed, because there is no shepherd," sold by its own shepherds.
- **`empty-worship` (Amos row):** `Zech 7:5–6` appended — "did you at all fast
  to me, really to me?"
- **`outpouring-of-the-spirit` (Joel row):** `Zech 4:6; 12:10` appended WITH
  CAVEAT — 4:6 is Spirit-empowerment for the work ("Not by might, nor by power,
  but by my Spirit") and 12:10 "the spirit of grace and of supplication" poured
  out; both are the OT Spirit register that row documents, neither is the Joel
  outpouring-on-all-flesh scene itself.
- **`restoration-of-israel` (Obadiah row):** `Zech 1:16–17; 8:1–8; 9:12;
  10:6–10` appended — house rebuilt, cities overflowing, playing children in the
  streets, double restored, the second exodus from Egypt and Assyria.
- **`angels` (Genesis row):** `Zech 1:9–14; 2:3–4; 3:1–7; 4:1–6; 5:5–11; 6:4–5`
  appended — "the angel who talked with me" interprets the whole night-vision
  sequence; the LORD's angel intercedes for Jerusalem (1:12) and presides over
  Joshua's cleansing.

Checked and not logged (recorded so later threads don't re-log): Satan the
accuser (Zech 3:1–2) → `resisting-the-devil` carries "satan" in its lexicon, so
the plain query routes there; possibly a lexicon note ("the accuser") for that
pack. Refiner's fire / tested like gold (Zech 13:9) → covered: `testing` anchors
Zech 13:9 itself. "Return to me and I will return to you" (Zech 1:3) → covered:
`repentance` lexicon; anchor candidate. "Speak truth with your neighbor"
(Zech 8:16) → covered: `honesty` (its lead anchor Eph 4:25 quotes the verse).
God's jealousy/zeal (Zech 1:14; 8:2) → real theme but not judged a searched
register; `envy-and-jealousy` is the human vice and must NOT receive these refs.
Kingship of God ("The LORD will be King over all the earth," Zech 14:9) →
logging deferred per the Zechariah capture file; the Matthew block's
`kingdom-of-heaven` (or `kingdom-of-god`) row now exists, and whether Zech 14:9
belongs in an eventual both-testaments kingdom pack is left to the curator.

The rows below are new gaps (checked at write time against the live table:
no messianic-prophecy, Branch-title, or shepherd-and-flock row exists anywhere
in this file, and none of the three ids is in the 131-id vocabulary).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `messianic-prophecy` | Zech 9:9; 11:12–13; 12:10; 13:7 | "Messianic prophecies" / "prophecies about Jesus" / "old testament prophecies fulfilled" are heavy lay queries with no home, and the no-read-back rule (rightly) keeps chapter tags from serving them: Zechariah alone carries four passion-narrative citations (Palm Sunday, thirty silver, the pierced one, the struck shepherd) reachable today only by verbatim wording. A pack would need careful locator design — "the NT cites this passage" as attributed fact, never adjudicated fulfillment — and would also serve Mic 5:2, Hos 11:1, Mal 3:1, Isa 7:14/53. | Zechariah / 2026-08-23 |
| `the-branch` | Zech 3:8; 6:12–13 | "Who is the Branch in the Bible" / "the Branch prophecy" is a real study query for a named messianic title with no concept home (`christ-the-cornerstone` shows the title-locator pattern but covers a different title). Zechariah gives the title twice — servant-Branch and priest-king Branch who builds the LORD's temple — and Isa 4:2; 11:1; Jer 23:5; 33:15 complete the set. Could alternatively fold into a `messianic-prophecy` pack (row above); decide one design before minting. | Zechariah / 2026-08-23 |
| `shepherds-and-the-flock` | Zech 10:2–3; 11:4–17; 13:7 | "Bad shepherds in the Bible" / "God as shepherd" / "shepherd and flock meaning" are common queries with no home — no shepherd concept exists anywhere in the 131. Zechariah gives the theme its darkest OT form (the flock of slaughter, the worthless shepherd who leaves the flock, the struck shepherd), and Ezek 34, Ps 23, Jer 23:1–4, and John 10 are the cross-book core a pack would carry. `pastoral-*` ids are the crisis register, not this civic/leadership theme. | Zechariah / 2026-08-23 |

## 1 Samuel appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Re-deduped against this file's live
state immediately before this append (the concurrent Mark, James, and Zechariah
blocks were the newest present and collide with nothing below). Rows marked
*(append to existing row)* add 1 Samuel's locations to the named row earlier in
this file — read them together with that row; the other four rows are new gaps
(checked at write time: no `the-lords-anointed`, `occult-and-divination`,
`god-looks-at-the-heart`, or plain `deliverance` row exists anywhere in this
file — Matthew's `deliverance-from-demons` is a different theme, exorcism
narrative, not God's rescue register — and none of the four ids is in the 131-id
vocabulary). Sourced from the 1 Samuel book doc's Tag-gap section (`1-samuel.md`,
this directory).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `the-lords-anointed` | 1 Sam 24:6, 10; 26:9–11, 16, 23; 10:1; 16:13 | "Touch not the Lord's anointed" is a heavy lay query (often misapplied to modern leaders) with no vocabulary home; 1 Samuel is its source book — David twice refuses to harm Saul on exactly this ground, and the anointings of Saul (10:1) and David (16:13) define the term. A pack could carry the phrase's actual narrative meaning as attributed fact without adjudicating its modern use. | 1 Samuel / 2026-08-23 |
| `occult-and-divination` | 1 Sam 28:3, 7–20 (the medium at Endor; the ban at 28:3, 9; cf. 15:23 "the sin of witchcraft") | "What does the Bible say about mediums / psychics / seances / witchcraft" is a common and pastorally live query family with no home — `resisting-the-devil` is the believer's-resistance register, not the practice prohibition. 1 Samuel 28 is the canon's most famous narrative case, with the ban stated inside the chapter; Deut 18:9–14, Lev 19:31, and Acts 19:18–19 would complete a pack. | 1 Samuel / 2026-08-23 |
| `god-looks-at-the-heart` | 1 Sam 16:7 | "Man looks at the outward appearance, but the LORD looks at the heart" is one of the most-searched single verses in the book, and no concept carries it — nearest neighbors miss the register (`identity-in-christ` is NT-standing, `humility` is the virtue). Possibly a lexicon extension on an existing pack rather than a new id — flagged for the curator to decide extension-vs-mint. | 1 Samuel / 2026-08-23 |
| `deliverance` | 1 Sam 7:8, 10–12; 9:16; 11:13; 14:23, 45; 17:37, 46–47; 26:24 | "God delivered me / will deliver you" in the plain rescue register saturates 1 Samuel ("the LORD saved Israel that day," 14:23; "the LORD who delivered me out of the paw of the lion…," 17:37) and has no home: `salvation` is gospel-keyed, `gods-protection` is the shielding register, `pastoral-freedom-from-bondage` is the crisis pack. The Judges draft (not yet finalized) proposes the same row and should append its refs here when it lands. | 1 Samuel / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | 1 Sam 2:8 ("He raises up the poor out of the dust"); 8:3 (Samuel's sons "took bribes, and perverted justice"); 12:3–4 (Samuel's clean-hands accounting) | 1 Samuel adds the theme's courtroom register — bribery named as the corruption of judges, and a leader inviting audit. Routed here per the project-wide pastoral-register ruling (national-scale justice material never takes `pastoral-*` ids). | 1 Samuel / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | 1 Sam 7:3–4 (putting away the Baals and Ashtaroth); 12:21 ("vain things which can't profit"); 15:23 (stubbornness "is as idolatry and teraphim") | The put-away-foreign-gods revival at Mizpah and Samuel's "vain things" warning; 15:23 extends the register to idolatry-as-analogy. | 1 Samuel / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | 1 Sam 12:14, 24 ("only fear the LORD, and serve him in truth with all your heart") | Samuel's covenant-renewal charge states the theme in its classic form, twice in one chapter. | 1 Samuel / 2026-08-23 |
| `remembrance-and-memorials` *(append to existing Joshua row)* | 1 Sam 7:12 (the Ebenezer stone — "The LORD helped us until now") | A named memorial stone raised so help received is not forgotten — exactly the row's stones-of-remembrance register, and the source of the hymn query "raise my Ebenezer." | 1 Samuel / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | 1 Sam 1:11 (Hannah's vow, kept at 1:24–28); 14:24–45 (Saul's rash oath and its near-fatal cost); 20:12–17, 42 (Jonathan and David's sworn covenant) | 1 Samuel carries the row's full range in narrative: a vow kept at great cost, a rash oath that traps its maker, and a binding oath between friends. | 1 Samuel / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | 1 Sam 25:1 (Samuel's death, all Israel lamenting, burial at Ramah); 31:11–13 (the men of Jabesh Gilead recover and bury Saul's body, fasting seven days) | Two burial notices with honor practices — national mourning for Samuel; the Jabesh Gilead rescue repaying Saul's first deliverance. | 1 Samuel / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 1 Sam 8:10–18 (the manner of the king who will take); 12:1–5 (Samuel's clean-hands accounting); 16:7 (the LORD's criterion for the leader he chooses) | 1 Samuel is the canon's sustained study of leadership sought, granted, abused, and transferred; 8:11–17's "he will take" catalog is its definitive warning text. | 1 Samuel / 2026-08-23 |
| `lament` *(append to existing Joel row)* | 1 Sam 7:2 ("all the house of Israel lamented after the LORD") — this ref only, WITH CAVEAT | Corporate lament turning Israel back to the LORD before Mizpah — but the phrase describes penitential longing, not disaster lament; weigh the ref accordingly. 1 Samuel's grief scenes (15:35; 30:4) were checked and declined for this row: personal grief, not the lament practice the row documents. | 1 Samuel / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-log): angels — 1
Samuel has no angel appearance (29:9's "as an angel of God" is Achish's simile,
not an angel), so nothing to append to the Genesis `angels` row.
Grief at 15:35 and 30:4 — declined for the `lament` row (see its caveat above).
"God's surprising choice" (the youngest, the overlooked; 16:11–12; 9:21) —
deferred without a row: it overlaps `god-looks-at-the-heart` above and
`humble-exaltation`'s reversal register; one design should be decided before any
row is minted.

Lexicon-extension flags from 1 Samuel (not gap rows; for curation review):
"to obey is better than sacrifice" (15:22) → `obedience-to-the-word` lexicon;
"David strengthened himself in the LORD his God" (30:6) →
`pastoral-hope-in-despair` lexicon; "Speak; for your servant hears" (3:10) →
`guidance` lexicon; God's-own-holiness ("Who is able to stand before the LORD,
this holy God?", 6:20; "there is no one as holy as the LORD", 2:2) → review
whether `holiness` (called-to-be-holy register) should carry a
God's-own-holiness lexicon extension or the sense stays untagged.


## Lamentations appends — 2026-08-23 (Isaiah–Daniel thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Re-deduped against this file's live
state immediately before this append (full re-read at delivery; the 1 Samuel
block was the newest present and collides with nothing below). Routing resolved
per the Lamentations staged file's append-time rule (`tag-gaps-proposed.md`,
routing last reconciled in critic Round 4 against the 2026-08-23T06:33Z live
read): every staged owner row was confirmed still present and unmoved at this
delivery, so all six items land as ref-appends and Lamentations mints NO new
row — including its staged §(a) `unanswered-prayer` row, which folds into the
live 2 Corinthians row exactly as that section's fallback directs. Rows marked
*(append to existing row)* add Lamentations's locations to the named row earlier
in this file — read them together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `unanswered-prayer` *(append to existing 2 Corinthians row)* | Lam 3:8 ("he shuts out my prayer"); 3:44 ("You have covered yourself with a cloud, so that no prayer can pass through") | Lamentations states the praying-into-silence experience more starkly than any other book, the OT counterpart to the row's 2 Cor 12:8–9 paradigm; Job, Ps 22:2, and Hab 1:2 would join the refs. Register boundary with the live Amos `famine-of-hearing-gods-word` row, which stakes the "when God is silent" query: Amos 8:11–12 is God withholding his WORD as judgment; Lamentations is God shutting out PRAYER (3:8, 44) — the alternative id `when-god-is-silent` was dropped in staging so the two rows don't compete, and the curator of either eventual pack should settle that query's lexicon routing across both rows together. Gist wording needs care: the same poem later testifies "You heard my voice" (3:56), so the concept should route to what Scripture says about seasons of silence, not teach that God does not hear. | Lamentations / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Lam 1–5 (the whole book — e.g. 1:12, 16; 2:11, 18–19; 3:19–20, 48–51; 5:1–22) | Lamentations is the canonical anchor for this row, and the row's own rationale anticipates it ("whole books — Lamentations, many Psalms — will hit this gap"). Adds the sustained book-length form alongside the row's communal (Joel), personal-complaint (Ruth, Job), and structured-complaint (Habakkuk) refs. Boundary note: the individual poem of Lam 3 sits on the same `wrestling-with-god` / `doubt` edge the Jeremiah confessions carry (Jer 15:10–18; 20:7–18, routed to this row by the Jeremiah thread) and should inherit whatever ruling that boundary note gets. | Lamentations / 2026-08-23 |
| `false-prophets` *(append to existing Micah row)* | Lam 2:14 ("Your prophets have seen false and foolish visions for you"); 4:13 (the prophets' sins named as a cause of the fall) | Lamentations supplies the aftermath register for the row: the ruined city looking back at the prophets who saw "false and foolish visions" and "have not uncovered your iniquity" — the outcome the row's prophet-for-hire profiles (Micah, Jeremiah, Ezekiel refs) warn toward, with 4:13 tracing the fall itself to the prophets' sins and the priests' iniquities. | Lamentations / 2026-08-23 |
| `care-for-widows` *(append to existing Ruth row)* | Lam 5:3 ("We are orphans and fatherless. Our mothers are as widows.") | Supplies exactly the orphans-and-widows self-description that the row's widening note (from Jeremiah's folded `widows-and-orphans` staging — Jer 7:6; 22:3; 49:11) contemplates for the eventual id: the category voiced by the sufferers themselves rather than legislated for, alongside the row's command anchors (Exod 22:22–24; Jas 1:27). | Lamentations / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Lam 1:3 ("Judah has gone into captivity... She dwells among the nations. She finds no rest.") | Adds the exile register — displacement as judgment, rest not found among the nations — following the Jeremiah thread's precedent of routing exile texts to this row rather than minting a separate `exile` id; if the eventual concept is minted, its gist should cover exile as well as sojourning. | Lamentations / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Lam 3:60–66; 1:21–22 | Vengeance committed to God rather than taken — "You will pay them back, LORD, according to the work of their hands" (3:64), and the city asking God to deal with her gloating enemies (1:21–22) — exactly the routing the row's wording concern asks for (to what Scripture says about vengeance, never endorsement), alongside its Nah 1:2–3 vengeance-belongs-to-God refs. | Lamentations / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-log): famine/scarcity
(Lam 2:11–12, 19–20; 4:4–10; 5:9–10) → covered by the PR #41 `gods-provision`
famine lexicon extension; God's wrath (Lam 2:1–4; 4:11) → recorded in the
Lamentations book doc as a `divine-judgment` lexicon-extension candidate, not a
gap; no-comforter phrasing (Lam 1:2, 9, 16–17, 21) → a `god-of-all-comfort`
lexicon check, recorded in the book doc; sexual violence in war (Lam 5:11) → one
verse, flagged in the book doc as a motif for a future cross-book decision
(Gen 34; Judg 19), not a row.

## Leviticus appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Leviticus book doc's
Tag-gap candidates section (`leviticus.md`, this directory) under its standing
delivery rule: every candidate re-checked by THEME against this file's live state
immediately before this append (including the Mark, James, Zechariah, and 1 Samuel
blocks that landed after that doc's round-3 critic read). Delivery-time conversions,
all per §9's append-to-existing rule: (1) the five rows the doc labels
EXODUS-proposed (`sacrifice-and-atonement`, `priesthood`, `restitution`,
`the-name-of-god`, `passover`) are now LIVE under exactly those ids — the Exodus
block delivered — so they appear here as ref-appends, as the doc's own annotations
direct; (2) the doc's proposed NEW row `occult-and-divination` was minted first by
the 1 Samuel block (whose rationale already cites Lev 19:31 as pack material), so
Leviticus's refs append to that row instead of duplicating it; (3) the doc's
"noted, not logged" confession-of-sin refs are delivered as an append to the live
1 John `confession-of-sin` row, per the round-3 critic's delivery-time
recommendation — the theme is now listed, so §9 routes the refs there (the doc's
near-covered ruling and its check-the-lexicon-route-first advice stand unchanged
on that row). No dedupe skips were needed: the live file carries no Leviticus refs
in any target row (Ruth's and 1 Samuel's rationale citations of Lev 19 are their
own text, not appends). The two remaining NEW rows below collide with nothing live
by theme and with no id in the 131-id vocabulary; the Numbers and Deuteronomy docs
also reference both names — this mint establishes the rows they will append to.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `clean-and-unclean` | Lev 10:10; 11:1–47; 12:1–8; 13:1–59; 14:33–57; 15:1–33 | The clean/unclean category system — foods, childbirth, disease, mildew, bodily discharges, and the priestly charge to "make a distinction between the holy and the common, and between the unclean and the clean." "Clean and unclean animals," "kosher laws in the Bible," "why couldn't Israelites eat pork," "ceremonial uncleanness," "purity laws" are heavy lay queries with no home: `holiness` covers the call to be holy, not the category system that Leviticus 11–15 spends five chapters mapping. (Alternative id: `purity-laws`.) | Leviticus / 2026-08-23 |
| `appointed-feasts` | Lev 23:1–44 | The LORD's appointed feasts as a system — Sabbath, Unleavened Bread, Firstfruits, Weeks, Trumpets, Day of Atonement, Tabernacles. "Feasts of the Lord," "Feast of Tabernacles," "Pentecost in the Old Testament" queries have no home. Scoped to complement, not absorb, the live `passover` row (Exodus block): Passover-specific queries go there (Lev 23:4–8 appended below); the calendar-as-a-system queries land here. Merging the two into one wider feasts concept is flagged as the reviewer's call — see the Leviticus doc, Decisions #45. | Leviticus / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Lev 19:26, 31; 20:6, 27 | The command-law base beneath that row's Endor narrative: mediums, wizards, enchantments, sorcery prohibited — 19:31 is the very ref the row's rationale says would complete a pack. Also present in the Exodus span (Ex 22:18), though not logged by the Exodus block. | Leviticus / 2026-08-23 |
| `sacrifice-and-atonement` *(append to existing Exodus row)* | Lev 1:4; 4:20, 26, 31, 35; 5:5–13; 6:6–7; 9:7; 12:7–8; 14:18–20, 53; 16:1–34 (the Day of Atonement itself — the concept's central OT chapter); 17:11 ("it is the blood that makes atonement by reason of the life") | Leviticus is the Bible's densest atonement text — "the priest shall make atonement for him, and he will be forgiven" is the offering laws' refrain. | Leviticus / 2026-08-23 |
| `priesthood` *(append to existing Exodus row)* | Lev 6:8–7:38 (the priests' handling laws and portions); 8:1–36 (ordination); 9:1–24 (first ministry); 10:8–11 (the priests' charge to distinguish and teach); 16:32–33 (the anointed priest who makes atonement); 21:1–22:16 (the priests' holiness code) | Adds the institution's working life to the Exodus row's establishment texts: ordination performed, first ministry, the teaching charge, and the priests' own holiness code. | Leviticus / 2026-08-23 |
| `restitution` *(append to existing Exodus row)* | Lev 5:16; 6:1–7 ("he shall restore it in full, and shall add a fifth part more to it"); 24:17–21 ("fracture for fracture, eye for eye, tooth for tooth"; making good a killed animal) | Adds the restore-plus-a-fifth statutes and Leviticus's own proportional-remedy text to the Exodus row's civil-remedy base. | Leviticus / 2026-08-23 |
| `the-name-of-god` *(append to existing Exodus row)* | Lev 24:10–16, 23 (the blasphemer of the Name); 19:12 (no false swearing by the name); 22:32 ("You shall not profane my holy name") | Adds the honor-of-the-name side — the canon's paradigm blasphemy narrative and the profaning prohibitions — to the Exodus row's revelation-of-the-name texts. | Leviticus / 2026-08-23 |
| `passover` *(append to existing Exodus row)* | Lev 23:4–8 (the LORD's Passover and Unleavened Bread in the feast calendar) | Passover's place in the appointed-feasts calendar; scoped against the new `appointed-feasts` row above — Passover-specific queries here, calendar-as-a-system queries there. | Leviticus / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Lev 19:33–34 ("you shall love him as yourself; for you lived as foreigners in the land of Egypt"); 24:22 (one law for foreigner and native); 25:23 ("you are strangers and live as foreigners with me") | Adds the love-the-foreigner command texts — including 25:23's turn where Israel itself lives as strangers with God — to the row's living-as-a-foreigner refs. | Leviticus / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Lev 5:4 (the rash oath — "swears rashly with his lips to do evil or to do good" — as a sin requiring confession and offering); 19:12 (no false swearing by the name); 27:1–29 (the vow-valuation system and devoted things) | Adds the statute side to the row's narrative oaths: the rash oath as sin, false swearing prohibited, and the Bible's fullest vow-valuation system. | Leviticus / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Lev 19:13–15, 33–34 (no oppression or robbery, wages not held overnight, protections for the deaf and blind, impartial courts, no wronging the foreigner); 25:14, 17, 35–43, 46, 53 ("You shall not wrong one another," no interest from the poor, no harsh rule over bondservants) | The command-law base beneath the row's prophetic indictments — Lev 19 is the gleaning/wage/impartial-court statute layer the Ruth append's register note anticipates; these refs land on the row's provision-care/civic-statute side. Routed here per the project-wide pastoral-register ruling (Leviticus doc, Decisions #31). | Leviticus / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Lev 16:29–31 ("you shall afflict your souls" — the Day of Atonement's commanded self-denial, traditionally understood as fasting); 23:27–32 | Scripture's only commanded regular fast-day belongs on the fasting row; the Leviticus doc's ch 16 gloss ("traditionally fasting") already makes the connection. | Leviticus / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Lev 19:18a ("You shall not take vengeance, nor bear any grudge against the children of your people") | Scripture's most direct prohibition of personal vengeance — the very verse the row's "revenge in the Bible" queries should reach first. | Leviticus / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Lev 17:7 (goat idols); 19:4 ("Don't turn to idols, nor make molten gods"); 26:1, 30 (idols, pillars, figured stones; high places and incense altars) | Adds the Sinai command-law layer — no molten gods, no pillars or figured stones — plus the covenant-curse purge of high places, to the row's prophetic and narrative refs. | Leviticus / 2026-08-23 |
| `kinsman-redeemer` *(append to existing Ruth row)* | Lev 25:25–28, 47–55 (the kinsman who redeems sold land and persons) | The institution's statute base beneath Ruth's narrative — the right of redemption for land and for a brother sold into servitude. | Leviticus / 2026-08-23 |
| `confession-of-sin` *(append to existing 1 John row)* | Lev 5:5 ("he shall confess that in which he has sinned"); 16:21 (all Israel's iniquities confessed onto the scapegoat's head); 26:40 ("If they confess their iniquity" — confession as the exile's turning point) | The OT command base for that row's practice register: confession required with the offering, enacted nationally on the Day of Atonement, and holding the door of covenant hope open in exile. The row's check-a-lexicon-extension-route-first advice stands; these refs simply complete the theme's canon span. | Leviticus / 2026-08-23 |

## 1 Corinthians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the 1 Corinthians staged
gap file (`1-corinthians-gaps.md`, book-thread scratchpad) and re-deduped in full
against this file's live state immediately before this append (the Lamentations
and Leviticus blocks were the newest present and collide with nothing below; no
row anywhere in the file carried 1 Corinthians refs). The staging predates most of
this file's growth — it was deduped only against the original Genesis-era table —
so two of its proposed NEW rows fold into rows sibling threads landed first:
`church-discipline` (→ the 2 Corinthians row, whose rationale already says
"Matt 18:15–17 and 1 Cor 5 will want the same row") and `supporting-gospel-workers`
(→ the 3 John row, same suggested id and query family). Its two staged
Genesis-row appends (`temptation`, `mortality`) were confirmed against their
still-present targets, which carry no 1 Corinthians refs. Rows marked *(append to
existing row)* add 1 Corinthians's locations to the named row earlier in this
file — read them together with that row; the other four rows are new gaps
(checked at write time: no singleness, glory-of-God-living, tongues, or
head-coverings row exists anywhere in this file, and none of the four ids is in
the 131-id vocabulary).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `singleness` | 1Co 7:7–9, 25–35, 39–40 | "Gift of singleness," "is it OK to stay single," "singleness in the Bible" — 1 Corinthians 7 is Scripture's fullest positive treatment of the unmarried life ("each man has his own gift from God," 7:7; undistracted devotion, 7:32–35), and the vocabulary covers only the married side (`godly-marriage`, `pastoral-marriage-divorce-teaching`). | 1 Corinthians / 2026-08-23 |
| `living-for-gods-glory` | 1Co 10:31; 6:20 | "Do everything for the glory of God," "glorify God in everything I do" — 10:31 is the classic all-of-life verse and 6:20 its body-specific twin; no concept carries glory-of-God-living queries (`worship` is praise/practice-shaped, `surrender-to-god` is lexiconned to cross-bearing/sacrifice, and the Haggai `putting-god-first` row earlier in this file is the priorities register — a different question). | 1 Corinthians / 2026-08-23 |
| `speaking-in-tongues` | 1Co 12:10, 28–30; 13:1, 8; 14:1–40 | "Speaking in tongues" is one of the heaviest gift-specific queries, and the WEB's "other languages" wording means plain lexical search misses it entirely; `spiritual-gifts` is the obvious home, so this is likely a LEXICON EXTENSION of `spiritual-gifts` (add tongues / speaking-in-tongues phrasings) rather than a new id — flagged for curation judgment. Any gist must stay neutral per the doctrinal basis (continuation/cessation is a named non-criterion). | 1 Corinthians / 2026-08-23 |
| `head-coverings` | 1Co 11:2–16 | "Head coverings in church," "what does the Bible say about head coverings" — a perennial lay question with exactly one passage to land on and no concept anywhere near it. Gist wording must describe and route, never adjudicate (gender roles are a named non-criterion in the doctrinal basis). | 1 Corinthians / 2026-08-23 |
| `church-discipline` *(append to existing 2 Corinthians row)* | 1Co 5:1–13 (the assembly commanded to remove the unrepentant man, aimed at rescue — "that the spirit may be saved in the day of the Lord Jesus," 5:5); 5:9–11 (the association rules) | The 1 Corinthians staging drafted this as a new row, but the 2 Corinthians row landed first and already anticipates these refs — so 1 Corinthians contributes refs, not a duplicate id. 1 Cor 5 supplies the arc's front half: the act of assembly discipline commanded and regulated in detail, which the row's 2 Cor refs then carry through forgiveness and restoration. The staging's register point stands: `the-lords-discipline` is God's chastening of his children (1Co 11:32 tags there honestly), not the assembly's act. | 1 Corinthians / 2026-08-23 |
| `supporting-gospel-workers` *(append to existing 3 John row)* | 1Co 9:4–14 ("those who proclaim the Good News should live from the Good News," 9:14; the unmuzzled ox, 9:9; the soldier, vineyard, flock, and temple arguments, 9:7, 13) | The 1 Corinthians staging drafted this as a new row, but the 3 John row (same suggested id, same "should pastors be paid" / "supporting missionaries" query family) landed first, so 1 Corinthians contributes refs. 1 Cor 9 is the theme's fullest argument — warrants stacked up to the Lord's own ordinance — plus the surrendered-rights counterpoint (9:12, 15–18). The row's check-the-extension-route-first advice stands; the staging adds `tithing` and `generosity` to the concepts worth checking alongside its `hospitality`/`generosity`. | 1 Corinthians / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | 1Co 10:12–13 ("No temptation has taken you except what is common to man") | The NT's core temptation-endurance text joins the row's anchor set; `remembered-a-way-of-escape` honestly tags 1 Cor 10, but the plain "temptation" query gap Genesis logged remains open — this ref strengthens the case. | 1 Corinthians / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | 1Co 15:21–22 ("as in Adam all die"); 15:26 ("The last enemy that will be abolished is death"); 15:54–56 | Adds the why-we-die origin claim (death in Adam) and death's defeat (swallowed up in victory) to the row's evidence. | 1 Corinthians / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-derive): weak
conscience (1Co 8:7–12; 10:25–29) — at staging these were judged close enough to
`disputable-matters` not to log; the Romans `conscience` row has since landed and
is the natural home if the curator wants the 1 Corinthians weak-conscience refs —
recorded here rather than merged, since the staging deliberately withheld them (a
reversible call). Bad company corrupts good morals (1Co 15:33) — covered:
`friendship`'s lexicon already carries "bad company corrupts good character." The
Lord's Supper, self-examination, communion (1Co 10:16–21; 11:17–34) — covered by
`lords-supper`. Resurrection of the body (1Co 15) — covered by `resurrection`
(and `caught-up-together` for 15:51–52).

## Luke appends — 2026-08-23 (Gospels+Acts thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Rows marked *(append to existing row)*
add Luke's locations to the named row earlier in this file — read them together
with that row; the other three rows are new gaps. Sourced from the Luke book doc's
Tag-gap candidates section (`luke.md`, this directory) and re-deduped against this
file's live state at delivery (the James, Zechariah, 1 Samuel, and Lamentations
blocks appended since Mark's delivery were re-read before this append and collide
with nothing below): Luke's refs for the gaps the Matthew and Mark blocks logged go
to those rows (`money-and-possessions` is Mark's row), and the themes sibling
threads logged first follow the same routing the Matthew and Mark deliveries used —
Luke staged `hypocrisy` (→ Amos's `empty-worship`/`religious-hypocrisy` row),
`god-and-government` (→ Romans' `governing-authorities` row), `mercy` (→ Hosea's
row), `fasting` (→ Joel's row), `judging-others` (→ Romans' row), and `loving-god`
(→ Joshua's row); only `holy-spirit`, `good-news-for-the-poor`, and `ascension`
were still absent from the live log at delivery and appear as new rows.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `holy-spirit` (or `the-holy-spirit`) | Luke 1:15, 35, 41, 67; 2:25–27; 3:16, 22; 4:1, 14, 18; 10:21; 11:13; 12:10–12 | "Who is the Holy Spirit", "filled with the Holy Spirit", "how does the Holy Spirit work" — a heavy query family with no general concept home. The vocabulary carries only facets: `holy-spirit-the-comforter` (John 14-shaped comfort), `remembered-fruit-of-the-spirit` (verse memory), `spiritual-gifts` (gifts), and the `blasphemy-against-the-spirit` gap row above (one warning). Luke is the Gospels' densest Spirit text — people filled, led, empowered, taught, and given the Spirit by the Father. Delivery note: the `outpouring-of-the-spirit` row above (Joel) carries the outpoured-promise register only; this row is the general who-is-the-Spirit query family — the curator may weigh folding them into one treatment. | Luke (Gospels+Acts) / 2026-08-23 |
| `good-news-for-the-poor` (or `the-poor`) | Luke 1:52–53; 4:18; 6:20–25; 7:22; 12:33 | "What does the Bible say about the poor", "blessed are the poor", "does God care about the poor" — Luke's signature theme has no vocabulary home; `humble-exaltation` covers only the reversal facet, `gods-provision` the believer's supply. These refs are the good-news register (God's favor announced to the poor), distinct from the `justice-and-oppression` row's oppression/justice register; Luke's justice-shaped refs are appended to that row below, so the two rows partition Luke's material rather than competing. Kept distinct on that basis — a reversible call the curator can collapse into one row. | Luke (Gospels+Acts) / 2026-08-23 |
| `ascension` | Luke 24:50–53 | "Ascension of Jesus", "where did Jesus go after the resurrection", "why did Jesus leave" are real lay queries with no concept home — the vocabulary has `resurrection` and `second-coming` but nothing for the event between them. Luke narrates it twice (here and Acts 1:9–11); the Acts delivery should append its refs to this row rather than mint a competing id. | Luke (Gospels+Acts) / 2026-08-23 |
| `kingdom-of-heaven` (or `kingdom-of-god`) *(append to existing Matthew row)* | Luke 4:43; 6:20; 8:1, 10; 9:2, 11, 27, 60, 62; 10:9–11; 11:2, 20; 12:31–32; 13:18–21, 28–29; 14:15; 16:16; 17:20–21; 18:16–17, 24–25, 29–30; 19:11; 21:31; 22:16, 18, 29–30; 23:42, 51 | Luke's form is “God’s Kingdom” throughout — reinforces the row's note that the id/lexicon must cover both phrasings; 17:20–21 (“God’s Kingdom is within you”) is a heavily queried verse of its own. | Luke (Gospels+Acts) / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | Luke 5:11, 27–28; 9:23–26, 57–62; 14:25–33; 18:22, 28–30 | “They left everything, and followed him” (5:11, 28), the three would-be followers (9:57–62), the cost-of-discipleship discourse (14:25–33 — cross-bearing, counting the cost, renouncing all), and the rich ruler's “then come, follow me” (18:22) are Luke's core call-and-cost texts; "count the cost" queries have no home. | Luke (Gospels+Acts) / 2026-08-23 |
| `blasphemy-against-the-spirit` *(append to existing Matthew row)* | Luke 12:10 | Luke's form sits inside the confessing-Christ unit, next to the promise of the Spirit's help (12:11–12). | Luke (Gospels+Acts) / 2026-08-23 |
| `deliverance-from-demons` *(append to existing Matthew row)* | Luke 4:31–37, 41; 6:18; 8:2, 26–39; 9:1, 37–43, 49; 10:17–20; 11:14–26; 13:11–16, 32 | Luke matches Mark's density; 11:14–26 adds the strong-man teaching and the returning unclean spirit, and 13:11–16 the daughter of Abraham “whom Satan had bound,” freed on the Sabbath. | Luke (Gospels+Acts) / 2026-08-23 |
| `servanthood` *(append to existing Matthew row)* | Luke 9:46–48; 17:7–10; 22:24–27 | “Whoever is least among you all, this one will be great” (9:48); “We are unworthy servants” (17:10); “But I am among you as one who serves” (22:27) — Luke's counterpart to Mark 10:45; supports the row's extension-check against `humble-exaltation`. | Luke (Gospels+Acts) / 2026-08-23 |
| `stewardship` *(append to existing Matthew row)* | Luke 12:41–48 | “Who then is the faithful and wise steward…” and “To whomever much is given, of him will much be required.” | Luke (Gospels+Acts) / 2026-08-23 |
| `money-and-possessions` *(append to existing Mark row)* | Luke 6:24; 8:14; 12:13–21, 33–34; 14:33; 16:1–15, 19–31; 18:18–30; 19:1–10, 11–27; 21:1–4 | The rich fool (12:16–21) and Luke 16 — Scripture's densest money chapter — anchor the row; “woe to you who are rich” (6:24), riches among the choking thorns (8:14), and “You aren’t able to serve God and Mammon” (16:13) are top query texts. | Luke (Gospels+Acts) / 2026-08-23 |
| `empty-worship` (or `religious-hypocrisy`) *(append to existing Amos row)* | Luke 6:41–42; 11:37–52; 12:1, 56; 13:15; 16:15; 18:9–12; 20:20, 46–47 | Luke staged this as `hypocrisy` — same routing as the Matthew and Mark deliveries. Luke names it outright — “the yeast of the Pharisees, which is hypocrisy” (12:1), “You hypocrite!” (6:42), “You hypocrites!” (13:15) — and adds the self-justification angle: “You are those who justify yourselves in the sight of men, but God knows your hearts” (16:15). | Luke (Gospels+Acts) / 2026-08-23 |
| `mercy` *(append to existing Hosea row)* | Luke 1:50, 54, 58, 72, 78; 6:36; 10:37; 16:24; 17:13; 18:13, 38–39 | “Be merciful, even as your Father is also merciful” (6:36), “He who showed mercy on him… Go and do likewise” (10:37), and the tax collector's plea, “God, be merciful to me, a sinner!” (18:13), are direct, load-bearing mercy texts; the ch. 1 songs are saturated with God's mercy. | Luke (Gospels+Acts) / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Luke 2:37; 5:33–35 | Anna's fasting devotion, and Jesus' bridegroom answer on when his disciples will fast. | Luke (Gospels+Acts) / 2026-08-23 |
| `judging-others` *(append to existing Romans row)* | Luke 6:37–42 | “Don’t judge, and you won’t be judged,” with the speck and the beam. | Luke (Gospels+Acts) / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Luke 20:20–26 (taxes to Caesar); 23:2 (the tax charge against Jesus) | Luke staged this as `god-and-government` — the same gap the Romans row logged first, following the routing the Matthew and Mark deliveries used. | Luke (Gospels+Acts) / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | Luke 10:25–28 | The lawyer recites the whole-heart love of God and Jesus answers, “Do this, and you will live” — the greatest-commandment register that row logs. | Luke (Gospels+Acts) / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | Luke 4:1–13 (“tempted by the devil” for forty days; “When the devil had completed every temptation”); 8:13 (“fall away in time of temptation”); 11:4 (“Bring us not into temptation”); 22:40, 46 (“Pray that you don’t enter into temptation,” twice bracketing the Mount of Olives prayer) | Luke's full wilderness narrative and prayer texts add to the row's plain-"temptation" anchor set. | Luke (Gospels+Acts) / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Luke 1:11–20, 26–38 (Gabriel's two annunciations); 2:8–15 (the angel and the heavenly army); 9:26; 12:8–9 (“before the angels of God”); 15:10 (“joy in the presence of the angels of God”); 16:22 (“carried away by the angels”); 20:36 (“like the angels”); 22:43 (“An angel from heaven appeared to him, strengthening him”); 24:23 (“a vision of angels, who said that he was alive”) | Luke's angelic material spans the annunciations, the nativity host, Gethsemane, and the resurrection report. (Luke 24:4's “two men… in dazzling clothing” are not called angels in the chapter's own narration and are not claimed as such; 24:23 is the disciples' report wording.) | Luke (Gospels+Acts) / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | Luke 23:50–56 | The burial narrative: the wrapped body, the rock-cut tomb, the watching women, the prepared spices. | Luke (Gospels+Acts) / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Luke 14:12–14, 21 (feast the poor who cannot repay); 16:19–25 (Lazarus at the gate); 18:22 (“distribute it to the poor”); 19:8; 20:47 (“who devour widows’ houses”); 21:1–4 | Per the cross-thread ruling, this national/social register does not fit the pastoral-* ids. Luke's refs are partitioned by register between this row (justice-shaped) and the new `good-news-for-the-poor` row above (good-news-shaped), so the two rows do not compete. | Luke (Gospels+Acts) / 2026-08-23 |

Extension-check flags from Luke (not gap rows; for curation review before any new id):

- **Resurrection of the dead generally** — Luke 20:27–40 teaches the general
  resurrection (“children of the resurrection,” “he is not the God of the dead, but
  of the living”); third witness to the flags at the end of the Matthew and Mark
  blocks (if `resurrection` ("He is risen") is Easter-scoped, check a lexicon
  extension for "resurrection of the dead" / "life after death" queries before
  minting).
- **Watchfulness / readiness** — Luke 12:35–40 and 21:34–36 (“be watchful all the
  time, praying”). Echoes Mark's flag: "be ready for Christ's return" queries most
  naturally extend `second-coming`'s lexicon; check that route first.
- **Power from on high / the promise of the Father** — Luke 24:49.
  `holy-spirit-the-comforter` is John-14-shaped; "clothed with power from on high" /
  "wait for the Holy Spirit" queries may fit as a lexicon extension of that concept,
  the new `holy-spirit` row above, or whatever the Acts delivery proposes for
  Pentecost. Check before minting.

## Titus appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Titus staged gap file
(`rollout/gaps/titus-gaps.md`) and re-deduped in full against this file's live state
immediately before this append (the 1 Corinthians and Luke blocks, which landed
during this delivery's read, were re-read and collide with nothing below) and
against the 131-id vocabulary. Delivery-time routing, per §9's append-to-existing
rule: (1) the staged append targeted at the staged `slavery-in-the-bible` row folds
into the live `bondservants-and-masters` row (Colossians) — the Ephesians block
already merged that staged row there, so the two-staged-rows merge the Titus staging
anticipated has happened and Titus contributes only refs; (2) the staged
`discipleship` append lands on the live Matthew `discipleship` (following Jesus)
row, where the Philippians staging merged; (3) the staging's conditional note on the
then-STAGED `church-discipline` row is delivered as an append — the 2 Corinthians
block has since minted that row live, so Tit 3:10–11 lands there as the staging
directed. The `good-works` row below survives dedupe as a NEW row: no good-works
row exists anywhere in this file (1 Corinthians' `living-for-gods-glory` is the
all-of-life-glory register, a different question), and the 131-id vocabulary
carries only `faith-and-works` (the James debate register) and `work-and-diligence`
(the labor register), both addressed in the row's rationale.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `good-works` | Tit 2:7, 14; 3:1, 8, 14; 1:16 | "Good works in the Bible," "good deeds," "zealous for good works" are plain lay queries with no honest home: `faith-and-works` is the James faith-without-works debate, `work-and-diligence` is the labor/work-ethic register, and neither carries doing-good queries. Titus makes good works its refrain — every chapter, always downstream of grace (2:14 "zealous for good works"; 3:8 "careful to maintain good works"), so the gist can be worded grace-first with no works-salvation risk (cf. Eph 2:8–10, Jas 2, Matt 5:16 for later threads). Could alternatively be a lexicon extension of `faith-and-works`; check that route before minting. | Titus / 2026-08-23 |
| `false-teachers` *(append to existing 2 John row)* | Tit 1:10–16 ("vain talkers and deceivers… whose mouths must be stopped: men who overthrow whole houses, teaching things which they ought not, for dishonest gain's sake") | Titus adds the profiteering-teacher profile and the silence-and-reprove response to the row's deny-the-Christ and different-gospel texts. | Titus / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Tit 1:5–9 (elder/overseer qualifications — "appoint elders in every city"; the overseer "must be blameless, as God's steward") | With 1 Tim 3:1–13, this is where "qualifications of an elder" / "who can be a pastor" queries must land; strengthens the row's case beyond wise administration. | Titus / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Tit 3:1–2 ("be in subjection to rulers and to authorities, to be obedient") | Parallel teaching to Rom 13:1–7 from the same author. | Titus / 2026-08-23 |
| `outpouring-of-the-spirit` *(append to existing Joel row)* | Tit 3:5–6 (the Spirit "whom he poured out on us richly through Jesus Christ our Savior") | The NT letter-side outpouring text; the row's existing rationale about NT-register Spirit concepts applies unchanged (Luke's new `holy-spirit` row is the general who-is-the-Spirit family, not this outpoured-promise register). | Titus / 2026-08-23 |
| `bondservants-and-masters` *(append to existing Colossians row)* | Tit 2:9–10 (servants "to be in subjection to their own masters… showing all good fidelity, that they may adorn the doctrine of God") | The reciprocal-duties register the row documents, from the same author; staged for whichever slavery row merged — the Ephesians fold into this row settled that. | Titus / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | Tit 2:3–7 (older women as "teachers of that which is good, that they may train the young wives"; Titus himself "an example of good works") | The older-training-younger pattern is the row's mentoring/imitation substance — the register the Philippians append added to the follow-Jesus texts. | Titus / 2026-08-23 |
| `church-discipline` *(append to existing 2 Corinthians row)* | Tit 3:10–11 (a factious man warned once and twice, then avoided, "being self-condemned") | The Titus staging flagged this ref for the then-staged church-discipline row; that row is now live (2 Corinthians), so the ref lands as staged — the avoid-after-warnings procedure alongside the row's discipline-then-restoration arc. | Titus / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-derive): sound doctrine /
teaching truth (Tit 1:9; 2:1) → served in the negative by the `false-teachers` row
and in the positive by `studying-the-word`'s word-of-god lexicon; a separate row
would double-route. Self-control / sober-mindedness refrain (Tit 2:2–12) → covered:
`self-control` (tagged on ch. 2). The blessed hope (Tit 2:13) → covered:
`second-coming` (tagged on ch. 2). Washing of regeneration / new birth (Tit 3:5) →
near-covered: `salvation` carries the substance, and the 1 John block records that
`salvation.yaml` already carries "you must be born again"; better anchored from
John 3 by that book's thread. Avoiding quarrels / factious people (Tit 3:9–11) →
partially covered by `harmony-with-others` (tagged on ch. 3); the discipline edge
is appended to the `church-discipline` row above.

## Philemon appends — 2026-08-23

Appended as one block at file end (in the same delivery write as the Titus block
above) to keep the append atomic under concurrent book threads; nothing above this
line was edited. Sourced from the Philemon staged gap file
(`rollout/gaps/philemon-gaps.md`) and re-deduped in full against this file's live
state immediately before this append and against the 131-id vocabulary. Philemon
mints NO new row — its remaining themes have vocabulary homes
(`family-reconciliation`, `forgiving-others`, `friendship`, tagged on the chapter)
— and its one staged item, targeted at the staged `slavery-in-the-bible` row, folds
into the live `bondservants-and-masters` row (Colossians), into which the Ephesians
block already merged that staged row (its rationale already names Philemon; these
are the concrete refs).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `bondservants-and-masters` *(append to existing Colossians row)* | Phm 1:15–16 ("no longer as a slave, but more than a slave, a beloved brother"); 1:8–21 (the whole appeal) | Philemon is the text "what does the Bible say about slavery" queries most need to reach: the one letter wholly occupied with a master and an enslaved believer, and its move — kinship in Christ urged over the category itself — is the honest center of the answer. | Philemon / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-derive):
believer-to-believer reconciliation (Phm 1:15–17) → BORDERLINE, not its own row:
"reconciling with someone who wronged you" queries route acceptably through
`forgiving-others` plus `family-reconciliation`; a distinct `reconciliation` id
would triple-route with those two and `restoration` — if fixtures later show
Matt 5:23–24 / 2 Cor 5:18–20 queries missing, revisit as a lexicon extension of
`forgiving-others` rather than a new id. Intercession / advocating for another
person (Phm 1:9–19) → person-to-person advocacy, so `prayer` does not cover it,
but "advocate for someone" is not a plausible scripture-search intent at pack
scale; not logged. Imputation / "put that to my account" (Phm 1:18) →
`justification-by-faith` and `grace-not-earned` are the vocabulary homes, with
Philemon as an illustration (a reading, per the book doc's Decision 4); not a gap.
Useless made useful (Phm 1:11) → covered: `new-creation`. House churches / the
assembly in your house (Phm 1:2) → `gathering-together` covers the meeting
substance; a dedicated row would be structure-trivia; not logged.

## 2 Thessalonians appends — 2026-08-23 (re-applied after concurrent-write loss)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. RACE RECORD: this block's original
delivery was written and post-write verified earlier today (it took the file from
142 to 147 data rows), but a later thread's stale-read full-file save dropped it —
a repair audit on 2026-08-23 grep-verified that no "2Th" reference and no
2 Thessalonians block survived anywhere in the live file. Re-applied here after a
full re-dedupe against the live state at repair time (the Titus and Philemon
blocks were the newest present; all five target rows below confirmed present,
unmoved, and carrying no 2 Thessalonians refs; the fold of the staged
`antichrist-and-man-of-lawlessness` row into the live 1 John `antichrist` row
still holds — that row landed first and its rationale already invites the fold).
2 Thessalonians mints NO new row; all five items are ref-appends. Rows marked
*(append to existing row)* add 2 Thessalonians's locations to the named row
earlier in this file — read them together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `antichrist` *(append to existing 1 John row)* | 2Th 2:1–12 ("the man of sin... the son of destruction," who "sits as God in the temple of God," 2:3–4; the restrainer, 2:6–7; destroyed "with the breath of his mouth," 2:8) | The staged 2 Thessalonians `antichrist-and-man-of-lawlessness` row folds here — the 1 John row landed first and already anticipates a fold. Lexicon note the fold makes binding: 2 Thess 2 never uses the word "antichrist," and 1 John never says "man of sin" or "lawlessness," so any minted id must carry BOTH word families or one query family goes unserved. Gist must describe the texts, not adjudicate identifications (historic candidates differ; eschatology positions beyond the core are DOCTRINAL-BASIS §4 non-criteria). | 2 Thessalonians / 2026-08-23 |
| `election-and-predestination` *(append to existing Romans row)* | 2Th 2:13–14 ("God chose you from the beginning for salvation through sanctification of the Spirit and belief in the truth") | Adds the chosen-from-the-beginning thanksgiving — election stated pastorally, as ground for thanks rather than speculation — to the row's Rom 8–11 and Eph 1 texts. | 2 Thessalonians / 2026-08-23 |
| `day-of-the-lord` *(append to existing Obadiah row)* | 2Th 2:2 ("saying that the day of Christ has already come") | The NT correction text for day-of-the-Lord confusion — believers shaken by a false already-here claim. The chapter's tag home remains `second-coming`; only this ref joins the row. | 2 Thessalonians / 2026-08-23 |
| `church-discipline` *(append to existing 2 Corinthians row)* | 2Th 3:6, 14–15 ("withdraw yourselves from every brother who walks in rebellion"; "note that man, that you have no company with him... Don't count him as an enemy, but admonish him as a brother") | Adds the restorative-admonition side — distance commanded yet brotherhood retained — to the row's discipline-then-restoration arc (2 Cor), assembly procedure (1 Cor 5), and avoid-after-warnings rule (Tit 3:10–11). | 2 Thessalonians / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | 2Th 3:7–9 ("you know how you ought to imitate us... to make ourselves an example to you, that you should imitate us") | Adds the deliberate-example text — support declined precisely to create a pattern worth imitating — to the row's imitation/mentoring register (the side the Philippians and Titus appends carry). | 2 Thessalonians / 2026-08-23 |

Checked and NOT logged (recorded so later threads don't re-derive): idleness /
laziness (2Th 3:6–12) → covered: `work-and-diligence` carries the query family,
anchored by the work-to-eat rule. Powerful delusion / believing the lie
(2:11–12) → covered contextually under `divine-judgment` (tagged on ch. 2);
"strong delusion" phrasing is lexicon-tuning at most. Forged letters / testing
claimed apostolic authority (2:2; 3:17) → not a plausible lay search intent at
pack scale; discernment side near-covered by `wisdom-from-god` and the
`false-teachers` row. Eternal punishment (1:9) → covered: `hell` and
`divine-judgment` jointly serve it.

## Numbers appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Numbers book doc's
Tag-gap candidates section (`numbers.md`, this directory) under its standing
delivery rule: every candidate re-checked by THEME against this file's live state
immediately before this append (including the Jude, Mark, James, Zechariah,
1 Samuel, Lamentations, Leviticus, 1 Corinthians, Luke, Titus, and Philemon blocks
that landed after that doc's round-2 critic read). Delivery-time conversions, all per §9's
append-to-existing rule: (1) the four rows the doc labels EXODUS-proposed
(`grumbling-and-complaining`, `priesthood`, `sacrifice-and-atonement`, `passover`)
are now LIVE under exactly those ids — the Exodus block delivered — so they appear
here as ref-appends, as the doc's own annotations direct; (2) the three
LEVITICUS-proposed targets resolve per the Leviticus delivery: `clean-and-unclean`
and `appointed-feasts` are live Leviticus rows (the doc's `appointed-feasts`
conditional resolves append-side — the row was minted, scoped against `passover`
per the Leviticus doc's Decisions #45), and `occult-and-divination` is live as the
1 Samuel row (minted there; Leviticus's command-law refs already appended), so the
Numbers Balaam refs append to it. All nine of the doc's §(i) LIVE-row appends
execute as written, every target confirmed present under the stated id. No dedupe
skips were needed: no row anywhere in the live file carries Numbers refs (the
Malachi `gods-unchanging-nature` row's rationale cites Num 23:19 as its own text,
not an append). The last two marker rows below are the two optional proactive
appends the doc's round-1 revision flagged for delivery-time judgment — both
delivered as unambiguous, because each target row itself cites or invites exactly
the Numbers text: the Nahum `slow-to-anger` row explicitly invites sibling appends
of the formula (Num 14:18 is its locus classicus in prayer), and the Malachi
`gods-unchanging-nature` row names Num 23:19 as the same family. The one NEW row
below (`zeal-for-god`) was re-verified genuinely new at this append: no zeal-themed
row anywhere in the live file and no matching id in the 131-id vocabulary.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `zeal-for-god` | Num 25:7–13 | Phinehas, "jealous with my jealousy... jealous for his God." "Zeal for God," "zealous for the Lord" are common queries with no home (`hunger-for-god` names desire, not zeal). CAUTION for any future gist: the narrative commends Phinehas's unique, priestly act; wording must not read as endorsing vigilante violence — describe what the text commends, per the no-adjudication rule. | Numbers / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Num 9:14 (the foreigner welcomed to keep Passover, "one statute" for foreigner and native); 15:14–16, 29–30 ("As you are, so the foreigner shall be before the LORD" — one law in offerings, forgiveness, and judgment alike); 19:10 (the heifer statute binds "the stranger who lives as a foreigner among them"); 35:15 (refuge cities open "for the stranger, and for the foreigner living among them") | Numbers supplies the one-law-for-the-foreigner statute layer beneath the row's living-as-a-foreigner narratives and love-the-foreigner commands. | Numbers / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Num 6:1–21 (the Nazirite vow — Scripture's fullest voluntary-vow law: terms, interruption, and completion); 21:2 ("Israel vowed a vow to the LORD" before Hormah); 30:1–16 (the whole vow statute: "he shall not break his word") | Adds the vow-law backbone — the Nazirite institution and the binding-and-release statute of Numbers 30 — to the row's narrative oaths and teaching texts. | Numbers / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Num 11:16–17, 24–30 (the seventy elders given a share of the Spirit on Moses — "they shall bear the burden of the people with you, that you don't bear it yourself alone" — the Bible's other classic shared-load text alongside Exodus 18); 27:15–23 (the shepherd prayer and Joshua's public commissioning — succession done well) | Shared-load delegation and succession done well — companion texts to the row's Jethro-delegation (Exodus) and Joshua-commissioning (Joshua) refs. | Numbers / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Num 22:22–35 | The LORD's angel standing in the road as an adversary, seen first by the donkey, with drawn sword — one of the OT's most-asked-about angel scenes. | Numbers / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Num 31:2–3 (vengeance belonging to the LORD and executed only at his command); 35:19–27 (the avenger of blood — Scripture's regulation and restraint of blood-vengeance) | Note for the row: these are refs where vengeance is commanded or regulated, not condemned; the row's gist wording should account for both registers. | Numbers / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Num 11:11–15 | Moses' complaint addressed *to* God ("Why have you treated your servant so badly?... please kill me right now"), heard and answered with help, not rebuke — the clearest narrative distinction yet between lament to God and murmuring about him (the murmuring itself routes to the `grumbling-and-complaining` row). | Numbers / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Num 25:1–3 (bowing to Moab's gods; "Israel joined himself to Baal Peor"); 31:16 (the Peor trespass behind the Midian war); 33:52 (destroy all molten images and demolish the high places) | The Baal Peor apostasy — the wilderness generation's own idolatry narrative — plus the conquest-eve purge command, joining the row's command-law (Exodus, Leviticus) and prophetic refs. | Numbers / 2026-08-23 |
| `inheritance` *(append to existing Joshua row)* | Num 26:52–56 (land allotted by lot and by family, "to the more... more inheritance"); 27:1–11 (the daughters of Zelophehad and the standing inheritance order); 33:54; 34:2, 13–18 (the land's borders and the named dividers of the inheritance); 36:1–12 (inheritance bound to the tribe) | The Numbers refs supply the institution's founding statutes beneath Joshua's distribution narratives, plus the daughters-inheriting case the row's "daughters of Zelophehad" searchers want. | Numbers / 2026-08-23 |
| `cities-of-refuge` *(append to existing Joshua row)* | Num 35:9–34 (the founding statute: asylum for the unintentional killer, the avenger of blood, due process before the congregation, no ransom) | The founding statute beneath the row's Josh 20 narrative and its Exod 21:13 root text. Row note carried from the Numbers doc: the lexicon-extension either/or (`refuge-in-trouble` or `pastoral-refuge-and-justice` vs. a new id — an either/or, not a double-mint) matches the live row's own "flagged for curation judgment" flag. | Numbers / 2026-08-23 |
| `grumbling-and-complaining` *(append to existing Exodus row)* | Num 11:1, 4–6 ("The people were complaining in the ears of the LORD"; the craving for Egypt's food); 14:2–4, 27–29 ("All the children of Israel murmured against Moses and against Aaron"; "How long shall I bear with this evil congregation that complain against me?"); 16:11, 41 ("You have killed the LORD's people!"); 17:5, 10 (the budding rod given "that you may make an end of their complaining"); 20:2–5 (the quarrel at Meribah: "Why have you brought the LORD's assembly into this wilderness?"); 21:4–5 ("the people spoke against God and against Moses") | Numbers is the motif's densest book; the row's case is now overwhelming. | Numbers / 2026-08-23 |
| `priesthood` *(append to existing Exodus row)* | Num 3:5–13 (the Levites given to Aaron; the firstborn exchange); 16:5–11, 40 (the censer test of "who is holy"; no outsider to burn incense); 17:1–13 (the budding rod confirming Aaron's house); 18:1–7 (priesthood as gift, priests bearing the sanctuary's iniquity); 20:25–28 (the office passed from Aaron to Eleazar on Mount Hor); 25:11–13 ("the covenant of an everlasting priesthood"); 35:25, 28, 32 (the high priest's death releasing the man slayer) | Adds the institution's contested-and-confirmed narratives (Korah, the rod), the Levite exchange, succession, and the everlasting-priesthood covenant to the row's establishment (Exodus) and working-life (Leviticus) texts. | Numbers / 2026-08-23 |
| `sacrifice-and-atonement` *(append to existing Exodus row)* | Num 8:12, 19, 21 (atonement for and by the Levites); 15:22–29 (atonement for unintentional sin, "and they shall be forgiven"); 16:46–48 (Aaron's censer atonement that stops the plague between the dead and the living); 19:9 (the red heifer "sin offering" whose ashes cleanse); 25:13 (Phinehas "made atonement for the children of Israel"); 28:22, 30 and 29:5, 11 (sin offerings "to make atonement for you" across the festal calendar); 31:50 (gold "to make atonement for our souls"); 35:33 (no atonement for the land's bloodshed except the shedder's own blood) | Adds atonement enacted in narrative (the censer between the dead and the living) and its outer edges (the red heifer, atonement money, the land itself) to the row's ritual base. | Numbers / 2026-08-23 |
| `passover` *(append to existing Exodus row)* | Num 9:1–14 (the second Passover: the feast kept in the wilderness, and a make-up date instituted for the unclean and the traveler); 28:16–25 ("the LORD's Passover" in the standing feast calendar); 33:3 (the exodus dated "on the next day after the Passover") | The feast's first anniversary observance and its make-up provision — the only other Passover narrative in the Pentateuch — plus its fixed place in the calendar. | Numbers / 2026-08-23 |
| `clean-and-unclean` *(append to existing Leviticus row)* | Num 5:1–4 (the unclean put outside the camp where the LORD dwells); 9:6–13 (uncleanness by a dead body deferring Passover); 19:7–22 (death-uncleanness and the water for impurity — the system's remedy chapter); 31:19–24 (purification of warriors and spoil by fire and the water for impurity) | Adds the death-uncleanness register and its remedy (the red-heifer water) to the row's Leviticus category system — the side of the system Leviticus 11–15 does not cover. | Numbers / 2026-08-23 |
| `appointed-feasts` *(append to existing Leviticus row)* | Num 28:16–29:40 (the full offering calendar of "your set feasts," 29:39) | The feast calendar's offering-by-offering counterpart to Lev 23 — what is offered at each appointed time; lands on the calendar-as-a-system row per its Passover/feasts scoping (Leviticus doc, Decisions #45). | Numbers / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Num 22:7 ("the rewards of divination in their hand"); 23:23 ("Surely there is no enchantment with Jacob; neither is there any divination with Israel"); 24:1 (Balaam stops seeking divination) | The Balaam cycle is the Bible's fullest divination-for-hire narrative and belongs on this row, alongside its Endor narrative and Leviticus command-law base. | Numbers / 2026-08-23 |
| `slow-to-anger` *(append to existing Nahum row)* | Num 14:18 | The formula's locus classicus in prayer — Moses pleading God's own self-proclamation back to him at Kadesh ("The LORD is slow to anger, and abundant in loving kindness"), and pardon following (14:20); the row's rationale already invites sibling appends of the formula (its Exod 34:6 source text is appended by the Exodus block). | Numbers / 2026-08-23 |
| `gods-unchanging-nature` *(append to existing Malachi row)* | Num 23:19 | "God is not a man, that he should lie, nor a son of man, that he should repent" — the row's own rationale names Num 23:19 as the same family as Mal 3:6; this is that text, blessing standing unrevoked against a hired curse. | Numbers / 2026-08-23 |

## Isaiah appends + new rows — 2026-08-23 (Isaiah–Daniel thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Isaiah staged gap
file (`tag-gaps-proposed.md`, book-thread scratchpad; anchored to its
2026-08-23T06:35:48Z live-file re-read) and delivered with the approved Isaiah
book doc (`isaiah.md`, this directory) after its critic loop closed at Round 4.
Routing resolved per the staged file's binding append-time rule against a full
re-read of this file immediately before this append — first at the 1 Corinthians
and Luke blocks, then re-run after the Titus, Philemon, 2 Thessalonians
(re-applied), and Numbers blocks landed concurrently with this delivery; their
rows and merges (new rows `good-works` and `zeal-for-god` included) collide with
nothing below: two of the
staging's nine proposed NEW rows fold into rows sibling threads landed after the
staging's anchored read — `messianic-promise` (→ Zechariah's
`messianic-prophecy` row, whose rationale already names Isa 7:14/53) and
`divination-and-the-occult` (→ 1 Samuel's `occult-and-divination` row, which the
Leviticus block has since given its command-law base) — so both appear here as
ref-appends instead of duplicate ids. All fourteen staged append targets were
confirmed present under their staged owner rows (Micah, Obadiah, Amos, Joel,
Joshua, Genesis), none already carrying Isaiah refs. The seven remaining rows
below are new gaps, each re-checked by THEME at write time against the live
table and the 131-id vocabulary: no kingship-of-God, resurrection-of-the-dead,
servant-songs, no-other-god, word-permanence, sovereignty, or drunkenness row
exists anywhere in this file — the Matthew `kingdom-of-heaven` row is the NT
kingdom-announcement register (the staging's Round 3 collision resolution
stands), and the general resurrection exists only as extension-check FLAGS at
the ends of the Matthew, Mark, and Luke blocks, not as a row. Rows marked
*(append to existing row)* add Isaiah's locations to the named row earlier in
this file — read them together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `god-reigns` | Isa 24:23; 52:7 | "The LORD reigns" / "God is king" queries have no kingship concept to land on. Isa 24:23 ("the LORD of Armies will reign on Mount Zion") and 52:7 ("Your God reigns!") are clean anchors; the enthronement psalms (Ps 93–99) will hit the same gap. Register boundary with the live `kingdom-of-heaven` (or `kingdom-of-god`) row (Matthew block): that row is the NT kingdom-announcement register ("kingdom of heaven meaning," "parables of the kingdom"); this row is the OT God-reigns/enthronement declaration — tagging Isa 24:23 or 52:7 into an NT-announcement concept would be the read-back the conventions bar. Cross-note for the curator: decide the two rows together (one concept, two, or an extension) before minting either; the Zechariah block's checked-and-not-logged note already defers Zech 14:9 ("The LORD will be King over all the earth") to the same decision. | Isaiah / 2026-08-23 |
| `resurrection-of-the-dead` (or lexicon extension of `resurrection`) | Isa 25:8; 26:14, 19 | Plain "resurrection of the dead" / "will the dead rise" queries. The existing `resurrection` concept is labeled "He is risen" — Christ's resurrection specifically — so tagging Isa 26:19 ("Your dead shall live. Their dead bodies shall arise.") with it would be a read-back. Check the lexicon-extension route on `resurrection` before minting; Dan 12:2 and Ezek 37 will need the same decision. This row gives a home to the parallel extension-check FLAGS at the ends of the Matthew (Matt 22:23–33), Mark (Mark 12:18–27), and Luke (Luke 20:27–40) blocks — the curator should decide this row and those flags together (one extension or one id, not several). | Isaiah / 2026-08-23 |
| `servant-of-the-lord` (or `suffering-servant`) | Isa 42:1–9; 49:1–13; 50:4–11; 52:13–15; 53:1–12 | "Servant songs" / "suffering servant" are extremely common study queries; only `the-cross` touches Isa 53, and nothing serves the other three songs. Gist wording would need the same care the chapter entries take: describe the servant on the text's own terms, signpost the historic messianic reading. Overlaps the live `messianic-prophecy` row (Zechariah; Isaiah's refs appended below) for Isa 42–53 — decide the boundary between the two before minting. | Isaiah / 2026-08-23 |
| `no-other-god` (or `god-alone`) | Isa 43:10–11; 44:6–8; 45:5–6, 21–22; 46:9 | "Is there only one God" / "no other gods" queries; the trial speeches' refrain "besides me there is no God" (44:6) has no concept home (`deity-of-christ` is a different claim). Overlaps the `idolatry` theme (owner row: Micah; Isaiah's refs appended below) — decide whether one concept or two before minting. | Isaiah / 2026-08-23 |
| `power-of-gods-word` | Isa 40:8; 55:10–11 | "God's word does not return void" / "God's word stands forever" are common queries; the existing word concepts (`delight-in-the-word`, `studying-the-word`, `obedience-to-the-word`) all cover the reader's response, none the word's own permanence and efficacy. (Register boundary with the Amos `famine-of-hearing-gods-word` row: that is God withholding his word as judgment, a different query family.) | Isaiah / 2026-08-23 |
| `sovereignty-of-god` | Isa 40:15–17, 22–26; 45:1–7; 46:9–11; 48:3 | "God's sovereignty" / "God is in control" queries; God raising Cyrus, declaring "the end from the beginning" (46:10), forming light and creating calamity (45:7). `providence` [PR41] is the nearest neighbor — check whether a lexicon extension of `providence` serves these queries before minting a new id. | Isaiah / 2026-08-23 |
| `drunkenness` | Isa 28:1–8 | "What does the Bible say about drunkenness / alcohol" is a common lay query; the woe on "the drunkards of Ephraim" whose priests and prophets "reel with strong drink… err in vision… stumble in judgment" is direct material. Nearest id is `self-control` — check a lexicon extension of `self-control` before minting a new id. | Isaiah / 2026-08-23 |
| `messianic-prophecy` *(append to existing Zechariah row)* | Isa 7:14; 9:1–7; 11:1–10; also 4:2 | Isaiah staged this as `messianic-promise` (or `promises-of-the-messiah`) before the Zechariah row landed — same gap, same query family ("prophecies about Jesus," "Messiah in the Old Testament"), and that row's rationale already names Isa 7:14/53 among the passages a pack would serve; so Isaiah contributes refs, not a duplicate id. The rollout's no-read-back rule (correctly) blocks NT christology ids on these texts, so nothing can surface them today; the row's attributed-fact locator design ("curated sources name these passages," source attributed, adjudicating nothing — consistent with non-negotiable #6) is exactly what the Isaiah staging independently specified. Overlaps the new `servant-of-the-lord` row above for Isa 42–53; decide the boundary before minting. Isa 4:2's Branch title also bears on the adjacent `the-branch` row (Zechariah block), which already cites Isa 4:2. | Isaiah / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Isa 2:6; 8:19–20; 47:9–13 | Isaiah staged this as `divination-and-the-occult` (proposed independently by two of its five drafting ranges) before the 1 Samuel row landed — same theme ("what does the Bible say about psychics / mediums / fortune tellers / horoscopes"), so Isaiah contributes refs, not a duplicate id. Isaiah adds the prophetic-indictment register to the row's narrative case (1 Sam 28) and command-law base (Leviticus refs): 8:19–20 is a direct teaching text ("To the law and to the covenant!") and 47:13 names "the astrologers, the stargazers, and the monthly prognosticators"; the staging's Daniel-court-diviners forecast stands — one row serves both. | Isaiah / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Isa 2:8, 18–20; 8:19; 10:10–11; 17:7–8; 19:1, 3; 21:9; 27:9; 30:22; 31:7; 37:19; 40:18–20; 41:21–24, 29; 44:9–20; 45:16, 20; 46:1–7; 48:5; 57:3–13; 65:3–7, 11; 66:3, 17 | Isaiah 40–48 is Scripture's most sustained anti-idol polemic, including the idol-maker satire of 44:9–20 ("He feeds on ashes"); proposed independently by all five Isaiah drafting ranges. | Isaiah / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | Isa 1:9; 4:2–3; 6:13; 10:20–22; 11:11–16; also 37:31–32 | Isaiah is the doctrine's namesake book (Shearjashub, "a remnant will return," 10:21) — phrase witnesses, not only theme witnesses. | Isaiah / 2026-08-23 |
| `day-of-the-lord` *(append to existing Obadiah row)* | Isa 2:12–21; 13:6–13; also 24:21–23 | Isa 13:6 ("Wail, for the LORD's day is at hand!") and 2:12 are phrase witnesses, extending the row into the major prophets. | Isaiah / 2026-08-23 |
| `empty-worship` (or `religious-hypocrisy`) *(append to existing Amos row)* | Isa 1:11–17; 29:13; 58:2–5; 66:3–4 | The multitude-of-sacrifices refusal (1:11–17, which the row's rationale already cites), lips-honor-with-distant-heart (29:13, the verse Matt 15:8 quotes), the fasting critique (58:2–5), and the offering critique (66:3–4). Isaiah staged this as `hypocrisy` (or `empty-worship`); the Amos row is the theme's shared home per the Matthew thread's ruling — the same routing the Mark, Luke, and Galatians deliveries used — so Isaiah folds there too. | Isaiah / 2026-08-23 |
| `outpouring-of-the-spirit` *(append to existing Joel row)* | Isa 32:15 ("until the Spirit is poured on us from on high"); 44:3 | The promise's signature Isaiah texts, joining the row's Joel 2:28–29 core (and its caveated Zechariah OT-Spirit refs). | Isaiah / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Isa 58:1–14 (esp. 58:3–7) | Isa 58 is Scripture's central fasting-critique text — the fast God chooses breaks yokes and feeds the hungry; `sabbath-rest` / `generosity` catch only fragments of it. | Isaiah / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Isa 63:15–64:12 | The long communal complaint-prayer ("Look down from heaven… Why, LORD, do you make us wander?"; "there is no one who calls on your name"), a sustained witness for the row's communal-lament register. | Isaiah / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Isa 66:2, 5 ("trembles at my word"); also 57:11 (its absence indicted) | The row explicitly invites sibling appends; Isaiah adds the trembling-at-the-word register and one indicted absence. | Isaiah / 2026-08-23 |
| `peace-among-nations` *(append to existing Micah row)* | Isa 2:2–4 | The swords-into-plowshares text in its Isaiah form, verbally parallel to Mic 4:1–4 — the row's rationale already names it as the parallel. | Isaiah / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Isa 6:2–7 (seraphim); 37:36 (the LORD's angel strikes the Assyrian camp) | The seraphim of the throne vision and the deliverance of Jerusalem — two heavily searched angelic texts for the row. | Isaiah / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Isa 34:8; 35:4; 47:3; 59:17–18; 61:2; 63:1–6 | "The day of vengeance" named verbatim at 61:2 and 63:4 — the vengeance-belongs-to-God side of the row, alongside its Nah 1:2–3 and Lam 3:60–66 refs. | Isaiah / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Isa 14:9–20; 22:13; 40:6–8; 51:12 | Sheol greeting the fallen king (14:9–20), "let's eat and drink, for tomorrow we will die" (22:13), and "all flesh is like grass" (40:6–8; 51:12). | Isaiah / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Isa 16:3–4; 27:13 | Caveat (from the 13–27 drafter, preserved for the curator): the row's original intent is living as a foreigner; 16:3–4 is sheltering refugees — near the same searcher intent. Flagged, not forced. | Isaiah / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Isa 1:17, 21–23; 3:13–15; 5:7, 23; 10:1–2; 11:4; 16:3–5; 58:6–10; also 59:14–15 | Context: under the 2026-08-23 pastoral-register ruling, the `pastoral-refuge-and-justice` tags that had carried Isaiah's national-scale justice material were removed from the book doc (see its Decisions record), so these passages are routed here — the same routing the live row's Job and Exodus appends record for that ruling. | Isaiah / 2026-08-23 |

Checked and already covered (recorded so later threads don't re-log):
pride/arrogance (Isa 2:11–17; 3:16; 9:9; 10:12–15; 28:1–3; 37:23–29) →
`humble-exaltation` (PR #41 lexicon extension); intercession (Isa 37:4, 15–20;
59:16) → `prayer`, per the Genesis thread's ruling; famine/scarcity (Isa 32:10)
→ `gods-provision` (PR #41 lexicon extension); light in darkness (Isa 9:2;
58:10; 60:1–3, 19–20) → plausibly `walking-in-the-light` — if lexicon coverage
proves thin for "arise and shine" queries, revisit as a lexicon extension, not a
new id; comfort of God (Isa 40:1–2; 49:13; 51:3, 12; 57:18; 61:2–3; 66:13) →
`god-of-all-comfort`; "perfect peace" (Isa 26:3) → `peace-of-god` (lexicon
anchor at most); God's holiness / "Holy One of Israel" → routes to `holiness` —
whether that lexicon catches "holiness of God" queries is a lexicon-tuning
question, not a vocabulary gap (the 1 Samuel block's God's-own-holiness flag is
the same question).

TENSION recorded for the curator, beside the `restoration-of-israel` row
(Obadiah; Zechariah refs since merged): the Isaiah book doc tags its
national-restoration texts (Isa 11:11–16; 14:1–3; 27:6, 12–13; 35; 44:26–28;
49:19–21; 60–62 and kin) with the vocabulary's existing `restoration` id,
grounded in `restoration.yaml`'s own Isa 43:18–19 anchor ("Behold, I will do a
new thing… I will even make a way in the wilderness," spoken to exiled Israel)
— while that live row's rationale reads `restoration` as the personal
renewal-prayer register ("restore my soul," Ps 23:3 anchor) with national
restoration homeless. Both readings are true to different parts of the pack;
the curator should resolve the register question (split the id, extend it, or
re-home the Isaiah tags) with both in view rather than either thread
pre-deciding it.

## Song of Solomon appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Both rows below are new gaps — dedupe
re-run at write time against the file as it stands (260 rows, through the Isaiah
block): a full register sweep for romantic/intimacy/marriage/dating/awaken/courtship
found no colliding row. Nearest neighbors checked and distinct: `unequally-yoked`
(whom not to marry, 2 Cor 6:14), `singleness` (the unmarried life, 1 Cor 7),
`spiritual-adultery` (God-ward unfaithfulness, Hosea) — all different substances.
Song of Solomon has no refs to append to any existing row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `romantic-love-and-intimacy` | Song 1:2; 2:3–6, 2:16; 4:1–16; 5:1; 7:1–12; 8:6–7 | "What does the Bible say about romantic love," "physical intimacy in marriage," "is desire good in the Bible" — heavy lay queries with no home: `godly-marriage` is the household-duty register (Eph 5 / 1 Pet 3 anchors; lexicon marriage/husbands/wives), `pastoral-sexual-purity` the lust-crisis register, `pastoral-betrayal-and-marriage-crisis` the crisis register. The celebration-of-love register — this entire book — is unreachable. Design note: pack wording must keep the Song's own non-graphic register and route to the text's celebration, never to advice-literature framing. | Song of Solomon / 2026-08-23 |
| `waiting-and-timing-in-love` | Song 2:7; 3:5; 8:4 ("that you not stir up, nor awaken love, until it so desires") | "Don't awaken love until it pleases," "waiting for the right person," "what does the Bible say about dating" — the book's own thrice-repeated charge is the text these searches want, and nothing serves the phrasings: `pastoral-sexual-purity`'s lexicon (porn, lust, flee) misses them and its register is crisis, not counsel before love. Could fold into the `romantic-love-and-intimacy` row above — decide one concept or two before minting. | Song of Solomon / 2026-08-23 |

## Hebrews–Revelation thread — Hebrews ref-appends 2026-08-23 (appended ahead of Hebrews delivery; earlier wording here mistakenly said 'restored' — these refs had not been written before, nothing was lost)

Appended as one block at file end; nothing above this line was edited.
CORRECTION (2026-08-23, same day): this block was first written with a
"repair append: lost Hebrews refs" framing claiming these refs had been
appended earlier and then lost from the file. That framing was wrong —
Hebrews is still in its critic loop and its gap appends were staged for its
final delivery; these refs had never been written to this file before, so
nothing was lost and nothing was restored. This block is an early append of
the in-progress Hebrews draft's staged ref-appends, recorded ahead of Hebrews
delivery, and it is NOT evidence of a lost-update clobber. The rows stand as
addendum rows at file end rather than merges into the owning rows' Where
columns (never rewrite another thread's rows in place). Read each together
with the named row earlier in this file.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `angels` *(append to existing Genesis row; early append from the in-progress Hebrews doc; confirmed at Hebrews delivery 2026-08-23)* | Heb 1:4–14; 2:2, 5, 16; 12:22; 13:2 | Hebrews' opening argument sets the Son above the angels ("ministering spirits, sent out to do service," 1:14) and adds the innumerable-angels scene of the heavenly Zion (12:22) and the entertained-angels-unaware text (13:2) to the row. | Hebrews / 2026-08-23 |
| `leadership` *(append to existing Genesis row; early append from the in-progress Hebrews doc; confirmed at Hebrews delivery 2026-08-23; added at audit, verified against Heb 13:7, 17)* | Heb 13:7, 17 | "Remember your leaders... and imitate their faith" and "Obey your leaders... for they watch on behalf of your souls" — the NT congregational-leadership texts for the row's "biblical leadership" queries. | Hebrews / 2026-08-23 |
| `temptation` *(append to existing Genesis row; early append from the in-progress Hebrews doc; confirmed at Hebrews delivery 2026-08-23)* | Heb 2:18; 4:15 | Jesus "tempted like we are," able "to help those who are tempted" — the Christ-ward help texts for the row's plain-"temptation" queries. | Hebrews / 2026-08-23 |
| `mortality` *(append to existing Genesis row; early append from the in-progress Hebrews doc; confirmed at Hebrews delivery 2026-08-23)* | Heb 2:14–15; 9:27 ("it is appointed for men to die once") | The appointed-once-to-die text, and deliverance of those "who through fear of death were all their lifetime subject to bondage" — direct anchors for the row's "why do we die" queries. | Hebrews / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row; early append from the in-progress Hebrews doc; confirmed at Hebrews delivery 2026-08-23)* | Heb 6:13–18; 7:20–22, 28 | Extends the row beyond human oath-taking to God's own oath ("since he could swear by no one greater, he swore by himself," 6:13) — the oath as the anchor of hope and of the Son's priesthood. | Hebrews / 2026-08-23 |

## 1 Thessalonians appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the 1 Thessalonians
staged gap file (`rollout/gaps/1-thessalonians-gaps.md`) and re-deduped in full
against this file's live state immediately before this append — the staging
predates most of this file's growth (it was deduped against the original
~24-row table); the Numbers, Isaiah, Song of Solomon, and Hebrews-restoration
blocks were the newest present at this read. Delivery-time routing, per §9's
append-to-existing rule: (1) the staged NEW row `encouraging-one-another` folds
into the live Job `comforting-others` row — the same human comfort-practice
theme (the staged row's own lead ref, "comfort one another," 1Th 4:18, is that
row's register), with the mutual build-one-another-up side recorded in-row for
the curator; (2) the staged NEW row `honoring-church-leaders` folds into the
Genesis `leadership` row — the staging's own instruction was to check that fold
before minting a second id in this space, and the Hebrews restoration block has
since routed Heb 13:7, 17 ("Obey your leaders"), one of the staging's two named
anchor texts, to exactly that row as its NT congregational-leadership material;
(3) the staged `discipleship` append (targeted at a then-staged Philippians row)
lands on the live Matthew `discipleship` (following Jesus) row, where the
Philippians staging merged — the imitation/mentoring register its Philippians,
Titus, and 2 Thessalonians appends carry; (4) the three staged existing-row
appends (`vengeance`, `election-and-predestination`, `day-of-the-lord`) execute
as staged, every target confirmed present. 1 Thessalonians mints NO new row;
no row anywhere in the live file carried 1 Thessalonians refs before this
append, and neither staged id is in the 131-id vocabulary. Rows marked
*(append to existing row)* add 1 Thessalonians's locations to the named row
earlier in this file — read them together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `comforting-others` *(append to existing Job row)* | 1Th 4:18 ("comfort one another with these words"); 5:11 ("exhort one another, and build each other up"); 5:14 ("encourage the faint-hearted; support the weak; be patient toward all") | The staged 1 Thessalonians `encouraging-one-another` row folds here — the Job row's human comfort-practice theme is the same gap ("how to encourage a struggling Christian" / "what to say to a grieving Christian"), and 4:18 is comfort of the bereaved, exactly its register. 1 Thessalonians adds the mutual one-another commands (comfort, build up, encourage, support) to the row's model/anti-model narratives. Register note for the curator: the build-one-another-up side (5:11; Heb 3:13; 10:24–25 would anchor it) runs broader than comfort-in-suffering — decide one concept or two before minting. | 1 Thessalonians / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 1Th 5:12–13 ("know those who labor among you, and are over you in the Lord... respect and honor them in love for their work's sake") | The staged 1 Thessalonians `honoring-church-leaders` row folds here per its own fold-check instruction: the row now carries the congregational-duty register — the Hebrews restoration block routed Heb 13:7, 17 (one of the staging's two named anchors) to this row — and 1Th 5:12–13 joins it ("honoring your pastor" / "respecting church leaders" queries; 1 Tim 5:17 would anchor it too). Register note for the curator: the congregation's duty to honor leaders is the flip side of the row's exercising-leadership and elder-qualification texts — weigh whether one id serves both query families before minting a second id in this space. | 1 Thessalonians / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | 1Th 1:6 ("You became imitators of us and of the Lord"); 2:14 (imitators of the Judean assemblies) | Adds imitation received and passed on — a young assembly imitating its founders and the Lord under affliction, then itself imitated across Macedonia and Achaia — to the row's imitation/mentoring register (the side the Philippians, Titus, and 2 Thessalonians appends carry). | 1 Thessalonians / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | 1Th 5:15 ("See that no one returns evil for evil to anyone") | The answer-side command in its plainest epistolary form, alongside the row's Rom 12:17–21 refs and its vengeance-belongs-to-God texts (Nah 1:2–3; Lam 3:60–66) — exactly the routing the row's wording concern asks for. | 1 Thessalonians / 2026-08-23 |
| `election-and-predestination` *(append to existing Romans row)* | 1Th 1:4 ("brothers loved by God, that you are chosen") | Election stated pastorally as assurance grounded in observed conversion — the same thanksgiving register the row's 2Th 2:13–14 append carries, joining its Rom 8–11 and Eph 1 doctrine texts. | 1 Thessalonians / 2026-08-23 |
| `day-of-the-lord` *(append to existing Obadiah row)* | 1Th 5:2 ("the day of the Lord comes like a thief in the night") | The row is OT-focused; this is the NT teaching text users searching the phrase will also want (with the row's 2Th 2:2 correction text). The chapter's tag home remains `second-coming` — only this ref joins the row. | 1 Thessalonians / 2026-08-23 |

Checked and NOT logged (recorded so later threads don't re-derive): testing
prophecies / discernment (1Th 5:20–21) → near-covered: `wisdom-from-god` carries
"discernment" in its lexicon, and the deceiver side is the `false-teachers` row;
plain "test everything" phrasing is lexicon-tuning for `wisdom-from-god`, not a
new-concept gap. Grieving with hope (4:13–18) → covered:
`pastoral-grief-and-loss` + `hope-in-god` + `caught-up-together` jointly serve
it, and the chapter carries the first and third. The wrath to come / deliverance
from wrath (1:10; 5:9) → covered contextually by `divine-judgment` and
`salvation` registers; "saved from God's wrath" phrasing is lexicon-tuning for
`salvation`. Quiet life / minding your own business (4:11) → covered:
`work-and-diligence` carries the work substance; "live a quiet life" alone is
too thin to mint.

## 2 Samuel appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Re-deduped against this file's live
state immediately before this append. Two rows are new gaps (checked at write
time: no `davidic-covenant` or `counsel-and-advisers` row exists anywhere in
this file, and neither id is in the 131-id vocabulary); every other entry
appends 2 Samuel's locations to a named existing row earlier in this file —
read them together with that row. Two dispositions changed at this write-time
re-read: `the-lords-anointed`, drafted as a proposed new row, became an append
because the 1 Samuel row had landed; and a `deliverance` append was added
because the 1 Samuel `deliverance` row (which invites sibling refs) had landed
and 2 Samuel 22 is that theme's song. Sourced from the 2 Samuel book doc's
Tag-gap section (`2-samuel.md`, this directory).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `davidic-covenant` (or a lexicon-extension review on `covenant`) | 2 Sam 7:8–16; 23:5 ("he has made with me an everlasting covenant") | "Davidic covenant" and "God's promise to David" are classic lookup-plus-teaching queries, and 2 Samuel 7 is their home text. The existing `covenant` pack is the general covenant register; check whether its lexicon can carry "Davidic covenant" / "throne established forever" phrasings before minting a new id. Design note: keep any pack to what the text says — offspring, house, throne, father-son, chastening without abandonment; the messianic-fulfillment register belongs to existing NT concepts, not read back into this one. | 2 Samuel / 2026-08-23 |
| `counsel-and-advisers` — BORDERLINE | 2 Sam 15:12; 16:23 ("as if a man inquired at the inner sanctuary of God"); 17:1–14, 23 | "Godly counsel," "seeking advice," "multitude of counselors" (WEB Prov 11:14: "in the multitude of counselors there is victory") — a practical-wisdom query family with no target: `wisdom-from-god` is the gift-of-wisdom register, `guidance` is God's own direction. The Ahithophel–Hushai duel is Scripture's most vivid counsel narrative. BORDERLINE — the reviewer may judge this a `wisdom-from-god` or `guidance` lexicon question rather than a new concept; check that route before minting. | 2 Samuel / 2026-08-23 |
| `the-lords-anointed` *(append to existing 1 Samuel row)* | 2 Sam 1:14–16 ("Why were you not afraid to stretch out your hand to destroy the LORD's anointed?"); 19:21 | 2 Samuel adds the sequel to the row's 1 Samuel refusals: David twice executes men who claimed the killing of Saul's house as service (chs. 1 and 4), and 19:21 uses the phrase in a courtroom setting. Drafted as a new row; converted to an append at write time because the 1 Samuel row had landed. | 2 Samuel / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | 2 Sam 6:6–9 ("David was afraid of the LORD that day"); 23:3 ("who rules in the fear of God") | The Uzzah narrative is the home text for the heavy "why did God kill Uzzah" query family, which `holiness` (the be-holy sanctification register) and `worship` (the practice register) do not serve; 23:3 adds the fear-of-God rule oracle. | 2 Samuel / 2026-08-23 |
| `betrayal` *(append to existing Obadiah row)* | 2 Sam 15:12, 31 ("Ahithophel is among the conspirators with Absalom"); 16:23; and the son's own rebellion, 15:1–12 | Ahithophel — the trusted counselor turned conspirator — is Scripture's fullest betrayed-by-a-friend narrative, and Absalom adds betrayal by one's own child; "betrayed by a friend / by family" queries land here. | 2 Samuel / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | 2 Sam 15:19–22 (Ittai the Gittite — "you are a foreigner and also an exile"); 11:11 and 23:39 (Uriah the Hittite); 24:18–25 (Araunah the Jebusite) | The faithful foreigner is a running 2 Samuel thread: Ittai's loyalty oath outshines the Israelites fleeing with David, and Uriah and Araunah both out-serve the king. | 2 Samuel / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | 2 Sam 19:23 ("The king swore to him"); 21:2, 7 | 21:1–14 adds the row's gravest case: a broken national oath (to the Gibeonites) brings famine generations later, while a kept personal oath (to Jonathan) spares Mephibosheth in the same chapter. | 2 Samuel / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 2 Sam 5:2 ("You will be shepherd of my people Israel"); 8:15 ("David executed justice and righteousness for all his people"); 23:3–4 | 2 Samuel adds the shepherd-king register: leadership as shepherding, its just exercise summarized (8:15), and the rule-in-the-fear-of-God oracle (23:3–4). | 2 Samuel / 2026-08-23 |
| `kindness` *(append to existing Ruth row)* | 2 Sam 2:5–6 ("may the LORD show loving kindness and truth to you"); 9:1–13 ("the kindness of God," for Jonathan's sake); 10:2 | The Mephibosheth chapter is the canon's fullest narrative of covenant kindness sought out and shown to someone who can repay nothing — the row's hesed register in story form. | 2 Samuel / 2026-08-23 |
| `lament` *(append to existing Joel row)* | 2 Sam 1:17–27 (the taught lament — the song of the bow, written down to be learned); 3:33–34 (the lament for Abner) — these refs only | Composed, taught lament: David's song for Saul and Jonathan is Scripture's clearest case of grief deliberately given words and taught to a community. 2 Samuel's raw grief cries (18:33; 19:4) were checked and declined for this row — personal grief, not the lament practice — per this row's own 1 Samuel caveat precedent (which declined 1 Sam 15:35; 30:4). | 2 Samuel / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | 2 Sam 12:1–6 (the rich man robs the poor man — the parable's engine is injustice against the poor); 15:2–6 (justice delayed at the gate, exploited by Absalom); 8:15 | 2 Samuel adds the parable register (Nathan's rich-man/poor-man case) and the justice-denied-at-the-gate scene behind Absalom's coup. Routed here per the project-wide pastoral-register ruling (national-scale justice material never takes `pastoral-*` ids). | 2 Samuel / 2026-08-23 |
| `deliverance` *(append to existing 1 Samuel row)* | 2 Sam 22:1–4, 17–20, 44–49 ("The LORD is my rock, my fortress, and my deliverer"; "He delivered me from my strong enemy"; "You deliver me from the violent man") | The row's register set to music: David's deliverance song gathers the whole rescue vocabulary in one chapter. A write-time discovery — the 1 Samuel row (which invites sibling appends) had landed by this append. | 2 Samuel / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-log): costly worship
("I will not offer burnt offerings to the LORD my God which cost me nothing,"
24:24; 23:16–17) — no row; flagged as a `worship` lexicon-extension review
instead, since the "cost me nothing" phrasing is a classic query with no lexicon
entry anywhere. "God devises means, that he who is banished not be an outcast
from him" (14:14) — no row; partial homes exist (`family-reconciliation`,
`restoration`), and the verse is flagged for those packs' anchors at curation
time. Ahithophel's suicide (17:23) — deliberately not a concept candidate:
suicide material is harm-gated in the engine's pastoral packs (the repo fixture
carries 2 Sam 17 as a pastoral harm gate); listed so no later thread mistakes it
for an unlogged theme.

## Ecclesiastes appends + new rows — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Dedupe re-run at write time against the
file as it stands (1,438 lines, through the 2 Samuel block): the three new rows below
collide with nothing in the 131-id vocabulary (`b3f491d`), in any row of this file,
or in the unlanded sibling drafts; every append target below was verified present.
Contingency resolutions from the book doc's staging: `prosperity-of-the-wicked`
became a landed-row append when the Job block landed; the Proverbs thread's
`money-and-wealth` staging was re-filed (its v3 ruling) as an append to Mark's landed
`money-and-possessions` row, so Ecclesiastes' money refs join that row here;
`aging-and-old-age` (Psalms draft) has NOT yet landed — hand-off note at the end of
this block.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `vanity-of-life` | Eccl 1:2–11; 2:11, 2:17; 12:8; refrain throughout (2:26; 4:4; 6:9) | "Life feels meaningless," "what is the point of life," "vanity of vanities meaning," "nothing new under the sun" — the book's own thesis, among the most-quoted lines in Scripture, has no vocabulary home. `pastoral-hope-in-despair` deliberately serves crisis queries with hope anchors, not the meaning-of-life question; `hope-in-god` carries the answer side only. Gist wording must keep the WEB's "vanity" (vapor/fleeting) sense and the NIV-remembered "meaningless" phrasing both reachable, and must route to the book's own arc (including 12:13–14) without flattening its honesty. | Ecclesiastes / 2026-08-23 |
| `seasons-of-life` | Eccl 3:1–8 | "A time for everything," "to everything there is a season," "seasons of life," "ecclesiastes 3 funeral reading" — one of the most-searched passages in the Bible (funerals, graduations, grief), with no concept carrying any time/season phrasing. `providence` (tagged on the chapter in the Ecclesiastes book doc) holds the doctrine but its lexicon ("god is in control," "gods unseen hand") shares no tokens with these queries. Could alternatively be a lexicon extension of `providence`; check that route before minting. | Ecclesiastes / 2026-08-23 |
| `enjoying-gods-gifts` | Eccl 2:24–26; 3:12–13, 3:22; 5:18–20; 8:15; 9:7–9; 11:8–9 | "Does God want me to enjoy life," "is it wrong to enjoy pleasure," "eat drink and be merry in the Bible" — the book's sevenfold refrain (enjoyment of food, work, and marriage received as God's gift) is its second theme and falls between existing registers: `contentment` is the enough-with-what-you-have register, `joy-in-the-lord` the rejoice-in-the-Lord register, `gods-provision` the needs-met register. Guardrail note: the gist must present enjoyment as received gift (5:19), never as hedonism or entitlement — the same care the doctrinal basis requires of blessing language. Check an extension route on `contentment` before minting. | Ecclesiastes / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Eccl 12:13 ("Fear God and keep his commandments; for this is the whole duty of man" — the book's stated conclusion); 3:14; 5:7; 7:18; 8:12–13 | The row's rationale already cites Eccl 12:13 and asks sibling threads to append refs. Ecclesiastes makes the fear of God its entire resolution, so this gap is the book's single largest unserved theme. | Ecclesiastes / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Eccl 3:19–21 ("As the one dies, so the other dies... All go to one place"); 9:2–6 ("There is one event to the righteous and to the wicked"; "the living know that they will die"); 9:10 (no work or wisdom in Sheol); 12:1–7 (the allegory of aging ending at dust and spirit) | Alongside Job's landed refs, Ecclesiastes is Scripture's most sustained meditation on death's universality. Register boundary respected: the Philippians `death-of-a-believer` row carries the dying believer's hope — a different register from these under-the-sun texts. | Ecclesiastes / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Eccl 4:1–3 ("the tears of those who were oppressed, and they had no comforter"); 5:8 (oppression of the poor watched by hierarchies of officials); 8:9 ("one man has power over another to his hurt") | Ecclesiastes contributes the observer's register — the sorrow of *seeing* unremedied oppression — to the row's civic, imperial, national-enslavement, and provision-care registers. | Ecclesiastes / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Eccl 5:4–6 ("When you vow a vow to God, don't defer to pay it... It is better that you should not vow, than that you should vow and not pay") | The Bible's most direct teaching text on vow-keeping, joining the row's narrative oaths (Joshua, Ruth) and the NT counterpoint (Matt 5:33–37; Jas 5:12). | Ecclesiastes / 2026-08-23 |
| `prosperity-of-the-wicked` *(append to existing Job row)* | Eccl 7:15 ("there is a wicked man who lives long in his evildoing"); 8:10–14 (the wicked buried with honor; "there are righteous men to whom it happens according to the work of the wicked") | Ecclesiastes states the observed inversion as flatly as any text in Scripture, alongside the row's Job 21/24 texts. | Ecclesiastes / 2026-08-23 |
| `money-and-possessions` *(append to existing Mark row)* | Eccl 5:10–17 ("He who loves silver shall not be satisfied with silver"; "wealth kept by its owner to his harm"); 6:1–2 (riches without power to enjoy them); 10:19 ("money is the answer for all things" — the wry observation form a searcher may quote) | The OT wisdom witness for the row's danger-of-riches register (resolved home of the Proverbs thread's `money-and-wealth` staging, per its v3 ruling). Curator note: `contentment` already carries "money"/"wealth" lexicon entries; the row should route what-does-the-Bible-say-about-money queries without double-claiming contentment's register. | Ecclesiastes / 2026-08-23 |

Contingency hand-off: `aging-and-old-age` (Psalms 51–100 draft row, unlanded at this
write; the Proverbs draft also appends to it) — when the Psalms thread lands that
row, it should carry Ecclesiastes' refs: Eccl 12:1–7 (the canonical allegory of old
age — the trembling keepers, darkened windows, blossoming almond tree, severed
silver cord); 11:8 ("let him remember the days of darkness, for they shall be
many"). If that row never lands, Eccl 12:1–7 alone justifies the gap, and a later
thread may mint it with these refs.

Checked and declined (recorded so later threads don't re-log them): wisdom's limits
(Eccl 1:17–18; 7:23–24; 8:16–17) → the positive side routes to `wisdom-from-god`,
and the limits theme belongs to the `vanity-of-life` row above rather than its own
id; patience (7:8 — one verse here; a patience gap, if logged, should come from a
book that teaches it sustainedly, e.g. James); death-and-burial (the Genesis row is
the practice/funeral register — Ecclesiastes' material is mortality itself, appended
above); vows (folded into the `oaths-and-vows` append above, not a new row).

## Jeremiah appends + new rows — 2026-08-23 (Isaiah–Daniel thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Jeremiah staged gap
file (`tag-gaps-proposed.md`, book-thread scratchpad; anchored to its critic
Round 2 live-file re-read at 2026-08-23T06:45Z) and delivered with the approved
Jeremiah book doc (`jeremiah.md`, this directory) after its critic loop closed at
Round 3 with zero objections. Routing resolved per the staged file's binding
append-time rule against a full re-read of this file immediately before this
append — first with the 1 Thessalonians and 2 Samuel blocks newest present,
then re-run against an Ecclesiastes block that landed concurrently between that
read and this write (RACE RECORD): its three new rows (`vanity-of-life`,
`seasons-of-life`, `enjoying-gods-gifts`) are different themes from the two new
rows below, its appends share five owner rows with this block
(`fear-of-the-lord`, `mortality`, `justice-and-oppression`, `oaths-and-vows`,
`prosperity-of-the-wicked`) as compatible ref-appends, and it carries no
Jeremiah refs — so it changes no routing below. Delivery-time conversions, all per §9's
append-to-existing rule: the staging's five formerly-Isaiah-proposed append
targets resolved against the delivered "Isaiah appends + new rows" block — four
(`power-of-gods-word`, `sovereignty-of-god`, `god-reigns`, `no-other-god`) are
now LIVE Isaiah-minted rows and take the Jeremiah refs as staged, and the fifth
(`messianic-promise`) never landed as its own row (the Isaiah delivery folded it
into the live Zechariah `messianic-prophecy` row), so its remaining refs
(Jer 30:9, 21) route to that then-current home, exactly as the staging's
fallback directs. All eighteen staged live-row append targets were confirmed
present under their staged owner rows, and the live file carries no Jeremiah
refs in any row's Where column (the Job `prosperity-of-the-wicked`, Zechariah
`the-branch` and `shepherds-and-the-flock`, and Lamentations rationale citations
of Jeremiah texts are those rows' own text, not appends). The two NEW rows below
were re-verified genuinely new at this append: no relenting /
does-God-change-his-mind row and no persecution row exists anywhere in this file
by theme — the Malachi `gods-unchanging-nature` row is the adjacent but distinct
immutability register (cross-note carried in-row below) — and neither id is in
the 131-id vocabulary. Note: the Lamentations block's mentions of Jeremiah
routing (`lament` — Jer 15:10–18; 20:7–18; `care-for-widows` — Jer 7:6; 22:3;
49:11; the `sojourners-and-strangers` exile precedent) described this thread's
staged decisions ahead of delivery; this block is where those refs actually land
on the live rows. Rows marked *(append to existing row)* add Jeremiah's
locations to the named row earlier in this file — read them together with that
row; the first two rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `god-relents` (or `does-god-change-his-mind`) | Jer 18:7–10; 26:3, 13, 19; also 20:16 | "Does God change his mind" / "God relents" is a real lay and apologetics query with no home. Jer 18:7–10 is Scripture's most explicit statement of the principle (announced disaster withdrawn when a nation turns) and ch 26 shows it working (Hezekiah's Jerusalem spared). `repentance` covers the human side only; `providence` doesn't serve the question. Jonah 3–4 and Joel 2:13–14 will join. Gist wording needs care: the conditional-prophecy pattern, not divine fickleness. Advisory cross-note: the live `gods-unchanging-nature` row (Malachi) is adjacent — distinct registers (immutability vs conditional-prophecy relenting); keep the two separate. | Jeremiah / 2026-08-23 |
| `persecuted-for-gods-word` (or `persecution`) | Jer 15:15; 18:18; 20:1–2, 7–10; 26:8–15, 20–23; 36:26; 37:13–16; 38:1–6 | "Persecution in the Bible" / "persecuted for my faith" are common pastoral queries, and the OT's persecuted-prophet narratives cannot honestly be tagged today: `suffering-for-christ` ("Suffering with Christ") is NT-framed and would be a read-back on Jeremiah in the stocks (20:2), on trial for his life (26:8–15), hunted (36:26), beaten and jailed (37:13–16), sunk in the mire (38:1–6), or Uriah executed (26:20–23). A translation-neutral persecution concept would serve both testaments. Merged from two ranges' proposals (`persecution` / `persecuted-for-gods-word`). | Jeremiah / 2026-08-23 |
| `messianic-prophecy` *(append to existing Zechariah row; Isaiah refs already merged)* | Jer 30:9, 21 | Staged as refs for Isaiah's proposed `messianic-promise` row — same gap, same query family — and that proposal folded into this row at the Isaiah delivery, so the refs follow to the then-current home per the staging's fallback rule. The Branch refs staged alongside them (Jer 23:5–6; 33:14–16) were re-routed to the `the-branch` row at critic Round 2 and land there below. 30:9 (David their king raised up for them) and 30:21 (the ruler from their midst who draws near to God) are signposted in the book doc as historic messianic readings — attributed, adjudicating nothing, per the row's locator design. | Jeremiah / 2026-08-23 |
| `power-of-gods-word` *(append to existing Isaiah row)* | Jer 1:12; 5:14; 20:9; 23:28–29; 36:23–32; 44:28–29; 51:12 | Jeremiah supplies the row's working narratives of the word's own efficacy: God watching over his word to perform it (1:12), the word as fire and hammer (5:14; 23:28–29), "a burning fire shut up in my bones" that cannot be held in (20:9), the burned scroll rewritten with many similar words added (36:23–32), and the whose-word-will-stand test set against Egypt and Babylon (44:28–29; 51:12). | Jeremiah / 2026-08-23 |
| `sovereignty-of-god` *(append to existing Isaiah row)* | Jer 18:1–10; 27:5–7; 32:17, 27 | The potter's-house visit (18:1–10 — also the ground of the new `god-relents` row above; distinct registers), the earth and its nations given to "Nebuchadnezzar the king of Babylon, my servant" (27:5–7), and the nothing-too-hard-for-God exchange (32:17, 27) join the row's Cyrus and end-from-the-beginning texts. The row's check-a-`providence`-lexicon-extension-first advice stands. | Jeremiah / 2026-08-23 |
| `god-reigns` *(append to existing Isaiah row)* | Jer 10:7, 10 | Jeremiah's doxology against the idols names the LORD King of the nations (10:7) and the true God, the living God, an everlasting King (10:10) — the OT kingship-declaration register this row documents, on the row's own boundary against the NT kingdom-announcement row. | Jeremiah / 2026-08-23 |
| `no-other-god` *(append to existing Isaiah row)* | Jer 2:11; 10:6, 10; 16:20 | The no-gods contrast worked in narrative: a nation trading its glory for what does not profit (2:11), none like the LORD among the nations (10:6, 10), and man-made gods that are no gods (16:20) — joining the row's trial-speech refrain, with the same overlap toward the `idolatry` theme the row already flags (Jeremiah's idolatry refs land on that row below). | Jeremiah / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Jer 15:15; 18:21–23; 20:12; 46:10; 50:15, 28; 51:6, 11, 36, 56 | Vengeance handed to God or claimed by God: the prophet's own avenge-me prayers (15:15; 18:21–23; 20:12) and the vengeance-is-the-LORD's refrain of the Babylon oracles (50–51), with the same routing caveat as the row's rationale (to what Scripture says about vengeance, never endorsement). | Jeremiah / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Jer 29:4–7; 42:15–22; 43:5–7; 44:1, 8, 12–14 | The exile register the Lamentations append follows (this is the routing precedent that append cites): exiles told to build, plant, and seek their captor city's peace (29:4–7), and the remnant as displaced foreigners in Egypt against the word (42–44). | Jeremiah / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Jer 34:8–20 | A covenant cut before God — the calf halved and passed between — then broken: the row's gravest broken-covenant text, joining its kept-costly (Joshua 9) and rash (1 Sam 14) narratives from the other side. | Jeremiah / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Jer 9:21–22 | "death has come up into our windows" — mortality personified reaching every house and the fallen like sheaves after the reaper, a compact anchor for the row's "death in the Bible" queries. | Jeremiah / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Jer 5:26–29; 7:5–7; 21:12; 22:3, 15–17; 50:33–34 | The national-scale justice material displaced from `pastoral-refuge-and-justice` by the 2026-08-23 pastoral-register ruling — the same routing the row's Job, Exodus, and Isaiah appends record for that ruling: houses full of deceit and the fatherless undefended (5:26–29), the temple-gate conditions (7:5–7), the king's morning-by-morning charge (21:12; 22:3), Josiah's justice remembered against his son's unjust gain (22:15–17), and the oppressed with a strong Redeemer (50:33–34). | Jeremiah / 2026-08-23 |
| `false-prophets` *(append to existing Micah row)* | Jer 5:31; 6:13–14; 8:8–11; 14:13–16; 23:9–40; 27:9–16; 28:1–17; 29:8–9, 21–32; 37:19; also 4:10; 20:6 | Jeremiah is Scripture's most sustained treatment ("Peace, peace! when there is no peace," 6:14; 8:11; prophets who "speak a vision of their own heart," 23:16; the Hananiah collision, ch 28; the letters against Ahab, Zedekiah, and Shemaiah, ch 29); proposed independently by three Jeremiah ranges before the Micah row landed. Related live row: 2 John's `false-teachers` (NT deceiver register) — the curator may merge the two rows or keep the registers distinct. | Jeremiah / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Jer 4:19–21; 8:18–9:2; 9:10, 17–22; 10:19–20; 13:17; also 15:10–18; 20:7–18 | "Lament in the Bible" / "how to lament" is a live pastoral-practice query (the repo's concept-curation skill names "add concepts about lament" as a sample request), and under the 2026-08-23 pastoral-register ruling the weeping-prophet material has no tag home; the taught wailing of the mourning women (9:17–22) is direct material for the row's teach-lament register. Boundary note preserved: one drafter judged the confessions (15; 20) served by `wrestling-with-god` / `doubt` — settle the edge before minting; the Lamentations append's Lam 3 boundary note inherits the same ruling. | Jeremiah / 2026-08-23 |
| `knowing-god` *(append to existing Hosea row)* | Jer 9:23–24; 22:15–16; 24:7; 31:34; also 2:8; 9:3, 6 | The signature OT boast text: glory only "that he has understanding, and knows me" (9:23–24); judging the poor and needy known as knowing God (22:15–16); the given heart to know (24:7); and the new-covenant promise that all will know him (31:34). The Hosea row's check-`hunger-for-god`-lexicon-first note matches the Jeremiah ranges' independent conclusion. | Jeremiah / 2026-08-23 |
| `day-of-the-lord` *(append to existing Obadiah row)* | Jer 46:10 ("For that day is of the Lord, GOD of Armies, a day of vengeance"); optionally 25:30–33 | 46:10 is a phrase witness extending the row through the major prophets' oracles against the nations; 25:30–33 is offered with the staging's caveat (the phrase itself does not occur there; thematic fit only — curator's discretion). | Jeremiah / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Jer 5:22–24 ("Don't you fear me?... Let's now fear the LORD our God"); 10:7 | The row's rationale invites sibling appends; Jeremiah adds the creation-bounded fear argument (the sand as the sea's boundary) and the King-of-the-nations doxology's who-would-not-fear question. | Jeremiah / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Jer 2:11–13, 27–28; 7:18, 30–31; 10:3–5, 8–9, 14–15; 11:13; 16:11, 18, 20; 19:4–5, 13; 25:6; 32:29–35; 43:12–13; 44:15–19, 25; 50:2, 38; 51:17–18, 47, 52 | Broken cisterns against the spring of living waters, gods as many as the cities, the scarecrow-in-a-cucumber-field satire (10:3–5), the queen of the sky cakes (7:18; 44), and the child sacrifice texts folded in (7:31; 19:5; 32:35) — Jeremiah's span joins the row's command-law, prophetic, and satire refs. | Jeremiah / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | Jer 4:27; 5:10, 18; 6:9; 23:3–4; 24:5–7; 40:11, 15; 42:2; 44:12–14, 28; 50:20 | The not-a-full-end reservations (4:27; 5:10, 18), the gleaned remnant (6:9), the gathered flock with shepherds over it (23:3–4), the good figs (24:5–7), and chs 40–44 — Scripture's most sustained remnant narrative, where the remnant's own choices are the story. | Jeremiah / 2026-08-23 |
| `bondservants-and-masters` *(append to existing Colossians row)* | Jer 34:8–22 | Proclaimed liberty for Hebrew slaves, its revocation, and God's judgment on the re-enslavers, with the Exod 21 / Deut 15 release law recalled in-text (34:13–14); Jeremiah's staged `slavery-and-release` row folded into this row at critic Round 1. Curator note: Jeremiah adds the OT release-law-and-judgment register to the row's NT household-duties register — decide one concept or two before minting; the row's never-read-as-endorsement wording caveat applies doubly. | Jeremiah / 2026-08-23 |
| `care-for-widows` *(append to existing Ruth row)* | Jer 7:6; 22:3; 49:11 | God's own pledge: "Leave your fatherless children. I will preserve them alive. Let your widows trust in me" (49:11), with the temple-gate and king's-house commands (7:6; 22:3). Jeremiah's staged `widows-and-orphans` row folded into this row at critic Round 1; these are the refs whose widening note (fatherless alongside widow — consider `widows-and-orphans` / `god-of-the-fatherless` for the eventual id) the Lamentations append already cites. | Jeremiah / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Jer 5:3, 23; 7:24; 9:14; 11:8; 13:10; also 3:17; 4:4; 9:26 | The Exodus row's Pharaoh texts are the classic refs this staging anticipated; Jeremiah adds the refrain "walked in the stubbornness of their evil heart" (7:24; 9:14; 11:8; 13:10), faces "harder than a rock" (5:3), and the uncircumcised heart (4:4; 9:26). The staged extension note travels with the refs: check a lexicon extension of `repentance` or `sin` first. | Jeremiah / 2026-08-23 |
| `prosperity-of-the-wicked` *(append to existing Job row)* | Jer 12:1–4; 5:27–28 | The row's rationale already cites Jer 12:1 — these are its refs: "Why does the way of the wicked prosper?" (12:1) and the great, rich, and fat who "excel in deeds of wickedness" (5:27–28). The staged extension note travels with the refs: check a lexicon extension of `wrestling-with-god` before minting. | Jeremiah / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Jer 10:2 ("don't be dismayed at the signs of the sky"); 27:9 (diviners, dreams, soothsayers, sorcerers); 29:8 | Staged as refs for Isaiah's proposed `divination-and-the-occult` row and re-routed here at critic Round 2 when this row went live (same theme): the astrology-anxiety text (10:2) and the don't-listen commands against the nations' and exiles' diviners and dreamers (27:9; 29:8) join the row's narrative, command-law, and prophetic-indictment refs. | Jeremiah / 2026-08-23 |
| `the-branch` *(append to existing Zechariah row)* | Jer 23:5–6 ("I will raise to David a righteous Branch"; "The LORD our righteousness"); 33:14–16 ("a Branch of righteousness") | The row's rationale already names Jer 23:5; 33:15 as completing the Branch-title set — these are those texts, re-routed here from the staged `messianic-promise` item at critic Round 2, including the name given to the city in 33:16. | Jeremiah / 2026-08-23 |

Checked and already covered (recorded so later threads don't re-log):
drought/famine (Jer 14; 37:21; 38:9; 52:6) → `gods-provision` (PR #41 lexicon
extension); pride (Jer 13; 22:13–15; 36:23–24; 48:29; 49:16; 50:29–32) →
`humble-exaltation` (PR #41 lexicon extension); backsliding/returning →
`repentance` (plus `pastoral-relapse-and-restoration` for the personal
register); intercession (Jer 14; 37:3; 42:2) → `prayer`, per the Genesis
thread's ruling; oracles against the nations as a category →
`nations-and-peoples` + `divine-judgment`. Checked and declined: drunkenness at
Jer 13:13 — judgment imagery, not the practice, so nothing is appended to the
now-live Isaiah `drunkenness` row (the staging's no-live-row note is superseded
by that row's landing, but the substance ruling stands); assassination /
political violence (chs 40–41) — not a plausible search-user concept; no row.

## Proverbs appends and new row — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Re-deduped against this file's live
state (1438 lines, blocks through 2 Samuel) immediately before this append. One
row is new — checked at write time: no correction/teachability row exists
anywhere in this file, and `receiving-correction` is not among the 131 ids in
the vocabulary at `b3f491d`. One staged new row was CONVERTED at this write-time
re-read: `alcohol-and-drunkenness` became an append because Isaiah's
`drunkenness` row landed first (same lay-query register). Every other entry
appends Proverbs' locations to a named existing row earlier in this file — read
them together with that row; 2 Samuel's same-day appends to `leadership`,
`fear-of-the-lord`, and `justice-and-oppression` are additions to those same
rows, not supersessions, and this block's refs sit alongside them. Three further
appends target rows the Psalms sibling drafts hold that have NOT yet landed;
they are recorded below as contingencies for the Psalms write to resolve.
Sourced from the Proverbs book doc's Tag-gap section (`proverbs.md`, this
directory), critic-approved round 3 (zero objections).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `receiving-correction` | Prov 9:8–9; 12:1; 13:18; 15:31–32; 17:10; 25:12; 27:5–6; 29:1 | "How to take criticism," "accepting correction," "teachable spirit" — a live discipleship query with no home: `the-lords-discipline` is God's discipline (Hebrews 12 register) and `parenting` is giving correction to children; the wisdom literature's distinctive teaching — loving reproof from any source as life ("He who is often rebuked and stiffens his neck," 29:1) — is unserved. Could alternatively be a lexicon extension of `the-lords-discipline`; check that route before minting. Adjacent row: 2 Corinthians' `church-discipline` (the congregation's corporate process) is a different register from personal teachability. | Proverbs / 2026-08-23 |
| `drunkenness` *(append to existing Isaiah row)* | Prov 20:1 ("Wine is a mocker"); 23:20–21; 23:29–35 (the woe-catalog); 31:4–7 (Lemuel's rulers-and-wine charge) | Converted at write time from a staged `alcohol-and-drunkenness` new row — the Isaiah row landed first and serves the same "what does the Bible say about alcohol / drinking / drunkenness" query family. Proverbs holds Scripture's most vivid teaching texts on it; later threads (Eph 5:18; 1 Cor 6) will multiply refs. Register cross-note carried from the staging, for the curator: `pastoral-freedom-from-bondage` DOES carry crisis-register drink vocabulary ("alcoholism," "cant stop drinking") — that pack serves the person in addiction crisis; this row is the what-does-the-Bible-say teaching register, and the two must not be collapsed. Compatible with the row's own note to check a `self-control` lexicon extension before minting — decide that route for both books together. | Proverbs / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | Prov 1:10 ("if sinners entice you, don't consent"); 7:6–23; 16:29 ("a man of violence entices his neighbor") | The resistance-training texts answering the row's complaint that the vocabulary carries only the response side: Scripture's plainest anti-temptation imperative (1:10) and the anatomized seduction of the simple young man (7:6–23). | Proverbs / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Prov 20:22 ("Don't say, 'I will pay back evil.' Wait for the LORD"); 24:29; 25:21–22 (feed your hungry enemy) | The renounce-payback teaching texts — exactly the routing the row wants. | Proverbs / 2026-08-23 |
| `gloating-over-downfall` *(append to existing Obadiah row)* | Prov 24:17–18 ("Don't rejoice when your enemy falls"); 17:5 ("He who is glad at calamity shall not be unpunished") | The row already cites Prov 24:17 as the theme's most direct text alongside Obad 1:12 — these land the in-book refs. | Proverbs / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Prov 16:10–15; 20:8, 26, 28; 25:2–5 (take away the wicked and the throne stands); 28:2, 15–16 (the roaring-lion ruler); 29:4, 12, 14; 31:4–9 (Lemuel's charge) | Proverbs is Scripture's densest manual on rulers after Deuteronomy 17 — the throne established by righteousness, the cost of a wicked ruler, and the king's charge to judge righteously; sits alongside the row's 2 Samuel shepherd-king append. | Proverbs / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Prov 1:7; 9:10 (the book's twin mottoes); 8:13 ("The fear of the LORD is to hate evil"); 14:26–27; 15:33; 16:6; 19:23; 23:17; 28:14; 31:30 | Proverbs is the phrase's keynote book; the Job append's curator note (wisdom-flavored queries land on `wisdom-from-god` via its Prov 9:10 anchor, but the bare phrase and its piety sense remain unserved) is exactly this book's situation. | Proverbs / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Prov 14:31; 17:15; 21:13; 22:22–23 ("the LORD will plead their case"); 23:10–11 ("their Defender is strong"); 28:15–16; 29:7, 14; 31:8–9 ("Open your mouth for the mute") | Proverbs consistently states the civic/economic-justice register that the pastoral-packs ruling routes to this row rather than to the `pastoral-*` packs. | Proverbs / 2026-08-23 |
| `sowing-and-reaping` *(append to existing Hosea row)* | Prov 22:8 ("He who sows wickedness reaps trouble"); 11:18 ("one who sows righteousness reaps a sure reward") | The wisdom-literature witnesses for a row whose rationale notes no concept carries the sowing/reaping frame in either testament; the Galatians append's doctrinal note (never seed-faith return-on-giving framing) matches Proverbs' own act–consequence-as-generalization rule. | Proverbs / 2026-08-23 |
| `empty-worship` *(append to existing Amos row)* | Prov 15:8 ("The sacrifice made by the wicked is an abomination to the LORD, but the prayer of the upright is his delight"); 21:3 (righteousness and justice "more acceptable to the LORD than sacrifice"); 21:27; 28:9 (the law-refuser whose "prayer is an abomination") | The wisdom-literature core of why God rejects worship, alongside the row's Amos 5 and Matthew 15 texts. | Proverbs / 2026-08-23 |
| `integrity` *(append to existing Job row)* | Prov 10:9 ("He who walks blamelessly walks surely"); 11:3 ("The integrity of the upright shall guide them"); 19:1; 20:7 ("A righteous man walks in integrity. Blessed are his children after him"); 28:6, 18 | The wisdom-sentence core for the row's whole-life-uprightness queries, with the generational note (20:7). | Proverbs / 2026-08-23 |
| `prosperity-of-the-wicked` *(append to existing Job row)* | Prov 3:31; 23:17–18; 24:1–2, 19–20 | The wisdom-answer side ("don't envy… there will be no reward to the evil man") that complements the row's Job 21 / Psalm 73 / Hab 1:13 refs. | Proverbs / 2026-08-23 |
| `knowing-god` *(append to existing Hosea row)* | Prov 2:5 ("then you will understand the fear of the LORD, and find the knowledge of God"); 9:10 ("The knowledge of the Holy One is understanding") | Modest append, a judgment call recorded here: genuine knowledge-of-God-as-relationship texts of the row's register, reached as the goal of seeking wisdom — the wisdom-book witness rather than the row's core. | Proverbs / 2026-08-23 |
| `mercy` *(append to existing Hosea row)* | Prov 28:13 ("whoever confesses and renounces them finds mercy"); 11:17 ("The merciful man does good to his own soul") | Modest append, a judgment call recorded here: the finds-mercy promise the row's bare-"mercy" queries reach for, plus the human-mercy side; both flagged for the curator's extension-vs-new-id decision on that row. | Proverbs / 2026-08-23 |
| `money-and-possessions` *(append to existing Mark row)* | Earning/keeping register: Prov 13:11 ("Wealth gained dishonestly dwindles away"); 28:20, 22 ("one who is eager to be rich will not go unpunished"); 23:4–5 ("Don't weary yourself to be rich"). Riches'-limits register: 10:22; 11:4, 28 ("He who trusts in his riches will fall"); 15:16; 16:8. Debt texts: 6:1–5; 11:15; 17:18; 20:16; 22:26–27 | Converted at round 2 from a staged `money-and-wealth` new row — the Mark row's rationale opens with the same lead query verbatim ("What does the Bible say about money"). Rationale correction, recorded honestly: `contentment.yaml` at `b3f491d` deliberately carries the bare lexicon tokens "wealth," "money," "finances," and "debt" (its header calls routing wealth-seekers to contentment teaching "this concept's entire point") and anchors Prov 22:7 and 30:8 — so money-contentment and plain debt queries already have a designed home; what remains unserved is what the Mark row names (danger-of-riches teaching) plus the earning/keeping register here. The debt texts (alongside contentment's anchored 22:7) ride as a fold-into-lexicon or `debt-and-borrowing`-split decision, with a cross-note to Matthew's `stewardship` row (entrusted-resources register) — scope all three together. | Proverbs / 2026-08-23 |
| `unanswered-prayer` *(append to existing 2 Corinthians row)* | Prov 21:13 ("he will also cry out, but shall not be heard"); 28:9 ("even his prayer is an abomination"); 1:28 ("but I will not answer" — caveat: the speaker is personified Wisdom, refused too long); 15:29 as the positive contrast ("he hears the prayer of the righteous") | Proverbs holds the OT's plainest moral-conditions texts for the row's "why doesn't God answer" queries — the stopped ear answered in kind, and prayer voided by refusing God's word. | Proverbs / 2026-08-23 |
| `confession-of-sin` *(append to existing 1 John row)* | Prov 28:13 ("He who conceals his sins doesn't prosper, but whoever confesses and renounces them finds mercy") | The OT's core confession-practice text; the Proverbs doc's own motif list routes "confessing sin bible verse" to it. | Proverbs / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Prov 28:14 ("one who hardens his heart falls into trouble"); 29:1 ("He who is often rebuked and stiffens his neck will be destroyed suddenly") | The self-hardening side for the row's own "is my heart hardened?" query — set against "blessed is the man who always fears" (28:14), with the stiffened neck under repeated rebuke (29:1). | Proverbs / 2026-08-23 |
| `favoritism` *(append to existing James row)* | Prov 18:5 ("To be partial to the faces of the wicked is not good"); 24:23 ("To show partiality in judgment is not good"); 28:21 (partiality "for a piece of bread") | The wisdom-literature partiality texts behind James's courtroom scene. | Proverbs / 2026-08-23 |
| `god-looks-at-the-heart` *(append to existing 1 Samuel row)* | Prov 16:2 ("the LORD weighs the motives"); 17:3 ("the LORD tests the hearts"); 21:2 ("the LORD weighs the hearts"); 24:12 ("he who weighs the hearts"); 15:11; 20:27 ("The spirit of man is the LORD's lamp, searching all his innermost parts") | Proverbs is the row's densest witness outside 1 Sam 16:7 itself — the same God-sees-beneath-appearances register — and strengthens the row's extension-vs-mint question with anchor-grade texts. | Proverbs / 2026-08-23 |
| `the-name-of-god` *(append to existing Exodus row)* | Prov 30:9 ("and so dishonor the name of my God"); 18:10 ("The LORD's name is a strong tower") | Modest append, a judgment call recorded here: 30:9 is honoring the name in daily conduct, the row's third-commandment register; 18:10 flagged — the Proverbs doc routes it to `refuge-in-trouble`, so it is a name text of the trusting-the-name register, adjacent to the row's revelation-of-the-name core. | Proverbs / 2026-08-23 |

Held for the Psalms write — CONTINGENT (checked at write time: none of these
three rows has landed in this file; the Psalms sibling drafts hold them. The
Psalms thread must fold these Proverbs refs into its rows when they land — or
repoint them here with an addendum if a row is renamed or declined):
`slander-and-false-accusation` — Prov 10:18 ("he who utters a slander is a
fool"); 25:18 (false testimony as club, sword, and sharp arrow); 26:20–22;
30:10 ("Don't slander a servant to his master"). `trustworthiness-of-scripture`
— Prov 30:5–6 ("Every word of God is flawless… Don't you add to his words").
`aging-and-old-age` — Prov 16:31 ("Gray hair is a crown of glory. It is
attained by a life of righteousness"); 20:29; 17:6 (grandchildren the crown of
old men); 23:22 (the mother grown old, not despised).

Checked against the live log and declined (recorded so later threads don't
re-check): `slow-to-anger` (Nahum row) — that row is God's patience (Exod 34:6
formula); Proverbs' slow-to-anger sayings (14:29; 15:18; 16:32; 19:11) are the
human virtue, routed to `self-control` in the book doc's tags. `stewardship`
(Matthew row) — entrusted-resources register; Proverbs' money material rides
the Mark `money-and-possessions` append above, which keeps the cross-note.
`restitution` (Exodus row) — Prov 6:30–31's sevenfold repayment is the
a-fortiori step in the adultery argument, not restitution teaching.
`complacency` (Zephaniah row) — Prov 1:32 ("the careless ease of fools") is
careless ease in refusing personified Wisdom's call, not the row's
settled-denial-that-God-acts register (Zeph 1:12). `deliverance` (1 Samuel
row) — Proverbs' nearest sayings (11:8; 12:13) are act–consequence
generalizations, not the row's rescue-narrative register. `sacrifice-and-atonement`
(Exodus row) — Proverbs' sacrifice sayings are the why-God-rejects-worship
register appended to `empty-worship` above; Prov 16:6 ("By mercy and truth
iniquity is atoned for") carries atonement vocabulary in a non-ritual sense and
is left to the curator rather than appended. `craftsmanship-and-creativity`
(Exodus row) — Prov 8:30 is personified Wisdom at creation, not the Bezalel
Spirit-given-artisan-skill register. `shepherds-and-the-flock` (Zechariah row)
— Prov 27:23 ("Know well the state of your flocks") is literal husbandry
counsel, not the shepherd-as-leader metaphor that row collects.

## Judges appends — 2026-08-23 (re-applied after concurrent-write loss)

Repair append: a finalize-audit of this file found the original "Judges appends
— 2026-08-23" block missing (lost to another thread's stale-read full-file
save, the same failure mode as the 2 Thessalonians and Hebrews–Revelation
repairs above). Reconstructed from the Judges book doc's Tag-gap section
(`judges.md`, this directory — its drafting record lists exactly what the lost
block carried) and re-deduped against this file's live state immediately before
this append; nothing above this line was edited. One disposition changed at
re-apply: the original block minted `deliverance` as a NEW row, but the
1 Samuel `deliverance` row now stands (and invites sibling refs), so Judges'
refs are appended to it instead. The other four new rows
(`empowered-by-the-spirit`, `backsliding`, `gods-surprising-choice`,
`right-in-their-own-eyes`) were re-checked at write time: none exists anywhere
in this file and none is in the 131-id vocabulary. Re-applied by the 2 Samuel
thread under the coordinator's restoration protocol.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `empowered-by-the-spirit` | Judg 3:10; 6:34; 11:29; 13:25; 14:6, 19; 15:14 | "The Spirit of the LORD came on him," one of Judges' most-quoted refrains, has no honest home: bare "holy spirit" queries route to `holy-spirit-the-comforter`'s John-14 Comforter register, `spiritual-gifts` is 1 Corinthians-shaped, and the `outpouring-of-the-spirit` row (Joel) covers the promised outpouring — the OT empowerment-for-a-task register is a gap. | Judges / 2026-08-23 (re-applied) |
| `backsliding` | Judg 2:11–19 (the cycle stated); 3:7, 12; 4:1; 6:1; 8:33–35; 10:6; 13:1; Heb 2:1–4; 3:12–19; 5:11–6:12; 10:26–31; 12:15–17, 25 | "Backsliding," "drifting from God," and "why do I keep going back" as a repeated-pattern query family have no home — `pastoral-relapse-and-restoration` serves the personal "failed again" register, not the corporate relapse cycle Judges narrates seven times. Possible alternative: extend `pastoral-relapse-and-restoration`'s lexicon rather than mint a new id — flagged for curation judgment. | Judges / 2026-08-23 (re-applied) |
| `gods-surprising-choice` | Judg 3:15, 31; 4:9, 21; 6:15 ("my family is the poorest in Manasseh, and I am the least"); 7:2–7; 11:1–11; 15:15 | God's use of weak and unlikely instruments — the left-handed judge, the ox-goad, a woman with a tent peg, the least of the poorest clan, three hundred against a host, an outcast's son, a donkey's jawbone — is the Genesis pilot's deferred extension candidate, and Judges is its densest narrative evidence. Read with the 1 Samuel block's deferral note (16:11–12; 9:21 overlap `god-looks-at-the-heart` and `humble-exaltation`): one design should be decided before any pack is minted. | Judges / 2026-08-23 (re-applied) |
| `right-in-their-own-eyes` | Judg 17:6; 21:25 (with 18:1; 19:1) | The book's own thesis statement — "Everyone did that which was right in his own eyes" — is a widely quoted, widely searched line with no vocabulary target. Alternative: fold into a future discernment/authority concept — flagged for curation judgment. | Judges / 2026-08-23 (re-applied) |
| `deliverance` *(append to existing 1 Samuel row)* | Judg 2:16, 18 ("The LORD raised up judges, who saved them"); 3:9, 15; 4:23; 7:22; 10:12, 16; 15:18 | The raised-up-a-savior refrain is the row's register as narrative cycle: God the rescuer answering cries of the oppressed, book-length. Originally minted as this theme's row by the lost Judges block; converted to an append at re-apply because the 1 Samuel row now stands and invites exactly these refs. | Judges / 2026-08-23 (re-applied) |
| `idolatry` *(append to existing Micah row)* | Judg 2:11–13; 3:7; 6:25–32 (Gideon tears down Baal's altar); 8:24–27 (Gideon's ephod, "all Israel played the prostitute with it there"); 10:6; 17:1–6; 18:14–31 | Judges is the theme's narrative laboratory: the Baals-and-Ashtaroth cycle, an idol torn down at night, and an ephod and a hired-priest shrine showing home-grown idolatry inside Israel. | Judges / 2026-08-23 (re-applied) |
| `oaths-and-vows` *(append to existing Genesis row)* | Judg 11:30–31, 35–39 (Jephthah's vow); 21:1, 5, 7, 18 | Jephthah's vow is among the most-searched passages in Judges ("Jephthah's vow," "rash vow," "vows to God"), and the book's final tragedy also turns on an oath sworn at Mizpah. | Judges / 2026-08-23 (re-applied) |
| `lament` *(append to existing Joel row)* | Judg 2:4–5 (Bochim — "the people lifted up their voice and wept"); 20:23, 26; 21:2–3 | Corporate weeping before the LORD as an act of faith — named weeping-places and fasting-with-offerings scenes in the row's communal register. | Judges / 2026-08-23 (re-applied) |

## John appends — 2026-08-23 (Gospels+Acts thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads (coordination ruling 5); nothing above this line was edited. Rows marked
*(append to existing row)* add John's locations to the named row earlier in this
file — read them together with that row; the other six rows are new gaps. Sourced
from the John book doc's Tag-gap candidates section (`john.md`, this directory)
and re-deduped against this file's live state at delivery (every block appended
since Luke's delivery — Titus through Proverbs, including the re-applied Judges
block at file end — was re-read before this append): John's refs for the gaps the
Matthew and Luke blocks logged go to those rows, and two themes John staged as new
candidates were already logged by sibling threads — the unity theme (staged as
`unity-of-believers`) goes to Ephesians' `unity-of-the-church` row, whose
rationale already names John 17:20–23 as an anchor for later threads, and the
shepherding theme (staged as `shepherding-gods-people`) goes to Zechariah's
`shepherds-and-the-flock` row, whose rationale already names John 10 as cross-book
core — so both appear here as ref-appends instead of duplicate ids. Checked-none
results, recorded so no one re-derives them: `deliverance-from-demons` (Matthew
row) — John narrates no exorcism anywhere; every "demon" occurrence (7:20;
8:48–52; 10:20–21) is an accusation against Jesus, not a deliverance;
`justice-and-oppression` (Micah row) — nothing to add from John; the book's only
poor-related material is the almsgiving remarks at 12:5–8 and 13:29, not
justice/oppression teaching.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `eternal-life` | John 3:15–16, 36; 4:14, 36; 5:24, 39–40; 6:27, 40, 47, 54, 68; 10:28; 11:25–26; 12:25, 50; 17:2–3; 20:31 | "What is eternal life", "how do I get eternal life", "eternal life bible verses" — John's own name for the gift, used dozens of times, defined in-text at 17:3 ("This is eternal life, that they should know you, the only true God, and him whom you sent, Jesus Christ"), with no concept home. `salvation` and `assurance-of-salvation` cover adjacent ground but neither owns the phrase a John reader will actually search. | John (Gospels+Acts) / 2026-08-23 |
| `new-birth` (or `born-again`) | John 1:12–13; 3:3–8 | "Born again" is one of the heaviest lay queries in Christianity; `salvation` covers the outcome, not the image. Delivery note: the 1 John block withheld its `born-again` staging because `salvation.yaml`'s lexicon already carries "you must be born again" (verified by grep at that delivery), and the Titus block calls the theme near-covered but "better anchored from John 3 by that book's thread" — so this row is logged from the anchor text with that finding attached: the curator should weigh the lexicon-extension route on `salvation` (John's doc also checked `new-creation` — 2 Cor 5:17-shaped, a stretch for John 3's birth language) before minting. | John (Gospels+Acts) / 2026-08-23 |
| `i-am-sayings` | John 6:35, 41, 48, 51; 8:12, 58; 10:7, 9, 11, 14; 11:25; 14:6; 15:1, 5 | "I am statements of Jesus" / "seven I am sayings" is a standing study query with no home; the individual sayings scatter across `deity-of-christ`, `salvation`, etc., but nothing gathers the family. (The arrest scene's "I am he," 18:5–6, is adjacent material the John doc deliberately leaves unclaimed as a deity anchor.) | John (Gospels+Acts) / 2026-08-23 |
| `light-and-darkness` | John 1:4–9; 3:19–21; 8:12; 9:5, 39–41; 11:9–10; 12:35–36, 46 | "Jesus light of the world", "light and darkness in the Bible". `walking-in-the-light` exists but is 1 John-shaped (the believer's walk) and is tagged in the John doc on chapters 8 and 12; John's christological light-claims may fit better as a lexicon extension of that concept — check that route before minting. | John (Gospels+Acts) / 2026-08-23 |
| `witness-testimony` | John 1:6–8, 19–34; 3:26–36; 5:31–47; 8:13–18; 10:25, 41–42 | "Witnesses to Jesus", "testimony of John the Baptist", "why believe Jesus" — witness is John's own apologetic framework (five witnesses stacked in ch. 5 alone); `sharing-your-faith` covers the believer's evangelism, not the testimony-to-Jesus'-identity theme these texts carry. | John (Gospels+Acts) / 2026-08-23 |
| `truth` | John 14:6, 17; 16:13; 17:17–19; 18:37–38 | "What is truth", "Jesus is the truth meaning", "Spirit of truth" — Pilate's question is one of the most-quoted lines in Scripture and John answers it across the book ("Your word is truth," 17:17). No id covers truth itself; `honesty` is truthfulness of speech, `studying-the-word`/`delight-in-the-word` are practices. Delivery cross-note: 3 John's `walking-in-truth` row above is the walk-practice register, distinct from this what-is-truth register — the curator may weigh one treatment for both. Check the lexicon-extension routes before minting. | John (Gospels+Acts) / 2026-08-23 |
| `kingdom-of-heaven` (or `kingdom-of-god`) *(append to existing Matthew row)* | John 3:3, 5; 18:36 | John's only Kingdom sayings — "unless one is born anew, he can't see God's Kingdom" (3:3) ties the Kingdom to new birth, and "My Kingdom is not of this world" (18:36) is the trial's one Kingdom text. John's form is "God's Kingdom," reinforcing the row's both-phrasings note. | John (Gospels+Acts) / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | John 1:35–51; 8:31–32; 10:4–5, 27; 12:25–26; 13:35; 21:19, 22 | The first "Follow me" calls, Jesus' own definition — "If you remain in my word, then you are truly my disciples" (8:31) — following as the mark of his sheep, the call-and-cost family of losing one's life (12:25–26), and the risen Lord's renewed "Follow me" (21:19, 22). | John (Gospels+Acts) / 2026-08-23 |
| `holy-spirit` (or `the-holy-spirit`) *(append to existing Luke row)* | John 1:32–33; 3:5–8, 34; 6:63; 7:37–39; 14:16–17, 26; 15:26; 16:7–15; 20:22 | Born of the Spirit, the Spirit given "without measure" (3:34), the Spirit as the living water believers were to receive, and the Counselor teaching of chapters 14–16 — the NT's densest who-the-Spirit-is text. Routing warning (from the John doc): `holy-spirit-the-comforter` exists and is tagged in the John doc on chapters 14 and 16 — the Counselor-comfort facet HAS a home; this row is the broader who-is-the-Spirit query family, and if the gap is minted its lexicon must not double-route the Counselor queries that concept already serves. | John (Gospels+Acts) / 2026-08-23 |
| `servanthood` *(append to existing Matthew row)* | John 12:26; 13:3–17 | The Lord and Teacher washing feet — "you also ought to wash one another's feet" (13:14) — is the theme's defining enacted scene; supports the row's extension-check against `humble-exaltation` (which names God's reversal, not the serving posture itself). | John (Gospels+Acts) / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | John 14:15, 21, 23–24; 21:15–17 | John's form of the theme: love for Jesus shown in keeping his word — "If you love me, keep my commandments" (14:15) — and the thrice-asked "do you love me more than these?" (21:15–17). | John (Gospels+Acts) / 2026-08-23 |
| `unity-of-the-church` *(append to existing Ephesians row)* | John 17:11, 21–23 | John staged this as `unity-of-believers` — the same gap the Ephesians row logged first, and its rationale already names John 17:20–23 as an anchor: Jesus prays "that they may all be one," as the Father and the Son are one, three times, as the mark by which the world will believe. The John doc's rationale stands: `harmony-with-others` covers interpersonal peace, not the one-as-we-are-one unity of the church these verses teach. | John (Gospels+Acts) / 2026-08-23 |
| `shepherds-and-the-flock` *(append to existing Zechariah row)* | John 10:1–16, 27–29; 21:15–17 | John staged this as `shepherding-gods-people` — the same gap the Zechariah row logged first, and its rationale already names John 10 as cross-book core. "Feed my sheep meaning", "what does the Bible say about pastors": the good shepherd who knows, leads, and lays down his life for the flock, and the risen Jesus entrusting that flock to a restored under-shepherd three times. This routing also answers the John doc's Genesis-`leadership` overlap question — the flock-specific home exists, and this row is it. | John (Gospels+Acts) / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | John 1:51 ("the angels of God ascending and descending on the Son of Man"); 5:4 (an angel stirring the Bethesda pool — carried as regular text in the staged WEB edition); 20:12 ("two angels in white sitting, one at the head and one at the feet") | John's sparse angelic material for the row. (12:29's "An angel has spoken to him" is a crowd's guess about the voice, not an angel appearance, and is not claimed.) | John (Gospels+Acts) / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | John 19:38–42 | The burial itself: linen cloths, about a hundred Roman pounds of spices, "as the custom of the Jews is to bury," the new tomb in the garden. | John (Gospels+Acts) / 2026-08-23 |

## Daniel appends + new rows — 2026-08-23 (Isaiah–Daniel thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Daniel staged gap
file (`tag-gaps-proposed.md`, book-thread scratchpad; anchored to its
Round-1-revision live-file re-read of 2026-08-23) and delivered with the approved
Daniel book doc (`daniel.md`, this directory) after its critic loop closed at
Round 5 with zero objections. Provenance caveat carried from that doc: unlike
Isaiah, Jeremiah, and Lamentations, Daniel has ZERO verses witnessed in
`pipeline/fixtures/web-subset.json` — the fixture file simply omits book 27 — so
every ref and quoted fragment below rests on the sha-verified database extraction
chain alone (release descriptor sha256 → `content.db` → the
`pipeline/manifests/web.json` pin), which passed exactly; there is no independent
fixture-level byte-witness for this book. Routing resolved per the staged file's
binding append-time rule against a full re-read of this file immediately before
this append (John block newest present — its six new rows and its appends are
different themes and shared-owner-compatible, and it carries no Daniel refs, so
it changes no routing below). Delivery-time conversions, all per the
append-to-existing rule: of the staging's six formerly-proposal-target appends,
three (`sovereignty-of-god`, `resurrection-of-the-dead`, `god-reigns`) are now
LIVE Isaiah-minted rows and take the Daniel refs as staged; `messianic-promise`
never landed as its own row (the Isaiah delivery folded it into the live
Zechariah `messianic-prophecy` row), so its Daniel refs route to that
then-current home; `divination-and-the-occult` likewise folded into the live
1 Samuel `occult-and-divination` row — whose Isaiah append explicitly forecast
Daniel's court diviners — so its refs route there; and `persecution` went LIVE as
the Jeremiah-minted `persecuted-for-gods-word` (or `persecution`) row, so
Daniel's refs land there as a ref-append rather than riding a proposal. All five
staged live-row append owners (`angels`, `sojourners-and-strangers`,
`leadership` — Genesis; `fasting` — Joel; `idolatry` — Micah) were confirmed
present under their staged owner rows. The two NEW rows below were re-verified
genuinely new at this append: no end-times / latter-days / eschatology row
exists anywhere in this file by theme (the live Obadiah `day-of-the-lord` row is
the adjacent but distinct prophetic-day register — merge note carried in-row
below), and no unseen-conflict spiritual-warfare row exists (the live Matthew
`deliverance-from-demons` (or `spiritual-warfare`) row is the
exorcism/deliverance register — a boundary the 1 Samuel block's own notes
already draw — cross-reference note carried in-row below per the book's critic
Round 3); neither id is in the 131-id vocabulary. The live file carries no
Daniel refs in any row's Where column (the Isaiah `resurrection-of-the-dead`
row's rationale citation of Dan 12:2 is that row's own text anticipating this
decision, not an append). Rows marked *(append to existing row)* add Daniel's
locations to the named row earlier in this file — read them together with that
row; the first two rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `spiritual-warfare` | Dan 10:13, 20–21; 12:1; Rev 12:7–12, 17; 13:7; 17:14 | "Spiritual warfare" is a heavy lay query with nowhere to land: `resisting-the-devil` covers the believer's response side and `remembered-full-armor-of-god` is a verse-memory id barred from OT narrative. Dan 10 is the OT's most explicit unseen-conflict text — "the prince of the kingdom of Persia withstood me twenty-one days; but, behold, Michael, one of the chief princes, came to help me" (10:13). Eph 6 and Rev 12 would join. Gist wording must stay descriptive of what Scripture shows, not speculative demonology. Cross-reference (verified live at this append): the Matthew-logged `deliverance-from-demons` (or `spiritual-warfare`) row is the deliverance-narrative register; this row is the unseen conflict behind events — different registers, deliberately cross-referenced (the file's mortality / death-of-a-believer pattern); decide one concept or two before minting, and never mint the same suggested id twice. | Daniel / 2026-08-23 |
| `end-times` (or `time-of-the-end`) | Dan 2:28; 8:17, 19, 26; 10:14; 11:35, 40; 12:4, 9, 13 | "End times in the Bible" / "end times prophecy" is among the heaviest lay query families, and nothing serves it: `second-coming` is NT-specific ("Jesus is coming back") and would be a read-back on Daniel, and the live `day-of-the-lord` row (Obadiah) names the prophetic day of reckoning, not the appointed final period — Daniel's own vocabulary is "the time of the end" (8:17) and "the latter days" (2:28). Overlaps the live `day-of-the-lord` row and `second-coming`: decide the boundaries (one concept or two; OT/NT split or not) before minting. Merge note: if the vocabulary decision merges this into the live `day-of-the-lord` row's concept (one concept), move these refs onto that Obadiah row and drop this row — the two are deliberately cross-referenced, not duplicated; Daniel's "day of the LORD"-adjacent material is logged here rather than appended there (checked, not appended — see the closing notes). | Daniel / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Dan 3:28; 6:22 (God "sent his angel" to the furnace and the lions' den); 4:13 (a holy watcher); 8:16; 9:21 (Gabriel, Scripture's first named angel); 10:13, 21; 12:1 (Michael) | Daniel supplies the named-angel texts the row's queries reach for — Gabriel and Michael by name — plus the sent-to-deliver narratives and the watcher of ch 4. | Daniel / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Dan 1:1–7; 2:25; 5:13; 6:13 (Daniel repeatedly identified as "of the children of the captivity of Judah" — a whole life of faithfulness lived as a foreigner in a pagan empire) | The exile register the Lamentations and Jeremiah appends established on this row, lived out across a whole career: renamed, retrained, and still identified by his captors as a Judean exile decades on. | Daniel / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Dan 2:48 (Daniel set over the whole province of Babylon and made chief governor over its wise men); 6:1–4 (one of three presidents over the kingdom, "distinguished above the presidents" because "an excellent spirit was in him"; his enemies comb his service and find "no occasion or fault, because he was faithful") | Adds the faithful-administration-under-a-pagan-crown register to the row's wise-administration refs. | Daniel / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Dan 9:3 ("with fasting and sackcloth and ashes"); 10:2–3 (three weeks of mourning without pleasant food); also 6:18 (Darius passes the night fasting) | Daniel's penitential fast before the seventy-weeks prayer and the partial fast of ch 10 join the row's practice refs; the "Daniel fast" is itself a live lay query this row would serve. | Daniel / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Dan 3:1–7, 12–18 (state-compelled worship of the golden image); 5:4, 23 (praising gods "which don't see, or hear, or know" from the temple vessels) | Adds the state-compulsion register — worship commanded on pain of the furnace, and the refusal — to the row's command-law, prophetic, and satire refs. Isaiah's and Jeremiah's idolatry refs already land on this one Micah row; Daniel's join them — never a second row. | Daniel / 2026-08-23 |
| `sovereignty-of-god` *(append to existing Isaiah row)* | Dan 2:21 ("He removes kings and sets up kings"); 4:17, 25, 32, 34–35 ("the Most High rules in the kingdom of men"); 5:21 | Daniel is the strongest anchor set in Scripture for "God is in control of governments" queries — the ch 4 refrain stated four times and proved on Nebuchadnezzar himself. The row's check-a-`providence`-lexicon-extension-first advice stands. | Daniel / 2026-08-23 |
| `resurrection-of-the-dead` *(append to existing Isaiah row)* | Dan 12:2–3, 13 | The OT's most explicit resurrection statement ("Many of those who sleep in the dust of the earth will awake"), plus the personal promise of 12:13 — the very refs the row's rationale already anticipated ("Dan 12:2 and Ezek 37 will need the same decision"); the same no-read-back ruling that kept `resurrection` ("He is risen") off Isa 26:19 kept it off Dan 12:2, so the gap is now witnessed by two books. | Daniel / 2026-08-23 |
| `god-reigns` *(append to existing Isaiah row)* | Dan 2:44; 4:3, 34–35; 6:26; 7:14, 27 ("His kingdom is an everlasting kingdom" — Nebuchadnezzar's confession (4:3), echoed in Darius's decree (6:26) and in the vision's interpretation (7:27)) | The everlasting-kingdom doxologies are Daniel's contribution to the row's OT kingship-declaration register, on the row's own boundary against the NT kingdom-announcement row. | Daniel / 2026-08-23 |
| `messianic-prophecy` *(append to existing Zechariah row; Isaiah and Jeremiah refs already merged)* | Dan 7:13–14 (one like a son of man given everlasting dominion); 9:25–26 ("the Anointed One, the prince... will be cut off") | Staged as refs for Isaiah's proposed `messianic-promise` row — same gap, same query family — and that proposal folded into this row at the Isaiah delivery, so the refs follow to the then-current home per the staging's fallback rule, exactly as Jeremiah's did. Both passages are carried in the Daniel book doc as signposted historic readings, not tags — attributed, adjudicating nothing, per the row's locator design. | Daniel / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Dan 1:20; 2:2, 10–11, 27–28; 4:7; 5:7–8 (magicians, enchanters, sorcerers, Chaldeans, and soothsayers repeatedly fail where "there is a God in heaven who reveals secrets") | Staged as refs for Isaiah's proposed `divination-and-the-occult` row and routed here when that proposal folded into this row — whose Isaiah append explicitly forecast Daniel's court diviners. Daniel adds the failure-narrative register: the empire's whole divination establishment outmatched, four times, by revelation from God. | Daniel / 2026-08-23 |
| `persecuted-for-gods-word` *(append to existing Jeremiah row)* | Dan 3:8–23 (denounced and thrown into the furnace for refusing commanded worship); 6:4–17 (a law engineered specifically against Daniel's prayer) | Staged under the Jeremiah-proposed persecution row before it landed; it is now live, so these are its first sibling refs. Same rationale as the row: `suffering-for-christ` ("Suffering with Christ") is NT-framed and cannot honestly tag these narratives; a translation-neutral persecution concept would serve both testaments, and Daniel contributes the state-power register — laws written against worship itself. | Daniel / 2026-08-23 |

Checked and not appended / not logged (recorded so later threads don't re-log):
`day-of-the-lord` (live Obadiah row) — checked, not appended: Daniel's material
is "the time of the end" / "the latter days", not the prophetic "day"; logged
under the new `end-times` row above, which carries the explicit merge note.
The live 1 John `antichrist` row (with its 2 Thessalonians fold) — checked,
deliberately NOT appended: Daniel's little-horn / self-exalting-king texts
(7:8, 20–25; 8:9–12, 23–25; 11:36–45) are the classic candidate refs, but
identifying them with the antichrist is precisely the contested identification
the Daniel book doc declines to adjudicate; they remain a motif candidate with a
CAUTION there, and any future append to that row needs concept-curation
judgment first. Checked and already covered: pride (Dan 4:30, 37; 5:20–23) →
`humble-exaltation` (PR #41 lexicon extension; tagged on Dan 4, 5, 8, 11);
dreams and interpretation → `dreams-and-visions` (PR #41; tagged on Dan 2, 4,
7, 8, 10); intercession / prayer discipline (2:17–18; 6:10; 9:3–19) → `prayer`,
per the Genesis thread's ruling. Book of life (7:10; 12:1) — left as a motif
candidate, not a gap row; Rev 20:12 and Ps 69:28 would join if a future thread
judges it concept-worthy.

## Hebrews delivery — 2026-08-23 (Hebrews–Revelation thread)

Delivery-time record for the Hebrews book doc (`hebrews.md`, this directory).
Appended as one block at file end; the only lines above this one touched by
this delivery are the targeted ref-merges and confirmation-marker updates
itemized below, executed per §9's append-to-existing rule (Where columns and
our own thread's early-append markers only — no other thread's row wording was
altered). Re-deduped in full against this file's live state before this write, and
re-checked immediately after it: the John (Gospels+Acts) and Daniel
(Isaiah–Daniel) blocks landed concurrently between this delivery's first
full read (re-applied Judges block then newest) and this block's append, so
both were re-read post-append — neither carries any priesthood/high-priest,
falling-away/backsliding, or endurance/perseverance material and neither
carries Hebrews refs, so they change no disposition below; and the three
ref-merges above were each verified byte-exact against the live file at
write time, so the concurrent appends touched none of them.

Hebrews mints NO new row — all three of its staged new-gap candidates resolved
to existing homes at delivery, checked against both the `ontology/concepts/*.yaml`
lexicons and this file:

- **`christ-our-high-priest` → merged into the Exodus `priesthood` row** (Where
  column; refs Heb 2:17–18; 4:14–16; 5:1–10; 6:20; 7:11–28; 8:1–2; 9:11–14, 24;
  10:19–22). That row already owns the high-priest gap ("High priest in the
  Bible") and its rationale explicitly anticipates heavy Hebrews-facing search
  traffic. Register note for the curator: the row now spans the OT institution
  (Exodus establishment; Numbers addendum refs) and Christ's own high-priestly
  office with his ongoing intercession (Heb 7:25 — the "Jesus prays for me" /
  "who intercedes for me" query family, which `prayer`'s bare `intercession`
  lexicon entry does not serve: that is our praying, not his) — decide one id
  or two before minting, and decide alongside the Job `mediator` row (the
  umpire/advocate longing that Heb 7:25 and the mediator texts 8:6; 9:15;
  12:24 answer).
- **`warning-against-falling-away` → merged into the Judges `backsliding` row**
  (Where column; refs Heb 2:1–4; 3:12–19; 5:11–6:12; 10:26–31; 12:15–17, 25).
  No ontology lexicon carries any falling-away / apostasy / backsliding /
  drifting phrasing (the gap itself is confirmed real), and that row owns the
  same falling-away / drifting-from-God query family; Hebrews adds the warning
  register (the five warning passages — "falling away from God," "Hebrews 6
  warning," often anxious queries) beside the row's narrative-cycle register —
  decide one id or two before minting. Binding caveat carried from the Hebrews
  staging: the eventual gist must route to what the warnings say and never
  adjudicate perseverance-vs-apostasy readings (a DOCTRINAL-BASIS §4
  non-criterion).
- **`endurance` → withheld (covered), not minted**, per its own staging's
  check-that-route-first instruction: `do-not-lose-heart` is by design the
  keep-going register and its lexicon already carries Heb 10:35's phrase
  ("dont throw away your confidence", after apostrophe-stripping), and
  `remembered-joy-in-trials` carries bare "perseverance" and "patience" as
  lexicon entries — so the query family has honest homes and no row is due.
  Lexicon-extension flag (not a gap row; for curation review before any new
  id): bare "endurance" / "endure to the end" phrasings → `do-not-lose-heart`
  (Heb 10:36 and its Gal 6:9 anchor are the texts; no lexicon carries either
  bare form today).

Ref-merges and confirmations executed above: `priesthood` and `backsliding` as
itemized; `sojourners-and-strangers` (Genesis row) + Heb 11:13–16; 13:14 (the
strangers-and-pilgrims texts seeking a heavenly country, and "we don't have
here an enduring city"). The five early-appended Hebrews ref-rows in the
"Hebrews–Revelation thread — Hebrews ref-appends" block above were checked
against the delivered doc's staged list and their to-be-confirmed markers
updated in place (our own thread's block): `angels`, `temptation`, `mortality`,
and `oaths-and-vows` confirmed exactly as staged; `leadership` (Heb 13:7, 17),
which the doc did not stage, was audited against the delivered text and
confirmed rather than withdrawn — ch. 13's remember-and-imitate (13:7) and
obey-your-leaders (13:17) commands are substantive congregational-leadership
texts, and the 1 Thessalonians block has meanwhile routed its
honoring-church-leaders material onto the same row via exactly these refs —
marked added at audit.

## Revelation delivery — 2026-08-23 (Hebrews–Revelation thread)

Delivery-time record for the Revelation book doc (`revelation.md`, this
directory; critic loop closed at round 5 with a fresh critic, APPROVED — zero
objections). Appended as one block at file end; the only lines above this one
touched by this delivery are the six targeted ref-merges itemized below,
executed per §9's append-to-existing rule (Where columns only — no row's
wording was altered, ours or any other thread's). Re-deduped in full against
this file's live state immediately before each write (the Hebrews delivery
block was the newest present at the pre-write read; the live file carried no
Revelation refs in any Where column), and every merge was verified byte-exact
against the live file after writing, with all other bytes confirmed unchanged.

Revelation mints NO new row — the doc's five staged new-row candidates (staged
against the early shared snapshot, which this file has grown well past) all
resolved to existing homes or a withheld disposition at delivery, checked
against both the `ontology/concepts/*.yaml` lexicons and this file's live
state:

- **`idolatry` → merged into the Micah `idolatry` row** (Where column; refs
  Rev 9:20; 13:4, 8, 12–15; 21:8; 22:15). The row the doc's snapshot predated
  already owns the gap (Hosea, Habakkuk, Malachi, Zephaniah, 1 John, Zechariah
  refs merged; Joshua, Exodus, 1 Samuel, Daniel addendum rows). Revelation adds
  the beast-worship register — organized false worship compelled at cosmic
  scale — beside Daniel's state-compulsion refs.
- **`false-teaching` → merged into the 2 John `false-teachers` row** (Where
  column; refs Rev 2:14–15, 20–24; 13:11–15; 16:13; 18:23; 19:20). Same gap,
  same protective query family; the row's own rationale directs sibling
  threads to append rather than mint a near-duplicate. Revelation contributes
  both the congregational anchors (Balaam, the Nicolaitans, the ch. 2
  "Jezebel" figure) and the cosmic deceiver thread (the second beast's signs;
  the false prophet; Babylon's deceiving sorcery).
- **`antichrist-and-the-beast` → merged into the 1 John `antichrist` row**
  (Where column; refs Rev 13:1–18; 17:8–14; 19:19–20; the 2 Thessalonians
  man-of-sin fold rides the same row as an addendum row above). Register note
  for the curator, binding from the Revelation doc's framing rule and this
  row's existing fold note: Revelation never uses the word "antichrist" — its
  figure is "the beast" — so an eventual id must carry the beast/false-prophet
  word family alongside "antichrist" (1 John) and "man of sin"/"lawlessness"
  (2 Thess), three word families in one gap; and the gist must describe the
  figure as the texts do without endorsing any historical or modern
  identification of the beast, Babylon, or 666 with any referent (the
  identification question is exactly what the doc declines to adjudicate, and
  the Daniel block's little-horn caution on this row already draws the same
  line).
- **`endurance` → withheld (covered), not minted** — the same disposition the
  Hebrews delivery block above records, applied for consistency per its
  ruling: `do-not-lose-heart` is by design the keep-going register, and
  `remembered-joy-in-trials` carries bare "perseverance" and "patience" as
  lexicon entries, so the query family has honest homes and no row is due.
  Revelation's refs (Rev 1:9; 2:2–3, 19; 3:10; 13:10; 14:12) are recorded here
  as a second book's witness to the lexicon-extension flag logged in that
  block (not a gap row; for curation review): Rev 13:10 carries bare
  "endurance" and Rev 14:12 bare "perseverance" as the saints' own calling —
  they join Heb 10:36 and Gal 6:9 as the texts a `do-not-lose-heart` lexicon
  extension should serve. The Hebrews block's prose flag is not edited (it is
  not a row Where column); this entry is the append.
- **`spiritual-warfare` → merged into the Daniel `spiritual-warfare` row**
  (Where column; refs Rev 12:7–12, 17; 13:7; 17:14). That row's rationale
  explicitly anticipated "Eph 6 and Rev 12 would join," and Revelation's
  war-in-heaven and war-on-the-saints texts are precisely its unseen-conflict
  register (not the Matthew deliverance-narrative register — the two rows'
  cross-reference stands). Lexicon finding recorded honestly for the curator,
  per the doc's own check-the-lexicon-first instruction: `resisting-the-devil`'s
  lexicon does carry the bare phrase "spiritual warfare" as an entry today, so
  the bare query itself already has a lexical landing on the response-side
  concept; the row's gap is the conflict-itself concept, and that lexicon fact
  should weigh in the one-concept-or-two decision.

Ref-appends executed as staged in the doc's Tag-gap candidates section, both
into the owning Genesis rows' Where columns: **`angels`** + Rev 5:11–12;
7:1–3, 11; 8:2–5; 10:1–6; 12:7–9; 14:6–20; 22:8–9 (Revelation is the Bible's
most angel-dense book; note for the row's eventual gist, carried here rather
than written into the row: 19:10 and 22:8–9 give Scripture's explicit
correction against worshiping angels — "Worship God"); **`vengeance`** + Rev
6:9–11; 18:20; 19:2 (note for the row's wording, carried here: these are the
God-ward register — God avenging his people's blood, the martyrs' cry heard
and answered — the answer to the human revenge the Genesis refs narrate,
alongside the row's Nah 1:2–3 vengeance-belongs-to-God refs).

Delivery-time survival audit of this thread's earlier contributions to this
file (rows `false-teachers`, `walking-in-truth`, `supporting-gospel-workers`,
`antichrist`, `confession-of-sin`, `contending-for-the-faith`, `favoritism`;
refs Jude 1:6, 9 on `angels`, 1 John 5:21 on `idolatry`, Jas 5:12 on
`oaths-and-vows`, Jas 4:11–12 on `judging-others`, Jas 2:6–7; 5:1–6 on
`justice-and-oppression`, Jas 1:27 on `care-for-widows`; the Hebrews
ref-append block with its five confirmed rows; the Hebrews delivery block's
merges into `priesthood`, `backsliding`, and `sojourners-and-strangers`): all
present at this delivery — nothing lost, nothing restored.

## Deuteronomy appends — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the Deuteronomy book
doc's Tag-gap candidates section (`deuteronomy.md`, this directory) under its
standing delivery rule: every candidate re-checked by THEME against a full read
of this file's live state immediately before this append (1,948 lines, through
the Hebrews and Revelation delivery blocks that landed after the doc's round-4
critic read). Delivery-time routing, all per §9's append-to-existing rule:
(1) the fifteen §(i) LIVE-row appends execute as written — every target
confirmed present under its claimed identity; (2) the six §(ii) formerly
EXODUS-proposed targets (`passover`, `hardness-of-heart`,
`grumbling-and-complaining`, `priesthood`, `the-name-of-god`,
`sacrifice-and-atonement`) are live Exodus rows and take the refs as the doc's
own annotations direct; (3) the three §(ii) LEVITICUS-proposed targets resolve
per the Leviticus delivery, exactly the contingency the doc's standing sentence
names: `clean-and-unclean` and `appointed-feasts` are live Leviticus rows (the
`appointed-feasts` conditional resolves append-side — the row was minted,
scoped against `passover`), and `occult-and-divination` is live as the
1 Samuel row, whose rationale itself names Deut 18:9–14 as completing its pack.
Both §(iii) NEW rows were re-verified genuinely new by theme at this append:
no heart-circumcision row exists anywhere in the live file (the Jeremiah
uncircumcised-heart refs, Jer 4:4; 9:26, ride the `hardness-of-heart` row as
adjacent imagery under a different theme, and no new-heart or
heart-transformation row exists), and no war-law row exists — the live Daniel
`spiritual-warfare` row (with its Revelation refs) is the unseen-conflict
register and the Matthew `deliverance-from-demons` (or `spiritual-warfare`)
row the exorcism register, both DIFFERENT themes from the war-law institution;
the lexical adjacency is flagged in the `warfare` row itself for the curator.
No dedupe skips were needed: no row anywhere in the live file carries
Deuteronomy refs in its Where column (the Ruth `kinsman-redeemer` "Deut 25:5–10
background", the 1 Samuel `occult-and-divination` "Deut 18:9–14", the Proverbs
`leadership` "after Deuteronomy 17", and the Jeremiah `bondservants-and-masters`
"Deut 15" citations are those rows' own rationale text, not appends). Checked,
no entry (recorded per the doc so no one hunts for a missing item): the live
`lament` row — no Deuteronomy chapter carries the complaint-to-God register
that row names; and the doc routes no refs to `confession-of-sin`. Rows marked
*(append to existing row)* add Deuteronomy's locations to the named row earlier
in this file — read them together with that row; the first two rows are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `circumcision-of-the-heart` | Deut 30:6; 10:16 | "Circumcise your heart," "circumcision of the heart meaning" are real queries anchored exactly here: the command (10:16, "Circumcise therefore the foreskin of your heart") and God's own promise to change the heart so Israel can love him and live (30:6). No vocabulary home — `repentance` names the human turning, not God's inward surgery; `new-creation` is the NT register and would be a read-back. Recurs at Jer 4:4 and in the NT (Rom 2:29); Jeremiah's thread routed its uncircumcised-heart refs (Jer 4:4; 9:26) to the `hardness-of-heart` row — adjacent imagery, different theme — so this row and that routing should be read together at curation. (Alternative framing: a broader `heart-transformation` id — decide before minting.) | Deuteronomy / 2026-08-23 |
| `warfare` | Deut 20:1–20; 21:10–14; 23:9–14; 24:5; 25:17–19 | "What does the Bible say about war," "rules of war in the Bible," "holy war in the Old Testament" are heavy lay queries with no home: `fear-not` and `gods-protection` catch only the courage texts, and nothing covers the war-law institution — exemptions, offered peace, siege limits, camp purity, the treatment of captives, and the devote-command against the land's nations. Deuteronomy 20 is Scripture's war-law locus; Joshua's thread will multiply refs. Gist wording must describe the text's own terms (including 20:16–18) without softening or endorsement, per the no-adjudication rule. Curator adjacency note (verified live at this append): the Daniel `spiritual-warfare` row (unseen-conflict register, with Revelation's war-in-heaven refs) and the Matthew `deliverance-from-demons` (or `spiritual-warfare`) row (exorcism register) are DIFFERENT themes from this war-law institution, but the ids would collide lexically if any lexicon claims bare "warfare" — keep the boundary explicit when minting any of the three. | Deuteronomy / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Deut 1:16–17 (impartial hearing for small and great, brother and foreigner); 10:17–19 (the God who takes no bribe and executes justice for the fatherless and widow); 15:1–11 (the release year and the open hand — "he cry to the LORD against you, and it be sin to you"); 16:18–20 (righteous judgment, no partiality, no bribes); 17:6 (two-or-three-witnesses due process); 23:15–16 (the escaped servant not returned, "You shall not oppress him"); 24:6, 10–15 (pledges limited, the poor man's garment back by sundown, wages paid before sunset); 24:17–22 (justice for foreigner and fatherless, gleanings as the poor's provision); 27:19 (the curse on withholding justice) | Register note for the row: Deuteronomy contributes the covenant-legislation register — provision-care and courtroom statute, the side the Ruth append's register note anticipates — complementing Micah's indictment register. This is the national-scale justice material kept out of pastoral-* tags under the pastoral-register ruling. | Deuteronomy / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Deut 4:15–28 (no form seen at Horeb, so no image; exile foreseen for carved images); 5:7–9 (the first two commandments repeated); 6:14–15; 7:5, 25–26 (altars smashed, images burned, the snare of their silver and gold); 12:2–3, 29–31 (destroy the places and the names; don't inquire after their gods); 13:1–18 (prophet, family enticer, and apostate city); 16:21–22 (no Asherah or sacred stone); 17:2–7 (the idolater purged); 27:15 (the curse on the secret image-maker); 29:17–18, 25–26 (the covenant abandoned for other gods); 31:16–20 (playing the prostitute after strange gods foretold); 32:16–17, 21 ("They sacrificed to demons, not God") | Deuteronomy is the Bible's densest anti-idolatry legislation — the command-law spine joining the row's Sinai (Exodus, Leviticus), narrative (Judges, 1 Samuel, Numbers, Daniel), prophetic (Hosea through Zephaniah, Isaiah, Jeremiah), and NT (1 John, Revelation) refs. | Deuteronomy / 2026-08-23 |
| `false-prophets` *(append to existing Micah row)* | Deut 13:1–11 (the prophet or dreamer of dreams whose sign comes to pass and who still says "Let's go after other gods," and the intimate enticer — the OT root of the do-not-listen command); 18:20–22 (the presumptuous-prophet test: "How shall we know the word which the LORD has not spoken?") | Deuteronomy supplies the prophet-test statute layer beneath the row's prophet-for-hire profiles and aftermath refs. Either/or flag for curation, carried from the doc: the live `false-teachers` row (2 John) is adjacent — the Micah row's own rationale absorbs "false teachers in the Bible" queries — so if the two rows are ever merged into one concept, these refs ride the merged row; do not append to both. | Deuteronomy / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | Deut 6:4–5; 10:12; 11:1, 13, 22; 13:3; 30:6, 16, 20 | Deuteronomy is this concept's source book — the row's rationale already names the absent Deut 6:5 greatest-commandment register. Note for the row's eventual pack: the Gospels' greatest-commandment texts quote Deut 6:5, and the row already carries the Matthew (22:34–40), Mark (12:29–33), Luke (10:25–28), and John appends. | Deuteronomy / 2026-08-23 |
| `remembrance-and-memorials` *(append to existing Joshua row)* | Deut 4:9–10; 5:15; 7:18; 8:2–5, 11–18; 11:2–7; 15:15; 16:3, 12 | Register note for the curator: the Joshua refs carry the memorial-practice register (stones that prompt a child's question, with 1 Samuel's Ebenezer); Deuteronomy's carry the remember-and-do-not-forget discipline that is this book's spine, including the "forgetting God in prosperity" warning (8:11–18) — widen the row's gist, or decide one-concept-or-two, before minting anything. BORDERLINE flag carried from the doc: the forgetting-in-prosperity side may be better served as a lexicon extension of an existing concept. | Deuteronomy / 2026-08-23 |
| `cities-of-refuge` *(append to existing Joshua row)* | Deut 4:41–43 (Bezer, Ramoth, and Golan set apart east of the Jordan); 19:1–13 (three cities plus three more, roads prepared, the ax-head case, the avenger of blood, and the no-shelter rule for the murderer) | Joins the row's Josh 20 narrative, Exod 21:13 root text, and Num 35 founding statute. The live row's warning against routing via `refuge-in-trouble` / `pastoral-refuge-and-justice`, and its lexicon-extension flag, stand. | Deuteronomy / 2026-08-23 |
| `inheritance` *(append to existing Joshua row)* | Deut 4:20–21, 38 ("a people of inheritance"; the land "for an inheritance"); 10:9 (Levi's inheritance is the LORD himself); 21:15–17 (the firstborn's double portion protected against favoritism — "the right of the firstborn is his") | Adds the covenant-theology register (Israel itself as God's inheritance; the LORD as Levi's) and the firstborn-portion statute to the row's distribution narratives (Joshua) and founding statutes (Numbers). | Deuteronomy / 2026-08-23 |
| `kinsman-redeemer` *(append to existing Ruth row)* | Deut 25:5–10 | The "duty of a husband's brother" (levirate) statute itself — the very "Deut 25:5–10 background" the row's design note already cites, joining its Lev 25 redemption statutes. Scope flag carried from the doc: if curation scopes the row to property/person redemption only, these refs become a separate `levirate-marriage` candidate instead — an either/or, NOT a double-mint. | Deuteronomy / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Deut 10:18–19 ("He... loves the foreigner... Therefore love the foreigner, for you were foreigners in the land of Egypt"); 14:29; 16:11, 14 (the foreigner in the tithe meal and the feasts); 23:7 ("You shall not abhor an Egyptian, because you lived as a foreigner in his land"); 24:14, 17–22 (equal wages, justice, and gleanings); 26:11–13; 27:19; 29:11 (foreigners inside the Moab covenant assembly); 31:12 (foreigners assembled to hear the law read) | The love-the-foreigner command texts in their fullest form, joining the row's living-as-a-foreigner narratives, one-law statutes (Exodus, Leviticus, Numbers), and exile refs. | Deuteronomy / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Deut 6:13 and 10:20 (swearing by the LORD's name as covenant loyalty); 12:6, 11, 17, 26 (vows carried to the chosen place and paid there); 23:21–23 ("When you vow a vow to the LORD your God, you shall not be slack to pay it"; refraining from vows is no sin) | Adds the covenant-loyalty swearing texts and the pay-what-you-vow teaching (the Eccl 5:4–6 parallel already on the row) to the row's narrative, statute, and NT refs. | Deuteronomy / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Deut 1:9–18 (captains and impartial judges — the Deuteronomy retelling of the Exodus 18 structure); 16:18–20 (judges and officers in every gate); 17:14–20 (the king under the law — Scripture's charter of limited, accountable rule); 31:1–8, 23 (succession announced and charged publicly); 34:9 (the successor equipped and received) | Deut 17:14–20 is the row's constitutional text (the Proverbs append's rationale already calls Proverbs the densest ruler manual "after Deuteronomy 17"); the succession texts complete the arc the row's Joshua and Numbers refs carry. | Deuteronomy / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Deut 32:35, 41–43 | "Vengeance is mine, and recompense" — vengeance as God's own prerogative, the verse later Scripture quotes against personal revenge; the row's both-registers note already covers this. | Deuteronomy / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | Deut 21:22–23 (same-day burial even for the executed, so the land is not defiled); 34:5–8 (Moses' death and burial, the unknown tomb, thirty days of national weeping) | The statute and the canon's most famous burial — buried by no known hand, "no man knows of his tomb to this day" — join the row's practice refs. | Deuteronomy / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | Deut 30:1–10 | The Torah's own national-restoration promise: regathering "from all the peoples where the LORD your God has scattered you," return to the land, hearts circumcised. (The personal `restoration` vocabulary id is the renewal-prayer register and was withheld from ch 30 in the book doc — consistent with the register TENSION the Isaiah block records beside this row.) | Deuteronomy / 2026-08-23 |
| `adoption-as-gods-children` *(append to existing Romans row)* | Deut 14:1 ("You are the children of the LORD your God"); 8:5 (disciplined "as a man disciplines his son"); 1:31 (carried "as a man carries his son") | NOTE for the reviewer, carried from the doc: these are OT Israel-as-God's-children texts, not the Pauline adoption metaphor — if the row is minted Romans-narrow, these refs instead argue for the broader children-of-God treatment that row already flags as an alternative. | Deuteronomy / 2026-08-23 |
| `passover` *(append to existing Exodus row)* | Deut 16:1–8 | The Passover re-legislated for the land — one chosen place, evening sacrifice "at the season that you came out of Egypt," the bread of affliction — joining the row's institution (Exod 12–13), calendar (Lev 23:4–8), and second-Passover (Num 9) refs. | Deuteronomy / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Deut 2:30 (Sihon's spirit hardened "that he might deliver him into your hand"); 15:7 ("you shall not harden your heart... from your poor brother" — the self-chosen hardening); 29:4 ("the LORD has not given you a heart to know"); 29:19 (the stubbornness of heart that blesses itself) | The row's describe-don't-adjudicate note covers the both-directions tension, which Deuteronomy carries in one book: a king hardened toward judgment, and hearts commanded not to harden themselves. | Deuteronomy / 2026-08-23 |
| `grumbling-and-complaining` *(append to existing Exodus row)* | Deut 1:27 ("You murmured in your tents, and said, 'Because the LORD hated us...'") | The Kadesh murmuring retold in the farewell address — the motif's retrospective witness alongside the row's Exodus and Numbers narratives. | Deuteronomy / 2026-08-23 |
| `priesthood` *(append to existing Exodus row)* | Deut 10:8–9 (Levi set apart to bear the ark and bless in his name); 17:9–12 (the Levitical priests in the high court); 18:1–8 ("The LORD is their inheritance" — the landless tribe supported by the people); 33:8–11 (Levi's blessing: Thummim and Urim, teaching Jacob the ordinances) | Adds the covenant-charter register — the tribe's calling, support, court role, and blessing — to the row's establishment (Exodus), working-life (Leviticus), contested-and-confirmed (Numbers), and Christ-our-high-priest (Hebrews) refs. | Deuteronomy / 2026-08-23 |
| `the-name-of-god` *(append to existing Exodus row)* | Deut 5:11 (the misuse command repeated); 6:13 and 10:20 (swearing by his name); 12:5, 11 (the place where the LORD puts his name); 28:58 ("that you may fear this glorious and fearful name, THE LORD your God"); 32:3 ("For I will proclaim the LORD's name") | Adds the name-theology of the chosen place — where the LORD "puts his name" — and the fear-the-name texts to the row's revelation-of-the-name and honor-of-the-name refs. | Deuteronomy / 2026-08-23 |
| `sacrifice-and-atonement` *(append to existing Exodus row)* | Deut 21:1–9 (the broken-neck heifer rite for unsolved murder: "The blood shall be forgiven them"); 32:43 (God "will make atonement for his land and for his people") | Adds the atonement-outside-the-sanctuary edge cases — community atonement for an unsolved killing, and God himself atoning for land and people — to the row's ritual base. | Deuteronomy / 2026-08-23 |
| `appointed-feasts` *(append to existing Leviticus row)* | Deut 16:1–17 | The pilgrim-feast calendar (Passover/Unleavened Bread, Weeks, Booths) with its three-times-a-year appearance rule — lands on the calendar-as-a-system row per its Passover/feasts scoping; the doc's if-folded-into-`passover` contingency resolved append-side when the row was minted with that explicit scoping. | Deuteronomy / 2026-08-23 |
| `clean-and-unclean` *(append to existing Leviticus row)* | Deut 14:3–21 | The food law restated for the land, with the clean/unclean lists and "you are a holy people" rationale — the covenant-restatement layer over the row's Leviticus category system and Numbers death-uncleanness refs. | Deuteronomy / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Deut 18:9–14 | The Bible's fullest occult ban list (child sacrifice through the fire, divination, fortune-telling, enchanter, sorcerer, charmer, familiar spirits, wizard, necromancer), with the verdict "whoever does these things is an abomination to the LORD" — the very ref the row's rationale says would complete a pack, and the passage plain "witchcraft / psychics / mediums" queries most need. | Deuteronomy / 2026-08-23 |

Also noted, not logged (near-covered; recorded so later threads don't re-log):
the septennial public reading of the law (Deut 31:10–13) — plain "public reading
of Scripture" queries plausibly route to `studying-the-word` (tagged on ch 31);
check a lexicon extension of `studying-the-word` before minting anything.

## Ezekiel appends + new rows — 2026-08-23 (Isaiah–Daniel thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. This is the FINAL block from the
Isaiah–Daniel thread — with it the thread's group (Isaiah, Jeremiah,
Lamentations, Daniel, Ezekiel) is complete. Sourced from the Ezekiel staged gap
file (`tag-gaps-proposed.md`, book-thread scratchpad; anchored to its critic
Round 2 live-file re-read at 2026-08-23T06:51:38Z, with Round 3's shepherd
conversion applied) and delivered with the approved Ezekiel book doc
(`ezekiel.md`, this directory) after its critic loop closed at Round 4 with zero
objections. Provenance carried from that doc: 65 Ezekiel verses are
independently fixture-witnessed in `pipeline/fixtures/web-subset.json`,
byte-identical to the pinned extract; every other ref and quoted fragment below
rests on the sha-verified database extraction chain (release descriptor sha256 →
`content.db` → the `pipeline/manifests/web.json` pin), which passed exactly.
Routing resolved per the staged file's binding append-time rule against a full
re-read of this file immediately before this append — first with the Hebrews
delivery block newest present, then re-run twice against blocks that landed
concurrently between reads and this write: a Revelation delivery block, then a
Deuteronomy appends block (RACE RECORD: the pre-append cmp-guard caught both
concurrent writes; this block was re-deduped in full against the changed file
each time and appended fresh, with nothing above this line edited). None of the
three changes any routing below: the Hebrews delivery mints no new row and its
ref-merges land Hebrews refs on the Exodus `priesthood`, Judges `backsliding`,
and Genesis `sojourners-and-strangers` rows (the priesthood register note is
carried in-row below); the Revelation delivery mints no new row either, and its
six ref-merges add Revelation refs to the Where columns of the Genesis
`vengeance` and `angels`, Micah `idolatry`, 2 John `false-teachers`, 1 John
`antichrist`, and Daniel-block `spiritual-warfare` rows — three of those
(`vengeance`, `angels`, `idolatry`) are owner rows below and take Ezekiel's
refs as compatible ref-appends alongside Revelation's; and the Deuteronomy
block mints two new rows (`circumcision-of-the-heart`, `warfare`) that are
different themes from the eight below — the heart-circumcision adjacency to
`new-heart` is cross-noted in-row — while its appends share eleven owner rows
below (`vengeance`, `sojourners-and-strangers`, `oaths-and-vows`,
`justice-and-oppression`, `idolatry`, `false-prophets`,
`restoration-of-israel`, `hardness-of-heart`, `priesthood`,
`sacrifice-and-atonement`, `occult-and-divination`) as compatible ref-appends,
and its `the-name-of-god` append leaves the `gods-holy-name` cross-note below
unchanged. No block carries any Ezekiel refs. Delivery-time routing of the staging's
four formerly-sibling-proposal appends, per §9's append-to-existing rule:
`resurrection-of-the-dead` and `power-of-gods-word` are now LIVE Isaiah-minted
rows and take the Ezekiel refs as staged; `messianic-promise` never landed as
its own row (the Isaiah delivery folded it into the live Zechariah
`messianic-prophecy` row), so its Ezekiel refs route to that then-current home,
exactly as Jeremiah's and Daniel's did; and `divination-and-the-occult` likewise
folded into the live 1 Samuel `occult-and-divination` row, so its refs route
there. All 22 staged live-row append owners were confirmed present under their
stated owner rows (the two appender's-judgment items, `knowing-god` and
`angels`, are executed with their caveats carried in-row). The 8 NEW rows below
were re-verified genuinely new by theme at this append — including against this
thread's own Daniel block (`spiritual-warfare`, `end-times`) and the whole live
file: no glory-of-God, new-heart, watchman, individual-responsibility,
holy-name, trusting-in-man, living-water, or shame row exists anywhere in this
file by theme; the 1 Corinthians `living-for-gods-glory` row is the distinct
do-everything-for-God's-glory discipleship register, not Ezekiel's
manifest-glory register, and the live Exodus `the-name-of-god` row is the
adjacent revelation-and-honor register (cross-note carried in-row) — and none of
the 8 ids is in the 131-id vocabulary. The live file carries no Ezekiel refs in
any row's Where column (the Isaiah `resurrection-of-the-dead` row's Ezek 37 and
the Zechariah `shepherds-and-the-flock` row's Ezek 34 citations, and the
Lamentations block's "Micah, Jeremiah, Ezekiel refs" line on `false-prophets`,
are those rows' own rationale text anticipating these decisions, not appends).
Rows marked *(append to existing row)* add Ezekiel's locations to the named row
earlier in this file — read them together with that row; the first eight rows
are new gaps.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `glory-of-god` | Ezek 1:28; 3:12, 23; 8:4; 9:3; 10:4, 18–19; 11:22–23; 43:1–5; 44:4 | "The glory of God" / "God's glory" is a heavy lay and devotional query with no concept home. In Ezekiel it is the load-bearing term: "the appearance of the likeness of the LORD's glory" (1:28), the glory's staged departure from the temple (chs 8–11) — the tragic center of the book's first movement — and its return (43:1–5). `presence-of-god` is the nearest id but names presence generally, not the glory queries lay users type — check a lexicon extension of `presence-of-god` before minting, and weigh the overlap with the live `the-house-of-god` (Haggai) row that Ezekiel's dwelling-place refs append to (this row is the glory itself; that row is the dwelling; one concept might serve both). The live 1 Corinthians `living-for-gods-glory` row is the distinct discipleship register (doing everything for God's glory), not this manifest-glory register. Exod 33–34; 40:34; Isa 6:3; John 1:14; 2 Cor 3–4 would join. | Ezekiel / 2026-08-23 |
| `new-heart` (or `a-new-heart`; or lexicon extension of `new-creation` / `restoration`) | Ezek 11:19–20; 18:31; 36:25–27 | "New heart" / "God change my heart" / "heart of stone to heart of flesh" / "born again in the Old Testament" are live devotional queries with no honest landing: `new-creation` is the 2 Cor 5:17 in-Christ register (a read-back on OT anchors) and `restoration` is broader renewal. Ezekiel carries the theme promised (11:19–20), commanded (18:31), and given with God's own Spirit (36:26–27); Jer 31:33's law-written-on-hearts new covenant (with Jer 24:7; 32:39; Ps 51:10) is the companion text — the Jeremiah thread holds it as a motif only, and no new-covenant/new-heart row exists in this file at this append, so this row is the theme's one gap-log entry. Reads together with the live Exodus `hardness-of-heart` row (11:19's stony-heart-removed promise is that row's own answer text), and cross-references the Deuteronomy `circumcision-of-the-heart` row that landed at this same append window (Deut 30:6 — the adjacent covenant heart-surgery register; decide one concept or two before minting). Check the lexicon-extension routes before minting. Proposed independently by two Ezekiel ranges; merged. | Ezekiel / 2026-08-23 |
| `watchman-and-warning` (or `warning-the-wicked`) | Ezek 3:16–21; 33:1–9 | "Watchman in the Bible" / "responsibility to warn others" / "blood on your hands" — the watchman's blood-accountability charge ("I have made you a watchman... I will require his blood at your hand," 3:17–18), stated twice at length in Ezekiel, has no concept home. `sharing-your-faith` names NT evangelism, not the accountability-for-warning substance — check a lexicon extension of it first. Isaiah's notes already hold watchman texts (Isa 21:6–12; 62:6–7) as a motif pending recurrence, which Ezekiel now supplies; Acts 20:26–27 would join. Proposed independently by two Ezekiel ranges; merged. | Ezekiel / 2026-08-23 |
| `individual-responsibility` (or `generational-sin`) | Ezek 18:1–32 (esp. 18:2–4, 20, 30); 14:12–20; 33:10–20 | "Am I punished for my parents' sins," "generational curses," "generational sin," "personal responsibility before God" are heavy lay queries with no concept to land on. Ezek 18 is Scripture's charter text — the sour-grapes proverb revoked, "The soul who sins, he shall die," "The son shall not bear the iniquity of the father" (18:20) — restated in 33:10–20, and 14:12–20 (Noah, Daniel, and Job "would deliver only their own souls") makes the same point narratively. `sin` covers sin's wages, not the each-soul-answers-for-itself teaching; nothing else comes close. | Ezekiel / 2026-08-23 |
| `gods-holy-name` (or `for-his-names-sake`) | Ezek 36:20–23, 32; 39:7, 25; 20:9, 14, 22, 44 | "Hallowed be your name" / "for his name's sake" / "God acts for his glory" queries. God acting not for Israel's sake but for his profaned holy name (36:22) is the stated engine of Ezekiel's restoration, and the same logic restrains wrath three times in the ch 20 history ("I worked for my name's sake"); nothing in the vocabulary covers the honoring, profaning, or sanctifying of God's name. Pss 23:3; 79:9 and the Lord's Prayer will add refs. Overlaps the live `the-name-of-god` (Exodus) row — revelation/honor of the name vs. God acting for his name's sake; cross-reference the two rows and decide one concept or two before minting. | Ezekiel / 2026-08-23 |
| `trusting-in-man` (or `misplaced-trust`) | Ezek 29:6–7 ("they have been a staff of reed to the house of Israel. When they took hold of you by your hand, you broke"); 29:16 | "Trusting in man instead of God" / "leaning on people not God" is a heavy lay query the vocabulary can only answer from the positive side (`trust-in-god`); the failure side — broken-reed alliances, false confidence — has no concept. Ezek 29 names Egypt a breaking staff of reed and ends Egypt's role as "the confidence of the house of Israel" (29:16); Jer 17:5 ("Cursed is the man who trusts in man"), Ps 146:3, and Isa 31:1; 36:6 would join. The Isaiah and Jeremiah threads both hit this theme and routed around it without logging, so the gap is recurring — and still open in this file at this append. | Ezekiel / 2026-08-23 |
| `living-water` (or `river-of-life`) | Ezek 47:1–12 | "Living water" / "river of life" is a heavy, Bible-wide lay query (Jer 2:13; Zech 14:8; John 4:10–14; 7:37–39; Rev 22:1–2) with no concept home — `restoration` is the nearest but names renewal generally, not the water-of-life picture a user actually types. Ezek 47's deepening river that heals the sea and feeds trees whose "leaf for healing" never withers is the OT anchor text. (Checked at this append: Jer 2:13 rides the Micah `idolatry` row's broken-cisterns refs and John 7:37–39 rides the Luke `holy-spirit` row — both as supporting refs for other themes; no row owns the living-water query family itself.) | Ezekiel / 2026-08-23 |
| `shame` | Ezek 43:10–11 ("that they may be ashamed of their iniquities"); 16:61–63; 36:31–32 | "Shame in the Bible," "overcoming shame" is a heavy pastoral query with no concept home — the vocabulary covers guilt's remedy (`forgiveness-of-sins`) and rising after a fall (`pastoral-relapse-and-restoration`) but not shame itself, which Ezekiel treats as a God-given step toward repentance (Jerusalem silenced by shame when God forgives, 16:61–63; the exiles loathing their old ways, 36:31–32). | Ezekiel / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Ezek 25:12–17; 35:5, 10–11 | Edom judged "Because Edom has dealt against the house of Judah by taking vengeance" (25:12), the Philistines for revenge "with perpetual hostility" (25:15), Mount Seir for handing Israel to the sword "in the time of their calamity" (35:5), while God claims vengeance as his own: "I will lay my vengeance on Edom" (25:14). | Ezekiel / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Ezek 26:20; 28:8; 31:14–18; 32:17–32 | The descent to the pit and the great Sheol roll call where every once-terrifying nation lies "uncircumcised, slain by the sword" (32:25); death as the leveler of nations. Sheol / the pit deliberately routes here and NOT to `hell` (a read-back). | Ezekiel / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Ezek 1:1 ("among the captives by the river Chebar"); 11:16–17 (God "a sanctuary for a little while" to the scattered); 12:3–11 (exile packed and acted out); 47:22–23 (resident aliens inherit among the tribes "as the native-born") | The exile register the Lamentations, Jeremiah, and Daniel appends established on this row — a prophet's whole ministry conducted among the captives — plus the 47:22–23 reversal: the sojourner written into the inheritance itself. | Ezekiel / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Ezek 17:13–19 | The vassal oath God treats as his own: "my oath that he has despised and my covenant that he has broken" (17:19) — joining the row's kept-costly and broken-covenant refs. | Ezekiel / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row — the live id; the staged `-of-the-poor` variant was merged away)* | Ezek 16:49 (Sodom "didn't strengthen the hand of the poor and needy"); 18:7–8, 12–17 (justice to the poor as the mark of the righteous man); 22:7, 12, 29 ("troubled the poor and needy"; oppressed foreigner, wronged fatherless and widow); 34:2–4, 16–22, 27 (shepherds ruling "with force and with rigor"; God feeding the flock "in justice," judging between fat and lean sheep, breaking the enslavers' yoke) | Ezekiel's justice indictments join the row's Ruth, Nahum, Amos, Job, Jeremiah, and Ecclesiastes material. Note: the chapters 1–12 range deliberately contributes no refs — its candidate anchors (7:23; 8:17; 9:9; 11:6–7) indict bloodshed and violence generally, not oppression of the poor specifically. | Ezekiel / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Ezek 6:1–14; 8:5–18 (the image of jealousy, the elders' rooms of imagery, weeping for Tammuz, sun-worship in the inner court); 14:3–7 (idols taken "into their heart"); 16:15–21; 20:7–8, 16, 24, 30–32, 39; 22:3–4; 23:7, 30, 37, 49; 30:13; 33:25; 36:18, 25; 37:23 | Ezekiel adds the temple-profaned register (the ch 8 tour) and the idols-in-the-heart diagnosis (14:3) to the row. The Hosea, Joshua, Habakkuk, Numbers, Isaiah, Jeremiah, 1 Samuel, and Daniel refs already land on this one Micah row; Ezekiel's join them — never a second row. | Ezekiel / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | Ezek 6:8–10 ("Yet I will leave a remnant"); 9:4–6 (the marked spared in the slaughter); 11:13; 12:16; 14:22–23 | The remnant left through the sword, the marked foreheads of ch 9, and the survivors whose escape vindicates God's dealings (14:22–23) join the row's refs. | Ezekiel / 2026-08-23 |
| `false-prophets` *(append to existing Micah row)* | Ezek 13:1–23 (the whole chapter: "foolish prophets, who follow their own spirit, and have seen nothing"; the whitewashed wall; prophetesses hunting souls for barley and bread); 12:24; 14:9–10; 21:29; 22:25, 28 | The refs the row's Lamentations append already anticipated ("Micah, Jeremiah, Ezekiel refs"); Ezekiel supplies the whitewashed-wall image and the only extended oracle against prophetesses. | Ezekiel / 2026-08-23 |
| `day-of-the-lord` *(append to existing Obadiah row)* | Ezek 7:7, 10, 12, 19 ("the day of the LORD's wrath"); 30:2–3 ("the day is near, even the LORD's day is near. It will be a day of clouds, a time of the nations") | Extends the row's phrase witness through Ezekiel's doom oracle (ch 7) and the Egypt oracle. (Daniel's "time of the end" refs are logged under the live `end-times` row above, which carries the explicit merge note — reconcile there, not here.) | Ezekiel / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | Ezek 28:25–26 (gathered from the peoples, dwelling securely in their own land); 34:11–31 (the flock sought and delivered "out of all places where they have been scattered," fed on the mountains of Israel); 36:24–38 (brought home and cleansed, the desolate land become "like the garden of Eden"); 37:1–28 (the dry bones — "these bones are the whole house of Israel" — raised, brought home, one nation under one shepherd); 39:25–29 ("Now I will reverse the captivity of Jacob and have mercy on the whole house of Israel") | Ezekiel 33–48 is the theme's largest OT block; the row's national-restoration rationale (distinct from the personal `restoration` register) fits these chapters exactly. | Ezekiel / 2026-08-23 |
| `gloating-over-downfall` *(append to existing Obadiah row)* | Ezek 25:3, 6 (Ammon's "Aha!" against the profaned sanctuary — clapping, stamping, rejoicing "with all the contempt of your soul"); 26:2 (Tyre's "Aha!" over broken Jerusalem); optionally also 35:15 (Mount Seir judged "As you rejoiced over the inheritance of the house of Israel because it was desolate") and 36:5 (the nations who seized the land "with the joy of all their heart") | The Ezekiel drafters staged this as a new `gloating-over-anothers-fall` row; the live Obadiah row logged the same gap first (its rationale already cites Obad 1:12 and Prov 24:17), so it folds there — Ezekiel supplies the sin actively judged in the Ammon, Tyre, and Edom oracles. | Ezekiel / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Ezek 19:1–14 (a complete commanded dirge: "This is a lamentation, and shall be for a lamentation"); also the commanded laments over Tyre and Egypt (26:17–18; 27:1–36; 28:12–19; 32:1–16) | Ezekiel adds the commanded-dirge register — laments God orders raised, over Israel's princes and over the nations — to the row's practice and protest refs. | Ezekiel / 2026-08-23 |
| `outpouring-of-the-spirit` *(append to existing Joel row)* | Ezek 36:26–27; 37:14; 39:29 ("I have poured out my Spirit on the house of Israel") | God's own Spirit put within as the engine of the new obedience (36:27), the breath of the raised bones (37:14), and the seal of the reversed captivity (39:29) — the OT promise-side refs the row's Joel anchor anticipates. | Ezekiel / 2026-08-23 |
| `knowing-god` *(append to existing Hosea row — with the staged register caveat)* | Ezek 6:7; 12:15–16; 20:38–44; 25:5–17; 36:23; 38:23; 39:6–7, 22, 28 (representative; the refrain "they will know that I am the LORD" saturates the book, 60+ occurrences) | Appended per the staging's appender's-judgment option, caveat carried: Ezekiel's recognition refrain is acknowledgment forced by God's acts — a different register from this row's relational, devotional knowing (Hos 6:3, 6; Jer 9:23–24) — and the Ezekiel book doc records the refrain as a motif; any pack drawing on these refs must weigh that register split first. | Ezekiel / 2026-08-23 |
| `spiritual-adultery` *(append to existing Hosea row)* | Ezek 16:15–34 (the foundling bride turned faithless — "Adulterous wife, who takes strangers instead of her husband!" (16:32)); 23:1–49 (Oholah and Oholibah — "They have committed adultery with their idols" (23:37)); also 6:9 ("their lewd heart, which has departed from me") | Ezekiel 16 and 23 are, with Hosea 1–3, Scripture's most extended spiritual-adultery allegories; the same relationship-register rationale as the row. | Ezekiel / 2026-08-23 |
| `empty-worship` (or `religious-hypocrisy`) *(append to existing Amos row)* | Ezek 33:30–32 ("with their mouth they show much love, but their heart goes after their gain"; hearers to whom the prophet is "a very lovely song") | Originally staged against the sibling `hypocrisy` proposal; the live file's shared hypocrisy home is the Amos row (the Matthew, Galatians, Isaiah, Mark, and Luke threads have already folded their hypocrisy refs there), so Ezekiel's hearing-without-doing refs fold there too. | Ezekiel / 2026-08-23 |
| `the-house-of-god` *(append to existing Haggai row)* | Ezek 40:1–42:20 (the measured house); 43:4–7 ("this is the place of my throne... where I will dwell among the children of Israel forever"); 48:8, 35 ("The LORD is there") | The Ezekiel drafters staged this as a new `gods-dwelling-place` (or `the-temple`) row; the live Haggai row logged the same house/dwelling-of-God gap first ("the temple in the Bible"; tabernacle → temple → latter glory), so Ezekiel's refs fold there. Carried over from the staged row: weigh the overlap with the `glory-of-god` proposal above (glory vs. dwelling may be one concept or two), alongside the `presence-of-god` lexicon-extension check the Haggai row already flags. | Ezekiel / 2026-08-23 |
| `angels` *(append to existing Genesis row — executed on the staging's condition, judgment recorded)* | Ezek 1:4–25; 10:1–22 (cherubim, the living creatures bearing the throne — four faces, four wings, "their appearance was like burning coals of fire," the wheels full of eyes) | The staging made this conditional on throne-creatures fitting a row built for angelic messengers; executed because the row is the vocabulary's one broad "angels in the Bible" home ("heavily searched topic"; Daniel's watcher and named archangels already widened it past messengers) and lay queries about what angels look like — including the "biblically accurate angels" query family — land exactly on Ezek 1 and 10. Register note: these are throne-bearing cherubim, not messengers; if a future angel concept splits registers, these refs go with the throne/cherubim side (the book doc also holds them under its wheels/cherubim motif). | Ezekiel / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Ezek 2:4 ("impudent and stiff-hearted"); 3:7–9 ("obstinate and hard-hearted"; the prophet's forehead hardened to match); 11:19 ("I will take the stony heart out of their flesh"); 12:2 ("eyes to see, and don't see") | Retargeted at the book's critic Round 2: originally staged against the Jeremiah thread's proposal, but the live Exodus block minted the row, so Ezekiel's refs route there — Ezekiel adds the exile-side diagnosis to the row's Pharaoh material, and 11:19's stony-heart-removed promise is the row's own answer text (see also the `new-heart` row above; the two read together). | Ezekiel / 2026-08-23 |
| `sacrifice-and-atonement` *(append to existing Exodus row; the Leviticus refs already merged)* | Ezek 43:18–27 (the altar-consecration ordinance — sin offerings and "Seven days shall they make atonement for the altar"); 45:15–20 (the regular offerings and the prince's part "to make atonement for the house of Israel"; atonement made for the house itself) | Converted at the book's critic Round 2 from the staging's checked-and-already-covered atonement line: that line had routed atonement queries to `the-cross`, but this row's rationale records the opposite — `the-cross` is the NT atonement concept and the conventions bar reading it back onto OT ritual — and Ezekiel's temple-vision atonement provisions are exactly this row's material, so the refs append rather than dispute. | Ezekiel / 2026-08-23 |
| `priesthood` *(append to existing Exodus row; the Leviticus refs and, at the Hebrews delivery, Christ's high-priestly refs already merged)* | Ezek 44:10–31 (Levites demoted for idolatry; the sons of Zadok who "shall come near to me to minister to me"; the priests' rules of dress, marriage, and teaching the difference between holy and common); 40:45–46; 42:13–14; 48:11 | Converted at the book's critic Round 2: the staged Ezekiel `priesthood` new row exact-id-collided with the live Exodus row, so Ezekiel contributes refs. Register note carried from the staging: Ezekiel adds the temple-vision regulation register (a priesthood judged, restructured, and re-charged) between the row's establishment/ordination texts and its now-merged Hebrews high-priest material. | Ezekiel / 2026-08-23 |
| `shepherds-and-the-flock` *(append to existing Zechariah row)* | Ezek 34:11–16 ("I myself will be the shepherd of my sheep" (34:15), seeking the lost and binding up the broken (34:16)); 34:23–24 ("my servant David" as the one shepherd); 34:31 | Converted at the book's critic Round 3 from the staged `god-our-shepherd` new row: the live Zechariah row already names the "God as shepherd" query family, states that no shepherd concept exists in the 131, and cites Ezek 34 among the cross-book core a pack would carry — under CONVENTIONS §9 an existing-theme row gets a ref-append, not a new row. Register note carried from the staging: Ezekiel supplies the God-as-shepherd/one-shepherd side the row's rationale already anticipates (the row's own Zechariah refs are the bad-shepherds/civic register; John's good-shepherd refs have meanwhile landed via the John block), and any eventual pack wording should serve "the Lord is my shepherd" devotional queries (Ps 23 will add refs). The Davidic shepherd-king refs (34:23–24) also belong to the messianic query family and route to the live Zechariah `messianic-prophecy` row via the messianic append below. | Ezekiel / 2026-08-23 |
| `messianic-prophecy` *(append to existing Zechariah row; Isaiah, Jeremiah, and Daniel refs already merged)* | Ezek 17:22–24 (the tender twig God plants that becomes the sheltering cedar); 21:26–27 ("until he comes whose right it is; and I will give it"); 34:23–24; 37:24–25 ("my servant David" as the one shepherd-prince) | Staged as refs for Isaiah's proposed `messianic-promise` row — same gap, same query family — and that proposal folded into this row at the Isaiah delivery, so the refs follow to the then-current home per the staging's fallback rule, exactly as Jeremiah's and Daniel's did. All four passages are carried in the Ezekiel book doc on the text's own terms — adjudicating nothing, per the row's locator design. | Ezekiel / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | Ezek 13:6–9, 17–23 ("lying divination"; magic bands and veils, souls hunted); 21:21–23 (Babylon's king shaking arrows, consulting teraphim, reading a liver — described, not taught); 22:28 | Staged as refs for Isaiah's proposed `divination-and-the-occult` row and routed here when that proposal folded into this row, exactly as Daniel's court-diviner refs were. Ezekiel adds the false-prophecy-as-divination register (ch 13) and Scripture's most detailed description of pagan divination practice (21:21), reported without instruction. | Ezekiel / 2026-08-23 |
| `resurrection-of-the-dead` *(append to existing Isaiah row)* | Ezek 37:1–14 | The very ref the row's rationale already anticipated ("Dan 12:2 and Ezek 37 will need the same decision"; Daniel's refs are merged above) — with the staged note carried: the text's own interpretation is national restoration ("these bones are the whole house of Israel," 37:11), but "dry bones" / "can these bones live" queries will look here, so the ref belongs on the row. | Ezekiel / 2026-08-23 |
| `power-of-gods-word` *(append to existing Isaiah row)* | Ezek 12:25, 28 ("I will speak, and the word that I speak will be performed. It will be no more deferred") | The no-more-deferred declaration joins the row's does-not-return-void anchor texts and Jeremiah's word-in-action narratives: the word's performance guaranteed by the speaker himself. | Ezekiel / 2026-08-23 |

Checked and already covered (recorded so later threads don't re-log): pride
(Ezek 28:2, 5, 17; 30:6, 18; 31:10; 32:12) → `humble-exaltation` (PR #41
lexicon extension; Ezekiel 25–32 is dense confirmation of the route working);
intercession / "stand in the gap before me" (22:30) → `prayer`, per the Genesis
thread's ruling — "standing in the gap" is a heavy query phrase, flagged as a
lexicon-extension candidate for `prayer` (or `praying-for-leaders`) with 22:30
as anchor; God desires none to perish (18:23, 32; 33:11) → lexicon-extension
candidate for `repentance`, not a gap; firstfruits (44:30; 48:14) → `tithing`
("Tithing and firstfruits"); famine/scarcity (4:9–17; 5:16) → `gods-provision`
(PR #41 lexicon extension); Sheol / the pit (26:20; 31:15–18; 32:17–32) →
deliberately NOT `hell` (a read-back), routed via the `mortality` append above.
The former checked-and-covered atonement line was converted at the book's
critic Round 2 into the `sacrifice-and-atonement` append above; its read-back
half stands: OT sacrifice is never tagged `the-cross`. Checked and deliberately
NOT appended: the live Job-thread `satan` row — appending Ezek 28:12–19 (the
king of Tyre in Eden) there would adjudicate the Satan identification the text
itself doesn't make; the passage is held in the book doc as a signposted
historic reading and a motif with a CAUTION, and any future routing needs
concept-curation judgment first.

## 1 Kings appends + new rows — 2026-08-23

Appended at 1 Kings finalize (round-4 critic approval), re-deduped against this
file's live state immediately before this append; nothing above this line was
edited. Two NEW rows (`wholehearted-devotion`, `covetousness`) — re-checked at
write time: neither id, nor any coveting/greed/divided-heart row, exists
anywhere in this file, and neither is in the 131-id vocabulary. All other rows
are appends to landed rows. Two dispositions changed from the book doc's
drafted snapshot at this re-read: the `deliverance` row was landed by 1 Samuel
(the snapshot drafted it as a Judges-draft row), and the 2 Samuel thread's
`davidic-covenant` and `counsel-and-advisers` rows landed after drafting, so
1 Kings' dynastic-promise and Rehoboam-counsel refs join them as appends
(finalize-time discoveries, not in the drafted plan).

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `wholehearted-devotion` | 1 Kgs 8:61 ("Let your heart therefore be perfect with the LORD our God"); 11:4; 15:3, 14; 18:21 ("How long will you waver between the two sides?") | "Wholehearted devotion," "divided heart," "halting between two opinions," "half-hearted faith" are real query families with no target: `surrender-to-god` is the yielding register, `hunger-for-god` the longing register — neither carries the whole-heart/divided-heart vocabulary 1 Kings uses as its actual measuring rod for kings ("his heart was not perfect with the LORD his God"). Elijah's Carmel question is the classic call text. | 1 Kings / 2026-08-23 |
| `covetousness` | 1 Kgs 21:1–16 | "Coveting," "covetousness in the Bible," "wanting what others have" have no vocabulary home: `contentment` teaches the remedy and deliberately routes wealth-seeking queries, `envy-and-jealousy` covers resenting the person; neither serves the "what does the Bible say about coveting" searcher. Naboth's vineyard is the Old Testament's defining narrative of coveting ripening into theft and murder. Could be a lexicon extension of `contentment` instead — flagged for curation judgment rather than firmly proposed. | 1 Kings / 2026-08-23 |
| `davidic-covenant` *(append to existing 2 Samuel row)* | 1 Kgs 2:4 (the promise quoted in David's charge); 8:24–26 (Solomon prays it back: "who has kept with your servant David my father that which you promised him"); 9:4–5; 11:12–13, 36 ("that David my servant may have a lamp always before me in Jerusalem"); 15:4 | 1 Kings is the promise under stress: quoted at the succession, prayed at the dedication, restated with its condition to Solomon, and then measured out inside the judgment — one tribe, a lamp in Jerusalem, "for David my servant's sake." | 1 Kings / 2026-08-23 |
| `counsel-and-advisers` *(append to existing 2 Samuel row)* | 1 Kgs 12:6–15 (the old men's counsel taken and abandoned for the young men's — "he abandoned the counsel of the old men"); 12:28 (Jeroboam "took counsel" — and made the calves) | The Bible's defining bad-counsel narrative: a kingdom torn in two over whose advice a leader takes. Joins the row's Ahithophel/Hushai refs as the theme's other great case study. | 1 Kings / 2026-08-23 |
| `false-prophets` *(append to existing Micah row)* | 1 Kgs 13:18 (a lie told in the LORD's name — "He lied to him"); 18:19–29 (Baal's four hundred fifty prophets at Carmel); 22:5–28 (the four hundred in unison vs. Micaiah, and the lying spirit explained truthfully to Ahab) | Three distinct registers in one book: a genuine prophet lying, rival-god prophets, and court prophets saying what the king wants — the ch 22 scene is the classic "how do I know a true prophet" text. | 1 Kings / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | 1 Kgs 19:18 ("Yet I reserved seven thousand in Israel, all the knees of which have not bowed to Baal") | The remnant theme's most-quoted OT narrative anchor (Paul's own proof text in Rom 11:4), spoken as God's correction of "I, even I only, am left." | 1 Kings / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | 1 Kgs 21:1–16 (state power fabricating testimony to kill a citizen and seize his inheritance); 12:4 (the heavy yoke) | Naboth's vineyard is the theme's defining narrative: a legal process — fast, elders, two witnesses — operated as a weapon, answered by the LORD's word at the vineyard gate (21:17–24). Routed here, not to a pastoral-* id, per the project-wide register ruling. | 1 Kings / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | 1 Kgs 11:4–8 (Solomon's high places); 12:28–33 (the golden calves — "Look and behold your gods, Israel"); 14:22–24; 16:31–33 (Baal enthroned in Samaria); 18:21 | The book's spine: from a wise king's drift to a state cult to Baal's official establishment — the narrative arc behind every prophetic indictment on the row. | 1 Kings / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | 1 Kgs 21:9, 12 (a fast proclaimed as cover for judicial murder — a cautionary ref); 21:27–29 (Ahab's fast of self-humbling, which God himself acknowledges) | Both edges in one chapter: fasting as pious theater weaponized, and fasting as real self-humbling that God sees — "See how Ahab humbles himself before me?" | 1 Kings / 2026-08-23 |
| `lament` *(append to existing Joel row)* | 1 Kgs 17:20 (Elijah's protest-prayer over the dead child — "have you also brought evil on the widow... by killing her son?") | A prophet's protest prayed straight at God and answered — the row's personal register in narrative form. | 1 Kings / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | 1 Kgs 18:3, 12 ("Obadiah feared the LORD greatly"; "I, your servant, have feared the LORD from my youth") | A court official's lifelong fear of the LORD sustained inside Ahab's government — the theme lived under hostile power. | 1 Kings / 2026-08-23 |
| `deliverance` *(append to existing 1 Samuel row)* | 1 Kgs 20:13, 28 (20:28: "I will deliver all this great multitude into your hand, and you shall know that I am the LORD") | The row's plain rescue register with its own stated purpose clause — deliverance given so that a king who owes God nothing "shall know that I am the LORD," twice. | 1 Kings / 2026-08-23 |
| `god-looks-at-the-heart` *(append to existing 1 Samuel row)* | 1 Kgs 8:39 ("you, even you only, know the hearts of all the children of men") | The dedication prayer states the row's doctrine as doctrine — the theology behind 1 Sam 16:7, prayed in public. | 1 Kings / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | 1 Kgs 13:15–19 (the old prophet's invitation dressed in a claimed revelation — "an angel spoke to me by the LORD's word... He lied to him") | Distinctive on the row: temptation clothed in religious authority — an invitation to disobey God delivered as a word from God. | 1 Kings / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | 1 Kgs 1:29–30 (David's oath about Solomon, kept); 2:36–46 (Shimei's oath before the LORD, broken and enforced); 8:31–32 (oaths sworn before the altar in the dedication prayer) | An oath kept, an oath broken with stated consequences, and oath-taking built into the temple's judicial function. | 1 Kings / 2026-08-23 |
| `death-and-burial` *(append to existing Genesis row)* | 1 Kgs 2:10 (David "slept with his fathers, and was buried"); 13:29–31 (the man of God mourned and buried in the old prophet's own grave); 14:13 (the one member of Jeroboam's house to reach a grave, "because in him there is found some good thing toward the LORD") | Adds the formula that will govern both books of Kings, and two burials the narrative itself makes theologically pointed. | 1 Kings / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 1 Kgs 2:1–4 (the royal charge: "show yourself a man" and keep the instruction of the LORD); 3:7–9 (the leader's confessed inadequacy — "I am just a little child"); 12:6–15 (counsel taken and refused, a kingdom lost) | The book opens with leadership's charter and confession and turns on its failure — the servant-leadership counsel of 12:7 ("If you will be a servant to this people today... they will be your servants forever") is a direct leadership proof text. | 1 Kings / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | 1 Kgs 19:5–7 (the LORD's angel touches Elijah twice, with baked bread and water — "Arise and eat, because the journey is too great for you") | The canon's gentlest angel scene: ministry to a burned-out prophet — food, water, sleep, and a second touch. | 1 Kings / 2026-08-23 |

Also noted, not logged (near-covered lexicon-extension candidates; recorded so
later threads don't re-log): "still small voice" phrasings → the `guidance`
hearing-God's-voice flag already recorded by the 1 Samuel block; "Elijah under
the juniper tree" / prophet-burnout phrasings → `pastoral-hope-in-despair`
(whose pack already anchors 1 Kgs 19:4–7); "where does God dwell" /
temple-presence phrasings → `presence-of-god`; "the jar of meal will not run
out" → `gods-provision`.

## Acts appends — 2026-08-23 (Gospels+Acts thread)

Appended as one block at file end to keep the append atomic under concurrent book
threads (coordination ruling 5); nothing above this line was edited. Rows marked
*(append to existing row)* add Acts' locations to the named row earlier in this
file — read them together with that row; the other three rows are new gaps. Sourced
from the Acts book doc's Tag-gap candidates section (`acts.md`, this directory) and
re-deduped against this file's live state at delivery (every block appended since
John's delivery — Daniel, the Hebrews and Revelation deliveries, Deuteronomy,
Ezekiel, and 1 Kings — was re-read before this append and collides with nothing
below): Acts' refs for the gaps the Matthew, Mark, Luke, and John blocks logged go
to those rows (`ascension` and `holy-spirit` are Luke's rows — the `ascension`
row's own text asks the Acts delivery to append rather than mint a competing id),
and the themes sibling threads logged first follow the established routings —
Acts staged `god-and-government` (→ Romans' `governing-authorities` row, the same
routing the Matthew, Mark, and Luke deliveries used), `shepherding-gods-people`
(→ Zechariah's `shepherds-and-the-flock` row) and `unity-of-believers`
(→ Ephesians' `unity-of-the-church` row), both per the John delivery's routing,
and `conscience` — staged in the Acts doc as a new candidate — turned out to have
a live home (the Romans `conscience` row, which landed after Acts' staging and is
exactly the Pauline doctrinal home the Acts rationale anticipated), so it appears
here as a ref-append. Only `signs-and-wonders`, `boldness-in-witness`, and the
CONTESTED `gentile-inclusion` were still absent from the live log at delivery and
appear as new rows. Checked-none result, recorded so no one re-derives it:
`justice-and-oppression` (Micah row) — per coordination ruling 3, Acts' needy-care
material (2:44–45; 4:34–35; 6:1; 11:28–30) is voluntary community provision, not
that row's national-scale oppression register; nothing is appended to it from
Acts, and the material is carried by `generosity` tags in the book doc.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `signs-and-wonders` | Acts 2:19, 22, 43; 3:1–10; 4:16, 30; 5:12–16; 6:8; 8:6–7, 13; 9:32–42; 14:3, 8–10 | "Miracles in the Bible", "signs and wonders", "did the apostles do miracles", "does God still heal" are heavy lay queries with no general concept home — `pastoral-prayer-for-healing` serves the personal-crisis register only, and nothing covers miracles as attestation (“Jesus of Nazareth, a man approved by God to you by mighty works and wonders and signs,” 2:22). Acts uses the “signs and wonders” formula itself nine-plus times. | Acts (Gospels+Acts) / 2026-08-23 |
| `boldness-in-witness` | Acts 4:13 (“the boldness of Peter and John”), 29–31 (“speak your word with all boldness”); 9:27–29; 13:46; 14:3; 28:31 | "Boldness to share my faith", "praying for boldness", "overcoming fear of evangelism" — a distinct, heavily-felt query family. Check the lexicon-extension route on `sharing-your-faith` before minting; Acts' repeated boldness vocabulary (parrhesia passages) argues it can stand alone. | Acts (Gospels+Acts) / 2026-08-23 |
| `gentile-inclusion` — CONTESTED between the Acts drafters; both positions preserved | Acts 10:34–35, 44–48; 11:1–18; 13:46–48; 14:27; 15:1–29; 21:25; 22:21–22; 26:17–18, 23; 28:28 | Drafter B's case for a new row: "Do Christians have to keep the law of Moses", "Jerusalem council", "why don't Christians practice circumcision or kosher law" — the question a whole chapter of Scripture exists to answer, and a live lay query family with no vocabulary home: `nations-and-peoples` covers the nations theme broadly, `grace-not-earned` the soteriology, but nothing serves the Gentiles-welcomed-without-the-law question itself. Drafter A's counter-position: the theme is covered by `nations-and-peoples` (tagged on Acts 10, 11, and 13 in the book doc), and any residual gap is lexicon tuning on that concept, not a new id. Recommended disposition (reversible delegated default): keep the row, with a lexicon-extension check on `nations-and-peoples` (and `grace-not-earned`) required before any id is minted. | Acts (Gospels+Acts) / 2026-08-23 |
| `holy-spirit` (or `the-holy-spirit`) *(append to existing Luke row)* | Acts 1:4–5, 8; 2:1–4, 17–18, 33, 38; 4:8, 31; 5:3, 9, 32; 6:3, 5, 10; 7:51, 55; 8:15–19, 29, 39; 9:17, 31; 10:19–20, 44–47; 11:12, 15–16, 24, 28; 13:2–4, 9, 52; 15:8, 28; 16:6–7; 19:2–6; 20:22–23, 28; 21:4, 11 | Acts is Scripture's densest who-the-Spirit-is-and-what-he-does narrative — Pentecost (2:1–4) is the load-bearing text for "filled with the Holy Spirit" / "baptized in the Holy Spirit" queries, and the mission half adds the Spirit given, consulted (“it seemed good to the Holy Spirit, and to us,” 15:28), forbidding routes, binding Paul, making overseers, and speaking through prophets. Strongest single anchor set for this proposed concept. Same double-routing caution the row already carries: the lexicon must not double-route the Counselor queries `holy-spirit-the-comforter` already serves. | Acts (Gospels+Acts) / 2026-08-23 |
| `ascension` *(append to existing Luke row)* | Acts 1:2, 9–11, 22; 2:33–34 (“Being therefore exalted by the right hand of God”); 7:55–56 | The Luke row's own rationale asks the Acts delivery to append here rather than mint a competing id. Acts 1:9–11 is the fullest ascension narrative in Scripture and the natural landing for "ascension of Jesus" / "where did Jesus go" queries; 2:33 and 7:55–56 add the exaltation-and-session facet. | Acts (Gospels+Acts) / 2026-08-23 |
| `kingdom-of-heaven` (or `kingdom-of-god`) *(append to existing Matthew row)* | Acts 1:3, 6; 8:12; 14:22; 19:8; 20:25; 28:23, 31 | Acts frames both ends of its story with “God’s Kingdom” (1:3; 28:23, 31) — Paul's message is “preaching God’s Kingdom” down to the book's final verse — reinforcing the row's both-phrasings lexicon note. | Acts (Gospels+Acts) / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | Acts 11:26 (“the disciples were first called Christians”); 14:21–22 (“made many disciples… exhorting them to continue in the faith”) | Lighter in Acts than the Gospels; the making-and-strengthening-disciples verbs are the fit. | Acts (Gospels+Acts) / 2026-08-23 |
| `servanthood` *(append to existing Matthew row)* | Acts 6:1–6; 20:18–19, 33–35 | The classic "deacons / serving in the church" text — “serve tables,” the seven chosen for the daily service (6:2) — joined by Paul's own ministry posture, “serving the Lord with all humility, with many tears” (20:19), laboring with his hands to help the weak. Supports the row's extension-check against `humble-exaltation`. | Acts (Gospels+Acts) / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Acts 4:19–20; 5:29; 16:35–39; 22:25–29; 23:5; 25:10–12 | Acts staged this as `god-and-government` — the same gap the Romans row logged first, following the routing the Matthew, Mark, and Luke deliveries used. Acts supplies both poles of the believer-and-state query family: the limit-case “We must obey God rather than men” (5:29 — obedience to rulers ends where God's command begins), and Scripture's richest narrative anchors for legal rights — Paul invoking Roman citizenship, correcting himself before a ruler by citing Exodus (“You shall not speak evil of a ruler of your people,” 23:5), and appealing to Caesar. "Should Christians obey the government", "did Paul use his rights" queries land here. | Acts (Gospels+Acts) / 2026-08-23 |
| `money-and-possessions` *(append to existing Mark row)* | Acts 8:18–24; 16:16–19; 19:23–27; 20:33; 24:26 | Two facets for the eventual lexicon: grace not purchasable (“you thought you could obtain the gift of God with money,” 8:20), and greed resisting the gospel — the slave girl's masters, Demetrius's trade, Felix's bribe hunger — against Paul's “I coveted no one’s silver, gold, or clothing” (20:33). The community-of-goods passages (2:44–45; 4:32–37) are carried by `generosity` and are not claimed for this row. | Acts (Gospels+Acts) / 2026-08-23 |
| `shepherds-and-the-flock` *(append to existing Zechariah row)* | Acts 20:28–31 | Acts staged this as `shepherding-gods-people` — the same gap the Zechariah row logged first (same routing as the John delivery). The one direct NT charge to elders in narrative: overseers made by the Holy Spirit “to shepherd the assembly,” warned of wolves. Strengthens the row's John 10 / John 21 anchors. | Acts (Gospels+Acts) / 2026-08-23 |
| `unity-of-the-church` *(append to existing Ephesians row)* | Acts 15:22, 25 (“having come to one accord”) | Acts staged this as `unity-of-believers` — the same gap the Ephesians row logged first (same routing as the John delivery). A modest append: the council resolving an assembly-splitting dispute into one accord is the John 17 prayer enacted at the institutional level. | Acts (Gospels+Acts) / 2026-08-23 |
| `conscience` *(append to existing Romans row)* | Acts 23:1 (“I have lived before God in all good conscience until today”); 24:16 (“a conscience void of offense toward God and men”) | Acts staged this as a new candidate before the Romans row landed; the Romans row is the same gap ("conscience toward God", "how do I keep a good conscience"), and Acts adds the narrative anchors — Paul twice makes the conscience the frame of his defense — alongside the row's doctrinal texts, exactly the cross-thread anchoring the Acts rationale anticipated. | Acts (Gospels+Acts) / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Acts 5:19 (prison doors opened); 7:30–38, 53 (the angel at the bush; the law “ordained by angels”); 8:26 (Philip sent); 10:3–7, 22, 30–32 (Cornelius's visitor); 12:7–11, 15, 23 (Peter's rescue; “It is his angel”; Herod struck); 27:23–24 (“an angel, belonging to the God whose I am and whom I serve,” with the storm-night message); optionally 23:8–9 (the Pharisee–Sadducee dispute over whether angels exist — a doctrinal mention, flagged as such) | Acts' angelic material spans rescue, commissioning, judgment, and assurance. (Acts 1:10's “two men… in white clothing” and 6:15's “face of an angel” are not called angels outright in the text and are not claimed.) | Acts (Gospels+Acts) / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Acts 6:1–6 (the seven chosen over the daily service — delegation under growth); 14:23 (elders appointed in every assembly with prayer and fasting) | "Church leadership / appointing leaders" queries land here. | Acts (Gospels+Acts) / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Acts 18:18 (Paul shaves his head at Cenchreae, “for he had a vow”); 21:23–26 (the four men's vow, purification, and paid expenses); 23:12–14, 21 (the conspirators “bound themselves under a curse” to kill Paul — a vow depicted in its destructive form; route to what Scripture says about binding oaths, not endorsement, per the Genesis `vengeance` row's precedent) | Narrative vow-practice texts (Nazirite-style vows kept by an apostle) plus a destructive counter-example — both real query families ("vows in the Bible", "is it okay to swear an oath"). | Acts (Gospels+Acts) / 2026-08-23 |

Extension-check flags from Acts (not gap rows; for curation review before any new id):

- **Persecution of the church / martyrdom** — Acts 4:1–3, 17–21; 5:17–18, 40;
  6:9–14; 7:54–60 (Stephen); 8:1–3; 9:1–2, 23–25, 29; 11:19; 12:1–4 (James);
  13:50; 14:2, 5, 19. "Persecution of Christians / the persecuted church" and
  "first Christian martyr" queries most naturally extend `suffering-for-christ`'s
  lexicon; check that route first — the systemic framing (“great persecution…
  scattered,” 8:1) is the only facet the current gist may miss.
- **Resurrection of the dead generally** — Acts 23:6–8; 24:15, 21 (“both of the
  just and unjust”). Fourth witness to the flags at the end of the Matthew, Mark,
  and Luke blocks: if `resurrection` ("He is risen") is Easter-scoped, check a
  lexicon extension for "resurrection of the dead" / "life after death" queries
  before minting.
- **Finishing the race / perseverance in ministry** — Acts 20:22–24 (“so that I
  may finish my race with joy”); 21:13; 28:30–31. Could extend `do-not-lose-heart`
  or `suffering-for-christ` lexicons; check both routes before minting a
  `perseverance-in-mission` id.
- **Breaking bread and `lords-supper`** — Acts 2:42, 46; 20:7, 11. Whether
  narrative breaking-bread texts belong in the existing `lords-supper` concept's
  lexicon is a tagging/lexicon question, not a new-concept gap; reading 20:7 as
  the Lord's Supper is common but beyond the text's words.
- **Early-church community / "what is the church"** — 2:42–47; 4:32–37; 6:1–7;
  9:31; 11:19–26; 14:23, 27. Mostly covered: `gathering-together` carries the
  common-life substance, with `harmony-with-others`, `generosity`, and the
  Genesis `leadership` row carrying facets; check a lexicon extension of
  `gathering-together` before any new id.

## Ezra delivery — 2026-08-23

Appended at Ezra finalize (round-2 critic approval: zero objections), delivered
with the approved book doc (`ezra.md`, this directory). Re-deduped against this
file's live state in a full re-read immediately before this append; nothing
above this line was edited. Newest blocks at the final read: Deuteronomy,
Ezekiel, and 1 Kings — all checked by theme. RACE RECORD: an Acts delivery
block landed between that read and this write (caught by the pre-append
snapshot guard); it was re-read in full and changes no routing here — its new
rows (`signs-and-wonders`, `boldness-in-witness`, the contested
`gentile-inclusion`) are different themes from the one NEW row below, and its
`oaths-and-vows` and `governing-authorities` ref-appends land compatibly on
the same Genesis and Romans rows this block also appends to. One NEW row
(`opposition-to-gods-work`) — re-checked at write time: neither the id nor any
opposition-to-the-work row exists anywhere in this file, and the id is not in
the 131-id vocabulary; every other row below is an append to a landed row (the
Ezekiel and 1 Kings blocks have meanwhile ref-appended compatibly to several of
the same owner rows — `remnant`, `the-house-of-god`, `fasting`, `deliverance` —
with no routing change needed). Provenance note carried from the book doc: no
Ezra verse is witnessed in `pipeline/fixtures/web-subset.json`, so every Ezra
ref and quoted fragment below is verified against the current ebible.org
edition (sha256 b6f55cc7…) only, as `ezra.md` discloses.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `opposition-to-gods-work` | Ezra 4:1–5, 23–24 ("weakened the hands of the people of Judah, and troubled them in building"; work stopped "by force of arms"); 5:3 (the governor's challenge); 3:3 (building "In spite of their fear because of the peoples of the surrounding lands") | "Facing opposition when serving God," "opposition in ministry," "enemies of God's work" are common lay and congregational queries with no vocabulary home: `do-not-lose-heart` is the 2 Cor 4 perseverance register (and tagging Ezra 4 with it would tag the failure mode — the hands ARE weakened), `suffering-for-christ` is the NT persecution register, and `gods-protection` covers God's keeping, not the opposition theme a searcher names. Ezra 4–6 is the OT's paradigm opposition-to-the-work narrative (offer, slander, legal obstruction, forced stop, vindication), and Nehemiah will hit the same gap hard (the Sanballat material) — logged now so that thread can append rather than mint. | Ezra / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Ezra 8:21, 23 (a corporate fast proclaimed "that we might humble ourselves before our God, to seek from him a straight way" — and answered: "So we fasted and begged our God for this, and he granted our request"); 10:6 (Ezra's mourning fast — no bread, no water) | A protection-fast proclaimed, prayed, and explicitly answered, and a grief-fast over the people's sin — both registers in one book, joining the row's Joel, 1 Kings, and Daniel-era refs. | Ezra / 2026-08-23 |
| `confession-of-sin` *(append to existing 1 John row)* | Ezra 9:6–15 (the OT's paradigm corporate confession prayer — "O my God, I am ashamed and blush to lift up my face to you"); 10:1, 11 ("make confession to the LORD, the God of your fathers, and do his pleasure") | The row's confession register in corporate, national form: a leader confessing sins he did not personally commit, identifying with his people — the classic OT companion to the row's 1 John 1:9 anchor. | Ezra / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | Ezra 9:8, 13–15 — phrase witness ("to leave us a remnant to escape"; "we are left a remnant that has escaped") | The post-exile community praying as the remnant itself — the theme's vocabulary used by the survivors it names, joining the row's prophetic refs. | Ezra / 2026-08-23 |
| `the-house-of-god` *(append to existing Haggai row)* | Ezra 1:2–5; 3:8–11; 5:8, 11–17; 6:3–5, 14–18; 7:27 | The book is the house-of-God theme in narrative form — decreed, founded, opposed, finished, dedicated, beautified — and its events are the setting of Haggai itself; these refs join the Ezekiel dwelling-place refs already merged on the row. | Ezra / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | Ezra 1:1–5; 2:1; 9:8–9 ("to set up the house of our God, and to repair its ruins... revive us a little in our bondage") | The return from Babylon narrated as national restoration in progress — the row's promise texts happening on the ground. The "revive us" language is also flagged to the 2 Kings-drafted `revival-and-reformation` row (see the coordination note below). | Ezra / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Ezra 10:5 ("made the chiefs of the priests, the Levites, and all Israel to swear... So they swore"); 10:19 ("They gave their hand") | Oath-taking as the mechanism binding a national covenant decision, plus the give-the-hand pledge idiom — registers the row does not yet carry. | Ezra / 2026-08-23 |
| `unequally-yoked` *(append to existing 2 Corinthians row)* | Ezra 9:1–2, 12, 14; 10:2–3, 10–11, 44 | The OT covenant-separation texts behind the query family, with a register caveat the row's wording must keep: Ezra's crisis is covenant-national and its remedy is narrated, not prescribed to later readers — these are background texts, never a direct template for the modern marrying-a-non-believer question. | Ezra / 2026-08-23 |
| `governing-authorities` *(append to existing Romans row)* | Ezra 6:10 (sacrifices offered with prayer "for the life of the king and of his sons"); 7:26 ("the law of your God and the law of the king" side by side) | Modest-confidence refs for the row's obeying-the-law facet: prayer for the ruler decreed into the temple's service, and divine and civil law named together in a royal commission. | Ezra / 2026-08-23 |
| `passover` *(append to existing Exodus row; Leviticus and Numbers refs already merged)* | Ezra 6:19–22 | A post-exile Passover narrative for the row: kept by the returned exiles in the finished temple's first year, the lambs killed by priests and Levites who had purified themselves, on behalf of the whole community, with seven days of unleavened bread. (The 2 Kings thread's Josiah Passover, 2 Kgs 23:21–23, is that book's parallel witness — its refs are its thread's to append.) | Ezra / 2026-08-23 |
| `appointed-feasts` *(append to existing Leviticus row; Numbers refs already merged)* | Ezra 3:4–6 | The feast of booths and "all the set feasts of the LORD" restored as a system after the return — lands on the calendar-as-a-system row per its scoping. Wording note: the WEB's Ezra phrase is "set feasts" (3:5), matching the Numbers append's 29:39 phrase witness. | Ezra / 2026-08-23 |
| `priesthood` *(append to existing Exodus row; Leviticus and Numbers refs already merged)* | Ezra 2:61–63 (priests unable to prove descent "deemed disqualified and removed from the priesthood," barred from "the most holy things until a priest stood up to serve with Urim and with Thummim") | The institution's genealogical-qualification register — present nowhere in the row's establishment/working-life refs. | Ezra / 2026-08-23 |
| `deliverance` *(append to existing 1 Samuel row)* | Ezra 8:22, 31 ("he delivered us from the hand of the enemy and the bandits by the way") | The row's plain rescue register: protection confessed before the king, then narrated as delivered on the road. | Ezra / 2026-08-23 |
| `sovereignty-of-god` *(append to existing Isaiah row; Jeremiah refs already merged)* | Ezra 1:1, 5 (the LORD stirring Cyrus's spirit and the returnees' spirits); 6:22 (turning the king's heart); 7:27 ("put such a thing as this in the king's heart") | The narrative counterpart of the row's Isa 45 Cyrus texts — the sovereignty those oracles announce, shown operating inside imperial politics. These verses are tagged `providence` in the book doc; the row's check-a-`providence`-lexicon-extension-first advice stands. | Ezra / 2026-08-23 |

**Coordination notes (no rows minted):** `exile-and-captivity` and
`revival-and-reformation` remain 2 Kings-drafted only — still absent from this
file at this delivery (the 2 Kings thread's critic loop had not closed). Ezra's
refs for them, held for that thread's landing or a joint decision:
exile/captivity — Ezra 1:11; 2:1; 4:1; 6:19–21; 8:35; 10:7, 16 ("the children
of the captivity" as the community's standing name); revival/reform — Ezra
9:8–9 ("revive us a little"); chs. 5–6 (the work revived at the prophets'
word); chs. 9–10 (community reform). Routing context now at three witnesses:
the Jeremiah, Lamentations, and Daniel blocks each route exile texts to the
Genesis `sojourners-and-strangers` row rather than minting an exile id (Daniel's
append carries "children of the captivity of Judah" refs directly). Ezra's
return-from-captivity register differs (the community named by its captivity,
coming home), so the exile-id question should be settled with the 2 Kings
thread against that precedent, not unilaterally.

**Checked and declined (recorded so later threads see the calls were made):**
`justice-and-oppression` (Micah row — the row the project-wide ruling
references for national justice material): checked and nothing referenced —
Ezra has no oppression-of-the-poor or corrupt-courts theme; 9:8–9's bondage
language is covenant-history recital inside a confession. `lament` (Joel row):
Ezra 9:3–5 and 10:1 are penitential grief over sin, not the complaint-to-God
register that row logs. `idolatry` (Micah row): the "abominations" of 9:1, 11
are named as the peoples' practices motivating separation; no idol worship by
Israel is depicted.

## 2 Kings delivery — 2026-08-23

Appended at 2 Kings finalize (round-4 critic approval: zero objections),
delivered with the approved book doc (`2-kings.md`, this directory). Re-deduped
against this file's live state in a full re-read immediately before this append
(2,329 lines at the pre-append snapshot; newest block: Ezra delivery); nothing
above this line was edited. Both NEW rows below were re-checked at write time:
no `exile-and-captivity` or `revival-and-reformation` row exists anywhere in
this file, neither id is in the 131-id b3f491d vocabulary, and no competing row
covers either theme under another id. Every other row below is an append to a
landed row, each re-verified present at the pre-append read. The Ezra delivery
block's coordination note held Ezra refs for both NEW rows pending this
thread's landing — those refs are folded into the two rows below with their
Ezra attribution kept visible — and Ezra's `passover` row explicitly left the
Josiah Passover refs "its thread's to append": that invitation is answered
with the `passover` append below (disclosed as a delivery-time addition made
in response to that invitation — the refs are the book doc's own chapter 23
content, though the doc's gap section, frozen at critic approval, does not
list the append). Provenance note carried from the book doc: no 2 Kings verse
is witnessed in `pipeline/fixtures/web-subset.json`, so every 2 Kings ref and
quoted fragment below is verified against the current ebible.org edition
(sha256 b6f55cc7…) only, as `2-kings.md` discloses.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `exile-and-captivity` — NEW, flagged BORDERLINE pending the routing call in this row's note | 2 Kgs 15:29; 17:6, 22–23 ("So Israel was carried away out of their own land to Assyria to this day"); 24:14–16; 25:11, 21 ("So Judah was carried away captive out of his land"); plus the Ezra refs held by that block's coordination note: Ezra 1:11; 2:1; 4:1; 6:19–21; 8:35; 10:7, 16 ("the children of the captivity" as the community's standing name) | "Exile in the Bible," "Babylonian captivity," "why did God send Israel into exile" are heavy study queries with no home among the 131 ids. **Routing precedent engaged, not bypassed:** this file routes exile texts to the Genesis `sojourners-and-strangers` row rather than minting an exile id (the Jeremiah precedent; the Lamentations append — "if the eventual concept is minted, its gist should cover exile as well as sojourning"; the Daniel "children of the captivity of Judah" append). The register-split case for a distinct row: that row's substance is living-as-a-foreigner (Ittai, Uriah, exiles told to build and plant) — a personal/experiential register — while 2 Kings' material is deportation as a theological event with the narrator's own why (17:7–23; 24:3–4), and Ezra's is the community named by its captivity coming home; the "why did God send Israel into exile" query family lands on the explanation, not the sojourner experience. Jesse's call at curation: either honor the precedent (route these refs to `sojourners-and-strangers` with an exile-register note, widening its eventual gist per the Lamentations wording) or mint the separate id and cross-link the two rows. Companion row either way: the Obadiah-logged `restoration-of-israel` (the return hope). | 2 Kings / 2026-08-23 (Ezra refs: Ezra / 2026-08-23) |
| `revival-and-reformation` — NEW | 2 Kgs 11:17–18; 18:3–6; 22:11–20; 23:1–25; plus the Ezra refs held by that block's coordination note: Ezra 9:8–9 ("revive us a little in our bondage"); chs. 5–6 (the stopped work revived at the prophets' word); chs. 9–10 (community reform) | "Revival in the Bible," "spiritual awakening," "returning to God as a nation/church" are common congregational queries with no home: `repentance` is the personal turning register, `restoration` the personal renewal-prayer register ("restore my soul"), and neither lexicon will catch revival/reform phrasing. Josiah's reform (word recovered → hearts torn → covenant renewed → worship purged → Passover restored, 2 Kgs 22–23) is Scripture's fullest reform narrative, with Hezekiah's (18:3–6) and Jehoiada's (11:17–18) beside it. Route check before minting: a lexicon-extension review on `repentance` may serve the query family more cheaply. | 2 Kings / 2026-08-23 (Ezra refs: Ezra / 2026-08-23) |
| `idolatry` *(append to existing Micah row)* | 2 Kgs 16:3–4, 10–16; 17:7–17, 29–41 (incl. 17:33, "They feared the LORD, and also served their own gods"); 21:3–9; 23:4–20, 24 | The book's engine of judgment: imported altars, the high places, the hybrid worship of resettled Samaria, Manasseh's temple-court idols, and Josiah's purge — the fullest narrative arc yet logged for the row. | 2 Kings / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | 2 Kgs 1:3, 15 (the LORD's angel directing Elijah); 6:17 (the mountain full of horses and chariots of fire); 19:35 (the LORD's angel striking the Assyrian camp) | "Angel armies" / "spiritual warfare" queries land here: the unveiled hosts of 6:17 and the single angel of 19:35 are among the most-asked angel texts in the historical books. | 2 Kings / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | 2 Kgs 19:4 ("lift up your prayer for the remnant that is left"); 19:30–31 ("out of Jerusalem a remnant will go out... the zeal of the LORD will perform this") | The theme's vocabulary in narrative crisis: Hezekiah and Isaiah both name the remnant during the Assyrian siege — historical-books companion refs for the row's prophetic core. | 2 Kings / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | 2 Kgs 17:25–39 ("who didn't fear the LORD"; "They shall not fear other gods... but you shall fear the LORD, who brought you up out of the land of Egypt") | The resettlement narrative turns the phrase over a dozen times, contrasting taught fear, hybrid fear, and the covenant command — dense phrase-witness for the row. | 2 Kings / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row — the row the project-wide pastoral ruling routes national justice material to)* | 2 Kgs 15:16 (Menahem's atrocity at Tiphsah); 15:19–20 (the thousand talents exacted "of all the mighty men of wealth" to pay Assyria); 21:16 (Manasseh filling Jerusalem with innocent blood); 24:3–4 ("the innocent blood that he shed... which the LORD would not pardon") | National-scale violence and extraction under judgment — routed here rather than to any `pastoral-*` id per the project-wide register ruling; 24:4's unpardoned innocent blood is the book's own weightiest justice text. | 2 Kings / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 2 Kgs 2:1–15 (the mantle passing from Elijah to Elisha, "a double portion of your spirit"); 12:2 (Jehoash doing right "all his days in which Jehoiada the priest instructed him"); 13:14 (the dying Elisha still "the chariots of Israel and its horsemen") | The row's "passing the torch" / mentoring facet in its strongest OT narrative form: succession sought, granted, and publicly recognized — plus a king who is only as good as his mentor's lifetime. | 2 Kings / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | 2 Kgs 1:2–4, 16 (inquiring of Baal Zebub instead of God — "Is it because there is no God in Israel...?"); 17:17; 21:6 (Manasseh's sorcery, enchantments, and dealings with "those who had familiar spirits" and wizards); 23:24 (Josiah putting them away) | Adds the historical-books narrative layer to the row: consulting a rival oracle indicted as practical atheism, royal sponsorship of the practices at their OT worst, and the reform that removes them. | 2 Kings / 2026-08-23 |
| `davidic-covenant` *(append to the 2 Samuel-logged row)* | 2 Kgs 8:19 ("the LORD would not destroy Judah, for David his servant's sake, as he promised him to give to him a lamp for his children always"); 19:34; 20:6 ("for my own sake, and for my servant David's sake"); 25:27–30 (Jehoiachin lifted from prison — the lamp not extinguished in exile) | The promise operating as history's counterweight through the book: three explicit for-David's-sake preservations, and an ending whose open door is legible against the row's 2 Sam 7 texts. Design note carried from the book doc: state what the text says; no messianic read-back. | 2 Kings / 2026-08-23 |
| `passover` *(append to existing Exodus row; answering the Ezra block's invitation)* | 2 Kgs 23:21–23 ("Keep the Passover to the LORD your God, as it is written in this book of the covenant"; "Surely there was not kept such a Passover from the days of the judges") | Josiah's Passover — the covenant-renewal feast kept from the recovered book itself, and the narrator's own superlative for it; pairs with the Ezra row's post-exile Passover as the historical-books witnesses. | 2 Kings / 2026-08-23 |

## 1 Chronicles appends — 2026-08-23

Appended at 1 Chronicles finalize (round-4 critic approval: zero objections),
delivered with the approved book doc (`1-chronicles.md`, this directory).
Re-deduped against this file's live state in a full re-read immediately before
this append (2,366 lines at the pre-append snapshot; newest block: 2 Kings
delivery); nothing above this line was edited. One NEW row (`seeking-god`) —
re-checked at write time: no seeking row exists anywhere in this file under any
phrasing (`seeking-god`, seek-the-LORD, seek-his-face), the id is not in the
131-id b3f491d vocabulary, and the nearest live row — Haggai's
`putting-god-first`, which names "seek God first" — is the priorities/first-place
register, not the seek-him-and-be-found family this row proposes; checked and
distinguished. Every other row below is an append to a landed row, each
re-verified present at this pre-append read. One disposition changed from the
book doc's round-2/round-3 drafted snapshot, exactly as the doc's own
whichever-book-lands-first rule prescribed: `wholehearted-devotion` landed via
the 1 Kings finalize, so 1 Chronicles' perfect-heart refs join it here as an
append rather than waiting on a sibling draft.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `seeking-god` | 1 Chr 10:13–14 (the book's first verdict: Saul "asked counsel of one who had a familiar spirit, to inquire, and didn't inquire of the LORD" — restated in the seek-vocabulary at 13:3); 13:3 ("we didn't seek it in the days of Saul"); 15:13 ("we didn't seek him according to the ordinance"); 16:10–11 ("Seek the LORD and his strength. Seek his face forever more"); 22:19 ("set your heart and your soul to follow the LORD your God"); 28:9 ("If you seek him, he will be found by you; but if you forsake him, he will cast you off forever") | "Seek the Lord," "seeking God's face," "how to seek God," "seek and you will find (OT)" are heavy query families with no home: `hunger-for-god` owns the thirst/longing register, `presence-of-god` the nearness register, `prayer` the asking register, and Haggai's `putting-god-first` row the priorities register — none carries seek/sought/his-face vocabulary. Chronicles is arguably the theme's home book: it grades the Saul era as seek-failure, diagnoses the Uzza disaster as a failure to seek him "according to the ordinance," commands the seeking, and gives the promise. Kin texts elsewhere (2 Chr 7:14; 15:2; Ps 27:8; Isa 55:6; Jer 29:13; Matt 7:7) would anchor a pack beyond this book. | 1 Chronicles / 2026-08-23 |
| `satan` *(append to existing Job row)* | 1 Chr 21:1 ("Satan stood up against Israel, and moved David to take a census of Israel") | The OT's third heavenly-adversary text, and the one narrative where he moves a king to act — precisely the who-is-Satan text class the Job row's rationale names. Reported as the WEB gives it, with no harmonization against 2 Sam 24:1 (the book doc's Decisions record covers the parallel). | 1 Chronicles / 2026-08-23 |
| `mercy` *(append to existing Hosea row)* | 1 Chr 21:13 ("Let me fall, I pray, into the LORD's hand, for his mercies are very great") | A classic mercy prooftext: at the sentencing moment David stakes everything on the character of God rather than the mercy of men. | 1 Chronicles / 2026-08-23 |
| `comforting-others` *(append to existing Job row)* | 1 Chr 7:21–22 (Ephraim mourns many days, "and his brothers came to comfort him"); 19:2–3 (comforters sent — and misjudged) | A model-comfort text inside a genealogy (grief attended in person, over time), and the book's cautionary case of comfort offered and misread. | 1 Chronicles / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | 1 Chr 29:15 ("Our days on the earth are as a shadow, and there is no remaining") | The days-as-a-shadow confession, prayed by a king at the height of his giving — mortality spoken inside doxology rather than despair. | 1 Chronicles / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | 1 Chr 18:14 ("he executed justice and righteousness for all his people") | The righteous-ruler register the row's Job append opened — the reign summarized by its justice. Routed here, not to a pastoral-* id, per the project-wide register ruling. | 1 Chronicles / 2026-08-23 |
| `kindness` *(append to existing Ruth row)* | 1 Chr 19:2 ("I will show kindness to Hanun... because his father showed kindness to me") | Kindness offered, misread, and costly — the row's register tested against suspicion, with a war as the price of the misreading. | 1 Chronicles / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | 1 Chr 10:9–10 (Saul's armor in "the house of their gods," his head in "the house of Dagon"); 14:12 (the Philistines' abandoned gods burned at David's command); 16:26 ("For all the gods of the peoples are idols, but the LORD made the heavens") | Trophy-idolatry, the disposal of captured gods, and the book's own creed-line on why: three registers of the row's theme in narrative and song. | 1 Chronicles / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | 1 Chr 21:15–16 (the destroying angel "having a drawn sword in his hand stretched out over Jerusalem"), 18, 27, 30 (the sword returned to its sheath) | The OT's most visually arresting angel-of-judgment scene — sent, seen, halted, and sheathed — and the angel who relays the command that locates the altar site. | 1 Chronicles / 2026-08-23 |
| `the-house-of-god` *(append to existing Haggai row)* | 1 Chr 22:1 ("This is the house of the LORD God"); 9:26–27 (chambers and treasuries kept, gates opened "morning by morning"); 26:12, 20–22 ("to minister in the LORD's house"; the house treasuries); 28:2–19 (the pattern given "in writing from the LORD's hand"); 29:1 ("the palace is not for man, but for the LORD God") | Chronicles is the row's OT anchor book: the site named, the pattern given, the service organized, and the theology of the building stated in one line (29:1). | 1 Chronicles / 2026-08-23 |
| `davidic-covenant` *(append to the 2 Samuel-logged row)* | 1 Chr 17:7–14 (the promise retold in full: "I will settle him in my house and in my kingdom forever. His throne will be established forever"); 22:9–10 (told to Solomon by name); 28:6–7 (told to the assembly, with its condition) | The Chronicler's telling of the row's charter text — "in my house and in my kingdom" (17:14) where 2 Samuel reads "Your house and your kingdom" (2 Sam 7:16) — plus the promise handed on twice, privately and publicly. | 1 Chronicles / 2026-08-23 |
| `counsel-and-advisers` *(append to existing 2 Samuel row)* | 1 Chr 12:32 ("men who had understanding of the times, to know what Israel ought to do"); 27:32–34 (the king's counselors — Jonathan, Ahithophel, and Hushai "the king's friend") | Issachar's understanding-of-the-times line is a defining counsel proof text, and 27:32–34 is the roster form of the very Ahithophel–Hushai duel the row's rationale names. | 1 Chronicles / 2026-08-23 |
| `god-looks-at-the-heart` *(append to existing 1 Samuel row)* | 1 Chr 28:9 ("the LORD searches all hearts, and understands all the imaginations of the thoughts"); 29:17 ("you try the heart and have pleasure in uprightness") | The row's doctrine stated as doctrine — in a father's charge and a king's prayer — the theology behind 1 Sam 16:7 spoken aloud twice. | 1 Chronicles / 2026-08-23 |
| `wholehearted-devotion` *(append to the 1 Kings-logged row)* | 1 Chr 12:33 ("not of double heart"), 38 ("with a perfect heart"); 28:9 ("serve him with a perfect heart and with a willing mind"); 29:9 ("with a perfect heart they offered willingly"), 17, 19 ("give to Solomon my son a perfect heart") | The book's repeated measure of true service and true giving is "perfect heart" — the whole-heart/double-heart vocabulary the row was minted for, in muster, charge, offering, and prayer. | 1 Chronicles / 2026-08-23 |
| `stewardship` *(append to existing Matthew row)* | 1 Chr 26:20–28 (treasurers over "the treasures of the dedicated things"); 27:25–31 (stewards of the crown's storehouses, fields, herds, and flocks); 29:14, 16 ("all things come from you, and we have given you of your own") | The entrusted-resources register in roster form, capped by the OT's clearest stewardship theology: everything managed is God's before it is ours. | 1 Chronicles / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 1 Chr 12:32; 13:1 (David consults "with the captains of thousands and of hundreds, even with every leader"); 28:9–10, 20 (the succession charge: "Be strong and courageous, and do it") | Consultative leadership at the ark decision, understanding-of-the-times leadership from Issachar, and the canon's fullest leadership-succession charge. | 1 Chronicles / 2026-08-23 |
| `kingdom-of-heaven` *(reference note for the Matthew row's curator — not a firm append)* | 1 Chr 28:5 (Solomon "on the throne of the LORD's kingdom over Israel"); 29:11 ("Yours is the kingdom, LORD"); 29:23 ("Solomon sat on the throne of the LORD") | Noted for that row's scoping decision: if the eventual id is scoped to the Gospels' announcement, these are background texts; if scoped to "kingdom of God" broadly, they are the OT's most direct statements that the kingdom is the LORD's with a human king seated on the LORD's throne. | 1 Chronicles / 2026-08-23 |

Also noted, not logged (lexicon-extension candidates and declined refs,
recorded so later threads don't re-log): music/singing/instrument phrasings
("worship music," "sing to the LORD") → `worship` / `praise` lexicons (neither
carries them; 1 Chr 16:23 and 25:6–7 would anchor); "Uzzah" spelling → any
lexicon touching the ark narratives (the WEB reads "Uzza"); "prayer of Jabez"
→ `prayer` (4:10 anchor candidate, with a prosperity-misuse caution recorded
in the book doc); "his mercies are very great" / falling-into-God's-hands
phrasings → the Hosea `mercy` row's eventual pack (21:13). Checked and
declined: `famine-of-hearing-gods-word` (no 1 Chronicles material fits the
silence-of-God register); `lament` (7:22's mourning is bereavement, routed to
`comforting-others` above); `day-of-the-lord`, `remnant`, `false-prophets`,
`fasting` (10:12's seven-day fast is funerary custom, reported without
teaching substance); `oaths-and-vows` (a drafted 29:24 append was withdrawn at
critic round 3 — the WEB's "submitted themselves to Solomon" carries no oath
language).

## Esther appends + new row — 2026-08-23

Appended as one block at file end to keep the append atomic under concurrent book
threads; nothing above this line was edited. Sourced from the approved Esther book
doc (`esther.md`, this directory; critic loop closed at round 3 with zero
objections). Race recorded: the 1 Chronicles block landed between this thread's
critic round 3 (file at 2,366 lines) and this append; the dedupe below was re-run
against the live file as it stands (2,421 lines, through the 1 Chronicles block)
immediately before this write. Write-time re-verifications: the `courage` row below
is genuinely NEW (no courage row exists anywhere in this file by theme — the Joshua
block's line note routes "be strong and courageous" to `fear-not`'s divine-command
register and is left undisturbed, and 1 Chronicles' quotation of the 28:20 charge
sits inside the Genesis `leadership` row, not a courage row); and the Esther draft's
`exile-and-captivity` coordination note resolved to its has-landed branch — the
2 Kings-minted row (flagged BORDERLINE with its routing question, Ezra refs already
merged) landed during the critic loop, so Esther's refs append to that row here, no
new row and no duplicate. Register context for every row: Esther never names God
(zero divine-name occurrences in the WEB corpus bytes), so its refs are narrative
witnesses in which no divine actor is named — row curators should quote them as the
text has them.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `courage` (or `courage-and-boldness`) | Esth 4:11, 16 ("I will go in to the king, which is against the law; and if I perish, I perish"); 5:1–2 (the uncalled approach made); 7:6 ("An adversary and an enemy, even this wicked Haman!" — spoken with the adversary at the table); also 3:2 (Mordecai's daily refusal) | "Courage in the Bible," "courage to do the right thing," "standing up for others when it costs you" are heavy lay queries with no honest home: `fear-not` is the divine comfort-command register ("Don't be afraid" spoken by God — its lexicon's "take courage" serves that register, and the Joshua block's line note already marks the verbatim "be strong and courageous" phrase unserved), while Esther's courage is precisely NOT answered by any recorded divine word — she resolves and goes. Esther 4–7 is Scripture's fullest narrative of costly civil courage without a theophany; Daniel (3:16–18; 6:10) hits the same gap — logged so that material can append rather than mint. | Esther / 2026-08-23 |
| `exile-and-captivity` *(append to existing 2 Kings row)* | Esth 2:5–6 (Mordecai's family "carried away from Jerusalem with the captives" with Jeconiah — the book's whole cast lives downstream of the deportation); 3:8 ("a certain people scattered abroad and dispersed among the peoples in all the provinces"); 8:17 (diaspora Jews in every province and city) | Esther adds the row's diaspora-at-risk register: the community the deportations created, still in the empire a lifetime later, nearly destroyed there. Fits the row's exile-history register per its own split against `sojourners-and-strangers` (living-as-foreigners), whose Esther refs below overlap only at 2:5–6 and 3:8 by design. | Esther / 2026-08-23 |
| `deliverance` *(append to existing 1 Samuel row)* | Esth 4:14 ("relief and deliverance will come to the Jews from another place" — phrase witness; searchers quote other translations' "arise from another place"); 8:11 ("defend their lives"); 9:16 ("had rest from their enemies") | The row's register caveat matters here: Esther's deliverance arrives with no named deliverer — which is exactly why the 4:14 phrase is searched. | Esther / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Esth 4:3 (mourning-fasts across the provinces); 4:16 (the three-day corporate fast, "night or day"); 9:31 (fastings written into Purim's observance) | Adds the practice's most famous crisis instance — with the register observation that Esther's fasts are, in the text, fasting without any named prayer (the book's defining reticence); the row should carry that rather than smooth it over. | Esther / 2026-08-23 |
| `persecuted-for-gods-word` *(append to existing Jeremiah row)* | Esth 3:6, 8–13 (the empire-wide destruction decree against "a certain people scattered abroad and dispersed"); 4:3; 7:4 ("we are sold, I and my people, to be destroyed, to be slain, and to perish"); 9:1–2 | Esther adds the row's national-scale case: a whole people marked for annihilation for being who they are — the OT's paradigm attempted-annihilation narrative, within the row's translation-neutral framing. The doctrinal "has God rejected Israel" register stays with the existing `gods-plan-for-israel` row (checked; cross-noted here, not duplicated). | Esther / 2026-08-23 |
| `sowing-and-reaping` *(append to existing Hosea row)* | Esth 7:10 (hanged "on the gallows that he had prepared for Mordecai"); 9:25 ("his wicked plan… should return on his own head") | The canon's most famous narrative instance of the row's proverb family (`sin`'s lexicon carries bare "reap what you sow," but Esther's narrative is not that pack's doctrine register). | Esther / 2026-08-23 |
| `remembrance-and-memorials` *(append to existing Joshua row)* | Esth 9:26–28 ("these days should be remembered and kept throughout every generation") | A feast, not a stone, as the memorial — the row's remembering-and-retelling theme institutionalized as an annual observance. | Esther / 2026-08-23 |
| `appointed-feasts` *(append to existing Leviticus row)* | Esth 9:20–32 | Purim — the one biblical feast instituted outside the law of Moses; "Purim in the Bible" searchers need it findable, with the caveat that the text presents it as imposed by the Jews on themselves, not commanded by the LORD. | Esther / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Esth 8:13 ("to avenge themselves on their enemies"); 9:5, 16 | Decree-authorized avenging narrated without moral comment; the row's standing wording concern (route users toward the vengeance-belongs-to-God texts) applies with full force. | Esther / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Esth 2:5–6; 3:8 | The living-as-foreigners register of the diaspora material (identity concealed and claimed in a foreign court), joining the row's Jeremiah 29 exile refs; the exile-history register of the same verses goes to the `exile-and-captivity` append above, per that row's own split. | Esther / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Esth 10:3 ("seeking the good of his people and speaking peace to all his descendants") | Influence held and spent for a people's good — advocacy from high position as the book's closing note. | Esther / 2026-08-23 |

Checked and declined (recorded so later threads don't re-log): `justice-and-oppression`
(Micah row) — checked per the pastoral-register routing ruling and nothing referenced:
Esther's crisis is attempted annihilation (served by the `persecuted-for-gods-word`
append above), not the row's oppression-of-the-poor / corrupt-courts register;
`lament` (Joel row) — Esth 4:1–3 is loud public mourning (sackcloth, ashes, wailing),
but the row logs the complaint-addressed-to-God register and Esther's mourning is,
uniquely, addressed to no one the text names (observation recorded for the row's
eventual curator); `drunkenness` (Isaiah row) — 1:10 "merry with wine" is
scene-setting the text does not moralize; `betrayal` (Obadiah row) — no friend-or-kin
betrayal in the book (Haman is an open enemy); `gods-plan-for-israel` (Romans row) —
considered as the preservation-theme append target and declined in favor of the
persecution row (doctrinal register kept clean; cross-noted there). Weighed and not
promoted (recorded in the book doc's motif list): the irrevocable-law device (1:19;
8:8); Haman's discontent (5:11–13 — `contentment`'s failure mode); Purim's
gifts-to-the-needy phrase (9:22 — possible future `generosity` lexicon color only).

## 2 Chronicles appends — 2026-08-23

Appended at 2 Chronicles finalize (round-3 critic approval: zero objections),
delivered with the approved book doc (`2-chronicles.md`, this directory).
Re-deduped against this file's live state in a full re-read immediately before
this append (2,472 lines at the pre-append snapshot; newest block: Esther
appends); nothing above this line was edited. Race recorded: this book drafted
`seeking-god` as a proposed NEW row, but the 1 Chronicles block — landed during
this book's critic loop — minted that row first (its rationale already cites
2 Chr 7:14 and 15:2 as kin texts), so per the whichever-book-lands-first rule
the drafted row resolved to the ref-append below; this block therefore mints
ZERO new rows. All four of the book doc's item-2 coordination rows likewise
landed during the loop (`revival-and-reformation` and `exile-and-captivity` via
the 2 Kings delivery, `davidic-covenant` via 2 Samuel, `occult-and-divination`
via 1 Samuel) and resolve to plain appends. Every target row below was
re-verified present at the pre-append read. Provenance note carried from the
book doc: of 2 Chronicles' 36 chapters only chapter 7 is witnessed in
`pipeline/fixtures/web-subset.json` (22/22 byte-identical), so chapter-7 refs
carry pinned-snapshot verification and all other refs are verified against the
current ebible.org edition (sha256 b6f55cc7…) only, as `2-chronicles.md`
discloses.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `seeking-god` *(append to the 1 Chronicles-minted row)* | 2 Chr 7:14 ("seek my face"); 15:2 ("if you seek him, he will be found by you"), 15:4, 12–15; 11:16; 12:14; 14:4, 7; 16:12; 17:3–4; 19:3; 20:3–4; 26:5; 30:19; 31:21; 34:3 | Completes the row's home-book pair — the row's own rationale cites 2 Chr 7:14 and 15:2 as the kin texts that would anchor a pack, and Brooks' key verse for this whole book is 15:2. 2 Chronicles supplies the promise texts (7:14; 15:2) and the reign-by-reign narrative test of them. Guardrail note for the eventual pack (this book's contribution, per DOCTRINAL-BASIS): 2 Chronicles states seek-and-prosper connections in the narrator's voice (26:5; 31:21); gist and lexicon must report seeking as covenant devotion met by God's presence, never as a technique for outcomes. | 2 Chronicles / 2026-08-23 |
| `revival-and-reformation` *(append to the 2 Kings-minted row)* | 2 Chr 15:8–15 (Asa's covenant "to seek the LORD... with all their heart"); 23:16–19 (Jehoiada's covenant and purge); 29:3–36 (Hezekiah's temple cleansing); 30:1–27 (the great Passover, "yield yourselves to the LORD" invitation letters); 31:1 (the pillars broken after the feast); 34:3–7, 29–33 (Josiah's purge and covenant); 35:1–19 (Josiah's Passover) | 2 Chronicles is load-bearing for this row: it carries the fullest reform narratives in Scripture — four distinct reform arcs (Asa, Jehoiada, Hezekiah, Josiah), each with the row's word-recovered / covenant-renewed / worship-purged / feast-restored shape told at greater length than the Kings parallels. | 2 Chronicles / 2026-08-23 |
| `exile-and-captivity` *(append to the 2 Kings-minted row — BORDERLINE flag and routing question left to Jesse stand; these refs do not prejudge it)* | 2 Chr 36:17–21 (the deportation with the narrator's own theology: "until the land had enjoyed its Sabbaths... to fulfill seventy years"); 33:11 (Manasseh's personal captivity in chains to Babylon — and 33:12–13, the return); 30:6, 9 (the deportations presupposed, with the promise "your brothers and your children will find compassion with those who led them captive") | Adds the exile's fullest theological summary (the land's Sabbaths, Jeremiah's seventy years — the very texts "why did God send Israel into exile" searchers need) plus the one personal captivity-and-restoration narrative in the historical books. | 2 Chronicles / 2026-08-23 |
| `davidic-covenant` *(append to the 2 Samuel-logged row)* | 2 Chr 6:16–17, 42 (the promise prayed at the dedication: "Remember your loving kindnesses to David your servant"); 7:17–18 (the promise restated in the night answer); 13:5 (given "to David forever... by a covenant of salt"); 21:7 ("a lamp to him and to his children always" — judgment stopped short of the promise); 23:3 ("as the LORD has spoken concerning the sons of David") | The temple-side Davidic-covenant texts: the promise prayed, re-spoken, preached, and operating as history's counterweight — including the covenant-of-salt phrasing searchers quote. Design note carried from the book doc: state what the text says; no messianic read-back. | 2 Chronicles / 2026-08-23 |
| `occult-and-divination` *(append to existing 1 Samuel row)* | 2 Chr 33:6 (Manasseh's sorcery, divination, witchcraft, "those who had familiar spirits and with wizards" — the Chronicler's fuller list) | The Chronicles telling of the row's 2 Kgs 21:6 royal-sponsorship case, with the practice list at its longest — and, uniquely here, followed by the practitioner's own repentance and restoration (33:12–13). | 2 Chronicles / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | 2 Chr 14:3–5; 15:16 (the queen mother's "abominable image" cut down); 24:18; 25:14–15 (the gods of the children of Seir brought home and served, "which have not delivered their own people out of your hand"); 28:2–4, 23–25 ("the gods of Damascus which had defeated him"); 33:3–7, 15; 34:3–7 | Adds the row's absurdity arguments in narrative form — Amaziah serving the gods he just defeated, Ahaz sacrificing to the gods of the army that beat him — beside the reform purges that answer them. | 2 Chronicles / 2026-08-23 |
| `the-house-of-god` *(append to existing Haggai row)* | 2 Chr 2:1–7:22 (the build → dedicate → fill arc, incl. 6:18, "will God indeed dwell with men on the earth?"); 24:4–14 (the repair); 28:24 (the doors shut); 29:3–36 (the cleansing); 34:8–13 (the repair under Josiah); 36:19, 23 (burned — and the rebuild commanded) | The row's fullest OT arc: the house built, filled with glory, repaired twice, shut, cleansed, burned, and promised again in the book's last verse. Companion to the 1 Chronicles append (site, pattern, service). | 2 Chronicles / 2026-08-23 |
| `passover` *(append to existing Exodus row)* | 2 Chr 30:1–27 (Hezekiah's Passover — kept in the second month, eaten by many "other than the way it is written" under Hezekiah's prayer, 30:18–20); 35:1–19 ("There was no Passover like that kept in Israel from the days of Samuel") | The OT's two great kept Passovers beyond Exodus 12, at full narrative length — including the pastoral texts (30:18–20) that "can I take communion if..." searchers reach for by analogy. Companions to the row's 2 Kgs 23:21–23 and Ezra 6:19–21 appends. | 2 Chronicles / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row — the row the project-wide pastoral ruling routes national justice material to)* | 2 Chr 19:5–10 (the courts charged: "nor respect of persons, nor taking of bribes"); 16:10 (Asa "oppressed some of the people" in his rage); 28:8–15 (the enslavement of kin halted at a prophet's word and the captives clothed, fed, and returned) | Adds the row's judicial-reform charter (19:5–10 is the OT's clearest judges' charge) and its one narrative of oppression reversed mid-act. Routed here, not to any `pastoral-*` id, per the project-wide register ruling. | 2 Chronicles / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | 2 Chr 20:3 ("Jehoshaphat... proclaimed a fast throughout all Judah") | The row's classic national-crisis instance: a fast proclaimed before a battle and answered by a prophet's word — historical-books companion to the row's Joel core and Esther append. | 2 Chronicles / 2026-08-23 |
| `lament` *(append to existing Joel row)* | 2 Chr 35:25 (Jeremiah's lament for Josiah; the singers' laments made "an ordinance in Israel") | Lament institutionalized: the one OT text where laments for a named person become a standing ordinance — and the verse behind "did Jeremiah write Lamentations" queries. | 2 Chronicles / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | 2 Chr 32:21 ("The LORD sent an angel, who cut off all the mighty men of valor" in the Assyrian camp) | The Chronicles telling of the row's 2 Kgs 19:35 deliverance — the same event with the officer-and-captain scope stated. | 2 Chronicles / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | 2 Chr 17:10 ("The fear of the LORD fell on all the kingdoms of the lands"); 19:7, 9 ("let the fear of the LORD be on you"; "in the fear of the LORD, faithfully, and with a perfect heart"); 14:14; 20:29 | Adds both registers in one book: the dread that restrains nations and the reverence charged on judges as their working ethic. | 2 Chronicles / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | 2 Chr 30:6 ("the remnant of you that have escaped out of the hand of the kings of Assyria"); 34:9, 21 ("those who are left in Israel and in Judah") | The vocabulary in pastoral use: letters and offerings addressed to the survivors of the Assyrian deportations — the theme as an address, not only a promise. | 2 Chronicles / 2026-08-23 |
| `slow-to-anger` *(append to existing Nahum row)* | 2 Chr 30:9 ("the LORD your God is gracious and merciful, and will not turn away his face from you if you return to him"); 36:15 (compassion sending messengers "rising up early and sending") | Adds the historical-books witnesses: the credal attributes preached in an invitation letter, and the narrator's own picture of patience before judgment ("until there was no remedy," 36:16, marks where the patience ends). | 2 Chronicles / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | 2 Chr 36:22–23 (the Cyrus proclamation: "the LORD stirred up the spirit of Cyrus"; "let him go up") | The return's opening document — the canon's hinge from exile to restoration, placed as this book's deliberate last word (and repeated as Ezra 1:1–3). | 2 Chronicles / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | 2 Chr 36:13 (Zedekiah "stiffened his neck, and hardened his heart against turning to the LORD") | The row's vocabulary applied to Judah's last king — self-hardening against a prophet's word, with no divine-agency clause in this text. | 2 Chronicles / 2026-08-23 |
| `sacrifice-and-atonement` *(append to existing Exodus row)* | 2 Chr 29:21–24 (the sin offerings "to make atonement for all Israel" — the king commands it "for all Israel") | The atonement vocabulary in reform narrative: the restored temple's first act is atonement for the whole nation, stated twice in two verses. | 2 Chronicles / 2026-08-23 |
| `priesthood` *(append to existing Exodus row)* | 2 Chr 26:16–20 (incense belongs to "the priests the sons of Aaron, who are consecrated" — the boundary enforced against a king); 29:11, 34; 31:2, 15–19; 35:2, 10–14 | Adds the office's boundary case (Uzziah's censer and the leprosy that answers it) and the working rosters of the reform chapters — the row's strongest narrative statement that the office is not the crown's. | 2 Chronicles / 2026-08-23 |
| `unequally-yoked` *(append to existing 2 Corinthians row)* | 2 Chr 19:2 ("Should you help the wicked, and love those who hate the LORD?"); 18:1–3 (the alliance with Ahab); 20:35–37 (the ship venture with Ahaziah, "the LORD has destroyed your works"); 25:7–10 (the hired army sent home: "the LORD is not with Israel") | The OT alliance narratives behind the yoking teaching — three ventures with three prices, plus the one obeyed warning. Register note: these are political/military alliances, not marriage; the row's curator should keep the registers distinct. | 2 Chronicles / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | 2 Chr 15:14–15 (the covenant oath sworn "to the LORD with a loud voice, with shouting, with trumpets" — "they had sworn with all their heart"); 36:13 (Zedekiah's broken oath, "who had made him swear by God") | A kept corporate oath at its most joyful and a broken royal oath at its most costly — both registers the row's rationale names, in one book. | 2 Chronicles / 2026-08-23 |

## Psalms delivery — 2026-08-23

Appended as one atomic block at file end to keep the append safe under concurrent
book threads; nothing above this line was edited. Sourced from the consolidated
tag-gap plan in the approved Psalms book doc (`psalms.md`, this directory; batch
critic loops closed at 7/5/5 rounds and the assembled doc's own loop closed at
round 2, all APPROVED — zero objections, fresh critic every round). Final
re-dedupe run against this file's live state immediately before this write
(2,518 lines, blocks through 2 Chronicles): all 25 append-target owner rows below
verified live under their stated owners; none of the four new ids below exists as
a row anywhere in this file or in the 131-id vocabulary at `b3f491d` (their only
prior mentions are the Proverbs block's "Held for the Psalms write — CONTINGENT"
paragraph and the Ecclesiastes block's `aging-and-old-age` hand-off, both of which
instruct this write to fold their refs in — done below, so those two contingencies
are RESOLVED by this block); the blocks landed since the assembled doc's review
(Ezekiel, 1 Kings, Acts, Ezra, 2 Kings, 1 Chronicles, Esther, 2 Chronicles) mint
nothing colliding (the Ezra/2 Chronicles `trusting-in-man` row is trusting man
instead of God — a different theme from `trustworthiness-of-scripture` below).
Superseded/withdrawn proposals recorded at the end of the block. Refs pooled
across the three batches; per the pastoral-register ruling, all national/societal
justice material routes to the Micah row, not the `pastoral-*` packs.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `slander-and-false-accusation` | Ps 7:3–5; 27:12; 31:13, 18; 35:11, 20–21; 41:5–9; 52:2–4; 55:3; 56:5; 57:4; 59:12; 64:3–8; 69:4, 12; 71:10–11, 13; 86:14; 109:2–3, 20; 119:23, 69, 161; 120:2–3; 140:3, 11 · folded Proverbs contingency refs (per that block's hold-for-Psalms instruction): Prov 10:18; 25:18; 26:20–22; 30:10 | "Falsely accused," "when people lie about you," "slander in the Bible" — a real pastoral situation-query. `honesty` covers being truthful and `pastoral-betrayal-and-marriage-crisis` covers close-relationship betrayal; being the *target* of lies has no home. | Psalms / 2026-08-23 |
| `trustworthiness-of-scripture` | Ps 12:6; 18:30; 19:7–9; 33:4; 93:5; 111:7–8; 119:86, 89–91, 138, 140, 142, 151, 160 ("All of your words are truth"); 138:2; 147:15 · folded Proverbs contingency refs: Prov 30:5–6 ("Every word of God is flawless… Don't you add to his words") | "Is God's word reliable," "God's word is flawless/pure," "the Bible is perfect" — `delight-in-the-word` and `studying-the-word` carry the loving and studying registers, not the reliability claim the Psalter states repeatedly. Cross-note: adjacent to the live Isaiah `power-of-gods-word` row (the word's own permanence and efficacy); this row is the reliability/flawlessness of what God says — the curator should confirm that boundary (or design one concept with both registers) before minting either pack. | Psalms / 2026-08-23 |
| `zion-city-of-god` | Ps 2:6; 9:11; 46:4–5; 48:1–3, 8–14; 65:1, 4; 68:16, 24, 29; 76:1–2; 78:68–69; 84:1–2, 7; 87:1–7; 102:13–16, 21; 122:1–9; 125:1–2; 126:1; 128:5; 132:13–16; 133:3; 134:3; 137:1, 5–6; 146:10; 147:2, 12–14 | "Zion in the Bible," "city of God" — a distinct, recurring Psalter theme with no home anywhere in the vocabulary or this file (re-verified at this write: no Zion/Jerusalem row exists; Heb 12:22's heavenly-Zion text rode the `angels` append, not a Zion row). One row with the whole Psalter's pooled refs, as the batch drafts proposed. | Psalms / 2026-08-23 |
| `aging-and-old-age` | Ps 71:9, 17–18 ("Don't reject me in my old age… when I am old and gray-haired, God, don't forsake me"); 92:14 · folded Proverbs contingency refs: Prov 16:31; 20:29; 17:6; 23:22 · folded Ecclesiastes hand-off refs (per that block's instruction): Eccl 12:1–7 (the canonical allegory of old age); 11:8 | "Bible verses about growing old," "strength in old age," "does God still use me when I'm old" — a real pastoral situation-query. The PR #43 id `caring-for-aging-parents` covers the *caregiver's* side only; the aging believer praying has no home. This row resolves the Proverbs block's held contingency and the Ecclesiastes block's hand-off. | Psalms / 2026-08-23 |
| `lament` *(append to existing Joel row)* | Ps 6:3, 6–7; 10:1; 13:1–2; 22:1–2; 35:17; 42:3, 9–11; 43:2; 44:23–26; 55:1–8; 60:1–3; 69:1–3, 20; 74:1, 9–11; 77:1–9; 79:5; 80:4–6; 88 (the whole psalm — the Psalter's darkest, a lament that never brightens); 89:38–46; 102:1–11 (headed "A Prayer of the afflicted"); 120:1; 123:3–4; 130:1–2; 137:1–4; 142:1–4; 143:3–4 | The Psalter is this row's largest witness, individual and communal laments side by side — exactly what the row's rationale anticipates. | Psalms / 2026-08-23 |
| `justice-and-oppression` *(append to existing Micah row)* | Ps 9:7–8, 16–20; 12:1–4, 8; 68:5–6, 10; 69:33; 72:2, 4, 12–14; 76:9; 82:2–4; 94:5–6, 20–21; 102:17, 20; 103:6; 107:41; 109:16, 22, 31; 113:7–9; 129:1–4; 135:14; 140:12; 146:7–9; 147:6 | All national/societal-scale justice material, routed here per the pastoral-register ruling this row itself records (`pastoral-refuge-and-justice` keeps only the personal-crisis register). | Psalms / 2026-08-23 |
| `idolatry` *(append to existing Micah row)* | Ps 78:58; 81:9; 96:5; 97:7; 115:3–8 ("They have mouths, but they don't speak… Those who make them will be like them"); 135:15–18 | The Psalter's two fullest idol polemics plus the first-commandment guard ("There shall be no strange god in you," 81:9). | Psalms / 2026-08-23 |
| `god-reigns` *(append to existing Isaiah row)* | Ps 2:4–6; 9:7; 10:16; 24:7–10; 29:10; 47:2, 6–8; 59:13; 66:7; 75:6–7; 93:1–2; 95:3; 96:10; 97:1; 99:1–4; 103:19; 113:4–6; 145:11–13; 146:10 ("The LORD will reign forever") | The row's rationale predicted "the enthronement psalms (Ps 93–99) will hit the same gap" — these are those refs, with the acclamation's five WEB-Psalter occurrences (9:7; 93:1; 96:10; 97:1; 99:1) among them. **Adjacency call, made deliberately at this delivery (reversible):** keep this row and Matthew's `kingdom-of-heaven` row as TWO rows, cross-notes retained on both — this row is the OT divine-kingship acclamation register; that row is Matthew's NT kingdom-announcement teaching register; collapsing them would invite the read-back the conventions bar in both directions. A concept-pack curator remains free to design one concept spanning both registers at pack time; Jesse can overturn with a word. | Psalms / 2026-08-23 |
| `messianic-prophecy` *(append to existing Zechariah row; Isaiah, Jeremiah, Daniel, and Ezekiel refs already merged)* | Ps 2:2, 6–12; 16:10; 22:1, 16–18; 40:6–8; 41:9; 45:6–7; 68:18; 69:4, 9, 21, 25; 78:2; 80:17; 82:6; 89:26–27, 35–37; 91:11–12; 95:7–11; 97:7; plus Ps 72 as the traditionally messianic royal psalm (no direct NT quotation); 102:25–27; 110:1, 4 (the NT's most-quoted psalm); 118:22–26; 132:11, 17 | The NT quotations themselves are the attributable sources, keeping the no-read-back rule intact; the row's locator design (a curated source names the passage; the engine never adjudicates) is exactly what these refs require. Boundary note carried: these Psalms appends ride whatever boundary decision resolves this row's overlap with Isaiah's `servant-of-the-lord` row. | Psalms / 2026-08-23 |
| `mortality` *(append to existing Genesis row)* | Ps 39:4–6, 11; 49:10–20; 62:9; 78:39; 89:47–48; 90:3–10; 102:3, 11, 23–24; 103:14–16; 144:3–4; 146:4 | "Every man stands as a breath"; "like the animals that perish"; "The days of our years are seventy" — the Psalter's brevity-of-life meditations join the row's Job and Ecclesiastes refs. | Psalms / 2026-08-23 |
| `vengeance` *(append to existing Genesis row)* | Ps 18:47; 28:4; 35:1–8; 58:6–10; 59:11–13; 69:22–28; 79:6, 10, 12; 83:9–17; 94:1 ("God to whom vengeance belongs"); 109:6–20; 137:7–9; 149:7–9 | The imprecatory psalms hand vengeance to God rather than take it — exactly the routing concern this row records. | Psalms / 2026-08-23 |
| `angels` *(append to existing Genesis row)* | Ps 34:7 ("The LORD's angel encamps around those who fear him"); 35:5–6; 78:49; 91:11–12; 103:20–21; 104:4; 148:2 | The encamping-angel and charge-over-you texts the row's queries reach for. | Psalms / 2026-08-23 |
| `sojourners-and-strangers` *(append to existing Genesis row)* | Ps 39:12 ("I am a stranger with you, a foreigner, as all my fathers were"); 119:19; 120:5–6; 137:4 ("How can we sing the LORD's song in a foreign land?") | The praying sojourner's own voice, alongside the row's narrative and command texts. | Psalms / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Ps 15:4 ("keeps an oath even when it hurts"); 22:25; 50:14; 56:12; 61:5, 8; 65:1; 66:13–14; 76:11 ("Make vows to the LORD your God, and fulfill them!"); 116:14, 18; 119:106; 132:2–5 | Vows made and paid in the congregation — the Psalter's worship-register witness for the row. | Psalms / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Ps 75:6–7 (promotion comes from God); 78:70–72 (David taken from the sheepfolds, shepherding "according to the integrity of his heart"); 101:1–8 (a ruler's integrity charter for court and city) | The shepherd-king and ruler's-vow texts, alongside the row's 2 Samuel and Proverbs appends. | Psalms / 2026-08-23 |
| `prosperity-of-the-wicked` *(append to existing Job row)* | Ps 73:3–12 ("For I was envious of the arrogant, when I saw the prosperity of the wicked"); 92:7; 94:3 | Psalm 73 is the Psalter's full-length wrestling with the question, resolved only in the sanctuary (73:17) — the row's own rationale already names it a canonical witness. | Psalms / 2026-08-23 |
| `unanswered-prayer` *(append to existing 2 Corinthians row)* | Ps 88:1–2, 13–14 ("LORD, why do you reject my soul? Why do you hide your face from me?"); 80:4 ("how long will you be angry against the prayer of your people?") | Psalm 88 is the Psalter's paradigm of prayer without relief — a lament that never brightens — for the row's "why doesn't God answer" queries. | Psalms / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Ps 95:8 ("Don't harden your heart, as at Meribah"); 81:11–12 ("So I let them go after the stubbornness of their hearts") | The don't-harden imperative behind Hebrews 3–4, joining the row's Exodus narrative and Proverbs self-hardening texts. | Psalms / 2026-08-23 |
| `leviathan-and-behemoth` *(append to existing Job row)* | Ps 74:13–14 ("You broke the heads of Leviathan in pieces") | The same named-figure lookup that row exists for. | Psalms / 2026-08-23 |
| `confession-of-sin` *(append to existing 1 John row)* | Ps 51:3–4 ("For I know my transgressions. My sin is constantly before me. Against you, and you only, I have sinned") | The Psalter's canonical confession text; if the row's lexicon-extension route (onto `forgiveness-of-sins`/`repentance`) is taken instead of a new id, these refs ride along there. | Psalms / 2026-08-23 |
| `slow-to-anger` *(append to existing Nahum row)* | Ps 103:8; 145:8 | The row's rationale already cites Ps 103:8 and invites sibling refs — these land them, with 145:8's second sounding of the Exodus 34:6 formula. | Psalms / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Ps 111:10 ("The fear of the LORD is the beginning of wisdom"); 112:1; 115:11, 13; 118:4; 128:1, 4; 147:11 | The Psalter's fear-of-the-LORD beatitudes and trust-summons, joining the row's Proverbs and Ecclesiastes appends. | Psalms / 2026-08-23 |
| `loving-god` *(append to existing Joshua row)* | Ps 116:1 ("I love the LORD, because he listens to my voice"); 145:20 | The pray-er's own declaration of love, the row's devotional register. | Psalms / 2026-08-23 |
| `inheritance` *(append to existing Joshua row)* | Ps 105:11; 111:6; 119:111 ("I have taken your testimonies as a heritage forever"); 135:12; 136:21–22 | Land-grant inheritance retold in praise, plus 119:111's transferred register. | Psalms / 2026-08-23 |
| `remembrance-and-memorials` *(append to existing Joshua row)* | Ps 105:5 ("Remember his marvelous works"); 111:4; 143:5 | Deliberate remembering of God's works as a practice — the row's devotional side. | Psalms / 2026-08-23 |
| `betrayal` *(append to existing Obadiah row)* | Ps 109:4–5 ("In return for my love, they are my adversaries… They have rewarded me evil for good, and hatred for my love") | Love answered with adversity — the row's personal-treachery register in the Psalter's own words. | Psalms / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | Ps 102:13–16; 106:47 ("gather us from among the nations"); 126:1–4; 147:2–3 | National-restoration texts the personal-register `restoration` concept does not carry, exactly the split this row exists to hold. | Psalms / 2026-08-23 |
| `running-from-god` *(append to existing Jonah row)* | Ps 139:7–12 ("Where could I go from your Spirit? Or where could I flee from your presence?") | The row's rationale already names Ps 139:7–10 as a kin text — these land it. | Psalms / 2026-08-23 |
| `care-for-widows` *(append to existing Ruth row)* | Ps 146:9 ("He upholds the fatherless and widow") | The LORD's own upholding of the widow, alongside the row's command and narrative anchors. | Psalms / 2026-08-23 |

Superseded and withdrawn proposals, recorded so later threads don't re-check them:
the Psalms batches' staged `lament`, `god-reigns`, and `messiah-in-the-psalms`
rows were superseded in flight by the landed Joel `lament`, Isaiah `god-reigns`,
and Zechariah `messianic-prophecy` rows (all refs delivered above as appends);
the staged alternative id `the-lords-anointed` was withdrawn (it names the live
1 Samuel row of a different register — the touch-not-the-LORD's-anointed
narrative); the staged batch-2 `idolatry` row and the staged
`justice-and-oppression-of-the-poor` id merged into the Micah rows above, the
same path Amos's identically-named staged gap took. Checked and not logged:
the Songs of Ascents as a collection (no concept home needed beyond the
psalm-by-psalm tags; the recurring "psalms of ascent" collection query is noted
in the book doc's motif lists for lexicon work).

## 1 Timothy appends — 2026-08-23

Appended as one block at file end (in the same delivery write as the 2 Timothy
block below) to keep the append atomic under concurrent book threads; nothing
above this line was edited. Sourced from the 1 Timothy staged gap file
(`rollout/gaps/1-timothy-gaps.md`) and re-deduped in full against this file's
live state immediately before this append — the staging predates most of this
file's growth (it was deduped against the early table), and the newest blocks
at this read (2 Chronicles, then a Psalms delivery that landed concurrently and
was re-read in full) collide with nothing below. Delivery-time conversions, all
per §9's append-to-existing rule: (1) the staged NEW row `caring-for-widows`
folds into the live Ruth `care-for-widows` row — same theme, near-same id, and
that row's rationale already names 1 Tim 5 as a wanted anchor (its Exodus
command anchor, James 1:27, Jeremiah, Lamentations, and Psalms refs are already
merged), so 1 Timothy contributes refs, not a duplicate id; the staged row's
distinction from `caring-for-aging-parents` (the children's duty vs. the
assembly's care of widows) is carried into the append entry. (2) The staged NEW
row `falling-away` folds into the live Judges `backsliding` row — the
Hebrews delivery merged its `warning-against-falling-away` staging there, and
that row now owns the falling-away / apostasy / drifting-from-God query family
(narrative-cycle register from Judges, warning register from Hebrews); 1 Timothy
adds the predicted-and-named register, and 2 Timothy's staged falling-away
append routes to the same row (see the 2 Timothy block below) — ONE outcome,
as the two stagings' coordination notes require. (3) The staged coordination
items resolved to live rows: `church-discipline` was minted by 2 Corinthians
(1 Cor 5, Titus 3:10–11, and 2 Thess 3 refs already merged) and the
bondservants theme lives as the Colossians `bondservants-and-masters` row (the
Ephesians `slavery-in-the-bible` staging merged there; Titus, Philemon, and
Jeremiah refs since appended), so both deliver as plain appends. (4) The
`men-and-women-in-the-church` row below survives dedupe as this delivery's one
NEW row: no women-in-ministry / men-and-women row exists anywhere in this file
by theme, and the id is not in the 131-id vocabulary — the live 1 Corinthians
`head-coverings` row is the narrower one-passage lookup its staging
anticipated as a sibling, cross-noted in-row rather than folded either way.
All append targets below were verified present under their stated owner rows,
none already carrying 1 Timothy refs (the Ruth row's "1 Tim 5" and the Titus
and 1 Thessalonians appends' "1 Tim 3:1–13" / "1 Tim 5:17" citations are those
rows' own rationale text, not appends). Rows marked *(append to existing row)*
add 1 Timothy's locations to the named row earlier in this file — read them
together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `men-and-women-in-the-church` | 1 Tim 2:8–15 | "Women in ministry" / "what does the Bible say about women teaching" / "women pastors" — among the most-searched church-practice questions, with no vocabulary home. Gist wording must stay descriptive and §4-neutral (gender roles are an explicit NON-criterion in `docs/DOCTRINAL-BASIS.md` §4): route to what the passages say (also 1 Cor 11 and 14, and Titus 2), adjudicating nothing. Cross-note: the live `head-coverings` row (1 Corinthians) is the narrower one-passage lookup for 1 Cor 11:2–16 — the curator may fold it into this broader row or keep both; decide one design before minting either. Modesty in dress (1 Tim 2:9–10) rides this row's passage rather than a separate row. | 1 Timothy / 2026-08-23 |
| `care-for-widows` *(append to existing Ruth row)* | 1 Tim 5:3–16 (the letter's longest single instruction: honor for "widows indeed," family-first duty stated twice (5:4, 8), enrollment standards for proven widows over sixty, the younger widows redirected, the assembly kept free for the truly alone) | Staged as a new `caring-for-widows` row; folds here — the row's rationale already names 1 Tim 5 as a wanted anchor, and this is the church-practice charter those "caring for widows" / "widows in the church" queries need. Register note carried from the staging: `caring-for-aging-parents` honestly covers the children's duty to parents (5:4, 8 tag there in the book doc), not the assembly's care of the widows themselves — that split is this row's substance. | 1 Timothy / 2026-08-23 |
| `backsliding` *(append to existing Judges row)* | 1 Tim 1:19–20 (faith thrust away, "made a shipwreck concerning the faith"); 4:1–3 ("in later times some will fall away from the faith"); 6:10 ("wandered from the faith" through money-love), 20–21 ("have wandered from the faith" through false knowledge) | Staged as a new `falling-away` row; folds here — the Hebrews delivery already merged its `warning-against-falling-away` staging into this row, which owns the "falling away from the faith" / "apostasy" / "my child left the faith" query family. 1 Timothy adds the predicted-and-named register: the Spirit's express advance notice (4:1) plus actual named and described departures (1:19–20; 6:10, 21). The staging's boundary stands: `pastoral-relapse-and-restoration` is the sobriety/restoration crisis register, not apostasy from the faith. 2 Timothy's refs land on this same row (see its block below). | 1 Timothy / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | 1 Tim 3:1–13 (overseer and deacon qualifications); 5:17–22 (honor, accusation, and appointment of elders) | The office-qualification texts the row's Titus append already pairs with ("With 1 Tim 3:1–13, this is where 'qualifications of an elder' queries must land") and the elder-honor text the 1 Thessalonians append cites (1 Tim 5:17) — delivered here as actual refs. Strengthens the church-leadership register beyond the row's wise-administration core. | 1 Timothy / 2026-08-23 |
| `false-teachers` *(append to existing 2 John row)* | 1 Tim 1:3–7 (the letter's founding charge: "command certain men not to teach a different doctrine"), 19–20 (Hymenaeus and Alexander); 4:1–3 (seducing spirits, lying teachers forbidding marriage and foods); 6:3–5 (teachers "destitute of the truth, who suppose that godliness is a means of gain"), 20–21 (what "is falsely called knowledge") | The row explicitly invites sibling appends; 1 Timothy contributes the different-doctrine charge that occasions a whole letter, plus the godliness-for-profit profile beside Titus's dishonest-gain teachers. The staged reconcile-ids note is resolved: every sibling false-teaching staging has folded into this one row. | 1 Timothy / 2026-08-23 |
| `supporting-gospel-workers` *(append to existing 3 John row)* | 1 Tim 5:17–18 ("The laborer is worthy of his wages" — double honor for elders who labor in word and teaching) | Paul citing Scripture itself ("You shall not muzzle the ox…" beside the laborer saying) for paying laboring elders — the congregational-duty companion to the row's 1 Cor 9 argument. | 1 Timothy / 2026-08-23 |
| `temptation` *(append to existing Genesis row)* | 1 Tim 6:9 ("those who are determined to be rich fall into a temptation, a snare") | A named temptation-mechanism text (the will-to-be-rich as the snare's trigger) for the row's plain-"temptation" anchor set. | 1 Timothy / 2026-08-23 |
| `church-discipline` *(append to existing 2 Corinthians row)* | 1 Tim 5:19–21 (two-or-three-witness accusations against elders; those who sin reproved publicly, "that the rest also may be in fear"; no prejudice, no partiality); 1:20 (Hymenaeus and Alexander "delivered to Satan, that they might be taught not to blaspheme") | Adds the elder-specific due-process rules — the case the row's 1 Cor 5 / 2 Cor / Titus / 2 Thess refs don't cover — plus an apostolic hand-over-to-Satan case naming its corrective aim. | 1 Timothy / 2026-08-23 |
| `bondservants-and-masters` *(append to existing Colossians row)* | 1 Tim 6:1–2 (bondservants counting masters "worthy of all honor" so the doctrine is not blasphemed; believing masters served the more, "because those who partake of the benefit are believing and beloved") | The reciprocal-duties register the row documents, with the believing-master case stated more fully than anywhere else in the row's refs. The row's never-read-as-endorsement wording caveat applies unchanged. | 1 Timothy / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-derive): modesty in
dress (1 Tim 2:9–10) → rides the `men-and-women-in-the-church` row's passage
above, not a separate row. Prayer for rulers (2:1–2) → covered:
`praying-for-leaders` (this is its source text; tagged on ch. 2). Contentment /
love of money (6:6–10) → covered: `contentment` (its lexicon carries "godliness
with contentment; love of money"). The mystery of godliness (3:16) → covered:
`incarnation` (PR #43 id, used on ch. 3, recorded in the book doc's Decisions
record). Wine and health (5:23) → a curiosity verse, not a search-scale theme.

## 2 Timothy appends — 2026-08-23

Appended in the same delivery write as the 1 Timothy block above; nothing above
that block was edited. Sourced from the 2 Timothy staged gap file
(`rollout/gaps/2-timothy-gaps.md`) and re-deduped in full against this file's
live state immediately before this append (same read as the 1 Timothy block:
newest blocks 2 Chronicles and the concurrently-landed Psalms delivery, which
collide with nothing below). Delivery-time conversions, per §9's
append-to-existing rule: (1) the staged NEW row `last-days` — flagged
BORDERLINE by its own staging ("reviewer may fold it into a broader eschatology
treatment") — folds into the live Daniel `end-times` (or `time-of-the-end`) row,
whose rationale already claims "the latter days" vocabulary and the
"end times in the Bible" / "signs of the end times" query family this staging
named; 2 Timothy contributes the last-days corruption-catalog register as refs,
not a duplicate id, and the staging's `day-of-the-lord` boundary is already
carried by that row's own merge note against the Obadiah row. (2) The staged
`discipleship` append (targeted at a then-staged Philippians row) lands on the
live Matthew `discipleship` (following Jesus) row, where the Philippians staging
merged — the imitation/mentoring register its Philippians, Titus,
2 Thessalonians, and 1 Thessalonians appends carry; the staging's optional
paired-letter 1 Timothy refs are included, attributed in-row. (3) The staged
`falling-away` append (targeted at 1 Timothy's staged row) routes with
1 Timothy's refs to the live Judges `backsliding` row — the ONE outcome the two
stagings' coordination notes require (see the 1 Timothy block above).
(4) The `false-teachers` append executes as staged. All targets verified
present under their stated owner rows, none already carrying 2 Timothy refs.
2 Timothy mints NO new row. Rows marked *(append to existing row)* add
2 Timothy's locations to the named row earlier in this file — read them
together with that row.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `end-times` *(append to existing Daniel row)* | 2 Tim 3:1–5 ("in the last days, grievous times will come" — the corruption catalog: lovers of self and money and pleasure, "holding a form of godliness but having denied its power"); 4:3–4 (the time coming when sound doctrine is refused for itching ears) | Staged as a BORDERLINE new `last-days` row; folds here — the row already owns the "end times in the Bible" query family and Daniel's "latter days" vocabulary, and "the last days" / "perilous times" phrasings are the same family's NT-epistle form. 2 Timothy adds the moral-corruption-catalog register (what the last days look like in people) beside Daniel's appointed-period register; kin texts the staging named for later threads: 1 Tim 4:1–3 (whose refs ride the `backsliding` row per the 1 Timothy block), 2 Pet 3:3, Jude 1:18. The teacher-side of 4:3–4 rides the `false-teachers` append below — the two rows partition the passage's registers rather than competing. | 2 Timothy / 2026-08-23 |
| `false-teachers` *(append to existing 2 John row)* | 2 Tim 2:16–18 (word-battles eating "like gangrene" — Hymenaeus and Philetus: "saying that the resurrection is already past"); 3:6–9 (deceivers who "creep into houses," the Jannes-and-Jambres pattern and its limit); 4:3–4 (itching ears heaping up teachers "after their own lusts," turning aside to fables) | The row explicitly invites sibling appends; 2 Timothy adds the spreading-error image (gangrene), a named doctrinal error with named teachers, the predator profile, and the demand-side text — hearers who collect the teachers they want. | 2 Timothy / 2026-08-23 |
| `discipleship` *(append to existing Matthew row)* | 2 Tim 2:2 ("commit the same things to faithful men who will be able to teach others also" — the classic succession/mentoring text, and the strongest anchor the row has); 1:13 (the pattern of sound words held "which you have heard from me"); 3:10, 14 (a followed teacher, a known source: "knowing from whom you have learned them"); paired-letter refs included per the staging's option: 1 Tim 1:2, 18 (the true child in faith, the instruction committed); 4:11–16 (the young minister's charge and example) | Adds the mentoring chain's four-generation text (Paul → Timothy → faithful people → others, 2:2) to the row's imitation/mentoring register — the side the Philippians, Titus, 2 Thessalonians, and 1 Thessalonians appends carry. "Discipling someone," "spiritual mentor," "passing on the faith" queries land exactly here. | 2 Timothy / 2026-08-23 |
| `backsliding` *(append to existing Judges row)* | 2 Tim 1:15 ("all who are in Asia turned away from me"); 2:17–18 (faith overthrown by spreading error); 4:10 (Demas, "having loved this present world") | Staged as an append to 1 Timothy's staged `falling-away` row; routed here with 1 Timothy's refs — the Judges `backsliding` row owns the falling-away query family (see the 1 Timothy block above for the routing record). 2 Timothy adds the named-desertion register: a region turned away, faith overthrown by teaching, and one co-worker's world-love departure. | 2 Timothy / 2026-08-23 |

Checked and not logged (recorded so later threads don't re-derive): Scripture's
inspiration and use (2 Tim 3:15–17) → covered: `studying-the-word` (tagged on
chs. 2 and 3) — and the word's own-permanence register is the live Isaiah
`power-of-gods-word` row, which needs no 2 Timothy refs (3:15–17 is the
reader's-use register). Enduring hardship / persecution (1:8; 2:3; 3:12) →
covered: `suffering-for-christ` (tagged on chs. 1–3). The crown of
righteousness (4:8) → covered: `heavenly-reward` ("crown" is in its lexicon).
Ministerial loneliness / abandonment (4:9–16) → covered: `loneliness` (tagged
on ch. 4; the desertion facts also ride the `backsliding` append above as
departures, a different register). God's gift of repentance (2:25) → covered:
`repentance`. Fan into flame your gift (1:6) → covered: `spiritual-gifts`.

## Nehemiah appends — 2026-08-23

Appended at Nehemiah finalize (round-4 critic approval: zero objections; rounds
1–3 rejected with 7/1/2 objections, all resolved), delivered with the approved
book doc (`nehemiah.md`, this directory). Re-deduped against this file's live
state in a full re-read immediately before this append (2,696 lines at the
final read; newest blocks 1 Timothy and 2 Timothy — their `backsliding` and
`leadership` ref-appends land compatibly on the same Judges and Genesis rows
this block also appends to, with no routing change; their one new row,
`men-and-women-in-the-church`, is a different theme). **No new rows** — every
entry below is a ref-append to a landed row, including three that began as
coordination notes with sibling drafts and convert to ordinary appends now that
the Ezra and 2 Kings deliveries are live (`opposition-to-gods-work`,
`exile-and-captivity`, `revival-and-reformation`). Provenance note carried from
the book doc: Nehemiah 8 is witnessed complete (18 verses) in
`pipeline/fixtures/web-subset.json` and byte-matches the current extraction, so
ch-8 refs carry pinned-snapshot verification; every other Nehemiah ref and
quoted fragment below is verified against the current ebible.org edition
(sha256 b6f55cc7…) only, as `nehemiah.md` discloses.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `justice-and-oppression` *(append to existing Micah row)* | Neh 5:1–13 (fields, vineyards, and houses mortgaged in famine; "we bring our sons and our daughters into bondage" 5:5; usury confronted — "You exact usury, everyone of his brother" 5:7 — and restoration sworn and performed 5:11–13) | The project-wide pastoral-register ruling routes exactly this national-scale economic-oppression material here, never to `pastoral-*` ids. Nehemiah 5 adds the row's remediation register: oppression not only denounced but reversed by a governor, under oath, with restitution. | Nehemiah / 2026-08-23 |
| `fear-of-the-lord` *(append to existing Joshua row)* | Neh 5:9 ("Shouldn't you walk in the fear of our God because of the reproach of the nations, our enemies?"); 5:15 ("I didn't do so, because of the fear of God"); 7:2 ("a faithful man and feared God above many"); 1:11 ("your servants who delight to fear your name") | Nehemiah gives the row its ethics-and-office register: the fear of God as the stated reason for refusing exploitation and for a leadership appointment. | Nehemiah / 2026-08-23 |
| `fasting` *(append to existing Joel row)* | Neh 1:4 ("I fasted and prayed before the God of heaven"); 9:1 ("assembled with fasting, with sackcloth, and dirt on them") | Personal and corporate penitential fasts, both narrated with their occasion and outcome. | Nehemiah / 2026-08-23 |
| `confession-of-sin` *(append to existing 1 John row)* | Neh 1:6–7 ("I confess the sins of the children of Israel… I and my father's house have sinned"); 9:2–3, 33 ("confessed their sins and the iniquities of their fathers"; "we have done wickedly") | Completes the Ezra–Nehemiah pair of paradigm corporate confessions; Neh 1 adds the intercessor confessing on the nation's behalf from a distance. | Nehemiah / 2026-08-23 |
| `oaths-and-vows` *(append to existing Genesis row)* | Neh 5:12–13 (an oath taken with the priests called in, the shaken-out lap as enacted sanction); 10:29 ("entered into a curse and into an oath, to walk in God's law"); 13:25 ("made them swear by God") | Nehemiah's reform instrument of choice is the sworn oath — three distinct scenes, including a covenant-scale one. | Nehemiah / 2026-08-23 |
| `remnant` *(append to existing Micah row)* | Neh 1:2–3 ("the Jews who had escaped, who were left of the captivity"; "The remnant who are left of the captivity there in the province are in great affliction and reproach") | Phrase witness: the book opens by naming the post-exilic community "The remnant" (1:3). | Nehemiah / 2026-08-23 |
| `leadership` *(append to existing Genesis row)* | Neh 1:4–11 with 2:4–5 (the praying leader — months of intercession before one request); 2:11–18 (inspect first, speak after); 4:13–20 (organize, encourage, station yourself); 5:14–18 (rights refused for the people's sake); 13:6–31 (reform against entrenched interests) | Nehemiah is the OT's most-queried leadership narrative ("Nehemiah leadership" is a standing search family); these refs give the row its governance register alongside its existing material. | Nehemiah / 2026-08-23 |
| `the-house-of-god` *(append to existing Haggai row)* | Neh 10:32–39 (the temple-service pledges, ending "We will not forsake the house of our God"); 13:4–14 ("Why is God's house forsaken?" — storerooms cleansed, tithes and duties restored) | The vow and its breach-and-repair story are the theme's post-exilic continuation of the row's Haggai/Ezra material. | Nehemiah / 2026-08-23 |
| `appointed-feasts` *(append to existing Leviticus row)* | Neh 8:13–18 (the feast of the seventh month rediscovered by study and kept in temporary shelters "as it is written," unmatched "since the days of Joshua the son of Nun") | The row's Feast-of-Tabernacles queries gain their restoration narrative — the feast kept again after long neglect. Fixture note: these refs are in the pinned-verified chapter 8. | Nehemiah / 2026-08-23 |
| `slow-to-anger` *(append to existing row)* | Neh 9:17 ("a God ready to pardon, gracious and merciful, slow to anger, and abundant in loving kindness"); 9:31 ("you didn't make a full end of them… for you are a gracious and merciful God") | The Exodus 34 formula quoted inside Israel's own confession — a phrase witness the row should carry. | Nehemiah / 2026-08-23 |
| `restoration-of-israel` *(append to existing Obadiah row)* | Neh 1:8–9 (the scatter-and-gather promise pleaded); 2:17 with 6:15–16 (the reproach removed as the wall rises); 11:1–2; 12:43 (the holy city repopulated and its joy heard far away) | Modest-confidence refs: the wall narrative as lived national restoration, complementing the row's prophetic texts and the Ezra append's return narrative. | Nehemiah / 2026-08-23 |
| `backsliding` *(append to existing Judges row)* | Neh 9:26–28 (the recited relapse cycle: "But after they had rest, they did evil again before you," with the returning-and-crying turn of 9:28); 13:4–31 read against ch. 10's covenant — sworn terms found broken, family by family, on Nehemiah's return (temple purity 13:4–9 vs 10:39; tithes 13:10–13 vs 10:35–39; Sabbath 13:15–22 vs 10:31; marriages 13:23–27 vs 10:30) | The row's register is exactly this — "the corporate relapse cycle" — and Nehemiah supplies both its liturgical statement (9:26–28) and its starkest narrative instance: a written, sealed covenant found violated within the same book. | Nehemiah / 2026-08-23 |
| `holy-spirit` *(append to existing Luke row — the base row, not the John append to it)* | Neh 9:20 ("You gave also your good Spirit to instruct them"); 9:30 ("testified against them by your Spirit through your prophets") | Modest-confidence OT refs for the row's general who-is-the-Spirit family: the Spirit as instructor and as the voice behind the prophets, witnessed in Israel's own confession. | Nehemiah / 2026-08-23 |
| `priesthood` *(append to existing Exodus row, beside the Ezra 2:61–63 refs)* | Neh 7:63–65 (priestly families unable to prove descent, "deemed disqualified and removed from the priesthood," barred from the most holy things "until a priest stood up to minister with Urim and Thummim") | The genealogical-qualification register — Nehemiah 7 preserves the same roll as Ezra 2, so these refs land beside that block's parallel append rather than duplicating a new row. | Nehemiah / 2026-08-23 |
| `hardness-of-heart` *(append to existing Exodus row)* | Neh 9:16–17 ("behaved proudly, hardened their neck, didn't listen to your commandments"; "but hardened their neck, and in their rebellion appointed a captain to return to their bondage"); 9:29 ("turned their backs, stiffened their neck, and would not hear") | The national confession's hardened/stiffened-neck refrain is the row's self-hardening side spoken corporately — exact vocabulary kin to the row's Proverbs append (Prov 29:1) and 2 Chronicles append (2 Chr 36:13). | Nehemiah / 2026-08-23 |
| `courage` *(append to existing Esther row)* | Neh 6:11 ("Should a man like me flee? Who is there that, being such as I, would go into the temple to save his life? I will not go in."); with 6:9, 13 (the stand made under a campaign of fear, and the sin it refuses) | Fits the row's costly-courage register and, like Esther's, is answered by no recorded divine word. Register caveat for the curator, recorded per the Nehemiah critic loop: this courage is prayer-entwined (6:9) — not disqualifying by the row's own roadmap, which names Daniel 3 and 6 as intended appends, and Daniel 6's courage is precisely the courage to keep praying. | Nehemiah / 2026-08-23 |
| `unequally-yoked` *(append to existing 2 Corinthians row, beside the Ezra refs)* | Neh 10:30 ("that we would not give our daughters to the peoples of the land, nor take their daughters for our sons"); 13:23–27 (the confrontation, with the Solomon argument: "Nevertheless foreign women caused even him to sin") | Extends the Ezra append's witness (pledge, breach, and the argument from Solomon) under that append's own caveat, which governs these refs identically: covenant-national background texts, never a direct template for the modern marrying-a-non-believer question. | Nehemiah / 2026-08-23 |
| `opposition-to-gods-work` *(append to existing Ezra row)* | Neh 2:10, 19 (grief and ridicule at Israel's welfare sought); 4:1–3, 7–8, 11 (mockery escalating to armed conspiracy); 6:1–14, 19 (the Ono ambush, the open letter, the hired prophet, letters "to put me in fear") | The row's own rationale reserved this: "Nehemiah will hit the same gap hard (the Sanballat material) — logged now so that thread can append rather than mint." These are those refs — the full opposition playbook (ridicule, conspiracy, rumor, hired prophecy, intimidation) against a work "done by our God" (6:16). | Nehemiah / 2026-08-23 |
| `exile-and-captivity` *(append to existing 2 Kings row)* | Neh 1:2–3 ("who were left of the captivity"); 7:6 ("who went up out of the captivity"); 9:36–37 ("Behold, we are servants today" — the exile's afterlife under foreign kings, in the land itself) | The row's community-named-by-its-captivity register, plus 9:36–37's distinctive note: servitude persisting inside the returned land. The row's BORDERLINE routing call (separate id vs `sojourners-and-strangers` extension) is Jesse's; these refs land under whichever routing is chosen. | Nehemiah / 2026-08-23 |
| `revival-and-reformation` *(append to existing 2 Kings row)* | Neh 8:1–12 (the word read and understood); 8:13–18 (a feast restored from the text); 9:1–3, 38 (confession issuing in a written covenant); 10:28–39 (the reform spelled into practice); 13:4–31 (reform renewed against relapse) | Ezra–Nehemiah is the row's post-exilic wing (the Ezra refs already land here): Nehemiah 8–10 is Scripture's fullest word-driven corporate renewal sequence — reading, understanding, weeping, feasting, confessing, covenanting — and ch. 13 adds the row's sober coda: reform requires re-reforming. | Nehemiah / 2026-08-23 |

**Checked and declined for Nehemiah (recorded so later threads see the calls were deliberate):** `lament` (Neh 1:4/9:1 are penitential, not the complaint-to-God register); `idolatry` (9:18's molded calf is historical recital only); `governing-authorities` (the king's favor is setting, not submit-honor-pray teaching); `counsel-and-advisers` (5:7's "consulted with myself" is deliberation); `empowered-by-the-spirit` (9:20, 30 are instruction/testimony, routed to `holy-spirit` above); `end-times` (no material); `persecuted-for-gods-word` (ch. 6 targets a governor-builder; routed to `opposition-to-gods-work` above); `receiving-correction` (9:29–30 is the failure mode); a `singing`/church-music row (Neh 12's choirs are honestly carried by the live `worship`/`praise`/`thanksgiving` concepts — no row needed).

**Correction note (2026-08-25, Batch 1 tag-application editor, per §9 append-only protocol).** The `angels` row's Hebrews append (log line 1341) quotes Heb 1:14 as "ministering spirits, sent out to do service" — an erratum: the WEB engwebp text reads "serving spirits" (verified against the VPL source and against the delivered hebrews.md, whose prose carries the WEB wording). The review doc and the applied display tags follow the WEB text; the row itself is left unmodified per the append-only rule.

## Apologetics concept-map appends — 2026-08-25

New rows from the approved apologetics concept-to-scripture map
(`/mnt/project-files/research/apologetics-tags/apologetics-concept-map.md`,
29 concepts / 216 anchors; integration-deduped, never-mint-twice audited
against the 131 merged ids, the review's 162 proposals, and this log). These
ids are NOT in the adopted display vocabulary; rows are logged here per §9 so
the display side can find them once the engine-side path (fixtures →
gauntlet → Jesse's PR) rules on each. Per-anchor WEB quotes, provenance
(pinned vs current-edition), justifications, and declined refs live in the
map — not repeated here. The five conditional ids carry their mint-vs-extend
call for Jesse inline.

| Suggested concept id | Where encountered (Book ch:vv) | Why a search user would want it | Logged by (book/date) |
|---|---|---|---|
| `creation-testifies` | Ps 19:1-2, 3; Rom 1:19-20; Acts 14:16-17; 17:26-27; Job 12:7-9; Ps 8:3-4 | "Does nature prove God" / "general revelation" — creation as God's ongoing witness to every person, leaving all without excuse. Distinct from `creation` (the act of making) and from `those-who-never-heard` (which owns the fate question and already carries Rom 1:19-20 on the display side; deliberate dual-anchor design, Jesse's boundary call). | apologetics-map / 2026-08-25 |
| `design-in-creation` | Prov 3:19-20; Ps 104:24; 139:13-14; Isa 45:18; Jer 33:25; Job 38:4, 33 | "Design in creation" / fine-tuning-family queries land here via lexicon; the id names what the texts teach (wisdom, order, fixed ordinances, deliberate forming) — not the modern argument, and no anchor claims fine-tuning physics. Not covered by `creation` (act, not orderedness) or `wisdom-from-god` (wisdom for living). | apologetics-map / 2026-08-25 |
| `jesus-the-only-way` | John 14:6; Acts 4:12; 1 Tim 2:5-6; John 3:36; 10:9; 1 John 5:11-12; Matt 7:13-14; Acts 17:30-31; Isa 45:21-22 | "Is Jesus the only way" / "what about other religions" — salvation in Christ alone: one way, one saving name, one mediator. The single most-asked exclusivity question; no vocabulary home (`salvation` is broader and doesn't carry the only-ness). Isa 45:21-22 is cross-linked with the `no-other-god` register by recorded boundary, not duplicated. | apologetics-map / 2026-08-25 |
| `no-other-gospel` | Gal 1:8; 2 Cor 11:4, 13-14; Jude 1:3; Rev 22:18-19; Deut 4:2; Prov 30:6 | "Another gospel" / "new revelation" — the received gospel is final; any different good news, "even an angel from heaven," is rejected. Load-bearing for LDS/new-revelation conversations; `false-teachers` (row above) covers the deceiver, not the finality-of-the-message doctrine. | apologetics-map / 2026-08-25 |
| `why-god-allows-suffering` | Job 1:21; 42:2, 5; Gen 50:20; Rom 8:18, 28*; 2 Cor 4:17-18; 1 Pet 4:19; Luke 13:2-5; John 9:2-3; Rev 21:4* | "Why does God allow suffering" — the theodicy umbrella: Scripture's own answers, and its refusals to answer. The pastoral suffering concepts serve the sufferer; nothing serves the why question itself. (*Rom 8:28 and Rev 21:4 are cross-lists — display ownership stays with `remembered-all-things-for-good` and `new-heaven-and-earth`; pack-anchor vs lexicon-pointer is Jesse's call, map Decision 15.) | apologetics-map / 2026-08-25 |
| `giving-an-answer` (conditional) | 1 Pet 3:15; Col 4:6; Acts 17:2-3; 26:25; 2 Cor 10:5; Phil 1:7, 17; Titus 1:9 | "Defending your faith" / "apologetics in the Bible" — readiness to give a gentle, reasoned answer for the hope of the gospel. Conditional mint: check lexicon-extension of `sharing-your-faith` first; minting case is the reasoned-defense register distinct from evangelism. Jesse's call. | apologetics-map / 2026-08-25 |
| `honor-the-son` (conditional) | John 5:22-23; 20:28-29; Phil 2:9-11; Heb 1:6; Rev 5:13; Matt 14:33; 28:9, 17 | "Should we worship Jesus" — the Father wills that all honor the Son as they honor the Father; the risen Jesus rightly receives worship. Conditional mint: may instead be a lexicon/anchor extension of `deity-of-christ`; minting case is the devotional-practice-shaped query family vs identity-shaped deity queries. Jesse's call. | apologetics-map / 2026-08-25 |
| `the-breath-of-life` (conditional) | Gen 2:7; Eccl 12:7; Job 32:8; Zech 12:1; Matt 10:28; 2 Cor 4:16, 18 | "Do humans have souls" / "what happens to the spirit at death" — humans live by God-breathed spirit, more than dust, distinct from the body and returning to God. Conditional mint: the brief-required extend-`image-of-god` check is surfaced, not silently made; recommendation is mint (distinct substance and query family); if Jesse rules extend, all anchors move unchanged. Takes no position on dichotomy/trichotomy. | apologetics-map / 2026-08-25 |
| `the-first-and-the-last` (conditional) | Isa 41:4; 44:6; 48:12; Rev 1:8, 17-18; 2:8; 21:6; 22:12-13, 20 | "Alpha and Omega" — the divine self-title of Yahweh in Isaiah borne by the risen Jesus in Revelation; a title-locator id (precedent: `christ-the-cornerstone`, the `the-branch` row). Conditional mint: possibly folds into `deity-of-christ`; one design call, Jesse's. Isa 44:6 is a deliberate dual with the `no-other-god` register (each concept claims its half of the verse). | apologetics-map / 2026-08-25 |
| `virgin-birth` (conditional) | Matt 1:18, 20, 22-23, 25; Luke 1:34-35; Isa 7:14; Gal 4:4 | "Virgin birth" — conceived by the Holy Spirit, born of the virgin Mary; doctrinal core point 3 names it separately and the query family is distinct. Conditional mint: existing `incarnation` may cover by lexicon extension; mint-vs-extend surfaced to Jesse per the brief. | apologetics-map / 2026-08-25 |

## Apologetics gap-row disposition — PR #51 merge (2026-08-25)

The ten rows of the "Apologetics concept-map appends — 2026-08-25" block above
were ruled on by the engine-side path the block anticipated. **Nine of the ten
ids were minted and merged to main in PR #51** (merge caf9fe3, 2026-08-25;
fixtures-first, all ADMIT): `creation-testifies`, `design-in-creation`,
`jesus-the-only-way`, `no-other-gospel`, `why-god-allows-suffering`,
`giving-an-answer`, `honor-the-son`, `the-breath-of-life`,
`the-first-and-the-last` — each is now merged engine vocabulary
(`ontology/concepts/*.yaml` on main) and taggable under CONVENTIONS §5/§11.1.
The display side applied them the same day (46 adds across 20 book docs; see
each doc's "New-mint tag application after PR #51 merge (2026-08-25)" Decisions
entry), with skips recorded per doc where a candidate failed the cap, the
presence bar, the verified-quote rule, or a recorded cross-list ownership
(notably: Job 1, Gen 50, Rom 8, Deut 4 cap-full; Isa 45:21-22 as a
later-revelation read-back guard; Matt 10:28, Isa 48:12, Rev 2:8, Rev 22:18-19
no verified quote; Rev 21:4 owned by `new-heaven-and-earth`; Zech 12:1 and
Jer 33:25 presence bar; Prov 30:6 and Jude 1:3 carried by sitting tags;
Titus 1:9 per the row's own low-weight caveat). **`virgin-birth` was NOT
minted** — PR #51 records it as a corpus-blocked deferral (its anchor chapters
are outside the current corpus; pending measured-gap fixture shipped, mint-vs-
extend-`incarnation` decision D11 deferred to the corpus-expansion PR) — so its
row above stays open and its chapters stay untagged. PR #51 also minted two
movement master concepts (`mormon-evangelism`, `jehovahs-witness-evangelism`)
that never had gap rows here: they are query-routing use-case concepts and are
deliberately NOT display-tagged on any chapter — a chapter does not "teach" a
movement dialogue, so the honest-presence bar excludes them by design.
