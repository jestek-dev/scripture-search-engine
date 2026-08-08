# Audit hardening plan — strengthening the engine on its own terms

**Date:** 2026-08-08
**Status:** Proposed. Wave 1 is executable without decisions; items marked
**[JESSE]** are decisions only Jesse can make and are collected in §6.
**Provenance:** Produced from an end-to-end audit of this repository
(architecture, pipeline, ontology, gates, and live query behavior against a
freshly built fixture artifact). The audit ran the full verify suite —
82 tests passing, gauntlet verdict ADMIT, all eleven gates green — so the
findings below are gaps *beyond* what the gates already hold.

---

## 0. Audit summary — what this plan responds to

What the audit confirmed working, verified empirically rather than from the
docs: the determinism contract, the signal-budget bounds (weak evidence
cannot outshout an exact match — confirmed live on "hearing and doing"), the
two-author corroboration rule, provenance discipline end to end, and the
admission gauntlet's measured-improvement-or-reject posture. The system is
**not** bloat-vulnerable: G6 makes accumulation harmless to ordering by
construction, and G8 measured 0% probe churn.

What the audit found needing work, in descending severity:

1. **Single-word theme queries bypass the concept layer.** Concept matching
   is full-phrase containment, and most lexicons carry only multi-word
   phrases — so the query `worship` never fires the `worship` concept
   (confirmed live: John 4:24 surfaced on `token_overlap` only; Psalm 95:6
   absent). One-word queries are the most common query class for the
   consuming apps. The specificity discount in `conceptAnchorEvidence`
   (0.55 at one matched token) was designed for single-token lexicon entries
   and is currently near-dead code.
2. **The `remembered-phrasings` pack is still unbuilt** (NEEDS-JESSE §1.6a).
   The measurement is conclusive — no public-domain translation closes it —
   and it remains the most user-visible failure in the system.
3. **Raw database ids leak into result chips.** `sourceLabel()` in
   `engine/src/intents/concept.ts` is missing entries for `torrey`, `nave`,
   `clarke`, `mhc`, `kd`, `barnes`, `jfb`, and `treasury-of-david-03`;
   confirmed live as chips reading `barnes + jfb + mhc`.
4. **A ranged concept anchor floods the top results with per-verse
   duplicates.** `communion` returns 1 Cor 11:23, :24, :25, :26 as four
   separate results at identical score; authoritative results are exempt
   from diversification by design, so nothing thins them.
5. **The "fixtures first" rule is policy, not code.** No gate rejects a
   concept without a covering golden fixture; 8 of 32 concepts have none.
6. **The OpenBible snapshots are irreplaceable and unarchived.** The
   upstream URLs roll weekly; our checksummed copies are the only ones that
   can reproduce the build.
7. **Doc drift.** The README Status section contradicts the README Coverage
   table and NEEDS-JESSE ("research() only" / "15 verses have profiles" —
   both long stale); README and architecture.md say the ontology is "seeded
   from Nave" when Nave is lineage-only.
8. **Known-unvalidated numbers and known noise**: `minPmi: 2.0` has never
   been swept (its observed selectivity has drifted from 99.5% to 84.9%
   rejected as the corpus grew); OCR artifacts (`kite`, `phantom`) survive
   corroboration in Treasury-sourced profiles; corroboration is softest
   exactly where authors write widest (span projection); Mark sits at 86%
   coverage.
9. **Interpretive bound unstated.** All seven expositors are 18th–19th
   century Protestants. Corroboration establishes independence of
   *authorship*, not of *interpretive tradition* — the same honesty
   ATTRIBUTIONS applies to transcription rights should be extended to
   hermeneutics.

The plan below is ordered into four waves by risk. Wave 1 changes no
ordering. Wave 3 is the only place ordering changes, and it carries the
`ENGINE_VERSION` discipline non-negotiable #2 requires.

---

## 1. Wave 1 — Trust and correctness (no ordering changes)

### PR 1: Complete `sourceLabel()` and make drift impossible

- Add label entries to `engine/src/intents/concept.ts`:
  `clarke` → "Adam Clarke, Commentary (public domain)",
  `mhc` → "Matthew Henry, Commentary (public domain)",
  `kd` → "Keil & Delitzsch (public domain)",
  `barnes` → "Barnes, Notes (public domain)",
  `jfb` → "Jamieson-Fausset-Brown (public domain)",
  `torrey` → "Torrey, New Topical Textbook (public domain)",
  `nave` → "Nave's Topical Bible (public domain)",
  and `treasury-of-david-03` to the existing Spurgeon case.
- The engine does no I/O, so completeness is enforced where both sides are
  visible: a test in `eval/` loads every manifest id plus every
  `EXPOSITION_SOURCES` id and asserts `sourceLabel(id) !== id`. A future
  admission without a label fails CI instead of shipping a leak.
- No ordering change → no `ENGINE_VERSION` bump required; publish as a
  patch release since package output changes.

### PR 2: Documentation truth pass

