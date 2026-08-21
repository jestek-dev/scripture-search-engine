# Audit gap re-verification — measured evidence before any pack

Date: 2026-08-21 · Plan item P1.11 (DG-1) · Measured on the working branch at
main @ `9542c83` (the PR #32 merge) plus this branch's Phase-0/1 eval work —
none of which touches ordering, corpus, or layer data.

## 1. Why this document exists

The 2026-08-13/2026-08-20 audit ran **pre-merge** — before PR #31 (the
four-book harvest: 50 concepts, 145 active fixtures) and PR #32 landed. The
concept-curation skill's stop rule says: *if it already passes, stop.* So
before a single Phase-4 YAML is drafted, every claimed gap gets fresh,
measured evidence on today's data, and any gap the data no longer supports is
struck **here**, with the evidence quoted — NO MEASURABLE EFFECT applied
before authoring instead of after.

Every gap below carries one of four verdicts:

- **confirmed-open** — the audit's claim reproduces on today's data; the
  Phase-4 item may proceed, citing this document.
- **closed-by-#31** — the replays show the gap already answered by curated
  data on main; the claim is struck with quoted evidence and no pack is
  drafted for it. (Where the enabling data in fact predates #31, the
  attribution says so — the category means "closed by data already merged,
  strike it", not a claim about which PR did the closing.)
- **re-scoped** — the audit's claim as written no longer describes the
  failure, but a narrower measured gap remains; the verdict states the new
  scope and the pending fixture (where one exists) encodes it.
- **bed-limited** — a miss explainable by the fixture-scoped bed's
  xref/passage-terms coverage; never booked as `closed`. (No gap's overall
  verdict is bed-limited in this sweep; two hermetic *legs* are, and are
  labeled inside their blocks: ad7 and ad12.)

Verdict counts: **27 confirmed-open · 1 closed-by-#31 · 2 re-scoped ·
0 bed-limited** (two bed-limited hermetic legs inside confirmed-open gaps).

No verdict below adjudicates a theological or pastoral question. Where a gap's
resolution is a reserved ruling (J1, J2, J5, J6, J8/J4, J9), the verdict
records the measurement those rulings consume and names the ruling — nothing
more.

## 2. The two measurement beds and their identity triples

Determinism is the product: every table below is reproducible from
`(engineVersion, corpusFingerprint, layerFingerprint, query)`. Two beds, three
identities each:

**Bed H — hermetic fixture bed** (the corpus the gauntlet's G3 runs on):

- engineVersion `0.9.0`
- corpusFingerprint `60b7f88879866bdd50f5560c2bbd5334c869358383fba5179183a9737b7c27ed`
- layerFingerprint `de60b905c7ceb4bd8952ceab1afc1038d92226e1fa71f9e32a49b889e35bfa6c`

**Bed F — full-corpus replay bed**, built by the committed recipe (plan
P1.11 field 2): the published v0.7.1 release asset, sha256
`b57d367682ec8e0c63ebcb66ac2ce5114dc2ab91bab360e0021f6391828658ce`
(123,310,080 bytes, schema 5) — the **same corpusFingerprint the audit ran
on** — with the full concept layer rebuilt from main's committed inputs: all
seven layer tables replaced (108 `concepts`, 705 `concept_lexicon`, 647
`concept_anchors`, 201 `concept_related`, 1,835 `cross_references`, 95,651
`verse_terms`) and the schema-6 `verse_translation_tokens` table created and
loaded from the committed 30,817-verse index (307,923 rows — Jeremiah 4:10's
`soul`/`well` row is the literal ad7 mechanism).

- engineVersion `0.9.0`
- corpusFingerprint `a757e7a01a82a589bd72a7311af9f6e1ea26477441dec1ee76d35b6167187de3`
- layerFingerprint `afe482cf814903608a4050098230baa30071e15dfb137e9b8be03feac3552cb5`
  (the rebuilt bed's own fingerprint, recorded per the recipe)

Method: direct `engine.research()` top-10 replays through a `ContentQueryPort`
over each bed (the F21 caveat applies — the gauntlet's G3 sees only
fixture-corpus runs, so Bed F evidence comes from the direct replay, quoted
here). Because Bed F's layer is rebuilt from **today's** committed inputs, its
layerFingerprint differs from the audit-era layer; where that changes a
result's *shape* without changing the gap, the block says so explicitly
(see th2).

## 3. Cross-check against the gauntlet

`npm run gauntlet` on the fixture bed, with the thirteen gap fixtures of
commit `d15e9db` present, reports (G3):

> Pending fixture status: **21 of 22 still failing**

All thirteen gap fixtures are among the still-failing (each block below quotes
its fixture's failing expectation). The one pending fixture not failing is
`it-is-well`, whose Jeremiah 4:10 guard G3 reports as **VACUOUS** on this
corpus ("the reference resolves to no verse in the running corpus") — honest
and deliberate, per the guard-vacuity rule; the harm it guards is live on
Bed F (see ad7).

## 4. Verdict ledger

| id | Query | Verdict | #1 family (Bed F) | #1 family (Bed H) | Phase-4 item | Pending fixture |
|---|---|---|---|---|---|---|

| th1 | `justification` | **confirmed-open** | token_overlap (Romans 4:25) | passage_terms (Psalms 40:9) | P4.1 · DG-2 | justification-by-faith.json |
| th1b | `justified by faith` | **confirmed-open** | exact_phrase (Galatians 3:24) | exact_phrase (Galatians 3:24) | P4.1 · DG-2 | justification-by-faith.json |
| th2 | `propitiation` | **confirmed-open** | passage_terms (John 1:29) | passage_terms (John 1:29) | P4.3 · DG-4 (data half; tie mechanics are P3.5) | propitiation.json |
| th2b | `atonement` | **closed-by-#31** | concept_anchor (Romans 5:8) | concept_anchor (Romans 5:8) | P4.3 · DG-4 (this half struck) | none — deliberately |
| th5 | `trinity` | **confirmed-open** | passage_terms (Genesis 1:1) | passage_terms (Genesis 1:1) | P4.4 · DG-5 | trinity.json |
| th6 | `incarnation` | **confirmed-open** | passage_terms (John 1:5) | passage_terms (John 1:5) | P4.5 · DG-6 | incarnation.json |
| th6b | `the word became flesh` | **confirmed-open** | exact_phrase (John 1:14) | exact_phrase (John 1:14) | P4.5 · DG-6 | incarnation.json |
| sanct1 | `sanctification` | **confirmed-open** | token_overlap (1 Thessalonians 4:3) | token_overlap (1 Thessalonians 4:3) | P4.2 · DG-3 (lexicon extension on the existing holiness pack) | holiness-sanctification.json |
| sanct2 | `sanctify` | **confirmed-open** | token_overlap (Ephesians 5:26) | token_overlap (Ephesians 5:26) | P4.2 · DG-3 | holiness-sanctification.json |
| fn13 | `caring for a dying parent` | **confirmed-open** | concept_anchor — WRONG concept (Colossians 3:20) | concept_anchor — WRONG concept (Colossians 3:20) | P4.6 · DG-7 (FLAG #7) | caring-for-aging-parents.json |
| fn13b | `my mother is dying` | **confirmed-open** | passage_terms (Psalms 27:10) | passage_terms (Psalms 27:10) | P4.6 · DG-7 | caring-for-aging-parents.json |
| wl4 | `benediction` | **confirmed-open** | passage_terms (Numbers 6:24) | passage_terms (Numbers 6:24) | P4.9 · DG-9 | benediction.json |
| sw2 | `baptism` | **confirmed-open** | token_overlap (Ephesians 4:5) | token_overlap (Ephesians 4:5) | P4.10 · DG-10 | baptism.json |
| sw6 | `healing` | **confirmed-open** | token_overlap (Matthew 19:2) | token_overlap (Matthew 19:2) | P4.11 · DG-11 (bare-word inventory) | prayer-for-healing-bare-word.json |
| sw6b | `holiness` | **confirmed-open** | token_overlap (Hebrews 12:10) | token_overlap (Hebrews 12:10) | P4.11 · DG-11 | holiness-sanctification.json |
| fn12 | `tempted to give up` | **re-scoped** | concept_anchor (1 Corinthians 10:13 — temptation register) | concept_anchor (1 Corinthians 10:13 — temptation register) | P4.7 · DG-8 | do-not-lose-heart-give-up-phrasings.json |
| fn14 | `I keep falling into the same sin` | **confirmed-open** | translation_variant (Ezekiel 14:4) | concept_anchor (John 8:34) | P4.7 · DG-8 (J2-gated — no fixture until Jesse rules) | none by design |
| fn3 | `does God forgive me` | **confirmed-open** | concept_anchor — WRONG register (Matthew 6:14-15) | concept_anchor — WRONG register (Matthew 6:14-15) | P4.7 · DG-8 data half + P3.2 engine half (FLAG #1, J1) | none by design |
| fn6 | `my marriage is struggling` | **confirmed-open** | concept_anchor (Ephesians 5:25) | concept_anchor (Ephesians 5:25) | P4.8 · DG-8b (FLAG #6, J6 — among the most sensitive calls; measurement only) | none by design |
| ph6 | `the Lord is my shepherd` | **confirmed-open** | exact_phrase (Psalms 23:1) — harm at #2–#3 | exact_phrase (Psalms 23:1) — harm at #2–#3 | P4.11 · DG-11 measured-harm cleanup (ph6-B) | shepherd-psalm-guard.json |
| ad7 | `it is well with my soul` | **confirmed-open** | translation_variant (Jeremiah 4:10) — HARMFUL #1 | proximity (Psalms 139:14) — bed-limited leg | P3.1 floor + QR-6 alias + P4.12 · DG-12 anchors (three-legged kill, division recorded in plan) | it-is-well.json |
| corner | `christ the cornerstone` | **confirmed-open** | translation_variant (1 Peter 2:4) | translation_variant (1 Peter 2:4) | P4.10 · DG-10 | christ-the-cornerstone.json |
| cornerb | `cornerstone` | **confirmed-open** | token_overlap (Job 38:6) | token_overlap (Ephesians 2:20) | P4.10 · DG-10 | christ-the-cornerstone.json |
| doubt | `doubt` | **confirmed-open** | token_overlap (Matthew 28:17) | token_overlap (Matthew 28:17) | P4.10 · DG-10 | doubt.json |
| ad1 | `name it and claim it` | **confirmed-open** | translation_variant (Isaiah 62:4) | passage_terms (Numbers 6:27) | P4.14 · DG-14 (J9-gated; measurement is stage-0 input) | none until J9 |
| ad3 | `seed faith offering` | **re-scoped** | concept_lexicon (Matthew 17:20) | concept_lexicon (Matthew 17:20) | P4.14 · DG-14 (J9-gated) | none — none needed unless J9 commissions one |
| ad10 | `God helps those who help themselves` | **confirmed-open** | translation_variant (Judges 9:24) | translation_variant (Matthew 19:11) | P4.14 · DG-14 (J9-gated) | none until J9 |
| ad11 | `speak things into existence` | **confirmed-open** | proximity (Ephesians 5:12) | proximity (Ephesians 5:12) | P4.14 · DG-14 (J9-gated) | none until J9 |
| ad12 | `favor of God` | **confirmed-open** | exact_phrase (Malachi 1:9) — wrong frame | translation_variant (Romans 11:7) — bed-limited leg | P4.14 · DG-14 (ruling J5; data half Psalms 90:17 corpus-blocked → P4.15) | none until J5 |
| ph4 | `cast all your anxiety on him` | **confirmed-open** | concept_anchor (Philippians 4:6-7); quoted verse #9 | concept_anchor (Philippians 4:6-7); quoted verse #6 | P4.13 · DG-13 (FLAG #4, J8/J4) | none — the ruling decides the fixture shape |

Scope note: this ledger's "every Phase-4 item" coverage means P4.1–P4.14 — P4.15 (DG-15) appears only as the corpus-blocked deferral target cited in the rows above, and P4.16 (B4, the offline curation tooling item) makes no gap claim to re-verify, so neither carries a per-query citation.

## 5. The struck gap: bare `atonement` (th2b)

The audit graded bare `atonement` a th-category gap. It is not one. On **both**
beds the query leads with curated the-cross data:

> Bed F/Bed H #1: **Romans 5:8, 25.200, `concept_anchor`, "Theme: The cross
> and atonement"** — followed by John 1:29 (23.624) and 1 John 2:2 (23.078)
> under the same chip; ranks 1–9 are all `concept_anchor` rows for the-cross,
> #10 is John 3:16 by `concept_lexicon`.

Attribution, checked in history rather than assumed: the enabling lexicon
entry is `ontology/concepts/the-cross.yaml:12` (`- atonement`), admitted
2026-08-06 in PR #13 (`f9b3d79`, the Torrey admission), and bare single-word
cues reach the concept layer since `76b608d` (2026-08-08, "make bare-word
queries reach the concept layer"). Both predate the audit — so this is a
mis-measured claim, not a #31 fix; the verdict category still applies as
"closed by data already on main, strike before authoring".

Consequences applied:

- **P4.3's bare-`atonement` half is struck.** A pack addition for it would be
  weight without value — NO MEASURABLE EFFECT, applied before the YAML exists.
  The `propitiation` half of P4.3 stands confirmed-open (th2).
- **No pending fixture carried the closed gap**, so none needed amending: the
  committed `propitiation.json` deliberately does not assert `atonement`
  (its note records this closure verbatim) and routes the reachability PIN —
  an *active* assertion that `atonement` keeps leading with the-cross chips —
  to P4.3's pack PR, where the fixture flips active. Pinning rides that PR
  rather than this measurement-only commit, exactly as the fixture note
  states.

## 6. Per-query measurements and verdicts

Each block: verdict, the #1 result's evidence family on each bed, the exact
identity triples the measurement ran on (§2 carries the full fingerprints),
and the top-10 tables from the replay captures. Every table row was
mechanically re-verified against the raw replay JSON (rank, reference, score,
family, label) before this document was assembled.



### th1 · `justification` — **confirmed-open**

Phase-4 item: P4.1 · DG-2. Pending fixture: justification-by-faith.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Romans 4:25); Bed H: passage_terms (Psalms 40:9).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

No concept names the doctrine anywhere. On Bed F the single verse that prints
the word leads by `token_overlap` at 5.000; everything beneath it — and the
entire Bed H top-10 — is the flat `passage_terms` tie at 2.8496…, ordered by
book-order accident. Romans 5:1 appears in neither top-10. The pending fixture
fails exactly here (G3\_EXPECTED\_TOP\_REASON\_LABEL / \_FAMILY on Romans 5:1).
The audit's claim reproduces on both corpora.

**Bed F (full corpus)** — `justification`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Romans 4:25 | 5.000 | token_overlap | Shared word: justification |
| 2 | Psalms 40:9 | 2.850 | passage_terms | Preached vocabulary: justification |
| 3 | Psalms 51:4 | 2.850 | passage_terms | Preached vocabulary: justification |
| 4 | Isaiah 43:26 | 2.850 | passage_terms | Preached vocabulary: justification |
| 5 | Isaiah 53:11 | 2.850 | passage_terms | Preached vocabulary: justification |
| 6 | Matthew 19:17 | 2.850 | passage_terms | Preached vocabulary: justification |
| 7 | Romans 6:1 | 2.850 | passage_terms | Preached vocabulary: justification |
| 8 | Romans 7:1 | 2.850 | passage_terms | Preached vocabulary: justification |
| 9 | Romans 7:6 | 2.850 | passage_terms | Preached vocabulary: justification |
| 10 | Romans 8:30 | 2.850 | passage_terms | Preached vocabulary: justification |

**Bed H (hermetic)** — `justification`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 40:9 | 2.850 | passage_terms | Preached vocabulary: justification |
| 2 | Psalms 51:4 | 2.850 | passage_terms | Preached vocabulary: justification |
| 3 | Isaiah 43:26 | 2.850 | passage_terms | Preached vocabulary: justification |
| 4 | Isaiah 53:11 | 2.850 | passage_terms | Preached vocabulary: justification |
| 5 | Matthew 19:17 | 2.850 | passage_terms | Preached vocabulary: justification |
| 6 | Romans 6:1 | 2.850 | passage_terms | Preached vocabulary: justification |
| 7 | Romans 7:1 | 2.850 | passage_terms | Preached vocabulary: justification |
| 8 | Romans 7:6 | 2.850 | passage_terms | Preached vocabulary: justification |
| 9 | Romans 8:30 | 2.850 | passage_terms | Preached vocabulary: justification |
| 10 | Romans 8:34 | 2.850 | passage_terms | Preached vocabulary: justification |


### th1b · `justified by faith` — **confirmed-open**

Phase-4 item: P4.1 · DG-2. Pending fixture: justification-by-faith.json (pending, failing).

#1 evidence family — Bed F: exact_phrase (Galatians 3:24); Bed H: exact_phrase (Galatians 3:24).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The right verses surface — Galatians 3:24 #1, Romans 5:1 at #3 (F) / #2 (H) —
but by `exact_phrase` alone. No curated chip appears anywhere in either
top-10: a result that ranks correctly with the wrong reason is still the gap
(covenant #5 — explanations are part of the contract). Confirmed-open on the
explanation half even though the retrieval half happens to land.

**Bed F (full corpus)** — `justified by faith`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Galatians 3:24 | 70.144 | exact_phrase | Exact phrase |
| 2 | Romans 3:28 | 69.700 | exact_phrase | Exact phrase |
| 3 | Romans 5:1 | 69.700 | exact_phrase | Exact phrase |
| 4 | Galatians 2:16 | 63.077 | exact_phrase | Exact phrase |
| 5 | James 2:24 | 21.271 | concept_lexicon | Related theme: Faith and works |
| 6 | Romans 10:17 | 16.580 | concept_anchor | Theme: Faith |
| 7 | Hebrews 11:6 | 15.676 | concept_anchor | Theme: Faith |
| 8 | Romans 10:10 | 14.000 | translation_variant | Worded this way in another translation: faith, justifi |
| 9 | James 2:14 | 10.757 | concept_lexicon | Related theme: Faith and works |
| 10 | James 2:18 | 10.757 | concept_lexicon | Related theme: Faith and works |

**Bed H (hermetic)** — `justified by faith`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Galatians 3:24 | 70.144 | exact_phrase | Exact phrase |
| 2 | Romans 5:1 | 69.700 | exact_phrase | Exact phrase |
| 3 | James 2:24 | 21.271 | concept_lexicon | Related theme: Faith and works |
| 4 | Hebrews 11:6 | 16.598 | concept_anchor | Theme: Faith |
| 5 | Romans 10:17 | 16.490 | concept_anchor | Theme: Faith |
| 6 | Romans 10:10 | 14.000 | translation_variant | Worded this way in another translation: faith, justifi |
| 7 | James 2:22 | 12.753 | concept_lexicon | Related theme: Faith and works |
| 8 | James 2:21 | 12.395 | concept_lexicon | Related theme: Faith and works |
| 9 | Hebrews 11:1 | 10.301 | concept_lexicon | Related theme: Faith as assurance of what is hoped for |
| 10 | Matthew 17:20 | 9.705 | concept_lexicon | Related theme: Faith like a mustard seed |


### th2 · `propitiation` — **confirmed-open**

Phase-4 item: P4.3 · DG-4 (data half; tie mechanics are P3.5). Pending fixture: propitiation.json (pending, failing).

#1 evidence family — Bed F: passage_terms (John 1:29); Bed H: passage_terms (John 1:29).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

"Propitiation" appears in no WEB verse (verified corpus-wide on the
31,098-verse bed), so no lexical rung can ever reach it; only curation can.
Both beds return `passage_terms` rows only, all at 2.8496…, with 1 John 2:2
sitting at #3 by book-order inside the flat tie and no curated chip anywhere.
Honesty note on shape: the audit's recorded shape (Exodus 25:17 #1,
Romans 3:25 #8, a ten-way 2.8496 tie) does **not** reproduce on this rebuilt
layer — Bed F now returns exactly three `passage_terms` rows (John 1:29,
1 John 2:1, 1 John 2:2) and Romans 3:25 / Exodus 25:17 are absent from the
top-10 entirely. The gap itself (no chip, structurally unreachable) stands
confirmed on both corpora; P3.5's pmiSum pre-measurement remains owed at its
own stage against whatever layer is current then.

**Bed F (full corpus)** — `propitiation`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:29 | 2.850 | passage_terms | Preached vocabulary: propitiation |
| 2 | 1 John 2:1 | 2.850 | passage_terms | Preached vocabulary: propitiation |
| 3 | 1 John 2:2 | 2.850 | passage_terms | Preached vocabulary: propitiation |

**Bed H (hermetic)** — `propitiation`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:29 | 2.850 | passage_terms | Preached vocabulary: propitiation |
| 2 | 1 John 2:1 | 2.850 | passage_terms | Preached vocabulary: propitiation |
| 3 | 1 John 2:2 | 2.850 | passage_terms | Preached vocabulary: propitiation |


### th2b · `atonement` — **closed-by-#31**

Phase-4 item: P4.3 · DG-4 (this half struck). Pending fixture: none — deliberately (see §5).

#1 evidence family — Bed F: concept_anchor (Romans 5:8); Bed H: concept_anchor (Romans 5:8).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

**Struck with evidence — see §5.** Both beds answer with the-cross anchors:
Romans 5:8 #1 at 25.200 with chip "Theme: The cross and atonement",
John 1:29 #2, 1 John 2:2 #3, and ranks 1–9 all `concept_anchor` under the
same chip (#10 John 3:16 `concept_lexicon`). The pack half of P4.3 that
targets bare `atonement` would be weight without value — NO MEASURABLE
EFFECT, applied before authoring. The `propitiation` half of P4.3 stands
(previous block).

**Bed F (full corpus)** — `atonement`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Romans 5:8 | 25.200 | concept_anchor | Theme: The cross and atonement |
| 2 | John 1:29 | 23.624 | concept_anchor | Theme: The cross and atonement |
| 3 | 1 John 2:2 | 23.078 | concept_anchor | Theme: The cross and atonement |
| 4 | Isaiah 53:5 | 22.000 | concept_anchor | Theme: The cross and atonement |
| 5 | 1 Corinthians 15:3 | 21.550 | concept_anchor | Theme: The cross and atonement |
| 6 | 1 Peter 2:24 | 20.900 | concept_anchor | Theme: The cross and atonement |
| 7 | 2 Corinthians 5:21 | 16.500 | concept_anchor | Theme: The cross and atonement |
| 8 | Galatians 3:13 | 15.400 | concept_anchor | Theme: The cross and atonement |
| 9 | 1 Peter 1:18-19 | 15.400 | concept_anchor | Theme: The cross and atonement |
| 10 | John 3:16 | 10.200 | concept_lexicon | Related theme: The love of God |

**Bed H (hermetic)** — `atonement`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Romans 5:8 | 25.200 | concept_anchor | Theme: The cross and atonement |
| 2 | John 1:29 | 23.624 | concept_anchor | Theme: The cross and atonement |
| 3 | 1 John 2:2 | 23.078 | concept_anchor | Theme: The cross and atonement |
| 4 | Isaiah 53:5 | 22.000 | concept_anchor | Theme: The cross and atonement |
| 5 | 1 Corinthians 15:3 | 21.550 | concept_anchor | Theme: The cross and atonement |
| 6 | 1 Peter 2:24 | 20.900 | concept_anchor | Theme: The cross and atonement |
| 7 | 2 Corinthians 5:21 | 16.500 | concept_anchor | Theme: The cross and atonement |
| 8 | Galatians 3:13 | 15.400 | concept_anchor | Theme: The cross and atonement |
| 9 | 1 Peter 1:18-19 | 15.400 | concept_anchor | Theme: The cross and atonement |
| 10 | John 3:16 | 10.200 | concept_lexicon | Related theme: The love of God |


### th5 · `trinity` — **confirmed-open**

Phase-4 item: P4.4 · DG-5. Pending fixture: trinity.json (pending, failing).

#1 evidence family — Bed F: passage_terms (Genesis 1:1); Bed H: passage_terms (Genesis 1:1).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

"Trinity" appears in no WEB verse (verified corpus-wide); both beds return
`passage_terms` rows only — an eight-way 2.8496… tie in book order at #1–#8,
2.041 rows at #9–#10 — with no chip anywhere. Matthew 28:19
appears in neither top-10 (the fixture fails G3\_EXPECTED\_TOP\_ABSENT on it).
Only a locator pack — passages naming Father, Son, and Spirit together, never
a doctrine-scorer — can reach this query.

**Bed F (full corpus)** — `trinity`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Genesis 1:1 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 2 | Numbers 6:24 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 3 | Deuteronomy 6:4 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 4 | John 1:1 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 5 | John 1:3 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 6 | John 1:14 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 7 | 1 Corinthians 15:28 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 8 | Ephesians 2:18 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 9 | Genesis 1:26 | 2.041 | passage_terms | Preached vocabulary: trinity |
| 10 | Genesis 1:27 | 2.041 | passage_terms | Preached vocabulary: trinity |

**Bed H (hermetic)** — `trinity`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Genesis 1:1 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 2 | Numbers 6:24 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 3 | Deuteronomy 6:4 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 4 | John 1:1 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 5 | John 1:3 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 6 | John 1:14 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 7 | 1 Corinthians 15:28 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 8 | Ephesians 2:18 | 2.850 | passage_terms | Preached vocabulary: trinity |
| 9 | Genesis 1:26 | 2.041 | passage_terms | Preached vocabulary: trinity |
| 10 | Genesis 1:27 | 2.041 | passage_terms | Preached vocabulary: trinity |


### th6 · `incarnation` — **confirmed-open**

Phase-4 item: P4.5 · DG-6. Pending fixture: incarnation.json (pending, failing).

#1 evidence family — Bed F: passage_terms (John 1:5); Bed H: passage_terms (John 1:5).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Word absent from WEB (verified corpus-wide). Both beds: `passage_terms`
accidents, John 1:5 #1, John 1:14 only #3 and chip-less. The register's
classic texts (Philippians 2:6-8, Hebrews 1:3 / 2:14-17, 1 Timothy 3:16…)
are corpus-blocked on the fixture bed and unanchored on both — the doctrinal
wave's strongest argument for P4.15's chapter list, exactly as the plan
records.

**Bed F (full corpus)** — `incarnation`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:5 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 2 | John 1:11 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 3 | John 1:14 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 4 | Hebrews 10:5 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 5 | John 1:10 | 1.900 | passage_terms | Preached vocabulary: incarnation |
| 6 | John 1:12 | 1.900 | passage_terms | Preached vocabulary: incarnation |
| 7 | John 1:13 | 1.900 | passage_terms | Preached vocabulary: incarnation |

**Bed H (hermetic)** — `incarnation`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:5 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 2 | John 1:11 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 3 | John 1:14 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 4 | Hebrews 10:5 | 2.850 | passage_terms | Preached vocabulary: incarnation |
| 5 | John 1:10 | 1.900 | passage_terms | Preached vocabulary: incarnation |
| 6 | John 1:12 | 1.900 | passage_terms | Preached vocabulary: incarnation |
| 7 | John 1:13 | 1.900 | passage_terms | Preached vocabulary: incarnation |


### th6b · `the word became flesh` — **confirmed-open**

Phase-4 item: P4.5 · DG-6. Pending fixture: incarnation.json (pending, failing).

#1 evidence family — Bed F: exact_phrase (John 1:14); Bed H: exact_phrase (John 1:14).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

John 1:14 leads on both beds — by `exact_phrase` alone, no chip (the fixture's
G3\_EXPECTED\_TOP\_REASON\_FAMILY failure). #2 on both beds is an
uncorroborated `translation_variant` accident (1 Kings 19:21 — Elisha's oxen —
via "became, flesh"): the sole-variant hazard P3.1 exists to floor, visible
even where the #1 is right.

**Bed F (full corpus)** — `the word became flesh`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:14 | 73.850 | exact_phrase | Exact phrase |
| 2 | 1 Kings 19:21 | 12.493 | translation_variant | Worded this way in another translation: became, flesh |
| 3 | 2 Kings 5:14 | 8.531 | translation_variant | Worded this way in another translation: became, word |
| 4 | Psalms 39:3 | 8.531 | translation_variant | Worded this way in another translation: became, word |
| 5 | Psalms 56:4 | 7.741 | passage_terms | Preached vocabulary: flesh |
| 6 | John 6:63 | 7.612 | proximity | Matched words appear close together |
| 7 | Genesis 2:23 | 5.627 | passage_terms | Preached vocabulary: flesh, word |
| 8 | 1 Thessalonians 1:6 | 5.099 | proximity | Matched words appear close together |
| 9 | 2 Peter 2:18 | 4.975 | proximity | Matched words appear close together |
| 10 | Isaiah 40:5 | 4.517 | passage_terms | Preached vocabulary: flesh, word |

**Bed H (hermetic)** — `the word became flesh`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 1:14 | 73.850 | exact_phrase | Exact phrase |
| 2 | 1 Kings 19:21 | 12.821 | translation_variant | Worded this way in another translation: became, flesh |
| 3 | Psalms 39:3 | 8.441 | translation_variant | Worded this way in another translation: became, word |
| 4 | Psalms 56:4 | 7.646 | passage_terms | Preached vocabulary: flesh |
| 5 | John 1:13 | 5.942 | passage_terms | Preached vocabulary: became, flesh |
| 6 | Genesis 2:23 | 5.514 | passage_terms | Preached vocabulary: flesh, word |
| 7 | Isaiah 40:5 | 5.514 | passage_terms | Preached vocabulary: flesh, word |
| 8 | Isaiah 40:7 | 4.517 | passage_terms | Preached vocabulary: flesh, word |
| 9 | Galatians 5:14 | 4.517 | passage_terms | Preached vocabulary: flesh, word |
| 10 | Romans 6:18 | 4.324 | passage_terms | Preached vocabulary: became |


### sanct1 · `sanctification` — **confirmed-open**

Phase-4 item: P4.2 · DG-3 (lexicon extension on the existing holiness pack). Pending fixture: holiness-sanctification.json (pending, failing).

#1 evidence family — Bed F: token_overlap (1 Thessalonians 4:3); Bed H: token_overlap (1 Thessalonians 4:3).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

1 Thessalonians 4:3 leads on both beds by `token_overlap` luck with no chip:
holiness.yaml carries only "sanctified", which stems to `sanctifi`, while the
query noun normalizes to itself — distinct tokens, so the pastor-register noun
never fires the concept. Right verse, wrong reason: still the gap.

**Bed F (full corpus)** — `sanctification`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Thessalonians 4:3 | 7.135 | token_overlap | Shared word: sanctification |
| 2 | 1 Thessalonians 4:4 | 7.135 | token_overlap | Shared word: sanctification |
| 3 | Hebrews 12:14 | 5.850 | token_overlap | Shared word: sanctification |
| 4 | 1 Thessalonians 4:7 | 5.000 | token_overlap | Shared word: sanctification |
| 5 | Romans 6:22 | 4.993 | passage_terms | Preached vocabulary: sanctification |
| 6 | Romans 6:19 | 4.725 | passage_terms | Preached vocabulary: sanctification |
| 7 | 1 Corinthians 1:30 | 3.000 | token_overlap | Shared word: sanctification |
| 8 | Exodus 20:8 | 2.850 | passage_terms | Preached vocabulary: sanctification |
| 9 | Psalms 40:8 | 2.850 | passage_terms | Preached vocabulary: sanctification |
| 10 | Romans 6:7 | 2.850 | passage_terms | Preached vocabulary: sanctification |

**Bed H (hermetic)** — `sanctification`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Thessalonians 4:3 | 7.135 | token_overlap | Shared word: sanctification |
| 2 | 1 Thessalonians 4:4 | 7.135 | token_overlap | Shared word: sanctification |
| 3 | Hebrews 12:14 | 5.850 | token_overlap | Shared word: sanctification |
| 4 | 1 Thessalonians 4:7 | 5.000 | token_overlap | Shared word: sanctification |
| 5 | Romans 6:22 | 4.993 | passage_terms | Preached vocabulary: sanctification |
| 6 | Romans 6:19 | 4.725 | passage_terms | Preached vocabulary: sanctification |
| 7 | 1 Corinthians 1:30 | 3.000 | token_overlap | Shared word: sanctification |
| 8 | Exodus 20:8 | 2.850 | passage_terms | Preached vocabulary: sanctification |
| 9 | Psalms 40:8 | 2.850 | passage_terms | Preached vocabulary: sanctification |
| 10 | Romans 6:7 | 2.850 | passage_terms | Preached vocabulary: sanctification |


### sanct2 · `sanctify` — **confirmed-open**

Phase-4 item: P4.2 · DG-3. Pending fixture: holiness-sanctification.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Ephesians 5:26); Bed H: token_overlap (Ephesians 5:26).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Same mechanism as `sanctification`: lexical rows only (Ephesians 5:26 #1 on
both beds), no curated chip anywhere in either top-10.

**Bed F (full corpus)** — `sanctify`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:26 | 7.135 | token_overlap | Shared word: sanctify |
| 2 | John 17:17 | 6.000 | token_overlap | Shared word: sanctify |
| 3 | Exodus 30:29 | 5.000 | token_overlap | Shared word: sanctify |
| 4 | Exodus 40:11 | 5.000 | token_overlap | Shared word: sanctify |
| 5 | Leviticus 20:8 | 5.000 | token_overlap | Shared word: sanctify |
| 6 | John 17:19 | 5.000 | token_overlap | Shared word: sanctify |
| 7 | 1 Peter 3:15 | 4.614 | passage_terms | Preached vocabulary: sanctify |
| 8 | Leviticus 20:7 | 4.286 | token_overlap | Shared word: sanctify |
| 9 | Exodus 19:22 | 3.750 | token_overlap | Shared word: sanctify |
| 10 | Leviticus 8:12 | 3.750 | token_overlap | Shared word: sanctify |

**Bed H (hermetic)** — `sanctify`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:26 | 7.135 | token_overlap | Shared word: sanctify |
| 2 | 1 Peter 3:15 | 4.614 | passage_terms | Preached vocabulary: sanctify |
| 3 | Hebrews 13:12 | 3.000 | token_overlap | Shared word: sanctify |
| 4 | Matthew 5:7 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 5 | Matthew 6:10 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 6 | Romans 8:1 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 7 | Romans 8:3 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 8 | Romans 8:9 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 9 | 2 Corinthians 1:22 | 2.850 | passage_terms | Preached vocabulary: sanctify |
| 10 | Ephesians 5:33 | 2.850 | passage_terms | Preached vocabulary: sanctify |


### fn13 · `caring for a dying parent` — **confirmed-open**

Phase-4 item: P4.6 · DG-7 (FLAG #7). Pending fixture: caring-for-aging-parents.json (pending, failing).

#1 evidence family — Bed F: concept_anchor — WRONG concept (Colossians 3:20); Bed H: concept_anchor — WRONG concept (Colossians 3:20).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The audit's one confidently-wrong concept fire, reproduced exactly on **both**
corpora: "Theme: Raising children" anchors occupy #1–#3 (Colossians 3:20,
Ephesians 6:4, Colossians 3:21) — child-discipline verses served to a person
watching a parent die. Mechanism re-verified: parenting's bare cue stems to
`parent` and no caregiving concept competes. This is the wrong-fire FLAG #7
asks Jesse to confirm; the measurement is now attached, the ruling stays his.

**Bed F (full corpus)** — `caring for a dying parent`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Colossians 3:20 | 14.760 | concept_anchor | Theme: Raising children |
| 2 | Ephesians 6:4 | 14.281 | concept_anchor | Theme: Raising children |
| 3 | Colossians 3:21 | 13.646 | concept_anchor | Theme: Raising children |
| 4 | Proverbs 22:6 | 12.702 | concept_anchor | Theme: Raising children |
| 5 | Deuteronomy 6:6-7 | 12.067 | concept_anchor | Theme: Raising children |
| 6 | Psalms 127:3 | 10.796 | concept_anchor | Theme: Raising children |
| 7 | Proverbs 3:11-12 | 7.621 | concept_anchor | Theme: Raising children |
| 8 | James 1:22 | 6.000 | concept_lexicon | Related theme: Hearing and doing |
| 9 | James 1:23 | 6.000 | concept_lexicon | Related theme: Hearing and doing |
| 10 | James 1:24 | 6.000 | concept_lexicon | Related theme: Hearing and doing |

**Bed H (hermetic)** — `caring for a dying parent`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Colossians 3:20 | 14.787 | concept_anchor | Theme: Raising children |
| 2 | Ephesians 6:4 | 14.281 | concept_anchor | Theme: Raising children |
| 3 | Colossians 3:21 | 13.646 | concept_anchor | Theme: Raising children |
| 4 | Deuteronomy 6:6-7 | 12.067 | concept_anchor | Theme: Raising children |
| 5 | Proverbs 3:11-12 | 7.621 | concept_anchor | Theme: Raising children |
| 6 | James 1:22 | 6.000 | concept_lexicon | Related theme: Hearing and doing |
| 7 | James 1:23 | 6.000 | concept_lexicon | Related theme: Hearing and doing |
| 8 | James 1:24 | 6.000 | concept_lexicon | Related theme: Hearing and doing |
| 9 | Luke 6:46 | 5.820 | concept_lexicon | Related theme: Hearing and doing |
| 10 | Matthew 7:24 | 5.700 | concept_lexicon | Related theme: Hearing and doing |


### fn13b · `my mother is dying` — **confirmed-open**

Phase-4 item: P4.6 · DG-7. Pending fixture: caring-for-aging-parents.json (pending, failing).

#1 evidence family — Bed F: passage_terms (Psalms 27:10); Bed H: passage_terms (Psalms 27:10).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

`passage_terms` accidents on "mother" on both beds; no comfort or caregiving
register surfaces anywhere in either top-10 (2 Corinthians 1:3-4 absent — the
fixture's failing expectation).

**Bed F (full corpus)** — `my mother is dying`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 27:10 | 4.467 | passage_terms | Preached vocabulary: mother |
| 2 | Genesis 3:20 | 4.265 | passage_terms | Preached vocabulary: mother |
| 3 | Job 31:18 | 4.265 | passage_terms | Preached vocabulary: mother |
| 4 | Psalms 139:13 | 4.265 | passage_terms | Preached vocabulary: mother |
| 5 | Leviticus 19:3 | 4.107 | passage_terms | Preached vocabulary: mother |
| 6 | Ruth 1:14 | 3.879 | passage_terms | Preached vocabulary: mother |
| 7 | Ruth 1:8 | 3.604 | passage_terms | Preached vocabulary: mother |
| 8 | 1 Kings 19:20 | 3.604 | passage_terms | Preached vocabulary: mother |
| 9 | Deuteronomy 14:21 | 3.389 | passage_terms | Preached vocabulary: mother |
| 10 | Genesis 2:17 | 2.850 | passage_terms | Preached vocabulary: dying |

**Bed H (hermetic)** — `my mother is dying`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 27:10 | 4.612 | passage_terms | Preached vocabulary: mother |
| 2 | Genesis 3:20 | 4.392 | passage_terms | Preached vocabulary: mother |
| 3 | Job 31:18 | 4.392 | passage_terms | Preached vocabulary: mother |
| 4 | Psalms 139:13 | 4.392 | passage_terms | Preached vocabulary: mother |
| 5 | Leviticus 19:3 | 4.220 | passage_terms | Preached vocabulary: mother |
| 6 | Mark 6:28 | 4.220 | passage_terms | Preached vocabulary: mother |
| 7 | Matthew 27:56 | 4.083 | passage_terms | Preached vocabulary: mother |
| 8 | Mark 5:40 | 4.083 | passage_terms | Preached vocabulary: mother |
| 9 | Galatians 1:15 | 4.083 | passage_terms | Preached vocabulary: mother |
| 10 | Ruth 1:14 | 3.971 | passage_terms | Preached vocabulary: mother |


### wl4 · `benediction` — **confirmed-open**

Phase-4 item: P4.9 · DG-9. Pending fixture: benediction.json (pending, failing).

#1 evidence family — Bed F: passage_terms (Numbers 6:24); Bed H: passage_terms (Numbers 6:24).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The audit's "2.8-score luck" reproduced to the digit: Numbers 6:24 #1 at
2.8496… by `passage_terms` alone, and the **entire** top-10 on both beds is
that same flat 2.8496… tie in book order — zero curated coverage for a
worship-leader-core query. Numbers 6 is in the fixture corpus, so P4.9 is
measurable end-to-end today; the audit's easiest full win, confirmed still
open.

**Bed F (full corpus)** — `benediction`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Numbers 6:24 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 2 | John 14:27 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 3 | 2 Corinthians 1:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 4 | Galatians 6:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 5 | Galatians 6:11 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 6 | Ephesians 6:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 7 | Ephesians 6:24 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 8 | Philippians 1:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 9 | Philippians 4:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 10 | Philippians 4:23 | 2.850 | passage_terms | Preached vocabulary: benediction |

**Bed H (hermetic)** — `benediction`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Numbers 6:24 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 2 | John 14:27 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 3 | 2 Corinthians 1:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 4 | Galatians 6:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 5 | Galatians 6:11 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 6 | Ephesians 6:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 7 | Ephesians 6:24 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 8 | Philippians 1:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 9 | Philippians 4:1 | 2.850 | passage_terms | Preached vocabulary: benediction |
| 10 | Philippians 4:23 | 2.850 | passage_terms | Preached vocabulary: benediction |


### sw2 · `baptism` — **confirmed-open**

Phase-4 item: P4.10 · DG-10. Pending fixture: baptism.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Ephesians 4:5); Bed H: token_overlap (Ephesians 4:5).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Lexical-only on both beds (Ephesians 4:5 #1 by `token_overlap`; the rest
token/`passage_terms` accidents). No concept exists, no chip appears;
Romans 6:3-4 absent from both top-10s (the fixture's failing expectation).

**Bed F (full corpus)** — `baptism`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 4:5 | 6.000 | token_overlap | Shared word: baptism |
| 2 | Acts 1:22 | 5.850 | token_overlap | Shared word: baptism |
| 3 | Mark 1:4 | 5.577 | passage_terms | Preached vocabulary: baptism |
| 4 | Luke 12:50 | 5.000 | token_overlap | Shared word: baptism |
| 5 | Luke 20:4 | 5.000 | token_overlap | Shared word: baptism |
| 6 | Acts 19:3 | 5.000 | token_overlap | Shared word: baptism |
| 7 | Romans 6:4 | 4.993 | passage_terms | Preached vocabulary: baptism |
| 8 | 1 Peter 3:21 | 4.516 | passage_terms | Preached vocabulary: baptism |
| 9 | Mark 11:30 | 4.286 | token_overlap | Shared word: baptism |
| 10 | Acts 13:24 | 3.333 | token_overlap | Shared word: baptism |

**Bed H (hermetic)** — `baptism`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 4:5 | 6.000 | token_overlap | Shared word: baptism |
| 2 | Acts 1:22 | 5.850 | token_overlap | Shared word: baptism |
| 3 | Mark 1:4 | 5.577 | passage_terms | Preached vocabulary: baptism |
| 4 | Romans 6:4 | 4.993 | passage_terms | Preached vocabulary: baptism |
| 5 | 1 Peter 3:21 | 4.516 | passage_terms | Preached vocabulary: baptism |
| 6 | Mark 11:30 | 4.286 | token_overlap | Shared word: baptism |
| 7 | Acts 13:24 | 3.333 | token_overlap | Shared word: baptism |
| 8 | Hebrews 6:2 | 3.000 | token_overlap | Shared word: baptism |
| 9 | Mark 1:5 | 2.850 | passage_terms | Preached vocabulary: baptism |
| 10 | Mark 1:8 | 2.850 | passage_terms | Preached vocabulary: baptism |


### sw6 · `healing` — **confirmed-open**

Phase-4 item: P4.11 · DG-11 (bare-word inventory). Pending fixture: prayer-for-healing-bare-word.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Matthew 19:2); Bed H: token_overlap (Matthew 19:2).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Bare "healing" is lexical-only on both beds: `token_overlap` rows lead
(Matthew 19:2 #1) and no curated chip appears, because the
prayer-for-healing pack carries five multi-word phrases and no bare word.
James 5:13-16 absent from both top-10s.

**Bed F (full corpus)** — `healing`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 19:2 | 7.850 | token_overlap | Shared word: heal |
| 2 | Psalms 147:3 | 7.135 | token_overlap | Shared word: heal |
| 3 | Ecclesiastes 3:3 | 7.135 | token_overlap | Shared word: heal |
| 4 | Jeremiah 17:14 | 7.135 | token_overlap | Shared word: heal |
| 5 | Luke 6:19 | 6.600 | token_overlap | Shared word: heal |
| 6 | Luke 14:4 | 6.000 | token_overlap | Shared word: heal |
| 7 | Hebrews 12:13 | 5.850 | token_overlap | Shared word: heal |
| 8 | Isaiah 53:5 | 5.577 | passage_terms | Preached vocabulary: heal |
| 9 | James 5:15 | 5.577 | passage_terms | Preached vocabulary: heal |
| 10 | 1 Peter 2:24 | 5.577 | passage_terms | Preached vocabulary: heal |

**Bed H (hermetic)** — `healing`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 19:2 | 7.850 | token_overlap | Shared word: heal |
| 2 | Psalms 147:3 | 7.135 | token_overlap | Shared word: heal |
| 3 | Ecclesiastes 3:3 | 7.135 | token_overlap | Shared word: heal |
| 4 | Jeremiah 17:14 | 7.135 | token_overlap | Shared word: heal |
| 5 | Luke 6:19 | 6.600 | token_overlap | Shared word: heal |
| 6 | Hebrews 12:13 | 5.850 | token_overlap | Shared word: heal |
| 7 | Isaiah 53:5 | 5.577 | passage_terms | Preached vocabulary: heal |
| 8 | James 5:15 | 5.577 | passage_terms | Preached vocabulary: heal |
| 9 | 1 Peter 2:24 | 5.577 | passage_terms | Preached vocabulary: heal |
| 10 | Luke 6:7 | 5.350 | passage_terms | Preached vocabulary: heal |


### sw6b · `holiness` — **confirmed-open**

Phase-4 item: P4.11 · DG-11. Pending fixture: holiness-sanctification.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Hebrews 12:10); Bed H: token_overlap (Hebrews 12:10).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Bare "holiness" surfaces no concept chip on either bed — `token_overlap` and
`passage_terms` accidents only, despite the existing holiness pack. Same
lexicon-reachability mechanism as `sanctification`.

**Bed F (full corpus)** — `holiness`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Hebrews 12:10 | 5.850 | token_overlap | Shared word: holiness |
| 2 | Psalms 89:35 | 5.000 | token_overlap | Shared word: holiness |
| 3 | Luke 1:75 | 5.000 | token_overlap | Shared word: holiness |
| 4 | 2 Corinthians 1:12 | 4.850 | passage_terms | Preached vocabulary: holiness |
| 5 | 1 Timothy 2:15 | 3.333 | token_overlap | Shared word: holiness |
| 6 | Psalms 93:5 | 3.000 | token_overlap | Shared word: holiness |
| 7 | Genesis 1:26 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 8 | Exodus 3:5 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 9 | Leviticus 19:1 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 10 | Psalms 27:2 | 2.850 | passage_terms | Preached vocabulary: holiness |

**Bed H (hermetic)** — `holiness`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Hebrews 12:10 | 5.850 | token_overlap | Shared word: holiness |
| 2 | 2 Corinthians 1:12 | 4.850 | passage_terms | Preached vocabulary: holiness |
| 3 | Genesis 1:26 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 4 | Exodus 3:5 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 5 | Leviticus 19:1 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 6 | Psalms 27:2 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 7 | Psalms 101:2 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 8 | Psalms 101:8 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 9 | Isaiah 53:2 | 2.850 | passage_terms | Preached vocabulary: holiness |
| 10 | Zechariah 13:2 | 2.850 | passage_terms | Preached vocabulary: holiness |


### fn12 · `tempted to give up` — **re-scoped**

Phase-4 item: P4.7 · DG-8. Pending fixture: do-not-lose-heart-give-up-phrasings.json (pending, failing).

#1 evidence family — Bed F: concept_anchor (1 Corinthians 10:13 — temptation register); Bed H: concept_anchor (1 Corinthians 10:13 — temptation register).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The audit's claim as written — "phrasing unreachable" — is superseded: the
word "tempted" now fires the deliberate bare-word routing (the 2026-08-18
temptation closure, already on main) and 1 Corinthians 10:13 leads on **both**
beds with its chip, "Theme: A way of escape under temptation", at 18.406. The
re-scoped gap is narrower and real: the perseverance register the asker needs
(do-not-lose-heart; Galatians 6:9) never surfaces — Galatians 6:9 is absent
from both top-10s and everything under #1 is `passage_terms`/token accidents
on "tempt"/"give". The pending fixture encodes exactly this re-scope:
1 Corinthians 10:13 is an honest neighbour, not banned; the assertion is that
the perseverance anchors lead once P4.7's phrases exist.

**Bed F (full corpus)** — `tempted to give up`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Corinthians 10:13 | 18.406 | concept_anchor | Theme: A way of escape under temptation |
| 2 | 1 Corinthians 7:5 | 7.303 | passage_terms | Preached vocabulary: tempt |
| 3 | Genesis 3:12 | 3.794 | passage_terms | Preached vocabulary: give |
| 4 | Genesis 3:6 | 3.350 | passage_terms | Preached vocabulary: tempt |
| 5 | Genesis 3:1 | 2.850 | passage_terms | Preached vocabulary: tempt |
| 6 | Deuteronomy 6:16 | 2.850 | passage_terms | Preached vocabulary: tempt |
| 7 | 2 Samuel 12:25 | 2.850 | passage_terms | Preached vocabulary: give |
| 8 | Psalms 55:19 | 2.850 | passage_terms | Preached vocabulary: tempt |
| 9 | Psalms 55:22 | 2.850 | passage_terms | Preached vocabulary: tempt |
| 10 | Psalms 73:1 | 2.850 | passage_terms | Preached vocabulary: tempt |

**Bed H (hermetic)** — `tempted to give up`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Corinthians 10:13 | 18.406 | concept_anchor | Theme: A way of escape under temptation |
| 2 | 1 Corinthians 7:5 | 7.303 | passage_terms | Preached vocabulary: tempt |
| 3 | Deuteronomy 6:16 | 6.256 | token_overlap | Shared word: tempt |
| 4 | Malachi 3:15 | 4.553 | passage_terms | Preached vocabulary: tempt |
| 5 | Matthew 7:10 | 4.444 | passage_terms | Preached vocabulary: give |
| 6 | Isaiah 40:29 | 4.216 | passage_terms | Preached vocabulary: give |
| 7 | Genesis 3:12 | 3.912 | passage_terms | Preached vocabulary: give |
| 8 | Mark 5:43 | 3.912 | passage_terms | Preached vocabulary: give |
| 9 | Malachi 2:5 | 3.719 | passage_terms | Preached vocabulary: give |
| 10 | Genesis 3:6 | 3.412 | passage_terms | Preached vocabulary: tempt |


### fn14 · `I keep falling into the same sin` — **confirmed-open**

Phase-4 item: P4.7 · DG-8 (J2-gated — no fixture until Jesse rules). Pending fixture: none by design.

#1 evidence family — Bed F: translation_variant (Ezekiel 14:4); Bed H: concept_anchor (John 8:34).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The contested ordering reproduces: the conviction register leads (John 8:34,
"Sin and its wages", #3 F / #1 H) while the restoration text 1 John 1:9 sits
at #6 (F) / #5 (H). Worse, on Bed F two uncorroborated `translation_variant`
rows (Ezekiel 14:4 — a word to idolaters — and Galatians 6:1, both at 14.0)
outrank every honest signal: P3.1's sole-variant hazard again. Whether
conviction or restoration should lead is J2's ruling; per the plan there is
deliberately no pending fixture until he answers, and this measurement is the
input his ruling consumes.

**Bed F (full corpus)** — `I keep falling into the same sin`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ezekiel 14:4 | 14.000 | translation_variant | Worded this way in another translation: fall, keep, sin |
| 2 | Galatians 6:1 | 14.000 | translation_variant | Worded this way in another translation: fall, keep, sin |
| 3 | John 8:34 | 13.646 | concept_anchor | Theme: Sin and its wages |
| 4 | Romans 6:23 | 12.702 | concept_anchor | Theme: Sin and its wages |
| 5 | Romans 5:12 | 11.432 | concept_anchor | Theme: Sin and its wages |
| 6 | 1 John 1:9 | 11.100 | concept_lexicon | Related theme: Repentance |
| 7 | Galatians 6:7-8 | 10.161 | concept_anchor | Theme: Sin and its wages |
| 8 | Joshua 22:17 | 9.964 | translation_variant | Worded this way in another translation: fall, sin |
| 9 | 2 Chronicles 24:18 | 9.964 | translation_variant | Worded this way in another translation: fall, sin |
| 10 | Isaiah 64:6 | 9.964 | translation_variant | Worded this way in another translation: fall, sin |

**Bed H (hermetic)** — `I keep falling into the same sin`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | John 8:34 | 14.636 | concept_anchor | Theme: Sin and its wages |
| 2 | Galatians 6:1 | 14.000 | translation_variant | Worded this way in another translation: fall, keep, sin |
| 3 | Romans 6:23 | 12.702 | concept_anchor | Theme: Sin and its wages |
| 4 | Romans 5:12 | 12.331 | concept_anchor | Theme: Sin and its wages |
| 5 | 1 John 1:9 | 11.100 | concept_lexicon | Related theme: Repentance |
| 6 | Galatians 6:7-8 | 10.161 | concept_anchor | Theme: Sin and its wages |
| 7 | Matthew 18:6 | 10.037 | translation_variant | Worded this way in another translation: fall, sin |
| 8 | Mark 9:42 | 10.037 | translation_variant | Worded this way in another translation: fall, sin |
| 9 | Luke 17:2 | 10.037 | translation_variant | Worded this way in another translation: fall, sin |
| 10 | Matthew 26:41 | 9.030 | translation_variant | Worded this way in another translation: fall, keep |


### fn3 · `does God forgive me` — **confirmed-open**

Phase-4 item: P4.7 · DG-8 data half + P3.2 engine half (FLAG #1, J1). Pending fixture: none by design (J1-gated).

#1 evidence family — Bed F: concept_anchor — WRONG register (Matthew 6:14-15); Bed H: concept_anchor — WRONG register (Matthew 6:14-15).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The bare-`forgive` hijack reproduces on both beds: "Theme: Forgiving others"
anchors occupy #1–#2 (Matthew 6:14-15, Matthew 18:21) — the penitent's
question answered with the interpersonal-forgiveness register — and
1 John 1:9 appears in neither top-10. The single-token-collapse evasion this
rides (`forgive others` → `forgive`) is P3.2's measured target; the leading-
verse choice is J1's. Measurement attached, decision not taken here.

**Bed F (full corpus)** — `does God forgive me`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 6:14-15 | 16.674 | concept_anchor | Theme: Forgiving others |
| 2 | Matthew 18:21 | 15.551 | concept_anchor | Theme: Forgiving others |
| 3 | Isaiah 55:7 | 14.739 | translation_variant | Worded this way in another translation: do, forgive |
| 4 | Colossians 3:13 | 13.011 | concept_anchor | Theme: Forgiving others |
| 5 | Matthew 18:22 | 12.702 | concept_anchor | Theme: Forgiving others |
| 6 | Ephesians 4:32 | 12.067 | concept_anchor | Theme: Forgiving others |
| 7 | Luke 6:37 | 11.741 | concept_anchor | Theme: Forgiving others |
| 8 | 2 Kings 5:18 | 11.238 | translation_variant | Worded this way in another translation: forgive, god |
| 9 | Hosea 1:6 | 11.238 | translation_variant | Worded this way in another translation: forgive, god |
| 10 | Genesis 31:35 | 10.239 | translation_variant | Worded this way in another translation: do, forgive |

**Bed H (hermetic)** — `does God forgive me`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 6:14-15 | 16.674 | concept_anchor | Theme: Forgiving others |
| 2 | Matthew 18:21 | 15.551 | concept_anchor | Theme: Forgiving others |
| 3 | Isaiah 55:7 | 15.124 | translation_variant | Worded this way in another translation: do, forgive |
| 4 | Colossians 3:13 | 13.011 | concept_anchor | Theme: Forgiving others |
| 5 | Matthew 18:22 | 12.702 | concept_anchor | Theme: Forgiving others |
| 6 | Ephesians 4:32 | 12.067 | concept_anchor | Theme: Forgiving others |
| 7 | Luke 6:37 | 11.741 | concept_anchor | Theme: Forgiving others |
| 8 | Matthew 26:28 | 11.169 | translation_variant | Worded this way in another translation: forgive, god |
| 9 | Mark 11:25 | 9.526 | concept_anchor | Theme: Forgiving others |
| 10 | Luke 17:3-4 | 8.891 | concept_anchor | Theme: Forgiving others |


### fn6 · `my marriage is struggling` — **confirmed-open**

Phase-4 item: P4.8 · DG-8b (FLAG #6, J6 — among the most sensitive calls; measurement only). Pending fixture: none by design (J6-gated).

#1 evidence family — Bed F: concept_anchor (Ephesians 5:25); Bed H: concept_anchor (Ephesians 5:25).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The household-teaching order answers an asker of unknown situation on both
beds: "Theme: Marriage" anchors at #1–#3 (Ephesians 5:25, Hebrews 13:4,
Ephesians 5:22-24). The crisis-comfort register is unreachable for this
phrasing — Psalms 34:18, 55:22, and 147:3 are all absent from both top-10s,
confirming the 12-entry crisis lexicon shares only the token `marriage` with
this query. Every option (record-as-intended / crisis-register reachability /
re-weight) belongs to J6; nothing here decides it.

**Bed F (full corpus)** — `my marriage is struggling`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:25 | 15.556 | concept_anchor | Theme: Marriage |
| 2 | Hebrews 13:4 | 14.290 | concept_anchor | Theme: Marriage |
| 3 | Ephesians 5:22-24 | 14.001 | concept_anchor | Theme: Marriage |
| 4 | 1 Peter 3:7 | 13.223 | concept_anchor | Theme: Marriage |
| 5 | 1 Corinthians 7:3 | 13.169 | concept_anchor | Theme: Marriage |
| 6 | 1 Corinthians 7:15 | 12.450 | concept_lexicon | Related theme: Marriage and divorce |
| 7 | Ephesians 5:28 | 12.445 | concept_anchor | Theme: Marriage |
| 8 | 1 Peter 3:1-6 | 12.445 | concept_anchor | Theme: Marriage |
| 9 | Titus 2:3-5 | 11.667 | concept_anchor | Theme: Marriage |
| 10 | Matthew 19:4 | 8.850 | concept_lexicon | Related theme: Marriage and divorce |

**Bed H (hermetic)** — `my marriage is struggling`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:25 | 15.556 | concept_anchor | Theme: Marriage |
| 2 | Hebrews 13:4 | 14.258 | concept_anchor | Theme: Marriage |
| 3 | Ephesians 5:22-24 | 14.001 | concept_anchor | Theme: Marriage |
| 4 | 1 Peter 3:7 | 13.223 | concept_anchor | Theme: Marriage |
| 5 | 1 Corinthians 7:3 | 13.169 | concept_anchor | Theme: Marriage |
| 6 | 1 Corinthians 7:15 | 12.450 | concept_lexicon | Related theme: Marriage and divorce |
| 7 | Ephesians 5:28 | 12.445 | concept_anchor | Theme: Marriage |
| 8 | 1 Peter 3:1-6 | 12.445 | concept_anchor | Theme: Marriage |
| 9 | Titus 2:3-5 | 11.667 | concept_anchor | Theme: Marriage |
| 10 | Matthew 19:4 | 8.850 | concept_lexicon | Related theme: Marriage and divorce |


### ph6 · `the Lord is my shepherd` — **confirmed-open**

Phase-4 item: P4.11 · DG-11 measured-harm cleanup (ph6-B). Pending fixture: shepherd-psalm-guard.json (pending, failing as designed).

#1 evidence family — Bed F: exact_phrase (Psalms 23:1) — harm at #2–#3; Bed H: exact_phrase (Psalms 23:1) — harm at #2–#3.
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The quoted psalm leads on both beds (Psalms 23:1, `exact_phrase`, 73.250) —
the harm is directly beneath it: "Theme: God's guidance" anchors at #2–#3
(Psalms 32:8, then Isaiah 30:21 on F / Ephesians 5:17 on H), reached only
through the single-token collapse of guidance's lexicon phrase "the will of
the lord" to the token `lord`. The guard fixture fails exactly as designed
(G3\_MUST\_NOT\_LEAD, Psalms 32:8 at #2) and will pass when the reword lands
with the inventory item.

**Bed F (full corpus)** — `the Lord is my shepherd`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 23:1 | 73.250 | exact_phrase | Exact phrase |
| 2 | Psalms 32:8 | 15.556 | concept_anchor | Theme: God's guidance |
| 3 | Isaiah 30:21 | 14.001 | concept_anchor | Theme: God's guidance |
| 4 | Isaiah 56:10 | 14.000 | translation_variant | Worded this way in another translation: lord, shepherd |
| 5 | Psalms 25:4-5 | 13.223 | concept_anchor | Theme: God's guidance |
| 6 | Ephesians 5:17 | 13.223 | concept_anchor | Theme: God's guidance |
| 7 | Psalms 37:23 | 11.667 | concept_anchor | Theme: God's guidance |
| 8 | Ezekiel 34:7 | 11.114 | token_overlap | Shared words: lord, shepherd |
| 9 | Ezekiel 34:9 | 11.114 | token_overlap | Shared words: lord, shepherd |
| 10 | Psalms 119:105 | 10.889 | concept_anchor | Theme: God's guidance |

**Bed H (hermetic)** — `the Lord is my shepherd`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 23:1 | 73.250 | exact_phrase | Exact phrase |
| 2 | Psalms 32:8 | 15.556 | concept_anchor | Theme: God's guidance |
| 3 | Ephesians 5:17 | 13.223 | concept_anchor | Theme: God's guidance |
| 4 | Psalms 37:23 | 11.667 | concept_anchor | Theme: God's guidance |
| 5 | Acts 20:28 | 7.300 | proximity | Matched words appear close together |
| 6 | Psalms 27:14 | 7.050 | concept_lexicon | Related theme: Trusting God |
| 7 | Jeremiah 10:21 | 6.936 | token_overlap | Shared words: lord, shepherd |
| 8 | Micah 7:7 | 6.750 | concept_lexicon | Related theme: Trusting God |
| 9 | Zechariah 13:7 | 6.272 | passage_terms | Preached vocabulary: shepherd |
| 10 | Proverbs 3:5 | 6.000 | concept_lexicon | Related theme: Trusting God |


### ad7 · `it is well with my soul` — **confirmed-open**

Phase-4 item: P3.1 floor + QR-6 alias + P4.12 · DG-12 anchors (three-legged kill, division recorded in plan). Pending fixture: it-is-well.json (pending; its Jeremiah 4:10 guard is VACUOUS on the fixture corpus — reported by G3, never silently green).

#1 evidence family — Bed F: translation_variant (Jeremiah 4:10) — HARMFUL #1; Bed H: proximity (Psalms 139:14) — bed-limited leg.
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The last sense-inverted harmful #1 is **still live**: on Bed F — the audit's
own corpusFingerprint `a757e7a0…` with the rebuilt layer — Jeremiah 4:10
("you are greatly deceived… the sword reaches to the soul", spoken of
deception) leads at 14.0 on a lone uncorroborated `translation_variant` pair
(`soul`, `well`), the literal `verse_translation_tokens` mechanism the plan
names. The Bed H leg is **bed-limited**: Jeremiah 4 is absent from the
fixture corpus, so the hermetic top-10 (Psalms 139:14 #1 by `proximity`)
cannot exhibit the harm and the committed guard is honestly vacuous there.
Verdict rests on Bed F, which is exactly why this bed was built.

**Bed F (full corpus)** — `it is well with my soul`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Jeremiah 4:10 | 14.000 | translation_variant | Worded this way in another translation: soul, well |
| 2 | Ezekiel 24:25 | 14.000 | translation_variant | Worded this way in another translation: soul, well |
| 3 | Psalms 49:18 | 8.900 | token_overlap | Shared words: soul, well |
| 4 | Matthew 12:18 | 8.777 | proximity | Matched words appear close together |
| 5 | Psalms 139:14 | 8.433 | proximity | Matched words appear close together |
| 6 | Genesis 12:13 | 8.044 | token_overlap | Shared words: soul, well |
| 7 | Jeremiah 38:20 | 7.657 | proximity | Matched words appear close together |
| 8 | Deuteronomy 22:7 | 4.629 | passage_terms | Preached vocabulary: well |
| 9 | Genesis 16:14 | 4.451 | passage_terms | Preached vocabulary: well |
| 10 | Judges 16:16 | 4.404 | passage_terms | Preached vocabulary: soul |

**Bed H (hermetic)** — `it is well with my soul`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Psalms 139:14 | 8.433 | proximity | Matched words appear close together |
| 2 | Psalms 121:7 | 5.171 | passage_terms | Preached vocabulary: soul |
| 3 | Philippians 4:14 | 5.146 | passage_terms | Preached vocabulary: well |
| 4 | Psalms 88:14 | 4.840 | passage_terms | Preached vocabulary: soul |
| 5 | Lamentations 3:20 | 4.840 | passage_terms | Preached vocabulary: soul |
| 6 | Deuteronomy 22:7 | 4.635 | passage_terms | Preached vocabulary: well |
| 7 | John 8:48 | 4.635 | passage_terms | Preached vocabulary: well |
| 8 | 1 Corinthians 7:38 | 4.635 | passage_terms | Preached vocabulary: well |
| 9 | Psalms 34:2 | 4.591 | passage_terms | Preached vocabulary: soul |
| 10 | Psalms 103:22 | 4.591 | passage_terms | Preached vocabulary: soul |


### corner · `christ the cornerstone` — **confirmed-open**

Phase-4 item: P4.10 · DG-10. Pending fixture: christ-the-cornerstone.json (pending, failing).

#1 evidence family — Bed F: translation_variant (1 Peter 2:4); Bed H: translation_variant (1 Peter 2:4).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

An uncorroborated `translation_variant` accident leads on both beds
(1 Peter 2:4 at 14.0) with no curated chip anywhere — no concept exists.
1 Peter 2:4-7 with a chip is the fixture's failing expectation
(G3\_EXPECTED\_TOP\_REASON\_FAMILY).

**Bed F (full corpus)** — `christ the cornerstone`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Peter 2:4 | 14.000 | translation_variant | Worded this way in another translation: christ, cornerstone |
| 2 | Ephesians 2:20 | 8.500 | proximity | Matched words appear close together |
| 3 | John 1:20 | 4.537 | passage_terms | Preached vocabulary: christ |
| 4 | Romans 6:8 | 4.537 | passage_terms | Preached vocabulary: christ |
| 5 | 1 Corinthians 10:9 | 4.296 | passage_terms | Preached vocabulary: christ |
| 6 | Romans 12:5 | 4.115 | passage_terms | Preached vocabulary: christ |
| 7 | Romans 8:9 | 3.975 | passage_terms | Preached vocabulary: christ |
| 8 | Romans 14:18 | 3.975 | passage_terms | Preached vocabulary: christ |
| 9 | 1 Corinthians 7:22 | 3.975 | passage_terms | Preached vocabulary: christ |
| 10 | Romans 6:9 | 3.862 | passage_terms | Preached vocabulary: christ |

**Bed H (hermetic)** — `christ the cornerstone`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | 1 Peter 2:4 | 14.000 | translation_variant | Worded this way in another translation: christ, cornerstone |
| 2 | Ephesians 2:20 | 8.500 | proximity | Matched words appear close together |
| 3 | John 1:20 | 4.248 | passage_terms | Preached vocabulary: christ |
| 4 | Romans 6:8 | 4.248 | passage_terms | Preached vocabulary: christ |
| 5 | 1 Corinthians 15:18 | 4.248 | passage_terms | Preached vocabulary: christ |
| 6 | 1 Corinthians 10:9 | 4.048 | passage_terms | Preached vocabulary: christ |
| 7 | 1 Corinthians 15:13 | 4.048 | passage_terms | Preached vocabulary: christ |
| 8 | 1 Corinthians 15:22 | 4.048 | passage_terms | Preached vocabulary: christ |
| 9 | 2 Corinthians 1:5 | 4.048 | passage_terms | Preached vocabulary: christ |
| 10 | 2 Corinthians 1:21 | 4.048 | passage_terms | Preached vocabulary: christ |


### cornerb · `cornerstone` — **confirmed-open**

Phase-4 item: P4.10 · DG-10. Pending fixture: christ-the-cornerstone.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Job 38:6); Bed H: token_overlap (Ephesians 2:20).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Lexical-only on both beds, with bed-dependent shapes that are both accidents:
the full corpus surfaces Job 38:6 #1 and Psalms 118:22 #2 by `token_overlap`,
the fixture corpus Ephesians 2:20 #1. No chip on either bed. The
between-bed difference is coverage, not signal — a worked example of why a
hermetic miss alone is never booked as `closed` (or as extra harm).

**Bed F (full corpus)** — `cornerstone`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Job 38:6 | 5.000 | token_overlap | Shared word: cornerstone |
| 2 | Psalms 118:22 | 4.286 | token_overlap | Shared word: cornerstone |
| 3 | Zechariah 10:4 | 3.000 | token_overlap | Shared word: cornerstone |
| 4 | Ephesians 2:20 | 3.000 | token_overlap | Shared word: cornerstone |
| 5 | Jeremiah 51:26 | 2.727 | token_overlap | Shared word: cornerstone |
| 6 | Luke 20:17 | 2.727 | token_overlap | Shared word: cornerstone |
| 7 | 1 Peter 2:6 | 2.500 | token_overlap | Shared word: cornerstone |
| 8 | 1 Peter 2:7 | 2.500 | token_overlap | Shared word: cornerstone |
| 9 | Isaiah 19:13 | 2.308 | token_overlap | Shared word: cornerstone |
| 10 | Isaiah 28:16 | 1.765 | token_overlap | Shared word: cornerstone |

**Bed H (hermetic)** — `cornerstone`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 2:20 | 3.000 | token_overlap | Shared word: cornerstone |
| 2 | 1 Peter 2:6 | 2.500 | token_overlap | Shared word: cornerstone |
| 3 | 1 Peter 2:7 | 2.500 | token_overlap | Shared word: cornerstone |


### doubt · `doubt` — **confirmed-open**

Phase-4 item: P4.10 · DG-10. Pending fixture: doubt.json (pending, failing).

#1 evidence family — Bed F: token_overlap (Matthew 28:17); Bed H: token_overlap (Matthew 28:17).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Token accidents on both beds (Matthew 28:17 "but some doubted" #1); no
concept, no chip. Mark 9:23-24 — the pastoral register the pack is specified
around — is absent from both top-10s.

**Bed F (full corpus)** — `doubt`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 28:17 | 6.000 | token_overlap | Shared word: doubt |
| 2 | James 1:6 | 5.350 | passage_terms | Preached vocabulary: doubt |
| 3 | Job 12:2 | 5.000 | token_overlap | Shared word: doubt |
| 4 | Luke 24:38 | 4.286 | token_overlap | Shared word: doubt |
| 5 | Acts 10:20 | 4.286 | token_overlap | Shared word: doubt |
| 6 | Deuteronomy 28:66 | 3.333 | token_overlap | Shared word: doubt |
| 7 | Romans 14:23 | 3.333 | token_overlap | Shared word: doubt |
| 8 | Genesis 3:2 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 9 | Exodus 20:12 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 10 | Exodus 20:22 | 2.850 | passage_terms | Preached vocabulary: doubt |

**Bed H (hermetic)** — `doubt`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 28:17 | 6.000 | token_overlap | Shared word: doubt |
| 2 | James 1:6 | 5.350 | passage_terms | Preached vocabulary: doubt |
| 3 | Luke 24:38 | 4.286 | token_overlap | Shared word: doubt |
| 4 | Romans 14:23 | 3.333 | token_overlap | Shared word: doubt |
| 5 | Genesis 3:2 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 6 | Exodus 20:12 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 7 | Exodus 20:22 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 8 | 2 Samuel 17:16 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 9 | 2 Samuel 17:17 | 2.850 | passage_terms | Preached vocabulary: doubt |
| 10 | Psalms 10:4 | 2.850 | passage_terms | Preached vocabulary: doubt |


### ad1 · `name it and claim it` — **confirmed-open**

Phase-4 item: P4.14 · DG-14 (J9-gated; measurement is stage-0 input). Pending fixture: none until J9 (10 prosperity-* guards stand as the floor).

#1 evidence family — Bed F: translation_variant (Isaiah 62:4); Bed H: passage_terms (Numbers 6:27).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Junk confirmed on both beds: Bed F leads with two uncorroborated
`translation_variant` accidents (Isaiah 62:4, 1 Corinthians 5:11 at 14.0),
Bed H with `passage_terms` accidents on "name". Not endorsement — and not a
corrective either. This top-3 is the worked example P4.14's stage-0 J9
submission requires; no corrective is authored or implied here.

**Bed F (full corpus)** — `name it and claim it`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Isaiah 62:4 | 14.000 | translation_variant | Worded this way in another translation: claim, name |
| 2 | 1 Corinthians 5:11 | 14.000 | translation_variant | Worded this way in another translation: claim, name |
| 3 | Numbers 6:27 | 4.109 | passage_terms | Preached vocabulary: name |
| 4 | Exodus 20:7 | 3.829 | passage_terms | Preached vocabulary: name |
| 5 | Genesis 16:11 | 3.528 | passage_terms | Preached vocabulary: name |
| 6 | Genesis 16:13 | 3.528 | passage_terms | Preached vocabulary: name |
| 7 | Exodus 20:24 | 3.401 | passage_terms | Preached vocabulary: name |
| 8 | Genesis 2:19 | 3.314 | passage_terms | Preached vocabulary: name |
| 9 | Exodus 3:15 | 3.314 | passage_terms | Preached vocabulary: name |
| 10 | Genesis 16:15 | 3.259 | passage_terms | Preached vocabulary: name |

**Bed H (hermetic)** — `name it and claim it`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Numbers 6:27 | 4.097 | passage_terms | Preached vocabulary: name |
| 2 | Mark 5:9 | 4.097 | passage_terms | Preached vocabulary: name |
| 3 | James 2:7 | 4.097 | passage_terms | Preached vocabulary: name |
| 4 | John 14:14 | 4.026 | passage_terms | Preached vocabulary: name |
| 5 | Psalms 34:3 | 3.941 | passage_terms | Preached vocabulary: name |
| 6 | Matthew 18:20 | 3.941 | passage_terms | Preached vocabulary: name |
| 7 | John 14:13 | 3.941 | passage_terms | Preached vocabulary: name |
| 8 | Exodus 20:7 | 3.820 | passage_terms | Preached vocabulary: name |
| 9 | Psalms 9:10 | 3.820 | passage_terms | Preached vocabulary: name |
| 10 | Psalms 139:20 | 3.820 | passage_terms | Preached vocabulary: name |


### ad3 · `seed faith offering` — **re-scoped**

Phase-4 item: P4.14 · DG-14 (J9-gated). Pending fixture: none — none needed unless J9 commissions one.

#1 evidence family — Bed F: concept_lexicon (Matthew 17:20); Bed H: concept_lexicon (Matthew 17:20).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The audit's "junk" claim does not reproduce: both beds lead with
concept-backed results — Matthew 17:20 #1 via "Related theme: Faith like a
mustard seed", then Faith anchors (Hebrews 11:6, Romans 10:17) with chips.
These are honest neighbours, not junk. What remains open is precisely the J9
question — whether a corrective register should be offered at all — and the
measured premise handed to that ruling is now "honest faith results, no
corrective", not "junk". Re-scoped, not closed: closure would claim the
corrective question answered, which is not this document's to answer.

**Bed F (full corpus)** — `seed faith offering`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 17:20 | 17.147 | concept_lexicon | Related theme: Faith like a mustard seed |
| 2 | Hebrews 11:6 | 12.822 | concept_anchor | Theme: Faith |
| 3 | Romans 10:17 | 12.067 | concept_anchor | Theme: Faith |
| 4 | Hebrews 11:4 | 11.518 | proximity | Matched words appear close together |
| 5 | James 2:21 | 10.757 | concept_lexicon | Related theme: Faith and works |
| 6 | James 2:23 | 10.757 | concept_lexicon | Related theme: Faith and works |
| 7 | James 2:17 | 9.090 | concept_lexicon | Related theme: Faith and works |
| 8 | Leviticus 18:21 | 8.553 | translation_variant | Worded this way in another translation: offer, seed |
| 9 | Leviticus 20:2 | 8.553 | translation_variant | Worded this way in another translation: offer, seed |
| 10 | Leviticus 20:3 | 8.553 | translation_variant | Worded this way in another translation: offer, seed |

**Bed H (hermetic)** — `seed faith offering`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 17:20 | 16.966 | concept_lexicon | Related theme: Faith like a mustard seed |
| 2 | Hebrews 11:6 | 13.435 | concept_anchor | Theme: Faith |
| 3 | Romans 10:17 | 13.206 | concept_anchor | Theme: Faith |
| 4 | James 2:21 | 11.623 | concept_lexicon | Related theme: Faith and works |
| 5 | Hebrews 11:4 | 11.513 | proximity | Matched words appear close together |
| 6 | James 2:23 | 10.757 | concept_lexicon | Related theme: Faith and works |
| 7 | James 2:17 | 10.419 | concept_lexicon | Related theme: Faith and works |
| 8 | Hebrews 11:17 | 7.961 | passage_terms | Preached vocabulary: faith, offer |
| 9 | Galatians 5:6 | 7.114 | concept_lexicon | Related theme: Faith and works |
| 10 | Luke 17:6 | 6.206 | proximity | Matched words appear close together |


### ad10 · `God helps those who help themselves` — **confirmed-open**

Phase-4 item: P4.14 · DG-14 (J9-gated). Pending fixture: none until J9.

#1 evidence family — Bed F: translation_variant (Judges 9:24); Bed H: translation_variant (Matthew 19:11).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Junk confirmed: Bed F's top-3 are uncorroborated `translation_variant`
accidents at 14.0 led by Judges 9:24 — a vengeance narrative — and Bed H
leads with the same family (Matthew 19:11). The corrective-register texts the
plan names (Proverbs 3:5-6; Psalms 46:1) do not lead on either bed
(Psalms 46:1 reaches only #5 on H, by accident of its own wording). Stage-0
J9 input; nothing decided here.

**Bed F (full corpus)** — `God helps those who help themselves`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Judges 9:24 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 2 | 1 Chronicles 23:28 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 3 | 1 Chronicles 28:21 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 4 | Ezra 3:9 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 5 | Job 22:29 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 6 | Job 30:20 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 7 | Psalms 141:8 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 8 | Proverbs 14:31 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 9 | Zechariah 6:15 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 10 | Matthew 19:11 | 14.000 | translation_variant | Worded this way in another translation: god, help |

**Bed H (hermetic)** — `God helps those who help themselves`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Matthew 19:11 | 14.000 | translation_variant | Worded this way in another translation: god, help |
| 2 | Psalms 46:5 | 11.564 | token_overlap | Shared words: god, help |
| 3 | Psalms 40:17 | 10.686 | proximity | Matched words appear close together |
| 4 | Psalms 27:9 | 9.716 | proximity | Matched words appear close together |
| 5 | Psalms 46:1 | 9.307 | proximity | Matched words appear close together |
| 6 | Psalms 42:5 | 9.227 | proximity | Matched words appear close together |
| 7 | Deuteronomy 33:26 | 7.600 | token_overlap | Shared words: god, help |
| 8 | Psalms 146:5 | 7.400 | token_overlap | Shared words: god, help |
| 9 | Isaiah 41:10 | 7.233 | proximity | Matched words appear close together |
| 10 | Isaiah 41:13 | 5.736 | token_overlap | Shared words: god, help |


### ad11 · `speak things into existence` — **confirmed-open**

Phase-4 item: P4.14 · DG-14 (J9-gated). Pending fixture: none until J9.

#1 evidence family — Bed F: proximity (Ephesians 5:12); Bed H: proximity (Ephesians 5:12).
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

Junk confirmed on both beds: Ephesians 5:12 — "it is a shame even to speak of
the things which are done by them in secret" — leads by `proximity` accident,
with `translation_variant` accidents beneath. The query's words in an
unrelated frame; not endorsement, not corrective.

**Bed F (full corpus)** — `speak things into existence`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:12 | 11.822 | proximity | Matched words appear close together |
| 2 | Ecclesiastes 1:13 | 10.473 | translation_variant | Worded this way in another translation: existence, thing |
| 3 | Ecclesiastes 6:5 | 10.473 | translation_variant | Worded this way in another translation: existence, thing |
| 4 | John 8:30 | 8.241 | proximity | Matched words appear close together |
| 5 | Acts 20:36 | 8.241 | proximity | Matched words appear close together |
| 6 | Acts 28:24 | 7.941 | proximity | Matched words appear close together |
| 7 | Isaiah 38:7 | 7.641 | proximity | Matched words appear close together |
| 8 | Psalms 87:3 | 7.605 | proximity | Matched words appear close together |
| 9 | John 15:11 | 7.605 | proximity | Matched words appear close together |
| 10 | Luke 2:18 | 7.578 | proximity | Matched words appear close together |

**Bed H (hermetic)** — `speak things into existence`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Ephesians 5:12 | 12.001 | proximity | Matched words appear close together |
| 2 | John 8:30 | 8.480 | proximity | Matched words appear close together |
| 3 | Acts 20:36 | 8.480 | proximity | Matched words appear close together |
| 4 | John 15:11 | 7.785 | proximity | Matched words appear close together |
| 5 | Luke 22:65 | 7.783 | proximity | Matched words appear close together |
| 6 | Acts 20:30 | 7.090 | proximity | Matched words appear close together |
| 7 | John 8:26 | 7.000 | passage_terms | Preached vocabulary: speak, thing |
| 8 | 2 Corinthians 7:14 | 6.983 | proximity | Matched words appear close together |
| 9 | Acts 13:45 | 6.790 | proximity | Matched words appear close together |
| 10 | Romans 15:18 | 6.790 | proximity | Matched words appear close together |


### ad12 · `favor of God` — **confirmed-open**

Phase-4 item: P4.14 · DG-14 (ruling J5; data half Psalms 90:17 corpus-blocked → P4.15). Pending fixture: none until J5.

#1 evidence family — Bed F: exact_phrase (Malachi 1:9) — wrong frame; Bed H: translation_variant (Romans 11:7) — bed-limited leg.
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The measured wrong-frame #1 reproduces on Bed F: Malachi 1:9 — the prophet's
sarcastic rebuke of corrupt offerings ("now, please entreat the favor of
God… will he accept any of you?") — leads by `exact_phrase` at 69.033, with
uncorroborated `translation_variant` rows filling #2–#10. The Bed H leg is
**bed-limited**: Malachi is absent from the fixture corpus, so the hermetic
run can only show variant accidents (Romans 11:7 #1). Verdict rests on
Bed F. The corrective (Psalms 90:17) is corpus-blocked and rides P4.15; the
ruling is J5's.

**Bed F (full corpus)** — `favor of God`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Malachi 1:9 | 69.033 | exact_phrase | Exact phrase |
| 2 | Ezra 7:28 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 3 | Proverbs 30:7 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 4 | Hosea 12:4 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 5 | Romans 11:7 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 6 | 2 Corinthians 1:11 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 7 | 2 Corinthians 6:2 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 8 | Galatians 4:10 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 9 | Galatians 5:3 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 10 | Philippians 1:7 | 14.000 | translation_variant | Worded this way in another translation: favor, god |

**Bed H (hermetic)** — `favor of God`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Romans 11:7 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 2 | 2 Corinthians 1:11 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 3 | Galatians 5:3 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 4 | Philippians 1:7 | 14.000 | translation_variant | Worded this way in another translation: favor, god |
| 5 | Acts 2:47 | 9.036 | proximity | Matched words appear close together |
| 6 | Proverbs 3:4 | 8.344 | token_overlap | Shared words: favor, god |
| 7 | Galatians 1:10 | 7.657 | proximity | Matched words appear close together |
| 8 | Isaiah 61:2 | 7.536 | proximity | Matched words appear close together |
| 9 | Psalms 10:13 | 3.465 | passage_terms | Preached vocabulary: god |
| 10 | Exodus 3:6 | 3.377 | passage_terms | Preached vocabulary: god |


### ph4 · `cast all your anxiety on him` — **confirmed-open**

Phase-4 item: P4.13 · DG-13 (FLAG #4, J8/J4). Pending fixture: none — the ruling decides the fixture shape.

#1 evidence family — Bed F: concept_anchor (Philippians 4:6-7); quoted verse #9; Bed H: concept_anchor (Philippians 4:6-7); quoted verse #6.
Identity: Bed F (0.9.0 / `a757e7a0…` / `afe482cf…`), Bed H (0.9.0 / `60b7f888…` / `de60b905…`) — full fingerprints in §2.

The Peace-of-God register answers well on both beds — all ten rows carry
"Theme: Peace of God" chips — but the quoted verse itself, 1 Peter 5:7,
ranks **#9** on Bed F and **#6** on Bed H: lower than the #3 the audit
recorded post-#32. The dedup artifact (the surviving single `[torrey] 0.75`
entry) is measured and its effect is larger than the audit stated. FLAG #4 —
whether a remembered phrase's quoted verse must lead — is exactly the J8/J4
ruling this measurement feeds; options (a)/(b)/(c) and their fixture
consequences are laid out in P4.13. Nothing here picks one.

**Bed F (full corpus)** — `cast all your anxiety on him`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Philippians 4:6-7 | 46.406 | concept_anchor | Theme: Peace of God |
| 2 | John 14:27 | 26.600 | concept_anchor | Theme: Peace of God |
| 3 | Matthew 6:27 | 26.002 | concept_anchor | Theme: Peace of God |
| 4 | Isaiah 26:3 | 25.200 | concept_anchor | Theme: Peace of God |
| 5 | Colossians 3:15 | 23.800 | concept_anchor | Theme: Peace of God |
| 6 | Matthew 6:25-26 | 22.450 | concept_anchor | Theme: Peace of God |
| 7 | John 16:33 | 22.400 | concept_anchor | Theme: Peace of God |
| 8 | Philippians 4:8-9 | 22.400 | concept_anchor | Theme: Peace of God |
| 9 | 1 Peter 5:7 | 21.000 | concept_anchor | Theme: Peace of God |
| 10 | Psalms 37:7 | 19.600 | concept_anchor | Theme: Peace of God |

**Bed H (hermetic)** — `cast all your anxiety on him`:

| # | Passage | Score | #1 reason family | Reason label |
|---|---|---|---|---|
| 1 | Philippians 4:6-7 | 46.406 | concept_anchor | Theme: Peace of God |
| 2 | John 14:27 | 26.600 | concept_anchor | Theme: Peace of God |
| 3 | Matthew 6:27 | 26.002 | concept_anchor | Theme: Peace of God |
| 4 | Isaiah 26:3 | 25.200 | concept_anchor | Theme: Peace of God |
| 5 | Colossians 3:15 | 23.800 | concept_anchor | Theme: Peace of God |
| 6 | 1 Peter 5:7 | 23.103 | concept_anchor | Theme: Peace of God |
| 7 | Matthew 6:25-26 | 22.450 | concept_anchor | Theme: Peace of God |
| 8 | John 16:33 | 22.400 | concept_anchor | Theme: Peace of God |
| 9 | Philippians 4:8-9 | 22.400 | concept_anchor | Theme: Peace of God |
| 10 | Psalms 37:7 | 19.600 | concept_anchor | Theme: Peace of God |


## 7. Honest limits

- **Bed-limited legs.** ad7 and ad12 cannot exhibit their harm on Bed H
  (Jeremiah 4 and Malachi 1 are outside the fixture corpus); their verdicts
  rest on Bed F, which exists for exactly this reason. cornerb's between-bed
  shape difference is likewise coverage, not signal.
- **Layer drift vs the audit.** Bed F reuses the audit's corpusFingerprint
  but its layer is rebuilt from today's committed inputs, so audit-era tie
  shapes may not reproduce even where the gap does (th2's ten-way tie is the
  measured example). Core claims were re-verified, never carried forward on
  trust — which is this document's entire job.
- **F21.** Gauntlet G3 evidence is fixture-corpus only; all Bed F numbers come
  from the direct replay captures.
- **No adjudication.** fn3, fn14, fn6, ph4, and the ad-slogans remain behind
  their named rulings (J1, J2, J6, J8/J4, J9, J5). This document attaches
  measurements to those rulings; it decides none of them.
- **Zero packs drafted.** Per the DoD: every Phase-4 item above now carries a
  confirmed-open citation (or is struck with evidence, §5) before any pack
  exists.
