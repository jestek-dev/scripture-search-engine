# Song of Solomon — Layer-3 tag-sweep ledger

**Date:** 2026-08-26 · **Repo:** `scripture-search-engine` @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` · **Concept library:** 239 engine packs (`ontology/concepts/*.yaml`) + 161 §11.1 adopted display ids (canonical list `/mnt/project-files/research/bible-rollout/tag-apply/adopted-concepts.md`, verified identical to the sweep kit's regenerated list) · **Book:** Song of Solomon, chapters 1–8 · **Prior art:** `/mnt/project-files/research/bible-rollout/song-of-solomon.md` (11 tags / 8 chapters; Decisions record #1–#13 binding — esp. #2 allegory signpost-only, #3 NO God-ward tags anywhere, #4 `godly-marriage` on chs 3/4/5/8 only, #6 awaken-love refrain not tagged separately) · **Inputs:** sweep kit (rules.md incl. plan §5.2 + CONVENTIONS §5/§9/§11 verbatim; concepts.md; concept-ids.txt; declines.md; corpus-blocked.md; books.md; output-spec.md; web-text.md).

**WEB text provenance:** the committed e762d1c fixture witnesses only Song 2:1 (pinned-fixture verified); all eight chapters verified against the 87fd68c full fixture (same source sha256 `b6f55cc7…` as e762d1c's manifest pin; byte-consistent with the committed fixture over all 5,726 witnessed verses). All quotes word-for-word WEB from the staged verse-per-line text (curly typography normalized to straight apostrophes per the proverbs.md #16 precedent).

**Entry format legend (per plan §5.2 / output-spec.md):** per chapter — 1. Existing tags (prior art) · 2. Applied-tag deltas (ADD/KEEP/DROP; no silent drops) · 3. Anchor-extension candidates (`id` | ref | WEB quote | proposed w) · 4. Lexicon candidates (`id` | phrase | 2–3 realistic queries) · 5. New-concept candidates · 6. Decline-overturn proposals · 7. Ceiling/refinement flags · 8. Decisions record (§11.6 yields). Findings on corpus-blocked ids are ROUTED to the roster row, never re-proposed. `romantic-love-and-intimacy` findings ride corpus-blocked roster row 48 (which also carries the folded `waiting-and-timing-in-love` / Song 2:7 charge rider). Honest-and-empty is the expected outcome for most of this book; the sparse baseline is deliberate.

---

## Song of Solomon 1
1. Existing tags (book doc): `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes — the one honest tag; `godly-marriage` correctly withheld (Decisions #4: no marriage markers in the chapter). Considered and not added: no God-ward id (Decisions #3 binding); `envy-and-jealousy` (1:6 "My mother's sons were angry with me." — narrated circumstance, no teaching substance).
3. Anchor-extension candidates: ROUTED to corpus-blocked roster row 48 (`romantic-love-and-intimacy`): Song 1:2 "Let him kiss me with the kisses of his mouth; for your love is better than wine." — already in the row's recorded refs (1:2); no new evidence to add from this chapter.
4. Lexicon candidates: none outside row 48's territory. The "dark, but lovely" beauty/self-image motif (1:5–6) stays a motif with no vocabulary home, as the book doc recorded — `identity-in-christ` would be a later-revelation read-back on this book and is not proposed.
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (1 tag).
8. Decisions record: none.

## Song of Solomon 2
1. Existing tags (book doc): `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes. The awaken-love refrain (2:7) stays untagged separately per Decisions #6 — folded into `romantic-love-and-intimacy` at adoption; the fold rides row 48.
3. Anchor-extension candidates: ROUTED to row 48: Song 2:4 "He brought me to the banquet hall. His banner over me is love."; 2:16 "My beloved is mine, and I am his."; charge rider 2:7 "that you not stir up, nor awaken love, until it so desires" — all already in the row's recorded refs (2:3–6, 2:16; charge rider); no new evidence.
4. Lexicon candidates: none outside row 48 (the row's design note already carries the celebration-register phrasings; "little foxes" (2:15) remains a phrase-origin motif, no concept home).
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (1 tag; note 2:1 is the book's only pinned-fixture-verified verse).
8. Decisions record: none.

## Song of Solomon 3 (subdivided: 3:1–5 / 3:6–11)
1. Existing tags (book doc): `godly-marriage`, `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes — both sitting tags sound (wedding day 3:11; night-search 3:1–4).
3. Anchor-extension candidates:
   - `godly-marriage` | Song 3:11 | "in the day of his weddings, in the day of the gladness of his heart" | w=0.4 — REGISTER CAUTION: pack anchors are NT household-duty texts; this is wedding-day narrative color, anchor-grade at most; curator decides whether it earns ranking weight.
   - ROUTED to row 48: 3:1–4 night-search refs; charge rider 3:5 (note WEB's 3:5 reads "not stir up nor awaken love" — no comma, unlike 2:7/8:4; book Decisions #10).
4. Lexicon candidates: none outside row 48.
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: book-doc subdivision (3:1–5 / 3:6–11) → mark for the per-verse refinement pass.
8. Decisions record: none.

## Song of Solomon 4
1. Existing tags (book doc): `godly-marriage`, `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes. Considered and not added: `living-water` (4:15 "a well of living waters" — the phrase names the bride in a love-figure; the pack's register is God/Christ as living water, so tagging would smuggle the allegory past Decisions #2–#3); `pastoral-sexual-purity` (4:12 exclusivity is celebration, not the pack's lust-crisis register).
3. Anchor-extension candidates:
   - `godly-marriage` | Song 4:12 | "My sister, my bride, is a locked up garden; a locked up spring, a sealed fountain." | w=0.5 — the book's own exclusivity-in-marriage picture; REGISTER CAUTION as at ch 3 (pack is household-duty teaching; curator call).
   - ROUTED to row 48: 4:1–16 already in the row's recorded refs; no new evidence.
4. Lexicon candidates: none outside row 48.
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (2 tags).
8. Decisions record: none.

## Song of Solomon 5
1. Existing tags (book doc): `godly-marriage` (borderline, flagged at Decisions #4), `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes. Standing declines hold: `friendship` NOT tagged on 5:16 (Decisions #5 — one clause, "This is my beloved, and this is my friend" (5:16), inside a praise-poem; no new textual evidence to overturn). Considered and not added: `pastoral-grief-and-loss` / `lament` (5:6–8 night-loss is love-longing, not grief practice or the pastoral register).
3. Anchor-extension candidates: ROUTED to row 48: 5:1 consummation + Friends' blessing ("Eat, friends! Drink, yes, drink abundantly, beloved.") — already in the row's recorded refs; no new evidence.
4. Lexicon candidates: none outside row 48.
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (2 tags).
8. Decisions record: none.

## Song of Solomon 6
1. Existing tags (book doc): none — "no concept in the current vocabulary is genuinely present in this chapter" (2026-08-23 wording; the 2026-08-25 worklist left ch 6 off, "not judged tag-bearing" — Decisions #13).
2. Applied-tag deltas:
   - ADD (PROPOSAL — revisits a recorded book-doc reversible call, flagged for the book-doc owner; NOT a declines.md overturn, as no declines-file row covers it): `romantic-love-and-intimacy` — the chapter carries the same two registers that justified the tag on chs 1, 2 and 7: the belonging-refrain in its second sounding, "I am my beloved's, and my beloved is mine." (6:3), and a sustained praise-poem (6:4–9): "You are beautiful, my love, as Tirzah, lovely as Jerusalem" (6:4); "My dove, my perfect one, is unique." (6:9). Parity argument: ch 7's tag rests on the refrain (7:10) plus praise and invitation; ch 6 has the refrain (6:3) plus six verses of praise. The 2026-08-25 pass was worklist-ref-driven (the gap row cited 6:3 only via the motif table), so ch 6's zero looks like a worklist artifact rather than a presence judgment made against this text. If the book-doc owner prefers the recorded zero, honest-and-empty stands and this proposal dies with no residue — 6:12's obscurity (Decisions #8) is untouched either way; no other concept is genuinely present.
3. Anchor-extension candidates: ROUTED to row 48 (NEW evidence — these refs are NOT among the row's recorded refs): Song 6:3 "I am my beloved's, and my beloved is mine."; 6:4–9 praise-poem ("My dove, my perfect one, is unique.", 6:9). The row's fixture-corpus note (presence = 2:1 alone) is unchanged; these are display/anchor refs for the re-pin curator.
4. Lexicon candidates: ROUTED to row 48: "i am my beloved's and my beloved is mine" (searchers also type the 2:16 order "my beloved is mine and i am his"; both belong to the row's design note).
5. New-concept candidates: none.
6. Decline-overturn proposals: none (the ch-6 ADD above is a book-doc reversible-call revisit, filed under deltas with its flag, not a declines.md overturn).
7. Ceiling / refinement flags: none (0–1 tags).
8. Decisions record: none.

## Song of Solomon 7
1. Existing tags (book doc): `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes — `godly-marriage` correctly withheld (Decisions #4: no marriage markers).
3. Anchor-extension candidates: ROUTED to row 48: 7:10 "I am my beloved's. His desire is toward me."; 7:11–12 invitation ("There I will give you my love.") — already in the row's recorded refs (7:1–12); no new evidence.
4. Lexicon candidates: none outside row 48.
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (1 tag).
8. Decisions record: none.

## Song of Solomon 8
1. Existing tags (book doc): `godly-marriage`, `romantic-love-and-intimacy`.
2. Applied-tag deltas: No changes. Standing calls hold: NO God-ward tag on 8:6's "a very flame of the LORD" (Decisions #3 — the book's only divine-name occurrence; no tag rests on it; reversible only by reversing #2, which this sweep does not propose). Considered and not added: `family-reconciliation` (8:1–2 sibling wish is a love-figure, not estrangement healing); `oaths-and-vows` (8:4 "I adjure you" is the poem's charge formula, not vow-keeping teaching).
3. Anchor-extension candidates:
   - `godly-marriage` | Song 8:6-7 | "Set me as a seal on your heart, as a seal on your arm; for love is strong as death." … "Many waters can't quench love, neither can floods drown it." | w=0.55 — the wedding-reading staple; REGISTER CAUTION: pack anchors are NT household-duty texts and its lexicon is marriage/husbands/wives; the curator decides whether the covenant-love celebration register belongs in this pack or waits for row 48's concept.
   - ROUTED to row 48: 8:6–7 already in the row's recorded refs; charge rider 8:4 recorded on the row.
4. Lexicon candidates:
   - `godly-marriage` | "bible verses for weddings" | queries: "bible verses for weddings", "wedding scripture readings", "bible reading for a wedding ceremony" — ties to the 8:6-7 anchor candidate above; "love is strong as death" / "set me as a seal upon your heart" phrasings themselves belong to row 48's design note (searchers type the KJV-style "upon"; WEB reads "on your heart").
5. New-concept candidates: none.
6. Decline-overturn proposals: none.
7. Ceiling / refinement flags: none (2 tags).
8. Decisions record: none.

---

## Song of Solomon — sweep totals

- ADD 1 proposal (`romantic-love-and-intimacy` ch 6 — flagged as a revisit of book-doc Decisions #13's reversible call; book-doc owner's call) · KEEP all 11 existing · DROP 0.
- Anchor-extension candidates: 3 (all `godly-marriage`, all register-cautioned) + routed anchor sets to corpus-blocked row 48 (only ch 6's refs are new evidence for the row).
- Lexicon candidates: 1 (`godly-marriage` wedding-readings row) + routed phrasings on row 48.
- New-concept candidates: 0 (gap rows for this book were logged 2026-08-23 and folded per §11.1; "dark but lovely" motif stands unhomed by design).
- Decline-overturn proposals: 0.
- Corpus-blocked routings: 1 roster row touched (row 48, `romantic-love-and-intimacy` + folded charge rider) — new evidence routed from ch 6; chs 1–5, 7–8 refs confirmed already carried by the row (not duplicated).
- Ceiling/refinement flags: ch 3 (book-doc subdivision). No chapter near the caps; the book's sparse baseline (max 2 tags/chapter) is deliberate and preserved.
- Guardrail confirmation: no God-ward tag proposed anywhere in the book; allegory remains signpost-only; all justification wording keeps the non-graphic celebration register.

**§9 survival audit (this block):** written as one atomic end-of-file append; after write, the file was re-read, pre-existing bytes verified unchanged, and this block verified present exactly once. [VERIFIED at append time — see ledger tail.]
