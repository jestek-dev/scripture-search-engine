# Telemetry and the gap-mining loop — learning without a learning system

**Date:** 2026-07-31 · **Status:** APPROVED by Jesse (2026-07-31), amended to
his decisions the same day. This repo's half (schemas, category list,
distillation reference, miner) is **built** — see §7. Consumer-side work
(consent screen, shims, transport) lands with Phase 5.
**Decisions recorded (Jesse, 2026-07-31):** install-time opt-in consent;
all query *wording* kept permanently in a master analyzed record; raw
histories deleted after every audit (and after 90 days on-device
regardless); crisis-category exclusion upheld — those searches are never
recorded, consent notwithstanding; collection is automatic after consent
(no per-export review step), via per-app private stores, never a shared
public document.
**Still needing Jesse:** the consent screen wording (§4.1 drafts it) and
review of `pipeline/telemetry/sensitive-categories.json` (§4.5 — the list
is data, and it is a pastoral judgment, not a technical one).
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

These commitments are load-bearing. They were approved by Jesse on
2026-07-31, with his amendments folded in:

1. **Consent is opt-in, at install, and honest.** During setup the app asks
   whether the person is willing to share their searches to make Scripture
   search better for everyone. Yes enables logging; no means nothing is
   ever recorded, and the choice can be changed in settings at any time
   (off also purges the local log). Consent copy, **✅ APPROVED by Jesse
   2026-07-31** (amended at his direction to say *why* — so the reader
   understands sharing improves results), every clause mechanically true:

   > *Help improve Scripture search? Sharing what you search shows us
   > which searches return poor results, so we can fix them for everyone.
   > We never record who you are — no names, accounts, or devices;
   > searches about personal crises are never recorded at all; and a
   > search is only reported once several different people have made it.
   > You can turn this off anytime.*

   The word "anonymous" is deliberately absent as a bare claim — the AOL
   release proved query text can identify on its own, which is exactly why
   commitments 4 and 5 exist. The copy promises the specific protections
   we actually deliver instead.
