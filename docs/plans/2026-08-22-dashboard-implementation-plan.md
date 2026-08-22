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
  the verse out of the previewed passage with one click.
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
   server because the reference sits outside the displayed top-10 window).
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
    per-result duels, which remain excluded (§2.3).

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
- Type: Literata (variable, regular + italic) ONLY for scripture, the done state, the
  Compare reveal, and the signing chip; verse setting 17.5px / 1.65 / max 68ch, verse
  numbers as raised sans `sup`. Chrome sans Source Sans 3, base 13px, fallback
  `-apple-system, "Segoe UI", sans-serif`. Mono `ui-monospace, "SF Mono", Consolas` —
  Advanced screen only.
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
  verse numbers, attribution "King James Version". **Highlighting is
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
- **Tail = ranks 11+**, collapsed behind one divider button: "Lower results ({n}) —
  most people never scroll this far. Skim them only to rescue anything that deserves
  the top." Expanded tail rows are compact (rank, reference, one-line snippet) with
  exactly one action: "Should be near the top". No verdict buttons in the tail.
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
  rescue is a single click or keypress on an uncorrectable action, so the warning
  must precede the commit, not follow it.) Rescue toast: "Noted — {ref} should rank
  near the top for "{q}". Saved to your calls for the next reviewed update." The
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
**Verdict toolbar** (fixed bottom-center pill; hidden while an interview, suggestion
form, bulk selection, or onboarding is open): `[E] Essential` (teal, fused with a
"top 1 · 3 · 5 · 10" segmented picker) · `[H] Helpful` · `[X] Not relevant` (hover turns
`--v-notrel`) · `[M] Missing passage`. Every key is a keycap chip on its button.
- E commits `essential` at the picker's current value (persisted, default 3). H commits
  `helpful`. The picker is a **Tab-reachable radiogroup**: Left/Right arrows move
  between 1/3/5/10 and Enter/Space selects; it is also clickable (both input methods
  first-class, decision 9).
- Commit → toast "Marked {ref} {label}" with inline "Undo [U] — your call stands until
  you choose a new one" (6s auto-dismiss; the truth is on the affordance itself: the
  POST has already happened, and U records nothing until a new call replaces the old);
  focus auto-advances to the next unjudged top-block row, wrapping.
- A verdict key on an **already-judged** card records a superseding judgment (§4.5);
  toast: "Replaced your earlier call — {ref} is now {label}."
- **U / Undo** (verdicts only — Essential/Helpful/Not relevant; suggestions and rescues
  show the permanence note instead, §3.3/§3.12): chip becomes "Reopened — your earlier
  call stands until you make a new one."; the row joins the **reopened count** (shown
  separately — §3.4 — because the earlier call is still active in the log and still
  compiles); the next verdict posts with `supersedes`. History line (written when the
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
"Missing a passage?" link pinned after the top block. Layer focus contract per §3.12
(focus lands on the reference input on open).
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
  results — judge it there instead." and focus scrolls to that card, no POST.
  **Server-side detection**: a 400 `validation_failed` whose `error.message` contains
  "already present in the judged result set" is treated as the same already-displayed
  case (same toast + scroll); any other `validation_failed` falls through to the §3.11
  generic toast. A code comment notes this string is coupled to `judgments.ts` and
  covered by a Playwright assertion in D20.
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
- "**Waiting in your queue**": one button per other open case with judged count
  "{j}/{m}"; clicking switches the active query (search bar syncs, first unjudged row
  selected) exactly like a successful search — including the live tail fetch (§4.3
  "Open existing case"). With no open cases, the queue section shows "Nothing waiting —
  search for something you would actually type."
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
  "mercy"". Superseded records struck-through/faint with sub-line "Replaced by a newer
  call."
- Data: `GET /api/v2/cases` (newest first), then lazy `GET /api/v2/judgments?caseId=…`
  per case as its group expands/scrolls in; 20 most recent cases + "Show more".
- No raw IDs, digests, or fingerprints anywhere on this screen.

### 3.7 Finish up (typed-digest signing)
- Intro: "Your reviewed calls leave the workbench here and become part of the search's
  answer sheet." followed by the defining sentence, first use on any surface: "The
  answer sheet is the reviewed record of what the right results should be; the
  engineering checks hold every update to it." Four stat tiles (Essential / Helpful /
  Not relevant / Missing passages), Literata numerals in verdict colors, counted across
  ALL open cases (prototype v2 behavior).
