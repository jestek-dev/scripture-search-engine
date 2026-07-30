# Needs Jesse — decisions, risks, and open items

**Last updated:** 2026-07-29, after Layer B verse-level corroboration
**Status:** Phases 0–4 complete. Layer B rebuilt on corroboration. Full-corpus
build and Phase 5 (consumer adoption) both not started.

Nothing here is blocking day-to-day work on the engine. Everything here is a
call that is yours, not mine.

---

## 1. Decisions I need from you

### 1.1 Starter ontology — ✅ REVIEWED AND APPROVED (2026-07-29)

Jesse reviewed all 8 concepts and approved them, with one correction:

- **`walking-in-the-light`** was scoped to the ETHICAL sense — living and
  thinking the way the Word says, walking as Jesus walked. The cosmological
  John 1:4-9 anchor was removed and 1 John 2:6 ("walk just like he walked")
  added. `light` on its own stays broad, since it legitimately spans both
  senses; the *walking* phrases pin the concept to conduct.
  G8 confirmed the change dropped exactly John 1:5-9 from the light/darkness
  probe and touched nothing else.

The remaining eight items I flagged for judgment were all accepted as-is:
Eph 2:8-10 under `faith-and-works`, the broad "gift of god" lexicon entry,
Ezek 33:31-32 as the inverse case, and the deliberate James 1:22-24 anchor
shared between `obedience-to-the-word` and `self-deception`.

| Concept | Anchors it asserts |
|---|---|
| `obedience-to-the-word` | James 1:22-25, Matt 7:24-27, Luke 6:46-49, Ezek 33:31-32, Rom 2:13, John 13:17 |
| `building-on-the-rock` | Matt 7:24-27, Luke 6:46-49, 1 Cor 3:10-15 |
| `faith-and-works` | James 2:14-26, Eph 2:8-10, Gal 5:6 |
| `grace-not-earned` | Eph 2:8-9, Rom 3:23-24, Titus 3:5 |
| `refuge-in-trouble` | Ps 46:1-3, Ps 91:1-2, Isa 25:4, Ps 121:1-8 |
| `fear-not` | Isa 43:1-3, Josh 1:9, 1 John 4:18 |
| `walking-in-the-light` | 1 John 1:5-7, Eph 5:8, 1 John 2:6 |
| `self-deception` | James 1:22-24, Gal 6:3, 1 John 1:8 |

### 1.2 Repository visibility and the engine's name — still open

The repo is private and called `scripture-search-engine`. Two things worth
settling before consumers pin it:

- **Public or private long-term?** Private works fine (consumers authenticate
  to pull releases). Public would let you publish `@lh/scripture-engine` to
  npm without auth, and the corpora are all PD/CC BY so there is no rights
  obstacle. Your call on whether the ontology is something you want visible.
- **Package name.** I used `@lh/scripture-engine`. If you want a different
  npm scope, changing it later means updating three consumers.

### 1.3 When does Maskil adopt this? — still open, and now also blocked technically

Phase 5 is written but not started, per your instruction. Maskil's own July
audit deliberately sequenced the broad research engine *after* the
collaboration pilot.

New since I last wrote this: adoption is no longer *only* a sequencing call.
The engine ships `research()` and nothing else. Setlist and Maskil both need
`forSong()`, which is typed but unbuilt. So Phase 5 has real work in front of
it regardless of when you want it (implementation plan §5).

### 1.4 Which commentators come next — I have a recommendation, not a decision

Corroboration (§2.1) means coverage now depends on **authors per verse**, not
works ingested. Two candidates, different shapes:

- **Finish *Treasury of David* (vols 3 and 5).** Cheap, mechanical, and it
  closes a real hole: Psalms 58–87 and 111–119 currently have one author, which
  is the exact condition that produces idiolect. I would do this first.
- **Add a third voice on Psalms** (Matthew Henry, JFB, Barnes — all PD,
  verse-keyed). Raises corroboration *quality* where two authors already agree,
  and G9 will tell you when it stops paying.

Beyond Psalms, moving to a second book means picking one and finding 2+ PD
commentators on it before ingesting anything — one author on a new book buys
almost nothing now, which is a change from how this looked a phase ago.

### 1.5 The size budget is now known to be 4x too loose

