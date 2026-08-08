# Needs Jesse — decisions, risks, and open items

**Last updated:** 2026-07-30, overnight session
**Status:** Layer B covers **99.0% of the Bible** from seven expositors. Full
artifact builds at 117.60 MiB and is descriptor-pinned. All five consumer API
methods ship at ENGINE_VERSION 0.7.1 on npm. Phase 5 is unblocked but not
started.

> **Read §0 first.** It is the short list of things only you can decide.

---

## 0. What I need from you, shortest path first

Five things. The first two are decisions only you can make; the rest are
reviews of numbers I had to pick to keep moving.

1. **Approve (or reject) a `remembered-phrasings` concept pack.** §1.6a.
   Searching *"plans to prosper you"* returns nothing, because that is NIV
   wording and the corpus is WEB. I tested adding KJV: it fixes **zero** of the
   ten phrasings I checked, because the wordings people remember are from
   copyrighted translations. Layer A is the mechanism that fits — a concept
   whose lexicon holds the remembered phrasing, anchored to the verse it means.
   I did not build it because approving those anchors is a claim about meaning,
   which is your call, not mine. **This is the most user-visible open item in
   the system.**

2. **Confirm the npm scope exists.** §1.2. Repo is now public and packages are
   renamed `@jestek-dev/*`. An npm scope must match an npm account or org of
   that name, which is separate from the GitHub owner — if `jestek-dev` is not
   registered on npm, publishing will fail and we either register it or publish
   via GitHub Packages instead.

3. **Review `eval/budgets.json`.** §1.6b. Per-table budgets are now *enforced*
   and are first values I set from a single measurement. Wrong numbers will
   either block real work or wave through real growth. The artifact sits at
   117.60 MiB of 160 MiB — roughly one more whole-Bible commentator fits.

4. **Decide what a tripped weak-share gate means** — stop adding, or
   re-baseline. §1.6c. Deciding in the moment is how a gate becomes decoration.
   There is time: the last two admissions moved it +0.014 against a 0.15 budget.

5. **Upload the OpenBible snapshot archive.** §1.7. Two-minute errand, and
   nobody else can do it: G1 now warns that `openbible-topics` and
   `openbible-xrefs` pin bytes that exist only on machines which already
   downloaded them. Upload the two files from `pipeline/sources/` as a
   Release asset and paste the URLs into the manifests as `archiveUrl`.
   The warning clears itself the moment those fields are filled.

6. **Phase 5 sequencing.** §1.3. The engine is ready — all five API methods
   ship with contract tests. What remains is inside Maskil, Setlist and Versed.

Everything else in this document is context, not a request.

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

### 1.2 Repository visibility and package scope — ✅ DONE (2026-07-30)

- **Repo is public**, per your call.
- **Packages renamed** `@lh/*` → `@jestek-dev/*` across all three workspaces.

Two consequences worth having seen deliberately rather than discovering:

**The committed distillate is now public.** `pipeline/fixtures/passage-terms-subset.json`
is 6.8 MB of term statistics, some derived from CCEL-sourced Matthew Henry and
JFB. Your §1.4b decision — that a distillate is not republication of their
transcription — already contemplated public distribution via Releases, so this
is consistent with it. Flagging because going public makes that decision
load-bearing in public rather than in a private repo. Say the word and I will
revert visibility.

**An npm scope is not a GitHub owner.** `@jestek-dev` on npm has to be a
registered npm account or org. If it is not, publishing fails and the options
are to register it or publish via GitHub Packages. I could not check this
without your npm credentials.

### 1.7 The OpenBible snapshots have no durable copy — mechanism is in, the upload is yours

§2.5 recorded that `a.openbible.info` rolls its files weekly with no archive,
so our checksums *are* the snapshot. That was filed as "worth keeping a copy
somewhere durable". It is now enforced rather than remembered:

