# v0.9.0 descriptor PR — template

Template for the RH-1/P2.4 descriptor PR (the PR that replaces
`artifacts/content-artifact.json` verbatim with the minted v0.9.0
descriptor). Copy it into the PR body and answer every line before
requesting merge.

Created by P2.5/RH-8 to carry the J48 counsel gate and its fallback path.
Extended by P2.4/RH-1 (2026-08-21) with the reviewer-expectation split
(§2: structurally fixed fields vs identity fields read from the mint run's
fingerprint diff table) and the release checklist (§3 pre-tag, §4 post-tag).
Companion decision record: `docs/reviews/2026-08-21-ship-forward-v090.md`
(why v0.9.0 ships forward and v0.7.1 is never republished).

---

## 0. Counsel go/no-go — BLOCKING, answer before anything else (J48)

> **This PR must not merge while this line is unanswered. Silence is not a
> go.** Schema 6 ships the ESV/NIV/NLT-derived `verse_translation_tokens`
> table (~14 MB of derived stem index; see the "Cross-translation vocabulary"
> entry in `docs/ATTRIBUTIONS.md` for exactly what is and is not stored)
> publicly for the first time, consumed by commercial apps.

- [ ] **Jesse confirms counsel review — or explicitly accepts risk — for
      shipping the ESV/NIV/NLT-derived `verse_translation_tokens` table
      publicly.**
  - Answer (`GO — counsel reviewed` / `GO — risk explicitly accepted` /
    `NO-GO`): ______
  - Answered by: ______ Date: ______

### If the answer is NO-GO: the fallback path (documented, mechanically viable)

Re-mint with the table **empty**. This is a **pipeline data change**, never an
engine change:

1. The pipeline build excludes the cross-translation input, so
   `verse_translation_tokens` ships with zero rows. **Schema stays 6** — the
   table remains in the schema; only its rows are gone.
2. No engine change is needed: the engine tolerates a schema-6 database with
   the table present but empty — proven by
   `eval/test/empty-translation-tokens.test.ts` (the variant step still runs,
   degrades to zero `translation_variant` reasons, all other intents and
   determinism untouched). If that suite is ever red, the fix routes through
   the engine aspect as its own PR — never smuggled into the re-mint.
3. G10's `verse_translation_tokens` byte budget (`eval/budgets.json`
   `perTableBytes`, currently 25165824) simply reads lower; the change is
   sized in the descriptor diff (databaseBytes, fingerprints).
4. Re-dispatch `mint-artifact.yml` against the table-empty build and restart
   this PR with the new descriptor. No ENGINE_VERSION bump — data changed,
   code did not.

## 1. Attribution agreement check (RH-8)

- [ ] **Release notes and §5 attribution text agree** — the CC BY passthrough
      paragraph in `.github/workflows/release.yml`'s release notes and the
      consumer-contract commitment in `docs/implementation-plan.md` §5 say the
      same thing, and both point at `docs/ATTRIBUTIONS.md`.

## 2. Reviewer expectations (P2.4/RH-1) — two kinds of field, never conflated