`size.totalArtifactBytes` is 160 MiB; the real full artifact is 40.91 MiB. A
threshold with that much slack will not fire before something has gone badly
wrong. Tightening it to, say, 64 MiB would make it a real guardrail while
leaving room for the Layer B growth you actually want.

Not changed unilaterally: budgets are reviewed data, and picking the number is
a judgment about how much growth you intend to allow.

---

## 2. Things you should know

### 2.1 The idiolect problem is SOLVED — and it changed the design

Previously flagged as an open limitation. It is closed, and the fix reshaped
Layer B.

With 73 expositions from Maclaren alone, the highest-PMI terms for a passage
were `mellow`, `friction`, `troth`, `polish` — Victorian rhetorical habits, not
theology. That was never a tuning problem; it is what PMI *should* do with a
single-author corpus.

Requiring **2+ independent sources** to attest a term is the mechanism that
separates theology from one writer's habits. Psalm 91:4's profile went from
`gorg/mellow/friction/polish/troth` to `feather/wing/protection/buckler/shield`,
which is what Psalm 91:4 says. It is now a build-time admission rule, and G5
reports 99.5% of candidate terms rejected.

**Caveat that replaces it:** corroboration is only as good as coverage. See §1.4.

### 2.2 The pericope model was replaced, not tuned

