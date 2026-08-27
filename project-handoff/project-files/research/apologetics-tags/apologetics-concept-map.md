# Apologetics concept-to-scripture map

Integrated deliverable, 2026-08-25. Merged by the integration editor from four
domain drafts (A: creation & the knowable God; B: suffering & resurrection;
C: Scripture & the only way; D: the Jesus of the Bible), drafted against
`apologetics-scoping-brief.md` and `apologetics-existing-ids.json`.

**Purpose.** One map from apologetics concepts to the WEB passages that
honestly teach them, feeding (a) this map document, (c) engine-side concept
packs (fixtures-first, gauntlet-gated, merged only by Jesse's PR), and — only
after (c) merges — (b) display tags on the 66 book docs.

**Sources of truth and provenance.** The WEB is the sole authoritative text;
every quote below is word-for-word WEB, never KJV/ESV, never from memory.
Per-anchor provenance is recorded honestly: **pinned** = verified verbatim
against `pipeline/fixtures/web-subset.json` (generated from the pinned
engwebp source, sha256 `3458ca34…`); **current-edition** = verified against
the live ebible.org `engwebp_vpl.txt` (sha256 `71ea1ce6…`, extracted from
the downloaded archive `engwebp_vpl.zip`, sha256 `b6f55cc7…`). The live edition
HAS drifted from the pin (verified 2026-08-25; `npm run fetch:sources`
refuses it by checksum; the re-pin is a staged, blocked PR —
`docs/web-repin-staged.md`), so current-edition verification is never claimed
as pinned, and every current-edition quote re-checks when the re-pin lands.

**Relationship to the two tag layers.** Display tags on book docs may use
only EXACT ids from the merged vocabulary (`ontology/concepts/*.yaml` on
main, currently 131 ids). Consequence: **no new or pending id in this map can
land on a book doc until its concept pack has merged to main via the
engine-side path** — deliverable (b) is downstream of (c). Engine-side,
golden-fixture assertions on verses outside the pinned fixture corpus are
corpus-blocked while `docs/corpus-payload-dependency.md` reads BLOCKED; they
ship `status: "pending"` with activation notes (Decision 20).

**Reuse-first policy.** Per the concept-curation skill and G4: every draft
read the existing packs and the 162 pending tag-gap rows before proposing
anything; extensions beat mints; no pending id is ever double-minted; each
genuinely new id below sits behind a recorded reuse check, and the
conditional ones behind an explicit mint-vs-extend call surfaced to Jesse.

**Totals (recounted after integration dedupe):** **29 concepts, 216
anchors** (100 pinned, 116 current-edition). By case: 7 EXISTING-extension
(48 anchors), 12 PENDING-TAG-GAP (90), 5 NEW-MINT (40), 5 NEW-MINT-conditional
(38). Raw draft total was 31 entries / 224 anchors; integration removed 2
duplicate concept entries and 8 duplicate anchors (see the integration log).

**Spot-check (integration pass).** 15 quotes re-verified against the
witnesses across all four drafts (A: Ps 19:1-2, Acts 14:16-17, Gen 2:7,
Job 41:33-34; B: Job 1:21, Ps 73:16-17, Dan 12:2; C: 2 Tim 3:16-17,
Isa 40:8, 1 Pet 3:15; D: John 8:58, Isa 43:10, Mal 3:6, Num 23:19; plus
Acts 2:31-32 for the merged resurrection anchor): **15/15 exact matches**,
each against the witness its draft claimed (pinned fixture or current
edition). No draft required full re-verification.

---

## Summary table

| Concept id | Case | Domain | Anchors |
|---|---|---|---|
| `creation` | EXISTING-extension | A | 8 |
| `deity-of-christ` | EXISTING-extension | D | 11 |
| `grace-not-earned` | EXISTING-extension | D | 6 |
| `image-of-god` | EXISTING-extension | A | 4 |
| `resurrection` | EXISTING-extension | B+D | 10 |
| `those-who-never-heard` | EXISTING-extension | A+C | 4 |
| `trinity` | EXISTING-extension | D | 5 |
| `conscience` | PENDING-TAG-GAP | A | 6 |
| `false-prophets` | PENDING-TAG-GAP | C | 9 |
| `gods-unchanging-nature` | PENDING-TAG-GAP | D | 6 |
| `i-am-sayings` | PENDING-TAG-GAP | D | 5 |
| `leviathan-and-behemoth` | PENDING-TAG-GAP | A | 6 |
| `no-other-god` | PENDING-TAG-GAP | D | 11 |
| `power-of-gods-word` | PENDING-TAG-GAP | C | 8 |
| `prosperity-of-the-wicked` | PENDING-TAG-GAP | B | 7 |
| `resurrection-of-the-dead` | PENDING-TAG-GAP | B | 9 |
| `suffering-of-the-righteous` | PENDING-TAG-GAP | B | 7 |
| `supremacy-of-christ` | PENDING-TAG-GAP | D | 7 |
| `trustworthiness-of-scripture` | PENDING-TAG-GAP | C | 9 |
| `creation-testifies` | NEW-MINT | A | 7 |
| `design-in-creation` | NEW-MINT | A | 7 |
| `jesus-the-only-way` | NEW-MINT | C | 9 |
| `no-other-gospel` | NEW-MINT | C | 7 |
| `why-god-allows-suffering` | NEW-MINT | B | 10 |
| `giving-an-answer` | NEW-MINT-conditional | C | 8 |
| `honor-the-son` | NEW-MINT-conditional | D | 8 |
| `the-breath-of-life` | NEW-MINT-conditional | A | 6 |
| `the-first-and-the-last` | NEW-MINT-conditional | D | 9 |
| `virgin-birth` | NEW-MINT-conditional | D | 7 |

---

## Integration log — overlaps resolved

1. **`those-who-never-heard` (A + C) — merged into ONE entry.** Both workers
   proposed extensions of the same existing id. C's two proposed anchors
   (Acts 17:26-27; Acts 14:16-17) were the same texts A proposed — true
   duplicates dropped, justifications and sources merged. The merged entry
   carries both extension registers: A's general-revelation anchors + fairness
   lexicon ("is God fair to those who never heard") and C's pack-register
   additions + the related edge to `jesus-the-only-way`.
2. **`resurrection` (B + D) — B owns the decision; D's entry merged, not
   kept.** Worker B resolved the resurrection scoping as one family decision
   (extend existing `resurrection` for the bodily-evidence register; pending
   `resurrection-of-the-dead` takes the general resurrection; no
   `witnesses-of-the-resurrection` mint). Worker D's coordination-only
   bodily-resurrection set minted nothing; five of its six anchors were
   already in B's set (same, wider, or — in the John 2 case — deliberately
   narrowed spans: B's "John 2:19, 21" drops v20, where D had 2:19-21) and
   were dropped as duplicates;
   the sixth widened B's Acts 2:32 anchor to Acts 2:31-32 (adding the "his
   flesh didn't see decay" clause, re-verified against the pinned fixture at
   integration). One entry survives, under Domain B.
3. **Rom 1:19-20 / Rom 2:14-16 / Acts 14:16-17 / Acts 17:26-27 dual-anchor
   family** — kept deliberately as one recorded design (general revelation
   stated once, consumed by two question families), surfaced as Decision 3.
4. **Rom 8:28 / Rev 21:4 cross-lists (B)** — recorded on
   `why-god-allows-suffering` with ownership left at the existing concepts;
   surfaced as Decision 15.
5. **Never-mint-twice audit** — all 29 ids checked against each other, the
   131 merged ids, and the 162 pending rows: no concept appears twice, every
   EXISTING id is used in its existing meaning (extensions only), every
   PENDING id matches its tag-gap row's meaning, and no new-mint id collides
   with either list. The four drafts' independent declines of the same ground
   (Ps 82:6, Prov 8:22) agreed with each other and are deduped in the
   Declined section.

### Dual anchors and splits (each with its rationale)

Every surviving dual anchor is deliberate — two honest registers of one
text — and is listed here so it reads as design, not drift:

