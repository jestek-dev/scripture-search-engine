# sweep/runs/ — committed run manifests

Run MANIFESTS live here, committed: identity triple, universe fingerprint,
shard layout, line counts, and canonical snapshot hashes — everything needed
to verify a replay, and nothing bulky.

Raw snapshots are NOT committed (400–600 MB per full run): they ride CI as
workflow artifacts, and certified-run snapshots are promoted to
`sweep-snapshots-<YYYY-MM>` release assets so every certified claim stays
replayable forever. That storage is Jesse's J68 decision and is not exercised
until certification (MS-12..MS-14, blocked on the Phase-8 preconditions).

No manifest is committed here until the first real run against a minted
identity; this file marks the layout so the harness has a home from day one.
