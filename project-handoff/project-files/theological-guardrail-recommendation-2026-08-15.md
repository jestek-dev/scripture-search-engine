# A Theological Guardrail for Verse Selections
## Research & Recommendation — 2026-08-15

**The question (from Jesse):** study the statements of faith of The Gospel Coalition (TGC), The Village Church (TVC), and Lighthouse Church, Glen Burnie (LH); assess whether a doctrinal guardrail gating the engine's verse selections is important and would help. Hard requirement: no prosperity gospel, no theologically wrong results.

**Short answer: yes, it is worth building — as a written standard, review records, and test fixtures, not as new engine machinery.** The engine already has the right bones: fixtures can forbid a verse from ranking for a query, and 23 of the 70 existing fixture files already use that. What is missing is (1) a written doctrinal basis, so a call like rejecting Mike Murdock's seed-faith book is a repeatable, citable standard instead of one-off vigilance; (2) a recorded doctrinal review per source; and (3) fixtures encoding the prosperity-gospel negatives specifically. The part no document can automate is human review — the guardrail makes that review consistent and visible; it does not replace it.

---

## 1. What is true in the repo today (verified 2026-08-15 at main)

- **Theologically wrong results already ship.** "Comforter" returns Job 16:2 first — the verse where Job *mocks* his comforters ("miserable comforters are you all"). "It is well with my soul" surfaces Jeremiah 4:10. Nothing at today's main would catch either: there is no comfort concept, no fixture for those queries. Both fixes are already scheduled in the 2026-08-14 implementation plan (Phase 1), so the guardrail is not needed for those two — but they prove the failure class is real, not hypothetical.
- **The forbidden-verse mechanism exists and is enforced.** Corpus fixtures support `mustNotRank` — "this verse must not appear in the top N for this query, and here is why" — checked by gate G3 on every run. The pastoral fixture family (grief, divorce, abuse, suicide — 23 files) already uses it. **No fixture anywhere asserts a prosperity-gospel negative.**
- **The Murdock rejection had no written standard behind it.** The 2026-08-15 books assessment correctly flagged "31 Scriptures Every Achiever Should Memorize" as prosperity proof-texting (Achievement→John 14:12, Prosperity→Job 36:11) and ruled "never cite as a source" — but the basis for that ruling lives in one memory file, not in the repo. The next assessor has nothing to cite.
- **The covenant already draws the right line.** CLAUDE.md #6: the engine "never adjudicates" theology. But curation-side theological judgment is institutionalized and *attributed*: the `editorial` source manifest exists precisely so LH's "own theological judgment" is a cited source, not a hidden weight; manifests record named, dated human rulings ("decided by Jesse 2026-07-29"); fixtures encode doctrinal expectations as hard binary assertions. The guardrail extends this pattern; it does not bend it.
- **The gauntlet's 12-gate roster is schema-locked.** New checks merge into existing gates (concept coverage merged into G3); a "13th gate" is the wrong shape.

## 2. The three statements of faith

### The Gospel Coalition — Confessional Statement
13 articles; broadly Reformed evangelical, deliberately trans-denominational. Calvinist (§5, election) and complementarian (§3) *in the confession proper*; deliberately **neutral on baptism mode** and church polity (§12) so Baptists and Presbyterians can both sign. Its §6 defines the gospel tightly: "the gospel is not proclaimed if Christ is not proclaimed, and the authentic Christ has not been proclaimed if his death and resurrection are not central." Its companion Theological Vision for Ministry is the closest any of the three comes to an anti-prosperity ethic: "Christ wins our salvation through losing, achieves power through weakness and service, and comes to wealth through giving all away."

### The Village Church — Statement of Faith
Evangelical, Reformed, Baptist; affirms the Apostles', Nicene, and Chalcedonian creeds by name. Its architecture is the most useful thing here: it separates required **Doctrines** from self-labeled **Distinctives** (complementarianism, Calvinist soteriology, continuationist spiritual gifts, believers' baptism by immersion) — the church's own admission that these are secondary to the core.

### Lighthouse Church, Glen Burnie — Statement of Faith
Ten short articles; generic conservative evangelical, baptistic. Believers' immersion is in the core statement; adds sanctity-of-life and man-woman marriage articles. **Silent** on election, gender roles, spiritual gifts, millennium, even atonement mechanism. Salvation is "a gift of God brought to humans by grace alone" — its one implicit anti-prosperity handle.

