# Held fixture drafts — awaiting the corpus-expansion merge

**Written 2026-08-26** by the popular-verses fixture-promotion task (whole-Bible
coverage plan §4.2). Companion to the promotion PR that added the 93
`eval/golden/popular-*.json` guard fixtures on branch
`claude/hearth-alias-measurement-utjidi`.

## What these are

Draft golden fixtures for the **10 of 103** Tier 1–3 popular verses whose target
verse is **not** in the current 5,727-verse fixture corpus
(`pipeline/fixtures/web-subset.json` @ main `e762d1c`). The gauntlet measures
only against that corpus, so these fixtures cannot be admitted yet — a fixture
asserting an absent verse would fail vacuously rather than measure anything.
They were therefore deliberately held out of the promotion PR.

| Rank | Tier | Verse | Draft query |
|---:|---:|---|---|
| 19 | 2 | Romans 3:23 | all have sinned and fall short of the glory of god |
| 23 | 2 | John 10:10 | i came that they may have life abundantly |
| 29 | 2 | 2 Timothy 3:16 | every scripture is god breathed |
| 32 | 3 | Galatians 2:20 | i have been crucified with christ |
| 36 | 3 | Psalm 118:24 | this is the day that the lord has made |
| 55 | 3 | 2 Corinthians 9:7 | god loves a cheerful giver |
| 77 | 3 | Deuteronomy 31:6 | he will not fail you nor forsake you |
| 82 | 3 | Psalm 119:11 | i have hidden your word in my heart |
| 95 | 3 | John 5:24 | he who hears my word and believes |
| 108 | 3 | 1 Chronicles 16:34 | give thanks to the lord for he is good |

All query wording is public domain (WEB text or KJV-derived); format matches the
93 admitted fixtures exactly (`corpusGolden.ts` schema, `ref` spelling,
`status: "pending"`).

## What to do when the corpus-expansion PR merges to main

1. Start from **post-expansion main** (the expansion moves `corpusFingerprint`;
   these drafts must be measured against the corpus they will guard).
2. Copy these 10 files into `eval/golden/`.
3. Run the gauntlet and read the Admission Report: record each fixture's
   observed rank, re-pin `withinTop` to the observation per the observed-pin
   convention (the `withinTop: 3` in these drafts is an expectation, not a
   measurement), and flip `status` to `"active"` in the same PR that makes them
   pass. Update each fixture's note with the observed identity and rank.
4. One follow-up PR to main; the merge is the admission event. Never weaken or
   drop a draft to get green — a draft that misses post-expansion is a measured
   reachability gap and stays pending with the failure documented (seed for the
   plan's §2.3 alias-mining program).

Provenance: ranking and per-entry source traceability in
`../top-200-verses.md` / `../top-200-verses.json`.

---

## Addendum — alias-mining batch 1 (2026-08-26, same day, separate task)

Appended by the alias/lexicon mining batch-1 task (coverage plan §2.3 item 2 /
§4.3; branch `claude/hearth-alias-measurement-utjidi-aliases`). One additional
held draft, same convention as above:

| Seed | Verse | Draft file | Draft query |
|---|---|---|---|
| battery ad11 | Romans 4:17 | `remembered-calls-things-that-are-not.json` | calleth the things that are not as though they were (ASV) |

Romans 4 is outside the current fixture corpus, so the row and fixture cannot
be measured or admitted yet. The draft's note records two cautions for the
eventual curator: the phrase tokenizes to the generic 2-token set {call,
thing} (measure collateral hits first), and routing the slogan query "speak
things into existence" itself is J9-gated editorial territory, not a data row.
