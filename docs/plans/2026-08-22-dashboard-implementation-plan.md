# The Study — dashboard implementation plan
Date: 2026-08-22 · Product owner: Jesse (jestek@gmail.com) · Implementer: a Claude Code session in `/home/user/scripture-search-engine`
Ground truth: `plan-r1-repo.md` (repo reference, same directory) · UX research: `plan-r2-ux.md` · Prototype audits: `audit-static.md`, `audit-runtime.md`, `audit-v2-runtime.md`
Design source of truth: Jesse's prototype v2 — commit `5ba1096`, `prototype/Scripture Workbench/Curation Workbench.dc.html` + `DESIGN.md` ("The Study" tokens, rename tables, keyboard model)

---

## 1. Executive summary
This plan turns the workbench into **The Study**: one calm page where you search the
scriptures the way you actually would, see exactly what the engine returns today, and
strengthen those answers with your own judgment.

- **You search, results appear.** A real search bar at the top. Type "mercy" or
  "refuge in the storm", press Enter, and the engine's genuine current results appear —
  the same order everyone gets, never rearranged for you.
- **You make calls, one key or one click each.** On each result: Essential, Helpful,
  Not relevant, or Missing passage. J and K move through the list; every keyboard
  shortcut is also a visible button.
- **Your calls are saved the instant you make them — and take effect later, on
  purpose.** A call never moves a result while you watch. It is written to a permanent
  record, compiled into the search's answer sheet, run through the automated checks,
  and shipped in the next reviewed update that a human approves. The screen says this
  plainly and never pretends otherwise.
- **Changing a call on a result never erases anything.** A newer call replaces the old
  one and History shows both. A suggested passage can't be withdrawn; it is reviewed by
  a human before it ships.
- **Suggesting a missing passage is one small form.** Type a reference, watch the
  actual verse appear as you type so you know it's the right one, say how high it
  should rank, and add it — one verse per suggestion; if you typed a range, you pick
  the verse out of the previewed passage with one click. The same pick appears when
  you rescue a lower result that spans several verses — the record always names one
  exact verse — and every rescue first shows you the verse and asks one confirm, so
  a single keypress never records anything you didn't read. The blind comparison's
  final call gets the same one-confirm guard (§3.5) — nothing permanent ever rides
  a single keystroke.
- **What replaces what:** the 11-tab console landing page becomes this search-first
  page. Nothing is deleted — the full engineering console stays one click away behind
  "Advanced", and the old page remains the default until you personally flip the
  switch at the end.

---

## 2. Product scope & decisions
### 2.1 The goal, in Jesse's words
> "Just have a place to see the current results and strengthen them by having a human
> layer of voting and suggestions."

### 2.2 Key decisions made on Jesse's behalf
Binding for the implementer; deviations need a plan revision, not silent judgment calls.
1. **Votes are the existing judgment actions, in plain language.** A "vote" is a v2
   judgment (`essential`/`helpful`/`irrelevant`/`missing`), labeled Essential · Helpful
   · Not relevant · Missing passage per DESIGN.md's rename table. No new vocabulary, no
   scores, no stars. (`prefer` exists in the API but is not a main-flow vote.)
2. **Suggestions are the missing-passage flow**: one reference input with live verse
   preview via `GET /api/passage`, a "should show in top 1/3/5/10" choice, and one
   optional note inviting "other phrases people might type". One verse per suggestion
   (§3.3 — the server records one exact verse target). No taxonomy pickers.
3. **Engine order is sacred.** Results render exactly in `GET /api/search` order. Votes
   change chips and counters — never position, never visibility. No client-side sort,
   filter, or re-rank of the engine's list, ever.
4. **Honest effect timing, stated once per surface.** Calls are "saved the moment you
   make them" and "go in for review with the next reviewed update". Never "applied";
   never a promise that a call "ships" (a human approves what ships); never a preview
   of a would-be reordering.
5. **Search-first home.** The Review screen (search + results + why-rail) replaces the
   11-tab landing. Nav: Review · Compare · History · Finish up + a quiet right-aligned
   Advanced link to the preserved old console. During development the new page lives at
   `/study`; the flip (final item) swaps it to `/` and moves the old page to `/advanced`.
