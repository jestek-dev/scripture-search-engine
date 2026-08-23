# Self-hosted fonts — provenance

Both families are licensed under the SIL Open Font License 1.1; the upstream
license text is committed alongside each family as `OFL.txt`. The committed
woff2 files are **byte-identical to the pinned upstream releases** — no
subsetting, no conversion (subsetting or converting would make them Modified
Versions under the OFL). Chosen path: the upstream releases already ship
variable woff2 for regular + italic, so no fallback (TTF or converted woff2)
was needed. Two Literata files are renamed on disk only (the upstream
basenames contain `[opsz,wght]`, which is hostile to URLs); renaming does not
alter the font software, and the sha256 lines below prove byte equality.

`workbench/test/fontProvenance.test.ts` reads the sha256 lines below, hashes
each committed file, and asserts equality — a re-vendored or silently
modified font file fails `npm test`, not review.

## Literata

- Upstream: https://github.com/googlefonts/literata — release tag `3.103`
  (commit `0c2761b727a1b3a7cffd313c37f0f5163dfc7a63`, "Built fonts 3.103").
- Files (upstream path → committed path):
  - `fonts/webfonts/Literata[opsz,wght].woff2` → `literata/Literata-Variable.woff2`
  - `fonts/webfonts/Literata-Italic[opsz,wght].woff2` → `literata/Literata-Italic-Variable.woff2`
  - `OFL.txt` → `literata/OFL.txt`

## Source Sans 3

- Upstream: https://github.com/adobe-fonts/source-sans — release tag `3.052R`
  (commit `ed1808970eb3c7301c9a523bee26473ba0bb62fa`, version 3.052).
- Files (upstream path → committed path, names unchanged):
  - `WOFF2/VF/SourceSans3VF-Upright.ttf.woff2` → `source-sans-3/SourceSans3VF-Upright.ttf.woff2`
  - `WOFF2/VF/SourceSans3VF-Italic.ttf.woff2` → `source-sans-3/SourceSans3VF-Italic.ttf.woff2`
  - `LICENSE.md` → `source-sans-3/OFL.txt`

## sha256

```
5e50643479bee69e0204164602f830502b0db42bbc29da83edc9980df17e34df  literata/Literata-Variable.woff2
ddfb5600779fccc34c8fc6ff32a1b60a04355e9ae00a230539d852de7e0eb4ee  literata/Literata-Italic-Variable.woff2
5f16566f7a40d39b339ad26be151fa5a1ab1f0c2574c7a2e619765584a1acbd8  source-sans-3/SourceSans3VF-Upright.ttf.woff2
b4959abc0569392f87c6c6ac612f90e3fe0104d283724189b7d8b6f61af347d3  source-sans-3/SourceSans3VF-Italic.ttf.woff2
```
