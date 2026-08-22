# Workbench design system — "The Study"

A quiet study room: the chrome is calm, near-grayscale, hairline-bordered furniture; the verse panel is the single warm, luminous object. Light mode is a morning study desk; dark mode is Saturday-night set prep — re-derived, never inverted.

## Type

- **Scripture serif: Literata** (variable; regular + italic, opsz axis). Self-host as subset Latin woff2 at `workbench/static/fonts/literata/`, `@font-face` with `font-display: swap`. Used ONLY for scripture and rare display moments (done state, reveal, signing digest). Verse setting: 17.5px / 1.65 / max 68ch; verse numbers as raised sans sup markers.
- **Chrome sans: Source Sans 3** (self-host at `workbench/static/fonts/source-sans-3/`). Fallback `-apple-system, "Segoe UI", sans-serif`. Base 13px.
- **Mono**: `ui-monospace, "SF Mono", Consolas` — genuine identifiers in Advanced only.

## Tokens (CSS custom properties)

Light (`:root`) / dark (`[data-theme="dark"]`):

| Token | Light | Dark |
|---|---|---|
| --ground | #F6F4EF | #131311 |
| --surface | #FCFBF8 | #1A1A17 |
| --panel (verse page, warmest) | #FFFDF7 | #211E18 |
| --hairline | #E5E1D8 | #2E2B25 |
| --hairline-strong | #D6D1C6 | #3B372F |
| --ink | #1D1C18 | #EBE7DE |
| --text-2 | #57534A | #B4AEA1 |
| --text-3 | #847F73 | #8A8478 |
| --text-faint | #A9A398 | #67635A |
| --accent | #0D5C58 | #43A8A0 |
| --accent-hover | #094744 | #5CBEB5 |
| --on-accent | #F1FAF9 | #0A2422 |
| --accent-wash | rgba(13,92,88,.08) | rgba(67,168,160,.12) |
| --v-affirm | #2F7A52 | #6FBE8C |
| --v-notrel | #A6493D | #DE8B7C |
| --v-missing | #8C6C1E | #D2A94F |
| --highlight (marker) | rgba(228,176,58,.30) | rgba(212,163,62,.20) |
| --kbd-bg / --kbd-border | #EFECE4 / #D8D3C8 | #24231F / #3B372F |
| --sel-bg | rgba(13,92,88,.16) | rgba(67,168,160,.28) |
| --shadow | offset+soft blur | none (borders replace shadows) |

Radii: 6px controls, 10px panels. Spacing: 4/8 scale (4·8·12·16·24·32·48). Type scale ~1.25: 11 (labels, uppercase +0.08em) · 12 · 13 (base) · 16 · 20 · 25. Selection, caret, scrollbars, focus rings themed from tokens.

## Color strategy

Hierarchy from hairline borders + text tiers, not colored boxes. Teal carries primary actions only, at full commitment. Verdict colors appear only on verdict elements (dots, chips, counts). Everything else grayscale in both themes.

## Motion

One orchestrated moment: verdict commit (toast rise, 200ms, `cubic-bezier(0.16,1,0.3,1)`). Everything else instant. `prefers-reduced-motion` kills all animation and transitions.

## Copy voice

Verbs name real outcomes: "Write 28 judgments to fixture files", never "Submit". Errors name recoveries. Empty states invite one action. Demotion copy stays verbatim: "It is demoted out of the top results for this query only — the verse stays in the corpus and every other search." Undo is a superseding call, presented as "replaced by a newer call" — never deletion.

## Plain-language rename table

Case sources: manual → "You looked this up" · gauntlet → "From a routine check" · coverage → "New topic to cover" · stale-judgment → "Needs a fresh look" · telemetry → "From real searches" · calibration → "Spot check" · regression → "Used to rank differently".

Case states: new → "Not started" · reviewing → "In progress" · judged → "Decided" · proposed → "Suggestion drafted" · candidate-ready → "Ready to compare" · admitted → "Approved" · pr-prepared → "Packaged for engineering" · merged → "Live" · monitored → "Being watched" · rejected → "Set aside" · needs-engineering → "With engineering".

Verdict labels (kept from v1.1): Essential · Helpful · Not relevant ("Matched words, not meaning" for lexical-noise) · Missing passage. Digest/fingerprint/sha, raw IDs, telemetry, holdout: Advanced and the signing step only.

## Keyboard model

J/K + arrows move · E/H/X/M judge · U undo · A/B/T/W compare · ? shortcut sheet · Cmd/Ctrl-K quick lookup (footer legend "↑↓ Navigate · ↵ Select · Esc Close"). Every shortcut is also a visible button carrying its keycap chip.
