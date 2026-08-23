# Books-harvest corpus backlog — consolidated (2026-08-18)

> **Dependency statement:** everything in this ledger is gated on the WEB
> re-pin — see `docs/corpus-payload-dependency.md` (DG-16 / plan P2.6) for
> what exactly it waits on (the J52 snapshot errand, the P2.1 re-pin PR,
> J39 approvals), how the payload composes with the re-pin (PR-α/PR-β, one
> regeneration cycle), and when the block is discharged. Do not build a
> pack from these rows before that statement reads discharged.

Every reference in this document is **blocked on the fixture corpus**
(`pipeline/fixtures/web-subset.json`), not on soundness. None of it can land
today: `npm run check:drift` shows the pinned WEB source (and both OpenBible
snapshots) have drifted upstream with no archive serving the pinned bytes, so
the corpus **cannot be regenerated without the reviewed re-pin process**
(`docs/source-repins.md`). This is the same situation the
`eval/golden/unpardonable-sin.json` fixture records, and its precedent
governs everything here: **land the concept/anchor, the corpus chapters, and
the active fixture assertion together in the re-pin/corpus PR** — never a
concept whose naming passage cannot be measured.

This file consolidates:

- the round-1 corpus needs (previously scattered across `eval/golden/*.json`
  notes that pointed at a `corpus-needs.md` which was never created — this
  document is that record);
- the three round-2 curation clusters' backlogs (the Phillips slice, the
  eschatology/civic sense-care slice, and the prayer-books/Growing-by-Heart
  slice).

## 0. Standing cautions for the re-pin PR

