# Needs Jesse — decisions, risks, and open items

**Last updated:** 2026-07-29, after Phase 4
**Status:** Phases 0–4 complete and pushed. Phase 5 (consumer adoption) deliberately not started.

Nothing here is blocking day-to-day work on the engine. Everything here is a
call that is yours, not mine.

---

## 1. Decisions I need from you

### 1.1 Is the starter ontology theologically sound? ⚠️ **highest priority**

I authored 8 concepts in `ontology/concepts/`. They are AI-drafted and
admitted by the gates, but **no human has reviewed them theologically.** They
carry `sources: [editorial]`, which renders in the product as *"LH
editorial"* — your name, your judgment.

Please read these 8 files. They are short:

| Concept | Anchors it asserts |
|---|---|
| `obedience-to-the-word` | James 1:22-25, Matt 7:24-27, Luke 6:46-49, Ezek 33:31-32, Rom 2:13, John 13:17 |
| `building-on-the-rock` | Matt 7:24-27, Luke 6:46-49, 1 Cor 3:10-15 |
| `faith-and-works` | James 2:14-26, Eph 2:8-10, Gal 5:6 |
| `grace-not-earned` | Eph 2:8-9, Rom 3:23-24, Titus 3:5 |
| `refuge-in-trouble` | Ps 46:1-3, Ps 91:1-2, Isa 25:4, Ps 121:1-8 |
| `fear-not` | Isa 43:1-3, Josh 1:9, 1 John 4:18 |
| `walking-in-the-light` | 1 John 1:5-7, John 1:4-9, Eph 5:8 |
| `self-deception` | James 1:22-24, Gal 6:3, 1 John 1:8 |

If any anchor is wrong or any weight is off, say so and I will fix it. If the
whole set is fine, say that too — I would rather have your explicit yes on
record than assume silence means approval.

### 1.2 Repository visibility and the engine's name

The repo is private and called `scripture-search-engine`. Two things worth
settling before consumers pin it:

- **Public or private long-term?** Private works fine (consumers authenticate
  to pull releases). Public would let you publish `@lh/scripture-engine` to
  npm without auth, and the corpora are all PD/CC BY so there is no rights
  obstacle. Your call on whether the ontology is something you want visible.
- **Package name.** I used `@lh/scripture-engine`. If you want a different
  npm scope, changing it later means updating three consumers.

### 1.3 When does Maskil adopt this?

Phase 5 is written but not started, per your instruction. Maskil's own July
audit deliberately sequenced the broad research engine *after* the
collaboration pilot. Adopting now would contradict that; adopting later means
Maskil keeps its current exact-phrase-only panel in the meantime.

The engine is ready whenever you are. This is a product-sequencing call.

---

## 2. Things you should know that I could not fix

### 2.1 One author produces authorial idiolect, not theology

Real finding from Phase 3. With 73 expositions from Maclaren alone, the
highest-PMI terms for a passage include `mellow`, `friction`, `troth`,
`polish` — Victorian rhetorical habits, not theological vocabulary.

This is not a bug and not fixable by tuning. It is what PMI *should* do with
a single-author corpus: those words genuinely are distinctive of that
passage's prose *in this corpus*. The fix is more authors per passage, so
shared theological vocabulary rises and per-author quirks fall.

Until then Layer B is weak evidence with a small budget, which is why adding
it moved probe results by only 10%. It is not hurting anything; it is just
not yet paying much.

**What would help:** ingesting 2–4 more PD commentators on the same books
(Spurgeon's *Treasury of David* for Psalms is the obvious next one). The
curation skill handles this, and G9 will tell you when it stops paying.

### 2.2 Some gate thresholds are still guesses

I flagged this before and it is still partly true. `eval/budgets.json` now
has real baselines for churn, latency, and size. But:

- `distinctiveness.minPmi: 2.0` — chosen before data existed. It now rejects
  94.3% of candidate terms, which *feels* right, but nobody has checked
  whether 1.5 or 2.5 gives better results.
- `saturation.minProfileDelta: 0.02` — never yet triggered. The one real
  measurement (0.2769) is an order of magnitude above it, so the threshold is
  untested.

Neither is dangerous — both are floors on weak evidence. But do not treat
them as validated.

### 2.2b The latency gate was flaky and is now deliberately loose

G11 failed on one CI run (55ms vs a 50ms budget) and passed on the next with
identical code. Two real problems, both now fixed:

- It was measuring **cold start** — first-query module init, first database
  page reads, SQLite compiling query plans — not query cost. A warm-up pass
  now runs before timing.
- The 50ms budget was calibrated on a dev machine. Shared CI runners vary by
  several-fold, and **a gate that fails at random teaches people to ignore
  gates**, which is worse than having no gate.

The budget is now 150ms against ~5ms observed. That is loose on purpose: it
catches an algorithmic regression (an accidental full scan, a dropped index),
which shows up as an order of magnitude — not a few milliseconds of runner
noise. Real device latency has to come from a consumer measuring on target
hardware; this repo cannot produce that number honestly.

### 2.3 OpenBible URLs are rolling, with no archive

`https://a.openbible.info/data/*` is overwritten weekly. There is no versioned
or archival URL. The checksums in `pipeline/manifests/openbible-*.json` are
therefore *our* snapshot, and re-downloading later will produce a different
file that must be re-admitted as a change.

This is handled correctly today (the committed subset makes builds hermetic),
but if you ever want to reproduce a build from scratch months from now, you
need the original download — not just the URL. Worth keeping a copy somewhere
durable if that matters to you.

### 2.4 The corpus is a fixture, not the whole Bible

Everything above runs against **828 WEB verses** — the passages the fixtures
and probes need. That is deliberate: CI must be hermetic and fast.

Building the full 31,103-verse artifact (both translations, all concepts, the
full 344k cross-references) is a pipeline run that has not been done yet.
It is not hard, but it has not been proven, and its size is unmeasured against
the 160 MiB budget.

---

## 3. Suggested next moves, in the order I would do them

1. **Review the 8 concepts** (§1.1). Everything else builds on them.
2. **Run the full-corpus build** to get real size and latency numbers, and
   produce the first reviewed release descriptor in `artifacts/`.
3. **Ingest Treasury of David** for Psalms — a second author on the same book
   directly tests the idiolect problem in §2.1, and G9 will quantify it.
4. **Try the curation skill on a real gap** — your Mormon-evangelism example
   is a good first test because it exercises `editorial` provenance on
   genuinely contested ground.
5. **Then** decide Phase 5 sequencing (§1.3).

---

## 4. What I did without asking (flagging for the record)

- Bumped CI actions from `@v4` to `@v5` (Node 20 deprecation warning). I asked
  earlier and got no answer; it is inside this repo and low-risk.
- Chose Node's built-in `node:sqlite` over `better-sqlite3`. Not a preference
  — `better-sqlite3` needs a C++ toolchain this machine does not have, and a
  build that can fail on toolchain availability will eventually block a
  release for a reason unrelated to the data.
- Accepted and re-baselined G8 probe churn twice (Phase 2 concepts, Phase 3
  terms). Both times the churn was confined to the probes the new data was
  written for; broad, phrase and adversarial probes were untouched. Reasoning
  is in the commit messages.
- Moved a research report out of the Maskil repo. A background agent wrote
  `docs/research/2026-07-29-nave-torrey-topical-bible-sources.md` into Maskil
  despite your "don't touch other projects" instruction; I moved it to this
  repo's `docs/research/` and confirmed Maskil's working tree was left exactly
  as found.
