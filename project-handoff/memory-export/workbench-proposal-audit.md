---
name: workbench-proposal-audit
description: 2026-08-05 audit of Jesse's curation-workbench proposal — verdict solid with amendments; key repo gotchas found
metadata:
  type: project
  modified: 2026-08-05T23:06:02.313Z
---

On 2026-08-05 Jesse's curation-workbench proposal (local dev UI, judgments → JSONL → compiled fixtures/ontology edits) was audited against the repo. Verdict: solid with amendments. Non-obvious facts dug up during the audit, valid at ENGINE_VERSION 0.7.1:

- `capped` is NOT on the public `DiscoveryResult` — it stays on internal `RankedResult` and is dropped in `createEngine.ts`; per-reason `uncappedPoints` (present only when a cap fired) is the public signal.
- G8's baseline is the committed `eval/baselines/probes.json` (probe top-10 IDs vs the fixture DB), refreshed only via `--update-baseline`. There is no previous-artifact result-diff tooling.
- G3 corpus fixtures run in CI against the 1,077-verse fixture DB (`pipeline/fixtures/web-subset.json`), so fixtures born from full-artifact judgments must also add their passages to the fixture selection — which changes the fixture fingerprint and invalidates the G8 baseline.
- README.md is stale in places: says 828-verse fixture (now 1,077) and "15 verses have profiles" (plan says 99.0% Layer B coverage from seven expositors).
- `build:artifact` is workspace-scoped: `npm run build:artifact --workspace pipeline`, needs `fetch:sources` first and an 8 GB node heap; the release workflow attaches `content.db` + descriptor as Release assets.