Previously flagged as an open design decision ("choosing canonical pericope
boundaries"). You gave the direction — *verse-specific unless a group of verses
is deliberately attached to a thought* — and it is implemented as three levels:
authors keep their natural spans, agreement resolves at the verse, and
deliberate thought-units are the concept layer's job. Specificity is scored via
`min_span_verses` rather than assumed.

Result: Psalm 23 went from **no profile at all** to six verse-precise ones.
Full rationale in implementation plan §3.1. **No hand-curated pericope table is
needed, now or later** — that burden is gone.

### 2.3 Some gate thresholds are still guesses

- `distinctiveness.minPmi: 2.0` — chosen before data existed. It now rejects
  99.5% of candidate terms, which *feels* right, but nobody has checked
  whether 1.5 or 2.5 gives better results.
- `saturation.minProfileDelta: 0.02` — **still never triggered.** The Treasury
  ingestion measured 0.2017, an order of magnitude above it. The threshold
  remains untested, which by this repo's own rule means it reads as protection
  without yet being it. It will get its first real test when a *third* author
  lands on Psalms.

Neither is dangerous — both are floors on weak evidence. But do not treat them
as validated.

### 2.4 The latency gate is deliberately loose

G11 failed once on CI (55ms vs a 50ms budget) and passed on the next run with
identical code. Two real problems, both fixed: it was measuring **cold start**
rather than query cost (a warm-up pass now runs first), and the 50ms budget was
calibrated on a dev machine.

The budget is now 150ms against ~7.5ms observed. Loose on purpose: it catches an
algorithmic regression (an accidental full scan, a dropped index), which shows
up as an order of magnitude — not runner noise. **A gate that fails at random
teaches people to ignore gates.** Real device latency has to come from a
consumer measuring on target hardware; this repo cannot produce that number
honestly.

### 2.5 OpenBible URLs are rolling, with no archive

`https://a.openbible.info/data/*` is overwritten weekly. There is no versioned
or archival URL. The checksums in `pipeline/manifests/openbible-*.json` are
therefore *our* snapshot, and re-downloading later will produce a different
file that must be re-admitted as a change.

Handled correctly today (the committed subset makes builds hermetic), but if
you ever want to reproduce a build from scratch months from now, you need the
original download — not just the URL. Worth keeping a copy somewhere durable.

### 2.6 The full-corpus build is DONE — and the size budget was far too pessimistic

Built 2026-07-29. `artifacts/content-artifact.json` is the first reviewed
release descriptor; `npm run build:artifact --workspace pipeline` reproduces it.

| | measured |
|---|---|
| verses | 31,098 |
| artifact size | **40.91 MiB** against a 160 MiB budget |
| cross-references | 341,096 |
| corroborated verse terms | 2,583 |
| query latency, full corpus | 2.6–42 ms cold, no warm-up |

The size number is the surprise. The plan assumed a ~122 MiB base corpus and
budgeted ~30 MiB of headroom for Layers A+B; the real artifact is a quarter of
that. The 122 MiB figure came from Maskil, whose database carries two
translations plus an FTS index this one builds differently.

**This is worth a decision at some point** (§1.5), because a 160 MiB budget
against a 41 MiB artifact is not a guardrail — there is room for a 4x mistake
before it fires. I have not changed it, because thresholds are reviewed data.

CI still gates against the 828-verse fixture, and should: hermetic and fast is
correct for a per-PR check. The two builds are now genuinely different tools
rather than one tool and one aspiration.

### 2.6b The WEB text was re-admitted, and 24% of verse wording changed

The old `manifests/web.json` pinned a checksum for a JSON export whose download
URL was never recorded — `sourceUrl` held only eBible's landing page. That
checksum identified a file nobody could retrieve, which means the corpus could
not be rebuilt or verified by anyone, including us.

Re-admitted from eBible's own canonical verse-per-line publication, which has a
stable direct URL. The text differs because WEB has been revised since: of the
828 fixture verses, 243 were byte-identical, 390 differed only in typography
(curly vs straight quotes, which the tokenizer discards), and **195 carried real
revisions** — "put forth grass" → "yield grass", "Let us make man" → "Let's make
man".

Measured effect: no golden fixture broke, all 49 tests stayed green, and probe
churn was 0–20% with the *narrow* concept probes unmoved and weak-evidence share
slightly **down**. Only two broad lexical probes swapped results. Baseline
re-recorded as a reviewed event.

G1 has been extended so this class of hole cannot recur: a manifest that pins a
checksum must name a retrievable file, not a landing page. A separate opt-in
`--check-sources` run verifies every pinned URL still resolves (all 8 do today).

### 2.7 Treasury of David came from Internet Archive OCR, and it shows

Deliberately not CCEL: *Treasury of David* is absent from Project Gutenberg, so
unlike the proofread Maclaren volume there is no clean-text option, and CCEL's
hand-corrected transcription asks permission for commercial republication of
*their files* — unusable as a redistribution source even though the underlying
text is public domain. The manifests record that distinction rather than eliding
it.

OCR noise is real and visible (`kite`, `phantom` survive corroboration). The
parser rejects rather than guesses when a roman numeral is corrupted, because
attaching commentary to the wrong psalm is a silent unrecoverable error.

---

## 3. Suggested next moves, in the order I would do them

1. ~~Run the full-corpus build~~ — **done** (§2.6).
2. **Get Layer B off Psalms.** This is now the biggest gap by far: 2,583
   corroborated terms exist and essentially all of them are in the Psalter,
   because both admitted commentators only wrote on Psalms. Sixty-five other
   books have no homiletical evidence at all. Needs 2+ public-domain
   commentators per book — see §1.4.
3. **Finish *Treasury of David* vols 3 and 5** — cheap, closes the
   single-author hole in Psalms 58–87 and 111–119.
4. **Decide the size budget** (§1.5) now that there is a real number.
5. **Try the curation skill on a real gap** — Phase 4's own gate is unmet until
   this runs once. You have said this is lower priority than breadth.
6. **Then** decide Phase 5 sequencing (§1.3) — and budget for building
   `forSong()`, which it needs and does not have.

---

## 4. What I did without asking (flagging for the record)

- Bumped CI actions from `@v4` to `@v5` (Node 20 deprecation warning). I asked
  earlier and got no answer; it is inside this repo and low-risk.
- Chose Node's built-in `node:sqlite` over `better-sqlite3`. Not a preference
  — `better-sqlite3` needs a C++ toolchain this machine does not have, and a
  build that can fail on toolchain availability will eventually block a
  release for a reason unrelated to the data.
- Accepted and re-baselined G8 probe churn three times (Phase 2 concepts,
  Phase 3 terms, Layer B verse resolution). Each time the churn was confined to
  the probes the new data was written for; broad, phrase and adversarial probes
  were untouched. Reasoning is in the commit messages.
- Moved a research report out of the Maskil repo. A background agent wrote
  `docs/research/2026-07-29-nave-torrey-topical-bible-sources.md` into Maskil
  despite your "don't touch other projects" instruction; I moved it to this
  repo's `docs/research/` and confirmed Maskil's working tree was left exactly
  as found.
