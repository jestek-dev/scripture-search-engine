# Bible rollout — chapter-summary conventions

Binding for every book thread in the full-Bible chapter-summaries rollout, and for
every worker a book thread spawns. Distilled from the confirmed Genesis pilot
(`/mnt/project-files/research/2026-08-22-genesis-pilot-summaries.md`), which is the
exemplar: where this memo is silent, match Genesis.

## 1. Scope & outputs

- Produce one document per book at `/mnt/project-files/research/bible-rollout/<book>.md`
  — lowercase book name, spaces hyphenated (`exodus.md`, `1-samuel.md`,
  `song-of-solomon.md`). Genesis stays at its existing path above; do not move or
  duplicate it.
- This is display-only content. Book threads make NO engine or repo changes and open
  NO PRs. Wiring summaries into the engine is a separate engineering effort.
- Required content, in order: a book summary (**Short** — one paragraph; **Full** —
  several paragraphs; **Sources**), then every chapter of the book as a chapter block
  (format in §4), tags included.

## 2. Voice

- Modern, plain language; a layperson reading the chapter for the first time is the
  reader. Full sentences, never a bare event list, never a sermon.
- Each summary orients: what happens, and why it matters in the book's flow.
- No archaisms (no unto/thereof/hath/shalt). Follow the WEB's own vocabulary even
  where it differs from familiar Bible English — the WEB says "ship," not "ark."
  Gloss an unfamiliar WEB choice once, at first use (Genesis: "a ship of rescue —
  our WEB translation's word for the familiar 'ark'"), then use the WEB word.

## 3. Bible text & accuracy

- The WEB translation is the sole authoritative text. Every quotation is word-for-word
  WEB. Every factual claim — names, numbers, sequence, who says or does what — is
  verified against the WEB text of the book.
- Extract the book's text from the repo-pinned ebible.org engwebp VPL source declared
  in `pipeline/manifests/web.json`. Known caveat: the live upstream edition has
  drifted from the pinned snapshot. Verify any verse witnessed in
  `pipeline/fixtures/web-subset.json` against that fixture, and record provenance
  honestly — state which edition each chapter was actually checked against; never
  claim pinned-text verification that was current-edition verification.

## 4. Structure & subdivision

The chapter is the unit. Each chapter block:

```
## <Book> N
**Summary:** 3–5 sentence prose summary.
**Tags:** `concept-id` — justification with WEB-quote anchor (in-chapter verse refs); `concept-id` — …
**Sources:** brooks-1919; mhcc; bsb-headings[; bibleproject-framing]
**Sections:**                    [only on subdivided chapters]
- **N:a–b — Title** (title: BSB | adapted from BSB | editorial) — 1–2 sentence description.
```

- Subdivide ONLY when themes genuinely diverge within a chapter (Genesis: 14 of 50).
- Section boundaries come strictly from the BSB public-domain headings (and
  toledot-type structural markers the book itself provides) — never invented.
- Section ranges must exactly partition the chapter: first section starts at v. 1,
  last ends at the final verse, no gaps, no overlaps.
- The `(title: …)` attribution describes the title's wording: `BSB` verbatim,
  `adapted from BSB` if reworded, `editorial` if original.

## 5. Tags

Tags are display-only. They do not affect search ranking; that path (concept packs,
fixtures, gauntlet) is governed separately.

- Every tag must be an EXACT id from the merged concept vocabulary —
  `ontology/concepts/*.yaml` on main at thread start. Never invent an id; never
  strip a prefix (`pastoral-god-sees-my-suffering`, not `god-sees-my-suffering`).
- Every tag carries a justification anchored in the chapter itself: a word-for-word
  WEB quote plus verse refs, all refs inside the chapter (no cross-chapter refs).
- The bar is honest, substantial presence: the chapter must depict the concept's
  teaching substance, not merely touch its topic. Worked example: Genesis 3 does NOT
  get `resisting-the-devil` — the chapter depicts a failure to resist, and Genesis
  never names the serpent as the devil.
- No later-revelation category read back as a tag: no `identity-in-christ` on
  Genesis 1; Romans-8:28-type verse-memory concepts (`remembered-*`) do not tag OT
  narrative — use `providence`.
- Honest-and-empty is allowed and preferred over a forced tag. Mark it:
  "**Tags:** none — no concept in the current vocabulary is genuinely present in
  this chapter"; a single-tag chapter notes "(Only one honest tag from the current
  vocabulary.)"
- Guideline: at most 6 tags per chapter, the chapter's main themes first.
- Recommended (not gated): capture motif candidates — motif + verse refs + 2–3
  realistic query phrasings — as raw feed for future concept packs (see §9 for the
  vocabulary-gap subset).

## 6. Doctrinal guardrails

- `docs/DOCTRINAL-BASIS.md` (scripture-search-engine repo) governs: the nine-point
  shared core, and its named exclusion — prosperity-gospel framing. Blessing is
  never presented as formula or entitlement; narrative prosperity reads as God's
  covenant faithfulness and providence, never as technique.
- Interpretive frames beyond the plain text must be standard
  conservative-evangelical consensus, or be explicitly signposted as a reading —
  never stated as bare narrative fact.
- Be charitable to authorial intent: no moralizing the text does not support, and
  no sanitizing what it does say. Summaries describe; they do not adjudicate.

## 7. Source priority (flagged to Jesse; he may adjust)

1. **The WEB Bible text itself** — highest authority; overrules every other source.
2. **Approved public-domain build materials** — BSB headings (structure), Brooks'
   *Summarized Bible* (1919), *Matthew Henry's Concise Commentary*.
3. **biblesummary.info** — steering only; never copied.
4. **BibleProject materials** — structure/framing inspiration ONLY. In copyright:
   never copy or closely paraphrase their wording.

Before delivery, run a mechanical n-gram originality check (normalized 5-grams) of
the whole doc against the in-copyright/steering-only sources (3 and 4): zero shared
5-grams apart from direct WEB scripture quotations. Scan the public-domain sources
too: no sentence lifted, no archaic wording carried over. Report results honestly,
per source.

## 8. Harsh-critic loop (mandatory)

- After drafting and review, a dedicated critic subagent attacks the full doc on
  exactly five criteria — **clear**, **accurate** (to the WEB), **Biblically
  sound**, **helpful**, **charitable to authorial intent** — plus **tag integrity**
  (every id resolves against the vocabulary; presence is honest).
- Every objection must be evidence-cited: doc location + WEB verse / vocabulary
  row / doctrinal clause. Severities are BLOCKING and MINOR.
- Zero means zero: ANY objection, minor included, fails the round. Revise, then
  re-run with a FRESH critic (no memory of prior rounds) until the verdict is
  `VERDICT: APPROVED — zero objections`.
- Record the round count and final verdict in the book doc's confirmation note.

## 9. Tag-gap logging (mandatory)

- Every theme genuinely present in the book and useful to a search user, but absent
  from the vocabulary, gets a row APPENDED to
  `/mnt/project-files/research/bible-rollout/tag-gaps.md`.
- Append-only: never edit or delete another book's rows. Before adding a row, check
  the existing table AND the current vocabulary — if the theme is already listed,
  append your book's refs to that row's Where column instead of adding a new row.
- Log only real gaps, not every motif. Logging a gap does not create a concept;
  concept packs go through fixtures + gauntlet separately.
- **Addendum — tag-gaps.md survival audit (binding, 2026-08-23 06:56Z):** repeated
  lost-update clobbers have been observed where a block verified at write time was
  later erased by another thread's stale-read full-file save. Therefore: (1) every
  write MUST be an atomic end-of-file append — whole-file rewrites of tag-gaps.md
  are prohibited; (2) after each write, re-read and verify pre-existing bytes are
  unchanged and your block is present; (3) at each book's FINAL delivery, re-audit
  that all of your thread's earlier contributions still survive in the live file
  (grep for your books' refs) and re-apply any missing rows, re-deduped against the
  current file and verified present exactly once.

## 10. Recommended pipeline

1. Stage sources: WEB book text (per §3), BSB headings, Brooks, Matthew Henry,
   vocabulary snapshot, this memo.
2. Draft the book doc under this memo.
3. Independent reviewer pass(es): verify verse-by-verse against the WEB — facts,
   quotes, section ranges, tag honesty.
4. Editor applies the findings.
5. Harsh-critic loop (§8) to zero objections.
6. Deliver: book doc at its §1 path, tag-gap rows appended (§9), reply in thread.

Delegated judgment calls (a tag dropped, a borderline subdivision, a framing
choice) get a **Decisions record** in the book doc — each call with its rationale,
marked as a reversible delegated default Jesse can overturn.

## 11. Addendum — adopted display-tag vocabulary and tag rulings (binding, 2026-08-25)

Recorded from Jesse's 2026-08-25 thread reply (thread
`cmsg_01P3QsU2j86UJUbajEtMTYp2P4yvFoDcbcYFeRB5gzQF9M`) ruling on the tag-gap
review (`tag-gaps-review.md`; verbatim reply quoted in that file's postscript).

1. **Adopted display tags.** Jesse approved the review in full: "I agree with
   all additions. I'm okay with having more tags as long as it's helpful."
   With the review's one recorded fold applied (`waiting-and-timing-in-love`
   into `romantic-love-and-intimacy`), the adopted vocabulary is **161
   concept ids**, listed in the working inventory's `tag-apply/adopted-concepts.md`.
   §5's exact-id rule is amended: a tag must be an exact id from EITHER the
   merged engine vocabulary (`ontology/concepts/*.yaml`) OR the adopted
   display-tag list. Every other §5 rule applies to adopted ids unchanged —
   word-for-word WEB quote with in-chapter verse refs, the
   honest-substantial-presence bar, no later-revelation read-backs, and
   honest-and-empty preferred over a forced tag.

   **Engine status unchanged:** the adopted ids are approved
   vocabulary-addition *candidates*, not engine vocabulary. Nothing here
   creates a concept pack; any engine admission still requires golden
   fixtures, a gauntlet run showing measurable effect, and a human PR merge
   (repo `CLAUDE.md`, "Adding data"). `NO MEASURABLE EFFECT` still means
   don't merge.

2. **Both-tags ruling.** Where two tags (existing or adopted) both genuinely
   apply to a chapter, apply both — Jesse: "If resurrection and Easter both
   apply, apply them both unless that's problematic." The presence bar still
   governs each tag individually. Applied specifically to the Synoptic
   Sadducee-dispute divergence (`tag-gaps-review.md` §1(a)): the parallels
   harmonize to the Matthew reading — Mark 12 and Luke 20 carry Matt 22's
   applicable tags, and the Mark and Luke docs' divergence records are
   annotated as resolved by this ruling.

3. **`gentile-inclusion` adopted.** The review's contested call (§1(b)) is
   resolved by adoption — Jesse: "I'm okay with adding gentile-inclusion if
   it applies." It is applied where it genuinely applies, alongside
   `nations-and-peoples` where both fit, per the both-tags ruling.

4. **Grief tags kept.** The grief-register placements flagged for Jesse's eye
   are KEPT, no drops — thread call under Jesse's delegation ("whatever you
   think is best"): `pastoral-grief-and-loss` on Judges 11 and 2 Samuel 21;
   `pastoral-pregnancy-and-child-loss` and `waiting-for-a-child` on
   2 Kings 4. The `lament`-row grief-decline pattern (§1(c)) otherwise
   stands unchanged.

5. **PR #43 id uses ratified.** All 93 tag-line uses of the nine PR #43 ids
   across 34 book docs (§1(d)) are ratified — Jesse: "I'm fine with using
   those." The per-doc "reversible delegated default" flags on those uses are
   settled as of 2026-08-25 and no longer pending review (reversible only in
   the ordinary sense that Jesse can overturn anything).

6. **Tag density for the application pass** — thread call under Jesse's
   "more tags as long as it's helpful": the presence bar comes first, always;
   density never justifies a tag that does not clear it. §5's 6-tags-per-
   chapter guideline becomes a soft cap, with a hard ceiling of 8 where every
   tag independently clears the bar, main themes first. Where candidates
   exceed the ceiling, tags yield in this order: cross-ref class first, then
   theme-witness-with-caveat, then thin single-verse, then
   broad-duplicating-specific. An existing tag is never silently dropped —
   any yield gets its own Decisions-record entry.

7. **Scope.** Display-only, as ever (§5): none of this affects search
   ranking, engine vocabulary, `ENGINE_VERSION`, or the three-identity
   determinism contract. Engine-stage questions the review leaves open
   (one-concept-or-two boundaries, lexicon-extension-vs-mint checks,
   register splits) are deferred to concept-pack curation and noted per id
   in the adopted-concepts list.
