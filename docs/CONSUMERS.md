# CONSUMERS — pinning, verifying, and displaying the engine's results

For Maskil, LH Worship Setlist, Versed, and any future consumer of
`@jestek-dev/scripture-engine`. This is the one document a consumer needs to
go from zero to a verified artifact and a first query — and it states the
display obligations that come with the data. The API compatibility matrix is
`docs/COMPATIBILITY.md`; the contract's canonical home is
`docs/implementation-plan.md` §5 (sections below marked *inherited verbatim*
are copies of §5 text — §5 is canonical, edit there and re-copy, never fork).

## Pin discipline

Consumers pin **both** halves of the identity, and upgrade them only
deliberately:

- **The engine semver** (`@jestek-dev/scripture-engine@X.Y.Z`, exact). Any
  ordering-relevant change bumps `ENGINE_VERSION`, so a pinned engine can
  never silently reorder results.
- **The artifact descriptor** (`content-artifact.json`, committed into YOUR
  repo). It names the release tag the bytes live at, the `databaseSha256`
  they must hash to, and the `(engineVersion, corpusFingerprint,
  layerFingerprint)` identity the running engine must report.

Upgrading either half is an explicit re-pin of both: check the matrix in
`docs/COMPATIBILITY.md` (which engine opens which schema), read
`engine/CHANGELOG.md` from your pinned version forward, and re-verify.
Determinism is the product: `(engineVersion, corpusFingerprint,
layerFingerprint, query)` yields identical ordering on every platform, so two
apps pinning the same pair can quote each other's results.

Import only from the package root (`@jestek-dev/scripture-engine`). The
`/internal` entry exists for this repository's own tooling and carries no
stability promise — an app importing it has left the contract.

## Quickstart — zero to verified artifact + first query

1. **Install the pinned pair:**

   ```bash
   npm i @jestek-dev/scripture-engine@0.7.1
   ```

   and commit the `content-artifact.json` from the SAME release into your
   repo. The committed descriptor — reviewed by a human in a PR — is the
   identity everything below verifies against.

