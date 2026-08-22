# curation/ — offline embedding-assisted curation tooling (P4.16 / B4)

A pinned embedding model **proposes** candidate anchors and **flags** sense
inversions; a human approves each with a rationale; the gauntlet verifies;
**only static reviewed anchors ship**. The runtime half is refused
outright: covenant #1 (*no AI at runtime*) is the design law of this
workspace, not a constraint on it.

## What this is, and is not

- It **is** an offline review aid. Both modes write JSON reports for a
  human reviewer. Similarity scores are review aids; they are never
  copied into anchor weights, and no model output reaches the artifact
  without a human writing ordinary reviewed YAML, a golden fixture
  **first**, a gauntlet Admission Report, and a human PR merge.
- It **is not** part of the artifact build graph. `curation/` is not an
  npm workspace of the build root, and no file here may be imported by
  `buildArtifact.ts`, `buildConceptLayer.ts`, or anything under
  `engine/`. That boundary is executable:
  `pipeline/test/curationBoundary.test.ts` parses every source file under
  `engine/` and `pipeline/` (src, test, scripts, loose configs — only
  each package's top-level `dist`/`node_modules` are pruned) with the
  TypeScript compiler's parser. **What the scan proves:** (1) the
  module-import graph over statically resolvable specifiers — static and
  dynamic imports, re-exports, `require`/`require.resolve`,
  `createRequire` — names no curation path, with specifiers checked raw,
  path-normalized, and percent-decoded (`cur%61tion` is Node-resolvable
  and is caught); (2) the static execution vectors beyond the import
  graph: `child_process` calls (binding-tracked through aliases and
  namespaces, whether acquired by static import, `require`, or dynamic
  `import()`; static commands and args
  checked, non-static ones refused unless the command is a reviewed
  non-JS-runner literal like `unzip`), `Worker` construction with a
  static or computed target, `vm` code loaders, every `package.json`
  `scripts` block in the scanned trees (a plain string scan, claimed as
  nothing more), and symlinks (none exist; one into curation would
  fail). Everything non-static in those positions **fails closed** —
  flagged as indeterminate unless a committed allowlist entry names the
  file, the exact call site, and a written reason (one entry today: a
  reviewed `promisify(execFile)` test handle). **What remains out of
  scope:** subprocess invocations composed dynamically beyond the flagged
  forms, code outside the scanned trees (including shell scripts a
  subprocess might run), builds that rewrite their own code, and
  OS-level tricks. No static scan can close those classes — and a Node
  resolve hook would not either, since it governs in-process module
  resolution only and never sees a subprocess or an npm script. They
  remain gated by the covenant's named human safeguards: the gauntlet,
  and human PR review of every diff. The reverse direction is allowed on
  purpose — this tooling imports the pipeline's own ontology compiler
  and the engine's own tokenizer (covenant #4: one tokenizer) so it
  reasons about exactly what ships.

## The model is locked

`model.lock.json` pins **all-MiniLM-L6-v2** (Apache-2.0) — upstream
`sentence-transformers/all-MiniLM-L6-v2` via its ONNX conversion
`Xenova/all-MiniLM-L6-v2` — by repository, git revision, and per-file
sha256. Weights are never committed; `npm run fetch-model` downloads
exactly the pinned revision and verifies every hash, failing closed on
any mismatch. Every entry point re-verifies the local bytes against the
lock before inference (`src/modelLock.ts`); a present-but-mismatched
model is a hard error everywhere.

## Setup

```sh
npm install            # at the repo root (toolchain: tsx, vitest)
cd curation
npm install            # this workspace's own lockfile (@xenova/transformers)
npm run fetch-model    # downloads + verifies the pinned model (~23 MB)
npm test               # acceptance + lock tests
```

Without the fetched model, inference tests **skip with the reason
printed** — they never report pass unrun (gate discipline), and the
lock/boundary tests still run.

## Suggest mode

```sh
npm run suggest -- --concept benediction [--top 25] [--out reports/...]
```

Embeds the concept's register (label + lexicon + anchor texts) and ranks
the committed fixture corpus (`pipeline/fixtures/web-subset.json`) by
cosine similarity. The report lists candidates with an **empty approval
block** per row (`approved: false`, `reviewedBy: null`,
`rationale: null`) and the shipping rule inline. Verse embeddings are
cached under `.cache/`, keyed by model revision + corpus bytes — both
pinned, so the cache cannot go stale silently.

## Inversion-flag mode

```sh
npm run flag-inversions -- --concept caring-for-aging-parents \
  --query "caring for a dying parent" [--pool 60] [--cross-claim-margin 0.1]
```

Scans the query's lexical surface (verses sharing significant tokens
under the engine's own tokenizer — the verses a lexical rung could
actually surface) for **sense inversions**, with two flags matching the
two measured failure taxonomies (mechanism + calibration record in
`src/inversions.ts`):

1. **below-register-floor** — rides the query's tokens but scores below
   every one of the register's own anchor passages (Job 16:2 for
   "comforter"; Ecclesiastes 1:9 for "new beginnings");
2. **cross-concept-claim** — another concept's register claims the
   passage harder than this one, and the flag names it (fn13:
   Colossians 3:20-21 claimed by `parenting` on "caring for a dying
   parent").

A flag is a **prompt to read the passage**, never a verdict. Any
resulting guard or rephrase is fixture-first and gauntlet-verified.

## Acceptance test

`test/inversions.test.ts` requires the tool to rediscover the three
known inversions above (registers pinned as of 2026-08-22 in
`test/fixtures/canonical-inversions.json`). Two REAL negative controls
ride beside them — candidates that share a query token, sit outside the
register's floor texts, and face live competitors, so every flag path
actually runs before they are asserted unflagged: Isaiah 65:17 for "new
beginnings" and 1 Timothy 5:4 for "caring for a dying parent" (both
verified able to fail by gate mutation during development). The
comforter case carries no negative control, honestly: every WEB verse
containing "comforter(s)" is a lament or a taunt (the Paraclete is
"Counselor" in the WEB), so no honest token-sharing neighbour exists for
that register.

## Process line (Q6)

Every PR that lands a pack curated with this tooling MUST carry the
process line the tool prints, e.g.:

```
AI-assisted: suggest-mode report curation/reports/suggest-<concept>-<date>.json
(model per curation/model.lock.json; every shipped anchor human-approved
with rationale; gauntlet-verified)
```

Reports named on a PR should be committed with it (`reports/` is not
gitignored) so the approval record — who approved each anchor, and why —
travels with the pack it admitted.
