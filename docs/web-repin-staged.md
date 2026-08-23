# WEB re-pin — staged PR shape (plan P2.1 / RH-3, "PR-α")

**Status: PREPARED, NOT APPLIED.** This document stages everything the WEB
re-pin PR will change so the re-pin becomes a mechanical act once its two
blockers clear: the **J52 snapshot errand** (`docs/source-snapshots-errand.md`
— the archive asset must exist before any manifest edit) and the **J39
independent baseline approvals** (main gauntlet green with `--require-admit`;
the re-pin's regenerated baselines chain off that approval, and no agent
authors approval content). Nothing below has been applied to any manifest —
the current `pipeline/manifests/web.json` still pins `3458ca34…`, and the one
prohibition stands: **a checksum is never edited in place**; these values land
only via the reviewed re-pin PR.

Process authority: `docs/source-repins.md` steps 1–8. Companion dependency
record: `docs/corpus-payload-dependency.md`. This document adds the concrete
template and the delta-tooling workflow.

## 1. Evidence first: the delta measurement

The delta report is this PR's "fixture" — attached to the PR **before** the
manifest edit. Tooling: `pipeline/scripts/webDelta.ts` (unit-tested in
`pipeline/test/webDelta.test.ts`; no network, no manifest writes).

```sh
# Against the committed subset witness (always possible):
npx tsx scripts/webDelta.ts \
  --old fixtures/web-subset.json \
  --new /path/to/engwebp_vpl-2026-08.zip \
  --out delta-vs-subset.md --check

# Against the old FULL payload, if the J52 archive search recovers it:
npx tsx scripts/webDelta.ts \
  --old /path/to/engwebp_vpl-2026-07.zip \
  --new /path/to/engwebp_vpl-2026-08.zip \
  --out delta-full.md --check
```

The report classifies every difference with the ONE tokenizer (typography-only
means the token stream — vocabulary and positions — is unchanged, so no
precomputed term profile can move) and assigns the pre-declared outcome class:

- **(a) typography-only** → proceed with the re-pin;
- **(b) genuine revisions in non-fixture verses** → the listed verses go to
  Jesse for review (A5c) before the PR merges;
- **(c) genuine revisions inside fixture-asserted verses** (refs named by
  `eval/golden/`) → **STOP** — a finding for Jesse, never a fixture edit.

`--check` exit codes for CI/scripting: 0 identical, 1 class (a)/(b),
2 class (c). The class outcome and both delta reports go in the PR body
(RH-3 DoD item (f)).

Label caveat: "typography-only" is operationally **token identity** under the
one tokenizer, which is broader than typography — stopword swaps (`he`→`she`)
and inflection folds (`obeys`→`obeyed`) also tokenize identically and land in
class (a). The report prints both halves of every such pair and its class-(a)
outcome line says to skim them; the failure direction is conservative
(anything the tokenizer cannot prove identical is GENUINE, never the
reverse).

Witness honesty: the subset witness covers the 211-chapter fixture corpus
only, so `delta-vs-subset.md` proves or disproves changes **inside the
corpus the gates measure**; verses outside it are out of the witness's sight,
and only the recovered old full payload can widen the comparison. Say which
witness a claim rests on. That blind spot reaches into fixture scope itself:
**20 golden-fixture-asserted verses lie outside the subset witness** (as of
2026-08-21 — among them Job 16:2, Ecclesiastes 1:9, Romans 3:23–24,
1 Corinthians 3:10–15, Psalms 90:17, Matthew 12:31–32, Mark 3:28–29), so an
IDENTICAL/(a)/(b) verdict against the subset is **not** full-fixture-scope
proof. The delta report computes and prints the exact list next to its
verdict ("fixture-scope verses NOT carried by this witness"). Consequence for
A5b: a sign-off taken on the subset witness signs off ONLY the witnessed
scope — the unwitnessed fixture refs are re-verified either by the recovered
old full payload (if the J52 archive search succeeds) or, failing that, only
post-re-pin, by the gauntlet against the re-pinned corpus.

### Smoke-test evidence (2026-08-21, evidence only — NOT a pin)

A one-time live capture on 2026-08-21 ~08:37Z, used to prove the tooling on
real bytes (payload not committed anywhere):

