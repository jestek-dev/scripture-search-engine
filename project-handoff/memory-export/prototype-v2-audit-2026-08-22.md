---
name: prototype-v2-audit-2026-08-22
description: 2026-08-22 audit of Jesse's prototype v2 commit 5ba1096 (on wrhubh-p5, path prototype/"Scripture Workbench/") — review screen now search-driven (his expected type→results→judge-each flow, mocked end-to-end); verdict READY AS IMPLEMENTATION SPEC, not as app; awaiting Jesse's go for the real build
metadata:
  type: project
  modified: 2026-08-22T12:56:21.703Z
---

2026-08-22: Jesse committed prototype v2 as 5ba1096 "added prototype" on origin/claude/hearth-thread-wrhubh-p5 (another session's branch again), at NEW path prototype/"Scripture Workbench/" — the v1 copy from [[prototype-audit-2026-08-21]] still sits untouched at workbench/prototype/"Project approval needed/", so the tree carries BOTH copies. Only Curation Workbench.dc.html changed vs v1 (878→922 lines); support.js/DESIGN.md/github.md byte-identical (still CDN React/fonts — blank offline).

Playwright-verified changes (screenshots /mnt/project-files/research/2026-08-22-prototype-v2/, diff+notes were in session scratchpad): review screen pivoted from "This week" grouped queue to SEARCH-DRIVEN — search bar atop passage pane, left rail "Results for '{query}'" + "Waiting in your queue" (click to switch), J/K + E/H/X/M judging per result, per-query all-judged state with "Next search →" chaining, sign-off digest now spans all queries. This mocks Jesse's exact expectation (type → results populate → judge each) end-to-end. Still a mock: exact-string match on 2 hardcoded queries only, unknown query → "started a case" toast that persists nothing, zero API calls (/api/search still unused). v1 Escape-trap bug unchanged (Escape can't close X interview; J/K under open interview silently discards it — true in v1 too).

Verdict delivered to Jesse 2026-08-22 in the prototype-audit thread: READY as the implementation spec (v2 supersedes v1 as the blueprint), NOT ready as the tool. Port hazards unchanged: vanilla-JS/self-hosted-fonts port into workbench/static/index.html, undo must be supersede not delete, wire real GET /api/search + /api/passage, fix Escape trap, real word-level search matching (not whole-string), unknown-query case creation must actually persist. Both prototype copies should move off the wrhubh-p3/p5 implementation branches (coordinate, don't touch unilaterally). Awaiting Jesse's go for the real build. Related: [[workbench-design-prompt-2026-08-21]], [[jesse-workbench-ux-feedback]]
