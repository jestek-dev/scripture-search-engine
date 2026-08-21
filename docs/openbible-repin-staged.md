# OpenBible re-pins — staged PR shape (plan P2.2 / RH-4, "PR C")

**Status: PREPARED, NOT APPLIED.** This document stages everything the
OpenBible re-pin PR will change so the re-pin becomes a mechanical act once
its blockers clear: the **J52 snapshot errand**
(`docs/source-snapshots-errand.md` — the archive assets must exist before any
manifest edit), the **J39 independent baseline approvals** (main gauntlet
green with `--require-admit`; the re-pin's regenerated baselines chain off
that approval, and no agent authors approval content), and the **WEB re-pin
PR-α landing first** (`docs/web-repin-staged.md` — `openbible-subset.json` is
cut against WEB-subset verses, so it regenerates after WEB,
`docs/source-repins.md` §4). Nothing below has been applied: the manifests
still pin `2239700d…` / `36d1b198…`, `eval/budgets.json` still names both
sources in `acknowledgedUnarchivedRollingSources`, and the one prohibition
stands: **a checksum is never edited in place** — these values land only via
the reviewed re-pin PR.

Process authority: `docs/source-repins.md` steps 1–8. Sibling for WEB:
`docs/web-repin-staged.md` (whose conventions this document follows).

**Single-PR deviation, recorded here and in the PR body:** source-repins §3
says one reviewed PR per source. Both OpenBible files share one upstream, one
license, one delta method, and one errand asset upload, so PR C carries both
manifests, per the plan's sequencing (P2.2 §3). The deviation is a process
nod folded into J52/A5a — the PR body states it so the reviewer accepts it
knowingly, not by omission.

## 1. Evidence first: the vote-delta measurement

The two delta reports are this PR's "fixture" — attached to the PR **before**
any manifest edit. Tooling: `pipeline/scripts/openbibleDelta.ts` (unit-tested
in `pipeline/test/openbibleDelta.test.ts`; no network, no manifest writes).
Unlike WEB's verse diff, the measurement here is **vote-movement analysis**:
these files carry references and community-vote scores, no verse text.

```sh
# Topics, against the committed subset witness (always possible):
npx tsx scripts/openbibleDelta.ts --kind topics \
  --old fixtures/openbible-subset.json \
  --new /path/to/topic-scores-2026-08.zip \
  --out delta-topics-vs-subset.md --check

# Cross-references, same witness:
npx tsx scripts/openbibleDelta.ts --kind xrefs \
  --old fixtures/openbible-subset.json \
  --new /path/to/cross-references-2026-08.zip \
  --out delta-xrefs-vs-subset.md --check

# Against the old FULL payloads, if any machine still holds
# pipeline/sources/{topic-scores,cross_references}.txt from the 2026-07/08
# pin era (gitignored, so only a surviving working copy can supply them):
npx tsx scripts/openbibleDelta.ts --kind topics \
  --old /path/to/old/topic-scores.txt --new /path/to/topic-scores-2026-08.zip \
  --out delta-topics-full.md --check
npx tsx scripts/openbibleDelta.ts --kind xrefs \
  --old /path/to/old/cross_references.txt --new /path/to/cross-references-2026-08.zip \
  --out delta-xrefs-full.md --check
```

What the report splits on — **consumed scope**, because the engine never
ingests these files wholesale:

- topic rows reach the artifact only through a concept's `openbibleTopics`
  subscription (`buildConceptLayer` joins subscribed topics into anchors with
  weight = `scoreToWeight(score)`); the report itemizes every add / remove /
  score shift on subscribed topics **with both scores and both weights**, and
  names any **dangling subscription** (a subscribed topic missing from the
  candidate — the named concepts would silently lose every OpenBible anchor
  for it);
- xref edges reach the fixture build only through the committed
  `pipeline/fixtures/openbible-subset.json`; the report itemizes every change
  **touching that committed evidence** with both vote counts, and flags vote
  shifts that cross the importer's votes ≥ 1 threshold (`enters-build` /
  `leaves-build`);
