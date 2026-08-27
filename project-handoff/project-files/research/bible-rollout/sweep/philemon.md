# Philemon — Layer-3 tag-sweep ledger

**Book:** Philemon (1 chapter, 25 verses) · **Sweep worker:** Pauline-epistles group (Titus + Philemon assignment; Titus ledger completed first) · **Date:** 2026-08-26
**Repo:** scripture-search-engine @ origin/main `e762d1c629f5b121a2aacc6da57cca6bacc3215e` (engine 0.14.0; 239 concept packs) — read-only; no repo changes.
**Legal tag vocabulary:** the 239 engine ids at e762d1c UNION the 161 adopted display ids (union 303). Every id below validated mechanically against `engine-ids.txt` / `adopted-161.txt`.
**Inputs used:** book doc `/mnt/project-files/research/bible-rollout/philemon.md` (prior art); `ontology/concepts/*.yaml` pack files read directly; `tag-gaps-review.md` §1 + §3 via the briefing extract (Philemon has its own recorded declines in §3.1 and §3.5); corpus-blocked roster; CONVENTIONS §3/§4/§5/§6/§9/§11 extract; coverage plan §3/§5.2 extract.
**WEB provenance, honestly stated:** the CI fixture corpus (`pipeline/fixtures/web-subset.json`) contains ZERO Philemon verses — re-verified mechanically this session (0 rows for the book). Every quotation below is therefore verified word-for-word against the repo-pinned ebible.org engwebp VPL edition itself (sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`, exact match to `pipeline/manifests/web.json`). This IS the pinned edition — no drift caveat — which upgrades the book doc's 2026-08-23 provenance (then current-edition-only, zero pinned witnesses). No claim below is fixture-witnessed; all are pinned-VPL-verified.
**Prior-art status notes:** the book doc deliberately used no PR #43 ids (its Decision 10 — an absence that is a decision, left standing). Slavery references are unified on `bondservants-and-masters` per the prior routing (book doc Decision 12; pack anchors Philemon 1:8–21 at 0.95). Doctrinal posture per the election-and-predestination pack's §4-neutral precedent: report what sources name, adjudicate nothing — the imputation reading of 1:17–19 stays a signposted reading (book doc Decision 4), never a text claim.

The chapter section below is appended as one atomic end-of-file append (CONVENTIONS §9); the ledger closes with the Decisions record and survival audit.

---

## Philemon 1 (25 verses — the book's only chapter; zero fixture witnesses, pinned-VPL-verified)

### 1. Applied-tag deltas (prior art: 4 tags)

All four prior tags re-verified against the pinned VPL and **KEPT**; no drops; no adds clear the bar (the letter is short and single-arced — honest-and-empty beats padding).

- **KEEP `family-reconciliation`** — the letter's whole work is the healing of an estrangement into family: "For perhaps he was therefore separated from you for a while that you would have him forever, no longer as a slave, but more than a slave, a beloved brother—especially to me, but how much rather to you, both in the flesh and in the Lord." (1:15–16). The pack anchors Philemon 1:15–18 at 0.6 (with its recorded household-not-blood-kin DEBATABLE flag — untouched).
- **KEEP `forgiving-others`** — forgiveness enacted rather than named: "If then you count me a partner, receive him as you would receive me. But if he has wronged you at all or owes you anything, put that to my account." (1:17–18). The standing reviewer ruling (book doc Decision 1: substance-not-vocabulary, KEPT) re-affirmed; the word "forgive" still never occurs — the tag rests on the asked-for substance.
- **KEEP `friendship`** — the appeal runs on the bond: "to Philemon, our beloved fellow worker" (1:1); "If then you count me a partner" (1:17); "Yes, brother, let me have joy from you in the Lord. Refresh my heart in the Lord." (1:20). Still the weakest of the four (book doc Decision 3: "first to drop of the three") — but at 4 tags, well under the soft cap, no yield is forced; presence re-judged as honest (partner/brother/fellow-worker is the letter's own leverage, not a passing mention).
- **KEEP `bondservants-and-masters`** — the one letter wholly occupied with a master and an enslaved believer: "no longer as a slave, but more than a slave, a beloved brother" (1:16), the appeal running through the whole request (1:8–21). The 2026-08-25 application-pass add (book doc Decision 12), re-verified; the justification reports the letter's move without reading endorsement or abolition into it (§6).
- **ADD: none. DROP: none.** Candidates weighed and declined are itemized in the Decisions record (D2): `loving-others` (1:9 — love invoked as the appeal's motive, "yet for love’s sake I rather appeal to you", not love-one-another teaching); `providence` (1:15 — one verse, and the text's own "perhaps" hedges it; routed to an anchor candidate); `new-creation` (1:11 — single-verse wordplay, already the log's recorded covered-routing; routed to an anchor candidate); `comforting-others` (1:7, 20 — refreshment register, not the pack's grief-comfort substance; lexicon note only); `grace-not-earned` / `the-cross` via the imputation reading (a signposted reading, not text teaching — §6 bars tagging it); plus the book doc's standing non-uses (`generosity` 1:14; `prayer` 1:4, 22; `hospitality` 1:22), all left standing.

### 2. Anchor-extension candidates

- **`forgiving-others` — Philemon 1:17-18 — proposed weight 0.7.** WEB: "If then you count me a partner, receive him as you would receive me. But if he has wronged you at all or owes you anything, put that to my account." (1:17–18). The pack's seven anchors are all command/parable texts; this is Scripture's enacted case — the display tag's reviewer ruling already argued the substance. Rider: Philemon entirely absent from the fixture corpus — unmeasurable until PR-β; queue, don't build.
- **`new-creation` — Philemon 1:10-11 — proposed weight 0.5.** WEB: "I appeal to you for my child Onesimus, whom I have become the father of in my chains, who once was useless to you, but now is useful to you and to me." (1:10–11). The log's own routing ("Useless made useful (Phm 1:11) → covered: `new-creation`") supplied the home but the pack has no Philemon anchor; this seats it. Same PR-β rider.
- **`providence` — Philemon 1:15 — proposed weight 0.5.** WEB: "For perhaps he was therefore separated from you for a while that you would have him forever" (1:15). The hindsight-providence register (Gen 50:20 family, which the pack leads with); the text's own "perhaps" must survive into any gist/comment use — the verse offers a hopeful reading, not a doctrine of the episode. Same PR-β rider.
- **Considered, not proposed:** `friendship` (1:17/1:20 — too thin for an anchor; the display tag carries it); `bondservants-and-masters` and `family-reconciliation` already anchor the letter (1:8–21 at 0.95; 1:15–18 at 0.6) — nothing re-proposed.
- **QUOTE-VERIFICATION FINDINGS (defect notes, not new anchors)** — both packs flagged their Philemon comments "(WEB wording from knowledge — Philemon NOT in web-subset; re-check at re-pin)"; the re-check is now done against the pinned edition:
  1. `bondservants-and-masters.yaml`, Philemon 1:8–21 anchor comment, quotes "no longer as a bondservant, but more than a bondservant, a beloved brother" — **does NOT match the pinned WEB**, which reads "no longer as a slave, but more than a slave, a beloved brother" (1:16). Ref and weight are unaffected; the comment wording should be corrected to "slave" at the pack's next touch (comment-only fix; no ordering effect, no ENGINE_VERSION implication).
  2. `family-reconciliation.yaml`, Philemon 1:15–18 anchor comment — **verified**: its quoted wording matches the pinned WEB 1:15–16 (elisions aside).

### 3. Lexicon candidates

- **`bondservants-and-masters`:** "onesimus"; "paul and onesimus"; "what happened to onesimus". Proper-noun locator queries for the letter's story; caveat: alias-mining rule first (run against the live engine; Philemon is corpus-absent until PR-β, so today nothing can land lexically), and single-token "onesimus" needs the one-token discount weighed.
- **`new-creation`:** "can god really change a person"; "does conversion change people". (Existing lexicon is fresh-start phrasings; the does-change-happen question family is unserved.)
- **`comforting-others`:** "encouraging other believers"; "being an encouragement to others". Offered WITH the register caveat from §1: the pack's substance is comfort in grief; if the curator judges the refreshment register (1:7, 20) out of scope, decline — the caveat is the point of recording it.
- **Checked, not proposed:** "put that to my account" / "charge it to my account" — the intent is Philemon 1:18 itself, a lexical-retrieval query once Philemon enters the corpus (PR-β); a concept-lexicon row on `the-cross` would route it to atonement anchors instead of the verse and would harden the signposted imputation reading into vocabulary (§6). Alias-mining loop territory at most, after PR-β measurement.

### 4. New-concept candidates

None. Every residual theme has a standing recorded decline, all re-checked and left standing with no new evidence: person-to-person advocacy (§3.1 Philemon note: "not a plausible scripture-search intent at pack scale; not logged"); a `reconciliation` id (§3.5 Philemon note: BORDERLINE, would triple-route with `forgiving-others`/`family-reconciliation`/`restoration` — revisit only as a `forgiving-others` lexicon extension if fixtures later show misses); house churches (§3.5: "`gathering-together` covers the meeting substance"); useless-made-useful (covered: `new-creation`, seated in §2).

### 5. Decline-overturn proposals

None — no new textual evidence beyond what the original declines already weighed (the sweep re-read all four Philemon-relevant decline records against the full pinned text).

### 6. Ceiling / subdivision marker

Does not hit the 8-tag ceiling (4 tags). **Subdivided in the book doc** (4 BSB sections: 1:1–3 / 1:4–7 / 1:8–22 / 1:23–25) → flagged for the per-verse refinement pass (light — one arc; the 1:8–22 appeal span holds all four tags' centers).

### Corpus-blocked routes (this chapter)

- The whole book is corpus-blocked (zero fixture verses); every §2 anchor candidate and §3 lexicon candidate above therefore rides PR-β. No roster-row id matches Philemon material (checked all 50 rows: the slavery material is already unified on `bondservants-and-masters`, an admitted engine pack, not a roster row; no other register matches) — nothing routed to the roster.

---

## Decisions record — Philemon sweep (2026-08-26)

Every yield and judgment call, per §11.6's no-silent-drop rule. All reversible defaults Jesse can overturn.

1. **Zero drops; all 4 prior tag applications kept.** Every keep re-verified against the pinned VPL (quotes word-for-word, refs in the letter's one chapter, presence bar re-judged).
2. **Declined adds** (each weighed against the presence bar): `loving-others` (love is the appeal's invoked motive — "for love’s sake" 1:9, Philemon's love 1:5, 7 — not love-one-another teaching; the reconciliation/forgiveness substance already tagged is what the letter teaches); `providence` (1:15 is one hedged verse — routed to a low-weight anchor candidate with the "perhaps" preserved); `new-creation` (1:11 wordplay — the log's covered-routing honored; anchor candidate seats it); `comforting-others` (1:7, 20 refreshment ≠ grief comfort; lexicon note with caveat only); the imputation reading (1:17–19) not tagged to `the-cross`/`grace-not-earned` — §6 keeps it a signposted reading (Brooks named as the source in the book doc), and covenant #6 bars hardening it into tag vocabulary. Standing non-uses re-affirmed unchanged: `generosity`, `prayer`, `hospitality` (book doc Decisions 8–9), and the deliberate no-PR-#43 decision (Decision 10).
3. **`friendship` kept at 4 tags** despite being the recorded weakest — §11.6's yield order applies only past the ceiling; under the soft cap a borderline-but-honest tag stands (prior reviewer status quo preserved).
4. **All engine-side candidates are queue-only and PR-β-gated:** Philemon has zero fixture verses, so every anchor/lexicon candidate above is unmeasurable today; building now would ship assertions on absent verses (prohibited — corpus-payload-dependency §3(ii)). Nothing here creates a pack or touches weights, the tokenizer, or ENGINE_VERSION.
5. **Quote-verification defect routed, not fixed:** the `bondservants-and-masters.yaml` Philemon comment's "bondservant" wording (vs pinned WEB "slave", 1:16) is recorded in §2 as a comment-only correction for the pack's next touch — this worker's repo is read-only and comment wording does not affect ordering, so no action beyond the record.
6. **No new-concept rows and no decline overturns** — the letter's residue is fully covered by standing declines (advocacy; `reconciliation` id; house churches; useless-made-useful), each re-checked against the full pinned text with no new evidence found. Honest-and-empty preferred over padding (§5).
7. **Provenance decision:** stated at full strength in the header — zero fixture witnesses, whole book verified against the sha256-pinned VPL itself; no pinned-witness claim is made that is really a fixture claim, and no current-edition caveat applies (the 2026-08-23 book doc's caveat is superseded by this session's pinned-archive verification).

## Survival audit — Philemon ledger

2026-08-26: ledger written as 3 atomic end-of-file appends (header; ch. 1; this Decisions/audit block). After every append the full file was re-read and byte-compared against a running mirror: pre-existing bytes unchanged and the new block present, 3/3 writes verified. Final re-audit at delivery: all sections present exactly once (grep: one `## Philemon 1`, one Decisions record), and the sibling Titus ledger re-audited intact (its 5 appends all present, byte-count unchanged since its own final audit). No other file under /mnt/project-files was touched by this worker.

---

## Erratum — Philemon ledger (2026-08-26)

Appended per CONVENTIONS §9 as one atomic end-of-file block; nothing above this line was altered.

1. **§2 "QUOTE-VERIFICATION FINDINGS" preamble misquoted the packs' flags.** The preamble states both packs flagged their Philemon comments "(WEB wording from knowledge — Philemon NOT in web-subset; re-check at re-pin)". That string exists in NEITHER pack — it is a conflation of two different flags. The actual flags, byte-exact from the pack files at e762d1c (comment lines quoted verbatim, including their wrap):
   - `ontology/concepts/bondservants-and-masters.yaml`, Philemon 1:8-21 anchor comment ends:
     ```
       # slavery" most needs to reach. (Philemon NOT in web-subset;
       # re-check at re-pin.)
     ```
     The flag is "(Philemon NOT in web-subset; re-check at re-pin.)" — it carries NO "WEB wording from knowledge" phrase.
   - `ontology/concepts/family-reconciliation.yaml`, Philemon 1:15-18 anchor comment reads:
     ```
       # brother" (WEB wording from knowledge — Philemon NOT in web-subset;
       # notes.md). Household estrangement healed by received-as-brother;
     ```
     The flag is "(WEB wording from knowledge — Philemon NOT in web-subset; notes.md)." — it carries NO "re-check at re-pin" phrase.
2. **Downstream finding unaffected:** the §2 item-1 defect record (the `bondservants-and-masters.yaml` comment quoting "bondservant" where the pinned WEB 1:16 reads "slave") and its Decisions item 5 routing stand exactly as written — the misquoted preamble changes neither the defect nor its disposition.