- Rewrite the README **Status** section to current reality, or replace the
  stale prose with a pointer to NEEDS-JESSE so one habitually-updated
  document is the single source of truth.
- Fix "seeded from Nave, Torrey" in README and `docs/architecture.md` →
  "seeded from Torrey (Nave declared lineage-only)".
- Add one paragraph to ATTRIBUTIONS (via `generateAttributions.ts` — the
  file is generated) stating the interpretive bound: all expositors are
  18th–19th-century Protestants; corroboration establishes independence of
  authorship, not of interpretive tradition.

### PR 3: Archive the irreplaceable snapshots

- Create a GitHub Release (e.g. `source-snapshots-2026-08`) carrying the
  pinned OpenBible topics + cross-references files, with CC BY attribution
  in the release notes. (Commentary sources are stable at CrossWire /
  Archive.org / Gutenberg; only the rolling URLs need this.)
- Add an `archiveUrl` field to `openbible-topics.json` and
  `openbible-xrefs.json`; teach `fetchSources.ts` to fall back to it when
  the primary URL's content no longer matches the pinned checksum.
- Extend G1 structurally: a manifest documented as having a rolling
  `sourceUrl` must carry an `archiveUrl`.
- Verify with `npm run fetch:sources` from a clean clone with the primary
  URL simulated stale.

### PR 4: Make "fixtures first" structural

- Add a `coversConcepts: [...]` field to the golden fixture schema (so
  `hearing-and-doing.json` can declare it covers `obedience-to-the-word`,
  and one fixture can cover several tightly-related concepts).
- New structural check inside G3: every concept id in `ontology/concepts/`
  must be covered by ≥1 fixture, via filename match or `coversConcepts`.
  Fail with the named orphans.
- Backfill fixtures for the seven uncovered founding concepts:
  `building-on-the-rock`, `faith-and-works`, `fear-not`,
  `grace-not-earned`, `refuge-in-trouble`, `self-deception`,
  `walking-in-the-light`. Three already have probe queries to crib from.

---

## 2. Wave 2 — Concept-layer reach (data only; the two biggest product gaps)

### PR 5: Single-token lexicon audit — make `worship` fire `worship`

Fixtures first, per the house rule:

1. For each of the 32 concepts, extend its golden fixture with a bare-word
   query case (`worship`, `salvation`, `repentance`, …) asserting the
   concept's top anchor surfaces with `concept_anchor` as the required
   reason family. Run the gauntlet — these fail today; that is the measured
   gap.
2. Add the single-token lexicon entry where the bare word is unambiguous.
   The engine already handles this correctly: containment matching admits
   single-token phrases, and the 0.55 one-token specificity discount exists
   precisely to keep them humble.
3. Deliverable alongside the pack: a decision table — concept / bare form /
   **admit** or **skip with reason**. Skip genuinely ambiguous tokens
   (`light` spans two senses by the 2026-07-29 ruling; `word` and `rock`
   likewise).

Watch-items, both of which are the gates doing their job:

- **G4 collisions**: single tokens raise lexicon overlap between neighbours
  (`praise` / `worship` / `thanksgiving`). If G4 trips, differentiate the
  concepts rather than loosening the threshold.
- **G8 churn**: the `broad-love` / `broad-grace` / `broad-faith` probes will
  churn if those concepts gain bare tokens. That churn is the *intended*
  improvement; the baseline re-record is a reviewed event with this PR as
  its recorded reason.
- **[JESSE]** One call (see §6.2): should broad single words (`love`,
  `grace`, `faith`) resolve to curated concepts at all? Recommendation: yes
  for `grace` and `faith` (theologically specific); decide `love`
  explicitly — it is the most ambiguous and the most typed.

### PR 6: The `remembered-phrasings` pack — **[JESSE approval is the critical path]**

Structured so Jesse's part is review, not authorship:

