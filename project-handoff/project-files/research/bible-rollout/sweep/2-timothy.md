# 2 Timothy — Layer-3 tag-sweep ledger

- **Book:** 2 Timothy (4 chapters, 83 verses; VPL code `2TI`)
- **Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (engine 0.14.0; 239 concept packs). Read-only sweep — no repo changes.
- **Date:** 2026-08-26 · Pauline-epistles sweep worker (1 Timothy + 2 Timothy assignment; the 1 Timothy ledger in this directory was completed first)
- **Inputs used:** book doc `/mnt/project-files/research/bible-rollout/2-timothy.md` (prior art — existing tags re-verified, not re-derived); full 303-id legal vocabulary (239 engine ids at e762d1c ∪ 161 adopted display ids; every id validated mechanically against `engine-ids.txt`/`adopted-161.txt`, pastoral-* prefixes never stripped); pack files in `ontology/concepts/` read directly for every extension decision; CONVENTIONS §3/§4/§5/§6/§9/§11; tag-gaps-review §1 (resolved) + §3 (recorded declines — none overturned); corpus-blocked roster (50 rows — matches routed, not duplicated; row 5 `end-times` is this book's standing route).
- **WEB provenance:** pinned ebible.org engwebp VPL edition, sha256-verified against `pipeline/manifests/web.json` (`b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`) — the pinned snapshot, not a current-edition fetch. Every quotation below is word-for-word from that text (curly punctuation preserved). Chapters 1–2 additionally witnessed verse-for-verse in `pipeline/fixtures/web-subset.json` (same sha256 at PR #53).
- **Rules applied:** presence bar first; soft cap 6 / hard ceiling 8; §11.6 yield order; both-tags ruling; no later-revelation read-backs; honest-and-empty preferred; no silent drops (closing Decisions record); §4-neutral doctrinal posture on contested material; no theology adjudicated. Prior routing respected: this book's falling-away material rides the `backsliding` row; last-days material routes to corpus-blocked roster row 5 (`end-times`); the `benediction` (PR #43) use on ch. 4 is ratified and standing.
- **Weights:** proposed anchor weights use the packs' 0.0–1.0 scale, calibrated against each pack's existing anchors (read in file).

---

## 2 Timothy 1

**Prior-art tags (6):** `fear-not`, `suffering-for-christ`, `grace-not-earned`, `assurance-of-salvation`, `spiritual-gifts`, `discipleship`

### 1. Applied-tag deltas
- **KEEP** all six — re-verified against the pinned text (this chapter is fixture-witnessed): 1:7 "For God didn’t give us a spirit of fear, but of power, love, and self-control."; 1:8 endure-hardship charge; 1:9 "not according to our works, but according to his own purpose and grace"; 1:12 "I know him whom I have believed"; 1:6 "stir up the gift of God which is in you"; 1:2, 5, 13 the mentoring bond.
- **ADD `boldness-in-witness`** (engine id) — the chapter's spine is unashamed testimony, stated three times: "Therefore don’t be ashamed of the testimony of our Lord, nor of me his prisoner" (1:8), Paul's own "Yet I am not ashamed" (1:12), and Onesiphorus who "was not ashamed of my chain" (1:16). Teaching substance (the charge, its ground in 1:7's spirit of power, and two lived examples), not a passing word. Both-tags per §11.2 beside `fear-not` (the no-fear gift) and `suffering-for-christ` (the endure-hardship charge) — three distinct registers, each independently clearing the bar. Chapter moves to 7 tags.
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `assurance-of-salvation` | 2 Timothy 1:12 | "for I know him whom I have believed, and I am persuaded that he is able to guard that which I have committed to him against that day" | 0.75 — the pack anchors 2 Tim 2:19 but not this, the letter's classic assurance sentence (and a hymn-remembered phrase family) |
| `boldness-in-witness` | 2 Timothy 1:7-8 | "For God didn’t give us a spirit of fear, but of power, love, and self-control. Therefore don’t be ashamed of the testimony of our Lord" | 0.7 — pack is Acts/Ephesians only |
| `spiritual-gifts` | 2 Timothy 1:6 | "stir up the gift of God which is in you through the laying on of my hands" | 0.65 — pairs with the 1 Tim 4:14 candidate in the sibling ledger |
| `election-and-predestination` | 2 Timothy 1:9 | "who saved us and called us with a holy calling, not according to our works, but according to his own purpose and grace, which was given to us in Christ Jesus before times eternal" | 0.55 — §4-NEUTRAL discipline binding (the pack's own precedent: routes, adjudicates nothing). DUAL note: `grace-not-earned` already anchors 2 Tim 1:9 [torrey] 0.75 (not-by-works register); this claim is the purpose/calling register — record in both files if taken. |
| `parenting` | 2 Timothy 1:5 (+ 3:14-15, see ch. 3) | "the sincere faith that is in you, which lived first in your grandmother Lois and your mother Eunice" | 0.5 — CAUTION: commendation of inherited faith, not parenting instruction; the book doc's Decision 8 display non-use STANDS — this is an anchor-layer candidate only, for the "passing faith to your children" query family the doc's motif #2 records |

**Already anchored — no new proposals:** `fear-not` → 2 Tim 1:7 (0.9, lexicon carries "spirit of fear"); `grace-not-earned` → 2 Tim 1:9 (0.75).

### 3. Lexicon candidates
- `assurance-of-salvation`: "i know whom i have believed"; "able to guard what i have committed to him"
- `spiritual-gifts`: "stir up the gift"; "fan into flame the gift of god" (NIV-remembered form of 1:6 — the WEB's "stir up" never matches it)

### 4. New-concept candidates
None. (1:10 "who abolished death, and brought life and immortality to light" was weighed — single verse; the register is served contextually by `resurrection`/`salvation` families and is not a measured gap.)

### 5. Decline-overturn proposals
None. (`do-not-lose-heart` non-use — book doc Decision 3 — re-checked and stands; `parenting` non-use — Decision 8 — stands at display layer, see anchor caution above.)

### 6. Ceiling/subdivision markers
7 tags (under ceiling). Subdivided in the book doc (1:1–2 / 3–12 / 13–18) → flagged for the per-verse refinement pass.

**Considered, not added:** `shame` (the pack's personal-shame/guilt register is not this chapter's gospel-unashamedness — register mismatch); `holy-spirit` (1:14 "guard through the Holy Spirit who dwells in us" — single verse); `election-and-predestination` (1:9 single verse inside the grace sentence — thin-single-verse; served as the anchor candidate above); `backsliding` (1:15 Asia's turning away — prior pass's recorded skip stands: desertion of Paul, not apostasy from the faith).

---

## 2 Timothy 2

**Prior-art tags (8 — HARD CEILING):** `suffering-for-christ`, `gods-faithfulness`, `studying-the-word`, `resurrection`, `holiness`, `repentance`, `discipleship`, `false-teachers`

### 1. Applied-tag deltas
- **KEEP** all eight — re-verified (fixture-witnessed chapter): 2:3 "You therefore must endure hardship as a good soldier of Christ Jesus."; 2:13 "If we are faithless, he remains faithful; for he can’t deny himself."; 2:15 "properly handling the Word of Truth"; 2:8 "Remember Jesus Christ, risen from the dead"; 2:21-22 the vessel for honor and "Flee from youthful lusts"; 2:25 "Perhaps God may give them repentance"; 2:2 the succession charge; 2:16–18 gangrene-words with Hymenaeus and Philetus named.
- **ADD** none — chapter at the hard ceiling; candidates weighed and yielded (Decisions record).
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `holiness` | 2 Timothy 2:21-22 | "he will be a vessel for honor, sanctified, and suitable for the master’s use, prepared for every good work. Flee from youthful lusts; but pursue righteousness, faith, love, and peace with those who call on the Lord out of a pure heart." | 0.65 — pack has no 2 Tim anchor; the vessel-for-honor register |
| `resurrection` | 2 Timothy 2:8 | "Remember Jesus Christ, risen from the dead, of the offspring of David, according to my Good News" | 0.6 — the risen-Christ standing charge; pack has no 2 Tim anchor. (2:18's resurrection-already-past error stays inside `backsliding`'s existing 2:17-18 anchor — cross-noted, not re-anchored.) |
| `power-of-gods-word` | 2 Timothy 2:9 | "But God’s word isn’t chained." | 0.55 |
| `repentance` | 2 Timothy 2:24-26 | "in gentleness correcting those who oppose him. Perhaps God may give them repentance leading to a full knowledge of the truth" | 0.55 — the repentance-as-God's-gift register |

**Already anchored — no new proposals:** `gods-faithfulness` → 2:13 (0.9); `studying-the-word` → 2:15 (1.0); `discipleship` → 2:2 (0.95); `suffering-for-christ` → 2:12 (0.7); `assurance-of-salvation` → 2:19 (0.7); `harmony-with-others` → 2:24 (0.75); `self-control` → 2:3-5 (0.7); `backsliding` → 2:17-18 (0.7). The `false-teachers` display id's engine home is `false-prophets`; a 2:16-18 extension there was considered and NOT proposed — `backsliding` already anchors the span (registers differ but a second claim on the same two verses needs the curator's one-design call, noted, not proposed).

### 3. Lexicon candidates
- `studying-the-word`: "study to show yourself approved" (KJV-remembered form of 2:15 — the WEB's "Give diligence to present yourself approved" never matches it); "a workman who does not need to be ashamed"
- `gods-faithfulness`: "if we are faithless he remains faithful"; "he remains faithful"
- `holiness`: "vessel of honor"; "flee youthful lusts"
- `suffering-for-christ`: "good soldier of jesus christ"; "endure hardship like a good soldier"
- `power-of-gods-word`: "the word of god is not chained"

### 4. New-concept candidates
None. (The soldier/athlete/farmer triple (2:3–6) is a motif with homes — book doc motif #3; the trustworthy saying (2:11–13) is `gods-faithfulness` territory, anchored.)

### 5. Decline-overturn proposals
None. (`repentance` borderline-kept — book doc Decision 4 — re-affirmed by this sweep with the anchor candidate above.)

### 6. Ceiling/subdivision markers
**CEILING-MARKED: 8 tags** (prior pass; re-confirmed — every tag independently clears the bar). Subdivided in the book doc (2:1–13 / 14–26) → priority chapter for the per-verse refinement pass.

**Considered, not added (yields at ceiling):** `harmony-with-others` (2:14, 23–24 quarrel-avoidance — engine side already anchored at 2:24; at ceiling the display substance is carried by `repentance`'s gentle-correction justification and `false-teachers`); `power-of-gods-word` (2:9 single clause — anchor candidate instead); `self-control` (already anchored 2:3-5; the display substance is soldier-endurance, carried by `suffering-for-christ`); `victory-in-christ` (2:11–12 reign-with-him clauses — hymn lines, not the pack's victory register); `satan` (2:26 "the devil’s snare" — single verse).

---

## 2 Timothy 3

**Prior-art tags (7):** `studying-the-word`, `suffering-for-christ`, `gods-protection`, `end-times`, `false-teachers`, `discipleship`, `trustworthiness-of-scripture`

### 1. Applied-tag deltas
- **KEEP** all seven — re-verified: 3:15 "the holy Scriptures which are able to make you wise for salvation"; 3:16 "Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness"; 3:12 "Yes, and all who desire to live godly in Christ Jesus will suffer persecution."; 3:11 "The Lord delivered me out of them all."; 3:1 "in the last days, grievous times will come"; 3:6–9 the predator profile; 3:10, 14 the followed teacher. The `end-times` display tag stands as prior art; its engine side routes to corpus-blocked roster row 5 (see §2). The `trustworthiness-of-scripture`/`studying-the-word` both-tags split (reliability vs. engagement) stands per the map's register split.
- **ADD `empty-worship`** (engine id) — the last-days catalog culminates in religion with the shell intact, and the chapter commands a response to it: "holding a form of godliness but having denied its power. Turn away from these, also." (3:5), with the captives "always learning and never able to come to the knowledge of the truth" (3:7). This is the pack's going-through-the-motions register taught as warning, and 3:5 is one of that register's most-searched sentences. Both-tags per §11.2 beside `end-times` (timing register) and `false-teachers` (agent register). **Chapter reaches the 8-tag hard ceiling** — every tag independently clears the bar.
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `suffering-for-christ` | 2 Timothy 3:12 | "Yes, and all who desire to live godly in Christ Jesus will suffer persecution." | 0.75 — a keystone persecution sentence; the pack's only 2 Tim anchor is 2:12 |
| `empty-worship` | 2 Timothy 3:5 | "holding a form of godliness but having denied its power" | 0.7 — the pack has no NT-epistle last-days witness |
| `studying-the-word` | 2 Timothy 3:14-15 | "But you remain in the things which you have learned… From infancy, you have known the holy Scriptures which are able to make you wise for salvation through faith which is in Christ Jesus." | 0.6 — the engagement register; 3:16-17 stays `trustworthiness-of-scripture`'s existing 0.95 anchor per the recorded register split |
| `false-prophets` | 2 Timothy 3:6-9 | "For some of these are people who creep into houses and take captive gullible women loaded down with sins… Even as Jannes and Jambres opposed Moses, so these also oppose the truth" | 0.55 |
| `gods-protection` | 2 Timothy 3:11 | "I endured those persecutions. The Lord delivered me out of them all." | 0.5 — testimony register; the display tag's borderline-kept note (book doc Decision 6) carries to the anchor layer |
| `parenting` | 2 Timothy 3:14-15 (with 1:5) | "From infancy, you have known the holy Scriptures" | 0.5 — same caution as the ch. 1 row: anchor-layer only, display non-use stands |

**Routing (corpus-blocked — route, don't duplicate):** `end-times` engine material → **roster row 5** (2 Tim 3:1-5 is among that row's own blocked refs; the merge-or-two-ids question vs `day-of-the-lord` is Jesse's flagged call — nothing prejudged here). Lexicon phrasings recorded FOR that row's eventual curator, not proposed to any live pack: "the last days"; "grievous times in the last days"; "signs of the last days".

### 3. Lexicon candidates
- `empty-worship`: "form of godliness"; "a form of godliness but denying its power"
- `trustworthiness-of-scripture`: "is the bible inspired"; "inspiration of scripture" (pack has "all scripture is god breathed" but no inspiration form)

### 4. New-concept candidates
None. (The 3:2–5 vice catalog was checked against `covetousness`, `money-and-possessions`, `slander-and-false-accusation`, `aging-and-old-age` — all list-mentions inside the catalog, none teaching substance for those registers.)

### 5. Decline-overturn proposals
None. (`love-not-the-world` non-use — book doc Decision 9 — re-checked and stands: the command is to turn away from such people, not the 1 John 2 charge; the recorded 2 Timothy decline routing 3:15-17 to `studying-the-word` with the permanence register staying at Isaiah's `power-of-gods-word` row also stands.)

### 6. Ceiling/subdivision markers
**CEILING-MARKED: 8 tags after this sweep's add** — priority chapter for the per-verse refinement pass. Subdivided in the book doc (3:1–9 / 10–17).

**Considered, not added:** `money-and-possessions` (3:2 "lovers of money" — one item in the vice list); `slander-and-false-accusation` (3:3 "slanderers" — same); `caring-for-aging-parents` (3:2 "disobedient to parents" — same, and the wrong direction); `salvation` (3:15 "wise for salvation" — carried inside `studying-the-word`/`trustworthiness-of-scripture` justifications; adding at ceiling would be broad-duplicating-specific).

---

## 2 Timothy 4

**Prior-art tags (8 — HARD CEILING):** `second-coming`, `heavenly-reward`, `sharing-your-faith`, `gods-faithfulness`, `loneliness`, `benediction`, `end-times`, `false-teachers`

### 1. Applied-tag deltas
- **KEEP** all eight — re-verified: 4:1 "who will judge the living and the dead at his appearing and his Kingdom"; 4:7–8 "I have fought the good fight. I have finished the course. I have kept the faith." with "the crown of righteousness"; 4:2 "preach the word; be urgent in season and out of season"; 4:17 "But the Lord stood by me and strengthened me"; 4:10–16 the desertions ("Only Luke is with me."; "no one came to help me, but all left me"); 4:22 "The Lord Jesus Christ be with your spirit. Grace be with you. Amen."; 4:3–4 itching ears. The `benediction` PR #43 use is ratified and standing; the `end-times`/`false-teachers` partition of 4:3–4 (demand vs. supply registers, per the log rows) stands under §11.2.
- **ADD** none — chapter at the hard ceiling; candidates weighed and yielded (Decisions record).
- **DROP** none.

### 2. Anchor-extension candidates
| id | ref | WEB quote | weight |
|---|---|---|---|
| `heavenly-reward` | 2 Timothy 4:7-8 | "I have fought the good fight. I have finished the course. I have kept the faith. From now on, the crown of righteousness is stored up for me, which the Lord, the righteous judge, will give to me on that day; and not to me only, but also to all those who have loved his appearing." | **0.9** — the pack (three anchors: Jas 1:12, Eph 6:8, 1 Pet 5:4) lacks the crown-of-righteousness text entirely; the strongest anchor find of this book's sweep |
| `loneliness` | 2 Timothy 4:16-17 | "At my first defense, no one came to help me, but all left me… But the Lord stood by me and strengthened me" | 0.7 — the pack has no Pauline anchor, and the desertion-met-by-presence shape is exactly its design (book doc Decision 2 reviewer ruling). ALTERNATIVE for the curator: `presence-of-god` → 2 Tim 4:17 (0.5) — one design decision, decide together, not a double-mint. |
| `sharing-your-faith` | 2 Timothy 4:2-5 | "preach the word; be urgent in season and out of season; reprove, rebuke, and exhort with all patience and teaching… do the work of an evangelist, and fulfill your ministry" | 0.7 — the vocabulary's most direct preach-the-word text (book doc Decision 7); pack is Acts/2 Cor/Luke/Mark only |
| `false-prophets` | 2 Timothy 4:3-4 | "but having itching ears, will heap up for themselves teachers after their own lusts, and will turn away their ears from the truth, and turn away to fables" | 0.6 — the demand-side text; the book doc staged exactly this as a `false-teachers`-row ref-append |
| `second-coming` | 2 Timothy 4:8 | "and not to me only, but also to all those who have loved his appearing" | 0.55 — with 4:1's "at his appearing and his Kingdom"; pairs with the 1 Tim 6:14-15 candidate |
| `benediction` | 2 Timothy 4:22 | "The Lord Jesus Christ be with your spirit. Grace be with you. Amen." | 0.5 — the letter's closing blessing, the concept's exact form (pack anchors Rom/1 Thess closings only) |

**Already anchored — no new proposals:** `backsliding` → 2 Tim 4:10 (0.6 rider — Demas; the engine side of the prior pass's recorded display skip is already served); `gods-faithfulness` — 4:16-18 substance noted for that pack via the lexicon rows below (its anchor set already leads with Lam 3:22-23/2 Tim 2:13; a 4:17 anchor is folded into the `loneliness`/`presence-of-god` one-design note above rather than triple-proposed).

**Routing (corpus-blocked):** `end-times` engine material on 4:3-4 → **roster row 5**, same route as ch. 3.

### 3. Lexicon candidates
- `heavenly-reward`: "crown of righteousness"; "i have fought the good fight"; "finishing well"
- `victory-in-christ`: "fight the good fight" (imperative form — its 1 Tim 6:12 anchor already exists). **XOR note:** keep the testimony form "i have fought the good fight" with `heavenly-reward` and the imperative with `victory-in-christ` so the two registers never collide on one phrase.
- `sharing-your-faith`: "preach the word"; "in season and out of season"; "do the work of an evangelist"
- `loneliness`: "everyone abandoned me"; "when everyone leaves you"
- `false-prophets`: "itching ears"; "teachers who say what people want to hear"
- `gods-faithfulness`: "the lord stood by me"; "god stood by me"

### 4. New-concept candidates
None. (Come-before-winter/personal-logistics material is narrative texture; "delivered out of the mouth of the lion" (4:17) is served by the `gods-faithfulness`/`loneliness` families — not a measured gap.)

### 5. Decline-overturn proposals
None. (`divine-judgment` non-use — book doc Decision 12 — stands; the recorded 2 Timothy declines routing 4:8 → `heavenly-reward` and 4:9–16 → `loneliness` stand, and this sweep's anchor candidates implement rather than overturn them.)

### 6. Ceiling/subdivision markers
**CEILING-MARKED: 8 tags** (prior pass; re-confirmed). Subdivided in the book doc (4:1–8 / 9–15 / 16–18 / 19–22) → priority chapter for the per-verse refinement pass.

**Considered, not added (yields at ceiling):** `betrayal` (4:10, 14–16 desertion and harm — personal notes/depiction, not betrayal teaching; substance carried by `loneliness`); `presence-of-god` (4:17 — carried by `gods-faithfulness`; anchor-layer one-design note above); `backsliding` (Demas — prior pass's recorded skip stands; pack rider already carries 4:10); `heavenly-reward`/`second-coming` double-coverage of 4:8 stands as the prior pass split it (crown vs. appearing registers).

---

## Decisions record — 2 Timothy sweep (2026-08-26)

Every yield and judgment call of this sweep, each a reversible default Jesse can overturn. No existing tag was dropped anywhere in this book; no recorded decline was overturned.

1. **`boldness-in-witness` ADDED to ch. 1** — three-witness unashamed-testimony spine (1:8, 12, 16); both-tags beside `fear-not` and `suffering-for-christ` (§11.2), three distinct registers each clearing the bar. Chapter to 7.
2. **`empty-worship` ADDED to ch. 3** — 3:5's form-of-godliness sentence plus the turn-away command; both-tags beside `end-times` (timing) and `false-teachers` (agents). Chapter reaches the 8-tag ceiling — flagged.
3. **Chs. 2 and 4 held at ceiling, no adds.** Ch. 2 yields: `harmony-with-others`, `power-of-gods-word`, `self-control`, `victory-in-christ`, `satan` (each with grounds in the chapter block). Ch. 4 yields: `betrayal`, `presence-of-god`, `backsliding` (grounds in block; the Demas skip re-affirms the prior pass).
4. **Falling-away routing respected:** this book's desertion/apostasy material stays on the `backsliding` row exactly as prior art routed it — 1:15 and 4:10 remain display skips (desertion of Paul / single personal note), 2:17-18 remains the pack's anchored span; no re-litigation.
5. **`end-times` routing:** display tags on chs. 3–4 stand as prior art; ALL engine-side material routed to corpus-blocked roster row 5, whose merge-question with `day-of-the-lord` is Jesse's flagged call — nothing prejudged; "last days" lexicon phrasings recorded for that row's curator only.
6. **Anchor-proposal discipline:** `resurrection` 2:8 proposed with 2:18 explicitly left inside `backsliding`'s anchored 2:17-18 span; `studying-the-word` 3:14-15 proposed with 3:16-17 left to `trustworthiness-of-scripture` per the recorded register split; a `false-prophets` claim on 2:16-18 deliberately NOT proposed (would double-claim backsliding's span — one-design note for the curator instead); `loneliness` 4:16-17 vs `presence-of-god` 4:17 framed as ONE design decision; `election-and-predestination` 2 Tim 1:9 flagged as a dual with `grace-not-earned`'s existing anchor, §4-neutral wording binding.
7. **`parenting` anchor candidates (1:5; 3:14-15) carry an explicit caution** and do NOT reverse the book doc's Decision 8 display non-use — anchor-layer only, for the passing-faith-to-children query family.
8. **Lexicon XOR call:** "i have fought the good fight" (testimony) → `heavenly-reward`; "fight the good fight" (imperative) → `victory-in-christ` — proposed as a pair so the registers never collide on one phrase.
9. **Doctrinal posture:** §4-neutral throughout; the Hebrews-adjacent perseverance question raised by falling-away material is adjudicated nowhere (backsliding/assurance-of-salvation both-witnesses design respected); no prosperity framing anywhere.
10. **Id spelling:** every id validated verbatim against `engine-ids.txt` ∪ `adopted-161.txt`; no pastoral-* prefix stripped (none of this book's ids is pastoral-prefixed; `loneliness` verified as a genuine bare engine id, matching the book doc's reviewer ruling).

## Survival audit — 2 Timothy ledger

Per CONVENTIONS §9: every block above was written as an atomic end-of-file append; after each append the file was re-read and verified — pre-existing bytes unchanged (sha256 prefix check), appended block present exactly once. Final audit at this Decisions-record append: all five prior blocks (header + chapters 1–4) verified present and intact in the live file. Cross-book audit at final delivery: the sibling ledger `sweep/1-timothy.md` (completed first) re-verified intact — all eight of its blocks present, byte count unchanged since its own closing audit. No other file under /mnt/project-files was touched by this worker.

---

## Erratum — 2 Timothy ledger (2026-08-26, fresh-critic pass)

Appended per CONVENTIONS §9 as one atomic end-of-file block; nothing above this line was altered. A fresh critic re-ran every mechanical check (quotes, ids, deltas, caps, schema, neutrality, roster routing — all pass) and sustained the items below, both in the anchor-candidate/citation layer. No applied-tag delta changes; every cited source was re-read in file for this erratum and is quoted byte-exactly.

1. **Ch. 4 §2 `heavenly-reward` row RECLASSIFIED: new-find → confirmation.** The row claims the pack "lacks the crown-of-righteousness text entirely" and calls 4:7-8 "the strongest anchor find of this book's sweep." That is true of the anchors list alone (Jas 1:12 / Eph 6:8 / 1 Pet 5:4) — but the pack already knows this ref. `ontology/concepts/heavenly-reward.yaml`'s own header records, byte-exact:
   ```
   # rejects.md). Most crown texts are corpus-blocked (2 Tim 4:7-8, 1 Cor 9:25,
   # Rev 2:10, 1 Thess 2:19-20, Rev 22:12 — backlog.md); this pack should grow
   # with the corpus.
   ```
   Corrections: (a) the row is a CONFIRMATION of a recorded corpus-blocked growth text, not a new find; the superlative is withdrawn; (b) 2 Tim 4 is outside the fixture corpus — this ledger's own header witnesses only chs. 1–2 in `web-subset.json` — so the candidate is corpus-blocked queue-only, exactly as the pack header stages it via backlog.md; (c) weight: no alignment forced — unlike praying-for-leaders' "missing 1.0 anchor" note, this header records the blocked refs without a target figure, so the sweep's proposed 0.9 stands, reframed as the confirmation's suggested figure for the re-pin curator rather than a find's.

2. **Ch. 4 §2 `benediction` row's anchor census corrected.** The row claims "(pack anchors Rom/1 Thess closings only)". `benediction.yaml` in fact anchors FOUR texts: Numbers 6:24-26 (1.0, the Aaronic blessing lead), Hebrews 13:20-21 (0.9), Romans 15:13 (0.85), and 1 Thessalonians 5:23-24 (0.8). Does the 4:22 candidate's case change? Assessed on its own merits, it stands, on corrected grounds: the pack has no 2 Tim anchor, and its recorded corpus-deferred re-pin list ("Corpus-deferred to the re-pin payload (P4.15): 2 Cor 13:14, Jude 24-25, Rev 22:21") does not include 2 Tim 4:22 — so the ref is genuinely unrecorded in the pack, and 4:22 is a letter-closing blessing of exactly the class this locator collects. What falls is only the implied scarcity: with four anchors spanning the Aaronic lead and three NT closings, the gap is narrower than the row implied — consistent with the modest 0.5 already proposed, which stands unchanged. Being in ch. 4, the candidate is corpus-blocked queue-only alongside the pack's other deferred closings.

**Corrected totals (2 Timothy):** tag deltas unchanged — 2 adds (`boldness-in-witness`, `empty-worship`), 29 keeps, 0 drops. Anchor layer: 1 anchor row reclassified new-find → confirmation (`heavenly-reward` 2 Tim 4:7-8), with no weight alignment (the pack records no figure for the blocked ref; the proposed 0.9 stands as the confirmation's suggested figure); `benediction` census corrected from two anchors to four, candidate and 0.5 weight stand. Lexicon counts unchanged.
