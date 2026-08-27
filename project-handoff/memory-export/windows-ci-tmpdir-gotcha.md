---
name: windows-ci-tmpdir-gotcha
description: windows-latest runners expose os.tmpdir() as an 8.3 short name; realpath-identity guards reject raw mkdtemp paths — canonicalize test sandbox roots
metadata:
  type: project
  modified: 2026-08-11T21:01:03.343Z
---

Found 2026-08-11 fixing red main (PRs #18/#19). GitHub windows-latest runners return `os.tmpdir()` as an 8.3 short name (`C:\Users\RUNNER~1\...`). `fs.promises.realpath` / `realpathSync.native` expand short names to long form (plain `realpathSync` does NOT), so any workbench guard that compares `realpath(p)` to a caller-supplied path (publishPreparation `realDirectory`, telemetryAudit, comparisonRunner cache-key child check) fails closed on raw `mkdtemp` paths — 31 Windows-only test failures with `unsafe_path`/`unsafe_selection` codes. Fix: canonicalize test sandbox roots at creation (`await realpath(await mkdtemp(...))`), never weaken the guards. Merged as PR #19 (`83735fc8`).

Also from the same session: PR #18 (`d45180c`) fixed three main-breakers: (1) workbench/legacy/migration-manifest.json lineSha256 values had been authored from CRLF bytes on Windows — sha256(line + '\r') — while the committed blob was always LF; regenerate from committed bytes if it ever recurs. (2) applyJournal lock: a live process couldn't reclaim a lock it abandoned after a junction-replacement abort; fixed with an in-process heldLockOwnerIds registry. (3) `engine/dist` doesn't exist after `npm ci` (only prepack builds it) — root `build:engine` script now runs first in `verify` and in .github/workflows/gauntlet.yml. Note: Jesse merges PRs within ~1-2 minutes of them going up, before CI concludes — get local verify green BEFORE opening the PR. Related: [[workbench-v25-audit]]