2. **Fetch and verify the artifact** with
   `@jestek-dev/scripture-artifact-client` (this repo's `artifact-client/`
   workspace — the same code the repo's own workbench runs).

   **Obtaining it today:** `@jestek-dev/scripture-artifact-client` (and
   `@jestek-dev/scripture-conformance-kit`, used further down) are **not yet
   published to npm** — trusted publishing is configured for the engine
   package only, and publishing the two support packages is a separate
   decision that rides with the terminus release train (P7.6). Until they
   are published, install them from a git checkout of this repository by
   workspace path:

   ```bash
   git clone https://github.com/jestek-dev/scripture-search-engine
   cd scripture-search-engine && npm ci && npm run build:engine
   npm pack --workspace artifact-client   # -> jestek-dev-scripture-artifact-client-<ver>.tgz
   npm pack --workspace conformance      # -> jestek-dev-scripture-conformance-kit-<ver>.tgz
   # then, in your app:
   npm i ../scripture-search-engine/jestek-dev-scripture-artifact-client-<ver>.tgz
   ```

   (`npm pack` runs each workspace's build; vendoring the built workspace
   directory into your repo works too.) Pin the checkout to the release tag
   you are pinning anyway. When the packages reach npm, replace the tarball
   dependency with the registry version — the import sites do not change.

   ```ts
   import { readFile } from 'node:fs/promises';
   import {
     validateArtifactDescriptor,
     downloadArtifact,
   } from '@jestek-dev/scripture-artifact-client';

   const descriptor = validateArtifactDescriptor(
     JSON.parse(await readFile('content-artifact.json', 'utf8')),
   );
   // Resolves the release tag via releaseTagFor (release.tag when present,
   // else v{engineVersion} — the §5 reference implementation), streams the
   // download, verifies sha256 + size, deletes on mismatch.
   await downloadArtifact(descriptor, 'data/content.db');
   ```

   On a platform where Node streams don't exist (React Native), use
   `artifactDownloadUrl(descriptor)` (portable import:
   `@jestek-dev/scripture-artifact-client/descriptor`) with your platform
   downloader, and verify the digest against `descriptor.databaseSha256`
   **before** opening the file. Never open unverified bytes — the engine
   assumes an identity you have confirmed.

3. **Open it and ask:**

   ```ts
   import { createEngine } from '@jestek-dev/scripture-engine';

   // ContentQueryPort is the engine's only I/O seam — supply your SQLite.
   // OP-SQLite on device; node:sqlite in tooling (see eval/src/nodeSqlitePort.ts
   // in this repo for a reference port).
   const engine = await createEngine(port);
   const result = await engine.research('hearing and doing');
   if (result.kind === 'discovery') {
     for (const row of result.results) console.log(row.reference, row.score, row.reasons);
   }
   ```

4. **Assert the identity once at startup:** every result carries
   `engineVersion`, `corpusFingerprint`, `layerFingerprint` — compare them to
   the committed descriptor and refuse to serve on mismatch (the workbench
   and the release smoke test both do exactly this).

## Typed-kind handling

Invalid input is a **typed kind, never an exception** — render it, don't
catch it:

- `research()` / `passage()` / `related()` return typed invalid-reference
  outcomes. Switch on `kind` exhaustively; a new kind in a future version is
  a compile error at your re-pin, which is the point.
- **`suggestion?` rendering** (0.11.0+): an invalid-reference outcome MAY
  carry `suggestion: { book, reference, distance }` — a cited did-you-mean.
  Render it as a QUESTION ("Did you mean Philippians 4:13?"), never
  auto-navigate: the engine deliberately refuses to open a guessed passage,
  and a consumer that auto-resolves re-introduces the guess the engine
  declined to make. Absence needs no handling.
- **`corrections?` rendering** (0.12.0+): a discovery outcome MAY carry
  `corrections: [{ typed, corrected, distance }]` — present iff an
  out-of-vocabulary token was substituted. The chips already cite each
  correction visibly (`hope (corrected from "hopr")`); keep that citation
  visible in your UI, and offer the user a way to search their literal typed
  text instead. `typed` is the surface form the user typed, never a stem.
- **`verses?` / `grouping?`** (0.14.0+): a discovery row MAY be a merged
  passage-level result. `grouping` says WHY the verses travel together
  (curated anchor span, or a derived pericope with its source and boundary
  vote) — display it as provenance, not as score; the merge contributes zero
  points and the row's `reference` spans the hits, never the whole section.
  `verses` carries per-member evidence for drill-down.
- **Explanations are contract.** Every result's `reasons` chips are the
  engine's stated grounds. Render them (or a summary of them); an app that
  hides all reasons turns a citing engine back into an oracle.

## Pastoral-crisis queries — display REQUIREMENTS

*Inherited verbatim from `docs/implementation-plan.md` §5 (canonical there):*

> **Pastoral-crisis queries — a consumer REQUIREMENT, not a suggestion
> (2026-07-31).** The engine's job for crisis searches is done in data: the
> pastoral-care packs return the right passages and the goldens forbid the
> harmful ones. What the engine cannot do is the rest of the pastoral job, and
> serving Psalm 34:18 to "kill myself" with nothing else is an unfinished one.
> Every consumer that exposes search MUST:
>
> 1. **Show a crisis-resource card above results** when the query matches the
>    pastoral-crisis categories — reuse the reviewed matcher data in
>    `pipeline/telemetry/sensitive-categories.json` (same file that gates
>    telemetry; display is its second use). For US users: 988 Suicide & Crisis
>    Lifeline; 1-800-799-SAFE / text START to 88788 (domestic violence);
>    RAINN 800-656-HOPE. Locale-aware where the app knows better, and the
>    domestic-violence surface should honour quick-exit design.
> 2. **Render passage context, not bare verses**, for anchor results — the
>    packs anchor ranges (1 Kings 19:4-7) precisely so "It is enough — take my
>    life" is never displayed without the angel, the food, and the sleep that
>    answer it.
> 3. **Never present healing anchors as a guarantee** — James 5 is an
>    instruction to pray, not a schedule for the cure, and UI copy must not
>    flatten that distinction.
>
> These are display obligations that follow from data this repo ships; an app
> that pins the artifact but skips the card has implemented the ranking and
> skipped the point.

## Attribution passthrough (CC BY)

*Inherited verbatim from `docs/implementation-plan.md` §5 (canonical there);
the PROPOSED marker stands until Jesse ratifies (J49):*

> **PROPOSED fourth commitment — CC BY attribution passthrough (pending Jesse's
> ratification as consumer-contract owner, J49; not yet binding):** Artifacts
> embed OpenBible.info data (CC BY 4.0); every consumer app MUST surface the
> attribution per `docs/ATTRIBUTIONS.md` — the obligation passes through. This
> is an obligation the shipped data already carries: the release notes have
> stated the passthrough since the promote-only release flow landed (see the
> notes text in `.github/workflows/release.yml`, which cross-references this
> section so the two stay in step), but the consumer contract itself has never
> said it, so Maskil, LH Worship Setlist and Versed have had no contractual
> notice. Same MUST framing as the pastoral-crisis requirements below — the §5
> pattern for non-optional consumer obligations. It is additive (a disclosure,
> not an API change): pinned `(engine semver, artifact descriptor)` pairs are
> unaffected until they upgrade. When `CONSUMERS.md` exists (CO-6/P7.3) it
> inherits this text verbatim — never forks it. On Jesse's sign-off, drop the
> PROPOSED marker and this becomes the fourth commitment above.

Practically: ship an attributions/licenses screen reachable from wherever
search results appear, listing the entries in `docs/ATTRIBUTIONS.md` for your
pinned artifact. The obligation travels with the data, not with the engine
version.

## Corrective & prosperity-slogan display (counsel flags)

The engine **never adjudicates theology**. For prosperity-gospel slogans and
similar queries, its whole output is: ranked passages with attributed chips
naming which curated source names which passage. No engine output contains
"this saying is false" copy, and no result carries a theology score.

That leaves one display decision that belongs to consumers, and it is
deliberately **flagged, not decided** here:

| Flag | Question | Status |
|---|---|---|
| `not-a-bible-verse` | When a query verbatim-matches a known non-scriptural slogan (e.g. "God helps those who help themselves") and corrective passages surface, may/should the app show a "this phrase is not in the Bible" notice above results? The engine will not say it — the notice is app copy, on app authority. | **OPEN — routed here by P4.14; §5-owner decision (Jesse). Until decided, apps show results + chips as-is and add no such copy.** |

When a flag is decided, its row records the decision and date, and the §5
contract gains the corresponding text if it binds all consumers.

## Runtime conformance (Hermes/JSC) — prove the pin on YOUR runtime

Determinism is promised on every platform, and your app should not take that
on faith: run the conformance kit (`conformance/` in this repo,
`@jestek-dev/scripture-conformance-kit` — not yet on npm; obtain it from a
git checkout as described in Quickstart step 2) once per re-pin, on the
runtime you actually ship (Hermes/JSC over OP-SQLite):

```ts
import { runConformance } from '@jestek-dev/scripture-conformance-kit';

const report = await runConformance(engine, expectedSlice, 'hermes/op-sqlite (YourApp iOS)');
```

The expected slice for your pinned identity is generated in the engine repo
and committed under `conformance/expected/`. `conformant` = byte-identical
orderings + reasons; `divergent` is a release-blocking finding to report
upstream (the report names the query and the first differing bytes);
`not-applicable` means the run could not judge (wrong identity, corrupted
slice) and never counts as a pass. Label the `runtime` string honestly — it
is the recorded evidence. Full instructions: `conformance/README.md`.

## Diagnostics a consumer may rely on

- `createEngine` throws on an unsupported artifact schema (the message names
  both versions) and on a tokenizer-version mismatch — fail-closed openings,
  see `docs/COMPATIBILITY.md`.
- Verify downloads with the artifact-client; re-verify a cached artifact
  with `sha256OfFile` at startup when cheap enough, or on first run after an
  app update.
