# Mark sweep ledger — Layer-3 tag sweep (Gospels+Acts thread)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + the 161 §11.1
  adopted display ids (CONVENTIONS §11, binding 2026-08-25). These two lists are the
  only legal tag vocabulary for this sweep.
- Book: Mark (16 chapters)
- WEB text source: the pinned-source full-Bible fixture web-subset.json at commit
  87fd68c (branch claude/hearth-161-concept-packs-2tf8jk; sourceSha256 b6f55cc7…),
  printed verse-by-verse via scratchpad webchap.py. Every quote below is word-for-word
  from that output, from within the chapter being tagged.
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/mark.md
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/declines-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/corpus-blocked.md
  - Sweep spec: plan §3 + §5.2; rules: CONVENTIONS §5, §9, §11.
- Id note: the scratchpad concept index abbreviates some pastoral-register ids
  (e.g. "prayer-for-healing"); the exact engine ids on main carry the pastoral-
  prefix (`pastoral-prayer-for-healing`, `pastoral-freedom-from-bondage`,
  `pastoral-marriage-divorce-teaching`, `pastoral-betrayal-and-marriage-crisis`),
  verified against ontology/concepts/ at the SHA above. This ledger uses the exact
  engine ids, matching mark.md's prior art (CONVENTIONS §5: never strip a prefix).
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order:
  1. "## Mark <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")
- Mark-specific standing items (binding for this ledger):
  - Mark 12, Sadducee-resurrection side: harmonized to the Matthew reading per
    Jesse's 2026-08-25 ruling 1(a) (CONVENTIONS §11(2)) — Mark 12 carries Matt 22's
    applicable resurrection-dispute tags. Already applied in mark.md's 2026-08-25
    tag-application pass; recorded as KEEP-per-ruling below.
  - Mark 12 / Luke 20 deity-of-christ divergence: STANDING, awaiting Jesse's word
    (coordinator flag 2026-08-26). NOT harmonized here; evidence recorded both ways
    in Mark 12's Decisions record as HELD.
  - Mark 3 blasphemy-against-the-spirit: engine pack is corpus-blocked (roster row
    11); in-chapter evidence is ROUTED to that row, not proposed as a pack. The
    display tag (§11.1-adopted) stays.
  - Mark 16:9–20: presented as the staged WEB carries it, no manuscript claims
    (mark.md Decisions record item 1 — established convention).

## Mark 1 (subdivided: 1:1–11 / 1:12–15 / 1:16–20 / 1:21–34 / 1:35–39 / 1:40–45)

**Existing tags (book doc):** `repentance`; `baptism`; `pastoral-prayer-for-healing`; `prayer`; `kingdom-of-heaven`; `discipleship`; `deliverance-from-demons` (7).

**Applied-tag deltas:**
- ADD `witness-testimony` — John the Baptist's witness to the mightier one is the chapter's opening unit, 1:2–8, and the concept's lexicon phrase is Mark 1:3 verbatim: "the voice of one crying in the wilderness, 'Make ready the way of the Lord! Make his paths straight!'" (1:3); "After me comes he who is mightier than I, the strap of whose sandals I am not worthy to stoop down and loosen." (1:7). Seven verses of testimony-to-Jesus substance — clears the presence bar; the concept's current anchors are all in John's Gospel, but its gloss ("Witness and testimony to Jesus") and lexicon ("testimony of john the baptist"; "voice of one crying in the wilderness") name exactly this scene.
- KEEP all seven existing tags — each independently verified against the WEB text: `repentance` (1:4, 14–15 "Repent, and believe in the Good News."), `baptism` (1:4–5, 8–11), `pastoral-prayer-for-healing` (1:32–34, 40–42 "If you want to, you can make me clean."), `prayer` (1:35, below-bar-but-ratified — see Decisions), `kingdom-of-heaven` (1:14–15 "The time is fulfilled, and God's Kingdom is at hand!"), `discipleship` (1:16–20 "Come after me, and I will make you into fishers for men."), `deliverance-from-demons` (1:21–28, 32–34, 39).
- DROP: none.

**Anchor-extension candidates:**
- `witness-testimony` | Mark 1:2–8 | "the voice of one crying in the wilderness, 'Make ready the way of the Lord!'" (1:3); "After me comes he who is mightier than I" (1:7) | proposed weight 0.7 — the Synoptic Baptist-witness scene; current anchors are John-only (Jn 1:19-23 etc.) while the lexicon phrase is this verse.
- `holy-spirit` | Mark 1:8–11 | "I baptized you in water, but he will baptize you in the Holy Spirit." (1:8); "the Spirit descending on him like a dove" (1:10) | proposed weight 0.6 — the pack already anchors John's telling of the same scene (Jn 1:32-33).
- (`temptation` Mark 1:12–13 is already an engine anchor — no extension needed.)

**Lexicon candidates:**
- `repentance` | "repent and believe" | "repent and believe the gospel"; "repent and believe the good news"; "the time is fulfilled meaning" (all land 1:15).
- `baptism` | Jesus' own baptism | "why was jesus baptized"; "jesus baptized by john"; "baptism of john" (1:4–11).

**New-concept candidates:**
- `messianic-secret` (or `commands-to-silence`) | The commands-to-silence query family has no existing or adopted id (checked the 239 + 161 lists and the declines roster — absent) and mark.md already logged it as motif candidate 2; Mark is its densest book. Anchors here: "He didn't allow the demons to speak, because they knew him." (1:34); "See that you say nothing to anybody" (1:44); book-wide refs in mark.md motif 2. Queries: "why did jesus tell people not to tell anyone"; "messianic secret in mark"; "why did jesus silence demons". Gist must stay descriptive (what the text narrates), no theory adjudication.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 reached with the add (7 existing + 1). Subdivided in book doc (6 sections) — flagged for the per-verse refinement pass.

**Decisions record:**
1. `witness-testimony` added at the ceiling. §11.6 requires every tag at 8 to independently clear the bar; the weakest member is prior art's `prayer` (single verse 1:35), kept below the usual bar as a deliberate pattern-scene by mark.md Decisions 7 (ratified 2026-08-25). Not dropped — an existing tag is never silently dropped, and its keep was Jesse-ratified — but it is the natural §11.6 thin-single-verse yield candidate if Jesse wants headroom on this chapter.
2. `messianic-prophecy` considered (1:2–3, "As it is written in the prophets") — two verses of citation formula; thin — not added.
3. `temptation` considered (1:12–13) — application-pass skip stands (two-verse compression; Matthew 4 / Luke 4 carry the full narrative); engine anchor Mk 1:12-13 already exists, so nothing is lost engine-side.
4. `angels` considered (1:13 "the angels were serving him") — single clause; application-pass skip stands.
5. `holy-spirit` considered as display tag (1:8, 10, 12) — three scattered one-verse mentions, below the substantial-presence bar; routed to the anchor-extension candidate instead.
6. `signs-and-wonders` considered (1:21–34, 39–45) — the same verses are carried by `deliverance-from-demons` and `pastoral-prayer-for-healing`; broad-duplicating-specific — not added.

## Mark 2 (subdivided: 2:1–12 / 2:13–17 / 2:18–22 / 2:23–28)

**Existing tags (book doc):** `forgiveness-of-sins`; `repentance`; `faith`; `sabbath-rest` (4).