- **Romans 1:19-20** → `creation-testifies`, `those-who-never-heard` — One text, two honest registers: creation as God's continuous witness vs the fate-of-the-unevangelized question; the display side keeps only the existing id until creation-testifies merges.
- **Romans 2:14-16** → `conscience`, `those-who-never-heard` — The law written on hearts is both the moral-argument's central text and the never-heard question's second leg (judged by the inner witness).
- **Acts 14:16-17** → `creation-testifies`, `those-who-never-heard` — 'He didn't leave himself without witness' teaches providence-as-witness once; both question families honestly consume it.
- **Acts 17:26-27** → `creation-testifies`, `those-who-never-heard` — The seek-and-find purpose of the created order serves both the natural-theology register and the never-heard register.
- **Isaiah 44:24** → `creation`, `no-other-god` — Sole unassisted creatorship ('alone... by myself') is both a creation claim and Isaiah's monotheism polemic — two registers of one verse.
- **Psalm 90:2** → `creation`, `gods-unchanging-nature` — The unmade Maker answers 'who made God' (creation register) and 'was God once a man' (everlasting-deity register).
- **John 1:3** → `creation`, `deity-of-christ` — Anchored on creation only for the all-things-made claim; on deity-of-christ for the made/unmade line that places the Word outside creation.
- **2 Corinthians 4:16-18** → `the-breath-of-life`, `why-god-allows-suffering` — Different verse spans of one passage: vv16+18 carry the inner/outer-person anthropology; vv17-18 the affliction-works-glory theodicy register.
- **Deuteronomy 6:4** → `no-other-god`, `trinity` — The Shema is the oneness pole of both concepts; keeping it anchored on trinity guards that concept against tritheistic drift.
- **Isaiah 43:10** → `no-other-god`, `gods-unchanging-nature` — 'No God formed before me, neither after' serves both monotheism and the no-attained-godhood register — godhood is not a class beings enter.
- **Isaiah 44:6** → `no-other-god`, `the-first-and-the-last` — The exclusivity clause and the first-and-last title stand in the same breath; each concept claims its own half of the verse's logic.
- **Isaiah 45:21-22** → `no-other-god`, `jesus-the-only-way` — Cross-linked, not duplicated in substance: no-other-god claims the monotheism register, jesus-the-only-way the exclusive-Savior register (Worker C's recorded boundary).
- **John 8:58** → `deity-of-christ`, `i-am-sayings` — The identity claim itself (deity register) and the strongest absolute use in the I-am corpus (saying-locator register).
- **John 20:28-29** → `deity-of-christ`, `honor-the-son` — The confession's content ('my God') vs the devotional practice Jesus blesses — identity register and worship register.
- **John 20:27-28** → `resurrection`, `deity-of-christ` — Anchored under resurrection for the touch-the-wounds evidence with a cross edge to deity-of-christ for the confession (Worker B's recorded split).
- **Acts 17:30-31** → `jesus-the-only-way`, `resurrection` — One Areopagus close, two registers: the one-appointed-man exclusivity claim and the resurrection offered as God's public assurance (v31 alone on resurrection).
- **Romans 8:28** → `why-god-allows-suffering`, `remembered-all-things-for-good (existing owner)` — Cross-list, decision pending (Decision 15): the existing remembered- concept owns the text; the umbrella needs it to surface for why-is-this-happening queries — pack anchor vs lexicon pointer is Jesse's call.
- **Revelation 21:4** → `why-god-allows-suffering`, `new-heaven-and-earth (existing owner)` — Cross-list, decision pending (Decision 15): display ownership stays with new-heaven-and-earth; the theodicy umbrella anchors it because Scripture's final answer to evil is its promised end.
- **John 11:25(-26)** → `resurrection-of-the-dead`, `i-am-sayings` — Resurrection-hope-in-Jesus's-person register vs the predicated I-am saying itself; Worker B flagged coordinate-don't-duplicate — confirm dual or single+cross-ref (Decision 17).
- **Psalm 19:7-9 / Matthew 24:35 / Hebrews 4:12** → `trustworthiness-of-scripture / power-of-gods-word`, `studying-the-word (existing owner)` — Dual claims with the existing studying-the-word pack (engagement register vs trustworthiness/permanence registers); precedent: the testing pack's dual claim on 1 Pet 1:6-7.
- **Habakkuk 1:13** → `suffering-of-the-righteous` — Deliberately anchored ONCE with a cross edge to prosperity-of-the-wicked — never-mint-twice discipline applied to anchors; not a dual anchor.
- **Philippians 2:6-7 / 2:9-11** → `deity-of-christ`, `honor-the-son` — A split, not a dual: the humbling half (vv6-7) anchors deity; the exaltation half (vv9-11) anchors the worship register.
- **Hebrews 1 (1:3, 8, 10-12 vs 1:6)** → `supremacy-of-christ`, `honor-the-son` — A split within one chapter: the superiority-to-angels catena anchors supremacy; the command that angels worship the Son (1:6) anchors the worship register.
- **Job 38:4** → `design-in-creation` — Worker A flagged a potential dual with the theodicy family; dissolved at integration — Worker B anchored Job 1/42, not Job 38, so no dual exists.
- **2 Peter 1:16** → `trustworthiness-of-scripture` — Not a dual: Worker B declined it as a resurrection-eyewitness anchor (context is the Transfiguration); Worker C anchors it only for the not-myth historical-reliability register — consistent, single anchor.

---

## Domain A — Creation & the knowable God (brief domains 1 + 5)

Concept-shaped ids only; argument names (cosmological, teleological, moral) live in lexicon entries and fixture queries. No entry adjudicates creation-timeline debates. The merged `those-who-never-heard` entry (A + C) is listed here.

### 1. `creation-testifies` — NEW-MINT

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** Creation itself is God's ongoing witness to every person — the heavens, the seasons, and providence declare the Creator, leaving all without excuse (general revelation).

**Notes:** Reuse check done: `creation` teaches the act of making; `those-who-never-heard` owns the fate-of-the-unevangelized question and already carries Rom 1:19–20 on the display side. The witness register is distinct. Boundary decision for Jesse: Rom 1:19–20 dual-anchors this id and those-who-never-heard deliberately.

**Anchors (7):**

- **Psalm 19:1-2** *(pinned)* — “The heavens declare the glory of God. The expanse shows his handiwork. Day after day they pour out speech, and night after night they display knowledge.”
  The psalm's first half is explicitly about wordless, continuous cosmic testimony — the concept's namesake text, teaching it directly, not merely used for it. *(Sources: routledge; manning-20; ap-teleo)*
  *Note: WEB v1 begins with the merged superscription 'For the Chief Musician. A Psalm by David.' before this body text.*

- **Psalm 19:3** *(pinned)* — “There is no speech nor language where their voice is not heard.”
  Universality of the witness — the same every-person scope the concept claims. *(Sources: manning-20; ap-teleo)*

- **Romans 1:19-20** *(pinned)* — “because that which is known of God is revealed in them, for God revealed it to them. For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity, that they may be without excuse.”
  Paul's own doctrine of general revelation: what can be known of God is revealed by God through what is made, with the without-excuse verdict. In context (1:18–32) the witness is suppressed, not persuasive unto faith — justification wording keeps that edge. Dual-anchored with those-who-never-heard. *(Sources: routledge; crossexamined; manning-20)*

- **Acts 14:16-17** *(current-edition)* — “who in the generations gone by allowed all the nations to walk in their own ways. Yet he didn’t leave himself without witness, in that he did good and gave you rains from the sky and fruitful seasons, filling our hearts with food and gladness.”
  Paul at Lystra, to pagans with no Scripture: God 'didn't leave himself without witness' — the concept's exact claim, in the Bible's own missionary practice. *(Sources: manning-20; crossexamined)*

- **Acts 17:26-27** *(pinned)* — “He made from one blood every nation of men to dwell on all the surface of the earth, having determined appointed seasons and the boundaries of their dwellings, that they should seek the Lord, if perhaps they might reach out for him and find him, though he is not far from each one of us.”
  The Areopagus address states the purpose of the created order: that people should seek and find the God who is near. Natural theology's warrant text, taught in context. *(Sources: routledge; crossexamined)*

- **Job 12:7-9** *(current-edition)* — ““But ask the animals now, and they will teach you; the birds of the sky, and they will tell you. Or speak to the earth, and it will teach you. The fish of the sea will declare to you. Who doesn’t know that in all these, the LORD’s hand has done this,”
  Caveat noted: this is Job's retort to Zophar — even the animals know the LORD's hand does everything, including the calamity under dispute. The premise it teaches (creatures visibly display the LORD's doing) is affirmed, but the justification must not flatten the speech into a serene nature-hymn. *(Sources: manning-20)*
  *Note: v9 runs on into v10.*

- **Psalm 8:3-4** *(current-edition)* — “When I consider your heavens, the work of your fingers, the moon and the stars, which you have ordained, what is man, that you think of him? What is the son of man, that you care for him?”
  The sky-witness producing right creaturely response — wonder before the Ordainer. Vv. 5–6 (human dignity) belong to image-of-god; the split is deliberate. *(Sources: manning-20)*

---

### 2. `creation` — EXISTING-extension

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** Extension register: God alone made all things and is himself unmade — everything that exists comes from him, so he owns and sustains it (first-cause / who-made-God query family). Extend lexicon and anchors of the merged `creation` id; do NOT mint maker-of-all-things.

**Notes:** Brief-mandated reuse check resolved as extend-not-mint: the teaching substance is exactly what `creation` says; the gap is lay/apologetics query phrasings ('who made God', 'did the universe have a beginning', 'everything has a cause') and whole-canon anchors beyond Gen 1. Argument names (cosmological/kalam) stay in lexicon, never in the id.

**Anchors (8):**

- **Genesis 1:1** *(pinned)* — “In the beginning, God created the heavens and the earth.”
  The canon's opening assertion of an absolute beginning with God prior to it — the premise every first-cause discussion borrows. *(Sources: gq-kalam; routledge)*

- **Psalm 90:2** *(current-edition)* — “Before the mountains were born, before you had formed the earth and the world, even from everlasting to everlasting, you are God.”
  The Maker himself is unmade, from everlasting to everlasting — the honest scriptural answer to 'who made God'. *(Sources: gq-kalam; crossexamined)*

- **Isaiah 44:24** *(current-edition)* — “The LORD, your Redeemer, and he who formed you from the womb says: “I am the LORD, who makes all things; who alone stretches out the heavens; who spreads out the earth by myself;”
  Sole, unassisted creatorship ('makes all things… alone… by myself') in the anti-idol polemic of Isa 44, where creating is what distinguishes God from every rival. Part of the Isaiah 40–46 block from the Mormonism conversation. *(Sources: brief-6.1; manning-20)*
  *Note: Sentence continues in v25.*

- **Jeremiah 10:12** *(pinned)* — “God has made the earth by his power. He has established the world by his wisdom, and by his understanding has he stretched out the heavens.”
  In-context contrast with idols: creating by power and wisdom is the LORD's distinguishing act. *(Sources: manning-20)*

- **John 1:3** *(pinned)* — “All things were made through him. Without him, nothing was made that has been made.”
  The made/unmade line drawn absolutely. The deity-of-Christ freight is Worker D's ground; anchored here only for the all-things-made claim it states. *(Sources: crossexamined)*

- **Acts 17:24-25** *(pinned)* — “The God who made the world and all things in it, he, being Lord of heaven and earth, doesn’t dwell in temples made with hands. He isn’t served by men’s hands, as though he needed anything, seeing he himself gives to all life and breath and all things.”
  Creator aseity preached to philosophers: God needs nothing and gives everything — the owns-and-sustains clause, taught in the Bible's own engagement with Greek thought. *(Sources: routledge; crossexamined)*

- **Hebrews 3:4** *(current-edition)* — “For every house is built by someone; but he who built all things is God.”
  The one place Scripture states the builder inference in argument form. Context caveat: in Heb 3 it serves the Moses/Christ comparison, not a standalone proof — yet it asserts, as a general truth, that all things have God as builder. *(Sources: gq-kalam; namb-moral)*

- **Revelation 4:11** *(current-edition)* — ““Worthy are you, our Lord and God, the Holy One, to receive the glory, the honor, and the power, for you created all things, and because of your desire they existed and were created!””
  Creation grounded in God's will ('because of your desire they existed') — contingency of everything on the Creator, taught doxologically. *(Sources: gq-kalam)*

---

### 3. `design-in-creation` — NEW-MINT

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** The world is made with wisdom, order, and purpose — fixed ordinances govern the heavens, the earth is formed to be inhabited, and human beings are deliberately woven together.

**Notes:** Reuse check done: not covered by creation (act, not orderedness), wisdom-from-god (wisdom for living), or any tag-gap row. Fine-tuning/intelligent-design queries land here via lexicon; the id names what the texts teach, not the modern argument, and no anchor is claimed to teach fine-tuning physics.

**Anchors (7):**

- **Proverbs 3:19-20** *(pinned)* — “By wisdom the LORD founded the earth. By understanding, he established the heavens. By his knowledge, the depths were broken up, and the skies drop down the dew.”
  Creation executed by wisdom, understanding, knowledge — orderedness located in the Maker's mind, the concept's core claim. *(Sources: ap-teleo)*

- **Job 38:4** *(current-edition)* — ““Where were you when I laid the foundations of the earth? Declare, if you have understanding.”
  The whirlwind speech's architectural imagery (foundations, measurements in v5) presents the earth as deliberately laid and man as unqualified to audit it. Theodicy function of the speeches is Worker B's ground; anchored here only for the making. Possible dual-anchor with why-god-allows-suffering — flagged for integration. *(Sources: ap-teleo; thirdmill-job)*

- **Job 38:33** *(current-edition)* — “Do you know the laws of the heavens? Can you establish its dominion over the earth?”
  Scripture's own phrase 'laws of the heavens' — a lawlike created order that man neither wrote nor administers; the honest biblical hook for law-of-nature queries. *(Sources: ap-teleo)*

- **Jeremiah 33:25** *(pinned)* — “The LORD says: “If my covenant of day and night fails, if I have not appointed the ordinances of heaven and earth,”
  The fixed ordinances of heaven and earth are so reliable God stakes covenant promises on them. Caveat: the passage's point is covenant certainty to Israel — the appointed natural order is the premise, not the topic. *(Sources: ap-teleo)*
  *Note: Protasis; the sentence completes in v26.*

- **Isaiah 45:18** *(current-edition)* — “For the LORD who created the heavens, the God who formed the earth and made it, who established it and didn’t create it a waste, who formed it to be inhabited says: “I am the LORD. There is no other.”
  The earth 'formed to be inhabited' — explicit purpose-of-the-world statement. The no-other-God clause is Worker D's no-other-god ground; shared text, two honest registers. *(Sources: manning-20; brief-6.1)*

- **Psalm 104:24** *(current-edition)* — “LORD, how many are your works! In wisdom, you have made them all. The earth is full of your riches.”
  The creation-psalm's summary verse after 23 verses of ecosystem detail: all of it made in wisdom. *(Sources: ap-teleo)*

- **Psalm 139:13-14** *(pinned)* — “For you formed my inmost being. You knit me together in my mother’s womb. I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well.”
  Design brought down to the individual person — 'knit together', 'fearfully and wonderfully made'. Anchored for deliberate personal formation, not for any embryology claim. *(Sources: manning-20)*

---

### 4. `conscience` — PENDING-TAG-GAP

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** Extension register on the pending tag-gap `conscience` row (Theme J): God's law written on every human heart — the inner witness that accuses and excuses, making right and wrong knowable to those who never received Scripture (moral-argument query family).

**Notes:** PENDING — proposed in tag-gaps-review, not merged; no display use until it merges. Per the brief's own instruction, extend this row rather than minting conscience-and-moral-law. Coordination flag: Rom 2:14–16 dual-anchors this row and those-who-never-heard.

**Anchors (6):**

- **Romans 2:14-15** *(pinned)* — “(for when Gentiles who don’t have the law do by nature the things of the law, these, not having the law, are a law to themselves, in that they show the work of the law written in their hearts, their conscience testifying with them, and their thoughts among themselves accusing or else excusing them)”
  The moral-argument tradition's central text actually teaches its premise: the law's work written on hearts, conscience as internal witness, in people with no revealed law. In context it serves Paul's indictment (all are accountable) — exactly the register the concept claims. *(Sources: namb-moral; gq-moral; routledge)*

- **Romans 2:16** *(pinned)* — “in the day when God will judge the secrets of men, according to my Good News, by Jesus Christ.”
  Completes the sentence: the inner witness has a Judge — moral accountability, not mere moral feeling. *(Sources: namb-moral)*

- **Romans 1:32** *(pinned)* — “who, knowing the ordinance of God, that those who practice such things are worthy of death, not only do the same, but also approve of those who practice them.”
  Moral knowledge possessed and suppressed — 'knowing the ordinance of God' while approving its breach; the knowledge is real even where it does not govern. *(Sources: gq-moral)*

- **Proverbs 20:27** *(current-edition)* — “The spirit of man is the LORD’s lamp, searching all his innermost parts.”
  The inner faculty as the LORD's own lamp searching the person — Proverbs' one-verse anthropology of the examining inner witness. *(Sources: gq-moral)*

- **Micah 6:8** *(pinned)* — “He has shown you, O man, what is good. What does the LORD require of you, but to act justly, to love mercy, and to walk humbly with your God?”
  'He has shown you, O man' — the good as shown, addressed generically. Caveat: the courtroom scene addresses covenant Israel, who had special revelation; do not overclaim it as a pure natural-law text. *(Sources: gq-moral)*

- **Ecclesiastes 3:11** *(pinned)* — “He has made everything beautiful in its time. He has also set eternity in their hearts, yet so that man can’t find out the work that God has done from the beginning even to the end.”
  'Eternity in their hearts' — the implanted inner reach toward what outlasts us, paired honestly with the verse's own limit clause. Anchored for the inner-witness register, not as a moral-law text; if the row's final gist is strictly moral-conscience this anchor should move or drop — flagged for integration. *(Sources: crossexamined)*

---

### 5. `image-of-god` — EXISTING-extension

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** Extension register on the merged `image-of-god` id: every human being is made in God's image — the ground of human uniqueness, dignity, dominion, and personhood (imago-Dei / human-mind query family, e.g. 'what makes humans different from animals', 'why is human life sacred').

**Anchors (4):**

- **Genesis 1:26-27** *(pinned)* — “God said, “Let’s make man in our image, after our likeness. Let them have dominion over the fish of the sea, and over the birds of the sky, and over the livestock, and over all the earth, and over every creeping thing that creeps on the earth.” God created man in his own image. In God’s image he created him; male and female he created them.”
  The charter text: image, likeness, dominion, male and female — presumably already the pack's core anchor; listed for map completeness. *(Sources: namb-moral; routledge)*

- **Genesis 9:6** *(current-edition)* — “Whoever sheds man’s blood, his blood will be shed by man, for God made man in his own image.”
  The image doctrine grounding the sanctity of human life after the fall — human worth is derivative of the image and survives Gen 3. *(Sources: namb-moral)*

- **Psalm 8:5-6** *(current-edition)* — “For you have made him a little lower than the angels, and crowned him with glory and honor. You make him ruler over the works of your hands. You have put all things under his feet:”
  Crowned status and delegated rule — the psalmist's commentary on Gen 1:26–28, teaching human exceptionality within creation. *(Sources: manning-20)*
  *Note: v6 runs on into v7.*

- **James 3:9** *(current-edition)* — “With it we bless our God and Father, and with it we curse men who are made in the image of God.”
  NT confirmation that people are presently 'made in the image of God' — the image as a standing fact with ethical force, not an Eden-only status. *(Sources: gq-soul)*

---

### 6. `the-breath-of-life` — NEW-MINT-conditional

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** Human beings live by God-breathed spirit — more than dust, a soul/spirit given by God, distinct from the body and returning to him.

**Notes:** Conditional mint — the brief-required extend-image-of-god check is surfaced to Jesse, not made silently. Recommendation: mint (distinct teaching substance and query family: 'do humans have souls', 'is the mind just the brain', 'what happens to the spirit at death'). If Jesse rules extend-instead, all anchors move onto image-of-god unchanged. Doctrinal note: takes no position on dichotomy vs trichotomy or philosophical dualism debates — gist stays at the texts' level.

**Anchors (6):**

- **Genesis 2:7** *(pinned)* — “The LORD God formed man from the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.”
  The concept's namesake: dust plus divine breath makes 'a living soul'. Honest note: nephesh here means the whole living person (animals are also 'living souls' in Gen 1), so this anchor teaches God-breathed life; the distinct-spirit claim rests on the later anchors. *(Sources: gq-soul; equip-soul)*

- **Ecclesiastes 12:7** *(current-edition)* — “and the dust returns to the earth as it was, and the spirit returns to God who gave it.”
  Gen 2:7 run in reverse at death: dust and spirit part ways, and the spirit 'returns to God who gave it' — the body/spirit distinction stated by the text itself. *(Sources: gq-soul; equip-soul)*

- **Zechariah 12:1** *(current-edition)* — “A revelation of the LORD’s word concerning Israel: The LORD, who stretches out the heavens and lays the foundation of the earth, and forms the spirit of man within him says:”
  Forming 'the spirit of man within him' listed alongside stretching the heavens — the human spirit as a distinct divine workmanship, in a formal creation-credential formula. *(Sources: equip-soul)*

- **Job 32:8** *(current-edition)* — “But there is a spirit in man, and the Spirit of the Almighty gives them understanding.”
  Understanding sourced in the God-given spirit, not age or flesh (Elihu against 'days should speak', v7). Caveat: Elihu is an uncorrected but human speaker; the claim is consonant with and carried by Gen 2:7 / Prov 20:27. *(Sources: equip-soul)*

- **Matthew 10:28** *(current-edition)* — “Don’t be afraid of those who kill the body, but are not able to kill the soul. Rather, fear him who is able to destroy both soul and body in Gehenna.”
  Jesus distinguishes what men can kill (body) from what they cannot (soul) — the strongest dominical statement that the person is not exhausted by the body. In context it grounds fearless confession; the justification retains that rather than reducing the verse to an anthropology datum. *(Sources: gq-soul; equip-soul)*

- **2 Corinthians 4:16, 18** *(pinned)* — “Therefore we don’t faint, but though our outward person is decaying, yet our inward person is renewed day by day. […] while we don’t look at the things which are seen, but at the things which are not seen. For the things which are seen are temporal, but the things which are not seen are eternal.”
  Outward person decaying while the inward person renews — Paul's lived body/inner-person distinction, aimed at endurance in suffering (context kept in the gist). *(Sources: equip-soul)*
  *Note: Two verses; v17 elided, marked with bracketed ellipsis — each verse quoted word-for-word.*

---

### 7. `those-who-never-heard` — EXISTING-extension

*Domain: A + C (merged; listed under Domain A)*

**Definition:** Merged A+C extension of the existing pack ('God's witness to all': which passages curated sources name for 'what about people who never heard' — creation's witness, conscience, the Spirit's conviction — adjudicating nothing about anyone's destiny). Anchors-only extension, no scope change. Existing pack anchors verified by Worker C: Rom 1:18-20 (torrey), Rom 2:14-15 (editorial), John 16:8 (editorial). Lexicon additions (register A): 'what about people who never heard the gospel', 'is God fair to those who never heard'. Related-edge addition (register C): jesus-the-only-way, both directions (Acts 17:30-31 follows directly on 17:26-27).

**Notes:** MERGED ENTRY: Workers A and C each proposed an extension of this id; integrated into one entry. C's two proposed anchors (Acts 17:26-27; Acts 14:16-17) were the same texts A proposed — justifications and sources merged, true duplicates dropped. Binding coordination flag (A): Rom 1:19-20, Rom 2:14-16, and Acts 14/17 each anchor two concepts in this map — general revelation stated once, consumed by two question families. Recorded as one deliberate design decision (Decision 3), not drift.

**Anchors (4):**

- **Romans 1:19-20** *(pinned)* — “because that which is known of God is revealed in them, for God revealed it to them. For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity, that they may be without excuse.”
  Already this id's ground: the witness reaches everyone, so no one is excuse-holding for lack of revelation. Dual-anchored with creation-testifies. *(Sources: routledge; crossexamined; manning-20)*

- **Acts 17:26-27** *(pinned)* — “He made from one blood every nation of men to dwell on all the surface of the earth, having determined appointed seasons and the boundaries of their dwellings, that they should seek the Lord, if perhaps they might reach out for him and find him, though he is not far from each one of us.”
  God's placement of every nation is aimed at seeking and finding him — directly answers the is-God-reachable half of the never-heard question. [C, merged:] Athens — God's providential arrangement of every nation is purposed toward seeking and finding him, the pack's exact register, from the one NT speech addressed wholly to pagans. *(Sources: crossexamined; editorial; routledge)*

- **Acts 14:16-17** *(current-edition)* — “who in the generations gone by allowed all the nations to walk in their own ways. Yet he didn’t leave himself without witness, in that he did good and gave you rains from the sky and fruitful seasons, filling our hearts with food and gladness.”
  The nations walked their own ways, yet were never without witness — the two clauses of the never-heard question in one sentence. [C, merged:] Lystra — 'he didn't leave himself without witness': providence itself as testimony to nations outside the covenant. *(Sources: crossexamined; editorial; manning-20)*

- **Romans 2:14-16** *(pinned)* — “(for when Gentiles who don’t have the law do by nature the things of the law, these, not having the law, are a law to themselves, in that they show the work of the law written in their hearts, their conscience testifying with them, and their thoughts among themselves accusing or else excusing them) in the day when God will judge the secrets of men, according to my Good News, by Jesus Christ.”
  The inner witness is the never-heard question's second leg: those without the law are judged by the law written on their hearts. Dual-anchored with the pending conscience row. *(Sources: namb-moral; gq-moral)*

---

### 8. `leviathan-and-behemoth` — PENDING-TAG-GAP

*Domain: Creation & the knowable God (domains 1+5)*

**Definition:** The untamable creatures of Job 40–41 — God's own exhibits of creative power that humble human pretension. Reuses the pending Theme E row (flagged in the review itself as creation/origins query traffic).

**Notes:** PENDING — not merged; no display use until it is. Handling rule per the antichrist/Ezek-28 precedents: the concept never adjudicates any identification (dinosaur, hippopotamus, crocodile, symbolic) — consulted references themselves split. Origins queries ('dinosaurs in the bible') reach these passages via lexicon; the gist stays identification-free. Job 40–41 is outside web-subset.json, so golden-fixture assertions ride the corpus-expansion PR.

**Anchors (6):**

- **Job 40:15** *(current-edition)* — ““See now behemoth, which I made as well as you. He eats grass as an ox.”
  'Which I made as well as you' — creature and man are exhibits of the same Maker; that co-creature clause is the verse's own point. *(Sources: knowableword-job; thirdmill-job)*

- **Job 40:19** *(current-edition)* — “He is the chief of the ways of God. He who made him gives him his sword.”
  Behemoth as 'chief of the ways of God' — supreme workmanship, subduable only by his Maker. *(Sources: knowableword-job)*

- **Job 41:1** *(current-edition)* — ““Can you draw out Leviathan with a fish hook, or press down his tongue with a cord?”
  The rhetorical challenge that structures the whole Leviathan speech: human incapacity before one creature. *(Sources: thirdmill-job)*

- **Job 41:11** *(current-edition)* — “Who has first given to me, that I should repay him? Everything under the heavens is mine.”
  The speech's theological center: from creature-power to Creator-ownership. (Later taken up by Paul, Rom 11:35 — attributed fact, never read back onto Job.) *(Sources: thirdmill-job)*

- **Job 41:33-34** *(current-edition)* — “On earth there is not his equal, that is made without fear. He sees everything that is high. He is king over all the sons of pride.””
  The closing superlative — the creature as living rebuke to human pride, which is the speech's function in Job's story. *(Sources: knowableword-job; thirdmill-job)*

- **Psalm 104:26** *(current-edition)* — “There the ships go, and leviathan, whom you formed to play there.”
  Leviathan outside Job: formed by God 'to play' in the sea — guards the concept against pure-monster readings. *(Sources: knowableword-job)*

---

## Domain B — Suffering & resurrection (brief domains 2 + 3)

Family design made WITH, not beside, the pending rows: one resurrection-scoping decision (Decision 1) and one theodicy-family design (Decision 2). The merged `resurrection` entry (B + D) is listed here.

### 9. `why-god-allows-suffering` — NEW-MINT

*Domain: Suffering & resurrection (domains 2+3)*

**Definition:** Scripture's own answers - and its refusals to answer - to why a good, sovereign God permits evil and suffering.

**Anchors (10):**

- **Job 1:21** *(pinned)* — “He said, “Naked I came out of my mother’s womb, and naked will I return there. The LORD gave, and the LORD has taken away. Blessed be the LORD’s name.””
  In context Job has just lost children and property to Satan's assault, permitted but bounded by God (1:12); the book poses innocent suffering as sharply as any philosopher and answers first with worship, not explanation. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/; https://knowingscripture.com/articles/job-and-the-problem-of-evil)*

- **Job 42:2, 5** *(current-edition)* — ““I know that you can do all things, and that no purpose of yours can be restrained. … I had heard of you by the hearing of the ear, but now my eye sees you.”
  God's answer to Job is his own presence and unsearchable governance (chs. 38-41), not a disclosed reason; Job's resolution is encounter, and the book never tells Job about chapter 1. Anchors Scripture's mystery-shaped answer. *(Sources: https://knowingscripture.com/articles/job-and-the-problem-of-evil; https://frame-poythress.org/the-bible-on-the-problem-of-evil/)*

- **Genesis 50:20** *(current-edition)* — “As for you, you meant evil against me, but God meant it for good, to save many people alive, as is happening today.”
  Joseph names the brothers' act genuinely evil and God's purpose in the same event genuinely good - the clearest canonical statement that God sovereignly works through evil he does not excuse; spoken after Jacob's death, closing the whole Joseph narrative. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **John 9:2-3** *(current-edition)* — “His disciples asked him, “Rabbi, who sinned, this man or his parents, that he was born blind?” Jesus answered, “This man didn’t sin, nor did his parents, but that the works of God might be revealed in him.”
  Jesus explicitly rejects the suffering-equals-punishment calculus for this man and reframes the affliction toward God's purpose. Caveat: he answers this case, not every case - do not generalize into 'all suffering exists to display miracles.' *(Sources: https://frame-poythress.org/the-bible-on-the-problem-of-evil/)*

- **Luke 13:2-5** *(current-edition)* — “Jesus answered them, “Do you think that these Galileans were worse sinners than all the other Galileans, because they suffered such things? I tell you, no, but unless you repent, you will all perish in the same way. Or those eighteen on whom the tower in Siloam fell and killed them—do you think that they were worse offenders than all the men who dwell in Jerusalem? I tell you, no, but, unless you repent, you will all perish in the same way.””
  On two current calamities Jesus denies that the victims were worse sinners and turns the question into a summons to repentance - Scripture's own handling of 'why did this disaster happen.' *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **Romans 8:18** *(pinned)* — “For I consider that the sufferings of this present time are not worthy to be compared with the glory which will be revealed toward us.”
  In the chapter's argument (creation groaning, vv. 19-23) present suffering is real but outweighed and temporary within God's redemptive arc - an eschatological, not explanatory, answer. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **Romans 8:28** *(pinned)* — “We know that all things work together for good for those who love God, for those who are called according to his purpose.”
  The 'good' is defined by v. 29 (conformity to Christ's image), not circumstantial ease - the justification must carry that scope to avoid prosperity-adjacent misuse. Coordination: this text is owned by existing remembered-all-things-for-good; cross-listed deliberately, integration pass decides anchor vs lexicon pointer. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **2 Corinthians 4:17-18** *(pinned)* — “For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory, while we don’t look at the things which are seen, but at the things which are not seen. For the things which are seen are temporal, but the things which are not seen are eternal.”
  Paul, cataloguing real afflictions (vv. 8-12), teaches that suffering is productive within God's economy - the soul-building register of theodicy. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **1 Peter 4:19** *(pinned)* — “Therefore let them also who suffer according to the will of God in doing good entrust their souls to him, as to a faithful Creator.”
  States plainly that some suffering is 'according to the will of God' and that the response is entrusting oneself to a faithful Creator. Context caveat: the chapter's suffering is primarily persecution (vv. 12-16), so this borders suffering-for-christ; kept because v. 19 states the principle at the level of suffering in doing good generally. *(Sources: https://frame-poythress.org/the-bible-on-the-problem-of-evil/)*

- **Revelation 21:4** *(pinned)* — “He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain any more. The first things have passed away.””
  Scripture's final answer to evil is its promised end - not explanation but abolition. Display ownership of this text stays with new-heaven-and-earth; anchored here so where-is-God queries surface it with this reason. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

---

### 10. `suffering-of-the-righteous` — PENDING-TAG-GAP

*Domain: Suffering & resurrection (domains 2+3)*

**Definition:** The righteous do suffer - Scripture's candid witness that affliction is not proportional to godliness.

**Anchors (7):**

- **Job 1:8** *(pinned)* — “The LORD said to Satan, “Have you considered my servant, Job? For there is no one like him on the earth, a blameless and an upright man, one who fears God, and turns away from evil.””
  The narrator and God himself certify Job's integrity before the suffering - the book's argument depends on the sufferer being righteous, dismantling the friends' retribution theology. *(Sources: https://knowingscripture.com/articles/job-and-the-problem-of-evil)*

- **Job 2:3** *(current-edition)* — “The LORD said to Satan, “Have you considered my servant Job? For there is no one like him on the earth, a blameless and an upright man, one who fears God, and turns away from evil. He still maintains his integrity, although you incited me against him, to ruin him without cause.””
  God's own words: the ruin was 'without cause' - the text itself denies that Job's suffering was deserved. *(Sources: https://knowingscripture.com/articles/job-and-the-problem-of-evil)*

- **Job 2:10** *(current-edition)* — “But he said to her, “You speak as one of the foolish women would speak. What? Shall we receive good at the hand of God, and shall we not receive evil?” In all this Job didn’t sin with his lips.”
  Job's stated posture: receiving adversity from God's hand without charging God with wrong - righteousness within suffering, not just before it. *(Sources: https://knowingscripture.com/articles/job-and-the-problem-of-evil)*

- **Psalm 34:19** *(pinned)* — “Many are the afflictions of the righteous, but the LORD delivers him out of them all.”
  Both halves in one verse: the righteous have many afflictions, and the LORD's deliverance is the psalm's confidence. Guard: 'delivers him out of them all' is testimony of God's faithfulness, not a formula of exemption (named prosperity-framing exclusion). *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **Psalm 44:17, 22** *(current-edition)* — “All this has come on us, yet we haven’t forgotten you. We haven’t been false to your covenant. … Yes, for your sake we are killed all day long. We are regarded as sheep for the slaughter.”
  A whole-psalm protest that covenant faithfulness did not prevent national catastrophe; v. 22 is the verse Paul cites in Rom 8:36 (stated as attributed NT use, not read back onto the psalm). *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Ecclesiastes 7:15** *(current-edition)* — “All this I have seen in my days of vanity: there is a righteous man who perishes in his righteousness, and there is a wicked man who lives long in his evildoing.”
  The Preacher's observed data point against any tidy righteousness-equals-outcomes scheme, from inside the canon's wisdom literature. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **Habakkuk 1:13** *(current-edition)* — “You who have purer eyes than to see evil, and who cannot look on perversity, why do you tolerate those who deal treacherously and keep silent when the wicked swallows up the man who is more righteous than he,”
  The prophet puts the theodicy question to God from God's own holiness - canonical warrant that the question itself is faithful speech. Also serves prosperity-of-the-wicked; anchored once, here, with a cross edge. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

---

### 11. `prosperity-of-the-wicked` — PENDING-TAG-GAP

*Domain: Suffering & resurrection (domains 2+3)*

**Definition:** Scripture's open grievance that the wicked flourish - and where the psalmists take that grievance.

**Anchors (7):**

- **Psalm 73:3** *(pinned)* — “For I was envious of the arrogant, when I saw the prosperity of the wicked.”
  Asaph's thesis statement; the whole psalm is the canon's fullest treatment of this stumbling block, voiced by a worship leader. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Psalm 73:12** *(pinned)* — “Behold, these are the wicked. Being always at ease, they increase in riches.”
  The observation at its sharpest, immediately before the psalmist admits he almost lost his footing (vv. 2, 13-14). *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Psalm 73:16-17** *(pinned)* — “When I tried to understand this, it was too painful for me— until I entered God’s sanctuary, and considered their latter end.”
  The psalm's hinge: the answer arrives not as an argument but in worship and an eschatological horizon - the model resolution this concept should surface first. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Psalm 73:26** *(pinned)* — “My flesh and my heart fails, but God is the strength of my heart and my portion forever.”
  Where the psalm lands: God himself, not adjusted circumstances, is the portion - guards the concept against a prosperity-shaped resolution. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Job 21:7** *(current-edition)* — ““Why do the wicked live, become old, yes, and grow mighty in power?”
  Job's rebuttal of Zophar: observed reality contradicts the friends' claim that the wicked visibly perish; the canon lets this stand as data. *(Sources: https://knowingscripture.com/articles/job-and-the-problem-of-evil)*

- **Jeremiah 12:1** *(current-edition)* — “You are righteous, LORD, when I contend with you; yet I would like to plead a case with you. Why does the way of the wicked prosper? Why are they all at ease who deal very treacherously?”
  The prophet files the complaint as a legal case while confessing God righteous - grievance and faith held together in one verse. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

- **Psalm 37:1, 35-36** *(pinned)* — “By David. Don’t fret because of evildoers, neither be envious against those who work unrighteousness. … I have seen the wicked in great power, spreading himself like a green tree in its native soil. But he passed away, and behold, he was not. Yes, I sought him, but he could not be found.”
  The wisdom-psalm counterpart: the prosperity is real but transient; counsel ('don't fret') plus eyewitness observation of the wicked's passing. *(Sources: https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm)*

---

### 12. `resurrection` — EXISTING-extension

*Domain: B + D (merged; listed under Domain B)*

**Definition:** EXTENSION register for the existing Easter-scoped concept: Christ's resurrection as a bodily, witnessed event - the appearances, the named eyewitnesses, and the apostolic insistence that everything hangs on it. Resolves tag-gaps-review 1(a): do NOT mint witnesses-of-the-resurrection. MERGED ENTRY: Worker D's coordination-only bodily-resurrection set (Luke 24:39; Luke 24:42-43; John 20:27; John 2:19-21; 1 John 1:1; Acts 2:31-32) merged in per the brief — D minted nothing. Five of D's six anchors were already carried by B's set (same, wider, or — in the John 2 case — deliberately narrowed spans: B's "John 2:19, 21" drops v20, where D had 2:19-21); the sixth widened B's Acts 2:32 to Acts 2:31-32. The JW-dialogue bodily-resurrection topic (brief §6.2 row 3) is served by this one entry.

**Anchors (10):**

- **1 Corinthians 15:3-6** *(pinned)* — “For I delivered to you first of all that which I also received: that Christ died for our sins according to the Scriptures, that he was buried, that he was raised on the third day according to the Scriptures, and that he appeared to Cephas, then to the twelve. Then he appeared to over five hundred brothers at once, most of whom remain until now, but some have also fallen asleep.”
  Paul marks this as tradition he 'received' - the early creed at the center of the minimal-facts literature, with a named and living eyewitness list. The passage teaches the witnessed resurrection; its evidential use in apologetics is downstream of what it says. *(Sources: https://rabbitroomapologetics.substack.com/p/the-minimal-facts-method-for-the; https://crossexamined.org/the-evidential-value-of-1-corinthians-153-8-to-the-case-for-the-resurrection/)*

- **1 Corinthians 15:14, 17** *(pinned)* — “If Christ has not been raised, then our preaching is in vain and your faith also is in vain. … If Christ has not been raised, your faith is vain; you are still in your sins.”
  Paul stakes the faith's truth on a falsifiable historical claim - the canon's own warrant for treating the resurrection as evidence-apt rather than merely symbolic. *(Sources: https://crossexamined.org/the-minimal-facts-of-the-resurrection/)*

- **Luke 24:39** *(pinned)* — “See my hands and my feet, that it is truly me. Touch me and see, for a spirit doesn’t have flesh and bones, as you see that I have.””
  The risen Jesus's own contrast: not 'a spirit,' but flesh and bones, offered for touch - the plain-sense bodily claim, in context answering the disciples' fear that they saw a spirit (v. 37). Directly answers the spiritual-resurrection-only reading. *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature; https://apologeticspress.org/did-jesus-have-the-same-physical-body-after-his-resurrection-673/)*

- **Luke 24:42-43** *(pinned)* — “They gave him a piece of a broiled fish and some honeycomb. He took them, and ate in front of them.”
  Eating 'in front of them' is Luke's deliberate physical demonstration - narrated as evidence within the text itself (v. 41). *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature)*

- **John 20:27-28** *(current-edition)* — “Then he said to Thomas, “Reach here your finger, and see my hands. Reach here your hand, and put it into my side. Don’t be unbelieving, but believing.” Thomas answered him, “My Lord and my God!””
  The wounds of the crucified body on the risen one - continuity of the same body - and Thomas's unrebuked confession. The confession itself is deity-of-christ ground (Worker D's lane); anchored here for the touch-the-wounds evidence, with a cross edge. *(Sources: https://apologeticspress.org/did-jesus-have-the-same-physical-body-after-his-resurrection-673/)*

- **John 2:19, 21** *(current-edition)* — “Jesus answered them, “Destroy this temple, and in three days I will raise it up.” … But he spoke of the temple of his body.”
  The evangelist's own gloss fixes the referent: the raised 'temple' is his body - Jesus predicted a bodily resurrection per the text's explicit interpretation, not an inference. *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature)*

- **Acts 1:3** *(pinned)* — “To these he also showed himself alive after he suffered, by many proofs, appearing to them over a period of forty days and speaking about God’s Kingdom.”
  Luke's summary uses the language of demonstration - 'many proofs' over forty days - the canon itself framing the appearances evidentially. *(Sources: https://crossexamined.org/the-minimal-facts-of-the-resurrection/)*

- **Acts 2:31-32** *(pinned)* — “he foreseeing this, spoke about the resurrection of the Christ, that his soul wasn’t left in Hades, and his flesh didn’t see decay. This Jesus God raised up, to which we all are witnesses.”
  The first public apostolic sermon, in Jerusalem weeks after the events, rests its claim on collective eyewitness — 'we all are witnesses' — and defines the resurrection in terms of flesh: 'his flesh didn't see decay'. [Widened from B's Acts 2:32 by merging D's Acts 2:31-32 bodily-register anchor.] *(Sources: https://crossexamined.org/the-minimal-facts-of-the-resurrection/; scoping-brief)*

- **Acts 17:31** *(pinned)* — “because he has appointed a day in which he will judge the world in righteousness by the man whom he has ordained; of which he has given assurance to all men, in that he has raised him from the dead.””
  To a pagan philosophical audience Paul offers the resurrection as God's public 'assurance' - Scripture's own model of resurrection-as-apologetic. *(Sources: https://rabbitroomapologetics.substack.com/p/the-minimal-facts-method-for-the)*

- **1 John 1:1-2** *(pinned)* — “That which was from the beginning, that which we have heard, that which we have seen with our eyes, that which we saw, and our hands touched, concerning the Word of life (and the life was revealed, and we have seen, and testify, and declare to you the life, the eternal life, which was with the Father, and was revealed to us);”
  First-person sensory testimony - heard, seen, touched - opening a letter whose stated purpose is testimony. Scope caveat carried honestly: the referent is the whole incarnate life of the Word, not the resurrection appearances alone. *(Sources: https://crossexamined.org/the-minimal-facts-of-the-resurrection/)*

---

### 13. `resurrection-of-the-dead` — PENDING-TAG-GAP

*Domain: Suffering & resurrection (domains 2+3)*

**Definition:** The promised resurrection of the dead - Christ as first fruits, the raising of all people to life or judgment, and the believer's embodied hope. Takes the general-resurrection half of the one resurrection-scoping decision.

**Anchors (9):**

- **1 Corinthians 15:20** *(pinned)* — “But now Christ has been raised from the dead. He became the first fruit of those who are asleep.”
  The load-bearing link between the two resurrection concepts: Christ's resurrection is 'first fruit' - the same harvest the dead in Christ will join. This verse is why the two-id split has a principled boundary. *(Sources: https://rabbitroomapologetics.substack.com/p/the-minimal-facts-method-for-the)*

- **1 Corinthians 15:42-44** *(pinned)* — “So also is the resurrection of the dead. The body is sown perishable; it is raised imperishable. It is sown in dishonor; it is raised in glory. It is sown in weakness; it is raised in power. It is sown a natural body; it is raised a spiritual body. There is a natural body and there is also a spiritual body.”
  The fullest canonical description of the resurrection body: fourfold 'sown ... raised' continuity-with-transformation, and the subject of every clause is the body. Handling note: 'spiritual body' is sometimes read as immaterial; the passage's own contrast is perishable/imperishable - state the sown/raised structure and let the text carry it; any fuller anti-immaterial gloss is sources:[editorial]. *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature)*

- **Daniel 12:2** *(current-edition)* — “Many of those who sleep in the dust of the earth will awake, some to everlasting life, and some to shame and everlasting contempt.”
  The OT's clearest resurrection text: sleepers in the dust awaking to two destinies - in its own context, without NT read-back. *(Sources: https://evidenceunseen.com/old-testament/job/difficulties/does-this-passage-refer-to-the-concept-of-resurrection)*

- **John 5:28-29** *(current-edition)* — “Don’t marvel at this, for the hour comes in which all who are in the tombs will hear his voice and will come out; those who have done good, to the resurrection of life; and those who have done evil, to the resurrection of judgment.”
  Jesus teaches a universal, tomb-emptying resurrection to two outcomes, at his own voice. Two-outcomes wording borders divine-judgment / hell - cross edges; justification stays descriptive per the no-adjudication rule. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **John 11:25-26** *(pinned)* — “Jesus said to her, “I am the resurrection and the life. He who believes in me will still live, even if he dies. Whoever lives and believes in me will never die. Do you believe this?””
  Spoken to a grieving Martha at a real grave: resurrection hope located in Jesus's person, immediately enacted in sign at Lazarus's tomb. Overlaps the PENDING i-am-sayings row - coordinate, don't duplicate. *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature)*

- **Acts 24:15** *(current-edition)* — “having hope toward God, which these also themselves look for, that there will be a resurrection of the dead, both of the just and unjust.”
  Paul before Felix states the general resurrection - 'both of the just and unjust' - as shared Jewish hope and his own; the phrase is the concept's name in the text. *(Sources: https://crossexamined.org/the-minimal-facts-of-the-resurrection/)*

- **1 Thessalonians 4:13-14** *(pinned)* — “But we don’t want you to be ignorant, brothers, concerning those who have fallen asleep, so that you don’t grieve like the rest, who have no hope. For if we believe that Jesus died and rose again, even so God will bring with him those who have fallen asleep in Jesus.”
  The pastoral payload of the doctrine: grief with hope, grounded explicitly in Christ's resurrection. Cross edge to caught-up-together, which owns vv. 16-17. *(Sources: https://www.thegospelcoalition.org/essay/the-problem-of-evil/)*

- **Philippians 3:20-21** *(current-edition)* — “For our citizenship is in heaven, from where we also wait for a Savior, the Lord Jesus Christ, who will change the body of our humiliation to be conformed to the body of his glory, according to the working by which he is able even to subject all things to himself.”
  The believer's hope is a changed body conformed to Christ's glorified body - embodiment, not escape from it. *(Sources: https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature)*

- **Job 19:25-27** *(current-edition)* — “But as for me, I know that my Redeemer lives. In the end, he will stand upon the earth. After my skin is destroyed, then I will see God in my flesh, whom I, even I, will see on my side. My eyes will see, and not as a stranger. “My heart is consumed within me.”
  CAVEAT ANCHOR (low weight, sources:[editorial] for the resurrection reading): WEB renders 'in my flesh,' and on that rendering Job confesses hope of seeing God beyond death with a living Redeemer as guarantor. The Hebrew of v. 26 is famously difficult and 'from my flesh' (apart from it) is a live scholarly reading - never present as a load-bearing bodily-resurrection proof; it anchors the hope-beyond-death register as the WEB text reads, dispute noted. *(Sources: https://evidenceunseen.com/old-testament/job/difficulties/does-this-passage-refer-to-the-concept-of-resurrection; https://bhebrew.biblicalhumanities.org/viewtopic.php?t=22699; editorial (LH theological judgment; provenance-visible per ontology/README.md))*

---

## Domain C — Scripture & the only way (brief domains 4 + 6)

Owns the false-prophets/false-teachers/testing-prophets three-way call (Decision 6) and the D2/D3 lexicon-boundary decisions with `studying-the-word`. Worker C's `those-who-never-heard` extension is merged into the Domain A entry.

### 14. `trustworthiness-of-scripture` — PENDING-TAG-GAP

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** Scripture is God-breathed, flawless, and true — trustworthy in what it affirms and sufficient to equip God's people for every good work.

**Anchors (9):**

- **2 Timothy 3:16-17** *(current-edition)* — “Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness, that each person who belongs to God may be complete, thoroughly equipped for every good work.”
  In context Paul sets the sacred writings Timothy has known from infancy (3:14-15) against deceivers who grow worse (3:13); inspiration ('God-breathed') and the equipping purpose are the sentence's own claims. Caveat: the verse claims sufficiency-to-equip, not canon closure; wider sola-scriptura freight is a contested inference and stays out of the gist. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://puritanboard.com/threads/2-timothy-3-16-and-sola-scriptura.102808/; https://jimmyakin.com/library/2-timothy-316-17-and-sola-scriptura)*

- **2 Peter 1:20-21** *(current-edition)* — “knowing this first, that no prophecy of Scripture is of private interpretation. For no prophecy ever came by the will of man, but holy men of God spoke, being moved by the Holy Spirit.”
  Peter's own account of Scripture's origin — carried by the Holy Spirit, not human initiative — given to ground the prophetic word's reliability (1:19). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **2 Peter 1:16** *(current-edition)* — “For we didn’t follow cunningly devised fables when we made known to you the power and coming of our Lord Jesus Christ, but we were eyewitnesses of his majesty.”
  The apostolic message's explicit not-myth, eyewitness claim — the historical-reliability register stated inside Scripture itself. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Luke 1:3-4** *(current-edition)* — “it seemed good to me also, having traced the course of all things accurately from the first, to write to you in order, most excellent Theophilus; that you might know the certainty concerning the things in which you were instructed.”
  Luke's preface (1:1-4) claims eyewitness sources (v2), careful investigation, and certainty as its goal — Scripture's own description of its historical method. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Psalm 19:7-9** *(pinned)* — “The LORD’s law is perfect, restoring the soul. The LORD’s covenant is sure, making wise the simple. The LORD’s precepts are right, rejoicing the heart. The LORD’s commandment is pure, enlightening the eyes. The fear of the LORD is clean, enduring forever. The LORD’s ordinances are true, and righteous altogether.”
  The psalm's second panel: after creation's wordless speech (19:1-6), the written word is perfect, sure, right, pure, true. Dual claim noted: studying-the-word anchors Ps 19:7-11 (torrey) in the engagement register. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Psalm 12:6** *(current-edition)* — “The LORD’s words are flawless words, as silver refined in a clay furnace, purified seven times.”
  Set against the flattering, double-hearted speech of men (12:2-4) — the contrast is the psalm's point. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Psalm 119:160** *(current-edition)* — “All of your words are truth. Every one of your righteous ordinances endures forever.”
  The psalm's summary predication of truth over the whole of God's words. (VPL line's trailing acrostic header 'SIN AND SHIN' stripped.) *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Proverbs 30:5** *(current-edition)* — ““Every word of God is flawless. He is a shield to those who take refuge in him.”
  Agur's confession of the word's purity; v6 (the add-nothing clause) is anchored under no-other-gospel. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **John 17:17** *(current-edition)* — “Sanctify them in your truth. Your word is truth.”
  Jesus' own predication, in prayer rather than polemic — the word's truth as the medium of the disciples' sanctification. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

---

### 15. `power-of-gods-word` — PENDING-TAG-GAP

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** God's word endures forever, cannot be broken, and accomplishes what he sends it to do.

**Anchors (8):**

- **Isaiah 40:8** *(pinned)* — “The grass withers, the flower fades; but the word of our God stands forever.””
  The comfort chapter's ground: everything human withers; the word of our God stands forever. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Isaiah 55:10-11** *(pinned)* — “For as the rain comes down and the snow from the sky, and doesn’t return there, but waters the earth, and makes it grow and bud, and gives seed to the sower and bread to the eater; so is my word that goes out of my mouth: it will not return to me void, but it will accomplish that which I please, and it will prosper in the thing I sent it to do.”
  Efficacy as God's own simile — like rain and snow, the word accomplishes what it is sent to do. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Matthew 24:35** *(pinned)* — “Heaven and earth will pass away, but my words will not pass away.”
  Olivet discourse: Jesus stakes the certainty of his words above the permanence of creation. Caveat: teaches the indestructible certainty of Jesus' words, not a claim about manuscript transmission — the transmission application belongs to the map document, attributed, never the gist. Dual claim: studying-the-word already anchors 24:35. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Matthew 5:18** *(pinned)* — “For most certainly, I tell you, until heaven and earth pass away, not even one smallest letter or one tiny pen stroke shall in any way pass away from the law, until all things are accomplished.”
  Jesus' estimate of the law's permanence down to the smallest letter, inside his claim to fulfill rather than destroy (5:17). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **John 10:35** *(current-edition)* — “If he called them gods, to whom the word of God came (and the Scripture can’t be broken),”
  The parenthesis is load-bearing: Jesus' argument leans on a single word of Ps 82 being indissoluble. Handling per the disputed-texts table: only the unbreakability clause is anchored; the 'you are gods' deification misuse is never anchored (a-fortiori argument handled inside deity-of-christ explanations, Worker D). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **1 Peter 1:24-25** *(pinned)* — “For, “All flesh is like grass, and all of man’s glory like the flower in the grass. The grass withers, and its flower falls; but the Lord’s word endures forever.” This is the word of Good News which was preached to you.”
  Isa 40 quoted and applied by an apostle to the preached gospel — the enduring word identified with the message the readers received. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Hebrews 4:12** *(pinned)* — “For the word of God is living and active, and sharper than any two-edged sword, piercing even to the dividing of soul and spirit, of both joints and marrow, and is able to discern the thoughts and intentions of the heart.”
  The efficacy register: the word as living agent, not inert text. Dual claim noted: studying-the-word anchors it (torrey) in the engagement register. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Psalm 119:89** *(current-edition)* — “LORD, your word is settled in heaven forever.”
  Permanence located in God's own settled decree. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

---

### 16. `no-other-gospel` — NEW-MINT

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** The gospel received from the apostles is final and complete; any different 'good news' — whoever brings it, even an angel from heaven — is rejected.

**Anchors (7):**

- **Galatians 1:8** *(pinned)* — “But even though we, or an angel from heaven, should preach to you any “good news” other than that which we preached to you, let him be cursed.”
  Written against rival teachers in Galatia (1:6-7): the test is content-identity with the received gospel, and the messenger's rank — apostle or angel — cannot legitimize a different message. The passage's own argument, not an application; directly serves the angelic-revelation claim (map §6.1 claim 5c). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **2 Corinthians 11:4** *(current-edition)* — “For if he who comes preaches another Jesus whom we didn’t preach, or if you receive a different spirit which you didn’t receive, or a different “good news” which you didn’t accept, you put up with that well enough.”
  Paul fears the church being led from 'the simplicity that is in Christ' (v3) toward another Jesus, a different spirit, a different 'good news' — the text's own three-part category, and the pastoral close of the map's first conversation. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **2 Corinthians 11:13-14** *(current-edition)* — “For such men are false apostles, deceitful workers, masquerading as Christ’s apostles. And no wonder, for even Satan masquerades as an angel of light.”
  Same argument, continued: angelic appearance does not authenticate a message. Stated as what the text says of Paul's rivals; the gist names no modern group. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Jude 1:3** *(current-edition)* — “Beloved, while I was very eager to write to you about our common salvation, I was constrained to write to you exhorting you to contend earnestly for the faith which was once for all delivered to the saints.”
  'Once for all delivered' is the finality claim; v4 supplies the occasion. Coordination: Jude 3 is the seat of pending contending-for-the-faith — proposal: that row keeps the contend/guard register, this concept the once-for-all finality register; if Jesse prefers one concept, no-other-gospel can absorb it. One decision, not two mints. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Deuteronomy 4:2** *(current-edition)* — “You shall not add to the word which I command you, neither shall you take away from it, that you may keep the commandments of the LORD your God which I command you.”
  Caveat: in context the command concerns the statutes Israel received; the honest claim is the principle that God's word is not to be supplemented or diminished by human addition. Whole-canon application is application, not the verse's own claim. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Proverbs 30:6** *(current-edition)* — “Don’t you add to his words, lest he reprove you, and you be found a liar.”
  The add-nothing principle in wisdom register, following directly on 'Every word of God is flawless' (30:5, anchored under trustworthiness-of-scripture). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Revelation 22:18-19** *(current-edition)* — “I testify to everyone who hears the words of the prophecy of this book: if anyone adds to them, God will add to him the plagues which are written in this book. If anyone takes away from the words of the book of this prophecy, God will take away his part from the tree of life, and out of the holy city, which are written in this book.”
  Caveat is the anchor's honest shape: 'the words of the book of this prophecy' is Revelation itself (broad consensus, incl. conservative treatments). Anchored as the canon's closing instance of the add-nothing principle (echoing Deut 4:2; Prov 30:6), never as a whole-Bible proof-text; weight below the Galatians/2 Corinthians anchors. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://bib.irr.org/revelation-2218-19-and-canon-of-scripture; https://www.gotquestions.org/Revelation-22-18-19.html)*

---

### 17. `false-prophets` — PENDING-TAG-GAP

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** Scripture's own tests for anyone who claims to speak for God — fulfillment, fidelity to the true God, confession of Christ, and fruits — and its warnings against false prophets and teachers.

**Anchors (9):**

- **Deuteronomy 18:21-22** *(current-edition)* — “You may say in your heart, “How shall we know the word which the LORD has not spoken?” When a prophet speaks in the LORD’s name, if the thing doesn’t follow, nor happen, that is the thing which the LORD has not spoken. The prophet has spoken it presumptuously. You shall not be afraid of him.”
  The statute's own criterion, framed as an answer to the audience's own question (v21): the unfulfilled word exposes presumption. Application to any modern movement lives in fixtures and the map document, never in gist wording (brief disputed-texts row). Closes map §6.2. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://www.gotquestions.org/false-prophets.html; http://www.crivoice.org/prophetdeut18.html; https://gobible.org/bible_study/tpg/tpg-l6-tp/)*

- **Deuteronomy 13:1-3** *(current-edition)* — “If a prophet or a dreamer of dreams arises among you, and he gives you a sign or a wonder, and the sign or the wonder comes to pass, of which he spoke to you, saying, “Let’s go after other gods” (which you have not known) “and let’s serve them,” you shall not listen to the words of that prophet, or to that dreamer of dreams; for the LORD your God is testing you, to know whether you love the LORD your God with all your heart and with all your soul.”
  The companion statute: a sign that comes true does not validate a prophet who calls to other gods — the doctrinal test outranks the sign test. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://www.gotquestions.org/false-prophets.html; http://www.crivoice.org/prophetdeut18.html; https://gobible.org/bible_study/tpg/tpg-l6-tp/)*

- **1 John 4:1** *(pinned)* — “Beloved, don’t believe every spirit, but test the spirits, whether they are of God, because many false prophets have gone out into the world.”
  The command to test the spirits, with vv2-3 supplying the confessional criterion (Jesus Christ come in the flesh). Serves map §6.1 claim 5c. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Matthew 7:15-16** *(pinned)* — ““Beware of false prophets, who come to you in sheep’s clothing, but inwardly are ravening wolves. By their fruits you will know them. Do you gather grapes from thorns or figs from thistles?”
  Jesus' fruits test, in the Sermon's closing warnings — appearance deceives; outcomes testify. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Matthew 24:24** *(pinned)* — “For false christs and false prophets will arise, and they will show great signs and wonders, so as to lead astray, if possible, even the chosen ones.”
  Great signs cannot authenticate a messenger — Jesus' own warning inside the Olivet discourse. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **2 Peter 2:1** *(current-edition)* — “But false prophets also arose among the people, as false teachers will also be among you, who will secretly bring in destructive heresies, denying even the Master who bought them, bringing on themselves swift destruction.”
  The bridge verse: the OT phenomenon (false prophets) and the church-age phenomenon (false teachers) named as one continuum in a single sentence — the textual ground for merging false-teachers into this concept (decision D1). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **1 Thessalonians 5:20-21** *(pinned)* — “Don’t despise prophecies. Test all things, and hold firmly that which is good.”
  The balanced apostolic register: testing commanded without contempt for prophecy — why the concept adjudicates no continuationist question (DOCTRINAL-BASIS §4 non-criterion). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Acts 17:11** *(pinned)* — “Now these were more noble than those in Thessalonica, in that they received the word with all readiness of mind, examining the Scriptures daily to see whether these things were so.”
  Anti-tagging check passed: the narrator commends the practice ('more noble') — the passage depicts testing claims against Scripture, it is not merely used for it. Cross-ref studying-the-word. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Isaiah 8:20** *(current-edition)* — “Turn to the law and to the covenant! If they don’t speak according to this word, surely there is no morning for them.”
  In context (8:19) the alternative on offer is consulting mediums and wizards; the measure of any voice is whether it speaks according to this word. Cross-ref pending occult-and-divination. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://www.gotquestions.org/false-prophets.html; http://www.crivoice.org/prophetdeut18.html; https://gobible.org/bible_study/tpg/tpg-l6-tp/)*

---

### 18. `jesus-the-only-way` — NEW-MINT

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** Salvation is found in Christ alone — the one way to the Father, the one saving name, the one mediator between God and men.

**Anchors (9):**

- **John 14:6** *(pinned)* — “Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father, except through me.”
  The Farewell-discourse answer to Thomas's 'how can we know the way?' (14:5) — the exclusive clause is the verse's own second half, not an inference. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://blog.truthforlife.org/the-exclusivity-of-christ-in-a-pluralistic-culture; https://www.gotquestions.org/religious-pluralism.html)*

- **Acts 4:12** *(pinned)* — “There is salvation in no one else, for there is no other name under heaven that is given among men, by which we must be saved!””
  Peter before the council, about the crucified and risen Jesus (4:10-11) — the no-other-name claim in the church's first public defense. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://blog.truthforlife.org/the-exclusivity-of-christ-in-a-pluralistic-culture; https://www.gotquestions.org/religious-pluralism.html)*

- **1 Timothy 2:5-6** *(current-edition)* — “For there is one God and one mediator between God and men, the man Christ Jesus, who gave himself as a ransom for all, the testimony at the proper time,”
  One God, one mediator — and the context (2:1-4, God 'desires all people to be saved') holds exclusivity and the universal offer in the same breath; the concept must keep both. Cross-ref pending mediator (Job 9:33 register) — coordinate, don't duplicate. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://blog.truthforlife.org/the-exclusivity-of-christ-in-a-pluralistic-culture; https://www.gotquestions.org/religious-pluralism.html)*

- **John 3:36** *(pinned)* — “One who believes in the Son has eternal life, but one who disobeys the Son won’t see life, but the wrath of God remains on him.””
  The two-outcome structure — life or remaining wrath — turns entirely on the Son. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **1 John 5:11-12** *(pinned)* — “The testimony is this: that God gave to us eternal life, and this life is in his Son. He who has the Son has the life. He who doesn’t have God’s Son doesn’t have the life.”
  Life located in the Son, so that having him and having life are one — John's summary testimony. Cross-ref pending eternal-life, witness-testimony. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **John 10:9** *(current-edition)* — “I am the door. If anyone enters in by me, he will be saved, and will go in and go out and will find pasture.”
  The shepherd discourse's door image: entry to salvation and pasture is through him. Cross-ref pending i-am-sayings (Worker D). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Matthew 7:13-14** *(pinned)* — ““Enter in by the narrow gate; for the gate is wide and the way is broad that leads to destruction, and there are many who enter in by it. How narrow is the gate and the way is restricted that leads to life! There are few who find it.”
  Caveat: in the Sermon the narrow gate is entering life on Jesus' terms; the anchor claims the two-ways structure and 'few find it', not a bare exclusivism slogan. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Isaiah 45:21-22** *(current-edition)* — “Declare and present it. Yes, let them take counsel together. Who has shown this from ancient time? Who has declared it of old? Haven’t I, the LORD? There is no other God besides me, a just God and a Savior. There is no one besides me. “Look to me, and be saved, all the ends of the earth; for I am God, and there is no other.”
  The exclusive-Savior claim joined to a universal call ('Look to me, and be saved, all the ends of the earth'). Boundary: shared ground with pending no-other-god (Worker D) — this pack claims the Savior register, that one the monotheism register; cross-link, don't duplicate. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Acts 17:30-31** *(pinned)* — “The times of ignorance therefore God overlooked. But now he commands that all people everywhere should repent, because he has appointed a day in which he will judge the world in righteousness by the man whom he has ordained; of which he has given assurance to all men, in that he has raised him from the dead.””
  Athens: universal repentance commanded, one appointed man, assurance by resurrection — where the pluralism question meets its apostolic answer. Cross-ref those-who-never-heard and Worker B's resurrection family. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

---

### 19. `giving-an-answer` — NEW-MINT-conditional

*Domain: Scripture & the only way (domains 4+6)*

**Definition:** The believer's readiness to give a gentle, reasoned answer for the hope of the gospel to anyone who asks.

**Anchors (8):**

- **1 Peter 3:15** *(pinned)* — “But sanctify the Lord God in your hearts. Always be ready to give an answer to everyone who asks you a reason concerning the hope that is in you, with humility and fear,”
  The apologia charge itself: readiness, a reason, and the governing manner — 'with humility and fear', with a good conscience (v16). The manner is part of the claim, not a garnish. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://www.crossway.org/articles/what-does-1-peter-315-mean/; https://apologeticsforthechurch.org/the-importance-of-1-peter-315-16-for-apologetics/)*

- **Colossians 4:6** *(current-edition)* — “Let your speech always be with grace, seasoned with salt, that you may know how you ought to answer each one.”
  Addressed to conduct 'toward those who are outside' (4:5) — answering outsiders, each one particularly, with grace. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Acts 17:2-3** *(pinned)* — “Paul, as was his custom, went in to them; and for three Sabbath days reasoned with them from the Scriptures, explaining and demonstrating that the Christ had to suffer and rise again from the dead, and saying, “This Jesus, whom I proclaim to you, is the Christ.””
  Anti-tagging check passed: the narrative depicts reasoned persuasion as Paul's custom — explaining and demonstrating from the Scriptures — not merely a passage recruited by apologists. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md); https://www.crossway.org/articles/what-does-1-peter-315-mean/; https://apologeticsforthechurch.org/the-importance-of-1-peter-315-16-for-apologetics/)*

- **Acts 26:25** *(current-edition)* — “But he said, “I am not crazy, most excellent Festus, but boldly declare words of truth and reasonableness.”
  Inside a formal defense before Agrippa (26:1-2): truth and reasonableness as the apostle's own description of his speech. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Philippians 1:7** *(pinned)* — “It is even right for me to think this way on behalf of all of you, because I have you in my heart, because both in my bonds and in the defense and confirmation of the Good News, you all are partakers with me of grace.”
  'The defense and confirmation of the Good News' — Paul's own category for the work, shared with the whole church ('you all are partakers'). *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Philippians 1:17** *(pinned)* — “but the latter out of love, knowing that I am appointed for the defense of the Good News.”
  Paul 'appointed for the defense of the Good News'. Versification note: WEB follows the majority-text order of vv16-17; this clause appears at v16 in critical-text versions. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **2 Corinthians 10:5** *(pinned)* — “throwing down imaginations and every high thing that is exalted against the knowledge of God and bringing every thought into captivity to the obedience of Christ,”
  Caveat: the context (10:3-4) is Paul's conflict with opponents of his ministry, a warfare metaphor; the honest claim is that arguments raised against the knowledge of God are to be demolished. Never licenses combativeness — 1 Pet 3:15's humility clause governs the register. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

- **Titus 1:9** *(current-edition)* — “holding to the faithful word which is according to the teaching, that he may be able to exhort in the sound doctrine, and to convict those who contradict him.”
  Boundary note: elder-qualification context; ability to answer contradiction is required of overseers specifically. Borders pending contending-for-the-faith; keep at low weight or rehome there at integration. *(Sources: editorial (LH theological judgment; provenance-visible per ontology/README.md))*

---

## Domain D — The Jesus of the Bible (brief domains 7 + 8)

Serves both uploaded conversations. Worker D's bodily-resurrection set is merged into the Domain B `resurrection` entry (coordination honored; nothing minted twice). Disputed texts (Col 1:15; John 1:1; Isa 7:14; Isa 9:6; Mic 5:2; Ps 82/John 10:34; Prov 8:22) carry the brief's recorded handling.

### 20. `deity-of-christ` — EXISTING-extension

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** Jesus is fully God — the eternal Word and Creator, bearing divine titles and prerogatives.

**Anchors (11):**

- **John 1:1** *(pinned)* — “In the beginning was the Word, and the Word was with God, and the Word was God.”
  The Word is both distinct from God ('with God') and fully God ('was God'). The 'a god' rendering is a known contested reading; the WEB text is quoted exactly and the anarthrous-theos grammar debate stays out of display justifications; engine-side this is an editorial-attributed anchor. Verse 3 closes the door on a created Word. *(Sources: gotquestions-word-was-a-god; equip-john11-nwt; editorial)*

- **John 1:3** *(pinned)* — “All things were made through him. Without him, nothing was made that has been made.”
  Exhaustive clause: everything in the category 'made things' was made through the Word, so the Word cannot belong to that category — the standard consensus reading of the verse's own logic. *(Sources: scoping-brief; editorial)*

- **John 8:58** *(pinned)* — “Jesus said to them, “Most certainly, I tell you, before Abraham came into existence, I AM.””
  Present-tense existence before Abraham — 'I AM', capitalized by the WEB itself, marking the Exodus 3:14 allusion (standard consensus reading, signposted). The hearers' move to stone him (8:59) shows they heard a divine claim. *(Sources: gotquestions-word-was-a-god; editorial)*

- **John 10:30-33** *(current-edition)* — “I and the Father are one.” Therefore the Jews took up stones again to stone him. Jesus answered them, “I have shown you many good works from my Father. For which of those works do you stone me?” The Jews answered him, “We don’t stone you for a good work, but for blasphemy, because you, being a man, make yourself God.””
  His audience understood a claim to deity and answered with the blasphemy charge. Jesus' Psalm 82 reply (10:34) is an a-fortiori argument, not a retraction — he restates the claim at 10:38. Psalm 82 itself is never anchored to this or any deification concept (see declined). *(Sources: gotquestions-you-are-gods; editorial)*

- **John 17:5** *(current-edition)* — “Now, Father, glorify me with your own self with the glory which I had with you before the world existed.”
  Jesus asks for the return of glory he personally possessed with the Father before creation — pre-existence and shared divine glory in his own prayer. *(Sources: scoping-brief; editorial)*

- **John 20:28-29** *(current-edition)* — “Thomas answered him, “My Lord and my God!” Jesus said to him, “Because you have seen me, you have believed. Blessed are those who have not seen and have believed.””
  Thomas addresses the risen Jesus as 'my God' ('answered him' — addressed to Jesus, not past him), and Jesus blesses the belief rather than correcting it, holding it up as the model confession. *(Sources: bibleref-john523; scoping-brief)*

- **Colossians 2:9** *(current-edition)* — “For in him all the fullness of the Deity dwells bodily,”
  Not a portion but 'all the fullness of the Deity', dwelling 'bodily' — full deity in the incarnate Christ, grounding the letter's warning against other teaching (2:8). *(Sources: scoping-brief)*

- **Titus 2:13** *(pinned)* — “looking for the blessed hope and appearing of the glory of our great God and Savior, Jesus Christ,”
  The WEB text itself joins 'our great God and Savior' as one pair of titles borne by 'Jesus Christ'. The one-article Greek construction stays out of display wording; the plain English carries the point. *(Sources: scoping-brief; editorial)*

- **Isaiah 9:6 with Isaiah 10:21** *(current-edition)* — “For a child is born to us. A son is given to us; and the government will be on his shoulders. His name will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace. … A remnant will return, even the remnant of Jacob, to the mighty God.”
  The royal child bears the name 'Mighty God', and one chapter later Isaiah uses the identical title for the God of Jacob (10:21) — within Isaiah's usage it is not a lesser-divinity category. Honest scope: the identification of the child with Jesus is NT-attributed fact (Matt 4:15-16 cites Isa 9:1-2), never adjudicated fulfillment; no Christ-fulfillment display tag lands on Isaiah 9 itself. *(Sources: carm-isa96; creation-isa96; editorial)*

- **Micah 5:2** *(current-edition)* — “But you, Bethlehem Ephrathah, being small among the clans of Judah, out of you one will come out to me who is to be ruler in Israel; whose goings out are from of old, from ancient times.”
  The Bethlehem ruler's 'goings out are from of old, from ancient times' — origins before his birth. Flagged honestly: WEB reads weaker than KJV's 'from everlasting'; an eternality argument rests on the Hebrew, so the justification claims ancient pre-existence language only. The Bethlehem citation (Matt 2:5-6) is attributed fact; no fulfillment tag on Micah 5 itself. *(Sources: scoping-brief; editorial)*

- **Philippians 2:6-7** *(current-edition)* — “who, existing in the form of God, didn’t consider equality with God a thing to be grasped, but emptied himself, taking the form of a servant, being made in the likeness of men.”
  Christ's starting point is 'existing in the form of God' with 'equality with God' his to hold — the humbling presupposes the height. The consensus reading of 'emptied himself' is renunciation of privilege by taking servanthood (the verse's own definition), not subtraction of deity; signposted as the standard reading. Exaltation half (2:9-11) anchored under honor-the-son. *(Sources: crossway-deity-list; scoping-brief; editorial)*

---

### 21. `no-other-god` — PENDING-TAG-GAP

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** There is one God only — none formed before him, none after, none besides. (Isaiah-minted tag-gap row; extend it, do not mint beside it; its overlap question with idolatry remains one pending call. Also the honest answer-ground for exaltation / humans-becoming-gods queries — the engine reports what the texts say, never argues.)

**Anchors (11):**

- **Deuteronomy 6:4** *(pinned)* — “Hear, Israel: The LORD is our God. The LORD is one.”
  The Shema — Israel's foundational confession that the LORD is one; the verse both source conversations turn on. *(Sources: str-mormon-verses; scoping-brief)*

- **Deuteronomy 4:35** *(current-edition)* — “It was shown to you so that you might know that the LORD is God. There is no one else besides him.”
  Moses states the purpose of the exodus signs: to teach that the LORD alone is God — 'no one else besides him', reinforced at 4:39 ('God in heaven above and on the earth beneath. There is no one else.'). *(Sources: scoping-brief)*

- **Isaiah 43:10** *(pinned)* — ““You are my witnesses,” says the LORD, “With my servant whom I have chosen; that you may know and believe me, and understand that I am he. Before me there was no God formed, neither will there be after me.”
  God's own testimony excludes gods in both directions of time — none formed before, none after. In context the ground of Israel's witness against the idols (43:9-12). Keystone text for become-gods queries, stated purely as what the verse says. *(Sources: aomin-mormon-verses; scoping-brief)*

- **Isaiah 43:11** *(pinned)* — “I myself am the LORD. Besides me, there is no savior.”
  Exclusive saviorhood belongs to the LORD — no rival savior beside him. The NT confession of Jesus as Savior is handled under deity-of-christ, not read back into Isaiah 43's display tags. *(Sources: scoping-brief)*

- **Isaiah 44:6** *(current-edition)* — “This is what the LORD, the King of Israel, and his Redeemer, the LORD of Armies, says: “I am the first, and I am the last; and besides me there is no God.”
  The first-and-last title is paired in the same breath with 'besides me there is no God' — the title is exclusive by Isaiah's own logic. Shared anchor with the-first-and-the-last. *(Sources: scoping-brief)*

- **Isaiah 44:8** *(current-edition)* — “Don’t fear, neither be afraid. Haven’t I declared it to you long ago, and shown it? You are my witnesses. Is there a God besides me? Indeed, there is not. I don’t know any other Rock.””
  God poses and answers the question directly — 'Is there a God besides me? Indeed, there is not' — adding that even he knows no other Rock; the strongest closure against undiscovered gods. *(Sources: aomin-mormon-verses)*

- **Isaiah 44:24** *(current-edition)* — “The LORD, your Redeemer, and he who formed you from the womb says: “I am the LORD, who makes all things; who alone stretches out the heavens; who spreads out the earth by myself;”
  Creation was solo work — 'alone... by myself' — no council of creator-gods. The NT places the Word/Son inside that solo act (John 1:3; Col 1:16); that synthesis is stated in the NT anchors, not read back onto Isaiah 44's tags. *(Sources: scoping-brief; editorial)*

- **Isaiah 45:21-22** *(current-edition)* — “Declare and present it. Yes, let them take counsel together. Who has shown this from ancient time? Who has declared it of old? Haven’t I, the LORD? There is no other God besides me, a just God and a Savior. There is no one besides me. “Look to me, and be saved, all the ends of the earth; for I am God, and there is no other.”
  Monotheism stated as invitation — because there is no other God, all the ends of the earth are told to look to him alone for salvation. *(Sources: scoping-brief)*

- **Isaiah 46:9** *(current-edition)* — “Remember the former things of old; for I am God, and there is no other. I am God, and there is none like me.”
  Both uniqueness claims in one verse: no other God exists, and none is even like him — against plural gods and against godhood as an attainable class. *(Sources: aomin-mormon-verses)*

- **1 Kings 8:60** *(current-edition)* — “that all the peoples of the earth may know that the LORD himself is God. There is no one else.”
  Solomon's temple-dedication prayer aims at a missionary truth: all peoples are to know the LORD alone is God. *(Sources: scoping-brief)*

- **Psalm 96:5** *(current-edition)* — “For all the gods of the peoples are idols, but the LORD made the heavens.”
  The psalm's own contrast: the nations' gods are idols; the LORD is distinguished from every so-called god by being the Maker. *(Sources: scoping-brief)*

---

### 22. `trinity` — EXISTING-extension

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** One God in three persons — Father, Son, and Holy Spirit. (Reuse; light lexicon extension for query families like 'godhead', 'three persons one God', 'is the Holy Spirit a person'. Anchors below only if the existing pack lacks them.)

**Anchors (5):**

- **Matthew 28:19** *(pinned)* — “Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit,”
  One 'name', three named — Father, Son, and Holy Spirit in the single baptismal formula. The singular-name observation is the standard consensus reading, signposted. *(Sources: scoping-brief; editorial)*

- **2 Corinthians 13:14** *(current-edition)* — “The grace of the Lord Jesus Christ, God’s love, and the fellowship of the Holy Spirit be with you all. Amen.”
  The apostolic benediction blesses the church from all three persons in parallel — grace from the Lord Jesus, love from God, fellowship from the Spirit. *(Sources: scoping-brief)*

- **Matthew 3:16-17** *(current-edition)* — “Jesus, when he was baptized, went up directly from the water: and behold, the heavens were opened to him. He saw the Spirit of God descending as a dove, and coming on him. Behold, a voice out of the heavens said, “This is my beloved Son, with whom I am well pleased.””
  At the baptism all three are present and distinct in one scene — Son in the water, Spirit descending, Father speaking. Teaches the distinction of persons; the unity side is carried by Deut 6:4 and the no-other-god texts. *(Sources: scoping-brief)*

- **John 14:16-17** *(pinned)* — “I will pray to the Father, and he will give you another Counselor, that he may be with you forever: the Spirit of truth, whom the world can’t receive, for it doesn’t see him and doesn’t know him. You know him, for he lives with you and will be in you.”
  The Spirit is 'another Counselor' — personal like the Son ('him', 'he lives with you'), given by the Father at the Son's asking; the three persons act in one sentence. *(Sources: scoping-brief)*

- **Deuteronomy 6:4** *(pinned)* — “Hear, Israel: The LORD is our God. The LORD is one.”
  The oneness pole of the doctrine — shared anchor with no-other-god. Trinitarian teaching stands on this verse, not against it; anchoring it here guards the concept from tritheistic drift. *(Sources: scoping-brief; editorial)*

---

### 23. `supremacy-of-christ` — PENDING-TAG-GAP

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** Christ preeminent over all — image of the invisible God, agent and goal of creation, head of the church, superior to every angel. (Colossians-minted tag-gap row that already owns Col 1:15-20; check its row before adding anchors; extend with Hebrews 1, do not mint beside it.)

**Anchors (7):**

- **Colossians 1:15** *(pinned)* — “He is the image of the invisible God, the firstborn of all creation.”
  DISPUTED TEXT. 'Firstborn' (prototokos) is a title of rank — preeminent heir over all creation — not first-created: grounded in v.16 (all things without remainder created 'through him and for him', placing him outside the created category), v.18's own gloss ('that in all things he might have the preeminence'), and the OT rank-usage of Ps 89:27 (David appointed 'firstborn', a future appointment to rank). The WEB, matching the Greek, reads 'all things', not 'all other things'. Contested; editorial-attributed so the framing is visibly LH's judgment, stated as the standard conservative-evangelical consensus it is. *(Sources: equip-col115; carm-col115; editorial)*

- **Colossians 1:16** *(pinned)* — “For by him all things were created in the heavens and on the earth, visible things and invisible things, whether thrones or dominions or principalities or powers. All things have been created through him and for him.”
  The 'For' grounds v.15: he is firstborn because all things — enumerated to exclude exceptions, visible and invisible — were created by, through, and for him. Creator of all cannot be a member of 'all'. *(Sources: equip-col115; editorial)*

- **Colossians 1:17** *(pinned)* — “He is before all things, and in him all things are held together.”
  Priority ('before all things') and present sustaining ('held together') — his stated relation to creation is sustainer, not first member. *(Sources: equip-col115; editorial)*

- **Colossians 1:18** *(pinned)* — “He is the head of the body, the assembly, who is the beginning, the firstborn from the dead, that in all things he might have the preeminence.”
  The hymn's purpose clause defines the register of 'firstborn': 'that in all things he might have the preeminence'. 'Firstborn from the dead' is manifestly rank language (he is not the first person ever to be dead), confirming the same sense in v.15. *(Sources: equip-col115; editorial)*

- **Hebrews 1:3** *(current-edition)* — “His Son is the radiance of his glory, the very image of his substance, and upholding all things by the word of his power, who, when he had by himself purified us of our sins, sat down on the right hand of the Majesty on high,”
  The Son is the exact image of God's substance and upholds all things by his own word — the frame for the chapter's argument of his superiority to angels. *(Sources: scoping-brief)*

- **Hebrews 1:8** *(current-edition)* — “But of the Son he says, “Your throne, O God, is forever and ever. The scepter of uprightness is the scepter of your Kingdom.”
  The Father addresses the Son as 'O God' with an everlasting throne (quoting Ps 45:6-7), in a chapter whose explicit argument is the Son's categorical superiority to angels (1:4-5). *(Sources: crossway-deity-list; editorial)*

- **Hebrews 1:10-12** *(current-edition)* — “And, “You, Lord, in the beginning, laid the foundation of the earth. The heavens are the works of your hands. They will perish, but you continue. They all will grow old like a garment does. You will roll them up like a mantle, and they will be changed; but you are the same. Your years won’t fail.””
  Hebrews applies Psalm 102's address to Yahweh — Creator, unchanging while creation wears out — to the Son ('of the Son he says', 1:8 governing the catena). A created being cannot be the one who laid creation's foundation. The Ps 102 application is the author of Hebrews' own attributed citation, stated as such. *(Sources: scoping-brief; editorial)*

---

### 24. `honor-the-son` — NEW-MINT-conditional

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** The Father wills that all honor the Son just as they honor the Father; the risen Jesus rightly receives worship. (Conditional mint: may instead be a lexicon/anchor extension of deity-of-christ — run the extension check and surface the mint-vs-extend call to Jesse. Minting case: the query family is devotional-practice-shaped, distinct from identity-shaped deity queries.)

**Anchors (8):**

- **John 5:22-23** *(current-edition)* — “For the Father judges no one, but he has given all judgment to the Son, that all may honor the Son, even as they honor the Father. He who doesn’t honor the Son doesn’t honor the Father who sent him.”
  The Father's stated purpose in committing all judgment to the Son is that all honor the Son 'even as' they honor the Father; withholding that honor from the Son forfeits it toward the Father. The equivalence is the verse's own wording, not an inference. *(Sources: bibleref-john523; biblehub-john523)*

- **John 20:28-29** *(current-edition)* — “Thomas answered him, “My Lord and my God!” Jesus said to him, “Because you have seen me, you have believed. Blessed are those who have not seen and have believed.””
  The model confession Jesus blesses is worship-language addressed to himself. Shared anchor with deity-of-christ; here it carries the devotional-practice register. *(Sources: scoping-brief)*

- **Hebrews 1:6** *(current-edition)* — “When he again brings in the firstborn into the world he says, “Let all the angels of God worship him.””
  God himself commands the angels to worship the Son — worship ordered by the Father, in the chapter that ranks the Son above every angel. 'Firstborn' carries the rank sense established at Col 1:15/18. *(Sources: bibleref-john523; editorial)*

- **Philippians 2:9-11** *(current-edition)* — “Therefore God also highly exalted him, and gave to him the name which is above every name, that at the name of Jesus every knee should bow, of those in heaven, those on earth, and those under the earth, and that every tongue should confess that Jesus Christ is Lord, to the glory of God the Father.”
  DISPUTED TEXT. Universal homage — every knee, every tongue — is directed at Jesus, echoing Isaiah 45:23 ('to me every knee shall bow, every tongue shall take an oath'), Yahweh's oath about himself amid Isaiah's no-other-god chapter; and this glorifies rather than rivals the Father. Honest scope: the exaltation is of the humbled incarnate Christ of vv.6-8, so it presupposes rather than confers divine status — standard consensus reading, signposted; the Isa 45:23 echo is stated as an echo, not read back onto Isaiah 45's tags. *(Sources: crossway-deity-list; editorial)*

- **Matthew 14:33** *(current-edition)* — “Those who were in the boat came and worshiped him, saying, “You are truly the Son of God!””
  After the walking on water, the disciples' response is worship joined to confession, and Jesus receives it — the narrative records no correction. *(Sources: scoping-brief)*

- **Matthew 28:9** *(pinned)* — “As they went to tell his disciples, behold, Jesus met them, saying, “Rejoice!” They came and took hold of his feet, and worshiped him.”
  The risen Jesus accepts worship from the women — a deliberate narrative contrast with angels and apostles, who refuse it (Rev 19:10; 22:8-9 'Worship God'; Acts 10:25-26, all current-edition-verified). Every faithful creature deflects worship; Jesus receives it — descriptive of the texts, stated as the consensus observation it is. *(Sources: gotquestions-you-are-gods; editorial)*

- **Matthew 28:17** *(pinned)* — “When they saw him, they bowed down to him; but some doubted.”
  The Eleven's response to the risen Christ is prostration — and the narrator's candor about doubt strengthens the report's honesty. *(Sources: scoping-brief)*

- **Revelation 5:13** *(current-edition)* — “I heard every created thing which is in heaven, on the earth, under the earth, on the sea, and everything in them, saying, “To him who sits on the throne and to the Lamb be the blessing, the honor, the glory, and the dominion, forever and ever! Amen!””
  Heaven's liturgy directs identical praise 'to him who sits on the throne and to the Lamb' in a single doxology — and the choir is 'every created thing', placing the Lamb on the receiving side of creation's worship, not among the worshipers. *(Sources: scoping-brief; editorial)*

---

### 25. `the-first-and-the-last` — NEW-MINT-conditional

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** 'The first and the last' / 'the Alpha and Omega' — the divine self-title of Yahweh in Isaiah, borne by the risen Jesus in Revelation. (Conditional mint: possibly folds into deity-of-christ — one design call, surfaced to Jesse. Title-locator pattern precedent: christ-the-cornerstone, tag-gap the-branch.)

**Anchors (9):**

- **Isaiah 41:4** *(pinned)* — “Who has worked and done it, calling the generations from the beginning? I, the LORD, the first, and with the last, I am he.””
  The title's first sounding: the LORD identifies himself as 'the first, and with the last' — before history and outlasting it. *(Sources: scoping-brief)*

- **Isaiah 44:6** *(current-edition)* — “This is what the LORD, the King of Israel, and his Redeemer, the LORD of Armies, says: “I am the first, and I am the last; and besides me there is no God.”
  Isaiah's own logic makes the title exclusive — 'I am the first, and I am the last' in the same breath as 'besides me there is no God'. Whoever truly bears the title cannot be a second, lesser divine being; the text forecloses that category itself. *(Sources: scoping-brief; editorial)*

- **Isaiah 48:12** *(current-edition)* — ““Listen to me, O Jacob, and Israel my called: I am he. I am the first. I am also the last.”
  The third Isaian sounding, joined to the 'I am he' formula — a fixed self-designation of Yahweh, not a one-off metaphor. *(Sources: scoping-brief)*

- **Revelation 1:8** *(pinned)* — ““I am the Alpha and the Omega,” says the Lord God, “who is and who was and who is to come, the Almighty.””
  'Alpha and Omega' introduced as the Lord God's own title, joined to 'the Almighty'. Honest scope: many readers take 1:8's speaker as the Father — the concept's argument rests on the chain that follows (1:17-18; 2:8; 22:12-13, 20), which fixes the same title on the risen Jesus. *(Sources: scoping-brief; editorial)*

- **Revelation 1:17-18** *(pinned)* — “When I saw him, I fell at his feet like a dead man. He laid his right hand on me, saying, “Don’t be afraid. I am the first and the last, and the Living one. I was dead, and behold, I am alive forever and ever. Amen. I have the keys of Death and of Hades.”
  The speaker claiming Isaiah's title 'the first and the last' self-identifies as the one who 'was dead, and behold, I am alive forever' — unambiguously the risen Jesus. The concept's hinge verse. *(Sources: scoping-brief; editorial)*

- **Revelation 2:8** *(current-edition)* — ““To the angel of the assembly in Smyrna write: “The first and the last, who was dead, and has come to life says these things:”
  The letter-opening formula repeats the identification — 'the first and the last' is expressly the one 'who was dead, and has come to life'. A second independent witness inside Revelation. *(Sources: scoping-brief)*

- **Revelation 21:6** *(pinned)* — “He said to me, “I am the Alpha and the Omega, the Beginning and the End. I will give freely to him who is thirsty from the spring of the water of life.”
  The enthroned speaker stacks the title's forms — Alpha and Omega, Beginning and End — and attaches the living-water promise, tying the title to the gift of salvation. *(Sources: scoping-brief)*

- **Revelation 22:12-13** *(current-edition)* — ““Behold, I am coming soon! My reward is with me, to repay to each man according to his work. I am the Alpha and the Omega, the First and the Last, the Beginning and the End.”
  The coming Judge who repays each person claims all three forms of the title at once. Read with 22:20, the 'I am coming' speaker is named. *(Sources: scoping-brief)*

- **Revelation 22:20** *(current-edition)* — “He who testifies these things says, “Yes, I am coming soon.” Amen! Yes, come, Lord Jesus!”
  The book's closing identifies the 'I am coming soon' speaker of 22:12-13: the church's answering prayer is 'come, Lord Jesus'. The identification is Revelation's own, three verses later — attributed to the text, not imposed on it. *(Sources: scoping-brief; editorial)*

---

### 26. `virgin-birth` — NEW-MINT-conditional

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** Jesus was conceived by the Holy Spirit and born of the virgin Mary. (Conditional mint: existing incarnation may cover by lexicon extension; the mint-vs-extend call is surfaced to Jesse per the brief. Minting case: doctrinal core point 3 names the virgin birth separately and the query family is distinct.)

**Anchors (7):**

- **Matthew 1:18** *(current-edition)* — “Now the birth of Jesus Christ was like this: After his mother, Mary, was engaged to Joseph, before they came together, she was found pregnant by the Holy Spirit.”
  Both halves of the doctrine in one verse: conception 'before they came together', and its cause — 'by the Holy Spirit'. *(Sources: gotquestions-virgin-birth)*

- **Matthew 1:20** *(current-edition)* — “But when he thought about these things, behold, an angel of the Lord appeared to him in a dream, saying, “Joseph, son of David, don’t be afraid to take to yourself Mary as your wife, for that which is conceived in her is of the Holy Spirit.”
  The angel's word to Joseph independently attributes the conception to the Holy Spirit — doubly attested within the chapter. *(Sources: gotquestions-virgin-birth)*

- **Matthew 1:22-23** *(current-edition)* — “Now all this has happened that it might be fulfilled which was spoken by the Lord through the prophet, saying, “Behold, the virgin shall be with child, and shall give birth to a son. They shall call his name Immanuel,” which is, being interpreted, “God with us.””
  Matthew himself cites Isaiah 7:14 of this birth and supplies the translation 'God with us'. The fulfillment claim is Matthew's own attributed citation — quoted as such, with no adjudication added. *(Sources: gotquestions-virgin-birth)*

- **Matthew 1:25** *(current-edition)* — “and didn’t know her sexually until she had given birth to her firstborn son. He named him Jesus.”
  The narrator states plainly that Mary's virginity continued until after the birth — closing the natural-conception alternative on the narrative's own terms. *(Sources: gotquestions-virgin-birth)*

- **Luke 1:34-35** *(current-edition)* — “Mary said to the angel, “How can this be, seeing I am a virgin?” The angel answered her, “The Holy Spirit will come on you, and the power of the Most High will overshadow you. Therefore also the holy one who is born from you will be called the Son of God.”
  Luke's independent account: Mary's own objection establishes her virginity, and the angel grounds the title 'Son of God' in the Spirit's overshadowing — divine, not human, paternity, with no physical begetting in the text: the stated means is the Spirit's power. *(Sources: gotquestions-virgin-birth)*

- **Isaiah 7:14** *(current-edition)* — “Therefore the Lord himself will give you a sign. Behold, the virgin will conceive, and bear a son, and shall call his name Immanuel.”
  DISPUTED TEXT. In its own chapter, a sign to Ahaz with a near horizon (7:15-16); the identification with Jesus' birth is Matthew's attributed citation (Matt 1:22-23), never adjudicated fulfillment — per the messianic-prophecy locator rule NO display tag for this concept ever lands on Isaiah 7 itself; any engine anchor on it is editorial-attributed. Honest scope: the almah/parthenos question is real scholarly territory; the WEB reads 'the virgin', and the concept's claim rests on Matthew and Luke's explicit narratives, not on Isaiah 7:14 standing alone. *(Sources: gotquestions-virgin-birth; editorial)*

- **Galatians 4:4** *(current-edition)* — “But when the fullness of the time came, God sent out his Son, born to a woman, born under the law,”
  Paul's earliest-strand formula names only a mother — 'born to a woman' — for the Son whom God 'sent out'. Honest scope: corroborating, not independently demonstrative. *(Sources: gotquestions-virgin-birth)*

---

### 27. `grace-not-earned` — EXISTING-extension

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** Salvation is God's gift received by faith — not earned, completed, or topped up by works. (Reuse; NO new id — lexicon/fixture work only, e.g. the 'saved by grace after all we can do' query family. Coordinate with justification-by-faith and faith-and-works; the works-as-fruit relation of James 2 belongs to faith-and-works and is not adjudicated here.)

**Anchors (6):**

- **Ephesians 2:8-9** *(pinned)* — “for by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast.”
  The definitional text: by grace, through faith, 'not of yourselves... not of works', with the stated purpose that boasting is excluded. Doctrinal core point 5 ('a gift, not a technique') is this verse's own logic. *(Sources: str-mormon-verses; scoping-brief)*

- **Isaiah 64:6** *(current-edition)* — “For we have all become like one who is unclean, and all our righteousness is like a polluted garment. We all fade like a leaf; and our iniquities, like the wind, take us away.”
  Even 'all our righteousness' — our best works, not our worst — is a polluted garment before God; the reason works cannot be salvation's currency. Context caveat: in 64:5-7 this is Israel's corporate penitential confession under judgment ('you have hidden your face from us'); the verse asserts that even best works are polluted, and the soteriological application is drawn as application — Eph 2:8-9 and Titus 3:5 carry the direct not-by-works teaching. *(Sources: scoping-brief)*

- **Titus 3:5** *(pinned)* — “not by works of righteousness which we did ourselves, but according to his mercy, he saved us through the washing of regeneration and renewing by the Holy Spirit,”
  Salvation's ground stated negatively and positively in one clause — 'not by works of righteousness which we did ourselves, but according to his mercy'. *(Sources: scoping-brief)*

- **Romans 4:4-5** *(current-edition)* — “Now to him who works, the reward is not counted as grace, but as something owed. But to him who doesn’t work, but believes in him who justifies the ungodly, his faith is accounted for righteousness.”
  Paul's wage/gift logic addresses every grace-plus-works synthesis: whatever is worked for is owed, not grace — the categories cannot be blended without destroying the first. *(Sources: scoping-brief)*

- **Galatians 2:16** *(current-edition)* — “yet knowing that a man is not justified by the works of the law but through faith in Jesus Christ, even we believed in Christ Jesus, that we might be justified by faith in Christ and not by the works of the law, because no flesh will be justified by the works of the law.”
  Three times in one verse: justification is through faith in Christ, not by works of the law — emphatic closure against works-completed righteousness. *(Sources: scoping-brief)*

- **2 Timothy 1:9** *(pinned)* — “who saved us and called us with a holy calling, not according to our works, but according to his own purpose and grace, which was given to us in Christ Jesus before times eternal,”
  Salvation runs on God's 'own purpose and grace... before times eternal' — settled before any human work existed to contribute. *(Sources: scoping-brief)*

---

### 28. `gods-unchanging-nature` — PENDING-TAG-GAP

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** God is eternally and unchangeably God — from everlasting, not a man, without variation. (Tag-gap row; extend, do not mint beside it. Honest answer-ground for eternal-progression queries; the engine reports what the texts teach, never argues.)

**Anchors (6):**

- **Malachi 3:6** *(pinned)* — ““For I, the LORD, don’t change; therefore you, sons of Jacob, are not consumed.”
  Unchangeableness in first person — and in context the ground of covenant mercy: Israel survives because the LORD does not change. *(Sources: scoping-brief)*

- **Numbers 23:19** *(current-edition)* — “God is not a man, that he should lie, nor a son of man, that he should repent. Has he said, and he won’t do it? Or has he spoken, and he won’t make it good?”
  'God is not a man' — a contrast of nature grounding a contrast of behavior. Honest scope: the verse's contextual point is God's reliability of word, not a treatise on divine embodiment; anchored for the contrast-of-nature ground the text actually asserts. *(Sources: scoping-brief; editorial)*

- **Psalm 90:2** *(current-edition)* — “Before the mountains were born, before you had formed the earth and the world, even from everlasting to everlasting, you are God.”
  'From everlasting to everlasting, you are God' — deity is not attained; there is no direction of time in which he is other than God. The most direct single text for the concept. *(Sources: aomin-mormon-verses)*

- **Psalm 102:25-27** *(current-edition)* — “Of old, you laid the foundation of the earth. The heavens are the work of your hands. They will perish, but you will endure. Yes, all of them will wear out like a garment. You will change them like a cloak, and they will be changed. But you are the same. Your years will have no end.”
  Creation wears out and is changed; its Maker 'is the same' with unending years — mutability belongs to the made, immutability to the Maker. Hebrews 1:10-12 applies these words to the Son (anchored under supremacy-of-christ as the author's attributed citation). *(Sources: scoping-brief)*

- **James 1:17** *(pinned)* — “Every good gift and every perfect gift is from above, coming down from the Father of lights, with whom can be no variation nor turning shadow.”
  With the Father of lights there 'can be no variation nor turning shadow' — change is not merely absent but impossible ('can be no'). *(Sources: scoping-brief)*

- **Isaiah 43:10** *(pinned)* — ““You are my witnesses,” says the LORD, “With my servant whom I have chosen; that you may know and believe me, and understand that I am he. Before me there was no God formed, neither will there be after me.”
  Shared anchor with no-other-god: no god formed before him and none after — godhood is not a class beings enter, in either direction of time. *(Sources: scoping-brief; editorial)*

---

### 29. `i-am-sayings` — PENDING-TAG-GAP

*Domain: The Jesus of the Bible (domains 7+8)*

**Definition:** Jesus' 'I am' declarations in John — the predicated sayings and the absolute uses. (John-minted tag-gap row; extend it; this contributes the absolute uses that carry the apologetic weight.)

**Anchors (5):**

- **John 8:58** *(pinned)* — “Jesus said to them, “Most certainly, I tell you, before Abraham came into existence, I AM.””
  The absolute use at full strength — the WEB's capitalized 'I AM' marks the Exodus 3:14 allusion (pinned: 'I AM WHO I AM'), stated as the standard consensus reading. Shared anchor with deity-of-christ. *(Sources: gotquestions-word-was-a-god; editorial)*

- **John 8:24** *(pinned)* — “I said therefore to you that you will die in your sins; for unless you believe that I am he, you will die in your sins.””
  Believing 'that I am he' is made the hinge of salvation itself. Honest scope: the WEB supplies 'he' (the Greek is the bare 'I am'); the justification claims only what the English shows, with the fuller ego-eimi observation signposted as a reading. *(Sources: scoping-brief; editorial)*

- **John 6:35** *(current-edition)* — “Jesus said to them, “I am the bread of life. Whoever comes to me will not be hungry, and whoever believes in me will never be thirsty.”
  The first predicated saying: Jesus locates the satisfaction of ultimate hunger and thirst in himself — a self-claim no prophet makes about himself. *(Sources: scoping-brief)*

- **John 11:25** *(pinned)* — “Jesus said to her, “I am the resurrection and the life. He who believes in me will still live, even if he dies.”
  Jesus does not say he will perform the resurrection but that he IS it — resurrection and life located in his person. *(Sources: scoping-brief)*

- **John 18:5-6** *(current-edition)* — “They answered him, “Jesus of Nazareth.” Jesus said to them, “I am he.” Judas also, who betrayed him, was standing with them. When therefore he said to them, “I am he,” they went backward and fell to the ground.”
  At the arrest, the words 'I am he' fell the arresting party to the ground — an effect no ordinary self-identification produces. The divine-name connection is the standard consensus reading of John's narration, signposted; the falling is simply what the text says. *(Sources: scoping-brief; editorial)*

---

## Decisions surfaced to Jesse

Every flag the drafts marked for Jesse, in one decision-ready list. All
are reversible delegated defaults unless marked as recommendations.

1. **resurrection-scoping** — Confirm the one family decision (resolves tag-gaps-review §1(a)): extend existing resurrection with the bodily-evidence register (no witnesses-of-the-resurrection mint); reuse pending resurrection-of-the-dead for the general resurrection and believer's hope; related edge between them. Worker D contributed anchors into this same decision and minted nothing.
2. **why-god-allows-suffering** — Approve the one new question-shaped theodicy umbrella (NEW-MINT). Recorded fallback if the gauntlet shows G8 churn (too broad): fold its lexicon into the two pending registers suffering-of-the-righteous / prosperity-of-the-wicked.
3. **general-revelation-dual-anchors** — Confirm the deliberate dual-anchor design: Rom 1:19-20, Rom 2:14-16, Acts 14:16-17, Acts 17:26-27 each anchor two concepts (creation-testifies / those-who-never-heard / conscience) — general revelation stated once, consumed by two question families — or collapse the pair. This also approves/declines the creation-testifies mint itself.
4. **the-breath-of-life** — Mint vs extend image-of-god. Worker A recommends mint (distinct teaching substance — the God-given spirit/soul, its origin, distinctness, return — and barely-overlapping query families). If extend, every anchor moves onto image-of-god unchanged.
5. **conscience-eccl-3-11** — Eccl 3:11 is anchored on the pending conscience row for the inner-witness register; if the row's final gist is strictly moral-conscience, move or drop that anchor (Worker A's recorded flag).
6. **false-prophets-three-way** — Confirm decision D1 (reversible): one concept under pending false-prophets, absorbing false-teachers (2 Pet 2:1 joins them in one sentence; label suggestion 'False prophets and teachers'); no testing-prophets / test-the-spirits mint — the test register is lexicon.
7. **no-other-gospel-vs-contending** — no-other-gospel (NEW-MINT) vs pending contending-for-the-faith: proposal is two cross-linked concepts (once-for-all finality register vs contend/guard register, Jude 1:3 anchored under no-other-gospel with the coordination recorded); if Jesse prefers one concept, no-other-gospel can absorb the row.
8. **giving-an-answer** — Mint vs fold into existing sharing-your-faith. Worker C recommends mint: the 1 Pet 3:15 answer-those-who-ask register is anchor-disjoint from sharing-your-faith's go-and-tell set (zero overlap, verified against the pack). Sub-decision: Titus 1:9 (elder-qualification context) — keep at low weight or rehome to contending-for-the-faith.
9. **honor-the-son** — Mint vs extend deity-of-christ. Worker D's minting case: the query family ('should we worship Jesus', 'praying to Jesus') is devotional-practice-shaped, distinct from identity-shaped deity queries, and the anchor sets barely overlap.
10. **the-first-and-the-last** — Mint vs fold into deity-of-christ. Minting case: title-locator precedent (christ-the-cornerstone, pending the-branch); title-shaped query family ('alpha and omega'); anchor set spans Isaiah and Revelation in a way neither parent displays well.
11. **virgin-birth** — Mint vs extend existing incarnation. Minting case: doctrinal core point 3 names the virgin birth separately, and the query family ('virgin birth', 'conceived by the Holy Spirit') is distinct from incarnation queries.
12. **ps82-guard-fixture** — RECOMMENDED TO SHIP NOW: a mustNotRank guard fixture against deification / become-gods queries pinning Ps 82:6 out of rank. Ps 82 is in the pinned fixture corpus, so this is shippable immediately (all four drafts concurred; brief disputed-texts table).
13. **movement-naming-lexicon** — May lexicon entries name a movement (e.g. 'what do mormons believe')? Per brief §1.3 this is Jesse's call; drafts kept all gists and lexicon concept-shaped. Audience framing currently lives only in golden-fixture ids (evangelism-mormon-*) and would stay there if declined.
14. **no-other-god-vs-idolatry** — The tag-gap log's recorded pending call: no-other-god vs idolatry — one concept or two. The apologetics extension drafted here touches only the monotheism register and leaves that call open.
15. **rom828-rev214-cross-lists** — Rom 8:28 (owned by remembered-all-things-for-good) and Rev 21:4 (owned by new-heaven-and-earth) are cross-listed on why-god-allows-suffering: decide pack anchors vs lexicon pointers at the owning concepts (Worker B's recorded coordination).
16. **job-19-25-27** — Job 19:25-27 on resurrection-of-the-dead: admit as a low-weight sources:[editorial] anchor with the recorded caveat (Hebrew of v26 famously difficult; 'from my flesh' a live reading — anchors hope-beyond-death as the WEB reads, never a load-bearing bodily-resurrection proof) — or drop.
17. **john-11-25-dual** — John 11:25(-26) is claimed by resurrection-of-the-dead (B) and i-am-sayings (D). Confirm dual anchor (two honest registers) or single anchor + cross-ref (Worker B's coordinate-don't-duplicate flag).
18. **rev-3-14-followup** — Rev 3:14 ('the beginning of God's creation') deferred by Worker D: schedule its arche-as-origin/ruler handling as its own careful treatment, or leave unanchored.
19. **knowing-god-deferral** — Worker A deferred the knowing-god register (Theme C row) — confirm no apologetics-side extension is needed now, or assign it.
20. **corpus-blocked-fixtures** — 116 of 216 anchors are current-edition-verified and largely outside the pinned fixture corpus; golden-fixture assertions on those refs ship status:'pending' with activation notes while docs/corpus-payload-dependency.md reads BLOCKED (and all current-edition quotes re-check when the re-pin PR lands). Confirm this staging.

---

## Declined — considered and rejected (all four drafts, deduped)

1. **Ontological-argument concept id** *(domain A)* — Scripture asserts God's necessary reality; it nowhere teaches Anselm's inference from the concept of a maximal being. No honest anchors exist, so no id. Queries in that register are served by creation (Ps 90:2 — the eternal, unmade God) via lexicon.
2. **origin-of-life / abiogenesis-shaped id** *(domain A)* — Scripture teaches God forming life (Gen 1:11-27; 2:7; Ps 104:24-30), not abiogenesis; an id named for the debate would put the engine on ground the texts don't occupy. Served by creation + design-in-creation + the-breath-of-life lexicons.
3. **maker-of-all-things id** *(domain A)* — Not minted; folded into the creation extension after the brief-mandated reuse check — a neighbour mint would fail G4 and split one concept across two chips.
4. **conscience-and-moral-law id** *(domain A)* — Not minted; folded into the pending conscience tag-gap row per the brief's own instruction ('extend it rather than double-minting').
5. **knowing-god register (Jer 9:23-24 etc.)** *(domain A)* — Deferred, not drafted: the tag-gap row is Theme C and the §8 split does not assign it to Worker A; its natural-theology edge (Acts 17:27) is covered under creation-testifies. Recorded so no cross-worker double-mint occurs (see Decision 19).
6. **Psalm 14:1 ('The fool has said in his heart...')** *(domain A)* — Ubiquitous in apologetics usage against atheism, but the psalm teaches universal corruption ('There is no one who does good', v1b with vv2-3), not an argument for God's existence — the used-about vs teaches trap the rollout forbids.
7. **Hebrews 11:3 as a first-cause anchor** *(domain A)* — 'By faith we understand' is the verse's own register (faith-received creation ex nihilo); conscripting it as a rational proof-text inverts its point.
8. **Proverbs 8:22-31 for any Christ/deity or design concept** *(domain A, D)* — The chapter's plain sense is personified Wisdom; the Christological identification is the contested-identification class the rollout declines (Ezek 28 precedent; brief disputed-texts table: 'Do NOT tag Prov 8 with any Christ concept'). Left unanchored on both sides: it neither supports a created Christ nor is conscripted as a deity anchor; Prov 3:19-20 teaches the design substance without the dispute.
9. **Psalm 19:7-11 under creation-testifies** *(domain A)* — The psalm's second half turns from the heavens to the law (special revelation) — trustworthiness-of-scripture / delight-in-the-word territory; splitting the anchor at v6/v7 keeps both concepts honest.
10. **Colossians 1:16-17 under creation** *(domain A)* — Teaches all-things-made through Christ, but the disputed-text table routes Col 1:15-17 through deity-of-christ/supremacy-of-christ with editorial provenance; double-anchoring onto creation would leak a contested-text handling decision across concepts.
11. **Romans 1:21-23 as a separate anchor** *(domain A)* — The suppression theme is carried inside the Rom 1:19-20 justification; the idolatry substance belongs to the pending idolatry row (Theme A).
12. **Psalm 82:6 / John 10:34 as any deification, deity, creation, or resurrection anchor** *(domain A, B, C, D)* — All four drafts concurred. Ps 82's plain sense is unjust rulers/judges under God's judgment — v7 (pinned): 'Nevertheless you shall die like men, and fall like one of the rulers.' If tagged at all it belongs to justice-register concepts. John 10:34 is handled only inside deity-of-christ's John 10:30-33 justification as Jesus' a-fortiori argument; only the unbreakability clause of John 10:35 is anchored (power-of-gods-word). RECOMMENDED: Ps 82 is in the pinned fixture corpus, so a mustNotRank guard fixture against deification/become-gods queries is shippable now (Decision 12).
13. **witnesses-of-the-resurrection concept id** *(domain B)* — Declined as a mint: the evidence register sits honestly within existing resurrection's Easter scope; minting beside it would be the near-duplicate G4 rejects, and the review's §1(a) flags demanded one decision for the whole family. Resolved: extend resurrection, reuse resurrection-of-the-dead.
14. **evil-will-not-win concept id** *(domain B)* — Declined per the brief's own fold flag: the final-reckoning register belongs to existing divine-judgment / new-heaven-and-earth lexicons ('will evil ever end', 'will God defeat evil'); Rev 21:4 is anchored under why-god-allows-suffering with the overlap recorded.
15. **lament and unanswered-prayer rows (Theme H)** *(domain B)* — Adjacent to the theodicy family but not scoped to Worker B by the brief's split; noted as neighbours for related edges, not drafted.
16. **2 Peter 1:16 as a resurrection-eyewitness anchor** *(domain B)* — Context check fails: 'eyewitnesses of his majesty' is, per vv17-18, the Transfiguration ('with him on the holy mountain'), not the resurrection appearances. Anchored instead only under trustworthiness-of-scripture for the not-myth historical-reliability register (Worker C).
17. **Mark 16:9-14 (longer-ending appearances)** *(domain B)* — The longer ending is the best-known disputed Gospel text; every appearance it reports is carried by undisputed text in Luke 24 / John 20 / 1 Cor 15. No reason to build on contested ground.
18. **Matthew 12:40 (sign of Jonah) under resurrection** *(domain B)* — The pericope's plain point is the refusal of a sign to 'an evil and adulterous generation'; the prediction register is already carried by John 2:19-21, where the evangelist's own gloss does the interpretive work.
19. **Isaiah 53:10-11 and Hosea 6:2 as resurrection anchors** *(domain B)* — No-read-back rule: their resurrection significance is NT-attributed ('according to the Scriptures') — the pending messianic-prophecy row's recorded attributed-fact territory, not a bare fact about the OT chapters.
20. **Isaiah 45:7 under why-god-allows-suffering** *(domain B)* — In context Yahweh's self-declaration against Babylonian dualism addressed to Cyrus, not a theodicy answer; unglossed it invites 'God creates moral evil' misreadings display copy must not adjudicate. Belongs, if anywhere, with the pending sovereignty-of-god row, with editorial handling.
21. **Romans 5:3-4 / James 1:2-4 (suffering produces character)** *(domain B)* — Verified (Rom 5:3-4 pinned) but owned by existing remembered-joy-in-trials and testing; why-god-allows-suffering reaches this ground by related edge, not duplicate anchors.
22. **Revelation 20:12-13 under resurrection-of-the-dead** *(domain B)* — Teaches the dead raised for judgment but sits inside the millennial-sequence passage; anchoring it would drag the concept toward §4 non-criteria territory (millennial views).
23. **1 Corinthians 14:33 as a scripture-sufficiency / no-competing-revelation anchor** *(domain C)* — In context the sentence regulates orderly congregational prophecy and tongues (14:40 'decently and in order'); that God's character excludes competing revelations is an inference the verse does not teach. Stays in the conversation coverage table as the dialogue's own citation, attributed; no concept anchor. WEB (current-edition, verified): 'for God is not a God of confusion but of peace, as in all the assemblies of the saints.'
24. **testing-prophets / test-the-spirits concept ids** *(domain C)* — Folded into pending false-prophets (Decision 6): the how-do-I-test register is that concept's lexicon; a second pack would be a G4 near-duplicate beside two already-pending rows.
25. **false-teachers as a separate concept id** *(domain C)* — Merged into false-prophets on the strength of 2 Pet 2:1, which names the OT and church-age phenomena as one continuum in a single sentence (Decision 6, reversible).
26. **scripture-cannot-be-broken concept id** *(domain C)* — Folded per the brief's own recommendation: endurance/unbreakability anchors to power-of-gods-word; truth/flawlessness/inspiration anchors to trustworthiness-of-scripture.
27. **Revelation 22:18-19 as a whole-canon proof-text** *(domain C)* — Admitted as an anchor only with the recorded Revelation-scope caveat ('the words of the book of this prophecy' is Revelation itself — broad scholarly consensus including conservative treatments); anchored as the canon's closing instance of the add-nothing principle, at lower weight. A stronger claim would be a G3-class wrong-reason failure.
28. **Matthew 24:35 as a manuscript-transmission proof** *(domain C)* — Admitted only as the indestructible certainty of Jesus' words; deploying it against text-corruption claims is an application about transmission the verse does not make — the map may use it so, attributed; the gist may not.
29. **Canon-closure reading of 2 Timothy 3:16-17** *(domain C)* — The verse claims inspiration and sufficiency-to-equip, not canon closure; the wider sola-scriptura freight is a contested inference and stays out of the gist (caveat recorded on the anchor).
30. **Bare 'test'/'testing' lexicon tokens on false-prophets** *(domain C)* — Excluded, matching the existing testing pack's deliberate exclusion; only multi-word phrases admitted ('test the spirits', 'test all things').
31. **Movement-naming lexicon entries (e.g. queries naming a specific group)** *(domain C, D)* — Not drafted; whether a lexicon entry may name a movement is surfaced to Jesse per brief §1.3 (Decision 13), not made silently.
32. **Revelation 3:14 ('the beginning of God's creation')** *(domain D)* — DEFERRED, not anchored: not in either source conversation's claim map; the arche-as-origin/ruler handling deserves its own careful treatment rather than a drive-by anchor. Follow-up flagged (Decision 18).
33. **LDS and Watchtower source material (2 Nephi 25:23; Moroni 10:32; 1 Nephi 13:28; 2 Nephi 29:6; Journal of Discourses 1:50-51; Watchtower prophecy records)** *(domain D)* — Never anchors. Context for why topics matter; quoted in the map only as the claims under discussion; never as Scripture, never as authorities in justifications, never entering the engine as anchors or lexicon.
34. **JW conversation 'Kingdom emphasis — who is the King?' row** *(domain D)* — A synthesis of the preceding texts by the conversation's own label; covered jointly by deity-of-christ, the-first-and-the-last, and honor-the-son. No separate anchor.
35. **Isaiah 40-46 reading assignment (Mormonism conversation close)** *(domain D)* — A reading-plan suggestion, not a scripture claim; its content is fully covered by the no-other-god and gods-unchanging-nature anchor sets.
36. **Job 38-42 claimed as theodicy by Domain A** *(domain A)* — Worker A anchors the whirlwind speeches only for what they teach about the making and the creatures; the why-suffering function belongs to why-god-allows-suffering (Domain B). The flagged potential Job 38:4 dual dissolved at integration (B anchored Job 1/42, not Job 38).

---

## Uploaded-conversations coverage

Every scripture-claim row from the two source conversations (brief §6),
mapped to its covering concept or its recorded decline. KJV/ESV quotes in
the conversations were re-drawn from the WEB before anchoring. LDS and
Watchtower material is quoted in this section's claims column only as the
claim under discussion — never as Scripture, never entering the engine.

### Mormonism conversation (brief §6.1)

| Claim addressed | Scriptures used | Covered by |
|---|---|---|
| 1. Jesus not the eternal, one-and-only God | John 1:1-3 | `deity-of-christ` (John 1:1; 1:3) |
| | Phil 2:5-11 | `deity-of-christ` (2:6-7) + `honor-the-son` (2:9-11) — recorded split |
| | Col 1:15-17 | `supremacy-of-christ` (disputed-text handling, editorial provenance) |
| | Ps 96:5; 1 Kgs 8:60; Deut 4:35 | `no-other-god` |
| 2. Father, Son, Holy Ghost three separate gods | Deut 6:4 | `no-other-god` + `trinity` (dual, recorded) |
| | Isa 45:21-22 | `no-other-god` (monotheism register; Savior register on `jesus-the-only-way`) |
| 2b-2c. Jesus a separate god / humans may become gods | Isa 44:6 | `no-other-god` + `the-first-and-the-last`; the become-gods query family is also served by Isa 43:10; 46:9 and the `gods-unchanging-nature` set (Ps 90:2; Mal 3:6; Num 23:19; Jas 1:17) |
| 3. Christ's sacrifice not sufficient; works necessary | Eph 2:8-9; Isa 64:6 | `grace-not-earned` (no new id — lexicon/fixture work; 2 Nephi 25:23 / Moroni 10:32 quoted only as the claim answered) |
| 5. The Bible not inerrant / not complete | 2 Tim 3:16-17 | `trustworthiness-of-scripture` (sufficiency-not-canon-closure caveat recorded) |
| 5b. "Plain and precious things taken away" | Matt 24:35 | `power-of-gods-word` (permanence-not-transmission caveat recorded) |
| | 1 Cor 14:33 | **Declined as an anchor** (regulates orderly congregational worship; the no-competing-revelation inference is not taught). Remains here as the conversation's own citation, attributed. |
| 5c. Continuing revelation via new prophets/angels | Gal 1:8 | `no-other-gospel` (Gal 1:8; 1:6-7 context carried in the justification) |
| | 1 John 4:1 | `false-prophets` |
| Pastoral close — "another Jesus … another gospel" | 2 Cor 11:3-4 | `no-other-gospel` (11:4, with v3 context in the justification; 11:13-14) |
| Virgin birth denied | Matt 1:23; Luke 1:30-35 | `virgin-birth` (Matt 1:18, 20, 22-23, 25; Luke 1:34-35) |
| Reading assignment: Isaiah 40-46 with prayer | — | Declined as not-a-claim; content covered by `no-other-god` + `gods-unchanging-nature` |

### Jehovah's Witnesses conversation (brief §6.2)

| Claim addressed | Scriptures used | Covered by |
|---|---|---|
| 1. Jesus created as Michael; "a god"; NWT "all *other* things" | Col 1:15-17 | `supremacy-of-christ` (vv15, 16, 17, 18 — the firstborn-as-rank handling, editorial) |
| | John 1:1-3 | `deity-of-christ` |
| | John 8:58 | `deity-of-christ` + `i-am-sayings` (dual, recorded) |
| | John 10:32-33 | `deity-of-christ` (John 10:30-33; Ps 82/John 10:34 handled inside the justification only) |
| | John 17:5 | `deity-of-christ` |
| | Isa 9:6 + Isa 10:20-21 | `deity-of-christ` (Isa 9:6 with 10:21, attributed-fact handling) |
| | Rev 1:5-8 | `the-first-and-the-last` (Rev 1:8 with the 1:17-18 / 2:8 / 22:12-13, 20 chain) |
| 2. Jesus a mere human, not God in flesh | Col 2:9; Phil 2:5-11; Mic 5:2 | `deity-of-christ` (Mic 5:2 with the WEB-rendering caveat recorded) + `honor-the-son` (Phil 2:9-11) |
| 3. Resurrection spiritual only, not bodily | Luke 24:39; John 2:19-21; 1 John 1:1-2; Luke 24:42-43 | `resurrection` (merged B+D bodily-evidence register) |
| What honor does Jesus deserve? | John 5:22-23; John 20:28-29 | `honor-the-son` (+ `deity-of-christ` for the confession's content) |
| Son above angels; Creator language applied to the Son | Heb 1 (esp. 1:10-12 quoting Ps 102) | `supremacy-of-christ` (Heb 1:3, 1:8, 1:10-12) + `honor-the-son` (Heb 1:6) — recorded split |
| The coming Judge is the Alpha and Omega | Rev 22:12-13, 20 | `the-first-and-the-last` |
| Kingdom emphasis — but who is the King? | (synthesis) | Declined as synthesis; covered jointly by `deity-of-christ`, `the-first-and-the-last`, `honor-the-son` |
| Documented false prophecies (Russell, Rutherford) | Deut 18:21-22 | `false-prophets` (application to movements lives in fixtures/this map, never gist wording) |

**Orphan check: complete — no scripture-claim row from either conversation
is left without a covering concept or a recorded, reasoned decline.**

---

## Sources appendix (all cited lookups, deduped)

### Pre-vetted by the scoping brief (§9), relied on as cited there

- Routledge Encyclopedia of Philosophy — Arguments for the existence of God — https://www.rep.routledge.com/articles/thematic/god-arguments-for-the-existence-of/v-1
- CrossExamined — An Intro to Arguments for God's Existence — https://crossexamined.org/an-intro-to-arguments-for-gods-existence/
- Rabbit Room Apologetics — The Minimal Facts Method — https://rabbitroomapologetics.substack.com/p/the-minimal-facts-method-for-the
- Apologia Daily — The Minimal Facts Argument — https://www.apologiadaily.com/library/minimalfacts.html
- Crossway — 10 Key Bible Verses on the Divinity of Jesus — https://www.crossway.org/articles/10-key-bible-verses-on-the-divinity-of-jesus/
- GotQuestions — Is the deity of Christ biblical? — https://www.gotquestions.org/deity-of-Christ.html
- Servants of Grace — The Problem of Evil in the Book of Job — https://servantsofgrace.org/the-problem-of-evil-in-the-book-of-job/
- The Art of Godliness — Theodicy — https://theartofgodliness.com/blog/202234/theodicy-answering-the-problem-of-evil
- Erik Manning — 20 Essential Bible Verses on Apologetics — https://eriknmanning.medium.com/20-essential-bible-verses-and-passages-on-apologetics-that-every-christian-should-know-b2aeb82b69ba
- Truth For Life — The Exclusivity of Christ in a Pluralistic Culture — https://blog.truthforlife.org/the-exclusivity-of-christ-in-a-pluralistic-culture
- GotQuestions — Religious pluralism — https://www.gotquestions.org/religious-pluralism.html
- Christian Research Institute — Colossians 1:15: The Firstborn of All Creation — https://www.equip.org/perspectives/colossians-1-15-the-firstborn-of-all-creation/
- CARM — Col. 1:15 "firstborn of all creation" — https://carm.org/jehovahs-witnesses/col-115-firstborn-of-all-creation/
- NAMB — The Moral Argument for God's Existence — https://www.namb.net/apologetics/resource/the-moral-argument-for-gods-existence/
- GotQuestions — The Moral Argument — https://www.gotquestions.org/moral-argument.html
- Stand to Reason — Verses for Your Conversations with Mormons — https://www.str.org/w/verses-for-your-conversations-with-mormons
- Alpha and Omega Ministries — 100 Verses for Witnessing to Mormons — https://www.aomin.org/aoblog/mormonism/100-verses-for-witnessing-to-mormons/

### Consulted directly by the drafting workers (2026-08-25, targeted lookups)

Worker A:
- GotQuestions — What is the kalam cosmological argument? — https://www.gotquestions.org/kalam-cosmological-argument.html
- Apologetics Press — The Teleological Argument, Part 1 — https://apologeticspress.org/the-teleological-argument-for-the-existence-of-god-part-1-5509/
- GotQuestions — Body, soul, and spirit: dichotomy or trichotomy? — https://www.gotquestions.org/body-soul-spirit.html
- Christian Research Institute — Restoring the Soul to Christianity — https://www.equip.org/articles/restoring-the-soul-to-christianity/
- Knowable Word — Identifying Behemoth and Leviathan in the Book of Job — https://www.knowableword.com/2021/06/18/identifying-behemoth-and-leviathan-in-the-book-of-job/
- Third Millennium Ministries — Job: Behemoth and Leviathan — https://thirdmill.org/magazine/article.asp/link/der_thomas%5Eder_thomas.Job40-41.html/at/Job:%20Behemoth%20and%20Leviathan

Worker B:
- CrossExamined — The Minimal Facts of the Resurrection — https://crossexamined.org/the-minimal-facts-of-the-resurrection/
- CrossExamined — The Evidential Value of 1 Corinthians 15:3-8 — https://crossexamined.org/the-evidential-value-of-1-corinthians-153-8-to-the-case-for-the-resurrection/
- The Gospel Coalition — The Problem of Evil — https://www.thegospelcoalition.org/essay/the-problem-of-evil/
- Frame & Poythress — The Bible On the Problem of Evil — https://frame-poythress.org/the-bible-on-the-problem-of-evil/
- Knowing Scripture — Job and the Problem of Evil — https://knowingscripture.com/articles/job-and-the-problem-of-evil
- Blue Letter Bible — Matthew Henry, Commentary on Psalm 73 — https://www.blueletterbible.org/Comm/mhc/Psa/Psa_073.cfm
- Catholic Answers — Was Jesus' Resurrection Physical or Purely Spiritual? — https://www.catholic.com/qa/was-jesus-resurrection-of-a-physical-or-purely-spiritual-nature
- Apologetics Press — Did Jesus Have the Same Physical Body After His Resurrection? — https://apologeticspress.org/did-jesus-have-the-same-physical-body-after-his-resurrection-673/
- Evidence Unseen — Job 19: Does this passage refer to the concept of resurrection? — https://evidenceunseen.com/old-testament/job/difficulties/does-this-passage-refer-to-the-concept-of-resurrection
- B-Hebrew forum — Translation of Job 19:25-26 — https://bhebrew.biblicalhumanities.org/viewtopic.php?t=22699

Worker C:
- Puritan Board — 2 Timothy 3:16 and Sola Scriptura — https://puritanboard.com/threads/2-timothy-3-16-and-sola-scriptura.102808/
- Jimmy Akin — 2 Timothy 3:16-17 and Sola Scriptura — https://jimmyakin.com/library/2-timothy-316-17-and-sola-scriptura
- Biblical Christianity (IRR) — Revelation 22:18-19 and the Canon of Scripture — https://bib.irr.org/revelation-2218-19-and-canon-of-scripture
- GotQuestions — Does the warning in Revelation 22:18-19 apply to the entire Bible? — https://www.gotquestions.org/Revelation-22-18-19.html
- GotQuestions — What does the Bible say about false prophets? — https://www.gotquestions.org/false-prophets.html
- CRI/Voice — Criteria of a True Prophet: Notes on Deuteronomy 18:22 — http://www.crivoice.org/prophetdeut18.html
- GoBible — Testing the Prophets (Deut 13, Jer 27-28, Isa 8) — https://gobible.org/bible_study/tpg/tpg-l6-tp/
- Crossway — What Does 1 Peter 3:15 Mean? — https://www.crossway.org/articles/what-does-1-peter-315-mean/
- Apologetics for the Church — The Importance of 1 Peter 3:15-16 for Apologetics — https://apologeticsforthechurch.org/the-importance-of-1-peter-315-16-for-apologetics/
- GotQuestions — What does it mean that God is not the author of confusion? — https://www.gotquestions.org/God-is-not-the-author-of-confusion.html

Worker D:
- GotQuestions — What does it mean "you are gods" in Psalm 82:6 and John 10:34? (fetched)
- GotQuestions — What is the importance of the virgin birth? (fetched)
- GotQuestions — Why is "the Word was a god" not a valid translation of John 1:1? (search-result summary)
- Christian Research Institute — John 1:1 and the New World Translation (search-result summary)
- CARM — Isaiah 9:6, Jesus is the Mighty God (search-result summary)
- creation.com — Isaiah 9:6-7: The coming Child who would be called "Mighty God" (search-result summary)
- BibleRef — What does John 5:23 mean? (search-result summary)
- BibleHub — John 5:23 study/commentary pages (search-result summary)

### Internal witnesses

- `pipeline/fixtures/web-subset.json` (pinned-edition quotes; sha256 `3458ca34…` source)
- `<scratchpad>/engwebp_vpl/engwebp_vpl.txt` (current-edition quotes; sha256 `71ea1ce6…`; extracted from the downloaded archive `engwebp_vpl.zip`, sha256 `b6f55cc7…`)
- `ontology/concepts/*.yaml` (reuse and boundary checks, read directly by Workers C and D)
- `/mnt/project-files/research/bible-rollout/` book docs (cross-checks only, per brief §5.3)
- The two uploaded conversations (Mormonism; Jehovah's Witnesses) — Jesse's own outlines; claims context only

---

## Critic-round log

**Round 1 (2026-08-25): NOT APPROVED — 9 objections (0 BLOCKER, 1 MAJOR,
8 MINOR). All 9 fixed by the editor; re-review pending.**

1. MAJOR — deity-of-christ / John 10:30-33: unmarked splice (v30 joined to
   v33). **Fixed**: full vv30-33 quoted, re-verified word-for-word against
   `engwebp_vpl.txt` (current-edition witness).
2. MINOR — no-other-gospel / Galatians 1:6-9: ref span overstated the quote
   (v8 alone). **Fixed**: ref narrowed to "Galatians 1:8"; 1:6-7 context
   stays in the justification; coverage table updated.
3. MINOR — no-other-gospel / 2 Corinthians 11:3-4: ref span overstated the
   quote (v4 alone). **Fixed**: ref narrowed to "2 Corinthians 11:4"; v3
   context stays in the justification; coverage table updated.
4. MINOR — false-prophets / Deuteronomy 13:1-3: quote began at v2 with no
   elision marker. **Fixed**: quote now runs from the start of v1,
   re-verified word-for-word against `engwebp_vpl.txt`.
5. MINOR — provenance hash: `b6f55cc7…` is the downloaded zip's hash, not
   `engwebp_vpl.txt`'s. **Fixed**: txt now carries its own sha256
   (`71ea1ce6…`), zip hash attributed to the zip explicitly, in the intro,
   the sources appendix, and the JSON note; both hashes recomputed by the
   editor.
6. MINOR — supremacy-of-christ / Colossians 1:17: missing `editorial`
   attribution required by the disputed-text table. **Fixed**: `editorial`
   added to the anchor's sources.
7. MINOR — inconsistent "Psalms N:N" vs "Psalm N:N". **Fixed**: normalized
   to the majority form "Psalm" (4 refs: 19:7-9, 12:6, 119:160, 119:89) in
   md and JSON.
8. MINOR — resurrection merge note claimed "same or wider spans", false for
   John 2 (B's "John 2:19, 21" is narrower than D's 2:19-21). **Fixed**:
   reworded in the entry definition and the integration log to name the
   deliberately narrowed John 2 case.
9. MINOR — grace-not-earned / Isaiah 64:6: missing context caveat.
   **Fixed**: corporate-penitential-confession caveat added; application
   signposted as application with Eph 2:8-9 / Titus 3:5 carrying the direct
   teaching.

No objection disposed-instead-of-fixed. Anchor counts unchanged (216); only
refs, quotes, sources, notes, and provenance wording were touched.

**Round 2 (2026-08-25): NOT APPROVED — 1 objection (0 BLOCKER, 0 MAJOR,
1 MINOR). Fixed by the editor; re-review pending.** The round-2 critic
verified all 9 round-1 fixes as genuinely and correctly applied, and
re-verified all 216 anchor quotes against their witnesses (206 exact,
4 honest substrings, 6 marked-ellipsis quotes verified segment-by-segment;
0 mismatches). Counts, case labels, md/JSON agreement, coverage tables, and
the round-1 log all verified clean.

1. MINOR — resurrection-of-the-dead / Job 19:25-27: the justification (and
   Decision 16) assert `sources:[editorial]` for the resurrection reading,
   but the anchor's sources array held only the two URLs. **Fixed**:
   `editorial` added to the anchor's sources in md and JSON (URLs kept).

No objection disposed-instead-of-fixed. Anchor counts unchanged (216); only
the one sources array and this log were touched.

**Round 3 (2026-08-25): NOT APPROVED — 1 objection (0 BLOCKER, 0 MAJOR,
1 MINOR). Fixed by the editor; re-review pending.** The round-3 critic
verified the round-2 fix as genuinely and correctly applied, re-verified all
216 anchor quotes against their witnesses (205 exact, 4 honest substrings,
6 marked-ellipsis quotes and the one two-passage composite verified
segment-by-segment; 0 word-level mismatches), and found zero md/JSON
mismatches across all 29 concepts and 216 anchors. Counts, case labels,
coverage tables, round-1 fix invariants, and both round logs all verified
clean.

1. MINOR — deity-of-christ / Isaiah 9:6 with Isaiah 10:21: the two-passage
   quote joined Isa 9:6 to Isa 10:21 with no visible seam, against the
   map's convention of marking non-contiguous joins. **Fixed**: a "…" seam
   marker inserted between "Prince of Peace." and "A remnant will return"
   in md and JSON; both segments kept word-for-word and re-verified against
   `engwebp_vpl.txt` (current-edition witness).

No objection disposed-instead-of-fixed. Anchor counts unchanged (216); only
the one quote and this log were touched.

**Round 4 (2026-08-25): APPROVED — zero objections. The critic loop closed
at round 4.** The fresh round-4 critic (no part in prior rounds; independent
tooling throughout) verified the round-3 seam fix as genuinely and correctly
applied, confirmed all three prior round logs accurate against the round
files, re-verified all 216 anchor quotes against their witnesses (205 exact,
4 honest substrings, 7 seam-marked quotes verified segment-by-segment;
0 mismatches), found zero md/JSON mismatches across all 29 concepts and
216 anchors, reverified counts, case labels, and coverage tables, and
sanity-read the 4 least-examined entries clean. Convergence: 9 → 1 → 1 → 0.

No objections. Anchor counts unchanged (216); nothing was touched except
this log.
