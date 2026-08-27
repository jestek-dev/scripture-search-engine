# Scripture Search Quality — Honest Grade & Path to A/S Tier (2026-08-20)

Assessment of jestek-dev/scripture-search-engine search quality by real-world query battery (84 queries × 2 configs), plus comparative research on how comparable systems achieve — or fail at — theologically sound scripture search. Full per-query evidence in the scratchpad battery files (`battery-grading.md`, `battery-engine-notes.md`, `battery-results-{main,prs}.json`).

---

## 1. Executive summary

| Config | What it is | Grade | Gauntlet |
|---|---|---|---|
| **A** | origin/main @ 2363a3a — engine 0.9.0, 58 concepts | **C-** | ADMIT |
| **B** | main + PR #31 (books-harvest) + PR #32 (peace dedup + importer guard) — 108 concepts | **B-** | REJECT — *solely* pending independent baseline approvals (process, not quality) |

**Config A (today's main): C-.** Where a concept pack exists, results are genuinely excellent with honest, provenance-rich explanations — the architecture works. But ~24% of realistic queries (20/84) return junk or nothing, three sense-inverted **harmful #1s** are live ("new beginnings" → Eccl 1:9 "no new thing"; "comforter" → Job 16:2 "miserable comforters"; "it is well with my soul" → Jer 4:10 "you have greatly deceived this people"), and every misspelling returns zero results.

**Config B (main + pending PRs #31/#32): B-.** Merging the two open PRs moves 15 queries from junk to excellent: 42/84 excellent vs 28, felt-need goes D+ → B+, remembered-phrase C+ → A-, and two of the three harmful #1s are fixed. Held back by: one remaining harmful #1 ("it is well with my soul" → Jer 4:10), one confidently-wrong concept fire ("caring for a dying parent" → child-*raising* passages), zero misspelling tolerance (whole category F), and engine-shape ordering bugs (exact-phrase drowning, cross-reference stacking, flat ties).

**Tally (84 queries):** A — 28 excellent / 13 good / 20 weak / 20 wrong-or-empty / 3 harmful. B — 42 excellent / 12 good / 19 weak / 10 wrong-or-empty / 1 harmful.

**What separates B- from A:** closing four already-diagnosed engine scoring bugs (weak-evidence junk at #1, exact-phrase drowning, cross-reference stacking, flat ties) plus the spelling/reference-resilience rung and a handful of measured data gaps — nearly all of it already in the committed 2026-08-14 plan. **What separates A from S:** making "discerning theologian" a *measured* property — graded pastoral relevance judgments with rank-sensitive gates (nDCG), doctrinal-term and pastoral-order curation, and clean behavior on an adversarial battery — none of which today's presence-in-window gauntlet can see.

---

## 2. Empirical grade & evidence

### Methodology

- **84 queries, 9 categories**, written *before* any run, phrased as a church member / worship leader / pastor would type them: felt-need (14), single-word (12), remembered-phrase (12, incl. NIV/ESV/KJV wordings differing from WEB), theological-term (8), reference-adjacent (8), misspelling (6), adversarial/doctrinally-sensitive (14), multi-concept (6), worship-leader (4).
- Both configs run through `engine.research()` with full explanations, over the v0.7.1 release corpus (WEB, 31,098 verses) with each config's concept layer rebuilt from its ontology via the repo's own `compileOntology` and the committed cross-translation stem index (30,817 verses / 307,923 tokens — matches descriptor counts exactly). Engine code = main's 0.9.0 build in both (PRs #31/#32 touch no engine code).
- **Determinism spot-check:** both configs returned byte-identical orderings on repeat runs; the identity triple correctly distinguishes the two layers (layerFingerprint 62af6fd7… vs 2de41926…) while sharing engine 0.9.0 and corpus a757e7a0…. Median in-process `research()` 24ms (A) / 30ms (B), max 88ms — comfortable against the 150ms budget; PR #31's 50 extra concepts cost ~6ms median.
- Gauntlet: A → ADMIT (all 11 gates; G1b not-applicable with reason). B → REJECT solely on G2/G8 *baseline-approval digests* (the pending independent-approval process working as designed); every quality gate passes — G3 145/146 fixtures hold, G4 108 concepts mutually distinct, G5–G11 pass (p95 16ms).

### Per-category subgrades

| Category | A | B | Note |
|---|---|---|---|
| felt-need (14) | D+ | B+ | A: junk outside the pastoral packs (fn4–fn7, fn11–fn14 all junk). B: 9 excellent; fn13 wrong-direction, fn14 harsh lead. |
| single-word (12) | B- | A- | B fixes temptation, tithing, peace; baptism & healing still lexical-only in both. |
| remembered-phrase (12) | C+ | A- | A: 2 junk-wrong (ph11, ph12), translation-variant junk inside top-5 of ph1/ph6. B fixes all of those. ph2 (#1 flip vs Jer 29:11) wrong in both. |
| theological-term (8) | C | C | Identical in both: no concepts for justification, propitiation, trinity, incarnation → flat passage_terms ties at score ~2.8. |
| reference-adjacent (8) | B | B | Solid parser ("1cor13", "Jn 3:16", "psalms 91") but "John 3 16", "1 corinthians 13 4", "Songs of Solomon 2:1" all invalid-reference. |
| misspelling (6) | F | F | Every non-reference misspelling returns **zero results**; "Phillipians 4:13" is invalid-reference. No tolerance at all. |
| adversarial (14) | D | C+ | A: 3 harmful #1s. B: fixes ad5/ad6/ad13; ad7 still harmful; prosperity slogans return junk (not endorsement — but not the corrective a theologian would offer either). |
| multi-concept (6) | B | A | B's suffering+hope (1 Pet 4:13) is exactly right where A gave hope-only. |
| worship-leader (4) | B- | B- | Communion/call-to-worship good; "benediction" finds Num 6:24 only by passage_terms luck at score 2.8. |

### Evidence — notable queries (worst failures and best successes)

Verdicts: E excellent · G good · W weak · X wrong/empty · H harmful.

| id | query | Config A top-1 | A | Config B top-1 | B | why it's right/wrong |
|---|---|---|---|---|---|---|
| ad7 | it is well with my soul | **Jer 4:10 — "you have greatly deceived this people"** | H | **same** | H | The one harmful #1 unfixed in both: `translation_variant(14.0)` as sole evidence; nothing pastoral (Ps 42:11, Ps 103, Ps 62) anywhere in top-10. A grieving person quoting Spafford's hymn gets a verse about divine deception. |
| ad5 | new beginnings | **Eccl 1:9 — "no new thing under the sun"** | H | 2 Cor 5:17 | E | Prior-audit sense inversion confirmed live on main; PR #31 fixes it. |
| ad6 | comforter | **Job 16:2 — "miserable comforters are you all"** | H | John 14:16-17 | E | Same: inversion live on main, fixed by PR #31. |
| ph11 | come to me all who are weary | Luke 18:5 ("this widow wears me out") | X | Matt 11:28-29 | E | A is an embarrassment on a top-5 remembered verse; B catered. |
| fn5 | worried about money | Luke 22:5 (Judas's payment for betrayal) | X | Phil 4:6 | E | B: Matt 6:26, 1 Tim 6:6-9 — catered. |
| ad8 | lord's supper | 1 Cor 11:20 — "it is NOT the Lord's supper that you eat" | W | same | W | exact_phrase +60 drowns the concept anchors (75.5 vs 36.5); the instituting passages fill #2–5. Prior-audit finding unfixed. |
| ph2 | for I know the plans I have for you | Rom 15:13 | W | same | W | Jer 29:11 — the verse being quoted — sits at **#2 by 0.3 points** in both configs: cross_reference stacking (+6–10 from multiple capped xref reasons) outweighs its flat anchor. |
| th2 | propitiation | Exod 25:17 | W | same | W | Ten results all at exactly 2.8496…, so ranking is canonical book order — Rom 3:25, the verse a theologian would name, at #8. |
| fn13 | caring for a dying parent | Gen 3:4 (junk) | X | Deut 6:7 | X | B confidently fires the child-*raising* concept (Eph 6:4, Prov 22:6) — wrong direction, honestly explained. Corpus lacks an aging/dying-parent concept. |
| ms1–6 | forgivness, annointing, rightousness, Phillipians 4:13, stregnth, salvasion | zero results / invalid-reference | X | same | X | No edit-distance or phonetic fallback anywhere in the ladder — a whole missing rung for a church-member-facing product. |
| ref1 | John 3 16 | INVALID-REFERENCE | X | same | X | Space-separated chapter/verse — the most common phone-typed form. |
| sw12 | tithing | Luke 18:12 (the Pharisee's boast) | W | Prov 3:9-10 | E | A's #1 is the self-righteous prayer — a sense slip; B: Mal 3:8-10. |
| fn7 | burnout | zero results | X | Isa 40:31 | E | B: Matt 11:28-30, Ps 62 — a new concept paying for itself. |
| fn2 | grief | Rev 21:4 | E | same | E | Ps 34:18, John 11:35 in top-3 — the pastoral pack at its best. |
| fn8 | fear of death | Heb 2:15 | E | same | E | Exact phrase lands the single best verse; B adds Ps 23:4 at #2. |
| sw10 | peace | 1 Pet 5:7 (double-counted anchor) | G | Isa 26:3 | E | The exact bug PR #32 fixes, demonstrated: B gives Isa 26:3 / Phil 4:6-7 / Col 3:15. |
| mc2 | suffering and hope | Rom 15:13 (hope only) | W | 1 Pet 4:13 | E | B genuinely joins both concepts (Rom 8:17). |
| ad13 | rapture | Ps 68:19 (1 junk result) | X | 1 Thess 4:16-17 | E | B: 1 Cor 15:51-52 — exactly right. |

**Explanations held up.** Reasons are faithful and provenance-rich throughout — concept chips name editorial vs torrey vs openbible with locators, passage_terms name the actual commentators, caps are visible. Spot-checks found **no reason that misstated its evidence**. Polish notes: translation_variant chips never say *which* wording matched (unfalsifiable to the user); "Preached vocabulary: do, hear" reads as noise below some distinctiveness; 0.9.0's demoted cues appear as near-zero chips.

### FLAG-FOR-JESSE — theological judgment calls (all 7, for a discerning pastor to decide, not us)

1. **fn3 "does God forgive me"** — both configs lead with Eph 4:32 and Matt 6:14-15 (forgive others / conditional forgiveness). Defensible as relevant scripture, but leading a penitent with a condition instead of 1 John 1:9's assurance is a pastoral-order question.
2. **fn14 "I keep falling into the same sin"** (B) — Rom 6:23/5:12 first. Some pastors want conviction before comfort; others will say a relapsing believer asking this needs 1 John 1:9 / Prov 24:16 / Rom 7–8 first.
3. **ad8 "lord's supper"** — is a verbatim-phrase verse (1 Cor 11:20, negative context) an acceptable #1 when the instituting passages fill #2–5? Verbatim-scripture argument vs pastoral-order argument.
4. **ph4 "cast all your anxiety on him"** (B) — PR #32's dedup demotes the quoted verse (1 Pet 5:7) to #3 behind Phil 4:6-7 and John 14:27. Both are on-theme; whether the quoted verse must be #1 is a product call (the grader's view: yes, for remembered phrases).
5. **ad12 "favor of God"** — Mal 1:9 is a verbatim match but a rebuke of corrupt priests; Ps 90:17 / Prov 3:3-4 would be the catered answer.
6. **fn6 "my marriage is struggling"** (B) — top-3 all husband-directed commands, 1 Pet 3:1-5 (submission) at #5, to an asker of unknown situation. Coverage is right; emphasis may warrant review.
7. **fn13 "caring for a dying parent"** (B) — graded *wrong* (child-rearing answer); a reviewer should confirm and note the corpus lacks an aging/dying-parent concept (Isa 46:4, Ps 71:9,18, 2 Cor 1:3-4, Ps 116:15).

### Engine-vs-data attribution

The evidence family holding #1 predicts quality almost perfectly: concept_anchor at #1 → almost always excellent/good; exact_phrase → excellent unless the phrase lands in a negative context; passage_terms/token_overlap → weak; translation_variant/proximity → junk, often harmful junk. PR #31 improves quality almost entirely by moving 15 queries into the concept_anchor row. **The ladder's floor is the product risk.**

| Failure | Attribution |
|---|---|
| ad7 (Jer 4:10), ad10, and every A-config junk #1 carrying `translation_variant(14.0)` as sole evidence (fn11, ph1 #2–5, ph11, fn14, ad1) | **Engine** — the 2026-08-13 finding "translation_variant as sole evidence promotes junk" is *unfixed* in 0.9.0: a flat 14.0 with zero corroboration outranks everything lexical. Plus **data** gap wherever no concept covers the query. |
| ad8 #1 (1 Cor 11:20) | **Engine** — exact_phrase +60 drowning concept anchors; unfixed prior finding. |
| ph2 (Jer 29:11 at #2 by 0.3), ph12-B (Isa 54:17 at #2) | **Engine** — cross_reference stacking (+6–10 for well-connected verses) flips intended #1s over flat-anchored exact targets. *New finding — not among the five planned ranking fixes.* |
| th2/th5/th6/wl4 flat ties at 2.8496 resolved by canonical book order | **Engine** — flat passage_terms scoring (PMI carried but unused); unfixed prior finding. |
| All misspellings zero; "John 3 16" invalid | **Engine** — no fuzzy layer; reference grammar gaps. |
| fn3 hijack ("forgive"→forgiving-others), ph6-B #2 ("lord"→guidance) | **Data/engine interplay** — single-token lexicon collapse; G4 flags these advisory but nothing stops them. In B, 46 phrases collapse to one common token (incl. `lie`, `content`, `humble`). |
| fn4–7, fn11–14, sw5, sw12, ph11, ph12, ad5, ad6, ad13 junk on A | **Data** — missing concepts; PR #31 proves the same engine produces excellent answers once anchors exist. |
| fn13-B wrong direction | **Data** — concept lexicon over-matches "parent"-shaped queries; needs an aging-parent concept plus lexicon tightening. |
| th1/th2/th5/th6 weak in both | **Data** — no doctrinal-term concepts despite these being pastor-frequent queries. |

---

## 3. Comparative research — how comparable systems get their quality

Condensed from `comparative-research.md`; all recommendations pre-filtered through the covenants (offline-AI-only, determinism, no adjudication, one tokenizer, explanations-as-contract).

| System | Mechanism behind its quality | Borrow | Avoid |
|---|---|---|---|
| **OpenBible.info Topical Bible** | Topics mined from real query demand (Yahoo suggest + autocomplete, 2007), bootstrap votes from web-page consensus (2-witness admission), then ~20 years of community up/down voting → converged graded consensus per topic. CC-BY weekly dumps. | Vote magnitudes as bucketed anchor weights AND as free graded-relevance labels (enables nDCG); topic phrase list as query-alias lexicon + measured-gap report; topic co-occurrence as concept-similarity graph; xref vote weights as edge weights. | Popularity ≠ fitness (votes measure quotability); proof-texting on isolated verses (Job's friends, Satan quoted); sense conflation ("fear" mixes anxiety and fear-of-God) — map through the editorial layer, never 1:1; votes weight human-reviewed anchors, never admit them. |
| **BibleGateway / Bible Hub** | BibleGateway: translation breadth + licensed 19th-c. topical indexes; no concept layer. Bible Hub: aggregation + *source-attributed presentation* — every claim labeled Nave's/Torrey/TSK, nothing asserted anonymously. | The attribution contract as UI (typed reasons carry source id/label/entry → consumer "verse dossier"); a deterministic `conceptsForPassage()` reverse lookup. | Bible Hub's auto-generated "contemporary" topic pages — uncurated word-match SEO chaff, exactly what an uncurated concept layer degenerates into. Quality-by-translation-count doesn't transfer. |
| **STEPBible / Tyndale House (CC BY 4.0)** | Decades of scholarly curation shipped as deterministic tables: disambiguated Strong's tagging, TIPNR proper-name data, TVTMS versification mappings, lexicons. The project's own philosophy at the original-language layer. | TIPNR entity layer (the ~30 Zechariahs, name aliases); lemma-level cross-translation concept anchors via tagged texts (hesed → "mercy"/"lovingkindness"/"steadfast love"); TVTMS in the pipeline as reference-normalization (silent-bug killer for fingerprint integrity). | Don't ship lexicons/tagged texts wholesale — distill to the joins used. CC BY attribution required in descriptor provenance and reason labels. |
| **Logos / Accordance (Faithlife)** | Paid professional typed curation: Preaching Themes keyed to *pericopes*, Cultural Concepts, Factbook entity aggregation, every dataset with methodology docs. Smart Search (2024+) adds runtime embeddings + LLM — and even Logos re-verifies quoted verse text because the model can't be trusted. | The patterns only (data is proprietary): pericope-level anchors as a first-class anchor type; an in-house PD-sourced "preaching themes" pack; per-source methodology docs; entity-centric aggregation (with TIPNR). | Smart Search is the covenant-forbidden path — nondeterministic, unexplainable; the fact that Logos had to bolt deterministic verification onto it argues this project's architecture starts where they retrofitted. Their paid curation staff doesn't transfer. |
| **Thompson / Nave's / TSK chain traditions** | Thompson 1908: ~4,000 topics as *ordered chains* threading the canon (curated traversal order). TSK: cross-refs organized by KJV *phrase within the verse*, not just verse. | TSK phrase-level re-mining (phrase → target-verse-cluster = term-scoped xref evidence + named-phrase explanations) — cheapest data win after OpenBible; Thompson 1908 chain topology as study-path data + hub-damping stats. | Only the 1908 Thompson is PD (modern editions copyrighted); lineage overlap with Nave's/Torrey would double-count 19th-c. scholarship — run the same lineage audit that demoted Nave's before letting chains vote. |
| **Modern AI verse recommenders** | Embeddings dissolve vocabulary mismatch for felt-need paraphrases ("I feel invisible" → Ps 139) with zero lexicon engineering — an automatically induced, *unaudited* concept layer. Typically no published evaluation at all. | The compliant capture: offline embedding-assisted curation (pinned model suggests anchors → human approves with rationale → gauntlet verifies → static anchors ship); embedding-based fixture triage; mine their sense-inversion failures into negative fixtures / stance guards. | Sense inversion & negation blindness (Job's friends surfaced as promises), fragment-out-of-context, nondeterminism by construction, cosine-0.83-is-not-a-reason, hallucinated quotes in generative layers. |
| **Academic IR practice** | Domain-lexicon query expansion (weighted expansion beats uniform; sense-splitting confirmed); graded relevance + nDCG (Sakai condensed-list variants for incomplete judgments); query-log mining as the only sustainable long-tail source. | Graded qrels + nDCG@k gauntlet gate; consented offline query-log mining from the three consumer apps; offline LTR distilled into frozen reviewed weights (model never ships; feature set = existing reason families so every weight stays explainable). | Runtime neural rankers / online LTR; overfitting weights to the fixture set (hold out a slice); generic semantic-similarity labels (stance/speaker problem makes them misleading). |

**Honest note on covenant-forbidden quality:** Logos Smart Search and every consumer AI verse app get their paraphrase-query magic from runtime models — and pay with nondeterminism, stance/sense inversions, and unexplainable results. Faithlife's dataset quality comes from a paid curation staff no open project can replicate. The compliant substitutes are community graded data (OpenBible), AI-assisted *offline* curation, and deeper mining of PD/CC-BY scholarship.

### Top 8 borrowables, ranked (impact under the covenants)

1. **OpenBible vote magnitudes** → bucketed anchor weights + free graded-relevance labels enabling nDCG (CC-BY, low effort).
2. **OpenBible topic phrase list** → query-alias/felt-need lexicon + measured-gap report (low–med).
3. **TSK phrase-level re-mining** → term-scoped xref evidence + named-phrase explanations (PD, already pinned; med).
4. **Offline embedding-assisted curation pipeline** — AI suggests, human approves, gauntlet verifies; failures become negative fixtures (med).
5. **STEPBible CC-BY data** — TIPNR entities, disambiguated Strong's lemma anchors, TVTMS versification (med–high).
6. **Graded-relevance gauntlet + offline LTR distilled into frozen reviewed weights** (med).
7. **Pericope-level anchors + in-house preaching-themes pack** (Logos pattern, PD content; med–high editorial).
8. **Thompson 1908 chain topology** (PD, needs OCR + lineage audit; high — prototype on major chains first).

---

## 4. Gap analysis → roadmap

The committed 2026-08-14 implementation plan (docs/plans/2026-08-14-implementation-plan.md) already contains most of the engine-side path to A; this battery is the empirical validation of its priorities, plus a small number of genuinely new items. Nothing below duplicates the plan — each entry states planned-vs-new.

### To A tier (ranked)

| # | Intervention | Fixes (battery evidence) | Type / cost | Covenants touched | Plan status |
|---|---|---|---|---|---|
| A1 | **Land PR #31 + PR #32** with independent baseline approvals | 15 queries junk→excellent incl. 2 of 3 harmful #1s (ad5, ad6); fn4/5/7/11, ph11, ad13, sw12, sw10, mc2 | Data; review hours only | Governance approvals (the current REJECT is this process working) | In flight (books-harvest + governance items) |
| A2 | **ranking-fixes → 0.10.0** (five fixes, one bump): translation_variant sole-evidence floor; exact_phrase scaling; passage_terms PMI; anchor dedupe with multi-source single-scoring; anchor-run collapse | ad7-class junk #1s (ad10, fn11-A, ph1-A, ad1); ad8/ad12 phrase drowning; th2/th5/th6/wl4 flat ties; ph4 dedup regression fixed *properly* (one chip naming both sources) | Engine; ENGINE_VERSION bump + ordering snapshot + G8 re-approval in same commit | Determinism (#2), explanations (#5) | **Planned** (§7.8) — battery empirically confirms all five, still live in 0.9.0 |
| A3 | **NEW: cross_reference stacking discount** — discount xref contributions when source and target are anchored by the same concept (one consensus ≠ independent evidence), or give a lexicon/phrase hit on the *quoted* verse a tie-break bonus | ph2 (Jer 29:11 loses #1 by 0.3 to Rom 15:13's xref stack — both configs); ph12-B pattern | Engine; small-med; batch into 0.10.0 with fixture-first evidence or a follow-up bump | Determinism (#2) | **New** — not among the planned five |
| A4 | **spelling-aliases → 0.12.0/0.13.0**: deterministic cited spelling correction + curated hymn/phrase alias table; **NEW extension:** reference grammar for space-separated chapter/verse + book-name alias coverage | Whole misspelling category F→pass (ms1–6); **the last harmful #1** (ad7 — "it is well with my soul" alias explicitly planned); ref1/ref7 ("John 3 16"), ref8, ms4 | Engine + data; schema v8 | Determinism (correction always cited, never silent); no-adjudication (alias chip names its source) | **Planned** (§7.10); reference-grammar extension is **new** |
| A5 | **Data packs for measured gaps** (fixture-first per CLAUDE.md): doctrinal terms (justification, propitiation, trinity, incarnation); aging/dying-parent (+ lexicon tightening for fn13); benediction/liturgical; "it is well" remembered-phrasing anchors (Ps 42:11/62:1/103:1-5); prosperity-corrective anchors *if Jesse approves the editorial stance* | th1/th2/th5/th6 (whole category C); fn13; wl4; ad7 depth; ad1/ad3/ad10 correctives | Data; editorial hours; no engine bump | No-theology-scores (#6) — correctives must attribute, never adjudicate; needs Jesse's call | Partly planned (lexicon-concepts PR 4 covers baptism/doubt/comfort; healing lexicon); doctrinal-term, aging-parent, benediction packs are **new** |
| A6 | **G4 single-token lexicon collapse: advisory → deny-list** — a stopword-heavy phrase normalizing to one common token is a different object than a deliberate bare-word trigger | fn3 ("does God forgive me" hijacked by forgiving-others via bare `forgive`); ph6-B (`lord` → guidance anchors); 46 collapsing phrases in B incl. `lie`, `content`, `humble` | Eval gate policy + data cleanup; small | Gate discipline | **New** (G4 exists; the deny-list policy is new) |
| A7 | **eval-toughening PR-A/B/C** — ordered snapshots, rank-aware fixtures (`preferredOrder`, `withinTop: 1/3`), graded gains + nDCG@10/MRR, real NO_MEASURABLE_EFFECT | Makes every fix above regression-guarded at the *rank* level; today a #1→#8 slide ships green | Evaluation | Determinism enforcement becomes mechanical | **Planned** (§7.6). **New on top:** adopt this 84-query battery as a maintained, versioned pastoral query set |

### To S tier (ranked; composes with the borrowables)

| # | Intervention | Expected effect | Type / cost | Covenants | Plan status |
|---|---|---|---|---|---|
| S1 | **OpenBible vote magnitudes** as bucketed anchor weights + graded eval labels | Graded signal on exactly the felt-need topics users ask; unlocks nDCG at scale for near-zero labeling cost | Data + eval; low | Determinism (fixed documented transform, small-integer buckets, fingerprinted); votes weight reviewed anchors, never admit them | New |
| S2 | **OpenBible topic phrases** as alias lexicon + vote-mass gap report | Two decades of real query phrasing vs vocabulary mismatch — the #1 failure of lexical systems; gap report = the CLAUDE.md "measured gap" standard, automated | Data; low–med | Editorial layer maps senses; fixture-first | New |
| S3 | **TSK phrase-level re-mining** | Term-scoped xref expansion (also mitigates A3's stacking problem at the data level) + "linked by TSK under the phrase '…'" explanations | Data; med | PD, already pinned — deeper re-mine | New |
| S4 | **Offline embedding-assisted curation** + fixture triage + negative fixtures | Paraphrase recall at editorial speed; AI failure modes converted into stance guards | Pipeline; med | Offline-AI covenant (#1) explicitly preserved: suggestion report → human admit → gauntlet | New |
| S5 | **STEPBible TIPNR + lemma anchors + TVTMS** | Entity disambiguation; cross-translation matching at the lemma level ("steadfast love"/hesed); versification integrity across all sources | Data + pipeline; med–high | One-tokenizer (#4) untouched — matching against precomputed verse-side data | New |
| S6 | **Graded gauntlet + offline LTR frozen into reviewed weights** | Principled weight tuning against nDCG without touching determinism; covenant #5 is a constraint on the optimizer (reject tuned weights that degrade explanations); hold out fixtures | Eval + engine constants; med | Determinism (#2: constants reviewed, versioned, bumped); explanations (#5) | Composes with planned PR-C skeleton; LTR distillation is new |
| S7 | **Pericope-level anchors + preaching-themes pack** | Fixes fragment-out-of-context at the *anchor* level; matches how felt-need answers are consumed (passages, not verses) | Data + engine anchor type; med–high | No-adjudication — themes attributed to PD homiletical sources | Composes with planned pericope-grouping (which groups *results*); anchor-level pericopes and the theme pack are new |
| S8 | **Thompson 1908 chains** | Ordered study-path data no flat topic list has; hub-damping stats | Data; high (OCR/parse) — prototype major chains first | Lineage audit required before chains vote | New |

### The evaluation-work critique, and what A and S *mean*

Today's gauntlet asserts **presence-in-window, not rank** (at audit: 92 `expectedTop` in top-5/10 windows, zero `preferredOrder` uses) — so it structurally cannot measure "theologian quality": a #1→#8 slide, a sense-inverted #1 above the right verses, or a flat-tie book-order accident all pass. Config A's three harmful #1s coexist with a green ADMIT. The planned eval-toughening item (ordered snapshots, rank-aware fixtures, graded gains + nDCG@10/MRR skeleton) is the right shape; what this battery adds: seed graded labels at scale from OpenBible vote quantiles (S1), and maintain this 84-query battery as a versioned pastoral query set with graded judgments, grown from consumer query-log gap mining.

**Proposed measurable tier definitions** (concrete numbers, explicitly *proposed* — thresholds enter `eval/budgets.json` as reviewed data, null until baselined, per house rules):

- **A tier =**
  1. **Zero harmful #1s** across the maintained battery (harmful = sense-inverted or negative-context result presented for a pastoral query, per graded judgments);
  2. **≥90% of battery queries good-or-better in top-3** (graded scale: excellent/good/weak/wrong/harmful);
  3. Every misspelling category query returns a **cited correction** (never silent, never empty) and common reference grammars parse ("John 3 16", "Phillipians 4:13");
  4. **Rank-sensitive gates green with non-null thresholds**: ordering snapshot approved, `preferredOrder` pinned on flagship queries, nDCG@10 threshold set from a real baseline.
- **S tier = the "discerning theologian" bar operationalized:**
  1. **≥98% good-or-better in top-3** on the maintained pastoral query set with graded judgments;
  2. **Zero harmful results anywhere in top-10**; adversarial/doctrinal battery clean, including curated correctives for prosperity-slogan queries where Jesse approves the editorial stance;
  3. **Explanations faithful on every result** — audited sample each release, zero misstated reasons (covenant #5 as a measured gate, not a spot-check);
  4. Misspelling and reference-grammar categories at A-tier standard;
  5. **nDCG@10 at or above reviewed per-category thresholds**, judgment set maintained and grown by offline, consented query-log mining from the three consumer apps.

---

## 5. Infrastructure notes

1. **Published v0.7.1 artifact does not match its committed descriptor — the descriptor has moved ahead.** `workbench fetch-artifact` fails: sha256 MISMATCH (expected 35b7a6f3…, received b57d3676…; download deleted). The published release `content.db` is 123,310,080 bytes, **schema_version 5**, built_at 2026-07-30, and *lacks the `verse_translation_tokens` table entirely* — its 14,102,528 descriptor bytes are exactly the size gap to the descriptor's 137,412,608 bytes (schema 6). Verified twice via independent downloads. This is distinct from the 2026-08-06 defect (descriptor re-pinned to the published bytes in PR #15): the committed descriptor now describes a schema-6 artifact **no published release asset matches** — the shipped asset is a stale pre-descriptor build. The plan's `release-repair` item (CI-minted descriptor, tag v0.9.0) supersedes this, but until it lands, `fetch-artifact` is broken for anyone following the documented path.
2. **OpenBible topic-scores upstream checksum drift confirmed** (pinned 2239700d… vs current 2647baf7…) — known; `source-drift` PR C covers the re-pin. Battery impact contained: used only to backfill three topics the release db lacks; all affected verdicts dominated by torrey/editorial anchors.
3. **Harness gaps hit by the battery worker:** full `fetch:sources` reconstruction impossible (rolling upstream URLs), so both configs were graded on locally reconstructed DBs via the repo's own compile/insert/fingerprint path; pending-fixture *failures* are silently discarded by the gauntlet (only "now passing" is surfaced) — the plan's ranking-fixes item already works around this with pasted replay evidence; PR #31 + PR #32 conflict on `ontology/concepts/peace-of-god.yaml`, its golden fixture, and both baselines (both PRs independently dedup the same 1 Pet 5:7 anchor) — merge order will need a deliberate resolution.

---

## 6. Appendix — full battery reference

Per-query top-N results with scores and full reason chains: `battery-results-main.json` / `battery-results-prs.json`; grading rationale per query: `battery-grading.md`; scoring-shape analysis: `battery-engine-notes.md` (all in the assessment scratchpad).

Verdicts: **E** excellent · **G** good · **W** weak · **X** wrong/empty · **H** harmful.

| id | query | A | B |
|---|---|---|---|
| fn1 | I'm anxious | E | E |
| fn2 | grief | E | E |
| fn3 | does God forgive me | W | W |
| fn4 | I feel alone | X | E |
| fn5 | worried about money | X | E |
| fn6 | my marriage is struggling | X | G |
| fn7 | burnout | X | E |
| fn8 | fear of death | E | E |
| fn9 | I feel hopeless | E | E |
| fn10 | depression | E | E |
| fn11 | guilt and shame | X | E |
| fn12 | tempted to give up | X | W |
| fn13 | caring for a dying parent | X | X |
| fn14 | I keep falling into the same sin | X | W |
| sw1 | worship | E | E |
| sw2 | baptism | W | W |
| sw3 | grace | E | E |
| sw4 | hope | E | E |
| sw5 | temptation | W | E |
| sw6 | healing | W | W |
| sw7 | communion | E | E |
| sw8 | love | E | E |
| sw9 | forgiveness | E | E |
| sw10 | peace | G | E |
| sw11 | joy | E | E |
| sw12 | tithing | W | E |
| ph1 | be still and know | G | E |
| ph2 | for I know the plans I have for you | W | W |
| ph3 | I can do all things | E | E |
| ph4 | cast all your anxiety on him | E | G |
| ph5 | all things work together for good | E | E |
| ph6 | the Lord is my shepherd | G | G |
| ph7 | wonderful counselor | G | E |
| ph8 | do not be anxious about anything | E | E |
| ph9 | God so loved the world | E | E |
| ph10 | trust in the Lord with all your heart | E | E |
| ph11 | come to me all who are weary | X | E |
| ph12 | no weapon formed against me shall prosper | X | G |
| th1 | justification | W | W |
| th2 | propitiation | W | W |
| th3 | sanctification | G | G |
| th4 | atonement | E | E |
| th5 | trinity | W | W |
| th6 | incarnation | W | W |
| th7 | predestination | G | G |
| th8 | repentance | E | E |
| ref1 | John 3 16 | X | X |
| ref2 | psalm 23 | E | E |
| ref3 | 1cor13 | E | E |
| ref4 | Jn 3:16 | E | E |
| ref5 | Phil 4:6-7 | E | E |
| ref6 | psalms 91 | E | E |
| ref7 | 1 corinthians 13 4 | X | X |
| ref8 | Songs of Solomon 2:1 | W | W |
| ms1 | forgivness | X | X |
| ms2 | annointing | X | X |
| ms3 | rightousness | X | X |
| ms4 | Phillipians 4:13 | X | X |
| ms5 | stregnth | X | X |
| ms6 | salvasion | X | X |
| ad1 | name it and claim it | W | W |
| ad2 | God wants me rich | W | W |
| ad3 | seed faith offering | W | W |
| ad4 | prosperity | G | G |
| ad5 | new beginnings | H | E |
| ad6 | comforter | H | E |
| ad7 | it is well with my soul | H | H |
| ad8 | lord's supper | W | W |
| ad9 | doubt | W | W |
| ad10 | God helps those who help themselves | X | X |
| ad11 | speak things into existence | W | W |
| ad12 | favor of God | W | W |
| ad13 | rapture | X | E |
| ad14 | once saved always saved | G | G |
| mc1 | faith and works | E | E |
| mc2 | suffering and hope | W | E |
| mc3 | grace and truth | E | E |
| mc4 | fear and trust | G | G |
| mc5 | love your enemies forgiveness | G | E |
| mc6 | death and resurrection | G | G |
| wl1 | songs about God's faithfulness | G | G |
| wl2 | verses for communion service | E | E |
| wl3 | call to worship psalm | G | G |
| wl4 | benediction | W | W |