### The shared core (all three affirm, in their own words)
1. Scripture — inspired, inerrant, authoritative
2. Trinity — one God, three persons; full deity of Christ and the Spirit
3. Christ — incarnation, virgin birth, sinless life, atoning death, bodily resurrection
4. Universal sinfulness and need of salvation
5. **Salvation by grace alone through faith — a gift, not a technique**
6. Humanity in God's image, with intrinsic dignity
7. The church — all believers, expressed in local congregations
8. Two ordinances — baptism and the Lord's Supper
9. Christ's personal, visible return; judgment; eternal states

This lands almost exactly on the National Association of Evangelicals statement of faith — which is deliberately uncopyrighted so organizations can adopt it. A baseline does not need to be drafted from scratch.

### Where they diverge (the secondary points)

| Topic | TGC | Village Church | Lighthouse |
|---|---|---|---|
| Election / Calvinism | In the confession proper | Labeled a Distinctive | Silent |
| Complementarian gender roles | In the confession proper | Labeled a Distinctive | Silent |
| Baptism mode/subjects | Deliberately unspecified | Distinctive: believers' immersion | Believers' immersion in the core |
| Spiritual gifts | Silent | Distinctive: continuationist | Silent |
| Marriage / sanctity of life | Not in the confession | Not in the statement | In the core |
| Hell | "Eternal conscious punishment" | "Eternal punishment" | "Judge all people" only |

No one of the three can be adopted whole without importing a secondary position another consumer congregation doesn't confess. Notably, TGC — the "broad coalition" document — is the *most* specific on election and gender roles, while tiny Lighthouse is silent on both.

## 3. The prosperity-gospel criterion

**None of the three statements names the prosperity gospel.** They condemn it only by implication (grace-not-technique, cross-centered gospel). The document that names it is the **Lausanne Movement's "Akropong statement" on the prosperity gospel** (Lausanne Theology Working Group, Akropong, Ghana, 2008–09; https://lausanne.org/content/a-statement-on-the-prosperity-gospel). It defines prosperity teaching (a right to health and wealth obtained through positive confession and "sowing seeds"), rules that it is "false and gravely distorting of the Bible" — a "false gospel" — and is carefully balanced: it affirms God's miraculous power and that material blessing can be biblical, while denying that God's power is a technique, that spiritual welfare equals material welfare, or that poverty and illness signal weak faith. Two quotable lines: "Popularity is no proof of truth," and prosperity teaching "tends to victimize the poor by making them feel that their poverty is their own fault."