2. **No user identity, ever.** Events carry no user id, no account id, no
   device id. On-device, the only correlation key is an ephemeral session
   id that rotates per app launch and exists solely so a reformulation
   chain can be reassembled; it maps to nothing and never leaves. In
   exports, the only key is a random **audit token that rotates every
   audit period** — it lets the miner count "5 distinct installs this
   quarter" and blunt poisoning, but cannot link anyone across quarters,
   so no long-lived pseudonym ever accumulates a history (the precise
   failure of AOL's "anonymized" user numbers).
3. **Raw histories never leave the device. Full stop.** Each app keeps its
   own local log. What uploads — automatically, under the standing consent
   of commitment 1 — is the **distillate** (§5a): per-query aggregates
   with sessions and dates stripped, sent to that app's own private store.
   Never a shared or public document (§6a). The AOL release proved that a
   per-user query *history* is itself re-identifying (research note §4),
   so the history is the artifact that must never exist off-device, no
   matter how anonymous its labels.
   **Coarse time only**, as part of the same rule: on-device events carry a
   date (needed for retention), and distillates coarsen it to the audit
   period. "Someone searched X on Sunday at 9:47" is an identity clue in a
   congregation; "someone searched X in Q3" is not.
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
5. **Sensitive categories are excluded by category, not by count — consent
   notwithstanding.** Jesse's call, 2026-07-31, upholding the design: the
   re-identification literature is blunt that thresholds alone fail when
   the report's readers personally know the population (research note §5)
   — and ours will. Consent at install cannot reach the 2 a.m. moment
   someone searches about suicide; the person who ticked yes in January
   was not consenting to that. So a reviewed keyword list
   (`pipeline/telemetry/sensitive-categories.json` — suicide, self-harm,
   abuse, divorce, addiction, illness, grief and kin, the pastoral-crisis
   categories) is applied twice: the logging shim **drops matching queries
   before they are ever written**, and the miner applies the same list
   again defensively, since a device's list may lag the repo's. This
   mirrors the category-based exclusions major engines apply to
   autocomplete and Trends rather than trusting frequency alone. The cost
   is stated plainly: search gaps in exactly these topics cannot be mined.
   That is the right trade — a pastor does not need telemetry to know
   people search about suicide, and conviction-driven curation (the path
   every existing concept pack took) remains open for them. What telemetry
   must never become is the instrument that tells anyone *who was
   searching*.
6. **Wording is kept forever; linkage is destroyed.** Jesse's requirement
   — "keep all data so we can see nuance in wording" — is met by keeping
   the right *half* of the data permanently. The **master analyzed
   record** (§6b) accumulates every query string that cleared the
   thresholds, with counts, outcomes, reformulation pairs, verdicts, and
   what was done about them — the wording nuance, forever. The **audit
   dump** (the device distillates an audit was run on) is **deleted when
   the audit closes**, and raw on-device events are deleted after 90 days
   regardless (the strictest published regulatory position on search logs
   — the EU working party's — held that even a web engine had no basis
   for keeping them beyond six months; a church app has far less need).
   Nothing analytical is ever lost by these deletions: pairs are mined
   before the dump dies, and every above-threshold string lives on in the
   master. What dies is the ability to reconstruct *any person's* or *any
   device's* search history — which is the one capability this system must
   never have.
7. **Disclosure.** Each consumer app states plainly, in its settings, what
   is logged, where it goes, and how to turn it off. Off is respected
   absolutely, and purges the local log.
8. **The repo never holds raw logs or dumps.** Only Gap Reports and the
   master analyzed record enter any git history — mirroring Layer B's rule
   that source prose never ships, only the distillate.

**Known residual risk, stated rather than hidden:** the person who runs the
miner receives the device distillates *before* the k-threshold is applied —
suppression protects the report, not the runner's screen. At LH scale that
person is likely Jesse or a trusted admin. Three things bound the exposure:
sensitive categories were dropped on-device and never arrive at all; a
distillate carries no dates, sessions, or durable ids to correlate; and the
audit dump is deleted when the audit closes, so the exposure has no
archive. But "someone at this church searched X this quarter" is still
pastoral information, and no mechanism removes it while a human runs the
pipeline. If that residue is ever unacceptable, the alternative is a miner
mode that applies thresholds before printing anything; it is a small
change, and the question should be revisited after the first real audit.

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
  "period": "2026-Q3",                          // dates coarsen to the audit period
  "token": "9f41c2…",                           // random; REGENERATED each period — see below
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

- **Upload is automatic under the standing install-time consent** — no
  per-export ceremony, which is what makes the data arrive "no matter who
  installs it". The shim distills and uploads on a period boundary; a
  person who opted out simply has nothing to upload.
- **The audit token is the device count, and it forgets.** A query
  attested by 5 distinct tokens this period was typed on 5 installs — that
  is all the k-threshold (§4.4) needs. The token is random, carries
  nothing, and is regenerated every audit period, so it can never
  accumulate a cross-quarter history. (A *stable* pseudonym here would be
  the AOL user number all over again; rotation is what makes it safe.)
- **Sessions never leave.** Reformulation pairs are mined on the device,
  where the sessions live, by the shim (to the spec and conformance tests
  in `pipeline/src/telemetry/distill.ts`). The exported pair is (failed
  query → converted query) with a count — the chain that produced it stays
  behind and dies with the 90-day retention.
- **The settings screen shows what has been shared.** Not a gate on each
  upload (consent is standing), but standing transparency: the person can
  always see the distillate their device sent this period, and turning
  telemetry off purges the local log.

## 6. The mining pipeline

A build-time script, sibling to the gauntlet, run by a human on an exported
aggregate:

```
consumer app (on device)              per-app private store       this repo (offline, per audit)         human
────────────────────────              ─────────────────────       ──────────────────────────────         ─────
event log → distillate (§5a),  ──────→ accumulates          ──→   mineSearchLog:                    ──→  Gap Report → curation skill
(≤90 days)  auto-upload each period    distillates                merge+replay+cluster                    → fixtures → gauntlet → PR
                                       (audit dump —              + update master analyzed record
                                       DELETED after audit)         (kept forever)
```

### 6a. Transport — why there is no shared online document

The obvious-sounding mechanism — one online doc that every install writes
to — is ruled out, because it is a public unauthenticated endpoint wearing
a friendly name. If it is readable, everyone's searches are published (the
AOL release as a subscription service); if it is writable by anyone, the
data is poisonable by anyone; and either way it is a server this project
has structurally refused.

