# v0.9.0 descriptor PR — template

Template for the RH-1/P2.4 descriptor PR (the PR that replaces
`artifacts/content-artifact.json` verbatim with the minted v0.9.0
descriptor). Copy it into the PR body and answer every line before
requesting merge.

Created by P2.5/RH-8 to carry the J48 counsel gate and its fallback path.
P2.4/RH-1 EXTENDS this template with the reviewer-expectation split
(structurally fixed fields vs identity fields read from the mint run's
fingerprint diff table) and the rest of the release checklist — extend this
file, do not fork it.

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

## 2. Reviewer expectations (P2.4/RH-1 — to be extended)

Placeholder: P2.4 adds here the structurally-fixed-field checklist
(engineVersion 0.9.0 / schemaVersion 6 / release.tag v0.9.0 / no stale block)
and the rule that identity fields are NEVER hardcoded — they are read from the
mint run's fingerprint diff table against the base commit's approval-bound
identity.
