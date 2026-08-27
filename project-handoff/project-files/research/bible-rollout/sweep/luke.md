# Luke sweep ledger — Layer-3 tag sweep (Gospels+Acts group)

- Date: 2026-08-26
- Thread purpose: Layer-3 tag sweep per the approved whole-Bible coverage plan §5.2
  (/mnt/project-files/plans/2026-08-26-whole-bible-coverage-plan.md), chapter granularity,
  display/research-layer only — no engine changes, no repo changes, no PRs.
- Repo: scripture-search-engine @ origin/main e762d1c629f5b121a2aacc6da57cca6bacc3215e
- Concept library at thread start: 239 packs in ontology/concepts/ + the 161 §11.1 adopted display ids
- Book: Luke (24 chapters)
- WEB text source: full-Bible fixture web-subset.json at commit 87fd68c (sourceSha256 b6f55cc7…),
  printed per chapter via scratchpad webchap.py; every quote below is word-for-word from that output.
  (Note: luke.md's own quotes were verified against the current upstream edition; this ledger's
  quotes are independently taken from the pinned-fixture text.)
- Inputs:
  - Book doc (existing tags = prior art): /mnt/project-files/research/bible-rollout/luke.md
    (final, critic-approved 2026-08-23; tag-application pass 2026-08-25 included — the Tags lines
    swept below are the post-pass state, ch. 13 including the PR #51 `why-god-allows-suffering` add)
  - Concept index: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/concept-index.md
  - Declines & contested calls: /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/declines-contested.md
  - Corpus-blocked roster (route, don't duplicate): /tmp/claude-0/-home-user-scripture-search-engine/bd3477fa-0e9c-5786-b8a8-0f2c78ab6703/scratchpad/corpus-blocked.md
  - Rules: CONVENTIONS.md §5, §9, §11 (presence bar first; soft cap 6 / hard ceiling 8; §11.6
    yield order; honest-and-empty preferred; no later-revelation read-backs; WEB quotes only)
- Id convention note: the book doc's display tags for the 14 personal-crisis packs carry the
  rollout `pastoral-` prefix (e.g. `pastoral-prayer-for-healing`); the engine yaml ids are
  unprefixed (`prayer-for-healing`) — per luke.md's own pastoral-register audit. KEEP/ADD lines
  below use the book doc's display form; anchor/lexicon candidate lines use the engine id.
- Luke 20 standing instruction (from the coordinator): the Sadducee-resurrection side is settled
  by Jesse's 2026-08-25 ruling 1(a) (harmonize to the Matthew reading); the Mark 12 / Luke 20
  `deity-of-christ` divergence is STANDING and awaits Jesse — recorded HELD in Luke 20's
  Decisions record, not harmonized here.
- Ledger discipline: atomic end-of-file appends ONLY, post-write verification, final
  survival audit — CONVENTIONS §9 protocol applies to this file.
- Legend — each chapter entry carries these sections, in order (matching the Genesis ledger):
  1. "## Luke <chapter>" heading (with "(subdivided: <ranges>)" if the book doc subdivides it)
  2. Existing tags (book doc)
  3. Applied-tag deltas (ADD / KEEP / DROP with justification, or "No changes — <reason>.")
  4. Anchor-extension candidates (id | verse range | WEB quote | proposed weight, or "None.")
  5. Lexicon candidates (id | term | 2–3 realistic query phrasings, or "None.")
  6. New-concept candidates (proposed-id | rationale | anchor(s) with WEB quote, or "None.")
  7. Decline-overturn proposals (declined item | NEW textual evidence | argument, or "None.")
  8. Ceiling / refinement flags (soft cap 6 hit / hard ceiling 8 hit / book-doc subdivision — per-verse refinement markers, or "none")
  9. Decisions record (every §11.6 yield, what was yielded and why — no silent drops, or "None.")

## Luke 1 (subdivided: 1:1–4; 1:5–25; 1:26–38; 1:39–56; 1:57–80)
Existing tags (book doc): `gods-faithfulness`, `praise`, `humble-exaltation`, `waiting-for-a-child`, `incarnation`, `covenant`, `angels`, `holy-spirit`
### Applied-tag deltas
- KEEP `gods-faithfulness` — "Blessed is she who believed, for there will be a fulfillment of the things which have been spoken to her from the Lord!" (1:45), and God acts "as he spoke to our fathers" (1:55; also 1:70).
- KEEP `praise` — "My soul magnifies the Lord." (1:46); Zacharias's freed mouth: "he spoke, blessing God" (1:64), "Blessed be the Lord, the God of Israel" (1:68).
- KEEP `humble-exaltation` — "he has looked at the humble state of his servant" (1:48); "He has put down princes from their thrones, and has exalted the lowly." (1:52).
- KEEP `waiting-for-a-child` — "they had no child, because Elizabeth was barren" (1:7), answered by "your request has been heard" (1:13) and "to take away my reproach among men" (1:25). The pack's own anchor is Luke 1:13.
- KEEP `incarnation` — "The Holy Spirit will come on you, and the power of the Most High will overshadow you. Therefore also the holy one who is born from you will be called the Son of God." (1:35, with 1:31–33).
- KEEP `covenant` — "to remember his holy covenant, the oath which he swore to Abraham our father" (1:72–73).
- KEEP `angels` — Gabriel sent twice: "An angel of the Lord appeared to him, standing on the right side of the altar of incense" (1:11); "the angel Gabriel was sent from God to a city of Galilee named Nazareth" (1:26).
- KEEP `holy-spirit` — "He will be filled with the Holy Spirit, even from his mother's womb" (1:15); "The Holy Spirit will come on you" (1:35); Elizabeth "filled with the Holy Spirit" (1:41); Zacharias likewise (1:67).
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- praise | 1:46-55 | "My soul magnifies the Lord." (1:46) | high — the pack has no gospel/acts anchor; the Magnificat is among the most-sought praise texts.
- humble-exaltation | 1:51-53 | "He has put down princes from their thrones, and has exalted the lowly." (1:52) | high — the pack's only gospel/acts anchor is Acts 20:19; the Magnificat states the concept in its classic form.
- gods-faithfulness | 1:45, 54-55 | "Blessed is she who believed, for there will be a fulfillment of the things which have been spoken to her from the Lord!" (1:45) | medium — the pack has no gospel/acts anchor.
- waiting-for-a-child | 1:24-25 | "Thus has the Lord done to me in the days in which he looked at me, to take away my reproach among men." (1:25) | medium — extends the pack's existing Luke 1:13 anchor to the reproach-removed answer.
- covenant | 1:72-73 | "to remember his holy covenant, the oath which he swore to Abraham our father" | medium — the pack's only Luke anchor is 22:20 (new covenant); this is the Abrahamic-covenant remembrance text.
- incarnation | 1:31-35 | "the holy one who is born from you will be called the Son of God" (1:35) | medium — the pack's anchors are Johannine (Jn 1:1, 1:14); this is the annunciation itself.
- mercy | 1:50, 78 | "His mercy is for generations and generations on those who fear him." (1:50); "because of the tender mercy of our God" (1:78) | low — the tag-application pass skipped `mercy` here for lack of a verifiable anchor; the pinned fixture now verifies the quotes, but the chapter sits at ceiling, so this is engine-side only.
### Lexicon candidates
- praise | the magnificat | realistic query phrasings: "the magnificat", "mary's song of praise", "my soul magnifies the lord"
- gods-faithfulness | nothing is impossible with god | realistic query phrasings: "nothing is impossible with god", "with god nothing shall be impossible", "luke 1:37 meaning" — the WEB reads "For nothing spoken by God is impossible." (1:37), so the familiar phrasing is an alternate-wording gap worth measuring.
- humble-exaltation | he has exalted the lowly | realistic query phrasings: "god exalts the humble verse", "he has put down the mighty from their thrones", "god lifts up the lowly"
### New-concept candidates
- ROUTED — corpus-blocked roster row 49 `virgin-birth`: "to a virgin pledged to be married to a man whose name was Joseph" (1:27); "How can this be, seeing I am a virgin?" (1:34); "The Holy Spirit will come on you… Therefore also the holy one who is born from you will be called the Son of God." (1:35). Evidence for the standing-deferral row (Matt 1 / Luke 1 land with the concept at PR-β); no duplicate candidate, no tag.
- ROUTED — corpus-blocked roster row 31 `good-news-for-the-poor`: "He has filled the hungry with good things. He has sent the rich away empty." (1:53, with 1:52). Good-news-register evidence for the blocked row, per its own GOSPELS SWEEP note (Luke 1/4/7/12); no duplicate candidate, no tag.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (5 sections) — marked for per-verse refinement
### Decisions record
- No ADDs: the chapter sits at the hard ceiling with all 8 tags independently clearing the presence bar. Drafter A's cap-dropped candidates (`fear-not` 1:13, 30; `doubt` 1:18–20; `dreams-and-visions` 1:22; `pastoral-god-sees-my-suffering` 1:25; `joy-in-the-lord` 1:14, 44, 47; `salvation` 1:69, 77; `trust-in-god` 1:38, 45) were re-checked against the pinned text: each is honestly present but yields under §11.6 (thin-single-verse or broad-duplicating-specific against the 8 seated main themes). No seated tag is displaced; all remain restorable at per-verse refinement, where the subdivided sections give them exact ranges.
- `salvation` (1:69 "a horn of salvation", 1:77) stays yielded — its weight in ch. 1 is inside `covenant`/`gods-faithfulness` material; recorded so the yield is not silent.
- `mercy` skip upheld at display layer (ceiling), converted to a low-weight anchor-extension candidate above now that the pinned text verifies the quotes.
## Luke 2 (subdivided: 2:1–20; 2:21–40; 2:41–52)
Existing tags (book doc): `incarnation`, `salvation`, `joy-in-the-lord`, `praise`, `worship`, `gods-faithfulness`, `angels`, `holy-spirit`
### Applied-tag deltas
- KEEP `incarnation` — "For there is born to you today, in David's city, a Savior, who is Christ the Lord." (2:11); "She gave birth to her firstborn son. She wrapped him in bands of cloth and laid him in a feeding trough" (2:7).
- KEEP `salvation` — "for my eyes have seen your salvation, which you have prepared before the face of all peoples; a light for revelation to the nations" (2:30–32).
- KEEP `joy-in-the-lord` — "I bring you good news of great joy which will be to all the people." (2:10); the shepherds return "glorifying and praising God" (2:20).
- KEEP `praise` — "a multitude of the heavenly army praising God" (2:13), "Glory to God in the highest" (2:14); Anna "gave thanks to the Lord" (2:38).
- KEEP `worship` — Anna "didn't depart from the temple, worshiping with fastings and petitions night and day" (2:37); Simeon "received him into his arms and blessed God" (2:28).
- KEEP `gods-faithfulness` — "It had been revealed to him by the Holy Spirit that he should not see death before he had seen the Lord's Christ." (2:26), kept: "Now you are releasing your servant, Master, according to your word, in peace" (2:29).
- KEEP `angels` — "an angel of the Lord stood by them, and the glory of the Lord shone around them" (2:9), with the heavenly army (2:13–15).
- KEEP `holy-spirit` — "the Holy Spirit was on him" (2:25), revealed to him "by the Holy Spirit" (2:26), "He came in the Spirit into the temple" (2:27).
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- incarnation | 2:7, 10-12 | "For there is born to you today, in David's city, a Savior, who is Christ the Lord." (2:11) | high — the pack's anchors are Johannine (Jn 1:1, 1:14); this is the nativity narrative itself, the text Christmas queries want.
- praise | 2:13-14 | "Glory to God in the highest, on earth peace, good will toward men." (2:14) | high — no gospel/acts anchor in the pack; a heavily-quoted line.
- joy-in-the-lord | 2:10 | "I bring you good news of great joy which will be to all the people." (2:10) | medium — the pack's only gospel anchor is Jn 15:11.
- angels | 2:8-15 | "Behold, an angel of the Lord stood by them, and the glory of the Lord shone around them, and they were terrified." (2:9) | medium.
- salvation | 2:29-32 | "for my eyes have seen your salvation" (2:30) | low — Simeon's song; the pack is rich in anchors already.
### Lexicon candidates
- incarnation | the christmas story | realistic query phrasings: "the christmas story in the bible", "jesus born in a manger", "no room at the inn" — the WEB reads "feeding trough" (2:7) and "no room for them in the inn", so "manger" queries are an alternate-wording gap worth measuring.
- praise | glory to god in the highest | realistic query phrasings: "glory to god in the highest", "peace on earth good will toward men", "the angels' song at christmas"
- salvation | simeon | realistic query phrasings: "simeon in the bible", "now you are releasing your servant", "a light for revelation to the gentiles"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- No ADDs at ceiling. The tag-application pass's `fasting` skip (2:37 — one clause inside `worship`'s Anna material) re-checked against pinned text and upheld: thin-single-verse under §11.6.
- `passover` considered (2:41, "went every year to Jerusalem at the feast of the Passover") and not added: a single itinerary verse, not the feast's teaching substance — the pack's Luke home is 22:7–15.
- `nations-and-peoples` considered (2:31–32, "before the face of all peoples; a light for revelation to the nations") and not added: two verses inside Simeon's song, carried by `salvation`'s quote; thin-single-verse yield, recorded here rather than dropped silently.
## Luke 3 (subdivided: 3:1–20; 3:21–22; 3:23–38)
Existing tags (book doc): `repentance`, `baptism`, `divine-judgment`, `generosity`, `honesty`, `trinity`
### Applied-tag deltas
- KEEP `repentance` — "preaching the baptism of repentance for remission of sins" (3:3); "Therefore produce fruits worthy of repentance" (3:8).
- KEEP `baptism` — baptizing in the Jordan (3:3, 7, 12, 21), "I indeed baptize you with water, but he comes who is mightier than I… He will baptize you in the Holy Spirit and fire." (3:16).
- KEEP `divine-judgment` — "who warned you to flee from the wrath to come?" (3:7); "Even now the ax also lies at the root of the trees." (3:9); "he will burn up the chaff with unquenchable fire" (3:17).
- KEEP `generosity` — "He who has two coats, let him give to him who has none. He who has food, let him do likewise." (3:11).
- KEEP `honesty` — "Collect no more than that which is appointed to you." (3:13); "Extort from no one by violence, neither accuse anyone wrongfully." (3:14).
- KEEP `trinity` — "Jesus also had been baptized and was praying. The sky was opened, and the Holy Spirit descended in a bodily form like a dove on him; and a voice came out of the sky, saying 'You are my beloved Son. In you I am well pleased.'" (3:21–22).
- ADD `witness-testimony` — the chapter is John the Baptist's witness itself: "The voice of one crying in the wilderness, 'Make ready the way of the Lord. Make his paths straight.'" (3:4), and John's deflection to the mightier one when "all men reasoned in their hearts concerning John, whether perhaps he was the Christ" (3:15–17). The pack's own lexicon carries "voice of one crying in the wilderness" and "testimony of john the baptist"; its anchors are currently Johannine only. Substantial presence: the whole first section (3:1–20) is this witness. Takes the chapter to 7 — beyond the soft cap, inside the ceiling, each tag independently clearing the bar.
### Anchor-extension candidates
- witness-testimony | 3:4-6, 15-17 | "The voice of one crying in the wilderness, 'Make ready the way of the Lord. Make his paths straight.'" (3:4) | medium — Luke's form of the Isaiah witness adds "All flesh will see God's salvation." (3:6).
- baptism | 3:16, 21-22 | "He will baptize you in the Holy Spirit and fire." (3:16) | medium — the pack anchors only Mt 28:19 and Ac 2:38; Jesus' own baptism and the Spirit-and-fire promise are core baptism texts.
- trinity | 3:21-22 | "the Holy Spirit descended in a bodily form like a dove on him; and a voice came out of the sky, saying 'You are my beloved Son.'" (3:22) | medium — the Lukan baptism scene beside the pack's Mt 28:19.
- repentance | 3:3, 8 | "produce fruits worthy of repentance" (3:8) | medium — John's repentance preaching with its what-must-we-do concreteness (3:10–14).
### Lexicon candidates
- repentance | fruits worthy of repentance | realistic query phrasings: "bear fruit in keeping with repentance", "fruits of repentance", "produce fruit worthy of repentance" — the first is ESV-flavored wording against the WEB's "produce fruits worthy of repentance" (3:8), an alternate-wording case.
- baptism | why was jesus baptized | realistic query phrasings: "why was jesus baptized", "baptism of the holy spirit and fire", "john the baptist baptizes jesus"
- witness-testimony | prepare the way of the lord | realistic query phrasings: "prepare the way of the lord", "make his paths straight", "who was john the baptist"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 exceeded (7 after ADD, each tag clearing the bar independently); book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- ADD `witness-testimony` recorded above — the one addition this sweep judged to clear the honest-substantial-presence bar; reversible.
- `contentment` on 3:14 ("Be content with your wages") stays unadded, upholding drafter A's recorded call (item 12): a single clause here, with the fuller contentment teaching tagged on ch. 12.
- The genealogy (3:23–38) carries no tag: a name list is not any concept's teaching substance; honest-and-empty preferred. "the son of Adam, the son of God" (3:38) noted as summary material only.
- `messianic-prophecy` considered for 3:4–6 (Isaiah quoted) and not added: the citation functions as John's-witness material, carried by the ADD above; broad-duplicating-specific yield, recorded.
## Luke 4 (subdivided: 4:1–13; 4:14–30; 4:31–44)
Existing tags (book doc): `resisting-the-devil`, `deity-of-christ`, `pastoral-prayer-for-healing`, `temptation`, `deliverance-from-demons`, `holy-spirit`, `good-news-for-the-poor`
### Applied-tag deltas
- KEEP `resisting-the-devil` — three temptations each turned back with "It is written" (4:4, 8, 12): "Get behind me, Satan! For it is written, 'You shall worship the Lord your God, and you shall serve him only.'" (4:8), until "he departed from him until another time" (4:13).
- KEEP `deity-of-christ` — the demons' own address: "I know who you are: the Holy One of God!" (4:34), "You are the Christ, the Son of God!" (4:41), and the crowd's "What is this word? For with authority and power he commands the unclean spirits, and they come out!" (4:36).
- KEEP `pastoral-prayer-for-healing` — "they begged him to help her" (4:38), and "he laid his hands on every one of them, and healed them" (4:40).
- KEEP `temptation` — "for forty days, being tempted by the devil" (4:2), "When the devil had completed every temptation" (4:13). The engine pack already anchors Lk 4:1-13. Both-tags beside `resisting-the-devil` per the adopted-list register split.
- KEEP `deliverance-from-demons` — "Be silent and come out of him!" (4:35); "Demons also came out of many, crying out" (4:41).
- KEEP `holy-spirit` — "Jesus, full of the Holy Spirit" (4:1), "returned in the power of the Spirit" (4:14), "The Spirit of the Lord is on me, because he has anointed me" (4:18).
- KEEP `good-news-for-the-poor` — "he has anointed me to preach good news to the poor" (4:18), declared "Today, this Scripture has been fulfilled in your hearing." (4:21). Display tag stands (adopted id); engine evidence routed to the corpus-blocked row below.
(No ADD — 7 tags, each clearing the bar; the one considered addition is yielded in the Decisions record.)
### Anchor-extension candidates
- resisting-the-devil | 4:1-13 | "Get behind me, Satan! For it is written, 'You shall worship the Lord your God, and you shall serve him only.'" (4:8) | high — the pack has NO gospel/acts anchor, yet the wilderness temptation resisted verse-by-verse is the classic resisting narrative (the pack's lexicon carries "satan", "the devil").
- prayer-for-healing | 4:38-40 | "all those who had any sick with various diseases brought them to him; and he laid his hands on every one of them, and healed them." (4:40) | medium — the pack's only anchor is Mk 1:40-42.
- holy-spirit | 4:1, 14, 18 | "Jesus returned in the power of the Spirit into Galilee" (4:14) | medium — the pack's lexicon carries "power of the holy spirit"; Luke 4 is its narrative home in the Gospels.
- messianic-prophecy | 4:17-21 | "Today, this Scripture has been fulfilled in your hearing." (4:21) | medium — the pack has no gospel/acts anchor; the Nazareth reading is Jesus' own explicit fulfillment claim (Isaiah 61 read and claimed).
### Lexicon candidates
- temptation | man shall not live by bread alone | realistic query phrasings: "man shall not live by bread alone", "man does not live by bread alone meaning", "what did jesus say to the devil"
- resisting-the-devil | get behind me satan | realistic query phrasings: "get behind me satan meaning", "how did jesus resist the devil", "it is written"
- deity-of-christ | the holy one of god | realistic query phrasings: "the holy one of god meaning", "why did demons recognize jesus"
### New-concept candidates
- ROUTED — corpus-blocked roster row 31 `good-news-for-the-poor`: "The Spirit of the Lord is on me, because he has anointed me to preach good news to the poor. He has sent me to heal the broken hearted, to proclaim release to the captives, recovering of sight to the blind, to deliver those who are crushed" (4:18), "Today, this Scripture has been fulfilled in your hearing." (4:21). This is the row's own named Luke 4:18 evidence; no duplicate candidate.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 exceeded (7 standing); book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- `satan` considered as an 8th tag (the devil is the active adversary of 4:1-13, "Get behind me, Satan!" 4:8) and yielded: broad-duplicating-specific — `resisting-the-devil` + `temptation` already carry the same unit; the pack's Luke anchor home is 22:31-32.
- `messianic-prophecy` considered as a display tag for 4:17-21 and yielded as thin: the fulfillment claim is one verse (4:21) inside the mission-manifesto unit whose substance `good-news-for-the-poor` and `holy-spirit` carry; kept engine-side as the anchor-extension candidate above.
- Tag-application pass's `kingdom-of-heaven` skip (4:43, single verse) re-checked and upheld.
## Luke 5 (subdivided: 5:1–11; 5:12–26; 5:27–39)
Existing tags (book doc): `forgiveness-of-sins`, `repentance`, `faith`, `pastoral-prayer-for-healing`, `discipleship`
### Applied-tag deltas
- KEEP `forgiveness-of-sins` — "Man, your sins are forgiven you." (5:20), defended: "But that you may know that the Son of Man has authority on earth to forgive sins" (5:24).
- KEEP `repentance` — "I have not come to call the righteous, but sinners, to repentance." (5:32).
- KEEP `faith` — "Master, we worked all night and caught nothing; but at your word I will let down the net." (5:5); "Seeing their faith, he said to him, 'Man, your sins are forgiven you.'" (5:19–20).
- KEEP `pastoral-prayer-for-healing` — the leper "fell on his face and begged him, saying, 'Lord, if you want to, you can make me clean.'" (5:12–13); friends lower the paralyzed man "through the tiles with his cot into the middle before Jesus" (5:18–19).
- KEEP `discipleship` — "they left everything, and followed him" (5:11); Levi: "He left everything, and rose up and followed him." (5:28).
- ADD `fasting` — the chapter's closing unit is the fasting question itself: "Why do John's disciples often fast and pray… but yours eat and drink?" (5:33), answered "Can you make the friends of the bridegroom fast while the bridegroom is with them? But the days will come when the bridegroom will be taken away from them. Then they will fast in those days." (5:34–35). The 2026-08-25 tag-application pass skipped this candidate solely for lack of a verifiable anchor quote; the pinned fixture now verifies it word-for-word, so the skip's stated ground is discharged. Takes the chapter to 6 (soft cap).
### Anchor-extension candidates
- forgiveness-of-sins | 5:20-24 | "But that you may know that the Son of Man has authority on earth to forgive sins" (5:24) | high — the pack's only anchor is Ac 13:38-39; this narrative is the Gospels' authority-to-forgive text.
- repentance | 5:31-32 | "I have not come to call the righteous, but sinners, to repentance." (5:32) | medium — a heavily-quoted call-to-repentance saying.
- fasting | 5:33-35 | "Then they will fast in those days." (5:35) | medium — the pack anchors Mt 6:16-18 and Ac 13:2-3; this is the when-and-why text.
- prayer | 5:16 | "But he withdrew himself into the desert and prayed." | low — Jesus' withdrawal habit; single verse, offered for the Jesus-at-prayer pattern (see also 9:18, 28; 11:1).
### Lexicon candidates
- repentance | jesus came to call sinners | realistic query phrasings: "i have not come to call the righteous but sinners", "why did jesus eat with sinners", "jesus friend of sinners"
- fasting | new wine into old wineskins | realistic query phrasings: "new wine in old wineskins meaning", "why don't jesus disciples fast", "parable of the wineskins" — the wineskins saying (5:36–39) sits inside the fasting unit and has no other concept home; flagged for the curator in case it belongs elsewhere.
- prayer | jesus withdrew to pray | realistic query phrasings: "jesus withdrew to pray", "why did jesus pray alone", "jesus prayed in solitary places"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit (after ADD); book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- ADD `fasting` recorded above; reversible. Ground: the earlier skip was anchor-verification-only, not a presence-bar failure, and the pinned text now supplies the quote.
- `deity-of-christ` considered for 5:21 ("Who can forgive sins, but God alone?") and yielded, upholding drafter A's recorded anchoring policy (item 5): the unit's teaching substance is the forgiveness authority, carried by `forgiveness-of-sins`.
- `sharing-your-faith` considered for 5:10 ("From now on you will be catching people alive.") and yielded as thin-single-verse: the call scene's substance is `discipleship`'s leaving-everything; recorded, not silent.
## Luke 6 (subdivided: 6:1–11; 6:12–16; 6:17–49)
Existing tags (book doc): `blessing`, `loving-others`, `generosity`, `sabbath-rest`, `obedience-to-the-word`, `building-on-the-rock`, `judging-others`, `good-news-for-the-poor`
### Applied-tag deltas
- KEEP `blessing` — "Blessed are you who are poor, for God's Kingdom is yours." (6:20), four blessings answered by four woes (6:20–26).
- KEEP `loving-others` — "love your enemies, do good to those who hate you, bless those who curse you, and pray for those who mistreat you" (6:27–28); "As you would like people to do to you, do exactly so to them." (6:31).
- KEEP `generosity` — "Give to everyone who asks you" (6:30); "Give, and it will be given to you: good measure, pressed down, shaken together, and running over" (6:38). The pack already anchors Lk 6:38.
- KEEP `sabbath-rest` — "The Son of Man is lord of the Sabbath." (6:5); "Is it lawful on the Sabbath to do good, or to do harm? To save a life, or to kill?" (6:9).
- KEEP `obedience-to-the-word` — "Why do you call me, 'Lord, Lord,' and don't do the things which I say?" (6:46); the pack already anchors Lk 6:46-49.
- KEEP `building-on-the-rock` — "a man building a house, who dug and went deep and laid a foundation on the rock" (6:48); the pack already anchors Lk 6:46-49.
- KEEP `judging-others` — "Don't judge, and you won't be judged." (6:37), with the speck and the beam (6:41–42); the pack already anchors Lk 6:41-42.
- KEEP `good-news-for-the-poor` — "Blessed are you who are poor, for God's Kingdom is yours." (6:20), "But woe to you who are rich!" (6:24). Display tag stands (adopted id); engine evidence routed below.
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- sabbath-rest | 6:1-11 | "The Son of Man is lord of the Sabbath." (6:5) | medium — the pack's only anchor is Mk 2:27-28; Luke adds the do-good-on-the-Sabbath dispute (6:9).
- blessing | 6:20-26 | "Blessed are you who hunger now, for you will be filled. Blessed are you who weep now, for you will laugh." (6:21) | medium — the pack anchors Mt 5:3-12; Luke's blessings-and-woes form is distinct (second person, with woes).
- heavenly-reward | 6:23, 35 | "your reward is great in heaven" (6:23); "and your reward will be great, and you will be children of the Most High" (6:35) | low — the pack has no gospel/acts anchor.
- vengeance | 6:27-29 | "To him who strikes you on the cheek, offer also the other" (6:29) | medium — the pack anchors Mt 5:38-39; Luke's parallel carries the turn-the-other-cheek wording queries use.
- loving-others | 6:27-35 | "But love your enemies, and do good, and lend, expecting nothing back" (6:35) | low — the pack anchors Mt 5:44-45; Luke's fuller enemy-love unit.
### Lexicon candidates
- vengeance | turn the other cheek | realistic query phrasings: "turn the other cheek meaning", "offer the other cheek", "what did jesus say about getting even"
- obedience-to-the-word | lord lord | realistic query phrasings: "why do you call me lord lord", "calling jesus lord but not obeying", "doing what jesus says"
- taming-the-tongue | out of the abundance of the heart | realistic query phrasings: "out of the abundance of the heart the mouth speaks", "your words reveal your heart" — 6:45; the pack anchors Mt 12:36, same register.
### New-concept candidates
- ROUTED — corpus-blocked roster row 31 `good-news-for-the-poor`: supplementary evidence "Blessed are you who are poor, for God's Kingdom is yours." (6:20) with the woes (6:24–25). The row itself notes the lone Luke 6:20-25 witness is too thin without Luke 1/4/7/12 — this ref supplements those, already routed at chs. 1 and 4.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass's `mercy` ceiling-yield (6:36, one verse inside `loving-others`' range) re-checked and upheld — the pack already anchors Lk 6:36 engine-side, so nothing is lost to search.
- `prayer` considered (6:12, "he continued all night in prayer to God") and yielded as thin-single-verse at a ceiling chapter; the Jesus-at-prayer pattern is carried at chs. 9, 11, 18, 22 and in the ch. 5 lexicon candidate.
- `kingdom-of-heaven` skip (6:20 clause) upheld — carried inside `good-news-for-the-poor` and `blessing` quotes, per the application pass.
## Luke 7 (subdivided: 7:1–10; 7:11–17; 7:18–35; 7:36–50)
Existing tags (book doc): `faith`, `forgiveness-of-sins`, `pastoral-grief-and-loss`, `doubt`
### Applied-tag deltas
- KEEP `faith` — "but say the word, and my servant will be healed" (7:7), drawing "I tell you, I have not found such great faith, no, not in Israel." (7:9); and "Your faith has saved you. Go in peace." (7:50).
- KEEP `forgiveness-of-sins` — "her sins, which are many, are forgiven, for she loved much" (7:47); "Your sins are forgiven." (7:48); "Who is this who even forgives sins?" (7:49).
- KEEP `pastoral-grief-and-loss` — "the only born son of his mother, and she was a widow" (7:12); "When the Lord saw her, he had compassion on her and said to her, 'Don't cry.'" (7:13), the son given back (7:15).
- KEEP `doubt` — "Are you the one who is coming, or should we look for another?" (7:19), met with evidence and a blessing (7:22–23).
- ADD `pastoral-prayer-for-healing` — the centurion's whole opening section is a plea for one dying servant's healing: elders sent "asking him to come and save his servant" (7:3), "they begged him earnestly" (7:4), "say the word, and my servant will be healed" (7:7), and "found that the servant who had been sick was well" (7:10). Personal-crisis register (one servant, one household), consistent with the same tag on chs. 4, 5, 8. Takes the chapter to 5.
- ADD `giving-an-answer` — the engine pack itself anchors Lk 7:19-22: Jesus answers the sent question with evidence, not assertion — "Go and tell John the things which you have seen and heard: that the blind receive their sight, the lame walk, the lepers are cleansed, the deaf hear, the dead are raised up, and the poor have good news preached to them." (7:22). The evidential-answer pattern is the concept's teaching substance and a whole unit of the chapter (7:18–23). Both-tags beside `doubt`. Takes the chapter to 6 (soft cap).
### Anchor-extension candidates
- faith | 7:1-10 | "I tell you, I have not found such great faith, no, not in Israel." (7:9) | high — the `faith` pack has NO gospel/acts anchor, and the centurion is the Gospels' named great-faith narrative.
- grief-and-loss | 7:11-15 | "When the Lord saw her, he had compassion on her and said to her, 'Don't cry.'" (7:13) | medium — the pack's anchors are Johannine; Nain is the Lord-meets-a-griever narrative.
- forgiveness-of-sins | 7:47-50 | "her sins, which are many, are forgiven, for she loved much" (7:47) | medium.
- doubt | 7:19-23 | "Are you the one who is coming, or should we look for another?" (7:19) | medium — the pack's only anchor is Mk 9:23-24; honest uncertainty met with evidence.
### Lexicon candidates
- faith | the centurion | realistic query phrasings: "the centurion's faith", "say the word and my servant will be healed", "i am not worthy for you to come under my roof"
- forgiveness-of-sins | forgiven much loves much | realistic query phrasings: "she loved much because she was forgiven much", "the sinful woman who anointed jesus feet", "forgiven much love much"
- doubt | are you the one | realistic query phrasings: "did john the baptist doubt jesus", "are you the one who is to come", "when a strong believer starts doubting"
### New-concept candidates
- ROUTED — corpus-blocked roster row 31 `good-news-for-the-poor`: "and the poor have good news preached to them" (7:22) — the row's own named Luke 7:22 evidence; no duplicate candidate. (The tag-application pass's display-skip for ch. 7 — single clause — stands; this is engine-side routing only.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit (after ADDs); book doc subdivides this chapter (4 sections) — marked for per-verse refinement
### Decisions record
- Both ADDs recorded above; each reversible. `pastoral-prayer-for-healing` was plainly missing prior art — same register as its uses on chs. 4, 5, 8; `giving-an-answer` follows the engine pack's own Lk 7:19-22 anchor.
- `witness-testimony` considered for 7:24-28 ("Behold, I send my messenger before your face", 7:27) and yielded: the unit is Jesus' testimony ABOUT John, the reverse direction from the pack's witnesses-to-Jesus gist; recorded, not silent.
- `praise` considered for 7:16 ("they glorified God, saying, 'A great prophet has arisen among us!'") and yielded as thin-single-verse crowd response.
## Luke 8 (subdivided: 8:1–3; 8:4–21; 8:22–25; 8:26–39; 8:40–56)
Existing tags (book doc): `obedience-to-the-word`, `faith`, `fear-not`, `pastoral-freedom-from-bondage`, `pastoral-prayer-for-healing`, `deity-of-christ`, `deliverance-from-demons`
### Applied-tag deltas
- KEEP `obedience-to-the-word` — "The seed is the word of God." (8:11); good ground = those who "having heard the word, hold it tightly, and produce fruit with perseverance" (8:15); "My mother and my brothers are these who hear the word of God and do it." (8:21).
- KEEP `faith` — "Where is your faith?" (8:25); "Daughter, cheer up. Your faith has made you well. Go in peace." (8:48); "Don't be afraid. Only believe, and she will be healed." (8:50).
- KEEP `fear-not` — "Don't be afraid. Only believe, and she will be healed." (8:50) at the worst possible news (8:49).
- KEEP `pastoral-freedom-from-bondage` — the man "kept under guard and bound with chains and fetters. Breaking the bonds apart, he was driven by the demon into the desert." (8:29), found "sitting at Jesus' feet, clothed and in his right mind" (8:35).
- KEEP `pastoral-prayer-for-healing` — Jairus "fell down at Jesus' feet and begged him to come into his house" (8:41); the bleeding woman "came behind him and touched the fringe of his cloak" (8:44, 47).
- KEEP `deity-of-christ` — "Who is this then, that he commands even the winds and the water, and they obey him?" (8:25); "Jesus, you Son of the Most High God" (8:28).
- KEEP `deliverance-from-demons` — "Legion," "The demons came out of the man and entered into the pigs" (8:30, 33); the delivered man sent home (8:38–39). Both-tags beside `pastoral-freedom-from-bondage` per the both-tags ruling.
(No ADD — 7 tags standing; the one considered addition is yielded in the Decisions record.)
### Anchor-extension candidates
- fear-not | 8:49-50 | "Don't be afraid. Only believe, and she will be healed." (8:50) | medium — the pack has NO gospel/acts anchor; a much-sought fear-and-faith word at a deathbed.
- faith | 8:22-25, 48 | "He said to them, 'Where is your faith?'" (8:25) | medium — with the ch. 7 centurion candidate, gives the anchorless `faith` pack its Lukan narrative homes.
- obedience-to-the-word | 8:15, 21 | "My mother and my brothers are these who hear the word of God and do it." (8:21) | low — the pack already anchors Lk 6:46-49 and Lk 11:28; the sower's hold-it-tightly is a third witness.
- sharing-your-faith | 8:38-39 | "Return to your house, and declare what great things God has done for you." (8:39) | low — the Lukan parallel of the pack's existing Mk 5:19 anchor.
### Lexicon candidates
- obedience-to-the-word | parable of the sower | realistic query phrasings: "parable of the sower meaning", "the four soils", "seed that fell on good ground"
- faith | jesus calms the storm | realistic query phrasings: "jesus calms the storm", "where is your faith", "peace be still" — the last is Mark's KJV-flavored wording; Luke's WEB reads "rebuked the wind and the raging of the water" (8:24), an alternate-wording case.
- prayer-for-healing | the woman with the issue of blood | realistic query phrasings: "woman with the issue of blood", "she touched the hem of his garment", "who touched me"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 exceeded (7 standing); book doc subdivides this chapter (5 sections) — marked for per-verse refinement
### Decisions record
- `sharing-your-faith` considered as an 8th tag (8:39, "declare what great things God has done for you") and yielded as thin-single-verse; kept engine-side as the anchor-extension candidate above.
- Tag-application pass skips re-checked and upheld: `temptation` (8:13, "fall away in time of temptation" — one clause of the sower interpretation), `money-and-possessions` (8:14, thorns clause), `kingdom-of-heaven` (8:1, 10 scattered).
- `grief-and-loss` considered for 8:52 ("All were weeping and mourning her") and yielded: the scene's substance is the raising, carried by `faith`/`fear-not`; the chapter is not grief counsel.
## Luke 9 (subdivided: 9:1–9; 9:10–17; 9:18–27; 9:28–36; 9:37–45; 9:46–50; 9:51–62)
Existing tags (book doc): `sharing-your-faith`, `gods-provision`, `deity-of-christ`, `suffering-for-christ`, `humble-exaltation`, `prayer`, `deliverance-from-demons`, `discipleship`
### Applied-tag deltas
- KEEP `sharing-your-faith` — "He sent them out to preach God's Kingdom and to heal the sick." (9:2); "They departed and went throughout the villages, preaching the Good News" (9:6); "you go and announce God's Kingdom" (9:60).
- KEEP `gods-provision` — "They ate and were all filled. They gathered up twelve baskets of broken pieces that were left over." (9:17).
- KEEP `deity-of-christ` — Peter's "The Christ of God." (9:20) and the voice from the cloud, "This is my beloved Son. Listen to him!" (9:35).
- KEEP `suffering-for-christ` — "let him deny himself, take up his cross, and follow me. For whoever desires to save his life will lose it, but whoever will lose his life for my sake will save it." (9:23–24, with 9:26).
- KEEP `humble-exaltation` — "For whoever is least among you all, this one will be great." (9:48).
- KEEP `prayer` — "As he was praying alone" (9:18); "As he was praying, the appearance of his face was altered" (9:29).
- KEEP `deliverance-from-demons` — "power and authority over all demons" (9:1); "Jesus rebuked the unclean spirit, healed the boy, and gave him back to his father." (9:42).
- KEEP `discipleship` — the pack itself anchors Lk 9:57-62: "No one, having put his hand to the plow and looking back, is fit for God's Kingdom." (9:62), with 9:23.
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- gods-provision | 9:12-17 | "He took the five loaves and the two fish, and looking up to the sky, he blessed them, broke them, and gave them to the disciples to set before the multitude." (9:16) | medium — the pack's anchors are Mt 6 teaching; the feeding of the five thousand is its densest narrative.
- humble-exaltation | 9:46-48 | "For whoever is least among you all, this one will be great." (9:48) | medium — with the ch. 1 and ch. 14/18 candidates, closes the pack's gospel-anchor gap.
- prayer | 9:18, 28-29 | "As he was praying, the appearance of his face was altered, and his clothing became white and dazzling." (9:29) | low — depicted practice at the chapter's two hinges.
### Lexicon candidates
- discipleship | gain the whole world | realistic query phrasings: "what does it profit a man to gain the whole world", "gain the world but lose your soul", "deny yourself and take up your cross daily"
- gods-provision | feeding of the five thousand | realistic query phrasings: "feeding of the 5000", "five loaves and two fish", "jesus feeds the multitude"
- deity-of-christ | the transfiguration | realistic query phrasings: "the transfiguration of jesus", "jesus transfigured on the mountain", "this is my beloved son listen to him" — "transfiguration" currently appears in no pack's lexicon; flagged for the curator (deity-of-christ is the nearest home; `glory-of-god` is an alternative).
### New-concept candidates
- son-of-man | rationale: no engine id and no §11.1 adopted id serves the heavy query family around Jesus' self-title — the book doc's motif candidate 9 lists 20+ Lukan occurrences; ch. 9 alone carries the suffering (9:22, 44), glory (9:26), and homelessness (9:58) registers | anchors: "The Son of Man must suffer many things, and be rejected by the elders, chief priests, and scribes, and be killed, and the third day be raised up." (9:22); "The foxes have holes and the birds of the sky have nests, but the Son of Man has no place to lay his head." (9:58). Realistic queries: "why does jesus call himself the son of man", "son of man meaning", "what does son of man mean in the bible". Checked against declines (§3) and the corpus-blocked roster: no match; a genuine vocabulary gap. Gist must stay descriptive (the title and its uses), no adjudication of Daniel 7 readings beyond what the text says.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (7 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass skips re-checked and upheld: `kingdom-of-heaven` (mission clauses carried in `sharing-your-faith`), `servanthood` (9:46-48 are `humble-exaltation`'s verses).
- `second-coming` considered for 9:26 ("when he comes in his glory") and yielded as thin-single-verse at a ceiling chapter.
- 9:51 ("he intently set his face to go to Jerusalem") left tagless: the travel-narrative hinge is summary material; no concept's teaching substance. Honest-and-empty preferred.
## Luke 10 (subdivided: 10:1–24; 10:25–37; 10:38–42)
Existing tags (book doc): `sharing-your-faith`, `loving-others`, `joy-in-the-lord`, `humble-exaltation`, `divine-judgment`, `delight-in-the-word`, `deliverance-from-demons`, `loving-god`
### Applied-tag deltas
- KEEP `sharing-your-faith` — seventy sent ahead: "The harvest is indeed plentiful, but the laborers are few. Pray therefore to the Lord of the harvest, that he may send out laborers into his harvest." (10:2), announcing "God's Kingdom has come near to you." (10:9).
- KEEP `loving-others` — "and your neighbor as yourself" (10:27), answered by the Samaritan who "was moved with compassion" (10:33): "Go and do likewise." (10:37).
- KEEP `joy-in-the-lord` — "The seventy returned with joy" (10:17); "rejoice that your names are written in heaven" (10:20); "Jesus rejoiced in the Holy Spirit" (10:21).
- KEEP `humble-exaltation` — "you have hidden these things from the wise and understanding, and revealed them to little children" (10:21).
- KEEP `divine-judgment` — "it will be more tolerable in that day for Sodom than for that city" (10:12); "You, Capernaum, who are exalted to heaven, will be brought down to Hades." (10:15).
- KEEP `delight-in-the-word` — Mary "sat at Jesus' feet and heard his word" (10:39); "Mary has chosen the good part, which will not be taken away from her." (10:42). (Signposted reading per the book doc's Decisions; stands.)
- KEEP `deliverance-from-demons` — "Lord, even the demons are subject to us in your name!" (10:17), reframed by 10:20.
- KEEP `loving-god` — "You shall love the Lord your God with all your heart, with all your soul, with all your strength, and with all your mind" (10:27), "Do this, and you will live." (10:28).
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- loving-others | 10:29-37 | "But a certain Samaritan, as he traveled, came where he was. When he saw him, he was moved with compassion" (10:33) | high — the Good Samaritan is the neighbor-love narrative queries want; the pack anchors Mt 22:39 and Lk 6:31 but not Luke 10.
- loving-god | 10:25-28 | "You shall love the Lord your God with all your heart, with all your soul, with all your strength, and with all your mind" (10:27) | medium — Lukan parallel beside the pack's Mt 22:36-38.
- sharing-your-faith | 10:1-2 | "The harvest is indeed plentiful, but the laborers are few." (10:2) | medium — the pray-for-laborers text has no anchor in the pack.
- satan | 10:18 | "I saw Satan having fallen like lightning from heaven." | low — a much-queried verse; single saying.
### Lexicon candidates
- loving-others | the good samaritan | realistic query phrasings: "parable of the good samaritan", "who is my neighbor", "go and do likewise"
- sharing-your-faith | the harvest is plentiful | realistic query phrasings: "the harvest is plentiful but the workers are few", "pray for laborers for the harvest"
- delight-in-the-word | mary and martha | realistic query phrasings: "mary and martha story", "sitting at the feet of jesus", "one thing is needful" — the last is KJV-flavored; the WEB reads "but one thing is needed" (10:42).
### New-concept candidates
- None. (`eternal-life` — 10:25, "Teacher, what shall I do to inherit eternal life?" — is already an adopted §11.1 id and its standalone-pack question is a recorded re-open note riding salvation.yaml in the corpus-blocked roster's addenda; evidence noted there, no duplicate candidate. Display ADD yielded — see Decisions.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- `eternal-life` (adopted id) considered for 10:25 and yielded: the chapter is at ceiling and the question is one verse whose unit's substance `loving-god`/`loving-others` carry; recorded with the roster-addendum note above, not silent.
- Tag-application pass skips re-checked and upheld: `holy-spirit` (10:21 clause), `mercy` (10:37 inside `loving-others`), `kingdom-of-heaven` (announcement clauses inside `sharing-your-faith`).
- `gods-protection` considered for 10:19 ("Nothing will in any way hurt you.") and yielded as thin-single-verse — and 10:20 immediately redirects the rejoicing; a protection tag would flatten the point.
## Luke 11 (subdivided: 11:1–13; 11:14–28; 11:29–36; 11:37–54)
Existing tags (book doc): `prayer`, `obedience-to-the-word`, `divine-judgment`, `deliverance-from-demons`, `empty-worship`
### Applied-tag deltas
- KEEP `prayer` — "Lord, teach us to pray" (11:1), the model prayer (11:2–4), the friend at midnight rewarded "because of his persistence" (11:8), and "keep asking, and it will be given you. Keep seeking, and you will find. Keep knocking, and it will be opened to you." (11:9).
- KEEP `obedience-to-the-word` — "On the contrary, blessed are those who hear the word of God, and keep it." (11:28); the pack itself anchors Lk 11:28.
- KEEP `divine-judgment` — "The men of Nineveh will stand up in the judgment with this generation, and will condemn it" (11:32, with 11:31), and the prophets' blood "required of this generation" (11:50–51).
- KEEP `deliverance-from-demons` — "He was casting out a demon, and it was mute." (11:14); "But if I by God's finger cast out demons, then God's Kingdom has come to you." (11:20); the returning unclean spirit (11:24–26). The pack anchors Lk 11:14-22.
- KEEP `empty-worship` — "you Pharisees cleanse the outside of the cup and of the platter, but your inward part is full of extortion and wickedness" (11:39); "you tithe mint and rue and every herb, but you bypass justice and God's love" (11:42). The pack anchors Lk 11:42-44.
(No ADD — 5 tags standing; considered additions yielded in the Decisions record.)
### Anchor-extension candidates
- prayer | 11:1-13 | "keep asking, and it will be given you. Keep seeking, and you will find. Keep knocking, and it will be opened to you." (11:9) | high — the pack anchors the Matthean parallels (Mt 6:9-13; Mt 7:7) but not Luke's teach-us-to-pray unit, whose persistent-friend material (11:5-8) exists nowhere else.
- empty-worship | 11:37-41 | "You foolish ones, didn't he who made the outside make the inside also?" (11:40) | low — extends the pack's existing Lk 11:42-44 anchor backward over the cup-and-platter saying.
- repentance | 11:32 | "they repented at the preaching of Jonah; and behold, one greater than Jonah is here." | low.
### Lexicon candidates
- prayer | ask seek knock | realistic query phrasings: "ask seek knock meaning", "keep asking keep seeking keep knocking", "the friend at midnight parable"
- deliverance-from-demons | a house divided | realistic query phrasings: "a house divided against itself cannot stand", "jesus and beelzebul", "the strong man in the bible"
- empty-worship | woe to you pharisees | realistic query phrasings: "woes to the pharisees", "clean the outside of the cup", "straining at gnats" — the last is Matthew's image (Mt 23:24), listed because woe-queries mix the two chapters.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- under soft cap (5); book doc subdivides this chapter (4 sections) — marked for per-verse refinement
### Decisions record
- `tithing` considered for 11:42 ("you tithe mint and rue and every herb") and yielded as thin-single-verse: the engine pack's anchor is the fuller Matthean parallel (Mt 23:23), and the verse's weight here is `empty-worship`'s point.
- `holy-spirit` skip (11:13, single verse) upheld from the tag-application pass — and the engine pack already anchors Lk 11:13, so search loses nothing.
- `light-and-darkness` considered for 11:33-36 (the lamp of the body) and yielded: the pack's gist is Jesus-light-of-the-world (Johannine register), not the inner-eye examination this unit teaches; register mismatch, recorded.
- `justice-and-oppression` considered for 11:42 ("you bypass justice and God's love") and yielded as thin-single-clause inside `empty-worship`'s quote.
## Luke 12 (subdivided: 12:1–12; 12:13–21; 12:22–34; 12:35–48; 12:49–59)
Existing tags (book doc): `fear-not`, `gods-provision`, `trust-in-god`, `contentment`, `heavenly-reward`, `second-coming`, `kingdom-of-heaven`, `stewardship`
### Applied-tag deltas
- KEEP `fear-not` — "don't be afraid of those who kill the body" (12:4); "But the very hairs of your head are all counted. Therefore don't be afraid." (12:7); "Don't be afraid, little flock, for it is your Father's good pleasure to give you the Kingdom." (12:32).
- KEEP `gods-provision` — "Consider the ravens: they don't sow, they don't reap, they have no warehouse or barn, and God feeds them. How much more valuable are you than birds!" (12:24), with the lilies (12:27–28).
- KEEP `trust-in-god` — "don't be anxious for your life, what you will eat, nor yet for your body, what you will wear" (12:22); "your Father knows that you need these things" (12:30).
- KEEP `contentment` — "Beware! Keep yourselves from covetousness, for a man's life doesn't consist of the abundance of the things which he possesses." (12:15), dramatized in the rich fool (12:16–21).
- KEEP `heavenly-reward` — "Make for yourselves purses which don't grow old, a treasure in the heavens that doesn't fail" (12:33); "For where your treasure is, there will your heart be also." (12:34).
- KEEP `second-coming` — "Be like men watching for their lord" (12:36); "be ready also, for the Son of Man is coming in an hour that you don't expect him" (12:40, with 12:46).
- KEEP `kingdom-of-heaven` — "But seek God's Kingdom, and all these things will be added to you." (12:31), the little flock given the Kingdom (12:32).
- KEEP `stewardship` — "Who then is the faithful and wise steward" (12:42); "To whomever much is given, of him will much be required" (12:48). Display tag stands (adopted id); engine evidence routed below.
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- fear-not | 12:4-7, 32 | "Don't be afraid, little flock, for it is your Father's good pleasure to give you the Kingdom." (12:32) | high — the pack has NO gospel/acts anchor; the sparrows-and-hairs and little-flock words are core fear-not texts.
- gods-provision | 12:22-31 | "Consider the ravens: they don't sow, they don't reap, they have no warehouse or barn, and God feeds them." (12:24) | medium — Luke's ravens/lilies wording is distinct from the pack's Mt 6 anchors.
- peace-of-god | 12:22-31 | "don't be anxious for your life, what you will eat, nor yet for your body, what you will wear" (12:22) | medium — Lukan parallel of the pack's Mt 6:25-27 anchor for do-not-be-anxious queries.
- second-coming | 12:35-40 | "Therefore be ready also, for the Son of Man is coming in an hour that you don't expect him." (12:40) | medium — the watching-servants unit is distinct from the pack's Mt 24:42-44.
- heavenly-reward | 12:33-34 | "a treasure in the heavens that doesn't fail, where no thief approaches and no moth destroys" (12:33) | medium — no gospel/acts anchor in the pack.
### Lexicon candidates
- fear-not | more value than many sparrows | realistic query phrasings: "sparrows bible verse", "god counts the hairs on your head", "fear not little flock"
- contentment | the rich fool | realistic query phrasings: "parable of the rich fool", "eat drink and be merry bible", "tonight your soul is required of you"
- second-coming | keep your lamps burning | realistic query phrasings: "keep your lamps burning meaning", "be dressed ready for service", "servants watching for their master"
### New-concept candidates
- ROUTED — corpus-blocked roster row 11 `blasphemy-against-the-spirit`: "Everyone who speaks a word against the Son of Man will be forgiven, but those who blaspheme against the Holy Spirit will not be forgiven." (12:10) — the row's own named Luke 12:10 evidence (with Matt 12 / Mark 3 carrying the fuller unit); no duplicate candidate, no tag (the application pass's thin-presence display-skip stands).
- ROUTED — corpus-blocked roster row 16 `stewardship`: "Who then is the faithful and wise steward, whom his lord will set over his household" (12:42); "To whomever much is given, of him will much be required; and to whom much was entrusted, of him more will be asked." (12:48) — the row's own named Luke 12:41-48 evidence; display tag already applied, engine pack stays routed.
- ROUTED — corpus-blocked roster row 31 `good-news-for-the-poor`: "Sell what you have and give gifts to the needy." (12:33) — the row's named Luke 12:33 evidence; no duplicate candidate.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (5 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass ceiling-yields re-checked and upheld: `empty-worship` (12:1, 56 thin), `holy-spirit` (12:10-12 thin beside the ch. 4 home), `money-and-possessions` (carried by `contentment`/`heavenly-reward`).
- Drafter A's cap-drops re-verified and still yielding: `suffering-for-christ` (12:4-12 — confessing under pressure; honest but the unit's fear-and-confession substance is carried by `fear-not` and the seated eight) and `generosity` (12:33, single verse, routed engine-side to row 31 above). Not silent.
- `hell` skip on 12:5 ("power to cast into Gehenna") upheld — one verse inside the fear-God unit, per drafter A's item 14.
- 12:49-59 (fire, division, interpreting the time) left tag-free: division-in-households and weather-signs have no honest concept home in the current vocabulary; honest-and-empty preferred. Noted as possible per-verse refinement material.
## Luke 13 (subdivided: 13:1–9; 13:10–17; 13:18–21; 13:22–30; 13:31–35)
Existing tags (book doc): `repentance`, `sabbath-rest`, `pastoral-freedom-from-bondage`, `divine-judgment`, `deliverance-from-demons`, `kingdom-of-heaven`, `why-god-allows-suffering`
### Applied-tag deltas
- KEEP `repentance` — "unless you repent, you will all perish in the same way" (13:3, repeated 13:5), with the fig tree's last tended year (13:6–9).
- KEEP `sabbath-rest` — "Ought not this woman, being a daughter of Abraham whom Satan had bound eighteen long years, be freed from this bondage on the Sabbath day?" (13:16, with the ox-and-donkey argument, 13:15).
- KEEP `pastoral-freedom-from-bondage` — "Woman, you are freed from your infirmity." (13:12); "immediately she stood up straight and glorified God" (13:13).
- KEEP `divine-judgment` — the shut door: "Depart from me, all you workers of iniquity." (13:27); "There will be weeping and gnashing of teeth" (13:28); "Behold, your house is left to you desolate." (13:35).
- KEEP `deliverance-from-demons` — "a woman who had a spirit of infirmity eighteen years" (13:11), "whom Satan had bound" (13:16). Both-tags beside `pastoral-freedom-from-bondage`.
- KEEP `kingdom-of-heaven` — "It is like a grain of mustard seed" (13:19), "It is like yeast" (13:21), and the east-west-north-south feast in God's Kingdom (13:29).
- KEEP `why-god-allows-suffering` — "Do you think that these Galileans were worse sinners than all the other Galileans, because they suffered such things? I tell you, no" (13:2–3), the worse-sinners calculus denied and turned to summons. The pack anchors Lk 13:2-5.
(No ADD — 7 tags standing; considered additions yielded in the Decisions record.)
### Anchor-extension candidates
- repentance | 13:1-5 | "unless you repent, you will all perish in the same way" (13:3) | high — the pack's Lukan anchor is 15:7 (joy register); this urgent-warning register is distinct and heavily queried.
- freedom-from-bondage | 13:10-16 | "Woman, you are freed from your infirmity." (13:12) | medium — the pack's only gospel anchor is Jn 8:36; this narrative carries freed-from-bondage language verbatim ("be freed from this bondage", 13:16).
- jesus-the-only-way | 13:23-27 | "Strive to enter in by the narrow door, for many, I tell you, will seek to enter in and will not be able." (13:24) | medium — beside the pack's Mt 7:13-14 narrow-gate anchor; Luke adds the shut-door urgency.
- hell | 13:28 | "There will be weeping and gnashing of teeth when you see Abraham, Isaac, Jacob, and all the prophets in God's Kingdom, and yourselves being thrown outside." | low — the pack's lexicon carries "weeping and gnashing of teeth".
### Lexicon candidates
- repentance | unless you repent | realistic query phrasings: "unless you repent you will all perish", "tower of siloam meaning", "parable of the barren fig tree"
- kingdom-of-heaven | mustard seed and leaven | realistic query phrasings: "parable of the mustard seed", "parable of the leaven", "kingdom of god is like a mustard seed"
- jesus-the-only-way | the narrow door | realistic query phrasings: "strive to enter the narrow door", "are only a few saved", "the narrow way"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 exceeded (7 standing); book doc subdivides this chapter (5 sections) — marked for per-verse refinement
### Decisions record
- `salvation` considered for 13:23 ("Lord, are they few who are saved?") and yielded, upholding drafter B's item 17: the unit's teaching is the striving warning, carried by `repentance` and `divine-judgment`; kept engine-side via the `jesus-the-only-way` candidate above.
- The Jerusalem lament (13:34, "How often I wanted to gather your children together, like a hen gathers her own brood under her wings, and you refused!") has no honest concept home: `lament` documents the composed-lament practice a pray-er takes up (per the §1(c) ruling digest), and no gathering/longing id exists. Left tagless with the quote recorded; the book doc's motif 15 already logs the pattern. Candidate material for per-verse refinement.
- `humble-exaltation` considered for 13:30 ("some who are last who will be first") and yielded as thin-single-verse.
## Luke 14 (subdivided: 14:1–6; 14:7–14; 14:15–24; 14:25–35)
Existing tags (book doc): `humble-exaltation`, `hospitality`, `sabbath-rest`, `surrender-to-god`, `discipleship`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `humble-exaltation` — "go and sit in the lowest place" (14:10); "For everyone who exalts himself will be humbled, and whoever humbles himself will be exalted." (14:11).
- KEEP `hospitality` — "when you make a feast, ask the poor, the maimed, the lame, or the blind" (14:13); the pack itself anchors Lk 14:12-14; the supper's house filled from "the streets and lanes of the city" (14:21–23).
- KEEP `sabbath-rest` — "Is it lawful to heal on the Sabbath?" (14:3), answered with the healing and "Which of you, if your son or an ox fell into a well, wouldn't immediately pull him out on a Sabbath day?" (14:5).
- KEEP `surrender-to-god` — "Whoever doesn't bear his own cross and come after me, can't be my disciple." (14:27); "whoever of you who doesn't renounce all that he has, he can't be my disciple" (14:33). (Signposted renounce-as-surrender reading per the book doc; stands.)
- KEEP `discipleship` — the pack itself anchors Lk 14:25-33: "For which of you, desiring to build a tower, doesn't first sit down and count the cost" (14:28), with the war-counting king (14:31–32). Both-tags beside `surrender-to-god`.
- KEEP `justice-and-oppression` — feasting those who cannot repay: "they don't have the resources to repay you. For you will be repaid in the resurrection of the righteous." (14:14, with 14:13, 21).
(No ADD — at soft cap 6; considered additions yielded in the Decisions record.)
### Anchor-extension candidates
- humble-exaltation | 14:7-11 | "For everyone who exalts himself will be humbled, and whoever humbles himself will be exalted." (14:11) | high — the concept's classic sentence in full narrative setting; the pack's only gospel/acts anchor is Acts 20:19.
- election-and-predestination | 14:24 | "For many are called, but few are chosen." | low — the WEB carries the famous called-vs-chosen sentence here at the great supper's close; the pack has no gospel/acts anchor. Offered to curation only; the §4-neutral gist question on this pack is already a Jesse-flagged backlog item, and this candidate inherits that gate.
### Lexicon candidates
- discipleship | count the cost | realistic query phrasings: "count the cost meaning", "counting the cost of following jesus", "build a tower count the cost"
- hospitality | the great banquet | realistic query phrasings: "parable of the great banquet", "invite those who cannot repay you", "compel them to come in"
- election-and-predestination | many are called few are chosen | realistic query phrasings: "many are called but few are chosen", "what does many are called few are chosen mean"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit; book doc subdivides this chapter (4 sections) — marked for per-verse refinement
### Decisions record
- `salvation` considered for the great-supper parable (14:16-24) and yielded: the parable's teaching substance (excuses refused, the house filled) is carried by `hospitality`/`justice-and-oppression` framing and the invitation register; adding a broad tag at the cap would be broad-duplicating-specific.
- The salt saying (14:34-35) left tagless — no honest concept home ("salt of the earth" queries belong to Mt 5:13's chapter); recorded.
- 14:26 (disregarding family, "yes, and his own life also") stays inside `discipleship`/`surrender-to-god`; no family-concept tag would be honest here.
## Luke 15
Existing tags (book doc): `repentance`, `gods-love`, `pastoral-relapse-and-restoration`, `joy-in-the-lord`
### Applied-tag deltas
- KEEP `repentance` — "there will be more joy in heaven over one sinner who repents, than over ninety-nine righteous people who need no repentance" (15:7, with 15:10), lived out in "Father, I have sinned against heaven and in your sight." (15:18, 21).
- KEEP `gods-love` — "But while he was still far off, his father saw him and was moved with compassion, and ran, fell on his neck, and kissed him." (15:20), answering the frame "This man welcomes sinners, and eats with them." (15:2). (Signposted parable reading per the book doc; stands.)
- KEEP `pastoral-relapse-and-restoration` — "But when he came to himself" (15:17), the turn home, and restoration to sonship: "Bring out the best robe and put it on him. Put a ring on his hand" (15:22), "this, my son, was dead and is alive again" (15:24).
- KEEP `joy-in-the-lord` — "Rejoice with me, for I have found my sheep which was lost!" (15:6), "there is joy in the presence of the angels of God over one sinner repenting" (15:10), "let's eat and celebrate" (15:23).
- ADD `family-reconciliation` — delegated-default ADD, flagged for review: the engine pack itself anchors Lk 15:11-32 (its top-listed anchor), and the chapter substantially depicts a family's rupture and restoration — the demanded inheritance (15:12), the return, the father who "ran, fell on his neck, and kissed him" (15:20), and the father going out to the resentful elder brother too: "Son, you are always with me, and all that is mine is yours." (15:31). Drafter B's item 17 declined this tag ("its teaching substance is God's joy over repentance, not family-estrangement counsel") — that reasoning is quoted here rather than overridden silently; the countervailing fact the drafter did not have is the merged pack's own anchor on exactly these verses, which means estranged-family searches already land here by curation. Reversible either way; takes the chapter to 5.
### Anchor-extension candidates
- relapse-and-restoration | 15:17-24 | "But when he came to himself" (15:17); "this, my son, was dead and is alive again. He was lost and is found." (15:24) | medium — the pack has NO gospel/acts anchor; the prodigal's arc is its defining narrative.
- gods-love | 15:20-24 | "his father saw him and was moved with compassion, and ran, fell on his neck, and kissed him" (15:20) | medium — signposted reading (the father pictures God, per the 15:1-2 frame); curation adjudicates whether the pack claims a parable anchor.
- repentance | 15:17-21 | "I will get up and go to my father, and will tell him, 'Father, I have sinned against heaven and in your sight.'" (15:18) | medium — extends the pack's existing 15:7 anchor from the moral to the narrative.
- shepherds-and-the-flock | 15:4-7 | "wouldn't leave the ninety-nine in the wilderness and go after the one that was lost, until he found it? When he has found it, he carries it on his shoulders, rejoicing." (15:4–5) | medium — the seeking-shepherd image; display tag yielded (Decisions), engine candidate offered.
### Lexicon candidates
- family-reconciliation | the prodigal son | realistic query phrasings: "parable of the prodigal son", "prodigal son meaning", "the lost son parable"
- gods-love | while he was still far off | realistic query phrasings: "the father ran to meet his son", "while he was still a long way off", "does god welcome me back"
- repentance | the lost sheep | realistic query phrasings: "parable of the lost sheep", "leave the ninety nine", "joy in heaven over one sinner who repents"
### New-concept candidates
- None.
### Decline-overturn proposals
- None. (The `family-reconciliation` ADD above is a delta against a drafter's recorded per-book call, not against a §3 decline; the drafter's reasoning is preserved and the call flagged reversible.)
### Ceiling / refinement flags
- none (5 tags; the one chapter of Luke the book doc deliberately keeps whole — its Decisions note a search-addressability argument for splitting out 15:11–32, which the per-verse refinement pass should weigh)
### Decisions record
- ADD `family-reconciliation` recorded above with drafter B's contrary reasoning quoted; reversible delegated default.
- `shepherds-and-the-flock` display tag considered for 15:4-7 and yielded: the chapter's teaching substance is joy over repentance (the frame's own point); the shepherd is the parable's vehicle. Kept engine-side as the anchor-extension candidate above.
- `envy-and-jealousy` considered for the elder brother (15:28-30) and yielded: the brother's anger is depicted, not taught on; character-vehicle rather than teaching substance.
## Luke 16 (subdivided: 16:1–13; 16:14–18; 16:19–31)
Existing tags (book doc): `honesty`, `hell`, `obedience-to-the-word`, `pastoral-marriage-divorce-teaching`, `money-and-possessions`, `justice-and-oppression`
### Applied-tag deltas
- KEEP `honesty` — "He who is faithful in a very little is faithful also in much. He who is dishonest in a very little is also dishonest in much." (16:10), taught off "the dishonest manager" (16:8).
- KEEP `hell` — "In Hades, he lifted up his eyes, being in torment" (16:23); "I am in anguish in this flame" (16:24); "between us and you there is a great gulf fixed" (16:26); "this place of torment" (16:28). (The book doc's Hades-gloss caveat stands: the chapter's own terms, no intermediate-vs-final adjudication.)
- KEEP `obedience-to-the-word` — "They have Moses and the prophets. Let them listen to them." (16:29); "If they don't listen to Moses and the prophets, neither will they be persuaded if one rises from the dead." (16:31).
- KEEP `pastoral-marriage-divorce-teaching` — "Everyone who divorces his wife and marries another commits adultery." (16:18; single-verse anchor kept per the book doc's recorded rationale — direct dominical teaching, one of the concept's defining texts).
- KEEP `money-and-possessions` — "No servant can serve two masters… You aren't able to serve God and Mammon." (16:13); "The Pharisees, who were lovers of money" (16:14); the rich man "clothed in purple and fine linen, living in luxury every day" (16:19).
- KEEP `justice-and-oppression` — Lazarus "full of sores, and desiring to be fed with the crumbs that fell from the rich man's table" (16:20–21), and the reversal: "here he is now comforted and you are in anguish" (16:25).
(No ADD — at soft cap 6.)
### Anchor-extension candidates
- money-and-possessions | 16:10-13, 19-31 | "You aren't able to serve God and Mammon." (16:13) | high — Scripture's densest money chapter; the pack anchors Lk 12 and Lk 18 but not Luke 16.
- hell | 16:22-26 | "In Hades, he lifted up his eyes, being in torment" (16:23) | medium — extends the pack's Synoptic Gehenna anchors with the torment-and-gulf narrative its lexicon queries describe.
- marriage-divorce-teaching | 16:18 | "Everyone who divorces his wife and marries another commits adultery." | medium — Luke's form beside the pack's Mt 19:3-9 and Mt 5:31-32.
- obedience-to-the-word | 16:29-31 | "They have Moses and the prophets. Let them listen to them." (16:29) | medium — Scripture-sufficiency in Jesus' own words.
- power-of-gods-word | 16:17 | "But it is easier for heaven and earth to pass away than for one tiny stroke of a pen in the law to fall." | low — beside the pack's Mt 5:18.
### Lexicon candidates
- money-and-possessions | god and mammon | realistic query phrasings: "you cannot serve both god and money", "what is mammon", "parable of the shrewd manager"
- hell | the rich man and lazarus | realistic query phrasings: "the rich man and lazarus", "abraham's bosom meaning", "a great gulf fixed"
- honesty | faithful in little | realistic query phrasings: "faithful in the little things", "whoever is faithful with little", "faithful in small things bible verse"
### New-concept candidates
- ROUTED — corpus-blocked roster row 16 `stewardship`: the shrewd-manager unit and its faithful-in-little teaching — "Give an accounting of your management" (16:2); "He who is faithful in a very little is faithful also in much." (16:10); "If therefore you have not been faithful in the unrighteous mammon, who will commit to your trust the true riches?" (16:11) — the row's own named Luke 16 evidence; no duplicate candidate, no new display tag (`money-and-possessions` and `honesty` carry the verses).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit; book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass skips re-checked and upheld: `empty-worship` (16:15 single verse — "You are those who justify yourselves in the sight of men, but God knows your hearts."), `kingdom-of-heaven` (16:16 single verse), `mercy` (16:24, the rich man's plea).
- `resurrection-of-the-dead` considered for 16:30-31 ("if one rises from the dead") and yielded: the clause argues Scripture's sufficiency, not resurrection doctrine; carried by `obedience-to-the-word`.
## Luke 17 (subdivided: 17:1–4; 17:5–10; 17:11–19; 17:20–37)
Existing tags (book doc): `forgiving-others`, `faith`, `thanksgiving`, `second-coming`, `remembered-faith-like-a-mustard-seed`, `kingdom-of-heaven`, `servanthood`
### Applied-tag deltas
- KEEP `forgiving-others` — "If he sins against you seven times in the day, and seven times returns, saying, 'I repent,' you shall forgive him." (17:4, with 17:3). The pack anchors Lk 17:3-4.
- KEEP `faith` — "Increase our faith." (17:5), the mustard-seed answer (17:6), and "Your faith has healed you." (17:19).
- KEEP `thanksgiving` — "One of them, when he saw that he was healed, turned back, glorifying God with a loud voice. He fell on his face at Jesus' feet, giving him thanks" (17:15–16); "But where are the nine?" (17:17).
- KEEP `second-coming` — "for as the lightning, when it flashes out of one part under the sky, shines to another part under the sky, so will the Son of Man be in his day" (17:24); the days of Noah and Lot (17:26–30); "Remember Lot's wife!" (17:32).
- KEEP `remembered-faith-like-a-mustard-seed` — the remembered phrase is the chapter's own text: "If you had faith like a grain of mustard seed" (17:6). (The book doc's scope flag — the pack's anchor may be keyed to Mt 17:20 — stands; see anchor candidate below.)
- KEEP `kingdom-of-heaven` — "God's Kingdom doesn't come with observation… for behold, God's Kingdom is within you." (17:20–21). The pack anchors Lk 17:20-21.
- KEEP `servanthood` — "We are unworthy servants. We have done our duty." (17:10). The pack anchors Lk 17:7-10.
(No ADD — 7 tags standing.)
### Anchor-extension candidates
- thanksgiving | 17:11-19 | "turned back, glorifying God with a loud voice. He fell on his face at Jesus' feet, giving him thanks" (17:15–16) | high — the pack has NO gospel/acts anchor; the ten lepers is the classic gratitude narrative.
- remembered-faith-like-a-mustard-seed | 17:6 | "If you had faith like a grain of mustard seed, you would tell this sycamore tree, 'Be uprooted and be planted in the sea,' and it would obey you." | medium — the pack anchors only Mt 17:20; Luke's own carrying of the remembered phrase.
- second-coming | 17:22-25 | "so will the Son of Man be in his day. But first, he must suffer many things and be rejected by this generation." (17:24–25) | medium — range chosen to stop before 17:26-30, which `divine-judgment` already anchors engine-side (avoiding same-refs-to-two-packs).
### Lexicon candidates
- thanksgiving | the ten lepers | realistic query phrasings: "the ten lepers", "where are the nine", "the one leper who returned to thank jesus"
- kingdom-of-heaven | the kingdom of god is within you | realistic query phrasings: "the kingdom of god is within you meaning", "the kingdom comes without observation"
- second-coming | as in the days of noah | realistic query phrasings: "as in the days of noah", "remember lot's wife meaning", "one will be taken and the other left" — the taken/left phrasing is often typed as a rapture query; routing it to `second-coming` rather than `caught-up-together` avoids adjudicating the passage's referent, flagged for the curator.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 exceeded (7 standing); book doc subdivides this chapter (4 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass's `mercy` skip (17:13, "Jesus, Master, have mercy on us!") re-checked and upheld — one cry, carried inside `thanksgiving`'s narrative.
- 17:1-2 (stumbling blocks, the millstone) left tagless: no id in the vocabulary carries the causing-others-to-stumble register; noted as raw material for the shared gap log's stewards rather than a new-concept candidate here, since a single two-verse unit doesn't clear the measured-gap bar.
- `surrender-to-god` considered for 17:33 ("Whoever seeks to save his life loses it") and yielded as thin-single-verse inside the second-coming discourse; the saying's tagged home is 9:23-24.
## Luke 18 (subdivided: 18:1–8; 18:9–14; 18:15–17; 18:18–30; 18:31–34; 18:35–43)
Existing tags (book doc): `prayer`, `humble-exaltation`, `justification-by-faith`, `salvation`, `faith`, `pastoral-refuge-and-justice`, `kingdom-of-heaven`, `money-and-possessions`
### Applied-tag deltas
- KEEP `prayer` — "they must always pray and not give up" (18:1; the pack anchors Lk 18:1), the widow's "continual coming" (18:5), and two men praying in the temple (18:10–13).
- KEEP `humble-exaltation` — "for everyone who exalts himself will be humbled, but he who humbles himself will be exalted" (18:14).
- KEEP `justification-by-faith` — "God, be merciful to me, a sinner!" (18:13); "this man went down to his house justified rather than the other" (18:14).
- KEEP `salvation` — "Then who can be saved?" (18:26); "The things which are impossible with men are possible with God." (18:27).
- KEEP `faith` — "when the Son of Man comes, will he find faith on the earth?" (18:8); "Receive your sight. Your faith has healed you." (18:42).
- KEEP `pastoral-refuge-and-justice` — "Defend me from my adversary!" (18:3); "Won't God avenge his chosen ones who are crying out to him day and night" (18:7). (Parable-vehicle flag per the book doc stands.)
- KEEP `kingdom-of-heaven` — "Allow the little children to come to me… for God's Kingdom belongs to such as these." (18:16); "How hard it is for those who have riches to enter into God's Kingdom!" (18:24). The pack anchors Lk 18:16-17.
- KEEP `money-and-possessions` — "Sell all that you have and distribute it to the poor." (18:22); "it is easier for a camel to enter in through a needle's eye" (18:25). The pack anchors Lk 18:18-27.
(No ADD — chapter is at the hard ceiling of 8.)
### Anchor-extension candidates
- justification-by-faith | 18:9-14 | "this man went down to his house justified rather than the other" (18:14) | high — the pack has NO gospel/acts anchor; this parable is its most direct narrative anchor in Scripture.
- refuge-and-justice-for-the-oppressed | 18:1-8 | "Won't God avenge his chosen ones who are crying out to him day and night" (18:7) | medium — the pack has no gospel/acts anchor; parable-vehicle caveat carried.
- humble-exaltation | 18:14 | "for everyone who exalts himself will be humbled, but he who humbles himself will be exalted" | medium — pairs with the 14:11 candidate.
- prayer-for-healing | 18:35-43 | "He cried out, 'Jesus, you son of David, have mercy on me!'… 'Lord, that I may see again.'" (18:38, 41) | medium — persistent plea answered; the pack's only anchor is Mk 1:40-42.
- salvation | 18:26-27 | "The things which are impossible with men are possible with God." (18:27) | medium.
- messianic-prophecy | 18:31 | "all the things that are written through the prophets concerning the Son of Man will be completed" | low.
### Lexicon candidates
- prayer | the persistent widow | realistic query phrasings: "parable of the persistent widow", "always pray and never give up", "does god hear persistent prayer"
- justification-by-faith | the pharisee and the tax collector | realistic query phrasings: "parable of the pharisee and the tax collector", "god be merciful to me a sinner", "what does justified mean in the bible"
- salvation | camel through the eye of a needle | realistic query phrasings: "camel through the eye of a needle meaning", "who then can be saved", "with god all things are possible" — the last is Matthew's wording (WEB Luke reads "The things which are impossible with men are possible with God.", 18:27), an alternate-wording case.
### New-concept candidates
- None. (`eternal-life` appears again — 18:18 "what shall I do to inherit eternal life?", 18:30 "in the world to come, eternal life" — evidence noted toward the salvation.yaml re-open record, as at ch. 10; chapter at ceiling, no display ADD.)
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit; book doc subdivides this chapter (6 sections) — marked for per-verse refinement
### Decisions record
- Tag-application pass skips re-checked and upheld: `discipleship` (18:28-30 — verses shared with `salvation`/`money-and-possessions`), `empty-worship` (18:9-14 carried by `humble-exaltation`/`justification-by-faith`), `mercy` (18:13 — and the pack already anchors Lk 18:13 engine-side).
- `second-coming` considered for 18:8b ("when the Son of Man comes, will he find faith on the earth?") and yielded as thin-single-clause inside `faith`'s quote.
- 18:31-34 (third passion prediction) left to summary material: prediction texts are tagged where the passion happens (chs. 22–24); `messianic-prophecy` kept engine-side above.
## Luke 19 (subdivided: 19:1–10; 19:11–27; 19:28–40; 19:41–44; 19:45–48)
Existing tags (book doc): `salvation`, `repentance`, `work-and-diligence`, `praise`, `divine-judgment`
### Applied-tag deltas
- KEEP `salvation` — "Today, salvation has come to this house" (19:9); "For the Son of Man came to seek and to save that which was lost." (19:10).
- KEEP `repentance` — Zacchaeus's about-face in deeds: "half of my goods I give to the poor. If I have wrongfully exacted anything of anyone, I restore four times as much." (19:8). (Signposted substance-not-word reading per the book doc; stands.)
- KEEP `work-and-diligence` — "Conduct business until I come." (19:13); "Well done, you good servant! Because you were found faithful with very little, you shall have authority over ten cities." (19:17).
- KEEP `praise` — "the whole multitude of the disciples began to rejoice and praise God with a loud voice" (19:37), "Blessed is the King who comes in the name of the Lord!" (19:38), "if these were silent, the stones would cry out" (19:40).
- KEEP `divine-judgment` — "bring those enemies of mine who didn't want me to reign over them here, and kill them before me" (19:27), and the sentence over Jerusalem: "They will not leave in you one stone on another, because you didn't know the time of your visitation." (19:44).
- ADD `the-house-of-god` — the temple-cleansing unit's own point: "It is written, 'My house is a house of prayer,' but you have made it a 'den of robbers'!" (19:46), with Jesus then "teaching daily in the temple" (19:47). The pack ("the house of god; house of the lord; the temple in the bible") has no gospel/acts anchor; the presence is a whole unit, not a passing touch. Takes the chapter to 6 (soft cap).
### Anchor-extension candidates
- salvation | 19:9-10 | "For the Son of Man came to seek and to save that which was lost." (19:10) | high — Luke's mission-statement verse, heavily queried, absent from the pack.
- praise | 19:37-40 | "Blessed is the King who comes in the name of the Lord! Peace in heaven, and glory in the highest!" (19:38) | medium — the triumphal-entry acclamation.
- work-and-diligence | 19:12-26 | "Because you were found faithful with very little, you shall have authority over ten cities." (19:17) | medium — the pack has no gospel/acts anchor.
- the-house-of-god | 19:45-46 | "My house is a house of prayer" (19:46) | medium — stands or falls with the ADD above.
### Lexicon candidates
- salvation | zacchaeus | realistic query phrasings: "zacchaeus story", "the son of man came to seek and save the lost", "jesus and zacchaeus"
- work-and-diligence | parable of the minas | realistic query phrasings: "parable of the ten minas", "well done good servant", "parable of the talents in luke" — the last is Matthew's parallel's name, an alternate-wording case queries actually type.
- praise | the stones would cry out | realistic query phrasings: "if these were silent the stones would cry out", "triumphal entry of jesus", "palm sunday bible passage" — Luke's account has no palm branches; the query still targets this passage.
### New-concept candidates
- ROUTED — corpus-blocked roster row 16 `stewardship`: supplementary evidence — the minas parable, "He called ten servants of his and gave them ten mina coins, and told them, 'Conduct business until I come.'" (19:13) beside the row's named Matt 25 / Luke 12 / Luke 16 texts; no duplicate candidate (display substance here is carried by `work-and-diligence`).
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit (after ADD); book doc subdivides this chapter (5 sections) — marked for per-verse refinement
### Decisions record
- ADD `the-house-of-god` recorded above; reversible.
- Tag-application pass skips re-checked and upheld: `money-and-possessions` (19:13-26 carried by `work-and-diligence`), `justice-and-oppression` (19:8 inside `repentance`), `kingdom-of-heaven` (19:11 single verse).
- Drafter B's item-17 yield of `generosity` (19:8, one verse) re-verified and upheld; the verse's weight stays in `repentance`.
- Jesus weeping over the city (19:41) noted again as homeless prophetic-lament material (see ch. 13 Decisions); `divine-judgment` carries the oracle's content.
## Luke 20 (subdivided: 20:1–8; 20:9–18; 20:19–26; 20:27–40; 20:41–44; 20:45–47)
Existing tags (book doc): `christ-the-cornerstone`, `divine-judgment`, `honesty`, `resurrection`, `resurrection-of-the-dead`, `governing-authorities`
### Applied-tag deltas
- KEEP `christ-the-cornerstone` — "The stone which the builders rejected was made the chief cornerstone" (20:17), with the stone that breaks and crushes (20:18).
- KEEP `divine-judgment` — "He will come and destroy these farmers, and will give the vineyard to others." (20:16); scribes who "for a pretense make long prayers. These will receive greater condemnation." (20:47).
- KEEP `honesty` — "sent out spies, who pretended to be righteous, that they might trap him in something he said" (20:20); "who devour widows' houses, and for a pretense make long prayers" (20:47).
- KEEP `resurrection` — per Jesse's 2026-08-25 ruling 1(a) (CONVENTIONS §11(2)): the Synoptic Sadducee-dispute parallels harmonize to the Matthew reading, and Luke 20 carries Matt 22's applicable resurrection-dispute tags. Anchor: "But that the dead are raised, even Moses showed at the bush… Now he is not the God of the dead, but of the living, for all are alive to him." (20:37–38). Applied 2026-08-25 per the book doc's tag-application record; this sweep confirms it standing.
- KEEP `resurrection-of-the-dead` — the ruling's both-tags companion, independently clearing the bar on the same dispute: "those who are considered worthy to attain to that age and the resurrection from the dead neither marry nor are given in marriage. For they can't die any more… being children of the resurrection." (20:35–36). Both-tags beside `resurrection` per §11(2).
- KEEP `governing-authorities` — "Is it lawful for us to pay taxes to Caesar, or not?" (20:22); "Then give to Caesar the things that are Caesar's, and to God the things that are God's." (20:25).
(No ADD — 6 tags at soft cap; the chapter's one live candidate is HELD, see Decisions.)
### Anchor-extension candidates
- christ-the-cornerstone | 20:9-18 | "The stone which the builders rejected was made the chief cornerstone" (20:17) | medium — the pack's only anchor is Ac 4:11; Luke's vineyard-parable setting supplies the narrative frame.
- resurrection-of-the-dead | 20:35-38 | "he is not the God of the dead, but of the living, for all are alive to him" (20:38) | medium — the book doc's own extension-check note (third witness with Matthew B and Mark) that general-resurrection / life-after-death queries want this dispute text.
- governing-authorities | 20:21-26 | "Then give to Caesar the things that are Caesar's, and to God the things that are God's." (20:25) | low — Luke's wording beside the pack's Mt 22:15-22.
### Lexicon candidates
- resurrection-of-the-dead | god of the living | realistic query phrasings: "god of the living not of the dead", "will there be marriage in heaven", "sadducees question jesus about the resurrection"
- christ-the-cornerstone | the wicked tenants | realistic query phrasings: "parable of the wicked tenants", "parable of the vineyard owner's son"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit; book doc subdivides this chapter (6 sections) — marked for per-verse refinement
### Decisions record
- **Ruling 1(a) applied and confirmed:** the Sadducee-resurrection side of the Synoptic divergence is settled — Luke 20 carries `resurrection` + `resurrection-of-the-dead` (Matt 22's applicable resurrection-dispute pair, per the 2026-08-25 tag-application record §2). Nothing further from that ruling remains unapplied on this chapter.
- **HELD — awaiting Jesse: the STANDING Mark 12 / Luke 20 `deity-of-christ` divergence.** Not harmonized by this sweep (per the coordinator's standing instruction: ruling 1(a) covers the resurrection dispute only; no christology tag beyond it is harmonized on sweep authority). The evidence, both ways:
  - FOR tagging: the David's-son riddle — "David himself says in the book of Psalms, 'The Lord said to my Lord, "Sit at my right hand, until I make your enemies the footstool of your feet."' David therefore calls him Lord, so how is he his son?" (20:42–44) — presses that the Christ is more than David's son; Matthew's doc tags `deity-of-christ` on the Matt 22 parallel, and the ruling's harmonize-to-Matthew logic could be read to extend here.
  - AGAINST tagging: the riddle is left unanswered in Luke's text (drafter B's stricter reading, book doc item 14); Luke 20 itself never states the answer, Luke's centurion says "a righteous man" (23:47) where Matthew/Mark have "Son of God", and Mark 12's doc withheld the tag on the same unit — so the divergence is a deliberate, recorded cross-book judgment call, not an oversight.
  - Status: HELD — recorded for Jesse's word; whichever way he rules, the change is a display-tag edit on Mark 12 and/or Luke 20 plus this ledger's follow-up, nothing engine-side.
- Tag-application pass's `empty-worship` skip (20:46-47 — carried by `honesty`/`divine-judgment`, with ch. 11 the fuller unit) re-checked and upheld.
- `humble-exaltation` considered for 20:46 (scribes loving best seats) and yielded: depicted vice, not the concept's exaltation teaching; carried by `honesty`.
## Luke 21 (subdivided: 21:1–4; 21:5–24; 21:25–38)
Existing tags (book doc): `generosity`, `suffering-for-christ`, `second-coming`, `divine-judgment`
### Applied-tag deltas
- KEEP `generosity` — "this poor widow put in more than all of them, for all these put in gifts for God from their abundance, but she, out of her poverty, put in all that she had to live on." (21:3–4).
- KEEP `suffering-for-christ` — "they will lay their hands on you and will persecute you, delivering you up to synagogues and prisons, bringing you before kings and governors for my name's sake. It will turn out as a testimony for you." (21:12–13); "You will be hated by all men for my name's sake." (21:17); "By your endurance you will win your lives." (21:19).
- KEEP `second-coming` — "Then they will see the Son of Man coming in a cloud with power and great glory." (21:27); "look up and lift up your heads, because your redemption is near" (21:28); "be watchful all the time, praying" (21:36).
- KEEP `divine-judgment` — "there will not be left here one stone on another" (21:6); "For these are days of vengeance, that all things which are written may be fulfilled." (21:22); "Jerusalem will be trampled down by the Gentiles" (21:24).
(No ADD — 4 tags; considered additions yielded in the Decisions record. Honest-and-lean preferred.)
### Anchor-extension candidates
- generosity | 21:1-4 | "she, out of her poverty, put in all that she had to live on" (21:4) | medium — the widow's-mite narrative; the pack's anchors are sayings (Ac 20:35, Lk 6:38, Mt 5:42), not this scene.
- suffering-for-christ | 21:12-19 | "By your endurance you will win your lives." (21:19) | medium — the pack's only anchor is Mt 5:10; this is the Gospels' fullest persecution-forewarning unit.
- second-coming | 21:25-28 | "look up and lift up your heads, because your redemption is near" (21:28) | medium — Luke's redemption-near summons is distinct from the pack's Mt 24:30.
- power-of-gods-word | 21:33 | "Heaven and earth will pass away, but my words will by no means pass away." | low — Luke's form beside the pack's Mt 24:35 anchor.
### Lexicon candidates
- generosity | the widow's mite | realistic query phrasings: "the widow's mite", "the widow's offering", "giving out of poverty"
- second-coming | your redemption is near | realistic query phrasings: "look up your redemption draws near", "signs in the sun moon and stars", "the fig tree parable end times"
- suffering-for-christ | hated for my name's sake | realistic query phrasings: "hated because of jesus", "persecution before the end times", "by your endurance you will gain your lives"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- under soft cap (4); book doc subdivides this chapter (3 sections) — marked for per-verse refinement
### Decisions record
- Drafter B's item-17 yields re-verified against the pinned text and upheld: `wisdom-from-god` (21:15, "I will give you a mouth and wisdom which all your adversaries will not be able to withstand" — two verses inside the persecution unit) and `gods-protection` (21:18, "And not a hair of your head will perish." — sits directly beside "They will cause some of you to be put to death.", 21:16; a protection tag would flatten the tension).
- `false-prophets` considered for 21:8 ("many will come in my name, saying, 'I am he'") and yielded as thin-single-verse; the pack's fuller anchor is Mt 24:24.
- `power-of-gods-word` considered as a display ADD (21:33) and yielded as thin-single-verse; kept engine-side above.
- `care-for-widows` checked and not applicable: the widow gives; no one cares for her here. Recorded to forestall a lexicon-driven misroute.
## Luke 22 (subdivided: 22:1–6; 22:7–13; 22:14–23; 22:24–30; 22:31–38; 22:39–46; 22:47–53; 22:54–62; 22:63–71)
Existing tags (book doc): `lords-supper`, `covenant`, `prayer`, `surrender-to-god`, `pastoral-betrayal-and-marriage-crisis`, `pastoral-relapse-and-restoration`, `servanthood`
### Applied-tag deltas
- KEEP `lords-supper` — "This is my body which is given for you. Do this in memory of me." (22:19), the cup after supper (22:20). The pack anchors Lk 22:19-20.
- KEEP `covenant` — "This cup is the new covenant in my blood, which is poured out for you." (22:20). The pack anchors Lk 22:20.
- KEEP `prayer` — "Pray that you don't enter into temptation." (22:40, repeated 22:46); "he knelt down and prayed" (22:41); "Being in agony, he prayed more earnestly." (22:44); "but I prayed for you, that your faith wouldn't fail" (22:32).
- KEEP `surrender-to-god` — "Father, if you are willing, remove this cup from me. Nevertheless, not my will, but yours, be done." (22:42). The pack anchors Lk 22:42.
- KEEP `pastoral-betrayal-and-marriage-crisis` — "Satan entered into Judas" and the bargain (22:3–6); "the hand of him who betrays me is with me on the table" (22:21); "Judas, do you betray the Son of Man with a kiss?" (22:48). (Marriage facet absent, stated per the book doc.)
- KEEP `pastoral-relapse-and-restoration` — the foretold fall and the promised turn: "You, when once you have turned again, establish your brothers." (22:32); the three denials, "The Lord turned and looked at Peter" (22:61), "He went out, and wept bitterly." (22:62).
- KEEP `servanthood` — "But I am among you as one who serves." (22:27, with 22:25–26).
- ADD `passover` — the chapter's meal is the Passover itself, and the engine pack anchors Lk 22:7-15: "The day of unleavened bread came, on which the Passover must be sacrificed." (22:7); "I have earnestly desired to eat this Passover with you before I suffer" (22:15). A whole named unit (22:1, 7–15), not a passing mention. Takes the chapter to the hard ceiling of 8.
### Anchor-extension candidates
- relapse-and-restoration | 22:31-34, 54-62 | "I prayed for you, that your faith wouldn't fail. You, when once you have turned again, establish your brothers." (22:32) | medium — the pack has NO gospel/acts anchor; Peter's sift-fall-turn arc is its strongest narrative.
- prayer | 22:39-46 | "Being in agony, he prayed more earnestly. His sweat became like great drops of blood falling down on the ground." (22:44) | medium — Gethsemane's praying itself; the pack's Lukan anchor is 18:1.
- deity-of-christ | 22:66-70 | "From now on, the Son of Man will be seated at the right hand of the power of God."… "Are you then the Son of God?" He said to them, "You say it, because I am." (22:69–70) | medium — engine-side candidate only; drafter B deliberately left this as summary material at display level, and display christology on the Synoptic dispute texts sits under the standing Luke 20 HELD record — curation should take this up together with that ruling, not ahead of it.
### Lexicon candidates
- surrender-to-god | not my will but yours | realistic query phrasings: "not my will but yours be done", "jesus praying in gethsemane", "let this cup pass from me" — the last is Matthew's wording (WEB Luke reads "remove this cup from me", 22:42), an alternate-wording case.
- relapse-and-restoration | peter denies jesus | realistic query phrasings: "peter denies jesus three times", "peter's restoration", "coming back to god after denying him"
- lords-supper | the last supper | realistic query phrasings: "the last supper", "the new covenant in my blood", "why do christians take communion"
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit (after ADD); book doc subdivides this chapter (9 sections) — marked for per-verse refinement
### Decisions record
- One seat was open under the ceiling and four candidates cleared the presence bar; `passover` was seated (distinct feast theme, engine pack's own Lk 22:7-15 anchor, no overlap with sitting tags). The three yielded, per §11.6, each with its ground:
  - `satan` — "Satan entered into Judas" (22:3), "Satan asked to have all of you, that he might sift you as wheat" (22:31), "this is your hour, and the power of darkness" (22:53): honest framing thread, but the engine pack already anchors Lk 22:31-32, so search loses nothing; yielded as the narrower add against `passover`'s unit-level presence.
  - `betrayal` — the engine pack anchors Lk 22:47-48; display-side it is broad-duplicating-specific beside the seated `pastoral-betrayal-and-marriage-crisis`.
  - `leadership` — the engine pack anchors Lk 22:24-27; broad-duplicating-specific beside the seated `servanthood`.
- `temptation` skip (22:40, 46 inside `prayer`'s quotes) upheld from the application pass; the engine pack anchors Lk 22:40 regardless.
- `angels` skip (22:43, single verse) upheld from the application pass.
- The `deity-of-christ` engine candidate above is deliberately routed to ride the Luke 20 HELD ruling rather than precede it; recorded so the sequencing is explicit.
## Luke 23 (subdivided: 23:1–5; 23:6–12; 23:13–25; 23:26–43; 23:44–49; 23:50–56)
Existing tags (book doc): `the-cross`, `forgiveness-of-sins`, `salvation`, `trust-in-god`, `death-and-burial`
### Applied-tag deltas
- KEEP `the-cross` — "When they came to the place that is called 'The Skull', they crucified him there with the criminals" (23:33); the darkness (23:44), "the veil of the temple was torn in two" (23:45), and the death (23:46).
- KEEP `forgiveness-of-sins` — "Father, forgive them, for they don't know what they are doing." (23:34), and pardon spoken to a dying guilty man (23:42–43).
- KEEP `salvation` — "Lord, remember me when you come into your Kingdom."… "Assuredly I tell you, today you will be with me in Paradise." (23:42–43).
- KEEP `trust-in-god` — "Father, into your hands I commit my spirit!" (23:46; single verse kept per the book doc's recorded crest-of-the-narrative rationale).
- KEEP `death-and-burial` — Joseph "took it down and wrapped it in a linen cloth, and laid him in a tomb that was cut in stone, where no one had ever been laid" (23:53); the women "prepared spices and ointments. On the Sabbath they rested according to the commandment." (23:56). Display tag stands (adopted id); engine evidence routed below.
- ADD `slander-and-false-accusation` — the trial narrative's spine is false charges against the innocent: "We found this man perverting the nation, forbidding paying taxes to Caesar" (23:2) against Pilate's triple verdict "I find no basis for a charge against this man." (23:4, with 23:14–15, 22), the vehement accusing (23:10), and the criminal's "this man has done nothing wrong" (23:41). Substantial presence across three sections, and the falsely-accused searcher's strongest narrative anywhere. Reversible; takes the chapter to 6 (soft cap).
### Anchor-extension candidates
- the-cross | 23:33-46 | "they crucified him there with the criminals, one on the right and the other on the left" (23:33) | high — the pack's only anchor is Jn 1:29; the crucifixion narrative itself is absent from it.
- forgiveness-of-sins | 23:34 | "Father, forgive them, for they don't know what they are doing." | high — among the most-queried forgiveness texts.
- salvation | 23:39-43 | "today you will be with me in Paradise" (23:43) | high — the thief on the cross, rescue with nothing to offer.
- trust-in-god | 23:46 | "Father, into your hands I commit my spirit!" | medium — the pack has NO gospel/acts anchor.
- slander-and-false-accusation | 23:1-5, 13-15 | "I find no basis for a charge against this man." (23:4) | medium — stands or falls with the ADD above.
### Lexicon candidates
- salvation | the thief on the cross | realistic query phrasings: "the thief on the cross", "today you will be with me in paradise", "can someone be saved at the last minute"
- forgiveness-of-sins | father forgive them | realistic query phrasings: "father forgive them for they know not what they do", "jesus forgave his executioners"
- the-cross | the crucifixion | realistic query phrasings: "the crucifixion of jesus", "why did the temple veil tear", "darkness when jesus died"
### New-concept candidates
- ROUTED — corpus-blocked roster row 22 `death-and-burial`: "He took it down and wrapped it in a linen cloth, and laid him in a tomb that was cut in stone, where no one had ever been laid." (23:53), with the watching women and prepared spices (23:55–56) — the row's own named Luke 23 evidence (with John 19); no duplicate candidate.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- soft cap 6 hit (after ADD); book doc subdivides this chapter (6 sections) — marked for per-verse refinement
### Decisions record
- ADD `slander-and-false-accusation` recorded above; reversible delegated default.
- Drafter B's item-17 yield of `pastoral-grief-and-loss` (mourning depicted at 23:27, 48 but no unit dwells on grieving; not a grief text for a griever) re-verified and upheld.
- Tag-application pass's `governing-authorities` skip (23:2 — the accusers' tax charge, one verse) upheld; the verse now also serves the ADD's quote.
- `suffering-of-the-righteous` considered — "Certainly this was a righteous man." (23:47) with the triple innocence verdict — and yielded: the concept's register is the why-do-good-people-suffer question, which the chapter depicts but does not take up as teaching; recorded for the per-verse refinement pass to weigh.
- 23:28-31 ("Daughters of Jerusalem, don't weep for me…") noted as a third homeless prophetic-oracle unit (with 13:34-35 and 19:41-44); no honest concept home in the current vocabulary.
## Luke 24 (subdivided: 24:1–12; 24:13–35; 24:36–49; 24:50–53)
Existing tags (book doc): `resurrection`, `studying-the-word`, `sharing-your-faith`, `doubt`, `joy-in-the-lord`, `worship`, `ascension`
### Applied-tag deltas
- KEEP `resurrection` — "Why do you seek the living among the dead? He isn't here, but is risen." (24:5–6); "The Lord is risen indeed, and has appeared to Simon!" (24:34); "a spirit doesn't have flesh and bones, as you see that I have" (24:39), with the broiled fish eaten "in front of them" (24:42–43). The pack anchors Lk 24:5-6, 24:39, 24:42-43.
- KEEP `studying-the-word` — "he explained to them in all the Scriptures the things concerning himself" (24:27); "Weren't our hearts burning within us… while he opened the Scriptures to us?" (24:32); "Then he opened their minds, that they might understand the Scriptures." (24:45).
- KEEP `sharing-your-faith` — "repentance and remission of sins should be preached in his name to all the nations, beginning at Jerusalem. You are witnesses of these things." (24:47–48). The pack anchors Lk 24:46-48.
- KEEP `doubt` — the report "seemed to them to be nonsense" (24:11); "Why are you troubled? Why do doubts arise in your hearts?" (24:38); "While they still didn't believe for joy" (24:41).
- KEEP `joy-in-the-lord` — disbelief "for joy" (24:41) giving way to "returned to Jerusalem with great joy" (24:52), "praising and blessing God" (24:53).
- KEEP `worship` — "They worshiped him" (24:52), "continually in the temple, praising and blessing God" (24:53).
- KEEP `ascension` — "he lifted up his hands and blessed them. While he blessed them, he withdrew from them and was carried up into heaven." (24:50–51). The pack anchors Lk 24:50-53.
- ADD `messianic-prophecy` — the risen Lord's repeated, chapter-spanning claim that the Scriptures speak of him: "Beginning from Moses and from all the prophets, he explained to them in all the Scriptures the things concerning himself." (24:27); "all things which are written in the law of Moses, the prophets, and the psalms concerning me must be fulfilled" (24:44); "Thus it is written, and thus it was necessary for the Christ to suffer and to rise from the dead the third day" (24:46, with 24:25–26). The pack ("prophecies about jesus; old testament prophecies about christ") has no gospel/acts anchor, and this is Scripture's own fullest statement of the theme. Takes the chapter to the hard ceiling of 8; every tag independently clears the bar.
### Anchor-extension candidates
- messianic-prophecy | 24:25-27, 44-46 | "he explained to them in all the Scriptures the things concerning himself" (24:27) | high — stands or falls with the ADD above; the where-is-Jesus-in-the-Old-Testament query family's best anchor.
- studying-the-word | 24:27, 32, 44-45 | "Then he opened their minds, that they might understand the Scriptures." (24:45) | medium — the pack's only anchor is Mt 24:35.
- honor-the-son | 24:52 | "They worshiped him and returned to Jerusalem with great joy" | medium — the risen Jesus worshiped; beside the pack's Mt 28:9, 28:17 anchors.
- doubt | 24:36-43 | "Why are you troubled? Why do doubts arise in your hearts? See my hands and my feet, that it is truly me." (24:38–39) | medium — doubt met with evidence, the pack's own register.
### Lexicon candidates
- resurrection | the road to emmaus | realistic query phrasings: "the road to emmaus", "why do you seek the living among the dead", "he is risen indeed"
- studying-the-word | hearts burning within us | realistic query phrasings: "were not our hearts burning within us", "jesus opens the scriptures", "jesus in all the scriptures"
- holy-spirit | power from on high | realistic query phrasings: "clothed with power from on high", "wait for the promise of the father" — routing flagged per the book doc's extension-check note: the phrase may belong to `holy-spirit`'s Pentecost material (Acts 1–2 anchors) rather than a new home; curator resolves with the Acts sweep.
### New-concept candidates
- None.
### Decline-overturn proposals
- None.
### Ceiling / refinement flags
- hard ceiling 8 hit (after ADD); book doc subdivides this chapter (4 sections) — marked for per-verse refinement
### Decisions record
- ADD `messianic-prophecy` recorded above; reversible. It seats the chapter at the ceiling, so any further candidate yields automatically; none cleared the bar.
- Drafter B's item-17 yield of `praise` (24:53 carried by `worship` on the same verses) re-verified and upheld.
- Tag-application pass's `angels` skip upheld: 24:4's "two men stood by them in dazzling clothing" are not called angels in the narration; 24:23 is the disciples' report wording.
- `lords-supper` considered for 24:30-35 ("he was recognized by them in the breaking of the bread") and yielded: the meal is recognition narrative, not the supper's institution or practice; tagging it would adjudicate a eucharistic reading the text doesn't state.
---

## Survival audit (CONVENTIONS §9) — 2026-08-26, end of sweep

- Whole-ledger re-read performed after the final chapter append (file at 112,324 bytes before this record).
- Header intact: title, date, repo SHA e762d1c629f5b121a2aacc6da57cca6bacc3215e, WEB source (web-subset.json @ 87fd68c), inputs, legend — all present and unmodified.
- All 24 chapter entries present, in order Luke 1 → Luke 24, each carrying all nine legend sections (heading, existing tags, deltas, anchor-extensions, lexicon, new-concept, decline-overturns, ceiling flags, Decisions record). No entry missing a section; no interleaved foreign content.
- Byte-accounting chain: every append during the sweep verified at write time (size-before + entry-size = size-after, exact, all 24 appends plus header); no discrepancy at any step, so no prior bytes were clobbered.
- Key records verified surviving: the Luke 20 HELD `deity-of-christ` record (awaiting Jesse); the ruling-1(a) confirmation on Luke 20; all corpus-blocked routings (rows 11, 16, 22, 31, 49); the `son-of-man` new-concept candidate.
- No other file under /mnt/project-files was written by this thread.

### Sweep totals (for the coordinator)
- Applied-tag deltas: 154 KEEP, 9 ADD, 0 DROP. ADDs: `witness-testimony` (ch. 3), `fasting` (ch. 5), `pastoral-prayer-for-healing` + `giving-an-answer` (ch. 7), `family-reconciliation` (ch. 15), `the-house-of-god` (ch. 19), `passover` (ch. 22), `slander-and-false-accusation` (ch. 23), `messianic-prophecy` (ch. 24) — every ADD a reversible delegated default with word-for-word pinned-WEB quotes.
- Anchor-extension candidates: 99 rows (high-priority cluster: the anchorless packs `faith`, `fear-not`, `praise`, `thanksgiving`, `justification-by-faith`, `humble-exaltation`, `resisting-the-devil`, `relapse-and-restoration`, `messianic-prophecy`, `the-cross` gaining their classic Lukan narratives).
- Lexicon candidates: 71 rows (alternate-wording cases flagged where the famous phrasing differs from the WEB: "nothing is impossible with god", "manger", "peace be still", "let this cup pass", "with god all things are possible", "bear fruit in keeping with repentance", "one thing is needful", "parable of the talents").
- New-concept candidates: 1 (`son-of-man`, ch. 9). Decline-overturn proposals: 0.
- Corpus-blocked routings: 11 routing entries to 5 rows — row 49 `virgin-birth` (ch. 1), row 31 `good-news-for-the-poor` (chs. 1, 4, 6, 7, 12), row 11 `blasphemy-against-the-spirit` (ch. 12), row 16 `stewardship` (chs. 12, 16, 19), row 22 `death-and-burial` (ch. 23). No duplicates minted.
- Ceiling / refinement flags: hard-ceiling-8 chapters — 1, 2, 6, 9, 10, 12, 18, 22, 24 (nine); 23 of 24 chapters are book-doc-subdivided and marked for the per-verse refinement pass (Luke 15 deliberately whole).
- Luke 20: resurrection side confirmed settled per ruling 1(a); `deity-of-christ` divergence recorded HELD — awaiting Jesse, evidence laid out both ways in the ch. 20 Decisions record.

AUDIT RESULT: PASS — all 24 chapter entries present and intact; no lost updates detected.

---

# PASTORAL-ID ERRATUM (2026-08-26)

Delivery-pass audit of the 14 pastoral-* concept ids. The canonical ledger form is the
`pastoral-` prefixed filename stem; the unprefixed YAML ids are the wrong form. This
ledger's header id-convention note ("anchor/lexicon candidate lines use the engine id")
declared the unprefixed spelling for candidate lines; the project has since settled on
the prefixed form as canonical, so that convention is superseded. Occurrences below are
recorded append-only (no body edit); the canonical form governs wherever the wrong form
appears. The `pastoral-prayer-for-healing` ADD at ch. 7 already uses the canonical form
and is correct. Line numbers refer to the file state as audited (pre-erratum).

1.  Luke 4 entry (line 154, anchor-extension candidate): `prayer-for-healing`
    → canonical `pastoral-prayer-for-healing`.
2.  Luke 7 entry (line 242, anchor-extension candidate): `grief-and-loss`
    → canonical `pastoral-grief-and-loss`.
3.  Luke 8 entry (line 278, lexicon candidate): `prayer-for-healing`
    → canonical `pastoral-prayer-for-healing`.
4.  Luke 8 entry (line 288, considered/yielded note): `grief-and-loss`
    → canonical `pastoral-grief-and-loss`.
5.  Luke 13 entry (line 426, anchor-extension candidate): `freedom-from-bondage`
    → canonical `pastoral-freedom-from-bondage`.
6.  Luke 15 entry (line 479, anchor-extension candidate): `relapse-and-restoration`
    → canonical `pastoral-relapse-and-restoration`.
7.  Luke 16 entry (line 510, anchor-extension candidate): `marriage-divorce-teaching`
    → canonical `pastoral-marriage-divorce-teaching`.
8.  Luke 18 entry (line 569, anchor-extension candidate):
    `refuge-and-justice-for-the-oppressed`
    → canonical `pastoral-refuge-and-justice-for-the-oppressed`.
9.  Luke 18 entry (line 571, anchor-extension candidate): `prayer-for-healing`
    → canonical `pastoral-prayer-for-healing`.
10. Luke 22 entry (line 688, anchor-extension candidate): `relapse-and-restoration`
    → canonical `pastoral-relapse-and-restoration`.
11. Luke 22 entry (line 693, lexicon candidate): `relapse-and-restoration`
    → canonical `pastoral-relapse-and-restoration`.
12. Survival-audit appendix, sweep totals (line 784, anchorless-pack list):
    `relapse-and-restoration` → canonical `pastoral-relapse-and-restoration`.

Total: 12 occurrences. Canonical form governs.
