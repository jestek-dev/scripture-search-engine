# docs/reviews/sweep — the mega-sweep review home

This directory holds the sweep's *committed* review surfaces (plan Phase 8):

- `digest-<runId>.md` — clustered defect digests (MS-10). Clusters are
  ordered severity-then-size with 3 representatives each and a tally table
  mirroring the battery grade axis (3/2/1/0 + harmful). Crisis-adjacent
  queries appear as **category + id, never verbatim text** (J69 — Jesse can
  tighten or loosen this). The digest generator is
  `sweep/scripts/buildDefects.ts`; per-run `defects.jsonl.gz` files stay
  with the run outputs and carry verbatim text because replay needs it.
- `approvals/` — Jesse approval batches (MS-11), extending the repo's
  NEEDS-JESSE idiom: ≤ half a page per cluster, batches capped at 25,
  severity-first, verdicts recorded inline and dated. Verdicts are never
  rewritten, only superseded.
- `CERTIFICATION-<date>.md` — the phase's exit certification (MS-14;
  **blocked on Jesse** — nothing here until his thresholds are signed and
  the terminus identity exists).

Nothing lands here from automation alone: digests are generated but a human
commits them after review (the first digest is hand-reviewed against a
50-record sample before the format is trusted — MS-10 DoD), and every
approval verdict is Jesse's.
