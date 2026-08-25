# source-snapshots-2026-08 — staging branch (temporary)

These are the EXACT bytes captured 2026-08-25 ~18:19 UTC for the J52
re-pin (docs/source-snapshots-errand.md). The re-pin PR's manifests pin
these hashes. This branch exists only because the preparing environment
could not create the GitHub Release itself; it preserves capture-once
until the release assets exist (never re-download — upstream rolls).

Verify, then upload to the release, from a checkout of this branch:

```sh
sha256sum *.zip          # must match CHECKSUMS.txt exactly
gh release create source-snapshots-2026-08 \
  --repo jestek-dev/scripture-search-engine \
  --title "Source snapshots 2026-08" \
  --notes "Durable archive of upstream source snapshots captured for the 2026-08 re-pins (docs/source-repins.md step 1; errand J52/A5a). Checksums are the capture-time sha256 of each asset; the re-pin PR pins these exact bytes. Captured 2026-08-25 ~18:19 UTC." \
  engwebp_vpl-2026-08.zip topic-scores-2026-08.zip cross-references-2026-08.zip
gh api repos/jestek-dev/scripture-search-engine/releases/tags/source-snapshots-2026-08 \
  --jq '.assets[] | "\(.name)  \(.digest)"'   # digests must match CHECKSUMS.txt
```

Then delete this branch. The A5b old-WEB-bytes archive search
(docs/source-snapshots-errand.md step 4) is still open and separate.
