---
name: prototype-audit-2026-08-21
description: 2026-08-21 audit of Jesse's workbench prototype commit 63bfeec ("added protoype", on origin/claude/hearth-thread-wrhubh-p3, NOT main) — a static Claude Design mockup, not a working app; design language faithful, search flow fake; port-don't-ship verdict
metadata:
  type: project
  modified: 2026-08-21T17:32:23.030Z
---

2026-08-21: Jesse pasted the [[workbench-design-prompt-2026-08-21]] into a Claude session and committed the resulting Claude Design canvas export as commit 63bfeec on top of origin/claude/hearth-thread-wrhubh-p3 (the implementation session's branch — 5 files under workbench/prototype/"Project approval needed/", main file Curation Workbench.dc.html + support.js). Audit findings (static + Playwright-driven, screenshots in /mnt/project-files/research/2026-08-21-prototype-audit/, full notes were in session scratchpad):

- It is a DESIGN MOCKUP, not a working app: all data hardcoded (7 review items, 10 lookup verses, 1 comparison), zero API calls; React/Babel loaded from unpkg CDN + Google Fonts, so it renders BLANK offline/local-only; the workbench server never serves it (old 11-tab static/index.html still live at 127.0.0.1:8787).
- Design language is faithful to the prompt: 4-tab+Advanced IA, light/dark themes, serif verse panel, J/K queue with E/H/X/M verdicts + undo toast, auto-inferred interview (plain language, no jargon, no weight knobs — passes [[jesse-workbench-ux-feedback]]), blind compare with reveal, humanized history, finish-up signing mock.
- Search: the ⌘K lookup demonstrates search-without-a-case but only filters the 10 mock verses ("grace" → 0 results); the only per-result action is a stub "start a review case" toast. Jesse's core expectation (type → real results → judge each result) is NOT built; GET /api/search and /api/passage remain unused.
- Covenant: clean as committed (zero backend/engine changes). Two port hazards: mock undo() deletes the judgment client-side (must become supersede), and CDN deps + React framework violate the workbench's local-only vanilla-JS constraints — the file is a reference spec, never the shipped UI. One real bug: Escape cannot close the X interview (key handler returns early), and J/K still move selection under it.
- Recommended path (delivered to Jesse 2026-08-21, awaiting his go): port the design into workbench/static/index.html in vanilla JS with self-hosted fonts, wire ⌘K to GET /api/search with per-result judging, keep undo=supersede; move prototype files off the wrhubh-p3 branch (that branch belongs to the implementation session — do not touch without coordination). Related: [[workbench-v25-audit]], [[implementation-plan-2026-08-20]]