- Manifests declare `rollingSourceUrl: true` and may record an `archiveUrl`.
- **G1 warns** (never fails) when a rolling source has no archive, naming the
  file and the destination. It warns rather than blocks because closing it
  needs a Release upload, which no build script can perform, and blocking
  unrelated PRs on a human errand is how a gate gets routed around.
- `fetchSources` tries the authoritative URL first and falls back to the
  archive, accepting only bytes that match the pinned checksum. So the day
  upstream republishes, the build keeps working instead of failing closed.

**What is deliberately NOT done:** no `archiveUrl` is written yet. Pointing a
manifest at a Release asset that does not exist would recreate precisely the
hole G1 was extended to close in §2.6b — a URL that reads as provenance and
resolves to nothing. The field goes in when the bytes are actually there.

To close it: upload `pipeline/sources/topic-scores.zip` and
`cross-references.zip` to a Release (CC BY permits redistribution with
attribution; the manifests already carry the attribution text), then add
`"archiveUrl": "<asset url>"` to each manifest. G1 flips to pass.

### 1.3 When does Maskil adopt this? — still open, and now also blocked technically

Phase 5 is written but not started, per your instruction. Maskil's own July
audit deliberately sequenced the broad research engine *after* the
collaboration pilot.

New since I last wrote this: adoption is no longer *only* a sequencing call.
The engine ships `research()` and nothing else. Setlist and Maskil both need
`forSong()`, which is typed but unbuilt. So Phase 5 has real work in front of
it regardless of when you want it (implementation plan §5).

### 1.4a Treasury vol. 3 is in; vol. 5 is deliberately NOT — ✅ resolved

Volume 3 (Psalms 55–87) was found in the same University of Toronto scan set as
the others, so the parser's conventions carried over unchanged: 1,452
expositions, and admitted terms went 2,583 → 3,060 (+18%).

**Volume 5 (Psalms 111–119) was not added, on purpose.** That volume does not
exist in the Toronto set. The only openly-readable copies come from a different
seven-volume edition, whose volume 5 also covers Psalms 104–110 — ground the
existing volume 4 already holds.

Before the author fix (§2.8) that would have been actively harmful: two
manifest ids on the same verses, read as two independent sources, manufacturing
Spurgeon corroborating Spurgeon. That is now structurally impossible. But it
also means the volume would contribute **nothing** today: Psalms 111–119 would
have Spurgeon alone, and a single author never clears corroboration.

Per this repo's own rule, an addition that changes no outcome is
`NO MEASURABLE EFFECT` and should not be merged. It becomes worth adding the
moment a second author covers those psalms.

### 1.4b CCEL — ✅ DECIDED (2026-07-29)

Jesse's call: **admit Matthew Henry and JFB**, on the reading that shipping a
term-statistics distillate is not republication of CCEL's transcription. The
underlying works are public domain; what we redistribute is counts and PMI
scores, not their prose.

To record when those sources are admitted: the reasoning goes in the manifest's
`licenseRecord`, not into a bare `public_domain` claim, so the judgment is
visible to anyone auditing the artifact rather than buried in a decision nobody
can find. This is a different conclusion from the one taken for Treasury of
David, and the manifests should say why rather than look inconsistent.

### 1.4 Which commentators come next — I have a recommendation, not a decision

Corroboration (§2.1) means coverage now depends on **authors per verse**, not
works ingested. Two candidates, different shapes:

~~Finish Treasury vols 3 and 5~~ — settled in §1.4a.

What remains, in the order I would do it:

- **Whole-Bible verse-keyed commentaries via SWORD modules.** The importer is
  built and **Clarke is admitted** (§2.9). Next: Keil & Delitzsch (OT) and
  Barnes (NT), then Matthew Henry and JFB now that §1.4b is decided. Each is
  now a data change — a manifest and a registry line — not new code. Survey in
  [docs/research/2026-07-29-whole-bible-exposition-sources.md](research/2026-07-29-whole-bible-exposition-sources.md).
