# Workbench visual upgrade — Claude design prompt

Authored 2026-08-21 from thread research (Mobbin patterns, design-skill guidance, workbench code inventory at HEAD 9542c83). Paste the prompt below into a Claude Code session opened in the scripture-search-engine repo.

---

# Redesign the curation workbench — design brief

**Mission.** Redesign the UI of the curation workbench (`workbench/` package; a vanilla-JS single-page app in `workbench/static/index.html`, served loopback-only at `http://127.0.0.1:8787`). This is a **redesign, not a polish** — replace the current layout and visual system entirely; do not split the difference by restyling the existing eleven-tab shell. It is also a **refinement of purpose**: every existing capability, the backend API, and the project's covenant guarantees stay exactly as they are.

**Who it is for.** The primary user is Jesse, a worship leader — not an engineer. He reviews scripture search results in short weekly bursts: read a passage, decide whether it belongs among the top results for a query, move on. The tool encodes *his* judgment, so any field he cannot answer in his own vocabulary produces noise, not review. A second occasional user is an engineer running checks and publishing changes; that user gets an **Advanced** area kept out of Jesse's way. Design the primary experience for Jesse; this is an Operate surface — scanability and calm beat expressiveness — with one Read surface at its heart (the scripture itself).

## Hard constraints — violating any of these fails the task

1. **The backend API is fixed.** All `/api/v2/*` endpoints, the `{ok, data|error}` envelope, CSRF guards, and the read-only degraded mode stay untouched. This is a UI-only change. Two existing endpoints are currently unused by the UI and you SHOULD adopt them: `GET /api/search?q=` (quick lookup without creating a case) and `GET /api/passage?ref=` (live verse preview).
2. **No ranking controls.** Never add per-result weights, sliders, score editors, or any hidden second ranking system — verdicts only. This is covenant, not preference.
3. **Judgments are append-only and immutable.** "Undo" is always a superseding judgment through the existing `supersedes` field — present it as undo in the UI, never as deletion, and never fake it client-side.
4. **Repo-writing steps keep their ceremony.** Compile-apply, fixture promotion, and publish keep the full typed-digest confirmation exactly as it works today (type the complete preview digest to enable the button). Redesign its presentation — make it feel like signing, not a chore — but do not weaken the gate.
5. **Local-only runtime.** No external network calls from the page — no font CDNs, no analytics, nothing. Self-host any webfont as a static asset (extend the static-snapshot serving in `workbench/src/staticSnapshot.ts` if needed). Keep the no-framework, no-build character: vanilla JS, CSS custom properties, semantic HTML. You may split the single file into a few static assets if the serving layer supports it cleanly.
6. **Plain language is law.** Jesse-facing surfaces never show: telemetry, calibration, stale-judgment, candidate-ready, pr-prepared, seed, holdout, digest/fingerprint/sha (outside the Advanced area and the signing step), raw target or case IDs, or priority formulas. Rename every case-source and case-state value a curator can see into plain English (e.g. "stale-judgment" → "Needs a fresh look"; "candidate-ready" → "Ready to compare"). Keep the existing plain verdict labels ("Matched words, not meaning", etc.) — they are already right.
7. **Auto-infer what evidence can answer; ask humans only what only humans know.** The v1.1 "Not relevant" interview logic (one-click auto-inferred lexical-noise; plain yes/no questions when concept evidence exists; hand-typed concept ID only as a labeled degraded fallback) is correct — keep its exact logic and restyle only. Never reintroduce a diagnosis jargon picker or a required rote "why" field; a hand-written sentence is required only where it edits reviewed theology files.

## Information architecture

Collapse the eleven tabs into Jesse's world plus one Advanced area:

- **Review** (default screen): the inbox queue and the judging surface, merged into one three-region screen (below).
- **Compare**: the blind A/B candidate review.
- **History**: case and judgment timeline, humanized (no raw IDs; supersedes shown as "replaced by a newer call").
- **Finish up**: the compile-to-fixtures summary (below) — the payoff screen where reviewed work leaves the workbench.
- **Advanced** (one quiet entry, collapsed by default, remembered per browser): Health, Admission, Changes internals, Publish, Quality, Telemetry audits, and review-session engineering controls. Same design system, denser and cooler in tone; a persistent way back. Never surface Advanced notifications into Jesse's flow.
- **Quick lookup** from anywhere (Cmd/Ctrl-K): type words or a reference, see live results rendered as scripture (via `/api/search` and `/api/passage`), with one action — "Start a review case from this search." Looking something up must not require creating a case.

## Design direction — "The Study"

A quiet study room where scripture is the illuminated object and the tool is well-made furniture. Everything in the chrome — queue, rails, buttons — is calm, near-grayscale, and hairline-bordered; the verse panel is the single warm, luminous thing on screen. The existing deep-teal identity survives as the one accent color, deepened and used with commitment on primary actions; verdict semantics are the only other chroma. **Light mode** is a morning study desk: paper-warm ground, ink text. **Dark mode** is Saturday-night set prep — a worship leader preparing before Sunday: true dark surfaces, borders instead of shadows, the verse panel glowing slightly warmer than its surroundings. Both modes are first-class (toggle: light/dark/system, persisted; respect `prefers-color-scheme` by default) — dark is re-derived, never inverted.

**Signature element:** the passage panel. Every result renders its verse like a page from a finely set Bible — a characterful serif at 17–18px with 1.6 line-height, 65–75ch measure, verse numbers as small raised markers, matched words highlighted with a warm translucent marker stroke (dimmed to a soft glow in dark mode). The moment of judging should feel like reading scripture, not operating software. Spend the design's boldness here and keep everything else quiet.

## Visual system — author this first, before any code

- **Tokens** as CSS custom properties, both themes side by side: surface/ground/panel grays, hairline border, ink and three muted text tiers, teal accent pair, verdict semantics (affirm / not-relevant / missing — pick values, keep them semantic-only), warm highlight, focus ring, shadow (offset + soft blur; borders replace shadows in dark), radius, a 4/8-based spacing scale, a ~1.25-ratio type scale, and a `kbd` keycap chip token pair. Theme the browser surfaces too: selection color, caret, scrollbars, focus rings.
- **Type:** choose and NAME one serif for scripture with genuine text-size credentials (consider Literata, Source Serif 4, or Charter — your call, but commit; avoid Fraunces, Playfair, Cormorant, Lora, Crimson, Newsreader). One quiet humanist sans for all chrome (system stack acceptable; a self-hosted sans is better; never the serif for UI controls). Monospace only for genuine identifiers in Advanced — never as a "technical" costume.
- **Color strategy: restrained.** Hierarchy comes from hairline borders and text-contrast tiers (the Vercel/Linear model), not colored boxes. The teal accent carries primary actions at full commitment; verdict colors appear only on verdict elements; everything else stays grayscale in both themes.

## Screens

**Review (first viewport, ≥1280px):** queue rail left (~300px) — rows grouped by query with counts, one dark reference per row, muted metadata, verdict-state icons, Linear-density (~36px rows), bulk-select summoning a floating action bar for runs of obvious calls. Scripture panel center — the signature verse page, with the current call shown as a quiet chip. "Why this ranked" rail right — the engine's explanation contract in plain label:value rows (which curated source names it, matched terms, plain-language reason chips), tabbed with full passage context. Verdict bar pinned bottom-center with keycap chips: **Essential** (with the place-within 1/3/5/10 control), **Helpful**, **Not relevant**, **Missing passage**. A verdict advances to the next item and raises a bottom toast — "Marked Micah 7:18 essential · Undo" — that supersedes on undo. Emptied queue is a warm, celebratory done state: one sentence ("All 34 judged."), one action ("Review what you decided →" into Finish up).

**Not-relevant interview:** keep the exact existing logic; restyle as a small in-place card conversation inside the panel — one question visible at a time, plain yes/no buttons, never a modal maze. Keep the honest demotion copy ("demoted out of the top results for this query only — the verse stays in the corpus and every other search").