6. **Lazy case creation.** Searching never creates a case ("Looking something up never
   creates a case by itself" stays true). The first vote creates the case automatically
   (`POST /api/v2/cases`, source `manual`); a quiet "Add to my queue" button creates
   one without voting. Replaces the prototype's fake "started one" toast with real
   persistence. **"First vote" means any judgment-producing action — verdicts,
   missing-passage suggestions, and tail rescues; each lazily creates the case on a
   case-less query (POST `/cases` → snapshot → judgment POST, §4.6 race guard included)
   before its judgment POST.**
7. **Top-10 is the judging window; the tail is rescue-only.** Per `plan-r2-ux.md` §2
   and the server's own `REVIEW_WINDOW = 10` snapshot truncation: full verdicts exist
   only for ranks 1–10. Ranks 11+ collapse behind a divider and carry exactly one
   action, "Should be near the top", recorded as a `missing` judgment (accepted by the
   server because the reference sits outside the displayed top-10 window — and always
   posted as a resolved single verse: the engine mints multi-verse range references
   for collapsed anchor runs, which the server rejects, so range rows rescue through
   the §3.1 pick rule, never as-is). Every rescue — single-verse rows included —
   commits through the §3.1 rescue preview: read the verse, then one confirm; no
   rescue ever posts on the first keypress (§3.1).
8. **Undo is a superseding call.** A verdict key on an already-judged result records a
   new judgment with `supersedes`; U "reopens" locally and the UI says the earlier call
   stands until a new one is made. Nothing is deleted. Suggestions and tail rescues
   have no reopen affordance — there is no neutral/retract action in the API, and a
   `missing` judgment can only be superseded by another must-rank of the same
   reference — so their surfaces state the permanence plainly instead, **before the
   commit** (an uncorrectable action warns first; the receipt merely confirms —
   §3.1/§3.3) and again on the receipt.
9. **Both input methods are first-class.** Every shortcut has a visible button with its
   keycap chip; every button is Tab-reachable; the mouse can do everything. Letters,
   not R2 §1's digit keys: the E/H/X/M model is Jesse's own prototype design
   (DESIGN.md keyboard model), every button carries its keycap chip, and onboarding
   teaches the keys — the discoverability digits would buy is already covered.
10. **Fonts self-hosted, unmodified upstream woff2.** Literata + Source Sans 3 under
    `workbench/static/fonts/` with OFL.txt. No subsetting (subsetting counts as
    modification under OFL — `plan-r1-repo.md` §6). No CDN of any kind. D2 carries the
    verified-upstream-format contingency.
11. **Compare stays.** It is in Jesse's prototype nav, it judges candidate engines as
    whole result sets — not result-vs-result pairs — and the blind-session server flow
    already exists (`GET /api/v2/candidates`). R2's anti-pairwise advice targets
    per-result duels, which remain excluded (§2.3). Its A/B/T/W calls are permanent
    the instant they land (blind judgments are immutable — "This judgment is
    immutable.", index.html:3183), so they commit through the §3.5 one-confirm layer —
    the same slip-guard the tail rescue gets (decision 7), for the same motor-slip
    reason.

### 2.3 Explicitly out of scope
- Pairwise/duel voting and the `prefer` action in the main flow (R2: absolute verdicts
  only for a single reviewer; engine-level blind comparison is a different mechanic and
  stays — decision 11).
- Fixture promotion UI (needs a fresh gauntlet report; stays in Advanced).
- Admission / publish / sessions / quality / audits redesign — all remain in the old
  console behind Advanced, unchanged.
- The degraded typed-concept-ID interview fallback (absent from prototype v2; the old
  console retains the capability; §4.4 defines the unresolved-label behavior instead).
- Pericope one-tap expansion chips — no paragraph data in the artifact; the reference
  input previews whatever `GET /api/passage` resolves, but a multi-verse resolution
  requires picking a single verse before submit (the server records one exact verse per
  suggestion — §3.3).
- Book-name type-ahead in the reference input (R2 §3) — declined for v1: no endpoint
  exposes the book list (adding one would breach the two-mechanisms-only server rule,
  §4.2), and the abbreviation aliases `GET /api/passage` already accepts ("Ps 46:1",
  "Lam 3:22" — `pipeline/src/books.ts` abbreviations, e.g. :85/:116, compiled into the
  artifact's `book_aliases` table and resolved via the engine's `resolveBookAlias`,
  `engine/src/corpus/repository.ts:143–146`) plus the §3.3 live preview and
  failed-resolution recovery copy deliver the same error-prevention with less typing
  than full book names.
- Blind-comparison missing-passage entry (endpoint exists; not in the new Compare v1).
- Shipped-changelog with before/after rank diffs — **deferred with stated reasons**: a
  real diff requires persisting each judged query's full result list across artifact
  swaps and re-querying on next boot; v1 trust is carried by D38's update notice plus
  its "See how your reviewed searches rank now" re-search links and History's permanent
  record. The full diff card is the first post-flip work item.
- Streaks, badges, lifetime stats, any gamification (R2 §5 anti-recommendations).
- Session-end summary card — R2 §5 recommends one; deliberately not built: Finish up's
  four stat tiles already show the same counts on demand across all open cases, so a
  second summary surface adds chrome without new information.
- Narrow/mobile layout below 1024px; i18n; multi-reviewer anything.
- Any new server-side aggregation, ranking signal, or judgment semantics.

---

## 3. UX specification
Copy in quotes is exact and ships verbatim unless a work item says otherwise. Rename
tables (7 case sources, 11 states, verdicts) come from prototype DESIGN.md and match
the server's enums exactly (`plan-r1-repo.md` §3 + misc facts).

### 3.0 Global design system
- Tokens: the full light/dark token block transcribed from prototype `dc.html:14–38`
  (commit `5ba1096`) as `:root` / `[data-theme="dark"]` blocks — a **superset of
  DESIGN.md :13–37**: all DESIGN.md tokens plus `--v-affirm-wash` / `--v-notrel-wash` /
  `--v-missing-wash`, `--caret`, `--r-ctl:6px` / `--r-panel:10px`, and the concrete
  light `--shadow: 0 1px 2px rgba(29,28,24,.06), 0 6px 20px rgba(29,28,24,.07)`
  (dark: `none` — borders replace shadows). Radii 6px controls / 10px panels; spacing
  4/8 scale; type scale 11/12/13/16/20/25.
  **Four token values deviate from the prototype, fixed here and pre-approved** (D1
  logs them in DESIGN.md's Deviations with these measured WCAG ratios, so the
  committed token table already carries the passing values and the D5-landed
  contrast audit is green from day one): light `--text-3: #6E695E` — the
  prototype's #847F73 measures 3.92:1 on `--panel` and 3.85:1 on `--surface`,
  failing AA 4.5:1 on the very tier this plan sets safety copy in (the §3.1
  tail header and §3.3 permanence lines); the replacement measures 5.37 / 5.28 /
  4.97:1 on panel/surface/ground. Dark `--text-3: #948E81` — replaces #8A8478
  (4.47:1 on `--panel`); the replacement measures 5.10 / 5.35 / 5.71:1 on
  panel/surface/ground. Light `--v-affirm: #2C734D` — the prototype's #2F7A52
  measures 4.4966:1 over its own wash (`--v-affirm-wash` rgba(47,122,82,.10))
  composited on `--panel`, failing AA 4.5:1 for the 12–13px judged-chip text that
  renders on exactly that ground (D35's verdict-over-own-wash pair); the
  replacement measures 4.94:1 over its wash, 5.63:1 on `--panel`, 5.53:1 on
  `--surface`. Light `--v-missing: #80621B` — the prototype's #8C6C1E measures
  4.2552:1 over its wash (rgba(140,108,30,.10)) on `--panel`, a clear fail; the
  replacement measures 4.95:1 over its wash, 5.61:1 on `--panel`, 5.51:1 on
  `--surface`. Light `--v-notrel` (#A6493D, 4.99:1 over its wash) and the entire
  dark verdict column (≥5.45:1 over their washes) already pass unchanged and stay
  verbatim. **One token is added beyond the prototype's set**: `--control-border` —
  light `#8F897C` (3.36:1 vs `--surface`), dark `#6B6558` (3.01:1 vs `--surface`) —
  used ONLY on text inputs (the search bar, the §3.3 reference input, the §3.7
  sign input) and the top-N segmented picker's selected-state boundary, so those
  interactive boundaries meet WCAG 1.4.11 (D35(b)) while `--hairline-strong`
  stays the quiet decorative divider/card-edge line the design language calls
  for; also logged in D1's Deviations. **`--text-faint` is reserved for WCAG-exempt text only**
  — disabled control labels and purely decorative glyphs (light #A9A398 measures
  2.42:1 on `--surface`; dark #67635A, 2.91:1); it never carries
  information-bearing copy — the Advanced nav link and every hint sentence use
  `--text-3` or better — and pairs.json lists `--text-faint` pairings under an
  `exempt: true` field the audit's ratio check skips (D35).
- Type: Literata (variable, regular + italic) ONLY for scripture, the done state, the
  Compare reveal, the signing chip, and the header wordmark — the prototype renders
  "The Study" in Literata at 15px (dc.html:54); full stack everywhere Literata
  appears: `"Literata", Georgia, serif` — the named serif fallback that carries the
  fonts-404 path §4.7 promises. Verse setting 17.5px / 1.65 / max 68ch, verse
  numbers as raised sans `sup`. Chrome sans Source Sans 3, base 13px, fallback
  `-apple-system, "Segoe UI", sans-serif`. Mono `ui-monospace, "SF Mono", Consolas` —
  Advanced screen only.
- Focus ring, verbatim from the prototype (dc.html:45): `:focus-visible { outline:
  2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }` — this
  outline is the affordance D35's WCAG 1.4.11 non-text check measures against every
  background it appears over.
- Color: hierarchy from hairlines + text tiers, not colored boxes; teal only on primary
  actions; verdict colors only on verdict elements.
- Motion: one animated moment — toast rise, 200ms `cubic-bezier(0.16,1,0.3,1)`;
  everything else instant; `prefers-reduced-motion` kills all animation/transitions.
- Dark background painted on `html`/`body` via tokens (the prototype painted an inner
  div only — `audit-v2-runtime.md` §3; fix it).

### 3.1 Home — Review screen (search & results)
Layout: 3-column grid `300px / minmax(0,1fr) / 320px` (queue rail · passage pane ·
why-rail). Header: wordmark, nav (Review · Compare · History · Finish up), right-aligned
"Advanced" link, "Look something up ⌘K" button, theme cycler `☀ Light / ☾ Dark / ◐ Auto`.

**Search bar** (top of center pane, `role=search`): input aria-label "Search the
scriptures", placeholder "Search the scriptures…", teal "Search" button. Submit (Enter
or button) calls `GET /api/search?q=…` — no per-keystroke search here (⌘K is the
live-typing surface). **A blank or whitespace-only submit is a client no-op**: no
request fires, no error shows, focus stays in the input. (The server 400s a blank
`q` with plain-JSON `{error}` — `server.ts:1724–1737` — a shape §3.11's search
mapping deliberately does not cover: the no-op keeps that branch unreachable
instead of mapping copy to a state the reviewer can't act on. ⌘K never sends it
either — its live search has a 3-char minimum, §3.12.) By `result.kind` (the engine returns exactly three kinds —
`discovery`, `reference`, `invalid-reference`; "empty" is a discovery with zero
results, not a kind):
- `discovery` with results → the results list below.
- `discovery` with zero results → empty state: "No results for "{q}"." + "Know a
  passage that should answer this? Add it." with an "Add the missing passage" button
  opening the suggestion form (§3.3) pre-linked to this query.
- `reference` → passage read-only with "That's a direct passage lookup — nothing to
  judge here. Search words or phrases to judge results."
- `invalid-reference` → inline message: ""{q}" looks like a verse reference, but no
  passage matches it — check the book name, chapter, and verse (e.g. "Psalm 46:1")."
  The query stays in the search bar; no results list renders. (No "search as words"
  link — `/api/search` offers no way to bypass the engine's reference short-circuit.)

**Pre-search / boot state (binding)**: on boot with no open case, the center pane
shows the search bar over the effect-timing contract sentence and nothing else — no
result cards, no tail, no verdict toolbar (§3.2's visibility gate), and no
`/api/search` request fires before the first submit. With open cases, the first open
case in the boot `GET /api/v2/cases` list (first in the §3.6 client-sorted order —
most recently touched, by latest `events[].at`; the raw response is caseId-ordered,
`cases.ts:424–426`, and must not be used as-is) loads exactly as if its queue row
were clicked (§3.4 — case
fetches + live tail search, rail header and search input synced). `study.ui.v1`'s
`lastQuery` (§4.9) does exactly one thing: it pre-fills the search input's **value**
on the no-open-case boot — it never auto-submits and never fetches. D5 asserts the
boot state; D24 asserts the open-case boot.

**Post-search focus handoff (binding)**: on a discovery search that returns results
(Enter, the Search button, or a ⌘K row selection), when the results render, DOM focus
moves from the search input to result card #1 — the roving-tabindex stop; when the
query has an open case, to the first unjudged card — and the input keeps its value.
Without this rule J/K fail right after the first search: browser default leaves focus
in the input, and §3.12 suppresses single-letter shortcuts while typing in an input —
J would insert "j" into the search bar, breaking the onboarding promise "J and K
move". The `reference` and `invalid-reference` kinds, and a zero-result `discovery`
(no card to move to), leave focus in the input — the reviewer's next act there is
retyping. This mapping is a §3.12 table row, so D34's per-row audit covers it.

**Results list — the long-list rule** (`plan-r2-ux.md` §2):
- **Top block = ranks 1–10** (or all, if fewer): cards with rank badges (`#1`–`#3`
  large/high-contrast, `#4`–`#10` normal; card spacing steps down slightly after #3).
  **An unfocused top-block card shows**: rank badge · reference (sans, 13px) · the
  excerpt on one line, ellipsized · the judged chip or verdict dot when judged. The
  reason pill, full verse text, `sup` verse numbers, attribution, and why-rail binding
  appear only on the focused card (the why-rail also follows a focused tail row —
  the read-before-rescue binding below; card *expansion* stays top-block-only).
  Exactly one card is focused/expanded at a time; J/K
  collapses the previous card and expands the next.
- **The focused card** expands into the verse panel: Literata reference heading,
  "Result {i} of {n} for "{q}"" — where **n = the total number of results the engine
  returned (top block + tail) and i = the focused card's rank** — verse text with `sup`
  verse numbers, attribution "King James Version".
  **Verse-body source (binding — `DiscoveryResult` carries no per-verse data, so
  the `sup` markers need a named source)**: the verse body is fetched via
  `GET /api/passage?ref={result.reference}` when a card gains focus — its
  `passage.verses[]` carry `verse` numbers for the `sup` markers, and a range
  reference resolves to all member verses, each rendered with its own `sup`. This
  is the only source that can place the markers: a result's `excerpt` is bare
  `verse.text` (`engine/src/createEngine.ts:362`), and for a **collapsed anchor
  run** — `collapseAnchorRuns`, `createEngine.ts:594–677`, which merges adjacent
  anchor-run verses anywhere in the ranked list into one result whose reference is
  a range like "Psalm 23:1-4" — it is the run's verses joined with single spaces
  and no boundaries (`createEngine.ts:669`). Concept-anchor runs rank high by
  design, so this hits the top block routinely, not rarely. While the fetch is in
  flight, the excerpt renders as the placeholder: a single-verse result shows it
  with the reference's verse number as the one `sup` (for one verse the excerpt IS
  the verse text, so this rendering is already complete); a multi-verse result
  shows the joined excerpt with no `sup` markers. On fetch failure that excerpt
  rendering simply stays — no `sup` markers on a run, the reference-derived single
  `sup` on a single verse — with no error state (the card is still readable; §3.11
  is not invoked). The fetch fires on every focus, uniformly — one code path, and
  its resolution is reused by the §3.1 range-rescue detection, the §4.4 rescue
  resolution, and the §3.3 range pre-check. Stale responses are dropped via the
  same request-sequence counter as search (§4.3). The §3.1 highlight rule below
  applies to the fetched verse text identically. **Highlighting is
  whole-word, punctuation-tolerant literal emphasis, never tokenization**: the
  client collects
  quoted fragments from the result's lexical reason labels — a label of exactly
  `Exact phrase` contributes the query string itself; a label matching
  `Contains "{fragment}"` contributes the fragment (both minted at
  `engine/src/intents/lexical.ts:61`; they ride family `exact_phrase` or
  `token_overlap`) — and wraps occurrences matched by a **punctuation-tolerant
  literal regex**: split the fragment on whitespace, regex-escape each word, join
  with `[^\p{L}\p{N}]+`, and wrap the whole pattern in Unicode boundary guards
  `(?<![\p{L}\p{N}])` … `(?![\p{L}\p{N}])`, flags `giu` — so the fragment
  "mercy and truth" marks "mercy, and truth" in the verse, and whole words never
  mark inside longer words. The guards carry the most common query class: a
  single-word query like "love" mints label `Exact phrase` (`lexical.ts:50–61` —
  a fragment covering the whole query is `complete`), so the rule contributes the
  query string itself, and without the guards the bare pattern `/love/giu` would
  mark the "love" inside "loveth", "lovely", and "beloved" — all common in KJV
  (1 John 4:7 holds "love", "loveth", and "Beloved" in one verse) — while a
  multi-word fragment's first/last words would mark prefixes like "truthful".
  This matters constantly, not rarely: the engine's
  phrase evidence comes from FTS5 phrase matching over raw verse text
  (`engine/src/corpus/repository.ts:202–207`), which ignores punctuation between
  words, and KJV text is dense with mid-verse commas and semicolons — a plain
  substring match would silently render zero highlights on a large class of results
  whose reason label quotes the very fragment the reader then cannot find marked.
  Matches render in `<mark>` styled `--highlight`. This is display emphasis only: no
  tokenization, no vocabulary, no effect on ordering, visibility, or judgments. Zero
  regex matches ⇒ zero highlights, never a guess — this also covers the
  fragment-path `Exact phrase` case, where the engine matched a stopword-trimmed run
  covering all significant words rather than the full query (minted at
  `engine/src/createEngine.ts:185–203` + `lexical.ts:50`), so the raw query string
  may legitimately match nothing. (The engine's response carries no span data —
  `DiscoveryResult` is `{targetId, reference, excerpt, score, reasons}` only.)
- **Tail = ranks 11+**, collapsed behind one divider button (a disclosure: it carries
  `aria-expanded` reflecting its state and `aria-controls` naming the tail list
  container — asserted in D35): "Lower results ({n}) —
  most people never scroll this far. Skim them only to rescue anything that deserves
  the top." Expanded tail rows are compact (rank, reference, one-line snippet) with
  exactly one action, "Should be near the top", on **E or the row button — Enter
  does nothing on a tail row**. (Enter means open/activate everywhere else in this
  UI — divider expand, search submit, ⌘K select, picker select — so it must not
  double as an uncorrectable commit one habitual keystroke past the divider; the
  verse already reads in the rail, so Enter has nothing left to open. §3.12.) No
  verdict buttons in the tail.
  **Every rescue commits through the rescue preview layer — read, then one
  confirm (binding)**: "Should be near the top" (E or the row button) ALWAYS opens
  the rescue preview layer; **no tail rescue ever posts on the first keypress**.
  The reason is a motor-slip, not a belief: the top block trains the reviewer
  dozens of times per session that E is safe and reversible (every verdict chip
  carries Undo), so one J past the divider the same key must not silently become
  an uncorrectable commit — the tail header's warning sentence addresses wrong
  beliefs, not slips of a habituated key — and whether a row is a collapsed run
  is invisible in its compact form, so E's behavior must be uniform to be
  predictable. Two modes, one shared component (built in D18, extended in D20):
  - A **single-verse row** opens the preview showing its one verse (resolved via
    `GET /api/passage` — the §4.4 resolution, reused when already held, else
    fired on open per the resolution-timing rule below) with the
    button "Confirm — should be near the top".
  - A **range row** — a collapsed anchor run: `collapseAnchorRuns`
    (`engine/src/createEngine.ts:594–677`) mints range references like
    "Psalm 23:1-4" anywhere in the ranked list (it runs over limit + headroom
    = 50 candidates before the slice to 25, `createEngine.ts:347–369`) — cannot
    be rescued as-is: the server records one exact verse
    (`resolveReferenceTargetId`, `server.ts:586–591`, `verses.length === 1`;
    `judgments.ts:512–515` rejects the rest 400). Its preview is the §3.3
    pick-chip mode, pre-filled with the row's reference (fetched via
    `GET /api/passage`, reusing the focused-card resolution when present) and
    with the run's **first verse — the verse the row's `targetId` addresses
    (`createEngine.ts:653–656`) — pre-selected** as the default chip; the same
    "Confirm — should be near the top" button commits the picked verse.
  Confirming posts the shown/picked verse's canonical single-verse
  `passage.reference` with `withinTop:10` (§4.4); the §3.3 pre-commit permanence
  line renders inside the layer in **both** modes; Esc/Cancel closes the layer
  with nothing posted (it rides the missing-form slot in the §3.12 Esc order and
  focus contract); and the rescue receipt names the confirmed verse. Mode
  detection is client-side: a reference containing "-" is the cheap pre-signal,
  and the `GET /api/passage` resolution (`passage.verses.length`) is
  authoritative. **Resolution timing (binding)**: pressing E (or the row button)
  fires the row's `GET /api/passage` resolution if not already held (the §3.1
  focused-card resolution is reused when present) and opens the preview
  immediately — focusing a tail row fires only `/api/v2/context` (the
  read-before-rescue binding), so at the moment the preview opens the passage
  resolution has usually not yet run. While the resolution is in flight the layer
  shows "Loading the passage…" with Confirm disabled. If the resolution fails, the
  layer shows the §3.11 search-error sentence ("The engine did not answer. It may
  be restarting — try again in a moment.") with a Retry button that refires the
  resolution; Confirm stays disabled and Esc/Cancel still closes with nothing
  posted. A rescue never posts an unresolved reference — the raw
  `DiscoveryResult.reference` reaches no POST body on any branch (for a collapsed
  run like "Psalm 46:1-3" the raw string is a range the server 400s,
  `judgments.ts:512–515`, surfaced only as the generic §3.11 toast — the exact
  dead end this branch spec exists to close). **A rescue confirm answered 400 `validation_failed` whose
  `error.message` contains "already present in the judged result set" closes the
  preview layer, then runs the §3.3 already-displayed recovery** — focus the
  matching top-block card and show the same toast ("That passage is already in
  the results — judge it there instead."); this branch is reachable only when the
  live tail and the judging snapshot disagree (§4.6 mismatch branch): the verse
  sits in the tail of the live list but inside the top-10 of the judging
  snapshot, so the server's already-present check fires. Without this rule the
  recovery would be undefined with the layer still open — "scroll to that card"
  names no behavior for closing it — and the generic §3.11 toast would fire
  behind a modal.
  **Read before rescue (binding)**: a rescue is uncorrectable, so the surface
  must show the reviewer the text being judged before the commit — never just
  the ellipsized snippet. Focusing a tail row (J/K or click) rebinds the
  why-rail to that row exactly as a top-block card does (tail rows are full
  `DiscoveryResult`s, so the Why tab's renderer applies unchanged) and loads the
  row's full verse into the Context tab via
  `GET /api/v2/context?ref={row.reference}`; when focus first enters the tail,
  the rail fronts the Context tab (J/K within the tail then keeps whichever tab
  the reviewer chose, both tabs tracking the focused row). Rows themselves stay
  compact per R2 §2 — the passage reads in the rail, so the reviewer always
  reads the actual verse before "Should be near the top" without abandoning
  their place via ⌘K.
  **Permanence, disclosed before commit**: the expanded tail's header — directly
  under the divider button, in `--text-3`, visible before any rescue is taken —
  reads: "A rescue is recorded like a suggestion — it can't be taken back here." (A
  rescue is an uncorrectable action one confirm away, so the warning must precede
  the commit, not follow it — and the §3.3 permanence line renders again inside the
  preview layer itself, where the reviewer's eyes are at commit time.) Rescue toast:
  "Noted — {ref} should rank
  near the top for "{q}". Saved to your calls for the next reviewed update." — for
  a range rescue, {ref} is the picked verse's canonical reference, never the range
  string. The
  rescued row's receipt chip carries the permanence sentence: "A suggestion can't be
  taken back here — you'll see it again in Finish up before anything is written, and
  a human reviews every change before it ships."
  **J/K at the tail boundary** (binding; also noted under §3.12): J on the last
  top-block card while the tail is collapsed moves focus to the divider button
  (Enter or Space expands it); once expanded, J from the divider enters tail row #11
  and K from row #11 returns to the divider; K from the divider returns to card #10.
  J on the last expanded tail row does nothing. K on card #1 does nothing — no
  wrap. With 10 or fewer results there is no divider: J on the last card does
  nothing. Plain J/K navigation never wraps; only commit auto-advance (§3.2)
  wraps.
- **Judged-state chips**: a judged card's verdict buttons become a colored chip — "Your
  call: Essential (top 3)" / "Your call: Helpful" / "Your call: Not relevant" / "Added
  as missing (top {n})" — with an inline "Undo" link. The chip's Undo link carries
  `aria-label` and `title` "Undo — nothing is erased: your call stands until you make
  a new one." (the visible label is Jesse's prototype vocabulary and stays; the
  qualifier rides the affordance so a user reaching it cold — the common path for a
  later correction — is not surprised by the reopened-but-still-standing state).
  Prior-session calls read "Your
  call from {relative date}: {label}". Queue rows get a verdict dot with **three**
  aria states: "Judged {label}" / "Not judged yet" / "Reopened — your earlier call
  stands" (§3.2 reopen).
- **Done = top-10 judged.** The per-query counter ("{n} to go" / "done") counts only
  the top block; the tail never blocks completion.
- **Effect-timing contract**, once per surface, as the results-rail footer: "Your calls
  are saved the moment you make them. They change search results only in the next
  reviewed update — never while you work." (Also in the empty state and onboarding;
  never as a per-vote toast.)
- No case yet for this query → header hint "New search — your first call starts its
  case." + quiet button "Add to my queue".
- Data changed under an open case (§4.6) → banner, **copy split by branch** so it
  never misdescribes what is on screen: after a 409 recovery that re-rendered the
  fresh snapshot (the list shown IS current): "The engine's data changed since this
  case was opened. The results below are the current ones — earlier calls stay on
  record." After an agreement-check failure where the snapshot list wins for judging
  (the list shown is the one the case was opened on, §4.6): "The engine's data
  changed since this case was opened. The results below are the ones this case was
  opened on — earlier calls stay on record."

**Why-rail** (right; tabs "Why this ranked" / "Context"). Why: label:value rows —
Search / Named by ("No theme names this verse — it matched on wording alone" when
null) / Matched / Came from — plus one reason pill ("Matched the meaning" · "Shares key
words" · "Close in meaning") and footer "This explains the engine's reasoning. Your
call decides whether it was right." **Pill mapping (binding — an unguessable mapping
is a covenant rule-5 failure, so it is written down here)**: the pill derives from
the **family of the result's highest-points reason** (results carry multiple
reasons; ties break by the reasons array order, first wins). Families per
`engine/src/reasons/types.ts:20–32`: `concept_anchor` → "Matched the meaning";
`exact_phrase`, `token_overlap`, `proximity` → "Shares key words";
`concept_lexicon`, `translation_variant`, `passage_terms`, `cross_reference`,
`co_citation` → "Close in meaning". (The tenth family, `reference`, never appears on
discovery results — a parseable reference short-circuits to the `reference` kind,
§3.1.) This table is recorded in `workbench/DESIGN.md` (D1) so Jesse reviews the
wording against the covenant's no-interpretation rule. **Matched** = the quoted fragments extracted per
the §3.1 highlight rule (`Exact phrase` ⇒ the query itself; `Contains "{fragment}"` ⇒
the fragment); when no such reason exists, render "—". Other fields = what the old
Review tab renders (consult `workbench/static/index.html`); concept ids → labels via
the boot `GET /api/concepts` cache. Context: `GET /api/v2/context?ref=…` (±2 verses),
Literata, focused verse highlighted.

### 3.2 Voting on a result
**Verdict toolbar** (fixed bottom-center pill): `[E] Essential` (teal, fused with a
"top 1 · 3 · 5 · 10" segmented picker) · `[H] Helpful` · `[X] Not relevant` (hover turns
`--v-notrel`) · `[M] Missing passage`. Every key is a keycap chip on its button.
- **Toolbar visibility & the M gate (binding)**: the verdict toolbar (and the M
  shortcut) is active only while a discovery search with a non-empty query is on
  screen — the results list or its zero-result empty state (there the
  Missing-passage button is the live control; E/H/X are focused-card actions and no
  card exists). The toolbar does not render in the pre-search state or on
  `reference` / `invalid-reference` views, and it hides while an interview,
  suggestion form, rescue preview, bulk selection, or onboarding layer is open. In
  the states where it is absent (pre-search, `reference`, `invalid-reference`), M is
  inert and shows the hint toast "Search words or phrases first — a suggestion
  attaches to the search that misses it." — no form opens, nothing posts. The gate
  is load-bearing, not cosmetic: before any search the §3.3 form title has no {q}
  (broken copy) and its lazy case create would be rejected by the server ("Case
  query must be non-empty text.", `workbench/src/reviewCases.ts:99–101`), surfacing
  only the generic §3.11 toast a non-engineer cannot act on; and on a
  `reference`-kind view ("nothing to judge here") a suggestion would attach to a
  query the engine short-circuits away from discovery — a fixture no discovery
  search exercises, weight without value against CLAUDE.md's own adding-data rule.
  This mapping is two §3.12 table rows, so D34's per-row audit covers it; D20
  asserts the inert branches directly.
- E commits `essential` at the picker's current value (persisted, default 3). H commits
  `helpful`. The picker is a **Tab-reachable radiogroup**: Left/Right arrows move the
  selection between 1/3/5/10 — selection follows focus, the standard WAI-ARIA
  radiogroup pattern, so an arrow press alone changes the value the next E commits
  (D12 pins this); Space also selects the focused segment; it is also clickable (both
  input methods first-class, decision 9).
- Commit → toast "Marked {ref} Essential (top {n})" for Essential — n = the picker
  value that rode the POST, named in the receipt because the picker persists across
  sessions and focus has already auto-advanced, so the toast is the only immediate
  receipt of a possibly-stale top-N (the honest-receipt contract has no silent
  moment) — and "Marked {ref} {label}" for Helpful / Not relevant; each with inline
  "Undo [U] — your call stands until
  you choose a new one" (6s auto-dismiss; the truth is on the affordance itself: the
  POST has already happened, and U records nothing until a new call replaces the old);
  focus auto-advances to the next unjudged top-block row, wrapping.
- A verdict key on an **already-judged** card records a superseding judgment (§4.5);
  toast: "Replaced your earlier call — {ref} is now {label}." — an Essential {label}
  renders "Essential (top {n})" here too, same rule.
- **U / Undo** (verdicts only — Essential/Helpful/Not relevant; suggestions and rescues
  show the permanence note instead, §3.3/§3.12): chip becomes "Reopened — your earlier
  call stands until you make a new one."; the row joins the **reopened count** (shown
  separately — §3.4 — because the earlier call is still active in the log and still
  compiles); the next verdict posts with `supersedes`. **Binding — undo retargets
  focus**: U — and clicking a chip's inline Undo link — moves DOM focus to the
  reopened card (it becomes the expanded/focused card), so the next verdict
  keypress or toolbar click applies to it; the reviewer's J/K position is
  otherwise unchanged. (Without this rule the primary undo-then-correct journey
  commits to the wrong verse: commit auto-advances focus to the next unjudged
  card, so a U-then-H sequence — the exact correction the toast copy invites —
  would mark the *advanced-to* card, not the reopened one.) History line (written when the
  replacing call lands): "Reopened {ref} — the earlier call stays on record, replaced
  by this newer one". If the session ends reopened-but-unreplaced, the old call stands
  — exactly what the chip said, and exactly what Finish up shows (§3.7).
- **Bulk bar**: checkboxes on top-block rows (Space toggles on the focused row);
  floating bar "{n} selected · Mark all helpful · Clear". **Judged rows' checkboxes are
  disabled** (aria-label "Already judged — change it on its card") so the selection
  count always equals the commit count — the bar never says "3 selected" and posts 2.
  **Bulk receipt**: the serial batch commit ends with one toast — "Marked {n}
  passages Helpful." — with no inline Undo link (each judged card's chip carries its
  own Undo); after a bulk commit, U targets nothing and shows a hint toast "Change a
  bulk call on its card." (the honest-receipt contract has no silent moment).
  **If any POST in the serial batch fails, the batch stops at the failure**; the
  receipt reads "Marked {k} of {n} — the rest did not save. Try them on their
  cards."; only the k committed rows show judged chips, and the remaining
  checkboxes (the failed row included) stay selected. Neither the all-success
  receipt ("Marked {n}" would overstate — n selected, k saved) nor the generic
  §3.11 "nothing was saved" toast (k rows DID save) is honest for a partial batch,
  so the partial receipt is its own specified state, never a fallthrough.

**Not-relevant interview** (opens on X; modal over the verse panel; layer focus
contract per §3.12):
- Auto mode (no concept evidence): "This looks like a word match without the meaning —
  "{matched}" appears, but the verse is about something else. Mark it not relevant?" →
  "Yes — not relevant" / "Cancel". **{matched}** = the first fragment per the §3.1
  highlight rule; if no lexical fragment exists despite absent concept evidence, use
  the no-quote fallback verbatim: "This looks like a word match without the meaning —
  the verse is about something else. Mark it not relevant?"
- Concept mode, two steps: (1) "This verse ranked because it is listed under the theme
  "{namedBy}." Does {ref} really speak about that?" → "Yes, it does" / "No, it
  doesn't". (2, after "Yes") "Then is it just not a good answer for "{q}"?" →
  "Right — not a fit here" / "Actually, keep it".
- **Concept mode requires a why, before commit**: choosing a committing answer ("No,
  it doesn't" or "Right — not a fit here") reveals one required free-text field
  labeled "Say why, from the text — this goes to the theme files for review." plus a
  confirm button ("Mark not relevant") that stays disabled while the field is empty;
  Cancel still exits without posting. The text rides the POST as `note` — the server
  rejects wrong-anchor and concept-misfire judgments without one
  (`judgments.ts:558–559`: "A '{diagnosis}' judgment implies ontology work, so it
  needs a note defending it from the text."), exactly as the old UI enforced
  (index.html:2192–2197). On the wrong-anchor path History adds "— "{namedBy}" queued
  for review in the theme files".
- Demotion disclaimer verbatim below: "It is demoted out of the top results for this
  query only — the verse stays in the corpus and every other search."
- **Required fixes** (`audit-v2-runtime.md` §3): Escape closes the interview without
  committing, from any focus position. While it is open, J/K/arrow navigation is inert
  (the interview is modal) — it must never silently discard the interview or desync the
  described item. Both modes carry a visible Cancel affordance (concept mode gains a
  small "Cancel (Esc)" link; auto mode already has Cancel).

### 3.3 Suggestion flow (missing passage)
Opens via M, the toolbar button, the empty-results button, or a persistent low-key
"Missing a passage?" link pinned after the top block. Every entry point exists only
while a discovery search with a non-empty query is on screen (§3.2's toolbar gate):
in the pre-search state and on `reference` / `invalid-reference` views no entry
point renders and M shows the §3.2 hint toast instead of this form — so the "{q}"
in the prompt below is always a real, non-empty discovery query. Layer focus
contract per §3.12 (focus lands on the reference input on open).
- Title "Add a passage that should be here". Prompt "Which passage is missing for
  "{q}"?" — input placeholder "e.g. Lamentations 3:22".
- **Live preview**: debounced 250ms `GET /api/passage?ref=…` as you type; on resolve
  the actual verse(s) render in Literata below the input; while unresolved: "The
  passage appears here as you type, so you can check it is the right one."
  **Failed resolution is never silent**: when the input is non-empty and no
  `GET /api/passage` resolution has succeeded for 1.5s after the last keystroke, the
  waiting line is replaced with: ""{input}" doesn't match a passage yet — check the
  book name, chapter, and verse (e.g. "Psalm 46:1"). Abbreviations like "Ps 46:1"
  work too." (Abbreviation support is real — the pipeline alias table — and some
  inputs are refused on purpose: "Jud" is deliberately ambiguous between Jude and
  Judges and resolves to nothing, `pipeline/src/books.ts:254–256`; a typo must get
  recovery copy, not the permanent silence of a forever-disabled Submit.)
- **Single verses only** — the judgment record pins one exact verse: the server
  resolves a missing reference to a target only when the passage has exactly one verse
  (`server.ts` `resolveReferenceTargetId`, `verses.length === 1`) and rejects anything
  else with `validation_failed`. When the typed reference resolves to **more than one
  verse** (a range or chapter — worship leaders think in passages, R2 §3), the whole
  passage still previews, but each verse in the preview becomes a clickable "Add this
  verse" pick chip and Submit stays disabled until one verse is chosen; copy under the
  input: "Pick the one verse that should rank — suggestions are recorded one verse at
  a time." Picking a chip re-resolves that verse alone via `GET /api/passage` so the
  submitted reference is a canonical single-verse label.
- **Canonical reference rule**: the POST body's `reference` is always the canonical
  resolved label returned by the `GET /api/passage` preview (`passage.reference` of the
  single-verse resolution), never the raw typed input — supersede target keys
  (`reference:{string}`, `judgments.ts` `v2TargetKey`) and the duplicate pre-check
  compare this exact string.
- "Should show in top" segmented 1/3/5/10. "Optional note" — placeholder: "Optional —
  e.g. other phrases people might type to find this." (the phrases-people-might-type
  capture; rides the judgment's `note` field into curation review).
- Submit "Add this passage to the answers" — disabled at 0.45 opacity until a single
  verse is resolved (or picked). Cancel and Escape close the form (Escape already works
  from inside the input in the prototype; keep it).
- **Enter in the reference input** (a §3.12 table row, so D34's per-row audit covers
  it): activates Submit only when Submit is enabled — a single verse resolved or
  picked, so the verse has by then rendered in the preview and Enter-when-enabled is
  always post-preview; while Submit is disabled, Enter is a no-op. The form is never a
  native `<form>` element, so no raw browser submit can fire — Enter is the most
  habituated key in this UI (it already submits the search bar, ⌘K, and the sign
  input), and this is the one surface whose commit can't be taken back here, so the
  §1 guarantee ("a single keypress never records anything you didn't read") holds by
  construction, not by hope.
- **Permanence, disclosed before commit**: below the Submit/Cancel row, always
  visible while the form is open, in `--text-3`: "A suggestion can't be taken back
  here — you'll see it again in Finish up before anything is written, and a human
  reviews every change before it ships." A wrong suggestion can never be corrected in
  the UI (the only supersede the server accepts for a `missing` judgment is another
  must-rank of the same reference — §4.5), so the warning must precede the POST; the
  same sentence repeating on the post-submit receipt card is confirmation, not
  disclosure.
- Reference already displayed in the top-10 window: **client pre-check** against the
  displayed cards' canonical references → toast "That passage is already in the
  results — judge it there instead." and focus scrolls to that card, no POST. A
  displayed card whose reference is a **range** (a collapsed anchor run, §3.1) is
  compared by its member verses, resolved once via `GET /api/passage` on demand —
  the focused-card resolution (§3.1) is reused when already fetched; a
  single-verse string-compare against a range label would silently miss. The
  server-message fallback below still catches any miss.
  **The client pre-check also runs against the fetched tail (ranks 11+)** — the
  client already holds it in memory (§4.3 fetches ranks 11+ on every case open and
  on every live search): a typed reference resolving to a verse whose canonical
  reference matches a tail row (range rows compared by member verses, same
  resolution rule) closes the form, expands the divider if collapsed, scrolls
  focus to that row, and toasts "That passage is already in the lower results —
  rescue it there instead." — no POST. The server cannot catch this case: its
  already-present check runs only against the top-10 snapshot (`reviewCases.ts:83–85`
  slices to `REVIEW_WINDOW`; `judgments.ts:516–517`), so without this one array
  scan the POST would succeed, recording a "missing passage" for a verse the
  engine did return and producing a different History phrasing than the rescue
  path for the identical intent.
  **Server-side detection**: a 400 `validation_failed` whose `error.message` contains
  "already present in the judged result set" is treated as the same already-displayed
  case (same toast + scroll); any other `validation_failed` falls through to the §3.11
  generic toast. A code comment notes this string is coupled to `judgments.ts` and
  covered by Playwright assertions in D20 (form path) and D18 (rescue-confirm
  path, §3.1).
- After submit: a distinct **"Your suggestion"** receipt card at the end of the top
  block — no rank badge, visibly not an engine result — with reference, excerpt, and
  two lines: "Saved to your calls. It goes in for review with the next reviewed
  update." and "A suggestion can't be taken back here — you'll see it again in Finish
  up before anything is written, and a human reviews every change before it ships."
  Pressing U while the suggestion toast/receipt is the target posts nothing and shows
  the permanence sentence (§3.12).

### 3.4 Waiting queue & next-search chaining
Left rail, under the active list:
- Active header: uppercase "Results for "{q}"" + counter chip "{n} to go" / "done";
  when any rows are locally reopened the counter reads "{n} to go · {r} reopened".
  Rows: checkbox + reference + source meta + verdict dot (three aria states, §3.1).
- "**Waiting in your queue**": one button per other open case, rows in the §3.6
  client-sorted order (most recently touched first — never the server's caseId
  order), with judged count
  "{j}/{m}"; clicking switches the active query (search bar syncs, first unjudged row
  selected) exactly like a successful search — including the live tail fetch (§4.3
  "Open existing case"). With no open cases, the queue section shows "Nothing waiting —
  search for something you would actually type."
  **"Open case" — the one definition, used here, by §3.7's tiles and pending
  banner, and by the §4.3 counts row**: `state ∈ {new, reviewing, judged}`. A
  judged case stays open until its calls are compiled (the §3.7 changed-set says
  when; v1 approximates by treating all judged cases as open, and closes the loop
  after every successful signing: the §3.7 post-apply re-preview drops
  fully-written cases from this queue and from the Finish-up tiles, so "Waiting"
  never accumulates cases that are not waiting) — so a
  just-completed case, auto-transitioned to `judged` (§4.3), still shows in the
  queue as "{m}/{m}" and still counts in Finish up at exactly the moment the
  reviewer goes to sign. j and m per case come from the §4.3 counts-row fetches
  (`GET /api/v2/judgments?caseId=…` supersede-resolved → j;
  `GET /api/v2/cases/:uuid` `review.result.results.length` → m).
- "**Worth a look next**" (P4): up to 5 `GET /api/v2/inbox` suggestions that are not
  already open cases, each with its plain-language reason from the rename table ("From
  a routine check", "New topic to cover", "Needs a fresh look", "From real searches",
  "Spot check", "Used to rank differently"). Clicking runs the search (no case until
  first vote, decision 6). With no inbox suggestions, the section is omitted entirely
  (no header).
- Rail footer hint: "J and K move · one letter judges · all shortcuts" — "all
  shortcuts" is a button opening the `?` sheet.
- **Per-query done state** (verse panel): Literata "All {n} judged." · "Every result
  for "{q}" has your call on it. Well done." · buttons "Next search: "{q}" →" (next
  open case with unjudged items; accent) and "Review what you decided →" (quiet while a
  next search exists, accent otherwise). With everything judged, the next-search button
  disappears.

### 3.5 Compare (blind)
- Empty state: "Nothing to compare right now — comparisons appear when a candidate
  engine is ready."
- Header: "Which set answers "{q}" better?" · "You are not told which engine is which.
  This call is final." · "Read both lists, click any verse to read it below, then make
  one call." Two blind lists Set A / Set B; clicking any verse loads it into a shared
  panel with "Set A says / Set B says" explanation columns. Bottom toolbar `[A] A wins
  · [B] B wins · [T] Tie · [W] Both wrong`.
- **One confirm before the permanent record (binding)**: pressing A/B/T/W or clicking
  its button never commits directly. A blind-comparison judgment is final the instant
  it lands (the server records it immutably — "This judgment is immutable.",
  index.html:3183 — and the reveal copy says so), and §3.1's rescue-preview rationale
  applies here with more force, not less: the header disclosure "This call is final."
  addresses wrong beliefs, while a bare single key invites slips of a habituated
  hand — and unlike a rescue, this call is never re-reviewed in Finish up. So each
  key/button opens a one-confirm layer under the §3.12 focus contract — title
  "You're calling it: {label}." ({label} = A wins / B wins / Tie / Both wrong), body
  "This call is final — it cannot be edited, only outweighed by future comparisons.",
  buttons "Confirm — {label}" / "Cancel", **initial focus on Cancel** (the §3.12
  exception class: a reflexive A-then-Enter double-tap must not commit), Esc or
  Cancel closes with nothing posted. Confirm posts the session judgment and shows the
  reveal. The layer rides the same §3.12 Esc slot as the rescue preview; under
  read-only its Confirm is disabled like every POST-issuing control (§3.11).
- Reveal card: "The reveal" · one of "You preferred Set A — the current engine." / "You
  preferred Set B — the candidate." / "You called it a tie." / "You sent both back." ·
  "Your preference is recorded exactly as you made it, blind. This call is final: it
  cannot be edited, only outweighed by future comparisons." · "Back to Review".
- Wiring per §4.3; session resume uses a persisted per-review `requestId`.

### 3.6 History
- Header "What you have decided" · "Every call stays on record. An undo does not erase
  a call — a newer one replaces it." Quiet count "{n} calls on record."
- Zero calls: "Nothing on record yet. Your first call on any search result will appear
  here." with a button "Go to Review →".
- Rows: relative time + humanized text, e.g. "Marked Psalm 23:1 essential (top 1) for
  "the lord is my shepherd"" · "Added Lamentations 3:22 as a missing passage (top 3)
  for "mercy"" · "Marked Genesis 43:14 not relevant — matched words, not meaning, for
  "mercy"". A `missing` judgment this client's own session recorded as a **tail
  rescue** renders "Rescued Psalm 88:3 from the lower results (top 10) for "{q}""
  instead of the "Added … as a missing passage" template — a rescued verse was
  never missing, and §3.7 already draws this distinction from the same local
  knowledge; a prior-session `missing` record renders the generic template (the
  rescue/suggestion distinction exists only in the client's session log — never
  guessed). Superseded records struck-through/faint with sub-line "Replaced by a newer
  call."
- Data: `GET /api/v2/cases` — **the server returns cases in caseId (UUID) order, not
  time order** (`validateCaseEvents` groups and sorts case buckets by caseId,
  `workbench/src/cases.ts:424–426`; `foldCaseEvents` preserves that order,
  `cases.ts:443`; `readCases` → the endpoint handler sends it verbatim,
  `reviewCases.ts:109–116`, `server.ts:1512–1516`; and `CaseSnapshot` carries no
  top-level timestamp, `cases.ts:127–139`), and that order is uncorrelated with
  recency. **The client therefore orders cases itself (binding)**: a case's touch
  time is the `at` of its last event — `case.events[case.events.length - 1].at`
  (every event carries `at`, `cases.ts:69`; the validated chain is causal, with
  `at >= parent.at` enforced, so the last event holds the case's newest timestamp;
  the format is ISO-8601 UTC with fixed-width milliseconds, `cases.ts:149`, so
  plain string comparison is safe) — and every recency-ordered surface sorts
  descending on that value: "most recently touched" first. This client-sorted list
  is the one ordering every case-list surface reads — §3.1's open-case boot pick
  ("the first open case"), §3.4's Waiting-in-your-queue row order, and this
  screen's "20 most recent cases" (= top 20 by this sort) + "Show more"; the raw
  response order is never rendered. Then lazy `GET /api/v2/judgments?caseId=…` per
  case as its group expands/scrolls in.
- No raw IDs, digests, or fingerprints anywhere on this screen.

### 3.7 Finish up (typed-digest signing)
- Intro: "Your reviewed calls leave the workbench here and become part of the search's
  answer sheet." followed by the defining sentence, first use on any surface: "The
  answer sheet is the reviewed record of what the right results should be; the
  engineering checks hold every update to it." Four stat tiles (Essential / Helpful /
  Not relevant / Missing passages), Literata numerals in verdict colors, counted across
  ALL open cases (prototype v2 behavior) — "open" per §3.4's one definition
  (`new`/`reviewing`/`judged`), tallied from the §4.3 counts row's per-case fetches
  (`GET /api/v2/judgments?caseId=…`, supersede-resolved), so a case
  auto-transitioned to `judged` on top-10 completion never vanishes from these
  tiles at signing time.
- Pending banner when any open case's top block has unjudged rows: "{n} of {m} passages
  are still waiting for a call. Finish them first →" (links to Review at the first such
  case); when any calls are locally reopened it reads "{n} of {m} passages are still
  waiting for a call · {r} reopened calls unresolved. Finish them first →". Reopened
  rows are counted in {r}, never in {n} — a reopened row's earlier call is still
  active. m = the open cases' top-block sizes summed, n = their unjudged rows summed —
  both from the §4.3 counts-row fetch pair per open case (m from
  `review.result.results.length`, n from m minus the supersede-resolved judged
  count); a case whose `review` comes back `null` drops out of both sums, and with
  every case null the banner is omitted (§4.3 counts row — signing is disabled by
  §3.11 then anyway). Pending informs; it never blocks signing.
- "**What will be written**" — derived honestly from `POST /api/v2/compile/preview`'s
  plan. `plan.operations` is a list of **whole-file writes** `{path, beforeSha256,
  afterText}` (`compileJudgments.ts` `PlannedCompilationFile`), not per-judgment
  operations, and the compiler has no applied-state tracking — it restates the entire
  compiled state on every preview. So the UI first computes the **changed set**:
  operations where `sha256(afterText) !== beforeSha256` (an `afterText` of `null` is a
  deletion, changed when `beforeSha256 !== null`). Only changed operations render,
  grouped per query:
  - Each changed fixture write's `afterText` parses as `CompiledFixture` JSON
    (equivalently: use the plan's `fixturesWritten` `{path, fixture}` pairs, filtered
    to the changed set). Every `expectedTop` entry renders "Must rank: {ref} in the
    top {n}"; every `mustNotRank` entry renders "Must not rank: {ref} — {why}". A
    {why} that is exactly the raw token `wrong-anchor` or `concept-misfire` (a
    note-less legacy record: the compiler falls back to the raw diagnosis token when
    no note exists, `compileJudgments.ts:504–508`, and its plain-words fallback
    covers only `lexical-noise`) renders in plain words instead — `wrong-anchor` →
    "listed under a theme it does not speak about"; `concept-misfire` → "speaks
    about the theme, but is not an answer for this query" — never the jargon token
    on the signing surface. New records cannot be note-less: §3.2's required why
    field guarantees every concept-mode judgment this UI writes carries the
    reviewer's own words.
  - An expectedTop line whose ref matches one of this client's `missing`-action
    judgments in the local judged map appends a suffix: " (rescued by you from the
    lower results)" when the client locally recorded that judgment as a tail rescue,
    otherwise " (added by you — not shown in the engine's top 10)"; no match, no
    suffix. Never "not in the engine's results" — that would be a false statement on
    the signing surface: tail rescues ARE engine results (ranks 11+, visible to the
    reviewer), and a typed suggestion can also name a rank-11+ verse — a
    prior-session record, or this session's when the tail fetch failed (the §3.3
    tail pre-check redirects the common case, but the server's own already-present
    check runs only against the top-10 snapshot: `reviewCases.ts:83–85` slices to
    `REVIEW_WINDOW` before building `context.results`; `judgments.ts:516–517`).
    The honest claim is about the top 10, not about engine output. (Compiled fixtures render `essential` and
    `missing` identically into `expectedTop` — the suffix is the only distinction, and
    it comes from the client's own log knowledge, never a guess.)
  - There is **no template for Helpful calls** — they write nothing (footnote below).
  - A deletion (`afterText: null`) renders "Withdrawn: "{query}" — no calls remain to
    write."
  - The `pipeline/fixtures/web-subset.json` operation renders one line per entry of
    the plan's `proposedSelections` field: "Add {book} {chapters} to the test corpus
    so these answers can be checked."
  - A line whose {query, ref} matches a judgment this client has locally reopened (and
    not yet replaced) appends " (reopened — this earlier call stands unless you change
    it)".