- Pending banner when any open case's top block has unjudged rows: "{n} of {m} passages
  are still waiting for a call. Finish them first →" (links to Review at the first such
  case); when any calls are locally reopened it reads "{n} of {m} passages are still
  waiting for a call · {r} reopened calls unresolved. Finish them first →". Reopened
  rows are counted in {r}, never in {n} — a reopened row's earlier call is still
  active. Pending informs; it never blocks signing.
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
    reviewer), and a typed suggestion can also name a rank-11+ verse, because the
    server's already-present check runs only against the top-10 snapshot
    (`reviewCases.ts:83–85` slices to `REVIEW_WINDOW` before building
    `context.results`; `judgments.ts:516–517`). The honest claim is about the top
    10, not about engine output. (Compiled fixtures render `essential` and
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
  review; they do not write fixture lines by themselves." (`operations.length === 0`
  is NOT the gate — once any compilable judgment exists the compiler always restates
  files; only the changed-bytes delta says whether anything will actually change.)
- "**Sign to write**": "This step changes reviewed files, so it asks for a signature:
  type the code below exactly. That is deliberate friction — it means nothing is
  written by a stray click." The code chip (dashed border, Literata) shows the **first
  12 hex chars of `plan.digest`, grouped 4-4-4** (e.g. `4e7a 9c21 b0d3`). Input "Type
  the code to sign"; button "Write {n} judgment(s) to fixture files" — **n = the count
  of Must-rank + Must-not-rank lines rendered from the changed set** — enables only on
  an exact, case-insensitive match. Submitting posts the FULL digest
  (`POST /api/v2/compile/apply` `{digest}` — server contract unchanged).
- Outcomes: success → Literata "Written." · "{n} judgments are now on the answer
  sheet. The engineering checks will pick them up on the next run." 409
  `stale_preview` → "The picture changed since this preview — reloading it now." then
  auto re-preview (new code). 409 `mutation_running`/`job_running` → "Another change
  is being written right now — try again in a moment."

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
`data-theme` immediately — no reload. The stylesheet sets `color-scheme: light` on
`:root` and `color-scheme: dark` under `[data-theme="dark"]`, so native controls and
scrollbar chrome match the theme. Selection, caret, scrollbars, focus rings themed per
the token sheet. Dark derives from its own token column, never inversion.

### 3.11 Empty / loading / error / read-only states
- Loading: static skeleton rows (no animation beyond the allowed toast); never
  spinners-with-nothing.
- Search error (`network_error` / 5xx): inline "The engine did not answer. It may be
  restarting — try again in a moment." + Retry button.
- **Read-only degraded** (server `startup_degraded_read_only` / GET `readOnly` flags /
  `GET /api/v2/health` machine mode): top banner, `role=status`, background
  `var(--v-missing-wash)`: "**Read-only right now.** The engine is rebuilding its data.
  You can read everything, but calls will not save. This usually clears in a minute —
  then reload the page." Verdict/compare/sign buttons disabled; any attempted commit
  toasts "Read-only right now — this call was not saved." Search, ⌘K, Context, History
  (GETs) keep working. Health refetches on window focus and after any failed POST. 503
  `artifact_unavailable` gets the same toast.
- 400 `validation_failed`: toast "Something about this call was rejected — nothing was
  saved." (details to console) — **except** the already-displayed missing rejection,
  detected by message per §3.3, which gets the specific toast + scroll.
- 409 `review_snapshot_required`: silent one-shot recovery per §4.6; only if ranks
  changed does the data-changed banner appear.
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
| M | Review | Open missing-passage form | toolbar button + "Missing a passage?" link |
| ← / → | top-N picker focused | Change the top-N for Essential (Enter/Space selects) | picker segments |
| E or Enter | focused tail row | "Should be near the top" | row button |
| H / X / M | focused tail row | Hint toast: "Lower results take one action — "Should be near the top"." | — |
| U | Review | Reopen toast target, else last verdict (Essential/Helpful/Not relevant only — a suggestion or rescue target shows the §3.3 permanence sentence instead, and nothing posts; after a bulk commit U targets nothing and shows the §3.2 hint toast) | chip/toast "Undo" link |
| Space | focused top-block row | Toggle bulk checkbox (disabled on judged rows — §3.2) | checkbox |
| Enter | Search input | Submit search | Search button |
| ⌘K / Ctrl+K | Everywhere | Toggle quick lookup | header "Look something up ⌘K" button |
| A / B / T / W | Compare | A wins / B wins / Tie / Both wrong | toolbar buttons |
| ? | Everywhere | Shortcut sheet (Move · Judge · Compare · Everywhere; "Esc to close") | rail-footer "all shortcuts" button |
| Esc | Layered | Close topmost layer: interview → missing form → lookup → sheet → bulk selection | each layer's Cancel/× button |
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

