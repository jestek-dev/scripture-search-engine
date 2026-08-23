# Conformance kit — prove covenant #2 on the runtime you ship

`(engineVersion, corpusFingerprint, layerFingerprint, query)` must yield
identical ordering on every platform. CI proves that for Node on
ubuntu + windows. The consumer apps (Maskil, LH Worship Setlist, Versed) run
**Hermes/JSC over OP-SQLite** — this kit is how that runtime produces
conformance evidence instead of an assumption (plan P7.5 / CO-8; routed here
by RH's merge rule so it could not drop silently).

## How it works

1. **In this repo**, generate the expected slice for the artifact a release
   ships (identity-matched to what consumers pin):

   ```bash
   npx tsx conformance/scripts/generateExpected.ts \
     --database pipeline/output/content.db \
     --out conformance/expected/<engineVersion>-<layerFingerprint12>.json
   ```

   The slice replays every ACTIVE battery query and pins, per query, the
   canonical serialization of orderings + reasons (verse text excluded — the
   text bytes are attested by `corpusFingerprint`) plus its sha256, sealed
   with a whole-slice integrity hash.

2. **In the consumer app**, run the slice on the real runtime:

   ```ts
   import { runConformance } from '@jestek-dev/scripture-conformance-kit';

   const engine = await createEngine(opSqlitePort); // the app's own port
   const report = await runConformance(engine, expectedSlice, 'hermes/op-sqlite (Maskil iOS)');
   ```

   The runner is portable by construction: zero runtime imports, no
   `node:*`, pure-TS sha256. The `runtime` label is part of the evidence —
   label it honestly.

3. **Read the report** (`ConformanceReport`):
   - `conformant` — every query byte-agrees. Record the report with the
     release checklist.
   - `divergent` — a **release-blocking finding**, not a footnote: the
     report names each diverging query, the observed sha256, and the first
     differing bytes.
   - `not-applicable` + `reason` — the run could not judge conformance
     (identity mismatch, corrupted slice). Per the repo's gate discipline
     this NEVER satisfies a checklist item; fix the reason and re-run.

## Status of the verification legs (honest ledger)

- **Kit exists, alarm-proofed:** `conformance/test/runner.test.ts` replays a
  generated slice green on the fixture bed and proves a SEEDED ordering
  mutation fails with the query named — the alarm demonstrably fires.
- **Real-consumer-runtime green run: BLOCKED.** The plan's leg — "kit run
  green on at least one real consumer runtime (Maskil's) against the
  terminus artifact" — needs (a) the P7.6 terminus artifact, which does not
  exist yet, and (b) a run inside Maskil's Hermes/OP-SQLite build, which
  lives in the consumer repo. Until that run is recorded, this leg is
  **not-applicable: terminus artifact not yet minted; no consumer-runtime
  run recorded** — it is not claimed, and a Node run is never presented as
  it.
- `conformance/expected/` holds identity-named slices; it is empty until
  the first release-time generation for the same reason.

## Release checklist line (consumer-facing releases)

- [ ] expected slice generated for the release artifact and committed under
      `conformance/expected/`
- [ ] conformance report from at least one real consumer runtime recorded,
      status `conformant` (a `not-applicable` report does not satisfy this
      line; a `divergent` report blocks the release)
