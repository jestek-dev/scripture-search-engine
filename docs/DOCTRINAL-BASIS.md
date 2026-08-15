# Doctrinal basis for source admission

**Date:** 2026-08-15
**Status:** Drafted for Jesse's review. Every doctrinal sentence in this
document is a claim he must approve, reject, or amend — the document has no
authority until he has. The criteria here were recommended in the 2026-08-15
theological-guardrail research; the anchor choice (the shared core below,
rather than any one congregation's statement adopted whole) is the
recommendation, not yet a ruling.

---

## 1. Purpose and scope

This document is the written standard for one decision: **whether a curated
source — and the verse-topic framings it carries — may be admitted into the
artifact at all.** Before it existed, that call was made correctly but
unrepeatably: the 2026-08-15 books assessment rejected a seed-faith devotional
with nothing citable behind the rejection. The next assessor would have had to
re-derive the standard from scratch. Now they cite this file.

What this document does **not** do:

- **It does not touch runtime ranking.** CLAUDE.md #6: the engine "never
  adjudicates" theology. The engine reports that a named source associates a
  passage with a concept, and says which source. There is no doctrinal score,
  no runtime filter, and none is wanted — a "doctrinal correctness" weight
  would be exactly the adjudication the covenant forbids.
- **It does not hide that curation-side judgment exists.** The precedent is
  the `editorial` source manifest (`pipeline/manifests/editorial.json`), which
  exists so that LH's "own theological judgment" is a *cited source* rather
  than a hidden weight. This document extends that pattern to admission:
  judgment stays human, named, and attributed. The machine never makes the
  call; it can only be taught, by fixtures, to hold a call that was already
  made.

The enforcement arms of this standard are the ones the repo already has:
golden fixtures (the `prosperity-*` family in `eval/golden/` encodes the
exclusion criterion of §3 as `mustNotRank` assertions, checked by gate G3 on
every run) and Jesse's PR merge, which remains the actual gate on every
admission.

## 2. Admission baseline — the shared core

The baseline is the doctrinal core affirmed, in their own words, by all three
of the statements of faith Jesse named as anchors:

- The Gospel Coalition, **Confessional Statement**
  (https://www.thegospelcoalition.org/about/foundation-documents/)
- The Village Church, **Statement of Faith**
  (https://thevillagechurch.net/our-beliefs/statement-of-faith)
- Lighthouse Church, Glen Burnie, **Statement of Faith**
  (https://lhchurch.vercel.app/about#statement-of-faith)

The nine points every one of the three affirms:

1. **Scripture** — inspired, inerrant, authoritative.
2. **Trinity** — one God in three persons; full deity of Christ and of the
   Holy Spirit.
3. **Christ** — incarnation, virgin birth, sinless life, atoning death,
   bodily resurrection.
4. **Sin** — universal human sinfulness and need of salvation.
5. **Salvation by grace alone through faith** — a gift, not a technique.
6. **Humanity in God's image**, with intrinsic dignity.
7. **The church** — all believers, expressed in local congregations.
8. **Two ordinances** — baptism and the Lord's Supper.
9. **Christ's personal, visible return**; judgment; eternal states.

This shared core lands almost exactly on the National Association of
Evangelicals' Statement of Faith (https://nae.org/statement-of-faith/), which
is deliberately uncopyrighted so that organizations can adopt it — the
baseline did not need to be drafted from scratch, and its overlap with a
widely-adopted trans-denominational statement is evidence that it is a core
and not a party platform.

**The rule:** a source whose framing of passages contradicts this core is not
admitted. Note the wording — *framing of passages*, not *author's tradition*.
An author from outside these congregations' traditions can frame Scripture
faithfully against this core (see §4); an author who signs every point can
still pair verses in a way that denies point 5 in practice (see §3).

## 3. Named exclusion criterion — prosperity and seed-faith teaching

None of the three statements names the prosperity gospel; they exclude it only
by implication (grace-not-technique, cross-centered gospel). The document that
names it, and the citable standard for this criterion, is the Lausanne
Movement's **"A Statement on the Prosperity Gospel"** (Lausanne Theology
Working Group, Akropong, Ghana, 2008–09;
https://lausanne.org/content/a-statement-on-the-prosperity-gospel).

The Akropong statement defines prosperity teaching as the claim that believers
have a *right* to health and wealth, obtainable through positive confession
and the "sowing of seeds" in tithes and offerings. It rules that this teaching
is "false and gravely distorting of the Bible" — a "false gospel." And it is
carefully balanced, which matters for applying it honestly:

- It **affirms** God's miraculous power, and that material blessing can be a
  biblical reality — a source is not excluded for saying God heals, provides,
  or blesses.
- It **denies** that God's power is a technique to operate, that spiritual
  welfare can be measured by material welfare, or that poverty and illness
  signal weak faith. Prosperity teaching, it observes, "tends to victimize the
  poor by making them feel that their poverty is their own fault."

The positive test is TGC Confessional Statement §6's definition of the gospel:
"the gospel is not proclaimed if Christ is not proclaimed, and the authentic
Christ has not been proclaimed if his death and resurrection are not central."
A source's framing of a passage must be compatible with a gospel whose content
is Christ crucified and risen — not material return on spiritual investment.
TGC's companion Theological Vision for Ministry states the same ethic
positively: Christ "wins our salvation through losing, achieves power through
weakness and service, and comes to wealth through giving all away."

The grounding in §2 is point 5 — salvation by grace alone, **a gift, not a
technique** — which all three congregations confess in their own words. This
criterion is therefore the consumers' own doctrine applied, not an editorial
preference added.

### The worked example

The 2026-08-15 books assessment rejected Mike Murdock's *31 Scriptures Every
Achiever Should Memorize* under this criterion, and it is recorded here so the
verdict is repeatable. The book's method is word→verse pairing:
Achievement→John 14:12, Prosperity→Job 36:11, and so on — each verse recruited
as a memorizable warrant for a personal-success outcome.

**The criterion judges a source's framing, never the verses themselves.**
John 14:12 and Job 36:11 are Scripture; both belong in the artifact and may
rank honestly wherever their own words and faithful curation put them. The
distortion is the *pairing frame*: presenting "greater works than these" as an
achievement formula, or Job 36:11's "spend their days in prosperity" (Elihu's
argument, inside a book whose entire point is that Job's suffering was *not*
caused by unfaithfulness) as a prosperity mechanism. A source built on such
pairings teaches technique-for-blessing — the exact thing Akropong names and
point 5 denies — and is not admitted. The same shape governs the fixture
family: `eval/golden/prosperity-*.json` forbids query→verse pairings, and its
notes say in each case why the pairing, not the verse, is the problem.

## 4. Explicit non-criteria

The following are **not** admission criteria, and no source may be rejected
over them:

- Baptism — mode or subjects (immersion vs. sprinkling, believers vs. infants)
- Election — Calvinism vs. Arminianism
- Continuation or cessation of spiritual gifts
- Gender roles in church and home
- Millennial views
- Church polity and denominational structure

Why, plainly:

1. **The three anchor congregations themselves differ or are silent on every
   one of these.** Election and gender roles: in TGC's confession proper,
   a self-labeled "Distinctive" (secondary) at The Village Church, unmentioned
   at Lighthouse. Baptism mode: deliberately unspecified by TGC, a Distinctive
   at TVC, in the core at Lighthouse. Spiritual gifts: TVC is
   continuationist by Distinctive, the other two are silent. A criterion the
   anchors do not share cannot be the anchors' shared standard.
2. **The artifact serves multiple congregations.** Maskil, LH Worship
   Setlist, and Versed all consume it. Gating on a secondary point imports one
   congregation's position into every consumer's search results.
3. **It would disqualify admitted, trustworthy sources.** Matthew Henry — a
   paedobaptist Presbyterian — is already admitted
   (`pipeline/manifests/mhc.json`, decided by Jesse 2026-07-29) and is among
   the best sources in the artifact. An immersionist admission criterion would
   retroactively impugn him while doing nothing whatsoever against prosperity
   teaching.

This list is load-bearing. It is what keeps the guardrail from quietly
becoming a denominational filter. Prosperity teaching is gateable precisely
because it is not a Calvinist error, an Arminian error, or a charismatic error
— Akropong treats it as a distortion of the gospel itself, which every anchor
confesses. The secondary points above are differences *within* that shared
gospel, and the engine carries trustworthy sources from across those lines
without adjudicating between them.

## 5. Limits, and the process that remains human

**What a written standard catches:** explicit seed-faith framing — the
Murdocks, where the word→verse transaction is on the cover. That case is now
citable and repeatable.

**What it does not catch:** subtle distortion. A devotional that pairs true
verses with a self-help frame, without ever printing the word "prosperity,"
will not trip a checklist. Catching it still requires a human reading the
source carefully and judging it. This document makes that judgment consistent
and teachable; it cannot replace it, and it should never be described as if it
could.

**Whose judgment:** review verdicts are Jesse's. Every admission still lands
the way every admission has always landed — through the gauntlet and his PR
merge. Nothing in this document creates an automatic pass; at most it creates
a citable reason for a refusal.

**Planned follow-up:** a per-source doctrinal review record — one row per
source: who reviewed, when, verdict, which criterion of this document applied
— extending the existing manifest precedent. The gauntlet would check that
the record *exists* for every source, exactly as it presence-checks other
human decisions; it would never score whether the theology is "correct,"
which would violate CLAUDE.md #6. The record template can be drafted at any
time; the per-source rulings are Jesse's, and backfill for the existing
manifests awaits them.