- movement outside consumed scope is counted in full and listed capped
  (largest 25 per list, deterministic order) — the full files carry ~71k /
  ~345k rows, and an unreviewable list is not evidence.

Outcome classes, pre-declared: **identical**; **(a) movement outside consumed
scope** → proceed, counts in the PR body; **(b) consumed-scope movement** →
the itemized list goes to Jesse (J52/A5a) before the PR merges, and the
report is handed to the borrowables aspect (**B1**, F23 bucketed vote
weights) as its transform-design baseline; **license STOP** → see below.
`--check` exit codes: 0 identical, 1 class (a)/(b), 2 license STOP.

**License-header check (the rights record).** Both files carry their license
grant in the first line, live-verified 2026-08-21: topics
`# Generated 2026-08-17. CC-BY License: www.openbible.info/topics`; xrefs
`#www.openbible.info CC-BY 2026-08-17`. Both embed a per-release generation
date, so a literal changed-header STOP would fire on every re-pin and become
decoration. The tool therefore strips embedded dates and compares the
remaining header text: the license **grant** changing (or the CC-BY marker
going missing) is the rights STOP (`docs/source-repins.md` §2 — "that is a
rights question, not a re-pin"); the date rolling is release metadata,
printed but never fatal. Any non-date header change stops, column-title churn
included — conservative by design. Against the subset witness (which carries
no header) the check is marker-only and the report says so; the pinned
manifests' `licenseRecord` fields are the old-side witness for the wording.

Witness honesty: the committed subset carries only subscribed-topic rows and
votes ≥ 1 edges, cut to the fixture-corpus verses. Against it, adds are not
measurable, movement in unsubscribed topics / non-fixture verses is
invisible, and downvoted edges are out of sight; only the old full payloads
can widen the comparison. Say which witness a claim rests on.

### Smoke-test evidence (2026-08-21, evidence only — NOT a pin)

One-time live captures on 2026-08-21 ~09:26Z, used to prove the tooling on
real bytes (payloads not committed anywhere):

- `topic-scores.zip`: sha256
  `2647baf756406d454abca850b708d94878c1efe21883089a9cd787ca7dfcee35`,
  418,110 B — matches the errand runbook's "upstream observed 2026-08-21"
  hash `2647baf7…` and audit F33's observed drift target; unpacked
  `topic-scores.txt` sha256 `e0dc0a5a…` (71,257 data rows, generated
  2026-08-17 per its header);
- `cross-references.zip`: sha256
  `22c26dd6e6cb57197cfc302b3a8ba7c1279165e316c93fafb023785c820b394b`,
  1,982,837 B — matches the runbook's observed `22c26dd6…`; unpacked
  `cross_references.txt` sha256 `db0b1d81…` (344,799 data rows, header dated
  2026-08-17);
- **topics delta vs the committed subset witness: IDENTICAL** — all 23
  witnessed subscribed-topic rows carry unchanged scores; license marker
  present; exit 0 under `--check`;
- **xrefs delta vs the committed subset witness: class (b)** — 122 of 1,835
  committed edges shifted votes (all small community-vote movements, e.g.
  Genesis 1:1 → John 1:1-3 `371 -> 377`; no adds/removes/threshold-crossings
  visible to the witness); license marker present; exit 1 under `--check`.

Read carefully: this is exactly the expected shape of an OpenBible re-pin —
weekly community voting moves vote counts on edges we ship, which is why the
delta step exists and why the consumed-scope list goes to Jesse. The errand's
captured bytes get a fresh run of all the commands above; this smoke result
is evidence about the tooling and the 2026-08-21 upstream, not a substitute
for the PR's own delta reports.

### Live license statement (license-check evidence, 2026-08-21)

Fetched 2026-08-21 from the live site, as the current statement of terms:

- `https://www.openbible.info/topics/` — footer states, verbatim: "Unless
  otherwise indicated, all content is licensed under a Creative Commons
  Attribution License." — where "Creative Commons Attribution License" links
  to `http://creativecommons.org/licenses/by/4.0/` (CC BY 4.0).
- `https://www.openbible.info/labs/cross-references/` — identical sentence
  and link.
- Both data-file headers carry the CC-BY grant (quoted above).

This matches both manifests' `rightsClass: cc_by` and their `licenseRecord`
wording: **no license change observed.** This finding is **evidence, not a
decision** — the CC BY attribution-passthrough consumer commitment in
`docs/implementation-plan.md` §5 remains PROPOSED pending **J49**, and
nothing here ratifies it. The same page footer notes the site *displays* ESV
text (Crossway copyright); the downloads embed no verse text of any
translation, which is what makes them usable at all (recorded in both
`attributionNote`s and the importer header).

## 2. Staged manifest templates

Fields marked `«…»` are read from the errand's captured bytes at PR time —
never from this document. Unchanged fields (`id`, `label`, `rightsClass`,
`sourceUrl`, `rollingSourceUrl` (already `true` in both, unlike WEB's),
`maxTier`, `derivedFrom`, `attributionNote`) are omitted here and stay as
they are.

### `pipeline/manifests/openbible-topics.json`

```jsonc
{
  // ...unchanged fields...
  "sha256": "«sha256 of the captured topic-scores-2026-08.zip»",
  "bytes": «byte count of the captured zip»,
  "archiveUrl": "https://github.com/jestek-dev/scripture-search-engine/releases/download/source-snapshots-2026-08/topic-scores-2026-08.zip",
  "provenanceNote": "RE-ADMITTED «date» (re-pin PR C, plan P2.2/RH-4; process docs/source-repins.md). The 2026-08-08 pin (2239700d…, 417,866 B) stopped being served: the upstream URL rolls weekly (audit F33 observed 2647baf7…; live 2026-08-21 capture matched). Vote-movement delta measured with pipeline/scripts/openbibleDelta.ts before this edit: «outcome class + one-line summary; reports attached to the PR». License header re-confirmed: CC-BY marker intact, generation date «date». archiveUrl pins the errand's verified release asset; the acknowledgedUnarchivedRollingSources entry is deleted in this same commit."
}
```

### `pipeline/manifests/openbible-xrefs.json`

```jsonc
{
  // ...unchanged fields...
  "licenseRecord": "Creative Commons Attribution 4.0. The data file's own header states: 'www.openbible.info CC-BY «header date from the captured bytes»'. Attribution required in shipped output.",
  "sha256": "«sha256 of the captured cross-references-2026-08.zip»",
  "bytes": «byte count of the captured zip»,
  "archiveUrl": "https://github.com/jestek-dev/scripture-search-engine/releases/download/source-snapshots-2026-08/cross-references-2026-08.zip",
  "provenanceNote": "RE-ADMITTED «date» (re-pin PR C, plan P2.2/RH-4; process docs/source-repins.md). The 2026-08-08 pin (36d1b198…, 1,981,973 B) stopped being served: the upstream URL rolls weekly (observed 22c26dd6… on 2026-08-21). Vote-movement delta measured with pipeline/scripts/openbibleDelta.ts before this edit: «outcome class + one-line summary; reports attached to the PR». License header re-confirmed: CC-BY marker intact, header date «date» (the licenseRecord quote is updated to match — the grant wording itself is unchanged). archiveUrl pins the errand's verified release asset; the acknowledgedUnarchivedRollingSources entry is deleted in this same commit."
}
```

Template notes:

- `archiveUrl` must be a direct file URL (`manifest.ts` `isFileUrl`); the
  release-asset download URLs above are. `retrievalUrls` then serves
  authoritative-first with archive fallback; once upstream rolls past the new
  pins (within a week, on the observed cadence), `fetch:sources` reporting
  "from archive" lines is the design working, not a bug.
- The xrefs `licenseRecord` quotes a dated header, so the quote is refreshed
  to the captured header verbatim — a **record update, not a rights change**;
  the delta report's license section is the evidence the wording (dates
  aside) is identical. The topics `licenseRecord` quote is undated and stays
  as-is unless the captured header's grant text differs (which would be a
  rights STOP long before this template matters).