- Empty changed set → "Nothing waiting to be written — every call you've made is
  already on the answer sheet." + footnote "Helpful calls stay on record and inform
  review; they do not write answer-sheet lines by themselves." (`operations.length === 0`
  is NOT the gate — once any compilable judgment exists the compiler always restates
  files; only the changed-bytes delta says whether anything will actually change.)
- "**Sign to write**": "This step changes reviewed files, so it asks for a signature:
  type the code below exactly. That is deliberate friction — it means nothing is
  written by a stray click." The code chip (dashed border, Literata) shows the **first
  12 hex chars of `plan.digest`, grouped 4-4-4** (e.g. `4e7a 9c21 b0d3`). Input "Type
  the code to sign"; button "Write 1 call to the answer sheet" / "Write {n} calls to
  the answer sheet" (real pluralization, never "(s)"; the prototype's "Write {n}
  judgment(s) to fixture files" names an undefined engineering artifact on the very
  surface that defines "answer sheet" — the substitution is logged in DESIGN.md's
  Deviations next to the existing answer-sheet note, D1) — **n = the count
  of Must-rank + Must-not-rank lines rendered from the changed set** (definition
  unchanged) — enables only on
  an exact, case-insensitive match. Enter in the sign input activates the Write
  button only while it is enabled (exact match typed); while disabled it is a
  no-op — the sign panel, like the missing form (§3.3/§3.12), is never a native
  `<form>`, so no raw browser submit can fire. Submitting posts the FULL digest
  (`POST /api/v2/compile/apply` `{digest}` — server contract unchanged).
- Outcomes: success → Literata "Written." · "{n} calls are now on the answer
  sheet. The engineering checks will pick them up on the next run." (same
  calls-not-judgments substitution, logged with the button copy in D1). 409
  `stale_preview` → "The picture changed since this preview — reloading it now." then
  auto re-preview (new code). 409 `mutation_running`/`job_running` → "Another change
  is being written right now — try again in a moment."
- **Post-apply re-preview (binding — the closing half of §3.4's open-case
  approximation)**: after a successful apply renders the success card, re-run
  `POST /api/v2/compile/preview` once and recompute the changed set. Any open case
  whose normalized query (§4.6 normalization) contributes no changed operation is
  locally marked compiled: it drops from the §3.4 "Waiting in your queue" list and
  from these four stat tiles (a judged case with only Helpful calls — which write
  nothing — drops here too, honestly: none of its calls are waiting to be written).
  `new`/`reviewing` cases never drop — they still have judging to do. The mark is
  session-local: a later boot lists a judged case again until the next Finish-up
  visit recomputes the changed set — a stated v1 limit (the accumulation window is
  one boot-to-Finish-up span), not a surprise; the full fix rides the deferred
  diff card (§2.3).

