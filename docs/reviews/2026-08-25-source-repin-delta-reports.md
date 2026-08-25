# Source re-pin delta reports - August 25, 2026 (J52)

Evidence record for the 2026-08 source re-pin PR (process:
`docs/source-repins.md` step 2; staged shapes `docs/web-repin-staged.md`
and `docs/openbible-repin-staged.md`). The three reports below are the
verbatim output of the committed delta tools, run against the captured
snapshot bytes BEFORE any manifest was edited.

## Capture record (J52/A5a)

Captured 2026-08-25 ~18:19 UTC, single download per source, hashed
immediately (`docs/source-snapshots-errand.md` step 1); every later step -
delta measurement, manifest values, archive upload - uses these exact
local bytes.

```
2006d1af4af558dc39b4dca77023bc1dc77dabf67d8ad9c98e0af1f86fe05644  cross-references-2026-08.zip  (1,981,803 B)
b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c  engwebp_vpl-2026-08.zip       (4,281,529 B)
fee5234ebbc4db49cda493e55222d2e95665d17216c2f47fb38f8c0bbcd316d5  topic-scores-2026-08.zip      (  418,292 B)
```

- The WEB capture is byte-identical to the 2026-08-21 smoke capture
  (`docs/web-repin-staged.md` section 1): unpacked content fingerprint
  `944e3883ca8120cdd6c62c0524ce45f156c9b48bd19d98bc0b7cce8524cf475b`,
  `engwebp_vpl.txt` sha256 `71ea1ce6...`.
- topic-scores matches the 2026-08-24 drift sentinel's observation
  (`fee5234e...`, 418,292 B); upstream rolled past the 2026-08-21
  observation (`2647baf7...`) before this capture.
- cross-references rolled past BOTH earlier observations (`22c26dd6...`
  observed 2026-08-21): this capture pins `2006d1af...`, header dated
  2026-08-24. The pin is the capture, as the errand runbook instructs.

## Old-WEB-bytes archive search (A5b) - status: OPEN

- Step 4a (local copies): `pipeline/sources/` in the preparing environment
  is empty; no machine available to this preparation holds the
  `3458ca34...` bytes.
- Step 4b (Wayback CDX): egress-blocked from the preparing environment
  (TLS handshake refused by the egress proxy), exactly as
  `docs/source-snapshots-errand.md` anticipates for agent environments.
  The two documented commands still need a run from an unrestricted
  machine, and the loss sign-off (A5b) remains Jesse's alone. Nothing in
  this PR signs it off.

---

# WEB verse-level delta report

