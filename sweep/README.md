# sweep/ — mega-sweep infrastructure (plan Phase 8, MS-1..MS-11)

The execution harness, deterministic query-universe compiler, graders, defect
records, and triage tooling for the mega-sweep. Built in parallel from the
earlier phases and shaken down on interim builds (plan §2.2); **certification
runs (MS-12..MS-14) do not happen from this workspace until the terminus
identity exists and the Phase-8 hard preconditions hold.**

## Hard boundary

Nothing in `sweep/` is importable by `buildArtifact`, `buildConceptLayer`, or
the engine — the same review-enforced boundary `curation/` carries. The sweep
MEASURES the artifact; it can never alter it:

- The engine package does no I/O (covenant #3); the sweep brings its own
  `ContentQueryPort` (`src/port.ts`, opened read-only).
- Sweep-side curated data (`grading/negative-context-watchlist.yaml`, the
  felt-need map, word lists) decides test EXPECTATIONS only. It never ships,
  is never compiled into the artifact, and never scores theology (covenant
  #6): a watchlist row attributes a documented sense-in-context with a
  citation — it does not adjudicate.
- AI is build/test tooling only (covenant #1): offline scripts under
  `scripts/` may WRITE test queries or GRADE snapshots, always into frozen,
  fingerprinted, human-reviewed files; the runtime and the harness path never
  call a model. Nothing AI-generated reaches the artifact.

## Determinism

`(engineVersion, corpusFingerprint, layerFingerprint, query)` yields identical
ordering everywhere (covenant #2). The harness ASSERTS that identity before
the first query and records it in every snapshot line and run manifest.
Snapshots are canonical-key-order JSONL; `elapsedMs` is the single
non-deterministic field and is excluded from every canonical hash and byte
comparison. Sharding is a pure partition by `sha256(queryId) mod N`, so an
8-shard run merges to the same bytes as a 1-shard run.

The universe is compiled — never hand-listed — from committed grammars by a
counter-based PRNG (`splitmix64` over BigInt, no floats, no global RNG state),
seeded per-decision, so any queryId is re-derivable by anyone from the repo
alone and the universe is stable under extension.

## Storage

Run MANIFESTS are committed under `sweep/runs/`. Raw snapshots are CI
artifacts; certified-run snapshots are promoted to `sweep-snapshots-<YYYY-MM>`
release assets — that storage rides Jesse's J68 approval and is not exercised
until certification.

## Numbers

Every threshold and floor the plan routes through J43 (ring floors, grader
trust gate, workload ceiling, promoted-fixture cap, exit numbers) lives in
`config/sweep-budgets.json` as **null until Jesse signs it**. Tools that need
a number report `not-applicable — threshold unset (J43)` while it is null;
they never guess and never pass vacuously.