- Neither manifest has `contentSha256` today, and this PR deliberately does
  **not** add one: a pure re-pin changes no provenance semantics. (If a
  repack-vs-content distinction is ever wanted for these zips, that is its
  own reviewed question — J53's WEB analogue.)

## 3. Everything else the PR changes (and nothing more)

In order, **all in one commit** (see the atomicity note):

1. `pipeline/manifests/openbible-topics.json` — per §2.
2. `pipeline/manifests/openbible-xrefs.json` — per §2.
3. `eval/budgets.json` — `provenance.acknowledgedUnarchivedRollingSources`
   goes from `["openbible-topics", "openbible-xrefs"]` to:

   ```json
   "acknowledgedUnarchivedRollingSources": []
   ```

   **Same commit as the manifest edits, by design** (`docs/source-repins.md`
   §6): G1 fails on a *stale* acknowledgment — a source with an `archiveUrl`
   still named in the list — so landing the archiveUrls and the list edit
   separately would leave an intermediate commit red in one direction or the
   other. In one commit, rollback is also atomic: reverting the PR restores
   the acknowledgment together with the old pins, and G1 never sees an
   inconsistent state in either direction (plan P2.2 §5). The list's
   `$comment` block (budgets.json lines 11–28) stays: it documents the
   guardrail and now describes an empty list — its stated goal. This edit
   empties the list; it does not delete the key.
4. `pipeline/fixtures/openbible-subset.json` — regenerated from the captured
   bytes (`scripts/generateOpenBibleSubset.ts`), strictly **after** PR-α's
   regenerated `web-subset.json` is on the branch (the subset cuts to
   WEB-subset verses; dependency order per `docs/source-repins.md` §4).
5. `eval/baselines/*` — regenerated **candidates** via `--update-baseline`.
   The chained v2 approval records are authored by the J39-designated
   independent reviewer, never by an agent, and chain `priorProvenance` off
   whichever approval the external thread lands (post-PR-α identity).
6. The PR body: both delta reports, the license-check record (§1), the
   errand's capture record, the single-PR deviation statement (§0), and the
   B1 hand-off pointer.

Explicitly NOT in this PR: any WEB file (PR-α's); any golden-fixture edit;
any concept YAML edit (a dangling subscription found by the delta is a
finding for Jesse, not a quiet unsubscribe); any engine code; any
`ENGINE_VERSION` bump (layer identity moves through `layerFingerprint` —
`docs/source-repins.md` §7); any vote-weighting change (that is B1's
fixture-first work, never smuggled into a re-pin — plan P2.2 §5).

## 4. Verification sequence (prove the alarm both ways)

1. Both delta reports + the license-check record attached **before** the
   manifest edits (§1).
2. `npm run check:drift` red for both OpenBible sources immediately before
   merge — the sentinel working while drift is live (upstream rolls weekly,
   so re-run right before merge; the pinned-vs-captured gap is expected to
   have widened again by then, which changes nothing — the pin is the
   errand's captured bytes, never a fresh download).
3. From a clean `pipeline/sources/`: `npm run fetch:sources --workspace
   pipeline` green (serving from `archiveUrl` once upstream has rolled past
   the pins — the design working).
4. Full gauntlet: **G1 green with the empty acknowledgment list**; **G3
   untouched**; **G8 within thresholds with the chained approval — NO
   MEASURABLE EFFECT is the DESIRED outcome** (a re-pin claims no value;
   covenant exception recorded in source-repins §5). Real vote movement on
   committed edges (see the smoke evidence) may move probe internals — that
   is what the chained approval reviews, with the delta report beside it.
5. After merge: dispatch `sources.yml` — the drift job must go green for
   **all three** sources: the first fully-green drift run in the repo's
   history (plan P2.2 §4).
6. Both archive assets' API digests equal the manifests' `sha256` values
   (reviewer check, one API call per asset —
   `docs/source-snapshots-errand.md` step 3).

## 5. Hand-off to the borrowables aspect (B1)

The vote-delta reports double as B1's (F23, bucketed vote weights)
transform-design baseline: B1's bucketing must be designed against measured,
archived bytes, not against whatever the rolling URL serves the day someone
runs it. When PR C merges, attach both reports (and the captured-payload
hashes) to the B1 work item so its global cut points are computed over the
same snapshot the manifests pin.