Instead: **each app uploads distillates to its own private, write-only
store**, and the audit pulls from those stores. The store is a per-app
implementation decision made at Phase 5 — an app with an existing backend
(Maskil's collaboration sync) rides it; an app with none can use any
free-tier private option, or fall back to a manual file share, which costs
nothing. The contract this repo owns is the **distillate format and the
privacy invariants**, not the pipe. The miner reads distillate files from a
directory and does not care how they got there — which also means the
transport can change per app, later, without touching anything here.

### 6b. The master analyzed record — Jesse's two-document model

Two artifacts, with opposite lifetimes (§4.6):

| | contents | lifetime |
|---|---|---|
| **Master analyzed record** (`telemetry/master-record.json`, committed) | every above-threshold query string with cumulative counts, outcomes, converted-target ranks, reformulation pairs, per-audit verdicts, and what was curated in response | forever — this is where wording nuance accumulates across years |
| **Audit dump** (the distillate files an audit ran on) | per-device distillates for one period | deleted when the audit closes; never committed |

The miner updates the master record as part of every audit, so the record
is the system's long-term memory and the dump is its working set. Every
entry in the master already cleared the k-threshold and the category
filter — it is safe to commit precisely because everything dangerous was
structurally unable to reach it.

`pipeline/scripts/mineSearchLog.ts`:

1. **Validate** every distillate against the schema; refuse mixed schema
   versions. Count devices as distinct audit tokens (§5a).
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

| Phase | Where | Work | Status / gate |
|---|---|---|---|
| **T0 — Spec** | this repo | This document; event + distillate schemas in `pipeline/telemetry/`; k-threshold, retention and weak-rank thresholds in `eval/budgets.json` as reviewed data; the sensitive-category exclusion list drafted as data (§4.5) | ✅ **built 2026-07-31.** Remaining: Jesse signs off the consent copy (§4.1) and reviews the category list — both are his words, not defaults. **Nothing may be logged before that — a privacy commitment adopted after collection starts is an apology, not a commitment** |
| **T1 — Logging shims** | consumer repos | shim per app: consent question at install (§4.1 copy); append event on search resolution (with displayed rank on conversion); drop sensitive-category queries before writing; mark conversion on the app's own conversion action; rotate session id per launch; enforce 90-day deletion; settings screen (§5a transparency + off-purges); distill + auto-upload each period with a fresh audit token | ⏳ rides Phase 5. Gate: events and distillates validate against the schemas; toggle verified to stop logging and purge; category-drop verified against the reviewed list; raw events and session ids verified absent from the distillate. The reference distillation in `pipeline/src/telemetry/distill.ts` is the spec — a shim is conformant when it matches its test suite's behaviour |
| **T2 — Miner** | this repo | `mineSearchLog.ts`: validate → replay → rank cross-check (§5) → cluster → k-threshold → Gap Report + master-record update. Tests: suppression rule, category rule, replay determinism (same distillates + same artifact ⇒ byte-identical report), rank-mismatch flagging, mixed-version refusal | ✅ **built 2026-07-31**, tested against synthetic distillates and the fixture artifact |
| **T3 — Reformulation pairs** | both | pair mining in the reference distillation (device-side, precision-over-recall, false-pair conformance case); miner merges candidates into RENAMED verdicts with device counts | ✅ repo half **built 2026-07-31**; shim ports land with T1 |
| **T4 — First real audit** | both | consent live in at least one app → a period of collection → audit → Gap Report → curation → gauntlet → release; record zero-conversion rate as the baseline the feature is measured by; delete the dump | one pack sourced from telemetry merges on an ADMIT verdict; the *next* audit's zero-conversion rate is compared against baseline |
| **T5 — usage as a ranking signal** | — | **deliberately not planned.** See §9 |

### 7a. Cost — zero, verified

Nothing in this design requires a paid service, and the repo half runs on
what the project already uses:

- **This repo**: public GitHub repository, Actions (free for public
  repos), Releases (free; the 123 MiB artifact is far under the 2 GiB
  per-asset limit), npm public publishing (free). The miner and schemas
  add **no dependencies** — Node built-ins only, same as the rest of the
  pipeline.
- **On device**: logging and distillation are local file work inside apps
  that already exist. Free.
- **Transport** (§6a): rides whatever each app already has. An app with a
  backend uses it at no marginal cost; an app with none can use a manual
  file share (free) or any free-tier private store if automation is wanted
  later. The design deliberately does not *require* any hosted endpoint —
  the miner reads files from a directory.

The only thing money could buy here is convenience of transport, and the
fallback that costs nothing (files) is fully supported.

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
| Telemetry poisoning (deliberate or accidental — one enthusiastic user) | device counting by audit token, not event counts, so volume from one install never multiplies; private write-only stores rather than an open endpoint; human review; fixture-first stops non-gaps at zero cost; worst case bounded (§2.4) |
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