- **Spurgeon's sermons: later, deliberately.** 63 volumes exist as OCR, but
  they need the alignment path the modules avoid, carry OCR noise, and cover
  what a Victorian Baptist preached rather than the canon. Sermons are depth;
  the current gap is breadth.

Moving to a second book means finding 2+ PD commentators on it before ingesting
anything — one author on a new book buys nothing now, which is a change from
how this looked a phase ago.

### 1.5 The size budget is fine after all — my earlier advice was wrong

I previously recorded that 160 MiB against a 40.91 MiB artifact was "4x too
loose" and suggested tightening to 64 MiB. **Do not do that.** Three
commentators later the artifact is 97.48 MiB, and a 64 MiB ceiling would have
blocked the work that took Bible coverage from 68% to 95%.

The lesson is about when a budget can be judged, not about the number: I was
measuring headroom against a corpus that was one-sixth built. Current position
is 97.48 of 160 MiB, so roughly one more whole-Bible commentator fits. That is
now a real constraint worth watching rather than a formality.

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

### 1.6 Two thresholds need your attention now that Layer B is large

**a) REMEMBERED PHRASING IS A REAL PRODUCT GAP — and a second translation does
NOT fix it. I measured.**

Searching *"plans to prosper you"* returns nothing useful. That is NIV wording;
the WEB reads *"thoughts of peace, and not of evil, to give you hope and a
future."* No shared words, no match.

My first instinct — recorded here yesterday — was to admit KJV as a second
public-domain translation. **I tested that and it is wrong.** Ten commonly
remembered phrasings, checked against both texts:

| remembered as | WEB | KJV |
|---|---|---|
| "plans to prosper you" | ✗ | ✗ |
| "lean not on your own understanding" | ✗ | ✗ |
| "soar on wings like eagles" | ✗ | ✗ |
| "seek first the kingdom" | ✗ | ✗ |
| "confidence in what we hope for" | ✗ | ✗ |
| "I can do all things through Christ" | ✓ | ✓ |
| "fearfully and wonderfully made" | ✓ | ✓ |
| "all things work together for good" | ✓ | ✓ |
| "God so loved the world" | ✓ | ✓ |
| "a new creation" | ✓ | ✗ |

WEB alone 5/10. KJV alone 4/10. **Either translation: still 5/10.** KJV adds
nothing, and would cost roughly 22 MiB of artifact.

The reason is structural: the phrasings people remember are NIV and ESV, and
those are copyrighted. **No public-domain translation will ever close this**,
so this is not a corpus problem to be solved by buying more corpus.

**Layer A is the mechanism that fits.** A concept whose lexicon contains "plans
to prosper you" and whose anchor is Jeremiah 29:11 solves it exactly — that is
what the curated ontology is *for*, and it is the one layer where LH's own
voice is allowed to be explicit.

I did not do it, deliberately: the curation flow puts fixtures first, and
confirming the fixtures is the product judgment reserved for you. It is also
theologically load-bearing in a way term statistics are not — deciding that
"plans to prosper you" should surface Jeremiah 29:11 is a claim about meaning.

**What I would ask you to approve:** a `remembered-phrasings` concept pack
covering the top ~50 most-searched verses in their NIV/ESV wording, anchored to
the WEB verses they refer to, tagged `editorial`. It is mechanical once you
approve the list, and it converts the single most user-visible failure in the
system into a solved case.

**c) Weak-reason share, and a probe set that no longer covers the corpus.**
Matthew Henry raised weak-evidence share by 0.120 against a 0.15 budget on
`phrase-present-help`. Keil & Delitzsch then moved it by 0.006 — but that is
NOT reassurance. KD is Old Testament only, and all 13 probes sit in Psalms and
the New Testament. **G8 barely measured the addition that changed coverage
most.**

