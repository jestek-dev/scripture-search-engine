# Hebrews — Layer-3 tag sweep ledger

- **Book:** Hebrews (WEB book code HEB, 13 chapters)
- **Date:** 2026-08-26
- **Repo:** origin/main @ `e762d1c629f5b121a2aacc6da57cca6bacc3215e`
- **Round:** 1 — editor pass (critic loop not yet run; §8 applies at the group level)
- **Source:** pinned engwebp VPL snapshot (`engwebp_vpl/engwebp_vpl.txt`), sha256-verified against `pipeline/manifests/web.json` per web-access.md (archive sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`). Every quote below is word-for-word from that file.
- **Vocabulary:** the 239 engine concept ids on main at e762d1c (tag id = YAML file basename, per the project-wide ruling) + the adopted display-tag ids per the canonical `tag-apply/adopted-concepts.md` (161 ids, read 2026-08-26 after the coordinator's mid-sweep notice; verified consistent with the sweep-kit's reconstructed list — no id used in this ledger required correction).
- **Erratum honored:** Heb 1:14 reads "serving spirits" in the pinned WEB; the tag-gaps.md log quote "ministering spirits" is a recorded erratum and is not used here.
- **Prior art diffed against:** `/mnt/project-files/research/bible-rollout/hebrews.md` (book doc, critic-approved 2026-08-23, incl. its Decisions record items 13–18 and delivery note).
- **Write discipline:** CONVENTIONS §9 — atomic end-of-file appends only, post-append verification of prior bytes, final survival audit. This ledger's sole writer is the Hebrews sweep worker.

## Hebrews 1

### Applied-tag deltas

Current tags (book doc): `deity-of-christ`, `creation`, `worship`, `angels`, `supremacy-of-christ`, `honor-the-son` (6 — at the soft cap).

- KEEP `deity-of-christ` — "Your throne, O God, is forever and ever" (1:8); "the radiance of his glory, the very image of his substance" (1:3).
- KEEP `creation` — "through whom also he made the worlds" (1:2); "You, Lord, in the beginning, laid the foundation of the earth" (1:10).
- KEEP `worship` — "Let all the angels of God worship him." (1:6) — commanded worship of the exalted Son.
- KEEP `angels` — "He makes his angels winds, and his servants a flame of fire." (1:7); "Aren’t they all serving spirits, sent out to do service for the sake of those who will inherit salvation?" (1:14).
- KEEP `supremacy-of-christ` — "having become as much better than the angels as the more excellent name he has inherited is better than theirs" (1:4) — the better-than argument register, both-tags beside `deity-of-christ` per the book doc's map split.
- KEEP `honor-the-son` — "Let all the angels of God worship him." (1:6) — the worship-command register per the map's in-chapter split (catena → `supremacy-of-christ`; 1:6 → this id).

Adds: none. Drops: none.

### Anchor-extension candidates

- `ascension` — Hebrews 1:3 — "sat down on the right hand of the Majesty on high" — proposed weight 0.7. The pack's anchors (Acts 1/2/7, Luke 24, Eph 4) carry no Hebrews text; its lexicon already carries "seated at the right hand", and 1:3 (with the 1:13 session citation) is the book's statement of it. Deliberate dual with `supremacy-of-christ`'s Hebrews 1:3 anchor — identity/supremacy register there, the session-at-the-right-hand register here (record the dual in the YAML comment, per the priesthood.yaml pattern).

### Lexicon candidates

none

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- `messianic-prophecy` considered, not added: the catena applies psalms to the Son, but the chapter's teaching substance is the Son's rank above the angels (carried by `supremacy-of-christ` / `deity-of-christ`); prophecy-fulfillment as a theme is instrumental here, and the chapter sits at the soft cap of 6.
- `ascension` considered as a tag ("sat down on the right hand of the Majesty on high", 1:3; "Sit at my right hand", 1:13), declined: two session notices inside the catena, the ascension event itself not depicted — recorded as the anchor-extension candidate above instead.
- No candidate yielded to the cap (nothing beyond the existing 6 cleared the presence bar).

### Per-verse refinement

PER-VERSE REFINEMENT: no

## Hebrews 2

### Applied-tag deltas

Current tags (book doc): `salvation`, `incarnation`, `the-cross`, `pastoral-freedom-from-bondage`, `backsliding`, `mortality`, `priesthood` (7).

- KEEP `salvation` — "how will we escape if we neglect so great a salvation" (2:3); "the author of their salvation" (2:10).
- KEEP `incarnation` — "Since then the children have shared in flesh and blood, he also himself in the same way partook of the same" (2:14); "he was obligated in all things to be made like his brothers" (2:17). (PR #43 id — Jesse-ratified per §11.5.)
- KEEP `the-cross` — "by the grace of God he should taste of death for everyone" (2:9); "to make atonement for the sins of the people" (2:17).
- KEEP `pastoral-freedom-from-bondage` — "might deliver all of them who through fear of death were all their lifetime subject to bondage" (2:15) — the personal-crisis register the book doc's Decisions #8 re-judged and kept.
- KEEP `backsliding` — "lest perhaps we drift away" (2:1); "how will we escape if we neglect so great a salvation" (2:3).
- KEEP `mortality` — "that through death he might bring to nothing him who had the power of death, that is, the devil" (2:14).
- KEEP `priesthood` — "that he might become a merciful and faithful high priest in things pertaining to God" (2:17).

Adds: none. Drops: none.

### Anchor-extension candidates

- `pastoral-freedom-from-bondage` — Hebrews 2:14-15 — "might deliver all of them who through fear of death were all their lifetime subject to bondage" — proposed weight 0.85. The fear-of-death bondage text itself; the pack's only Hebrews anchor is 4:15-16 (the throne-of-grace help register).

### Lexicon candidates

- `mortality` — proposed terms: "fear of death"; "afraid of dying"; "jesus defeated death". Realistic queries: "Bible verses about fear of death", "how Jesus defeated death", "afraid of dying". No engine lexicon carries the fear-of-death phrasing (verified by grep at e762d1c); `pastoral-freedom-from-bondage`'s lexicon is the addiction register, and `mortality` already anchors the death-texts this book supplies (Heb 9:27) — the 2:14-15 anchor extension above would give the phrase an honest landing.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `sacrifice-and-atonement` → ROUTED to corpus-blocked roster row 1 — Heb 2:17 "to make atonement for the sins of the people". The row records the `atonement` token as owned by `the-cross`; this chapter's atonement clause is carried by the `the-cross` tag above. Not duplicated as a proposal.

### Decisions record

- `temptation` on 2:18 stays off, per the book doc's pass-16 skip: single verse; ch. 4's fuller text (4:15) is the book's temptation home.
- `angels` on 2:2, 5, 16 stays off, per the same pass: argument-mentions in service of another point.
- No candidate yielded to the cap (chapter at 7 of 8; no eighth candidate cleared the bar).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 3

### Applied-tag deltas

Current tags (book doc): `sin`, `obedience-to-the-word`, `backsliding` (3).

- KEEP `sin` — "lest any one of you be hardened by the deceitfulness of sin" (3:13); "an evil heart of unbelief" (3:12).
- KEEP `obedience-to-the-word` — "Today if you will hear his voice" (3:7); "don’t harden your hearts as in the rebellion" (3:8); entry lost by "those who were disobedient" (3:18).
- KEEP `backsliding` — "an evil heart of unbelief, in falling away from the living God" (3:12); "they weren’t able to enter in because of unbelief" (3:19).
- ADD `hardness-of-heart` — "don’t harden your hearts as in the rebellion, in the day of the trial in the wilderness" (3:8); "exhort one another day by day, so long as it is called “today”, lest any one of you be hardened by the deceitfulness of sin" (3:13). Rationale: the engine id was minted in the 2026-08-26 rollout, post-dating every tag pass on this book doc; Hebrews 3 is the chapter whose central warning IS hardening — the psalm's command (3:8, repeated 3:15) plus its applied exhortation (3:13). The pack already anchors the ch. 4 re-quotation (Heb 4:7), so the vocabulary reads this book as its material. Chapter lands at 4 tags.

Drops: none.

### Anchor-extension candidates

- `hardness-of-heart` — Hebrews 3:12-13 — "Beware, brothers, lest perhaps there might be in any one of you an evil heart of unbelief" ... "hardened by the deceitfulness of sin" — proposed weight 0.85. The pack's Hebrews anchor is the single re-quoted verse 4:7; 3:12-13 is the fuller warning with the exhort-one-another remedy.

### Lexicon candidates

none

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- `doubt` on 3:12 stays declined per book-doc Decisions #10(a): "an evil heart of unbelief" is rebellion-unbelief, not the pastoral experience of doubt.
- `sabbath-rest` / `rest-for-the-weary` considered for 3:11, 18-19 ("They will not enter into my rest"), declined: ch. 3 depicts exclusion from the rest; the rest promise's teaching substance is ch. 4's, where both ids already stand.
- `faith` stays off ch. 3 per book-doc Decisions #14 (the chapter depicts unbelief's cost, not faith's teaching).
- No candidate yielded to the cap (4 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 4

### Applied-tag deltas

Current tags (book doc): `sabbath-rest`, `rest-for-the-weary`, `prayer`, `pastoral-strength-in-weakness`, `priesthood`, `temptation`, `power-of-gods-word` (7).

- KEEP `sabbath-rest` — "There remains therefore a Sabbath rest for the people of God." (4:9); "God rested on the seventh day from all his works" (4:4).
- KEEP `rest-for-the-weary` — "For we who have believed do enter into that rest" (4:3); "Let’s therefore give diligence to enter into that rest" (4:11).
- KEEP `prayer` — "Let’s therefore draw near with boldness to the throne of grace, that we may receive mercy" (4:16).
- KEEP `pastoral-strength-in-weakness` — "we don’t have a high priest who can’t be touched with the feeling of our infirmities" (4:15); "grace for help in time of need" (4:16) — the personal-weakness register the book doc's Decisions #9 re-judged and kept.
- KEEP `priesthood` — "Having then a great high priest who has passed through the heavens, Jesus, the Son of God" (4:14).
- KEEP `temptation` — "one who has been in all points tempted like we are, yet without sin" (4:15).
- KEEP `power-of-gods-word` — "For the word of God is living and active, and sharper than any two-edged sword" (4:12).

Adds: none. Drops: none.

### Anchor-extension candidates

none — the chapter's key spans are already anchored (`priesthood` 4:14-16, `power-of-gods-word` 4:12, `studying-the-word` 4:12, `hardness-of-heart` 4:7, `mercy` 4:16, `sabbath-rest` 4:9-11, `pastoral-freedom-from-bondage` 4:15-16).

### Lexicon candidates

none

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- `hardness-of-heart` considered as a tag for 4:7 ("Today if you will hear his voice, don’t harden your hearts."), declined: a single re-quoted verse; the ch. 3 add carries the theme, and the pack already anchors 4:7 — the query family is served without an eighth-place tag.
- No candidate yielded to the cap (7 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 5

### Applied-tag deltas

Current tags (book doc): `prayer`, `spiritual-growth`, `priesthood` (3).

- KEEP `prayer` — "having offered up prayers and petitions with strong crying and tears to him who was able to save him from death" (5:7).
- KEEP `spiritual-growth` — "You have come to need milk, and not solid food." (5:12); "solid food is for those who are full grown" (5:14).
- KEEP `priesthood` — "Nobody takes this honor on himself, but he is called by God, just like Aaron was." (5:4); "You are a priest forever, after the order of Melchizedek." (5:6).

Adds: none. Drops: none.

### Anchor-extension candidates

- `spiritual-growth` — Hebrews 5:12-14 — "You have come to need milk, and not solid food." — proposed weight 0.85. The milk-to-maturity rebuke; the pack has only two anchors (1 Peter 2:2, Ephesians 4:15) and no Hebrews text.
- `prayer` — Hebrews 5:7 — "having offered up prayers and petitions with strong crying and tears" — proposed weight 0.7. Christ's own praying; the pack's sweep-book anchors (James 5:16, 1 John 5:14-15) carry the believer's-prayer registers only.

### Lexicon candidates

- `spiritual-growth` — proposed terms: "milk and solid food"; "spiritual milk". Realistic queries: "milk vs solid food in the Bible", "what is spiritual milk", "moving from milk to meat". The pack's lexicon carries the maturity register but not the milk/food metaphor a Heb 5 / 1 Pet 2:2 searcher types; the 5:12-14 anchor extension above gives it an honest landing.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- `obedience-to-the-word` considered for 5:8-9 ("learned obedience by the things which he suffered"; "to all of those who obey him"), declined: two verses instrumental to the priesthood argument, not the hearing-and-doing teaching register.
- `receiving-correction` considered for 5:11-14, declined: the chapter delivers a rebuke; it does not teach receiving one.
- `salvation` considered for 5:9 ("the author of eternal salvation"), declined: single verse; the id's Hebrews homes are chs. 2 and 7.
- No candidate yielded to the cap (3 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 6

### Applied-tag deltas

Current tags (book doc): `spiritual-growth`, `hope-in-god`, `gods-faithfulness`, `assurance-of-salvation`, `backsliding`, `oaths-and-vows` (6 — at the soft cap).

- KEEP `spiritual-growth` — "leaving the teaching of the first principles of Christ, let’s press on to perfection" (6:1).
- KEEP `hope-in-god` — "This hope we have as an anchor of the soul, a hope both sure and steadfast" (6:19); "who have fled for refuge to take hold of the hope set before us" (6:18).
- KEEP `gods-faithfulness` — "For God is not unrighteous, so as to forget your work and the labor of love which you showed toward his name" (6:10); God "interposed with an oath" to show "the immutability of his counsel" (6:17) — the promise-keeping register.
- KEEP `assurance-of-salvation` — "we are persuaded of better things for you, and things that accompany salvation" (6:9); "the same diligence to the fullness of hope even to the end" (6:11).
- KEEP `backsliding` — "and then fell away, it is impossible to renew them again to repentance" (6:6) — reported as written, beside the warm turn of 6:9, per the book doc's Decisions #11 (no perseverance-vs-apostasy adjudication).
- KEEP `oaths-and-vows` — "since he could swear by no one greater, he swore by himself" (6:13); "in every dispute of theirs the oath is final for confirmation" (6:16).
- ADD `gods-unchanging-nature` — "the immutability of his counsel" (6:17); "that by two immutable things, in which it is impossible for God to lie" (6:18). Rationale: the engine id was minted in the apologetics wave / rollout after this book's tag passes; the chapter grounds hope in God's unchangeable counsel — the concept's own register ("does God change"). Both-tags beside `gods-faithfulness` per §11.2: faithfulness carries the keeps-his-promises register, this id the cannot-change / cannot-lie register. Chapter lands at 7 (under the ceiling).

Drops: none.

### Anchor-extension candidates

- `gods-unchanging-nature` — Hebrews 6:17-18 — "the immutability of his counsel" ... "it is impossible for God to lie" — proposed weight 0.75. The pack's anchors carry no immutability-of-counsel text; this is its oath-grounded form.

### Lexicon candidates

- `gods-faithfulness` — proposed terms: "god cannot lie"; "impossible for god to lie". Realistic queries: "God cannot lie verse", "can God lie", "is God's promise sure". No engine lexicon carries the cannot-lie phrasing (verified by grep at e762d1c); Heb 6:18 (and Num 23:19, already a `gods-unchanging-nature` anchor) are its texts. If the curator prefers, the same terms fit `gods-unchanging-nature` — one home, not both.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- `resurrection-of-the-dead` considered for 6:2 ("of the teaching of baptisms, of laying on of hands, of resurrection of the dead, and of eternal judgment"), declined: a foundation-list mention with no teaching substance — the same ground as the book doc's `baptism`-on-6:2 decline (Decisions #10(b)).
- `stewardship-of-days` considered for 6:12 (its pack already anchors Heb 6:12), declined as a tag: one verse; the anchor serves the query family.
- No candidate yielded to the cap (7 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 7

### Applied-tag deltas

Current tags (book doc): `salvation`, `tithing`, `priesthood`, `oaths-and-vows` (4).

- KEEP `salvation` — "Therefore he is also able to save to the uttermost those who draw near to God through him, seeing that he lives forever to make intercession for them." (7:25).
- KEEP `tithing` — "to whom also Abraham divided a tenth part of all" (7:2); "have a commandment to take tithes from the people according to the law" (7:5) — kept per the book doc's Decisions #5 (substantial engagement; borderline flagged there stands).
- KEEP `priesthood` — "what further need was there for another priest to arise after the order of Melchizedek" (7:11); "because he lives forever, has his priesthood unchangeable" (7:24).
- KEEP `oaths-and-vows` — "Inasmuch as he was not made priest without the taking of an oath" (7:20); "The Lord swore and will not change his mind" (7:21).

Adds: none. Drops: none.

### Anchor-extension candidates

- `oaths-and-vows` — Hebrews 7:20-21 — "he was not made priest without the taking of an oath" — proposed weight 0.7. The priesthood-by-oath register; the pack's Hebrews anchor is 6:16-18 only, and the book doc's log append already names 7:20-22, 28 for the row.

### Lexicon candidates

- `priesthood` — proposed terms: "melchizedek"; "order of melchizedek". Realistic queries: "who was Melchizedek", "Melchizedek and Jesus", "priest after the order of Melchizedek". No engine lexicon carries a Melchizedek term (verified by grep at e762d1c — the name appears only in a priesthood.yaml anchor comment); the pack's Heb 6:20 and 7:23-28 anchors give the term honest landings.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

none

### Decisions record

- The intercession register ("he lives forever to make intercession for them", 7:25) needs no new candidate: the `priesthood` pack's own Heb 7:23-28 anchor records the "Jesus prays for me" query family there (rides the re-pin).
- `messianic-prophecy` considered for the Ps 110:4 oath citations (7:17, 21), declined: instrumental citation inside the priesthood argument, not prophecy-fulfillment teaching.
- No candidate yielded to the cap (4 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: no

## Hebrews 8

### Applied-tag deltas

Current tags (book doc): `covenant`, `forgiveness-of-sins`, `priesthood` (3).

- KEEP `covenant` — "he is also the mediator of a better covenant, which on better promises has been given as law" (8:6); "I will make a new covenant with the house of Israel and with the house of Judah" (8:8).
- KEEP `forgiveness-of-sins` — "For I will be merciful to their unrighteousness. I will remember their sins and lawless deeds no more." (8:12).
- KEEP `priesthood` — "the main point is this: we have such a high priest, who sat down on the right hand of the throne of the Majesty in the heavens" (8:1).

Adds: none. Drops: none.

### Anchor-extension candidates

- `covenant` — Hebrews 8:8-12 — "I will make a new covenant with the house of Israel and with the house of Judah" — proposed weight 0.9. The NT quotation site of the pack's Jeremiah 31:31-34 keystone (record the span-sibling relation in the YAML comment); the pack's Hebrews anchors (12:24, 13:20) are single covenant-naming verses, not the new-covenant oracle itself.

### Lexicon candidates

- `covenant` — proposed terms: "law written on the heart"; "old covenant vs new covenant". Realistic queries: "what is the new covenant", "law written on the heart meaning", "old covenant vs new covenant". The pack's lexicon carries "the new covenant" but neither the written-on-hearts phrasing (only `conscience` carries "law written on their hearts" — a different register: Rom 2's moral law, not Jer 31's promise) nor the old-vs-new comparison a Heb 8 searcher types.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `mediator` → ROUTED to corpus-blocked roster row 24 — Heb 8:6 "the mediator of a better covenant". The row already notes in-corpus Hebrews material for the re-pin curator and carries the decide-alongside-priesthood merge note; the register question (Job's umpire-longing vs covenant-mediator) is the row's own to decide. Not tagged, not duplicated as a proposal.
- `new-heart` → ROUTED to corpus-blocked roster row 38 — Heb 8:10 "I will put my laws into their mind; I will also write them on their heart." The roster itself assigns the quoted Jer 31:33 to `covenant`'s anchors; recorded against the row, not proposed anew. The `covenant` tag above carries the verse.

### Decisions record

- `the-house-of-god` considered for 8:2, 5 ("the true tabernacle which the Lord pitched, not man"; "a copy and shadow of the heavenly things"), declined here: two verses in service of the priest argument; ch. 9's full sanctuary treatment is the honest home (added there).
- No candidate yielded to the cap (3 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: no

## Hebrews 9

### Applied-tag deltas

Current tags (book doc): `the-cross`, `covenant`, `forgiveness-of-sins`, `divine-judgment`, `second-coming`, `priesthood`, `mortality` (7).

- KEEP `the-cross` — "through his own blood, entered in once for all into the Holy Place, having obtained eternal redemption" (9:12); "he has been revealed to put away sin by the sacrifice of himself" (9:26).
- KEEP `covenant` — "he is the mediator of a new covenant" (9:15); "This is the blood of the covenant which God has commanded you." (9:20).
- KEEP `forgiveness-of-sins` — "apart from shedding of blood there is no remission" (9:22); the blood of Christ will "cleanse your conscience from dead works to serve the living God" (9:14).
- KEEP `divine-judgment` — "it is appointed for men to die once, and after this, judgment" (9:27).
- KEEP `second-coming` — Christ "will appear a second time, not to deal with sin, but to save those who are eagerly waiting for him" (9:28).
- KEEP `priesthood` — "But Christ having come as a high priest of the coming good things" (9:11); "into the second the high priest alone, once in the year, not without blood" (9:7).
- KEEP `mortality` — "it is appointed for men to die once" (9:27) — flagged in the book doc's Decisions #16 as the chapter's thinnest tag; kept there as the concept's direct anchor, and the pack does anchor Heb 9:27.
- ADD `the-house-of-god` — "For a tabernacle was prepared. In the first part were the lamp stand, the table, and the show bread, which is called the Holy Place." (9:2); "After the second veil was the tabernacle which is called the Holy of Holies" (9:3); "For Christ hasn’t entered into holy places made with hands, which are representations of the true, but into heaven itself" (9:24). Rationale: the engine id was minted in the rollout after this book's tag passes; 9:1-10 is the NT's fullest sanctuary description and 9:11, 24 teach where God's true dwelling is — honest substantial presence of the dwelling-of-God register (the pack's own header reads "tabernacle → temple"). Chapter lands at 8 — the hard ceiling; every tag independently clears the bar.

Drops: none.

### Anchor-extension candidates

- `the-house-of-god` — Hebrews 9:1-5 — "even the first covenant had ordinances of divine service and an earthly sanctuary" (9:1) — proposed weight 0.7. The pack's anchors are all temple-era texts (2 Chr, Psalms, Ezra, Haggai, Ezekiel, Eph 2); this is the tabernacle end of its own tabernacle-to-temple arc.

### Lexicon candidates

- `the-house-of-god` — proposed terms: "tabernacle"; "the tabernacle in the bible"; "holy of holies". Realistic queries: "what was the tabernacle", "tabernacle in the Bible", "what is the Holy of Holies". No engine lexicon carries a tabernacle term (verified by grep at e762d1c — the word appears only in comments, plus `appointed-feasts`' phrase-distinct "feast of tabernacles"); the 9:1-5 anchor extension above gives the terms an honest landing.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `sacrifice-and-atonement` → ROUTED to corpus-blocked roster row 1 — Heb 9:11-14, 22, 26 ("apart from shedding of blood there is no remission"; "to put away sin by the sacrifice of himself"). Prime material for that blocked row; carried here by the `the-cross` / `forgiveness-of-sins` tags. Not duplicated as a proposal.
- `mediator` → ROUTED to corpus-blocked roster row 24 — Heb 9:15 "he is the mediator of a new covenant" (the book doc's Decisions #16 already flags 8:6; 9:15; 12:24 for that row's curator).
- `inheritance` → ROUTED to corpus-blocked roster row 26 — Heb 9:15 "that those who have been called may receive the promise of the eternal inheritance" — the NT in-Christ register the row records as a different design to decide at re-pin.

### Decisions record

- `clean-and-unclean` considered for 9:13 ("sanctify to the cleanness of the flesh") and 9:10 ("various washings"), declined: argumentative use of the purity ritual, not purity-law teaching.
- Ceiling record: the `the-house-of-god` add takes the chapter to the hard ceiling of 8. No ninth candidate cleared the presence bar, so no yield entries beyond the declines above.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## Hebrews 10

### Applied-tag deltas

Current tags (book doc): `the-cross`, `forgiveness-of-sins`, `gathering-together`, `divine-judgment`, `do-not-lose-heart`, `heavenly-reward`, `priesthood`, `backsliding` (8 — at the hard ceiling).

- KEEP `the-cross` — "we have been sanctified through the offering of the body of Jesus Christ once for all" (10:10); "one sacrifice for sins forever" (10:12).
- KEEP `forgiveness-of-sins` — "I will remember their sins and their iniquities no more." (10:17); "Now where remission of these is, there is no more offering for sin." (10:18).
- KEEP `gathering-together` — "not forsaking our own assembling together, as the custom of some is, but exhorting one another" (10:25).
- KEEP `divine-judgment` — "a certain fearful expectation of judgment" (10:27); "It is a fearful thing to fall into the hands of the living God." (10:31).
- KEEP `do-not-lose-heart` — "Therefore don’t throw away your boldness, which has a great reward." (10:35); "For you need endurance" (10:36).
- KEEP `heavenly-reward` — "knowing that you have for yourselves a better possession and an enduring one in the heavens" (10:34); boldness "has a great reward" (10:35).
- KEEP `priesthood` — "Every priest indeed stands day by day serving and offering often the same sacrifices" (10:11); "having a great priest over God’s house" (10:21).
- KEEP `backsliding` — "For if we sin willfully after we have received the knowledge of the truth, there remains no more a sacrifice for sins" (10:26) — reported as written, beside "don’t throw away your boldness" (10:35), per the book doc's Decisions #11.

Adds: none. Drops: none.

### Anchor-extension candidates

none — the chapter's key spans are already anchored (`priesthood` and `worship` 10:19-22, `gathering-together` 10:24-25, `do-not-lose-heart` 10:35, `vengeance` 10:30, `backsliding` 10:26-27, `gods-faithfulness` 10:23).

### Lexicon candidates

none

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `sacrifice-and-atonement` → ROUTED to corpus-blocked roster row 1 — Heb 10:1-18 ("it is impossible that the blood of bulls and goats should take away sins", 10:4; "by which will we have been sanctified through the offering of the body of Jesus Christ once for all", 10:10). Carried here by the `the-cross` tag. Not duplicated as a proposal.

### Decisions record (cap yields — chapter at the hard ceiling; §11.6 order applied, no silent drops)

- `vengeance` — genuinely present at 10:30 ("Vengeance belongs to me. I will repay") and its pack anchors that very verse; yielded at the ceiling as thin single-verse, and `divine-judgment` carries the warning's register — the anchor already serves the query family.
- `gods-faithfulness` — 10:23 "for he who promised is faithful"; yielded at the ceiling as thin single-verse (its Hebrews home is ch. 6).
- `worship` — 10:19-22 drawing-near exhortation (its pack anchors the span); yielded at the ceiling: the access teaching is carried by `priesthood`'s tag and the existing pack anchor.
- `faith` — 10:38 "But the righteous one will live by faith."; stays off per book-doc Decisions #14 (the chapter's thrust is endurance, already tagged; ch. 11 is faith's home).
- The withheld `endurance` disposition (§3.4 of the declines file — covered by `do-not-lose-heart` + `remembered-joy-in-trials`) re-checked against 10:32-39: still holds; no overturn evidence.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## Hebrews 11

### Applied-tag deltas

Current tags (book doc): `faith`, `remembered-faith-as-assurance`, `hope-in-god`, `suffering-for-christ`, `creation`, `sojourners-and-strangers` (6 — at the soft cap).

- KEEP `faith` — "Now faith is assurance of things hoped for, proof of things not seen." (11:1); "Without faith it is impossible to be well pleasing to him" (11:6).
- KEEP `remembered-faith-as-assurance` — the chapter carries the remembered verse itself: "Now faith is assurance of things hoped for, proof of things not seen." (11:1).
- KEEP `hope-in-god` — "he was looking for the city which has foundations, whose builder and maker is God" (11:10); "But now they desire a better country, that is, a heavenly one." (11:16).
- KEEP `suffering-for-christ` — "considering the reproach of Christ greater riches than the treasures of Egypt" (11:26); "Others were tried by mocking and scourging, yes, moreover by bonds and imprisonment." (11:36).
- KEEP `creation` — "By faith we understand that the universe has been framed by the word of God" (11:3).
- KEEP `sojourners-and-strangers` — "having confessed that they were strangers and pilgrims on the earth" (11:13); "they desire a better country, that is, a heavenly one" (11:16).
- ADD `resurrection-of-the-dead` — "Women received their dead by resurrection. Others were tortured, not accepting their deliverance, that they might obtain a better resurrection." (11:35); "concluding that God is able to raise up even from the dead" (11:19). Rationale: this engine id entered the vocabulary in the 2026-08-26 rollout, post-dating the book doc's critic-round-1 M6 drop of `resurrection` — a drop made precisely because that label is Easter-scoped ("He is risen") and this chapter shows raisings and resurrection hope, not the risen Christ. This id's register is the general resurrection ("resurrection of the dead; what happens to our bodies when we die"), which is exactly what 11:19 and 11:35 carry; its pack anchors kindred hope-texts (Dan 12:2, Job 19:25-27, Acts 24:15). The M6 drop is honored, not overturned: `resurrection` stays off; the motif the book doc preserved ("Raised from the dead — a better resurrection") now has a vocabulary home. Chapter lands at 7 (under the ceiling).

Drops: none.

### Anchor-extension candidates

- `resurrection-of-the-dead` — Hebrews 11:35 — "Women received their dead by resurrection." ... "that they might obtain a better resurrection" — proposed weight 0.7. The OT-raisings-plus-better-resurrection text; the pack has no Hebrews anchor.

### Lexicon candidates

- `resurrection-of-the-dead` — proposed terms: "a better resurrection". Realistic queries: "a better resurrection meaning", "women received their dead by resurrection", "resurrection hope in the Old Testament". The phrase is Heb 11:35's own and no engine lexicon carries it; the anchor extension above gives it an honest landing.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `persecuted-for-gods-word` → ROUTED to corpus-blocked roster row 4 — Heb 11:35-38 ("They were stoned. They were sawn apart. ... being destitute, afflicted, ill-treated") — the OT-faithful-persecuted register that row's spine (Jeremiah, Daniel, Esther) collects; the row also records the G4 boundary (bare "persecution" owned by `suffering-for-christ`, which tags this chapter). Not duplicated as a proposal.

### Decisions record

- `testing` considered for 11:17 ("By faith, Abraham, being tested, offered up Isaac.") — declined as a tag: one verse, topic not teaching; the pack already anchors Heb 11:17 and the anchor serves the query family.
- `heavenly-reward` considered for 11:6 ("a rewarder of those who seek him") and 11:26 ("he looked to the reward"), declined: two instrumental verses inside the roll-call; the id's Hebrews home is ch. 10.
- `passover` considered for 11:28 ("By faith he kept the Passover and the sprinkling of the blood"), declined: a single narrative mention, no feast teaching.
- No candidate yielded to the cap (7 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: no

## Hebrews 12

### Applied-tag deltas

Current tags (book doc): `remembered-looking-to-jesus`, `the-lords-discipline`, `do-not-lose-heart`, `holiness`, `worship`, `backsliding` (6 — at the soft cap).

- KEEP `remembered-looking-to-jesus` — the chapter carries the remembered verse itself: "looking to Jesus, the author and perfecter of faith" (12:2); "let’s run with perseverance the race that is set before us" (12:1).
- KEEP `the-lords-discipline` — "for whom the Lord loves, he disciplines, and chastises every son whom he receives" (12:6); "yet afterward it yields the peaceful fruit of righteousness to those who have been trained by it" (12:11).
- KEEP `do-not-lose-heart` — "that you don’t grow weary, fainting in your souls" (12:3); "Therefore lift up the hands that hang down and the feeble knees" (12:12).
- KEEP `holiness` — "Follow after peace with all men, and the sanctification without which no man will see the Lord" (12:14); "that we may be partakers of his holiness" (12:10).
- KEEP `worship` — "let’s have grace, through which we serve God acceptably, with reverence and awe" (12:28).
- KEEP `backsliding` — Esau "found no place for a change of mind though he sought it diligently with tears" (12:17); "See that you don’t refuse him who speaks." (12:25) — reported as written, per the book doc's Decisions #11.
- ADD `zion-city-of-god` — "But you have come to Mount Zion and to the city of the living God, the heavenly Jerusalem" (12:22). Rationale: the engine id was minted in the rollout after this book's tag passes, and its anchors are all Psalms — Heb 12:22-24 is the NT's own Mount-Zion text and the climax of the chapter's two-mountains contrast (12:18-24), a main movement of the chapter. A "mount zion" / "city of God" searcher is honestly served. Chapter lands at 7 (under the ceiling).

Drops: none.

### Anchor-extension candidates

- `zion-city-of-god` — Hebrews 12:22-24 — "you have come to Mount Zion and to the city of the living God, the heavenly Jerusalem" — proposed weight 0.85. The pack's only non-Psalms candidate; completes the earthly-to-heavenly arc its Psalms anchors begin.
- `do-not-lose-heart` — Hebrews 12:3 — "that you don’t grow weary, fainting in your souls" — proposed weight 0.7. Kept to v3: `remembered-looking-to-jesus` anchors 12:1-2 — adjacent claims, no shared span (record the adjacency in the YAML comment).

### Lexicon candidates

- `kingdom-of-heaven` — proposed terms: "a kingdom that cannot be shaken"; "unshakable kingdom". Realistic queries: "unshakable kingdom verse", "receiving a kingdom that cannot be shaken meaning". No engine lexicon carries the phrase (verified by grep at e762d1c); note the WEB reads "a Kingdom that can’t be shaken" (12:28) — carry both surface forms or rely on the tokenizer's contraction handling, the curator's call.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `mediator` → ROUTED to corpus-blocked roster row 24 — Heb 12:24 "to Jesus, the mediator of a new covenant" — the very verse the roster row already notes as in-corpus material for the re-pin curator. Not tagged, not duplicated as a proposal.

### Decisions record

- `angels` on 12:22 stays off per the book doc's pass-16 skip (a single element of the Zion panorama); the `zion-city-of-god` add carries the passage.
- `covenant` considered for 12:24, declined as a tag: single verse; its pack already anchors Heb 12:24 and the id's Hebrews homes are chs. 8-9.
- `pastoral-sexual-purity` considered for 12:16 ("lest there be any sexually immoral person or profane person, like Esau"), declined: one adjective inside the Esau warning, no teaching substance in that register.
- `kingdom-of-heaven` considered as a tag for 12:28 ("receiving a Kingdom that can’t be shaken"), declined: single verse at the close of the Zion passage; recorded as the lexicon candidate above instead.
- No candidate yielded to the cap (7 of 8).

### Per-verse refinement

PER-VERSE REFINEMENT: yes (subdivided in book doc)

## Hebrews 13

### Applied-tag deltas

Current tags (book doc): `loving-others`, `hospitality`, `godly-marriage`, `contentment`, `praise`, `benediction`, `leadership`, `sojourners-and-strangers` (8 — at the hard ceiling).

- KEEP `loving-others` — "Let brotherly love continue." (13:1); "Remember those who are in bonds, as bound with them" (13:3).
- KEEP `hospitality` — "Don’t forget to show hospitality to strangers, for in doing so, some have entertained angels without knowing it." (13:2).
- KEEP `godly-marriage` — "Let marriage be held in honor among all, and let the bed be undefiled" (13:4).
- KEEP `contentment` — "Be free from the love of money, content with such things as you have" (13:5).
- KEEP `praise` — "let’s offer up a sacrifice of praise to God continually, that is, the fruit of lips which proclaim allegiance to his name" (13:15).
- KEEP `benediction` — "Now may the God of peace, who brought again from the dead the great shepherd of the sheep with the blood of an eternal covenant, our Lord Jesus" (13:20), "make you complete in every good work to do his will" (13:21). (PR #43 id — Jesse-ratified per §11.5.)
- KEEP `leadership` — "Remember your leaders, men who spoke to you the word of God" (13:7); "Obey your leaders and submit to them, for they watch on behalf of your souls" (13:17).
- KEEP `sojourners-and-strangers` — "For we don’t have here an enduring city, but we seek that which is to come." (13:14).

Adds: none. Drops: none.

### Anchor-extension candidates

- `gods-unchanging-nature` — Hebrews 13:8 — "Jesus Christ is the same yesterday, today, and forever." — proposed weight 0.9. The "Jesus never changes" query family's keystone verse. The pack's own YAML comment records that the phrase "the same yesterday today and forever" was left out of its lexicon ONLY because Heb 13:8 was not a map anchor ("an unanchored lexicon phrase would point the concept at a verse it cannot honestly chip") — this extension supplies exactly the missing anchor. Note for the curator: the pack's Ps 102:25-27 anchor comment already observes that Hebrews applies those words to the Son (1:10-12, anchored under `supremacy-of-christ`).

### Lexicon candidates

- `gods-unchanging-nature` — proposed terms: "the same yesterday today and forever"; "jesus never changes". Realistic queries: "Jesus Christ is the same yesterday today and forever meaning", "does Jesus change", "Jesus never changes". Contingent on the Heb 13:8 anchor extension above, per the pack's own recorded rule.
- `praise` — proposed terms: "sacrifice of praise". Realistic queries: "what is a sacrifice of praise", "offering a sacrifice of praise". No engine lexicon carries the phrase (verified by grep at e762d1c); `praise` already anchors Heb 13:15, so the term lands honestly with no new anchor needed.

### New-concept candidates

none

### Decline-overturn proposals

none

### Routing (corpus-blocked roster)

- `sacrifice-and-atonement` → ROUTED to corpus-blocked roster row 1 — Heb 13:11-12 ("Therefore Jesus also, that he might sanctify the people through his own blood, suffered outside of the gate.") — the outside-the-camp sacrifice typology. Not duplicated as a proposal.

### Decisions record (cap yields — chapter at the hard ceiling; §11.6 order applied, no silent drops)

- `gods-unchanging-nature` — genuinely present at 13:8 ("Jesus Christ is the same yesterday, today, and forever."); yielded at the ceiling as thin single-verse; recorded instead as the anchor-extension + lexicon candidates above, which serve the query family better than a ninth-place tag could.
- `fear-not` (13:6, its pack's own Hebrews anchor), `honesty` (13:18, its pack's own anchor), `presence-of-god` and `loneliness` (13:5, both packs' anchors), `resurrection` (13:20, considered and not used per book-doc Decisions #15) — all yielded at the ceiling as thin single-verse; each is already served by an existing pack anchor on the very verse, so no query family is left homeless.
- The book doc's Decisions #13 drops (`fear-not`, `generosity`, `praying-for-leaders`, `gods-faithfulness`) remain off, unchanged.

### Per-verse refinement

PER-VERSE REFINEMENT: yes (both)

## Book totals

### Counts per candidate class

- **Applied-tag deltas:** 74 keeps, 5 adds, 0 drops.
  - Adds: `hardness-of-heart` (Heb 3), `gods-unchanging-nature` (Heb 6), `the-house-of-god` (Heb 9), `resurrection-of-the-dead` (Heb 11), `zion-city-of-god` (Heb 12) — all five are engine ids minted in the 2026-08-25/26 apologetics-and-rollout waves, post-dating every tag pass recorded in the book doc; each add carries in-chapter WEB quotes above.
- **Anchor-extension candidates:** 13 — `ascension` Heb 1:3 (0.7); `pastoral-freedom-from-bondage` Heb 2:14-15 (0.85); `hardness-of-heart` Heb 3:12-13 (0.85); `spiritual-growth` Heb 5:12-14 (0.85); `prayer` Heb 5:7 (0.7); `gods-unchanging-nature` Heb 6:17-18 (0.75); `oaths-and-vows` Heb 7:20-21 (0.7); `covenant` Heb 8:8-12 (0.9); `the-house-of-god` Heb 9:1-5 (0.7); `resurrection-of-the-dead` Heb 11:35 (0.7); `zion-city-of-god` Heb 12:22-24 (0.85); `do-not-lose-heart` Heb 12:3 (0.7); `gods-unchanging-nature` Heb 13:8 (0.9).
- **Lexicon candidates:** 10 — `mortality` (fear of death, ch. 2); `spiritual-growth` (milk and solid food, ch. 5); `gods-faithfulness` (god cannot lie, ch. 6); `priesthood` (melchizedek, ch. 7); `covenant` (law written on the heart / old vs new covenant, ch. 8); `the-house-of-god` (tabernacle / holy of holies, ch. 9); `resurrection-of-the-dead` (a better resurrection, ch. 11); `kingdom-of-heaven` (unshakable kingdom, ch. 12); `gods-unchanging-nature` (the same yesterday today and forever, ch. 13); `praise` (sacrifice of praise, ch. 13).
- **New-concept candidates:** 0 (none — every genuine Hebrews theme has a home in the 239 engine ids, the adopted display ids, or a corpus-blocked roster row; the book doc's three staged candidates were all resolved at its 2026-08-23 delivery and nothing here reopens them).
- **Decline-overturn proposals:** 0 (none — the §3.4 withheld `endurance` disposition was re-checked against Heb 10:32-39 and 12:1-13 and holds; no §3 decline is contradicted by new WEB evidence).

### Ceiling-marked chapters (hard ceiling of 8)

- Hebrews 9 (reaches 8 with the `the-house-of-god` add)
- Hebrews 10 (already at 8)
- Hebrews 13 (already at 8)

### Routed items (corpus-blocked roster)

- Row 1 `sacrifice-and-atonement` — Heb 2:17; 9:11-14, 22, 26; 10:1-18; 13:11-12.
- Row 4 `persecuted-for-gods-word` — Heb 11:35-38.
- Row 24 `mediator` — Heb 8:6; 9:15; 12:24.
- Row 26 `inheritance` — Heb 9:15.
- Row 38 `new-heart` — Heb 8:10.

### Per-verse refinement roster

- yes (both): Hebrews 9, 10, 13.
- yes (subdivided in book doc): Hebrews 2, 3, 4, 5, 6, 12.
- no: Hebrews 1, 7, 8, 11.

### Notes

- Vocabulary authority: the canonical `tag-apply/adopted-concepts.md` (161 ids) was adopted mid-sweep per the coordinator's notice; it matches the sweep-kit's reconstructed list for every id used or referenced in this ledger, so no correction append was needed.
- Heb 1:14 erratum honored throughout: "serving spirits" (WEB), never "ministering spirits".
- Nothing in this ledger touches search ranking, engine vocabulary, ENGINE_VERSION, or the determinism contract (§11.7); anchor/lexicon candidates are curation input gated by the fixtures/gauntlet/PR covenant.

## Round 2 — corrections (2026-08-26)

Critic round 1 returned one objection; everything else verified clean. Per §9 this
section corrects by append — no earlier bytes of this ledger were altered, and the
five adds themselves stand as the critic confirmed. Where this section conflicts
with the three locations it names, this section governs.

### Objection: mint-provenance claim false for two of the five adds

**Affected locations (all three carry the same false clause):**
1. Hebrews 6 deltas — the `gods-unchanging-nature` ADD rationale ("minted in the
   apologetics wave / rollout after this book's tag passes").
2. Hebrews 11 deltas — the `resurrection-of-the-dead` ADD rationale ("entered the
   vocabulary in the 2026-08-26 rollout").
3. Book totals, counts bullet — "all five are engine ids minted in the
   2026-08-25/26 apologetics-and-rollout waves, post-dating every tag pass
   recorded in the book doc".

**Correct provenance (verified against git at e762d1c, creating commits):**
- `gods-unchanging-nature.yaml` and `resurrection-of-the-dead.yaml` were created
  in commit caf9fe3 (PR #51, apologetics wave, merged 2026-08-25 14:06) —
  BEFORE the book doc's tag passes #17 (apologetics tag-application pass,
  2026-08-25) and #18 (new-mint tag application after PR #51's merge,
  2026-08-25). The "post-dating every tag pass" clause is therefore FALSE for
  these two ids, and the Hebrews 11 rationale's "2026-08-26 rollout" wave
  attribution is wrong (PR #51 was 2026-08-25).
- `hardness-of-heart.yaml` and `zion-city-of-god.yaml` were created in commit
  6367855 (PR #60, 2026-08-26), and `the-house-of-god.yaml` in commit 8c8b78d
  (PR #54, 2026-08-26) — for these three the post-dates-every-tag-pass claim
  holds as written.
- The Hebrews 11 rationale's separate claim — that the id's mint post-dates the
  book doc's critic-round-1 M6 drop of `resurrection` (2026-08-23) — remains
  TRUE and unchanged.

**Substantive rationale restated on the accurate basis (both adds):** book-doc
passes #17 and #18 were scoped passes, not full-vocabulary sweeps — #17 applied
only the approved apologetics concept-map assignments for this book
(`supremacy-of-christ` ch. 1, `power-of-gods-word` ch. 4, one mapped skip), and
#18 applied only the map's new-mint pointer (`honor-the-son` ch. 1). The map
named neither `gods-unchanging-nature` for Hebrews 6 nor
`resurrection-of-the-dead` for Hebrews 11, so no prior pass ever evaluated
these two ids against these chapters — this sweep is the first full-vocabulary
evaluation of Hebrews 6 and 11 against them. The presence-bar cases quoted in
the two ADD entries (6:17-18; 11:19, 35) are unaffected and stand.

**Not changed:** the five adds, all keeps, all candidates, routings, ceiling
markers, and totals counts — the critic confirmed these stand; only the
provenance wording at the three locations above is corrected.

## Round 3 — correction (2026-08-26)

Critic round 2 returned one minor objection, against the Round 2 section itself;
everything else verified clean. Per §9 this section corrects by append — no
earlier bytes altered. Where this section conflicts with the Round 2 section's
first "Correct provenance" bullet, this section governs.

### Correction: pass ordering around the caf9fe3 mint

- **(a) Ordering corrected.** The Round 2 bullet claimed caf9fe3 (PR #51, merged
  2026-08-25 14:06) landed BEFORE book-doc tag passes #17 AND #18. Wrong for
  #17: caf9fe3 minted `gods-unchanging-nature` and `resurrection-of-the-dead`
  AFTER pass #17 and before only pass #18. The book doc's own narrative shows
  it — Decisions #17 defers `honor-the-son` as a "gap row" with a forward
  pointer (so at pass-#17 time the id was not yet vocabulary), and #18 applies
  it "now that the id is vocabulary" after "PR #51 (merged to main at caf9fe3,
  2026-08-25)"; `honor-the-son.yaml` was created in that same caf9fe3 and is
  absent from the adopted-161 list. Six sibling book docs (acts #5,
  ecclesiastes #17, isaiah #65, job #18, john #6, matthew #5) record the same
  sequence — their apologetics passes "held back as vocabulary-blocked" the
  candidates their new-mint passes then re-dispositioned. The falsity of the
  ledger body's "post-dating every tag pass" clause for the two ids therefore
  rests on pass #18 alone — which suffices: #18 ran after the mint, so the
  clause remains false for them, exactly as Round 2 concluded.
- **(b) Verification claim narrowed.** "Verified against git" in the Round 2
  section covers only the creating-commit identity and timestamp (caf9fe3,
  2026-08-25 14:06, for both YAMLs). Git cannot verify when the book-doc passes
  ran; the pass ordering above is sourced to the book doc's #17/#18 narrative
  and the sibling docs' held-back-as-vocabulary-blocked records, not to git.
- **(c) Nothing substantive changes.** The five adds, all keeps, all anchor and
  lexicon candidates, routings, ceiling markers, and totals counts are
  unaffected. Round 2's restated rationale also stands unchanged on this
  corrected ordering — passes #17/#18 were scoped to the apologetics
  concept-map assignments, which named neither id for Hebrews 6 or 11, so this
  sweep remains the first full-vocabulary evaluation of those chapters against
  the two ids.