### 3.8 Advanced door
Nav link "Advanced" opens a summary screen: "Engineering surfaces. Nothing here
interrupts the review flow." Sections: Health (engine version, corpus/layer
fingerprints in mono, mode line) and one primary link "Open the full engineering
console →" to the preserved old UI (**href `/` during transition, `/advanced` after
the flip** — §4.10), plus "← Back to Review". The identity trio lives here, in mono —
nowhere else except the signing chip.

### 3.9 Onboarding
Three keypress lessons on first visit (localStorage `study.onboarded`): J "Move through
the queue" → E "Judge with one letter" ("E marks a passage essential. H is helpful, X
is not relevant, M records a missing passage.") → ? "Help is always one key away". Each
card really requires its key. Footer: "Press the key to continue — that is the whole
lesson." + "Skip the tour" button. The tour carries the contract sentence once
(asserted in D32). Onboarding is a layer under the §3.12 focus contract.

### 3.10 Themes
☀ Light / ☾ Dark / ◐ Auto cycle button; persisted `localStorage['study.theme']`;
`data-theme` on `<html>`; Auto follows `prefers-color-scheme` via `matchMedia`. In
Auto, a `matchMedia("(prefers-color-scheme: dark)")` **change listener** re-applies
`data-theme` immediately — no reload. **First paint is theme-correct (no FOUC)**: a
minimal inline script in the `<head>`, placed before the `<style>` block, reads
`localStorage['study.theme']` (in try/catch) and
`matchMedia('(prefers-color-scheme: dark)')` and stamps `data-theme` on `<html>` so
the correct theme paints first; the main IIFE takes over theming from there.
(Without it, a reviewer with `study.theme='dark'` — or dark-preferring Auto — sees a
light-token flash on every load, because §4.8's main IIFE sits after the body
skeleton. The single-inline snapshot contract joins all inline scripts —
`staticSnapshot.ts:466` — so a second inline script is contract-valid.) The
stylesheet sets `color-scheme: light` on
`:root` and `color-scheme: dark` under `[data-theme="dark"]`, so native controls and
scrollbar chrome match the theme. Selection, caret, scrollbars, focus rings themed per
the token sheet. Dark derives from its own token column, never inversion.

### 3.11 Empty / loading / error / read-only states
- Loading: static skeleton rows (no animation beyond the allowed toast); never
  spinners-with-nothing. **Async arrival is never silent to a screen reader**: the
  results region owns a visually-hidden `aria-live="polite"` status element that
  announces "{n} results for "{q}"" (or the §3.1 empty-state / invalid-reference
  sentence) when a search resolves; the skeleton container sets `aria-busy="true"`
  while loading and removes it on settle.
- Search error (`network_error` / 5xx): inline "The engine did not answer. It may be
  restarting — try again in a moment." + Retry button.
- **Read-only degraded** (server `startup_degraded_read_only` / GET `readOnly` flags /
  `GET /api/v2/health` machine mode): top banner, `role=status`, background
  `var(--v-missing-wash)`: "**Read-only right now.** The engine is rebuilding its data.
  You can read everything, but calls will not save. This usually clears in a minute —
  then reload the page." **Every POST-issuing control disabled** — the verdict
  toolbar and bulk bar, tail-rescue buttons (and the rescue preview's confirm),
  the missing form's Submit, "Add to my queue", Compare verdicts (and the §3.5
  confirm layer's Confirm), and Sign — not
  just verdict/compare/sign; any attempted commit
  toasts "Read-only right now — this call was not saved." Search, ⌘K, Context, History
  (GETs) keep working. Health refetches on window focus and after any failed POST. 503
  `artifact_unavailable` gets the same toast.
- 400 `validation_failed`: toast "Something about this call was rejected — nothing was
  saved." (details to console) — **except** the already-displayed missing rejection,
  detected by message per §3.3, which gets the specific toast + scroll (from the
  missing form, §3.3; from a rescue confirm it first closes the preview layer,
  §3.1) — and **except** a mid-bulk failure, which gets the §3.2 partial-batch
  receipt (k rows did save, so "nothing was saved" would be false).
- 409 `review_snapshot_required`: silent one-shot recovery per §4.6; only if ranks
  changed does the data-changed banner appear.
- **Unnamed failures (binding — D39's table maps every api-layer function to a §3.11
  string, so no failure surface is ever invented at implementation time)**: any GET
  failure not named above renders the fallback sentence in its owning surface:
  "That part of the workbench did not load. Reload the page to try again." — a
  failed boot fetch (`/api/meta`, `/api/concepts`, `/api/v2/health`,
  `/api/v2/cases`) shows it once as a toast; a failed rail fetch (context, inbox)
  shows it inline in that rail section; a failed `GET /api/passage` verse fetch
  on a focused card keeps the §3.1 excerpt rendering (already specified — no
  error state), while the same failure inside the rescue preview shows the §3.1
  resolution-timing retry state (the search-error sentence + Retry, Confirm
  disabled — two call sites, both driven by spec); a
  `/fonts/**` failure shows nothing (the §4.7 fallback stacks carry the page). Any
  POST failure not named above (network error / 5xx on a commit) toasts "That call
  did not save — the engine did not answer. Try it again in a moment." — except a
  mid-bulk failure, which gets the §3.2 partial-batch receipt; a failed
  `POST /api/v2/cases/:uuid/state` shows nothing (bookkeeping — §4.3 ignores and
  logs it).
- Empty states elsewhere: History zero-calls (§3.6), empty queue rail and omitted
  Worth-a-look (§3.4), Compare empty (§3.5), search empty/invalid-reference (§3.1) —
  every empty state invites exactly one action, per the copy voice.

### 3.12 Keyboard map (every shortcut is also a visible button)
| Key | Context | Action | Mouse parity |
|---|---|---|---|
| J / K, ↓ / ↑ | Review, interview closed | Move focus down/up the active list (top block + divider + expanded tail — boundary rule below) | click any row |
| E | focused top-block row | Essential at current top-N | toolbar button |
| H | focused top-block row | Helpful | toolbar button |
| X | focused top-block row | Open not-relevant interview | toolbar button |
| M | Review — discovery results (or their zero-result empty state) on screen | Open missing-passage form | toolbar button + "Missing a passage?" link + empty-state button |
| M | Review — pre-search, `reference`, or `invalid-reference` view | Inert: hint toast "Search words or phrases first — a suggestion attaches to the search that misses it." — no form opens, no POST fires (§3.2 gate) | — (the toolbar is absent in these states) |
| ← / → | top-N picker focused | Move the selection between 1/3/5/10 — selection follows focus (radiogroup pattern, §3.2), so the arrow alone changes the value the next E commits; Space also selects | picker segments |
| E | focused tail row | "Should be near the top" — ALWAYS opens the §3.1 rescue preview (single-verse confirm mode or pick-chip mode); never posts on the first keypress | row button |
| Enter | focused tail row | No-op — the verse already reads in the rail (§3.1); Enter never commits a rescue | — |
| H / X / M | focused tail row | Hint toast: "Lower results take one action — "Should be near the top"." | — |
| U | Review | Reopen toast target, else last verdict (Essential/Helpful/Not relevant only — a suggestion or rescue target shows the §3.3 permanence sentence instead, and nothing posts; after a bulk commit U targets nothing and shows the §3.2 hint toast). U — and clicking a chip's inline Undo link — moves DOM focus to the reopened card (it becomes the expanded/focused card), so the next verdict keypress or toolbar click applies to it; the reviewer's J/K position is otherwise unchanged (§3.2 binding) | chip/toast "Undo" link |
| Space | focused top-block row | Toggle bulk checkbox (disabled on judged rows — §3.2) | checkbox |
| Enter | Search input | Submit search | Search button |
| Enter | Missing form — reference input | Activates Submit only when Submit is enabled (a single verse resolved or picked — the resolved verse has by then rendered in the preview, so Enter-when-enabled is always post-preview); while Submit is disabled, Enter is a no-op — the form is never a native `<form>`, so no raw browser submit can fire (§3.3) | Submit button |
| (post-search handoff) | Discovery results just rendered | Focus moves from the search input to card #1 (first unjudged when the query has an open case); the input keeps its value; `reference` / `invalid-reference` / zero-result submits leave focus in the input (§3.1 handoff rule) | Search button and ⌘K row selection trigger the same handoff |
| ⌘K / Ctrl+K | Everywhere | Toggle quick lookup | header "Look something up ⌘K" button |
| A / B / T / W | Compare | Open the §3.5 one-confirm layer for that call ("You're calling it: {label}."); only the layer's Confirm posts — the key alone never commits | toolbar buttons |
| ? | Everywhere | Shortcut sheet (Move · Judge · Compare · Everywhere; "Esc to close") | rail-footer "all shortcuts" button |
| Esc | Layered | Close topmost layer: interview → missing form / rescue preview / Compare confirm (one shared slot — at most one of the three is ever open) → lookup → sheet → bulk selection | each layer's Cancel/× button |
| Tab / Shift+Tab | Everywhere | Standard traversal; roving tabindex in the results list | — |

Typing in an input suppresses single-letter shortcuts (Esc still closes the layer); ⌘K
works everywhere, inputs included.

**Tail-boundary rule for J/K** (same rule as §3.1, restated here because the
keyboard-first reviewer hits this boundary on every query with a tail): J on the last
top-block card while the tail is collapsed moves focus to the divider button (Enter
or Space expands it); once expanded, J from the divider enters tail row #11 and K
from row #11 returns to the divider; K from the divider returns to card #10. J on
the last expanded tail row does nothing — no wrap, no silent expansion. K on card
#1 does nothing — no wrap. With 10 or fewer results there is no divider: J on the
last card does nothing. Plain J/K navigation never wraps; only commit
auto-advance (§3.2) wraps. Focus entering the tail fronts the why-rail Context
tab with the focused row's verse (§3.1 read-before-rescue binding).

**Single-key shortcuts can be turned off** (WCAG 2.1.4): the `?` sheet carries a
persisted toggle — "Single-key shortcuts: On / Off" (localStorage `study.shortcuts`,
default On). Off disables all single-letter shortcuts (J/K/E/H/X/M/U/A/B/T/W/?); Esc,
Enter, Tab, arrows, and ⌘K remain. Every action stays reachable by its visible button.

**Layer focus contract** (shared rule for the interview, missing form, rescue
preview, the Compare confirm (§3.5), ⌘K lookup, `?` sheet, and onboarding): every
layer is a focus trap, and its
dialog element carries `role=dialog`, `aria-modal="true"`, and `aria-labelledby`
pointing at its title (asserted in D35). On open, focus moves to the
layer's first interactive element (the reference input for the missing form, the
search input for the lookup) — with one deliberate exception class: **the rescue
preview's initial focus is its Cancel button in single-verse confirm mode and the
pre-selected pick chip in pick-chip mode, and the Compare confirm's initial focus
is its Cancel button — never a Confirm button**, so a
reflexive E-then-Enter (or A-then-Enter) double-tap cannot commit (the exact
motor-slip class these
layers exist to absorb must not be reintroduced through DOM order; asserted
in D18 and D27). Tab/Shift+Tab cycle within the layer only. On close
(Esc, Cancel, or commit), focus returns to the element that opened it (the focused
result card for the interview).

**⌘K quick lookup**: dialog, placeholder "Type words or a reference — "mercy", "Psalm
46"…"; debounced 300ms live `GET /api/search` (min 3 chars); handles all three
`result.kind`s: `discovery` → rows showing reference + Literata snippet, every row
clickable; `reference` → one passage row (selecting it reviews the reference text as a
search, same action as any row); `invalid-reference` → the §3.1 invalid-reference
message inline, no rows. The selected row's action is "**Review results for this
search ↵**" — switches to Review with the query submitted (no case created). Empty
state: "Nothing yet — try a word from the verse, or a reference like "Psalm 46:1"."
Footer: "↑↓ Navigate · ↵ Select · Esc Close" + "Looking something up never creates a
case by itself."

### 3.13 Required bug fixes carried from the prototype audits
1. **Escape closes the not-relevant interview** (v2 traps it: the `if (s.interview)
   return` guard precedes the Escape branch). New handler resolves layers first.
2. **J/K must not silently discard an open interview** (v2's `move()` clears
   `interview: null`). Navigation is inert while an interview is open.
3. **Unknown-query search must persist** (v2 toasts "started one", stores nothing) —
   replaced by real results for every query + lazy case creation + "Add to my queue".
4. **Search must be real engine search** — `GET /api/search`, word-level — not
   whole-string equality against two mock query strings.
5. **Suggestion preview must be real** — `GET /api/passage`, not a 3-passage mock map.
6. Lookup rows: every row clickable (v1/v2 had inert non-selected rows).
7. Dark background painted at document level (v2 painted an inner div only).

---

## 4. Architecture & data flow
### 4.1 Files & serving
- New UI: **one file**, `workbench/static/study.html` — single-file vanilla JS, no
  framework, no build step, no external requests. Served read-once-per-process like the
  current page (restart to pick up changes).
- It must satisfy the single-inline static-snapshot contract
  (`workbench/src/staticSnapshot.ts`): `<meta name="workbench-static-protocol"
  content="1">` in the head, inline scripts only, and **every path in
  `REQUIRED_INLINE_ROUTES` present as a string literal** in the inline JS — kept in one
  `ROUTES` constant copied verbatim from `staticSnapshot.ts:10–35`, with a vitest
  asserting parity (§7).
- Old UI: `workbench/static/index.html` stays byte-untouched until the flip.

### 4.2 Server additions (each justified; nothing else changes)
The engine package, all `/api/*` endpoints, judgment semantics, CSRF model, and startup
preflight are **untouched**. Exactly two additive **mechanisms** in
`workbench/src/server.ts` (+ helpers + tests) land before the flip — a third server
behavior, the `/study` → 302 `/` redirect, lands only in D41's PR and rides the first
mechanism's table:
1. **Secondary static pages / redirects** — fixed table supporting file entries
   (`{'/study': 'static/study.html', '/advanced': 'static/advanced.html'}`) and
   redirect entries (`{'/study': {redirect: '/'}}` — used only at D41): each existing
   file read once at startup, validated with the same `resolveStaticSnapshot`
   machinery (single-inline mode), held in memory, served with sha256 etag + nosniff;
   a redirect entry answers 302 with `Location`; a missing file 404s its route and is
   NOT a startup issue. Justification: the snapshot mechanism serves only `/`; the
   covenant requires the old console preserved and reachable during development and
   after the flip; without this, transition needs env-var juggling per launch.
2. **Font route** — `GET /fonts/{literata|source-sans-3}/{file}.woff2` from an
   allowlist built at startup by scanning exactly those two directories for `*.woff2`;
   files read into memory once; `content-type: font/woff2`, sha256 etag,
   `cache-control: no-cache`, nosniff; anything else under `/fonts/` 404s; serves in
   degraded mode (static, read-only). Justification: neither static-snapshot mode can
   serve woff2 (`plan-r1-repo.md` §6 — `canonicalModulePath` accepts only
   `.js`/`.mjs`); inlining ~0.5MB base64 into reviewed HTML bloats every future diff; a
   build step breaks the no-build idiom; DESIGN.md prescribes this on-disk layout.
   (If D2's contingency lands TTF instead, the allowlist and content-type extend to
   `font/ttf` in the same PR.)

