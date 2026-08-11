# Probe baseline review - August 10, 2026

## Review record

- Reviewer role: independent admission baseline reviewer
- Review date: 2026-08-10
- Scope: full 25-probe G8 baseline review against the committed probe set in [eval/probes/probes.json](/C:/Users/Jeste/OneDrive/Documents/GitHub/scripture-search-engine/eval/probes/probes.json)
- Baseline file: [eval/baselines/probes.json](/C:/Users/Jeste/OneDrive/Documents/GitHub/scripture-search-engine/eval/baselines/probes.json)
- Approval record: [eval/baselines/probes.approval.json](/C:/Users/Jeste/OneDrive/Documents/GitHub/scripture-search-engine/eval/baselines/probes.approval.json)

## Identity and digest binding

- Previous baseline blob: `1fc76aa59d987877849a96642604981b0d858145`
- Previous engine triple: `0.7.1` / `d4835d2052b6923f253fce337e77952571f6618a1799911f17c1548ee80c12c8` / `null`
- Current baseline SHA-256: `6f3c6c0c5ef11daad7d88ead586160db151eb017ee23ee60f314137794d36fda`
- Current probes SHA-256: `3d437b030362d5e717a048cf2b163129b7a530a49fc0f2921c0de37e8aaf8d50`
- Current engine triple: `0.9.0` / `60b7f88879866bdd50f5560c2bbd5334c869358383fba5179183a9737b7c27ed` / `b3ac103348f7f6fe43977bae9c010c51ef0162a755c7644b34e7405c6416e51a`

The approval binds the exact canonical-JSON digests of the current baseline and probe definition documents. The previous baseline blob and previous engine triple provide the base provenance for this review; the current layer fingerprint is included because the full measured identity is part of the admission contract.

## Review evidence

The review used the fixed probe definitions, the old/new baseline diff, the recorded top-10 movements, and the associated weak-signal and score deltas. Three probes were unchanged (`adversarial-nonsense`, `adversarial-common-only`, `ot-narrative-ruth`). Twenty-two probes changed and are explicitly accepted below.

## Rationale categories

- `Anchor sharpened`: the new top results center the canonical anchor or clearer same-theme neighbors.
- `Weak-signal reduced`: weak-reason share fell materially and the list became less mushy.
- `Benign churn`: ordering or tail movement changed, but the anchor and product intent stayed intact.
- `Adversarial suppression`: the query is supposed to stay low-confidence or noisy, and the new list better reflects that constraint.

## Accepted changed probes