The file in this PR's diff must be the mint run's
`content-artifact-descriptor` workflow artifact committed **VERBATIM** —
byte-for-byte, never retyped, never built on a laptop.
`mint-artifact.yml` states the rule ("a descriptor built on a laptop
describes bytes nobody can verify") and `docs/NEEDS-JESSE.md` §1.6e records
why: SQLite byte layout differs across build environments, so only the CI
build produces the sha a release verifies against.

- [ ] **PR body links the mint run URL** and pastes that run's
      **"Fingerprint diff table"** step summary (committed vs minted — the
      table `mint-artifact.yml` emits to `GITHUB_STEP_SUMMARY`).
- [ ] **Byte-identity spot check:** the committed file equals the run's
      downloaded descriptor artifact —
      `diff <downloaded content-artifact.json> artifacts/content-artifact.json`
      is empty.
- [ ] **This PR also annotates `docs/NEEDS-JESSE.md` §1.9 as resolved** —
      the stale-descriptor record this PR cures (RH-1 DoD item (g)).

### 2.1 Structurally fixed fields (hardcodable — check by eye)

These four are knowable in advance; anything else in the descriptor is not.

- [ ] `engineVersion: "0.9.0"` — lockstep with `engine/package.json` and
      `ENGINE_VERSION` (`engine/src/config/engineVersion.ts`), enforced by
      `eval/test/release-contract.test.ts`.
- [ ] `schemaVersion: "6"`.
- [ ] `release: { tag: "v0.9.0" }` — with this present, the workbench's
      `releaseTagFor` fallback (`v<engineVersion>`) stops being exercised;
      `release.yml`'s "Assert the descriptor names this tag" step requires it
      to equal the pushed tag.
- [ ] **No `stale` block.** The current committed descriptor carries
      `stale.blocksRelease: true`; a minted descriptor never has the block,
      and `release.yml`'s first gate ("Refuse to release against a stale
      descriptor") fails any tag while one is present.

### 2.2 Identity fields — NEVER hardcoded

No identity value belongs in this template, in any plan, or in any doc — each
one is read from the mint run and from the base commit's own artifacts at
review time. A number copied out of a document is the trap the prior plan's
"expect 33 concepts" guidance armed when the ontology grew; hardcoding
today's count would re-arm it the day another pack merges before the mint.

| field | where the reviewer reads the expected value |
|---|---|
| `corpusFingerprint`, `layerFingerprint` | the **base commit's approval-bound identity**: `eval/baselines/probes.approval.json` / `ordering.snapshot.approval.json` on the PR's base commit. Because the mint runs strictly after the RH-3/RH-4 re-pins, this is the **post-re-pin identity chained through those PRs' approvals** — not the pre-re-pin identity any earlier document names. The mint diff table's "minted" column must equal it. |
| `manifestFingerprint` | the mint diff table; derived from `pipeline/manifests/*.json` as pinned on the base commit (post-re-pin: archived snapshots with `archiveUrl`). |
| `databaseSha256`, `databaseBytes` | born in the mint run — no prior copy exists anywhere. Cross-check: the draft release asset's API per-asset sha256 `digest` must equal `databaseSha256` (one API call, no download). |
| `builtAt` | fresh at every mint; sanity-check it matches the linked run's date. |
| `counts.concepts` | the concept count the **base commit's gauntlet** reports — e.g. the G4-collision evidence line "N concept(s) are mutually distinct" in the run log / machine report of the base commit's "Admission gauntlet" run. |
| every other `counts.*`, `rowCounts`, `perTableBytes` | the minted descriptor itself, verbatim — reviewed for plausibility against the diff table, never against a number in a doc. |
| `sources[].sha256`, `translations[].sourceSha256` | must equal the manifest pins on the base commit (`pipeline/manifests/*.json`). |

**Mechanical acceptance rule (both halves read from artifacts of the actual
tree, neither from a document):**

- [ ] The diff table's minted `corpusFingerprint`/`layerFingerprint` equal
      the base commit's approval-bound identity.
- [ ] `counts.concepts` equals the gauntlet-reported concept count on that
      same commit.

## 3. Pre-tag release checklist (J47 — the tag push IS the release decision)

Everything here happens after this PR merges and **before** Jesse pushes the
tag. Record the merge commit SHA — it is the commit being tagged.

- [ ] §0 answered `GO` (J48) and §1/§2 checked off above.
- [ ] **Two-OS gauntlet lookup on the exact merge commit.** `gauntlet.yml`
      triggers on main pushes and PRs, **not tags**, and `release.yml`'s own
      tag-time gauntlet runs on ubuntu only — so cross-OS ordering (gate G2)
      is proven for the tagged commit by *looking up an existing run, not by
      new CI* (the merge commit is a main commit, so the run exists).
      Confirm the "Admission gauntlet" run **on the merge commit SHA** is
      green in all three jobs: `verify (ubuntu-latest)`,
      `verify (windows-latest)`, and `cross-platform ordering (G2)`.
      Lookup: Actions tab filtered by commit, or
      `gh run list --workflow gauntlet.yml --commit <merge SHA>`.
      If a rapid follow-up push to main cancelled that run (`gauntlet.yml`
      sets `cancel-in-progress` per ref), re-run the cancelled run from the
      Actions tab — or dispatch `gauntlet.yml` (`workflow_dispatch`) while
      main is at the merge commit — and use that green run instead.
- [ ] **Local smoke dry-run against the real bytes, before any tag exists:**
      run `.github/scripts/release-smoke.mjs` with `SMOKE_DB_PATH` (the draft
      asset, downloaded with a token), `SMOKE_DESCRIPTOR_PATH` (the minted
      descriptor), `SMOKE_ENGINE_SPEC` (an `npm pack` tarball of the merge
      commit), and `SMOKE_COMMITTED_DESCRIPTOR_PATH`
      (`artifacts/content-artifact.json` from the merged checkout). It must
      print `SMOKE PASS` including the committed-descriptor cross-check line.
- [ ] Contract tests green on the merge commit:
      `eval/test/release-contract.test.ts`, `eval/test/consumer-api.test.ts`,
      `workbench/test/descriptor.test.ts`.
- [ ] **Jesse pushes tag `v0.9.0` on the merge commit.** Nothing before this
      line publishes anything; after it, npm publish is effectively
      irreversible — roll forward only (v0.9.1), never mutate
      (`docs/reviews/2026-08-21-ship-forward-v090.md`).

## 4. Post-tag verification (RH-1 definition of done)

- [ ] The `release.yml` run for the tag is green end-to-end, **including the
      smoke job** — whose committed-descriptor cross-check
      (`SMOKE_COMMITTED_DESCRIPTOR_PATH`) makes it non-self-referential.
- [ ] The published release's `content.db` API per-asset sha256 `digest`
      equals the committed descriptor's `databaseSha256`.
- [ ] npm `dist-tags.latest` is `0.9.0`.
- [ ] On a **clean checkout of the merge commit**:
      `npm run fetch-artifact --workspace workbench` prints
      `sha256 verified` — the exact command the audit found broken (F31).
- [ ] **Negative check:** `@jestek-dev/scripture-engine@0.7.1` against the
      v0.9.0 `content.db` still refuses with the schema-version message
      (the v0.7.1 tag's `createEngine.ts` supports schemas 1–5 only) —
      proving the pinned-0.7.1 consumer story is "keep your pinned pair",
      never "silently absorb new bytes".
- [ ] v0.7.0/v0.7.1 assets byte-for-byte untouched. Optional (J50, Jesse's
      call): append the notes-only annotation drafted in
      `docs/reviews/2026-08-21-ship-forward-v090.md` §4 to the v0.7.1
      release notes — assets unchanged.