### 4.3 Endpoints per interaction
| Interaction | Calls |
|---|---|
| Boot | `GET /api/meta` (identity trio → localStorage compare), `GET /api/concepts` (id→label cache), `GET /api/v2/health` (read-only detection), `GET /api/v2/cases` (queue — client-sorted per §3.6 by latest `events[].at` descending, since the response arrives in caseId order; with open cases the first open case then loads per §3.1's boot state — with none, no further request until the first search submit) |
| Search submit / ⌘K typing | `GET /api/search?q=…` (stale responses dropped via request sequence counter) |
| Why-rail Context tab — driven by the focused top-block card, and by a focused tail row (§3.1 read-before-rescue binding; the rail fronts Context when focus enters the tail) | `GET /api/v2/context?ref=…` |
| Focused-card verse body (§3.1); missing-form live preview + pick-chip re-resolve (§3.3); tail-rescue resolution + range detection (§3.1/§4.4) | `GET /api/passage?ref=…` (stale responses dropped via the same request-sequence counter) |
| Open existing case (queue click / search matching an open case) | `GET /api/v2/cases/:uuid` → `{case, review}` (snapshot + token); `GET /api/v2/judgments?caseId=…` → judged map; `GET /api/search?q={case.query}` → tail ranks 11+ (plus the §4.6 reference-per-rank agreement check) |
| First vote on a case-less query (verdict, suggestion, or tail rescue — decision 6) | `POST /api/v2/cases` `{query, source:'manual'}` → `{case, review:{token,…}}`, then the judgment POST, then `POST /api/v2/cases/:uuid/state` `{state:'reviewing'}` |
| "Add to my queue" | `POST /api/v2/cases` `{query, source:'manual'}` only |
| Any vote / suggestion / rescue / supersede | `POST /api/v2/judgments` (routing fields `caseId` + `snapshotToken` + client fields per §4.4) |
| Top-10 completed | `POST /api/v2/cases/:uuid/state` `{state:'judged'}` (409 `invalid_case_transition` ignored, logged) |
| Worth-a-look suggestions | `GET /api/v2/inbox` |
| Queue counts, Finish-up tiles & pending banner (§3.4 "{j}/{m}", §3.7 four tiles + "{n} of {m}") | **"Open case" = `state ∈ {new, reviewing, judged}`** (the first three of `CASE_STATES`, `workbench/src/cases.ts:23–35`; judged stays open until its calls are compiled — the changed-set from `POST /api/v2/compile/preview` says when; v1 approximates by including all judged cases minus those the §3.7 post-apply re-preview has locally marked compiled). This matters because §4.3's own auto-transition moves a case to `judged` the moment its top-10 completes — a naive new/reviewing filter would drop a just-completed case from the Finish-up tiles at exactly the moment the reviewer goes to sign. For each open case: `GET /api/v2/judgments?caseId=…` (supersede-resolved judged map → j and the four tile tallies) and `GET /api/v2/cases/:uuid` (`review.result.results.length` — already capped server-side at `REVIEW_WINDOW`, `reviewCases.ts:83–85` — → m; reused snapshots make this cheap for recently touched cases — accept the fresh-capture cost otherwise, bounded by the LRU-128 store). When a case's `review` comes back `null` (`server.ts:1618–1628` — no stored snapshot and the engine unavailable, the degraded-with-engine-down case): m is unavailable for that case, its queue count renders "{j} judged" with no denominator, and it drops out of the pending banner's m — with every such case null the banner is omitted; signing is disabled by §3.11 anyway |
| Compare | `GET /api/v2/candidates`; `POST /api/v2/candidates/:reviewId/blind-sessions` `{requestId}` (client `crypto.randomUUID()`, persisted per reviewId for resume); `GET …/blind-sessions/:sessionId`; `GET …/passages?queryId=…&passageId=…` (exactly those two params); `POST …/blind-sessions/:sessionId/judgments` |
| History | `GET /api/v2/cases`, then `GET /api/v2/judgments?caseId=…` per shown case |
| Finish up | `POST /api/v2/compile/preview` → `{plan}`; `POST /api/v2/compile/apply` `{digest: plan.digest}` |
| Fonts | `GET /fonts/...` (new route) |

All POSTs use the ported `requestJson` wrapper: `content-type: application/json`,
same-origin — satisfying the CSRF guard (json + Host 127.0.0.1/localhost + absent/same
Origin). Body cap 64 KiB respected. The wrapper unwraps the v2 `{ok,data}/{ok,error}`
envelope; v1 endpoints return plain JSON.

### 4.4 Judgment payload mapping per vote type
Every judgment POST body = `{caseId, snapshotToken}` + the client fields below (only
`V2_CLIENT_FIELDS`; the server stamps identity, rank, digests, reviewer, excerpt):

| UI action | Client fields |
|---|---|
| Essential [E] | `action:'essential'`, `targetId`, `withinTop` (1/3/5/10, persisted default 3), `note?` |
| Helpful [H] | `action:'helpful'`, `targetId`, `note?` |
| Not relevant — auto interview confirmed | `action:'irrelevant'`, `targetId`, `diagnosis:'lexical-noise'`, `diagnosisInferred:true`, `note?` (the unresolved-label fallback below always sends one) |
| Not relevant — concept step 1 "No, it doesn't" | `action:'irrelevant'`, `targetId`, `diagnosis:'wrong-anchor'`, `conceptId`*, `note` (required — the §3.2 why text; `judgments.ts:555–559` demands both the concept id and a non-empty note). **No `diagnosisInferred` key at all**: the server rejects any value other than `true` or absence (`judgments.ts:551–552` — "Omit \"diagnosisInferred\" or send diagnosisInferred: true only."), and this diagnosis is human-chosen, not inferred |
| Not relevant — concept "Yes" → step 2 "Right — not a fit here" | `action:'irrelevant'`, `targetId`, `diagnosis:'concept-misfire'`, `conceptId`*, `note` (required, same rule). No `diagnosisInferred` key |
| Missing passage [M] | `action:'missing'`, `reference` — **always the canonical resolved label from the `GET /api/passage` preview (`passage.reference`), never the raw input** (§3.3); the client enforces `passage.verses.length === 1` (via the pick chip when needed) before enabling submit — the server rejects multi-verse references; `withinTop`, `note?` (the phrases-people-might-type text) |
| Tail rescue "Should be near the top" | `action:'missing'`, `withinTop:10`, `reference` — **never the row's raw `DiscoveryResult.reference`: resolve `row.reference` via `GET /api/passage` before posting** (the focused-card resolution, §3.1, is reused when present). The engine collapses adjacent anchor-run verses into one result with a **range** reference (`collapseAnchorRuns`, `engine/src/createEngine.ts:356, 594–677` — e.g. "Psalm 46:1-3", minted as `` `${referenceLabel(first)}-${final.verse}` ``; the merged row keeps the run's first verse's `targetId`, `createEngine.ts:653–656`), and the server rejects any multi-verse `missing` reference (`resolveReferenceTargetId`, `server.ts:586–591`: `verses.length === 1`; `judgments.ts:512–515` → 400 "could not be resolved to an exact target identity"). Every rescue commits through the §3.1 rescue preview — read, then one confirm; nothing posts on the first keypress: when `passage.verses.length === 1` the preview shows that one verse and its confirm posts the canonical `passage.reference`; when > 1 the pick-chip mode opens with the run's first verse (the verse the row's `targetId` addresses) pre-selected, and the confirm posts the picked verse's canonical single-verse `passage.reference`. The rescue receipt names the confirmed verse |
| Any change of an existing call | same fields as the new call + `supersedes:<active judgment id>` |

\* When the Named-by label resolves to no id in the `/api/concepts` cache (the old UI
stores `id:null` in that case — index.html:1958), the concept-mode diagnoses **cannot
be recorded at all**: the server REQUIRES `conceptId` for `wrong-anchor` and
`concept-misfire` (`judgments.ts:555–556` — "A '{diagnosis}' judgment must name the
concept that produced the bad evidence.") and FORBIDS it for `lexical-noise`
(`judgments.ts:561–562`), and §2.3 excludes the old UI's typed-concept-ID fallback
(index.html:2187). So the interview **falls back to auto mode**: show the auto-mode
copy and commit `action:'irrelevant'`, `diagnosis:'lexical-noise'`,
`diagnosisInferred:true`, `note: 'concept label "{namedBy}" (unresolved id)'` — no
`conceptId` key. The unresolved label still reaches curation review through the note;
nothing 400s.

Diagnosis-mapping rationale (stated so no one re-litigates it): "doesn't speak about
the theme" = concept→verse anchor wrong (`wrong-anchor`); "speaks about the theme but
isn't an answer for this query" = the concept fired wrongly here (`concept-misfire`);
no concept evidence = word-match noise (`lexical-noise`, UI-inferred, human-confirmed).
`conceptId` comes from the result's Named-by evidence; without one, auto mode runs.

`targetId` comes from the review snapshot's items (they carry target ids and observed
ranks — consult the old UI's review tab for exact field names). Missing-passage
excerpts are resolved server-side via `engine.passage` (≤280 chars); the server rejects
a "missing" reference already displayed in the top-10 window — the UI pre-checks and
redirects to the displayed card (§3.3) and detects the server-side rejection by its
message (§3.3).

### 4.5 Undo = supersede (append-only, honest)
- The client tracks, per target, the **active** judgment id (from
  `GET /api/v2/judgments?caseId=` at case open + local appends, resolving supersede
  chains: a record named by a newer record's `supersedes` is replaced).
- A superseding POST must name the active record (the server rejects superseding an
  already-superseded record; same query/case/target enforced server-side).
- U never posts anything by itself: it flips local state to "reopened" (§3.2 chip
  copy); the next verdict posts with `supersedes`. Direct re-judging posts with
  `supersedes` immediately. Reopened is a **local, third display state** (§3.1 queue
  dots, §3.4 counter, §3.7 banner + suffix) — the log-active call is never hidden or
  misdescribed as unjudged.
- Suggestions and rescues have no reopen path (decision 8): their target key is
  `reference:{string}` and the only superseding call the server accepts for it is
  another `missing` of the same reference — so the UI states permanence (§3.3) instead
  of offering an undo it cannot honor.
- History renders replaced records struck-through; nothing is ever deleted.

### 4.6 Case & snapshot-token lifecycle
- Snapshots are process-local, LRU-128, one live token per case, `REVIEW_WINDOW = 10`;
  a server restart or re-capture invalidates tokens.
- **Render source**: with an open case, the top block renders the snapshot's items (the
  judgment contract — observed ranks are stamped from it); the tail renders live
  `GET /api/search` ranks 11+. With no case yet, both come from the live search.
  Determinism (same engine + artifact + query ⇒ identical ordering) makes these agree;
  the client still verifies reference-per-rank agreement. Failure (artifact swapped
  mid-session) ⇒ the snapshot list wins for judging and the §3.1 banner shows its
  **agreement-failure branch** ("The results below are the ones this case was opened
  on…") — the list on screen is the snapshot's, so the copy must say so.
- `POST /api/v2/judgments` → 409 `review_snapshot_required` ⇒ recovery:
  `GET /api/v2/cases/:uuid` (returns the case's current snapshot — freshness `reused`
  if the store still holds one, else a fresh capture; either way its token is the live
  one), compare ordering; identical → retry the POST once with the new token silently;
  different → re-render from the fresh snapshot, show the §3.1 banner's
  **409-recovery branch** ("The results below are the current ones…" — true, because
  the fresh snapshot IS current), no auto-post, toast "The results just refreshed —
  check your call still applies."
- Lazy-creation race: after `POST /cases` returns its fresh snapshot, verify it matches
  the rendered top-10 before posting the pending first vote; on mismatch re-render from
  the snapshot and ask for re-confirmation (same toast). This guard applies to every
  first-vote path — verdicts, suggestions, and tail rescues (decision 6). The client
  dedupes by normalized query (trim, collapse whitespace, lowercase) against the
  open-cases list before creating.

### 4.7 Fonts & static assets
Committed in P1: `workbench/static/fonts/literata/` — upstream variable woff2, regular
+ italic, unmodified, + `OFL.txt`; `.../source-sans-3/` — upstream variable woff2 +
`OFL.txt`; plus `workbench/static/fonts/README.md` recording exact upstream release
URLs (github.com/googlefonts/literata, github.com/adobe-fonts/source-sans) and sha256
per file. D2 verifies the upstream release format first and carries the fallback chain.
`@font-face` in study.html points at `/fonts/...` with `font-display: swap` and full
fallback stacks, so the page works if fonts 404.

### 4.8 Single-file structure of study.html
Ordered sections, each marked `<!-- §name -->` in markup and `// §name` at the start of
each JS stage, so reviews and tests can address them mechanically: (1) head: protocol
meta, title, the §3.10 theme-stamp micro-script (its own tiny IIFE, before the
`<style>` block so first paint is theme-correct — the snapshot validator joins all
inline scripts, `staticSnapshot.ts:466`, so a second inline script is contract-valid),
`<style>` — tokens, then components in screen order; (2) body skeleton:
header, nav, banner slot, screen containers (landmarks), toast + dialog slots; (3) the
main inline IIFE `'use strict'` script, in order: `// §routes` `ROUTES` constant (all
`REQUIRED_INLINE_ROUTES` literals) → `// §copy` constants/copy table → `// §state`
`state` + localStorage persistence → `// §request` `requestJson` → `// §api` api layer
(**one named function per endpoint** — this marker-delimited list is what D39's parity
vitest reads) → `// §stores` (cases, concepts, judged-map, health) → `// §helpers` pure
helpers (`node()`, `clear()`, normalizeQuery, relativeTime, supersede resolution) →
`// §render` renderers (one per screen + shared card/toast/banner) → `// §keys` single
`onKey` handler with the layer stack → `// §boot`. No globals from either script
(the head micro-script is an IIFE too); no `eval`; no dynamic script injection.

### 4.9 localStorage schema
`study.theme` (`'light'|'dark'|'auto'`) · `study.onboarded` (`'1'`) · `study.withinTop`
(`1|3|5|10`) · `study.shortcuts` (`'1'|'0'`, default `'1'` — §3.12 single-key toggle) ·
`study.ui.v1` (JSON: `lastQuery` — consumed in exactly one place, the §3.1 boot
state, to pre-fill the search input's value on a no-open-case boot; it never
auto-submits and never fetches; `lastSeenMeta:` the identity trio;
`blindRequestIds:{[reviewId]:uuid}`). Disjoint from the old `workbench-ui-state-v3` key.

### 4.10 Old-UI preservation & the flip
- P1–P4: old UI at `/` (default, untouched); new UI at `/study`; the new UI's Advanced
  screen links to `/` ("Open the full engineering console →").
- Flip (D41, its own PR, merged only on Jesse's go and after the pre-flip D42
  real-server run recorded in the PR — D41 states the gate): `study.html` content
  becomes
  `static/index.html` (served at `/`); the old page moves byte-identical to
  `static/advanced.html` (served at `/advanced` via the secondary-pages table — its
  same-origin absolute `/api/...` fetches work unchanged); **`static/study.html` is
  deleted in the same commit** (the redirect entry replaces its table entry);
  `/study` becomes a 302 →
  `/` via the table's redirect entry (§4.2); Advanced links point at `/advanced`;
  static-contract vitest expectations, `study-p4.spec.ts`'s Advanced-link assertion,
  and the four old-console Playwright specs' served-file path — each reads
  `../static/index.html` today (`core-review.spec.ts:17`,
  `candidate-review.spec.ts:12`, `studio-operations.spec.ts:10`,
  `admission-publish.spec.ts:47`) and retargets to `../static/advanced.html`, a
  path change only — all move in the same commit; **so does every study-side test
  that reads `static/study.html` by path** — the five `study-p1..p5` specs' served
  file, the D5/D40 study static-contract vitests, D35's `contrast.audit.test.ts`,
  and D39's §api parity vitest all retarget to `../static/index.html` (D41 lists
  every group and adds a stale-path sweep vitest;
  without the old-console spec retarget those four specs would load the Study page
  at the flip and every old-console assertion in them would fail CI, and without
  the study-side retarget every study guard would validate a deleted or stale
  file).

---

## 5. Covenant & integrity (rule → mechanism)
| Covenant rule | Mechanism |
|---|---|
| No AI at runtime | The dashboard is fetch + render + lookups against the compiled artifact via existing endpoints. No model calls, embeddings, or generation in study.html or the two server additions. Checks: no-external-URL vitest (§7) + finite api layer (§4.3). |
| Determinism; engine order sacred | Results render in engine order; no client sort/filter/re-rank; votes touch chips only. Playwright order-fidelity test: DOM order == mocked `/api/search` order before and after voting. No engine/weights/tokenizer code touched ⇒ `ENGINE_VERSION` NOT bumped (nothing ordering-relevant changes). |
| Votes never change ranking live | Votes are append-only v2 judgments reaching ranking only via compile-judgments → `eval/golden/` fixtures → gauntlet → human-merged PR → new artifact. The UI says so verbatim (§3.1 contract) and never previews a reordering. |
| Engine package does no I/O / untouched | Zero edits under `engine/`; all I/O stays behind the server's existing `ContentQueryPort` usage. |
| One tokenizer | The UI never tokenizes or stems; the only text matching it performs is whole-word, punctuation-tolerant literal emphasis — a display regex built from the engine's own quoted fragment (§3.1 highlight rule); no vocabulary, no ordering effect. The engine response carries no span data, and the emphasis never affects ordering, visibility, or judgments; zero matches render zero highlights, never a guess. |
| Explanations are part of the contract | The why-rail renders the engine's own reason fields mapped to plain language 1:1; the UI invents no reasons (Matched renders "—" rather than guessing — §3.1). |
| No theology scores | Named-by rows state that a curated source names the passage, and which; verdict colors mark the reviewer's call, not any engine judgment; no score numbers anywhere. |
| `/api/v2` judgment endpoints unchanged | No server change touches `/api/*`; the only additions are two read-only static mechanisms (§4.2), each justified. The client adapts to server validation (single-verse missing references, §3.3) — it never asks the server to loosen. |
| Supersede, never delete | §4.5; no delete affordance exists; suggestions state permanence rather than faking retraction; History renders replaced records. |
| Honest effect timing | No surface says a call "ships"; receipts say "goes in for review with the next reviewed update" and name the human review (§3.3); Finish up derives "What will be written" from the actual compile plan's changed bytes, never from templates the data cannot produce (§3.7). |
| Gates: never report pass unrun | UI phases add tests that actually run (vitest + Playwright); the flip keeps the old static-contract tests running against the moved file; no eval gate or `eval/budgets.json` value is touched. |
| Adding data closes measured gaps | This plan adds no data. "Worth a look next" surfaces the server's own measured-gap inbox; suggestions become fixtures only through the gauntlet's Admission Report and a human merge. |
| Consumer contract (implementation-plan §5) | No public engine type, artifact schema, or descriptor changes — Maskil / LH Worship Setlist / Versed unaffected; D41's PR states this explicitly. |

---

## 6. Delivery phases
Every phase: its own PR for human merge; old UI stays default at `/` until D41; exit =
demo spec green + `npm run typecheck --workspace workbench` + `npm test --workspace
workbench` (Playwright via `npm run test:browser --workspace workbench`; fresh
containers first run `npx playwright install chrome`). Every P1–P4 PR description
states the development URL — after `npm run serve --workspace workbench`, open
`http://127.0.0.1:8787/study` — so Jesse can reach the new page without
out-of-band instructions (the old console at `/` is byte-untouched and cannot
link to it). Specs follow the repo pattern:
throwaway `http.createServer` serving `../static/study.html` — read via
`readFile(new URL('../static/study.html', import.meta.url))` exactly as
`core-review.spec.ts:17` reads the old page; this path is load-bearing and
retargets to `../static/index.html` at D41 — all `/api/**` + `/fonts/**` mocked via
`page.route`, zero console/page errors asserted.

### P1 — Shell, theme, real search (read-only) · PR "study: shell + search"
- **D1. Commit `workbench/DESIGN.md`** — the prototype token sheet (transcribed from
  `dc.html:14–38`, both themes, with §3.0's four pre-approved replacements applied —
  the two `--text-3` tiers and the two light verdict colors — plus the added
  `--control-border` token; the committed table carries the passing values), rename tables, keyboard
  model, and the §3.1
  reason-pill mapping table (family → pill string, so Jesse reviews the wording
  against the covenant's no-interpretation rule), plus a "Deviations" section: fonts
  unsubsetted per OFL; the answer-sheet copy substitution §3.7 **and, beside it, the
  Write-button/success copy substitution ("Write {n} calls to the answer sheet" /
  "{n} calls are now on the answer sheet." replacing the prototype's "Write {n}
  judgment(s) to fixture files" / "…in the answer files" — §3.7)**; the four §3.0
  contrast deviations with their measured ratios (light `--text-3` #847F73 →
  #6E695E, dark `--text-3` #8A8478 → #948E81, light `--v-affirm` #2F7A52 →
  #2C734D and light `--v-missing` #8C6C1E → #80621B — the two verdict colors that
  failed 4.5:1 as 12–13px chip text over their own washes; light `--v-notrel` and
  the whole dark verdict column pass unchanged), the added `--control-border`
  token with its per-theme values and its inputs-and-picker-only usage rule
  (§3.0/D35(b)), and the `--text-faint` WCAG-exempt reservation;
  any later token change the D35 audit forces is appended here. AC: a vitest
  (`designTokens.test.ts`) parses the DESIGN.md token table and
  asserts every token name from the `dc.html:14–38` block appears with a value in
  **both** the light and dark columns (the check is over token *names* — §3.0's four
  deviations change values only, and the added `--control-border` is a superset
  entry a name-coverage check does not forbid, so it passes unchanged); that the three rename tables contain exactly
  the 7 source, 11 state, and 4 verdict entries matching the server enums —
  `REVIEW_CASE_SOURCES` and the four main-flow actions
  (`essential`/`helpful`/`irrelevant`/`missing`) in `workbench/src/judgments.ts`,
  and the 11 case states in `CASE_STATES`, **`workbench/src/cases.ts:23–35`** (the
  states are NOT exported from judgments.ts — a test importing them from there
  would fail at import time); and that the pill table's family column covers exactly
  the nine non-`reference` `SignalFamily` values from
  `engine/src/reasons/types.ts:20–32`.
- **D2. Vendor fonts** per §4.7. First step: confirm the pinned upstream releases
  actually contain variable woff2 for regular + italic. If one does not, fall back in
  order: (a) commit the unmodified upstream variable TTF and extend the font route's
  allowlist/content-type to `font/ttf` (§4.2), or (b) commit a woff2 conversion, treat
  it as a Modified Version under OFL (rename per Reserved Font Name rules), and record
  the tooling + rename in DESIGN.md Deviations. Record the chosen path in
  `fonts/README.md`. AC: the font files, two `OFL.txt`, and `fonts/README.md` with
  upstream URLs + sha256 lines + the chosen-path note exist; and a committed vitest
  `workbench/test/fontProvenance.test.ts` reads the sha256 lines from
  `workbench/static/fonts/README.md`, hashes each committed font file, and asserts
  equality — so a re-vendored or silently modified font file (the exact
  OFL-provenance risk this item controls) fails `npm test`, not review; a one-off
  recompute at merge time is not a standing guard.
- **D3. Server: font route** per §4.2(2). AC: vitest — GET a known font → 200,
  `content-type: font/woff2` (or `font/ttf` per D2's chosen path), etag, nosniff;
  unknown path under `/fonts/` → 404; route serves in degraded startup mode.
- **D4. Server: secondary static pages** per §4.2(1). AC: vitest — `/study` serves the
  new page with etag + nosniff when present and snapshot-valid; `/advanced` → 404 while
  no file exists; a missing/invalid secondary file does not degrade startup; a redirect
  entry answers 302 with the mapped `Location`; `/` still serves the old page
  byte-identically.
- **D5. study.html skeleton**: protocol meta, token sheet + theme cycler (§3.10 incl.
  the Auto change listener, `color-scheme`, and the head theme-stamp micro-script
  placed before the `<style>` block so first paint is theme-correct — §3.10/§4.8),
  header/nav/landmarks, 3-col grid,
  `ROUTES` constant, `requestJson`, `node()/clear()` helpers, §4.8 section markers,
  boot fetches (§4.3 Boot row). AC: vitest — `resolveStaticSnapshot` accepts
  study.html (protocol marker + all `REQUIRED_INLINE_ROUTES` literals); Playwright —
  theme cycles auto→light→dark→auto on `data-theme`, persists across reload; dark
  paints `html`/`body` background from tokens; emulating a `prefers-color-scheme` flip
  while in Auto updates `data-theme` without reload; with `study.theme='dark'` seeded,
  an `addInitScript` recorder asserts
  `document.documentElement.dataset.theme === 'dark'` already at DOMContentLoaded
  (before the main IIFE's boot fetches) — no light-first flash; **the §3.1 boot
  state**: with the mocked `GET /api/v2/cases` returning `[]`, the center pane shows
  the search bar and the effect-timing contract sentence, zero result cards render,
  and no `/api/search` request appears in the route log before the first submit;
  with `study.ui.v1.lastQuery` seeded to "mercy", the search input's value is
  "mercy" on load and still no `/api/search` has fired. **The contrast audit lands
  in this item, with the token sheet**: `workbench/test/contrast.audit.test.ts` is
  committed here with `pairs.json`'s text-tier pairings (entry shape, `minRatio`,
  `exempt`, and compositing rules per D35's audit spec) and stays green from P1
  on — §3.0's four pre-approved replacement values (the `--text-3` tiers and the
  light `--v-affirm`/`--v-missing` verdict colors) exist precisely so it passes
  from day
  one, and the tokens are settled before any screen is built on them; D35 extends
  the same file with the non-text (1.4.11) checks and the ARIA role assertions.
- **D6. Real search + results (read-only)**: form → `GET /api/search`; the §3.1
  blank-submit no-op; the §3.1 post-search focus handoff; the full §3.1
  four-way kind handling (discovery-with-results / discovery-empty / reference /
  invalid-reference); top-10 cards — unfocused compact form + focused verse panel
  (Literata, verse body fetched via `GET /api/passage` on focus per §3.1's
  verse-body-source rule — per-verse `sup` markers for ranges, excerpt
  placeholder/fallback — boundary-guarded punctuation-tolerant fragment
  highlighting, attribution)
  per §3.1; tail
  divider + compact rows (no actions yet) with the §3.1 read-before-rescue rail
  binding; why-rail Why + Context tabs incl. the
  pill mapping and Matched binding; request-sequence stale-drop. AC: Playwright —
  mocked search renders
  cards in exact mock order; after submitting a mocked search,
  `document.activeElement` is card #1 and pressing J focuses card #2 — no character
  is inserted into the search input (its value is asserted unchanged) — the §3.1
  handoff at work; unfocused cards each render reference + single-line
  excerpt and exactly one expanded card exists after pressing J twice; divider shows
  "Lower results (N) —…" and expands; with a collapsed tail, J from card #10 focuses
  the divider button and Enter expands it; J then focuses tail row #11 (§3.1
  boundary rule), which fronts the Context tab and fires `GET /api/v2/context?ref=`
  with that row's reference, rendering the mocked verses (§3.1 read-before-rescue
  binding); K on card #1 and J on the last card of a 7-result mock leave focus
  unchanged (plain J/K never wraps); the reference kind and a zero-result discovery
  show their §3.1 copy; a mocked
  `kind:'invalid-reference'` response renders the §3.1 invalid-reference message, no
  result cards, the query preserved in the search bar, zero console errors;
  pressing Enter in an empty search bar, and again with a whitespace-only value,
  fires no `/api/search` request and produces zero console errors; a mocked
  result whose verse text is "mercy, and truth are met together" and whose reason
  label is `Contains "mercy and truth"` renders exactly one `<mark>` spanning
  "mercy, and truth" (the punctuation-tolerant regex at work — note the engine never
  mints single-significant-word `Contains` labels: `isMeaningfulPhraseFragment`,
  `lexical.ts:81–86`, requires ≥2 significant words, so a bare `Contains "mercy"`
  fixture would test a class the engine cannot produce — single words reach the
  highlighter only via `Exact phrase`); a mocked result with verse text "Beloved,
  let us love one another: for love is of God; and every one that loveth is born
  of God" and reason label `Exact phrase` for query "love" renders `<mark>` on
  exactly the two standalone "love" occurrences and zero `<mark>` elements inside
  "loveth" or "Beloved" (the §3.1 boundary guards at work on the most common
  query class), and a result with no
  lexical reason renders zero `<mark>` elements; three mocked results whose
  highest-points reasons are family `concept_anchor`, `token_overlap`, and
  `cross_reference` render the pills "Matched the meaning", "Shares key words", and
  "Close in meaning" respectively; the mocked results carry distinctive `score` and
  reason `points` values (987.65 / 431) and those numerals appear nowhere in the
  rendered page text (no-score covenant, §5); the Matched row shows the mocked
  fragment and "—" when no lexical reason
  exists; focusing a card fires `GET /api/passage` for its reference and renders
  the mocked verses with `sup` numbers; a mocked result with reference
  "Psalm 23:1-4" fetches `/api/passage` and renders four `sup` verse numbers
  (mocked — every member verse numbered), while its unfocused form still shows one
  ellipsized line; with the passage mock failing (500), the focused range card
  keeps the joined excerpt with zero `sup` markers and zero console errors;
  Context renders mocked ±2 verses; of two racing searches only the latest
  renders.
- **D7. ⌘K quick lookup** per §3.12 incl. three-kind handling. AC: Playwright — Ctrl+K
  opens with focus in its input; typing ≥3 chars fires mocked `/api/search`; Enter on a
  row closes the dialog, fills the main search bar, renders those results, and
  `document.activeElement` is result card #1 (§3.1 handoff); a mocked
  invalid-reference response renders the §3.1 message and no rows; Esc closes and
  returns focus to the opener; footer contains "never creates a case by itself".
- **D8. Loading / error states** per §3.11 (skeletons, search-error retry, the
  results live region + skeleton `aria-busy`).
  AC: Playwright — delayed mock shows skeleton then results; the skeleton container
  carries `aria-busy="true"` during the delayed mock and no `aria-busy` after settle;
  the results region's visually-hidden `aria-live="polite"` element receives
  "{n} results for "{q}"" after the mocked search resolves (and the §3.1 empty-state
  sentence for a zero-result mock); 500 mock shows "The engine
  did not answer…" and Retry refires the request.
- **D9. P1 demo spec** `workbench/e2e/study-p1.spec.ts` covering D5–D8 end-to-end.
  AC: green with zero console/page errors; existing specs untouched and green.

### P2 — Voting wired end-to-end · PR "study: judgments"
- **D10. Cases store + lazy creation**: boot `GET /cases`; normalized-query dedupe;
  first-vote auto-create then state → `reviewing`; "Add to my queue"; the "New search —
  your first call starts its case." hint. AC: Playwright — first E on a case-less query
  issues POST /cases, then POST /judgments with the returned token, then POST state
  `{state:'reviewing'}` (bodies asserted); "Add to my queue" issues POST /cases only;
  searching an already-open query issues GET /cases/:uuid, not a create.
- **D11. Snapshot handling** per §4.6: snapshot-sourced top block; agreement check;
  409 silent retry-once; branch-correct mismatch banners; lazy-creation race guard.
  AC: Playwright —
  mocked 409 then identical fresh snapshot ⇒ judgment retried once with the new token,
  no banner; mocked 409 then a **changed** fresh snapshot ⇒ the list re-renders from
  it, the banner shows the 409-recovery string ("…the current ones — earlier calls
  stay on record."), and no auto-post occurs; a mocked live-tail/snapshot
  reference-per-rank disagreement ⇒ the top block still renders the snapshot's list
  and the banner shows the agreement-failure string ("…the ones this case was opened
  on — earlier calls stay on record.") — each branch asserts its exact §3.1 string,
  never the other's.
- **D12. Verdict toolbar**: E/H + fused top-N picker (persisted default 3, keyboard
  radiogroup per §3.2), §3.2 visibility rules, toast + auto-advance + wrap.
  AC: Playwright — E posts `{action:'essential',withinTop:3,targetId,…}` and the
  toast reads "Marked {ref} Essential (top 3)" with the "Undo [U] — your call stands
  until you choose a new one" chip; after clicking
  segment "5", E posts `withinTop:5`, the toast reads "Marked {ref} Essential
  (top 5)" (the receipt names the value that rode the POST — §3.2), and the picker
  value survives reload; focusing the picker and
  pressing ArrowRight then E posts the changed `withinTop` (selection follows
  focus — §3.2);
  focus advanced to next unjudged row.
- **D13. Not-relevant interview** with fixes (§3.2, §3.13.1–2): auto + concept
  two-step, verbatim copy incl. demotion disclaimer and the no-fragment fallback, the
  required concept-mode why field, Esc
  closes, J/K inert while open, Cancel in both modes, diagnosis mapping per §4.4 incl.
  the unresolved-label fallback. AC: Playwright — Esc with interview open closes it, no
  POST, focused item unchanged; J with interview open changes nothing (same item, still
  open); the concept-mode confirm button stays disabled until the why field is
  non-empty; "No, it doesn't" + why posts `diagnosis:'wrong-anchor'` + `conceptId` +
  that text as `note`, with **no `diagnosisInferred` key in the body** (asserted —
  the server 400s any value but `true` or absence, `judgments.ts:551–552`);
  "Yes"→"Right — not a fit here" + why posts `diagnosis:'concept-misfire'` +
  `conceptId` + `note`, likewise with no `diagnosisInferred` key; auto-confirm posts
  `diagnosis:'lexical-noise', diagnosisInferred:true` and its copy quotes the mocked
  lexical fragment; with a mocked result whose Named-by label is absent from the
  mocked `/api/concepts` list, the interview renders the auto-mode copy and the POST
  carries `diagnosis:'lexical-noise'`, `diagnosisInferred:true`, no `conceptId` key,
  and a `note` containing
  `concept label "{namedBy}" (unresolved id)` (§4.4 fallback); with concept evidence
  absent AND no lexical fragment, the no-quote fallback copy renders.
- **D14. Judged chips, prior calls, supersede, undo** per §3.2/§4.5: judged-map from
  GET /judgments with chain resolution; "Your call from {date}" chips; re-judge posts
  `supersedes`; U reopen flow with exact chip copy and the third queue-dot state.
  AC: Playwright — a mocked prior judgment renders the prior-call chip; the chip's
  Undo link carries `aria-label` and `title` "Undo — nothing is erased: your call
  stands until you make a new one." (asserted alongside the chip-copy assertions);
  H on it posts
  `supersedes:<that id>`; U flips the chip to "Reopened — your earlier call stands
  until you make a new one.", the row's queue dot aria-label becomes "Reopened — your
  earlier call stands", and the next E posts `supersedes`; after a commit
  auto-advances focus to card #2, pressing U moves `document.activeElement` to the
  reopened card #1 (asserted), and the next E posts `supersedes:<card #1's
  judgment id>` with card #1's `targetId` — never card #2's (both body fields
  asserted; the §3.2 undo-retargets-focus binding); clicking the chip's Undo link
  asserts the same focus move; a second re-judge supersedes
  the newest id, not the first.
- **D15. Effect-timing contract copy** in its three placements (results-rail footer,
  empty state, onboarding placeholder for P5). AC: Playwright — the contract string is
  present verbatim in (a) the results-rail footer and (b) the empty-results state
  (mock a zero-result search), and (c) is asserted absent from any toast after a vote.
- **D16. Read-only degraded handling** per §3.11. AC: Playwright — mocked read-only
  health ⇒ banner verbatim with `background` resolving to the `--v-missing-wash`
  token; verdict buttons, tail-rescue buttons, and "Add to my queue" all
  `disabled` (the full §3.11 control list as of this phase — the list grows, and
  **each later §3.11 control lands with its own read-only assertion in its own work
  item**: D17 the bulk bar, D18 the rescue preview's confirm, D20 the missing form's
  Submit, D27 the Compare verdicts, D29 the Sign input and Write button — so no
  POST-issuing control ever ships without a mechanical read-only check); E toasts
  "Read-only right now — this call was not
  saved." with no POST; mocked recovery on window focus re-enables.
- **D17. Bulk select**: Space toggles, floating bar, judged rows' checkboxes disabled
  with the §3.2 aria-label, "Mark all helpful" posts one `helpful` judgment per
  selected row (serially, each with the token), Clear, the §3.2 bulk receipt. AC:
  Playwright — selecting 2
  unjudged rows shows "2 selected · Mark all helpful · Clear" and commit fires exactly
  2 POSTs with `action:'helpful'`; with one judged row present, Space on it selects
  nothing (checkbox `disabled`, aria-label "Already judged — change it on its card"),
  so the selected count always equals the POST count; the bulk toast renders "Marked
  2 passages Helpful." with the exact count and no inline Undo link; pressing U
  immediately after the bulk commit posts nothing and shows the hint toast "Change a
  bulk call on its card."; with the second of three mocked judgment POSTs failing
  (500), exactly one row shows a judged chip, the toast reads "Marked 1 of 3 — the
  rest did not save. Try them on their cards.", the two uncommitted rows'
  checkboxes stay selected, and no further POSTs fire after the failure (asserted
  from the route log — the §3.2 partial-batch receipt, never the all-success or
  "nothing was saved" copy); under mocked read-only health, the bulk bar's "Mark all
  helpful" button is `disabled` and clicking it fires zero `/api/v2/judgments` POSTs
  (the §3.11 bulk-bar entry, asserted where the bar is built).
- **D18. Tail rescue**: button + E on a focused tail row (never Enter — §3.12:
  Enter is a no-op on a tail row) ALWAYS opens the §3.1 rescue preview — no rescue
  posts on the first keypress; confirming posts `{action:'missing', reference,
  withinTop:10}` with `reference` resolved per §4.4 (always via `GET /api/passage`,
  never the raw `DiscoveryResult.reference`: a single-verse row's preview shows its
  one verse with "Confirm — should be near the top"; a range row — a collapsed
  anchor run — shows the pick-chip mode with the run's first verse pre-selected);
  H/X/M on tail rows → hint toast; rescue toast + receipt
  chip verbatim (§3.1, incl. permanence sentence); the §3.1 read-before-rescue
  rail binding verified on the action path (built read-only in D6, re-asserted
  here because it — with the preview layer — is what stands between one ellipsized
  snippet line and an uncorrectable commit). **D18 builds the shared rescue/pick
  preview layer specified in §3.1/§3.3** — pre-filled reference, single-verse
  confirm mode and per-verse "Add this verse" pick-chip mode, in-layer permanence
  line, confirm/cancel, reference input omitted; D20 extends this same component
  with the reference input, debounced live preview, and unresolved/
  failed-resolution copy — one component, two entry modes, so an implementer
  reading phase order does not duplicate it. AC: Playwright — a confirmed rescue
  posts the
  exact body and the toast reads "Noted — {ref} should rank near the top for "{q}".
  Saved to your calls for the next reviewed update."; on a case-less query, a
  confirmed rescue issues POST /api/v2/cases `{query, source:'manual'}`, then POST
  /api/v2/judgments `{action:'missing', reference, withinTop:10}` with the returned
  snapshotToken, then POST state `{state:'reviewing'}` — same sequence and race guard
  as D10, bodies asserted; the §3.1 pre-commit line "A rescue is recorded like a
  suggestion — it can't be taken back here." is visible on the expanded tail's header
  **before any POST occurs** (asserted on expansion, prior to the rescue);
  focusing mocked tail row #11 fetches `/api/v2/context` for its reference and
  renders the mocked verses in the fronted Context tab before any rescue POST
  occurs (asserted: the context request appears in the route log before the
  first `/api/v2/judgments` POST); **Enter on a focused tail row fires no POST and
  opens no layer (asserted), while E and the row button both open the rescue
  preview (asserted: the layer is visible and zero judgment POSTs have fired)**;
  a mocked single-verse tail row opens the preview showing its one mocked verse —
  E alone posts nothing (asserted) — and clicking "Confirm — should be near the
  top" posts a `reference` equal to the mocked `/api/passage` resolution's
  canonical `passage.reference`, with the §3.3 permanence line visible inside the
  layer before that POST; a mocked tail row with reference "Psalm 23:1-4" opens the
  pick chips on rescue (E alone posts nothing), and confirming a picked chip posts
  that verse's mocked single-verse canonical reference — the range string
  "Psalm 23:1-4" appears in no POST body (asserted across the route log); a mocked
  tail row with reference "Psalm 46:1-3", rescued with the pre-selected default
  kept, posts reference "Psalm 46:1" — the run's first verse, mocked
  `/api/passage` resolution asserted — never the range string, and the §3.3
  permanence line is visible inside the rescue preview before the confirming POST;
  **on preview open, `document.activeElement` is the Cancel button (single-verse
  confirm mode) / the pre-selected pick chip (pick-chip mode) — never the Confirm
  button — and pressing Enter immediately after E fires no `/api/v2/judgments`
  POST (asserted for both modes; the §3.12 focus-contract exception)**; a mocked
  rescue confirm answered 400 `validation_failed` whose message contains "already
  present in the judged result set" closes the preview layer, focuses the matching
  top-block card, and shows the §3.3 already-displayed toast — not the generic
  §3.11 toast (asserted; the §3.1/§4.6 mismatch branch); with the tail row's
  `/api/passage` mock failing (500), E opens the preview showing the retry
  sentence ("The engine did not answer. It may be restarting — try again in a
  moment."), Confirm is `disabled`, zero judgment POSTs fire, and Retry refires
  the resolution and enables Confirm on success (asserted for a range row — the
  §3.1 resolution-timing branch);
  Esc in the rescue preview closes it with no POST and returns focus to the tail
  row; under mocked read-only health the tail rescue buttons are `disabled` and E
  opens no preview and fires no POST (the §3.11 toast shows instead), and with the
  preview already open when a mocked health refetch (window focus, §3.11) comes
  back read-only, the preview's confirm button is `disabled` and clicking it fires
  no POST; rescued
  row shows a receipt chip carrying the §3.1
  permanence sentence (for a range rescue the chip names the picked verse, not the
  range); pressing U while the rescue toast is visible posts nothing and
  shows the permanence sentence; X on a tail row fires no POST and shows the hint.
- **D19. P2 demo spec + payload contract vitest** — `study-p2.spec.ts` covering
  D10–D18 incl. every payload assertion above, plus
  `workbench/test/judgmentPayloads.contract.test.ts`: because the Playwright specs
  mock every `/api/**` route, a payload-contract error would otherwise surface only
  in D42's manual smoke — so this vitest feeds one representative body per §4.4 row
  through `createJudgmentLog(...).submit` (`workbench/src/judgments.ts:854`, with a
  stubbed snapshot context and stubbed
  `resolveReference`/`resolveReferenceTargetId`), asserting every row validates ok
  against the real server validator. AC: both green, zero console/page errors in the
  spec; a payload the server would reject fails `npm test`, not the manual smoke
  (negative fixtures: a body with `diagnosisInferred:false` is asserted to FAIL
  validation, and a `missing` body whose stubbed `resolveReferenceTargetId`
  returns `null` — the multi-verse/range case, `judgments.ts:512–515` — is
  asserted to FAIL with the "could not be resolved to an exact target identity"
  reason, pinning the very rejection the §3.1/§4.4 range-rescue rule exists to
  avoid).

### P3 — Suggestions · PR "study: missing passages"
- **D20. Missing-passage form** per §3.3: all entry points, live debounced
  `GET /api/passage` preview, unresolved copy, the failed-resolution line, the
  pre-commit permanence line, single-verse rule with pick chips,
  canonical-reference rule, disabled-until-single-verse submit, top-N picker, note
  placeholder verbatim, Esc/Cancel + focus contract, already-displayed redirect (client
  pre-check against the displayed top-10 AND the fetched tail — §3.3 — plus
  server-message detection), submit → `{action:'missing', reference,
  withinTop, note?}`. AC: Playwright — the §3.3 permanence line ("A suggestion can't
  be taken back here — …") is visible on the open form **before any POST occurs**
  (asserted prior to submit); a mocked non-resolving input shows the
  doesn't-match-a-passage line after the 1.5s settle delay and Submit stays
  disabled; a mocked single-verse ref renders its verse and
  enables submit; a mocked 2-verse reference renders both verses with per-verse "Add
  this verse" pick chips, keeps Submit disabled, shows the one-verse copy, and no POST
  occurs; after picking a chip, submit enables and the POST body's `reference` equals
  the mocked single-verse resolution's canonical `passage.reference`, not the typed
  text; a mocked-invalid ref keeps submit disabled and shows the unresolved line;
  submit posts the exact body incl. the typed note; on a case-less query, submit
  issues POST /api/v2/cases before POST /api/v2/judgments (bodies asserted); a ref
  matching a displayed top-10 card focuses that card and toasts §3.3 copy without
  posting; with a displayed top-10 card mocked as the range "Psalm 23:1-4", typing
  "Psalm 23:2" (mocked `/api/passage` resolutions for both) triggers the
  already-displayed toast and scrolls to that card with zero `/api/v2/judgments`
  POSTs — the member-verse comparison, not the string compare; a typed ref matching
  a mocked tail row's reference expands the tail, focuses that row, shows the
  rescue-instead toast ("That passage is already in the lower results — rescue it
  there instead."), and fires no judgment POST; a mocked 400 `validation_failed` whose message contains "already present in
  the judged result set" triggers the already-displayed toast + scroll, not the
  generic §3.11 toast; pressing U while the suggestion receipt is the toast target
  posts nothing and shows the permanence sentence; pressing Enter in the reference
  input while Submit is disabled (unresolved input, and again with a 2-verse
  resolution before any chip is picked) fires no `/api/v2/judgments` POST (asserted
  from the route log); after a mocked single-verse resolution, Enter in the
  reference input posts the same body as clicking Submit (asserted — the §3.12
  missing-form Enter row); **pressing M before any search, and again on a mocked
  `reference`-kind view, opens no form and fires no POST — the §3.2 hint toast
  "Search words or phrases first — a suggestion attaches to the search that misses
  it." renders (asserted, both states), and the verdict toolbar is absent from the
  DOM in both** (the §3.2 M gate); under mocked read-only health
  the form's Submit is `disabled` (§3.11's control list) and no POST fires.
- **D21. Empty-results suggestion path** (§3.1 empty state → form pre-linked to the
  query; case lazily created on submit per decision 6). AC: Playwright — empty search
  → "Add the missing passage" → submit issues POST /cases then POST /judgments (bodies
  asserted).
- **D22. "Your suggestion" receipt card** (§3.3), incl. prior-session missing
  judgments. AC: Playwright — after D20 submit, a card labeled "Your suggestion"
  containing "Saved to your calls. It goes in for review with the next reviewed
  update." and the permanence sentence appears after rank #10 and is absent from the
  rank-badged list.
- **D23. P3 demo spec** `study-p3.spec.ts`. AC: green, zero errors.

### P4 — Queue, Compare, History, Finish up · PR "study: flow + signing"
- **D24. Waiting queue** (§3.4): open-case buttons with judged counts; switch syncs
  search bar + selects first unjudged and fetches the live tail (§4.3); counts
  live-update incl. the reopened count; queue empty state. AC: Playwright — two mocked
  open cases; clicking the waiting entry flips rail header, search input value, and
  focused row, fires `GET /api/search` for that query, and renders its tail divider;
  **the "{j}/{m}" counts derive from the §4.3 counts-row fetches, not from
  nowhere: one `GET /api/v2/judgments?caseId=…` and one `GET /api/v2/cases/:uuid`
  per open case appear in the route log, j equals the supersede-resolved count of
  the mocked judgments (a mocked superseded record does not inflate j), and m
  equals the mocked `review.result.results.length`; a third mocked case in state
  `merged` renders no queue entry and triggers neither fetch, while one in state
  `judged` renders "{m}/{m}" (the §3.4 open definition, both branches asserted)**;
  counts update after a judgment; **on boot with two open cases mocked whose caseId
  lexicographic order is the REVERSE of their latest-`events[].at` order, the case
  with the newer latest event loads as if its queue row were clicked (asserted —
  the §3.6 client sort, not the server's UUID response order, picks the boot case:
  the boot still loads the most recently touched case even though the response
  lists the other case first) — its case fetches and tail `GET /api/search` appear
  in the route log, the rail header and search input sync (the §3.1 open-case boot
  state), and the queue rows render in the same client-sorted order**; with
  zero open cases the queue section shows
  "Nothing waiting — search for something you would actually type." and no
  `/api/search` fires on boot (§3.1 boot state, case-less half).
- **D25. Per-query done state + next-search chaining** (§3.4 exact copy).
  AC: Playwright — judging all top-block rows shows "All {n} judged." with accent "Next
  search:…" when another open case has unjudged items; clicking switches; with
  everything judged the button is absent and "Review what you decided →" is
  accent-styled.
- **D26. "Worth a look next"** (§3.4). AC: Playwright — mocked inbox renders ≤5
  entries with renamed sources; an entry matching an open case is excluded; click
  submits that query; with an empty mocked inbox the section (header included) is
  absent.
- **D27. Compare** (§3.5): candidates list → blind session start/resume with persisted
  requestId, two lists, synced passage panel, A/B/T/W keys + buttons opening the
  §3.5 one-confirm layer (initial focus on Cancel — the §3.12 exception), reveal +
  immutability copy, empty state. Session/passage field names ported from the old UI's
  compare code (index.html `:2779`, `loadComparisonReviews :3730`). AC: Playwright —
  start posts `{requestId:<uuid>}`, reused after reload; clicking a verse fetches
  passages with exactly `queryId`+`passageId` params; **pressing A alone fires no
  POST and opens the confirm layer (asserted: the layer is visible, its title reads
  "You're calling it: A wins.", its body carries the §3.5 finality sentence, and
  zero session-judgment POSTs have fired); on layer open `document.activeElement`
  is its Cancel button, and pressing Enter immediately after A fires no POST (the
  A-then-Enter slip absorbed); clicking "Confirm — A wins" posts the session
  judgment and
  shows "You preferred Set A — the current engine."; Esc closes the layer with zero
  POSTs and focus returns to the toolbar button that opened it**; empty candidates
  shows §3.5 copy;
  under mocked read-only health (the `readOnly` flag on GET `/api/v2/candidates` and
  mocked `/api/v2/health`), the A/B/T/W buttons are `disabled` and pressing A opens
  no confirm layer and fires
  no POST, toasting "Read-only right now — this call was not saved." (the §3.11
  Compare-verdicts entry, asserted where the controls are built).
- **D28. History** (§3.6): humanized rows, superseded strikethrough + "Replaced by a
  newer call.", zero-calls empty state, lazy per-case fetch, 20 + "Show more", no raw
  IDs. AC: Playwright — a mocked chain (A superseded by B) renders A struck with the
  sub-line and B normal; a rescue performed in-session (via the D18 flow) then
  shown in History renders the "Rescued … from the lower results" phrasing, while
  a mocked prior-session `missing` record renders "Added … as a missing passage"
  (both branches asserted); three mocked cases whose caseId order reverses their
  latest-event order render newest-touched first (the §3.6 client sort asserted —
  the screen's group order matches descending last-`events[].at`, not the mocked
  response order); with zero mocked cases the screen shows "Nothing on record
  yet. Your first call on any search result will appear here." and its "Go to Review
  →" button navigates; a jargon regex (`[0-9a-f]{8}-` and `sha256`) finds zero matches
  in the History screen's text.
- **D29. Finish up** (§3.7): stat tiles across all open cases, pending banner incl.
  reopened counts, what-will-be-written derived from the compile plan's changed set,
  signing gate (12-hex grouped code, exact-match enable), apply with full digest, all
  three outcome paths, empty-changed-set state + footnote. AC: Playwright — **the four
  stat tiles and the pending banner's "{n} of {m}" tally across the mocked open
  cases from the §4.3 counts-row fetch pair (one `GET /api/v2/judgments?caseId=…`
  and one `GET /api/v2/cases/:uuid` per open case, asserted in the route log): each
  tile equals the supersede-resolved mocked judgment count for its action, and m
  equals the summed mocked `review.result.results.length`; a mocked case in state
  `judged` with unwritten calls still contributes to the tiles (the §3.4 open
  definition — a case auto-transitioned on top-10 completion must not vanish at
  signing time) and a mocked case in state `merged` contributes nothing (both
  branches asserted)**; a mocked
  plan whose operations carry real `CompiledFixture` JSON in `afterText` renders "Must
  rank: {ref} in the top {n}" per expectedTop entry and "Must not rank: {ref} — {why}"
  per mustNotRank entry, grouped under the query; an expectedTop ref matching a local
  typed-suggestion judgment carries " (added by you — not shown in the engine's top
  10)" and one matching a locally recorded tail rescue carries " (rescued by you from
  the lower results)" — both branches asserted, and the false phrase "not in the
  engine's results" appears nowhere (§3.7); a mocked note-less legacy mustNotRank
  entry whose fixture `why` is the raw token `wrong-anchor`/`concept-misfire` renders
  the §3.7 plain phrases ("listed under a theme it does not speak about" / "speaks
  about the theme, but is not an answer for this query"), never the token; a
  mocked operation whose `afterText` hashes equal to its `beforeSha256` renders
  nothing and is excluded from the Write button's {n} count; a deletion operation renders
  "Withdrawn: "{query}" — no calls remain to write."; mocked `proposedSelections`
  render the test-corpus line; a locally-reopened judgment's line carries the
  "(reopened — this earlier call stands unless you change it)" suffix; with an
  all-unchanged mocked plan the empty-changed-set copy + footnote render; **the
  Write button's label reads "Write 1 call to the answer sheet" with a one-line
  changed set and "Write 3 calls to the answer sheet" with three (real
  pluralization asserted, never "(s)" — §3.7)**; button
  disabled until the shown code is typed (case-insensitivity tested); pressing Enter
  in the sign input before the code matches fires no `/api/v2/compile/apply` POST,
  and with the exact code typed Enter posts the same body as clicking Write
  (asserted — the §3.7 Enter rule); apply posts the
  FULL mocked digest; 409 `stale_preview` re-previews with a new code and the §3.7
  line; success shows "Written." and "{n} calls are now on the answer sheet…" (the
  answer-sheet copy); **after the mocked successful apply, the follow-up
  `POST /api/v2/compile/preview` fires exactly once (route log), and with its
  mocked plan all-unchanged for one case's query, that case's queue row and its
  stat-tile contributions disappear while a case with remaining changed operations
  stays (the §3.7 post-apply drop, both branches asserted)**; under mocked read-only
  health the Sign input and the "Write {n} calls to the answer sheet" button are
  `disabled` and no `/api/v2/compile/apply` POST fires (the §3.11 Sign entry — the
  highest-stakes control ships with its own mechanical read-only check).
- **D30. Advanced summary screen** (§3.8): health/identity in mono, console link href
  `/` (pre-flip), Back to Review. AC: Playwright — the trio from mocked `/api/meta` is
  visible in mono only on this screen; the console link href is exactly `/`.
- **D31. P4 demo spec** `study-p4.spec.ts`. AC: green, zero errors.

### P5 — Polish, a11y, onboarding, hardening, flip · PR "study: finish + flip"
- **D32. Onboarding** (§3.9): 3 real-keypress cards, Skip button, persisted flag,
  contract sentence, focus contract. AC: Playwright — fresh storage shows card 1; only
  J advances (E does not); one onboarding card contains the contract sentence verbatim;
  after ? the flag is set and reload skips the tour; Skip works by mouse.
- **D33. `?` shortcut sheet** (§3.12 groups, "Esc to close", opened by key and by the
  rail-footer button) + the single-key shortcuts toggle. AC: Playwright — ? opens, the
  four groups render, Esc closes; the footer button opens the same sheet; toggling
  "Single-key shortcuts" Off makes E on a focused row a no-op (no POST) while the
  toolbar button still commits, and the setting survives reload.
- **D34. Keyboard/focus audit**: roving tabindex in the results list, Esc layer order
  (interview → form / rescue preview / Compare confirm → lookup → sheet → bulk),
  input typing suppression, the §3.12
  layer focus contract on every layer, every §3.12 row implemented. AC: Playwright — a
  scripted walk asserts each §3.12 mapping (one assertion per row — the tail-row
  Enter no-op included: Enter on a focused tail row fires no POST and opens no
  layer; the post-search focus-handoff row included: after a mocked submit,
  `document.activeElement` is card #1 and the search input's value is unchanged;
  the missing-form Enter row included: Enter in the reference input with Submit
  disabled fires no POST, Enter with a resolved single verse posts — same
  assertions as D20's, re-walked here so the audit stays complete against the
  table; **the two M rows included: M before any search, and again on a mocked
  `reference`-kind view, opens no form and fires no POST while the §3.2 hint
  toast renders (asserted — same as D20's, re-walked), and M with discovery
  results on screen opens the form; the A/B/T/W row included: A opens the §3.5
  confirm layer and fires no POST until its Confirm — same as D27's, re-walked**)
  and the layer focus contract's confirm exceptions (initial focus on
  Cancel / the pre-selected chip, per D18; Cancel on the Compare confirm, per
  D27) and the Esc layer
  order with two layers open; with the interview open, Tab pressed repeatedly never
  leaves the dialog; Esc returns focus to the previously focused card (asserted via
  `document.activeElement`); opening the missing form focuses its reference input and
  closing it restores focus to the opener.
- **D35. Contrast + ARIA audit**: extends the vitest
  `workbench/test/contrast.audit.test.ts` that landed with the token sheet in D5
  (P1) and has stayed green since — this item's audit spec is written here in
  full because D5 builds from it; the text-contrast half plus pairs.json is D5's
  landing, the non-text (1.4.11) checks and the ARIA/Playwright role assertions
  below are this item's extension. The `.test.ts` name is load-bearing:
  `npm test` in workbench is `vitest run`, and `workbench/vitest.config.ts` sets no
  custom `include`, so vitest's default collects only
  `**/*.{test,spec}.?(c|m)[jt]s?(x)` — a file named `contrast.audit.ts` would never
  run, and `npm test` would pass while the audit executed nothing (exactly the
  CLAUDE.md gate-discipline failure of a guardrail becoming decoration). It parses
  the `:root` and `[data-theme="dark"]` token blocks out of study.html and
  checks, for **both** themes: (a) WCAG AA text contrast (4.5:1 body / 3:1 for
  ≥18.66px bold or ≥24px) for every foreground/background pairing named in a committed
  `workbench/test/pairs.json` (each text tier on ground/surface/panel, verdict colors,
  accent-on-accent-wash, on-accent-on-accent, kbd text, highlight-over-panel,
  `--ink` and each applicable text tier over each `--v-*-wash` composited on
  `--surface` — the read-only banner and judged chips render text over these washes,
  §3.11/§3.1 — and each verdict color over its own wash composited on `--panel`).
  **pairs.json entry shape (binding)**: `{fg, bg, compositeBase?, minRatio: 4.5 | 3,
  use: "<where this pair renders>", exempt?: true}`. `minRatio` is per-entry
  because the same color pair legitimately renders at both sizes — **a pair
  rendered at both body and large sizes appears twice, once per threshold**:
  verdict-color-on-panel appears with `minRatio: 3` (stat-tile numerals, 25px
  Literata) and with `minRatio: 4.5` (chip text, 12–13px). **Each
  verdict-color-over-own-wash pair carries `minRatio: 4.5` — it renders as
  12–13px chip text** (the judged chips and read-only banner, §3.1/§3.11; §3.0's
  light `--v-affirm`/`--v-missing` replacements exist precisely because the
  prototype values measured 4.4966:1 and 4.2552:1 against this threshold). `exempt: true` marks
  `--text-faint` pairings only (§3.0's WCAG-exempt reservation — disabled labels
  and decorative glyphs); the ratio check skips them but the count assertion still
  counts them, so the tier's uses stay reviewed data.
  **For any rgba token, the audit composites it over its named base token (listed
  per pair in pairs.json as `compositeBase`) before computing the WCAG ratio** —
  every wash and
  highlight token carries alpha, and a ratio computed against raw rgba is
  undefined, so the compositing base is part of the reviewed data, not implementer
  guesswork. And
  (b) WCAG 1.4.11 non-text contrast (≥3:1) for the `:focus-visible` outline vs every
  background it appears over, verdict dot colors vs `--surface`, and the
  interactive-boundary token: **the input-border assertion measures
  `--control-border` vs `--surface`** — the §3.0 added token (light `#8F897C`,
  3.36:1; dark `#6B6558`, 3.01:1; logged in DESIGN.md Deviations) used only on
  text inputs (search bar, reference input, sign input) and the segmented
  picker's selected-state boundary, which the same assertion covers.
  `--hairline-strong` is NOT asserted against 3:1: it stays on decorative
  dividers and card edges and is listed in the test file's exempt set with the
  reason "not the sole indicator — cards and buttons are identified by fill,
  text, and the focus ring" (it measures 1.47:1 vs `--surface` in both themes, so
  asserting it would mean either a guaranteed-red audit or darkening the design's
  signature hairlines). There is **no** `--kbd-border` 3:1 check: it is listed
  exempt with the reason "decorative — the keycap's text carries the information
  (`--text-2` on `--kbd-bg` measures 6.49:1)" (the border itself measures 1.26:1
  light). **Never leave an assertion in this audit that the committed token sheet
  fails** — a check that cannot pass as specced is the §5 gate-discipline failure
  in miniature; exemptions are reviewed data with stated reasons, not silent
  skips. Each remaining pairing is a vitest assertion that names the failing pair
  in its message. The text-tier half has been green since P1: §3.0's four
  pre-approved replacements (`--text-3` light/dark, light
  `--v-affirm`/`--v-missing`) exist so that no known-failing prototype value ever
  reaches this phase — the residual rule (a pairing some later screen adds and
  fails is fixed by adjusting the failing tier, logged in DESIGN.md Deviations)
  covers additions only, never a deferred redesign of the tiers every screen was
  built on. Also verify
  roles: banner `role=status`, toast `aria-live=polite`, toolbar/tablist/dialog roles,
  radiogroup on the picker, per-button labels ("Mark {ref} essential"), 36px min row
  height; the tail divider button carries `aria-expanded` reflecting its state and
  `aria-controls` naming the tail list container (§3.1); every §3.12 layer's dialog
  element carries `aria-modal="true"` and `aria-labelledby` pointing at its title;
  and the §3.11 results live region exists and receives its count text after a
  mocked search — all asserted in the D35 Playwright role checks. AC: the file is
  collected by `vitest run` (it appears in the run's file
  list) and passes for BOTH light and dark columns; deleting one pair from pairs.json
  fails the count assertion against the token
  sheet (negative fixture); an entry with `minRatio` absent and no `exempt: true`
  fails the schema validation (second negative fixture); Playwright asserts the
  roles/labels; any token change
  appears in DESIGN.md.
- **D36. Motion**: toast rise 200ms with the exact bezier; nothing else animates;
  `prefers-reduced-motion` disables all. AC: Playwright with reduced-motion emulation —
  computed animation/transition durations are 0s everywhere; without it, only the toast
  animates.
- **D37. Responsive floor**: usable at 1024×768; no horizontal scroll at ≥1024; verse
  measure ≤68ch holds. AC: Playwright at 1024×768 —
  `document.documentElement.scrollWidth <= window.innerWidth`; the verdict toolbar's
  Essential button and the search input have `boundingBox` entirely inside the
  1024×768 viewport, and a Playwright `click()` on each succeeds without the page
  scrolling horizontally (scrollLeft stays 0) — "operable" means those assertions,
  not a visibility check.
- **D38. Build-change notice + re-search links**: on boot compare `/api/meta` trio to
  `study.ui.v1.lastSeenMeta`; if changed, one dismissible card whose copy renders
  `engineVersion` **only** — "The engine was updated since your last visit (0.3.0 →
  0.4.0). Searches you reviewed may rank differently now."; when the version is
  unchanged but a fingerprint differs (the common case — a curation update), render
  "The engine's data was updated since your last visit. Searches you reviewed may
  rank differently now." with **no codes** — sha256 fingerprints never reach the
  Review surface (§3.8: the identity trio appears only on Advanced and the signing
  chip). Below the notice, under the heading "See how your reviewed searches rank
  now", render the reviewer's case queries (from the boot `GET /api/v2/cases` list)
  as one-click re-search links. **Store the new trio only when the card is
  dismissed** — storing it on boot would silently eat the notice for a user who
  reloads without dismissing. This is the v1 close-the-loop
  surface standing in for the deferred diff card (§2.3). AC: Playwright — seeded old
  meta + different mock ⇒ card appears once with the judged-query links; clicking a
  link submits that query; reloading **without** dismissing shows the card again;
  only dismiss+reload suppresses it; seeding `lastSeenMeta` with engineVersion
  "0.3.0" and mocking `/api/meta` engineVersion "0.4.0" renders the card text "The
  engine was updated since your last visit (0.3.0 → 0.4.0). Searches you reviewed
  may rank differently now." verbatim — the version-change branch, the only place a
  version string may render — and the jargon regex finds zero matches in it; under
  a fingerprint-only mocked change the no-codes sentence renders and the D28
  jargon regex (`[0-9a-f]{8}-` and `sha256`) finds zero matches in the card's text
  (both branches asserted, never one standing in for the other).
- **D39. Error-state hardening**: commit an `ENDPOINT_FAILURES` table in
  `workbench/e2e/endpointFailures.ts` — a **plain data module with no
  `@playwright/test` import**, imported by `study-p5.spec.ts` — mapping **every
  function in the api layer** (§4.8 `// §api`: one
  named function per endpoint) to `{mockedFailure, expectedCopyOrToast}`. **Every
  `expectedCopyOrToast` value must be one of §3.11's specified strings — a named
  state's copy or §3.11's unnamed-failure fallbacks ("That part of the workbench
  did not load…", "That call did not save…", or the specified nothing-renders
  entries for `/fonts/**`, `/api/passage`'s focused-card site, and case-state
  POSTs) — never copy
  invented at the table.** **The passage function's table entry names both
  call-site behaviors**: focused card → no error state (the §3.1 excerpt
  rendering stays); rescue preview → the §3.11 retry sentence with Confirm
  disabled (the §3.1 resolution-timing branch) — the spec drives the UI to both
  sites, and the D39 loop exercises each. (The table
  cannot live inside the spec: `e2e/**` is excluded from vitest, and importing a
  Playwright spec from a vitest test throws at import time — `test()` called outside
  the Playwright runner — so the parity vitest below could never read it.) The spec
  iterates the table: for each entry it mocks the failure, drives the UI to the fetch
  site, asserts the mapped copy renders, and asserts zero pageerrors — boot fetches
  (`/api/meta`, `/api/concepts`, `/api/v2/health`, `/api/v2/cases`), context, inbox,
  candidates, blind-session POSTs, case-state POSTs, and `/fonts/**` included, plus
  the `validation_failed` and `artifact_unavailable` toasts. AC: a vitest imports
  `workbench/e2e/endpointFailures.ts` and asserts its key set equals the function
  names parsed from study.html's `// §api` section (§4.8 markers) (parity check — a
  new fetch site cannot
  ship unmapped); the Playwright loop is green with zero unhandled rejections.
- **D40. Contract-test finalization**: vitest for study.html — snapshot validation,
  `ROUTES` parity with `REQUIRED_INLINE_ROUTES`, no-external-URL scan
  (`src=`/`href=`/`url(` values must not begin with `http`), protocol marker; old
  static* tests still green untouched. AC: named vitest files pass; the external-URL
  test demonstrably fails when a `https://fonts.googleapis.com` link is injected
  (negative fixture inside the test); and `workbench/e2e/study-p5.spec.ts` — the
  P5 demo spec, same phase-exit role as D9/D19/D23/D31 — covers D32–D40 end-to-end
  (including the D39 `ENDPOINT_FAILURES` loop) and is green with zero console/page
  errors (D41–D42 carry their own ACs and are not gated on it).
- **D41. THE FLIP** (separate PR; merged only on Jesse's explicit go **and** after
  the D42 checklist has been run once against `/study` on a server with a real
  artifact — Jesse's machine if the container's fetch-artifact proxy mismatch
  persists — with each step's observed result pasted into the D41 PR description;
  in degraded read-only mode the recorded observation is the §3.11 banner. Until
  that run exists, the Study page has never spoken to a real server, since every
  phase demo mocks `/api/**` — an integration surprise must land on `/study`, not
  on the new default page): study.html
  content → `static/index.html`; old index.html byte-identical →
  `static/advanced.html`; `/study` → 302 `/` via the §4.2 table's redirect entry;
  Advanced console link → `/advanced`; static* vitest expectations retargeted;
  `study-p4.spec.ts`'s Advanced-link assertion flips from href `/` to href `/advanced`
  in the same commit; the four old-console specs retarget their served file from
  `../static/index.html` to `../static/advanced.html` in the same commit — each
  hardcodes `readFile(new URL('../static/index.html', import.meta.url))` today
  (`core-review.spec.ts:17`, `candidate-review.spec.ts:12`,
  `studio-operations.spec.ts:10`, `admission-publish.spec.ts:47`; verified), so
  without the retarget they would serve the Study page and every old-console
  assertion would fail `npm run test:browser` — a path change only, no assertion
  text changes (they still exercise the old console, which now lives at that
  path). **`static/study.html` is DELETED in the same commit** (the §4.2 table's
  `/study` redirect entry replaces its file entry), **and every test that reads
  `static/study.html` by path retargets to `../static/index.html` in the same
  commit**: the five `study-p1..p5` specs' served file (§6 — each reads
  `../static/study.html` via `readFile(new URL(...))` pre-flip), the D5/D40 study
  static-contract vitests, D35's `contrast.audit.test.ts` (it parses study.html's
  token blocks), and D39's §api parity vitest (it parses study.html's `// §api`
  section) — path changes only. Deleting without retargeting would turn both
  suites red and force the unplanned judgment call §2.2 forbids; leaving
  study.html on disk to keep tests green would make every study-page guard
  permanently validate a stale file while the live page at `index.html` is
  guarded by nothing — the exact CLAUDE.md "guardrail becomes decoration"
  gate-discipline failure, at the highest-stakes step.
  No other Playwright assertion text changes; PR states no public
  engine types, artifact schema, or consumer-pinned descriptors changed
  (implementation-plan §5 consumers unaffected) and `ENGINE_VERSION` untouched
  (nothing ordering-relevant changed). AC: vitest + both Playwright suites green;
  `GET /` serves the Study page with a valid snapshot; `GET /study` answers 302 →
  `/`; `GET /advanced` serves the old console with its 11 tabs rendering (smoke spec)
  and its fetches still hitting `/api/...` under mocks; a vitest added in the flip
  commit asserts the literal string `static/study.html` appears nowhere under
  `workbench/test/**` or `workbench/e2e/**` (excluding its own file, which must
  name the string to search for it) — a stale-path sweep that keeps every
  retarget honest; the pre-flip D42 run's observations are pasted into the PR
  description (the merge condition above).