The probe set was written when Layer B was Psalms-only. The corpus is now 99%
covered in the OT, and nothing probes Genesis narrative, the law, the
histories, or the prophets. Probes are the noise detector; a detector aimed
away from where the data landed reports quiet regardless.

RESOLVED for the probe set: 12 OT probes were added covering law, narrative,
histories, wisdom and prophecy, and the fixture grew from 828 to 1,077 verses
so those probes have something to measure. All 25 probes now hit their intended
passage.

STILL OPEN: decide in advance whether a tripped weak-share gate means *stop
adding* or *re-baseline*. Deciding in the moment is how a gate becomes
decoration. (Barnes and JFB moved it only +0.014 against a 0.15 budget, so
there is time.)

**b) `size.perTableBytes` — now enforced, and the numbers want review.**

Previously these were declared and read by nothing, with two of six keys naming
tables that had been renamed away. G10 now measures bytes per table from the
built artifact (via SQLite's `dbstat`, with each index attributed to the table
it serves) and fails on any table over budget.

The values are mine, set from one measurement, and they are guardrails now:

| table (incl. indexes) | measured | budget |
|---|---|---|
| verse_terms | 77.00 MiB | 100 MiB |
| cross_references | 17.77 MiB | 24 MiB |
| verse_tokens | 14.08 MiB | 20 MiB |
| verses | 5.87 MiB | 8 MiB |

`verse_terms` deliberately gets room for roughly one more whole-Bible author,
since that is the table admission grows. If you intend more than that, raise it
knowingly rather than discovering it as a failed build.

The gate also reports any *unbudgeted* table over 1 MiB rather than passing it,
which justified itself immediately by failing the first run on an FTS shadow
table nobody had considered.

### 2.10 Whole-Bible coverage: 95.3%, and what still limits it

Measured on the real artifact, not the fixture:

| | verses with evidence |
|---|---|
| **Whole Bible** | 30,777 / 31,098 = **99.0%** |
| Old Testament | **99.6%** |
| New Testament | **97.3%** |
| Books under 90% | **1** (Mark, 86%) |

Five expositors are now admitted: Clarke, Matthew Henry, Keil & Delitzsch
(OT), Barnes (NT) and JFB, alongside Spurgeon and Maclaren on Psalms.
Artifact 117.60 MiB of a 160 MiB budget.

The diagnosis that produced this: coverage was never limited by commentators
being silent. Before KD, 9,835 verses (31.6%) had *exactly one* expositor and
were blocked by the corroboration rule alone — essentially every verse in the
Bible has someone writing about it. Adding a third OT voice converted almost
all of them.

**Mark is the last real gap at 86%**, and it is a property of the sources
rather than of the pipeline: commentators habitually treat Mark by referring
back to Matthew, so a note on Mark 4 often reads "see Matthew 13". Closing it
means a commentator who treats Mark on its own terms. Diminishing returns are
now visible in the marginal deltas — Barnes contributed 0.053 and the Psalms
specialists 0.004-0.007, against Henry's 0.383.

### 2.9 Layer B is off Psalms — Clarke and Matthew Henry are both in

Two whole-Bible expositors are admitted, and the second is what mattered.

| | terms admitted | fixture verses covered |
|---|---|---|
| Treasury + Maclaren (Psalms only) | 3,060 | 15 |
| + Clarke | 19,741 | 45 |
| + Matthew Henry | **233,011** | **677** |
| + Keil & Delitzsch | **649,583** | **775** |

Clarke alone changed nothing outside the Psalter, exactly as predicted: one
author never clears corroboration, so all he bought was depth where two authors
already agreed. Breadth needed the second whole-Bible voice. All 15 books in
the fixture now carry evidence, and the terms are the right ones — Matthew 7:24
gets *stormy, parable, firm, foundation, wind, rock*; Ephesians 2:8 gets
*boast, gift, salvation, merit, grace, faith*.