- archive sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`,
  4,281,529 B — the fourth distinct upstream hash observed since 2026-08-14
  (fifth distinct overall, counting the 2026-07-29 pin `3458ca34…`), unchanged
  since the 2026-08-21 intake observation;
- unpacked content fingerprint
  `944e3883ca8120cdd6c62c0524ce45f156c9b48bd19d98bc0b7cce8524cf475b`
  (matches the drift sentinel's observation; ≠ pinned `335445ef…`);
- per-file sha256: `engwebp_vpl.txt` `71ea1ce6…`, `engwebp_vpl.sql`
  `5d2a3aa0…`, `engwebp_vpl.xml` `99fff5a4…`, `engwebp_about.htm`
  `0b95b83e…`, `haiola.css` `41266c34…`;
- **delta vs the committed subset witness: IDENTICAL** — all 5,666 compared
  verses byte-identical (plus the witness's one textless reference, Luke
  17:36, excluded on both sides by the VPL importer's omitted-verse rule);
  0 added, 0 removed, 0 changed.

Read carefully: within everything the fixture corpus witnesses, the 2026-08
drift is **not** verse-text change. Whether verse text moved *outside* the
211 witnessed chapters (including the 20 unwitnessed fixture-scope refs the
witness-honesty paragraph above names), or only the non-verse site files
(`engwebp_about.htm`, `haiola.css`, the `.sql`/`.xml` renderings) moved,
cannot be decided without the old full payload — which is exactly what the
J52 archive search is for, and exactly the sensitivity trade J53 prices.
The errand's captured bytes get a fresh run of both commands above; this
smoke result is evidence about the tooling and the 2026-08-21 upstream, not
a substitute for the PR's own delta reports.

## 2. Staged `pipeline/manifests/web.json` (template)

Fields marked `«…»` are read from the errand's captured bytes at PR time —
never from this document. Unchanged fields (`id`, `label`, `rightsClass`,
`licenseRecord`, `sourceUrl`, `maxTier`, `attributionNote`) are omitted here
and stay as they are.

```jsonc
{
  // ...unchanged fields...
  "sha256": "«sha256 of the captured engwebp_vpl-2026-08.zip»",
  "bytes": «byte count of the captured zip»,
  "retrievedAt": "«capture date, from the errand record»",
  "rollingSourceUrl": true,
  "archiveUrl": "https://github.com/jestek-dev/scripture-search-engine/releases/download/source-snapshots-2026-08/engwebp_vpl-2026-08.zip",
  "contentSha256": "«fingerprintDirectory of the unpacked capture — all five files, per J53's default»",
  "provenanceNote": "RE-ADMITTED «date» (re-pin PR-α, plan P2.1/RH-3; process docs/source-repins.md). The 2026-07-29 pin (3458ca34…, 4,281,524 B, content 335445ef…) stopped being served: the upstream URL rolls near-daily — observed archive hashes 3073fead… (2026-08-14), 8b1f7bf0… (2026-08-20 audit), c860b546… (2026-08-20), b6f55cc7… (2026-08-21) — with the unpacked content fingerprint moving to 944e3883…. Delta measured with pipeline/scripts/webDelta.ts before this edit: «outcome class + one-line summary; reports attached to the PR». Old-bytes archive search outcome: «recovered as engwebp_vpl-2026-07.zip | loss signed off, A5b». rollingSourceUrl added (drift is the demonstration); archiveUrl pins the errand's verified release asset."
}
```

Template notes:

- `archiveUrl` must be a direct file URL (`manifest.ts` `isFileUrl`); the
  release-asset download URL above is one. `retrievalUrls` then serves
  authoritative-first with archive fallback, and once upstream rolls past the
  new pin, `fetch:sources` reporting "from archive" drift lines is the design
  working, not a bug.
- **J53/A6 (contentSha256 coverage)** — default **keep all-files** unless
  Jesse rules otherwise: the directory fingerprint covers all five unpacked
  files, so site-file churn (`engwebp_about.htm`, `haiola.css`) reports as
  content drift even when every verse is identical — more sensitive, never
  less. The costed alternative (fingerprint only `engwebp_vpl.txt`, the file
  the build reads) changes what "the source's content" means and goes to the
  PR reviewer as an explicit question. The smoke-test evidence above is the
  live illustration of the trade: an all-files mismatch that is provably not
  verse-text within the witnessed corpus.

## 3. Everything else the PR changes (and nothing more)

In order:

1. `pipeline/manifests/web.json` — per §2.
2. `pipeline/fixtures/web-subset.json` — regenerated from the captured bytes
   (`scripts/generateFixture.ts`); its `generatedFrom.sourceSha256` moves to
   the new pin. Same 211-chapter selection: **PR-α is a PURE re-pin** — the
   chapter expansion is Phase 4's DG-15/PR-β, composed in the same
   regeneration cycle per `docs/corpus-payload-dependency.md` §3, never
   folded into this diff.
3. Downstream subsets, in dependency order after WEB:
   `pipeline/fixtures/openbible-subset.json` (cut against WEB-subset verses),
   `pipeline/fixtures/passage-terms-subset.json`,
   `pipeline/fixtures/translation-tokens.json`.
4. `eval/baselines/*` — regenerated **candidates** via `--update-baseline`.
   The chained v2 approval records are authored by the J39-designated
   independent reviewer, never by an agent, and chain `priorProvenance` off
   whichever approval the external thread lands.
5. The PR body: both delta reports, the outcome-class record, the errand's
   capture record, and the J53 answer (or the default, stated).

Explicitly NOT in this PR: any `eval/budgets.json` change (WEB gains its
`archiveUrl` in the same PR as the re-pin, so it never enters
`acknowledgedUnarchivedRollingSources` — the list edit is P2.2's, for the
OpenBible sources); any golden-fixture edit (class (c) is a stop, not an
edit); any engine code; any `ENGINE_VERSION` bump (identity moves through
`corpusFingerprint` — `docs/source-repins.md` §7).

## 4. Verification sequence (prove the alarm both ways)

1. Delta reports attached **before** the manifest edit (§1).
2. `npm run check:drift` red for web immediately before merge — the sentinel
   working while drift is live.
3. From a clean `pipeline/sources/`: `npm run fetch:sources --workspace
   pipeline` green.
4. Full gauntlet: **G3 unchanged** (any G3 movement is a class-(c) stop in
   disguise); **G8 within thresholds with the chained approval — NO
   MEASURABLE EFFECT is the DESIRED outcome** (a re-pin claims no value);
   G1 green with no new acknowledgment.
5. After merge: dispatch `sources.yml` — the drift job must go green for web
   (OpenBible stays red until P2.2).
6. The archive asset's API digest equals the manifest `sha256` (reviewer
   check, one API call).