**Applied-tag deltas:**
- ADD `fasting` — a whole controversy unit (2:18–22, the book doc's own "Questions about Fasting" section) teaches when disciples fast: "Why do John's disciples and the disciples of the Pharisees fast, but your disciples don't fast?" (2:18); "Can the groomsmen fast while the bridegroom is with them? As long as they have the bridegroom with them, they can't fast. But the days will come when the bridegroom will be taken away from them, and then they will fast in that day." (2:19–20). Direct teaching substance on the concept, not a passing mention.
- KEEP all four existing tags — verified: `forgiveness-of-sins` (2:5–12, "the Son of Man has authority on earth to forgive sins"), `repentance` (2:15–17, "I came not to call the righteous, but sinners to repentance."), `faith` (2:3–5, "Jesus, seeing their faith"), `sabbath-rest` (2:23–28, "The Sabbath was made for man, not man for the Sabbath." — already the pack's engine anchor).
- DROP: none.

**Anchor-extension candidates:**
- `forgiveness-of-sins` | Mark 2:5-12 | "But that you may know that the Son of Man has authority on earth to forgive sins" (2:10) | proposed weight 0.75 — the pack's only Gospels/Acts anchor is Ac 13:38-39; this is the Gospels' definitive forgiveness-authority scene.
- `faith` | Mark 2:3-5 | "Jesus, seeing their faith, said to the paralytic, 'Son, your sins are forgiven you.'" (2:5) | proposed weight 0.6 — the `faith` pack currently has no Gospels/Acts anchors at all; Mark supplies several (see also chs. 4, 5, 10, 11).
- `fasting` | Mark 2:18-20 | "then they will fast in that day" (2:20) | proposed weight 0.6.

**Lexicon candidates:**
- `forgiveness-of-sins` | the paralytic scene | "who can forgive sins but god alone"; "authority on earth to forgive sins"; "jesus heals the paralytic" (2:5–12).
- `fasting` | the bridegroom answer | "why didn't jesus disciples fast"; "fasting when the bridegroom is taken away" (2:18–20).

**New-concept candidates:**
- `new-wine-and-wineskins` | "new wine in old wineskins" is a heavy lay query with no home: no existing or adopted id covers the new-and-old images (checked the 239 + 161 lists and the declines roster — absent). Anchor: "No one puts new wine into old wineskins; or else the new wine will burst the skins… but they put new wine into fresh wineskins." (2:22), with the unshrunk-cloth image (2:21) and the Mt 9:16-17 / Lk 5:36-39 parallels. Queries: "new wine in old wineskins meaning"; "new wine old wineskins"; "patch on an old garment meaning". Curation should confirm no lexicon route exists first (none is obvious).

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 5 tags — under the soft cap. Subdivided in book doc (4 sections) — refinement-eligible.

**Decisions record:**
1. `discipleship` considered (2:14 "Follow me." — the call of Levi) — application-pass skip stands: single verse; the call-and-cost home is chs. 1 and 8.
2. `mercy` considered on the physician saying (2:17) — not added: Mark's form is a call to repentance ("I came not to call the righteous, but sinners to repentance."), carried by `repentance`; the mercy formula ("I desire mercy, and not sacrifice") is Matthew's addition (Mt 9:13) and is absent from this chapter — adding `mercy` here would be a cross-parallel read-in.
3. `fasting` added as a both-tags-clean addition (no overlap with existing tags' verses).

## Mark 3 (subdivided: 3:1–6 / 3:7–12 / 3:13–19 / 3:20–30 / 3:31–35)

**Existing tags (book doc):** `sabbath-rest`; `obedience-to-the-word`; `blasphemy-against-the-spirit`; `deliverance-from-demons` (4).

**Applied-tag deltas:**
- ADD `satan` — the Beelzebul answer is five verses of direct teaching about Satan and his kingdom's end: "How can Satan cast out Satan? If a kingdom is divided against itself, that kingdom cannot stand." (3:23–24); "If Satan has risen up against himself, and is divided, he can't stand, but has an end." (3:26); "no one can enter into the house of the strong man to plunder unless he first binds the strong man" (3:27). Distinct register from `deliverance-from-demons` (the person and defeat of Satan vs the deliverance practice) — both-tags ruling applies.
- KEEP all four existing tags — verified: `sabbath-rest` (3:1–6, "Is it lawful on the Sabbath day to do good or to do harm? To save a life or to kill?"), `obedience-to-the-word` (3:31–35, "For whoever does the will of God is my brother, my sister, and mother."), `blasphemy-against-the-spirit` (3:28–30 — adopted display id; engine side ROUTED, see Decisions 1), `deliverance-from-demons` (3:11–12, 22–27).
- DROP: none.

**Anchor-extension candidates:**
- `satan` | Mark 3:23-27 | "How can Satan cast out Satan?" (3:23); "If Satan has risen up against himself, and is divided, he can't stand, but has an end." (3:26) | proposed weight 0.65.
- `sabbath-rest` | Mark 3:1-5 | "Is it lawful on the Sabbath day to do good or to do harm? To save a life or to kill?" (3:4) | proposed weight 0.6 — the pack's sole anchor is Mk 2:27-28; this adds the do-good-on-the-Sabbath teaching scene.

**Lexicon candidates:**
- `satan` | the divided house | "a house divided against itself cannot stand"; "how can satan cast out satan"; "binding the strong man meaning" (3:23–27).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 5 tags — under the soft cap. Subdivided in book doc (5 sections) — refinement-eligible.

**Decisions record:**
1. ROUTED, not duplicated: `blasphemy-against-the-spirit` engine evidence → corpus-blocked roster row 11 (its own note already asks the Gospels sweep to route Mark 3 here). Evidence for that row: "all sins of the descendants of man will be forgiven, including their blasphemies with which they may blaspheme; but whoever may blaspheme against the Holy Spirit never has forgiveness, but is subject to eternal condemnation." (3:28–29), with Mark's narrator-supplied reason, "—because they said, 'He has an unclean spirit.'" (3:30). No pack proposed; the display tag (§11.1-adopted) remains on the chapter.
2. `forgiveness-of-sins` NOT re-added — mark.md Decisions 10's decline stands: 3:28 sits inside the unpardonable-sin warning, and tagging it would route forgiveness-assurance searches to the one passage about the exception. No new textual evidence.
3. `hardness-of-heart` considered (3:5 "being grieved at the hardening of their hearts") — single verse; below the presence bar — not added. Noted as in-book company for the pack's existing Mk 6:52 anchor.
4. `resisting-the-devil` considered (its lexicon carries "power over satan"; 3:27's bound strong man) — register mismatch: the scene is Jesus' power over Satan, not the believer's resisting practice; substance carried by `deliverance-from-demons` and the new `satan` tag — not added.
5. `leadership` considered (3:13–19, the appointing of the twelve) — a commissioning frame and name list, not leadership-teaching substance — not added.

## Mark 4 (subdivided: 4:1–20 / 4:21–34 / 4:35–41)

**Existing tags (book doc):** `obedience-to-the-word`; `faith`; `fear-not`; `kingdom-of-heaven` (4).

**Applied-tag deltas:**
- No adds or drops — the four existing tags cover the chapter's honest substance against the full library. KEEP verified: `obedience-to-the-word` (4:3–20, "Those which were sown on the good ground are those who hear the word, accept it, and bear fruit" 4:20), `faith` (4:35–41, "Why are you so afraid? How is it that you have no faith?" 4:40), `fear-not` (4:37–40), `kingdom-of-heaven` (4:11 "To you is given the mystery of God's Kingdom"; 4:26–32, the growing seed and the mustard seed).

**Anchor-extension candidates:**
- `obedience-to-the-word` | Mark 4:14-20 | "The farmer sows the word." (4:14); "Those which were sown on the good ground are those who hear the word, accept it, and bear fruit" (4:20) | proposed weight 0.7 — hearing-and-doing is the pack's own gist; the sower's explanation is Scripture's definitive hear-the-word text.
- `faith` | Mark 4:35-41 | "Why are you so afraid? How is it that you have no faith?" (4:40) | proposed weight 0.6.
- `kingdom-of-heaven` | Mark 4:26-32 | "God's Kingdom is as if a man should cast seed on the earth, and should sleep and rise night and day, and the seed should spring up and grow, though he doesn't know how." (4:26–27) | proposed weight 0.65 — the growing-seed parable is unique to Mark (the pack anchors Matthew's mustard seed, Mt 13:31-33, but not this).

**Lexicon candidates:**
- `obedience-to-the-word` | the sower | "parable of the sower meaning"; "seed on good soil"; "four soils parable" (4:3–20).
- `fear-not` | the stilled storm | "jesus calms the storm"; "peace be still meaning"; "why are you so afraid" (4:37–41).

**New-concept candidates:** None (parable queries are carried by `kingdom-of-heaven`, whose lexicon already has "parables of the kingdom").

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 4 tags — under the soft cap. Subdivided in book doc (3 sections) — refinement-eligible.

**Decisions record:**
1. `money-and-possessions` considered (4:19 "the deceitfulness of riches") — application-pass skip stands: one verse inside the parable's explanation.
2. `satan` considered (4:15 "immediately Satan comes and takes away the word") — single verse — not added.
3. `suffering-for-christ` considered (4:17 "When oppression or persecution arises because of the word, immediately they stumble.") — one verse inside the explanation — not added.
4. `power-of-gods-word` considered (the word sown, 4:14–20, 33) — register mismatch: that pack is the word's permanence ("my words will not pass away"), not its sowing and reception, which `obedience-to-the-word` carries here — not added.

## Mark 5 (subdivided: 5:1–20 / 5:21–43)

**Existing tags (book doc):** `pastoral-freedom-from-bondage`; `faith`; `pastoral-prayer-for-healing`; `fear-not`; `sharing-your-faith`; `deliverance-from-demons` (6).

**Applied-tag deltas:**
- No adds or drops — the chapter sits at the soft cap and no unclaimed theme clears the presence bar. KEEP verified: `pastoral-freedom-from-bondage` (5:1–15, the man no chains could bind found "sitting, clothed, and in his right mind"), `faith` (5:34 "Daughter, your faith has made you well."; 5:36 "Don't be afraid, only believe."), `pastoral-prayer-for-healing` (5:22–23 "Please come and lay your hands on her, that she may be made healthy, and live."; 5:27–28), `fear-not` (5:35–36), `sharing-your-faith` (5:19–20 "tell them what great things the Lord has done for you"), `deliverance-from-demons` (5:1–20, "My name is Legion, for we are many.").

**Anchor-extension candidates:**
- `pastoral-prayer-for-healing` | Mark 5:25-34 | "If I just touch his clothes, I will be made well." (5:28); "Daughter, your faith has made you well. Go in peace, and be cured of your disease." (5:34) | proposed weight 0.7 — the pack's sole anchor is Mk 1:40-42; the twelve-year sufferer is the natural second anchor.
- `faith` | Mark 5:34-36 | "Don't be afraid, only believe." (5:36) | proposed weight 0.65.
- (`sharing-your-faith` Mk 5:19 and `deliverance-from-demons` Mk 5:1-15 are already engine anchors — no extension needed.)

**Lexicon candidates:**
- `deliverance-from-demons` | Legion | "my name is legion"; "legion demons"; "demons sent into pigs" (5:9–13).
- `pastoral-prayer-for-healing` | the hem-touch | "woman touched jesus garment"; "woman with the issue of blood"; "if i just touch his clothes" (5:25–34).
- `faith` | the healing word | "your faith has made you well"; "only believe" (5:34, 36).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 6 tags — SOFT CAP reached (no ceiling breach). Subdivided in book doc (2 sections) — refinement-eligible.

**Decisions record:**
1. `mercy` considered (5:19 "how he had mercy on you") — application-pass skip stands: one clause inside `sharing-your-faith`'s verses.
2. `pastoral-grief-and-loss` considered (5:38–39, "weeping, and great wailing" at Jairus's house) — not added: the chapter's substance is the raising ("Talitha cumi!… Girl, I tell you, get up!" 5:41) and the call to faith, not grief-comfort teaching; the mourning is a two-verse scene the narrative overturns. Consistent with the 1(c) register rule.
3. `resurrection` considered (5:41–42, the girl raised) — a raising within the ministry, not the Easter resurrection nor general-resurrection teaching; tagging would be a read-back — not added.

## Mark 6 (subdivided: 6:1–6 / 6:7–13 / 6:14–29 / 6:30–44 / 6:45–52 / 6:53–56)

**Existing tags (book doc):** `sharing-your-faith`; `gods-provision`; `fear-not` (3).

**Applied-tag deltas:**
- ADD `signs-and-wonders` — the chapter is miracle material end to end, including a summary healing scene no other tag carries: "such mighty works come about by his hands" (6:2); "these powers are at work in him" (6:14); the five loaves and two fish with "They all ate and were filled." (6:42); walking on the sea (6:48–51); and Gennesaret, where "as many as touched him were made well." (6:56). Chapter-wide presence, distinct from `gods-provision`'s feeding-specific register.
- KEEP all three existing tags — verified: `sharing-your-faith` (6:7–13, "They went out and preached that people should repent."), `gods-provision` (6:38–44), `fear-not` (6:49–50, "Cheer up! It is I! Don't be afraid.").
- DROP: none.

**Anchor-extension candidates:**
- `gods-provision` | Mark 6:35-44 | "They all ate and were filled. They took up twelve baskets full of broken pieces" (6:42–43) | proposed weight 0.65 — the pack's anchors are all Matthew-6 teaching texts; this adds the enacted-provision narrative.
- `signs-and-wonders` | Mark 6:53-56 | "they laid the sick in the marketplaces and begged him that they might just touch the fringe of his garment; and as many as touched him were made well." (6:56) | proposed weight 0.55.
- (`hardness-of-heart` Mk 6:52 is already that pack's engine anchor — no extension needed.)

**Lexicon candidates:**
- `gods-provision` | the feeding | "feeding of the five thousand"; "five loaves and two fish"; "jesus feeds 5000" (6:38–44).
- `shepherds-and-the-flock` | the shepherdless crowd | "sheep without a shepherd meaning"; "jesus had compassion on the crowd" (6:34 — lexicon lead only; single-verse presence keeps it off the display tags).

**New-concept candidates:** None.

**Decline-overturn proposals:** None — mark.md's declines on this chapter (`rest-for-the-weary` 6:31; `suffering-for-christ` and `honesty` on John's martyrdom 6:17–29) all stand; no new textual evidence.

**Ceiling / refinement flags:** 4 tags — under the soft cap. Subdivided in book doc (6 sections) — refinement-eligible.

**Decisions record:**
1. `hardness-of-heart` considered (6:52 "for they hadn't understood about the loaves, but their hearts were hardened.") — single verse, below the display bar; it is already the pack's engine anchor, so nothing is lost engine-side — not added.
2. `prayer` considered (6:46 "he went up the mountain to pray.") — single verse; unlike 1:35 there is no ratified prior keep here — not added.
3. `divine-judgment` considered (6:11 "it will be more tolerable for Sodom and Gomorrah in the day of judgment than for that city!") — single verse inside the sending instructions — not added.
4. `oaths-and-vows` considered (6:22–26, Herod's rash oath — "for the sake of his oaths… he didn't wish to refuse her" 6:26) — the narrative depicts an oath's deadly consequence but teaches nothing about vow-making itself; theme-witness-with-caveat below the bar — not added, noted as possible per-verse-refinement material.

## Mark 7 (subdivided: 7:1–13 / 7:14–23 / 7:24–30 / 7:31–37)

**Existing tags (book doc):** `worship`; `sin`; `caring-for-aging-parents`; `faith`; `empty-worship`; `deliverance-from-demons` (6).

**Applied-tag deltas:**
- ADD `clean-and-unclean` — the chapter's spine (7:1–23) is the clean/unclean dispute, and Mk 7:14-23 is already this pack's engine anchor while the display tag is missing: the unwashed-hands charge (7:2–5), then "There is nothing from outside of the man that going into him can defile him; but the things which proceed out of the man are those that defile the man." (7:15) and "making all foods clean" (7:19). Distinct register from `sin` (which carries the from-within vice list) — this is the purity-law question itself.
- KEEP all six existing tags — verified: `worship` and `empty-worship` (7:6–7, "This people honors me with their lips, but their heart is far from me. They worship me in vain, teaching as doctrines the commandments of men." — the both-tags pair from the application pass), `sin` (7:20–23, "All these evil things come from within and defile the man."), `caring-for-aging-parents` (7:9–13 Corban, "then you no longer allow him to do anything for his father or his mother"), `faith` (7:25–30, kept per mark.md Decisions 4 — word absent, substance present, ratified), `deliverance-from-demons` (7:24–30, "The demon has gone out of your daughter.").
- DROP: none.

**Anchor-extension candidates:**
- `caring-for-aging-parents` | Mark 7:9-13 | "then you no longer allow him to do anything for his father or his mother, making void the word of God by your tradition" (7:12–13) | proposed weight 0.6 — the pack has no Gospels/Acts anchors; the Corban teaching is Scripture's sharpest support-your-parents text.
- `empty-worship` | Mark 7:6-8 | "They worship me in vain, teaching as doctrines the commandments of men." (7:7) | proposed weight 0.7 — the pack's "vain worship" lexicon phrase is this verse's own vocabulary; current anchors are Lk 18 / Mt 6 / Lk 11 only.
- (`clean-and-unclean` Mk 7:14-23 is already the engine anchor.)

**Lexicon candidates:**
- `clean-and-unclean` | the defilement dispute | "what defiles a person"; "did jesus declare all foods clean"; "eating with unwashed hands" (7:2–23).
- `sin` | the from-within list | "evil comes from the heart"; "out of the heart proceed evil thoughts" (7:20–23).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags — soft cap exceeded by one (each independently clears the bar; no ceiling breach). Subdivided in book doc (4 sections) — refinement-eligible.

**Decisions record:**
1. `gentile-inclusion` (§11.1-adopted; ruling 1(b): apply where it genuinely applies) considered on 7:24–30 — NOT added. The scene enacts one Gentile household's reception — "Let the children be filled first, for it is not appropriate to take the children's bread and throw it to the dogs." (7:27), answered "Yes, Lord. Yet even the dogs under the table eat the children's crumbs." (7:28) — but Mark frames the grant as her saying ("For this saying, go your way. The demon has gone out of your daughter." 7:29), not as inclusion-of-the-nations teaching. Theme-witness-with-caveat; honest-and-empty preferred. ROUTED as supplementary evidence to corpus-blocked roster row 40 (`gentile-inclusion` — primary evidence remains Acts 10–11/15 per that row).
2. `clean-and-unclean` added above the soft cap (6→7) — justified because the chapter's largest single unit was otherwise untagged for its own subject and the id is both engine vocabulary and the anchor's home chapter.
3. `judging-others` considered (7:2, 5 fault-finding) — narrative framing, not the concept's teaching — not added.

## Mark 8 (subdivided: 8:1–10 / 8:11–21 / 8:22–26 / 8:27–33 / 8:34–38)

**Existing tags (book doc):** `gods-provision`; `suffering-for-christ`; `surrender-to-god`; `discipleship` (4).

**Applied-tag deltas:**
- No adds or drops. KEEP verified: `gods-provision` (8:1–9, "They ate and were filled. They took up seven baskets of broken pieces that were left over."; 8:19–21), `suffering-for-christ` (8:34–38, "whoever will lose his life for my sake and the sake of the Good News will save it."), `surrender-to-god` (8:34–37, "let him deny himself, and take up his cross" — signposted reading per mark.md Decisions 8, ratified), `discipleship` (8:34–38).

**Anchor-extension candidates:**
- `discipleship` | Mark 8:34-38 | "Whoever wants to come after me, let him deny himself, and take up his cross, and follow me." (8:34) | proposed weight 0.8 — the pack anchors Mt 16:25-26 but not Mark's fuller call unit.
- `surrender-to-god` | Mark 8:34-37 | "For what does it profit a man to gain the whole world and forfeit his life?" (8:36) | proposed weight 0.65 — the pack anchors the Lk 9:23 / Mt 16:24 parallels; Mark's is absent.
- `gods-provision` | Mark 8:1-9 | "I have compassion on the multitude, because they have stayed with me now three days and have nothing to eat." (8:2) | proposed weight 0.55.

**Lexicon candidates:**
- `surrender-to-god` | the exchange questions | "what does it profit a man to gain the whole world"; "gain the world lose your soul" (8:36–37).
- `suffering-for-christ` | the shame saying | "ashamed of jesus"; "whoever is ashamed of me and my words" (8:38).

**New-concept candidates:** None (the "who do you say that I am" identity family stays motif material — mark.md motif 7 — with no concept home; left to curation's motif feed rather than re-proposed here).

**Decline-overturn proposals:** None — mark.md's decline of `the-cross` on 8:34 stands (the cross there is the disciple's, carried by `suffering-for-christ` and `surrender-to-god`); no new textual evidence.

**Ceiling / refinement flags:** 4 tags — under the soft cap. Subdivided in book doc (5 sections) — refinement-eligible.

**Decisions record:**
1. `hardness-of-heart` considered (8:17 "Is your heart still hardened?") — single verse — not added.
2. `satan` considered (8:33 "Get behind me, Satan! For you have in mind not the things of God, but the things of men.") — single verse; the engine pack already anchors the Matthew parallel (Mt 16:23), so a Mark extension adds little — not added, no extension proposed.
3. `resurrection` considered (8:31 "and be killed, and after three days rise again.") — one clause inside the first passion prediction; tagging Easter here would be read-forward — not added.
4. `faith` considered (8:22–26, the two-stage healing at Bethsaida) — the scene narrates a healing without a faith saying; no tag fits its substance better than none — honest-and-empty preferred.

## Mark 9 (subdivided: 9:1–13 / 9:14–29 / 9:30–32 / 9:33–41 / 9:42–50)

**Existing tags (book doc):** `faith`; `doubt`; `prayer`; `humble-exaltation`; `hell`; `deity-of-christ`; `deliverance-from-demons` (7).

**Applied-tag deltas:**
- No adds or drops — the chapter is one under the ceiling and no unclaimed theme clears the bar. KEEP verified: `faith` (9:23 "If you can believe, all things are possible to him who believes."), `doubt` (9:24 "I believe. Help my unbelief!" — the pack's own engine anchor), `prayer` (9:28–29 "This kind can come out by nothing but by prayer and fasting."), `humble-exaltation` (9:33–37 "If any man wants to be first, he shall be last of all, and servant of all."), `hell` (9:43–48 Gehenna, "where their worm doesn't die, and the fire is not quenched." — the pack's engine anchor), `deity-of-christ` (9:2–7 transfiguration, "This is my beloved Son. Listen to him." — kept per mark.md Decisions 5, ratified; no bearing on the Mark 12 HELD divergence), `deliverance-from-demons` (9:14–29 — engine anchor Mk 9:25-29).

**Anchor-extension candidates:**
- `faith` | Mark 9:23-24 | "If you can believe, all things are possible to him who believes." (9:23) | proposed weight 0.7 — `doubt` anchors 9:23-24 but `faith` itself has no Gospels/Acts anchor.
- `humble-exaltation` | Mark 9:33-37 | "If any man wants to be first, he shall be last of all, and servant of all." (9:35) | proposed weight 0.7 — the pack's only anchor anywhere is Ac 20:19.
- `prayer` | Mark 9:28-29 | "This kind can come out by nothing but by prayer and fasting." (9:29) | proposed weight 0.6.

**Lexicon candidates:**
- `humble-exaltation` | the greatness dispute | "the first shall be last"; "who is the greatest in the kingdom" (9:34–35; note "last of all and servant of all" is already `servanthood`'s lexicon phrase — no duplicate proposed).
- `faith` | the father's plea | "all things are possible to him who believes"; "if you can believe" (9:23).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 7 tags — soft cap exceeded by one (each independently clears the bar; no ceiling breach). Subdivided in book doc (5 sections) — refinement-eligible.

**Decisions record:**
1. `servanthood` on 9:35 — application-pass yield stands (single verse carried by `humble-exaltation`; `servanthood`'s engine anchor Mk 9:35 already preserves it engine-side).
2. `kingdom-of-heaven` on 9:1, 47 — application-pass skip stands (scattered single verses).
3. `heavenly-reward` considered (9:41 "he will in no way lose his reward.") — single verse — not added.
4. `resurrection` considered (9:9–10, 31 rising-from-the-dead clauses) — passion-prediction material, read-forward — not added.
5. `harmony-with-others` considered (9:50 "be at peace with one another.") — single closing clause — not added.

## Mark 10 (subdivided: 10:1–12 / 10:13–16 / 10:17–31 / 10:32–34 / 10:35–45 / 10:46–52)

**Existing tags (book doc):** `the-cross`; `humble-exaltation`; `pastoral-marriage-divorce-teaching`; `godly-marriage`; `heavenly-reward`; `faith`; `kingdom-of-heaven`; `money-and-possessions` (8 — hard ceiling, reached in the 2026-08-25 application pass).

**Applied-tag deltas:**
- No adds (chapter is at the hard ceiling) and no drops. KEEP verified: `the-cross` (10:45 "to give his life as a ransom for many."; 10:32–34), `humble-exaltation` (10:31 "many who are first will be last, and the last first."; 10:42–44), `pastoral-marriage-divorce-teaching` (10:2–12 "What therefore God has joined together, let no man separate."), `godly-marriage` (10:6–9 "God made them male and female… and the two will become one flesh"), `heavenly-reward` (10:21 "you will have treasure in heaven"; 10:29–30), `faith` (10:46–52 "Go your way. Your faith has made you well."), `kingdom-of-heaven` (10:14–15, 23–27), `money-and-possessions` (10:17–27 "It is easier for a camel to go through a needle's eye than for a rich man to enter into God's Kingdom.").

**Anchor-extension candidates:**
- `the-cross` | Mark 10:45 | "For the Son of Man also came not to be served but to serve, and to give his life as a ransom for many." | proposed weight 0.85 — the ransom saying is Mark's atonement key verse; the pack's only Gospels anchor is Jn 1:29.
- `pastoral-marriage-divorce-teaching` | Mark 10:2-12 | "What therefore God has joined together, let no man separate." (10:9) | proposed weight 0.75 — the pack anchors Mt 19:3-9 / Mt 5:31-32; Mark uniquely adds the wife-initiated clause (10:12).
- `godly-marriage` | Mark 10:6-9 | "But from the beginning of the creation, God made them male and female." (10:6) | proposed weight 0.65 — the pack has no Gospels/Acts anchors.
- `money-and-possessions` | Mark 10:17-27 | "How difficult it is for those who have riches to enter into God's Kingdom!" (10:23) | proposed weight 0.7 — the pack anchors only the Luke parallel (Lk 18:18-27).
- `faith` | Mark 10:46-52 | "Go your way. Your faith has made you well." (10:52) | proposed weight 0.6.
- (`servanthood` Mk 10:42-45 is already an engine anchor.)

**Lexicon candidates:**
- `the-cross` | the ransom saying | "ransom for many meaning"; "jesus came to serve not to be served" (10:45).
- `kingdom-of-heaven` | like a child | "receive the kingdom like a little child"; "let the little children come to me" (10:14–15).
- `money-and-possessions` | the rich man's call | "sell everything and give to the poor"; "rich man eternal life" (10:21).
- `mercy` | Bartimaeus's cry | "jesus son of david have mercy on me" (10:47–48 — lexicon lead only; display presence carried by `faith` per the application pass).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 (pre-existing). Subdivided in book doc (6 sections). FLAGGED for the per-verse refinement pass — mark.md Decisions 15 records 11 projected candidates for this chapter; the three yielded there (see Decisions) survive only via engine anchors/per-verse ranges.

**Decisions record:**
1. Application-pass yields re-affirmed, nothing silently dropped: `servanthood` (10:42–45, carried verse-for-verse by `humble-exaltation` and `the-cross`; engine anchor Mk 10:42-45 preserves it), `discipleship` (10:21, 28–31, shared verse-for-verse with `heavenly-reward`; home chs. 1 and 8), `mercy` (10:47–48, carried by `faith`).
2. `eternal-life` (§11.1-adopted) considered — 10:17 "what shall I do that I may inherit eternal life?" and 10:30 "in the age to come eternal life." — two framing verses whose substance is carried by `heavenly-reward` and `money-and-possessions`; at the ceiling this is the broad-duplicating-specific class — not added.
3. `hardness-of-heart` considered (10:5 "For your hardness of heart, he wrote you this commandment.") — single verse — not added.
4. `surrender-to-god` considered (10:21 "come, follow me, taking up the cross.") — one clause inside the rich-man scene, carried by the existing tags there — not added.

## Mark 11 (subdivided: 11:1–11 / 11:12–19 / 11:20–26 / 11:27–33)

**Existing tags (book doc):** `praise`; `prayer`; `faith`; `forgiving-others` (4).

**Applied-tag deltas:**
- ADD `the-house-of-god` — the temple itself is the middle unit's subject: Jesus surveys it (11:11), cleanses it — "he began to throw out those who sold and those who bought in the temple, and overthrew the money changers' tables" (11:15) — and claims its purpose: "Isn't it written, 'My house will be called a house of prayer for all the nations'? But you have made it a den of robbers!" (11:17); the authority challenge happens "walking in the temple" (11:27). The pack ("the temple in the bible") has no Gospels/Acts anchors and this is Mark's temple chapter.
- KEEP all four existing tags — verified: `praise` (11:9–10 "Hosanna! Blessed is he who comes in the name of the Lord!… Hosanna in the highest!"), `prayer` (11:17, 24 "all things whatever you pray and ask for, believe that you have received them, and you shall have them." — 11:24 is already the pack's engine anchor), `faith` (11:22–24 "Have faith in God."), `forgiving-others` (11:25–26 "Whenever you stand praying, forgive, if you have anything against anyone" — 11:25 already the pack's engine anchor).
- DROP: none.

**Anchor-extension candidates:**
- `the-house-of-god` | Mark 11:15-17 | "My house will be called a house of prayer for all the nations" (11:17) | proposed weight 0.6 — the pack has no NT-narrative anchors.
- `faith` | Mark 11:22-24 | "Have faith in God." (11:22); "whoever may tell this mountain, 'Be taken up and cast into the sea,' and doesn't doubt in his heart… he shall have whatever he says." (11:23) | proposed weight 0.65.

**Lexicon candidates:**
- `faith` | mountain-moving faith | "faith that moves mountains"; "say to this mountain be cast into the sea" (11:23).
- `praise` | the entry acclamation | "hosanna meaning"; "hosanna blessed is he who comes in the name of the lord" (11:9–10).
- `prayer` | believing prayer | "believe that you have received"; "whatever you ask in prayer believe" (11:24).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 5 tags — under the soft cap. Subdivided in book doc (4 sections) — refinement-eligible.

**Decisions record:**
1. `empty-worship` considered (11:17 "a den of robbers!") — the charge is commerce corrupting the temple, not vain-worship hypocrisy; substance carried by the new `the-house-of-god` — not added.
2. `divine-judgment` considered (the cursed and withered fig tree, 11:14, 20–21) — the text itself turns the withering into a faith lesson ("Have faith in God." 11:22); reading it as a judgment oracle on Israel is an interpretive frame beyond the plain narrative — not added (CONVENTIONS §6).
3. The "why did jesus curse the fig tree" query family has no vocabulary home; recorded for curation as a lexicon-routing question (which concept should carry the curiosity query to Mark 11 / Matt 21) rather than a single-pericope concept mint.
4. `governing-authorities` considered (11:27–33, the by-what-authority challenge) — "authority" here is Jesus' own, not civil authorities; register mismatch — not added.

## Mark 12 (subdivided: 12:1–12 / 12:13–17 / 12:18–27 / 12:28–34 / 12:35–40 / 12:41–44)

**Existing tags (book doc):** `christ-the-cornerstone`; `loving-others`; `generosity`; `divine-judgment`; `resurrection`; `resurrection-of-the-dead`; `governing-authorities`; `loving-god` (8 — hard ceiling, reached in the 2026-08-25 application pass).

**Applied-tag deltas:**
- No adds (hard ceiling; and see the HELD record) and no drops.
- KEEP-per-ruling: `resurrection` and `resurrection-of-the-dead` — Matt 22's applicable resurrection-dispute tags, carried on Mark 12 under Jesse's 2026-08-25 ruling 1(a) (CONVENTIONS §11(2): the Synoptic parallels harmonize to the Matthew reading; both-tags where each independently clears the bar). Already applied by the 2026-08-25 application pass (mark.md Decisions 15); this sweep re-affirms them with in-chapter evidence: "when they will rise from the dead, they neither marry nor are given in marriage, but are like angels in heaven." (12:25); "He is not the God of the dead, but of the living. You are therefore badly mistaken." (12:27).
- KEEP verified (the other six): `christ-the-cornerstone` (12:10–11 "The stone which the builders rejected was made the head of the corner."), `loving-others` (12:31 "'You shall love your neighbor as yourself.' There is no other commandment greater than these."), `generosity` (12:41–44 "she, out of her poverty, gave all that she had to live on."), `divine-judgment` (12:9 "He will come and destroy the farmers"; 12:40 "These will receive greater condemnation."), `governing-authorities` (12:17 "Give to Caesar the things that are Caesar's, and to God the things that are God's."), `loving-god` (12:29–30, the Shema with all four clauses).

**Anchor-extension candidates:**
- `christ-the-cornerstone` | Mark 12:10-11 | "The stone which the builders rejected was made the head of the corner. This was from the Lord. It is marvelous in our eyes" | proposed weight 0.7 — the pack's only anchor is Ac 4:11.
- `loving-god` | Mark 12:29-30 | "Hear, Israel, the Lord our God, the Lord is one. You shall love the Lord your God with all your heart, with all your soul, with all your mind, and with all your strength." | proposed weight 0.8 — Mark uniquely carries the Shema opening and the strength clause.
- `loving-others` | Mark 12:31 | "'You shall love your neighbor as yourself.' There is no other commandment greater than these." | proposed weight 0.7.
- `governing-authorities` | Mark 12:13-17 | "Give to Caesar the things that are Caesar's, and to God the things that are God's." (12:17) | proposed weight 0.7 — the pack anchors only the Matthew parallel.
- `generosity` | Mark 12:41-44 | "this poor widow gave more than all those who are giving into the treasury" (12:43) | proposed weight 0.75 — the widow's-offering scene is absent from the pack (as is the Lk 21:1-4 parallel).
- `resurrection-of-the-dead` | Mark 12:24-27 | "But about the dead, that they are raised, haven't you read in the book of Moses about the Bush" (12:26) | proposed weight 0.7.

**Lexicon candidates:**
- `generosity` | the widow's offering | "the widow's mite"; "widow's two coins"; "gave all she had to live on" (12:41–44).
- `loving-god` | the Shema | "hear o israel the lord our god the lord is one"; "love god with all your heart soul mind and strength" (12:29–30).
- `resurrection-of-the-dead` | the Sadducee answer | "god of the living not the dead"; "will we be married in heaven" (12:25–27).

**New-concept candidates:** None.

**Decline-overturn proposals:** None. (mark.md's original decline of `resurrection` here was already overturned by Jesse's ruling 1(a) — recorded above, nothing further proposed.)

**Ceiling / refinement flags:** HARD CEILING 8 (pre-existing). Subdivided in book doc (6 sections). FLAGGED for the per-verse refinement pass — mark.md Decisions 15 records 11 projected candidates for this chapter.

**Decisions record:**
1. **HELD — awaiting Jesse: the Mark 12 / Luke 20 `deity-of-christ` divergence (coordinator flag, 2026-08-26).** Matthew 22 carries `deity-of-christ` on the David's-son riddle (22:41–46); Mark 12:35–37 is the exact parallel, untagged here, and Luke 20:41–44 diverges the same way. NOT harmonized by this sweep — ruling 1(a) covered the Sadducee-resurrection dispute only, and the coordinator flags the christology side as still awaiting Jesse's word. Evidence both ways, for the ruling packet:
   - FOR carrying the tag on Mark 12: the pericope is the same riddle Matthew's doc tags — "For David himself said in the Holy Spirit, 'The Lord said to my Lord, "Sit at my right hand, until I make your enemies the footstool of your feet."'" (12:36); "Therefore David himself calls him Lord, so how can he be his son?" (12:37) — and the 1(a) precedent harmonized a same-pericope divergence to the Matthew reading.
   - AGAINST: Mark's text poses the riddle and leaves it unanswered — tagging `deity-of-christ` states as the chapter's teaching what the passage only implies by question; mark.md carries the tag only where the text itself voices sonship (9:7 the voice from the cloud; 15:39 the centurion); and Mark 12 stands at the hard ceiling of 8, so an add would force a §11.6 yield of an existing ratified tag (the yield-order candidate would be `divine-judgment`, the broadest of the eight).
   - No tag change made either way; awaiting Jesse.
2. Ruling-1(a) compliance recorded: the resurrection-dispute harmonization is KEPT as applied 2026-08-25; each of the two tags independently clears the presence bar on 12:18–27 with distinct quotes (Easter-gist witness vs the general resurrection).
3. Application-pass yields re-affirmed, nothing silently dropped: `empty-worship` (12:38–40 pretense carried by `divine-judgment`; ch. 7 is the book's fuller witness), `money-and-possessions` (12:41–44 would duplicate `generosity` with no distinct register), `kingdom-of-heaven` (12:34, single verse).
4. `angels` on 12:25 ("like angels in heaven") — application-pass skip stands: single clause.
5. `care-for-widows` considered (12:40 "those who devour widows' houses"; 12:42–44 the poor widow) — the chapter shows widows wronged and giving but carries no care-for-widows teaching; theme-witness-with-caveat, and the chapter is at the ceiling — not added.

## Mark 13 (not subdivided — the one Mark chapter kept whole; single continuous discourse)

**Existing tags (book doc):** `second-coming`; `suffering-for-christ`; `divine-judgment` (3).

**Applied-tag deltas:**
- ADD `false-prophets` — the discourse opens and closes its warnings with deception: "Be careful that no one leads you astray. For many will come in my name, saying, 'I am he!' and will lead many astray." (13:5–6); "Then if anyone tells you, 'Look, here is the Christ!'… don't believe it. For false christs and false prophets will arise and will show signs and wonders, that they may lead astray, if possible, even the chosen ones." (13:21–22). Five verses of direct warning substance; the pack's engine anchor Mt 24:24 is the exact parallel of 13:22.
- KEEP all three existing tags — verified: `second-coming` (13:26–27 "Then they will see the Son of Man coming in clouds with great power and glory."; 13:32–37 "Watch therefore, for you don't know when the lord of the house is coming"), `suffering-for-christ` (13:9–13 "You will be hated by all men for my name's sake, but he who endures to the end will be saved."), `divine-judgment` (13:2 "There will not be left here one stone on another"; 13:14–20 the unequaled oppression and shortened days).
- DROP: none.

**Anchor-extension candidates:**
- `second-coming` | Mark 13:26-27, 32-37 | "Then they will see the Son of Man coming in clouds with great power and glory." (13:26); "But of that day or that hour no one knows—not even the angels in heaven, nor the Son, but only the Father." (13:32) | proposed weight 0.75 — the pack anchors Matthew's parallels (Mt 24:30, 24:42-44) but not Mark's.
- `suffering-for-christ` | Mark 13:9-13 | "You will stand before rulers and kings for my sake, for a testimony to them." (13:9) | proposed weight 0.7 — the pack's only anchor anywhere is Mt 5:10.
- `false-prophets` | Mark 13:21-23 | "For false christs and false prophets will arise and will show signs and wonders" (13:22) | proposed weight 0.65.
- `power-of-gods-word` | Mark 13:31 | "Heaven and earth will pass away, but my words will not pass away." | proposed weight 0.7 — Mt 24:35, the exact parallel, is already the pack's anchor; Mark's is absent.

**Lexicon candidates:**
- `second-coming` | the unknown hour and the watch command | "no one knows the day or the hour"; "keep watch bible verse"; "be ready for christ's return" (13:32–37). (This confirms mark.md's extension-check note: watchfulness/readiness queries extend `second-coming`'s lexicon — no new concept needed.)
- `suffering-for-christ` | endurance under hatred | "he who endures to the end will be saved"; "hated for my name's sake" (13:13).

**New-concept candidates:** None (watchfulness deliberately routed to the `second-coming` lexicon rather than minted — see above).

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** 4 tags — under the soft cap. Not subdivided (single discourse); no refinement flag.

**Decisions record:**
1. `holy-spirit` considered (13:11 "For it is not you who speak, but the Holy Spirit.") — single verse — not added.
2. `sharing-your-faith` / `nations-and-peoples` considered (13:10 "The Good News must first be preached to all the nations.") — single verse — not added.
3. `prayer` considered (13:18 "Pray that your flight won't be in the winter."; 13:33 "Watch, keep alert, and pray") — clauses inside the watch command — not added.
4. `power-of-gods-word` as display tag considered (13:31) — single verse; anchor-extension proposed instead.
5. Route check against corpus-blocked row 16 (`stewardship`): 13:34's "having left his house and given authority to his servants, and to each one his work" is watchfulness framing, not the talents/manager teaching — NOT routed; that row's Gospels evidence remains Matt 25 / Luke 12 / Luke 16.
6. `angels` on 13:27, 32 — application-pass skip stands (carried inside `second-coming`'s verses).

## Mark 14 (subdivided: 14:1–11 / 14:12–26 / 14:27–31 / 14:32–42 / 14:43–52 / 14:53–65 / 14:66–72)

**Existing tags (book doc):** `lords-supper`; `covenant`; `prayer`; `surrender-to-god`; `pastoral-betrayal-and-marriage-crisis` (5).

**Applied-tag deltas:**
- ADD `betrayal` — the engine's narrative-betrayal concept (distinct register from the pastoral-crisis row already tagged; both-tags ruling): "one of you will betray me—he who eats with me." (14:18); "woe to that man by whom the Son of Man is betrayed! It would be better for that man if he had not been born." (14:21); the bargain (14:10–11) and the kiss — "Whomever I will kiss, that is he. Seize him, and lead him away safely." (14:44). Scripture's defining betrayal narrative, spanning four scenes.
- ADD `passover` — the meal's Passover frame is narrated at length: "It was now two days before the Passover and the Feast of Unleavened Bread" (14:1); "On the first day of unleavened bread, when they sacrificed the Passover, his disciples asked him, 'Where do you want us to go and prepare that you may eat the Passover?'" (14:12), through the prepared upper room (14:13–16). The pack anchors only the Mt/Lk parallels.
- ADD `slander-and-false-accusation` — the trial's false-witness unit: "Now the chief priests and the whole council sought witnesses against Jesus to put him to death, and found none. For many gave false testimony against him, and their testimony didn't agree with each other." (14:55–56), through 14:57–59. Five verses depicting the innocent falsely accused — the concept's core substance.
- KEEP all five existing tags — verified: `lords-supper` (14:22–25 "Take, eat. This is my body."), `covenant` (14:24 "This is my blood of the new covenant, which is poured out for many." — single-verse but ratified prior art; see Decisions 4), `prayer` (14:32–39 "Watch and pray, that you may not enter into temptation."), `surrender-to-god` (14:36 "However, not what I desire, but what you desire."), `pastoral-betrayal-and-marriage-crisis` (14:10–11, 17–21, 43–45, kept per mark.md Decisions 6, ratified).
- DROP: none.

**Anchor-extension candidates:**
- `lords-supper` | Mark 14:22-25 | "Take, eat. This is my body." (14:22); "This is my blood of the new covenant, which is poured out for many." (14:24) | proposed weight 0.75 — the pack anchors Lk 22:19-20 and Mt 26:26-28 but not Mark's institution.
- `betrayal` | Mark 14:43-45 | "Rabbi! Rabbi!" and kissed him. (14:45) | proposed weight 0.7 — the pack anchors Jn/Lk/Mt tellings; Mark's is absent.
- `surrender-to-god` | Mark 14:36 | "Abba, Father, all things are possible to you. Please remove this cup from me. However, not what I desire, but what you desire." | proposed weight 0.75 — the pack anchors the Lk 22:42 parallel only.
- `passover` | Mark 14:12-16 | "when they sacrificed the Passover" (14:12) | proposed weight 0.6.
- `deity-of-christ` | Mark 14:61-62 | "Again the high priest asked him, 'Are you the Christ, the Son of the Blessed?' Jesus said, 'I am. You will see the Son of Man sitting at the right hand of Power, and coming with the clouds of the sky.'" | proposed weight 0.7 — Mt 26:63-64, the exact parallel, is already the pack's anchor; Mark's is absent. (Anchor proposal only — display disposition in Decisions 2.)
- `shepherds-and-the-flock` | Mark 14:27 | "I will strike the shepherd, and the sheep will be scattered." | proposed weight 0.55 — the Mt 26:31 parallel is already the pack's anchor.

**Lexicon candidates:**
- `surrender-to-god` | Gethsemane | "not my will but yours be done"; "take this cup from me" (14:36).
- `prayer` | the watch charge | "watch and pray meaning"; "the spirit is willing but the flesh is weak" (14:38).
- `lords-supper` | the institution | "this is my body this is my blood"; "blood of the new covenant" (14:22–24).

**New-concept candidates:** None.

**Decline-overturn proposals:** None.

**Ceiling / refinement flags:** HARD CEILING 8 reached with the three adds (5 existing + 3). Subdivided in book doc (7 sections) — FLAGGED for the per-verse refinement pass.

**Decisions record:**
1. Three adds took the chapter from 5 to the ceiling; each independently clears the bar on non-overlapping scenes (betrayal spans 14:10–45; passover 14:1, 12–16; false accusation 14:55–59), so no §11.6 yield was triggered — but the chapter is ceiling-flagged for refinement, where per-scene anchoring can carry these more precisely.
2. `deity-of-christ` as a display tag considered (14:61–64, the "I am" before the high priest and the blasphemy condemnation) — NOT added: a two-verse self-disclosure inside the trial scene, and this sweep holds christology additions conservative while the Mark 12 / Luke 20 divergence awaits Jesse's word (different pericope, so not formally HELD, but the same restraint applies; the anchor-extension above preserves it for curation). Reversible on Jesse's word.
3. `temptation` on 14:38 — application-pass skip stands (carried by `prayer`'s verses).
4. `covenant` kept at single-verse presence (14:24) — ratified prior art; noted as the ceiling's thinnest member and the §11.6 yield candidate if Jesse ever wants headroom here.
5. `pastoral-grief-and-loss` considered (14:34 "My soul is exceedingly sorrowful, even to death.") — Jesus' Gethsemane sorrow is not the concept's bereavement register — not added.
6. `messianic-prophecy` considered (14:27 "for it is written, 'I will strike the shepherd…'"; 14:49 "But this is so that the Scriptures might be fulfilled.") — two citation clauses — not added.

## Mark 15 (subdivided: 15:1–15 / 15:16–20 / 15:21–32 / 15:33–41 / 15:42–47)

**Existing tags (book doc):** `the-cross`; `deity-of-christ` (2).

**Applied-tag deltas:**
- No adds or drops — the chapter is deliberately spare in prior art and stays so; every considered candidate fell below the bar (see Decisions). KEEP verified: `the-cross` (15:21–39 — "It was the third hour when they crucified him." 15:25; the darkness 15:33; "My God, my God, why have you forsaken me?" 15:34; "Jesus cried out with a loud voice, and gave up the spirit." 15:37, under "THE KING OF THE JEWS." 15:26), `deity-of-christ` (15:39 "Truly this man was the Son of God!" — kept per mark.md Decisions 5, ratified).

**Anchor-extension candidates:**
- `the-cross` | Mark 15:22-39 | "They brought him to the place called Golgotha" (15:22); "My God, my God, why have you forsaken me?" (15:34); "The veil of the temple was torn in two from the top to the bottom." (15:38) | proposed weight 0.8 — the pack's only Gospels anchor is Jn 1:29; Mark's crucifixion narrative is absent.
- `deity-of-christ` | Mark 15:39 | "Truly this man was the Son of God!" | proposed weight 0.6.

**Lexicon candidates:**
- `the-cross` | the forsaken cry | "my god my god why have you forsaken me"; "eloi eloi lama sabachthani meaning" (15:34).
- `the-cross` | the torn veil | "veil of the temple torn in two"; "what happened when jesus died" (15:38).

**New-concept candidates:** None.

**Decline-overturn proposals:** None — mark.md's decline of `pastoral-hope-in-despair` on 15:34 stands (the chapter depicts forsakenness without articulating hope in it); no new textual evidence.

**Ceiling / refinement flags:** 2 tags — well under the soft cap (honest-and-spare). Subdivided in book doc (5 sections) — refinement-eligible.

**Decisions record:**
1. ROUTED, not duplicated: burial evidence → corpus-blocked roster row 22 (`death-and-burial`, whose note asks the Gospels sweep to route Luke 23 / John 19 burial texts). Mark's parallel is equally strong and is recorded for that row: "Joseph of Arimathaea, a prominent council member… boldly went in to Pilate, and asked for Jesus' body." (15:43); "He bought a linen cloth, and taking him down, wound him in the linen cloth and laid him in a tomb which had been cut out of a rock. He rolled a stone against the door of the tomb." (15:46). No pack proposed; no display tag exists to apply (the id is display-adopted under Theme F, but two burial verses inside the passion narrative sit below the chapter-tag bar — the row is the right home).
2. `envy-and-jealousy` considered (15:10 "For he perceived that for envy the chief priests had delivered him up.") — single verse — not added.
3. `messianic-prophecy` considered (15:28 "The Scripture was fulfilled which says, 'He was counted with transgressors.'") — single citation verse — not added.
4. `slander-and-false-accusation` considered (15:3–5 the many accusations; 15:29–32 the taunts) — the fuller false-witness unit is ch. 14's (tagged there); here two verses of accusing plus mockery already carried by `the-cross`'s span — not added.
5. `governing-authorities` considered (15:1–15, the Pilate scene) — the narrative depicts a governor's verdict but carries no believer-and-authority teaching — not added.

## Mark 16 (subdivided: 16:1–8 / 16:9–13 / 16:14–18 / 16:19–20)

**Existing tags (book doc):** `resurrection`; `sharing-your-faith`; `doubt`; `salvation` (4).

Note: 16:9–20 is treated exactly as the staged WEB carries it — continuous chapter text — with no manuscript claims anywhere in this entry (mark.md Decisions 1, the established convention).

**Applied-tag deltas:**
- No adds or drops. KEEP verified: `resurrection` (16:6 "He has risen! He is not here. See the place where they laid him!"; 16:9–14 the risen Lord seen alive), `sharing-your-faith` (16:15 "Go into all the world and preach the Good News to the whole creation."; 16:20 "They went out and preached everywhere"), `doubt` (16:11 "they disbelieved."; 16:13–14 "he rebuked them for their unbelief and hardness of heart"), `salvation` (16:16 "He who believes and is baptized will be saved; but he who disbelieves will be condemned." — kept per mark.md Decisions 11, ratified).

**Anchor-extension candidates:**
- `resurrection` | Mark 16:6 | "He has risen! He is not here. See the place where they laid him!" | proposed weight 0.85 — the pack anchors Lk 24:5-6 and Mt 28:5-6 but not Mark's empty-tomb announcement.
- `sharing-your-faith` | Mark 16:15 | "Go into all the world and preach the Good News to the whole creation." | proposed weight 0.75 — the Markan commission is absent from the pack (Ac 1:8, Lk 24:46-48, Mk 5:19 present).
- `ascension` | Mark 16:19 | "So then the Lord, after he had spoken to them, was received up into heaven and sat down at the right hand of God." | proposed weight 0.6 — as the staged WEB carries the verse; the pack anchors Ac 1:9-11 / Lk 24:50-53 / Ac 2:33 but not Mark's.
- `salvation` | Mark 16:16 | "He who believes and is baptized will be saved" | proposed weight 0.6.
- `signs-and-wonders` | Mark 16:17-18 | "These signs will accompany those who believe" (16:17) | proposed weight 0.55.

**Lexicon candidates:**
- `sharing-your-faith` | the commission | "go into all the world and preach the gospel"; "the great commission" (16:15).
- `signs-and-wonders` | signs following | "signs will follow those who believe"; "they will take up serpents meaning" (16:17–18).

**New-concept candidates:** None.

**Decline-overturn proposals:** None — mark.md's declines stand: `baptism` on 16:16 (one word inside the clause; narrated at length in ch. 1) and `fear-not` on 16:6 ("Don't be amazed." is not the comfort formula). No new textual evidence.

**Ceiling / refinement flags:** 4 tags — under the soft cap. Subdivided in book doc (4 sections) — refinement-eligible.

**Decisions record:**
1. Manuscript posture: this entry follows mark.md Decisions 1 — the staged WEB carries 16:9–20 as continuous text, and every quote and candidate above simply reflects what that text carries; no manuscript statement is made or implied.
2. `ascension` as display tag considered (16:19) — single verse (the concept's substance, but one verse); thin-single-verse — not added; the anchor-extension preserves it for curation, and Luke 24 / Acts 1 are the display home.
3. `signs-and-wonders` as display tag considered (16:17–18, 20) — three verses inside the commission whose chapter-level substance is carried by `sharing-your-faith` and `salvation`; theme-witness — not added; anchor + lexicon candidates proposed instead.
4. `deliverance-from-demons` considered (16:9 "from whom he had cast out seven demons"; 16:17 "in my name they will cast out demons") — two scattered clauses — not added.
5. `hardness-of-heart` considered (16:14 "he rebuked them for their unbelief and hardness of heart") — single verse, carried by `doubt` — not added.

---

## Survival audit (CONVENTIONS §9) — final, 2026-08-26

Full-file re-read after the last chapter append. Result: **PASS.**

- All 16 chapter entries present, in order Mark 1 → Mark 16, each carrying the 9 legend sections (mechanical check: every section marker counts 17 = 16 entries + 1 legend line; chapter headings count 16).
- Header block intact (date, repo SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e, WEB source 87fd68c, inputs, id note, Mark-specific standing items) — verified unchanged after every append and at this final read.
- Every write to this file was an atomic end-of-file append; the file was never rewritten; no other file under /mnt/project-files was touched by this thread.
- Mark 12 HELD record (deity-of-christ divergence, awaiting Jesse) present in Mark 12 Decisions 1; ruling-1(a) KEEP-per-ruling record present in Mark 12 deltas and Decisions 2.
- Corpus-blocked routes recorded (3): row 11 `blasphemy-against-the-spirit` ← Mark 3:28–30 (Mark 3 Decisions 1); row 40 `gentile-inclusion` supplementary ← Mark 7:24–30 (Mark 7 Decisions 1); row 22 `death-and-burial` ← Mark 15:42–47 (Mark 15 Decisions 1).

**Roll-up counts** (for the coordinator):
- Applied-tag deltas: ADD 10 (`witness-testimony` ch1; `fasting` ch2; `satan` ch3; `signs-and-wonders` ch6; `clean-and-unclean` ch7; `the-house-of-god` ch11; `false-prophets` ch13; `betrayal`, `passover`, `slander-and-false-accusation` ch14) · KEEP 79 (every existing tag re-verified; includes the two Mark 12 KEEP-per-ruling tags) · DROP 0.
- Anchor-extension candidates: 52 across 16 chapters.
- Lexicon candidates: 37 rows.
- New-concept candidates: 2 (`messianic-secret` ch1; `new-wine-and-wineskins` ch2).
- Decline-overturn proposals: 0 (all prior declines stand; the one prior overturn — `resurrection` on Mark 12 — was Jesse's own 2026-08-25 ruling, recorded not proposed).
- Ceiling flags (hard ceiling 8, per-verse refinement pass): Mark 1, Mark 10, Mark 12, Mark 14. At/above soft cap without ceiling: Mark 5 (6), Mark 7 (7), Mark 9 (7). Subdivided (refinement-eligible) 15 of 16 chapters — Mark 13 is the only whole chapter.

**Erratum, disclosed:** quoted WEB spans in this ledger are word-for-word in wording, but quotation-mark glyphs inside quoted spans (e.g. the inner quotes of Mark 1:3, 12:36) are rendered as straight ASCII quotes rather than the WEB's typographic marks; the source text at commit 87fd68c carries typographic punctuation. Since this file is append-only (§9), the note stands here rather than as an in-place fix; any curation pass lifting quotes into fixtures should re-copy from webchap.py output, not from this ledger.