**Layer focus contract** (shared rule for the interview, missing form, ⌘K lookup, `?`
sheet, and onboarding): every layer is a focus trap. On open, focus moves to the
layer's first interactive element (the reference input for the missing form, the
search input for the lookup). Tab/Shift+Tab cycle within the layer only. On close
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
| Boot | `GET /api/meta` (identity trio → localStorage compare), `GET /api/concepts` (id→label cache), `GET /api/v2/health` (read-only detection), `GET /api/v2/cases` (queue) |
| Search submit / ⌘K typing | `GET /api/search?q=…` (stale responses dropped via request sequence counter) |
| Why-rail Context tab — driven by the focused top-block card, and by a focused tail row (§3.1 read-before-rescue binding; the rail fronts Context when focus enters the tail) | `GET /api/v2/context?ref=…` |
| Open existing case (queue click / search matching an open case) | `GET /api/v2/cases/:uuid` → `{case, review}` (snapshot + token); `GET /api/v2/judgments?caseId=…` → judged map; `GET /api/search?q={case.query}` → tail ranks 11+ (plus the §4.6 reference-per-rank agreement check) |
| First vote on a case-less query (verdict, suggestion, or tail rescue — decision 6) | `POST /api/v2/cases` `{query, source:'manual'}` → `{case, review:{token,…}}`, then the judgment POST, then `POST /api/v2/cases/:uuid/state` `{state:'reviewing'}` |
| "Add to my queue" | `POST /api/v2/cases` `{query, source:'manual'}` only |
| Any vote / suggestion / rescue / supersede | `POST /api/v2/judgments` (routing fields `caseId` + `snapshotToken` + client fields per §4.4) |
| Top-10 completed | `POST /api/v2/cases/:uuid/state` `{state:'judged'}` (409 `invalid_case_transition` ignored, logged) |
| Worth-a-look suggestions | `GET /api/v2/inbox` |
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
| Tail rescue "Should be near the top" | `action:'missing'`, `reference` (the tail row's `DiscoveryResult.reference` — already canonical), `withinTop:10` |
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
meta, title, `<style>` — tokens, then components in screen order; (2) body skeleton:
header, nav, banner slot, screen containers (landmarks), toast + dialog slots; (3) one
inline IIFE `'use strict'` script, in order: `// §routes` `ROUTES` constant (all
`REQUIRED_INLINE_ROUTES` literals) → `// §copy` constants/copy table → `// §state`
`state` + localStorage persistence → `// §request` `requestJson` → `// §api` api layer
(**one named function per endpoint** — this marker-delimited list is what D39's parity
vitest reads) → `// §stores` (cases, concepts, judged-map, health) → `// §helpers` pure
helpers (`node()`, `clear()`, normalizeQuery, relativeTime, supersede resolution) →
`// §render` renderers (one per screen + shared card/toast/banner) → `// §keys` single
`onKey` handler with the layer stack → `// §boot`. No globals beyond the IIFE; no
`eval`; no dynamic script injection.

### 4.9 localStorage schema
`study.theme` (`'light'|'dark'|'auto'`) · `study.onboarded` (`'1'`) · `study.withinTop`
(`1|3|5|10`) · `study.shortcuts` (`'1'|'0'`, default `'1'` — §3.12 single-key toggle) ·
`study.ui.v1` (JSON: `lastQuery`, `lastSeenMeta:` the identity trio,
`blindRequestIds:{[reviewId]:uuid}`). Disjoint from the old `workbench-ui-state-v3` key.

### 4.10 Old-UI preservation & the flip
- P1–P4: old UI at `/` (default, untouched); new UI at `/study`; the new UI's Advanced
  screen links to `/` ("Open the full engineering console →").
- Flip (D41, its own PR, merged only when Jesse says go): `study.html` content becomes
  `static/index.html` (served at `/`); the old page moves byte-identical to
  `static/advanced.html` (served at `/advanced` via the secondary-pages table — its
  same-origin absolute `/api/...` fetches work unchanged); `/study` becomes a 302 →
  `/` via the table's redirect entry (§4.2); Advanced links point at `/advanced`;
  static-contract vitest expectations and `study-p4.spec.ts`'s Advanced-link assertion
  move in the same commit (D41 lists both).

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
containers first run `npx playwright install chrome`). Specs follow the repo pattern:
throwaway `http.createServer` serving the file, all `/api/**` + `/fonts/**` mocked via
`page.route`, zero console/page errors asserted.

