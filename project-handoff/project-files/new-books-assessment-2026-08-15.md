# New Books Assessment — 2026-08-15

*For Jesse. Covers the five book PDFs added Aug 14 in the `Books/` folder.*

---

## 1. The short version

All five books are still under copyright, and none of them can be copied into the engine's data. We checked each one for the loophole that saved us in early August — the topical concordance turned out to be a public-domain 1897 book underneath a modern cover, so its contents were free to use. None of these five passed that test. Each is a genuinely modern work: the authors picked their own verses, wrote their own words, and their choices are protected.

But the books are far from useless. They are a map of what real people actually search for — one of them sold 900,000 copies — and they independently confirmed the exact gaps our August 13 audit found (searches like "comfort" and "holy spirit" coming up empty or wrong). We can use their *topic ideas* freely: write test queries first, then connect those queries to verses from the public-domain Torrey data we already own, or to verses you approve editorially. What we can never do is copy any book's verse lists.

One housekeeping note: the PDF scans themselves shouldn't stay in the repository — same redistribution risk as the scans we removed earlier this month. The good news is they only ever landed on a side branch (`claude/hearth-thread-vvwdi2`), never on main. Nothing will be deleted without your say-so.

---

## 2. Per-book verdicts

### At a glance

| Book | What it is | Copyright | Hides public-domain content? | Overlap with what we hold | Verdict |
|---|---|---|---|---|---|
| **A Topical Bible Guide** (Bob Phillips, Harvest House, 2004) | 99 topics → verse lists, NIV | In copyright | No — checked, it's his own selection | 63% of its verse references also appear in Torrey, but it's an independent selection | Blocked for copying; **very helpful** as an idea source |
| **Growing by Heart** (Scharlotte Rich, NavPress, 2004) | 52-week women's devotional, 103 memory verses | In copyright | No — original garden-themed arrangement | 96 of its 103 verses already in our data | Blocked and mostly redundant; helpful for its *themes* |
| **Scriptural Prayers for the Praying Mother / Praying Man** (White Stone Books, 2003) | 99 prayer topics with KJV verses — one book, gender-swapped into two | In copyright | No — original prayers and arrangement | 86% of its verses already in Torrey | Blocked; helpful as a checklist of modern search words |
| **31 Scriptures Every Achiever Should Memorize** (Mike Murdock, Wisdom International) | 31 words → 1 verse each | In copyright | No — his own proprietary topic frame | 23 of 31 verses already in Torrey | Blocked **and** theologically unsound in places — never cite as a source |

### A Topical Bible Guide (Bob Phillips)

**What it is.** A small mass-market reference: 99 alphabetical topics (Anxiety → Wives), each with a couple of quoted NIV passages plus a list of further references — about 730 references in all. It sold roughly 900,000 copies, which makes its topic list market-tested search language.

**Copyright.** Double wall: the 2004 selection and arrangement belongs to Phillips/Harvest House, and the quoted Bible text is NIV, which is itself copyrighted.

**Did we check whether it's secretly public-domain?** Yes — the same test that freed the concordance. We compared nine of its topics verse-by-verse against Torrey (the 1897 public-domain topical index we already ingested). About 63% of Phillips's references also appear in the matching Torrey topic — but that's just the overlap any two topical indexes share on famous verses. Phillips consistently includes verses Torrey lacks and uses only a small slice of each Torrey list. Conclusion: it's a genuine modern selection, not a re-dressed old book. **The copying door is closed.**