- old witness: `web-subset.json` — verse-array-subset, 5726 verses (+1 textless reference excluded, matching the VPL importer's omitted-verse rule), sha256 `e2b233376dfe45e2fa283b98b448c9833c5a0e295e770f0801a40d1c3bab055f`
- candidate: `engwebp_vpl-2026-08.zip` — zip, 31098 verses (+5 textless references excluded, matching the VPL importer's omitted-verse rule), sha256 `b6f55cc787b1201b68dcfde8a1216e1a61ae6b3cc38748456cf58bdb5e95fc1c`
- comparison scope: the old witness's verse set (subset witness — verses the witness does not carry are OUT OF SCOPE; adds are not measurable, removals still are)
- golden fixture scope: 1124 refs across 294 fixtures (eval/golden) — 1086 exact verses + 3 whole chapters
- fixture-scope verses NOT carried by this witness: 79 — Deuteronomy 13:1; Deuteronomy 13:2; Deuteronomy 13:3; Deuteronomy 18:21; Deuteronomy 18:22; Job 16:2; Job 38:4; Job 38:33; Job 40:15; Job 41:1; Job 41:33; Job 41:34; Psalms 90:2; Psalms 90:17; Psalms 104:26; Ecclesiastes 1:9; Ecclesiastes 12:7; Isaiah 44:6; Isaiah 44:8; Isaiah 46:9; Isaiah 48:5; Jeremiah 4:10; Malachi 1:9; Matthew 1:18; Matthew 1:22; Matthew 1:23; Matthew 10:28; Matthew 12:31; Matthew 12:32; Mark 3:28; Mark 3:29; Luke 1:1; Luke 1:2; Luke 1:3; Luke 1:4; Luke 1:34; Luke 1:35; Luke 7:19; Luke 7:20; Luke 7:21; Luke 7:22; Luke 12:10; John 2:19; John 5:22; John 5:23; John 20:27; John 20:28; John 20:29; Acts 18:27; Acts 18:28; Acts 19:8; Acts 19:9; Acts 19:10; Acts 26:25; Romans 3:23; Romans 3:24; 1 Corinthians 3:10; 1 Corinthians 3:11; 1 Corinthians 3:12; 1 Corinthians 3:13; 1 Corinthians 3:14; 1 Corinthians 3:15; 2 Corinthians 11:4; Colossians 2:8; Colossians 4:6; 2 Timothy 3:16; 2 Timothy 3:17; Titus 1:9; Hebrews 1:3; Hebrews 1:8; Hebrews 1:10; Hebrews 1:11; Hebrews 1:12; 2 Peter 1:16; Jude 1:3; Jude 1:22; Revelation 22:12; Revelation 22:13; Revelation 22:20. These golden-fixture-asserted verses were NEVER COMPARED: the verdict below is proven only over the witnessed scope and says nothing about them — an IDENTICAL/(a)/(b) verdict here is NOT full-fixture-scope proof.

## Verdict

- outcome class: IDENTICAL — the candidate carries the witness's exact verse text.
- verses compared: 5726; changed: 0 (typography-only: 0, genuine: 0); added: 0; removed: 0

## Genuine revisions (0)

(none)

## Typography-only changes (0)

(none)

## Added verses (0)

(none)

## Removed verses (0)

(none)

---

# OpenBible topic-scores vote-delta report

- old witness: `openbible-subset.json` — openbible-subset, 23 rows, sha256 `d0a14e4788c55eca408f686cb78883687e6bd03da83f5e9dd8cce3de34a79140`
- candidate: `topic-scores-2026-08.zip` — zip, 71264 rows, sha256 `fee5234ebbc4db49cda493e55222d2e95665d17216c2f47fb38f8c0bbcd316d5`
- comparison scope: the old witness's row set (subset witness — rows the witness does not carry are OUT OF SCOPE; adds are not measurable, removals still are)
- consumed scope: 8 subscribed topic(s) across 153 concept files (ontology/concepts) — the openbibleTopics subscriptions buildConceptLayer joins into anchors
- witness caveat: the subset witness carries only subscribed-topic rows cut to the fixture corpus, so movement in unsubscribed topics and outside the fixture verses is invisible here; only the old FULL payload can widen the comparison. The witness carries no header, so the PINNED header wording (the manifest's licenseRecord quote) stands in as the old side of the license comparison.

## License header (the rights record)

- old: (witness carries no header — the PINNED header wording below, the wording the pinned manifest's licenseRecord quotes, stood in as the old side of the comparison)
- pinned wording: `Topic	OSIS	Quality Score (based on percentage of votes for the passage)	# Generated 2026-07-27. CC-BY License: www.openbible.info/topics`
- new: `Topic	OSIS	Quality Score (based on percentage of votes for the passage)	# Generated 2026-08-24. CC-BY License: www.openbible.info/topics`
- verdict: intact — dates aside, the candidate header matches the pinned header wording exactly.

## Verdict

- outcome class: IDENTICAL — the candidate carries the witness's exact rows, and the candidate's license header matches the old-side wording the license section names (dates aside).
- rows compared: 23; score shifts: 0 (consumed: 0); rows added: 0 (consumed: 0); rows removed: 0 (consumed: 0)
- topics added: 0; topics removed: 0; dangling subscriptions: 0

## Consumed-scope movement (listed in full)

(none)

## Movement outside consumed scope

### Score shifts (0 total)

(none)

### Rows added (0 total)

(none)

### Rows removed (0 total)

(none)

---

# OpenBible cross-references vote-delta report

- old witness: `openbible-subset.json` — openbible-subset, 1835 edges, sha256 `d0a14e4788c55eca408f686cb78883687e6bd03da83f5e9dd8cce3de34a79140`
- candidate: `cross-references-2026-08.zip` — zip, 344799 edges, sha256 `2006d1af4af558dc39b4dca77023bc1dc77dabf67d8ad9c98e0af1f86fe05644`
- comparison scope: the old witness's edge set (subset witness — edges the witness does not carry are OUT OF SCOPE; adds are not measurable, removals still are)
- committed evidence: 1835 edge(s) from pipeline/fixtures/openbible-subset.json — the cross-references the fixture build ships
- witness caveat: the subset witness carries only edges with votes >= 1 cut to the fixture corpus, so adds, downvoted edges, and movement outside the fixture verses are invisible here; only the old FULL payload can widen the comparison. The witness carries no header, so the PINNED header wording (the manifest's licenseRecord quote) stands in as the old side of the license comparison.

## License header (the rights record)

- old: (witness carries no header — the PINNED header wording below, the wording the pinned manifest's licenseRecord quotes, stood in as the old side of the comparison)
- pinned wording: `From Verse	To Verse	Votes	#www.openbible.info CC-BY 2026-07-27`
- new: `From Verse	To Verse	Votes	#www.openbible.info CC-BY 2026-08-24`
- verdict: intact — dates aside, the candidate header matches the pinned header wording exactly.

## Verdict

- outcome class: (b) consumed-scope movement — the itemized rows below feed curated-layer anchors or committed evidence. The list goes to Jesse for review (J52/A5a) BEFORE the re-pin PR merges, and this report is handed to the borrowables aspect (B1) as its transform-design baseline.
- edges compared: 1835; vote shifts: 173 (touching committed evidence: 173); edges added: 0 (touching: 0); edges removed: 0 (touching: 0)

## Movement touching COMMITTED EVIDENCE (listed in full)

- Genesis 1:1 -> Exodus 20:11: votes 153 -> 154
- Genesis 1:1 -> Proverbs 3:19: votes 85 -> 87
- Genesis 1:1 -> John 1:1-3: votes 371 -> 377
- Genesis 1:1 -> Hebrews 11:3: votes 271 -> 275
- Genesis 1:26 -> Genesis 5:1: votes 40 -> 39
- Genesis 3:1 -> Genesis 3:13-15: votes 13 -> 12
- Exodus 20:4 -> Leviticus 19:4: votes 20 -> 21
- Deuteronomy 6:13 -> Leviticus 19:12: votes 7 -> 8
- Joshua 1:1 -> 1 Kings 19:16: votes 3 -> 2
- Joshua 1:8 -> Deuteronomy 6:6-9: votes 123 -> 124
- Joshua 1:8 -> Psalms 1:1-3: votes 98 -> 100
- Joshua 1:8 -> Proverbs 3:1: votes 154 -> 155
- Joshua 1:8 -> Matthew 7:21: votes 72 -> 73
- Joshua 1:8 -> Matthew 7:24: votes 118 -> 119
- Joshua 1:8 -> John 13:17: votes 76 -> 77
- Joshua 1:8 -> James 1:22-25: votes 98 -> 99
- Psalms 1:2 -> Joshua 1:8: votes 97 -> 99
- Psalms 1:5 -> Malachi 3:18: votes 21 -> 22
- Psalms 23:1 -> Matthew 6:33: votes 185 -> 187
- Psalms 23:2 -> Psalms 46:4: votes 37 -> 38
- Psalms 46:1 -> Psalms 91:1-9: votes 79 -> 80
- Psalms 91:1 -> Psalms 121:5: votes 126 -> 127
- Psalms 91:5 -> Proverbs 3:23-25: votes 21 -> 22
- Psalms 91:12 -> Proverbs 3:23: votes 11 -> 12
- Psalms 91:14 -> Psalms 91:9: votes 22 -> 23
- Psalms 91:14 -> Romans 8:28: votes 37 -> 38
- Psalms 91:14 -> James 1:12: votes 45 -> 47
- Psalms 91:16 -> Proverbs 3:2: votes 33 -> 34
- Ecclesiastes 3:1 -> Ecclesiastes 3:17: votes 64 -> 65
- Isaiah 53:10 -> Isaiah 53:3-6: votes 9 -> 10
- Isaiah 53:10 -> Isaiah 53:12: votes 7 -> 8
- Isaiah 53:10 -> Ezekiel 33:11: votes 3 -> 4
- Isaiah 53:10 -> Romans 8:8: votes 5 -> 6
- Isaiah 53:10 -> Romans 8:32: votes 17 -> 18
- Isaiah 53:10 -> Hebrews 10:6-12: votes 9 -> 10
- Ezekiel 33:6 -> Ezekiel 33:8-9: votes 5 -> 6
- Ezekiel 33:31 -> James 1:22-24: votes 13 -> 14
- Micah 6:8 -> Genesis 5:22: votes 15 -> 16
- Micah 6:8 -> Matthew 5:3: votes 34 -> 35
- Micah 6:8 -> Matthew 5:7: votes 46 -> 47
- Micah 6:8 -> Luke 6:36: votes 66 -> 67
- Micah 6:8 -> James 2:20: votes 18 -> 19
- Malachi 3:17 -> Romans 8:32: votes 12 -> 11
- Matthew 5:3 -> 2 Chronicles 7:14: votes 75 -> 76
- Matthew 5:3 -> Micah 6:8: votes 34 -> 35
- Matthew 5:3 -> Matthew 5:3-12: votes 42 -> 43
- Matthew 5:3 -> Luke 6:20-26: votes 54 -> 55
- Matthew 5:3 -> James 2:5: votes 55 -> 56
- Matthew 5:7 -> Micah 6:8: votes 25 -> 26
- Matthew 5:7 -> Matthew 6:14-15: votes 59 -> 60
- Matthew 5:7 -> Luke 6:35: votes 21 -> 22
- Matthew 5:7 -> James 2:13: votes 35 -> 36
- Matthew 5:12 -> Luke 6:23: votes 47 -> 48
- Matthew 5:12 -> James 1:2: votes 35 -> 36
- Matthew 5:17 -> Matthew 7:12: votes 18 -> 19
- Matthew 5:17 -> Romans 8:4: votes 41 -> 40
- Matthew 5:17 -> Hebrews 10:3-12: votes 17 -> 18
- Matthew 5:18 -> Matthew 5:26: votes 3 -> 2
- Matthew 5:18 -> Matthew 6:2: votes 2 -> 1
- Matthew 5:18 -> Matthew 6:16: votes 2 -> 1
- Matthew 5:18 -> John 1:51: votes 2 -> 1
- Matthew 5:18 -> John 13:16: votes 2 -> 1
- Matthew 5:18 -> John 13:20-21: votes 1 -> 0 (leaves-build)
- Matthew 5:18 -> John 13:38: votes 2 -> 1
- Matthew 5:19 -> James 2:10-11: votes 25 -> 24
- Matthew 5:20 -> Matthew 7:21: votes 7 -> 8
- Matthew 5:21 -> Exodus 20:13: votes 19 -> 20
- Matthew 5:21 -> Matthew 5:27: votes 4 -> 3
- Matthew 5:23 -> Matthew 5:24: votes 11 -> 12
- Matthew 5:44 -> Luke 6:27-28: votes 73 -> 75
- Matthew 5:44 -> Luke 6:34-35: votes 33 -> 35
- Matthew 5:48 -> Leviticus 19:2: votes 42 -> 41
- Matthew 5:48 -> Matthew 5:45: votes 11 -> 12
- Matthew 6:7 -> Matthew 6:32: votes 10 -> 11
- Matthew 6:8 -> Matthew 6:32: votes 43 -> 44
- Matthew 6:10 -> Hebrews 10:36: votes 58 -> 59
- Matthew 6:19 -> 1 John 2:15-16: votes 58 -> 59
- Matthew 6:24 -> Galatians 1:10: votes 51 -> 52
- Matthew 6:24 -> 1 John 2:15-16: votes 88 -> 89
- Matthew 6:25 -> Matthew 6:31: votes 42 -> 43
- Matthew 6:25 -> Romans 8:32: votes 74 -> 75
- Matthew 6:26 -> Genesis 1:29-31: votes 13 -> 14
- Matthew 6:26 -> Matthew 6:32: votes 19 -> 20
- Matthew 6:26 -> Matthew 7:9: votes 13 -> 14
- Matthew 6:27 -> Matthew 5:36: votes 8 -> 9
- Matthew 6:28 -> Matthew 6:25: votes 44 -> 45
- Matthew 7:3 -> Luke 6:41-42: votes 26 -> 27
- Matthew 7:21 -> Luke 6:46: votes 122 -> 124
- Matthew 7:21 -> Romans 2:13: votes 136 -> 138
- Matthew 7:21 -> James 1:22: votes 115 -> 118
- Matthew 7:24 -> Luke 6:47-49: votes 114 -> 115
- Luke 6:12 -> Matthew 6:6: votes 11 -> 10
- Luke 6:14 -> John 1:40-42: votes 2 -> 3
- Luke 6:15 -> James 1:1: votes 2 -> 3
- Luke 6:26 -> Matthew 7:15: votes 15 -> 16
- Luke 6:36 -> Matthew 5:48: votes 14 -> 18
- Luke 6:46 -> Matthew 7:21-23: votes 28 -> 29
- John 1:3 -> John 1:10: votes 38 -> 39
- John 1:4 -> 1 John 1:5-7: votes 48 -> 47
- John 1:9 -> John 1:4: votes 25 -> 26
- John 1:10 -> Hebrews 11:3: votes 11 -> 12
- John 1:14 -> Isaiah 53:2: votes 21 -> 23
- John 1:14 -> John 1:1: votes 77 -> 80
- John 1:14 -> John 1:16-18: votes 19 -> 21
- John 1:14 -> Romans 8:3: votes 35 -> 37
- John 1:14 -> Hebrews 10:5: votes 12 -> 13
- John 1:14 -> 1 John 1:1-2: votes 53 -> 55
- John 13:34 -> Leviticus 19:18: votes 72 -> 75
- John 13:34 -> Leviticus 19:34: votes 18 -> 20
- John 13:34 -> James 2:8: votes 35 -> 37
- John 13:34 -> 1 John 2:7-10: votes 28 -> 30
- Romans 8:16 -> Romans 8:26: votes 19 -> 20
- Romans 8:18 -> Hebrews 11:25-26: votes 32 -> 33
- Romans 8:25 -> Hebrews 10:36: votes 21 -> 22
- Romans 8:28 -> Romans 8:35-39: votes 216 -> 217
- Romans 8:28 -> James 1:3-4: votes 212 -> 214
- Romans 8:28 -> James 1:12: votes 462 -> 465
- Romans 8:31 -> Psalms 46:1-3: votes 52 -> 53
- Romans 8:31 -> Psalms 46:7: votes 67 -> 68
- Romans 8:31 -> Psalms 46:11: votes 52 -> 53
- Romans 8:34 -> Romans 8:1: votes 16 -> 17
- Romans 8:38 -> Hebrews 11:13: votes 6 -> 7
- Romans 8:39 -> Romans 8:35: votes 41 -> 42
- Ephesians 2:10 -> Romans 8:29: votes 30 -> 31
- Ephesians 2:10 -> Hebrews 10:24: votes 48 -> 49
- Ephesians 2:14 -> Ephesians 2:15: votes 15 -> 16
- Ephesians 2:18 -> Romans 8:26-27: votes 3 -> 4
- Ephesians 2:18 -> 1 John 2:1-2: votes 3 -> 4
- Hebrews 10:34 -> Matthew 6:19-20: votes 3 -> 4
- Hebrews 10:34 -> James 1:2: votes 2 -> 3
- Hebrews 11:3 -> Genesis 1:1 - Genesis 2:1: votes 11 -> 12
- Hebrews 11:16 -> Hebrews 11:10: votes 12 -> 13
- James 1:2 -> Matthew 5:10-12: votes 77 -> 78
- James 1:2 -> Luke 6:22-23: votes 71 -> 72
- James 1:2 -> James 1:12: votes 157 -> 158
- James 1:6 -> Hebrews 10:23: votes 29 -> 31
- James 1:6 -> Hebrews 11:6: votes 51 -> 52
- James 1:12 -> Romans 8:28: votes 64 -> 65
- James 1:12 -> James 1:2-4: votes 36 -> 35
- James 1:13 -> James 1:2: votes 4 -> 3
- James 1:17 -> Matthew 7:11: votes 108 -> 110
- James 1:19 -> Nehemiah 8:2-3: votes 7 -> 9
- James 1:19 -> Nehemiah 8:12-14: votes 5 -> 7
- James 1:19 -> Nehemiah 8:18: votes 2 -> 4
- James 1:19 -> Matthew 5:22: votes 20 -> 23
- James 1:19 -> James 1:26: votes 17 -> 20
- James 1:19 -> 1 John 2:21: votes 3 -> 5
- James 1:22 -> Matthew 7:21-27: votes 32 -> 33
- James 1:22 -> Luke 6:46-48: votes 100 -> 103
- James 1:22 -> John 13:17: votes 82 -> 85
- James 1:22 -> Romans 2:13: votes 141 -> 144
- James 1:22 -> James 2:14-20: votes 45 -> 47
- James 1:22 -> 1 John 2:3: votes 66 -> 69
- James 2:13 -> Luke 6:37: votes 20 -> 19
- James 2:17 -> James 2:14: votes 10 -> 11
- James 2:17 -> James 2:19-20: votes 16 -> 17
- James 2:17 -> James 2:26: votes 24 -> 25
- 1 John 1:5 -> John 1:9: votes 36 -> 37
- 1 John 1:6 -> 1 John 2:4: votes 27 -> 28
- 1 John 1:7 -> John 1:29: votes 11 -> 13
- 1 John 1:7 -> James 1:17: votes 11 -> 13
- 1 John 1:7 -> 1 John 1:3: votes 15 -> 17
- 1 John 1:7 -> 1 John 1:5: votes 26 -> 30
- 1 John 1:7 -> 1 John 2:1-2: votes 10 -> 12
- 1 John 1:7 -> 1 John 2:9-10: votes 32 -> 36
- 1 John 1:9 -> 1 John 1:7: votes 70 -> 71
- 1 John 2:6 -> 1 John 1:6-7: votes 23 -> 22
- 1 John 2:15 -> Galatians 1:10: votes 44 -> 45
- 1 John 2:16 -> Genesis 3:6: votes 27 -> 28
- 1 John 2:16 -> Ephesians 2:3: votes 22 -> 23
- 1 John 2:24 -> 1 John 1:3: votes 6 -> 7
- 1 John 2:24 -> 1 John 1:7: votes 4 -> 5
- 1 John 2:24 -> 1 John 2:7: votes 6 -> 7

## Movement outside committed evidence

### Vote shifts (0 total)

(none)

### Edges added (0 total)

(none)

### Edges removed (0 total)

(none)
