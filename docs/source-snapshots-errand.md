# Source-snapshots errand (J52 / A5a-b) — runbook for Jesse

The one human errand that unblocks both re-pin PRs (plan P2.1 / RH-3 for WEB,
plan P2.2 / RH-4 for OpenBible) and, downstream of them, the v0.9.0 mint:
capture the three drifted upstream snapshots ONCE, hash them immediately,
upload them as GitHub Release assets, and complete the archive search for the
old pinned WEB bytes. Nothing in this runbook edits a manifest — upload
precedes every manifest edit so no `archiveUrl` ever points at nothing
(`docs/source-repins.md` step 1).

Runs from any machine with unrestricted network access and an authenticated
`gh` CLI with write access to `jestek-dev/scripture-search-engine`. Total
time: roughly fifteen minutes plus the archive search.

## Why capture-once is a hard rule

The WEB URL rolls near-daily (five distinct upstream archive hashes observed
2026-08-14 → 2026-08-21). If the errand downloads a file and the re-pin PR
later downloads "the same" file again, the two steps pin different bytes and
the PR's checksums describe an archive asset that does not exist. So: one
download per source, hashed the moment it lands, and every later step —
upload, verification, the delta diff, the manifest values — uses those exact
local files. Never re-download between steps.

## Step 1 — capture and hash (all three, one pass)

```sh
mkdir -p ~/source-snapshots-2026-08 && cd ~/source-snapshots-2026-08

curl -fL -o engwebp_vpl-2026-08.zip      https://ebible.org/Scriptures/engwebp_vpl.zip
curl -fL -o topic-scores-2026-08.zip     https://a.openbible.info/data/topic-scores.zip
curl -fL -o cross-references-2026-08.zip https://a.openbible.info/data/cross-references.zip

sha256sum *.zip | tee CHECKSUMS.txt
wc -c *.zip
```

Keep `CHECKSUMS.txt` — its lines go verbatim into the release notes (step 3)
and the re-pin PR bodies. For reference, the drift the errand is resolving
(pinned manifest values vs upstream observed 2026-08-21):

| source | pinned sha256 (old) | upstream observed 2026-08-21 |
| --- | --- | --- |
| web (`pipeline/manifests/web.json`) | `3458ca34…` (4,281,524 B) | `b6f55cc7…` (4,281,529 B) |
| openbible-topics | `2239700d…` (417,866 B) | `2647baf7…` |
| openbible-xrefs | `36d1b198…` (1,981,973 B) | `22c26dd6…` |

Your captured hashes may differ from the observed column — the URLs roll.
That is fine and expected: whatever you capture IS the snapshot; record it.

## Step 2 — create the release

```sh
gh release create source-snapshots-2026-08 \
  --repo jestek-dev/scripture-search-engine \
  --title "Source snapshots 2026-08" \
  --notes "Durable archive of upstream source snapshots captured for the 2026-08 re-pins (docs/source-repins.md step 1; errand J52/A5a). Checksums in the table below are the capture-time sha256 of each asset; the re-pin PRs pin these exact bytes." \
  engwebp_vpl-2026-08.zip topic-scores-2026-08.zip cross-references-2026-08.zip
```

Then edit the release notes (web UI or `gh release edit --notes-file`) to
append the contents of `CHECKSUMS.txt` and the capture date/time (UTC), so
the release describes itself.

## Step 3 — verify after upload (one API call per asset)

GitHub now serves a per-asset sha256 digest. Confirm each uploaded asset's
digest equals your local hash — this is the before-and-after verification
`docs/source-repins.md` step 1 requires:

```sh
gh api repos/jestek-dev/scripture-search-engine/releases/tags/source-snapshots-2026-08 \
  --jq '.assets[] | "\(.name)  \(.digest)"'
```

Every `sha256:<hex>` must match `CHECKSUMS.txt` exactly. A mismatch means a
corrupted upload: delete the asset (`gh release delete-asset`), re-upload the
LOCAL file (never a fresh download), and re-check.

## Step 4 — the old-WEB-bytes archive search (A5b's precondition)

The previously pinned WEB snapshot (`3458ca34…`, retrieved 2026-07-29) no
longer exists at the source. Losing from-scratch reproducibility of an old
snapshot is a decision only you can sign off (A5b) — and the sign-off is only
askable after this documented search comes back empty.

**4a. Local/backup copies first.** Any machine or backup that ran the
pipeline around 2026-07-29 may hold `pipeline/sources/engwebp_vpl.zip`.
Check with:

```sh
sha256sum pipeline/sources/engwebp_vpl.zip
# looking for: 3458ca34420c0547ec01b3dbda58a10a2d8fc511bdcd2e047ddd17fbe860b7b6
```

**4b. The two public-archive commands** (egress-blocked from agent
environments, which is why this is your errand):

```sh
# (1) Complete Wayback capture list for the URL:
curl -s 'https://web.archive.org/cdx/search/cdx?url=ebible.org/Scriptures/engwebp_vpl.zip&output=text'

# (2) For EVERY 2026 capture listed (and the 2025-09-30 capture, timestamp
#     20250930054027, for completeness), fetch the raw bytes and hash them:
curl -fL -o wayback-<timestamp>.zip \
  'https://web.archive.org/web/<timestamp>id_/https://ebible.org/Scriptures/engwebp_vpl.zip'
sha256sum wayback-<timestamp>.zip
```

**Completion criteria — the search is COMPLETE when all of these hold:**

1. the CDX query returned the full capture list (or an explicit empty
   result), and the list is saved;
2. every 2026-dated capture, plus the 2025-09-30 capture, has been fetched
   and hashed;
3. each hash was compared against `3458ca34…` and the outcomes recorded.

Then exactly one of:

- **Found** (locally or in a capture): upload the old bytes as
  `engwebp_vpl-2026-07.zip` on the same release, verify its digest as in
  step 3 — the old snapshot stays reproducible and A5b never needs asking.
- **Not found**: record the search evidence (CDX output + hash list) in the
  release notes or the WEB re-pin PR, and sign off the loss explicitly
  (A5b). Silence is not a sign-off; an implementer may not default it.

## Step 5 — hand-off

Reply to the implementation thread with: the three capture hashes (+ the old
WEB bytes outcome), and confirmation the release exists with verified
digests. That answers **J52/A5a** (and **A5b** if the search was empty).
The implementers then run the delta measurement against the captured bytes
(`pipeline/scripts/webDelta.ts`; staged PR shape in
`docs/web-repin-staged.md`) and bring you A5c — the review of any genuine
verse-text changes — before any re-pin PR merges.

What this errand does NOT do: edit any manifest, touch any checksum, merge
anything. The re-pins remain reviewed PRs (`docs/source-repins.md`), queued
behind the J39 baseline approvals.
