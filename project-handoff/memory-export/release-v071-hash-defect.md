---
name: release-v071-hash-defect
description: Published v0.7.1 content.db does not hash to the committed descriptor; release.yml verification is a vacuous self-comparison
metadata:
  type: project
  modified: 2026-08-06T15:18:22.854Z
---

Found 2026-08-06 by the workbench's fetch-artifact verification. The GitHub Release v0.7.1 `content.db` hashes `b57d36…` but the committed `artifacts/content-artifact.json` says `databaseSha256: 403d0f…`. Cause: `pipeline/src/buildArtifact.ts` writes its descriptor to `artifacts/content-artifact.json`, so `release.yml`'s "verify built artifact matches reviewed descriptor" step compared the CI build against a descriptor the build had just overwritten — it can never fail. CI's Node-24 rebuild did not byte-reproduce the reviewed artifact (SQLite serialization differs across environments) and the mismatched bytes were uploaded. The published DB is logically the reviewed artifact (internal corpus/layer fingerprints, 31,098 verses, tokenizer 1.0.0 all match the descriptor); only the bytes differ. Resolution (2026-08-06): Jesse chose the re-review path — the original 403d0f bytes were not on his machine (`pipeline/output/content.db` absent). The published bytes were independently re-verified (hash, internal fingerprints, 31,098 verses, tokenizer 1.0.0) and the descriptor's `databaseSha256` updated to `b57d36…` in commit bc66dd4 on PR #15, alongside the `release.yml` ordering fix (7d89593). Merging the PR is Jesse's review act; workbench download path confirmed working end-to-end against the published asset. Related: [[workbench-proposal-audit]]