### P1 — Shell, theme, real search (read-only) · PR "study: shell + search"
- **D1. Commit `workbench/DESIGN.md`** — the prototype token sheet (transcribed from
  `dc.html:14–38`, both themes — §3.0), rename tables, keyboard model, and the §3.1
  reason-pill mapping table (family → pill string, so Jesse reviews the wording
  against the covenant's no-interpretation rule), plus a "Deviations" section (fonts
  unsubsetted per OFL; the answer-sheet copy substitution §3.7; tokens adjusted later
  by D35). AC: a vitest (`designTokens.test.ts`) parses the DESIGN.md token table and
  asserts every token name from the `dc.html:14–38` block appears with a value in
  **both** the light and dark columns; that the three rename tables contain exactly
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
  upstream URLs + sha256 lines + the chosen-path note exist; recomputing the recorded
  hashes passes.
- **D3. Server: font route** per §4.2(2). AC: vitest — GET a known font → 200,
  `content-type: font/woff2` (or `font/ttf` per D2's chosen path), etag, nosniff;
  unknown path under `/fonts/` → 404; route serves in degraded startup mode.
- **D4. Server: secondary static pages** per §4.2(1). AC: vitest — `/study` serves the
  new page with etag + nosniff when present and snapshot-valid; `/advanced` → 404 while
  no file exists; a missing/invalid secondary file does not degrade startup; a redirect
  entry answers 302 with the mapped `Location`; `/` still serves the old page
  byte-identically.
- **D5. study.html skeleton**: protocol meta, token sheet + theme cycler (§3.10 incl.
  the Auto change listener and `color-scheme`), header/nav/landmarks, 3-col grid,
  `ROUTES` constant, `requestJson`, `node()/clear()` helpers, §4.8 section markers,
  boot fetches (§4.3 Boot row). AC: vitest — `resolveStaticSnapshot` accepts
  study.html (protocol marker + all `REQUIRED_INLINE_ROUTES` literals); Playwright —
  theme cycles auto→light→dark→auto on `data-theme`, persists across reload; dark
  paints `html`/`body` background from tokens; emulating a `prefers-color-scheme` flip
  while in Auto updates `data-theme` without reload.
- **D6. Real search + results (read-only)**: form → `GET /api/search`; the §3.1
  blank-submit no-op; the full §3.1
  four-way kind handling (discovery-with-results / discovery-empty / reference /
  invalid-reference); top-10 cards — unfocused compact form + focused verse panel
  (Literata, sup markers, boundary-guarded punctuation-tolerant fragment
  highlighting, attribution)
  per §3.1; tail
  divider + compact rows (no actions yet) with the §3.1 read-before-rescue rail
  binding; why-rail Why + Context tabs incl. the
  pill mapping and Matched binding; request-sequence stale-drop. AC: Playwright —
  mocked search renders
  cards in exact mock order; unfocused cards each render reference + single-line
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
  exists; Context renders mocked ±2 verses; of two racing searches only the latest
  renders.
- **D7. ⌘K quick lookup** per §3.12 incl. three-kind handling. AC: Playwright — Ctrl+K
  opens with focus in its input; typing ≥3 chars fires mocked `/api/search`; Enter on a
  row closes the dialog, fills the main search bar, renders those results; a mocked
  invalid-reference response renders the §3.1 message and no rows; Esc closes and
  returns focus to the opener; footer contains "never creates a case by itself".
- **D8. Loading / error states** per §3.11 (skeletons, search-error retry).
  AC: Playwright — delayed mock shows skeleton then results; 500 mock shows "The engine
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
  AC: Playwright — E posts `{action:'essential',withinTop:3,targetId,…}`; clicking
  segment "5" then E posts `withinTop:5` and survives reload; focusing the picker and
  pressing ArrowRight then E posts the changed `withinTop`; toast "Marked {ref}
  Essential" with the "Undo [U] — your call stands until you choose a new one" chip;
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
  earlier call stands", and the next E posts `supersedes`; a second re-judge supersedes
  the newest id, not the first.
- **D15. Effect-timing contract copy** in its three placements (results-rail footer,
  empty state, onboarding placeholder for P5). AC: Playwright — the contract string is
  present verbatim in (a) the results-rail footer and (b) the empty-results state
  (mock a zero-result search), and (c) is asserted absent from any toast after a vote.
- **D16. Read-only degraded handling** per §3.11. AC: Playwright — mocked read-only
  health ⇒ banner verbatim with `background` resolving to the `--v-missing-wash`
  token, verdict buttons `disabled`, E toasts "Read-only right now — this call was not
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
  bulk call on its card."
- **D18. Tail rescue**: button + E/Enter on a focused tail row →
  `{action:'missing', reference, withinTop:10}` (the row's canonical
  `DiscoveryResult.reference`); H/X/M on tail rows → hint toast; rescue toast + receipt
  chip verbatim (§3.1, incl. permanence sentence); the §3.1 read-before-rescue
  rail binding verified on the action path (built read-only in D6, re-asserted
  here because it is what stands between one ellipsized snippet line and an
  uncorrectable commit). AC: Playwright — rescue posts the
  exact body and the toast reads "Noted — {ref} should rank near the top for "{q}".
  Saved to your calls for the next reviewed update."; on a case-less query, a rescue
  click issues POST /api/v2/cases `{query, source:'manual'}`, then POST
  /api/v2/judgments `{action:'missing', reference, withinTop:10}` with the returned
  snapshotToken, then POST state `{state:'reviewing'}` — same sequence and race guard
  as D10, bodies asserted; the §3.1 pre-commit line "A rescue is recorded like a
  suggestion — it can't be taken back here." is visible on the expanded tail's header
  **before any POST occurs** (asserted on expansion, prior to the rescue);
  focusing mocked tail row #11 fetches `/api/v2/context` for its reference and
  renders the mocked verses in the fronted Context tab before any rescue POST
  occurs (asserted: the context request appears in the route log before the
  first `/api/v2/judgments` POST); rescued
  row shows a receipt chip carrying the §3.1
  permanence sentence; pressing U while the rescue toast is visible posts nothing and
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
  (negative fixture: a body with `diagnosisInferred:false` is asserted to FAIL
  validation).

### P3 — Suggestions · PR "study: missing passages"
- **D20. Missing-passage form** per §3.3: all entry points, live debounced
  `GET /api/passage` preview, unresolved copy, the failed-resolution line, the
  pre-commit permanence line, single-verse rule with pick chips,
  canonical-reference rule, disabled-until-single-verse submit, top-N picker, note
  placeholder verbatim, Esc/Cancel + focus contract, already-displayed redirect (client
  pre-check AND server-message detection), submit → `{action:'missing', reference,
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
  posting; a mocked 400 `validation_failed` whose message contains "already present in
  the judged result set" triggers the already-displayed toast + scroll, not the
  generic §3.11 toast; pressing U while the suggestion receipt is the toast target
  posts nothing and shows the permanence sentence.
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
  counts update after a judgment; with zero open cases the queue section shows
  "Nothing waiting — search for something you would actually type."
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
  requestId, two lists, synced passage panel, A/B/T/W keys + buttons, reveal +
  immutability copy, empty state. Session/passage field names ported from the old UI's
  compare code (index.html `:2779`, `loadComparisonReviews :3730`). AC: Playwright —
  start posts `{requestId:<uuid>}`, reused after reload; clicking a verse fetches
  passages with exactly `queryId`+`passageId` params; A posts the session judgment and
  shows "You preferred Set A — the current engine."; empty candidates shows §3.5 copy.
- **D28. History** (§3.6): humanized rows, superseded strikethrough + "Replaced by a
  newer call.", zero-calls empty state, lazy per-case fetch, 20 + "Show more", no raw
  IDs. AC: Playwright — a mocked chain (A superseded by B) renders A struck with the
  sub-line and B normal; with zero mocked cases the screen shows "Nothing on record
  yet. Your first call on any search result will appear here." and its "Go to Review
  →" button navigates; a jargon regex (`[0-9a-f]{8}-` and `sha256`) finds zero matches
  in the History screen's text.
- **D29. Finish up** (§3.7): stat tiles across all open cases, pending banner incl.
  reopened counts, what-will-be-written derived from the compile plan's changed set,
  signing gate (12-hex grouped code, exact-match enable), apply with full digest, all
  three outcome paths, empty-changed-set state + footnote. AC: Playwright — a mocked
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
  nothing and is excluded from the "Write {n}" count; a deletion operation renders
  "Withdrawn: "{query}" — no calls remain to write."; mocked `proposedSelections`
  render the test-corpus line; a locally-reopened judgment's line carries the
  "(reopened — this earlier call stands unless you change it)" suffix; with an
  all-unchanged mocked plan the empty-changed-set copy + footnote render; button
  disabled until the shown code is typed (case-insensitivity tested); apply posts the
  FULL mocked digest; 409 `stale_preview` re-previews with a new code and the §3.7
  line; success shows "Written." and the answer-sheet copy.
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
  (interview → form → lookup → sheet → bulk), input typing suppression, the §3.12
  layer focus contract on every layer, every §3.12 row implemented. AC: Playwright — a
  scripted walk asserts each §3.12 mapping (one assertion per row) and the Esc layer
  order with two layers open; with the interview open, Tab pressed repeatedly never
  leaves the dialog; Esc returns focus to the previously focused card (asserted via
  `document.activeElement`); opening the missing form focuses its reference input and
  closing it restores focus to the opener.
- **D35. Contrast + ARIA audit**: committed vitest
  `workbench/test/contrast.audit.test.ts` — the `.test.ts` name is load-bearing:
  `npm test` in workbench is `vitest run`, and `workbench/vitest.config.ts` sets no
  custom `include`, so vitest's default collects only
  `**/*.{test,spec}.?(c|m)[jt]s?(x)` — a file named `contrast.audit.ts` would never
  run, and `npm test` would pass while the audit executed nothing (exactly the
  CLAUDE.md gate-discipline failure of a guardrail becoming decoration). It parses
  the `:root` and `[data-theme="dark"]` token blocks out of study.html and
  checks, for **both** themes: (a) WCAG AA text contrast (4.5:1 body / 3:1 for
  ≥18.66px bold or ≥24px) for every foreground/background pairing named in a committed
  `workbench/test/pairs.json` (each text tier on ground/surface/panel, verdict colors,
  accent-on-accent-wash, on-accent-on-accent, kbd text, and highlight-over-panel), and
  (b) WCAG 1.4.11 non-text contrast (≥3:1) for the `:focus-visible` outline vs every
  background it appears over, verdict dot colors vs `--surface`, `--kbd-border` vs its
  kbd context, control borders on interactive elements (inputs, buttons —
  `--hairline-strong` vs `--surface`), and the segmented picker's selected-state
  boundary; purely decorative hairlines are exempt and listed as such in the test
  file. Each pairing is a vitest assertion that names the failing pair in its
  message; failures are
  fixed by adjusting the failing tier (logged in DESIGN.md Deviations). Also verify
  roles: banner `role=status`, toast `aria-live=polite`, toolbar/tablist/dialog roles,
  radiogroup on the picker, per-button labels ("Mark {ref} essential"), 36px min row
  height. AC: the file is collected by `vitest run` (it appears in the run's file
  list) and passes for BOTH light and dark columns; deleting one pair from pairs.json
  fails the count assertion against the token
  sheet (negative fixture); Playwright asserts the roles/labels; any token change
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
  only dismiss+reload suppresses it; under a fingerprint-only mocked change the D28
  jargon regex (`[0-9a-f]{8}-` and `sha256`) finds zero matches in the card's text.
- **D39. Error-state hardening**: commit an `ENDPOINT_FAILURES` table in
  `workbench/e2e/endpointFailures.ts` — a **plain data module with no
  `@playwright/test` import**, imported by `study-p5.spec.ts` — mapping **every
  function in the api layer** (§4.8 `// §api`: one
  named function per endpoint) to `{mockedFailure, expectedCopyOrToast}`. (The table
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
  (negative fixture inside the test).
- **D41. THE FLIP** (separate PR, merged only on Jesse's explicit go): study.html
  content → `static/index.html`; old index.html byte-identical →
  `static/advanced.html`; `/study` → 302 `/` via the §4.2 table's redirect entry;
  Advanced console link → `/advanced`; static* vitest expectations retargeted;
  `study-p4.spec.ts`'s Advanced-link assertion flips from href `/` to href `/advanced`
  in the same commit — no other Playwright assertion changes; PR states no public
  engine types, artifact schema, or consumer-pinned descriptors changed
  (implementation-plan §5 consumers unaffected) and `ENGINE_VERSION` untouched
  (nothing ordering-relevant changed). AC: vitest + both Playwright suites green;
  `GET /` serves the Study page with a valid snapshot; `GET /study` answers 302 →
  `/`; `GET /advanced` serves the old console with its 11 tabs rendering (smoke spec)
  and its fetches still hitting `/api/...` under mocks.
- **D42. Post-flip smoke on the real server**: a documented manual script — `npm run
  fetch-artifact --workspace workbench`, `npm run serve --workspace workbench`, open
  `http://127.0.0.1:8787/`, run one search, make one call, undo it, add one suggestion
  (a range first, to see the pick chips), open `/advanced` — checklist appended to
  `workbench/DESIGN.md`. (This container's fetch-artifact hit a proxy sha256 mismatch,
  `audit-runtime.md` §3 — the smoke may need Jesse's machine; in degraded read-only
  mode the expected observation is the banner.) AC: checklist committed; each step has
  an expected observation, incl. the degraded fallback.

---

## 7. Test plan, risks & mitigations
### Test plan
- **Vitest (per phase, `workbench/test/`)**: font-route + secondary-page integration
  tests (D3/D4); design-token/rename-table parity (D1); study.html static-contract
  suite (D5, finalized D40): protocol marker, `resolveStaticSnapshot` validation,
  `ROUTES` ⊇ `REQUIRED_INLINE_ROUTES` parity, no-external-URL scan; the api-layer /
  `ENDPOINT_FAILURES` parity check (D39, reading the plain data module
  `workbench/e2e/endpointFailures.ts`); the judgment-payload contract test
  (`judgmentPayloads.contract.test.ts`, D19) — one representative body per §4.4 row
  through `createJudgmentLog(...).submit` with stubbed snapshot context and
  `resolveReference`/`resolveReferenceTargetId`, so a payload the server would
  reject fails `npm test`, not the manual smoke; the contrast audit
  (`contrast.audit.test.ts`, D35 — named `.test.ts` so vitest's default include
  actually collects it); the flip retargets
  `staticSnapshot.test.ts`, `staticM4.test.ts`, `staticNotRelevant.test.ts` (D41).
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
| 1 | Artifact unavailable in the dev container (fetch-artifact sha256 mismatch observed through the proxy) | All phase demos run on mocked APIs; degraded read-only is itself a specced, tested state (D16); real-server smoke (D42) can run on Jesse's machine. |
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
| 14 | The `judgments.ts` "already present" message string drifts | The §3.3 detection is covered by a D20 Playwright assertion and flagged by a code comment at the match site; drift fails the spec, not the user. |

---

*End of plan. Every quoted string is shippable copy; every D-item is mechanically
checkable; every endpoint, field, limit, and error code above traces to
`plan-r1-repo.md` or was re-verified against the repo (server.ts:586–591/693–723/1724–1737,
judgments.ts:387–388/512–517/551–562/854, engine/src/types.ts:67–82,
engine/src/reasons/types.ts:20–32, engine/src/intents/lexical.ts:50/61/81–86,
engine/src/createEngine.ts:185–203, engine/src/corpus/repository.ts:202–207,
reviewCases.ts:83–85/226–230, compileJudgments.ts:1–20/93–100/489–518/504–508/523–525,
workbench/src/cases.ts:23–35, workbench/vitest.config.ts (no custom `include`),
pipeline/src/books.ts:254–256, dc.html:14–38 at commit 5ba1096,
index.html:1958/1966–1975/2187/2192–2197).*
