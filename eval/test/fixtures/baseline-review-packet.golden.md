# Probe baseline review packet

Read-only evidence for the independent baseline reviewer
(docs/governance/probe-baseline-review.md). This packet is generated from the
exact before/after baseline documents; it never writes the approval.

## Engine identity movement

| | before | after |
|---|---|---|
| engineVersion | `0.9.0-test` | `0.9.0-test` |
| corpusFingerprint | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |
| layerFingerprint | `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` | `cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc` |

## Probe movement summary

- 3 probe(s): 2 changed, 1 unchanged.
- Unchanged: `stable-probe`.

## Changed probes

### `adversarial-nonsense` — "quantum photosynthesis algorithm" (adversarial)

> No scriptural content exists for this query.

| metric | before | after | delta | budget |
|---|---|---|---|---|
| result count | 0 | 2 | +2 | — |
| top-10 churn | — | 100% | — | max 40% — **EXCEEDED** |
| weak-reason share | 0 | 1 | +1 | rise max +0.15 — **EXCEEDED** |
| mean top score | 0 | 0.5 | +0.5 | — |

**Adversarial probe returns 2 result(s) but must return none.**

| # | before | after | movement |
|---|---|---|---|
| 1 |  | `WEB:01005006` Genesis 5:6 | **added** |

### `broad-love` — "love" (broad)

| metric | before | after | delta | budget |
|---|---|---|---|---|
| result count | 20 | 22 | +2 | — |
| top-10 churn | — | 33% | — | max 40% |
| weak-reason share | 0.5 | 0.7 | +0.2 | rise max +0.15 — **EXCEEDED** |
| mean top score | 10 | 11.5 | +1.5 | — |

| # | before | after | movement |
|---|---|---|---|
| 1 | `WEB:45005008` Romans 5:8 | `WEB:45008039` Romans 8:39 | **added** |
| 2 | `WEB:43003016` John 3:16 | `WEB:45005008` Romans 5:8 | moved (was #1) |
| 3 | `WEB:62004010` 1 John 4:10 | `WEB:62004010` 1 John 4:10 | held |

Dropped from the top-10: `WEB:43003016` John 3:16

## The approval must bind exactly these values

Copied into `eval/baselines/probes.approval.json` by the reviewer; the
gauntlet recomputes and compares every one of them.

- `baselineSha256`: `af5fe0e2b319795b0ff8861aebaf92bb18cec4c47c4fdf423047c481843a2a6b` (canonical JSON of the after baseline)
- `probesSha256`: `16ac368c608335587faa55cc2e26363feea9d1fc71ca242a298b1d4146cbeac4` (canonical JSON of the probe definitions file)
- `engine.engineVersion`: `0.9.0-test`
- `engine.corpusFingerprint`: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- `engine.layerFingerprint`: `cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc`

A v2 approval also quotes `reviewPacketSha256`: the SHA-256 of this packet
file exactly as written. The tool prints it on stderr when it generates the
packet, and `sha256sum` on the saved packet reproduces it.

For the review record: the before baseline's canonical-JSON SHA-256 is
`13144662fb2c09884fc16ccd1f4df3ed97e4d3e4e1ad9412c90cd79e84c2f9c0`; `priorProvenance.baselineGitBlobSha1` comes from
`git rev-parse <before-revision>:eval/baselines/probes.json`.