**Henry writes by SECTION, and taking the module literally would have lied
about that.** SWORD modules must store a body for every verse, so Henry's one
essay is repeated against each verse it covers — he would have appeared to
write 31,098 verse-specific notes with `min_span_verses: 1`, out-specifying
Clarke's genuinely per-verse notes on their own ground and inflating every term
count by the length of the run.

Collapsing consecutive identical bodies recovers what he actually wrote: 31,098
entries -> 4,249 documents at a median span of 6 verses. The same rule reads
Clarke correctly too (21,052 -> 21,051 documents, span 1), which is the test of
whether it describes the sources or flatters one of them.

The versification mapping was the risk, and it is verified rather than assumed:
KJV arithmetic predicts 8,246 NT and 24,115 OT index entries, and Clarke's
module has exactly those. Of 21,052 notes, exactly one disagrees with its own
printed verse number — Matthew 23:14, a genuine editorial renumbering around a
textual variant. A systematic off-by-one would have produced thousands.

### 2.8 Corroboration counted VOLUMES, not authors — fixed before it could bite

Found while planning the volume 5 addition. `minSources: 2` was counting
distinct *manifest ids*, and every volume of a commentary has its own manifest
id. So volume 4 of the Treasury could have corroborated volume 5, and a second
edition could have corroborated the first — the same man agreeing with himself,
which is precisely what corroboration exists to rule out.

Nothing was wrong in the shipped data: the Toronto volumes cover disjoint
psalms, so no verse was ever attested by two Treasury volumes. It was safe **by
accident**, and the accident was one overlapping edition away from ending.

Sources now carry an `authorId`. Corroboration counts authors; volume ids are
kept for provenance display, so a result can still say which books the evidence
came from. Three tests lock the rule down, including the exact case that
prompted it.

Worth noting the shape of this: like the per-term attribution bug in Phase 3,
the metric looked correct and would have silently reported confidence it had
not earned. Both were found by asking what a *new* source would do to the
numbers, not by testing the numbers as they stood.

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
3. ~~Finish *Treasury of David* vols 3 and 5~~ — vol. 3 **done**; vol. 5
   deliberately skipped with reasons (§1.4a).
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

---

## 7. Publishing to npm — ✅ DONE (2026-07-31)

`@jestek-dev/scripture-engine@0.7.1` is on the public registry, published
through OIDC with **signed SLSA provenance** recorded in Sigstore's public
transparency log. Verified by installing from npm into a clean directory.

The provenance is worth more than the convenience: it ties the published
tarball to the exact commit and workflow that produced it, so a consumer can
verify the code on npm matches the code on GitHub without trusting anyone. A
stored token would never have produced that.

```bash
npm i @jestek-dev/scripture-engine
```

**No credential exists in this pipeline.** Releases publish through Trusted
Publishing (OIDC): GitHub mints a short-lived token, npm verifies it against a
trusted publisher pinned to this repository and this workflow filename. There
is nothing to leak, nothing to rotate, and no shared secret.

That is also the only mechanism that keeps working. npm is removing publishing
from bypass-2FA tokens around January 2027 — a stored `NPM_TOKEN`, which is
what I first proposed, would have worked today and quietly died then.

**Two things that had to be yours**, because I do not create accounts or handle
credentials: enabling 2FA (npm now offers only security keys — Touch ID counts)
and the first `npm publish`, which needs a fingerprint prompt. Everything after
this is automatic.

### One gap this surfaced: the package has no licence

npm displays it as **Proprietary**, because `engine/package.json` declares no
`license` field and the repository has no LICENSE file. The repo is public,
which means as it stands nobody has permission to use the code — the default
for published-but-unlicensed work is all rights reserved.

For Maskil, Setlist and Versed that changes nothing; you own them. It matters
if anyone else ever finds it, and it is a two-line fix. I have not chosen one:
a licence is a rights decision, not a technical one. MIT if you want it freely
usable, Apache-2.0 if you want an explicit patent grant, or leave it
proprietary deliberately — but deliberately rather than by omission.

