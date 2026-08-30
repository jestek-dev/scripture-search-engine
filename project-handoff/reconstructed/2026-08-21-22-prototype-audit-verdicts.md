# Prototype audit verdicts — Jesse's workbench mockups v1 and v2 (2026-08-21/22)

> **RECONSTRUCTED from project memory/threads on 2026-08-27, not the original.**
> The audits were delivered in-thread; no standalone report file exists. The
> screenshot evidence survives at
> `project-files/research/2026-08-21-prototype-audit/` and
> `project-files/research/2026-08-22-prototype-v2/` (PNGs intentionally not
> copied into the repo — see INDEX.md). This summary is rebuilt from the
> team-memory records (`memory-export/prototype-audit-2026-08-21.md`,
> `memory-export/prototype-v2-audit-2026-08-22.md`).

## Prototype v1 (2026-08-21, commit 63bfeec)

Jesse pasted the workbench design prompt
(`project-files/plans/2026-08-21-workbench-design-prompt.md`) into a design
session and committed the resulting canvas export onto
`origin/claude/hearth-thread-wrhubh-p3` (another session's branch), under
`workbench/prototype/"Project approval needed/"`.

**Verdict: a static design mockup, not a working app — port, don't ship.**

- All data hardcoded (7 review items, 10 lookup verses, 1 comparison); zero
  API calls; CDN React/Babel + Google Fonts, so it renders blank offline —
  violating the workbench's local-only vanilla-JS constraints.
- Design language faithful to the prompt: 4-tab + Advanced IA, light/dark
  themes, serif verse panel, J/K queue with E/H/X/M verdicts + undo toast,
  plain-language auto-inferred interview (no jargon, no weight knobs), blind
  compare with reveal, humanized history, finish-up signing mock.
- Jesse's core expectation (type → real results → judge each result) was NOT
  built; `GET /api/search` and `/api/passage` unused.
- Hazards for the port: mock undo deletes the judgment client-side (must
  become append-only supersede); one real bug — Escape cannot close the
  "Not relevant" interview and J/K still move selection under it.
- Recommended path (delivered to Jesse): port into
  `workbench/static/index.html` in vanilla JS with self-hosted fonts, wire
  real search, keep undo=supersede.

## Prototype v2 (2026-08-22, commit 5ba1096)

Committed at a new path, `prototype/"Scripture Workbench/"` (the v1 copy
remained in the tree). Only the main HTML changed (878 → 922 lines).

**Verdict: READY AS THE IMPLEMENTATION SPEC — v2 supersedes v1 as the
blueprint — but still not ready as the tool.**

- The review screen pivoted to search-driven: search bar atop the passage
  pane, results rail + waiting queue, J/K + E/H/X/M judging per result,
  per-query all-judged state with "Next search →" chaining, sign-off digest
  spanning all queries. This mocks Jesse's exact expected flow end-to-end.
- Still a mock: exact-string match on 2 hardcoded queries, unknown query →
  a toast that persists nothing, zero API calls; the v1 Escape-trap bug
  unchanged.

## What happened next

Jesse commissioned the implementation plan the same day (2026-08-22 13:06Z),
pre-approving it ("I approve this plan as is, but make the best decisions
upon implementation"). The plan became
`docs/plans/2026-08-22-dashboard-implementation-plan.md` (42 D-items,
5 phases), delivered as "The Study" via PRs #38/#45/#48/#49/#50, completing
2026-08-23 with the Study as the default page at `/` and the old console
byte-identical at `/advanced`.