| Probe | Query | Acceptance |
|---|---|---|
| `broad-love` | `love` | Accepted (`Anchor sharpened`, `Weak-signal reduced`): the list moved from all-weak generic matches to direct love anchors such as Romans 5, Romans 8, John 3, and 1 John 4; weak-reason share fell from `1.000000` to `0.132931`. |
| `broad-grace` | `grace` | Accepted (`Weak-signal reduced`): direct grace anchors remained at the top while duplicate and stray tail hits dropped out; weak-reason share fell from `1.000000` to `0.502782`. |
| `broad-faith` | `faith` | Accepted (`Benign churn`): the query remains broadly weak by nature, but the anchor set is stable and the movement is limited to nearby canonical neighbors with only a `+0.180069` mean-score shift. |
| `broad-word` | `the word` | Accepted (`Benign churn`): the first four anchors are unchanged and the remaining movement is tail churn around other plausible "word" passages; ranking strength is effectively flat. |
| `medium-refuge-trouble` | `refuge in trouble` | Accepted (`Anchor sharpened`): Psalm 46 and Psalm 91 still lead, and the replacement tail brings in clearer refuge/trouble neighbors such as Nahum 1:7 and Psalm 34:19. |
| `medium-fear-not` | `do not be afraid` | Accepted (`Anchor sharpened`): the list now centers on explicit fear-not anchors in Isaiah 43 and Joshua 1 instead of diffuse competitor passages, even though the weak-share mix rose. |
| `medium-light-darkness` | `walking in the light` | Accepted (`Benign churn`): 1 John 1 and Ephesians 5 remain the controlling anchors; the rest is modest tail movement without a product-intent change. |
| `narrow-hearing-doing` | `hearing and doing` | Accepted (`Benign churn`): only the relative order of the same hearing/doing anchor set changed; metrics are effectively unchanged. |
| `narrow-doers-word` | `be doers of the word not hearers only` | Accepted (`Benign churn`): the update removes duplicate repeats from the old top list and preserves the James 1 / Matthew 7 / Luke 6 core. |
| `narrow-house-rock` | `built his house on the rock` | Accepted (`Benign churn`): the top list is unchanged and the tiny metric drift is baseline noise, not a semantic move. |
| `phrase-present-help` | `a very present help in trouble` | Accepted (`Benign churn`): Psalm 46:1 remains first, and the rest of the churn stays within plausible help/trouble neighbors rather than unrelated thematic mush. |
| `ot-law-decalogue` | `you shall not covet` | Accepted (`Anchor sharpened`, `Weak-signal reduced`): the list still begins with Exodus 20 and now adds stronger law-adjacent witnesses while weak-share falls and result count increases from `14` to `17`. |
| `ot-law-neighbour` | `love your neighbor as yourself` | Accepted (`Anchor sharpened`, `Weak-signal reduced`): Leviticus 19 remains present while Romans 13, Matthew 22, James 2, and John 13 form a tighter canonical cluster; weak-share fell from `0.274530` to `0.183727`. |
| `ot-blessing` | `the LORD bless you and keep you` | Accepted (`Benign churn`): Numbers 6 remains the controlling anchor and the rest is light liturgical tail movement with only a `+0.531221` score change. |
| `ot-histories-elijah` | `a still small voice` | Accepted (`Benign churn`): the top list is unchanged and the metric movement is negligible. |
| `ot-histories-humble` | `if my people who are called by my name humble themselves` | Accepted (`Benign churn`): 2 Chronicles 7:14 still leads decisively; the new tail is different, but the anchor did not weaken and the score increased by `+3.789595`. |
| `ot-wisdom-trust` | `trust in the LORD with all your heart` | Accepted (`Anchor sharpened`, `Weak-signal reduced`): Proverbs 3 still leads, and the list now stays with trust/refuge/waiting neighbors instead of drifting into broader exhortation; weak-share fell from `0.571847` to `0.228817`. |
| `ot-wisdom-time` | `a time for every purpose` | Accepted (`Benign churn`): Ecclesiastes 3 remains first and the rest of the movement is limited to nearby timing/purpose competitors. |
| `ot-prophets-servant` | `he was pierced for our transgressions` | Accepted (`Benign churn`): the top list is unchanged and the metric delta is negligible. |
| `ot-prophets-plans` | `thoughts of peace and not of evil` | Accepted (`Anchor sharpened`, `Weak-signal reduced`): Jeremiah 29:11 remains first while the rest of the list became more peace/plans adjacent and materially less weak-signal dominated (`0.588327` to `0.320926`). |
| `ot-prophets-justly` | `do justly love mercy walk humbly` | Accepted (`Anchor sharpened`): Micah 6:8 remains first and the new tail clusters around justice/mercy/walking passages rather than unrelated low-information competitors; mean top score rose by `+2.809366`. |
| `ot-adversarial-census` | `all the days of Seth` | Accepted (`Adversarial suppression`): this query is intentionally hostile to thematic spillover, and the new baseline is much lower-confidence (`31.065544` to `5.485492`) with fully weak explanations, which is the safer shape for a genealogy probe. |

## Decision

Accepted. The updated baseline is a legitimate record of the new fixture/corpus/engine identity, and the observed probe movement is explainable by sharper anchors, lower weak-signal dominance, or benign tail churn rather than silent product regression.
