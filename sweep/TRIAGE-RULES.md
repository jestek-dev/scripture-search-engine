# TRIAGE-RULES — the confident-fix / needs-Jesse boundary

> **PENDING JESSE'S RATIFICATION (J66).** This document is normative the
> moment he ratifies it and advisory until then. It is written down BEFORE
> triage starts, or 10^3 defects get triaged by mood. The audit's seven
> FLAGs modeled the boundary correctly; this codifies it.

Referenced by the `sweep-defect/v1` schema (`triage.decision`); enforced in
suggestion form by `sweep/src/triage/suggest.ts`, which **suggests and never
finalizes** — a human confirms every record.

## The boundary (verbatim from the ratified plan, P8.11)

**confident-fix (ALL must hold; any doubt ⇒ needs-jesse):** objectively
wrong against a written contract (mis-parse vs the supported-grammar list;
structural zero-results; silent correction; typed-kind violation; chip
misstating evidence; sole-weak junk #1 under an ALREADY-Jesse-approved
rule; duplicate anchor; data typo per the pack's own comment; flat tie
resolved by the approved PMI mechanism) **+** the fix mechanism already
ratified (applies a decision, doesn't make one) **+** no change to which
passage a concept teaches, no sense-read anchor, no weight change beyond
mechanical dedup.

**needs-Jesse (ANY suffices):** which verse best answers a query; pastoral
ordering; anything doctrinal or watchlist-near; ANY new
concept/anchor/weight/lexicon entry; any unapproved engine change;
correctives; mustNotRank/watchlist additions; anything crisisAdjacent; any
doctrine-flagged grading disagreement (never majority-voted).

## How the suggester applies it

The tool classifies on the defect record's own fields
(`suspectedCause`/`defectClass`/`severity`/`crisisAdjacent`), citing the
clause for every suggestion:

| signal | suggestion | clause |
|---|---|---|
| `crisisAdjacent` | needs-jesse | NJ: anything crisisAdjacent |
| severity `theologically-harmful` | needs-jesse | NJ: doctrinal/watchlist-near (harmful is never a confident fix) |
| cause `negative-context-surfacing` | needs-jesse | NJ: watchlist-near |
| cause `coverage-gap` | needs-jesse | NJ: any new concept/anchor/lexicon entry |
| cause `ranking-or-coverage` | needs-jesse | NJ: which verse best answers / pastoral ordering |
| sole-weak #1 (`engine-scoring` + `wrong-verse`) | needs-jesse **unless** the demotion rule is Jesse-approved | CF: sole-weak junk under an ALREADY-approved rule |
| flat tie (`engine-scoring` + `poor-prioritization`) | needs-jesse **unless** the PMI tie-break is Jesse-approved | CF: flat tie via the approved PMI mechanism |
| cause `reference-grammar` | confident-fix | CF: mis-parse / typed-kind violation vs the written contract |
| cause `spelling-correction` | confident-fix | CF: silent correction vs the citation contract |
| cause `display-pipeline` / `stale-label` / `anchor-attribution` | confident-fix | CF: chip misstating evidence |
| cause `duplicate-anchor` | confident-fix | CF: mechanical dedup |
| cause `data-typo` | confident-fix | CF: data typo per the pack's own comment |
| anything else | needs-jesse | any doubt ⇒ needs-jesse |

The two "ALREADY-Jesse-approved rule" rows read their approval state from an
explicit input the caller records from Jesse's standing decisions — the
tooling never flips them itself.

Confident-fix suggestions still require the second and third ALL-clauses at
human confirmation time: the fix mechanism is already ratified, and the fix
changes no concept-teaching, no sense-read anchor, no weights beyond
mechanical dedup. The suggester cannot see the fix, so **the human confirms
those clauses, every time.**

## Approval batches (the Jesse list)

Format, extending the NEEDS-JESSE idiom, at `docs/reviews/sweep/approvals/`:

- ≤ half a page per cluster: query (crisis rows as category + id per J69),
  today's #1 with quoted clause + chips + replay cmd, a one-sentence issue,
  options with a recommendation, implications, and the verdict line
  **APPROVE / AMEND / REJECT / DEFER**;
- batches capped at **25** clusters, severity-first;
- committed markdown; verdicts recorded inline and dated;
- verdicts are never rewritten, only superseded.

The seed batch
(`docs/reviews/sweep/approvals/2026-08-23-batch-000-audit-seed.md`)
pre-loads the audit's seven FLAGs verbatim plus the standing pending
decisions — the sweep must not re-discover what the audit already escalated.

## Discipline check

`checkTriageDiscipline` (CI-grep-style): no defect whose status is
`fix-in-wave`/`fixed`/`verified-fixed` with triage `needs-jesse` may lack a
`batchRef` pointing at a batch verdict; no fixed defect may lack triage at
all. Covenant #6's process armor — the engine never adjudicates, and neither
does the tooling around it.