A written source-admission criterion can therefore cite: **TGC §6** as the positive test (a source's framing of a passage must be compatible with a gospel whose content is Christ crucified and risen, not material return), the **Akropong denials** as the negative test, and **shared-core point 5** (grace alone — confessed by all three churches) as proof the criterion is the consumers' own doctrine, not an editorial preference.

## 4. Recommended shape — four pieces

**1. A written doctrinal basis: `docs/DOCTRINAL-BASIS.md`.** Two tiers, mirroring The Village Church's own Doctrines/Distinctives split:
- *Admission baseline:* the nine-point shared core (≈ NAE statement). A source whose verse-topic framing contradicts this core is not admitted.
- *Named exclusion criteria:* prosperity/seed-faith teaching, defined by citing Akropong + TGC §6. Written so the Murdock verdict becomes the worked example.
- *Explicit non-criteria:* baptism mode, election/Calvinism vs. Arminianism, spiritual gifts, gender roles, millennial views, denominational polity. The engine carries trustworthy sources from across these lines and never adjudicates them. This list is as load-bearing as the criteria — it is what keeps the guardrail from quietly becoming a denominational filter.

**2. A doctrinal review record per source.** One row per source (extending the existing manifest/inventory precedent): who reviewed, when, verdict, which criterion applied. The gauntlet checks that the record *exists* for every source — never that the theology is "correct." That presence-check is exactly the pattern the Phase 1 plan already introduces for lexicon decisions, and it keeps CLAUDE.md #6 intact: judgment stays human and attributed; the machine only refuses to ship an unreviewed source. Backfill for the 19 existing manifests is mostly quick (public-domain reference works from mainstream traditions).

**3. A doctrine-negative fixture family.** Extend the pastoral `mustNotRank` pattern to the prosperity class: queries like "prosperity," "success," "wealth," "sow a seed," "breakthrough," "abundance" — each with forbidden proof-texts (e.g., Job 36:11, Prov 18:16 as seed-faith transaction) and a `why` naming the criterion, plus positive expectations pointing at contentment/stewardship/suffering passages. Also generalizable to other known failure classes (sense-inversion: a fixture family for hymn phrases and bare words). Fixtures-first is already the covenant, so this is the guardrail in its most native form: **doctrine encoded as tests**.

**4. The process stays human, and honestly so.** The per-PR "check the theology" checklist and Jesse's merge remain the actual gate. A document and fixtures make his review consistent, citable, and teachable to future assessors; they cannot replace reading a source and judging it. Optional strengthening: an independent second theological reader for `editorial`-voice packs, mirroring the independent probe-baseline reviewer the governance work already introduces.

## 5. What the guardrail should NOT do

- **No runtime filtering, no theology scoring.** The engine reports what named sources say; it never grades doctrine. A "doctrinal correctness score" would violate CLAUDE.md #6 and be theater besides.
- **Do not adopt any one statement wholesale.** Each imports secondary positions (TGC: election + complementarianism in the core; LH: immersion; TVC: continuationism as a distinctive).
- **Do not gate sources on secondary doctrines.** Matthew Henry — already admitted — was a paedobaptist Presbyterian; an immersionist criterion would retroactively impugn one of the best sources in the artifact while doing nothing against prosperity teaching. Prosperity gospel is not an Arminian error, a Calvinist error, or a charismatic error per se; Akropong treats it as a distortion of the gospel itself, which is why it is gateable and the secondary points are not.
- **Do not add a 13th gauntlet gate.** The roster is a schema-locked contract; the presence-check rides inside an existing gate, per the repo's own merge pattern.
- **Do not oversell it.** A checklist catches the Murdocks (explicit seed-faith framing). Subtler distortion — a devotional that pairs true verses with a self-help frame — will still come down to a human reading carefully. Say so in the document.

## 6. Decisions only Jesse can make

1. **The anchor.** Recommended: the two-tier basis above (shared core ≈ NAE + Akropong for prosperity). Alternatives: adopt TGC whole (imports election and complementarianism into a tool three apps consume) or LH's own statement (his church's voice, but thin — silent on most of what needs deciding). The three statements genuinely differ on election, gender roles, baptism, and gifts; whatever is chosen, the differences should be chosen knowingly, not inherited.
2. **Whose voice the document speaks in.** Lighthouse's editorial confession, or a deliberately trans-congregational baseline? Maskil, LH Worship Setlist, and Versed all consume this artifact; the recommendation (shared core) is the trans-congregational option.
3. **Every per-source verdict.** The record template can be drafted; the rulings are his.
4. **Whether to add a second theological reader**, and who.

## 7. Sequencing

Phase 0 (CI fix, governance) is executing now and touches none of the relevant files. The natural landing spot is alongside Phase 1's `lexicon-concepts` work, which already fixes the two known sense-inversions and creates the decision-inventory mechanism the review record would reuse. The doctrinal basis document can be drafted immediately (docs-only, no conflicts); the prosperity fixture family follows the fixtures-first rule and can land with or before the related concept work. Nothing here competes with the existing plan — it fills the one layer the plan doesn't have: a written standard for *which sources get in at all*.

---

*Sources: TGC Foundation Documents (thegospelcoalition.org/about/foundation-documents/); The Village Church Statement of Faith (thevillagechurch.net/our-beliefs/statement-of-faith); Lighthouse Church Statement of Faith (lhchurch.vercel.app/about#statement-of-faith); Lausanne "A Statement on the Prosperity Gospel" (lausanne.org/content/a-statement-on-the-prosperity-gospel); NAE Statement of Faith (nae.org/statement-of-faith/); repo verification at main commit 5033517, 2026-08-15. Note: the TGC statement was read from the web version — the attached PDF was not found in the project files; worth a spot-check that the attached PDF matches the published confessional statement.*