**Missing passage:** as the reference is typed, the verse renders live below in the scripture style (via `/api/passage`) so Jesse confirms he has the right passage before adding it. Place-within control; optional note; no required rote text.

**Compare (blind A/B):** side-by-side ranked lists with synchronized selection; the selected passage rendered in scripture style with both sides' explanations; verdict bar A wins / B wins / Tie / Both wrong on keys; immutability stated plainly ("This call is final"). The identity reveal is a designed moment, not a dump.

**Finish up:** a review-and-submit summary — counts per verdict, still-pending items flagged, per-file before/after fixture previews, and a primary button naming the real outcome ("Write 28 judgments to fixture files"). The typed-digest confirmation lives here, presented as signing: what you are signing, why it is typed, the field, the button.

**Global states:** the read-only degraded banner (restyle, keep the plain recovery copy); skeleton loading for queue and passage panels; error states that name the problem and the fix; the live job terminal in Advanced restyled to the token system. Keep the existing `aria-live` status wiring.

## Interaction quality

- **Keyboard model:** J/K (and arrows) move through the queue; single letters for verdicts (E essential, H helpful, X not relevant, M missing passage); U undo; `?` opens a shortcut sheet grouped by activity with keycap chips; Cmd/Ctrl-K opens quick lookup with a permanent "↑↓ Navigate · ↵ Select · Esc Close" footer legend. Every shortcut is also a visible button carrying its keycap chip — the mouse path teaches the keyboard path.
- **First-run onboarding:** three interactive cards, one shortcut each (move, judge, help), each requiring the actual keypress to continue. That is the entire training burden. A one-line contextual coach bar may surface a single tip at natural moments ("Press E to mark essential"); never more than one at a time, dismissible forever.
- **Motion:** one orchestrated moment — the verdict commit (toast rise + queue row settling) — with exponential ease-out at 150–250ms. Everything else instant. Honor `prefers-reduced-motion` completely.
- **Feedback:** optimistic UI with fail-loud revert; API rejections surface in plain words, and interview drafts survive a rejected submit (as today).

## Accessibility and quality floor

Body contrast ≥ 4.5:1 and large text ≥ 3:1 in BOTH themes; visible focus rings everywhere; full keyboard operability including the queue, interview, and digest signing; keep the existing tablist semantics and roving tabindex pattern; screen-reader labels on verdict buttons ("Mark Micah 7:18 essential"); hit targets ≥ 36px; the narrow-viewport table collapse behavior stays functional. UX copy is design material: verbs name actions ("Write 28 judgments", never "Submit"), errors name recoveries, empty screens invite one action.

## What to avoid

- The AI-interface clichés: cream + high-contrast serif + terracotta/orange accent; near-black + neon glow; broadsheet hairlines + italic serif everywhere. The serif belongs to scripture alone — if the chrome starts looking editorial, pull it back to quiet.
- Same-size icon+heading+text card grids; nested cards; kicker/eyebrow labels; 01/02/03 numbering; gradient text; glass blur as decoration; thick colored left-borders; emoji as icons; purple/indigo gradients.
- Boldness scattered everywhere, or nowhere: the verse panel is the one bold thing.
- Jargon leaking back in (constraint 6), and any control that edits ranking (constraint 2).

## Process

1. **Before any code**, reply with: the full token sheet (both themes), the named font choices with self-hosting plan, and an ASCII wireframe of the Review screen's first viewport. Wait for a go-ahead if one is offered; otherwise proceed.
2. Build incrementally. Update the existing vitest and Playwright e2e suites to the new UI as you go — adapt them, never delete or skip them; `npm test` in `workbench/` must pass when you finish.
3. **Verify with screenshots:** desktop light, desktop dark, and a narrow viewport, diffed against this brief with named deltas (not vibe checks); fix in one batch; at most two rounds.
4. Persist the resulting system in `workbench/DESIGN.md` — tokens, type, spacing, motion, copy voice, and the plain-language rename table — so future sessions inherit the design instead of re-deriving it.

---