- **D42. Flip smoke (pre- and post-flip) on the real server**: a documented manual
  script — `npm run
  fetch-artifact --workspace workbench`, `npm run serve --workspace workbench`, open
  the page, run one search, make one call, undo it, add one suggestion
  (a range first, to see the pick chips), rescue one lower result (read the §3.1
  preview, then confirm), open the old console — checklist appended to
  `workbench/DESIGN.md` **in the main P5 PR, before the separate D41 flip PR it
  gates**, and run **twice**:
  1. **Pre-flip, against `http://127.0.0.1:8787/study`** (console step: the
     Advanced link to `/`). This run is D41's merge gate — every phase demo runs
     on mocked `/api/**`, so this is the first time the Study page ever talks to a
     real server with a real artifact, and it must happen while the old page is
     still the default. Each step's observed result is pasted into the D41 PR
     description; in degraded read-only mode the recorded observation is the
     §3.11 banner.
  2. **Post-flip, against `http://127.0.0.1:8787/`** (console step: `/advanced`;
     plus one extra line: `GET /study` answers 302 → `/`) — the same checklist
     re-run on the new default page.
  (This container's fetch-artifact hit a proxy sha256 mismatch,
  `audit-runtime.md` §3 — both runs may need Jesse's machine; in degraded read-only
  mode the expected observation is the banner.) AC: checklist committed; each step
  has an expected observation, incl. the degraded fallback, and names both run
  targets (`/study` pre-flip, `/` + `/advanced` + the 302 line post-flip); the
  pre-flip run's pasted observations are D41's stated merge precondition.