**How much overlaps what we already have?** About 57 of his 99 topics have a Torrey equivalent, and about 26 are already covered by our existing concept files. The rest split into a modern end-times cluster (Rapture, Tribulation, Mark of the Beast — framings Torrey's 1897 vintage predates) and a modern pastoral cluster (Loneliness, Guidance, Guilt, Self-Image, Golden Rule...).

**What it adds, used the right way.** This is the strongest of the five. It independently confirms the audit's two biggest gaps — **Comfort** and **Holy Spirit** — and both have a public-domain path: Torrey's own "Affliction, Consolation Under" and "Holy Spirit, the Comforter" topics are sitting in our data, un-mined. It also hands us ~16 test queries we currently have no protection for: loneliness, guidance, guilt, self-image, comfort, holy spirit, assurance of salvation, rapture, unpardonable sin, golden rule, lord's prayer, and more.

**Next step.** Treat its 99 headings as a to-do list: write the test queries first, then curate the answers from Torrey or your own editorial picks. Never transcribe a Phillips verse list.

### Growing by Heart (Scharlotte Rich)

**What it is.** A 52-week Scripture-memory devotional for women, wrapped in a garden metaphor — about 75% devotional prose, with 1–2 memory verses per week (103 distinct verses total, mostly NIV).

**Copyright.** ©2004 NavPress, fully in copyright; nothing derivative of an older public-domain work.

**How much overlaps?** At the verse level it's nearly redundant: **96 of its 103 verses are already in our data** (41 already anchor an existing concept, 55 more appear in Torrey). Even if copying were legal, it would add almost no new verses — the definition of weight without value.

**What it adds, used the right way.** Its *themes* are the value. Our current test queries are heavy on pastoral crisis and core doctrine; this book names the everyday-devotional-life searches we don't cover at all: worry, friendship, contentment and comparison, rest and burnout, self-worth ("fearfully and wonderfully made"), people-pleasing, guarding the tongue, generosity, and — directly relevant to a known bug — "fresh start" / "starting over" (Psalm 51:10, Acts 3:19), which is exactly the phrasing our broken "new beginnings" search needs.

**Next step.** Turn ~8–10 of those themes into test queries, then wire them to public-domain or editorial verse choices.

### Scriptural Prayers for the Praying Mother / Praying Man (two volumes, one book)

**What it is.** Topical written prayers (Stress, Worry, Guidance, Finances, For My Teenager...), each followed by supporting KJV verses. The two volumes are the same book gender-swapped: 90 of 99 topics are shared, the shared prayers are word-for-word identical after swapping he/she, and 80 of the 90 shared topics have identical verse lists. Treat them as one source.

**Copyright.** ©2003 Word and Spirit Resources, in copyright. The prayers are original prose and the topic-to-verse arrangement is original — no public-domain ancestor. (The KJV verse text itself is public-domain, but the selection isn't.)

**How much overlaps?** 86% of its unique verses already appear in our Torrey data. The handful that don't are famous devotional verses we mostly already hold elsewhere (Jeremiah 29:11, Psalm 91:1...).

**What it adds, used the right way.** Its table of contents is a near-perfect list of what a church member actually types: stress, worry, fatigue, discouragement, rejection, guidance, wisdom, discernment, favor, finances, new job, prayer for my teenager, protection, travel, crisis, time management. Almost none of those words exist in our search vocabulary yet. It also scores three direct hits on the audit gap list: **Holy Spirit/Comforter** (its "Help From the Holy Spirit" topic pairs John 14:16 and 14:26 with grief and comfort — exactly the fix the broken "comforter" search needs), **new creation** (2 Cor 5:17), and **comfort**.

**Next step.** Mine the topic titles for test queries; answer them from Torrey headings we already own (Care Overmuch, Protection, Sickness, Holy Spirit the Comforter, even Procrastination — Torrey really has one).

### 31 Scriptures Every Achiever Should Memorize (Mike Murdock)

**What it is.** A 44-page booklet: one modern word per page (Ability, Focus, Debt, Stress, Teamwork...), one KJV verse, one aphorism.

**Copyright.** In copyright (Wisdom International), and clearly not derived from any public-domain source — the topic frame (Assignment, Goal-Setting, Promotion) is Murdock's own self-help vocabulary.

**The bigger problem: theological soundness.** This project's top priority is connecting the *right* concepts to the *right* scripture, and several of Murdock's pairings are prosperity-gospel proof-texting — verses bent to mean something they don't:

- **Achievement → John 14:12** ("greater works") read as personal success rather than continuing Christ's mission
- **Prosperity → Job 36:11** — quoting a speech the book of Job itself frames as flawed, as if it were flat doctrine
- **Ability → Phil 4:13** — a verse about contentment in hardship recast as achiever empowerment
- Plus Assignment → Jer 1:4-5, Criticism → Matt 12:37, Delegation → Luke 16:12

The book's own back pages promise "4 Miracle Harvests guaranteed" for a $58/month donation. Because our engine cites its sources by name, listing Murdock as a source would put a contested imprimatur inside the product. The sound pairings don't need him (Torrey already carries them), and the unsound ones are exactly what only he would contribute. **Never cite this book as a source.**

**What it adds anyway.** About a dozen modern single-word queries real people type — stress, focus, debt, rest, teamwork, guidance, wisdom, decision, reputation, business, fear, tithing — are fine as *ideas*, anchored to sound verses through Torrey or your editorial judgment. (23 of its 31 verses are already in Torrey.)

**Next step.** Fold those ~12 words into the search-vocabulary work as test queries; discard the book.

---

## 3. The harvest: what the books actually give us

None of the five can contribute a single verse list — and yet together they're a valuable haul, because they answer a question no public-domain book can: *what do people search for in 2026?*

### (a) Confirmed gaps with a public-domain path

The August 13 audit found these holes; the books independently confirm them, and for most the fix is already sitting in data we own:

- **Comfort** — Phillips has a Comfort topic; the prayer books use comfort language throughout. Torrey's "Affliction, Consolation Under" topic is in our data, un-mined.
- **Holy Spirit / Comforter** — named by Phillips and the prayer books (John 14:16, 14:26 paired with grief — the exact fix for the sense-inverted "comforter" result). Torrey's "Holy Spirit, the Comforter" topic is in our data, un-mined.
- **New creation** — 2 Cor 5:17 appears in Phillips and the prayer books.
- **"New beginnings" / fresh start** — Growing by Heart's "starting over" week supplies the phrasings (Ps 51:10, Acts 3:19) our sense-inverted result needs.

### (b) Missing real-world search queries (combined, ~45)

Every one of these is a phrase from the books that our test suite currently has no query for:

| Everyday life | Inner life | Faith questions | Practical / family |
|---|---|---|---|
| worry | loneliness / feeling alone | assurance of salvation | finances / money |
| stress | guilt | holy spirit | new job |
| rest / burnout | self-image / identity in Christ | rapture | prayer for my teenager |
| friendship | self-worth ("fearfully and wonderfully made") | unpardonable sin | protection for my child |
| contentment / comparison | discouragement | lord's prayer | travel safety |
| people-pleasing | disappointment | golden rule | time management |
| gossip / guarding the tongue | rejection | provision / "God will provide" | teamwork |
| fatigue / tired | fresh start / starting over | guidance / "God's will for my life" | debt |
| crisis | confidence | wisdom / discernment | tithing / giving |
| peer pressure | favor | integrity | generosity |
| focus | patience | occult | mothering / home |

The way in is always the same: write the test query first (the project calls these "golden fixtures" — a recorded search plus the results it should return, so the behavior is locked in and protected), then connect it to verses from the public-domain Torrey data or your own editorial curation. You merge every change yourself, as usual.

### (c) Vocabulary and alias ideas

Words people use interchangeably that the engine should treat as synonyms:

- **worry ↔ anxiety** (our current coverage only knows the phrase "anxious for nothing")
- **communion ↔ lord's supper**
- **bereavement ↔ grief**
- **second coming ↔ return of Christ** — but keep **rapture** *distinct*: Phillips deliberately treats Rapture and Return of Christ as separate topics, a useful modeling hint
- devil ↔ satan; witnessing ↔ evangelism ↔ sharing your faith

And one trap worth writing down: **"doubtful things" is not "doubt."** Phillips's "Doubtful Things" topic is about Romans 14 (gray areas of conscience), not about wavering faith. Wiring those words together would create exactly the kind of wrong-reason result the project treats as a real failure.

---

## 4. What to do with the PDF files

**Recommendation: once the ideas above are harvested into test queries, remove the `Books/` folder from the repository.** Keep the PDFs on your own computer — they're your reference library; they just shouldn't be redistributed through the repo, which is the same risk that led us to remove the Baker's and QuickNotes scans earlier this month.

Where things stand:

- The books exist only on the side branch `claude/hearth-thread-vvwdi2` (commit `c3ff4ba`, "Added books", Aug 14). They have **never been on main** — main is clean.
- The work session using that branch has been warned not to carry the `Books/` folder into any of its pull requests.
- **Nothing gets deleted without your say-so.** When you're ready, say the word and the folder comes off the branch; until then it sits where it is.
