# Workbench v1 — implementation plan

**Date:** 2026-08-06
**Status:** Approved plan; supersedes the workbench proposal's open questions.
**Scope (the five locked decisions):**
1. The full artifact is **downloaded** from the GitHub Release asset and
   verified against the committed descriptor `artifacts/content-artifact.json`
   — never built locally as a prerequisite.
2. v1 is **stages 1–3 only**: read-only viewer, judgment log, fixture
   compiler; there is no ontology-edit compiler — the compile step prints a
   manual-edit checklist for anchor/lexicon work instead.
3. When a judged passage is not in the 1,077-verse CI fixture corpus, the
   compile step also proposes the addition to
   `pipeline/fixtures/web-subset.json` and warns that a G8
   `npm run gauntlet -- --update-baseline` refresh will be needed after
   review.
4. There is **no baseline-comparison toggle** in v1.
5. The stack is **zero-dependency**: Node's built-in `http` server plus one
   static HTML page with vanilla JS, run via tsx like the other workspaces;
   every judgment line carries a static `reviewer` field, and the server
   prints the three identities at startup and refuses to serve anything but
   the verified full artifact.

---

## 0. Ground rules (inherited, restated)

- **Judgments compile to reviewed data; nothing touches runtime.** The
  workbench's entire output is text a human reviews and commits: fixture
  files, proposed selection entries, a printed checklist. No engine code, no
  weights, no artifact contents change because of a judging session.
- **Never writes `eval/budgets.json`.** Thresholds are reviewed data with
  their own discipline (CLAUDE.md, "Gate discipline"); the workbench has no
  business near them.
- **Never commits.** The compiler writes files into the working tree and
  stops. `git diff`, `npm run verify`, commit, PR — all human acts.
- **Fixture-first, pending-first.** Every compiled fixture starts
  `"status": "pending"`. The gauntlet runs pending corpus fixtures without
  failing the build and reports when one starts passing
  (`eval/src/gates/corpusGolden.ts:124-134`); promotion to `active` is the
  human's explicit act after the Admission Report says it passes.
- **Dev-only workspace, never published.** `docs/implementation-plan.md:18`
  states "No server component exists" — that is a *distribution* property of
  the engine and its consumers. The workbench is exempt because it never
  ships: it is a `private: true` workspace that binds to localhost on a
  developer's machine, in the same category as the pipeline ("build-time
  only; never shipped to a consumer").
- **No `engine/` changes anywhere in v1**, therefore no `ENGINE_VERSION`
  bump. If a workbench need seems to require an engine change, that is a
  separate proposal, not a workbench task.

## 1. Workspace scaffold

Add `"workbench"` to the `workspaces` array in the root `package.json`
(currently `engine`, `pipeline`, `eval`).

`workbench/package.json`:

- `private: true`, `type: "module"`, description marking it dev-only.
- Scripts, in the repo's tsx style (`tsx src/<entry>.ts`, as in pipeline and
  eval):
  - `fetch-artifact` → `tsx src/fetchArtifact.ts`
  - `serve` → `tsx src/server.ts`
  - `compile-judgments` → `tsx src/compileJudgments.ts`
- Dependencies: `"@jestek-dev/scripture-engine": "*"` only, plus the usual
  devDependencies (`@types/node`, `tsx`, `typescript`, `vitest`). Nothing
  from npm beyond what the repo already carries.

