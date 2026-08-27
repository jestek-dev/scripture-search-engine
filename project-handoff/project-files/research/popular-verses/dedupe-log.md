# Dedupe and merge log

Generated 2026-08-25 by build_ranking.py. Every non-trivial normalization, merge, credit, and exclusion decision.

## Source typo corrections (1)

- YouVersion 'Most Popular Verses 2013' #3 printed as 'Matthew 6:13' in YouVersion's own infographic; the source file records it as printed and notes it is possibly a typo for Matthew 6:33 (the verse appears nowhere else in any YouVersion list while Matthew 6:33 recurs constantly). Conservatively corrected to Matthew 6:33.

## Duplicate / derivative source lists (7)

- Excluded biblegateway.json 'Top verses and keywords 2020 (partial)' (top 2 only): it is a strict subset of the same Bible Gateway 2020 data captured more fully in search-volume.json 'Religion Unplugged - BibleGateway most searched Scriptures of 2020' (positions 1, 2, 9, 10). Kept the fuller list once, in the 'biblegateway' source family.
- biblegateway.json 'Top verses 2021 (partial, scattered ranks)' overlaps the same Bible Gateway 2021 ranking reported in full (top 10) by Lifeway Research (search-volume.json). Kept Lifeway's top 10 as the BG-2021 top-10 list and kept only the unique deep entries from the partial list (#27 Galatians 5:22, #84 Luke 10:18), all inside the 'biblegateway' family so diminishing returns apply.
- World Vision UK's UK-only top 10 is a single-country slice of the same Ahrefs study whose 172-country global top 10 is already counted at full platform weight; the UK slice is scored like the YouVersion per-country tables (classWeight x 0.2, flat) to avoid single-country flooding.
- TopVerses.com and the Google Trends snapshot are kept in the platform class for source-class reporting but scored at weight 1.0 instead of 3.0: they measure web-reference frequency and rising phrase queries respectively, not the site-search/most-read usage the 3.0 weight is defined for, and both showed a strong doctrinal-citation skew (John 1:1/14:6, Matthew 28:19, Romans 3:23 in their heads) not corroborated by any usage dataset.
- Excluded search-volume.json 'Bible Maximum - 100 Most Popular Bible Verses (top 25 captured)': it is a partial capture of the same publisher list recorded in full (all 100) in listicles.json. Kept the full list once.
- 'Anchored in Christ 25 Most Popular Bible Verses' republishes Bible Gateway 2024 most-read data (its own notes say Bible-Gateway-style data; its top 24 matches Bible Gateway 2024's top 24 exactly). It stays a listicle-class list (weight 1.0) but is assigned to the 'biblegateway' source family so diminishing returns prevent the same platform data from being counted as independent evidence.
- Excluded listicles.json 'Bible Gateway Top 100 (mirrored by Crossroads Presbyterian Church)': it is a verbatim mirror of the 2009 Bible Gateway top-100 already captured in biblegateway.json. Counting it would double the 2009 list.

## Split references (1)

- Non-contiguous comma reference 'Psalm 119:9,11' split into Psalm 119:9 and Psalm 119:11 (each credited separately; the citing list still counts at most once per entry).

## Adjacent-pair merges (2)

- Adjacent pair Proverbs 3:5-6 cited as a unit by 11 lists (singles: 12/11 lists) - merged Proverbs 3:5 + Proverbs 3:6 into one entry with canonical form Proverbs 3:5-6.
- Adjacent pair Galatians 5:22-23 cited as a unit by 8 lists (singles: 4/3 lists) - merged Galatians 5:22 + Galatians 5:23 into one entry with canonical form Galatians 5:22-23.

## Range-into-entry merges (43)

- 1 Corinthians 13:4-5 merged into entry 1 Corinthians 13:4.
- Colossians 3:23-24 merged into entry Colossians 3:23.
- John 11:25 merged into entry John 11:25-26.
- 1 Thessalonians 5:18 merged into entry 1 Thessalonians 5:16-18.
- Psalm 100:4-5 merged into entry Psalm 100:4.
- 2 Corinthians 9:6-7 merged into entry 2 Corinthians 9:7.
- Ephesians 6:10-11 merged into entry Ephesians 6:11.
- 2 Timothy 3:16-17 merged into entry 2 Timothy 3:16.
- Hebrews 10:24-25 merged into entry Hebrews 10:25.
- James 1:2-3 merged into entry James 1:3.
- John 13:35 merged into entry John 13:34-35.
- Philippians 2:3 merged into entry Philippians 2:3-4.
- Psalm 56:3-4 merged into entry Psalm 56:3.
- Proverbs 6:20-21 merged into entry Proverbs 6:20.
- Isaiah 40:30-31 merged into entry Isaiah 40:31.
- Isaiah 55:8-9 merged into entry Isaiah 55:8.
- John 1:12-13 merged into entry John 1:12.
- Acts 4:11-12 merged into entry Acts 4:12.
- Romans 1:16-17 merged into entry Romans 1:16.
- Romans 3:23-24 merged into entry Romans 3:23.
- Romans 10:9-10 merged into entry Romans 10:9.
- Romans 12:11-12 merged into entry Romans 12:12.
- Galatians 6:9-10 merged into entry Galatians 6:9.
- Ephesians 4:31-32 merged into entry Ephesians 4:32.
- Ephesians 6:12-13 merged into entry Ephesians 6:12.
- James 1:4-5 merged into entry James 1:5.
- 1 Peter 5:5-6 merged into entry 1 Peter 5:6.
- 1 John 1:8-9 merged into entry 1 John 1:9.
- 1 John 5:14-15 merged into entry 1 John 5:14.
- 2 Chronicles 7:14-16 merged into entry 2 Chronicles 7:14.
- Psalm 103:8-10 merged into entry Psalm 103:8.
- Matthew 22:37-39 merged into entry Matthew 22:37.
- John 14:1-3 merged into entry John 14:2-3.
- Romans 10:13-15 merged into entry Romans 10:13.
- Philippians 4:11-13 merged into entry Philippians 4:13.
- Colossians 3:1-3 merged into entry Colossians 3:2.
- Colossians 3:15-17 merged into entry Colossians 3:15.
- Titus 3:4-6 merged into entry Titus 3:5.
- 1 Peter 1:3-5 merged into entry 1 Peter 1:3.
- 1 John 2:15-17 merged into entry 1 John 2:15-16.
- Exodus 14:13-16 merged into entry Exodus 14:14.
- Psalm 103:11-14 merged into entry Psalm 103:12.
- Romans 11:33-36 merged into entry Romans 11:36.

## Multi-overlap range assignments (38)

- Philippians 4:6-7 overlaps 2 existing entries (Philippians 4:6, Philippians 4:7) - credited to Philippians 4:6 (most supporting lists; ties broken by canonical order).
- 1 Corinthians 13:4-8 overlaps 2 existing entries (1 Corinthians 13:4, 1 Corinthians 13:7) - credited to 1 Corinthians 13:4 (most supporting lists; ties broken by canonical order).
- Psalm 91:1-2 overlaps 2 existing entries (Psalm 91:1, Psalm 91:2) - credited to Psalm 91:1 (most supporting lists; ties broken by canonical order).
- Psalm 121:7-8 overlaps 2 existing entries (Psalm 121:7, Psalm 121:8) - credited to Psalm 121:7 (most supporting lists; ties broken by canonical order).
- Matthew 28:19-20 overlaps 2 existing entries (Matthew 28:19, Matthew 28:20) - credited to Matthew 28:19 (most supporting lists; ties broken by canonical order).
- Romans 12:1-2 overlaps 2 existing entries (Romans 12:2, Romans 12:1) - credited to Romans 12:2 (most supporting lists; ties broken by canonical order).
- Psalm 23:1-3 overlaps 3 existing entries (Psalm 23:1, Psalm 23:3, Psalm 23:2) - credited to Psalm 23:1 (most supporting lists; ties broken by canonical order).
- Matthew 28:18-20 overlaps 2 existing entries (Matthew 28:19, Matthew 28:20) - credited to Matthew 28:19 (most supporting lists; ties broken by canonical order).
- 1 Corinthians 13:4-7 overlaps 4 existing entries (1 Corinthians 13:4, 1 Corinthians 13:7, 1 Corinthians 13:5, 1 Corinthians 13:6) - credited to 1 Corinthians 13:4 (most supporting lists; ties broken by canonical order).
- Psalm 1:1-2 overlaps 2 existing entries (Psalm 1:1, Psalm 1:2) - credited to Psalm 1:1 (most supporting lists; ties broken by canonical order).
- Psalm 1:3-4 overlaps 2 existing entries (Psalm 1:3, Psalm 1:4) - credited to Psalm 1:3 (most supporting lists; ties broken by canonical order).
- Psalm 1:5-6 overlaps 2 existing entries (Psalm 1:6, Psalm 1:5) - credited to Psalm 1:6 (most supporting lists; ties broken by canonical order).
- Psalm 23:1-2 overlaps 2 existing entries (Psalm 23:1, Psalm 23:2) - credited to Psalm 23:1 (most supporting lists; ties broken by canonical order).
- Psalm 23:3-4 overlaps 2 existing entries (Psalm 23:4, Psalm 23:3) - credited to Psalm 23:4 (most supporting lists; ties broken by canonical order).
- Psalm 23:5-6 overlaps 2 existing entries (Psalm 23:6, Psalm 23:5) - credited to Psalm 23:6 (most supporting lists; ties broken by canonical order).
- Psalm 91:3-4 overlaps 2 existing entries (Psalm 91:3, Psalm 91:4) - credited to Psalm 91:3 (most supporting lists; ties broken by canonical order).
- Psalm 91:5-6 overlaps 2 existing entries (Psalm 91:5, Psalm 91:6) - credited to Psalm 91:5 (most supporting lists; ties broken by canonical order).
- Psalm 91:7-8 overlaps 2 existing entries (Psalm 91:7, Psalm 91:8) - credited to Psalm 91:7 (most supporting lists; ties broken by canonical order).
- Psalm 91:9-10 overlaps 2 existing entries (Psalm 91:9, Psalm 91:10) - credited to Psalm 91:9 (most supporting lists; ties broken by canonical order).
- Psalm 121:1-2 overlaps 2 existing entries (Psalm 121:1, Psalm 121:2) - credited to Psalm 121:1 (most supporting lists; ties broken by canonical order).
- Isaiah 53:4-5 overlaps 2 existing entries (Isaiah 53:5, Isaiah 53:4) - credited to Isaiah 53:5 (most supporting lists; ties broken by canonical order).
- Isaiah 53:5-6 overlaps 2 existing entries (Isaiah 53:5, Isaiah 53:6) - credited to Isaiah 53:5 (most supporting lists; ties broken by canonical order).
- John 3:16-17 overlaps 2 existing entries (John 3:16, John 3:17) - credited to John 3:16 (most supporting lists; ties broken by canonical order).
- Romans 8:38-39 overlaps 2 existing entries (Romans 8:38, Romans 8:39) - credited to Romans 8:38 (most supporting lists; ties broken by canonical order).
- Ephesians 2:8-9 overlaps 2 existing entries (Ephesians 2:8, Ephesians 2:9) - credited to Ephesians 2:8 (most supporting lists; ties broken by canonical order).
- Hebrews 12:1-2 overlaps 2 existing entries (Hebrews 12:2, Hebrews 12:1) - credited to Hebrews 12:2 (most supporting lists; ties broken by canonical order).
- 1 Peter 5:6-7 overlaps 2 existing entries (1 Peter 5:7, 1 Peter 5:6) - credited to 1 Peter 5:7 (most supporting lists; ties broken by canonical order).
- Revelation 21:1-2 overlaps 2 existing entries (Revelation 21:1, Revelation 21:2) - credited to Revelation 21:1 (most supporting lists; ties broken by canonical order).
- Psalm 23:4-6 overlaps 3 existing entries (Psalm 23:4, Psalm 23:6, Psalm 23:5) - credited to Psalm 23:4 (most supporting lists; ties broken by canonical order).
- Psalm 91:11-13 overlaps 3 existing entries (Psalm 91:11, Psalm 91:12, Psalm 91:13) - credited to Psalm 91:11 (most supporting lists; ties broken by canonical order).
- Psalm 91:14-16 overlaps 3 existing entries (Psalm 91:14, Psalm 91:15, Psalm 91:16) - credited to Psalm 91:14 (most supporting lists; ties broken by canonical order).
- Matthew 11:28-30 overlaps 3 existing entries (Matthew 11:28, Matthew 11:29, Matthew 11:30) - credited to Matthew 11:28 (most supporting lists; ties broken by canonical order).
- John 3:14-16 overlaps 3 existing entries (John 3:16, John 3:14, John 3:15) - credited to John 3:16 (most supporting lists; ties broken by canonical order).
- Ephesians 2:8-10 overlaps 3 existing entries (Ephesians 2:8, Ephesians 2:10, Ephesians 2:9) - credited to Ephesians 2:8 (most supporting lists; ties broken by canonical order).
- 1 Peter 5:6-8 overlaps 3 existing entries (1 Peter 5:7, 1 Peter 5:8, 1 Peter 5:6) - credited to 1 Peter 5:7 (most supporting lists; ties broken by canonical order).
- Psalm 23:1-4 overlaps 4 existing entries (Psalm 23:4, Psalm 23:1, Psalm 23:3, Psalm 23:2) - credited to Psalm 23:4 (most supporting lists; ties broken by canonical order).
- Philippians 4:4-7 overlaps 3 existing entries (Philippians 4:6, Philippians 4:7, Philippians 4:4) - credited to Philippians 4:6 (most supporting lists; ties broken by canonical order).
- James 1:2-5 overlaps 3 existing entries (James 1:3, James 1:2, James 1:5) - credited to James 1:3 (most supporting lists; ties broken by canonical order).

## Whole-chapter / 6+-verse citation credits (25)

- Broad citation 'Psalm 23' in list 'Top 10 Bible verses searched 2013' (pos 5) credited to Psalm 23:4 (the span's most-cited entry: 14 lists, best rank 1).
- Broad citation 'Psalm 91' in list 'Top 10 Scripture passages searched 2018' (pos 1) credited to Psalm 91:1 (the span's most-cited entry: 6 lists, best rank 9).
- Broad citation 'Psalm 23' in list 'Top 10 Scripture passages searched 2018' (pos 2) credited to Psalm 23:4 (the span's most-cited entry: 14 lists, best rank 1).
- Broad citation 'Genesis 1' in list 'Top 10 Scripture passages searched 2018' (pos 3) credited to Genesis 1:1 (the span's most-cited entry: 11 lists, best rank 1).
- Broad citation '1 Corinthians 13' in list 'Top 10 Scripture passages searched 2018' (pos 4) credited to 1 Corinthians 13:4 (the span's most-cited entry: 13 lists, best rank 1).
- Broad citation 'Romans 8' in list 'Top 10 Scripture passages searched 2018' (pos 5) credited to Romans 8:28 (the span's most-cited entry: 24 lists, best rank 1).
- Broad citation 'John 1' in list 'Top 10 Scripture passages searched 2018' (pos 6) credited to John 1:1 (the span's most-cited entry: 6 lists, best rank 2).
- Broad citation 'Psalm 27' in list 'Top 10 Scripture passages searched 2018' (pos 7) credited to Psalm 27:1 (the span's most-cited entry: 1 lists, best rank 31).
- Broad citation 'Matthew 5' in list 'Top 10 Scripture passages searched 2018' (pos 8) credited to Matthew 5:16 (the span's most-cited entry: 5 lists, best rank 37).
- Broad citation 'Psalm 1' in list 'Top 10 Scripture passages searched 2018' (pos 9) credited to Psalm 1:1 (the span's most-cited entry: 3 lists, best rank 15).
- Broad citation 'Matthew 6' in list 'Top 10 Scripture passages searched 2018' (pos 10) credited to Matthew 6:33 (the span's most-cited entry: 17 lists, best rank 1).
- Broad citation 'Psalm 91' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 1) credited to Psalm 91:1 (the span's most-cited entry: 6 lists, best rank 9).
- Broad citation 'Psalm 1' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 5) credited to Psalm 1:1 (the span's most-cited entry: 3 lists, best rank 15).
- Broad citation 'Psalm 51' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 8) credited to Psalm 51:10 (the span's most-cited entry: 1 lists, best rank 81).
- Broad citation 'Romans 8' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 9) credited to Romans 8:28 (the span's most-cited entry: 24 lists, best rank 1).
- Broad citation 'Psalm 121' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 11) credited to Psalm 121:7 (the span's most-cited entry: 4 lists, best rank 18).
- Broad citation 'Matthew 6' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 13) credited to Matthew 6:33 (the span's most-cited entry: 17 lists, best rank 1).
- Broad citation 'Psalm 27' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 14) credited to Psalm 27:1 (the span's most-cited entry: 1 lists, best rank 31).
- Broad citation 'John 1' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 15) credited to John 1:1 (the span's most-cited entry: 6 lists, best rank 2).
- Broad citation 'Psalm 139' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 16) credited to Psalm 139:14 (the span's most-cited entry: 4 lists, best rank 21).
- Broad citation 'Genesis 1' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 18) credited to Genesis 1:1 (the span's most-cited entry: 11 lists, best rank 1).
- Broad citation 'Psalm 46' in list 'Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024' (pos 20) credited to Psalm 46:10 (the span's most-cited entry: 5 lists, best rank 9).
- Broad citation 'Psalm 23' in list 'Bible Study Tools 50 Most Popular Bible Verses' (pos 35) credited to Psalm 23:4 (the span's most-cited entry: 14 lists, best rank 1).
- Broad citation 'Psalm 91' in list 'Discover Walks 35 Most Famous Bible Verses' (pos 21) credited to Psalm 91:1 (the span's most-cited entry: 6 lists, best rank 9).
- Broad citation 'Psalm 100' in list 'Discover Walks 35 Most Famous Bible Verses' (pos 31) credited to Psalm 100:4 (the span's most-cited entry: 4 lists, best rank 23).

## Dropped broad citations (6)

- Broad citation 'Psalm 109' (Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.
- Broad citation 'Revelation 1' (Bible Study Tools — Top 20 most-read Bible verses/passages on BibleStudyTools in 2024) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.
- Broad citation 'Exodus 20:3-17' (What Christians Want To Know 27 Famous Bible Verses) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.
- Broad citation 'Psalm 95' (Discover Walks 35 Most Famous Bible Verses) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.
- Broad citation 'Psalm 123' (Discover Walks 35 Most Famous Bible Verses) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.
- Broad citation 'Psalm 127' (Discover Walks 35 Most Famous Bible Verses) has no supported single verse or short range anywhere in the sources - dropped rather than inventing an entry.

## Skipped unusable entries (2)

- Christian Post Google Trends 2018 list: 9 of 10 entries are phrase queries with no verse reference (left null in the source); only #3 John 3:16 is usable. Implied-but-unstated mappings (e.g. Galatians 6:7) were NOT credited.
- Religion Unplugged / Bible Gateway 2020: positions 3-8 were published only as 'six verses from Psalm 23' with no per-verse order; they could not be credited to individual verses and were skipped (Psalm 23 verses are richly attested by the ordered 2016/2018/2024/2025 Bible Gateway lists).