1. Draft the candidate list as a review document in `docs/research/`: ~50
   most-searched remembered phrasings ("plans to prosper you", "lean not on
   your own understanding", "seek first the kingdom", "soar on wings like
   eagles", "confidence in what we hope for", …), each with its anchor
   verse, the WEB wording it maps to, and a note wherever the mapping
   involves interpretive judgment. Short phrases are not copyrightable, so
   lexicon entries in NIV/ESV wording are safe; the document records that
   reasoning once.
2. Golden fixtures first, `status: pending` — the gap becomes visible in
   the Admission Report before anything ships.
3. **Jesse approves / strikes / edits the list.** Every approved mapping is
   `sources: [editorial]` — this is exactly the "claim about meaning" the
   editorial label exists for.
4. Pack admitted and fixtures flipped `active` in the same PR.

Design choice to settle inside the draft: one umbrella concept with ~50
lexicon entries would trivially trip G4 and muddy provenance. Better: attach
each remembered phrasing to the verse's *natural* concept where one exists
("seek first the kingdom" → a kingdom concept), and mint a small
`remembered-phrasing-<ref>` micro-concept only for verses with no conceptual
home. The draft proposes the split per phrase.

---

## 3. Wave 3 — The one ordering-visible change

### PR 7: Anchor-range result grouping

**Problem.** A ranged concept anchor emits one result per verse, and
authoritative results are exempt from diversification by design — so one
anchor occupies four top slots (`communion` → 1 Cor 11:23, :24, :25, :26 at
identical score).

**Recommended design** (deterministic, explainable, engine-side): during
candidate assembly in `createEngine.ts`, verses covered by the *same anchor
row* share a group key derived from the anchor's own range; after ranking,
contiguous same-anchor results collapse into one passage result carrying the
anchor's reference range (`1 Corinthians 11:23-26`), the max score, and the
merged reasons. The anchor's curated span is the natural unit — no new
pericope table, no inference, and the collapse is a pure function of data
already in the artifact.

Discipline this PR must carry:

- `ENGINE_VERSION` bump in the same commit (0.8.0 — the ordering contract
  changes), per non-negotiable #2.
- Golden fixtures updated where `expectedTop` references change from verse
  to range; every edit named in the PR description.
- Probe baseline re-recorded as a reviewed event.
- **[JESSE]** Product call before building (§6.3): collapsed passages from
  the engine (recommended — all three consumers present passages, and
  engine-side grouping keeps them consistent), or presentation-side grouping
  per consumer? Decide once; it is expensive to reverse after Phase 5.

Sequence after Waves 1–2, so fixture churn from PRs 5–6 has settled before
the baseline re-record.

---

## 4. Wave 4 — Data-quality research (measure first; merge only on evidence)

### PR 8: `minPmi` sweep

A script in `pipeline/scripts/` rebuilding the distillate at 1.5 / 2.0 /
2.5 and comparing golden outcomes, probe churn, per-verse term-quality
samples, and artifact size. Findings land in `docs/research/`;
`eval/budgets.json` changes only if the evidence says so. This converts the
"still a guess" flag (NEEDS-JESSE §2.3) into a validated number either way.

### PR 9: OCR noise — fixture-first cleanup

1. Write the failing case first: a fixture or probe demonstrating a known
   OCR artifact (`kite`, `phantom`) surfacing as preached vocabulary.
2. Add a *reviewed* blocklist file in `pipeline/` (data, PR-reviewed like
   the archaic-forms table) applied at term admission — plus a report-only
   dictionary check listing non-dictionary tokens that survive
   corroboration. The report feeds future blocklist review rather than
   auto-rejecting, because proper nouns and transliterations are
   legitimate vocabulary.

### PR 10: Corroboration-softness report

Pipeline build-time stat: the distribution of `minSpanVerses` per book. This
makes visible where "two authors agree about this verse" really means "two
authors wrote overlapping section essays." No admission change yet — measure
first. If narrative books look soft, the candidate tightening (require at
least one attesting span under ~12 verses) becomes a measurable proposal
instead of a guess.

### PR 11: Close Mark — cheapest available voice

Before hunting new authors: **Maclaren's *Expositions* volume on St. Mark is
already on Project Gutenberg (proofread), and both the `citation-suffix`
parser and his `authorId` already exist.** Admitting it is a manifest plus a
registry line — exactly the "data change, not code change" path
`expositionSources.ts` was built for. If the Admission Report shows Mark
coverage move, merge; if `NO MEASURABLE EFFECT`, the repo's own rule says do
not. Fallback candidate: Ryle's *Expository Thoughts on the Gospels* (public
domain). The same mechanism later closes other thin spots with Maclaren's
remaining volumes. Author bitmask is at 7 of 31 — plenty of room.

---

## 5. Sequencing at a glance

| Wave | PRs | Risk | Blocked on |
|---|---|---|---|
| 1 | 1–4 | none (no ordering changes) | nothing — start now |
| 2 | 5–6 | G4/G8 churn, reviewed | PR 6 on Jesse's approval; PR 5 on one broad-token call |
| 3 | 7 | ordering contract, version bump | passage-vs-verse call; Waves 1–2 settled |
| 4 | 8–11 | none (research / measured admissions) | parallelizable with Wave 2 |

Wave 1 is a few hours of work total. PR 5 is the highest value-per-effort in
the plan — it converts two dozen mostly-dormant Torrey concepts into ones
that fire on the queries people actually type. PR 6 is the highest absolute
value, and its critical path is review, not build.

---

## 6. Standing decisions to record once — **[JESSE]**

Not PRs; policy calls worth one written paragraph each in NEEDS-JESSE so no
gate gets interpreted in the moment:

1. **Tripped weak-share gate: stop adding, or re-baseline?** (open since
   NEEDS-JESSE §1.6c). Recommendation: *stop adding* is the default;
   re-baselining requires a written justification naming what changed —
   that keeps the gate a gate.
2. **Broad-token policy** (from PR 5): which single words are allowed to
   resolve to curated concepts.
3. **Passage vs. verse results** (from PR 7): whether the engine returns
   collapsed anchor-range passages or per-verse results grouped by
   consumers.
