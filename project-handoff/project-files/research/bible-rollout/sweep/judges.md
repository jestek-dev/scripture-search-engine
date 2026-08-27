# Judges sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (engine 0.14.0), plus the
  §11.1 adopted display-tag ids per the BRIEFING §7 reconstruction (engine ids preferred;
  adopted-but-not-engine ids used only with exact roster/review spelling, source named).
- Book: Judges (21 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/judges.md
  - Concept inventory (239 ids, lexicons+anchors): /tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/concept-inventory.md (+ concept-ids.txt)
  - Declines & contested calls (tag-gaps-review §1/§3 + Jesse's 2026-08-25 rulings): .../scratchpad/declines-and-contested.md
  - Corpus-blocked roster (route, don't duplicate): .../scratchpad/corpus-blocked-roster.md (engine-pack-backlog.md extract; all 50 rows still gated, riding PR-β)
  - Conventions extract (§5, §9, §11 verbatim): .../scratchpad/conventions-extract.md
  - WEB chapter text: the repo-pinned ebible.org engwebp VPL snapshot at
    /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt (book code JDG,
    618 verse lines; manifest pipeline/manifests/web.json, manifest sha b6f55cc7…,
    contentSha256 944e3883…, re-admitted 2026-08-25 in PR #53). Every quotation in this
    ledger was verified word-for-word (curly apostrophes and all) against that file by grep
    before being recorded — pinned-text verification per CONVENTIONS §3.
- Rulings honored without re-litigation: the §1 contested calls are ruled (CONVENTIONS §11);
  specifically the Judges 11 grief-tag question is settled — `pastoral-grief-and-loss` on
  Judges 11 is KEPT, annotated, per Jesse's 2026-08-25 delegated ruling (§11(4)).
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Judges <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")
- Corpus-blocked routing convention: a finding on one of the 50 roster concepts is recorded
  as "routed to backlog: <id> (roster row N)" — never duplicated as a fresh proposal. The
  four adopted display ids already on judges.md tag lines that sit on that roster
  (`deliverance` row 32, `empowered-by-the-spirit` row 13, `gods-surprising-choice` row 21,
  `right-in-their-own-eyes` row 20) stay as display tags per §11.1; every engine-side
  finding on them is routed, not proposed.

## Judges 1

- Existing tags (book doc): `guidance`, `presence-of-god`
- Applied-tag deltas:
  - KEEP `guidance` — the book opens with Israel seeking and receiving God's direction: “the children of Israel asked of the LORD” — “Who should go up for us first against the Canaanites, to fight against them?” — and “The LORD said, ‘Judah shall go up.’” (1:1–2).
  - KEEP `presence-of-god` — the victories are traced to God's being with his people: “The LORD was with Judah” (1:19) and, of the house of Joseph, “the LORD was with them” (1:22).
  - No adds — re-judged against the full 239-id library + adopted list: the “didn’t drive out” refrain (1:21, 27–33) is disobedience depicted as failure, and no failure-mode tag is permitted (Genesis-3 worked example); Adoni-Bezek's “As I have done, so God has done to me.” (1:7) is a single-verse retribution confession, below the presence bar for `divine-judgment`; Achsah's “Give me a blessing” (1:15) is a land request, not `blessing`'s teaching substance.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 2 (subdivided: 2:1–5; 2:6–9; 2:10–15; 2:16–23)

- Existing tags (book doc): `covenant`, `sin`, `divine-judgment`, `the-lords-discipline`, `gods-faithfulness`, `testing`, `backsliding`, `idolatry` — at the 8-tag hard ceiling.
- Applied-tag deltas:
  - KEEP `covenant` — covenant kept and covenant broken is the chapter's hinge: “I will never break my covenant with you.” (2:1) against “Because this nation transgressed my covenant” (2:20).
  - KEEP `sin` — “The children of Israel did that which was evil in the LORD’s sight, and served the Baals.” (2:11), “dealt more corruptly than their fathers” (2:19).
  - KEEP `divine-judgment` — “The LORD’s anger burned against Israel, and he delivered them into the hands of raiders” and “He sold them into the hands of their enemies” (2:14), “the LORD’s hand was against them for evil, as the LORD had spoken” (2:15).
  - KEEP `the-lords-discipline` — the handing-over is corrective and bounded: “it grieved the LORD because of their groaning” and he “saved them out of the hand of their enemies all the days of the judge” (2:18), with the nations left “that by them I may test Israel” (2:22).
  - KEEP `gods-faithfulness` — amid the unfaithfulness, “The LORD raised up judges, who saved them out of the hand of those who plundered them.” (2:16).
  - KEEP `testing` — God's stated purpose: “that by them I may test Israel, to see if they will keep the LORD’s way to walk therein” (2:22).
  - KEEP `backsliding` — the relapse cycle stated in full: “But when the judge was dead, they turned back, and dealt more corruptly than their fathers” (2:19, within 2:11–19 — which is this engine pack's own recorded anchor, Judges 2:11-19 w0.8).
  - KEEP `idolatry` — the foretold snare enacted: “their gods will be a snare to you” (2:3), “They abandoned the LORD, and served Baal and the Ashtaroth.” (2:13).
  - No adds possible or warranted — the chapter is at the hard ceiling; `repentance`/`lament` at Bochim (2:4–5, “the people lifted up their voice and wept”) remain the application pass's recorded ceiling-yields, honored here (see Decisions).
- Anchor-extension candidates:
  - `testing` | Judges 2:21-22 | “that by them I may test Israel, to see if they will keep the LORD’s way to walk therein” | w0.6.
  - `covenant` | Judges 2:1-2 | “I will never break my covenant with you. You shall make no covenant with the inhabitants of this land.” | w0.55.
  - `the-lords-discipline` | Judges 2:14-19 | “it grieved the LORD because of their groaning by reason of those who oppressed them” | w0.55. (The pack has only two anchors today; this is its cleanest OT narrative enactment.)
  - Note: `backsliding` needs no extension — Judges 2:11-19 is already an anchor in the pack (w0.8).
- Lexicon candidates:
  - `backsliding` | term: “the cycle of sin in judges” | queries: “the sin cycle in Judges”, “why did Israel keep turning away from God”, “cycle of sin and deliverance”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: HARD CEILING 8 HIT; subdivided in the book doc (4 sections) — PER-VERSE REFINEMENT CANDIDATE.
- Decisions record: The application pass's two recorded ceiling-yields stand un-reversed: `deliverance` (2:16, 18 — the exact span `gods-faithfulness` quotes; also corpus-blocked, routed to backlog: `deliverance` (roster row 32)) and `lament` (2:4–5 Bochim weeping — one scene in a chapter at the ceiling; yield class: thin single-scene beside eight stronger claims). No existing tag dropped.

## Judges 3 (subdivided: 3:1–6; 3:7–11; 3:12–30; 3:31)

- Existing tags (book doc): `testing`, `sin`, `prayer`, `divine-judgment`, `deliverance`, `empowered-by-the-spirit`, `gods-surprising-choice` (7 tags; the last three are adopted display ids).
- Applied-tag deltas:
  - KEEP `testing` — the chapter's own frame: the nations were “left to test Israel by them, to know whether they would listen to the LORD’s commandments” (3:4, with 3:1).
  - KEEP `sin` — twice over: “The children of Israel did that which was evil in the LORD’s sight, and forgot the LORD their God” (3:7), “The children of Israel again did that which was evil in the LORD’s sight” (3:12).
  - KEEP `prayer` — each deliverance begins “When the children of Israel cried to the LORD” (3:9, 15), and he answers with a savior.
  - KEEP `divine-judgment` — “the LORD’s anger burned against Israel, and he sold them into the hand of Cushan Rishathaim” (3:8); “the LORD strengthened Eglon the king of Moab against Israel” (3:12).
  - KEEP `deliverance` (adopted display id; corpus-blocked, engine-side routed to backlog: `deliverance` (roster row 32)) — “the LORD raised up a savior to the children of Israel, who saved them” (3:9), “the LORD raised up a savior for them: Ehud” (3:15), and Shamgar “also saved Israel” (3:31).
  - KEEP `empowered-by-the-spirit` (adopted display id; routed to backlog: `empowered-by-the-spirit` (roster row 13)) — “The LORD’s Spirit came on him, and he judged Israel; and he went out to war” (3:10).
  - KEEP `gods-surprising-choice` (adopted display id; routed to backlog: `gods-surprising-choice` (roster row 21)) — rescue through unlikely instruments: “Ehud the son of Gera, the Benjamite, a left-handed man” with a homemade sword — “Ehud made himself a sword which had two edges” (3:15–16) — and Shamgar “who struck six hundred men of the Philistines with an ox goad” (3:31).
  - No adds — `idolatry` (3:6–7) and `backsliding` (3:7, 12) remain the application pass's recorded skips (two-verse cycle notices already inside `sin`'s span; the themes' substantial chapters are 2, 6, 8, 10, 17, 18); re-checked and honored. Intermarriage with the nations (3:5–6) is routed, not tagged — see Decisions.
- Anchor-extension candidates:
  - `testing` | Judges 3:1-4 | “They were left to test Israel by them, to know whether they would listen to the LORD’s commandments” | w0.55.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: 7 tags — soft cap 6 exceeded under the §11.6 every-tag-clears-the-bar allowance (each of the seven independently justified above; hard ceiling not hit); subdivided in the book doc (4 sections) — PER-VERSE REFINEMENT CANDIDATE.
- Decisions record: Intermarriage-and-their-gods (3:5–6, “They took their daughters to be their wives, and gave their own daughters to their sons and served their gods.”) matches the corpus-blocked `unequally-yoked` concept — routed to backlog: `unequally-yoked` (roster row 47), not tagged and not proposed fresh (two verses; also below the presence bar for a display tag). No existing tag dropped.

## Judges 4

- Existing tags (book doc): `divine-judgment`, `prayer`, `gods-faithfulness`, `deliverance`, `gods-surprising-choice`
- Applied-tag deltas:
  - KEEP `divine-judgment` — Israel's evil answered: “The LORD sold them into the hand of Jabin king of Canaan” (4:2, with 4:1).
  - KEEP `prayer` — under twenty years of oppression, “The children of Israel cried to the LORD” (4:3) — and the deliverance follows.
  - KEEP `gods-faithfulness` — the victory is the LORD keeping his word through Deborah: “this is the day in which the LORD has delivered Sisera into your hand” (4:14) and “So God subdued Jabin the king of Canaan before the children of Israel on that day.” (4:23).
  - KEEP `deliverance` (adopted display id; routed to backlog: `deliverance` (roster row 32)) — the rescue is God's own act: “The LORD confused Sisera, all his chariots, and all his army, with the edge of the sword before Barak.” (4:15, with 4:14, 23).
  - KEEP `gods-surprising-choice` (adopted display id; routed to backlog: `gods-surprising-choice` (roster row 21)) — the honor goes to unlikely hands as foretold: “the LORD will sell Sisera into a woman’s hand” (4:9), and Jael “took a tent peg, and took a hammer in her hand” (4:21).
  - No adds — `leadership` was considered for Deborah (“Deborah, a prophetess … judged Israel at that time … the children of Israel came up to her for judgment”, 4:4–5) and declined: the chapter depicts a leader at work but carries no leadership teaching substance (presence bar).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (5 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 5

- Existing tags (book doc): `praise`, `worship`, `presence-of-god`
- Applied-tag deltas:
  - KEEP `praise` — the song is Israel's praise for deliverance: “I, even I, will sing to the LORD. I will sing praise to the LORD, the God of Israel.” (5:3), with “be blessed, LORD!” (5:2) and “Bless the LORD!” (5:9).
  - KEEP `worship` — a whole chapter of declaring God's acts to God: “there they will rehearse the LORD’s righteous acts, the righteous acts of his rule in Israel.” (5:11).
  - KEEP `presence-of-god` — the LORD's march remembered in theophany: “The mountains quaked at the LORD’s presence, even Sinai at the presence of the LORD, the God of Israel.” (5:4–5).
  - No adds — `remnant` was considered for “Then a remnant of the nobles and the people came down.” (5:13) and declined: a battle-muster description, not the preserved-remnant doctrine the concept teaches (presence bar); `thanksgiving` declined — the song's register is praise, already tagged, with no giving-of-thanks vocabulary in the chapter.
- Anchor-extension candidates:
  - `praise` | Judges 5:2-3 | “I, even I, will sing to the LORD. I will sing praise to the LORD, the God of Israel.” | w0.55. (The pack's anchors are all Psalms/NT; this is a narrative victory-song anchor.)
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (3 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 6 (subdivided: 6:1–10; 6:11–24; 6:25–32; 6:33–40)

- Existing tags (book doc): `presence-of-god`, `fear-not`, `worship`, `obedience-to-the-word`, `sin`, `doubt`, `gods-surprising-choice`, `idolatry` — at the 8-tag hard ceiling.
- Applied-tag deltas:
  - KEEP `presence-of-god` — the call rests on God's presence: “The LORD is with you, you mighty man of valor!” (6:12) and “Surely I will be with you” (6:16).
  - ADD `angels` — one of Scripture's fullest angel-of-the-LORD appearance narratives, and the pack's own register (“the angel of the lord” is a lexicon term): “The LORD’s angel came and sat under the oak which was in Ophrah” (6:11), “The LORD’s angel appeared to him” (6:12), fire from the rock and “Then the LORD’s angel departed out of his sight.” (6:21), Gideon's “Because I have seen the LORD’s angel face to face!” (6:22). The `angels` id post-dates the book doc's 131-id vocabulary — a sweep gap-fill, not a reversal of a prior decline.
  - DROP `fear-not` — §11.6 forced yield, NOT a presence-bar failure: with `angels` clearing the bar the chapter has nine honest candidates against the hard ceiling of 8; `fear-not`'s in-chapter substance is a single verse — “Peace be to you! Don’t be afraid. You shall not die.” (6:23) — the only candidate in the thin-single-verse yield class. Full Decisions entry below; the verse survives as an engine anchor-extension candidate.
  - KEEP `worship` — Gideon's offering consumed by fire (6:19–21) and the altar he builds and names: “Then Gideon built an altar there to the LORD, and called it ‘The LORD is Peace.’” (6:24).
  - KEEP `obedience-to-the-word` — costly obedience despite fear: “Then Gideon took ten men of his servants, and did as the LORD had spoken to him.” — by night, “Because he feared his father’s household and the men of the city” (6:27).
  - KEEP `sin` — the chapter opens with “The children of Israel did that which was evil in the LORD’s sight” (6:1) and God's indictment “But you have not listened to my voice.” (6:10).
  - KEEP `doubt` — honest doubt met with patience: “if the LORD is with us, why then has all this happened to us?” (6:13), “show me a sign that it is you who talk with me.” (6:17), and the twice-granted fleece — “God did so that night” (6:36–40). (PR #43 id; use ratified 2026-08-25.)
  - KEEP `gods-surprising-choice` (adopted display id; routed to backlog: `gods-surprising-choice` (roster row 21)) — God calls the self-described least: “my family is the poorest in Manasseh, and I am the least in my father’s house.” (6:15), greeted “The LORD is with you, you mighty man of valor!” (6:12).
  - KEEP `idolatry` — Baal's altar in Gideon's father's yard comes down at God's command: “throw down the altar of Baal that your father has, and cut down the Asherah that is by it” (6:25), with Joash's exposure of the idol's emptiness — “If he is a god, let him contend for himself” (6:31).
- Anchor-extension candidates:
  - `angels` | Judges 6:11-22 | “The LORD’s angel appeared to him, and said to him, ‘The LORD is with you, you mighty man of valor!’” | w0.6.
  - `fear-not` | Judges 6:23 | “Peace be to you! Don’t be afraid. You shall not die.” | w0.5. (Preserves the yielded display tag as an exact-range engine anchor — the per-verse-refinement design working as intended.)
  - `doubt` | Judges 6:36-40 | “If there is dew on the fleece only, and it is dry on all the ground, then I’ll know that you will save Israel by my hand, as you have spoken.” | w0.6.
  - `idolatry` | Judges 6:25-32 | “throw down the altar of Baal that your father has, and cut down the Asherah that is by it” | w0.6.
- Lexicon candidates:
  - `doubt` | terms: “gideons fleece; putting out a fleece” | queries: “Gideon’s fleece”, “putting out a fleece before God”, “is it wrong to test God with a sign”. (Routing question flagged: these queries could alternatively home on `guidance` — one home, not both; curator's call.)
- New-concept candidates:
  - proposed-id `asking-god-for-a-sign` | rationale: a real lay search intent (“asking God for a sign”, “is it OK to ask God for a sign”, “how do I know it’s God speaking”) with no vocabulary home — `doubt` is unbelief-shaped, `guidance` is direction-shaped, and neither lexicon carries sign-seeking | anchors: Judges 6:17 “show me a sign that it is you who talk with me.” (w1); Judges 6:36-40 “behold, I will put a fleece of wool on the threshing floor.” (w0.9) | CHECK-FIRST: a lexicon extension of `doubt` or `guidance` (see lexicon candidate above) may serve the family without a mint — decide one route, not both.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: HARD CEILING 8 HIT (nine clearing candidates, one forced yield); subdivided in the book doc (4 sections) — PER-VERSE REFINEMENT CANDIDATE.
- Decisions record: §11.6 yield — `fear-not` DROPPED from Judges 6, not silently: nine candidates independently clear the presence bar (the eight existing tags plus `angels`, an id unavailable to the book doc's 131-id vocabulary); the hard ceiling is 8; the §11.6 yield order (cross-ref class → theme-witness-with-caveat → thin single-verse → broad-duplicating-specific) reaches `fear-not` first — its entire in-chapter substance is the single verse 6:23, while every other candidate spans a scene or more. The dropped tag is preserved as a `fear-not` anchor-extension candidate at exactly 6:23 (above). Reversible on Jesse's word — an equally defensible resolution is keeping `fear-not` and yielding `angels` to the anchor-extension row alone; this ledger records the swap as its delegated default because `angels` spans 6:11–22 and serves a heavier query family (“the angel of the lord”).

## Judges 7

- Existing tags (book doc): `dreams-and-visions`, `humble-exaltation`, `trust-in-god`, `worship`, `deliverance`, `gods-surprising-choice`
- Applied-tag deltas:
  - KEEP `dreams-and-visions` — the barley-cake dream and its interpretation, arranged by God as the sign that steadies Gideon: “Behold, I dreamed a dream” (7:13), “This is nothing other than the sword of Gideon … God has delivered Midian into his hand, with all the army.” (7:14).
  - KEEP `humble-exaltation` — God deliberately shrinks the army so no one can boast: “The people who are with you are too many for me to give the Midianites into their hand, lest Israel brag against me, saying, ‘My own hand has saved me.’” (7:2, with 7:4–7).
  - KEEP `trust-in-god` — three hundred men advance against “locusts for multitude” (7:12) carrying only trumpets, pitchers, and torches, on the strength of “Arise, for the LORD has delivered the army of Midian into your hand!” (7:15, with 7:16–21).
  - KEEP `worship` — Gideon's response to the overheard dream: “when Gideon heard the telling of the dream and its interpretation, that he worshiped.” (7:15).
  - KEEP `deliverance` (adopted display id; routed to backlog: `deliverance` (roster row 32)) — a rout God alone works: “the LORD set every man’s sword against his fellow and against all the army” (7:22, with 7:14).
  - KEEP `gods-surprising-choice` (adopted display id; routed to backlog: `gods-surprising-choice` (roster row 21)) — the army cut from thousands to three hundred so the victory cannot be claimed: “I will save you by the three hundred men who lapped” (7:7, with 7:2–6). Sits beside `humble-exaltation` under the §11.2 both-tags ruling (choice-of-weak-instruments register vs. anti-boasting humbling register, both anchored at 7:2–7 — the application pass's recorded call, re-affirmed).
  - No adds — `fear-not` considered for 7:10 (“But if you are afraid to go down, go with Purah your servant”) and declined: an accommodation of fear, not the divine-comfort formula (presence bar).
- Anchor-extension candidates:
  - `humble-exaltation` | Judges 7:2 | “lest Israel brag against me, saying, ‘My own hand has saved me.’” | w0.6.
  - `dreams-and-visions` | Judges 7:13-15 | “Behold, I dreamed a dream; and behold, a cake of barley bread tumbled into the camp of Midian” | w0.55.
- Lexicon candidates:
  - `humble-exaltation` | term: “gideons three hundred” | queries: “why did God reduce Gideon’s army”, “Gideon’s 300 men”, “God doesn’t need a big army”. (Flag: passage-lookup-shaped; keep only if fixtures show the query family missing.)
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: soft cap 6 hit exactly (6 tags, each clearing the bar; hard ceiling not hit); not subdivided in the book doc.
- Decisions record: None.

## Judges 8 (subdivided: 8:1–21; 8:22–27; 8:28–35)

- Existing tags (book doc): `harmony-with-others`, `sin`, `backsliding`, `idolatry`
- Applied-tag deltas:
  - KEEP `harmony-with-others` — a quarrel that could have split the tribes dissolved by a humble answer: “Isn’t the gleaning of the grapes of Ephraim better than the vintage of Abiezer?” — “Then their anger was abated toward him when he had said that.” (8:2–3, with 8:1).
  - KEEP `sin` — victory sours into unfaithfulness: the ephod “became a snare to Gideon and to his house” (8:27), and after his death “The children of Israel didn’t remember the LORD their God” (8:34).
  - KEEP `backsliding` — the relapse the cycle predicted: “As soon as Gideon was dead, the children of Israel turned again and played the prostitute following the Baals” (8:33, with 8:34–35).
  - KEEP `idolatry` — idolatry home-made from victory: “Gideon made an ephod out of it … Then all Israel played the prostitute with it there” (8:27), and “made Baal Berith their god” (8:33).
  - ADD `god-reigns` — the book's great theocracy statement, made to Israel's face when they offer Gideon a dynasty: “Rule over us, both you, your son, and your son’s son also” — “I will not rule over you, neither shall my son rule over you. The LORD shall rule over you.” (8:22–23). The `god-reigns` id post-dates the book doc's 131-id vocabulary (Isaiah-row mint), and the book doc's own motif list names this verse under “God's rule over his people” — a sweep gap-fill. Delegated call, reversible: the substance is one two-verse exchange, but it is the chapter's theological hinge and the concept's exact register (“god is king”).
- Anchor-extension candidates:
  - `god-reigns` | Judges 8:22-23 | “I will not rule over you, neither shall my son rule over you. The LORD shall rule over you.” | w0.6.
  - `do-not-lose-heart` | Judges 8:4 | “he and the three hundred men who were with him, faint, yet pursuing.” | w0.5.
- Lexicon candidates:
  - `do-not-lose-heart` | term: “faint yet pursuing” | queries: “faint yet pursuing”, “keep going when exhausted”, “weary but still pressing on”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT CANDIDATE (5 tags after delta; caps not hit).
- Decisions record: `god-reigns` ADD recorded as a reversible delegated default (rationale above; Jesse can strike it and the chapter still carries four tags).

## Judges 9 (subdivided: 9:1–6; 9:7–21; 9:22–49; 9:50–57)

- Existing tags (book doc): `divine-judgment`, `sin`
- Applied-tag deltas:
  - KEEP `divine-judgment` — the chapter's own verdict: “Then God sent an evil spirit between Abimelech and the men of Shechem” (9:23), “Thus God repaid the wickedness of Abimelech” and “God repaid all the wickedness of the men of Shechem on their heads” (9:56–57, with 9:24).
  - KEEP `sin` — a kingdom founded on fratricide: silver from the house of Baal Berith hires “vain and reckless fellows” (9:4), and Abimelech “killed his brothers the sons of Jerubbaal, being seventy persons, on one stone” (9:5), blood the narrative never lets out of view (9:24).
  - No adds — `trusting-in-man` considered (“the men of Shechem put their trust in him”, 9:26, and the crowning of the bramble-king, 9:14–15) and declined: the chapter depicts misplaced political trust destroyed, but the narrator's stated teaching is wickedness repaid (9:56–57), not the do-not-trust-in-princes doctrine — the failure-mode rule and presence bar both hold it out. `humble-exaltation` declined likewise: a proud usurper's fall is narrated, but the chapter never states the exalt-the-humble reversal.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates:
  - proposed-id `evil-spirit-from-god` | rationale: a real, recurring lay question (“why did God send an evil spirit”, “evil spirit from the LORD”, “does God use evil spirits”) with no vocabulary home — `satan` is a different figure, `divine-judgment` carries the register only contextually | anchor: Judges 9:23 “Then God sent an evil spirit between Abimelech and the men of Shechem” (w0.8; the natural keystone is 1 Samuel 16:14, outside this book) | BORDERLINE — cross-book candidate (1 Sam 16:14; 1 Kgs 22:19-23); CHECK-FIRST a `divine-judgment` lexicon extension; dedupe with the 1 Samuel and 1 Kings sweep ledgers before any mint.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (4 sections) — PER-VERSE REFINEMENT CANDIDATE (2 tags; caps not hit).
- Decisions record: None.

## Judges 10 (subdivided: 10:1–5; 10:6–18)

- Existing tags (book doc): `repentance`, `sin`, `divine-judgment`, `deliverance`, `idolatry`
- Applied-tag deltas:
  - KEEP `repentance` — confession that becomes action: “We have sinned! Do to us whatever seems good to you; only deliver us, please, today.” (10:15, with 10:10), and “They put away the foreign gods from among them and served the LORD” (10:16).
  - KEEP `sin` — the widest idol-list in the book, ending “They abandoned the LORD, and didn’t serve him.” (10:6).
  - KEEP `divine-judgment` — “The LORD’s anger burned against Israel, and he sold them into the hand of the Philistines and into the hand of the children of Ammon.” (10:7), with the stinging sentence “Go and cry to the gods which you have chosen. Let them save you in the time of your distress!” (10:14).
  - KEEP `deliverance` (adopted display id; routed to backlog: `deliverance` (roster row 32)) — the rescuer-register in full exchange: “Didn’t I save you from the Egyptians …?” (10:11), “you cried to me, and I saved you out of their hand.” (10:12), and the plea “only deliver us, please, today.” (10:15).
  - KEEP `idolatry` — the book's widest apostasy: the Baals, the Ashtaroth, and the gods of five nations served (10:6), until “They put away the foreign gods from among them” (10:16).
  - ADD `mercy` — God's compassion overriding his own stated sentence is the chapter's climax: after “Therefore I will save you no more.” (10:13), the idols go and “his soul was grieved for the misery of Israel.” (10:16). The `mercy` id post-dates the book doc's 131-id vocabulary (Hosea-row mint). This is NOT a reversal of the book doc's `pastoral-god-sees-my-suffering` drop (Decisions item 10 there): that drop was a pastoral-register ruling (personal-crisis packs barred from national-scale material); `mercy` is a doctrinal id with no such register bar, and 10:16 is its exact substance. Delegated call, reversible.
- Anchor-extension candidates:
  - `mercy` | Judges 10:16 | “his soul was grieved for the misery of Israel.” | w0.55.
  - `repentance` | Judges 10:15-16 | “They put away the foreign gods from among them and served the LORD” | w0.65.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: soft cap 6 hit exactly after delta (6 tags, each clearing the bar; hard ceiling not hit); subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT CANDIDATE.
- Decisions record: `mercy` ADD recorded as a reversible delegated default (rationale and non-reversal note above). `slow-to-anger` was considered for the same material (10:11–16 recounts repeated past rescues) and declined: the concept's Exodus-34 formula register (“compassionate and gracious … slow to anger”) is not stated in the chapter; `mercy` is the honest single home.

## Judges 11 (subdivided: 11:1–28; 11:29–40)

- Existing tags (book doc): `pastoral-grief-and-loss`, `gods-surprising-choice`, `empowered-by-the-spirit`, `oaths-and-vows`
- Applied-tag deltas:
  - KEEP `pastoral-grief-and-loss` — SETTLED BY RULING, applied without re-litigation: Jesse's 2026-08-25 delegated ruling (CONVENTIONS §11(4)) keeps the grief tag on Judges 11; the book doc's recorded awareness flag for Jesse (its Decisions item 14(9): the pack lexicon includes “my child died” while this grief is a death the mourner caused by his own vow) remains on record there. In-chapter substance: “he tore his clothes, and said, ‘Alas, my daughter! You have brought me very low’” (11:35), the two months' mourning (11:37–38), and the yearly commemoration — “the daughters of Israel went yearly to celebrate the daughter of Jephthah the Gileadite four days in a year.” (11:40).
  - KEEP `gods-surprising-choice` (adopted display id; routed to backlog: `gods-surprising-choice` (roster row 21)) — the deliverer is the outcast: “He was the son of a prostitute.” (11:1), “they drove Jephthah out” (11:2), and the same elders return — “You will be our head over all the inhabitants of Gilead.” (11:8, with 11:11).
  - KEEP `empowered-by-the-spirit` (adopted display id; routed to backlog: `empowered-by-the-spirit` (roster row 13)) — “Then the LORD’s Spirit came on Jephthah” (11:29), and “the LORD delivered them into his hand.” (11:32).
  - KEEP `oaths-and-vows` — the cost of a rash vow, told as warning: “Jephthah vowed a vow to the LORD … whatever comes out of the doors of my house to meet me … it shall be the LORD’s, and I will offer it up for a burnt offering.” (11:30–31); “I have opened my mouth to the LORD, and I can’t go back.” (11:35); he “did with her according to his vow which he had vowed.” (11:39).
  - No adds — `wisdom-from-god` considered for the diplomatic history-argument (11:14–27) and declined (statecraft, not the concept's ask-God-for-wisdom substance); `god-reigns` considered for “May the LORD the Judge be judge today” (11:27) and declined (a single appeal-formula verse; the concept's kingship substance is ch. 8's).
- Anchor-extension candidates:
  - `oaths-and-vows` | Judges 11:30-31 | “Jephthah vowed a vow to the LORD … I will offer it up for a burnt offering.” | w0.7. (The pack's classic cautionary narrative; anchors today are all teaching texts.)
  - `oaths-and-vows` | Judges 11:34-39 | “I have opened my mouth to the LORD, and I can’t go back.” | w0.6.
- Lexicon candidates:
  - `oaths-and-vows` | terms: “jephthahs vow; rash vow; jephthahs daughter” | queries: “Jephthah’s vow”, “did Jephthah sacrifice his daughter”, “should I keep a foolish promise to God”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT CANDIDATE (4 tags; caps not hit).
- Decisions record: The ch. 11 grief-tag question is settled (KEPT, annotated) — honored above, not re-litigated. No yields.

## Judges 12 (subdivided: 12:1–7; 12:8–15)

- Existing tags (book doc): `envy-and-jealousy` — with the doc's note “(Only one honest tag from the current vocabulary.)”
- Applied-tag deltas:
  - KEEP `envy-and-jealousy` — a rivalry over shared war-honor turned murderous: “Why did you pass over to fight against the children of Ammon, and didn’t call us to go with you? We will burn your house around you with fire!” (12:1, with the war and the fords, 12:4–6). The book doc's Decisions item 8 grounds the plain-reading call (Brooks: “Envy”; MHCC: pride at the quarrel's bottom); re-affirmed.
  - No adds — re-judged against the full library: `harmony-with-others` is a failure-mode read here (the quarrel is not abated; forty-two thousand fall, 12:6) and is barred; “Shibboleth” (12:6) is a word-lookup query served lexically by full-corpus word search, not a concept; the minor-judge notices (12:8–15) carry no concept substance. Honest single-tag chapter stands.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT CANDIDATE (1 tag; caps not hit).
- Decisions record: None.

## Judges 13

- Existing tags (book doc): `waiting-for-a-child`, `prayer`, `parenting`
- Applied-tag deltas:
  - KEEP `waiting-for-a-child` — the announcement lands on long barrenness: “his wife was barren, and childless” (13:2), “See now, you are barren and childless; but you shall conceive and bear a son.” (13:3), and the promise kept — “The woman bore a son and named him Samson.” (13:24).
  - KEEP `prayer` — “Then Manoah entreated the LORD” (13:8) and “God listened to the voice of Manoah” (13:9).
  - KEEP `parenting` — the parents' one request is help to raise the promised child: “teach us what we should do to the child who shall be born.” (13:8), “What shall the child’s way of life and mission be?” (13:12).
  - ADD `angels` — a full angel-of-the-LORD appearance narrative, the pack's own register: “The LORD’s angel appeared to the woman” (13:3), “his face was like the face of the angel of God, very awesome” (13:6), “the LORD’s angel ascended in the flame of the altar” (13:20), “Then Manoah knew that he was the LORD’s angel.” (13:21), and Manoah's awe — “We shall surely die, because we have seen God.” (13:22). The `angels` id post-dates the book doc's 131-id vocabulary — a sweep gap-fill.
- Anchor-extension candidates:
  - `angels` | Judges 13:3-21 | “The LORD’s angel appeared to the woman” … “Then Manoah knew that he was the LORD’s angel.” | w0.65.
  - `waiting-for-a-child` | Judges 13:2-3 | “See now, you are barren and childless; but you shall conceive and bear a son.” | w0.6.
- Lexicon candidates:
  - `oaths-and-vows` | terms: “nazirite; nazirite vow” | queries: “what is a Nazirite”, “Nazirite vow in the Bible”, “why couldn’t Samson cut his hair” — grounded here at “the child shall be a Nazirite to God from the womb.” (13:5); the pack already anchors Numbers 6:1-8, so this is lexicon-only.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (4 tags after delta; not subdivided in the book doc).
- Decisions record: None (the `angels` add is a plain gap-fill against a previously-unavailable id, spanning 13:3–22 — no yield needed, chapter well under the caps).

## Judges 14

- Existing tags (book doc): `providence`, `empowered-by-the-spirit`
- Applied-tag deltas:
  - KEEP `providence` — the narrator's rare aside makes the chapter a providence text: “But his father and his mother didn’t know that it was of the LORD; for he sought an occasion against the Philistines.” (14:4).
  - KEEP `empowered-by-the-spirit` (adopted display id; routed to backlog: `empowered-by-the-spirit` (roster row 13)) — twice in power: “The LORD’s Spirit came mightily on him, and he tore him as he would have torn a young goat with his bare hands” (14:6), and “The LORD’s Spirit came mightily on him, and he went down to Ashkelon and struck thirty men of them.” (14:19).
  - No adds — re-judged against the full library: the wedding-feast riddle, the coerced wife (“lest we burn you and your father’s house with fire”, 14:15), and the wager's brutal payment carry no concept's teaching substance; `godly-marriage` and `pastoral-betrayal-and-marriage-crisis` are barred (failure-mode narrative and pastoral register respectively).
- Anchor-extension candidates:
  - `providence` | Judges 14:4 | “it was of the LORD; for he sought an occasion against the Philistines.” | w0.6. (The pack's God-behind-events register with no Judges anchor today.)
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 15

- Existing tags (book doc): `prayer`, `gods-provision`, `deliverance`, `empowered-by-the-spirit`
- Applied-tag deltas:
  - KEEP `prayer` — the invincible fighter reduced to calling on God: “He was very thirsty, and called on the LORD” (15:18).
  - KEEP `gods-provision` — the answer is immediate and physical: “But God split the hollow place that is in Lehi, and water came out of it. When he had drunk, his spirit came again, and he revived.” (15:19).
  - KEEP `deliverance` (adopted display id; routed to backlog: `deliverance` (roster row 32)) — the victor names his victory God's gift: “You have given this great deliverance by the hand of your servant; and now shall I die of thirst, and fall into the hands of the uncircumcised?” (15:18).
  - KEEP `empowered-by-the-spirit` (adopted display id; routed to backlog: `empowered-by-the-spirit` (roster row 13)) — bound and handed over, Samson is loosed as “the LORD’s Spirit came mightily on him, and the ropes that were on his arms became as flax that was burned with fire” (15:14), and a fresh jawbone fells a thousand (15:15).
  - No adds — `vengeance` considered for “surely I will take revenge on you” (15:7) and declined: the chapter depicts an escalating revenge spiral without the concept's leave-it-to-God teaching (failure-mode rule; the concept's substance is Romans 12:19's renunciation, which this chapter inverts). `gods-surprising-choice` on the jawbone (15:15) remains the application pass's recorded skip (single verse beside two stronger tags on the same scene) — honored.
- Anchor-extension candidates:
  - `gods-provision` | Judges 15:18-19 | “God split the hollow place that is in Lehi, and water came out of it” | w0.5.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (4 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 16 (subdivided: 16:1–3; 16:4–22; 16:23–31)

- Existing tags (book doc): `prayer`, `sin`
- Applied-tag deltas:
  - KEEP `prayer` — the last prayer of a broken man, heard: “Samson called to the LORD, and said, ‘Lord GOD, remember me, please, and strengthen me, please, only this once’” (16:28) — and God answers (16:30).
  - KEEP `sin` — the slow surrender of a consecrated life: “Samson went to Gaza, and saw there a prostitute” (16:1), the secret bartered away (16:17), until “But he didn’t know that the LORD had departed from him.” (16:20).
  - ADD `betrayal` — the concept's exact substance, spanning half the chapter: the woman he loved (16:4) is bought — “Entice him … and we will each give you eleven hundred pieces of silver.” (16:5) — and sells him: “When Delilah saw that he had told her all his heart, she sent and called for the lords of the Philistines … and brought the money in their hand.” (16:18), “She made him sleep on her knees; and she called for a man and shaved off the seven locks of his head” (16:19). The `betrayal` id post-dates the book doc's 131-id vocabulary (Psalms-row mint) — a sweep gap-fill. Harm-gate awareness recorded for Jesse (see Decisions).
- Anchor-extension candidates:
  - `betrayal` | Judges 16:15-20 | “When Delilah saw that he had told her all his heart, she sent and called for the lords of the Philistines” | w0.55. NOTE FOR CURATOR: Judges 16 is the one Judges chapter IN the current fixture corpus, so unlike this ledger's other Judges anchors this one is assertable today — but the chapter is also pinned as a pastoral harm gate (see Decisions); fixture design must respect the gate.
- Lexicon candidates:
  - `betrayal` | terms: “samson and delilah; delilah” | queries: “Samson and Delilah”, “betrayed by someone I love”, “who was Delilah in the Bible”.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (3 sections) — PER-VERSE REFINEMENT CANDIDATE (3 tags after delta; caps not hit).
- Decisions record: (1) The book doc's Decisions item 6 stands untouched: `pastoral-relapse-and-restoration` remains off this chapter — Judges 16 is pinned in `pipeline/fixtures/web-subset.json` as a pastoral harm gate (“pastoral harm gate: Samson pulls down the house (16:30)”), and crisis-audience pastoral tags must not route a person in crisis to a deliberate self-death narrative. Honored, not re-litigated. (2) `betrayal` ADD recorded as a reversible delegated default WITH harm-gate awareness: `betrayal` is not one of the fourteen pastoral-* packs, so the item-6 bar does not mechanically apply, but its lexicon is personal-relational (“betrayed by a friend”) and this chapter ends in a deliberate self-death — Jesse should weigh that pairing when tags feed search, exactly as the recorded ch. 11 grief-flag precedent. (3) `pastoral-sexual-purity` remains off per the book doc's Decisions item 5 (failure-mode; Genesis-3 worked example) — honored.

## Judges 17

- Existing tags (book doc): `sin`, `self-deception`, `idolatry`, `right-in-their-own-eyes`
- Applied-tag deltas:
  - KEEP `sin` — do-it-yourself religion inside Israel built on stolen silver and a hired priesthood: “The eleven hundred pieces of silver that were taken from you … behold, the silver is with me. I took it.” (17:2), framed by the refrain (17:6).
  - KEEP `self-deception` — religion as a good-luck charm: “Then Micah said, ‘Now I know that the LORD will do good to me, since I have a Levite as my priest.’” (17:13).
  - KEEP `idolatry` — a private counterfeit religion: silver blessed — “May the LORD bless my son!” (17:2) — then dedicated “to make a carved image and a molten image” (17:3), with “a house of gods … an ephod, and teraphim” and a consecrated son (17:5), and the Levite hired to “be to me a father and a priest” (17:10, 12).
  - KEEP `right-in-their-own-eyes` (adopted display id; routed to backlog: `right-in-their-own-eyes` (roster row 20)) — the refrain stated here in full: “In those days there was no king in Israel. Everyone did that which was right in his own eyes.” (17:6).
  - No adds — `empty-worship` considered and declined: that concept's register is hypocritical worship of the true God (Isaiah 1's vain offerings); Micah's counterfeit is idol-manufacture plus superstition, already carried by `idolatry` + `self-deception` (broad-duplicating-specific if added).
- Anchor-extension candidates:
  - `self-deception` | Judges 17:13 | “Now I know that the LORD will do good to me, since I have a Levite as my priest.” | w0.6. (The pack's anchors are all epistle/parable texts; this is its sharpest OT narrative enactment.)
  - `idolatry` | Judges 17:4-5 | “a carved image and a molten image … The man Micah had a house of gods” | w0.5.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (4 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 18

- Existing tags (book doc): `sin`, `self-deception`, `idolatry`
- Applied-tag deltas:
  - KEEP `sin` — stolen gods and a slaughtered quiet people become a tribal sanctuary: Laish “a people quiet and unsuspecting” is struck “with the edge of the sword; then they burned the city with fire.” (18:27), while the stolen shrine stands (18:30–31).
  - KEEP `self-deception` — comfort mistaken for God's voice and handmade gods trusted for protection: the hireling's “Go in peace. Your way in which you go is before the LORD.” (18:6), and Micah's “You have taken away my gods which I made … What more do I have?” (18:24).
  - KEEP `idolatry` — idolatry scaled from household to tribe: the spies take “the engraved image, the ephod, the teraphim, and the molten image” (18:17), the priest is glad to trade up (18:19–20), and “The children of Dan set up for themselves the engraved image” with its own priesthood “all the time that God’s house was in Shiloh.” (18:30–31).
  - No adds — `occult-and-divination` considered for “Please ask counsel of God” (18:5) and declined: an oracle request to an (illegitimate) priest, not the divination practices the concept names; `guidance` likewise declined (the “Go in peace” oracle is the chapter's exhibit of false comfort, not God's guidance — failure-mode rule).
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (3 tags; not subdivided in the book doc).
- Decisions record: None.

## Judges 19

- Existing tags (book doc): `sin`, `hospitality`
- Applied-tag deltas:
  - KEEP `sin` — evil the text itself names as such: “please don’t act so wickedly … don’t do this folly.” (19:23), they “abused her all night until the morning” (19:25), and the nation's verdict — “Such a deed has not been done or seen from the day that the children of Israel came up out of the land of Egypt to this day!” (19:30).
  - KEEP `hospitality` — the chapter's one point of light against “there was no one who took them into his house to stay” (19:15): the old man's “Peace be to you! Just let me supply all your needs, but don’t sleep in the street.” (19:20), and he “brought him into his house, and gave the donkeys fodder” (19:21), with the father's welcome (19:3–9).
  - No adds — `pastoral-refuge-and-justice` considered and declined: the concept's substance is God defending the oppressed; this chapter depicts an atrocity in which no one is defended — a text an abuse victim must not be routed to (presence bar + pastoral-register rule + the harm-gate logic of the book doc's Decisions items 6 and 10). `pastoral-betrayal-and-marriage-crisis` declined on the same register grounds.
- Anchor-extension candidates: None — a `hospitality` anchor at 19:16–21 was weighed and deliberately NOT proposed: the welcome is genuine, but anchoring would surface this atrocity chapter for “practice hospitality” queries; the pack's teaching anchors serve that intent without it (recorded so no later thread mistakes this for an oversight).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (2 tags; not subdivided in the book doc).
- Decisions record: This chapter is the Judges leg of the recorded cross-book sexual-violence-in-war motif (tag-gaps-review §3.5, Lamentations block: Lam 5:11 “flagged in the book doc as a motif for a future cross-book decision (Gen 34; Judg 19), not a row”) — noted here as the standing record's Judg 19 witness; no row proposed, per that record.

## Judges 20 (subdivided: 20:1–17; 20:18–48)

- Existing tags (book doc): `prayer`, `guidance`, `divine-judgment`, `lament`
- Applied-tag deltas:
  - KEEP `prayer` — a nation seeking God with increasing earnestness: “went up and wept before the LORD until evening” (20:23), then “wept, and sat there before the LORD, and fasted that day until evening; then they offered burnt offerings and peace offerings before the LORD.” (20:26).
  - KEEP `guidance` — every advance is put to God at Bethel: “asked counsel of God … ‘Who shall go up for us first to battle …?’ The LORD said, ‘Judah first.’” (20:18), “Shall I again draw near to battle against the children of Benjamin my brother?” (20:23), and “Shall I yet again go out to battle …?” — “Go up; for tomorrow I will deliver him into your hand.” (20:27–28).
  - KEEP `divine-judgment` — the war's stated aim: “that we may put them to death and put away evil from Israel.” (20:13), and the decisive blow is God's: “The LORD struck Benjamin before Israel” (20:35).
  - KEEP `lament` — corporate grief carried before God between the defeats: the weeping of 20:23 and 20:26, beside `prayer` under the §11.2 both-tags ruling (weeping-before-the-LORD register vs. seeking/inquiry register — the application pass's recorded call, re-affirmed).
  - No adds — `fasting` considered for “fasted that day until evening” (20:26) and declined as a tag: a single-verse practice notice inside the corporate seeking already carried by `prayer` and `lament` (thin single-verse); proposed as an engine anchor instead (below).
- Anchor-extension candidates:
  - `fasting` | Judges 20:26 | “wept, and sat there before the LORD, and fasted that day until evening” | w0.5.
  - `lament` | Judges 20:23-26 | “The children of Israel went up and wept before the LORD until evening” | w0.55. (The pack's one narrative-corporate anchor candidate in Judges; its current anchors are Psalms/Lamentations texts plus 2 Sam 1.)
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in the book doc (2 sections) — PER-VERSE REFINEMENT CANDIDATE (4 tags; caps not hit).
- Decisions record: None.

## Judges 21

- Existing tags (book doc): `prayer`, `lament`, `oaths-and-vows`, `right-in-their-own-eyes`
- Applied-tag deltas:
  - KEEP `prayer` — grief carried into God's presence: “The people came to Bethel and sat there until evening before God, and lifted up their voices, and wept severely.” (21:2), and the next day “built an altar there, and offered burnt offerings and peace offerings.” (21:4).
  - KEEP `lament` — the assembly's weeping voiced straight to God: “The LORD, the God of Israel, why has this happened in Israel, that there should be one tribe lacking in Israel today?” (21:3) — beside `prayer` under the §11.2 both-tags ruling.
  - KEEP `oaths-and-vows` — the chapter's crisis is sworn into being: “Now the men of Israel had sworn in Mizpah, saying, ‘None of us will give his daughter to Benjamin as a wife.’” (21:1), “since we have sworn by the LORD” (21:7), and “Cursed is he who gives a wife to Benjamin.” (21:18) — oath-keeping at terrible cost, told as warning, not model.
  - KEEP `right-in-their-own-eyes` (adopted display id; routed to backlog: `right-in-their-own-eyes` (roster row 20)) — the book signs off with its diagnosis in full: “In those days there was no king in Israel. Everyone did that which was right in his own eyes.” (21:25).
  - No adds — `pastoral-grief-and-loss` stays off per the book doc's Decisions item 9 (the weeping and the grieving “for Benjamin their brother” (21:6, 15) are national remorse over a self-inflicted breach, not bereavement; ruled and honored, not re-litigated).
- Anchor-extension candidates:
  - `oaths-and-vows` | Judges 21:1-7 | “since we have sworn by the LORD that we will not give them of our daughters to wives” | w0.5. (The book's second cautionary oath narrative, complementing the ch. 11 candidates.)
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (4 tags; not subdivided in the book doc).
- Decisions record: None.

---

# Ledger totals and closing records (2026-08-26)

## Sweep totals

- Chapters swept: 21/21.
- Applied-tag deltas: **5 ADD** (`angels` on ch. 6; `god-reigns` on ch. 8; `mercy` on ch. 10; `angels` on ch. 13; `betrayal` on ch. 16), **82 KEEP**, **1 DROP** (`fear-not` from ch. 6 — §11.6 forced yield, fully recorded in that chapter's Decisions record; preserved as an anchor-extension candidate at 6:23). All five adds are ids that post-date the book doc's 131-id vocabulary — gap-fills, not reversals; each is recorded as a reversible delegated default.
- Anchor-extension candidates: **26** (testing ×2, covenant, the-lords-discipline, praise, angels ×2, fear-not, doubt, idolatry ×2, humble-exaltation, dreams-and-visions, god-reigns, do-not-lose-heart, mercy, repentance, oaths-and-vows ×3, waiting-for-a-child, providence, gods-provision, betrayal, self-deception, fasting, lament).
- Lexicon candidates: **7** (backsliding; doubt — fleece family, with a doubt-vs-guidance routing flag; humble-exaltation — flagged; do-not-lose-heart; oaths-and-vows — Jephthah family; oaths-and-vows — Nazirite family; betrayal — Delilah family).
- New-concept candidates: **2**, both check-first-flagged (`asking-god-for-a-sign`, ch. 6 — check doubt/guidance lexicon extension first; `evil-spirit-from-god`, ch. 9 — BORDERLINE, cross-book, check divine-judgment lexicon extension first and dedupe with the 1 Samuel / 1 Kings sweep ledgers).
- Decline-overturn proposals: **0** — no recorded decline was found to need overturning on new Judges evidence; all §1 rulings applied as ruled (ch. 11 grief tag KEPT per §11(4); grief stays off chs. 16/19/21 per the book doc's recorded decisions).
- Corpus-blocked routings: **18 chapter-level routing notes** across 5 roster ids — `deliverance` (row 32: chs. 2, 3, 4, 7, 10, 15), `empowered-by-the-spirit` (row 13: chs. 3, 11, 14, 15), `gods-surprising-choice` (row 21: chs. 3, 4, 6, 7, 11), `right-in-their-own-eyes` (row 20: chs. 17, 21), `unequally-yoked` (row 47: ch. 3). No roster concept re-proposed fresh.
- Ceiling-marked chapters: 2 and 6 (hard ceiling 8, both with recorded yields). Soft cap 6 reached: chs. 7 and 10 (exactly 6), ch. 3 (7, under the §11.6 allowance).
- PER-VERSE REFINEMENT CANDIDATES (ceiling-hit ∪ book-doc-subdivided): chapters 2, 3, 6, 8, 9, 10, 11, 12, 16, 20.

## Vocabulary-reference update (coordinator notice, mid-sweep)

The canonical CONVENTIONS §11.1 adopted-concepts list landed at
`/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md` (161 ids,
alphabetized, engine-built flags) while this sweep was in progress; this ledger's header
cites the BRIEFING §7 reconstruction that preceded it. Cross-check performed against the
canonical file before this closing block: every non-engine id used or referenced in this
ledger — `deliverance`, `empowered-by-the-spirit`, `gods-surprising-choice`,
`right-in-their-own-eyes`, `unequally-yoked` — appears in the canonical list with exactly
that spelling, marked “engine-built: no”; every other tag id in this ledger resolves
against the 239 engine basenames in concept-ids.txt. **No mismatch; no correction entries
needed.** The canonical file supersedes the header's reconstruction reference from here on.

## Survival audit (CONVENTIONS §9, final delivery)

- Method: every append in this ledger's history was made as an atomic end-of-file append
  (`cat chunk >> ledger`) with an immediate post-write verification that (a) the
  pre-existing byte prefix hashes identically to its pre-append value and (b) the appended
  tail hashes identically to the source chunk. All 8 appends (header + 7 chapter chunks)
  verified PRIOR-BYTES-INTACT at write time.
- Final re-read (this delivery): the live file was re-read in full; sha256 of the whole
  file equals the sha256 of the ordered concatenation of all 8 source chunks
  (`7d5b6b8b27d0c5b20c6ddb08d7a4fb613c71124505e01d8627c11b8cde298d56` at 54,975 bytes,
  pre-closing-block) — every earlier contribution survives byte-for-byte, nothing foreign
  was interleaved, no re-application needed.
- Chapter census: 21/21 `## Judges N` blocks present, in order, exactly once each.
- Quote audit: all 282 quoted segments in the ledger were mechanically checked; every
  scripture segment matches the pinned VPL Judges text word-for-word (nested-dialogue
  quotes match under quote-mark normalization only — the WEB's inner “ ” rendered as
  ‘ ’ when nested inside a ledger quotation, the book-doc convention; wording, curly
  apostrophes, and punctuation otherwise byte-identical). The 47 non-matching strings are
  all intentional non-scripture content (proposed query phrasings, lexicon terms, and
  quotations from other project documents, each verified against its own source).
- Shared-scratchpad hygiene (coordinator notice, mid-sweep): all of this worker's temp
  files are uniquely book-prefixed (`judges-chunk-00-header.md` … `judges-chunk-08.md`);
  no generic-named temp file was ever used, and the quote audit ran inline against the
  pinned VPL with no intermediate file — so the reported sibling clobber of a generic
  `quotes.txt` cannot have touched this ledger's evidence chain. The concatenation-hash
  check above doubles as proof: it was computed from the chunk files as they exist NOW,
  post-notice, and still equals the live ledger.
- AUDIT RESULT: **PASS** — all blocks present, prior bytes unchanged, quotes verified.
