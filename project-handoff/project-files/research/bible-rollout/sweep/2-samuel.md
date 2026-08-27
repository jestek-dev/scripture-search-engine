# 2 Samuel sweep ledger — Layer-3 tag sweep (history-books thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ (engine 0.14.0), plus the
  §11.1 adopted display-tag vocabulary per CONVENTIONS §11 (reconstructed per the scout
  BRIEFING §7 — the adopted-concepts.md file is missing; adopted set = tag-gaps-review §2's
  161 adopted ids with the waiting-and-timing-in-love fold; engine ids preferred, roster/§2
  ids used only with exact spelling and their source list named).
- Book: 2 Samuel (24 chapters)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/2-samuel.md
    (FINAL, 3 critic rounds; tagged against the 131-id vocabulary @ b3f491d plus the
    2026-08-25 adopted-vocabulary application pass — Decisions #23)
  - Concept inventory (239 ids, lexicons + anchors): scout scratchpad concept-inventory.md /
    concept-ids.txt (/tmp/claude-0/-home-user-scripture-search-engine/027e5bae-ee4c-5a56-a5f4-6df50619a6eb/scratchpad/)
  - Declines & contested calls: scout scratchpad declines-and-contested.md (tag-gaps-review §1
    as resolved by Jesse's 2026-08-25 rulings + §3 declines — applied, not re-litigated;
    the 2 Samuel 21 grief-tag question is SETTLED: tag KEPT, annotated, per CONVENTIONS §11(4))
  - Corpus-blocked roster (route, don't duplicate): scout scratchpad corpus-blocked-roster.md
    (50 rows, all still gated on PR-β per the 2026-08-26 re-verification)
  - WEB text: repo-pinned VPL /home/user/scripture-search-engine/pipeline/sources/vpl/engwebp_vpl.txt
    (manifest pipeline/manifests/web.json, manifest sha b6f55cc7…, contentSha256 944e3883…,
    re-admitted in PR #53 — the same text identity the fixture corpus was regenerated from;
    book code 2SA, 695 verses verified present). EVERY quote below was verified byte-for-byte
    (grep -F) against this file before entering the ledger — 122 quote spans checked, 0 missing.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file. This thread writes ONLY
  this ledger file; the book doc, tag-gaps.md, and all other shared files are untouched
  (vocabulary-gap observations are recorded in-ledger instead).
- Legend — each chapter entry carries these sections, in order:
  1. "## 2 Samuel <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")
- Corpus-blocked routing convention: a finding matching a roster concept is recorded as
  "routed to backlog: <id> (roster row N)" — never duplicated as a fresh proposal. The four
  adopted-but-not-engine ids already used as display tags in this book (`the-lords-anointed`,
  `davidic-covenant`, `counsel-and-advisers`, `deliverance`) are all roster rows; their display
  KEEPs stand under CONVENTIONS §11.1, and their engine-side material is routed, not re-proposed.

## 2 Samuel 1 (subdivided: 1:1–16; 1:17–27)
- Existing tags (book doc): `pastoral-grief-and-loss`, `friendship`, `lament`, `the-lords-anointed`
- Applied-tag deltas:
  - KEEP `pastoral-grief-and-loss` — personal-core grief clears the pastoral-register rule (book doc Decisions #2(a)): "They mourned, wept, and fasted until evening" (1:12); "I am distressed for you, my brother Jonathan" (1:26).
  - KEEP `friendship` — the lament's center is a friend's love: "Your love to me was wonderful, surpassing the love of women" (1:26).
  - KEEP `lament` — composed, taught grief, the practice the concept documents: "David lamented with this lamentation" (1:17), the song ordered taught to Judah — "How the mighty have fallen" (1:19, 25, 27). The engine pack itself anchors 2 Samuel 1:17-27 (w0.6).
  - KEEP `the-lords-anointed` (adopted display tag, §11.1; not an engine id) — "Why were you not afraid to stretch out your hand to destroy the LORD’s anointed?" (1:14).
  - No other concept in the 239-id library clears the presence bar here; re-checked `betrayal` (the Amalekite is a stranger, not a trusted friend — no), `oaths-and-vows` (no oath in-chapter — no).
- Anchor-extension candidates: None — `lament` already anchors 2 Samuel 1:17-27 (w0.6); no other pack needs this chapter.
- Lexicon candidates:
  - `lament` | term: "how the mighty have fallen" | queries: "how the mighty have fallen meaning", "how the mighty have fallen bible verse", "David's lament for Saul and Jonathan". The phrase is 1:19/25/27 verbatim and appears in no pack's lexicon.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (1:1–16; 1:17–27) → PER-VERSE REFINEMENT candidate.
- Decisions record: `the-lords-anointed` engine-side material routed to backlog: `the-lords-anointed` (roster row 46 — SKIPPED-blocked; 2 Sam 1 is among that row's own blocking refs); the display KEEP stands under CONVENTIONS §11.1. No yields.

## 2 Samuel 2 (subdivided: 2:1–7; 2:8–32)
- Existing tags (book doc): `guidance`, `kindness`
- Applied-tag deltas:
  - KEEP `guidance` — "David inquired of the LORD" — "Shall I go up into any of the cities of Judah?" (2:1), and he moves only on the answer.
  - KEEP `kindness` — the first royal act blesses kindness with kindness: "you have shown this kindness to your lord" and "may the LORD show loving kindness and truth to you" (2:5–6).
  - Re-checked the full library: the battle narrative (2:12–32) genuinely presents no concept's teaching substance (Abner's "Shall the sword devour forever?" is a war-weary plea, not the `vengeance` or `harmony-with-others` teaching register). No changes beyond the keeps.
- Anchor-extension candidates: None (the inquiry-narrative anchor candidate for `guidance` is filed at ch. 5, the stronger double witness).
- Lexicon candidates:
  - `guidance` | term: "inquired of the lord" | queries: "what does it mean to inquire of the Lord", "David inquired of the Lord", "asking God before making a decision". Present at 2:1 and 5:19, 23; no pack's lexicon carries the phrase (the 1 Samuel block's hearing-God's-voice guidance flag is the same family — this is its 2 Samuel witness).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (2:1–7; 2:8–32) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 2 Samuel 3
- Existing tags (book doc): `sin`, `lament`
- Applied-tag deltas:
  - KEEP `sin` — treacherous murder named as wickedness awaiting God's repayment: Joab "struck him there in the body, so that he died for the blood of Asahel his brother" (3:27); "May the LORD reward the evildoer according to his wickedness" (3:39).
  - KEEP `lament` — a composed lament at a state funeral: "The king lamented for Abner" (3:33), with fasting until sundown and "a prince and a great man has fallen today in Israel" (3:38).
  - ADD `vengeance` — the chapter depicts the concept's substance from both sides: blood-revenge taken by hand — "So Joab and Abishai his brother killed Abner, because he had killed their brother Asahel" (3:30) — and the king refusing to repay in kind, entrusting repayment to God: "May the LORD reward the evildoer according to his wickedness" (3:39). That is the leave-it-to-the-LORD register the `vengeance` pack teaches (its Rom 12:19 / Deut 32:35 anchors), depicted narratively; honest substantial presence, not topical brush.
- Anchor-extension candidates:
  - `vengeance` | 2 Samuel 3:27-39 | "May the LORD reward the evildoer according to his wickedness" (3:39) | w0.5 — the pack has no narrative anchor of revenge taken vs. repayment entrusted to God.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (3 tags; kept whole in book doc).
- Decisions record: Burial-practice material (bier, grave, public mourning rites, 3:31–32; also 4:12's burial of Ishbosheth's head in Abner's grave) routed to backlog: `death-and-burial` (roster row 22 — SKIPPED-blocked; additional 2 Samuel refs for that row's curator, not a fresh proposal). `pastoral-grief-and-loss` stays OFF per book doc Decisions #3 (state funeral, not personal-crisis register) — reaffirmed, no overturn evidence. No yields.

## 2 Samuel 4
- Existing tags (book doc): `sin`
- Applied-tag deltas:
  - KEEP `sin` — murder for advantage dressed in God's name — "The LORD has avenged my lord the king today of Saul and of his offspring" (4:8) — answered as wickedness: "wicked men have slain a righteous person in his own house on his bed… should I not now require his blood from your hand" (4:11). (Only one honest tag from the current vocabulary.)
  - Re-checked `vengeance` (the assassins' false claim of divine vengeance is not the concept's teaching; the honest 2 Samuel home is ch. 3) and `justice-and-oppression` (a royal execution of murderers is judicial narrative, not the oppression-of-the-poor register). No changes.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (kept whole in book doc).
- Decisions record: None.

## 2 Samuel 5 (subdivided: 5:1–5; 5:6–16; 5:17–25)
- Existing tags (book doc): `gods-faithfulness`, `presence-of-god`, `guidance`, `gods-protection`, `leadership`
- Applied-tag deltas:
  - KEEP `gods-faithfulness` — the old word kept: "You will be shepherd of my people Israel" (5:2) and "David perceived that the LORD had established him king over Israel" (5:12).
  - KEEP `presence-of-god` — the stated cause of the growth: "the LORD, the God of Armies, was with him" (5:10).
  - KEEP `guidance` — two inquiries, two different answers, both obeyed: "David inquired of the LORD" (5:19, 23).
  - KEEP `gods-protection` — "Go up; for I will certainly deliver the Philistines into your hand" (5:19); "the LORD has gone out before you" (5:24).
  - KEEP `leadership` — kingship defined as shepherding in the LORD's own word: "You will be shepherd of my people Israel" (5:1–3).
  - Re-checked the library: `covenant` (5:3's covenant with the elders is a political compact, one verse, not the divine-covenant register — no), `shepherds-and-the-flock` (5:2 is one verse of shepherd vocabulary inside a coronation; the shepherd-as-leader substance is carried by `leadership` here — thin, no). No changes.
- Anchor-extension candidates:
  - `guidance` | 2 Samuel 5:19-25 | "David inquired of the LORD" … "Go up; for I will certainly deliver the Philistines into your hand" (5:19) | w0.6 — the pack's anchors are all promise-texts (Ps 32:8 register); it has no ask-and-be-answered narrative.
- Lexicon candidates: None (the "inquired of the lord" candidate is filed at ch. 2).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 2 Samuel 6 (subdivided: 6:1–11; 6:12–23)
- Existing tags (book doc): `worship`, `praise`, `divine-judgment`, `blessing`, `fear-of-the-lord`
- Applied-tag deltas:
  - KEEP `worship` — the ark's ascent with sacrifices, burnt offerings and peace offerings, the people blessed "in the name of the LORD of Armies" (6:13, 17–18).
  - KEEP `praise` — "David danced before the LORD with all his might" (6:14), with shouting and trumpet (6:15).
  - KEEP `divine-judgment` — "The LORD’s anger burned against Uzzah, and God struck him there for his error" (6:7).
  - KEEP `blessing` — the same ark blesses a household: "the LORD blessed Obed-Edom and all his house" (6:11).
  - KEEP `fear-of-the-lord` — the narrative's named response: "David was afraid of the LORD that day" — "How could the LORD’s ark come to me?" (6:9).
  - Re-checked `holiness` — per the recorded Isaiah-block routing, God's-own-holiness is a lexicon-tuning question on `holiness`, not a tag call; the pack's be-holy sanctification register is not depicted here. No changes.
- Anchor-extension candidates:
  - `fear-of-the-lord` | 2 Samuel 6:6-9 | "David was afraid of the LORD that day" (6:9) | w0.6 — the pack's anchors are all wisdom/psalm sayings; the Uzzah narrative is the home text for the heavy "why did God kill Uzzah" query family (already logged on the shared table's fear-of-the-lord row by this book's doc — this is its engine-side anchor candidate).
- Lexicon candidates:
  - `fear-of-the-lord` | term: "why did god kill uzzah" | queries: "why did God kill Uzzah", "Uzzah touches the ark and dies", "why was Uzzah punished for touching the ark". No pack lexicon carries any Uzzah phrasing.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (6:1–11; 6:12–23) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 2 Samuel 7 (subdivided: 7:1–17; 7:18–29)
- Existing tags (book doc): `covenant`, `gods-faithfulness`, `prayer`, `humble-exaltation`, `blessing`, `davidic-covenant`
- Applied-tag deltas:
  - KEEP `covenant` — the oracle's binding commitment: "Your house and your kingdom will be made sure forever before you. Your throne will be established forever." (7:16). The engine pack already anchors 2 Samuel 7:12-16 (w0.8).
  - KEEP `gods-faithfulness` — "I have been with you wherever you went" (7:9); "my loving kindness will not depart from him, as I took it from Saul" (7:15).
  - KEEP `prayer` — David's whole response is prayed, sitting before the LORD (7:18–29).
  - KEEP `humble-exaltation` — "I took you from the sheep pen, from following the sheep, to be prince over my people" (7:8), answered by "Who am I, Lord GOD" (7:18).
  - KEEP `blessing` — "Let the house of your servant be blessed forever with your blessing" (7:29).
  - KEEP `davidic-covenant` (adopted display tag, §11.1; not an engine id) — the promise's home text, in the text's own terms (7:8–16), per the tag-gap row's design note (no messianic read-back).
  - Re-checked `no-other-god` — "there is no one like you, neither is there any God besides you" (7:22) is the concept's exact substance but a single verse inside a prayer whose main themes already fill the soft cap; filed as an anchor-extension candidate instead of a seventh tag (presence real but thin relative to the six).
- Anchor-extension candidates:
  - `humble-exaltation` | 2 Samuel 7:8 | "I took you from the sheep pen, from following the sheep, to be prince over my people" | w0.6 — the pack lacks any raised-from-low narrative anchor.
  - `no-other-god` | 2 Samuel 7:22 | "there is no one like you, neither is there any God besides you" | w0.55.
- Lexicon candidates: None here — "Davidic covenant" / "throne established forever" phrasings are carried by roster row 44's own covenant-extension check (see Decisions).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: soft cap 6 reached (not exceeded; hard ceiling not hit); subdivided in book doc (7:1–17; 7:18–29) → PER-VERSE REFINEMENT candidate.
- Decisions record: `davidic-covenant` engine-side material routed to backlog: `davidic-covenant` (roster row 44 — DEFERRED-to-re-pin; 2 Sam 7 is that row's own named home text, and its covenant-extension check + no-messianic-read-back note ride the row). The display KEEP stands under §11.1. `no-other-god` considered as a seventh tag and NOT added (thin single-verse relative to the chapter's main themes; §11.6 order applied prospectively) — recorded here so the yield is not silent; the anchor candidate above preserves the finding.

## 2 Samuel 8
- Existing tags (book doc): `gods-protection`, `justice-and-oppression`
- Applied-tag deltas:
  - KEEP `gods-protection` — the chapter's repeated verdict: "The LORD gave victory to David wherever he went" (8:6, 14).
  - KEEP `justice-and-oppression` — the reign summarized in courtroom vocabulary: "David executed justice and righteousness for all his people" (8:15).
  - Re-checked `worship` (8:11's dedication of plunder — real but incidental, per book doc Decisions #15; reaffirmed) and `providence` (the victory refrain attributes victory to the LORD but the chapter is campaign summary, not the unseen-hand teaching register). No changes.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (kept whole in book doc).
- Decisions record: None.

## 2 Samuel 9
- Existing tags (book doc): `loving-others`, `friendship`, `hospitality`, `generosity`, `kindness`
- Applied-tag deltas:
  - KEEP `loving-others` — kindness sought out, not merely granted: "that I may show him kindness for Jonathan’s sake?" (9:1), even "the kindness of God" (9:3).
  - KEEP `friendship` — Jonathan's friendship outliving Jonathan: "I will surely show you kindness for Jonathan your father’s sake" (9:7).
  - KEEP `hospitality` — the fearful outsider seated at the family table: "You will eat bread at my table continually" (9:7).
  - KEEP `generosity` — "All that belonged to Saul and to all his house I have given to your master’s son" (9:9).
  - KEEP `kindness` — the hesed narrative entire (9:1, 3, 7); the engine pack already anchors 2 Samuel 9:1-7 (w0.8).
- Anchor-extension candidates: None — `kindness` already carries 9:1-7.
- Lexicon candidates:
  - `kindness` | terms: "the kindness of god"; "hesed" | queries: "the kindness of God", "what is hesed", "showing kindness for someone else's sake". 9:3 is the phrase's verbatim home; the pack's lexicon carries neither the phrase nor the loanword.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (5 tags; kept whole in book doc).
- Decisions record: None.

## 2 Samuel 10
- Existing tags (book doc): `trust-in-god`
- Applied-tag deltas:
  - KEEP `trust-in-god` — "may the LORD do what seems good to him" (10:12): duty done, outcome entrusted. (Only one honest tag from the current vocabulary; the book doc's Decisions #19 already flags it as the book's thinnest tag — re-judged here and retained: the verse is a complete, positive expression of the concept's substance.)
  - Re-checked `kindness` (10:2's kindness-for-kindness is one verse and the mission miscarries — the 2026-08-25 pass's skip stands) and `comforting-others` (comfort attempted and misread is not the concept's teaching). No changes.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (kept whole in book doc).
- Decisions record: None.

## 2 Samuel 11
- Existing tags (book doc): `sin`, `honesty`
- Applied-tag deltas:
  - KEEP `sin` — taking, concealing, killing, then the verdict: "But the thing that David had done displeased the LORD" (11:27).
  - KEEP `honesty` — the chapter runs on concealment (staged homecomings, the letter carried by its victim, coached battle-reports, 11:8–25), with Uriah's plainness as the standing rebuke (Genesis-27/34/37 precedent per book doc Decisions #9).
  - ADD `integrity` — Uriah is a full positive in-chapter exemplar of the concept's substance: he refuses private comfort while "The ark, Israel, and Judah, are staying in tents" and swears it — "As you live, and as your soul lives, I will not do this thing!" (11:11) — and holds the line sober and drunk (11:9, 13). The `integrity` pack's register (Job 31:5-6, Ps 101:2 — tested uprightness) is depicted, not merely touched; both-tags ruling allows it beside `honesty` (deceit-narrative register vs. personal-uprightness register).
- Anchor-extension candidates:
  - `integrity` | 2 Samuel 11:11 | "As you live, and as your soul lives, I will not do this thing!" | w0.6 — the pack has no narrative anchor of integrity holding under pressure.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (3 tags; kept whole in book doc).
- Decisions record: `pastoral-sexual-purity` stays OFF per book doc Decisions #3 (the chapter depicts purity's failure, not its teaching — the Genesis-3 rule) — reaffirmed, no overturn evidence. No yields.

## 2 Samuel 12 (subdivided: 12:1–12; 12:13–25; 12:26–31)
- Existing tags (book doc): `repentance`, `forgiveness-of-sins`, `pastoral-pregnancy-and-child-loss`, `the-lords-discipline`, `prayer`, `divine-judgment`, `justice-and-oppression`
- Applied-tag deltas:
  - KEEP `repentance` — "I have sinned against the LORD" (12:13), unexcused and unbargained.
  - KEEP `forgiveness-of-sins` — "The LORD also has put away your sin. You will not die" (12:13).
  - KEEP `pastoral-pregnancy-and-child-loss` — a parent begging God for a dying child (12:16) and the words held by grieving parents since: "I will go to him, but he will not return to me" (12:23). The engine pack already anchors 2 Samuel 12:22-23 (w0.5); the fixture corpus carries 2 Sam 12 as a pastoral anchor.
  - KEEP `the-lords-discipline` — forgiven yet chastened: "the sword will never depart from your house" (12:10).
  - KEEP `prayer` — "David therefore begged God for the child" (12:16).
  - KEEP `divine-judgment` — the LORD's measured sentence through Nathan (12:9–12, 15).
  - KEEP `justice-and-oppression` — the parable's engine is injustice against the poor: the rich man takes the "one little ewe lamb" that "lay in his bosom, and was like a daughter to him" (12:3–4), and "You are the man!" (12:7) lands it.
  - All seven independently clear the presence bar (re-judged); no eighth candidate does — `pastoral-grief-and-loss` re-checked and NOT added: the grief here is specifically child loss, which the more specific pack already carries; a general grief tag would be broad-duplicating-specific (§11.6).
- Anchor-extension candidates:
  - `justice-and-oppression` | 2 Samuel 12:1-6 | "one little ewe lamb" (12:3) | w0.5 — the parable is a canonical oppression-of-the-poor text absent from the pack's anchors.
- Lexicon candidates:
  - `pastoral-pregnancy-and-child-loss` | term: "i will go to him but he will not return to me" | queries: "I will go to him but he will not return to me meaning", "where did David's baby go", "David and Bathsheba's baby dies". The pack anchors 12:22-23 but its lexicon has no phrasing from the verse itself.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: soft cap 6 EXCEEDED (7 tags, within the hard ceiling of 8 — recorded at the 2026-08-25 application pass and reaffirmed here: every tag independently clears the bar); subdivided in book doc (3 sections) → PER-VERSE REFINEMENT candidate (dense chapter; per-verse anchoring would give each of the seven an exact range).
- Decisions record: `pastoral-grief-and-loss` considered and not added (broad-duplicating-specific — see deltas). No existing-tag yields.

## 2 Samuel 13 (subdivided: 13:1–22; 13:23–39)
- Existing tags (book doc): `sin`, `honesty`, `pastoral-grief-and-loss`
- Applied-tag deltas:
  - KEEP `sin` — the violence named by its victim — "no such thing ought to be done in Israel… Don’t you do this folly!" (13:12) — done anyway ("he forced her and lay with her", 13:14), and the hatred (13:15) and murder (13:28–29) that follow.
  - KEEP `honesty` — crime and revenge both run on deception: the faked sickness (13:5–6) and the two-year patience behind an innocent invitation (13:23–27).
  - KEEP `pastoral-grief-and-loss` — Tamar's ashes and torn robe (13:19), "The king also and all his servants wept bitterly" (13:36), and "David mourned for his son every day" (13:37) — personal griefs, per book doc Decisions #2(c).
  - Re-checked the full library: `envy-and-jealousy` (Amnon's obsession is lust, not envy — no), `taming-the-tongue` (no). No changes.
- Anchor-extension candidates: None — 2 Sam 13 is an engine pastoral HARM GATE (a chapter that must not surface for abuse-crisis queries, per the repo fixture); proposing anchors into it would work against the gate. Nothing proposed.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (13:1–22; 13:23–39) → PER-VERSE REFINEMENT candidate.
- Decisions record: `pastoral-refuge-and-justice` stays OFF per book doc Decisions #3 (the chapter depicts the absence of refuge and justice for the victim — the Genesis-3 rule — and the engine fixture independently marks 2 Sam 13 a pastoral harm gate) — reaffirmed, no overturn evidence. No yields.

## 2 Samuel 14
- Existing tags (book doc): `family-reconciliation`
- Applied-tag deltas:
  - KEEP `family-reconciliation` — the chapter's whole labor is bringing home a banished son: "the king does not bring home again his banished one" (14:13), ending in "the king kissed Absalom" (14:33), hollowness showing. (Only one honest tag from the current vocabulary.)
  - Re-checked `wisdom-from-god` (the wise woman's craft is Joab's stagecraft, never God-attributed — book doc Decisions #15 reaffirmed) and `forgiving-others` (recall without repentance or words — Decisions #15 reaffirmed). No changes.
- Anchor-extension candidates:
  - `family-reconciliation` | 2 Samuel 14:14 | "neither does God take away life, but devises means, that he who is banished not be an outcast from him" | w0.55 — the recorded tag-gaps-review §3.5 flag for this verse ("partial homes exist… flagged for those packs' anchors at curation time") discharged as a concrete candidate.
  - `restoration` | 2 Samuel 14:14 | same quote | w0.45 — the flag's other named home; EITHER/OR with the row above (one pack should take the verse, the curator chooses — not a double-mint).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (kept whole in book doc).
- Decisions record: None.

## 2 Samuel 15 (subdivided: 15:1–12; 15:13–37)
- Existing tags (book doc): `surrender-to-god`, `prayer`, `loving-others`, `betrayal`, `counsel-and-advisers`, `justice-and-oppression`, `sojourners-and-strangers`
- Applied-tag deltas:
  - KEEP `surrender-to-god` — the ark handed back with the outcome: "behold, here I am. Let him do to me as seems good to him" (15:26).
  - KEEP `prayer` — "LORD, please turn the counsel of Ahithophel into foolishness" (15:31), its answer already arriving (15:32).
  - KEEP `loving-others` — Ittai's costly loyalty: "whether for death or for life, your servant will be there also" (15:21).
  - KEEP `betrayal` — the son who "stole the hearts of the men of Israel" (15:6) and the counselor: "Ahithophel is among the conspirators with Absalom" (15:31). The engine pack already anchors 2 Samuel 15:12 (w0.65).
  - KEEP `counsel-and-advisers` (adopted display tag, §11.1; not an engine id) — the counsel-war opens: David's counselor defects and David plants Hushai against his word (15:12, 31–37).
  - KEEP `justice-and-oppression` — justice delayed at the gate and exploited: "your matters are good and right; but there is no man deputized by the king to hear you" (15:3), and "Oh that I were made judge in the land" (15:4).
  - KEEP `sojourners-and-strangers` — the faithful foreigner: Ittai, "a foreigner and also an exile" (15:19), refuses to leave the fleeing king (15:19–22).
  - All seven independently clear the bar (re-judged); no eighth candidate does — `oaths-and-vows` re-checked and NOT added (Absalom's Hebron vow, 15:7–8, is a cover story; abuse of the practice, not its teaching).
- Anchor-extension candidates:
  - `surrender-to-god` | 2 Samuel 15:25-26 | "behold, here I am. Let him do to me as seems good to him" | w0.65 — the pack's only OT narrative anchor is Job 1:21; this is the canon's other great open-handed surrender scene.
- Lexicon candidates: None (the betrayal query family is already served by the pack's "betrayed by a friend; betrayed by family" terms; "betrayed by my own son" judged too narrow to propose).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: soft cap 6 EXCEEDED (7 tags, within the hard ceiling of 8 — recorded at the 2026-08-25 application pass and reaffirmed: every tag independently clears the bar); subdivided in book doc (15:1–12; 15:13–37) → PER-VERSE REFINEMENT candidate (dense chapter).
- Decisions record: `counsel-and-advisers` engine-side material routed to backlog: `counsel-and-advisers` (roster row 15 — DEFERRED; the row already records 2 Sam 17 among the only honest in-corpus answers for the human-advisers register; 15:12, 31 are sibling refs for that row's curator). Display KEEP stands under §11.1. `pastoral-betrayal-and-marriage-crisis` stays OFF per book doc Decisions #3 (national-scale political material, not the personal-crisis register) — reaffirmed. No yields.

## 2 Samuel 16 (subdivided: 16:1–14; 16:15–23)
- Existing tags (book doc): `trust-in-god`, `counsel-and-advisers`
- Applied-tag deltas:
  - KEEP `trust-in-god` — cursed and stoned, David hands the wrong to God: "It may be that the LORD will look on the wrong done to me, and that the LORD will repay me good for the cursing of me today" (16:12).
  - KEEP `counsel-and-advisers` (adopted display tag, §11.1) — the narrator's own measure of counsel's weight: "as if a man inquired at the inner sanctuary of God" (16:23).
  - ADD `slander-and-false-accusation` — the concept's substance is depicted whole: a public false accusation hurled at the king — "Be gone, be gone, you man of blood, and wicked fellow!… The LORD has returned on you all the blood of Saul’s house" (16:7–8, an indictment the chapter's own frame treats as "the wrong done to me", 16:12) — met by the pack's taught response, non-retaliation and entrusting vindication to God: "Leave him alone, and let him curse" (16:11), "the LORD will repay me good for the cursing of me today" (16:12). This is the 1 Pet 2:23 register (the pack's own anchor) in narrative form; both-tags ruling allows it beside `trust-in-god` (accusation-response register vs. general entrusting).
- Anchor-extension candidates:
  - `slander-and-false-accusation` | 2 Samuel 16:5-13 | "Leave him alone, and let him curse" (16:11) | w0.5 — the pack has no narrative anchor of accusation endured without retaliation.
- Lexicon candidates: None (the pack's "falsely accused; when people lie about you" terms already carry the query family).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (16:1–14; 16:15–23) → PER-VERSE REFINEMENT candidate.
- Decisions record: `counsel-and-advisers` routing as at ch. 15 (roster row 15; 16:20–23 sibling refs). Ziba's misrepresentation of Mephibosheth (16:3–4) deliberately NOT used to justify the slander ADD — the chapter itself passes no verdict on Ziba's claim (the vindication is ch. 19 material, and cross-chapter justification is barred by §5); the ADD rests wholly on the Shimei span. `self-control` on David's restraint stays OFF per book doc Decisions #15 (entrusting-to-God, not the temperance register) — reaffirmed. No yields.

## 2 Samuel 17
- Existing tags (book doc): `providence`, `gods-provision`, `counsel-and-advisers`
- Applied-tag deltas:
  - KEEP `providence` — the narrator opens the machinery: "For the LORD had ordained to defeat the good counsel of Ahithophel, to the intent that the LORD might bring evil on Absalom" (17:14).
  - KEEP `gods-provision` — hungry fugitives met with abundance "for David and for the people who were with him to eat" — "The people are hungry, weary, and thirsty in the wilderness" (17:27–29), inside the chapter's own providence frame (book doc Decisions #16).
  - KEEP `counsel-and-advisers` (adopted display tag, §11.1) — the Ahithophel–Hushai duel entire (17:1–14, 23).
  - Re-checked the library: nothing else clears (the well-hiding escape is plot, not a concept's teaching). No changes.
- Anchor-extension candidates:
  - `providence` | 2 Samuel 17:14 | "For the LORD had ordained to defeat the good counsel of Ahithophel, to the intent that the LORD might bring evil on Absalom" | w0.8 — one of the OT's most explicit narrator-voiced providence statements, absent from the pack's anchors (which carry Gen 50:20 but nothing from the Absalom narrative). NOTE for the curator: 2 Sam 17 is in the fixture corpus as a pastoral harm gate (Ahithophel's suicide, 17:23); the anchor targets 17:14 only, and any fixture built on it must respect the gate.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (3 tags; kept whole in book doc).
- Decisions record: `counsel-and-advisers` routing as at ch. 15 (roster row 15 — the row's own text already names 2 Sam 17 as the register's only honest in-corpus witness; nothing new to add beyond confirming it). Ahithophel's suicide (17:23) is NOT a concept candidate, per the recorded 2 Samuel decline (tag-gaps-review §3.5: harm-gated in the engine's pastoral packs) — reaffirmed; no tag, no anchor, no lexicon row touches it. No yields.

## 2 Samuel 18 (subdivided: 18:1–18; 18:19–33)
- Existing tags (book doc): `pastoral-grief-and-loss`
- Applied-tag deltas:
  - KEEP `pastoral-grief-and-loss` — a father's grief at full volume: "My son Absalom! My son, my son Absalom! I wish I had died instead of you, Absalom, my son, my son!" (18:33). (Only one honest tag from the current vocabulary.)
  - Re-checked `humble-exaltation` (no in-chapter divine agency in Absalom's fall — "the LORD has avenged" is the couriers' framing, 18:19, 31; book doc Decisions #15 reaffirmed) and `divine-judgment` (same ground; the narrator's providence statement is ch. 17's and tagged there). Raw grief stays OFF the `lament` id per the row's settled three-book decline pattern (§1(c)) — applied, not re-litigated. No changes.
- Anchor-extension candidates:
  - `pastoral-grief-and-loss` | 2 Samuel 18:33 | "I wish I had died instead of you, Absalom, my son, my son!" | w0.5 — the pack's anchors are all NT/promise texts; this is Scripture's rawest bereaved-parent cry, and the book doc's lament-row split already routes this verse to this pack ("that raw grief is served instead by the `pastoral-grief-and-loss` tag on ch. 18").
- Lexicon candidates: None (the pack's "my child died" term already carries the query family).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (18:1–18; 18:19–33) → PER-VERSE REFINEMENT candidate.
- Decisions record: None.

## 2 Samuel 19 (subdivided: 19:1–7; 19:8–40; 19:41–43)
- Existing tags (book doc): `forgiving-others`, `generosity`
- Applied-tag deltas:
  - KEEP `forgiving-others` — vengeance declined on the day power returns: "Shall any man be put to death today in Israel?" (19:22), sealed by oath — "You will not die" (19:23).
  - KEEP `generosity` — Barzillai's expectation-free provision ("He had provided the king with sustenance while he stayed at Mahanaim", 19:32) answered in kind: "Whatever you request of me, that I will do for you" (19:38).
  - ADD `aging-and-old-age` — Barzillai's speech is a substantial, self-aware depiction of the concept's substance: "How many are the days of the years of my life" (19:34); "I am eighty years old, today. Can I discern between good and bad? Can your servant taste what I eat or what I drink? Can I hear the voice of singing men and singing women any more?" (19:35), choosing to die "in my own city, by the grave of my father and my mother" (19:37). A classic aging passage — honest presence, not topical brush; the pack (Ps 92, Ps 71, Eccl 12 anchors) has no narrative witness.
  - Raw grief cry (19:4) stays OFF the `lament` id per the settled §1(c) decline pattern — applied, not re-litigated.
- Anchor-extension candidates:
  - `aging-and-old-age` | 2 Samuel 19:34-37 | "I am eighty years old, today. Can I discern between good and bad?" (19:35) | w0.7 — the pack's only narrative anchor candidate in the historical books.
  - `slander-and-false-accusation` | 2 Samuel 19:26-27 | "He has slandered your servant to my lord the king" (19:27) | w0.4 — the concept's literal vocabulary in narrative (Mephibosheth's vindication scene); modest weight, single scene.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: `the-lords-anointed` material at 19:21 ("because he cursed the LORD’s anointed") routed to backlog: `the-lords-anointed` (roster row 46 — 2 Sam 19 is among that row's own blocking refs); NOT added as a display tag here, consistent with the 2026-08-25 application pass's recorded skip (single courtroom use). `restoration` on the political restoration stays OFF per book doc Decisions #15 (not the personal-renewal register) — reaffirmed. No yields.

## 2 Samuel 20
- Existing tags (book doc): `harmony-with-others`
- Applied-tag deltas:
  - KEEP `harmony-with-others` — a city saved by a peacemaker's negotiation: "I am among those who are peaceable and faithful in Israel… Why will you swallow up the LORD’s inheritance?" (20:19), and she goes to the people "in her wisdom" (20:22). (Only one honest tag from the current vocabulary; the settlement's price is reported plainly, per book doc Decisions #18.)
  - Re-checked `sin` on Joab's murder of Amasa (20:9–10) — depicted but never named or answered in-chapter (contrast 3:39; 4:11); book doc Decisions #15 reaffirmed. `wisdom-from-god` — the woman's wisdom is never God-attributed; Decisions #15 reaffirmed. No changes.
- Anchor-extension candidates: None.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (kept whole in book doc).
- Decisions record: None.

## 2 Samuel 21 (subdivided: 21:1–14; 21:15–22)
- Existing tags (book doc): `covenant`, `divine-judgment`, `prayer`, `pastoral-grief-and-loss`, `oaths-and-vows`
- Applied-tag deltas:
  - KEEP `covenant` — the famine's root is a broken national bond ("the children of Israel had sworn to them", 21:2) and the one man spared is spared by a kept one: "because of the LORD’s oath that was between them, between David and Jonathan" (21:7).
  - KEEP `divine-judgment` — the famine attributed by the LORD himself: "It is for Saul, and for his bloody house, because he put the Gibeonites to death" (21:1).
  - KEEP `prayer` — the chapter opens seeking ("David sought the face of the LORD", 21:1) and closes answered: "After that, God answered prayer for the land" (21:14).
  - KEEP `pastoral-grief-and-loss` — Rizpah's vigil: she "took sackcloth and spread it for herself on the rock" from harvest until the rains (21:10), grief so faithful it moves the king (21:11–14). SETTLED: this tag was KEPT with annotation under Jesse's 2026-08-25 delegated ruling (CONVENTIONS §11(4); book doc Decisions #2(e)) — honored here, not re-litigated.
  - KEEP `oaths-and-vows` — the practice's gravest case: a broken national oath brings famine generations later, a kept oath spares Mephibosheth (21:1–2, 7) — beside `covenant` under the both-tags ruling (human oath-practice vs. covenant register).
  - Re-checked the library: `care-for-widows` (Rizpah is a bereaved concubine, not the widow-care teaching — no), `gods-protection` on the giant battles ("so that you don’t quench the lamp of Israel", 21:17, is the men's oath about David, not a divine-protection statement — no). No changes.
- Anchor-extension candidates:
  - `oaths-and-vows` | 2 Samuel 21:1-7 | "the children of Israel had sworn to them" (21:2) | w0.6 — the pack's anchors are all keep-your-vow instruction; it has no consequences-of-a-broken-oath narrative.
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (21:1–14; 21:15–22) → PER-VERSE REFINEMENT candidate.
- Decisions record: Burial-practice material (Saul's and Jonathan's bones gathered and buried in the family tomb, 21:12–14) routed to backlog: `death-and-burial` (roster row 22 — additional refs for that row's curator). No yields.

## 2 Samuel 22
- Existing tags (book doc): `refuge-in-trouble`, `praise`, `gods-protection`, `thanksgiving`, `deliverance`
- Applied-tag deltas:
  - KEEP `refuge-in-trouble` — the song's controlling image: "The LORD is my rock, my fortress, and my deliverer" (22:2), stated as open promise: "He is a shield to all those who take refuge in him" (22:31).
  - KEEP `praise` — "I call on the LORD, who is worthy to be praised" (22:4), rising to "The LORD lives! Blessed be my rock!" (22:47).
  - KEEP `gods-protection` — drawn "out of many waters" (22:17), shielded in battle (22:36).
  - KEEP `thanksgiving` — "I will give thanks to you, LORD, among the nations, and will sing praises to your name" (22:50).
  - KEEP `deliverance` (adopted display tag, §11.1; not an engine id) — the rescue register set to music: "He delivered me, because he delighted in me" (22:20).
  - `no-other-god` considered — "For who is God, besides the LORD? Who is a rock, besides our God?" (22:32) is the concept's exact substance but one verse inside a deliverance song; thin single-verse (§11.6 class), filed as an anchor candidate instead of a sixth tag.
- Anchor-extension candidates:
  - `refuge-in-trouble` | 2 Samuel 22:2-3 | "The LORD is my rock, my fortress, and my deliverer" | w0.85 — the pack's rock/fortress vocabulary home in the historical books (its anchors are all Psalms/prophets; Ps 18's twin is likewise unanchored).
  - `no-other-god` | 2 Samuel 22:32 | "For who is God, besides the LORD? Who is a rock, besides our God?" | w0.5.
- Lexicon candidates:
  - `refuge-in-trouble` | term: "my rock and my fortress" | queries: "the Lord is my rock meaning", "God my rock and my fortress", "my fortress and my deliverer verse". The pack's lexicon carries refuge/shelter/stronghold phrasings but not the rock-and-fortress family, which is 22:2 verbatim (and Ps 18:2's).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: none (5 tags; kept whole in book doc — its single Berean heading precludes subdivision).
- Decisions record: `deliverance` engine-side material routed to backlog: `deliverance` (roster row 32 — SKIPPED-blocked; 2 Sam 22 is among that row's own requested refs). Display KEEP stands under §11.1. `no-other-god` considered and not added (thin single-verse; anchor candidate preserves the finding) — recorded so the pass is not silent. `pastoral-strength-in-weakness` on 22:33-40 checked and OFF (battle-strength register on national material, not the personal-crisis pack's register). No yields.

## 2 Samuel 23 (subdivided: 23:1–7; 23:8–39)
- Existing tags (book doc): `covenant`, `worship`, `davidic-covenant`, `fear-of-the-lord`
- Applied-tag deltas:
  - KEEP `covenant` — David's deathbed confidence: "he has made with me an everlasting covenant, ordered in all things, and sure" (23:5).
  - KEEP `worship` — water won at the price of blood: "he would not drink of it, but poured it out to the LORD" — "Isn’t this the blood of the men who risked their lives to go?" (23:16–17).
  - KEEP `davidic-covenant` (adopted display tag, §11.1) — the promise restated as dying confidence, "for it is all my salvation and all my desire" (23:5).
  - KEEP `fear-of-the-lord` — the rule-oracle's standard: "One who rules over men righteously, who rules in the fear of God" (23:3).
  - Re-checked `leadership` — the 2026-08-25 pass's skip stands (the rule-oracle's two verses are carried by `fear-of-the-lord`; a second tag on the same span would restate it). `messianic-prophecy` — reading the oracle messianically would be a read-back; OFF. No changes.
- Anchor-extension candidates:
  - `fear-of-the-lord` | 2 Samuel 23:3-4 | "One who rules over men righteously, who rules in the fear of God" | w0.5 — the fear-of-God-in-leadership register, absent from the pack's anchors.
  - `worship` | 2 Samuel 23:16-17 | "he would not drink of it, but poured it out to the LORD" | w0.5 — the costly-worship register (pairs with ch. 24's 24:24 candidate below).
- Lexicon candidates: None.
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (23:1–7; 23:8–39) → PER-VERSE REFINEMENT candidate.
- Decisions record: `davidic-covenant` routing as at ch. 7 (roster row 44; 23:5 is a sibling ref for that row's curator). Uriah's roster listing (23:39) stays off `sojourners-and-strangers` per the 2026-08-25 pass's recorded skip (a list-item, not substance) — reaffirmed. No yields.

## 2 Samuel 24 (subdivided: 24:1–9; 24:10–17; 24:18–25)
- Existing tags (book doc): `divine-judgment`, `repentance`, `worship`, `prayer`
- Applied-tag deltas:
  - KEEP `divine-judgment` — judgment announced, chosen, enacted: "So the LORD sent a pestilence on Israel" (24:15), and stopped by the same LORD: "It is enough. Now withdraw your hand" (24:16).
  - KEEP `repentance` — conscience convicts before any prophet arrives: "David’s heart struck him" — "I have sinned greatly in that which I have done" (24:10).
  - KEEP `worship` — costly on principle: "I will not offer burnt offerings to the LORD my God which cost me nothing" (24:24).
  - KEEP `prayer` — the shepherd's self-offering intercession — "these sheep, what have they done?" (24:17) — and the close: "the LORD was entreated for the land" (24:25).
  - ADD `mercy` — the chapter turns on the character of God's mercy, chosen and then enacted: "Let us fall now into the LORD’s hand, for his mercies are great" (24:14), and "the LORD relented of the disaster" (24:16). The pack's God's-mercy register (Ps 103:10-11 anchor) is the chapter's own hinge — honest substantial presence.
- Anchor-extension candidates:
  - `mercy` | 2 Samuel 24:14 | "Let us fall now into the LORD’s hand, for his mercies are great" | w0.7 — a famous mercy text absent from the pack (its 1 Chr 21:13 parallel was already flagged toward the mercy theme by the 1 Chronicles thread; this is the 2 Samuel original).
  - `worship` | 2 Samuel 24:24 | "I will not offer burnt offerings to the LORD my God which cost me nothing" | w0.7 — discharges the recorded 2 Samuel decline-note flag (tag-gaps-review §3.5: "costly worship (24:24) — no row; flagged as a `worship` lexicon-extension review instead") on the anchor side.
- Lexicon candidates:
  - `worship` | term: "cost me nothing" | queries: "worship that costs me nothing", "giving God what costs you nothing", "David refuses Araunah's free gift". Discharges the same recorded §3.5 flag on the lexicon side — the "cost me nothing" phrasing is a classic query with no lexicon entry anywhere (the book doc's motif 5 made the same finding).
- New-concept candidates: None.
- Decline-overturn proposals: None.
- Ceiling / refinement flags: subdivided in book doc (3 sections) → PER-VERSE REFINEMENT candidate.
- Decisions record: 24:1's entanglement (the LORD's anger and David's census) left exactly where the text leaves it, per book doc Decisions #6 — no 1 Chronicles 21 harmonization imported, no adjudication in any justification above. No yields.

---

# Book totals

- Chapters swept: 24/24.
- Applied-tag deltas: ADD 5 (`vengeance` ch. 3; `integrity` ch. 11; `slander-and-false-accusation` ch. 16; `aging-and-old-age` ch. 19; `mercy` ch. 24) · KEEP 80 (every existing book-doc tag re-judged and retained) · DROP 0.
- Anchor-extension candidates: 22 (chs. 3, 5, 6, 7×2, 11, 12, 14×2, 15, 16, 17, 18, 19×2, 21, 22×2, 23×2, 24×2).
- Lexicon candidates: 7 rows (chs. 1, 2, 6, 9, 12, 22, 24).
- New-concept candidates: 0 — every genuinely-present theme has an honest home in the current vocabulary, the adopted list, or the corpus-blocked roster; honest-and-empty preferred over invention.
- Decline-overturn proposals: 0 — no new textual evidence against any recorded decline; the §1(c) lament grief-decline pattern, the ch. 21 grief-tag ruling (KEPT, per CONVENTIONS §11(4)), and all book-doc Decisions-#3/#15 drops were applied as ruled.
- Corpus-blocked routings: 10 routing notes across 5 roster concepts — `the-lords-anointed` (row 46: chs. 1, 19), `davidic-covenant` (row 44: chs. 7, 23), `counsel-and-advisers` (row 15: chs. 15, 16, 17), `deliverance` (row 32: ch. 22), `death-and-burial` (row 22: chs. 3/4, 21). Nothing duplicated as a fresh proposal.
- Ceiling / density: hard ceiling (8) hit by NO chapter. Soft cap 6 exceeded (7 tags, recorded and reaffirmed): chs. 12 and 15. At soft cap (6): ch. 7.
- PER-VERSE REFINEMENT candidates (book-doc-subdivided; none hit the ceiling): chs. 1, 2, 5, 6, 7, 12, 13, 15, 16, 18, 19, 21, 23, 24 — 14 chapters, with chs. 12 and 15 the priority (densest).
- Harm-gate notes honored: 2 Sam 13 and 17 are engine pastoral harm gates — no anchor, lexicon, or tag proposal in this ledger works against either gate (ch. 17's providence anchor targets 17:14 only and carries an explicit gate note); Ahithophel's suicide (17:23) touched by nothing.

# Adopted-vocabulary cross-check (correction entry, 2026-08-26)

The header above cites the scout BRIEFING §7 reconstruction of the §11.1 adopted list, written
while `tag-apply/adopted-concepts.md` was missing. The canonical file now exists at
/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md (161 ids, each marked
engine-built yes/no) and was cross-checked against this ledger before the survival audit:
every non-engine id used here as a display tag or routing target (`the-lords-anointed`,
`davidic-covenant`, `counsel-and-advisers`, `deliverance`, `death-and-burial`) appears in the
canonical file marked "engine-built: no", exactly matching this ledger's treatment; every other
id used is one of the 239 engine basenames. Mechanical check: 64 distinct backticked ids in
this ledger, 0 unknown against (concept-ids ∪ canonical adopted). No chapter block required
correction; the header's reconstruction citation is superseded by this note (per §9, earlier
bytes are not rewritten).

# Survival audit (CONVENTIONS §9, final)

- Whole file re-read mechanically after the last chapter append: 24 chapter blocks present,
  each "## 2 Samuel N" heading exactly once for N = 1…24; header first line intact.
- Prior-bytes verification: every append (chunks A–D and this closing block) was made as an
  atomic end-of-file append (`cat >>`), and after each append the pre-append byte-prefix was
  re-hashed and matched its pre-append md5 exactly — no earlier bytes changed at any step.
- Quote verification: all 122 WEB quote spans used in this ledger were verified byte-for-byte
  (grep -F) against the repo-pinned VPL (pipeline/sources/vpl/engwebp_vpl.txt, contentSha256
  944e3883…) BEFORE being written; 0 missing. Composite justifications joining two spans use
  "…" between individually-verified spans.
- Id audit: 64 distinct concept ids used; all resolve against the 239 engine basenames or the
  canonical 161-id adopted list (see correction entry above); no invented ids, no stripped
  prefixes (pastoral-* basenames used throughout).
- This thread wrote ONLY this file; the book doc, tag-gaps.md, and every other shared file
  are untouched.
- AUDIT RESULT: PASS — all blocks present exactly once, prior bytes unchanged at every append.

# Supplementary audit — shared-scratchpad hazard re-verification (2026-08-26)

The coordinator reported that the sweep scratchpad is SHARED across the 12 concurrent book
workers and that a generic-named `quotes.txt` there was overwritten mid-sweep (possibly by
this session). This ledger's original quote verification had used that generic filename, so
the verification was REDONE from scratch against the live ledger bytes, with no reliance on
any previously-written shared temp file:

- Every double-quoted span was mechanically extracted from THIS file as it stands on disk
  (composite justifications split at their "…" joiners): 173 distinct spans.
- Each span was checked byte-for-byte (grep -F) against a freshly re-extracted 2 Samuel text
  taken directly from the repo-pinned VPL (pipeline/sources/vpl/engwebp_vpl.txt, 695 2SA
  verse lines re-confirmed) into a book-prefixed temp file.
- Result: 129 spans verified present in the pinned WEB text; the remaining 44 are all
  legitimately non-Scripture spans — the legend's placeholders, lexicon terms and realistic
  query phrasings (which are deliberately not verse text), and meta-quotes of recorded
  flags/rulings (e.g. "engine-built: no", the §3.5 costly-worship flag wording). ZERO spans
  presented as WEB text failed verification.
- The chapter-block audit was re-run on the live file at the same time: 24 "## 2 Samuel N"
  headings, each exactly once, header first line intact.
- All temp files used for this re-verification are book-prefixed (2-samuel-*); this session's
  earlier generic-named temp files are no longer used or relied upon.
- SUPPLEMENTARY AUDIT RESULT: PASS — the original AUDIT RESULT above stands independently of
  any shared-scratchpad clobber.