- **Proverbs 18 carries watchlisted Prov 18:16** ("a man's gift makes room
  for him" — `ontology/flagged-pairings.yaml`). Adding the chapter makes the
  verse rankable; the same PR should bring a prosperity-family guard fixture
  with it (the round-1 cluster-C warning).
- **Prosperity guards that are waiting on chapters**: `prosperity-abundance`
  notes a forbidden proof-text outside the corpus whose mustNotRank would
  currently pass vacuously; re-check every prosperity-* fixture when its
  chapter lands.
- **Job 16 is REQUIRED** for the comforter guard: `holy-spirit-the-comforter`
  keeps Job 16:2 ("miserable comforters") rankable-but-never-leading only as
  a written note until Job 16 is in the fixture corpus and the guard becomes
  machine-checked.
- **Ecclesiastes 1** likewise turns the new-creation guard (Eccl 1:9,
  "no new thing under the sun", must not lead "fresh start" queries) from
  prose into a measured mustNotRank.
- **The unpardonable-sin trio** (Matthew 12:22-32, Mark 3:22-30, Luke 12:10)
  unblocks the round-1 pending fixture and the blasphemy-against-the-spirit
  concept, with its anxious-searcher design (locate the naming passages,
  adjudicate nothing, gate Heb 10:26-27) already written into the fixture
  note.
- **1 Timothy 2:1-2 is the top single unblock**: it is the naming text of the
  admitted `praying-for-leaders` pack ("supplications … for kings and all who
  are in high places"; Torrey KINGS "Prayed for"), blocked across five civic
  topics in two books. Add it as the 1.0 anchor and promote it to that
  fixture's expectedTop in the corpus PR.

## 1. Round-1 needs (from the 2026-08-18 wave's fixture notes)

| fixture / pack | blocked refs | chapters needed |
|---|---|---|
| holy-spirit-the-comforter (guard) | Job 16:2 | Job 16 (**required**) |
| new-creation (guard) | Ecclesiastes 1:9 | Ecclesiastes 1 |
| unpardonable-sin (pending fixture + future concept) | Matt 12:22-32; Mark 3:22-30; Luke 12:10 | Matthew 12; Mark 3; Luke 12 |
| tithing | Matt 23:23 (weightier matters) | Matthew 23 |
| friendship | Prov 17:17; Prov 18:24; Prov 27:17 | Proverbs 17, 18 (see §0 caution), 27 |
| parenting | Prov 22:6 assertions for "train up a child" | Proverbs 22 |
| taming-the-tongue | Prov 15:1 etc. (gentle answer family) | Proverbs 15 |
| sense-inversion-promotion | Ps 75:6-7 (anchored; not measurable) | Psalms 75 |
| loneliness / family packs | Ps 127 refs | Psalms 127 |
| taming-the-tongue (guard family) | Ps 141:3 measurability | Psalms 141 |
| taming-the-tongue / wisdom | James 3:1-12; James 3:17 | James 3 |
| generosity / gods-provision | 2 Cor 9:6-8 | 2 Corinthians 9 |
| identity-in-christ, people-pleasing, wisdom, guidance, god-of-all-comfort | per-fixture notes (Prov 29:25 "fear of man", etc.) | Proverbs 29 and the chapters named in each fixture note |

## 2. Round-2: whole topics that are corpus-blocked (admissible in principle)

Scripture names each referent; every naming verse is outside the corpus.
Each row carries the neutrality note the eventual pack must honor.

| topic | naming refs (blocked) | note for the eventual PR |
|---|---|---|
| Mark of the Beast | Rev 13:16-18 | Locator concept only — no identification claims (no numerology, no current-events reading). Lexicon "mark of the beast", "666". |
| Great White Throne | Rev 20:11-15 | Torrey-verified (SECOND COMING; HELL; JUDGMENT, THE). Neutral label is the text's phrase; encode no bema-vs-throne schema — this pack and `judgment-seat-of-christ` must stay mutually silent on whether they are one event or two. |
| Battle of Armageddon | Rev 16:16; Rev 14:14-20 | "Harmagedon" named in 16:16. Narrow locator; no geopolitics. |
| Lake of Fire | Rev 20:14-15 | PREFER folding as anchors into the admitted `hell` pack over a separate concept — a one-ref concept next to hell is exactly the near-duplicate G4 catches. Torrey lists Rev 20:15 under HELL. |
| Marriage Supper of the Lamb | Rev 19:7-9 | Named in 19:9. Torrey-verified (BLESSED, THE). |
| One Hundred Forty-Four Thousand | Rev 7:4; Rev 14:1,3 | STRICT neutrality: the identity of the 144,000 is contested (and claimed by groups the doctrinal basis excludes); the concept may only locate the naming passages. |
| Two Witnesses | Rev 11:3-12 | Locator only; no identification of the witnesses. |
| Seal / Trumpet / Bowl septets | Rev 5-6; Rev 8-9; Rev 16 | Use the text's own nouns ("the seven seals/trumpets/bowls"), not the interpretive "Judgments" grouping; consider one "septets of Revelation" locator over three near-empty packs — decide at corpus time with G4 in view. |
| Paradise and Hades | Luke 23:43; Luke 16:22-26 | The paired topic title is a light intermediate-state schema; prefer Luke 23:43 in a "paradise" locator (Torrey's HELL outline itself files Luke 23:43 under "Paradise") and Luke 16:22-26 as anchors for `hell`/Hades — do not reproduce the two-compartment frame as one concept. |
| "Great tribulation" phrase-locator | Matt 24:21 (in corpus); Rev 7:14 (blocked) | Admissible on the caught-up-together pattern once Rev 7:14 lands: the two naming verses, no chronology. |
| hell (additions) | Matt 13:42,50; Matt 25:41,46; Jude 7; Luke 16:23; Rev 20:14-15; Matt 10:28 | The Torrey-HELL-verified anchors that would upgrade the pack's editorial-only provenance. |
| judgment-seat-of-christ (additions) | 2 Tim 4:8; Matt 25:14-30 / Luke 19:11-27 | 2 Tim 4:8 sound when available (Torrey JUDGMENT, THE). Talents/minas: soundness call DEFERRED — wiring parables to the bema imports the rewards schema the pack refuses; lean anchor-elsewhere (a stewardship/faithfulness concept). |
| new-heaven-and-earth (additions) | Isa 65:17-25; 2 Pet 3:13 | Isa 65:17 needs its own context note at admission (Isa 65:20 still contains death — quoting it as a straight Rev 21 parallel is itself a system move). |
| praying-for-leaders (additions) | **1 Tim 2:1-2 (top priority)**; Prov 21:1; Prov 14:34; Prov 29:18 | 1 Tim 2:1-2 becomes the 1.0 anchor and the fixture's expectedTop. Prov 29:18 LEAN REJECT ("vision" is prophetic revelation, not national vision) — re-judge in context, don't auto-add. Out-of-slice civic residue (Congress/Military): 2 Chr 14:7, Prov 2:8, Ps 5:11 — expect them to fold here with no new anchors. |
| second-coming family (from "Rapture") | Luke 21:34-36; 2 Pet 3:8-14 | If ever added: second-coming's watchfulness family, NOT caught-up-together (adding Luke 21:34-36 to the rapture pack would encode an escape-reading). |
| Morning / evening prayer packs | Ps 118:24; Ps 4:8; Ps 5:3; Ps 143:8 (+ Lam 3:22-23 cross-anchor) | Recommended: mint one `morning-and-evening` (or two small) pack(s) in the PR that adds Psalms 4, 5, 118, 143. Until then the topics ride on gods-faithfulness ("his mercies are new every morning"). |
| Integrity | Ps 25:21; Ps 41:12; Prov 11:3; Prov 20:7 | A real gap, wholly corpus-blocked; all four refs sound in context and Torrey-eligible. |
| Human faithfulness | Matt 25:23 ("well done, good and faithful servant") | The 1.0 without which the topic stays rejected (Prov 28:20a alone cannot carry it, and its second clause needs careful anchoring). `gods-faithfulness` is NOT this sense. |
| Occult (Phillips) | Isa 8:19; Lev 20:27; Deut 18:9-12; 1 Sam 28:7-12; 2 Kgs 21:6; Isa 19:3; Isa 47:13-14; Acts 19:18-20 | James 4:7 already serves the resist command via `resisting-the-devil`; everything else needs its chapters. |

## 3. Round-2: blocked refs for existing/new packs, by destination

Verify soundness in context at admission time — the round-2 authors did not
draft these (no corpus text to quote).

### Would complete packs admitted this round

| ref | topic (book) | destination when unblocked |
|---|---|---|
| Psalm 90:12 | sundials (gbh wk50), Time Management | `stewardship-of-days` — "teach us to number our days" is the natural second 1.0 |
| John 7:37-38 | a deep well (gbh wk40) | `hunger-for-god` — the living-water invitation; would take the thirst-register lead over Rev 21:6 |
| Philippians 3:10 | Resurrection Power (sc), Suffering (phillips) | `resurrection` — "the power of his resurrection"; flip resurrection-power.json's expectedTop to it |
| 1 Corinthians 12:4-6 | Spiritual Gifts (phillips), church-service topics (sc) | `spiritual-gifts` — the varieties-of-gifts passage |
| Proverbs 18:10 | The Lord Is My Refuge (sc) | `refuge-in-trouble` — "the name of the LORD is a strong tower" (Prov 18 caution, §0) |
| Psalm 17:8 / Psalm 63:7 | Divine Protection / Protection for My Children (sc) | `gods-protection` (shadow-of-wings register) |
| Romans 4:3 | Faith (phillips) | `faith` |
| John 20:28; John 10:30; John 17:10; Rom 9:5; Col 2:9; Heb 1:3,8 | Deity of Christ (phillips) | `deity-of-christ` — the confession and the fullness texts |
| Isaiah 59:1-2 | Sin (phillips) | `sin` |
| Ps 66:16; Prov 11:30 | Witnessing (phillips) | `sharing-your-faith` |
| John 6:45; John 12:32 | Those Who Haven't Heard (phillips) | `those-who-never-heard` |
| 2 Tim 4:7-8; 1 Cor 9:25; 1 Thess 2:19-20; Rev 2:10; Rev 22:12; 2 Thess 2:14; Jude 24 | Crowns / Rewards (phillips) | `heavenly-reward` — most of the crown texts wait here |
| Heb 5:8 | Difficulties (phillips) | `the-lords-discipline` |
| Phil 3:10 | Suffering (phillips) | `suffering-for-christ` (with `resurrection` above; judge the split in context) |
| Matt 10:22; Acts 5:41; Acts 9:16 | Persecution (phillips) | `suffering-for-christ` |
| 2 Pet 3:18; 1 Tim 4:15; 2 Pet 1:5-8 | Growing Spiritually (phillips) | `spiritual-growth` |
| Ps 119:18; Ps 119:9,11; 2 Tim 3:15-17 | Study (phillips) | `studying-the-word` |
| Deut 5 (Decalogue parallel) | Ten Commandments | `the-ten-commandments` |
| Isa 14:12-15; Ezek 28:12-19; 2 Pet 2:9 | Satan (phillips) | `resisting-the-devil` — judge the Lucifer-reading question in context |
| 1 Cor 9:24-25; Prov 4:23-26; 1 Cor 16:13 | Self-Control (phillips) | `self-control` |
| 2 Thess 3:10; Prov 14:23; Eccl 9:10 | Occupation (phillips) | `work-and-diligence` |
| 1 Cor 8:9,13; Phil 2:15 | Doubtful Things (phillips) | `disputable-matters` |

### Anchors for pre-existing concepts when their chapters land

| ref | topic (book) | destination |
|---|---|---|
| Ps 143:10 | The Lord Is My Refuge, Spiritual Growth (sc) | `guidance` ("teach me to do your will") |
| Ps 31:3 | Exalting the Lord (sc) | `guidance` / `refuge-in-trouble` |
| James 3:13 | Communication With Others (sc) | `wisdom-from-god` (meekness of wisdom) |
| Matt 9:38 | For Another's Salvation (sc) | `prayer` — the honest lost-souls intercession verse |
| Isa 58:11 | living water (gbh), Guidance/Provision (phillips) | `guidance` |
| Prov 4:23 | the wellspring (gbh), Right Motives (sc) | likely its own small "guard your heart" pack — judge when Prov 4 lands |
| 1 Tim 1:18 | stop weeds (gbh wk25) | `victory-in-christ` (wage the good warfare) — verify context |
| 2 Cor 2:14-16 | sweet fragrance of Christ (gbh), Strong in the Lord (sc) | probably its own remembered pack ("fragrance of Christ"); watch the triumph clause for victory-recruitment |
| 2 Cor 3:5 | sweet fragrance of Christ (gbh) | `strength-in-weakness` ("our sufficiency is from God") |
| Jer 6:16 | burning bushes (gbh) | `guidance` — the verse ends "we will not walk in it"; anchor with the refusal acknowledged |
| Zech 4:6 | new life (gbh wk48) | `holy-spirit-the-comforter` or strength register |
| Ps 18:2; 2 Sam 22:2-3, 22:34 | multiple (sc/gbh) | `refuge-in-trouble` — the rock/fortress doublet |
| Gen 50:20 | Worry, Discouragement (sc) | `remembered-all-things-for-good` — the narrative twin of Rom 8:28 |
| Josh 24:15 | Godly Household (sc) | future family-worship sense ("as for me and my house") |
| Ezek 44:23 | Godly Household (sc) | reject-leaning — priestly duty; household pairing is a stretch |
| Deut 32:46; Ps 132:12 | Correcting My Children (sc) | `parenting` |
| Phil 3:13-14 | Forgiveness, plan to bloom (gbh), marriage restoration (sc) | `hope-in-god` or a forgetting-what-lies-behind remembered pack; NOT forgiveness (Paul's subject is pressing toward the goal) |
| Heb 7:22 | communion/fullness topics (sc) | reject-leaning — covenant/priesthood pack territory |
| Ps 107:2 | Rejoicing in Him (sc) | `praise` ("let the redeemed of the LORD say so") |
| Luke 10:27 | Confidence (sc) | `loving-others` (the two commands; the Confidence pairing is a stretch) |
| Mark 4:19 | Spiritual Drought (sc) | `contentment`-adjacent (cares choke the word) — judge in context |
| Prov 10:4; Col 4:5 | Time Management, New Job (sc) | Prov 10:4 only in a zero-watchlist-verse concept per round-1 geometry; Col 4:5 → `stewardship-of-days` |
| Ps 12:2; Prov 11:27 | New Job (sc) | reject-leaning — devotional stretch |
| 2 Tim 4:2 | Before a Church Service (sc) | preaching-of-the-word register — judge when it lands |
| Ps 118:28-29; Ps 59:16 | waiting for spring / winter hope (gbh) | `thanksgiving` / `praise` |
| John 10:10 | pruning (gbh wk26) | abundant-life sense — WATCH for prosperity recruitment; anchor only in a zero-material-vocabulary concept |
| John 10:11 | shepherd's hedge (gbh wk8) | future good-shepherd pack with Ps 23:1 |
| Col 2:6-7 | fruit inspection (gbh wk44) | `abiding-in-christ` (rooted and built up) |
| Col 4:5-6 | garden angels (gbh wk33) | `taming-the-tongue` (speech seasoned with salt) + `stewardship-of-days` (4:5) |
| Phil 2:3-5 | clay pots (gbh wk16) | `humble-exaltation` |
| Prov 16:3; Phil 2:14; Eccl 9:10 | work topics (sc/gbh/phillips) | `remembered-work-as-for-the-lord` |
| Prov 14:1 | rootbound (gbh), Wives (phillips) | future wisdom-in-the-home sense |
| Prov 31:10,28,30 | Becoming a Proverbs Woman (sc), pansy faces (gbh) | future `proverbs-31` / godly-woman sense with `godly-marriage` cross-link |
| 1 Tim 4:12 | Becoming the Man/Woman God Says I Am (sc) | `identity-in-christ`-adjacent example-setting sense — judge in context |
| Ps 119:133 | Discernment (sc) | `guidance` |
| Ps 119:50 | Bereavement (phillips) | `god-of-all-comfort` |
| Matt 8:17; Ps 107:20 | Healing (sc) | `prayer-for-healing` — Matt 8:17 quotes Isa 53:4 of Jesus' healing ministry; sound |
| Matt 12:37 | Speaking the Right Words (sc) | `taming-the-tongue` (12:36 already anchored; 12:37 completes the saying) |
| Prov 24:3 | Wisdom (sc) | `wisdom-from-god` |
| 1 Chr 16:34 | Giving Thanks (sc) | `thanksgiving` |
| Rev 2:17 | Prayer of Salvation (sc) | reject-leaning — overcomer promise, not a salvation-prayer text |
| Luke 12:22,27 | lilies (gbh wk4) | `peace-of-god` (consider the lilies) |
| 2 Cor 9:8 | love-in-a-mist (gbh), Provision (phillips) | `gods-provision` — keep out of material-vocabulary concepts per round-1 geometry |
| Matt 10:8; Luke 12:15 | love is like zucchini (gbh wk27) | Matt 10:8 → `generosity`; Luke 12:15 → `contentment` |
| Ps 122:1,9; Ps 133:1 | Christian Fellowship (phillips) | `gathering-together` |
| Ps 5:11 | Trust (phillips) | `refuge-in-trouble` |
| Ps 111:10; Ps 119:2; Eccl 12:13 | Obedience (phillips) | `obedience-to-the-word` |
| Prov 14:26; Isa 30:15; Luke 10:27 | Confidence (phillips) | `trust-in-god` / `fear-not` — judge each in context |
| 2 Tim 4:7-8; Heb 9:27 | Death (phillips) | `serious-illness-and-dying` / `heavenly-reward` |
| Ps 18:3; Ps 145:18; Joel 2:32; Matt 21:22 | Prayer (phillips) | `prayer` — Matt 21:22 is watchlist-adjacent (ask-believing); anchor with the Mark 11:24 honest-frame care |
| Job 5:17-18; Prov 10:22; 2 Cor 6:10 | Sorrow (phillips) | `grief-and-loss` / `the-lords-discipline` — Prov 10:22 only with round-1 watchlist geometry |
| Heb 2:18; Ps 94:17-18; 2 Pet 2:9; Jude 24 | Temptation (phillips) | `freedom-from-bondage` / `resisting-the-devil` |
| Prov 4:26; Phil 2:12-13 | Will of God (phillips) | `guidance` / `surrender-to-god` |
| Isa 51:12; Jude 24-25 | Fear (phillips) | `fear-not` |
| Col 2:9-17 | Guilt (phillips) | `forgiveness-of-sins` |
| 2 Chr 16:9; Isa 50:9 | Help and Care (phillips) | `refuge-in-trouble` |
| Acts 5:3-4; 1 Cor 3:16; 1 Cor 12:4-6; 2 Cor 13:14 | Holy Spirit (phillips) | future general holy-spirit sense (see round-1 open question 2) |
| Phil 2:3-4; Prov 22:4 | Humility (phillips) | `humble-exaltation` |
| Gen 18:19; Prov 23:13-14 | Husbands (phillips) | `godly-marriage` / `parenting` — judge Prov 23:13-14's rod text with pastoral care |
| Matt 1:21; Luke 19:10 | Jesus—Savior (phillips) | `salvation` |
| 1 Cor 8:1-13; Gal 2:21; 1 Tim 4:4 | Liberty (phillips) | `disputable-matters` / `freedom-from-bondage` |
| Ps 119:9-11; Col 2:6 | Living the Christian Life (phillips) | `studying-the-word` / `abiding-in-christ` |
| Phil 2:9-11 | Lordship (phillips) | `surrender-to-god` |
| Isa 64:6; Rom 3:10-18; Heb 9:27 | Man's Need of Salvation (phillips) | `sin` |
| Ps 148:12-13; Prov 1:8-9; Prov 6:20-23; Prov 23:22,26; 1 Tim 4:12; 1 Tim 5:4 | Parents and Children (phillips) | `parenting` |
| Deut 8:10; 1 Sam 12:24; 2 Chr 20; Ps 50:23; Ps 63:2-7; Ps 107:8 | Praise and Gratitude (phillips) | `praise` / `thanksgiving` (verify the "Psalm 1:50" extraction error in the source table) |
| Ps 84:11; Isa 58:11; 2 Cor 9:8; 2 Pet 1:3-4 | Provision (phillips) | `gods-provision` — same watchlist geometry care |
| Ps 119:9; Phil 2:14-15; James 3:17 | Purity (phillips) | `holiness` |
| Ps 43:5; Prov 16:7; 2 Thess 3:3 | Anxiety and Worry (phillips) | `peace-of-god` |
| John 5:24; John 6:37; John 20:31 | Assurance of Salvation (phillips) | `assurance-of-salvation` |
| Ps 126:6; Ps 43:5; John 19:25-27; Rev 22:1-4 | Disappointment / Discouragement (phillips) | `do-not-lose-heart` / `hope-in-god` |
| Deut 24:1-4; Mark 10:2-12; Luke 16:18 | Divorce (phillips) | `marriage-divorce-teaching` |
| Prov 18:19 | Forgiving Others (phillips) | `forgiving-others` (Prov 18 caution, §0) |
| Ps 31:19-20; Jude 24 | God's Care (phillips) | `gods-love` / `refuge-in-trouble` |
| Ps 28:7 | Strength (phillips) | `strength-in-weakness` |
| 2 Chr 32:8; 2 Cor 2:14 | Victory (phillips) | `victory-in-christ` |
| Ps 4:8 | End the Day With God (sc) | evening pack (§2 morning/evening row) |

## 4. Highest-leverage chapters (frequency across all clusters)

Psalms 119, 43; Philippians 2, 3; 2 Timothy 4; Jude; 2 Thessalonians 3;
1 Corinthians 8, 9, 12; Proverbs 4, 14, 23; Colossians 2; Hebrews 9;
2 Peter 1-3; Matthew 12 + Mark 3 + Luke 12 (the unpardonable-sin trio);
Job 16 (required guard); Ecclesiastes 1 (guard); Matthew 23; Psalms 4, 5,
90, 118, 143 (morning/evening + stewardship); Revelation 7, 11, 13, 16,
19-20 (the eschatology locators); 1 Timothy 2 (praying-for-leaders' naming
text).
