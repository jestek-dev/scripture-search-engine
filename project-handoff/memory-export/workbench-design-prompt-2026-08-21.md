---
name: workbench-design-prompt-2026-08-21
description: 2026-08-21 workbench visual-redesign design prompt authored for Jesse — saved at /mnt/project-files/plans/2026-08-21-workbench-design-prompt.md; grounded in Mobbin research + code inventory
metadata:
  type: project
  modified: 2026-08-21T13:47:51.738Z
---

2026-08-21: Jesse asked for deep research + a ready-to-paste Claude design prompt to visually upgrade the curation workbench (top-tier UI/UX, light+dark modes, user-friendly). Delivered in-thread and saved to /mnt/project-files/plans/2026-08-21-workbench-design-prompt.md ("The Study" direction: serif scripture panel as signature element, quiet grayscale chrome, teal accent, J/K keyboard review queue, 11 tabs collapsed to Review/Compare/History/Finish up + Advanced door). Grounded in Mobbin patterns (Reddit mod queue, Superhuman triage, Linear, Vercel theming, Matter/Pocket serif reading) and the impeccable/frontend-design skill guidance. Hard constraints baked in: backend /api/v2 unchanged, no ranking knobs (covenant), append-only judgments (undo = supersede), typed-digest signing kept, local-only self-hosted fonts, plain-language law per [[jesse-workbench-ux-feedback]].

Code facts verified 2026-08-21 (HEAD 9542c83): workbench UI is one vanilla-JS file workbench/static/index.html (~4.5k lines), light-only, 11 tabs (6-7 engineer consoles); the v1.1 "Not relevant" auto-inference flow IS restored (memory's v2.5 regression note outdated on that point); still missing: live verse preview on missing-passage (GET /api/passage unused) and search without creating a case (GET /api/search unused) — the design prompt adopts both existing endpoints. Not yet implemented; if Jesse says go, a thread should run the prompt in a Claude Code session against the repo. Related: [[workbench-v25-audit]]