---

## 7. Test plan, risks & mitigations
### Test plan
- **Vitest (per phase, `workbench/test/`)**: font-route + secondary-page integration
  tests (D3/D4); the font-provenance hash check (`fontProvenance.test.ts`, D2 —
  committed README sha256 lines vs the committed font files, so a re-vendored font
  fails `npm test`); design-token/rename-table parity (D1); study.html static-contract
  suite (D5, finalized D40): protocol marker, `resolveStaticSnapshot` validation,
  `ROUTES` ⊇ `REQUIRED_INLINE_ROUTES` parity, no-external-URL scan; the api-layer /
  `ENDPOINT_FAILURES` parity check (D39, reading the plain data module
  `workbench/e2e/endpointFailures.ts`); the judgment-payload contract test
  (`judgmentPayloads.contract.test.ts`, D19) — one representative body per §4.4 row
  through `createJudgmentLog(...).submit` with stubbed snapshot context and
  `resolveReference`/`resolveReferenceTargetId`, so a payload the server would
  reject fails `npm test`, not the manual smoke; the contrast audit
  (`contrast.audit.test.ts` — lands in P1 with the token sheet per D5's AC, is
  extended in D35 with the non-text and ARIA checks, and is named `.test.ts` so
  vitest's default include
  actually collects it); the flip retargets
  `staticSnapshot.test.ts`, `staticM4.test.ts`, `staticNotRelevant.test.ts` (old
  console → `static/advanced.html`) AND every study-side reader of
  `static/study.html` — the five `study-p1..p5` specs' served file, the D5/D40
  study static-contract vitests, D35's `contrast.audit.test.ts`, and D39's §api
  parity vitest — to `../static/index.html`; `static/study.html` itself is deleted
  at the flip and a stale-path sweep vitest asserts no test file still names it
  (D41).
  Behavior stays in Playwright (the inline IIFE runs in-browser, not imported).
