# The Study — workbench design system

Transcribed from Jesse's prototype v2 (commit `5ba1096`,
`prototype/Scripture Workbench/Curation Workbench.dc.html` lines 14–38 +
`DESIGN.md`), with the pre-approved deviations recorded at the end of this
file. This file is reviewed data: the token table below is parsed by
`workbench/test/designTokens.test.ts`, and the committed values are the ones
`workbench/test/contrast.audit.test.ts` holds `static/study.html` to.

A quiet study room: the chrome is calm, near-grayscale, hairline-bordered
furniture; the verse panel is the single warm, luminous object. Light mode is
a morning study desk; dark mode is Saturday-night set prep — re-derived,
never inverted.

## Type

- **Scripture serif: Literata** (variable; regular + italic, opsz axis).
  Self-hosted unmodified upstream woff2 at `workbench/static/fonts/literata/`,
  `@font-face` with `font-display: swap`. Used ONLY for scripture and rare
  display moments (done state, reveal, signing digest, the "The Study"
  wordmark at 15px). Verse setting: 17.5px / 1.65 / max 68ch; verse numbers
  as raised sans `sup` markers. Full stack everywhere Literata appears:
  `"Literata", Georgia, serif`.
- **Chrome sans: Source Sans 3** (self-hosted at
  `workbench/static/fonts/source-sans-3/`). Fallback
  `-apple-system, "Segoe UI", sans-serif`. Base 13px.
- **Mono**: `ui-monospace, "SF Mono", Consolas` — genuine identifiers in
  Advanced only.

## Tokens (CSS custom properties)

Light (`:root`) / dark (`[data-theme="dark"]`). Radii and layer washes are
listed in both columns even where the value is theme-independent, so the
per-theme coverage check stays mechanical.

| Token | Light | Dark |
|---|---|---|
| --ground | #F6F4EF | #131311 |
| --surface | #FCFBF8 | #1A1A17 |
| --panel | #FFFDF7 | #211E18 |
| --hairline | #E5E1D8 | #2E2B25 |
| --hairline-strong | #D6D1C6 | #3B372F |
| --ink | #1D1C18 | #EBE7DE |
| --text-2 | #57534A | #B4AEA1 |
| --text-3 | #6E695E | #948E81 |
| --text-faint | #A9A398 | #67635A |
| --accent | #0D5C58 | #43A8A0 |
| --accent-hover | #094744 | #5CBEB5 |
| --on-accent | #F1FAF9 | #0A2422 |
| --accent-wash | rgba(13,92,88,.08) | rgba(67,168,160,.12) |
| --v-affirm | #2C734D | #6FBE8C |
| --v-notrel | #A6493D | #DE8B7C |
| --v-missing | #80621B | #D2A94F |
| --v-affirm-wash | rgba(44,115,77,.10) | rgba(111,190,140,.12) |
| --v-notrel-wash | rgba(166,73,61,.09) | rgba(222,139,124,.10) |
| --v-missing-wash | rgba(128,98,27,.10) | rgba(210,169,79,.12) |
| --highlight | rgba(228,176,58,.30) | rgba(212,163,62,.20) |
| --kbd-bg | #EFECE4 | #24231F |
| --kbd-border | #D8D3C8 | #3B372F |
| --sel-bg | rgba(13,92,88,.16) | rgba(67,168,160,.28) |
| --caret | #0D5C58 | #43A8A0 |
| --shadow | 0 1px 2px rgba(29,28,24,.06), 0 6px 20px rgba(29,28,24,.07) | none |
| --r-ctl | 6px | 6px |
| --r-panel | 10px | 10px |
| --control-border | #8F897C | #6B6558 |

Radii: 6px controls, 10px panels. Spacing: 4/8 scale (4·8·12·16·24·32·48).
Type scale ~1.25: 11 (labels, uppercase +0.08em) · 12 · 13 (base) · 16 · 20 ·
25. Selection, caret, scrollbars, focus rings themed from tokens. Dark
`--shadow` is `none` — borders replace shadows.

Focus ring, verbatim: `:focus-visible { outline: 2px solid var(--accent);
outline-offset: 2px; border-radius: 2px; }`

## Color strategy

Hierarchy from hairline borders + text tiers, not colored boxes. Teal carries
primary actions only, at full commitment. Verdict colors appear only on
verdict elements (dots, chips, counts). Everything else grayscale in both
themes.

## Motion

One orchestrated moment: verdict commit (toast rise, 200ms,
`cubic-bezier(0.16,1,0.3,1)`). Everything else instant.
`prefers-reduced-motion` kills all animation and transitions.

## Copy voice

Verbs name real outcomes. Errors name recoveries. Empty states invite one
action. Demotion copy stays verbatim: "It is demoted out of the top results
for this query only — the verse stays in the corpus and every other search."
Undo is a superseding call, presented as "replaced by a newer call" — never
deletion.

## Plain-language rename tables

Case sources (server enum `REVIEW_CASE_SOURCES`, `workbench/src/judgments.ts`):

| Source | Plain language |
|---|---|
| manual | You looked this up |
| gauntlet | From a routine check |
| coverage | New topic to cover |
| stale-judgment | Needs a fresh look |
| telemetry | From real searches |
| calibration | Spot check |
| regression | Used to rank differently |

Case states (server enum `CASE_STATES`, `workbench/src/cases.ts`):

