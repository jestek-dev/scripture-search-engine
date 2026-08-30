---
name: jesse-workbench-ux-feedback
description: Jesse wants plain-language, minimal-friction tooling — no jargon pickers, no forced rote text; v1.1 encoded this
metadata:
  type: feedback
  modified: 2026-08-11T17:20:53.136Z
---

2026-08-06: Jesse (non-engineer worship leader) couldn't use the workbench v1 judgment flow: the wrong-anchor/concept-misfire/lexical-noise picker was unanswerable jargon, and the required "why" produced rote text ("it fits the theme") — friction that captured nothing.

**Why:** the system encodes HIS judgment; any field he can't answer meaningfully generates noise, not review. The tool should answer what it can from its own evidence and ask humans only what only humans know.

**How to apply:** in any Jesse-facing tool, auto-infer classifications from available evidence (v1.1: no concept evidence → lexical-noise, one click), phrase remaining questions as plain yes/no in his vocabulary, auto-fill notes from source text, and require a hand-written sentence ONLY where it's load-bearing (edits to reviewed theology files). Frame demotion honestly: ✗ pins out of top results per-query, never deletes; never add per-result weight knobs (hidden second ranking system, forbidden by covenant). Shipped as workbench v1.1 (PR #16). Related: [[workbench-proposal-audit]]

Also note: his query "Who is like the Lord?" exposed a real coverage pattern — WEB translation says "who is like you / a God like you" (no "lord" token) for Micah 7:18, Ex 15:11, Ps 71:19, so lexical matching can never surface them; the fix is a divine-incomparability concept via the missing-passage flow, not engine changes.

2026-08-11: workbench v2.5 (commit 12a0593) regressed this — the jargon diagnosis picker and hand-typed concept id came back; see [[workbench-v25-audit]].
