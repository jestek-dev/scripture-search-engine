# Approval batch 000 (seed) — 2026-08-23

**Purpose:** the sweep must not re-discover what the audit already
escalated. This seed batch pre-loads the audit's seven FLAG-FOR-JESSE
queries **verbatim** (search-quality-report-2026-08-20; provisional-policy
rulings J1–J7 in `eval/battery/judgments.json`) plus the standing pending
decisions, so every sweep triage that lands on one of these routes to the
EXISTING escalation instead of opening a duplicate.

Verdict lines are APPROVE / AMEND / REJECT / DEFER, recorded inline and
dated. Verdicts are never rewritten, only superseded. Nothing below is
decided here — each item already awaits Jesse under its J-number; this
batch is the sweep-side index of those escalations.

## 1. fn3 — "does God forgive me" (J1)

- Flag basis, verbatim: "J1 plan default applied (assurance leads a
  penitent); provisional pending Jesse's J1 ruling"; "search-quality-report-2026-08-20
  FLAG #1: forgive-others direction - defensible as related, not the
  catered answer"; "FLAG #1: conditional-forgiveness direction - related,
  not the catered answer".
- Issue: pastoral ordering — assurance-first vs conviction/conditional
  directions for a penitent's query.
- Routing: any sweep defect on this query or its paraphrase family →
  **needs-jesse, cite J1** (never a fresh cluster verdict).

**VERDICT:** _pending J1_

## 2. fn14 — "I keep falling into the same sin" (J2)

- Flag basis, verbatim: "J2 plan default applied (restoration-first);
  provisional pending Jesse's J2 ruling"; "FLAG #2: named restoration
  passage; provisional pending J2"; "FLAG #2: named (Rom 7-8); provisional
  pending J2"; "FLAG #2: conviction-first direction some pastors want;
  provisional pending J2".
- Issue: restoration-first vs conviction-first ordering.
- Routing: → **needs-jesse, cite J2**.

**VERDICT:** _pending J2_

## 3. ad8 — "lord's supper" (J3)

- Flag basis, verbatim: "1 Cor 11:20's own grade is reserved to J3 and
  deliberately not seeded" (judgments.json ad8); the watchlist row for
  1 Corinthians 11:20 carries `status: pending-J3` in
  `sweep/grading/negative-context-watchlist.yaml`.
- Issue: whether 1 Corinthians 11:20 (a rebuke context) may surface, and
  where, for communion queries.
- Routing: → **needs-jesse, cite J3** (watchlist-near by construction).

**VERDICT:** _pending J3_

## 4. ph4 — "cast all your anxiety on him" (J4/J8)

- Flag basis, verbatim: "search-quality-report-2026-08-20 FLAG #4: the
  quoted verse; J4 plan default applied (quoted verse leads); provisional
  pending J4/J8".
- Issue: must the quoted verse itself lead a remembered-phrase query.
- Routing: → **needs-jesse, cite J4/J8**.

**VERDICT:** _pending J4/J8_

## 5. ad12 — "favor of God" (J5)

- Flag basis, verbatim: "search-quality-report-2026-08-20 FLAG #5: the
  catered answer; J5 plan default applied (catered answer leads);
  provisional pending J5".
- Issue: catered-answer-leads ordering for a doctrinally loaded phrase.
- Routing: → **needs-jesse, cite J5**.

**VERDICT:** _pending J5_

## 6. fn6 — "my marriage is struggling" (J6)

- Flag basis, verbatim: "crisis-comfort direction; provisional pending
  Jesse's J6 emphasis ruling"; "mutually-addressed love passage;
  provisional pending J6".
- Issue: crisis-comfort vs mutually-addressed-exhortation emphasis.
- Routing: → **needs-jesse, cite J6**.

**VERDICT:** _pending J6_

## 7. fn13 — "caring for a dying parent" (J7)

- Flag basis, verbatim: "search-quality-report-2026-08-20 FLAG #7: named
  for the missing aging/dying-parent concept; provisional pending J7";
  "named; Ps 116:15 gating is Jesse's standing 2026-07-31 decision
  (J7iii)".
- Issue: the aging/dying-parent concept's anchors, and Psalm 116:15's
  sense-in-context gating (his standing decision applies).
- Routing: → **needs-jesse, cite J7 (and J7iii for Ps 116:15)**.

**VERDICT:** _pending J7_

---

## Standing pending decisions the sweep must route to, not reopen

- **J15** — the harmful criterion's ratification (judgments.json
  `harmfulMeaning`).
- **J16** — negative-context watchlist seed rows beyond the six shipped
  (watchlist yaml `seed-pending-J16`).
- **J17** — battery judgment ratification (merge = ratification; the seven
  FLAGs stay provisional until J1–J7 land individually).
- **J66** — ratification of `sweep/TRIAGE-RULES.md` itself.
- **J67** — crisis-tier boundary + grader hours (MS-9).
- **J69** — crisis-row redaction level in committed digests/batches.