| State | Plain language |
|---|---|
| new | Not started |
| reviewing | In progress |
| judged | Decided |
| proposed | Suggestion drafted |
| candidate-ready | Ready to compare |
| admitted | Approved |
| pr-prepared | Packaged for engineering |
| merged | Live |
| monitored | Being watched |
| rejected | Set aside |
| needs-engineering | With engineering |

Verdicts (the four main-flow judgment actions; `prefer` exists in the API but
is not a main-flow vote):

| Action | Plain language |
|---|---|
| essential | Essential |
| helpful | Helpful |
| irrelevant | Not relevant |
| missing | Missing passage |

("Matched words, not meaning" is the plain-language gloss for a
`lexical-noise` diagnosis on a Not-relevant call.) Digests, fingerprints,
sha, raw IDs, telemetry, holdout: Advanced and the signing step only.

## Reason-pill mapping

The why-rail's single reason pill derives from the **family of the result's
highest-points reason** (ties break by reasons array order, first wins).
Families per `engine/src/reasons/types.ts`. The pill states which kind of
evidence ranked the passage; it never adjudicates the passage itself — the
engine reports that a curated source names a passage, and which source, and
nothing more.

| Family | Pill |
|---|---|
| concept_anchor | Matched the meaning |
| exact_phrase | Shares key words |
| token_overlap | Shares key words |
| proximity | Shares key words |
| concept_lexicon | Close in meaning |
| translation_variant | Close in meaning |
| passage_terms | Close in meaning |
| cross_reference | Close in meaning |
| co_citation | Close in meaning |

(The tenth family, `reference`, never appears on discovery results — a
parseable reference short-circuits to the `reference` result kind.)

## Keyboard model

J/K + arrows move · E/H/X/M judge · U undo · A/B/T/W compare · ? shortcut
sheet · Cmd/Ctrl-K quick lookup (footer legend "↑↓ Navigate · ↵ Select ·
Esc Close"). Every shortcut is also a visible button carrying its keycap
chip. Single-key shortcuts can be turned off (WCAG 2.1.4); Esc, Enter, Tab,
arrows, and ⌘K always remain.

## Deviations from prototype v2

Each deviation is pre-approved by the implementation plan
(`docs/plans/2026-08-22-dashboard-implementation-plan.md` §3.0 / D1); any
later token change forced by the contrast audit is appended here.

1. **Fonts are unsubsetted.** Prototype DESIGN.md prescribed a "subset Latin
   woff2"; subsetting counts as modification under the SIL OFL, so the
   committed files are the unmodified upstream variable woff2 releases with
   their OFL license text alongside (`workbench/static/fonts/*/OFL.txt`).
2. **Answer-sheet copy substitution (§3.7).** The signing surface says
   "answer sheet", not "fixture files": the Write button reads "Write {n}
   calls to the answer sheet" (replacing the prototype's "Write {n}
   judgment(s) to fixture files") and the success line reads "{n} calls are
   now on the answer sheet." (replacing "…are now in the answer files").
3. **Light `--text-3`: #847F73 → #6E695E.** The prototype value measures
   3.92:1 on `--panel` and 3.85:1 on `--surface` — failing WCAG AA 4.5:1 on
   the very tier the safety copy is set in. The replacement measures 5.37:1
   on `--panel`, 5.28:1 on `--surface`, 4.97:1 on `--ground`.
4. **Dark `--text-3`: #8A8478 → #948E81.** The prototype value measures
   4.47:1 on `--panel`. The replacement measures 5.10:1 on `--panel`, 5.35:1
   on `--surface`, 5.71:1 on `--ground`.
5. **Light `--v-affirm`: #2F7A52 → #2C734D.** The prototype value measures
   4.4966:1 over its own wash composited on `--panel` — failing AA 4.5:1 for
   the 12–13px judged-chip text that renders on exactly that ground. The
   replacement measures 4.94:1 over its wash, 5.63:1 on `--panel`, 5.53:1 on
   `--surface`. (Its wash keeps the prototype's alpha and follows the new
   base: rgba(44,115,77,.10).)
6. **Light `--v-missing`: #8C6C1E → #80621B.** The prototype value measures
   4.2552:1 over its own wash on `--panel` — a clear fail. The replacement
   measures 4.95:1 over its wash, 5.61:1 on `--panel`, 5.51:1 on
   `--surface`. (Its wash keeps the prototype's alpha and follows the new
   base: rgba(128,98,27,.10).) Light `--v-notrel` (4.99:1 over its wash) and
   the entire dark verdict column (≥5.45:1 over their washes) already pass
   and stay verbatim.
7. **Added token `--control-border`** — light `#8F897C` (3.36:1 vs
   `--surface`), dark `#6B6558` (3.01:1 vs `--surface`). Used ONLY on text
   inputs (the search bar, the missing-passage reference input, the sign
   input) and the top-N segmented picker's selected-state boundary, so those
   interactive boundaries meet WCAG 1.4.11 while `--hairline-strong` stays
   the quiet decorative divider/card-edge line the design language calls for.
8. **`--text-faint` is reserved for WCAG-exempt text only** — disabled
   control labels and purely decorative glyphs (light #A9A398 measures
   2.42:1 on `--surface`; dark #67635A, 2.91:1). It never carries
   information-bearing copy — the Advanced nav link and every hint sentence
   use `--text-3` or better. `pairs.json` lists `--text-faint` pairings under
   `exempt: true`, which the contrast audit's ratio check skips.
