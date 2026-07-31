# Telemetry and the gap-mining loop — learning without a learning system

**Date:** 2026-07-31 · **Status:** DESIGN, awaiting Jesse's review — nothing
here is built, and §4 (privacy commitments) requires his explicit approval
before any consumer logs a single event.
**Companion:** `docs/research/2026-07-31-search-telemetry-mining.md` (the
evidence this design stands on) · `docs/implementation-plan.md` §7 (Phase 5,
which this couples to) · `docs/NEEDS-JESSE.md` §1.7 (the decision entry)

**Problem instance:** the remembered-phrasings packs (2026-07-31) fixed
thirteen queries — but the candidate list was guesswork from general
knowledge, not evidence from LH's users. The single weakest step in this
repo's improvement loop is knowing *which queries fail*. Users answer that
question every time they search; today those answers evaporate.

---

## 1. The one-sentence design

Consumer apps log what was searched and whether anything was *used*; a
pipeline script mines those logs offline into a human-readable **Gap
Report**; a human turns gaps into concept packs through the existing
curation skill and admission gauntlet; **nothing else changes**.

The engine never learns. The project learns.

## 2. Why this cannot hurt results — the structural argument

This is the section that answers "ensure it will not hurt results", and the
answer is structural rather than promissory:

1. **The engine never reads telemetry.** The engine package does no I/O
   (non-negotiable #3) and the artifact contains nothing usage-derived.
   Telemetry cannot alter a ranking at runtime because there is no code path
   by which it reaches the runtime. This is not a policy that could erode; it
   is an absence of mechanism.
2. **The only path from a logged query to a shipped ranking is the existing
   one**: a human reads the Gap Report, writes a fixture first, drafts a
   pack, and the gauntlet passes or rejects it. That path already defended
   itself twice in one day — it rejected the Acts 1:8 pack
   (`NO MEASURABLE EFFECT`) and caught the "work at it with all your heart"
   fixture asserting more than production delivers. Telemetry changes what
   the human *looks at*, never what the gates *accept*.
3. **Determinism is untouched.** No event, no log, no report changes
   `(engineVersion, corpusFingerprint, layerFingerprint, query) → ordering`.
   G2 would catch it if it did.
4. **The worst case is bounded.** Poisoned, mistaken, or unrepresentative
   telemetry wastes curation attention — a human reviews a gap that isn't
   real and the fixture-first rule stops it there ("if it already passes,
   stop"). Bad input data costs minutes of review, never a wrong result in
   an app.

The failure modes that make usage-informed search dangerous — click-trained
rankers amplifying position bias, engagement loops hardening early luck into
permanent ranking — are documented in the companion research note, and every
one of them requires a mechanism this design deliberately does not build.
See §8 for the explicit non-goals.

## 3. What we can actually know about intent

A query alone does not reveal what the user meant. The consumer apps'
conversion events do — and each app has a natural one:

| App | Conversion event | What it asserts |
|---|---|---|
| Maskil | passage inserted into the document | this passage answered the query |
| LH Worship Setlist | passage/song attached to the setlist | same |
| Versed | passage added to a memorization pack | same |

Signals, ranked by evidential value:

| Signal | Value | Why |
|---|---|---|
| **Reformulation pair** — searched X, abandoned, searched Y, converted | highest | the user states both the failing phrasing AND the intended target; exactly the shape of a concept pack (lexicon entry + anchor) |
| **Zero-conversion query** — results shown, nothing used; or no results | high (negative) | a measured miss, the direct analogue of what remembered-phrasings needed |
| **Conversion** — result actually used | high (positive) | an endorsement with work behind it |
| Click / view alone | low — **deliberately not logged** | presentation-biased: users click what is shown near the top regardless of relevance (research note §2). A signal we would have to de-bias is a signal we are better off not collecting |
| Dwell time, scroll | none — not logged | noise at our scale, and surveillance-shaped |

Excluding raw clicks is a design decision, not an omission: the eye-tracking
studies show clicks reflect *position and trust in the engine* as much as
relevance — when Joachims et al. reversed a ranking, users still clicked
near the top, and the relevance of what they clicked degraded measurably
without their behaviour changing (research note §2). Correcting for that
requires machinery (click models, result randomization) that has no place in
a system this size. Conversions carry intent; clicks carry layout.

Two rules from the same literature bind how conversion data may be *read*:

- **Usage counts are never a relevance ranking.** The only interpretation
  the primary work validates is *relative* — "the user chose this over what
  was displayed above it". The miner reports converted-target ranks; it
  never sorts passages by how often they were chosen.
- **Every conversion logs the displayed rank it was chosen at** (§5).
  Position is what makes the choice interpretable later; a conversion at
  rank 9 is a strong preference statement, a conversion at rank 1 mostly
  confirms the default.

## 4. Privacy commitments — the section that needs Jesse

A scripture search log at a church is closer to a **prayer log** than a
query log. People will search "does God forgive divorce", "verses about
suicide", "abuse". The 2006 AOL release demonstrated that search queries
alone re-identify real people (research note §4), and every mitigation the
industry has since adopted matters *more* at congregation scale, because
k-anonymity thresholds weaken as the population shrinks — in a community of
hundreds, "at least 3 distinct devices" is a much thinner shield than at web
scale.

These commitments are load-bearing. Approving them is a values call, which
is why this document is a decision for Jesse and not a default:

1. **No user identity, ever.** Events carry no user id, no account id, no
   device id. The only correlation key is an ephemeral session id that
   rotates per app launch and exists solely so a reformulation chain can be
   reassembled. It maps to nothing.
2. **Raw events never leave the device. Full stop.** Each app keeps its own
   local log; nothing is transmitted anywhere on a schedule, and there is no
   telemetry endpoint because there is no server. What can leave — only by
   a deliberate act, and only after the user has seen it — is a **distillate**
   (§5a): per-query aggregates with sessions and dates stripped. The AOL
   release proved that a pseudonymous per-user query *history* is itself
   re-identifying (research note §4), so the history is the thing that must
   never exist off-device, no matter how anonymous its labels.
3. **Coarse time only.** Events carry a date, not a timestamp. "Someone
   searched X on Sunday at 9:47" is an identity clue in a congregation;
   "someone searched X in March" is not.
4. **k-threshold before any query string becomes visible.** The Gap Report
   shows a query string only when it was seen from **≥ 3 distinct devices**
   (tunable in `eval/budgets.json` as reviewed data, like every other
   threshold here). Below-threshold queries are counted in aggregate
   ("14 distinct rare queries suppressed") but never printed. Honesty about
   the number: no major engine publishes its suppression threshold —
   Google Trends simply reports low-volume terms as zero — so k = 3 is our
   chosen floor, not an inherited industry constant, and at congregation
   scale it is necessary but **not sufficient**, which is why commitment 5
   exists.
5. **Sensitive categories are excluded by category, not by count.** The
   re-identification literature is blunt that thresholds alone fail when
   the report's readers personally know the population (research note §5)
   — and ours will. So a reviewed keyword list (suicide, self-harm, abuse,
   divorce, addiction, illness, grief and kin — the pastoral-crisis
   categories, maintained as data in this repo) is applied twice: the
   logging shim **drops matching queries before they are ever written**,
   and the miner applies the same list again defensively, since a device's
   list may lag the repo's. This mirrors the category-based exclusions
   major engines apply to autocomplete and Trends rather than trusting
   frequency alone. The cost is stated plainly: search gaps in exactly
   these topics cannot be mined. That is the right trade — a pastor does
   not need telemetry to know people search about suicide, and
   conviction-driven curation (the path every existing concept pack took)
   remains open for them. What telemetry must never become is the
   instrument that tells anyone *who was searching*.
6. **Retention limit.** Raw local events are deleted after 90 days,
   enforced by the logging library, not by policy memory. (The strictest
   published regulatory position on search logs — the EU working party's —
   held that even a web engine had no basis for keeping them beyond six
   months; a church app has far less need, so 90 days.) Distilled exports
   (already thresholded and category-filtered) may be kept.
7. **Disclosure.** Each consumer app states plainly, in its settings, what
   is logged, that it stays on the device, and how to turn it off. Off is
   respected absolutely.
8. **The repo never holds raw logs.** Only Gap Reports and the thresholded
   aggregate exports behind them enter any git history — mirroring Layer B's
   rule that source prose never ships, only the distillate.

**Known residual risk, stated rather than hidden:** the person who runs the
miner receives the device distillates *before* the k-threshold is applied —
suppression protects the report, not the runner's screen. At LH scale that
person is likely Jesse or a trusted admin. Three things bound the exposure:
sensitive categories were dropped on-device and never arrive at all; every
user saw and approved their own distillate before it left (§5a); and a
distillate carries no dates, sessions, or ids to correlate. But "someone at
this church searched X this quarter" is still pastoral information, and no
mechanism removes it while a human runs the pipeline. If that residue is
unacceptable, the alternatives are restricting distillates to zero-result
queries only (less sensitive — mostly phrasing failures) or having the
miner apply thresholds before printing anything to the terminal; both are
small changes, and the choice should be revisited after the first real
export.

## 5. The event schema

One event per completed search interaction. Versioned from day one so the
miner can always tell what it is reading.

```jsonc
{
  "v": 1,
  "app": "maskil",                      // maskil | setlist | versed
  "date": "2026-07-31",                 // date only — see §4.3
  "session": "b3f2…",                   // ephemeral, rotates per launch — see §4.1
  "engineVersion": "0.7.1",             // ┐
  "corpusFingerprint": "a757e7a0…",     // ├ the identity triple, verbatim
  "layerFingerprint": "5805dd26…",      // ┘ from the result the user saw
  "query": "plans to prosper you",
  "outcome": "converted",               // converted | abandoned | empty | reference
  "target": "WEB:24029011",             // targetId of the USED result; null unless converted
  "rank": 3                             // displayed position of the used result; null unless converted
}
```

`rank` earns its bytes twice. First, it is what makes a conversion
interpretable — the click-bias literature's one validated reading of usage
data is *relative* preference, and rank is the term that expresses it
(§3). Second, it is an integrity check on the whole pipeline: the miner
replays the query and independently computes where the target ranked, and
**a mismatch between replayed rank and logged rank flags the event as
untrustworthy** (a consumer-side bug, or an artifact/identity mismatch)
instead of feeding it to the report. Determinism is what makes that
cross-examination possible at all.

What is deliberately absent: the results list. **The identity triple makes
it recoverable.** Because every release's `content.db` is a permanent
GitHub Release asset and ordering is deterministic, the miner can replay any
logged query against the exact artifact version the user saw and reconstruct,
byte-for-byte, what was on their screen — including where the converted
target ranked. Most search telemetry must log the full impression list
because the ranker drifts under it; ours never drifts. This is the
reproducibility contract paying a dividend: **smaller events, less stored
data, and a privacy surface that shrinks instead of growing.**

`outcome: "reference"` records that the query parsed as a direct reference
lookup (Step 1 of the ladder). These are logged only as counts — reference
lookups are navigation, not discovery, and mining them adds nothing.

The schema lives in `pipeline/telemetry/event.schema.json` as JSON Schema,
tested in `pipeline/test/`, and consumed by each app's logging shim. The
engine package is untouched — logging is consumer-side by constraint #3.

### 5a. The export distillate — what actually leaves a device

The event above is the *on-device* record. What exports is smaller, and the
reduction is where several commitments become mechanical:

```jsonc
{
  "v": 1,
  "app": "maskil",
  "period": "2026-Q3",                          // dates coarsen to a quarter
  "queries": [
    {
      "query": "plans to prosper you",
      "identity": { "engineVersion": "0.7.1", "corpusFingerprint": "a757…", "layerFingerprint": "5805…" },
      "outcomes": { "empty": 0, "abandoned": 4, "converted": 1 },
      "conversions": [{ "target": "WEB:24029011", "rank": 3, "count": 1 }]
    }
  ],
  "pairs": [                                     // mined ON the device — see below
    { "from": "plans to prosper you", "to": "jeremiah 29 11", "count": 2 }
  ]
}
```

- **One distillate file per device, no device id inside it.** The file
  boundary *is* the device count: a query seen in 5 files was typed on 5
  devices. The k-threshold (§4.4) needs nothing more, so no device
  identifier ever exists in any format.
- **Sessions never leave.** Reformulation pairs are mined on the device,
  where the sessions live, by the shim (to a spec and test suite defined in
  this repo). The exported pair is (failed query → converted query) with a
  count — the chain that produced it stays behind and dies with the 90-day
  retention.
- **The user sees the distillate before it goes.** Export shows the actual
  list — every query string about to leave — and requires an explicit yes.
  A person who searched something they consider private is the only party
  qualified to catch what every filter missed, and this is the step that
  makes them part of the defense rather than its subject.

## 6. The mining pipeline

A build-time script, sibling to the gauntlet, run by a human on an exported
aggregate:

```
consumer app (on device)                this repo (offline)              human
────────────────────────                ───────────────────              ─────
event log → distillate → user reviews → mineSearchLog        →  Gap Report → curation skill
(≤90 days)  (§5a)        & exports      merge+replay+cluster                → fixtures → gauntlet → PR
```

`pipeline/scripts/mineSearchLog.ts`:

1. **Validate** every distillate against the schema; refuse mixed schema
   versions. Count devices as files (§5a).
2. **Replay** each distinct query against the pinned artifact version its
   distillate names (downloaded by descriptor from Releases, verified
   against `databaseSha256` — the same verification consumers do). Replay
   reconstructs the result list the user saw and cross-checks each
   conversion's logged rank (§5); mismatched rows are flagged, not used.
3. **Cluster** by normalized token signature (the shared tokenizer — one
   tokenizer, non-negotiable #4), so "plans to prosper" and "plans to
   prosper you" are one gap, not two.
4. **Merge reformulation pairs** mined on the devices (§5a). Pairing is a
   **precision-over-recall** business — session inference is the
   noise-prone step in every study that has tried it — so the shim spec
   requires same session AND a short gap in the same search box, and the
   report labels pairs *candidates*, to be read rather than trusted.
   Missing some real pairs is fine; a false pair sends a curator to anchor
   the wrong verse.
5. **Emit the Gap Report.**

### The Gap Report

Shaped like the Admission Report: verdicts a human reads, not a dataset a
human wades through.

```markdown
# Gap Report — 2026-Q3 export (3 apps, 41 distinct devices)

| Verdict | Query cluster | Devices | Evidence | Suggested move |
|---|---|---|---|---|
| MISS      | "lukewarm faith"        | 7 | 0 results, 0 conversions        | concept pack (Rev 3:15-16?) — fixture first |
| RENAMED   | "plans to prosper you"  | 5 | abandoned → "jeremiah 29 11" converted, rank 1 | lexicon entry on existing concept |
| WEAK      | "armor of god"          | 4 | conversions exist, mean converted rank 6.2 | check anchor weights |
| SATISFIED | "fruit of the spirit"   | 9 | conversions at rank 1           | none — do not touch |
| SUPPRESSED | (14 rare queries)      | — | below k=3                       | none — invisible by design |
```

Rules the report generator enforces structurally (with tests):

- **No below-threshold query string is ever emitted**, in any verdict, any
  footnote, any debug output. The test feeds it single-device events and
  asserts the string appears nowhere.
- **No sensitive-category query string is ever emitted** — same structural
  test, run against the reviewed category list (§4.5).
- **SATISFIED clusters are listed.** A report that only shows failures
  invites fixing what isn't broken; the strongest use of the report is
  knowing what to leave alone.
- **The tail gets a standing section.** A frequency-sorted report curates
  the head and starves the tail — the editorial version of the feedback
  loop the recommender literature documents (research note §3): what gets
  fixed gets used, what gets used gets reported, and rare-but-real gaps go
  permanently unserved. So MISS and RENAMED rows appear **regardless of
  frequency** (device threshold still applies), the report is ordered by
  verdict rather than by volume, and corpus growth from conviction
  (Nave/Torrey, new expositors) continues on its own track — telemetry
  adds evidence; it must never become the only admission ticket.
- **A suggested move is a suggestion.** The report never writes YAML. The
  distance between "the report suggests" and "a human decides, fixtures
  first" is the entire safety argument of §2, and it stays a manual step on
  purpose.

## 7. Implementation plan

Telemetry depends on consumers actually using the engine, so T1 onward is
coupled to Phase 5 — this is Phase 5's instrumentation arm, not a detour
before it.

| Phase | Where | Work | Gate |
|---|---|---|---|
| **T0 — Spec** | this repo | This document reviewed; §4 approved or amended by Jesse; event schema committed to `pipeline/telemetry/event.schema.json` with validation tests; k-threshold and retention added to `eval/budgets.json` as reviewed data; the sensitive-category exclusion list drafted and reviewed as data (§4.5) | Jesse signs off §4. **Nothing may be logged before this gate — a privacy commitment adopted after collection starts is an apology, not a commitment** |
| **T1 — Logging shims** | consumer repos | shim per app: append event on search resolution (with displayed rank on conversion), drop sensitive-category queries before writing, mark conversion on the app's own conversion action, rotate session id, enforce 90-day deletion, settings toggle + disclosure copy; **export flow**: build the distillate (§5a), show it to the user, share only on explicit yes | events and distillates validate against their schemas; toggle verified to stop logging; category-drop verified with the reviewed list; raw events and session ids verified absent from the distillate |
| **T2 — Miner** | this repo | `mineSearchLog.ts`: validate → replay (descriptor-verified artifact download) → rank cross-check (§5) → cluster → Gap Report. Tests: suppression rule, category rule, replay determinism (same distillates + same artifact ⇒ byte-identical report), rank-mismatch flagging, mixed-version refusal | synthetic distillates produce a correct report; the suppression and category tests pass |
| **T3 — Reformulation pairs** | both | pair-mining spec + conformance tests in this repo (`pipeline/telemetry/`), implemented in each shim where the sessions live; miner merges pair candidates; RENAMED verdict | shim conformance suite passes, including a false-pair case it must NOT emit; miner surfaces candidates with device counts |
| **T4 — First real cycle** | both | run one export → Gap Report → curation → gauntlet → release, end to end; record zero-conversion rate as the baseline the whole feature is measured by | one pack sourced from telemetry merges on an ADMIT verdict; the *next* export's zero-conversion rate is compared against baseline |
| **T5 — usage as a ranking signal** | — | **deliberately not planned.** See §9 |

Effort honestly stated: T0+T2+T3 are a few days in this repo. T1 is small
per app but rides Phase 5's schedule. T4 is calendar time — at LH scale,
a quarter's worth of events is a realistic first export, and **low volume is
acceptable**: twenty real gaps a quarter beats sixty-five guesses, which is
what the remembered-phrasings work had to settle for.

### Success metrics (recorded per cycle, in the report itself)

- **Zero-conversion rate**, the headline: of distinct query clusters, how
  many produced no conversion. The feature exists to push this down.
- **Converted-rank distribution**: conversions at rank 1 vs rank 5+ —
  measures whether we rank well, not just whether we match.
- **Fixtures sourced from telemetry vs from guesswork**, cumulative.
- **Packs rejected by the gauntlet** — reported without embarrassment. A
  healthy loop rejects some candidates; zero rejections means the gates are
  not being reached, not that curation is perfect.

## 8. Non-goals — permanent, not deferred

- **No online learning.** Nothing adjusts at runtime. (CLAUDE.md #1 and #2.)
- **No personalization.** Same query, same artifact, same ordering for every
  person — determinism is per-engine, never per-user. Recents and pins are
  consumer-UI concerns.
- **No click-trained ranking.** Clicks are not even collected (§3).
- **No auto-generated packs.** The miner writes reports; humans write YAML.
- **No popularity evidence** — "other users chose this" is not a reason this
  engine is permitted to give. Reasons cite curated sources with provenance;
  a popularity chip would be an unfalsifiable claim of relevance, which is
  what the reason system exists to forbid (`engine/src/reasons/types.ts`).

## 9. The one door left ajar, and its lock

There is a principled future in which usage data touches ranking: the same
door OpenBible topic votes entered through — a **versioned, reviewed,
capped, provenance-labeled snapshot**, admitted through the gauntlet as
data, re-admitted only as a reviewed change. The typed-but-unused
`co_citation` family is the natural slot.

It stays shut for now because the documented failure mode is severe: a
system that ranks by its own users' choices shows winners more, which makes
them chosen more, which ranks them higher — a loop that hardens early
accidents into permanent ordering. The formal treatment (research note §3)
adds the counter-intuitive part: the *better* the usage signal predicts
engagement, the *faster* the degeneration — accuracy accelerates the
pathology rather than curing it, so "we'll add it once the data is good" is
exactly backwards. OpenBible's votes do not have this problem *for us*
because its voters never saw our rankings. Ours would.

Preconditions before this may even be proposed, recorded now so the
decision is made in the cold:

1. ≥ 4 completed T4 cycles with the telemetry proven clean and useful.
2. A poisoning threat model reviewed by Jesse (one person re-searching
   nightly must not become "evidence").
3. The signal enters as **tie-break weight only**, individually and
   aggregately capped below every existing weak family.
4. A dedicated probe fails the build if usage evidence ever changes any
   top-3 ordering on the probe set.
5. Snapshots admitted at most annually, as reviewed PRs.

Absent all five, the answer stays no, and this section is the record of why.

## 10. Risks

| Risk | Handling |
|---|---|
| Telemetry poisoning (deliberate or accidental — one enthusiastic user) | device-count thresholds, not event counts; human review; fixture-first stops non-gaps at zero cost; worst case bounded (§2.4) |
| Privacy breach via query strings | §4 in full: no ids, coarse time, k-threshold, category exclusion applied on-device, retention, histories never leave the device (§5a distillate), user-reviewed export, suppression tested structurally |
| Volume too low to matter at LH scale | quarterly cadence; the report says "n distinct devices" so thin evidence *looks* thin; even a handful of RENAMED pairs is more ground truth than the guesswork it replaces |
| Consumer apps log inconsistently | one shared JSON Schema, versioned; miner refuses what it cannot validate rather than guessing |
| Report-driven tunnel vision (only fixing what users already search) | curation from conviction continues unchanged — the report adds evidence, it does not become the only admission ticket; SATISFIED rows guard against fixing the unbroken |
| Scope creep toward §8's non-goals | non-goals are written here as permanent; §9's preconditions make the one exception expensive and explicit |

---

*The evidence base for §2, §3, §4 and §9 — click bias, reformulation
mining as established practice, the AOL re-identification, k-anonymity
thresholds, and degenerate feedback loops — is compiled with primary
sources in `docs/research/2026-07-31-search-telemetry-mining.md`.*