- **Playwright (one spec per phase + flip smoke)**: existing repo pattern (mock all
  `/api/**`; zero console/page errors asserted in every spec). Chrome channel per
  `playwright.config.ts`; fresh containers run `npx playwright install chrome` first.
- **Determinism / covenant regression**: order-fidelity — DOM result order equals
  mocked `/api/search` order in every phase spec; from P2 onward, additionally vote on
  three items and assert the order unchanged and no card hidden; no-score scrub — the
  mocked `/api/search` results in every phase spec from P1 onward carry distinctive
  `score` and reason `points` values (987.65 / 431 — `DiscoveryResult.score` and
  `Reason.points` ride every response and every snapshot item,
  `reviewCases.ts:226–230`) and those numerals are asserted absent from the rendered
  page text, so a why-rail regression cannot leak ranking arithmetic with no test
  failing; payload allowlist —
  every judgment POST body contains only `caseId`, `snapshotToken`, and
  `V2_CLIENT_FIELDS` keys; payload-contract vitest against the real validator (D19);
  no-external-URL vitest (D40); History jargon scan (D28).
- **Old-UI protection**: until D41 no test touching `static/index.html` changes. Local
  CI-equivalent: `npm run typecheck --workspace workbench && npm test --workspace
  workbench && npm run test:browser --workspace workbench`.

### Risks & mitigations
| # | Risk | Mitigation |
|---|---|---|
| 1 | Artifact unavailable in the dev container (fetch-artifact sha256 mismatch observed through the proxy) | All phase demos run on mocked APIs; degraded read-only is itself a specced, tested state (D16); the pre-/post-flip real-server smoke (D42) can run on Jesse's machine — and D41 merges only after the pre-flip run is recorded, so a mock-shared shape assumption surfaces on `/study`, never on the new default page. |
| 2 | Search/result field names (targetId, reason fields, concept evidence) not fully documented in R1 | Binding instruction: read the old UI's review-tab rendering and the snapshot item shape in `workbench/src/reviewCases.ts` before D6/D14; the why-rail renders only fields the engine actually returns; the highlight/Matched rule depends only on reason labels the engine mints (`lexical.ts:61`). |
| 3 | Snapshot-token churn (process-local, LRU-128, restarts) losing votes | §4.6 one-shot silent recovery + honest banners; Playwright covers both branches (D11). |
| 4 | `REQUIRED_INLINE_ROUTES` drift breaking the page at startup (silent fallback page) | ROUTES parity vitest (D40) fails the build before the server would degrade. |
| 5 | Two-source rendering (snapshot top-10 vs live tail) disagreeing after an artifact swap | Reference-per-rank agreement check + data-changed banner; the snapshot wins for judging (§4.6). |
| 6 | Compare session/passage response shapes differ from assumptions | D27 explicitly ports from the old compare code; Playwright mocks are written from that code, not guesses. |
| 7 | Fonts: OFL obligations / Reserved Font Names, or upstream shipping no woff2 | Unmodified upstream files + OFL.txt + provenance README; D2's verified-format fallback chain (TTF route extension, or a documented Modified-Version rename); no silent subsetting. |
| 8 | Single-file page-size growth | Fonts are NOT inlined (served via `/fonts/`); the page stays text-only; read-once serving unchanged. |
| 9 | Old/new UI state collision | Disjoint localStorage keys (`study.*` vs `workbench-ui-state-v3`) and routes; old file byte-untouched until D41. |
| 10 | Prototype branches (`claude/hearth-thread-wrhubh-p3`/`-p5`) never merge | The plan depends on no prototype code — copy (DESIGN.md text, UI strings) and the dc.html token block are transcribed into new commits; the dc-runtime is explicitly not ported. |
| 11 | Playwright browser missing in the container | Documented install step in every phase's run instructions; channel stays `chrome` per repo config. |
| 12 | Scope creep into admission/publish/promotion | Hard out-of-scope list (§2.3); those flows remain the old console's behind Advanced; Finish up touches only compile preview/apply. |
| 13 | A vote recorded but its case left in a misleading state | Auto state transitions with 409-tolerant handling (D10); History and Finish up read from the log, not from case state; reopened rows carry their own display state everywhere (§3.2/§3.4/§3.7) so an active call is never shown as absent. |
| 14 | The `judgments.ts` "already present" message string drifts | The §3.3 detection is covered by D20 (form) and D18 (rescue-confirm) Playwright assertions and flagged by a code comment at the match site; drift fails the specs, not the user. |

---

*End of plan. Every quoted string is shippable copy; every D-item is mechanically
checkable; every endpoint, field, limit, and error code above traces to
`plan-r1-repo.md` or was re-verified against the repo (server.ts:586–591/693–723/1724–1737/1739–1753
(/api/passage returns `engine.passage()` verbatim),
server.ts:1618–1628 (GET /cases/:uuid answers `{case, review}` with
`review: {freshness, …reviewSnapshotView}` or `null` when no snapshot is stored and
the engine is unavailable),
judgments.ts:517 (the "already present in the judged result set" rejection string,
verbatim),
judgments.ts:387–388/512–517/551–562/854, engine/src/types.ts:25–44/67–82
(`ScripturePassage.verses[]` carry per-verse `verse` numbers; `ScripturePassage.reference` is canonical),
engine/src/reasons/types.ts:20–32, engine/src/intents/lexical.ts:50/61/81–86,
engine/src/createEngine.ts:47/185–203/347–369/362/594–677 (collapseAnchorRuns:
call site 356 with `DEFAULT_LIMIT` 25 + `COLLAPSE_HEADROOM` 25, head `targetId`
kept 653–656, range reference minted 657–668, excerpts joined 669),
workbench/e2e/core-review.spec.ts:17 + candidate-review.spec.ts:12 +
studio-operations.spec.ts:10 + admission-publish.spec.ts:47 (each reads
`../static/index.html`), engine/src/corpus/repository.ts:143–146/202–207
(`resolveBookAlias` over the artifact's `book_aliases` table; FTS5 phrase matching),
reviewCases.ts:41–61/83–85/99–101/226–230 (`ReviewSnapshotView.result` carries the
snapshot's `ResearchResult` with discovery `result.results` truncated to
`REVIEW_WINDOW` — the §4.3 counts row's m; :99–101 is the "Case query must be
non-empty text." rejection behind the §3.2 M gate),
compileJudgments.ts:1–20/93–100/489–518/504–508/523–525,
workbench/src/cases.ts:23–35/69/127–139/149/424–426/443 (the §3.6 case-ordering
facts, each re-read: `validateCaseEvents` sorts case buckets caseId-lexicographic
at :424–426 and `foldCaseEvents` preserves that order at :443, flowing verbatim
through `readCases` (reviewCases.ts:109–116) and the GET /api/v2/cases handler
(server.ts:1512–1516); `CaseSnapshot` (:127–139) carries no top-level timestamp;
every event carries `at` (:69) in the fixed-width ISO-8601 UTC shape (:149) with
`at >= parent.at` enforced along the chain, so the last event's `at` is the
case's newest and plain string comparison sorts it),
workbench/vitest.config.ts (no custom `include`),
workbench/src/staticSnapshot.ts:466 (all inline scripts joined — the §3.10 head
theme-stamp micro-script is contract-valid),
pipeline/src/books.ts:85/116/254–256 ("Ps"/"Lam" abbreviations; the deliberate "Jud"
ambiguity), dc.html:14–38/45/54 at commit 5ba1096 (:45 the `:focus-visible` outline
rule §3.0 quotes verbatim; :54 the wordmark "The Study" in Literata 15px with the
Georgia serif fallback; the §3.0 contrast deviations were computed from the :14–38
hex values and re-verified — light `--text-3` #847F73 measures 3.92:1 on `--panel`,
dark #8A8478 4.47:1, and the replacement values clear 4.5:1 on all three grounds in
both themes; the verdict-wash figures likewise: light `--v-affirm` #2F7A52 over
rgba(47,122,82,.10) composited on `--panel` #FFFDF7 measures 4.4966:1 and light
`--v-missing` #8C6C1E over rgba(140,108,30,.10) measures 4.2552:1 — the two D35
verdict-over-own-wash failures §3.0's #2C734D/#80621B replacements clear at
4.94:1/4.95:1 — while light `--v-notrel` (4.99:1) and all three dark verdicts
(5.45–6.03:1 over their washes) pass verbatim; the D35(b) figures too:
`--hairline-strong` vs `--surface` 1.47:1 in both themes, `--kbd-border` vs
`--kbd-bg` 1.26:1 light / 1.33:1 dark, `--text-2` on `--kbd-bg` 6.49:1 light /
7.12:1 dark, and the added `--control-border` 3.36:1 light / 3.01:1 dark vs
`--surface`),
index.html:1958/1966–1975/2187/2192–2197/3183 ("This judgment is immutable." — the
§3.5 one-confirm rationale)).*