**The SQLite port is copied, not imported.** The eval workspace
(`@jestek-dev/scripture-eval`) is private and declares no `main` or
`exports` (`eval/package.json`), so `openCorpus` from
`eval/src/nodeSqlitePort.ts` is not importable by package specifier, and the
repo's one existing cross-workspace reach is a relative path import
(`eval/src/gates/corpusGolden.ts:15` reaches into
`pipeline/src/importers/ontologyImporter.js`), which would couple the
workbench to eval's internal layout. Instead, copy the ~30-line
`eval/src/nodeSqlitePort.ts` into `workbench/src/nodeSqlitePort.ts` with a
header comment naming the original and the reason ("copied from
eval/src/nodeSqlitePort.ts; eval exports nothing by design — keep in sync by
hand, it is 30 lines"). Like the original, it opens the database
**read-only** via `node:sqlite`'s `DatabaseSync` — the workbench must never
be able to mutate the artifact it is judging.

`workbench/tsconfig.json` extends the root `tsconfig.base.json`, same as the
other workspaces. Add `workbench/.artifact/` to the root `.gitignore` (the
existing `*.db` rule already catches the database file itself; the directory
entry keeps partial downloads and any metadata out too).

## 2. Artifact acquisition (`npm run fetch-artifact --workspace workbench`)

A release with the needed assets exists: **v0.7.1** (published 2026-07-31)
carries `content.db` and `content-artifact.json`, produced by
`.github/workflows/release.yml`, and the committed descriptor's
`engineVersion` is `0.7.1` — descriptor and release describe the same
artifact.

The fetch script:

1. Reads `artifacts/content-artifact.json` (the committed, reviewed
   descriptor). It supplies `engineVersion`, `databaseSha256`, and
   `databaseBytes`.
2. Downloads
   `https://github.com/jestek-dev/scripture-search-engine/releases/download/v<engineVersion>/content.db`
   (for the current descriptor: tag `v0.7.1`), streaming to
   `workbench/.artifact/content.db.partial` — ~123 MB
   (`databaseBytes: 123310080`), so stream, never buffer.
3. Computes sha256 while streaming; on completion compares against
   `databaseSha256`. On match, renames to `workbench/.artifact/content.db`.
   On mismatch, deletes the download and fails loudly — a wrong artifact is
   worse than no artifact.
4. If the download 404s (a future descriptor whose release is not yet
   published), fail with a message naming the fallback: build locally with
   `npm run fetch:sources --workspace pipeline && npm run build:artifact
   --workspace pipeline` (the build runs under an 8 GB heap —
   `node --max-old-space-size=8192`, see `pipeline/package.json`), then copy
   `pipeline/output/content.db` into `workbench/.artifact/`. The server's
   startup hash check below still applies to a locally built database.

Server startup (`serve`):

1. If `workbench/.artifact/content.db` is absent, exit with: "No artifact.
   Run `npm run fetch-artifact --workspace workbench` first."
2. **Re-verify the sha256 against the descriptor on every startup.** This is
   the whole admission check: it guarantees the full reviewed artifact (all
   31,098 verses), replaces any verse-count heuristic, and catches a stale
   `.artifact/` left over from a previous descriptor. Refuse to serve on
   mismatch — the workbench judges the reviewed artifact or nothing.
3. Open the database read-only via the copied port, then
   `const engine = await createEngine(port)` (`createEngine` is async;
   `engine/src/createEngine.ts:106`).
4. Print the three identities from the engine's readonly properties —
   `engineVersion`, `corpusFingerprint`, `layerFingerprint`
   (`engine/src/createEngine.ts:92-94`) — before printing the listen
   address. Every judging session starts by seeing exactly what it is
   judging.

## 3. Stage 1 — read-only viewer

Server routes (Node built-in `http`, bound to `127.0.0.1`):

- `GET /` — serves the single static HTML page from `workbench/static/`,
  snapshotted at startup so the page and the judgment validator always come
  from the same checkout. (Before the snapshot, a `git pull` under a running
  server served the new page against the old in-memory validator; v1.1's
  `causeInferred` was rejected as `Unknown field` that way until the process
  restarted. Restart the server after pulling to pick up changes.)
- `GET /api/search?q=` — returns the awaited `engine.research(q)` result,
  JSON-serialized **verbatim**. `ResearchResult` is
  `ResearchOutcome & ResultIdentity` (`engine/src/types.ts:84`), so the
  three identities are already on every response; no reshaping, no
  augmentation. What the API returns is byte-for-byte what any consumer
  would compute.
- `GET /api/concepts` — SQL over the artifact via the port; no YAML parsing,
  the compiled tables are the truth the engine actually consults
  (`pipeline/src/schema.ts:136-178`):
  `SELECT id, label FROM concepts ORDER BY id`.
- `GET /api/concepts/:id` — the concept's full compiled shape:
  - `SELECT phrase, normalized, token_count FROM concept_lexicon WHERE concept_id = ?`
  - `SELECT start_verse_id, end_verse_id, source_id, weight, locator FROM concept_anchors WHERE concept_id = ?`
  - `SELECT related_id FROM concept_related WHERE concept_id = ?`
- `GET /api/meta` — the three identities plus descriptor facts (schema
  version, translation, verse count), for the page header.

UI (one page, vanilla JS): a search box and a result list. Per result:

- reference, excerpt, score;
- one chip per reason: `family`, `points`, the provenance label when present
  (`reason.provenance.label`, e.g. "OpenBible topic votes"), and —
  struck through — `uncappedPoints` when present;
- a **cap badge** on the result, derived from *any* reason carrying
  `uncappedPoints`. Per the contract, `uncappedPoints` is "present only when
  a cap reduced the contribution" (`engine/src/reasons/types.ts:66-67`).
  State this plainly: there is **no `capped` field on the public result
  type, and one must not be added** — `DiscoveryResult` is part of the
  consumer contract pinned by Maskil, LH Worship Setlist, and Versed
  (`docs/implementation-plan.md` §5), and the badge is derivable client-side
  from data already present.

Acceptance: a query through `/api/search` returns JSON identical to a direct
`createEngine(...).research(...)` call against the same artifact; reasons,
provenance, caps, and the three identities are all visible in the UI.

## 4. Stage 2 — judgment log

`POST /api/judgment` appends exactly one line to `workbench/judgments.jsonl`
— an append-only JSONL file **committed to git**, so the judgment history is
reviewable data with the same lineage discipline as everything else.

Record schema, field by field:

| Field | Required | Content |
|---|---|---|
| `at` | always | ISO 8601 timestamp of the judgment. |
| `reviewer` | always | Static string from `WORKBENCH_REVIEWER` env var, default `"jesse"`. Future-proofs the log for multiple reviewers without building auth now. |
| `query` | always | The query as typed. |
| `verdict` | always | `fits` \| `doesnt-fit` \| `missing`. |
| `targetId` | `fits`, `doesnt-fit` | The result's `targetId` (e.g. `WEB:59001022`), copied from the result being judged. |
| `reference` | `missing` | Human-typed reference for the passage that should have surfaced. Validated server-side via `engine.passage(reference)`, which types invalid references rather than throwing (`PassageResult`, `engine/src/types.ts:96-98`); a `kind: 'invalid-reference'` result rejects the judgment. |
| `pin` | optional, `fits` only | `true` marks this ✓ for compilation into `expectedTop` (see §5). Plain ✓ without `pin` stays log-only. |
| `reasonFamily` | optional, with `pin` | The reason family the reviewer verified (e.g. `concept_anchor`); compiled into `requiredReasonFamily` so the fixture asserts the *evidence*, not just the position. |
| `cause` | `doesnt-fit` | `wrong-anchor` \| `concept-misfire` \| `lexical-noise`. Since v1.1 these terms never appear in the UI (see §4.1); the value is still always one of the three. |
| `causeInferred` | optional, `doesnt-fit` only | `true` when the workbench classified the cause instead of the reviewer (v1.1). Transparency only — the compiler routes inferred and hand-judged causes identically. |
| `conceptId` | `cause` is `wrong-anchor` or `concept-misfire` | Which concept produced the bad evidence. Since v1.1 the UI wires this from the result's own concept evidence rather than asking the reviewer for an id. |
| `note` | every anchor-affecting ✗ (`wrong-anchor`, `concept-misfire`); `missing` only when no excerpt can attach | The defend-it-from-the-text rule: a judgment that changes reviewed theology files must say *why* from the text itself — six months later "why did we remove that anchor" must have an answer. For `missing`, the passage's own text satisfies the rule (see `excerpt`), so a hand-written note is optional. |
| `excerpt` | server-attached, `missing` without `note` | The passage text, fetched by the server while validating the reference (v1.1). This is the defense when no note was written; the compiler's checklist falls back to it. |
| `engineVersion`, `corpusFingerprint`, `layerFingerprint` | always | Stamped by the **server** from the running engine, never from the client. A judgment is only meaningful against the identities it was made under. |

The server rejects malformed records with 400 and an explanation; the UI
enforces the same rules before posting (required notes, cause pickers,
reference validation feedback) so the 400 path is a backstop, not the
experience.

The log is append-only. Corrections are new lines (a later judgment on the
same `query` + target supersedes an earlier one at compile time, by `at`
order); editing or deleting lines is off-limits — history is part of the
record.

### 4.1 v1.1 — plain-language judgments (2026-08-06)

The first real judging session showed two things: the required "why" on
`missing` entries was capturing nothing ("it fits the theme", typed over and
over), and the three cause terms are engine vocabulary a reviewer cannot be
asked to choose between. v1.1 changes the *interview*, not the schema — the
same three causes land in the log, and the compiler's routing is unchanged.

- **✗ is worded as what it does.** The button reads "✗ shouldn't be up
  here", because that is exactly what it compiles to: a `mustNotRank` entry —
  demoted out of the top results *for this query*. The verse stays in the
  corpus and every other search. There is deliberately **no** per-result
  downweight or "weak link" knob: that would be a second, hidden ranking
  system outside the fingerprinted layers (§0; CLAUDE.md non-negotiables 2
  and 6).
- **The cause is detected, not picked.** A result with no concept evidence
  (no `concept_anchor` / `concept_lexicon` reason) can only be word-match
  noise, so one click records `lexical-noise` with `causeInferred: true` and
  no questions. When concept evidence exists, the UI asks plain yes/no
  questions built from the result's own evidence — "Does '[concept]' fit
  this verse?" (No → `wrong-anchor`), then "Should '[query]' have brought up
  '[concept]' at all?" (No → `concept-misfire`) — and wires the `conceptId`
  from the evidence. Both anchor-affecting causes still require the note:
  those judgments change reviewed theology files.
- **The missing "why" pre-fills from the verse itself.** The server resolves
  the reference through `engine.passage()` anyway; now it returns the text
  (`GET /api/passage?ref=`), the UI pre-fills the note with it, and if the
  note is left empty the server stores the passage `excerpt` on the record.
  The defend-it-from-the-text rule is satisfied by the text.

## 5. Stage 3 — fixture compiler (`npm run compile-judgments --workspace workbench`)

A pure function of the entire log. It reads `workbench/judgments.jsonl`,
groups judgments by query, and emits one fixture file per query at
`eval/golden/<slug>.json` in the exact shape G3 consumes
(`CorpusFixture`, `eval/src/gates/corpusGolden.ts:18-25`): `id`, `status`,
`query`, `expectedTop` (`{ reference, requiredReasonFamily? }` entries),
`expectedWithinTop`, `mustNotRank` (`{ reference, why? }` entries). Output
is deterministic — same log in, byte-identical files out. Idempotency is by
construction: there is no applied-state tracking, no marker of "already
compiled"; re-running is always safe.

**Ownership rule.** Every compiled fixture carries a top-level
`"generatedBy": "workbench"` field. This is safe: the gauntlet loads each
`eval/golden/*.json` with a structural cast (`eval/src/gauntlet.ts:96`) and
the gates read only their declared fields — existing fixtures already carry
extra fields (`note`, `alsoAcceptable` in `eval/golden/hearing-and-doing.json`)
that the parser ignores. If the target slug already exists **without** the
marker, it is a hand-written fixture: the compiler stops with an error
naming the file instead of overwriting. Hand-written fixtures are never
workbench property.

**Routing table** (latest judgment per query+target wins):

| Judgment | Compiles to |
|---|---|
| ✗ (any cause) | `mustNotRank` entry; `why` = the judgment's note (or the cause, for `lexical-noise` with no note). |
| ✓ without `pin` | Nothing. Log-only — agreement that a result fits is evidence for the human, not automatically a regression pin. |
| ✓ with `pin` | `expectedTop` entry; `requiredReasonFamily` from `reasonFamily` when recorded. |
| missing | `expectedTop` entry with the validated reference, in a fixture that starts (and stays) `pending` until the passage actually surfaces. |

Every **new** fixture file starts `"status": "pending"`. The gauntlet runs
pending fixtures without failing the build and announces when one starts
passing (`corpusGolden.ts:124-134`); flipping to `active` is a human edit in
the PR that makes it pass.

**The manual-edit checklist.** v1 writes no YAML. For every `missing`,
`wrong-anchor`, and `concept-misfire` judgment, the compiler prints the
implied ontology work — concept id, reference, and the note — as a
checklist for the human to carry out by hand with the concept-curation
skill (`.claude/skills/concept-curation/`). The workbench identifies the
gap; the ontology change goes through the same authored-YAML, gauntlet-gated
PR path as always.

**Fixture-corpus membership check.** G3 corpus fixtures run against a
fixture database freshly built from `pipeline/fixtures/web-subset.json`
(`eval/src/gauntlet.ts:426-431`), not the full artifact — a fixture naming a
passage that subset never sampled is vacuous: it can neither pass nor fail
meaningfully in CI. So for every passage a compiled fixture references, the
compiler checks membership in `web-subset.json`; when absent, it appends a
proposed selection entry in the file's real, chapter-granular format —

```json
{ "book": "James", "chapters": [1], "why": "workbench judgment: <query> (<date>)" }
```

— and prints the decision-3 warning: the fixture database will change, so a
G8 `npm run gauntlet -- --update-baseline` refresh will be needed after the
addition is reviewed (the baseline is deliberately opt-in to update,
`eval/src/gauntlet.ts:445-448`).

**Fingerprint check.** Each judgment carries the `layerFingerprint` it was
made under. The compiler warns, per judgment, when that fingerprint differs
from the current descriptor's — the layers have changed since the judgment,
and the human should re-confirm rather than trust a verdict about evidence
that may no longer exist.

**Exit report.** Fixture files written, selection entries proposed, the
manual checklist, then the standing closer: review with `git diff`, run
`npm run verify`, and commit/PR by hand. The compiler's job ends at the
working tree.

## 6. Explicitly out of v1

- Ontology-edit compiler (checklist only; see decision 2).
- Baseline-comparison toggle (decision 4).
- Bulk-review mode.
- Multi-reviewer auth — the `reviewer` field future-proofs the log without
  building identity now.
- Any write to `eval/budgets.json`.
- Any "preview my edit" runtime mutation — the workbench serves the
  reviewed artifact or nothing.

## 7. Milestones and acceptance

**M1 — viewer.** Search "walking in the light" against the full artifact;
see per-reason families, points, provenance labels, and cap badges;
`/api/search` output byte-equals a direct engine call's serialized result.

**M2 — log.** Valid judgments append to `workbench/judgments.jsonl` with all
required fields and server-stamped identities; malformed records (missing
cause, missing note on an anchor-affecting ✗, unparseable `missing`
reference) are rejected with 400.

**M3 — compiler.** A synthetic log compiles to fixtures the gauntlet parses
and reports as pending (non-blocking); re-running the compiler on the same
log is byte-identical; `npm run verify` stays green with the compiled
fixtures in place.

**Definition of done:** one real judging session ends in a human commit that
the gauntlet ADMITs, containing at least one fixture born from a judgment.
